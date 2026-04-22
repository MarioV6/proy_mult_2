import os
import joblib
import json
import pandas as pd
import numpy as np
from datetime import datetime
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ..infrastructure.models import Tela, TelaPrecio, Calculo

# Cargar modelo globalmente para eficiencia
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'saved_models', 'price_model.pkl')
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error al cargar el modelo ML: {e}")

def predecir_precio(tela_id, fecha_objetivo_str):
    if model is None:
        return None
    try:
        fecha_obj = datetime.strptime(fecha_objetivo_str, '%Y-%m-%d')
        # Preparar features como en el entrenamiento
        features = pd.DataFrame([{
            'tela_id': int(tela_id),
            'year': fecha_obj.year,
            'month': fecha_obj.month,
            'day': fecha_obj.day,
            'dayofweek': fecha_obj.weekday(),
            'dayofyear': fecha_obj.timetuple().tm_yday
        }])
        
        prediccion = model.predict(features)
        return round(float(prediccion[0]), 2)
    except Exception as e:
        print(f"Error en predicción: {e}")
        return None

@method_decorator(csrf_exempt, name='dispatch')
class CalculadoraTelasView(View):
    def get(self, request):
        # Filtros básicos de telas y precios
        fecha_str = request.GET.get('fecha', datetime.now().strftime('%Y-%m-%d'))
        try:
            fecha_busqueda = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            fecha_busqueda = datetime.now().date()
            
        nombre_filtro = request.GET.get('nombre', '')
        orden_precio = request.GET.get('orden_precio', '') # 'asc' o 'desc'
        
        telas = Tela.objects.all()
        if nombre_filtro:
            telas = telas.filter(nombre__icontains=nombre_filtro)
            
        data = []
        for tela in telas:
            # Obtener precio real para esa fecha (o el más cercano anterior)
            precio_obj = TelaPrecio.objects.filter(tela=tela, fecha__lte=fecha_busqueda).order_by('-fecha').first()
            precio_actual = float(precio_obj.precio) if precio_obj else 0.0
            
            # Obtener predicción ML
            precio_predicho = predecir_precio(tela.id, fecha_str)
            
            data.append({
                'id': tela.id,
                'nombre': tela.nombre,
                'precio_real': precio_actual,
                'precio_predicho': precio_predicho or precio_actual
            })
            
        # Ordenar por precio si se solicita
        if orden_precio == 'asc':
            data.sort(key=lambda x: x['precio_real'])
        elif orden_precio == 'desc':
            data.sort(key=lambda x: x['precio_real'], reverse=True)
            
        response = JsonResponse(data, safe=False)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def post(self, request):
        # Recibir datos para el cálculo final
        try:
            data = json.loads(request.body)
            # Formula: (Metros * Precio) + Extras + ManoObra
            telas_items = data.get('telas', []) # Lista de {tela_id, metros}
            extras = float(data.get('extras', 0))
            mano_obra = float(data.get('mano_obra', 0))
            fecha = data.get('fecha', datetime.now().strftime('%Y-%m-%d'))
            
            subtotal_telas = 0
            detalles_calculo = []
            
            for item in telas_items:
                tela = Tela.objects.get(id=item['tela_id'])
                precio_obj = TelaPrecio.objects.filter(tela=tela, fecha__lte=fecha).order_by('-fecha').first()
                precio = float(precio_obj.precio) if precio_obj else 0
                
                costo_item = float(item['metros']) * precio
                subtotal_telas += costo_item
                detalles_calculo.append({
                    'tela': tela.nombre,
                    'metros': item['metros'],
                    'precio_unidad': precio,
                    'subtotal': round(costo_item, 2)
                })
            
            total_final = subtotal_telas + extras + mano_obra
            
            res = {
                'detalles': detalles_calculo,
                'subtotal_telas': round(subtotal_telas, 2),
                'extras': extras,
                'mano_obra': mano_obra,
                'total_final': round(total_final, 2)
            }
            
            response = JsonResponse(res)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as e:
            response = JsonResponse({'error': str(e)}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
