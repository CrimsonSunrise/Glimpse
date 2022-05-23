import json
import logging
import time
from iqoptionapi.stable_api import IQ_Option
import requests
import asyncio
import pymongo
from datetime import datetime, timedelta, timezone
import certifi

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]

diferenca = timedelta(hours=-3)
fuso_horario = timezone(diferenca)

analysisAccount = db.Auxiliar.find_one({ "name": "analysisAccount" })["value"]
analysisEmail = analysisAccount.split("/")[0]
analysisPassword = analysisAccount.split("/")[1]

Iq = IQ_Option(analysisEmail, analysisPassword)
Iq.connect()

def checkIfOpened(m):
    ActiveSchedule = db.ActivesSchedule.find({})
    cDay = days[datetime.today().weekday()]
    data_e_hora_sao_paulo = datetime.now().astimezone(fuso_horario)
    data_e_hora_sao_paulo_em_texto = data_e_hora_sao_paulo.strftime("%H%M")
    cTime = int(data_e_hora_sao_paulo_em_texto)
    for ativo in ActiveSchedule:
    
        moeda = ativo["ativo"]
        
        if m == moeda:
        
            horarios = ativo[cDay]
            if type(horarios[0]) is list:
                # Múltiplo
                for horario in horarios:
                    if cTime >= horario[0] and cTime <= horario[1]:
                        return True
            else:
                # Único
                if cTime >= horarios[0] and cTime <= horarios[1]:
                    return True
    return False

def carregarAtivos():
    ALL_Asset = Iq.get_all_open_time()
    activesList = []
    d = Iq.get_all_profit()
    for type_name, data in ALL_Asset.items():
        for Asset, value in data.items():
            
            if type_name == "turbo":
                
                if value["open"] == True:
                    if checkIfOpened(Asset) == True:
                        
                        payout = 0
                
                        if type(d[Asset]["turbo"]) is float:
                            payout = "{:.0f}".format(d[Asset]["turbo"] * 100)
                        
                        activesList.append(
                            {
                                "ativo": Asset,
                                "payout": payout,
                                "open": str(value["open"])
                            }
                        )
                    else:
                        activesList.append(
                        {
                            "ativo": Asset,
                            "payout": 0,
                            "open": "False"
                        }
                    )
                else:
                    activesList.append(
                        {
                            "ativo": Asset,
                            "payout": 0,
                            "open": "False"
                        }
                    )
    
    return activesList

if __name__ == "__main__":
    
    async def listarAtivos():
        await asyncio.sleep(1)
        apiAddress = db.Auxiliar.find_one({"name": "apiAddress"})["value"]
        r = requests.post('http://'+apiAddress+':5000/glimpse/updateAtivos', json = json.dumps(carregarAtivos()))
        print(r.text)
    
    while True:
        
        time.sleep(3)
        
        db.ServerStatus.update_one(
            { "name": "Lister" },
            {
                "$set": {
                    "uptime": time.time()
                }
            }
        )
        
        asyncio.run(listarAtivos())