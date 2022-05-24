import { IonInput, IonItem, IonLabel, IonSpinner } from "@ionic/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import serverInfo from "../../connection";
import moment from 'moment';
import { canConstructReadableStream } from "workbox-core/_private";
import { Chart } from "react-google-charts";

const Operacoes = (props: any) => {
    
    const [operations, setOperations] = useState<any>([]);
    
    const operationDetail = (e:any) => {
        
        const operacoesDiv = document.querySelectorAll(".operacao");
        const eClassName = e.parentElement.className.split(" ");
        
        operacoesDiv.forEach(opDiv => {
            
            opDiv.className = "operacao shadowComponent";
            
        })
        
        let chart = e.parentElement.querySelector(".operacao-detalhes").querySelector(".operation-chart").querySelector(".chart")
        
        if(eClassName.includes("active")) {
            e.parentElement.className = "operacao shadowComponent"          
            chart.style.display = 'none'
        } else {
            e.parentElement.className = "operacao shadowComponent active"            
            chart.style.display = 'flex'
        }
    }
    
    const OperationDetailClose = () => {
        
    }
    
    const loadOperationData = () => {
        const userId = JSON.parse(localStorage.getItem("user")).id;
        
        axios.post(`${serverInfo.ApiAddress}/glimpse/getUserOperations`, { userKey: "ASD123", userId: userId })
        .then(res => {
            let maxOperations = 100;
            let Operations = [] as any;
            res.data.map((operation:any) => {
                
                let mode = operation.operationType;
                if (mode == "strategy") {
                    mode = operation.strategy
                } else {
                    mode = "Sinais"
                }
                
                let operacao = operation.operation;
                
                operation.operations.map((op:any) => {
                    let valores = [] as any;
                    let candles = [] as any;
                    //let motivoLoss = null;
                    op.operacoes.map((valor:any) => {
                        if( typeof valor.p == "string") {
                            //motivoLoss = valor.split(" ")[0]
                            let v = parseFloat(valor.p.split(" ")[1])
                            //valores.push(v * -1)
                        } else {
                            valores.push(valor.p)
                        }
                    })
                    
                    //console.log(op.candles)
                    
                    Operations.push({
                        
                        expiracao: operation.expiration,
                        mao: op.money,
                        operacao: op.operacao,
                        estrategia: mode,
                        ativo: op.ativo,
                        candles: op.candles[0],
                        horario: moment.unix(op.horario).format("DD/MM/YYYY HH:mm:ss"),
                        valores: valores,
                        profit: valores.reduce(function(a:number, b:number) { return a + b; }, 0)
                        
                    })
                    
                })
            })
            
            let operReverse = Operations
            operReverse.splice(0, Operations.length - maxOperations)
            
            setOperations(operReverse.reverse());
            
        })
    }
    
    useEffect(() => {
        
        //console.log()
        
        
        
        loadOperationData();
        
    }, [])
    
    const testCandles = [
        {o: 0.586701, c: 0.586685},
        {o: 0.586685, c: 0.586637},
        {o: 0.586641, c: 0.586644},
        {o: 0.586635, c: 0.586678},
        {o: 0.586667, c: 0.58669},
        {o: 0.586671, c: 0.586632},
        {o: 0.586639, c: 0.586622},
        {o: 0.586622, c: 0.586598},
        {o: 0.586612, c: 0.586672},
        {o: 0.586669, c: 0.586776},
        {o: 0.586775, c: 0.586732},
        {o: 0.586733, c: 0.586749},
        {o: 0.586748, c: 0.586774},
        {o: 0.586772, c: 0.586833},
        {o: 0.586813, c: 0.586795}
    ]
    
    const CandleChart = (props:any) => {
        
        let newData = [] as any;
        newData.push(['day', 'o', 'h', 'l', 'c'])
        
        props.data.map((candle:any) => {
            
            newData.push(['day', candle.o, candle.o, candle.c, candle.c])
            
        })
        
        return (
            <Chart
                width={'100%'}
                height={170}
                chartType="CandlestickChart"
                loader={<IonSpinner name="crescent" color="secondary" />}
                data={newData}
                options={{
                    enableInteractivity: false,
                    backgroundColor: 'transparent',
                    legend: 'none',
                    chartArea: { backgroundColor: 'transparent' },
                    candlestick: {
                        fallingColor: { strokeWidth: 0, fill: 'rgb(228, 89, 89)' }, // red
                        risingColor: { strokeWidth: 0, fill: 'rgb(97, 199, 97)' }, // green
                    },
                    hAxis: {
                        textPosition: 'none'
                    },
                    vAxis: {
                        textPosition: 'none',
                        gridlines: {
                            color: 'transparent'
                        }
                    },
                }}
            />
        )
        
    }
    
    return (
        <>
            <div className="operacoes" onClick={() => { OperationDetailClose() }}>
                
                <h5>Operations</h5>
                
                <div className="operacoes-header">
                
                    
                
                </div>
                
                <div className="operacoes-content">
                    
                    
                    {
                        operations.length > 0  ?
                        operations.map((o:any, index:number) => {
                            
                            return (
                                <div className="operacao shadowComponent" key={index}>
                        
                                <div className="operacao-header" onClick={(e) => { operationDetail(e.target) }}>
                                    <div className="operacao-ativo">
                                        {o.ativo}
                                    </div>
                                    
                                    <div className="operacao-horario">
                                        {o.horario}
                                    </div>
                                    
                                    <div className={o.profit.toFixed(2) < 0 ? 'operacao-profit negative' : 'operacao-profit'}>
                                        {o.profit.toFixed(2)}
                                    </div>
                                </div>
                                
                                <div className="operacao-detalhes">
                                    
                                    <div className="operation-chart">
                                        
                                        <div className="chart" style={{ display: 'none' }}>
                                            <CandleChart data={o.candles}/>
                                        </div>
                                        
                                        <div className="chart-details">
                                            
                                            <div>Estrategy: <span>{o.estrategia}</span></div>
                                            <div>Operation: <span>{o.operacao}</span></div>
                                            <div>Value: <span>R$ {o.mao}</span></div>
                                            <div>Expiration: <span>{o.expiracao}m</span></div>
                                            
                                        </div>
                                        
                                    </div>
                                    
                                    
                                </div>
                                
                            </div>
                            )
                            
                        })
                        
                        : <IonSpinner className="spinner" name="crescent" color="primary" />
                    }
                    
                </div>
                
            </div>
        </>
    )
}

export default Operacoes;