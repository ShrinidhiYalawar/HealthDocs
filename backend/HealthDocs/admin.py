from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """
    Admin interface for Document model
    """
    list_display = ['id', 'filename', 'filesize_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['filename']
    readonly_fields = ['created_at']
    
    def filesize_display(self, obj):
        """Display file size in human-readable format"""
        size = obj.filesize
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"
    
    filesize_display.short_description = 'File Size'