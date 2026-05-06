from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from ..application.use_cases import InventarioUseCases
from .serializers import InventarioSerializer

@method_decorator(csrf_exempt, name='dispatch')
class InventarioView(View):
    def get(self, request):
        items = InventarioUseCases.list_items()
        serializer = InventarioSerializer(items, many=True)
        response = JsonResponse(serializer.data, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        try:
            data = json.loads(request.body)
            item = InventarioUseCases.add_item(data)
            serializer = InventarioSerializer(item)
            response = JsonResponse(serializer.data, status=201)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def put(self, request, item_id):
        try:
            data = json.loads(request.body)
            cantidad = data.get('cantidad')
            item = InventarioUseCases.update_stock(item_id, cantidad)
            serializer = InventarioSerializer(item)
            response = JsonResponse(serializer.data)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def delete(self, request, item_id):
        try:
            InventarioUseCases.delete_item(item_id)
            response = JsonResponse({'message': 'Eliminado'}, status=204)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
