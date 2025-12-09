from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse, Http404
from django.shortcuts import render
from .models import Document
from .serializers import DocumentSerializer
import os
from django.conf import settings


def index(request):
    """
    Render the main HTML page
    """
    return render(request, 'index.html')


@api_view(['POST'])
def upload_document(request):
    """
    Upload a PDF file
    POST /documents/upload
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file = request.FILES['file']
    
    # Validate file extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext != '.pdf':
        return Response(
            {'error': 'Only PDF files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file size (10MB)
    max_size = 10 * 1024 * 1024
    if file.size > max_size:
        return Response(
            {'error': f'File size must not exceed 10MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Save file to uploads/documents/
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'documents')
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, file.name)
    
    # Handle duplicate filenames
    counter = 1
    original_filepath = filepath
    while os.path.exists(filepath):
        name, ext = os.path.splitext(file.name)
        filepath = os.path.join(upload_dir, f"{name}_{counter}{ext}")
        counter += 1
    
    # Write file to disk
    with open(filepath, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    # Create database record
    document = Document.objects.create(
        filename=file.name,
        filepath=filepath,
        filesize=file.size
    )
    
    serializer = DocumentSerializer(document)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def list_documents(request):
    """
    List all documents
    GET /documents
    """
    documents = Document.objects.all()
    serializer = DocumentSerializer(documents, many=True)
    return Response(serializer.data)


@api_view(['GET', 'DELETE'])
def document_detail(request, id):
    """
    Download or delete a specific document
    GET /documents/:id - Download
    DELETE /documents/:id - Delete
    """
    try:
        document = Document.objects.get(id=id)
    except Document.DoesNotExist:
        return Response(
            {'error': 'Document not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        # Download file
        if not os.path.exists(document.filepath):
            return Response(
                {'error': 'File not found on server'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_handle = open(document.filepath, 'rb')
        response = FileResponse(file_handle, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{document.filename}"'
        return response
    
    elif request.method == 'DELETE':
        # Delete document
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)