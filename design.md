## 1. Tech Stack Choices

### Q1. What frontend framework did you use and why?

I used **HTML, CSS, and JavaScript** for the frontend. Since this project was primarily focused on learning Django and handling file management, a lightweight and simple frontend was sufficient. It allows fast rendering, easy integration with Django templates, and straightforward DOM manipulation for handling uploads, downloads, and displaying messages.

### Q2. What backend framework did you choose and why?

I chose **Django with Django REST Framework (DRF)** for the backend. Django provides a robust structure for building scalable web applications, including built-in features for authentication, file handling, and ORM for database operations. DRF makes it easy to create RESTful APIs for file upload, download, and management.

### Q3. What database did you choose and why?

I used **SQLite** as the database. It is lightweight, file-based, and easy to set up, which makes it ideal for development and small-scale applications. It allows us to quickly test CRUD operations for documents without needing complex configurations.

### Q4. If you were to support 1,000 users, what changes would you consider?

* Move from SQLite to PostgreSQL/MySQL for better performance and concurrency handling.
* Store uploaded files in cloud storage (AWS S3 or Azure Blob Storage) instead of the local filesystem.
* Implement authentication and user-specific access control.
* Introduce pagination and caching for listing documents.
* Deploy using WSGI/ASGI servers like Gunicorn or Daphne behind Nginx for scalability.

## 2. Architecture Overview

### System Flow

```
[Frontend - HTML/CSS/JS]
        |
        v
[Django Views & DRF APIs]
        |
        v
[Database - SQLite]   [File Storage - uploads/documents]
        |                   |
        v                   v
Document Metadata      Physical PDF Files
```

### Bullet Point Flow

* User interacts with the frontend (uploads or downloads documents).
* Frontend sends HTTP requests to Django REST APIs.
* Django handles requests:

  * Saves metadata to SQLite.
  * Saves uploaded files to the `uploads/documents` folder.
* For download requests, Django reads the file from disk and sends it as a response.
* Frontend updates the UI dynamically using JavaScript.

## 3. API Specification

### 1. Upload a PDF

* **URL & Method:** `/documents/upload` (POST)
* **Request:** FormData with file field (PDF only, max 10MB)
* **Response (Success):**

```json
{
  "id": 1,
  "filename": "report.pdf",
  "filepath": "uploads/documents/report.pdf",
  "filesize": 102400,
  "created_at": "2025-12-09T23:00:00Z"
}
```

* **Description:** Uploads a PDF file to the server and stores its metadata in the database.

### 2. List All Documents

* **URL & Method:** `/documents` (GET)
* **Response:**

```json
[
  {
    "id": 1,
    "filename": "report.pdf",
    "filepath": "uploads/documents/report.pdf",
    "filesize": 102400,
    "created_at": "2025-12-09T23:00:00Z"
  },
  
]
```

* **Description:** Returns a list of all uploaded documents with metadata.

### 3. Download a File

* **URL & Method:** `/documents/:id` (GET)
* **Response:** PDF file as attachment
* **Description:** Downloads the requested PDF file using its ID.

### 4. Delete a File

* **URL & Method:** `/documents/:id` (DELETE)
* **Response (Success):** HTTP 204 No Content
* **Description:** Deletes the document from both database and server storage.

## 4. Data Flow Description

### File Upload Steps

1. User selects a PDF and clicks “Upload”.
2. JavaScript validates file type and size on the frontend.
3. File is sent via POST to `/documents/upload` with CSRF token.
4. Backend validates again (type & size).
5. File is saved in `uploads/documents/`.
6. Metadata is stored in SQLite (Document table).
7. API returns document details; frontend updates the UI.

### File Download Steps

1. User clicks “Download” for a document.
2. JavaScript sends GET request to `/documents/:id`.
3. Backend retrieves file from disk and sends it as a FileResponse.
4. Browser downloads the file.

## 5. Assumptions

* Only PDF files are allowed.
* Max file size: 10MB per document.
* All users can see all documents (no authentication yet).
* Concurrency: Limited as SQLite and local storage are used.
