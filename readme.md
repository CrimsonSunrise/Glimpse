# Glimpse

## Your broker's operations automator.

**Glimpse** is an open source bundle of systems and algorithms that together automate strategies and signals in brokers.

> Currently IQ Option is the only broker implemented.

<a href="https://www.buymeacoffee.com/crimsonsunrise" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png"/></a>

Table of content:

* [Bundle](#api)
    * [API](#api)
    * [Operational Server](#operational-server)
    * [Auxiliar Scripts](#auxiliar-scripts)
    * [Web and mobile App](#app)
    * [Manager App](#manager)
    * [Database](#database)
* [How it works?](#how-it-works)
* [Guide](#requirements)
    * [Requirements](#requirements)
    * [Setting up](#setup)
        * [Database setup](#database-setup)
        * [API setup](#api-setup)
        * [Auxiliar Scripts setup](#auxiliar-scripts-setup)
        * [Operational Server setup](#operational-server-setup)
        * [Web and mobile App setup](#app-setup)
        * [Manager App setup](#manager-setup)
        
* [Contributions](#contributions)
* [License](#license)

<a name="api"></a>
# Bundle

## API

![](https://img.shields.io/badge/Flask-informational?style=flat-square&logo=Flask&logoColor=white&color=black)
![](https://img.shields.io/badge/Python-informational?style=flat-square&logo=Python&logoColor=white&color=407CB0)

Main method of communication between servers and applications, it contains all routes and functions necessary for communication between **Glimpse** systems.

<a name="operational-server"></a>
## Operational Server

![](https://img.shields.io/badge/Python-informational?style=flat-square&logo=Python&logoColor=white&color=407CB0)

Scripts that receive commands from users and perform operations.

<a name="auxiliar-scripts"></a>
## Auxiliar Scripts

![](https://img.shields.io/badge/Python-informational?style=flat-square&logo=Python&logoColor=white&color=407CB0)

Scripts that perform checks and data acquisition regarding assets and/or currency pairs.

<a name="app"></a>
## Web and mobile App

![](https://img.shields.io/badge/Ionic-informational?style=flat-square&logo=Ionic&logoColor=white&color=367CF7)
![](https://img.shields.io/badge/React-informational?style=flat-square&logo=React&logoColor=white&color=5ED3F3)
![](https://img.shields.io/badge/Typescript-informational?style=flat-square&logo=Typescript&logoColor=white&color=2F74C0)

Web/Android application where the user can configure, command and analyze remote operations.

<a name="manager"></a>
## Manager App

![](https://img.shields.io/badge/Ionic-informational?style=flat-square&logo=Ionic&logoColor=white&color=367CF7)
![](https://img.shields.io/badge/React-informational?style=flat-square&logo=React&logoColor=white&color=5ED3F3)
![](https://img.shields.io/badge/Typescript-informational?style=flat-square&logo=Typescript&logoColor=white&color=2F74C0)

Web application to manage users, operations and extra settings.

<a name="database"></a>
## Database

![](https://img.shields.io/badge/MongoDB-informational?style=flat-square&logo=MongoDB&logoColor=white&color=118D4D)

Main method of storing data and information.


<a name="how-it-works"></a>
# How it works?


All commands and information managed in apps are sent by the API to the database where the operational scripts wait for instructions.

The auxiliary scripts constantly collect data via the broker's API and store/update this data in the database.

Upon receiving some instruction, the operational scripts compare the data collected by the auxiliary scripts and, according to the command sent by the user, it executes the operations via the broker's API.

The operational script collects the results of operations and stores them in the database, thus providing information to display in web and mobile applications.

![Glimpse workflow](https://i.imgur.com/ZrAa5ML.png)


<a name="requirements"></a>
# Guide

This guide will provide the basics for all the Glimpse system to run.

## Requirements

In order to run the **Glimpse** bundle you need to download and install the following programs:

[Python 3.7^](https://www.python.org/downloads/)

[NodeJS](https://nodejs.org/en/download/)

[MongoDB Community](https://www.mongodb.com/try/download/community)

[MongoDB Compass](https://www.mongodb.com/try/download/compass)


<a name="setup"></a>
## Setup

<a name="database-setup"></a>
### Database Setup

1. Make sure you've installed MongoDB Community and open MongoDB Compass.
2. Create a new connection or press ```Ctrl + N``` and paste the connection string ```mongodb://localhost:27017``` then click **Connect**.
3. Click in the green button called **Create Database**. In the **Database Name** type ```Glimpse``` and in the **Collection Name** type ```Accounts```.
4. After creating the collection named Accounts, you will need to create the following collections inside the Glimpse database you just created:
    * ActivesSchedule
    * AllSignals
    * Auxiliar
    * Codes
    * ManagerAccounts
    * ManagerAudit
    * OpenedActives
    * Operations
    * RealtimeCandles
    * Servers
    * Signals
    * Strategies
5. After creating all the needed collections you will need to import the base data into every collection. For this step, select a collection, click on the green button **ADD DATA**, click on **Import File**, **Select a file...** and navigate to the folder **Collections** inside the project, select the corresponding file name for the collection you've selected and then click **Open**. After click on the green button **IMPORT**.
6. Do the same thing for all the collections. Be cautious to not import twice.
7. After importing all the collection files we're done with the database and you can proceed to the next step.

<a name="api-setup"></a>
### API Setup

With Python installed, now we need to install some modules. Open your command prompt and type the following commands:

1. ```pip install flask``` Flask to create our API.
2. ```pip install flask-cors``` Flask CORS to allow Cross Origin Resource Sharing.
3. ```pip install pymongo``` MongoDB module to connect to our database.
4. ```pip install dnspython``` A required module for pymongo to work.
5. ```pip install pytz``` Module for calculating timezones.
6. ```pip install git+git://github.com/iqoptionapi/iqoptionapi.git``` IQ Option API its our broker bridge.
7. ```pip install websocket-client==0.56``` Module required for connecting to the IQ Option API.

After installing all the packages above, open your MongoDB Compass and inside your **Auxiliar** collection, edit the ```value``` field of the document with your computer's IP Address where ```name``` is equal to ```apiAddress```. This will allow you apps and scripts to connect to your API.

Now edit the document where ```name``` is equal to ```analysisAccount```. Set the value to a working IQ Option account with a slash ```/``` between email and password. ie.: ```email/password```. This account will be used to connect to the broker's API and collect data. You can use a non verified account.

Inside the folder ```API``` is located the ```routes.py``` and ```actions.py```, the main scripts for our API.

Run the file ```routes.py``` and our API should now be working.

<a name="auxiliar-scripts-setup"></a>
### Auxiliar Scripts setup

Before we run the operational server scripts, we need to run the auxiliar scripts. They will provide important data to our algorithms analyze.

The auxiliar scripts are composed for the following scripts:
    
* ```lister.py``` Script used to list opened currency pairs and its payouts.
* ```serverAssigner.py``` Script that assign a waiting user to a waiting operational server.
* ```candlesStarter.py``` Script that will start the candles stream for all the currency pairs located at ```/auxiliar/candles/```.

The ```lister.py``` script will connect to the broker's api and save on the database informations about currently opened currency pairs and its payouts. To work properly, you need to set the ```analysisAccount``` on the ```Auxiliar``` collection. Inside this script you can set the interval of its functions.

The ```serverAssigner.py``` script its responsible for await operating commands from users watching its values from the database and assigning the commands to the not in use operational server. You can set its intervals inside the script.

The ```candleStarter.py``` script iterate inside the folder ```/auxiliar/candles``` and start all the scripts. Each script inside the candles folder start a candle stream of a currency pair and save the data gathered into the database.

<a name="operational-server-setup"></a>
### Operational Server setup

The operational server is composed of two scripts, the main one ```server.py``` and the auxiliar ```sequenceFinder.py```.

The ```server.py``` script is the main cause it awaits for the user commands, analyze the data coming from the database and place orders in the broker's api.

The ```server.py``` also is responsible for place signal orders.

The ```sequenceFinder.py```, as its name suggests, is a script capable of compare the candles provided by the auxiliar scripts and send back an information to the ```server.py``` script to proceed with the orders.