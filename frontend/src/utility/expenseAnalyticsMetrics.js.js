import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {getCategoryDisplayName} from './helpers'

export default function getExpenseAnalyticsMetrics({expenseData, categoryData, selectedTracker, selectedAccount, DISPLAY}){

    const totalIncome = Number(selectedAccount?.totalIncome || 0);
    const totalExpense = expenseData.reduce((sum, expense)=> sum + Number(expense.amount), 0);
    const totalAccountIncome = Number(selectedAccount?.totalIncome || 0);
    const totalAccountExpense = Number(selectedAccount?.totalExpense || 0);

    const currentBalance = totalIncome - totalAccountExpense;

    const percentageConsumed = totalIncome ? (totalAccountExpense / totalIncome) * 100 : 0;

    const incomeAmount = Number(selectedTracker?.amount || 0);

    const transactionCount = expenseData.length;

    const remainingAmount = incomeAmount - totalExpense;

    const averageTransaction = transactionCount
        ? totalExpense / transactionCount
        : 0;

    const savingsRate = incomeAmount
        ? (remainingAmount / incomeAmount) * 100
        : 0;

    const spendMap = new Map();

    expenseData.forEach(expense =>{
        spendMap.set(
            expense.categoryIndex,
            (spendMap.get(expense.categoryIndex) || 0) + expense.amount
        );
    });

    const dailySpendMap = new Map();

    expenseData.forEach(expense =>{
        dailySpendMap.set(
            expense.spentDate,
            (dailySpendMap.get(expense.spentDate) || 0) + expense.amount
        );
    });

    const sortedExpenses = [...expenseData]
        .sort((a, b)=> b.amount - a.amount);

    const largestExpense = sortedExpenses[0];

    const topExpenses = sortedExpenses.slice(0, 3);

    const topExpensePercentageConsumed = largestExpense
        ? (largestExpense.amount / incomeAmount) * 100
        : 0;

    const categoryDistribution = categoryData
        .map(category =>({
            categoryName: getCategoryDisplayName(category, DISPLAY),
            amount: spendMap.get(category.categoryIndex) || 0,
            categoryIndex: category.categoryIndex
        }))
        .filter(category => category.amount > 0)
        .sort((a, b)=> b.amount - a.amount)
        .map(category =>({
            ...category,
            percentage: totalExpense
                ? (category.amount / totalExpense) * 100
                : 0
        }));

    const budgetAnalytics = (selectedTracker?.limitsData || [])
        .map(limit =>{
            const category = categoryData.find(
                c => c.categoryIndex === limit.categoryIndex
            );

            return {
                categoryIndex: limit.categoryIndex,
                categoryName: getCategoryDisplayName(category, DISPLAY) || DISPLAY.LABELS.UNKNOWN,
                budget: limit.limit,
                actual: spendMap.get(limit.categoryIndex) || 0
            };
        })
        .sort((a, b)=> b.actual - a.actual);

    let healthy = 0;
    let warning = 0;
    let exceeded = 0;

    (selectedTracker?.limitsData || []).forEach(limit =>{
        const spent = spendMap.get(limit.categoryIndex) || 0;

        const usage = limit.limit
            ? (spent / limit.limit) * 100
            : 0;

        if(usage < 70){
            healthy++;
        }
        else if(usage <= 100){
            warning++;
        }
        else{
            exceeded++;
        }
    });

    const sortedTimelineEntries = [...dailySpendMap.entries()]
        .sort((a, b)=> new Date(a[0]) - new Date(b[0]));

    const timelineData = {
        labels: sortedTimelineEntries.map(entry => entry[0]),
        values: sortedTimelineEntries.map(entry => entry[1])
    };

    const topDays = [...dailySpendMap.entries()]
        .map(([date, amount]) =>({
            date,
            amount,
            percentage: totalExpense
                ? (amount / totalExpense) * 100
                : 0
        }))
        .sort((a, b)=> b.amount - a.amount)
        .slice(0, 3);

    let weekdaySpend = 0;
    let weekendSpend = 0;

    expenseData.forEach(expense =>{
        const day = new Date(expense.spentDate).getDay();

        if(day === 0 || day === 6){
            weekendSpend += expense.amount;
        }
        else{
            weekdaySpend += expense.amount;
        }
    });

    return {
        totalIncome,
        totalExpense,
        totalAccountIncome,
        totalAccountExpense,

        currentBalance,
        percentageConsumed,

        incomeAmount,
        transactionCount,
        remainingAmount,
        averageTransaction,
        savingsRate,

        spendMap,
        dailySpendMap,

        largestExpense,
        topExpenses,
        topExpensePercentageConsumed,

        categoryDistribution,

        budgetAnalytics,

        healthy,
        warning,
        exceeded,

        timelineData,

        topDays,

        weekdaySpend,
        weekendSpend
    };
}



