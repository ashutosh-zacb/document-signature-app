from fastapi import FastAPI
from schemas.user import UserRegister, UserLogin
import bcrypt

app = FastAPI()

users = []


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

            if bcrypt.checkpw(
                user.password.encode("utf-8"),
                existing_user["password"]
            ):
                return {"message": "Login successful"}

    return {"message": "Invalid email or password"}