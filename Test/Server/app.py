
from pymongo import MongoClient
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


client = MongoClient("mongodb://admin:1234@database:27017/")
db = client["mydb"]
collection = db["user"]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def getusers():
    items = []
    for item in collection.find():
        items.append(item)
    return items

