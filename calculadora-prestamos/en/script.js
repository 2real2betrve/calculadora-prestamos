// ===================================
// CALCULADORA DE PRÉSTAMOS - SCRIPT.JS (ENGLISH)
// Version: USD, locale en-US
// ===================================

let loanChart = null;

// Switch between tabs
function switchTab(tab) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate selected tab
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Hide results when switching tabs
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('show');
    });
}

// Calculate personal loan
function calculatePersonal() {
    const amount = parseFloat(document.getElementById('amount').value);
    const interestRate = parseFloat(document.getElementById('interest').value);
    const months = parseInt(document.getElementById('months').value);
    
    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
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
    
    // Calculate
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, months);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    // Display results
    displayResults('personal-results', monthlyPayment, totalInterest, totalPayment);
    
    // Generate amortization table
    generateAmortizationTable('personal-table', amount, interestRate, months, monthlyPayment);
    
    // Generate chart
    generateChart(amount, totalInterest);
}

// Calculate mortgage
function calculateMortgage() {
    const amount = parseFloat(document.getElementById('mortgage-amount').value);
    const interestRate = parseFloat(document.getElementById('mortgage-interest').value);
    const years = parseInt(document.getElementById('mortgage-years').value);
    
    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (isNaN(years) || years <= 0) {
        alert('Please enter a valid term');
        return;
    }
    
    const months = years * 12;
    
    // Calculate
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, months);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    // Display results
    displayResults('mortgage-results', monthlyPayment, totalInterest, totalPayment);
    
    // Generate amortization table
    generateAmortizationTable('mortgage-table', amount, interestRate, months, monthlyPayment);
    
    // Generate chart
    generateChart(amount, totalInterest);
}

// Formula to calculate monthly payment (PMT)
function calculateMonthlyPayment(principal, annualRate, months) {
    if (annualRate === 0) {
        return principal / months;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
    
    return payment;
}

// Display results
function displayResults(sectionId, monthlyPayment, totalInterest, totalPayment) {
    const section = document.getElementById(sectionId);
    
    section.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <h3>💰 Monthly Payment</h3>
                <div class="amount">${formatCurrency(monthlyPayment)}</div>
            </div>
            <div class="result-card">
                <h3>📊 Total Interest</h3>
                <div class="amount">${formatCurrency(totalInterest)}</div>
            </div>
            <div class="result-card">
                <h3>💳 Total Amount</h3>
                <div class="amount">${formatCurrency(totalPayment)}</div>
            </div>
        </div>
    `;
    
    section.classList.add('show');
}

// Generate amortization table
function generateAmortizationTable(tableId, principal, annualRate, months, monthlyPayment) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    
    let balance = principal;
    const monthlyRate = annualRate / 100 / 12;
    
    for (let month = 1; month <= months; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        // Correct final balance for rounding
        if (month === months) {
            balance = 0;
        }
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${month}</td>
            <td>${formatCurrency(monthlyPayment)}</td>
            <td>${formatCurrency(principalPayment)}</td>
            <td>${formatCurrency(interestPayment)}</td>
            <td>${formatCurrency(Math.max(0, balance))}</td>
        `;
    }
}

// Generate chart with Chart.js
function generateChart(principal, interest) {
    const ctx = document.getElementById('loanChart');
    
    // Destroy previous chart if exists
    if (loanChart) {
        loanChart.destroy();
    }
    
    loanChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: [
                    '#667eea',
                    '#f56565'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.parsed);
                            return label;
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

// Print amortization table
function printAmortization() {
    window.print();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default values if fields exist
    const amountField = document.getElementById('amount');
    if (amountField && !amountField.value) {
        amountField.value = '10000';
    }
    
    const interestField = document.getElementById('interest');
    if (interestField && !interestField.value) {
        interestField.value = '5.5';
    }
    
    const monthsField = document.getElementById('months');
    if (monthsField && !monthsField.value) {
        monthsField.value = '24';
    }
    
    const mortgageAmountField = document.getElementById('mortgage-amount');
    if (mortgageAmountField && !mortgageAmountField.value) {
        mortgageAmountField.value = '150000';
    }
    
    const mortgageInterestField = document.getElementById('mortgage-interest');
    if (mortgageInterestField && !mortgageInterestField.value) {
        mortgageInterestField.value = '3.5';
    }
    
    const mortgageYearsField = document.getElementById('mortgage-years');
    if (mortgageYearsField && !mortgageYearsField.value) {
        mortgageYearsField.value = '20';
    }
});
