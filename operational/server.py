from datetime import datetime
import json
import os
from iqoptionapi.stable_api import IQ_Option
import requests
from sequenceFinder import find
import sys
import time
import asyncio
from typing import Sequence
import pymongo
from multiprocessing import Pool
import random
from bson import json_util, ObjectId
import certifi
from pytz import timezone

botName = os.path.basename(sys.argv[0]).replace(".py", "")

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client.Glimpse

apiAddress = db.Auxiliar.find_one({"name": "apiAddress"})["value"]

winNaSessao = 0
lossNaSessao = 0

def botCycle():
		
	while True:
		time.sleep(4)
		
		# Update UpTime
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"uptime": time.time()
				}
			}
		)
		
		server = db.Servers.find_one({"name": botName})
		cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
		print(cTime, "Checking...")
		
		# Checar se existe target (usuário) para processar
		if server["status"] == "assigned":
			
			target = server["target"]
			
			#print(target)
			
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "operating"
					}
				}
			)
			
			# Checar estratégias para o target
			prepareGlimpse(target)

def prepareGlimpse(target):
	
	global winNaSessao
	winNaSessao = 0
	global lossNaSessao
	lossNaSessao = 0
	
	user = db.Accounts.find_one({ "_id": ObjectId(target) })
	
	userData = {
		"id": target,
		"userName": user["name"],
		"userEmail": user["email"],
		"iqEmail": user["iqEmail"],
		"iqPassword": user["iqPassword"],
		"mode": user["mode"],
		"strategy": user["strategy"],
		"sequence": db.Strategies.find_one({ "name": user["strategy"] })["sequence"],
		"author": db.Strategies.find_one({ "name": user["strategy"] })["createdBy"],
		"mirror": db.Strategies.find_one({ "name": user["strategy"] })["mirror"],
		"operation": db.Strategies.find_one({ "name": user["strategy"] })["operation"],
		"preferedActives": user["preferedActives"],
		"accountType": user["iqAccountType"],
		"preferedPayout": int(user["preferedPayout"].split(" ")[1]),
		"payoutType": user["preferedPayout"].split(" ")[0],
		"signalSettings": user["signalSettings"],
		"strategySettings": user["strategySettings"],
		"settings": user["settings"]
	}
	
	if userData["mode"] == "signals":
		print("Checking for Signals")
		signals = db.Sinais.find_one({ "user": "612a4727b9d5ecdabec988a4" })["signals"]
		if len(signals) > 0:
			checkSignals(target, userData, signals)
		else:
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "waiting",
						"target": ""
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"glimpseStatus": "off",
						"iqSessionProfit": 0
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$push": {
						"alerts": {
							"title": "Lista de sinais vazia.",
							"description" : "Não foi possível operar pois sua lista de sinais está vazia.",
							"time": str(time.time()),
							"read": False,
							"shown": False,
							"type": "danger"
						}
					}
				}
			)
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			# Iq.logout()
			print(cTime, "Lista vazia...")
	
	if userData["mode"] == "strategy":
		checkMatches(target, userData)
		print("Estratégias")
	
	if userData["mode"] == "copy":
		print("Copy")
	
def StopLoss(userData, Iq):
	# Parar por stopLoss
	db.Servers.update_one(
		{"name": botName},
		{
			"$set": {
				"status": "waiting",
				"target": ""
			}
		}
	)
	
	db.Accounts.update_one(
		{"_id": ObjectId(userData["id"])},
		{
			"$set": {
				"glimpseStatus": "off",
				"iqSessionProfit": 0
			}
		}
	)
	
	if userData["settings"]["alerts"]["useAlerts"] == True:
		if userData["settings"]["alerts"]["stopLossReached"] == True:
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$push": {
						"alerts": {
							"title": "Stop Loss.",
							"description" : "Glimpse não está mais operando pois sua última operação resultou em Stop Loss.",
							"time": str(time.time()),
							"read": False,
							"shown": False,
							"type": "danger"
						}
					}
				}
			)
	
	cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
	Iq.logout()
	print(cTime, "Stop Loss...")

def StopWin(userData, Iq):
	# Parar por stopWin
	db.Servers.update_one(
		{"name": botName},
		{
			"$set": {
				"status": "waiting",
				"target": ""
			}
		}
	)
	
	db.Accounts.update_one(
		{"_id": ObjectId(userData["id"])},
		{
			"$set": {
				"glimpseStatus": "off",
				"iqSessionProfit": 0
			}
		}
	)
	
	if userData["settings"]["alerts"]["useAlerts"] == True:
		if userData["settings"]["alerts"]["stopWinReached"] == True:
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$push": {
						"alerts": {
							"title": "Stop Win.",
							"description" : "Glimpse não está mais operando pois sua última operação resultou em Stop Win.",
							"time": str(time.time()),
							"read": False,
							"shown": False,
							"type": "danger"
						}
					}
				}
			)
	
	cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
	Iq.logout()
	print(cTime, "Stop Win...")

