from ..infrastructure.models import Inventario
from ..infrastructure.laravel_client import LaravelUserClient
from ..domain.entities import ExternalUser

class InventarioUseCases:
    @staticmethod
    def list_items():
        return Inventario.objects.all().order_by('categoria', 'nombre')

    @staticmethod
    def add_item(data):
        item = Inventario.objects.create(
            nombre=data.get('nombre'),
            cantidad=data.get('cantidad', 0),
            unidad_medida=data.get('unidad_medida', 'unidades'),
            minimo_stock=data.get('minimo_stock', 0),
            categoria=data.get('categoria', 'General'),
            color=data.get('color', 'N/A'),
            estado=data.get('estado', 'Disponible')
        )
        return item

    @staticmethod
    def update_stock(item_id, cantidad):
        item = Inventario.objects.get(id=item_id)
        item.cantidad = cantidad
        if item.cantidad <= 0:
            item.estado = 'Agotado'
        else:
            item.estado = 'Disponible'
        item.save()
        return item

    @staticmethod
    def delete_item(item_id):
        # En lugar de eliminar, reducimos stock a 0 y cambiamos estado
        item = Inventario.objects.get(id=item_id)
        item.cantidad = 0
        item.estado = 'Agotado'
        item.save()
        return True

class UserIntegrationUseCases:
    @staticmethod
    def get_external_user(user_id=None):
        user_data = LaravelUserClient.get_user_info(user_id)
        user_entity = ExternalUser(id=user_data.get('id', 0), name=user_data.get('name', 'N/A'))
        return user_entity.to_dict()
