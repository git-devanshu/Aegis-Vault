export const calculateAccountMetrics = (accountDataArray = []) =>{
    const totalIncome = accountDataArray.reduce((sum, account)=> sum + (account.totalIncome || 0), 0);
    const totalExpenses = accountDataArray.reduce((sum, account)=> sum + (account.totalExpense || 0), 0);
    return {
        totalIncome,
        totalExpenses,
        currentBalance: totalIncome - totalExpenses
    };
}


export const calculateIncomeMetrics = (selectedTracker, expenseData = []) =>{
    const incomeAmount = selectedTracker?.amount || 0;
    const totalSpent = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);
    const remainingAmount = incomeAmount - totalSpent;
    const transactionCount = expenseData.length;

    const spendingPercentage = incomeAmount > 0 ? (totalSpent / incomeAmount) * 100 : 0;
    const averageTransactionValue = transactionCount > 0 ? totalSpent / transactionCount : 0;

    return {
        incomeAmount,
        totalSpent,
        remainingAmount,
        transactionCount,
        spendingPercentage,
        averageTransactionValue
    };
}


export const calculateBurnRateMetrics = (expenseData = [], remainingAmount = 0) =>{
    if(expenseData.length === 0){
        return {
            dailyAverageSpend: 0,
            projectedMonthlySpend: 0,
            runwayRemainingDays: 0
        };
    }

    const sortedExpenses = [...expenseData].sort((a, b)=> new Date(a.spentDate) - new Date(b.spentDate));
    const firstExpenseDate = new Date(sortedExpenses[0].spentDate);

    const today = new Date();

    const daysElapsed = Math.max(Math.ceil((today - firstExpenseDate) / (1000 * 60 * 60 * 24)), 1);
    const totalSpent = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);
    const dailyAverageSpend = totalSpent / daysElapsed;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const projectedMonthlySpend = dailyAverageSpend * daysInMonth;

    const runwayRemainingDays = dailyAverageSpend > 0 ? remainingAmount / dailyAverageSpend: 0;

    return {
        dailyAverageSpend,
        projectedMonthlySpend,
        runwayRemainingDays
    };
}


export const calculateCategoryAnalytics = (expenseData = [], categoryData = [], limitsData = []) =>{
    const categoryMap = {};

    expenseData.forEach(expense =>{
        const category = categoryData[expense.categoryIndex];
        if(!category){
            return;
        }
        if(!categoryMap[expense.categoryIndex]){
            categoryMap[expense.categoryIndex] = {
                categoryIndex: expense.categoryIndex,
                categoryName: category.name,
                icon: category.icon,
                totalSpent: 0,
                transactionCount: 0
            };
        }
        categoryMap[expense.categoryIndex].totalSpent += expense.amount;
        categoryMap[expense.categoryIndex].transactionCount += 1;
    });

    const totalSpent = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);

    const categoryAnalytics = Object.values(categoryMap)
        .map(category =>{
            const limitData = limitsData.find(limit => limit.categoryIndex === category.categoryIndex);
            const budgetLimit = limitData?.limit || null;
            const remainingBudget = budgetLimit !== null ? budgetLimit - category.totalSpent : null;
            const utilizationPercentage = budgetLimit ? (category.totalSpent / budgetLimit) * 100 : null;

            let budgetStatus = 'gray';

            if(utilizationPercentage !== null){
                if(utilizationPercentage < 70){
                    budgetStatus = 'green';
                }
                else if(utilizationPercentage <= 100){
                    budgetStatus = 'yellow';
                }
                else{
                    budgetStatus = 'red';
                }
            }

            return {
                ...category,
                budgetLimit,
                remainingBudget,
                utilizationPercentage,
                budgetStatus,
                exceededBudget: budgetLimit !== null && category.totalSpent > budgetLimit,
                percentageOfTotalSpend: totalSpent > 0 ? (category.totalSpent / totalSpent) * 100 : 0
            };
        })
        .sort((a, b)=> b.totalSpent - a.totalSpent);

    const exceededBudgets = categoryAnalytics.filter(category => category.exceededBudget);

    const noBudgetHighSpendCategories = categoryAnalytics
        .filter(category => category.budgetLimit === null)
        .slice(0, 3);

    return {
        categoryAnalytics,
        exceededBudgets,
        noBudgetHighSpendCategories
    };
}


