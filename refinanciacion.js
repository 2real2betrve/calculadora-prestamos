// ===================================
// CALCULADORA DE REFINANCIACIÓN - refinanciacion.js (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let refinancingChart = null;

// Calcular refinanciación
function calculateRefinancing() {
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const currentRate = parseFloat(document.getElementById('currentRate').value);
    const remainingMonths = parseInt(document.getElementById('remainingMonths').value);
    const currentPayment = parseFloat(document.getElementById('currentPayment').value);
    const newRate = parseFloat(document.getElementById('newRate').value);
    const newMonths = parseInt(document.getElementById('newMonths').value);
    const refinancingCosts = parseFloat(document.getElementById('refinancingCosts').value);
    
    // Validar inputs
    if (isNaN(currentBalance) || currentBalance <= 0) {
        alert('Por favor, ingresa un saldo actual válido');
        return;
    }
    
    if (isNaN(currentRate) || currentRate < 0) {
        alert('Por favor, ingresa una tasa actual válida');
        return;
    }
    
    if (isNaN(remainingMonths) || remainingMonths <= 0) {
        alert('Por favor, ingresa los meses restantes válidos');
        return;
    }
    
    if (isNaN(currentPayment) || currentPayment <= 0) {
        alert('Por favor, ingresa una cuota mensual válida');
        return;
    }
    
    if (isNaN(newRate) || newRate < 0) {
        alert('Por favor, ingresa una nueva tasa válida');
        return;
    }
    
    if (isNaN(newMonths) || newMonths <= 0) {
        alert('Por favor, ingresa un nuevo plazo válido');
        return;
    }
    
    if (isNaN(refinancingCosts) || refinancingCosts < 0) {
        alert('Por favor, ingresa los costos de refinanciación válidos');
        return;
    }
    
    // Calcular préstamo actual
    const currentTotalPayment = currentPayment * remainingMonths;
    const currentInterest = currentTotalPayment - currentBalance;
    
    // Calcular nuevo préstamo (balance + costos)
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
    
    // Calcular ahorros
    const monthlySavings = currentPayment - newPayment;
    const totalSavings = currentTotalPayment - newTotalPayment;
    const netSavings = totalSavings - refinancingCosts;
    
    // Calcular punto de equilibrio
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refinancingCosts / monthlySavings) : 0;
    
    // Determinar recomendación
    let recommendationTitle = '';
    let recommendationMessage = '';
    let recommendationType = '';
    
    if (netSavings <= 0) {
        recommendationTitle = '❌ No Recomendado';
        recommendationMessage = 'La refinanciación no generaría ahorros significativos. Los costos superan el beneficio.';
        recommendationType = 'negative';
    } else if (breakEvenMonths > remainingMonths) {
        recommendationTitle = '⚠️ Dudoso';
        recommendationMessage = 'El punto de equilibrio supera el plazo restante. Considera si vale la pena.';
        recommendationType = 'warning';
    } else if (breakEvenMonths > 24) {
        recommendationTitle = '⚠️ Considera Cuidadosamente';
        recommendationMessage = `Tardarás ${breakEvenMonths} meses en recuperar los costos. Asegúrate de quedarte con el préstamo ese tiempo.`;
        recommendationType = 'warning';
    } else if (netSavings > 0 && breakEvenMonths <= 12) {
        recommendationTitle = '✅ Muy Recomendado';
        recommendationMessage = `¡Excelente oportunidad! Ahorrarás ${formatCurrency(netSavings)} y recuperarás los costos en solo ${breakEvenMonths} meses.`;
        recommendationType = 'positive';
    } else {
        recommendationTitle = '✅ Recomendado';
        recommendationMessage = `Ahorrarás ${formatCurrency(netSavings)} con un punto de equilibrio de ${breakEvenMonths} meses.`;
        recommendationType = 'positive';
    }
    
    // Mostrar resultados
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('monthlySavings').style.color = monthlySavings > 0 ? '#48bb78' : '#f56565';
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    document.getElementById('breakEvenMonths').textContent = breakEvenMonths + ' meses';
    document.getElementById('newPayment').textContent = formatCurrency(newPayment);
    document.getElementById('totalCosts').textContent = formatCurrency(refinancingCosts);
    document.getElementById('netSavings').textContent = formatCurrency(netSavings);
    document.getElementById('netSavings').style.color = netSavings > 0 ? '#48bb78' : '#f56565';
    
    // Mostrar detalles de comparación
    document.getElementById('currentPaymentDisplay').textContent = formatCurrency(currentPayment);
    document.getElementById('currentTotalPayment').textContent = formatCurrency(currentTotalPayment);
    document.getElementById('currentInterest').textContent = formatCurrency(currentInterest);
    document.getElementById('currentTerm').textContent = remainingMonths + ' meses';
    
    document.getElementById('newPaymentDisplay').textContent = formatCurrency(newPayment);
    document.getElementById('newTotalPayment').textContent = formatCurrency(newTotalPayment);
    document.getElementById('newInterest').textContent = formatCurrency(newInterest);
    document.getElementById('newTerm').textContent = newMonths + ' meses';
    
    // Mostrar recomendación
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
    
    // Mostrar sección de resultados
    document.getElementById('results').classList.add('show');
    
    // Generar gráfico de comparación
    generateComparisonChart(currentTotalPayment, newTotalPayment, currentBalance, refinancingCosts, currentInterest, newInterest);
    
    // Scroll suave a resultados
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generar gráfico de comparación
function generateComparisonChart(currentTotal, newTotal, principal, costs, currentInterest, newInterest) {
    const ctx = document.getElementById('refinancingChart');
    
    if (refinancingChart) {
        refinancingChart.destroy();
    }
    
    refinancingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Préstamo Actual', 'Préstamo Refinanciado'],
            datasets: [
                {
                    label: 'Capital',
                    data: [principal, principal],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Intereses',
                    data: [currentInterest, newInterest],
                    backgroundColor: 'rgba(245, 101, 101, 0.8)',
                    borderColor: '#f56565',
                    borderWidth: 2
                },
                {
                    label: 'Costos de Refinanciación',
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
                            return '€' + value.toLocaleString('es-ES');
                        }
                    }
                }
            }
        }
    });
}

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