export const downloadAnalyticsReport = ({analytics, selectedAccount, selectedTracker, country, DISPLAY, bank}) =>{
    const doc = new jsPDF();

    const tableTheme = {
        theme: 'grid',
        headStyles: {
            fillColor: [32, 214, 0],
            textColor: [15, 23, 42],
            fontStyle: 'bold'
        }
    };

    let currentY = 20;

    const addSectionTitle = title =>{
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text(title, 14, currentY);
        currentY += 8;
    };

    doc.setFontSize(20);
    doc.text(DISPLAY.TEXT.EXPENSE_ANALYTICS_REPORT, 14, currentY);

    currentY += 10;

    doc.setFontSize(10);
    doc.text(
        `${DISPLAY.LABELS.GENERATED_ON}: ${new Date().toLocaleString(country.locale)}`,
        14,
        currentY
    );

    currentY += 12;

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.LABELS.ACCOUNT, DISPLAY.LABELS.INCOME_SOURCE]],
        body: [[bank.bankName, selectedTracker.name]],
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.ACCOUNT_SNAPSHOT);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.METRIC, DISPLAY.REPORT.VALUE]],
        body: [
            [DISPLAY.REPORT.CURRENT_BALANCE, `${country.currency.code} ${analytics.currentBalance.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.TOTAL_INCOME, `${country.currency.code} ${analytics.totalIncome.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.TOTAL_EXPENSE, `${country.currency.code} ${analytics.totalAccountExpense.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.CONSUMED, `${analytics.percentageConsumed.toFixed(2)}%`]
        ],
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.SELECTED_INCOME_OVERVIEW);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.METRIC, DISPLAY.REPORT.VALUE]],
        body: [
            [DISPLAY.REPORT.INCOME_AMOUNT, `${country.currency.code} ${analytics.incomeAmount.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.EXPENSE_AMOUNT, `${country.currency.code} ${analytics.totalExpense.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.REMAINING_AMOUNT, `${country.currency.code} ${analytics.remainingAmount.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.TRANSACTIONS, analytics.transactionCount],
            [DISPLAY.REPORT.AVERAGE_TRANSACTION, `${country.currency.code} ${analytics.averageTransaction.toFixed(2)}`],
            [DISPLAY.REPORT.SAVINGS_RATE, `${analytics.savingsRate.toFixed(2)}%`]
        ],
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.CATEGORYWISE_DISTRIBUTION);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.CATEGORY, DISPLAY.REPORT.AMOUNT, DISPLAY.REPORT.PERCENTAGE]],
        body: analytics.categoryDistribution.map(category =>[
            category.categoryName,
            `${country.currency.code} ${category.amount.toLocaleString(country.locale)}`,
            `${category.percentage.toFixed(1)}%`
        ]),
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.BUDGET_VS_ACTUAL);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.CATEGORY, DISPLAY.REPORT.BUDGET, DISPLAY.REPORT.ACTUAL]],
        body: analytics.budgetAnalytics.map(item =>[
            item.categoryName,
            `${country.currency.code} ${item.budget.toLocaleString(country.locale)}`,
            `${country.currency.code} ${item.actual.toLocaleString(country.locale)}`
        ]),
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.BUDGET_HEALTH);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.HEALTHY, DISPLAY.REPORT.WARNING, DISPLAY.REPORT.EXCEEDED]],
        body: [[
            analytics.healthy,
            analytics.warning,
            analytics.exceeded
        ]],
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.TOP_EXPENSES);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.EXPENSE, DISPLAY.REPORT.AMOUNT]],
        body: analytics.topExpenses.map(expense =>[
            expense.spentAt,
            `${country.currency.code} ${expense.amount.toLocaleString(country.locale)}`
        ]),
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.TOP_SPENDING_DAYS);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.DATE, DISPLAY.REPORT.AMOUNT, DISPLAY.REPORT.PERCENTAGE]],
        body: analytics.topDays.map(day =>[
            day.date,
            `${country.currency.code} ${day.amount.toLocaleString(country.locale)}`,
            `${day.percentage.toFixed(1)}%`
        ]),
        ...tableTheme
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.WEEKDAY_VS_WEEKEND);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.TYPE, DISPLAY.REPORT.AMOUNT]],
        body: [
            [DISPLAY.REPORT.WEEKDAY, `${country.currency.code} ${analytics.weekdaySpend.toLocaleString(country.locale)}`],
            [DISPLAY.REPORT.WEEKEND, `${country.currency.code} ${analytics.weekendSpend.toLocaleString(country.locale)}`]
        ],
        ...tableTheme
    });

    doc.save(
        `Expense_Report_${selectedTracker.name}_${Date.now()}.pdf`
    );
};




