import React, { Component } from 'react';
import './App.css';
import Stocks from "./components/Stocks/Stocks";
import {Stock, stockSymbols, stockTypes} from "./models/Stock";
import Trades from "./components/Trades/Trades";
import {actionTypes, Trade} from "./models/Trade";

class App extends Component {
    state = {
        stocks: null,
        geometricMean: null,
        trades: [],
        newTrade: {
            stockSymbol: '',
            quantity: '',
            action: ''
        }
    }

    componentDidMount() {
        this.setState({stocks: this.initMockedStocks()})
    }

    render() {
        const styles = {
            leftAligned: {
                textAlign: 'left'
            }
        }
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Super Simple Stock Market</h1>
                </header>
                <div>
                    <h3>Stocks</h3>
                    <Stocks stocks={this.state.stocks}
                            onPriceChange={(event, index) => this.stockPriceChangeHandler(event, index)}
                    />
                    <span>Geometric Mean: {this.state.geometricMean ? this.state.geometricMean.toFixed(2) : '-'}</span>
                    <div>
                        <button onClick={()=>{this.updateAllVWSPrices()}}>Update all VWS Prices</button>
                    </div>
                    <h3>Trades</h3>
                    <Trades trades={this.state.trades}/>
                </div>

                <div style={styles.leftAligned}>
                    <h3>New Trade</h3>
                    <div>
                        <span>Stock Symbol: </span>
                        <select
                            name='stockSymbol'
                            value={this.state.newTrade.stockSymbol}
                            onChange={this.inputChangeHandler}
                        >
                            <option></option>
                            <option>{stockSymbols.TEA}</option>
                            <option>{stockSymbols.POP}</option>
                            <option>{stockSymbols.ALE}</option>
                            <option>{stockSymbols.GIN}</option>
                            <option>{stockSymbols.JOE}</option>
                        </select>
                    </div>
                    <div>
                        <span>Quantity: </span>
                        <input
                            name='quantity'
                            type='number'
                            value={this.state.newTrade.quantity}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <div>
                        <span>Action: </span>
                        <input
                            name='action'
                            type="radio"
                            value={actionTypes.BUY}
                            checked={this.state.newTrade.action === actionTypes.BUY}
                            onChange={this.inputChangeHandler}
                        />
                        <span>Buy</span>
                        <input
                            name='action'
                            type="radio"
                            value={actionTypes.SELL}
                            checked={this.state.newTrade.action === actionTypes.SELL}
                            onChange={this.inputChangeHandler}
                        />
                        <span>Sell</span>
                    </div>
                    <button onClick={() => {this.createTradeHandler()}}>Create trade</button>
                </div>
            </div>
        );
    }

    initMockedStocks = () => {
        return [
            new Stock(stockSymbols.TEA, stockTypes.common, 0, null, 100),
            new Stock(stockSymbols.POP, stockTypes.common, 8, null, 100),
            new Stock(stockSymbols.ALE, stockTypes.common, 23, null, 60),
            new Stock(stockSymbols.GIN, stockTypes.preferred, 8, 2, 100),
            new Stock(stockSymbols.JOE, stockTypes.common, 13, null, 250)
        ];
    }

    stockPriceChangeHandler = (event, index) => {
        const newPriceValue = event.target.value;
        const oldStock = this.state.stocks[index];
        const updatedStock = new Stock(
            oldStock.symbol,
            oldStock.type,
            oldStock.lastDividend,
            oldStock.fixedDividend,
            oldStock.parValue,
            parseFloat(newPriceValue),
            oldStock.VWSPrice
        );
        const newStocks = [...this.state.stocks];
        newStocks[index] = updatedStock;
        this.setState({stocks: newStocks});
    }

    inputChangeHandler = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        const newTrade = {...this.state.newTrade, [name]: value};
        this.setState({
            newTrade: newTrade
        });
    }

    createTradeHandler = () => {
        if(this.isNewTradeComplete()) {
            const stock = this.state.stocks.filter(stock => stock.symbol === this.state.newTrade.stockSymbol)[0];
            if(stock.price > 0) {
                const trade = new Trade(
                    stock.symbol,
                    this.state.newTrade.quantity,
                    this.state.newTrade.action,
                    stock.price
                );
                this.updateStockVWSPrice(stock, trade);
                this.setState(prevState => ({trades: prevState.trades.concat(trade)}));
            } else {
                console.error('Missing price from selected stock for new trade form');
            }
        } else {
            console.error('New trade form is not complete');
        }

    }

    isNewTradeComplete = () => {
        const newTrade = this.state.newTrade;
        return (
            newTrade.quantity &&
            newTrade.action &&
            newTrade.stockSymbol
        );
    }

    updateAllVWSPrices = () => {
        const newStocks = [];
        for(let stock of this.state.stocks) {
            const trades = this.getLatestStockTrades(this.state.trades,stock.symbol);
            const newStock = new Stock(
                stock.symbol,
                stock.type,
                stock.lastDividend,
                stock.fixedDividend,
                stock.parValue,
                stock.price,
                stock.VWSPrice
            );
            newStock.calculateVWSPrice(trades);
            newStocks.push(newStock);
        }
        const newGeometricMean = this.calculateGeometricMean(newStocks);
        this.setState({stocks: newStocks, geometricMean: newGeometricMean});
    }

    updateStockVWSPrice = (stock, trade) => {
        const updatedStock = new Stock(
            stock.symbol,
            stock.type,
            stock.lastDividend,
            stock.fixedDividend,
            stock.parValue,
            stock.price
        );
        const trades = this.getLatestStockTrades(this.state.trades.concat(trade),stock.symbol);
        updatedStock.calculateVWSPrice(trades);
        const newStocks = [...this.state.stocks];
        newStocks[newStocks.indexOf(stock)] = updatedStock;
        const newGeometricMean = this.calculateGeometricMean(newStocks);
        this.setState({stocks: newStocks, geometricMean: newGeometricMean});
    }

    calculateGeometricMean = (stocks) => {
        let stocksVWSPrice = null;
        let stockAmount = 0;

        if(stocks && stocks.length > 0) {
            for(let x=0; x<stocks.length; x++) {
                if (stocks[x].VWSPrice) {
                    stocksVWSPrice = stocksVWSPrice ? stocksVWSPrice *= stocks[x].VWSPrice : stocks[x].VWSPrice;
                    stockAmount++;
                }
            }
        }

        return stockAmount > 0 ? Math.pow(stocksVWSPrice, 1/stockAmount) : null;
    }

    getLatestStockTrades = (trades, stockSymbol) => {
        return trades.filter(trade =>
            trade.stockSymbol === stockSymbol &&
            this.getDiferenceInMinutes(trade.timestamp, new Date()) <= 5
         );


    }

    getDiferenceInMinutes = (date1, date2) => {
        const diff = (date1.getTime() - date2.getTime()) / 60000;
        return Math.abs(Math.round(diff));
    }
}

export default App;
