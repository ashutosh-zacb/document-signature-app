from fastapi import FastAPI, UploadFile, File
from schemas.user import UserRegister, UserLogin
import bcrypt
import os
import shutil

app = FastAPI()

users = []
documents = []

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