import os
import random
import uuid


def generate_single_image(
        prompt,
        negative_prompt,
        pipeline,
        steps,
        cfg_scale,
        denoise_strength,
        hires_upscale):
    return pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=steps,
        guidance_scale=cfg_scale,
        denoising_strength=denoise_strength,
        height=1024 * hires_upscale,
        width=1024 * hires_upscale,
        seed=random.randint(0, 2 ** 32 - 1),
    ).images[0]


def generate_single_image_from_ref_image(
        prompt,
        negative_prompt,
        reference_image,
        pipeline,
        steps,
        cfg_scale,
        denoise_strength,
        hires_upscale,
        reference_image_strength=0.8,
        reference_image_prompt_output_scale=7.5):
    return pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        init_image=reference_image,
        steps=steps,
        num_inference_steps=steps,
        cfg_scale=cfg_scale,
        denoise_strength=denoise_strength,
        height=1024 * hires_upscale,
        width=1024 * hires_upscale,
        strength=reference_image_strength,
        guidance_scale=reference_image_prompt_output_scale,
        seed=random.randint(0, 2 ** 32 - 1),
    ).images[0]


def generate_images(
        prompt,
        negative_prompt,
        pipeline,
        output_dir,
        num_images,
        steps,
        cfg_scale,
        denoise_strength,
        hires_upscale,
        save=True):
    if not os.path.exists(output_dir) and save:
        os.makedirs(output_dir)

    created_images = []

    for i in range(num_images):
        image = generate_single_image(
            prompt,
            negative_prompt,
            pipeline,
            steps,
            cfg_scale,
            denoise_strength,
            hires_upscale)

        if save:
            output_path = os.path.join(output_dir, f'{uuid.uuid4()}.png')
            image.save(output_path)

            print(f'Image {i + 1}/{num_images} saved: {output_path}')

        created_images.append(image)

    return created_images


def generate_images_from_ref_image(
        prompt,
        negative_prompt,
        reference_image,
        pipeline,
        output_dir,
        num_images,
        steps,
        cfg_scale,
        denoise_strength,
        hires_upscale,
        reference_image_strength=0.8,
        reference_image_prompt_output_scale=7.5,
        save=True):
    if not os.path.exists(output_dir) and save:
        os.makedirs(output_dir)

    created_images = []

    for i in range(num_images):
        image = generate_single_image_from_ref_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            reference_image=reference_image,
            pipeline=pipeline,
            steps=steps,
            cfg_scale=cfg_scale,
            denoise_strength=denoise_strength,
            hires_upscale=hires_upscale,
            reference_image_strength=reference_image_strength,
            reference_image_prompt_output_scale=reference_image_prompt_output_scale,
        )

        if save:
            output_path = os.path.join(output_dir, f'{uuid.uuid4()}.png')
            image.save(output_path)

            print(f'Image from ref. image {i + 1}/{num_images} saved: {output_path}')

        created_images.append(image)

    return created_images
