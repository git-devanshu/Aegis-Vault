export function calculateInvestmentAnalytics(groupedFDData, rdData, goldAssetData, stockData, DISPLAY){
    const analytics = {
        totalFDValue: 0,
        totalRDValue: 0,
        totalGoldValue: 0,
        totalStockValue: 0,

        totalPortfolioValue: 0,
        allocationData: [],

        fdInterestEarned: 0,
        fdROI: 0,
        fdInitialInvestment: 0,

        rdInterestEarned: 0,
        rdROI: 0,
        rdInvestmentAmount: 0,

        goldProfitLoss: 0,
        goldROI: 0,
        goldPurchaseValue: 0,

        stockProfitLoss: 0,
        stockROI: 0,
        stockPurchaseValue: 0,

        upcomingMaturities: [],

        goldAssetCount: 0,
        goldWeight: 0,
        stockHoldingCount: 0,
        stockUnits: 0,

        topGoldHolding: null,
        topStockHolding: null
    };

    /* FD Analytics */
    groupedFDData.forEach(group =>{
        if(group.length === 0) return;

        const currentFD = group[0];

        /* Active FD Value */
        if(currentFD.status === 0){
            analytics.totalFDValue += Number(currentFD.principal || 0);
            analytics.upcomingMaturities.push({
                type: 'FD',
                id: currentFD.fdIndex,
                amount: Number(currentFD.maturityAmount  || 0),
                maturityDate: currentFD.maturityDate
            });
        }

        /* Closed After Maturity */
        const maturedAndClosed = currentFD.status === 2 && currentFD.closingDate &&
            new Date(currentFD.closingDate) >= new Date(currentFD.maturityDate);

        if(maturedAndClosed){
            const firstInvestment = group[group.length - 1];
            analytics.fdInitialInvestment += Number(firstInvestment.principal || 0);
            group.forEach(fd =>{
                analytics.fdInterestEarned += Number(fd.maturityAmount || 0) - Number(fd.principal || 0);
            });
        }
    });

    analytics.fdROI = analytics.fdInitialInvestment > 0 ? (analytics.fdInterestEarned / analytics.fdInitialInvestment) * 100 : 0;

    /* RD Analytics */
    rdData.forEach(rd =>{
        const investedAmount = Number(rd.installment || 0) * Number(rd.period || 0);

        /* Active RD Value */
        if(rd.status === 0){
            analytics.totalRDValue += investedAmount;
            analytics.upcomingMaturities.push({
                type: 'RD',
                id: rd.rdIndex,
                amount: Number(rd.maturityAmount || 0),
                maturityDate: rd.maturityDate
            });
        }

        /* Closed After Maturity */
        if(rd.status === 1 && rd.closingDate && new Date(rd.closingDate) >= new Date(rd.maturityDate)){
            analytics.rdInterestEarned += Number(rd.maturityAmount || 0) - investedAmount;
            analytics.rdInvestmentAmount += investedAmount;
        }
    });

    analytics.rdROI = analytics.rdInvestmentAmount > 0 ? (analytics.rdInterestEarned / analytics.rdInvestmentAmount) * 100 : 0;

    /* Gold Analytics */
    goldAssetData.forEach(asset =>{
        if(asset.status === 0){
            analytics.totalGoldValue += Number(asset.totalPrice || 0);
            analytics.goldAssetCount++;
            analytics.goldWeight += Number(asset.weight || 0);
        }

        if(asset.status === 0 && (!analytics.topGoldHolding || asset.totalPrice > analytics.topGoldHolding.totalPrice)){
            analytics.topGoldHolding = {
                assetName: asset.assetName,
                weight: asset.weight,
                totalPrice: asset.totalPrice
            };
        }

        if(asset.status === 1){
            const purchaseValue = Number(asset.totalPrice || 0);
            const profitLoss = Number(asset.sellingPrice || 0) - purchaseValue;
            analytics.goldProfitLoss += profitLoss;
            analytics.goldPurchaseValue += purchaseValue;
        }
    });

    analytics.goldROI = analytics.goldPurchaseValue > 0 ? (analytics.goldProfitLoss / analytics.goldPurchaseValue) * 100 : 0;

    /* Stock Analytics */
    stockData.forEach(stock =>{
        if(stock.status === 0){
            analytics.totalStockValue += Number(stock.totalPrice || 0);
            analytics.stockHoldingCount++;
            analytics.stockUnits += Number(stock.units || 0);
        }

        if(stock.status === 0 && (!analytics.topStockHolding || stock.totalPrice > analytics.topStockHolding.totalPrice)){
            analytics.topStockHolding = {
                symbol: stock.symbol,
                units: stock.units,
                totalPrice: stock.totalPrice
            };
        }

        if(stock.status === 1){
            const purchaseValue = Number(stock.totalPrice || 0);
            const profitLoss = Number(stock.sellingPrice || 0) - purchaseValue;
            analytics.stockProfitLoss += profitLoss;
            analytics.stockPurchaseValue += purchaseValue;
        }
    });

    analytics.stockROI = analytics.stockPurchaseValue > 0 ? (analytics.stockProfitLoss / analytics.stockPurchaseValue) * 100 : 0;

    analytics.totalPortfolioValue =
        analytics.totalFDValue +
        analytics.totalRDValue +
        analytics.totalGoldValue +
        analytics.totalStockValue;

    analytics.allocationData = [
        {
            label: DISPLAY.LABELS.FD,
            amount: analytics.totalFDValue,
            percentage: analytics.totalPortfolioValue > 0
                ? (analytics.totalFDValue / analytics.totalPortfolioValue) * 100
                : 0,
            color: '#3B82F6'
        },
        {
            label: DISPLAY.LABELS.RD,
            amount: analytics.totalRDValue,
            percentage: analytics.totalPortfolioValue > 0
                ? (analytics.totalRDValue / analytics.totalPortfolioValue) * 100
                : 0,
            color: '#EF4444'
        },
        {
            label: DISPLAY.LABELS.GOLD_ASSETS,
            amount: analytics.totalGoldValue,
            percentage: analytics.totalPortfolioValue > 0
                ? (analytics.totalGoldValue / analytics.totalPortfolioValue) * 100
                : 0,
            color: '#EAB308'
        },
        {
            label: DISPLAY.LABELS.STOCKS,
            amount: analytics.totalStockValue,
            percentage: analytics.totalPortfolioValue > 0
                ? (analytics.totalStockValue / analytics.totalPortfolioValue) * 100
                : 0,
            color: '#84CC16'
        }
    ];

    analytics.upcomingMaturities = analytics.upcomingMaturities
        .sort(
            (a, b) =>
                new Date(a.maturityDate) -
                new Date(b.maturityDate)
        )
        .slice(0, 5);

    return analytics;
}