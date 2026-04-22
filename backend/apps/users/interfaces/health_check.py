from django.http import JsonResponse
from django.db import connection
from django.views.decorators.http import require_GET

@require_GET
def check_db_connection(request):
    try:
        # Intenta realizar una consulta simple para verificar la conexión
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
        
        if row:
            response = JsonResponse({"status": "ok", "message": "Conexión a la base de datos exitosa"})
        else:
            response = JsonResponse({"status": "error", "message": "No se pudo obtener una respuesta de la base de datos"}, status=500)
    except Exception as e:
        response = JsonResponse({"status": "error", "message": f"Error al conectar con la base de datos: {str(e)}"}, status=500)
    
    # Permitir CORS para desarrollo local si no se usa django-cors-headers
    response["Access-Control-Allow-Origin"] = "*"
    return response
