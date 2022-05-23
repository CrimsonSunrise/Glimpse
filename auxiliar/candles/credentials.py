import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

analysisAccount = db.Auxiliar.find_one({ "name": "analysisAccount" })["value"]

analysisEmail = analysisAccount.split("/")[0]
analysisPassword = analysisAccount.split("/")[1]