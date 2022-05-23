import json
import requests

def find(sequence, mirror, operation, apiAddress):
	#print(sequence)
	newOperation = operation.lower()
	sequence = sequence.replace(" ", "")
	reverseSequence = sequence.split(",")[::-1]
	mirrowedSequence = []
	for c in reverseSequence:
		if c == "1":
			mirrowedSequence.append("-1")
		if c == "-1":
			mirrowedSequence.append("1")
		if c == "0":
			mirrowedSequence.append("0")
	
	# Cria um dict com todos os ativos abertos

	r = requests.get('http://'+apiAddress+':5000/glimpse/getCandlesRealtime')
	jsonR = json.loads(r.text)
	
	matches = []
	
	for ativo in jsonR:
		candles = []
		for candle in ativo["candles"]:
			if candle["c"] - candle["o"] < 0:
				candles.append(-1)
			elif candle["c"] - candle["o"] > 0:
				candles.append(1)
			# Caso precise checar por dojis, descomente esta linha
			else:
				candles.append(0)
		reverseCandles = candles[::-1]
		
		m = True
		for p in range(len(reverseSequence)):
			if str(reverseSequence[p]) != str(reverseCandles[p]):
				if m == True:
					m = False
		if m:
			matches.append([ativo["ativo"], newOperation])
	
	if mirror:
		for ativo in jsonR:
			candles = []
			for candle in ativo["candles"]:
				if candle["c"] - candle["o"] < 0:
					candles.append(-1)
				elif candle["c"] - candle["o"] > 0:
					candles.append(1)
				# Caso precise checar por dojis, descomente esta linha
				else:
					candles.append(0)
			reverseCandles = candles[::-1]
			
			m = True
			for p in range(len(mirrowedSequence)):
				if str(mirrowedSequence[p]) != str(reverseCandles[p]):
					if m == True:
						m = False
			if m:
				nO = newOperation
				if newOperation == "call":
					nO = "put"
				else:
					nO = "call"
				matches.append([ativo["ativo"], nO])
	
	if len(matches) > 0:
		return {
			"matches": matches
		}
	else:
		return False