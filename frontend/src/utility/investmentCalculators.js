export function calculateFDMaturityDate(startDate, period) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + period);
    return date.toLocaleDateString('en-CA');
}


export function calculateRDMaturityDate(installmentDate, period){
    const date = new Date(installmentDate);
    const originalDay = date.getDate();
    date.setMonth(date.getMonth() + period);
    if(date.getDate() < originalDay){
        date.setDate(0);
    }
    return date.toLocaleDateString('en-CA');
}


// calculated FD maturiy amount using quarterly compounding
export function calculateFDMaturityAmount(principal, rate, startDate, period) {
    let currentPrincipal = principal;
    let remainingDays = period;
    let currentDate = new Date(startDate);
    let rateValue = parseFloat(rate) || 0;

    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    const addThreeMonths = (date) => {
        let newDate = new Date(date);
        let expectedMonth = (newDate.getMonth() + 3) % 12;
        newDate.setMonth(newDate.getMonth() + 3);
        if (newDate.getMonth() !== expectedMonth) {
            newDate.setDate(0); 
        }
        return newDate;
    };

    while (remainingDays > 0) {
        let nextQuarterDate = addThreeMonths(currentDate);
        let timeDiff = nextQuarterDate.getTime() - currentDate.getTime();
        let daysInThisQuarter = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        let daysInYear = isLeapYear(currentDate.getFullYear()) ? 366 : 365;
        let dailyRate = (rateValue / 100) / daysInYear;
        if (remainingDays >= daysInThisQuarter) {
            let interest = currentPrincipal * dailyRate * daysInThisQuarter;
            currentPrincipal += interest;
            remainingDays -= daysInThisQuarter;
        } else {
            let interest = currentPrincipal * dailyRate * remainingDays;
            currentPrincipal += interest;
            remainingDays = 0;
        }
    }

    return {
        maturityAmount: Number(currentPrincipal.toFixed(2)),
        interestEarned: Number((currentPrincipal - principal).toFixed(2))
    };
}


// function to calculate RD maturity amount based on quarterly compounding
export function calculateRDMaturityAmount(installment, rate, period){
    let rateValue = parseFloat(rate) || 0;
    if(installment <= 0 || rateValue <= 0 || period <= 0){
        return {
            maturityAmount: 0,
            investedAmount: 0,
            interestEarned: 0
        };
    }
    
    let maturityAmount = 0;
    const quarterlyRate = rateValue / 100 / 4;

    for(let month = 0; month < period; month++){
        const remainingMonths = period - month;
        const years = remainingMonths / 12;
        const quarters = years * 4;
        maturityAmount += installment * Math.pow(1 + quarterlyRate, quarters);
    }

    const investedAmount = installment * period;

    return {
        maturityAmount: Number(maturityAmount.toFixed(2)),
        investedAmount,
        interestEarned: Number((maturityAmount - investedAmount).toFixed(2))
    };
}


// function to group the fdData based on fdIndex
export const groupFDData = fdData =>{
    const groupedMap = new Map();

    fdData.forEach(fd =>{
        if(!groupedMap.has(fd.fdIndex)){
            groupedMap.set(fd.fdIndex, []);
        }
        groupedMap.get(fd.fdIndex).push(fd);
    });

    return [...groupedMap.values()].map(group =>
        group.sort((a, b) =>{
            const getPriority = fd =>{
                if(fd.status === 2) return 0;
                if(fd.status === 0) return 1;
                return 2;
            };

            const priorityDiff = getPriority(a) - getPriority(b);
            if(priorityDiff !== 0){
                return priorityDiff;
            }

            if(a.status === 1 && b.status === 1){
                return new Date(b.maturityDate) - new Date(a.maturityDate);
            }

            return 0;
        })
    );
}
