from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from ..infrastructure.models import NotaDiaria, Tela, TelaPrecio
from django.db import transaction

@method_decorator(csrf_exempt, name='dispatch')
class NotasView(View):
    def get(self, request):
        # Si viene mes y anio, devolvemos las notas del mes
        mes = request.GET.get('mes')
        anio = request.GET.get('anio')
        
        if mes and anio:
            notas = NotaDiaria.objects.filter(fecha__month=mes, fecha__year=anio)
            data = [{'fecha': n.fecha.isoformat(), 'contenido': n.contenido} for n in notas]
            response = JsonResponse(data, safe=False)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        # Si viene una fecha específica
        fecha = request.GET.get('fecha')
        if fecha:
            try:
                nota = NotaDiaria.objects.get(fecha=fecha)
                response = JsonResponse({'contenido': nota.contenido}, status=200)
            except NotaDiaria.DoesNotExist:
                response = JsonResponse({'contenido': ''}, status=200)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        response = JsonResponse({'error': 'Faltan parámetros'}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        try:
            data = json.loads(request.body)
            fecha = data.get('fecha')
            contenido = data.get('contenido')
            
            if not fecha:
                response = JsonResponse({'error': 'Fecha requerida'}, status=400)
                response["Access-Control-Allow-Origin"] = "*"
                return response

            nota, created = NotaDiaria.objects.update_or_create(
                fecha=fecha,
                defaults={'contenido': contenido}
            )
            response = JsonResponse({'message': 'Nota guardada', 'contenido': nota.contenido}, status=201)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=500)
            response["Access-Control-Allow-Origin"] = "*"
            return response
            
    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE, PUT"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

@method_decorator(csrf_exempt, name='dispatch')
class TelasView(View):
    def get(self, request):
        telas = list(Tela.objects.all().values('id', 'nombre'))
        response = JsonResponse(telas, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        data = json.loads(request.body)
        nombre = data.get('nombre')
        tela, created = Tela.objects.get_or_create(nombre=nombre)
        response = JsonResponse({'id': tela.id, 'nombre': tela.nombre}, status=201)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

@method_decorator(csrf_exempt, name='dispatch')
class PreciosView(View):
    def get(self, request):
        fecha = request.GET.get('fecha')
        tela_id = request.GET.get('tela_id')
        
        precios = TelaPrecio.objects.all()
        if fecha:
            precios = precios.filter(fecha=fecha)
        if tela_id:
            precios = precios.filter(tela_id=tela_id)
            
        data = []
        for p in precios:
            data.append({
                'id': p.id,
                'tela_id': p.tela_id,
                'tela_nombre': p.tela.nombre,
                'fecha': p.fecha.isoformat(),
                'precio': str(p.precio)
            })
        response = JsonResponse(data, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        data = json.loads(request.body)
        tela_id = data.get('tela_id')
        fecha = data.get('fecha')
        precio = data.get('precio')
        
        precio_obj, created = TelaPrecio.objects.update_or_create(
            tela_id=tela_id,
            fecha=fecha,
            defaults={'precio': precio}
        )
        response = JsonResponse({'message': 'Precio guardado'}, status=201)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
