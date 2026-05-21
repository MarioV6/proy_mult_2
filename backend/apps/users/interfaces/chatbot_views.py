import json
import requests
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from ..infrastructure.models import Inventario

# URL de tu n8n en producción (Cloudflare)
N8N_WEBHOOK_URL = "https://chem-sys-confidence-starter.trycloudflare.com/webhook/chatbot"

@csrf_exempt
@require_http_methods(["POST"])
def chatbot_proxy(request):
    try:
        body = json.loads(request.body)
        user_message = body.get("message", "")
        session_id = body.get("sessionId", "default-session")

        if not user_message:
            return JsonResponse({"response": "No recibí ningún mensaje."}, status=400)

        # 1. BÚSQUEDA INTELIGENTE EN EL INVENTARIO
        # Limpiamos puntuación y pasamos a minúsculas
        clean_message = re.sub(r'[^\w\s]', '', user_message.lower())
        
        stop_words = ["hola", "tienes", "hay", "busco", "necesito", "tela", "de", "un", "una", "por", "favor", "precio", "cuanto", "cuesta", "algun", "alguna"]
        palabras = [p for p in clean_message.split() if p not in stop_words and len(p) > 2]

        if not palabras:
            palabras = [p for p in clean_message.split() if len(p) > 2]

        query = Q()
        if palabras:
            for palabra in palabras:
                query |= Q(nombre__icontains=palabra)
                query |= Q(categoria__icontains=palabra)
                query |= Q(color__icontains=palabra)
        
        # Obtenemos las telas que coincidan
        telas_db = []
        if query:
            telas_qs = Inventario.objects.filter(query)[:10]
            for item in telas_qs:
                telas_db.append({
                    "nombre": item.nombre,
                    "cantidad": float(item.cantidad),
                    "unidad_medida": item.unidad_medida,
                    "categoria": item.categoria,
                    "color": item.color,
                    "estado": item.estado
                })

        # 2. PREPARAR PAYLOAD PARA N8N
        payload = {
            "message": user_message,
            "contexto": telas_db,
            "sessionId": session_id
        }

        # 3. LLAMADA A N8N
        try:
            response_n8n = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=25)
            response_n8n.raise_for_status()
            data = response_n8n.json()
            
            # El campo configurado en n8n es "response"
            bot_response = data.get("response") or data.get("output") or "No pude procesar una respuesta."
            
            return JsonResponse({"response": bot_response})

        except requests.exceptions.RequestException as e:
            print(f"Error llamando a n8n: {e}")
            return JsonResponse({
                "response": "Lo siento, mi conexión con el cerebro de IA está fallando temporalmente."
            }, status=502)

    except Exception as e:
        print(f"Error en chatbot_proxy: {e}")
        return JsonResponse({"response": "Hubo un error interno al procesar tu mensaje."}, status=500)
