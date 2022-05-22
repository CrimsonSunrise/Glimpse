from flask import Flask, request
from flask_cors import CORS
from actions import createStrategy, editStrategy, getActivesSchedule, getAllOperations, getAudit, getAuxiliar, getOperatingServerStatus, getQuestions, getRandomNames, getServerStatus, getSignals, getTerms, getTestCandles, getTestCandlesAnnually, getUserOperations, getUsers, insertAudit, insertQuestion, insertSignals, managerLogin, ping, updateIp, updateServer, updateServerTime, useCode, getRank, getUser, updateUser, insertUser, checkCode, getActives, updateActives, updateCandlesRealtime, getCandlesRealtime, getIqInfo, getBotUpdatesTimestamps, login, getStrategies
availableKeys = 'ASD123'

def checkKey(key):
    if key != availableKeys:
        return False

app = Flask(__name__)
CORS(app)

# Update API's IP
updateIp()

@app.route("/glimpse/ping", methods=["GET"])
def apiPing():
    return ping()

@app.route("/glimpse/getUser", methods=["POST"])
def apiGetUser():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getUser(body["userMail"])
    
    return response

@app.route("/glimpse/updateUser", methods=["POST"])
def apiUpdateUser():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }

    response = updateUser(body["userMail"], body["fields"], body["values"])

    return response

@app.route("/glimpse/insertUser", methods=["POST"])
def apiInsertUser():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = insertUser(body["userName"], body["userMail"], body["userPassword"])
    
    return response

@app.route("/glimpse/checkCode", methods=["POST"])
def apiCheckCode():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = checkCode(body["code"])
    
    return response

@app.route("/glimpse/ativos", methods=["POST"])
def apiGetOpenedActives():
    body = request.get_json()
    
    response = getActives(body["type"])
    
    return response

@app.route("/glimpse/getActivesSchedule", methods=["POST"])
def apiGetActivesSchedule():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getActivesSchedule()
    
    return response

@app.route("/glimpse/updateAtivos", methods=["POST"])
def apiUpdateAtivos():
    body = request.get_json()
    
    response = updateActives(body)
    
    return response

@app.route("/glimpse/updateCandlesRealtime", methods=["POST"])
def apiUpdateCandlesRealtime():
    body = request.get_json()
    
    response = updateCandlesRealtime(body)
    
    return response

@app.route("/glimpse/getCandlesRealtime", methods=["GET"])
def apiGetCandlesRealtim():
    
    response = getCandlesRealtime()
    
    return response

@app.route("/glimpse/checkIq", methods=["POST"])
def apiCheckIq():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getIqInfo(body["email"], body["password"])
    
    return response

@app.route("/glimpse/botUpdates", methods=["GET"])
def apiGetBotUpdates():
    
    response = getBotUpdatesTimestamps()
    
    return response
    
# LOGIN INTEGRATION

@app.route("/glimpse/login", methods=["POST"])
def apiLogin():
    
    body = request.get_json()
    
    response = login(body["email"], body["password"])

    return response

@app.route("/glimpse/getStrategies", methods=["POST"])
def apiGetStrategies():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getStrategies()
    
    return response

@app.route("/glimpse/getRank", methods=["POST"])
def apiGetRank():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getRank()
    
    return response

@app.route("/glimpse/useCode", methods=["POST"])
def apiUseCode():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = useCode(body["code"], body["user"])
    
    return response

@app.route("/glimpse/getUsers", methods=["POST"])
def apiGetUsers():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getUsers()
    
    return response

@app.route("/glimpse/getUserOperations", methods=["POST"])
def apiGetUserOperations():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getUserOperations(body["userId"])
    
    return response

@app.route("/glimpse/getAllOperations", methods=["POST"])
def apiGetAllOperations():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getAllOperations()
    
    return response

@app.route("/glimpse/getServerStatus", methods=["POST"])
def apiGetServerStatus():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getServerStatus()
    
    return response

@app.route("/glimpse/updateServer", methods=["POST"])
def apiUpdateServer():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = updateServer(body)
    
    return response

@app.route("/glimpse/getOperatingServers", methods=["POST"])
def apiGetOperatingServers():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getOperatingServerStatus()
    
    return response

@app.route("/glimpse/insertSignals", methods=["POST"])
def apiInsertSignals():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = insertSignals(body["user"], body["signals"], body["type"])
    
    return response

@app.route("/glimpse/getSignals", methods=["POST"])
def apiGetSignals():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getSignals(body["user"])
    
    return response

@app.route("/glimpse/getAuxiliar", methods={"POST"})
def apiGetAuxiliar():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getAuxiliar()
    
    return response

@app.route("/glimpse/getTestCandles", methods=["POST"])
def apiGetTestCandles():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getTestCandles()
    
    return response
    
@app.route("/glimpse/getTestCandlesAnnually", methods=["POST"])
def apiGetTestCandlesAnnually():
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getTestCandlesAnnually()
    
    return response

@app.route("/glimpse/createStrategy", methods=["POST"])
def apiCreateStrategy():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = createStrategy(body)
    
    return response
    
@app.route("/glimpse/editStrategy", methods=["POST"])
def apiEditStrategy():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = editStrategy(body)
    
    return response

@app.route("/glimpse/managerLogin", methods=["POST"])
def apiManagerLogin():
    
    body = request.get_json()
    
    response = managerLogin(body["email"], body["password"])

    return response

@app.route("/glimpse/getAudit", methods=["POST"])
def apiGetAudit():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getAudit()
    
    return response

@app.route("/glimpse/insertAudit", methods=["POST"])
def apiInsertAudit():
    
    body = request.get_json()
    
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = insertAudit(body)
    
    return response

@app.route("/glimpse/insertQuestion", methods=["POST"])
def apiInsertQuestion():

    body = request.get_json()
        
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = insertQuestion(body)
    
    return response

@app.route("/glimpse/getQuestions", methods=["POST"])
def apiGetQuestion():
    
    body = request.get_json()
        
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getQuestions()
    
    return response

@app.route("/glimpse/getTerms", methods=["POST"])
def apiGetTerms():
    
    body = request.get_json()
        
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getTerms()
    
    return response

@app.route("/glimpse/getRandomNames", methods=["POST"])
def apiGetRandomNames():
    
    body = request.get_json()
        
    if checkKey(body["userKey"]) == False:
        return {
            "res": False
        }
    
    response = getRandomNames()
    
    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port="5000", debug=True)