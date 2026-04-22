from rest_framework import serializers
from ..infrastructure.models import NotaDiaria, Tela, TelaPrecio, Prenda, Calculo, CalculoTela, Extra, CalculoExtra

class NotaDiariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaDiaria
        fields = ['fecha', 'contenido']

class TelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tela
        fields = ['id', 'nombre']

class TelaPrecioSerializer(serializers.ModelSerializer):
    tela_nombre = serializers.ReadOnlyField(source='tela.nombre')
    class Meta:
        model = TelaPrecio
        fields = ['id', 'tela', 'tela_nombre', 'fecha', 'precio']

class CalculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calculo
        fields = '__all__'
