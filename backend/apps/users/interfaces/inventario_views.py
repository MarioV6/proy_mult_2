from django.core.paginator import Paginator
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
        
        # Filtros básicos en el servidor para que la paginación sea correcta
        nombre_filtro = request.GET.get('nombre', '')
        color_filtro = request.GET.get('color', '')
        estado_filtro = request.GET.get('estado', 'Todos')
        
        if nombre_filtro:
            items = items.filter(nombre__icontains=nombre_filtro) | items.filter(categoria__icontains=nombre_filtro)
        if color_filtro:
            items = items.filter(color__icontains=color_filtro)
        if estado_filtro != 'Todos':
            items = items.filter(estado=estado_filtro)

        # Paginación
        page_number = request.GET.get('page', 1)
        items_per_page = 6
        paginator = Paginator(items, items_per_page)
        
        page_obj = paginator.get_page(page_number)
        
        serializer = InventarioSerializer(page_obj.object_list, many=True)
        
        res_data = {
            'items': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }
        
        response = JsonResponse(res_data, safe=False)
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
