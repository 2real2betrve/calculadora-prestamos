// ===================================
// DEBT CONSOLIDATION CALCULATOR - debt-consolidation.js (ENGLISH)
// Version: USD, locale en-US
// ===================================

let consolidationChart = null;
let debtCounter = 0;
let debts = [];

// Add first debt on load
document.addEventListener('DOMContentLoaded', function() {
    addDebt();
    addDebt();
});

// Add new debt
function addDebt() {
    debtCounter++;
    const debtList = document.getElementById('debtList');
    
    const debtItem = document.createElement('div');
    debtItem.className = 'debt-item';
    debtItem.id = `debt-${debtCounter}`;
    
    debtItem.innerHTML = `
        <div class="debt-item-header">
            <span class="debt-item-title">💳 Debt #${debtCounter}</span>
            ${debtCounter > 1 ? `<button onclick="removeDebt(${debtCounter})" class="remove-debt-btn">✖ Remove</button>` : ''}
        </div>
        <div class="input-row">
            <div class="form-group">
                <label>Balance ($)</label>
                <input type="number" id="balance-${debtCounter}" placeholder="5000" min="0" step="100">
            </div>
            <div class="form-group">
                <label>Annual Rate (%)</label>
                <input type="number" id="rate-${debtCounter}" placeholder="15" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label>Monthly Payment ($)</label>
                <input type="number" id="payment-${debtCounter}" placeholder="150" min="0" step="1">
            </div>
        </div>
    `;
    
    debtList.appendChild(debtItem);
}

// Remove debt
function removeDebt(id) {
    const debtItem = document.getElementById(`debt-${id}`);
    if (debtItem) {
        debtItem.remove();
    }
}

// Calculate consolidation
function calculateConsolidation() {
    // Get all debts
    debts = [];
    const debtItems = document.querySelectorAll('.debt-item');
    
    if (debtItems.length === 0) {
        alert('Please add at least one debt');
        return;
    }
    
    let totalBalance = 0;
    let totalMonthlyPayment = 0;
    let totalCurrentInterest = 0;
    
    debtItems.forEach((item, index) => {
        const id = item.id.split('-')[1];
        const balance = parseFloat(document.getElementById(`balance-${id}`)?.value) || 0;
        const rate = parseFloat(document.getElementById(`rate-${id}`)?.value) || 0;
        const payment = parseFloat(document.getElementById(`payment-${id}`)?.value) || 0;
        
        if (balance > 0 && payment > 0) {
            // Calculate estimated interest for this debt
            const monthlyRate = rate / 100 / 12;
            let remainingBalance = balance;
            let totalInterestForDebt = 0;
            let months = 0;
            
            // Simulate payments until paid off (max 360 months)
            while (remainingBalance > 0 && months < 360) {
                const interestPayment = remainingBalance * monthlyRate;
                const principalPayment = payment - interestPayment;
                
                if (principalPayment <= 0) {
                    // If payment doesn't even cover interest, assume high total interest
                    totalInterestForDebt = balance * 2;
                    break;
                }
                
                totalInterestForDebt += interestPayment;
                remainingBalance -= principalPayment;
                months++;
            }
            
            debts.push({
                balance,
                rate,
                payment,
                estimatedInterest: totalInterestForDebt
            });
            
            totalBalance += balance;
            totalMonthlyPayment += payment;
            totalCurrentInterest += totalInterestForDebt;
        }
    });
    
    if (totalBalance === 0) {
        alert('Please enter at least one debt with valid balance and payment');
        return;
    }
    
    // Get new loan data
    const newRate = parseFloat(document.getElementById('newRate').value);
    const newTerm = parseInt(document.getElementById('newTerm').value);
    
    if (isNaN(newRate) || newRate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (isNaN(newTerm) || newTerm <= 0) {
        alert('Please enter a valid term');
        return;
    }
    
    // Calculate new consolidated loan
    let newMonthlyPayment;
    if (newRate === 0) {
        newMonthlyPayment = totalBalance / newTerm;
    } else {
        const monthlyRate = newRate / 100 / 12;
        newMonthlyPayment = (totalBalance * monthlyRate * Math.pow(1 + monthlyRate, newTerm)) / 
                           (Math.pow(1 + monthlyRate, newTerm) - 1);
    }
    
    const newTotalPayment = newMonthlyPayment * newTerm;
    const newTotalInterest = newTotalPayment - totalBalance;
    
    // Calculate current totals
    const currentTotalPayment = totalBalance + totalCurrentInterest;
    
    // Calculate savings
    const monthlySavings = totalMonthlyPayment - newMonthlyPayment;
    const totalSavings = currentTotalPayment - newTotalPayment;
    
    // Display results
    document.getElementById('beforeMonthly').textContent = formatCurrency(totalMonthlyPayment);
    document.getElementById('beforeTotal').textContent = formatCurrency(currentTotalPayment);
    document.getElementById('beforeInterest').textContent = formatCurrency(totalCurrentInterest);
    
    document.getElementById('afterMonthly').textContent = formatCurrency(newMonthlyPayment);
    document.getElementById('afterTotal').textContent = formatCurrency(newTotalPayment);
    document.getElementById('afterInterest').textContent = formatCurrency(newTotalInterest);
    
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    
    // Show recommendation alert
    const alertBox = document.getElementById('savingsAlert');
    if (totalSavings > 0 && monthlySavings > 0) {
        alertBox.className = 'alert-box alert-success';
        alertBox.innerHTML = `
            <strong>Excellent decision!</strong> Consolidating will save you 
            <strong>${formatCurrency(monthlySavings)}</strong> per month and 
            <strong>${formatCurrency(totalSavings)}</strong> in total.
        `;
    } else if (monthlySavings > 0 && totalSavings < 0) {
        alertBox.className = 'alert-box alert-warning';
        alertBox.innerHTML = `
            <strong>Be careful:</strong> While your monthly payment will decrease by 
            <strong>${formatCurrency(monthlySavings)}</strong>, you'll pay 
            <strong>${formatCurrency(Math.abs(totalSavings))}</strong> more in total interest 
            due to the longer term.
        `;
    } else {
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = `
            <strong>Not recommended:</strong> Consolidating under these conditions won't save you money. 
            Consider negotiating a better rate or keeping your current debts.
        `;
    }
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate amortization table
    generateAmortizationTable(totalBalance, newRate, newTerm, newMonthlyPayment);
    
    // Generate chart
    generateChart(totalMonthlyPayment, newMonthlyPayment, totalCurrentInterest, newTotalInterest);
    
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

// Generate comparison chart
function generateChart(beforeMonthly, afterMonthly, beforeInterest, afterInterest) {
    const ctx = document.getElementById('consolidationChart');
    
    if (consolidationChart) {
        consolidationChart.destroy();
    }
    
    consolidationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monthly Payment', 'Total Interest'],
            datasets: [
                {
                    label: 'Before',
                    data: [beforeMonthly, beforeInterest],
                    backgroundColor: '#f56565',
                    borderColor: '#e53e3e',
                    borderWidth: 2
                },
                {
                    label: 'After',
                    data: [afterMonthly, afterInterest],
                    backgroundColor: '#48bb78',
                    borderColor: '#38a169',
                    borderWidth: 2
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
