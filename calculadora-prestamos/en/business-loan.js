// ===================================
// BUSINESS LOAN CALCULATOR - business-loan.js (ENGLISH)
// Version: USD, locale en-US
// ===================================

let businessChart = null;

// Calculate business loan
function calculateBusiness() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const months = parseInt(document.getElementById('loanMonths').value);
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    
    // Validate inputs
    if (isNaN(loanAmount) || loanAmount <= 0) {
        alert('Please enter a valid loan amount');
        return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (isNaN(months) || months <= 0) {
        alert('Please enter a valid term');
        return;
    }
    
    if (isNaN(monthlyIncome) || monthlyIncome < 0) {
        alert('Please enter valid monthly income');
        return;
    }
    
    if (isNaN(monthlyExpenses) || monthlyExpenses < 0) {
        alert('Please enter valid monthly expenses');
        return;
    }
    
    // Calculate monthly payment
    let monthlyPayment;
    if (interestRate === 0) {
        monthlyPayment = loanAmount / months;
    } else {
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Calculate totals
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;
    
    // Calculate cashflow
    const cashflow = monthlyIncome - monthlyExpenses - monthlyPayment;
    const incomePercent = (monthlyPayment / monthlyIncome) * 100;
    
    // Determine payment capacity
    let paymentCapacity = '';
    let alertMessage = '';
    let showAlert = false;
    
    if (cashflow < 0) {
        paymentCapacity = '❌ Insufficient';
        alertMessage = 'Cashflow is negative. Income does not cover expenses and loan payment.';
        showAlert = true;
    } else if (incomePercent > 40) {
        paymentCapacity = '⚠️ Risky';
        alertMessage = 'Loan payment exceeds 40% of income. Consider reducing amount or extending term.';
        showAlert = true;
    } else if (incomePercent > 30) {
        paymentCapacity = '⚠️ Acceptable';
        alertMessage = 'Loan payment exceeds 30% of income. Ensure you have a financial buffer.';
        showAlert = true;
    } else {
        paymentCapacity = '✅ Healthy';
    }
    
    // Display results
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('cashflow').textContent = formatCurrency(cashflow);
    document.getElementById('cashflow').style.color = cashflow < 0 ? '#f56565' : '#48bb78';
    document.getElementById('incomePercent').textContent = incomePercent.toFixed(1) + '%';
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('paymentCapacity').textContent = paymentCapacity;
    
    // Show alert if necessary
    const alertBox = document.getElementById('cashflowAlert');
    if (showAlert) {
        document.getElementById('alertMessage').textContent = alertMessage;
        alertBox.style.display = 'block';
        alertBox.style.backgroundColor = cashflow < 0 ? '#fed7d7' : '#fef5e7';
        alertBox.style.color = cashflow < 0 ? '#c53030' : '#d97706';
        alertBox.style.border = cashflow < 0 ? '2px solid #fc8181' : '2px solid #fbbf24';
    } else {
        alertBox.style.display = 'none';
    }
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate amortization table
    generateAmortizationTable(loanAmount, interestRate, months, monthlyPayment);
    
    // Generate cashflow chart
    generateCashflowChart(monthlyIncome, monthlyExpenses, monthlyPayment);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate amortization table
function generateAmortizationTable(principal, annualRate, months, monthlyPayment) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    let balance = principal;
    const monthlyRate = annualRate / 100 / 12;
    
    for (let month = 1; month <= months; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        // Ensure balance is not negative
        if (balance < 0) balance = 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td>${formatCurrency(monthlyPayment)}</td>
            <td>${formatCurrency(principalPayment)}</td>
            <td>${formatCurrency(interestPayment)}</td>
            <td>${formatCurrency(balance)}</td>
        `;
        tableBody.appendChild(row);
    }
}

// Generate cashflow chart
function generateCashflowChart(income, expenses, payment) {
    const ctx = document.getElementById('businessChart');
    
    if (businessChart) {
        businessChart.destroy();
    }
    
    const cashflow = income - expenses - payment;
    const labels = [];
    const cashflowData = [];
    
    // 12-month projection
    for (let month = 1; month <= 12; month++) {
        labels.push('Month ' + month);
        cashflowData.push(cashflow);
    }
    
    businessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: Array(12).fill(income),
                    backgroundColor: 'rgba(72, 187, 120, 0.6)',
                    borderColor: '#48bb78',
                    borderWidth: 2
                },
                {
                    label: 'Operating Expenses',
                    data: Array(12).fill(expenses),
                    backgroundColor: 'rgba(237, 137, 54, 0.6)',
                    borderColor: '#ed8936',
                    borderWidth: 2
                },
                {
                    label: 'Loan Payment',
                    data: Array(12).fill(payment),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Net Cashflow',
                    data: cashflowData,
                    backgroundColor: cashflow >= 0 ? 'rgba(72, 187, 120, 0.8)' : 'rgba(245, 101, 101, 0.8)',
                    borderColor: cashflow >= 0 ? '#48bb78' : '#f56565',
                    borderWidth: 2,
                    type: 'line',
                    tension: 0
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
                            return '$' + value.toLocaleString('en-US');
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
