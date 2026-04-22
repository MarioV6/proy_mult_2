from django.db import models

# 1. NOTAS DIARIAS
class NotaDiaria(models.Model):
    fecha = models.DateField(unique=True)
    contenido = models.TextField()
    creado_at = models.DateTimeField(auto_now_add=True)
    actualizado_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notas_diarias'
        app_label = 'users'

# 2. TELAS Y PRECIOS
class Tela(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'telas'
        app_label = 'users'

class TelaPrecio(models.Model):
    tela = models.ForeignKey(Tela, on_delete=models.CASCADE, related_name='precios')
    fecha = models.DateField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'telas_precios'
        unique_together = ('tela', 'fecha')
        app_label = 'users'

# 3. PRENDAS Y CÁLCULOS
class Prenda(models.Model):
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'prendas'
        app_label = 'users'

class Calculo(models.Model):
    prenda = models.ForeignKey(Prenda, on_delete=models.SET_NULL, null=True)
    fecha = models.DateField(auto_now_add=True)
    costo_trabajo = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'calculos'
        app_label = 'users'

class CalculoTela(models.Model):
    calculo = models.ForeignKey(Calculo, on_delete=models.CASCADE, related_name='telas')
    tela = models.ForeignKey(Tela, on_delete=models.SET_NULL, null=True)
    metros = models.DecimalField(max_digits=10, decimal_places=2)
    precio_usado = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'calculo_telas'
        app_label = 'users'

# 4. EXTRAS
class Extra(models.Model):
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'extras'
        app_label = 'users'

class CalculoExtra(models.Model):
    calculo = models.ForeignKey(Calculo, on_delete=models.CASCADE, related_name='extras')
    extra = models.ForeignKey(Extra, on_delete=models.SET_NULL, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'calculo_extras'
        app_label = 'users'
