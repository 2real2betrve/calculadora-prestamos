// ===================================
// SAVINGS CALCULATOR - savings.js (ENGLISH)
// Version: USD, locale en-US
// ===================================

let savingsChart = null;

// Calculate savings
function calculateSavings() {
    const initialAmount = parseFloat(document.getElementById('initialAmount').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const years = parseInt(document.getElementById('years').value);
    const savingsGoal = parseFloat(document.getElementById('savingsGoal').value) || 0;
    
    // Validate inputs
    if (isNaN(initialAmount) || initialAmount < 0) {
        alert('Please enter a valid initial capital');
        return;
    }
    
    if (isNaN(monthlyContribution) || monthlyContribution < 0) {
        alert('Please enter a valid monthly contribution');
        return;
    }
    
    if (isNaN(annualRate) || annualRate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (isNaN(years) || years <= 0) {
        alert('Please enter a valid period');
        return;
    }
    
    // Calculate compound interest with monthly contributions
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    let balance = initialAmount;
    let totalContributed = initialAmount;
    let yearlyData = [];
    let monthlyData = [];
    
    // Track goal achievement
    let goalMonthReached = 0;
    let goalReached = false;
    
    for (let month = 1; month <= months; month++) {
        // Add monthly contribution
        balance += monthlyContribution;
        totalContributed += monthlyContribution;
        
        // Add interest
        const interestEarned = balance * monthlyRate;
        balance += interestEarned;
        
        // Store monthly data
        monthlyData.push({
            month: month,
            balance: balance,
            contributed: totalContributed,
            interest: balance - totalContributed
        });
        
        // Check if goal is reached
        if (!goalReached && savingsGoal > 0 && balance >= savingsGoal) {
            goalMonthReached = month;
            goalReached = true;
        }
        
        // Store yearly data
        if (month % 12 === 0) {
            yearlyData.push({
                year: month / 12,
                balance: balance,
                contributed: totalContributed,
                interest: balance - totalContributed
            });
        }
    }
    
    const totalInterest = balance - totalContributed;
    const totalReturn = ((balance - totalContributed) / totalContributed * 100);
    
    // Display results
    document.getElementById('totalSaved').textContent = formatCurrency(balance);
    document.getElementById('totalContributed').textContent = formatCurrency(totalContributed);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalReturn').textContent = totalReturn.toFixed(2) + '%';
    
    // Show goal alert
    const alertBox = document.getElementById('goalAlert');
    if (savingsGoal > 0) {
        if (goalReached) {
            const yearsToGoal = Math.floor(goalMonthReached / 12);
            const monthsToGoal = goalMonthReached % 12;
            alertBox.className = 'alert-box alert-success';
            alertBox.innerHTML = `
                <strong>Goal reached!</strong> You'll achieve your goal of ${formatCurrency(savingsGoal)} 
                in <strong>${yearsToGoal} years${monthsToGoal > 0 ? ' and ' + monthsToGoal + ' months' : ''}</strong>.
            `;
        } else {
            alertBox.className = 'alert-box alert-warning';
            alertBox.innerHTML = `
                <strong>Goal not reached:</strong> At the end of ${years} years you'll have ${formatCurrency(balance)}, 
                which is <strong>${formatCurrency(savingsGoal - balance)}</strong> less than your goal. 
                Consider increasing your contributions or the savings period.
            `;
        }
    } else {
        alertBox.innerHTML = '';
    }
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate table
    generateSavingsTable(yearlyData);
    
    // Generate chart
    generateChart(monthlyData, totalContributed);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate savings table
function generateSavingsTable(yearlyData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatCurrency(data.contributed)}</td>
            <td>${formatCurrency(data.interest)}</td>
            <td>${formatCurrency(data.balance)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate chart
function generateChart(monthlyData, totalContributed) {
    const ctx = document.getElementById('savingsChart');
    
    if (savingsChart) {
        savingsChart.destroy();
    }
    
    // Prepare data for chart (show yearly points for clarity)
    const labels = [];
    const contributedData = [];
    const interestData = [];
    
    monthlyData.forEach((data, index) => {
        if (index % 12 === 0 || index === monthlyData.length - 1) {
            labels.push(`Year ${Math.ceil(data.month / 12)}`);
            contributedData.push(data.contributed);
            interestData.push(data.interest);
        }
    });
    
    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Contributions',
                    data: contributedData,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderColor: '#667eea',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Total with Interest',
                    data: contributedData.map((val, idx) => val + interestData[idx]),
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderColor: '#48bb78',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = formatCurrency(context.parsed.y);
                            return label + ': ' + value;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
