// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const uploadBtn = document.getElementById('uploadBtn');
const messageContainer = document.getElementById('messageContainer');
const documentsList = document.getElementById('documentsList');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

// State
let documents = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('Patient Portal initialized');
    loadDocuments();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    uploadForm.addEventListener('submit', handleUpload);
    removeFile.addEventListener('click', clearFileSelection);
}

// Handle file selection - Show preview immediately
function handleFileSelect(e) {
    const file = e.target.files[0];

    if (file) {
        // Validate file type
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
            showMessage('Please select a PDF file only', 'error');
            clearFileSelection();
            return;
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showMessage(`File is too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`, 'error');
            clearFileSelection();
            return;
        }

        // Show file preview
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        filePreview.style.display = 'block';
    } else {
        clearFileSelection();
    }
}

// Clear file selection
function clearFileSelection() {
    fileInput.value = '';
    fileName.textContent = '';
    fileSize.textContent = '';
    filePreview.style.display = 'none';
}

// Handle file upload
async function handleUpload(e) {
    e.preventDefault();

    const file = fileInput.files[0];

    if (!file) {
        showMessage('Please select a file to upload', 'error');
        return;
    }

    // Validate file
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        showMessage('Only PDF files are allowed', 'error');
        return;
    }

    // Disable button and show loading
    uploadBtn.disabled = true;

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Get CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // Upload file
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(` File "${data.filename}" uploaded successfully!`, 'success');

            // Reset form and clear preview
            uploadForm.reset();
            clearFileSelection();

            // Reload documents
            await loadDocuments();
        } else {
            const errorMsg = data.error || 'Upload failed. Please try again.';
            showMessage(`❌ ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('❌ Network error. Please check if the backend server is running.', 'error');
    } finally {
        uploadBtn.disabled = false;
    }
}

// Load documents from API
async function loadDocuments() {
    try {
        loadingState.style.display = 'block';
        documentsList.style.display = 'none';
        emptyState.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/documents`);

        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }

        documents = await response.json();

        loadingState.style.display = 'none';

        if (documents.length === 0) {
            emptyState.style.display = 'block';
        } else {
            documentsList.style.display = 'block';
            renderDocuments();
        }
    } catch (error) {
        console.error('Load error:', error);
        loadingState.style.display = 'none';
        showMessage('❌ Failed to load documents. Please check if the backend server is running.', 'error');
    }
}

// Render documents list
function renderDocuments() {
    documentsList.innerHTML = documents.map(doc => `
        <div class="document-item" data-id="${doc.id}">
            <div class="document-info">
                <div class="document-icon">📄</div>
                <div class="document-details">
                    <div class="document-name">${escapeHtml(doc.filename)}</div>
                    <div class="document-meta">
                        <span> ${formatFileSize(doc.filesize)}</span>
                        <span> ${formatDate(doc.created_at)}</span>
                    </div>
                </div>
            </div>
            <div class="document-actions">
                <button class="btn btn-success btn-sm" onclick="downloadDocument(${doc.id}, '${escapeHtml(doc.filename)}')">
                    ⬇️ Download
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteDocument(${doc.id}, '${escapeHtml(doc.filename)}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Download document
async function downloadDocument(id, filename) {
    try {
        const response = await fetch(`${API_BASE_URL}/documents/${id}`);

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // showMessage(`  "${filename}"`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showMessage(' Failed to download file', 'error');
    }
}

// Delete document
async function deleteDocument(id, filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
        return;
    }

    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        if (response.ok) {
            showMessage(` "${filename}" deleted successfully`, 'success');
            await loadDocuments();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage(' Failed to delete file', 'error');
    }
}

// Show message
function showMessage(message, type = 'success') {
    messageContainer.innerHTML = '';

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;

    const icon = type === 'success' ? '' : '';

    messageDiv.innerHTML = `
        <span class="message-icon">${icon}</span>
        <span>${message}</span>
    `;

    messageContainer.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;