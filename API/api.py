from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64

app = FastAPI()

class ImageData(BaseModel):
    image: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_image(data: ImageData):
    try:
        image_bytes = base64.b64decode(data.image)
        result = analyze_image(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analyze_image(image_data):
    import cv2
    import numpy as np
    import base64
    from io import BytesIO

    # Załaduj pre-trenowany klasyfikator twarzy
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    # Konwertuj dane obrazu z base64 na format numpy array
    nparr = np.frombuffer(image_data, np.uint8)

    # Dekoduj obraz
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Konwertuj obraz na skalę szarości
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Wykrywanie twarzy
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # Rysuj prostokąty wokół twarzy
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (255, 255, 0), 10)

    # Koduj obraz do formatu JPEG
    _, buffer = cv2.imencode('.jpg', img)
    jpg_as_text = base64.b64encode(buffer).decode()
    return jpg_as_text

if __name__ == "__main__":
    uvicorn.run(app, host="192.168.0.135", port=8000)
