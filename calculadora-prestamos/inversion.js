// ===================================
// CALCULADORA DE INVERSIÓN ROI - inversion.js (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let investmentChart = null;

// Calculate investment
function calculateInvestment() {
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualReturn = parseFloat(document.getElementById('annualReturn').value);
    const years = parseInt(document.getElementById('years').value);
    
    // Validate inputs
    if (isNaN(initialInvestment) || initialInvestment < 0) {
        alert('Por favor, ingresa una inversión inicial válida');
        return;
    }
    
    if (isNaN(monthlyContribution) || monthlyContribution < 0) {
        alert('Por favor, ingresa una aportación mensual válida');
        return;
    }
    
    if (isNaN(annualReturn) || annualReturn < 0) {
        alert('Por favor, ingresa un rendimiento anual válido');
        return;
    }
    
    if (isNaN(years) || years <= 0) {
        alert('Por favor, ingresa un período válido');
        return;
    }
    
    // Calculate compound returns with monthly contributions
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    
    let balance = initialInvestment;
    let totalInvested = initialInvestment;
    let yearlyData = [];
    let monthlyData = [];
    
    // Calculate projections for specific periods
    const projectionPeriods = [5, 10, 20, 30];
    let projections = [];
    
    for (let month = 1; month <= months; month++) {
        // Add monthly contribution
        balance += monthlyContribution;
        totalInvested += monthlyContribution;
        
        // Add returns
        const returnEarned = balance * monthlyRate;
        balance += returnEarned;
        
        // Store monthly data
        monthlyData.push({
            month: month,
            balance: balance,
            invested: totalInvested,
            gains: balance - totalInvested
        });
        
        // Store yearly data
        if (month % 12 === 0) {
            const currentYear = month / 12;
            yearlyData.push({
                year: currentYear,
                balance: balance,
                invested: totalInvested,
                gains: balance - totalInvested,
                roi: ((balance - totalInvested) / totalInvested * 100)
            });
        }
    }
    
    const totalGains = balance - totalInvested;
    const roiPercent = (totalGains / totalInvested * 100);
    
    // Calculate projections for specific periods
    projectionPeriods.forEach(period => {
        if (period <= years) {
            const yearData = yearlyData.find(y => y.year === period);
            if (yearData) {
                projections.push(yearData);
            }
        } else {
            // Calculate for periods beyond input years
            const additionalMonths = period * 12;
            let projBalance = initialInvestment;
            let projInvested = initialInvestment;
            
            for (let m = 1; m <= additionalMonths; m++) {
                projBalance += monthlyContribution;
                projInvested += monthlyContribution;
                projBalance += projBalance * monthlyRate;
            }
            
            projections.push({
                year: period,
                balance: projBalance,
                invested: projInvested,
                gains: projBalance - projInvested,
                roi: ((projBalance - projInvested) / projInvested * 100)
            });
        }
    });
    
    // Display results
    document.getElementById('finalValue').textContent = formatCurrency(balance);
    document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('totalGains').textContent = formatCurrency(totalGains);
    document.getElementById('roiPercent').textContent = roiPercent.toFixed(2) + '%';
    
    // Show results section
    document.getElementById('results').classList.add('show');
    
    // Generate table with projections
    generateInvestmentTable(projections, yearlyData);
    
    // Generate chart
    generateChart(yearlyData);
    
    // Smooth scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate investment table
function generateInvestmentTable(projections, yearlyData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // Add specific projections (5, 10, 20, 30 years)
    projections.forEach(data => {
        const row = document.createElement('tr');
        row.style.backgroundColor = '#f7fafc';
        row.style.fontWeight = 'bold';
        row.innerHTML = `
            <td>${data.year} años</td>
            <td>${formatCurrency(data.invested)}</td>
            <td>${formatCurrency(data.gains)}</td>
            <td>${formatCurrency(data.balance)}</td>
            <td>${data.roi.toFixed(2)}%</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add separator
    const separator = document.createElement('tr');
    separator.innerHTML = '<td colspan="5" style="background-color: #e2e8f0; height: 10px;"></td>';
    tableBody.appendChild(separator);
    
    // Add yearly breakdown
    yearlyData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Año ${data.year}</td>
            <td>${formatCurrency(data.invested)}</td>
            <td>${formatCurrency(data.gains)}</td>
            <td>${formatCurrency(data.balance)}</td>
            <td>${data.roi.toFixed(2)}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate chart
function generateChart(yearlyData) {
    const ctx = document.getElementById('investmentChart');
    
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    const labels = yearlyData.map(d => `Año ${d.year}`);
    const investedData = yearlyData.map(d => d.invested);
    const balanceData = yearlyData.map(d => d.balance);
    
    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Invertido',
                    data: investedData,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderColor: '#667eea',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Valor Total',
                    data: balanceData,
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
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
