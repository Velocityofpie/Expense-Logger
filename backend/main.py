from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import secrets

app = FastAPI()

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["invoice_extractor"]

# Secret key for JWT
SECRET_KEY = "supersecretkey"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

UPLOAD_FOLDER = Path("uploads/avatars")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

# User Registration
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str  # "admin" or "user"

@app.post("/signup/")
async def signup(user_data: UserSignup):
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = pwd_context.hash(user_data.password)
    user = {"username": user_data.username, "email": user_data.email, "password": hashed_password, "role": user_data.role, "avatar": ""}
    await db.users.insert_one(user)
    return {"message": "User registered successfully"}

# Login & JWT Token
class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login/")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not pwd_context.verify(user_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = jwt.encode({"sub": user_data.username, "role": user["role"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

# Get User Profile
@app.get("/profile/")
async def get_profile(payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"username": payload["sub"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update Profile
class UserUpdate(BaseModel):
    email: EmailStr = None
    new_password: str = None
    role: str = None

@app.put("/profile/")
async def update_profile(data: UserUpdate, payload: dict = Depends(verify_token)):
    update_fields = {}

    if data.email:
        update_fields["email"] = data.email

    if data.new_password:
        update_fields["password"] = pwd_context.hash(data.new_password)

    if data.role and payload["role"] == "admin":
        update_fields["role"] = data.role  # Only admins can change roles

    if update_fields:
        await db.users.update_one({"username": payload["sub"]}, {"$set": update_fields})

    return {"message": "Profile updated successfully"}

# Avatar Upload
@app.post("/upload-avatar/")
async def upload_avatar(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    avatar_path = UPLOAD_FOLDER / f"{payload['sub']}.jpg"

    with open(avatar_path, "wb") as buffer:
        buffer.write(await file.read())

    await db.users.update_one({"username": payload["sub"]}, {"$set": {"avatar": str(avatar_path)}})

    return {"message": "Avatar uploaded successfully", "avatar_url": f"/avatar/{payload['sub']}"}

@app.get("/avatar/{username}")
async def get_avatar(username: str):
    avatar_path = UPLOAD_FOLDER / f"{username}.jpg"
    if avatar_path.exists():
        return FileResponse(avatar_path)
    return HTTPException(status_code=404, detail="Avatar not found")
