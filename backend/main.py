import asyncio
import base64
import json
import ssl
import uuid

import websockets
from websockets.asyncio.server import serve
from util.model_loader import load_model
from util.helpers import image_to_base64, fix_base64_padding
from util.image_generator import generate_single_image, generate_single_image_from_ref_image
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv, dotenv_values

# Load configuration
load_dotenv()
config = dotenv_values()

# Track ongoing jobs
jobs = {}

# Initialize pipeline
pipeline = load_model()

# Initialize the queue for managing jobs
queue = asyncio.Queue()

# Initialize a lock for concurrent access to jobs
jobs_lock = asyncio.Lock()


async def update_job_status(job_id, websocket, status, extra_data=None):
    """
    Update job status and send status update to websocket
    """

    message = {'type': 'progress', 'job_id': job_id, 'status': status}

    if extra_data:
        message.update(extra_data)

    await websocket.send(json.dumps(message))


async def handle_job_error(job_id, websocket, error_message):
    """
    Handle job errors: send error message and remove job from jobs dictionary
    """

    await websocket.send(json.dumps({'type': 'error', 'error': error_message}))

    print(f'Error processing job {job_id}: {error_message}')

    async with jobs_lock:
        if job_id in jobs:
            del jobs[job_id]


async def cancel_job(job_id, websocket):
    """
    Cancel a job and remove it from the jobs list
    """

    async with jobs_lock:
        if job_id in jobs:
            task = jobs[job_id]
            task.cancel()
            await websocket.send(json.dumps({'type': 'queue_job_cancel', 'job_id': job_id, 'status': 'cancelled'}))
            del jobs[job_id]
        else:
            await websocket.send(json.dumps({'type': 'error', 'error': f'Job {job_id} not found for cancellation.'}))


async def clear_all_jobs(websocket):
    """
    Clear all running and queued jobs, stopping all tasks
    """

    async with jobs_lock:
        # Cancel all running jobs
        for job_id, task in jobs.items():
            task.cancel()

        # Clear the jobs dictionary
        jobs.clear()

    # Clear the queue
    while not queue.empty():
        queue.get_nowait()
        queue.task_done()

    # Notify the websocket about the clearing action
    await websocket.send(json.dumps({'type': 'error', 'error': 'All jobs cleared and stopped'}))


async def validate_parameters(data, websocket, job_id, input_image_count):
    """
    Validate and sanitize job parameters
    """

    # Validate image count and cap it
    input_image_count = min(input_image_count, int(config.get('APP_WS_MAX_IMAGES', 6)))

    # Send job ID to the client
    await update_job_status(job_id, websocket, 'in-progress', {'jobs': len(jobs)})

    return input_image_count


async def generate_and_send_images(
        job_id,
        input_prompt,
        input_negative_prompt,
        input_steps,
        input_cfg_scale,
        input_upscale,
        input_image_count,
        websocket,
        generate_function,
        **kwargs):
    """
    Generate images and send them to the client live
    """

    try:
        for index in range(input_image_count):
            if asyncio.current_task().cancelled():
                raise asyncio.CancelledError("Job was cancelled")

            # Generate the image using the passed function
            image = await asyncio.to_thread(
                generate_function, **kwargs, prompt=input_prompt,
                negative_prompt=input_negative_prompt, pipeline=pipeline,
                steps=input_steps, cfg_scale=input_cfg_scale,
                denoise_strength=float(config['APP_DEFAULT_DENOISE_STRENGTH']),
                hires_upscale=input_upscale
            )

            base64_image = image_to_base64(image)
            await websocket.send(json.dumps({
                'type': 'generated_image',
                'image': base64_image,
                'job_id': job_id,
                'meta': {
                    'prompt': input_prompt,
                    'negative_prompt': input_negative_prompt,
                    'steps': input_steps,
                    'cfg_scale': input_cfg_scale,
                    'upscale': input_upscale,
                }
            }))

            # Send progress update
            progress_update = {
                'type': 'progress',
                'job_id': job_id,
                'completed': index + 1,
                'total': input_image_count,
            }
            await websocket.send(json.dumps(progress_update))

        # Mark job as completed
        await update_job_status(job_id, websocket, 'completed')

        # Lock and remove job from jobs
        async with jobs_lock:
            if job_id in jobs:
                del jobs[job_id]

    except asyncio.CancelledError:
        await update_job_status(job_id, websocket, 'cancelled')

        async with jobs_lock:
            if job_id in jobs:
                del jobs[job_id]
    except Exception as e:
        await handle_job_error(job_id, websocket, str(e))


async def handle_connection(websocket):
    """
    WebSocket connection handler
    """

    # Log the IP address of the new connection
    client_ip, client_port = websocket.remote_address
    print(f"New client connected: {client_ip}:{client_port}")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                token = data.get('token')
                command = data.get('command')

                # Validate token
                if not token == config['APP_WS_TOKEN']:
                    error_message = {'type': 'error', 'error': 'Invalid token'}
                    await websocket.send(json.dumps(error_message))
                    await websocket.close()
                    return

                # Handle `cancel` and `cancel_all` commands
                if command == 'cancel':
                    sent_job_id = data.get('job_id')
                    await cancel_job(sent_job_id, websocket)
                    continue
                elif command == 'cancel_all':
                    await clear_all_jobs(websocket)
                    continue
                elif command == 'ping':
                    await websocket.send(json.dumps({'type': 'pong'}))

                if len(jobs) >= int(config.get('APP_WS_MAX_REQUESTS', 3)):
                    await websocket.send(json.dumps({'type': 'error', 'error': 'Server is busy'}))
                    continue

                # Generate unique job ID
                job_id = str(uuid.uuid4())

                # Enqueue the job
                if command in ['generate', 'generate_random', 'generate_from_reference']:
                    await queue.put((job_id, data, websocket))
                    await websocket.send(json.dumps({'type': 'queue_add', 'job_id': job_id, 'status': 'queued'}))

            except Exception as e:
                await websocket.send(json.dumps({'type': 'error', 'error': str(e)}))
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed by client: {client_ip}:{client_port} with code {e.code}, reason: {e.reason}")
    except Exception as e:
        print(f"Error in connection with {client_ip}:{client_port}: {str(e)}")
    finally:
        print(f"Client disconnected: {client_ip}:{client_port}")


