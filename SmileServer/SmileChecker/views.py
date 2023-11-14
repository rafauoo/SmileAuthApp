from django.http import JsonResponse
from PIL import Image, ExifTags
import base64
from django.shortcuts import render
import json
import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from io import BytesIO
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            base64_image = data.get('image')
            print("AAA")
            if not base64_image:
                raise ValueError('Brak obrazu w danych')

            image_data = base64.b64decode(base64_image)
            print("AAA)")

            # Otwórz obraz
            image = Image.open(BytesIO(image_data))

            # Sprawdź orientację obrazu i obróć, jeśli jest obrócony
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == 'Orientation':
                    break

            try:
                exif = dict(image._getexif().items())
                if exif[orientation] == 3:
                    image = image.rotate(180, expand=True)
                elif exif[orientation] == 6:
                    image = image.rotate(270, expand=True)
                elif exif[orientation] == 8:
                    image = image.rotate(90, expand=True)
            except (AttributeError, KeyError, IndexError):
                # Brak informacji o orientacji w danych EXIF, pomijamy
                pass

            # Zapisz obraz na serwerze
            processed_image_path = os.path.join(settings.MEDIA_ROOT, 'processed_image.jpg')
            if os.path.exists(processed_image_path):
                os.remove(processed_image_path)
            
            image.save(processed_image_path)

            result = {"result": "Success"}
            return JsonResponse(result)
        except Exception as e:
            error = {"error": str(e)}
            print(e)
            return JsonResponse(error, status=500)
    return JsonResponse({'success': False, 'error': 'Nieprawidłowy typ zapytania'})

def display_uploaded_photo(request):
    try:
        image_path = 'media/processed_image.jpg'

        with open(image_path, 'rb') as file:
            image_data = file.read()

        response_data = {
            'success': True,
            'image_data': base64.b64encode(image_data).decode('utf-8')
        }
        return render(request, 'photo.html', response_data)
    except Exception as e:
        error = {"error": str(e)}
        return JsonResponse(error, status=500)