export const calculateTemporalAnalytics = (expenseData = []) =>{
    if(expenseData.length === 0){
        return {
            dailySpendMap: {},
            highestSpendingDays: [],
            weekdaySpend: 0,
            weekendSpend: 0,
            weeklySpendMap: {}
        };
    }

    const dailySpendMap = {};
    let weekdaySpend = 0;
    let weekendSpend = 0;

    const sortedExpenses = [...expenseData].sort((a, b)=> new Date(a.spentDate) - new Date(b.spentDate));

    const firstDate = new Date(sortedExpenses[0].spentDate);
    const weeklySpendMap = {};

    expenseData.forEach(expense =>{
        const date = expense.spentDate;
        if(!dailySpendMap[date]){
            dailySpendMap[date] = 0;
        }

        dailySpendMap[date] += expense.amount;
        const day = new Date(date).getDay();

        if(day === 0 || day === 6){
            weekendSpend += expense.amount;
        }
        else{
            weekdaySpend += expense.amount;
        }

        const diffDays = Math.floor((new Date(date) - firstDate) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;

        if(!weeklySpendMap[weekNumber]){
            weeklySpendMap[weekNumber] = 0;
        }

        weeklySpendMap[weekNumber] += expense.amount;
    });

    const highestSpendingDays = Object.entries(dailySpendMap)
        .sort((a, b)=> b[1] - a[1])
        .slice(0, 3);

    return {
        dailySpendMap,
        highestSpendingDays,
        weekdaySpend,
        weekendSpend,
        weeklySpendMap
    };
}



export const calculateComparativeMetrics = (selectedTracker, previousTracker, currentExpenses = [], previousExpenses = []) =>{
    if(!previousTracker){
        return null;
    }

    const currentTotal = currentExpenses.reduce((sum, expense)=> sum + expense.amount, 0);
    const previousTotal = previousExpenses.reduce((sum, expense)=> sum + expense.amount, 0);

    return {
        spendingDifference: currentTotal - previousTotal,
        remainingDifference: (selectedTracker.amount - currentTotal) - (previousTracker.amount - previousTotal),
        savingsRate: selectedTracker.amount > 0 ? ((selectedTracker.amount - currentTotal) / selectedTracker.amount) * 100 : 0
    };
}


export const calculateTopExpenses = (expenseData = []) =>{
    return [...expenseData]
        .sort((a, b)=> b.amount - a.amount)
        .slice(0, 5);
}


export const calculateAnomalyMetrics = (expenseData = [], incomeAmount = 0) =>{
    if(expenseData.length === 0){
        return {
            overspentIncome: false,
            unusualTransactions: [],
            spendingSpikeDays: []
        };
    }

    const totalSpent = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);

    const averageExpense = totalSpent / expenseData.length;
    const variance = expenseData.reduce((sum, expense)=> sum + Math.pow(expense.amount - averageExpense, 2), 0) / expenseData.length;
    const standardDeviation = Math.sqrt(variance);

    const unusualTransactions = expenseData.filter(
        expense => expense.amount > (averageExpense + (2 * standardDeviation))
    );

    const dailySpendMap = {};
    expenseData.forEach(expense =>{
        if(!dailySpendMap[expense.spentDate]){
            dailySpendMap[expense.spentDate] = 0;
        }
        dailySpendMap[expense.spentDate] += expense.amount;
    });

    const averageDailySpend = Object.values(dailySpendMap).reduce((a, b)=> a + b, 0) / Object.keys(dailySpendMap).length;

    const spendingSpikeDays = Object.entries(dailySpendMap).filter(([_, total]) => total > (averageDailySpend * 1.5));

    return {
        overspentIncome: totalSpent > incomeAmount,
        unusualTransactions,
        spendingSpikeDays
    };
}