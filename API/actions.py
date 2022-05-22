from iqoptionapi.stable_api import IQ_Option
import json
import pymongo
import time
import re
import socket
from bson import json_util, ObjectId

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

def updateIp():
    db.Auxiliar.update_one(
        { "name": "apiAddress" },
        {
            "$set": {
                "value": socket.gethostbyname(socket.gethostname())
            }
        }
    )

def ping():
    return "pong"

def getUser(userMail):
    
    account = db.Accounts.find_one({})
    
    if account:
        return json.loads(json_util.dumps(account))
    else:
        return {
            "err": "nothing found"
        }

def updateUser(userMail, fields, values):
    
    for x in range(len(fields)):
        db.Accounts.update_one(
            {},
            {
                "$set": {
                    fields[x]: values[x]
                }
            }
        )
    return {
        "message": "User updated!"
    }

def getIqInfo(Email, Password):
    checkMail = Email
    checkPass = Password
    print(checkMail, checkPass)
    
    Iq = IQ_Option(checkMail, checkPass)
    check, reason = Iq.connect()
    
    if Iq.check_connect()==False:
        check,reason=Iq.connect()
        
    if check:
        
        nome = ""
        balance_type="PRACTICE"
        Iq.change_balance("PRACTICE")
        treinamento = Iq.get_balance()
        Iq.change_balance("REAL")
        real = Iq.get_balance()
        Iq.logout()
        
        print(treinamento)
        
        return {
            "res": 1,
            "account": checkMail,
            "treinamento": treinamento,
            "real": real
        }
    else:
        return {
            "res": reason
        }

def insertUser(userName, userMail, userPassword):
    
    db.Accounts.insert_one({
        "name": userName,
        "email": userMail,
        "password": userPassword,
        "phone": "",
        "cpf": "",
        "image": "https://icon-library.com/images/user-icon-free/user-icon-free-8.jpg",
        "iqEmail": "",
        "iqPassword": "",
        "iqBalanceReal": "",
        "iqBalancePractice": "",
        "iqAccountType": "treinamento",
        "iqPeriodProfit": 0,
        "iqSessionProfit": 0,
        "glimpseStatus": "off",
        "firstAccess": 1,
        "premiumDays": 0,
        "strategy": "Glimpse Baixo Risco",
        "ownedStrategies": ["Glimpse Baixo Risco"],
        "preferedPayout": "> 75",
        "preferedActives": "todos",
        "lastLogin": "",
        "iqPeriodLoss": 0,
        "alerts": [{
            "title": "Bem vindo!",
            "description": "Seja bem vindo ao Glimpse. Configure da maneira que desejar e comece a lucrar!",
            "read": False,
            "shown": False,
            "time": str(time.time()),
            "type": "info"
        }],
        "mode": "strategy",
        "strategySettings": {
            "money": 10,
            "gale": False,
            "galeCount": 1,
            "galeType": "dobro",
            "sobra": 2,
            "stopLoss": False,
            "stopLossValue": 0,
            "stopWin": False,
            "stopWinValue": 0
        },
        "signalSettings": {
            "money": 10,
            "gale": False,
            "galeCount": 1,
            "galeType": "dobro",
            "sobra": 2,
            "stopLoss": False,
            "stopLossValue": 0,
            "stopWin": False,
            "stopWinValue": 0
        },
        "operating": {
            "operating": False,
            "active": "",
            "money": 0,
            "operacao": "",
            "tries": []
        },
        "settings": {
            "alerts": {
                "useAlerts": False,
                "glimpseStart": False,
                "glimpseStop": False,
                "activeClose": False,
                "stopLossReached": False,
                "stopWinReached": False
            },
            "glimpse": {
                "slides": False,
                "operationPriority": "gale"
            }
        },
        "passwordRecoverCode": "",
        "readTerms": False,
    })
    
    return {
        "message": "User created!"
    }

def checkCode(code):
    
    valid = db.Codes.find_one({ "code": code })
    
    if not valid:
        return {
            "res": -1
        }
    
    return {
        "res": valid["valid"]
    }