def checkSignals(target, userData, signals):
	
	Iq = IQ_Option(userData["iqEmail"], userData["iqPassword"])
	IqCon = Iq.connect()  # connect to iqoption
		
	if IqCon[0] == False:
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$push": {
					"alerts": {
						"title": "Erro ao conectar.",
						"description" : "Houve um erro ao conectar à sua conta Iq Option. Revise seus dados e tente novamente.",
						"time": str(time.time()),
						"read": False,
						"shown": False,
						"type": "danger"
					}
				}
			}
		)
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$set": {
					"iqPassword": "",
					"glimpseStatus": "off"
				}
			}
		)
		
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"status": "waiting",
					"target": ""
				}
			}
		)
		
		Iq.logout()
		
		return
	
	if userData["preferedActives"] != "todos":
		userData["preferedActives"] = userData["preferedActives"].split(",")
	
	if userData["accountType"] == "treinamento":
		userData["accountType"] = "PRACTICE"
	elif userData["accountType"] == "real":
		userData["accountType"] = "REAL"
	
	Iq.change_balance(userData["accountType"])
	
	keepOperating = True
	
	db.Accounts.update_one(
		{"_id": ObjectId(userData["id"])},
		{
			"$set": {
				"glimpseStatus": "operating",
			}
		}
	)
	
	if userData["settings"]["alerts"]["useAlerts"] == True:
		if userData["settings"]["alerts"]["glimpseStart"] == True:
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$push": {
						"alerts": {
							"title": "Glimpse Iniciou.",
							"description" : "Glimpse começou a operar na sua conta.",
							"time": str(time.time()),
							"read": False,
							"shown": False,
							"type": "info"
						}
					}
				}
			)
				
	sessionBalance = 0
	
	lastActive = None
	
	money = userData["signalSettings"]["money"]
	sobra = userData["signalSettings"]["sobra"]
	gale = userData["signalSettings"]["gale"]
	galeCount = userData["signalSettings"]["galeCount"]
	galeType = userData["signalSettings"]["galeType"]
	
	jLog = {
		"operationTime": time.time(),
		"user": target,
		"operationType": "signals",
		"accountType": userData["accountType"],
		"expiration": 1,
		"money": money,
		"sobra": sobra,
		"gale": gale,
		"galeCount": galeCount,
		"galeType": galeType,
		"operations": [],
	}
	
	jLog_id = db.Operations.insert_one(jLog).inserted_id
	
	monthProfit = db.Accounts.find_one({ "_id": ObjectId(target) })["iqPeriodProfit"]
	
	while keepOperating:
		# Atualizar uptime
		
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"uptime": time.time()
				}
			}
		)
		
		operating = db.Accounts.find_one({ "_id": ObjectId(target) })["glimpseStatus"]
		if operating != "operating":
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "waiting",
						"target": ""
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"glimpseStatus": "off",
						"iqSessionProfit": 0
					}
				}
			)
			
			if userData["settings"]["alerts"]["useAlerts"] == True:
				if userData["settings"]["alerts"]["glimpseStop"] == True:
					db.Accounts.update_one(
						{"_id": ObjectId(userData["id"])},
						{
							"$push": {
								"alerts": {
									"title": "Glimpse parou.",
									"description" : "Glimpse não está mais operando na sua conta.",
									"time": str(time.time()),
									"read": False,
									"shown": False,
									"type": "info"
								}
							}
						}
					)
			
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			print(cTime, "User turned off Glimpse...")
			
			keepOperating = False
			
			Iq.logout()
			
			return
		
		# /////
		
		matches = None
		
		t = datetime.now()
		sec = int(t.strftime("%S"))
		
		if sec >= 50:
			r = requests.post('http://'+apiAddress+':5000/glimpse/ativos', json = { "type": "compact" } )
			r = json.loads(r.text)
			
			spTime = int(datetime.now(timezone('America/Sao_Paulo')).strftime('%H%M'))
			
			openedActives = []
			openedWithPayout = []
			
			selectedActives = userData["preferedActives"]
			
			if selectedActives != "todos":
				for a in r:
					if a["ativo"] in selectedActives:
						openedActives.append(a["ativo"])
						openedWithPayout.append({
							a["ativo"]: a["payout"]
						})
			else:
				for a in r:
					openedActives.append(a["ativo"])
					openedWithPayout.append({
						a["ativo"]: a["payout"]
					})
			
			for signal in signals:
				signalTime = int(signal["hora"].replace(":", ""))
				
				# Checa se deu o horário do sinal
				if spTime == signalTime:
					
					signalAtivo = signal["ativo"].upper()
					signalStatus = signal["status"]
					signalOperacao = signal["operacao"]
					ativoPayout = 0
					for i in range(len(openedActives)):
						if signalAtivo == openedActives[i]:
							ativoPayout = openedWithPayout[i][signalAtivo]
					
					# Checa se o sinal está habilitado, se está na lista de ativos abertos e lista de ativos selecionados pelo usuário
					if signalStatus == "active" and signalAtivo in openedActives:
						
						# Se payout do ativo do sinal é igual ao configurado na conta
						if userData["payoutType"] == "=" and ativoPayout == userData["preferedPayout"]:
							operarSinal(signalAtivo, signalOperacao, money, gale, galeCount, galeType, sobra, ativoPayout, Iq, userData, jLog_id, signalTime)
							#print("Igual")
						# Se payout do ativo do sinal é maior que o configurado na conta
						elif userData["payoutType"] == ">" and ativoPayout > userData["preferedPayout"]:
							operarSinal(signalAtivo, signalOperacao, money, gale, galeCount, galeType, sobra, ativoPayout, Iq, userData, jLog_id, signalTime)
							#print("maior")
		
		time.sleep(1)

def updateSignal(user, ativo, hora, resultado, status):
	signals = db.Sinais.find_one({ "user": "612a4727b9d5ecdabec988a4" })["signals"]
	
	
	for signal in signals:
		if signal["hora"].replace(":", "") == str(hora) and signal["ativo"].lower() == ativo.lower():
			signal["status"] = status
			signal["resultado"] = resultado
	
	db.Sinais.update_one(
		{"user": user},
		{
			"$set": {
				"signals": signals
			}
		}
	)

