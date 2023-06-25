import base64
from PIL import Image
from io import BytesIO


def save_image(image_data: str):
    image_data = image_data.split(",")[-1]
    image_binary = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_binary))
    image.save("C:/Users/alter/OneDrive/Desktop/export_qs.png", "PNG")
    i = image.convert("RGB")

    for y in range(10):
        for x in range(10):
            r, g, b = i.getpixel((x, y))
            print(f"Pixel at ({x}, {y}): R={r}, G={g}, B={b}")
    # image_binary = base64.b64decode(image_data)

    # image = Image.open(BytesIO(image_binary))
    # image.save("C:/Users/alter/OneDrive/Desktop/export_qs.png", "PNG")