async def handle_generate_prompt(data, websocket, job_id):
    """
    Handle image generation from a prompt
    """

    try:
        input_prompt = data.get('prompt')
        input_negative_prompt = data.get('negative_prompt', '')
        input_steps = int(data.get('steps', config['APP_DEFAULT_STEPS']))
        input_cfg_scale = float(data.get('cfg_scale', config['APP_DEFAULT_CFG_SCALE']))
        input_upscale = float(data.get('upscale', config['APP_DEFAULT_HIRES_UPSCALE']))
        input_image_count = int(data.get('image_count', 1))

        if len(input_prompt) < 2:
            await websocket.send(json.dumps({'type': 'error', 'error': 'Missing or invalid prompt parameter'}))
            return

        input_image_count = await validate_parameters(data, websocket, job_id, input_image_count)

        # Generate and send images
        await generate_and_send_images(
            job_id,
            input_prompt,
            input_negative_prompt,
            input_steps,
            input_cfg_scale,
            input_upscale,
            input_image_count,
            websocket,
            generate_single_image)

    except Exception as e:
        await handle_job_error(job_id, websocket, str(e))


async def handle_generate_from_reference(data, websocket, job_id):
    """
    Handle image generation from a reference image
    """

    try:
        input_prompt = data.get('prompt', '')
        input_negative_prompt = data.get('negative_prompt', '')
        input_steps = int(data.get('steps', config['APP_DEFAULT_STEPS']))
        input_cfg_scale = float(data.get('cfg_scale', config['APP_DEFAULT_CFG_SCALE']))
        input_upscale = float(data.get('upscale', config['APP_DEFAULT_HIRES_UPSCALE']))
        input_ref_image_strength = float(data.get('ref_image_strength', config['APP_DEFAULT_REF_IMAGE_STRENGTH']))
        input_prompt_output_scale = float(data.get('prompt_output_scale', config['APP_DEFAULT_REF_IMAGE_PROMPT_SCALE']))
        input_image_count = int(data.get('image_count', 1))

        ref_image_data = data.get('reference_image')

        # Fix padding and remove the prefix
        ref_image_data = fix_base64_padding(ref_image_data)

        # Decode base64 string
        image_bytes = base64.b64decode(ref_image_data)

        # Try opening the image
        ref_image = Image.open(BytesIO(image_bytes))

        input_image_count = await validate_parameters(data, websocket, job_id, input_image_count)

        # Generate and send images
        await generate_and_send_images(
            job_id,
            input_prompt,
            input_negative_prompt,
            input_steps,
            input_cfg_scale,
            input_upscale,
            input_image_count,
            websocket,
            generate_single_image_from_ref_image,
            reference_image=ref_image,
            reference_image_strength=input_ref_image_strength,
            reference_image_prompt_output_scale=input_prompt_output_scale)

    except Exception as e:
        await handle_job_error(job_id, websocket, str(e))


async def worker():
    while True:
        job_id, data, websocket = await queue.get()

        async with jobs_lock:
            jobs[job_id] = asyncio.current_task()

        try:
            command = data.get('command')
            sent_job_id = data.get('job_id')

            if command == 'generate':
                await handle_generate_prompt(data, websocket, job_id)
            elif command == 'generate_from_reference':
                await handle_generate_from_reference(data, websocket, job_id)
            elif command == 'ping':
                await websocket.send(json.dumps({'type': 'pong'}))
            else:
                await websocket.send(json.dumps({'type': 'error', 'error': 'Unknown command'}))

        except websockets.exceptions.ConnectionClosedOK as e:
            print(f"Connection closed unexpectedly with code: {e.code}, reason: {e.reason}")
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket was already closed, not sending error message.")
        except Exception as e:
            await websocket.send(json.dumps({'type': 'error', 'error': str(e)}))
        finally:
            async with jobs_lock:
                if job_id in jobs:
                    del jobs[job_id]

            queue.task_done()


async def start_workers():
    for _ in range(int(config.get('APP_WS_MAX_REQUESTS', 3))):
        asyncio.create_task(worker())


async def start_ws_server():
    """
    Start WebSocket server (ws://)
    """

    async with serve(handle_connection, config['APP_WS_HOST'], int(config['APP_WS_PORT'])) as server:
        print(f'WebSocket server is running on ws://{config["APP_WS_HOST"]}:{config["APP_WS_PORT"]}')
        await server.serve_forever()


async def start_wss_server():
    """
    Start WebSocket Secure server (wss://)
    """

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    async with serve(handle_connection, config['APP_WS_HOST'], int(config['APP_WS_PORT']), ssl=ssl_context) as server:
        print(f'WebSocket server is running on wss://{config["APP_WS_HOST"]}:{config["APP_WS_PORT"]}')
        await server.serve_forever()


async def main():
    await start_workers()

    use_secure_ws = config['APP_WS_USE_SECURE'].lower() == 'true'

    if use_secure_ws:
        await start_wss_server()
    else:
        await start_ws_server()


if __name__ == '__main__':
    asyncio.run(main())
