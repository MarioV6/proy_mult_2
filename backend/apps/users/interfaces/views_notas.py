from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from ..infrastructure.models import NotaDiaria

@csrf_exempt
@require_http_methods(["GET", "POST"])
def manage_nota(request, fecha):
    if request.method == "GET":
        try:
            nota = NotaDiaria.objects.get(fecha=fecha)
            return JsonResponse({"status": "ok", "contenido": nota.contenido})
        except NotaDiaria.DoesNotExist:
            return JsonResponse({"status": "not_found", "contenido": ""})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            contenido = data.get("contenido", "")
            
            nota, created = NotaDiaria.objects.update_or_create(
                fecha=fecha,
                defaults={"contenido": contenido}
            )
            return JsonResponse({"status": "ok", "message": "Nota guardada correctamente"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
