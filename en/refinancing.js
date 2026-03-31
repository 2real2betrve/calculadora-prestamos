// ===================================
// LOAN REFINANCING CALCULATOR - refinancing.js (ENGLISH)
// Version: USD, locale en-US
// ===================================

let refinancingChart = null;

// Calculate refinancing
function calculateRefinancing() {
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const currentRate = parseFloat(document.getElementById('currentRate').value);
    const remainingMonths = parseInt(document.getElementById('remainingMonths').value);
    const currentPayment = parseFloat(document.getElementById('currentPayment').value);
    const newRate = parseFloat(document.getElementById('newRate').value);
    const newMonths = parseInt(document.getElementById('newMonths').value);
    const refinancingCosts = parseFloat(document.getElementById('refinancingCosts').value);
    
    // Validate inputs
    if (isNaN(currentBalance) || currentBalance <= 0) {
        alert('Please enter a valid current balance');
        return;
    }
    
    if (isNaN(currentRate) || currentRate < 0) {
        alert('Please enter a valid current rate');
        return;
    }
    
    if (isNaN(remainingMonths) || remainingMonths <= 0) {
        alert('Please enter valid remaining months');
        return;
    }
    
    if (isNaN(currentPayment) || currentPayment <= 0) {
        alert('Please enter a valid monthly payment');
        return;
    }
    
    if (isNaN(newRate) || newRate < 0) {
        alert('Please enter a valid new rate');
        return;
    }
    
    if (isNaN(newMonths) || newMonths <= 0) {
        alert('Please enter a valid new term');
        return;
    }
    
    if (isNaN(refinancingCosts) || refinancingCosts < 0) {
        alert('Please enter valid refinancing costs');
        return;
    }
    
    // Calculate current loan
    const currentTotalPayment = currentPayment * remainingMonths;
    const currentInterest = currentTotalPayment - currentBalance;
    
    // Calculate new loan (balance + costs)
    const newLoanAmount = currentBalance + refinancingCosts;
    let newPayment;
    
    if (newRate === 0) {
        newPayment = newLoanAmount / newMonths;
    } else {
        const monthlyRate = newRate / 100 / 12;
        newPayment = (newLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, newMonths)) / 
                     (Math.pow(1 + monthlyRate, newMonths) - 1);
    }
    
    const newTotalPayment = newPayment * newMonths;
    const newInterest = newTotalPayment - newLoanAmount;
    
    // Calculate savings
    const monthlySavings = currentPayment - newPayment;
    const totalSavings = currentTotalPayment - newTotalPayment;
    const netSavings = totalSavings - refinancingCosts;
    
    // Calculate break-even point
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refinancingCosts / monthlySavings) : 0;
    
    // Determine recommendation
    let recommendationTitle = '';
    let recommendationMessage = '';
    let recommendationType = '';
    
    if (netSavings <= 0) {
        recommendationTitle = '❌ Not Recommended';
        recommendationMessage = 'Refinancing would not generate significant savings. Costs exceed benefits.';
        recommendationType = 'negative';
    } else if (breakEvenMonths > remainingMonths) {
        recommendationTitle = '⚠️ Questionable';
        recommendationMessage = 'Break-even point exceeds remaining term. Consider if it\'s worth it.';
        recommendationType = 'warning';
    } else if (breakEvenMonths > 24) {
        recommendationTitle = '⚠️ Consider Carefully';
        recommendationMessage = `It will take ${breakEvenMonths} months to recover costs. Make sure you keep the loan that long.`;
        recommendationType = 'warning';
    } else if (netSavings > 0 && breakEvenMonths <= 12) {
        recommendationTitle = '✅ Highly Recommended';
        recommendationMessage = `Excellent opportunity! You'll save ${formatCurrency(netSavings)} and recover costs in just ${breakEvenMonths} months.`;
        recommendationType = 'positive';
    } else {
        recommendationTitle = '✅ Recommended';
        recommendationMessage = `You'll save ${formatCurrency(netSavings)} with a break-even point of ${breakEvenMonths} months.`;
        recommendationType = 'positive';
    }
    
    // Display results
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('monthlySavings').style.color = monthlySavings > 0 ? '#48bb78' : '#f56565';
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    document.getElementById('breakEvenMonths').textContent = breakEvenMonths + ' months';
    document.getElementById('newPayment').textContent = formatCurrency(newPayment);
    document.getElementById('totalCosts').textContent = formatCurrency(refinancingCosts);
    document.getElementById('netSavings').textContent = formatCurrency(netSavings);
    document.getElementById('netSavings').style.color = netSavings > 0 ? '#48bb78' : '#f56565';
    
    // Display comparison details
    document.getElementById('currentPaymentDisplay').textContent = formatCurrency(currentPayment);
    document.getElementById('currentTotalPayment').textContent = formatCurrency(currentTotalPayment);
    document.getElementById('currentInterest').textContent = formatCurrency(currentInterest);
    document.getElementById('currentTerm').textContent = remainingMonths + ' months';
    
    document.getElementById('newPaymentDisplay').textContent = formatCurrency(newPayment);
    document.getElementById('newTotalPayment').textContent = formatCurrency(newTotalPayment);
    document.getElementById('newInterest').textContent = formatCurrency(newInterest);
    document.getElementById('newTerm').textContent = newMonths + ' months';
    
    // Show recommendation
    const alertBox = document.getElementById('recommendationAlert');
    document.getElementById('recommendationTitle').textContent = recommendationTitle;
    document.getElementById('recommendationMessage').textContent = recommendationMessage;
    alertBox.style.display = 'block';
    
    if (recommendationType === 'positive') {
        alertBox.style.backgroundColor = '#d4edda';
        alertBox.style.color = '#155724';
        alertBox.style.border = '2px solid #48bb78';
    } else if (recommendationType === 'warning') {
        alertBox.style.backgroundColor = '#fef5e7';
        alertBox.style.color = '#d97706';
        alertBox.style.border = '2px solid #fbbf24';
    } else {
        alertBox.style.backgroundColor = '#fed7d7';
        alertBox.style.color = '#c53030';
        alertBox.style.border = '2px solid #fc8181';
    }
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate comparison chart
    generateComparisonChart(currentTotalPayment, newTotalPayment, currentBalance, refinancingCosts, currentInterest, newInterest);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate comparison chart
function generateComparisonChart(currentTotal, newTotal, principal, costs, currentInterest, newInterest) {
    const ctx = document.getElementById('refinancingChart');
    
    if (refinancingChart) {
        refinancingChart.destroy();
    }
    
    refinancingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current Loan', 'Refinanced Loan'],
            datasets: [
                {
                    label: 'Principal',
                    data: [principal, principal],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Interest',
                    data: [currentInterest, newInterest],
                    backgroundColor: 'rgba(245, 101, 101, 0.8)',
                    borderColor: '#f56565',
                    borderWidth: 2
                },
                {
                    label: 'Refinancing Costs',
                    data: [0, costs],
                    backgroundColor: 'rgba(237, 137, 54, 0.8)',
                    borderColor: '#ed8936',
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
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
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
