from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('documents/upload', views.upload_document, name='upload'),
    path('documents', views.list_documents, name='list'),
    path('documents/<int:id>', views.document_detail, name='detail'),
]