import base64
import re
from io import BytesIO

from dotenv import load_dotenv, dotenv_values


def clean_filename(prompt):
    """
    Create a filesystem-safe filename from a prompt
    """
    return re.sub(r'[^a-zA-Z0-9\s]', '', prompt).replace(' ', '_')


load_dotenv()
config = dotenv_values()


def image_to_base64(image):
    """
    Converts a PIL Image to a base64 string
    """

    output_format = 'PNG'

    try:
        buffered = BytesIO()
        image.save(buffered, format=output_format)
        buffered.seek(0)

        base64_bytes = base64.b64encode(buffered.read())
        base64_string = base64_bytes.decode('utf-8')

        mime_type = f'image/{output_format.lower()}'

        return f'data:{mime_type};base64,{base64_string}'

    except Exception as e:
        print(f'Error converting image to base64: {e}')
        return None


def fix_base64_padding(base64_string):
    """
    Ensure the Base64 string has correct padding and remove the prefix if any
    """

    # Remove the 'data:image/png;base64,' prefix if it exists
    if base64_string.startswith('data:image/png;base64,'):
        base64_string = base64_string[len('data:image/png;base64,'):]

    # Ensure padding is correct
    padding = len(base64_string) % 4

    if padding:
        base64_string += '=' * (4 - padding)

    return base64_string
