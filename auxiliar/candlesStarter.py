import os
import subprocess
import time

for script in os.listdir('./candles/'):
    time.sleep(2)
    
    if script == "starter.py" or script == ".git":
        continue
    else:
        subprocess.Popen("python candles/"+script+" 1", shell=True)