def operarSinal(ativo, operacao, money, gale, galeCount, galeType, sobra, payout, Iq, userData, jLog_id, signalTime):
	
	global winNaSessao
	global lossNaSessao
	
	if userData["settings"]["glimpse"]["operationPriority"] == "gale":
		if userData["signalSettings"]["stopLoss"] == True:
			stopLossValue = userData["signalSettings"]["stopLossValue"]
			if lossNaSessao * -1 >= stopLossValue:
				StopLoss(userData, Iq)
				Iq.logout()
				keepOperating = False
	
	if userData["settings"]["glimpse"]["operationPriority"] == "gale":
		if userData["signalSettings"]["stopWin"] == True:
			stopWinValue = userData["signalSettings"]["stopWinValue"]
			if winNaSessao >= stopWinValue:
				StopWin(userData, Iq)
				Iq.logout()
				keepOperating = False
	
	if gale:
		
		if galeType == "dobro":
			
			entradas = [money]
			for i in range(galeCount):
				entradas.append( entradas[i] * 2 )
			
			operarGale(ativo, operacao, 1, entradas, galeCount, payout, userData, Iq, jLog_id, signalTime)
				
		elif galeType == "cobrir":
			
			entradas = [money]
			for x in range(galeCount):
				attemptsSum = sum(entradas)
				nextBet = (attemptsSum) / (payout / 100)
				nextBet = float("{:.2f}".format(nextBet))
				entradas.append(nextBet)
			
			operarGale(ativo, operacao, 1, entradas, galeCount, payout, userData, Iq, jLog_id, signalTime)
				
		elif galeType == "sobra":
			entradas = [money]
			for x in range(galeCount):
				attemptsSum = sum(entradas)
				nextBet = (attemptsSum + sobra) / (payout / 100)
				nextBet = float("{:.2f}".format(nextBet))
				entradas.append(nextBet)
			
			operarGale(ativo, operacao, 1, entradas, galeCount, payout, userData, Iq, jLog_id, signalTime)
		
	else:
		
		periodLoss = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodLoss"]
		periodProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodProfit"]
		sessionProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqSessionProfit"]
		
		activeAtualPrice = db.RealtimeCandles.find_one({ "ativo": ativo })["candles"][14]["c"]
		
		check, id = Iq.buy(money, ativo, operacao, 1)
		
		print("Check/id:", check, ", ", id)
		
		operationCicle = {
			"ativo": ativo,
			"horario": time.time(),
			"operacao": operacao,
			"money": money,
			"candles": [],
			"operacoes": []
		}
		
		tries = [{
			"start": str(time.time()),
			"result": ""
		}]
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$set": {
					"operating": {
						"operating": True,
						"active": ativo,
						"money": money,
						"operacao": operacao,
						"tries": tries
					}
				}
			}
		)
		
		# Não conseguiu comprar. Provavelmente porque o ativo fechou.
		if check == False or check == None:
			currentResult = "Falha"

			totalLoss = money
			
			newPeriodLoss = periodLoss + totalLoss
			
			operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": ativo })["candles"])
			operationCicle["operacoes"].append({
				"a": activeAtualPrice,
				"p": "CLO: " + str(totalLoss)
			})
			
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "waiting",
						"target": ""
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"glimpseStatus": "off",
						"iqSessionProfit": 0,
					}
				}
			)
			
			if userData["settings"]["alerts"]["useAlerts"] == True:
				if userData["settings"]["alerts"]["activeClose"] == True:
					db.Accounts.update_one(
						{"_id": ObjectId(userData["id"])},
						{
							"$push": {
								"alerts": {
									"title": "Ativo fechado.",
									"description" : "Glimpse parou de operar pois o ativo fechou durante as operações.",
									"time": str(time.time()),
									"read": False,
									"shown": False,
									"type": "danger"
								}
							}
						}
					)
			
			db.Operations.update_one(
				{"_id": ObjectId(jLog_id)},
				{
					"$push": {
						"operations": operationCicle
					}
				}
			)
			
			Iq.logout()
			
			keepOperating = False
			
			return
		
		buyingId = id
		
		operationCashResult = None
		if Iq.check_win_v3(buyingId):
			operationCashResult = Iq.check_win_v3(buyingId)[1]
			print("Result:", operationCashResult)
		else:
			print("Algo deu errado...")
		
		operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": ativo })["candles"])
		operationCicle["operacoes"].append({
			"a": activeAtualPrice,
			"p": operationCashResult
		})
		
		# Se o resultado da operação anterior foi Loss ou Dojy
		if operationCashResult <= 0:
			print("loss", operationCashResult)
			# LOSS ou Dojy
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			#sessionBalance += operationCashResult
			if operationCashResult == 0:
				print("Doji")
				# Não adiciona +1 no index de próximo valor pois não foi perdido completamente. Ao invés, continua com o mesmo index.
				currentResult = "Dojy"
				updateSignal(userData["id"], ativo, signalTime, "doji", "result")
				reconnect(Iq)
			else:
				lossNaSessao += operationCashResult
				print(cTime, "Loss", userData["userName"])
				# Adiciona +1 no index de próximo valor para poder cobrir os loss anteriores.
				print("Loss")
				currentResult = "Loss"
				db.Accounts.update_one(
					{"_id": ObjectId(userData["id"])},
					{
						"$set": {
							"iqPeriodLoss": periodLoss - operationCashResult,
							"operating": {
								"operating": False,
								"active": "",
								"money": 0,
								"operacao": "",
								"tries": []
							}
						}
					}
				)
				
				updateSignal(userData["id"], ativo, signalTime, "loss", "result")
				
				if userData["settings"]["glimpse"]["operationPriority"] == "stop":
					if userData["signalSettings"]["stopLoss"] == True:
						stopLossValue = userData["signalSettings"]["stopLossValue"]
						if lossNaSessao * -1 >= stopLossValue:
							StopLoss(userData, Iq)
							keepOperating = False
				
				reconnect(Iq)
			
		# Se o resultado da operação anterior foi Win
		else:
			winNaSessao += operationCashResult
			print("win", operationCashResult)
			currentResult = "Win"
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			print(cTime, "Session profit:", operationCashResult)
			
			sessionBalance = sessionProfit + operationCashResult
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"iqSessionProfit": sessionBalance,
						"iqPeriodProfit": periodProfit + operationCashResult,
						"operating": {
							"operating": False,
							"active": "",
							"money": 0,
							"operacao": "",
							"tries": []
						}
					}
				}
			)
			
			# Update jLog
			db.Operations.update_one(
				{"_id": ObjectId(jLog_id)},
				{
					"$push": {
						"operations": operationCicle
					}
				}
			)
			
			updateSignal(userData["id"], ativo, signalTime, "win", "result")
			
			if userData["settings"]["glimpse"]["operationPriority"] == "stop":
				if userData["signalSettings"]["stopWin"] == True:
					stopWinValue = userData["signalSettings"]["stopWinValue"]
					if winNaSessao >= stopWinValue:
						StopWin(userData, Iq)
						keepOperating = False
			
			reconnect(Iq)
	
	print("Operando sinal...")

