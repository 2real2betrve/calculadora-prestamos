// ===================================
// AUTO LOAN CALCULATOR - auto-loan.js (ENGLISH)
// Version: USD, locale en-US
// ===================================

let autoChart = null;

// Sync down payment in $ with %
document.getElementById('downPaymentPercent')?.addEventListener('input', function() {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value) || 0;
    const percent = parseFloat(this.value) || 0;
    const downPayment = (vehiclePrice * percent) / 100;
    document.getElementById('downPayment').value = Math.round(downPayment);
});

document.getElementById('downPayment')?.addEventListener('input', function() {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value) || 0;
    const downPayment = parseFloat(this.value) || 0;
    if (vehiclePrice > 0) {
        const percent = (downPayment / vehiclePrice) * 100;
        document.getElementById('downPaymentPercent').value = percent.toFixed(1);
    }
});

// Calculate auto loan
function calculateAuto() {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const months = parseInt(document.getElementById('loanMonths').value);
    const residualPercent = parseFloat(document.getElementById('residualValue').value) || 0;
    
    // Validate inputs
    if (isNaN(vehiclePrice) || vehiclePrice <= 0) {
        alert('Please enter a valid vehicle price');
        return;
    }
    
    if (isNaN(downPayment) || downPayment < 0) {
        alert('Please enter a valid down payment');
        return;
    }
    
    if (downPayment >= vehiclePrice) {
        alert('Down payment cannot be greater than or equal to vehicle price');
        return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (isNaN(months) || months <= 0) {
        alert('Please enter a valid loan term');
        return;
    }
    
    // Calculate loan amount
    const loanAmount = vehiclePrice - downPayment;
    
    // Calculate residual value
    const residualValue = (vehiclePrice * residualPercent) / 100;
    const amountToFinance = loanAmount - residualValue;
    
    // Calculate monthly payment (on amount minus residual)
    let monthlyPayment;
    if (interestRate === 0) {
        monthlyPayment = amountToFinance / months;
    } else {
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = (amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Total payment (payments + residual value if exists)
    const totalPayment = (monthlyPayment * months) + residualValue;
    const totalInterest = totalPayment - loanAmount;
    
    // Display results
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment + downPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate amortization table
    generateAmortizationTable(amountToFinance, interestRate, months, monthlyPayment, residualValue);
    
    // Generate chart
    generateChart(loanAmount, totalInterest, downPayment);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate amortization table
function generateAmortizationTable(principal, annualRate, months, monthlyPayment, residualValue) {
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
    
    // If there's residual value, add final row
    if (residualValue > 0) {
        const row = document.createElement('tr');
        row.style.backgroundColor = '#fff3cd';
        row.style.fontWeight = 'bold';
        row.innerHTML = `
            <td colspan="3">Final Payment (Residual Value)</td>
            <td>${formatCurrency(residualValue)}</td>
            <td>$0</td>
        `;
        tableBody.appendChild(row);
    }
}

// Generate chart
function generateChart(loanAmount, totalInterest, downPayment) {
    const ctx = document.getElementById('autoChart');
    
    if (autoChart) {
        autoChart.destroy();
    }
    
    autoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Down Payment', 'Financed Principal', 'Total Interest'],
            datasets: [{
                data: [downPayment, loanAmount, totalInterest],
                backgroundColor: [
                    '#48bb78',
                    '#667eea',
                    '#f56565'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
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
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            return label + ': ' + value;
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