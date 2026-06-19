# Document Signature App

A full-stack document signing web application built with FastAPI and Next.js.  
The app allows users to upload PDF documents, preview them, drag and place a signature, save signature coordinates, generate signed PDFs, create public signing links, track document status, and view audit logs.

## Features

- User Authentication API
- PDF Upload
- PDF Preview
- Drag and Drop Signature Placement
- Signature Coordinates Save
- Signed PDF Generation
- Signed PDF Download
- Public Signing Link
- Pending / Signed / Rejected Status Flow
- Audit Trail with IP Address and Timestamp
- Uploaded Documents List

## Tech Stack

### Frontend
- Next.js
- React
- React PDF
- TypeScript

### Backend
- Python
- FastAPI
- PyMuPDF
- Uvicorn

## Project Structure

```text
document-signature-app/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   ├── package.json
│   └── node_modules/
│
└── README.md
How to Run Backend
cd backend
python -m uvicorn main:app --reload

Backend runs on:

http://127.0.0.1:8000

Swagger API docs:

http://127.0.0.1:8000/docs
How to Run Frontend
cd frontend
npm run dev

Frontend runs on:cd frontend
npm run devFrontend runs on:

http://localhost:3000
Main Workflow
Upload a PDF document.
Preview the PDF in the browser.
Drag the signature box anywhere on the PDF.
Save the signature position.
Generate the signed PDF.
Download the signed PDF.
Create a public signing link.
Check document status.
Reject document if needed.
View audit trail with timestamp and IP address.
API Endpoints
AuthenticationPOST /api/auth/register
POST /api/auth/login
Documents
POST /api/docs/upload
GET /api/docs
GET /api/docs/{doc_id}
POST /api/docs/share/{doc_id}
Signatures
POST /api/signatures
GET /api/signatures/{doc_id}
POST /api/signatures/finalize
POST /api/signatures/reject
GET /api/signature-status/{doc_id}
Audit Trail
GET /api/audit/{doc_id}Download
GET /api/download/{filename}
Demo Highlights
PDF preview works inside the browser.
Signature box can be dragged and placed anywhere on the PDF.
Signature position is saved using x and y coordinates.
Signed PDF is generated using PyMuPDF.
Audit logs store action, document ID, user ID, IP address, timestamp, and details.
Public signing link is generated for external signing flow.
Status flow supports pending, signed, and rejected states.
Future Improvements
Add database persistence using PostgreSQL or Supabase.Add email notification for public signing links.
Add real digital certificate based signing.
Add user dashboard and role-based access.
Improve multi-page signature coordinate scaling.