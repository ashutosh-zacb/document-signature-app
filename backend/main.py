from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from schemas.user import UserRegister, UserLogin
import bcrypt
import os
import shutil
import fitz

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users = []
documents = []
signatures = []
audit_logs = []

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.get("/")
def home():
    return {"message": "Document Signature App Backend Running"}


@app.post("/api/auth/register")
def register(user: UserRegister):
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    users.append(new_user)

    return {"message": "User registered successfully"}


@app.post("/api/auth/login")
def login(user: UserLogin):
    for existing_user in users:
        if existing_user["email"] == user.email:
            if bcrypt.checkpw(user.password.encode("utf-8"), existing_user["password"]):
                return {"message": "Login successful"}

    return {"message": "Invalid email or password"}


@app.post("/api/docs/upload")
def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = {
        "id": len(documents) + 1,
        "filename": file.filename,
        "path": file_path,
        "status": "uploaded"
    }

    documents.append(document)

    return {
        "message": "PDF uploaded successfully",
        "document": document
    }


@app.get("/api/docs")
def get_documents():
    return documents


@app.get("/api/docs/{doc_id}")
def get_document(doc_id: int):

    for document in documents:
        if document["id"] == doc_id:
            return document

    return {"message": "Document not found"}
@app.post("/api/signatures")
def create_signature(doc_id: int, user_id: int, x: float, y: float, page: int):
    signature = {
        "id": len(signatures) + 1,
        "doc_id": doc_id,
        "user_id": user_id,
        "x": x,
        "y": y,
        "page": page,
        "status": "pending"
    }

    signatures.append(signature)

    audit_logs.append({
        "action": "signature_position_added",
        "doc_id": doc_id,
        "user_id": user_id,
        "details": f"Signature placed on page {page} at x={x}, y={y}"
    })

    return {
        "message": "Signature position saved successfully",
        "signature": signature
    }


@app.get("/api/signatures/{doc_id}")
def get_signatures(doc_id: int):
    result = []

    for signature in signatures:
        if signature["doc_id"] == doc_id:
            result.append(signature)

    return result


@app.get("/api/audit/{doc_id}")
def get_audit_logs(doc_id: int):
    result = []

    for log in audit_logs:
        if log["doc_id"] == doc_id:
            result.append(log)

    return result
@app.post("/api/signatures/finalize")
def finalize_document(doc_id: int):

    document_data = None

    for doc in documents:
        if doc["id"] == doc_id:
            document_data = doc
            break

    if document_data is None:
        return {"message": "Document not found"}

    pdf = fitz.open(document_data["path"])

    for signature in signatures:

        if signature["doc_id"] == doc_id:

            page = pdf[signature["page"] - 1]

            page.insert_text(
                (signature["x"], signature["y"]),
                f"Signed by User {signature['user_id']}",
                fontsize=12
            )

            signature["status"] = "signed"

    signed_path = f"uploads/signed_{document_data['filename']}"

    pdf.save(signed_path)
    pdf.close()

    audit_logs.append({
        "action": "document_signed",
        "doc_id": doc_id,
        "user_id": 1,
        "details": "Signed PDF generated"
    })

    return {
        "message": "Signed PDF generated successfully",
        "signed_file": signed_path
    }

@app.get("/api/status")
def status():
    return {
        "documents": len(documents),
        "signatures": len(signatures),
        "audit_logs": len(audit_logs)
    }

@app.post("/api/signatures/reject")
def reject_signature(doc_id: int, reason: str):

    for signature in signatures:

        if signature["doc_id"] == doc_id:

            signature["status"] = "rejected"

            audit_logs.append({
                "action": "signature_rejected",
                "doc_id": doc_id,
                "user_id": signature["user_id"],
                "details": reason
            })

            return {
                "message": "Signature rejected",
                "reason": reason
            }

    return {"message": "Document not found"}