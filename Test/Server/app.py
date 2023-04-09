from flask import Flask, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient("mongodb://mongo:27017/")
db = client["mydb"]
collection = db["user"]

@app.route("/", methods=["GET"])
def get_all_items():
    items = collection.find({})
    return jsonify([{"name": item["name"]} for item in items])

@app.route("/", methods=["POST"])
def create_item():
    name = request.json["name"]
    collection.insert_one({"name": name})
    return jsonify({"message": "Item created successfully"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
