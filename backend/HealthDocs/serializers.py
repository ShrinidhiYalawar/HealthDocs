from rest_framework import serializers
from .models import Document
import os


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model with PDF validation.
    """
    
    class Meta:
        model = Document
        fields = ['id', 'filename', 'filepath', 'filesize', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_file(self, value):
        """
        Validate uploaded file:
        - Must be PDF
        - Size limit check
        """
        # Check file extension
        ext = os.path.splitext(value.name)[1].lower()
        if ext != '.pdf':
            raise serializers.ValidationError("Only PDF files are allowed.")
        
        # Check file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size must not exceed 10MB. Your file is {value.size / (1024 * 1024):.2f}MB."
            )
        
        return value