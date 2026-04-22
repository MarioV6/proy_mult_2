
import os
import django
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Configurar Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.infrastructure.models import Tela, TelaPrecio

def run():
    telas_base = [
        {"nombre": "Algodón", "precio_base": 15.50, "volatilidad": 0.006, "tendencia": 0.00015},
        {"nombre": "Seda", "precio_base": 45.00, "volatilidad": 0.008, "tendencia": 0.0003},
        {"nombre": "Lino", "precio_base": 28.75, "volatilidad": 0.005, "tendencia": 0.0002},
        {"nombre": "Mezclilla", "precio_base": 22.00, "volatilidad": 0.004, "tendencia": 0.0001},
        {"nombre": "Terciopelo", "precio_base": 35.50, "volatilidad": 0.007, "tendencia": 0.00025},
    ]

    fecha_inicio = datetime(2024, 1, 1)
    fecha_fin = datetime(2026, 12, 31)
    delta = fecha_fin - fecha_inicio

    print(f"Generando dataset robusto desde {fecha_inicio.date()} hasta {fecha_fin.date()}...")

    for tb in telas_base:
        tela, created = Tela.objects.get_or_create(nombre=tb["nombre"])
        if created:
            print(f"Creada tela: {tela.nombre}")
        
        precios_a_crear = []
        precio_actual = tb["precio_base"]

        for i in range(delta.days + 1):
            fecha = fecha_inicio + timedelta(days=i)
            
            # 1. Fluctuación aleatoria
            fluctuacion = random.uniform(-tb["volatilidad"], tb["volatilidad"] + tb["tendencia"])
            
            # 2. Efecto estacional (senoidal por mes)
            mes = fecha.month
            estacionalidad = 1 + (0.05 * np.sin(2 * np.pi * mes / 12)) # Variación de +-5% según el mes
            
            precio_base_con_est = tb["precio_base"] * estacionalidad
            
            # Aplicar fluctuación sobre el precio actual
            precio_actual = precio_actual * (1 + fluctuacion)
            
            # Suavizar hacia la tendencia estacional si se desvía demasiado
            precio_actual = 0.9 * precio_actual + 0.1 * precio_base_con_est
            
            precios_a_crear.append(TelaPrecio(tela=tela, fecha=fecha, precio=round(precio_actual, 2)))
        
        # Eliminar precios previos para esta tela para evitar duplicados en la generación limpia
        TelaPrecio.objects.filter(tela=tela).delete()
        TelaPrecio.objects.bulk_create(precios_a_crear, ignore_conflicts=True)
        print(f"Generados {len(precios_a_crear)} registros para {tela.nombre}")

if __name__ == "__main__":
    run()
