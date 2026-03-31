// ===================================
// CALCULADORA DE PRÉSTAMO AUTO - auto.js (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let autoChart = null;

// Sincronizar entrada en € con %
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

// Calcular préstamo auto
function calculateAuto() {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const months = parseInt(document.getElementById('loanMonths').value);
    const residualPercent = parseFloat(document.getElementById('residualValue').value) || 0;
    
    // Validar inputs
    if (isNaN(vehiclePrice) || vehiclePrice <= 0) {
        alert('Por favor, ingresa un precio de vehículo válido');
        return;
    }
    
    if (isNaN(downPayment) || downPayment < 0) {
        alert('Por favor, ingresa una entrada válida');
        return;
    }
    
    if (downPayment >= vehiclePrice) {
        alert('La entrada no puede ser mayor o igual al precio del vehículo');
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
    
    // Calcular monto a financiar
    const loanAmount = vehiclePrice - downPayment;
    
    // Calcular valor residual
    const residualValue = (vehiclePrice * residualPercent) / 100;
    const amountToFinance = loanAmount - residualValue;
    
    // Calcular cuota mensual (sobre el monto menos residual)
    let monthlyPayment;
    if (interestRate === 0) {
        monthlyPayment = amountToFinance / months;
    } else {
        const monthlyRate = interestRate / 100 / 12;
        monthlyPayment = (amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    // Total a pagar (cuotas + valor residual si existe)
    const totalPayment = (monthlyPayment * months) + residualValue;
    const totalInterest = totalPayment - loanAmount;
    
    // Mostrar resultados
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment + downPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    
    // Mostrar sección de resultados
    document.getElementById('results').classList.add('show');
    
    // Generar tabla de amortización
    generateAmortizationTable(amountToFinance, interestRate, months, monthlyPayment, residualValue);
    
    // Generar gráfico
    generateChart(loanAmount, totalInterest, downPayment);
    
    // Scroll suave a resultados
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generar tabla de amortización
function generateAmortizationTable(principal, annualRate, months, monthlyPayment, residualValue) {
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
    
    // Si hay valor residual, agregar fila final
    if (residualValue > 0) {
        const row = document.createElement('tr');
        row.style.backgroundColor = '#fff3cd';
        row.style.fontWeight = 'bold';
        row.innerHTML = `
            <td colspan="3">Pago Final (Valor Residual)</td>
            <td>${formatCurrency(residualValue)}</td>
            <td>€0</td>
        `;
        tableBody.appendChild(row);
    }
}

// Generar gráfico
function generateChart(loanAmount, totalInterest, downPayment) {
    const ctx = document.getElementById('autoChart');
    
    if (autoChart) {
        autoChart.destroy();
    }
    
    autoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entrada', 'Capital Financiado', 'Intereses Totales'],
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

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}