export const downloadExpenseStatement = ({expenseData, categoryData, selectedTracker, bank, country, DISPLAY}) =>{
    const doc = new jsPDF();

    let currentY = 20;

    const tableOptions = {
        theme: 'grid',
        headStyles: {
            fillColor: [32, 214, 0],
            textColor: [15, 23, 42],
            fontStyle: 'bold'
        }
    };

    const addSectionTitle = title =>{
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text(title, 14, currentY);
        currentY += 8;
    };

    const formatCurrency = amount =>
        `${country.currency.code} ${amount.toLocaleString(country.locale)}`;

    const totalExpense = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);

    doc.setFontSize(20);
    doc.text(DISPLAY.TEXT.EXPENSE_STATEMENT, 14, currentY);

    currentY += 10;

    doc.setFontSize(10);
    doc.text(
        `${DISPLAY.LABELS.GENERATED_ON}: ${new Date().toLocaleString(country.locale)}`,
        14,
        currentY
    );

    currentY += 12;

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.LABELS.ACCOUNT, DISPLAY.LABELS.INCOME_SOURCE]],
        body: [[bank.bankName, selectedTracker.name]],
        ...tableOptions
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.STATEMENT_SUMMARY);

    autoTable(doc, {
        startY: currentY,
        head: [[DISPLAY.REPORT.METRIC, DISPLAY.REPORT.VALUE]],
        body: [
            [
                DISPLAY.REPORT.TRANSACTIONS,
                expenseData.length
            ],
            [
                DISPLAY.REPORT.TOTAL_EXPENSE,
                formatCurrency(totalExpense)
            ]
        ],
        ...tableOptions
    });

    currentY = doc.lastAutoTable.finalY + 10;

    addSectionTitle(DISPLAY.TEXT.EXPENSE_TRANSACTIONS);

    autoTable(doc, {
        startY: currentY,
        head: [[
            DISPLAY.REPORT.DATE,
            DISPLAY.REPORT.EXPENSE,
            DISPLAY.REPORT.CATEGORY,
            DISPLAY.REPORT.AMOUNT
        ]],
        body: expenseData.map(expense =>{
            const category = categoryData.find(
                c => c.categoryIndex === expense.categoryIndex
            );
            return [
                new Date(expense.spentDate).toLocaleDateString(country.locale),
                expense.spentAt,
                getCategoryDisplayName(category, DISPLAY) || DISPLAY.LABELS.UNKNOWN,
                formatCurrency(expense.amount)
            ];
        }),
        ...tableOptions
    });

    doc.save(`Expense_Statement_${selectedTracker.name}_${Date.now()}.pdf`);
};
