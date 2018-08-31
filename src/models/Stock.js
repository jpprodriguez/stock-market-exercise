export class Stock {
    constructor(symbol, type, lastDividend, fixedDividend, parValue, price, VWSPrice) {
        this.symbol = symbol;
        this.type = type;
        this.lastDividend = lastDividend;
        this.fixedDividend = fixedDividend;
        this.parValue = parValue;
        this.VWSPrice = VWSPrice;
        if (price) {
            this.setPrice(price);
        }
    };

    setPrice = price => {
        this.price = price;
        this.calculateDividendYield();
        this.calculatePeRatio();
    };

    calculateVWSPrice = (trades) => {
        let VWSPriceDividend = 0;
        let VSWPriceDivisor = 0;
        for (let trade of trades) {
            VWSPriceDividend += trade.price * trade.quantity;
            VSWPriceDivisor += trade.quantity;
        }
        this.VWSPrice = VWSPriceDividend / VSWPriceDivisor;
    }

    calculateDividendYield = () => {
        if (this.type === stockTypes.common) {
            if (this.isNumber(this.lastDividend) && this.isHigherThanZero(this.price)) {
                this.dividendYield = this.lastDividend / this.price;
            }
            else {
                this.dividendYield = null;
            }
        } else if (this.type === stockTypes.preferred) {
            if(this.isNumber(this.fixedDividend) &&
                this.isNumber(this.parValue) &&
                this.isHigherThanZero(this.price)) {
                this.dividendYield = this.fixedDividend * this.parValue / this.price;
            }
            else {
                this.dividendYield = null;
            }
        }
    };

    calculatePeRatio = () => {
        if(this.isNumber(this.price) && this.isHigherThanZero(this.dividendYield)) {
            this.peRatio = this.price / this.dividendYield;
        }
    };

    isNumber = (number) => {
        return number && typeof number === 'number';
    }

    isHigherThanZero = (number) => {
        return this.isNumber(number) && number > 0;
    }
}

export const stockSymbols = Object.freeze({
    TEA: 'TEA',
    POP: 'POP',
    ALE: 'ALE',
    GIN: 'GIN',
    JOE: 'JOE'
});

export const stockTypes = Object.freeze({
    common: 'Common',
    preferred: 'Preferred',
});