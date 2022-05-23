import time
import pymongo
from bson import ObjectId
import certifi

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

def deny(user, reason):
    
    title = ""
    description = ""
    
    if reason == "nopremium":
        title = "Não é assinante"
        description = "Você não possui uma assinatura ou ela expirou. Renove para continuar utilizando o Glimpse."
    elif reason == "notraders":
        title = "Sem há operadores"
        description = "Não é possível operar no momento pois não há operadores disponíveis no momento."
    
    db.Accounts.update_one(
        { "_id": ObjectId(user) },
        {
            "$push": {
                "alerts": {
                    "title": title,
                    "description" : description,
                    "time": str(time.time()),
                    "read": False,
                    "shown": False,
                    "type": "danger"
                }
            }
        }
    )
    
    db.Accounts.update_one(
        { "_id": ObjectId(user) },
        {
            "$set": {
                "glimpseStatus": "off"
            }
        }
    )

def job():
    
    availableServers = []
    
    db.ServerStatus.update_one(
        { "name": "Server Assigner" },
        {
            "$set": {
                "uptime": time.time()
            }
        }
    )
    
    waitingUser = db.Accounts.find_one({ "glimpseStatus": "waiting" })
    
    if waitingUser == None:
        return
    
    nextAvailableServer = db.Servers.find({ "status": "waiting" })
    
    for server in nextAvailableServer:
        nasTime = server["uptime"]
        if time.time() - nasTime <= 4:
            availableServers.append(server)
    
    if len(availableServers) > 0:
        
        if waitingUser["premiumDays"] > 0:
                
            print("Assigning bot for", waitingUser["_id"])
    
            db.Accounts.update_one(
                { "_id": ObjectId(waitingUser["_id"]) },
                {
                    "$set": {
                        "glimpseStatus": "assigning"
                    }
                }
            )
        
            db.Servers.update_one(
                { "name": server["name"] },
                {
                    "$set": {
                        "status": "assigned",
                        "target": str(waitingUser["_id"])
                    }
                }
            )
        else:
            deny(waitingUser["_id"], "nopremium")
    else:
        deny(waitingUser["_id"], "notraders")
    
while True:
    time.sleep(3)
    job()