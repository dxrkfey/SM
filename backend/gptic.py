from openai import OpenAI
import base64
import cv2
from matplotlib import pyplot as plt
import requests
import json

image_path = 'picture/101.109.253.60.8999.jpg'
img = cv2.imread(image_path)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
res = cv2.resize(rgb, (300, 300))
res = cv2.GaussianBlur(res, (15,15), 0)


plt.imshow(rgb)

_, buffer = cv2.imencode('.jpg', res)  # Use '.png' if you prefer PNG

# Convert the buffer to a byte array and then to base64
img_base64 = base64.b64encode(buffer).decode('utf-8')

with open(image_path, 'rb') as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

client = OpenAI(
    # This is the default and can be omitted
    api_key="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"
)

response = client.chat.completions.create(
    model='gpt-4o-2024-08-06',
    messages=[
        {"role": "system", "content": "You are a pollution inspector, Tell the user that the picture that they provided are having the black smoke from the smoke flare stack or not."},
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}",
                        "detail": "low"
                    }
                }
            ]
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "smoke_response",
            "schema": {
                "type": "object",
                "properties": {
                    "result": {"type": "boolean"}
                }
            }
        }
    },
    max_tokens=300,
)

print(response)

print(repr(json.loads(response.choices[0].message.content)))

requests.post('http://127.0.0.1:8000/add-smoke', json = {"result": True })
# requests.post('http://127.0.0.1:8000/add-smoke', json.loads(response.choices[0].message.content))