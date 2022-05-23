import time
from bson import ObjectId
import sys
import os
from iqoptionapi.stable_api import IQ_Option
import pymongo

from credentials import analysisEmail, analysisPassword

scriptName = os.path.basename(sys.argv[0]).replace(".py", "")

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

Iq=IQ_Option(analysisEmail,analysisPassword)
iqCon = Iq.connect()
if iqCon:
    print("Connection stabilished for", scriptName)
goal = scriptName
size=60
timeperiod=10
maxdict=15
Iq.start_candles_stream(goal,size,maxdict)

while True:
    time.sleep(1)
    
    activeOpen = db.OpenedActives.find_one({ "ativo": scriptName })["open"]
    
    if activeOpen == "False":
        continue
    
    candles=Iq.get_realtime_candles(goal,size)

    inputs = []
    
    for timestamp in candles:

        inputs.append(
            {
                "o": candles[timestamp]["open"],
                "c": candles[timestamp]["close"]
            }
        )
    
    db.RealtimeCandles.update_one(
        {"ativo": scriptName},
        {
            "$set": {
                "candles": inputs,
                "lastUpdated": time.time()
            }
        }
    )
    
    db.ServerStatus.update_one(
        { "name": "Realtime Candles" },
        {
            "$set": {
                "uptime": time.time()
            }
        }
    )
    
Iq.stop_candles_stream(goal,size)