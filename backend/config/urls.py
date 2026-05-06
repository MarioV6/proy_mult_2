"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from apps.users.interfaces.health_check import check_db_connection
from apps.users.interfaces.controller import NotasView, TelasView, PreciosView, ExternalUserView
from apps.users.interfaces.calculo_views import CalculadoraTelasView
from apps.users.interfaces.inventario_views import InventarioView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/db-check/', check_db_connection, name='db_check'),
    path('api/external-user/', ExternalUserView.as_view(), name='external_user'),
    path('api/notas/', NotasView.as_view(), name='gestionar_nota'),
    path('api/notas/mes/', NotasView.as_view(), name='notas_mes'),
    path('api/telas/', TelasView.as_view(), name='gestionar_telas'),
    path('api/precios/', PreciosView.as_view(), name='gestionar_precios'),
    path('api/calculadora/', CalculadoraTelasView.as_view(), name='calculadora_telas'),
    path('api/inventario/', InventarioView.as_view(), name='inventario_list'),
    path('api/inventario/<int:item_id>/', InventarioView.as_view(), name='inventario_detail'),
]
