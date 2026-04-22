import os
import sys
import django
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import joblib

# Añadir el path raíz del backend al sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(BASE_DIR)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.infrastructure.models import Tela, TelaPrecio

def train():
    print("Iniciando entrenamiento del modelo de predicción de precios...")
    
    # 1. Cargar datos de la BD
    precios = TelaPrecio.objects.all().select_related('tela')
    if not precios.exists():
        print("No hay datos para entrenar.")
        return

    data = []
    for p in precios:
        data.append({
            'tela_id': p.tela_id,
            'fecha': p.fecha,
            'precio': float(p.precio)
        })
    
    df = pd.DataFrame(data)
    df['fecha'] = pd.to_datetime(df['fecha'])
    
    # 2. Feature Engineering
    df['year'] = df['fecha'].dt.year
    df['month'] = df['fecha'].dt.month
    df['day'] = df['fecha'].dt.day
    df['dayofweek'] = df['fecha'].dt.dayofweek
    df['dayofyear'] = df['fecha'].dt.dayofyear
    
    # X = ['tela_id', 'year', 'month', 'day', 'dayofweek', 'dayofyear']
    X = df[['tela_id', 'year', 'month', 'day', 'dayofweek', 'dayofyear']]
    y = df['precio']
    
    # 3. Entrenamiento
    # Usamos RandomForest para capturar mejor las fluctuaciones no lineales
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # 4. Guardar modelo
    model_path = os.path.join('backend', 'apps', 'users', 'ml', 'saved_models', 'price_model.pkl')
    joblib.dump(model, model_path)
    
    # Guardar lista de IDs de telas para referencia
    telas_map = {t.id: t.nombre for t in Tela.objects.all()}
    joblib.dump(telas_map, os.path.join('backend', 'apps', 'users', 'ml', 'saved_models', 'telas_map.pkl'))
    
    print(f"Modelo entrenado y guardado en: {model_path}")
    print(f"R2 Score aproximado: {model.score(X, y):.4f}")

if __name__ == "__main__":
    train()
