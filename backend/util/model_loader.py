import torch
from dotenv import dotenv_values, load_dotenv
from safetensors.torch import load_file
from diffusers import DPMSolverMultistepScheduler, StableDiffusionPipeline


def load_model():
    """
    Load and return the pipeline
    """

    load_dotenv()
    config = dotenv_values()

    # Initialize model
    # Load the base model with safetensors
    additional_safetensors = config['APP_SAFETENSOR_FILES'].split(';')

    pipeline = load_pruned_model(config['APP_BASE_MODEL_PATH'], additional_safetensors)

    # Set the sampler to DPM++ 2M
    set_sampler(pipeline, 'dpmsolvermultistep')

    return pipeline


def set_sampler(pipeline, sampler_name):
    """
    Set the sampler to DPMSolverMultistepScheduler
    """

    if sampler_name.lower() == 'dpmsolvermultistep':
        pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
        print('Sampler set to DPMSolverMultistepScheduler.')
    else:
        print('Unsupported sampler. Using default scheduler.')


def load_safetensor_to_model(model, safetensor_file):
    """
    Load safetensor and apply it to the model
    """

    weights = load_file(safetensor_file)
    model.load_state_dict(weights, strict=False)

    print(f'Safetensors loaded: {safetensor_file}')


def apply_safetensors_to_pipeline(pipeline, additional_safetensors):
    """
    Apply all safetensors to the pipeline components
    """

    # Load safetensors into the appropriate model components
    for safetensor_file in additional_safetensors:
        if 'unet' in safetensor_file.lower():
            print(f'Loading UNet safetensor from {safetensor_file}...')
            load_safetensor_to_model(pipeline.unet, safetensor_file)
        elif 'text_encoder' in safetensor_file.lower():
            print(f'Loading TextEncoder safetensor from {safetensor_file}...')
            load_safetensor_to_model(pipeline.text_encoder, safetensor_file)
        elif 'vae' in safetensor_file.lower():
            print(f'Loading VAE safetensor from {safetensor_file}...')
            load_safetensor_to_model(pipeline.vae, safetensor_file)

    print('Safetensors applied successfully.')


def load_pruned_model(model_path, additional_safetensors):
    """
    Create the cuda pipline and apply safetensors to it
    """

    # Create the pipeline with manually loaded components
    pipe = StableDiffusionPipeline.from_single_file(model_path)

    # Apply safetensors to the pipeline components
    apply_safetensors_to_pipeline(pipe, additional_safetensors)

    # Move the pipeline to cuda, mps or cpu
    device = 'cpu'

    if torch.cuda.is_available():
        device = 'cuda'
    elif torch.mps.is_available():
        device = 'mps'

    pipe.to(device)

    print('Using device:', device)
    print('Model loaded and safetensors applied successfully!')

    return pipe
