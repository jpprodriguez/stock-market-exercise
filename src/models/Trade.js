export class Trade {
    constructor(stockSymbol, quantity, action, price) {
        this.stockSymbol =  stockSymbol;
        this.quantity = quantity;
        this.action = action;
        this.price = price;
        this.timestamp = new Date();
    }
}

export const actionTypes = {
    BUY: 'Buy',
    SELL: 'Sell'
}