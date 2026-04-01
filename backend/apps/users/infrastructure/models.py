from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt # Solo para pruebas, luego usa autenticación real
def save_note_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        texto_nota = data.get('note')
        fecha_nota = data.get('fecha')
        

        return JsonResponse({'message': 'Nota guardada correctamente'}, status=201)