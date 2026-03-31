// ===================================
// CALCULADORA DE PRÉSTAMO NEGOCIO - negocio.js (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let businessChart = null;

// Calcular préstamo de negocio
function calculateBusiness() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const months = parseInt(document.getElementById('loanMonths').value);
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    
    // Validar inputs
    if (isNaN(loanAmount) || loanAmount <= 0) {
        alert('Por favor, ingresa un monto de préstamo válido');
        return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert('Por favor, ingresa una tasa de interés válida');
        return;
    }
    
    if (isNaN(months) || months <= 0) {
        alert('Por favor, ingresa un plazo válido');
        return;
    }
    
    if (isNaN(monthlyIncome) || monthlyIncome < 0) {
        alert('Por favor, ingresa los ingresos mensuales válidos');
        return;
    }
    
    if (isNaN(monthlyExpenses) || monthlyExpenses < 0) {
        alert('Por favor, ingresa los gastos mensuales válidos');
        return;
    }
    
    // Calcular cuota mensual
    let monthlyPayment;
    if (interestRate === 0) {
        monthlyPayment = loanAmount / months;
    } else {
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Calcular totales
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;
    
    // Calcular flujo de caja
    const cashflow = monthlyIncome - monthlyExpenses - monthlyPayment;
    const incomePercent = (monthlyPayment / monthlyIncome) * 100;
    
    // Determinar capacidad de pago
    let paymentCapacity = '';
    let alertMessage = '';
    let showAlert = false;
    
    if (cashflow < 0) {
        paymentCapacity = '❌ Insuficiente';
        alertMessage = 'El flujo de caja es negativo. Los ingresos no cubren los gastos y el préstamo.';
        showAlert = true;
    } else if (incomePercent > 40) {
        paymentCapacity = '⚠️ Riesgoso';
        alertMessage = 'El préstamo compromete más del 40% de tus ingresos. Considera reducir el monto o aumentar el plazo.';
        showAlert = true;
    } else if (incomePercent > 30) {
        paymentCapacity = '⚠️ Aceptable';
        alertMessage = 'El préstamo compromete más del 30% de tus ingresos. Asegúrate de tener un colchón financiero.';
        showAlert = true;
    } else {
        paymentCapacity = '✅ Saludable';
    }
    
    // Mostrar resultados
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('cashflow').textContent = formatCurrency(cashflow);
    document.getElementById('cashflow').style.color = cashflow < 0 ? '#f56565' : '#48bb78';
    document.getElementById('incomePercent').textContent = incomePercent.toFixed(1) + '%';
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('paymentCapacity').textContent = paymentCapacity;
    
    // Mostrar alerta si es necesario
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
    
    // Mostrar sección de resultados
    document.getElementById('results').classList.add('show');
    
    // Generar tabla de amortización
    generateAmortizationTable(loanAmount, interestRate, months, monthlyPayment);
    
    // Generar gráfico de flujo de caja
    generateCashflowChart(monthlyIncome, monthlyExpenses, monthlyPayment);
    
    // Scroll suave a resultados
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generar tabla de amortización
function generateAmortizationTable(principal, annualRate, months, monthlyPayment) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    let balance = principal;
    const monthlyRate = annualRate / 100 / 12;
    
    for (let month = 1; month <= months; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        // Asegurar que el balance no sea negativo
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

// Generar gráfico de flujo de caja
function generateCashflowChart(income, expenses, payment) {
    const ctx = document.getElementById('businessChart');
    
    if (businessChart) {
        businessChart.destroy();
    }
    
    const cashflow = income - expenses - payment;
    const labels = [];
    const cashflowData = [];
    
    // Proyección de 12 meses
    for (let month = 1; month <= 12; month++) {
        labels.push('Mes ' + month);
        cashflowData.push(cashflow);
    }
    
    businessChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: Array(12).fill(income),
                    backgroundColor: 'rgba(72, 187, 120, 0.6)',
                    borderColor: '#48bb78',
                    borderWidth: 2
                },
                {
                    label: 'Gastos Operativos',
                    data: Array(12).fill(expenses),
                    backgroundColor: 'rgba(237, 137, 54, 0.6)',
                    borderColor: '#ed8936',
                    borderWidth: 2
                },
                {
                    label: 'Pago Préstamo',
                    data: Array(12).fill(payment),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Flujo de Caja Neto',
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
