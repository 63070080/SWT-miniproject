
from pymongo import MongoClient
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class PocketPayload(BaseModel):
    pocket1: str
    pocket2: str = Field(default="6433f0d4c9ef2b1950a91655")
    money: float = Field(default=0.0)
class Data(BaseModel):
    id: str = Field(default="6433f0d4c9ef2b1950a91655")
    name: str
    cur_money: float = Field(default=0.0)
    max_money: float
class User(BaseModel):
    username: str
    password: str



#on ec2
client = MongoClient("mongodb+srv://admin:1234@cluster0.s5vfuft.mongodb.net/test")
#on local
# client = MongoClient("mongodb://localhost:27017/")
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
@app.get("/users")
async def get_users():
    
    items = []
    for item in collection.find({}):
        item['_id'] = str(item['_id'])
        for pocket in item["pockets"]:
            pocket["_id"] = str(pocket["_id"])
        for tran in user["transaction"]:
            tran["_id"] = str(tran["_id"])
        items.append(item)
    return items
#ขอข้อมูลuserจาก id
@app.get("/users/{id}")
async def get_user(id: str):
    try:
        user = collection.find_one({"_id": ObjectId(id)})
        if user:
            user['_id'] = str(user['_id'])
            for pocket in user["pockets"]:
                pocket["_id"] = str(pocket["_id"])
            for tran in user["transaction"]:
                tran["_id"] = str(tran["_id"])
            return user
        else:
            return False
    except:
        return False
#สร้าง user
@app.post("/create_user")
async def create_user(item: User):
    result = collection.insert_one({"username": item.username, "password": item.password, "main_pocket":500, "pockets":[], "transaction":[], "bank_number":"0123456789"})
    return {"message": "User created successfully", "id": str(result.inserted_id)}

#สร้าง pocket ให้ user
@app.post("/pockets/{id}")
async def create_pocket(item: Data, id:str):
    
    user = await get_user(id)
    if user:
        for pocket in user["pockets"]:
            pocket["_id"] = ObjectId(pocket["_id"])
        user["pockets"].append({"_id":ObjectId(),"name":item.name,"cur_money":0,"max_money":item.max_money})
        collection.update_one({"_id":ObjectId(id)},{"$set":{"pockets":user["pockets"]}} )
        result = await get_user(id)
        return result
    else:
        return False
    
#ลบpocket ของ user
@app.delete("/pockets/{id}")
async def delete_pocket(item: PocketPayload, id:str): 
    collection.update_one({"_id":ObjectId(id)}, {"$pull":{"pockets":{"_id":ObjectId(item.pocket1)}}})
    result = await get_user(id)
    return result

    
#แก้ไข pocket user
@app.put("/pockets/{id}")
async def update_pocket(item: Data, id:str): 

    collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(item.id) },{"$set": {"pockets.$.name": item.name, "pockets.$.max_money": item.max_money, "pockets.$.cur_money": item.cur_money}})
    result = await get_user(id)
    return result

#โอน pocket เข้า main
@app.put("/p2m/{id}")
async def p2main(item: PocketPayload, id:str): 
    user = await get_user(id)
    pocket = next((p for p in user["pockets"] if p["_id"] == item.pocket1), None)
    if item.money <= pocket["cur_money"]:
        mmoney = user["main_pocket"] + item.money
        pmoney = pocket["cur_money"] - item.money
        collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(item.pocket1) },{"$set": {"main_pocket":mmoney,"pockets.$.cur_money": pmoney}})
        result = await get_user(id)
        return result
    return False
#โอน Main เข้า pocket
@app.put("/m2p/{id}")
async def main2p(item: PocketPayload, id:str): 
    user = await get_user(id)
    pocket = next((p for p in user["pockets"] if p["_id"] == item.pocket1), None)
    if item.money <= user["main_pocket"]:
        mmoney = user["main_pocket"] - item.money
        pmoney = pocket["cur_money"] + item.money
        collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(item.pocket1) },{"$set": {"main_pocket":mmoney,"pockets.$.cur_money": pmoney}})
        result = await get_user(id)
        return result
    return False

