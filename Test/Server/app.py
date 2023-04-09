
from pymongo import MongoClient
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


client = MongoClient("mongodb://database:27017/")
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
    # items = collection.find({})
    # return jsonify([{"name": item["name"]} for item in items])

    # name = request.json["name"]
    # collection.insert_one({"name": name})

    return ""


@app.post("/process-image")
async def process_image():
    return "dd"