def getActives(type):
    
    data = db.OpenedActives.find({})
    
    if type == "compact":
        data = db.OpenedActives.find({ "open": "True" })
    elif type != "full":
        return {
            "res": "type must be compact or full"
        }
    
    return json.dumps(json.loads(json_util.dumps(data)))
        
    

def getActivesSchedule():
    
    activeSchedule = db.ActivesSchedule.find({})
    
    return json.dumps(json.loads(json_util.dumps(activeSchedule)))

def updateActives(actives):
    
    for active in json.loads(actives):
        
        db.OpenedActives.update_one(
            {"ativo": active["ativo"]},
            {
                "$set": {
                    "open": active["open"],
                    "payout": active["payout"]
                }
            }
        )
        
    return {
        "msg": "Actives updated: " + actives
    }

def updateCandlesRealtime(candles):
    
    return {
        "res": "this function its deprecated!"
    }

def getCandlesRealtime():
    
    candles = []
    
    ativos = db.RealtimeCandles.find()
    
    for ativo in ativos:
        candles.append({
            "ativo": ativo["ativo"],
            "candles": ativo["candles"],
            "lastUpdate": int((str(ativo["lastUpdated"]).replace('.', '')[:13]))
        })
    
    return json.dumps(candles)
    
    
def getBotUpdatesTimestamps():
    
    botUpdates = []
    
    botsRaw = db.botUpdates.find()
    
    for bot in botsRaw:
        
        lastUpdate = str(bot["lastUpdate"]).replace(".", "")[:13]
        if len(lastUpdate) > 0:
            lastUpdate = int(lastUpdate)
        else:
            lastUpdate = 0
        
        botUpdates.append({
            "botName": bot["botName"],
            "lastUpdate": lastUpdate
        })
    
    return json.dumps(botUpdates)

def login(Email, Password):
	
    checkUser = db.Accounts.find({ "email": Email, "password": Password})
    
    count = 0
    
    for user in checkUser:
        return {
            "res": 1
        }
    
    return {
        "res": -1
    }
    

def getStrategies():
    
    strategies = db.Strategies.find({})
    
    return json.dumps(json.loads(json_util.dumps(strategies)))

def getRank():
    
    accounts = db.Accounts.find({})
    
    ranks = []
    
    for account in accounts:
        ranks.append({
            "name": account["name"],
            "profit": account["iqPeriodProfit"],
            "loss": account["iqPeriodLoss"]
        })
    
    def myFunc(e):
        return e['profit']
    
    ranks.sort(reverse=True, key=myFunc)
    
    return json.dumps(json.loads(json_util.dumps(ranks)))

def useCode(code, user):
    
    db.Codes.update_one(
        {"code": code},
        {
            "$set": {
                "valid": False,
                "usedBy": user,
                "usedWhen": time.time()
            }
        }
    )
    
    return {
        "res": "Code used!"
    }

def getUsers():
    
    users = db.Accounts.find({})
    
    usersArray = []
    
    for user in users:
        usersArray.append({
            "_id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "iqAccountType": user["email"],
            "iqPeriodProfit": user["iqPeriodProfit"],
            "iqSessionProfit": user["iqSessionProfit"],
            "glimpseStatus": user["glimpseStatus"],
            "premiumDays": user["premiumDays"],
            "strategy": user["strategy"],
            "iqPeriodLoss": user["iqPeriodLoss"],
            "lastLogin": user["lastLogin"],
            "ownedStrategies": user["ownedStrategies"],
            "operationSettings": user["strategySettings"],
            "mode": user["mode"]
        })
    
    return json.dumps(json.loads(json_util.dumps(usersArray)))

def getUserOperations(user):
    
    userOperations = db.Operations.find({ "user": user })
    
    return json.dumps(json.loads(json_util.dumps(userOperations)))

def getAllOperations():
    
    userOperations = db.Operations.find({})
    
    return json.dumps(json.loads(json_util.dumps(userOperations)))

def getServerStatus():
    
    updateServerTime()
    
    servers = db.ServerStatus.find({})
    
    return json.dumps(json.loads(json_util.dumps(servers)))