#โอน pocket1 เข้า pocket2
@app.put("/p2p/{id}")
async def p2p(item: PocketPayload, id:str): 
    user = await get_user(id)
    pocket1 = next((p for p in user["pockets"] if p["_id"] == item.pocket1), None)
    pocket2 = next((p for p in user["pockets"] if p["_id"] == item.pocket2), None)
    if item.money <= pocket1["cur_money"]:
        p1money = pocket1["cur_money"] - item.money
        p2money = pocket2["cur_money"] + item.money
        collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(item.pocket1) },{"$set": {"pockets.$.cur_money": p1money}})
        collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(item.pocket2) },{"$set": {"pockets.$.cur_money": p2money}})
        result = await get_user(id)
        return result
    return False

@app.put("/deposit/{id}/{money}")
async def deposit(id:str, money: float): 
    user = await get_user(id)
    mmoney = user["main_pocket"] + money
    for tran in user["transaction"]:
        tran["_id"] = ObjectId(tran["_id"])
    user["transaction"].append({"_id":ObjectId(),"sender":user["username"],"bank_number":user["bank_number"],"frompocket":None,"target":None,"money":money,"type":"DEPOSIT","date":datetime.now()})
    collection.update_one({ "_id": ObjectId(id)},{"$set": {"main_pocket":mmoney, "transaction":user["transaction"]}})
    result = await get_user(id)
    return result

@app.put("/withdraw/{id}/{money}")
async def withdraw(id:str, money: float, pocketid:str = None): 
    user = await get_user(id)
    if pocketid != None:
        pocket = next((p for p in user["pockets"] if p["_id"] == pocketid), None)
        if money <= pocket["cur_money"]:
            mmoney = pocket["cur_money"] - money
            for tran in user["transaction"]:
                tran["_id"] = ObjectId(tran["_id"])
            user["transaction"].append({"_id":ObjectId(),"sender":user["username"],"bank_number":user["bank_number"],"frompocket":pocket["name"],"target":None,"money":money,"type":"WITHDRAW","date":datetime.now()})
            collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(pocketid) },{"$set": {"pockets.$.cur_money": mmoney, "transaction":user["transaction"]}})
            result = await get_user(id)
            return result
        return False

    else:
        if money <= user["main_pocket"]:
            mmoney = user["main_pocket"] - money
            for tran in user["transaction"]:
                tran["_id"] = ObjectId(tran["_id"])
            user["transaction"].append({"_id":ObjectId(),"sender":user["username"],"bank_number":user["bank_number"],"frompocket":"Main","target":None,"money":money,"type":"WITHDRAW","date":datetime.now()})
            collection.update_one({ "_id": ObjectId(id)},{"$set": {"main_pocket":mmoney, "transaction":user["transaction"]}})
            result = await get_user(id)
            return result
        return False
    
@app.put("/transfer/{id}/{money}")
async def transfer(id:str, money: float, pocketid:str = None, target:str = "9876543210"):
    
    user = await get_user(id)
    if pocketid != None:
        pocket = next((p for p in user["pockets"] if p["_id"] == pocketid), None)
        if money <= pocket["cur_money"]:
            mmoney = pocket["cur_money"] - money
            for tran in user["transaction"]:
                tran["_id"] = ObjectId(tran["_id"])
            user["transaction"].append({"_id":ObjectId(),"sender":user["username"],"bank_number":user["bank_number"],"frompocket":pocket["name"],"target":target,"money":money,"type":"TRANSFER","date":datetime.now()})
            collection.update_one({ "_id": ObjectId(id), "pockets._id": ObjectId(pocketid) },{"$set": {"pockets.$.cur_money": mmoney, "transaction":user["transaction"]}})
            result = await get_user(id)
            return result
        return False

    else:
        if money <= user["main_pocket"]:
            mmoney = user["main_pocket"] - money
            for tran in user["transaction"]:
                tran["_id"] = ObjectId(tran["_id"])
            user["transaction"].append({"_id":ObjectId(),"sender":user["username"],"bank_number":user["bank_number"],"frompocket":"Main","target":target,"money":money,"type":"TRANSFER","date":datetime.now()})
            collection.update_one({ "_id": ObjectId(id)},{"$set": {"main_pocket":mmoney, "transaction":user["transaction"]}})
            result = await get_user(id)
            return result
        return False