def operarGale(ativo, operacao, expiracao, entradas, stopLoss, payout, userData, Iq, jLog_id, signalTime):
	
	global winNaSessao
	global lossNaSessao
	
	print(entradas, "stopLoss:", stopLoss)
	periodLoss = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodLoss"]
	periodProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodProfit"]
	sessionProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqSessionProfit"]
	cicleProfit = 0
	attemptsDone = 0
	losses = 0
	attempts = []
	
	attempts = entradas
	
	currentDateTime = time.time()

	currentResult = None
	
	operationCicle = {
		"ativo": ativo,
		"horario": time.time(),
		"operacao": operacao,
		"money": attempts[0],
		"candles": [],
		"operacoes": []
	}
	
	tries = []
					
	for att in attempts:
		tries.append({
			"start": 0,
			"result": ""
		})
	
	while currentResult == None or currentResult == "Loss" or currentResult == "Dojy":
		
		# Atualizar uptime
		reconnect(Iq)
		
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"uptime": time.time()
				}
			}
		)
		
		if userData["settings"]["glimpse"]["operationPriority"] == "gale":
			if userData["signalSettings"]["stopLoss"] == True:
				stopLossValue = userData["signalSettings"]["stopLossValue"]
				if lossNaSessao * -1 >= stopLossValue:
					StopLoss(userData, Iq)
					Iq.logout()
					keepOperating = False
		
		if userData["settings"]["glimpse"]["operationPriority"] == "gale":
			if userData["signalSettings"]["stopWin"] == True:
				stopWinValue = userData["signalSettings"]["stopWinValue"]
				if winNaSessao >= stopWinValue:
					StopWin(userData, Iq)
					Iq.logout()
					keepOperating = False
		
		# Se o número de loss for igual ou maios o stopLoss
		if losses == len(attempts):
			currentResult = "Stoploss"
			print("Loss")
			operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": ativo })["candles"])
			operationCicle["operacoes"].append({
				"a": activeAtualPrice,
				"p": "SLR: " + str(sum(attempts))
			})
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			
			newPeriodLoss = periodLoss + (sum(attempts))
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"iqPeriodLoss": newPeriodLoss,
						"operating": {
							"operating": False,
							"active": "",
							"money": 0,
							"operacao": "",
							"tries": []
						}
					}
				}
			)
			
			db.Operations.update_one(
				{"_id": ObjectId(jLog_id)},
				{
					"$push": {
						"operations": operationCicle
					}
				}
			)
			
			if signalTime != "":
				updateSignal(userData["id"], ativo, signalTime, "loss", "result")
			
			checkUser = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })
			
			if checkUser["glimpseStatus"] != "operating":
				db.Servers.update_one(
					{"name": botName},
					{
						"$set": {
							"status": "waiting",
							"target": ""
						}
					}
				)
				
				db.Accounts.update_one(
					{"_id": ObjectId(userData["id"])},
					{
						"$set": {
							"glimpseStatus": "off",
							"iqSessionProfit": 0
						}
					}
				)
				
				if userData["settings"]["alerts"]["useAlerts"] == True:
					if userData["settings"]["alerts"]["glimpseStop"] == True:
						db.Accounts.update_one(
							{"_id": ObjectId(userData["id"])},
							{
								"$push": {
									"alerts": {
										"title": "Glimpse Parou.",
										"description" : "Glimpse não está mais operando na sua conta.",
										"time": str(time.time()),
										"read": False,
										"shown": False,
										"type": "info"
									}
								}
							}
						)
				
				Iq.logout()
				
				keepOperating = False
			else:
				cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
				print(cTime, "Parando por stopLoss")
			
			break
		
		activeAtualPrice = db.RealtimeCandles.find_one({ "ativo": ativo })["candles"][14]["c"]
		print("Preço atual", activeAtualPrice)
		
		check, id = Iq.buy(attempts[losses], ativo, operacao, expiracao)
		
		tries[losses]["start"] = str(time.time())
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$set": {
					"operating": {
						"operating": True,
						"active": ativo,
						"money": attempts[0],
						"operacao": operacao,
						"tries": tries
					}
				}
			}
		)
		
		print("Check/id:", check, ", ", id)
		
		# Não conseguiu comprar. Provavelmente porque o ativo fechou.
		if check == False or check == None:
			currentResult = "Falha"
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			print(cTime, "Falha", userData["userName"])
			sumLoss = []
			for x in range(losses):
				sumLoss.append(attempts[x])

			totalLoss = sum(sumLoss)
			
			newPeriodLoss = periodLoss + totalLoss
			
			operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": ativo })["candles"])
			operationCicle["operacoes"].append({
				"a": activeAtualPrice,
				"p": "CLO: " + str(totalLoss)
			})
			
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "waiting",
						"target": ""
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"glimpseStatus": "off",
						"iqSessionProfit": 0,
						"iqPeriodLoss": newPeriodLoss
					}
				}
			)
			
			if userData["settings"]["alerts"]["useAlerts"] == True:
				if userData["settings"]["alerts"]["activeClose"] == True:
					db.Accounts.update_one(
						{"_id": ObjectId(userData["id"])},
						{
							"$push": {
								"alerts": {
									"title": "Ativo fechado.",
									"description" : "Glimpse parou de operar pois o ativo fechou durante as operações.",
									"time": str(time.time()),
									"read": False,
									"shown": False,
									"type": "danger"
								}
							}
						}
					)
			
			# # Update jLog
			db.Operations.update_one(
				{"_id": ObjectId(jLog_id)},
				{
					"$push": {
						"operations": operationCicle
					}
				}
			)
			
			Iq.logout()
			
			keepOperating = False
			
			return
		
		# Pegar o valor do ativo atual
		
		operationCashResult = None
		if Iq.check_win_v3(id):
			operationCashResult = Iq.check_win_v3(id)[1]
			cicleProfit = cicleProfit + operationCashResult
			print("Result:", operationCashResult)
		else:
			print("Algo deu errado...")
		
		# Se o resultado da operação anterior foi Loss ou Dojy
		if operationCashResult <= 0:
			print("loss", operationCashResult)
			# LOSS ou Dojy
			operationCicle["operacoes"].append({
				"a": activeAtualPrice,
				"p": operationCashResult
			})
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			if operationCashResult == 0:
				print(cTime, str(attempts[losses]) + " - Dojy")
				# Não adiciona +1 no index de próximo valor pois não foi perdido completamente. Ao invés, continua com o mesmo index.
				currentResult = "Dojy"
				reconnect(Iq)
			else:
				lossNaSessao += operationCashResult
				print(cTime, "Loss", userData["userName"])
				# Adiciona +1 no index de próximo valor para poder cobrir os loss anteriores.
				attemptsDone += 1
				losses += 1
				currentResult = "Loss"
				
				if userData["settings"]["glimpse"]["operationPriority"] == "stop":
					if userData["signalSettings"]["stopLoss"] == True:
						stopLossValue = userData["signalSettings"]["stopLossValue"]
						if lossNaSessao * -1 >= stopLossValue:
							StopLoss(userData, Iq)
							Iq.logout()
							keepOperating = False
				
				reconnect(Iq)
			
		# Se o resultado da operação anterior foi Win
		else:
			winNaSessao += operationCashResult
			print("win", operationCashResult)
			currentResult = "Win"
			# Acaba o loop de tentativas registrando os valores
			operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": ativo })["candles"])
			operationCicle["operacoes"].append({
				"a": activeAtualPrice,
				"p": operationCashResult
			})
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			sessionProfit = sessionProfit + cicleProfit
			periodProfit = periodProfit + cicleProfit
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"iqSessionProfit": sessionProfit,
						"iqPeriodProfit": periodProfit,
						"operating": {
							"operating": False,
							"active": ativo,
							"money": 0,
							"operacao": "",
							"tries": []
						}
					}
				}
			)
			
			# Update jLog
			db.Operations.update_one(
				{"_id": ObjectId(jLog_id)},
				{
					"$push": {
						"operations": operationCicle
					}
				}
			)

			if signalTime != "":
				updateSignal(userData["id"], ativo, signalTime, "win", "result")
			
			checkUser = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })
			
			if checkUser["glimpseStatus"] != "operating":
				db.Servers.update_one(
					{"name": botName},
					{
						"$set": {
							"status": "waiting",
							"target": ""
						}
					}
				)
				
				db.Accounts.update_one(
					{"_id": ObjectId(userData["id"])},
					{
						"$set": {
							"glimpseStatus": "off",
							"iqSessionProfit": 0,
						}
					}
				)
				
				Iq.logout()
				
				keepOperating = False
			
			if userData["settings"]["glimpse"]["operationPriority"] == "stop":
				if userData["signalSettings"]["stopWin"] == True:
					stopWinValue = userData["signalSettings"]["stopWinValue"]
					if winNaSessao >= stopWinValue:
						StopWin(userData, Iq)
						Iq.logout()
						keepOperating = False
			
			else:
				# Buscar próxima entrada baseada na estratégia do usuário
				cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
				print(cTime, "Aguardando a próxima entrada")
				
			reconnect(Iq)
			
			break

