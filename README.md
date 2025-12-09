# 🏥 HealthDocs

A lightweight Django-based web application that allows users to upload, view, download, and delete medical documents (PDFs). Designed with a clean frontend and a secure, API-driven backend.

---

## 📋 Project Overview

**HealthDocs** is a full-stack document management system built using:

- **Backend:** Django + Django REST Framework  
- **Frontend:** HTML, CSS, JavaScript  
- **Database:** SQLite  
- **File Storage:** Local filesystem (`uploads/documents/`)  

### ✨ Features

- Upload PDF medical documents  
- View list of uploaded files  
- Download any PDF  
- Delete documents  
- API-based backend that can be tested via Postman  
- Fully responsive and simple UI  

---

## 🚀 How to Run the Project Locally

### 1️⃣ Clone the repository

```bash
git clone <your-repository-url>
cd Health_Documents
```

### 2️⃣ Create & activate virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

### 4️⃣ Apply database migrations

```bash
python backend/manage.py migrate
```

### 5️⃣ (Optional) Create a superuser

```bash
python backend/manage.py createsuperuser
```

### 6️⃣ Run the development server

```bash
python backend/manage.py runserver
```

**Visit the site at:**
- 👉 Frontend UI: http://127.0.0.1:8000/
- 👉 Admin Panel: http://127.0.0.1:8000/admin/

---

## 📮 Example API Calls (Postman)

### 1️⃣ Upload a PDF Document

**Method:** `POST`  
**URL:** `http://127.0.0.1:8000/documents/upload`  
**Body:** form-data  
- **Key:** `file` → Choose File (PDF)

**Response (201 Created):**
```json
{
  "id": 1,
  "filename": "report.pdf",
  "filepath": "uploads/documents/report.pdf",
  "filesize": 234567,
  "created_at": "2025-12-10T10:00:00Z"
}
```

### 2️⃣ Get All Documents

**Method:** `GET`  
**URL:** `http://127.0.0.1:8000/documents`

### 3️⃣ Download a Document

**Method:** `GET`  
**URL:** `http://127.0.0.1:8000/documents/<id>`  
(returns PDF file)

### 4️⃣ Delete a Document

**Method:** `DELETE`  
**URL:** `http://127.0.0.1:8000/documents/<id>`

---

## 📝 Notes

- Only PDF files up to 10MB are allowed.
- Uploaded files are stored inside `uploads/documents/`.
- Works fully offline and requires only Python + Django.