def updateServerTime():
    db.ServerStatus.update_one(
        { "name": "API" },
        {
            "$set": {
                "uptime": time.time()
            }
        }
    )
    print("Server uptime updated ")

def updateServer(server):
    
    db.Servers.update_one(
        { "name": server["name"] },
        {
            "$set": {
                "status": server["status"],
                "target": server["target"]
            }
        }
    )
    
    return {
        "res": 1
    }

def getOperatingServerStatus():
    
    servers = db.Servers.find({})
    
    return json.dumps(json.loads(json_util.dumps(servers)))

def insertSignals(user, signals, type):
    
    ifExists = db.Sinais.find({ "user": user })
    
    newSignals = signals
    
    if len(signals) == 0:
        newSignals = []
    
    exists = False
    
    for ie in ifExists:
        exists = True
    
    if exists:
        # Atualizar sinais na entrada existente
        db.Sinais.update_one(
            {"user": user},
            {
                "$set": {
                    "signals": newSignals,
                    "type": type
                }
            }
        )
        
    else:
        # Criar nova entrada e inserir os sinais
        db.Sinais.insert_one({
            "user": user,
            "signals": signals,
            "type": type
        })

    return {
        "res": 1,
        "exists": exists
    }

def getSignals(user):
    
    signals = db.Sinais.find({ "user": user })
    
    return json.dumps(json.loads(json_util.dumps(signals)))

def getAuxiliar():
    
    auxiliar = db.Auxiliar.find()
    
    return json.dumps(json.loads(json_util.dumps(auxiliar)))

def getTestCandles():
    
    testCandles = db.TestCandles.find()
    
    return json.dumps(json.loads(json_util.dumps(testCandles)))

def getTestCandlesAnnually():
    
    testCandles = db.TestCandlesAnnually.find()
    
    return json.dumps(json.loads(json_util.dumps(testCandles)))

def createStrategy(strategy):
    
    je = db.Strategies.find({ "name": re.compile(strategy["name"], re.IGNORECASE) })

    jeJ = json.loads(json_util.dumps(je))

    if len(jeJ) == 0:
        
        db.Strategies.insert_one(
            {
                "name": strategy["name"],
                "createdBy": strategy["createdBy"],
                "sequence": strategy["sequence"],
                "operation": strategy["operation"],
                "mirror": strategy["mirror"]
            }
        )
        
        return {
            "res": 1
        }
        
    else:
        return {
            "res": 0
        }

def editStrategy(strategy):
    
    db.Strategies.update_one(
        { "name": strategy["name"] },
        {
            "$set": {
                "sequence": strategy["sequence"],
                "operation": strategy["operation"],
                "mirror": strategy["mirror"]
            }
        }
    )
    
    return {
        "res": 1
    }

def managerLogin(Email, Password):
	
    checkUser = db.ManagerAccounts.find({ "user": Email, "password": Password})
    
    count = 0
    
    for user in checkUser:
        return {
            "res": 1,
            "name": user["name"]
        }
    
    return {
        "res": -1
    }

def getAudit():
    
    auditList = db.ManagerAudit.find()
    
    return json.dumps(json.loads(json_util.dumps(auditList)))

def insertAudit(audit):
    
    auditToInsert = {
        "who": audit["who"],
        "target": audit["target"],
        "didWhat": audit["didWhat"],
        "from": audit["from"],
        "to": audit["to"],
        "when": audit["when"],
    }
    
    db.ManagerAudit.insert_one(auditToInsert)
    
    return {
        "res": 1
    }

def insertQuestion(question):
    
    newQuestion = {
        "who": question["who"],
        "question": question["question"],
        "when": question["when"]
    }
    
    db.Questions.insert_one(newQuestion)
    
    return {
        "res": 1
    }

def getQuestions():
    
    questions = db.Questions.find()
    
    return json.dumps(json.loads(json_util.dumps(questions)))

def getTerms():
    
    terms = db.Auxiliar.find({ "name": "Terms" })
    
    return json.dumps(json.loads(json_util.dumps(terms)))

def getRandomNames():
    
    randomNames = db.Auxiliar.find({ "name": "randomNames" })
    
    return json.dumps(json.loads(json_util.dumps(randomNames)))