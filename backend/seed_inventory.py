import os
import django
import sys

# Configurar el entorno de Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.infrastructure.models import Inventario

def populate_inventory():
    materiales = [
        ("Tocuyo", ["Crudo", "Blanco"], "Metros", "Telas"),
        ("Paño", ["Negro", "Azul Marino", "Gris", "Rojo"], "Metros", "Telas"),
        ("Kaki", ["Beige", "Verde Oliva", "Marrón"], "Metros", "Telas"),
        ("Satín", ["Blanco", "Perla", "Rosa", "Champán"], "Metros", "Telas"),
        ("Piel de cordero", ["Natural", "Café", "Negro"], "Metros", "Insumos"),
        ("Bies rígido", ["Blanco", "Negro", "Azul"], "Metros", "Insumos"),
        ("Musselina", ["Blanco", "Crema", "Celeste"], "Metros", "Telas"),
        ("Bayetilla", ["Rojo", "Amarillo", "Verde"], "Metros", "Insumos"),
        ("Entretela", ["Blanco", "Negro", "Gris"], "Metros", "Insumos"),
        ("Palito de madera", ["Natural"], "Unidades", "Insumos"),
        ("Piel de conejo", ["Gris", "Blanco", "Moteado"], "Metros", "Insumos"),
        ("Piel de ganso", ["Blanco", "Gris"], "Metros", "Insumos"),
        ("Algodón", ["Blanco", "Azul", "Verde", "Gris"], "Metros", "Telas"),
        ("Kaki Americano", ["Arena", "Azul", "Marrón"], "Metros", "Telas"),
        ("Tela impermeable", ["Azul", "Rojo", "Negro", "Gris"], "Metros", "Telas"),
    ]

    count = 0
    for nombre_base, colores, unidad, categoria in materiales:
        for color in colores:
            nombre_completo = f"{nombre_base} ({color})" if len(colores) > 1 or color != "Natural" else nombre_base
            # Evitar duplicados
            item, created = Inventario.objects.get_or_create(
                nombre=nombre_completo,
                defaults={
                    'cantidad': 10.0, # Cantidad inicial de prueba
                    'unidad_medida': unidad,
                    'minimo_stock': 2.0,
                    'categoria': categoria
                }
            )
            if created:
                count += 1
    
    print(f"Se han agregado {count} nuevos registros al inventario.")

if __name__ == "__main__":
    populate_inventory()
