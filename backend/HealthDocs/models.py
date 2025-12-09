from django.db import models
import os


class Document(models.Model):
    """
    Model to store medical document metadata.
    """
    filename = models.CharField(max_length=255)
    filepath = models.CharField(max_length=500)
    filesize = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.filename
    
    def delete(self, *args, **kwargs):
        """Delete file from disk when model is deleted"""
        if self.filepath and os.path.exists(self.filepath):
            os.remove(self.filepath)
        super().delete(*args, **kwargs)