def checkMatches(target, userData):
	
	global winNaSessao
	global lossNaSessao
	
	Iq = IQ_Option(userData["iqEmail"], userData["iqPassword"])
	IqCon = Iq.connect()  # connect to iqoption
	
	if IqCon[0] == False:
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$push": {
					"alerts": {
						"title": "Erro ao conectar.",
						"description" : "Houve um erro ao conectar à sua conta Iq Option. Revise seus dados e tente novamente.",
						"time": str(time.time()),
						"read": False,
						"shown": False,
						"type": "danger"
					}
				}
			}
		)
		
		db.Accounts.update_one(
			{"_id": ObjectId(userData["id"])},
			{
				"$set": {
					"iqPassword": "",
					"glimpseStatus": "off"
				}
			}
		)
		
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"status": "waiting",
					"target": ""
				}
			}
		)
		
		Iq.logout()
		
		return
	
	if userData["preferedActives"] != "todos":
		userData["preferedActives"] = userData["preferedActives"].split(",")
	
	if userData["accountType"] == "treinamento":
		userData["accountType"] = "PRACTICE"
	elif userData["accountType"] == "real":
		userData["accountType"] = "REAL"
	
	Iq.change_balance(userData["accountType"])
	
	keepOperating = True
	
	db.Accounts.update_one(
		{"_id": ObjectId(userData["id"])},
		{
			"$set": {
				"glimpseStatus": "operating"
			}
		}
	)
	
	if userData["settings"]["alerts"]["useAlerts"] == True:
		if userData["settings"]["alerts"]["glimpseStart"] == True:
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$push": {
						"alerts": {
							"title": "Glimpse Iniciou.",
							"description" : "Glimpse começou a operar na sua conta.",
							"time": str(time.time()),
							"read": False,
							"shown": False,
							"type": "info"
						}
					}
				}
			)
				
	sessionBalance = 0
	
	lastActive = None
	
	jLog = {
		"operationTime": time.time(),
		"user": target,
		"operationType": "strategy",
		"strategy": userData["strategy"],
		"accountType": userData["accountType"],
		"expiration": 1,
		"money": 2,
		"sobra": 1,
		"operation": userData["operation"],
		"stoploss": 8,
		"operations": [],
	}
	
	jLog_id = db.Operations.insert_one(jLog).inserted_id
	
	monthProfit = db.Accounts.find_one({ "_id": ObjectId(target) })["iqPeriodProfit"]
	
	while keepOperating:
		
		# Atualizar uptime
		
		db.Servers.update_one(
			{"name": botName},
			{
				"$set": {
					"uptime": time.time()
				}
			}
		)
		
		if userData["settings"]["glimpse"]["operationPriority"] == "gale":
			if userData["signalSettings"]["stopLoss"] == True:
				stopLossValue = userData["signalSettings"]["stopLossValue"]
				if lossNaSessao * -1 >= stopLossValue:
					StopLoss(userData, Iq)
					Iq.logout()
					keepOperating = False
		
		if userData["settings"]["glimpse"]["operationPriority"] == "gale":
			if userData["signalSettings"]["stopWin"] == True:
				stopWinValue = userData["signalSettings"]["stopWinValue"]
				if winNaSessao >= stopWinValue:
					StopWin(userData, Iq)
					Iq.logout()
					keepOperating = False
		
		# Checar se o usuário anda está operando
		
		operating = db.Accounts.find_one({ "_id": ObjectId(target) })["glimpseStatus"]
		if operating != "operating":
			db.Servers.update_one(
				{"name": botName},
				{
					"$set": {
						"status": "waiting",
						"target": ""
					}
				}
			)
			
			db.Accounts.update_one(
				{"_id": ObjectId(userData["id"])},
				{
					"$set": {
						"glimpseStatus": "off",
						"iqSessionProfit": 0,
						"operating": {
							"operating": False,
							"active": "",
							"money": "",
							"operacao": "",
							"tries": []
						}
					}
				}
			)
			
			if userData["settings"]["alerts"]["useAlerts"] == True:
					if userData["settings"]["alerts"]["glimpseStop"] == True:
						db.Accounts.update_one(
							{"_id": ObjectId(userData["id"])},
							{
								"$push": {
									"alerts": {
										"title": "Glimpse parou.",
										"description" : "Glimpse não está mais operando na sua conta.",
										"time": str(time.time()),
										"read": False,
										"shown": False,
										"type": "info"
									}
								}
							}
						)
			
			# Pode verificar se houve operação antes de inserir
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			print(cTime, "User turned off Glimpse...")
			
			keepOperating = False
			
			Iq.logout()
			
			return
		
		# /////
		
		periodLoss = db.Accounts.find_one({ "_id": ObjectId(target) })["iqPeriodLoss"]
		
		t = datetime.now()
		sec = int(t.strftime("%S"))
		
		matches = None
		newOperation = ""
		
		if sec >= 50:
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			nMatches = find(userData["sequence"], userData["mirror"], userData["operation"], apiAddress)
			print(nMatches)
			if nMatches:
				matches = nMatches["matches"]
		
		def matchesName(n):
			return n[0]
		
		if matches:
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			encontrados = []
		
			r = requests.post('http://'+apiAddress+':5000/glimpse/ativos', json = { "type": "full" } )
			ativos = json.loads(r.text)
			for ativo in ativos:
				# Se o ativo aberto se encontra na lista de ativos que dão match na estratégia do usuário em tempo real
				if ativo["ativo"] in map(matchesName, (matches)):
					decision = ""
					for i in matches:
						if i[0] == ativo["ativo"].upper():
							decision = i[1]
					# Se ativo está aberto
					if ativo["open"] == 'True':
						
						# SE o usuário prefere todos os ativos
						if userData["preferedActives"] == "todos":
							
							# Se payout preferido é igual
							if userData["payoutType"] == "=":
								
								if int(ativo["payout"]) == userData["preferedPayout"]:
									encontrados.append([ativo["ativo"], ativo["payout"], decision])
							
							# Se payout preferido é maior que
							elif userData["payoutType"] == ">":
								
								if int(ativo["payout"]) >= userData["preferedPayout"]:
									encontrados.append([ativo["ativo"], ativo["payout"], decision])
						
						# SE o usuário prefere ativos específicos
						elif ativo["ativo"] in userData["preferedActives"]:
							
							# Se payout preferido é igual
							if userData["payoutType"] == "=":
								
								if int(ativo["payout"]) == userData["preferedPayout"]:
									#print(ativo["ativo"], "IGUAL")
									encontrados.append([ativo["ativo"], ativo["payout"], decision])
							
							# Se payout preferido é maior que
							elif userData["payoutType"] == ">":
								
								if int(ativo["payout"]) >= userData["preferedPayout"]:
									encontrados.append([ativo["ativo"], ativo["payout"], decision])
			
			cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
			
			# Remover a última Win dos encontrados
			if sec > 50:
				print(encontrados)
				
			if sec <= 57:
				encontrados = []
			
			if len(encontrados) > 0:
				# OPERAR
				operation = {
					"ativo": encontrados[0][0],
					"payout": int(encontrados[0][1]),
					"expiracao": 1,
					"money": userData["strategySettings"]["money"],
					"sobra": userData["strategySettings"]["sobra"],
					"stopLoss": 8,
					"gale": userData["strategySettings"]["gale"],
					"galeCount": userData["strategySettings"]["galeCount"],
					"galeType": userData["strategySettings"]["galeType"],
					#"operacao": userData["operation"],
					"operacao": encontrados[0][2]
				}
				
				if userData["author"] == "Glimpse":
					operation["money"] = 2
					operation["sobra"] = 1
					operation["gale"] = True
					operation["galeCount"] = 1
					operation["galeType"] = "sobra"
				
				cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
				
				attemptsDone = 0
				losses = 0
				
				currentDateTime = time.time()
				
				if operation["gale"]:
		
					if operation["galeType"] == "dobro":
						
						entradas = [operation["money"]]
						for i in range(operation["galeCount"]):
							entradas.append( entradas[i] * 2 )
						
						operarGale(operation["ativo"], operation["operacao"], 1, entradas, operation["galeCount"], operation["payout"], userData, Iq, jLog_id, "")
				
					elif operation["galeType"] == "cobrir":
						
						entradas = [operation["money"]]
						for x in range(operation["galeCount"]):
							attemptsSum = sum(entradas)
							nextBet = (attemptsSum) / (operation["payout"] / 100)
							nextBet = float("{:.2f}".format(nextBet))
							entradas.append(nextBet)
						
						operarGale(operation["ativo"], operation["operacao"], 1, entradas, operation["galeCount"], operation["payout"], userData, Iq, jLog_id, "")
							
					elif operation["galeType"] == "sobra":
						entradas = [operation["money"]]
						for x in range(operation["galeCount"]):
							attemptsSum = sum(entradas)
							nextBet = (attemptsSum + operation["sobra"]) / (operation["payout"] / 100)
							nextBet = float("{:.2f}".format(nextBet))
							entradas.append(nextBet)
						
						operarGale(operation["ativo"], operation["operacao"], 1, entradas, operation["galeCount"], operation["payout"], userData, Iq, jLog_id, "")
				else:
					currentResult = None
					
					periodLoss = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodLoss"]
					periodProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqPeriodProfit"]
					sessionProfit = db.Accounts.find_one({ "_id": ObjectId(userData["id"]) })["iqSessionProfit"]
					
					operationCicle = {
						"ativo": operation["ativo"],
						"horario": time.time(),
						"operacao": operation["operacao"],
						"money": operation["money"],
						"candles": [],
						"operacoes": []
					}
					
					attempts = []
					attempts.append(int(operation["money"]))	
					# Atualizar uptime
					
					db.Servers.update_one(
						{"name": botName},
						{
							"$set": {
								"uptime": time.time()
							}
						}
					)
					
					tries = []
					
					for att in attempts:
						tries.append({
							"start": 0,
							"result": ""
						})
					
					activeAtualPrice = db.RealtimeCandles.find_one({ "ativo": operation["ativo"] })["candles"][14]["c"]
					print("Preço atual", activeAtualPrice)
					
					check, id = Iq.buy(attempts[attemptsDone], operation["ativo"], operation["operacao"], operation["expiracao"])
					
					print("Check/id:", check, ", ", id)
					
					# Não conseguiu comprar. Provavelmente porque o ativo fechou.
					if check == False or check == None:
						currentResult = "Falha"
						print(cTime, "Falha", userData["userName"])
						sumLoss = []
						for x in range(losses):
							sumLoss.append(attempts[x])

						totalLoss = sum(sumLoss)
						
						newPeriodLoss = periodLoss + totalLoss
						
						operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": operation["ativo"] })["candles"])
						operationCicle["operacoes"].append({
							"a": activeAtualPrice,
							"p": "CLO: " + str(totalLoss)
						})
						
						db.Servers.update_one(
							{"name": botName},
							{
								"$set": {
									"status": "waiting",
									"target": ""
								}
							}
						)
						
						db.Accounts.update_one(
							{"_id": ObjectId(userData["id"])},
							{
								"$set": {
									"glimpseStatus": "off",
									"iqSessionProfit": 0,
									"iqPeriodLoss": newPeriodLoss,
									"operating": {
										"operating": False,
										"active": "",
										"money": "",
										"operacao": "",
										"tries": []
									}
								}
							}
						)
						
						if userData["settings"]["alerts"]["useAlerts"] == True:
							if userData["settings"]["alerts"]["activeClose"] == True:
								db.Accounts.update_one(
									{"_id": ObjectId(userData["id"])},
									{
										"$push": {
											"alerts": {
												"title": "Ativo fechado.",
												"description" : "Glimpse parou de operar pois o ativo fechou durante as operações.",
												"time": str(time.time()),
												"read": False,
												"shown": False,
												"type": "danger"
											}
										}
									}
								)
						
						# Update jLog
						db.Operations.update_one(
							{"_id": ObjectId(jLog_id)},
							{
								"$push": {
									"operations": operationCicle
								}
							}
						)
						
						Iq.logout()
						
						keepOperating = False
						
						return
					
					buyingId = id
					
					tries[0]["start"] = str(time.time())
					print(operation["operacao"])
					db.Accounts.update_one(
						{"_id": ObjectId(userData["id"])},
						{
							"$set": {
								"operating": {
									"operating": True,
									"active": operation["ativo"],
									"money": operation["money"],
									"operacao": operation["operacao"],
									"tries": tries
								}
							}
						}
					)
					
					# Pegar o valor do ativo atual
					
					operationCashResult = None
					if Iq.check_win_v3(buyingId):
						operationCashResult = Iq.check_win_v3(buyingId)[1]
						print("Result:", operationCashResult)
					else:
						print("Algo deu errado...")
						
					operationCicle["candles"].append(db.RealtimeCandles.find_one({ "ativo": operation["ativo"] })["candles"])
					operationCicle["operacoes"].append({
						"a": activeAtualPrice,
						"p": operationCashResult
					})
					
					# Update jLog
					db.Operations.update_one(
						{"_id": ObjectId(jLog_id)},
						{
							"$push": {
								"operations": operationCicle
							}
						}
					)
					
					# Se o resultado da operação anterior foi Loss ou Dojy
					if operationCashResult <= 0:
						print("loss", operationCashResult)
						# LOSS ou Dojy
						
						cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
						if operationCashResult == 0:
							print("Doji")
							# Não adiciona +1 no index de próximo valor pois não foi perdido completamente. Ao invés, continua com o mesmo index.
							currentResult = "Dojy"
							reconnect(Iq)
						else:
							lossNaSessao += operationCashResult
							print(cTime, "Loss", userData["userName"])
							# Adiciona +1 no index de próximo valor para poder cobrir os loss anteriores.
							print("Loss")
							currentResult = "Loss"
							db.Accounts.update_one(
								{"_id": ObjectId(userData["id"])},
								{
									"$set": {
										"iqPeriodLoss": periodLoss - operationCashResult,
										"operating": {
											"operating": False,
											"active": "",
											"money": "",
											"operacao": "",
											"tries": []
										}
									}
								}
							)
							
							if userData["settings"]["glimpse"]["operationPriority"] == "stop":
								if userData["signalSettings"]["stopLoss"] == True:
									stopLossValue = userData["signalSettings"]["stopLossValue"]
									if lossNaSessao * -1 >= stopLossValue:
										StopLoss(userData, Iq)
										Iq.logout()
										keepOperating = False
									
							reconnect(Iq)
						
					# Se o resultado da operação anterior foi Win
					else:
						winNaSessao += operationCashResult
						print("win", operationCashResult)
						currentResult = "Win"
						# Acaba o loop de tentativas registrando os valores
						cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
						print(cTime, "Session profit:", operationCashResult)
						
						sessionBalance = sessionProfit + operationCashResult
						
						db.Accounts.update_one(
							{"_id": ObjectId(userData["id"])},
							{
								"$set": {
									"iqSessionProfit": sessionBalance,
									"iqPeriodProfit": periodProfit + operationCashResult,
									"operating": {
										"operating": False,
										"active": "",
										"money": "",
										"operacao": "",
										"tries": []
									}
								}
							}
						)
						
						if userData["settings"]["glimpse"]["operationPriority"] == "stop":
							if userData["signalSettings"]["stopWin"] == True:
								stopWinValue = userData["signalSettings"]["stopWinValue"]
								if winNaSessao >= stopWinValue:
									StopWin(userData, Iq)
									Iq.logout()
									keepOperating = False

						reconnect(Iq)
			else:
				reconnect(Iq)
				cTime = time.strftime("%d-%m-%Y %H:%M:%S", time.localtime(time.time()))
				print(cTime, "No Matches, checking again...")
		
		time.sleep(1)

def reconnect(Iq):
	if Iq.check_connect() == False:
		Iq.connect()

if __name__ == "__main__":
	
	# Checar se bot existe no bando
	r = db.Servers.find_one({"name": botName})
	if r == None:
		db.Servers.insert_one({
			"name": botName,
			"status": "waiting",
			"target": "",
			"uptime": 0,
			"preferential": False
		})
	
	botCycle()