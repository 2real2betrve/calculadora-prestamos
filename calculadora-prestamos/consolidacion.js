// ===================================
// CALCULADORA DE CONSOLIDACIÓN DE DEUDAS - consolidacion.js (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let consolidationChart = null;
let debtCounter = 0;
let debts = [];

// Agregar primera deuda al cargar
document.addEventListener('DOMContentLoaded', function() {
    addDebt();
    addDebt();
});

// Agregar nueva deuda
function addDebt() {
    debtCounter++;
    const debtList = document.getElementById('debtList');
    
    const debtItem = document.createElement('div');
    debtItem.className = 'debt-item';
    debtItem.id = `debt-${debtCounter}`;
    
    debtItem.innerHTML = `
        <div class="debt-item-header">
            <span class="debt-item-title">💳 Deuda #${debtCounter}</span>
            ${debtCounter > 1 ? `<button onclick="removeDebt(${debtCounter})" class="remove-debt-btn">✖ Eliminar</button>` : ''}
        </div>
        <div class="input-row">
            <div class="form-group">
                <label>Saldo (€)</label>
                <input type="number" id="balance-${debtCounter}" placeholder="5000" min="0" step="100">
            </div>
            <div class="form-group">
                <label>Tasa Anual (%)</label>
                <input type="number" id="rate-${debtCounter}" placeholder="15" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label>Cuota Mensual (€)</label>
                <input type="number" id="payment-${debtCounter}" placeholder="150" min="0" step="1">
            </div>
        </div>
    `;
    
    debtList.appendChild(debtItem);
}

// Eliminar deuda
function removeDebt(id) {
    const debtItem = document.getElementById(`debt-${id}`);
    if (debtItem) {
        debtItem.remove();
    }
}

// Calcular consolidación
function calculateConsolidation() {
    // Obtener todas las deudas
    debts = [];
    const debtItems = document.querySelectorAll('.debt-item');
    
    if (debtItems.length === 0) {
        alert('Por favor, agrega al menos una deuda');
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
            // Calcular intereses estimados de esta deuda
            const monthlyRate = rate / 100 / 12;
            let remainingBalance = balance;
            let totalInterestForDebt = 0;
            let months = 0;
            
            // Simular pagos hasta que se pague (máximo 360 meses)
            while (remainingBalance > 0 && months < 360) {
                const interestPayment = remainingBalance * monthlyRate;
                const principalPayment = payment - interestPayment;
                
                if (principalPayment <= 0) {
                    // Si el pago no cubre ni los intereses, asumimos intereses totales altos
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
        alert('Por favor, ingresa al menos una deuda con saldo y cuota válidos');
        return;
    }
    
    // Obtener datos del nuevo préstamo
    const newRate = parseFloat(document.getElementById('newRate').value);
    const newTerm = parseInt(document.getElementById('newTerm').value);
    
    if (isNaN(newRate) || newRate < 0) {
        alert('Por favor, ingresa una tasa de interés válida');
        return;
    }
    
    if (isNaN(newTerm) || newTerm <= 0) {
        alert('Por favor, ingresa un plazo válido');
        return;
    }
    
    // Calcular nuevo préstamo consolidado
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
    
    // Calcular totales actuales
    const currentTotalPayment = totalBalance + totalCurrentInterest;
    
    // Calcular ahorros
    const monthlySavings = totalMonthlyPayment - newMonthlyPayment;
    const totalSavings = currentTotalPayment - newTotalPayment;
    
    // Mostrar resultados
    document.getElementById('beforeMonthly').textContent = formatCurrency(totalMonthlyPayment);
    document.getElementById('beforeTotal').textContent = formatCurrency(currentTotalPayment);
    document.getElementById('beforeInterest').textContent = formatCurrency(totalCurrentInterest);
    
    document.getElementById('afterMonthly').textContent = formatCurrency(newMonthlyPayment);
    document.getElementById('afterTotal').textContent = formatCurrency(newTotalPayment);
    document.getElementById('afterInterest').textContent = formatCurrency(newTotalInterest);
    
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    
    // Mostrar alerta de recomendación
    const alertBox = document.getElementById('savingsAlert');
    if (totalSavings > 0 && monthlySavings > 0) {
        alertBox.className = 'alert-box alert-success';
        alertBox.innerHTML = `
            <strong>¡Excelente decisión!</strong> Consolidar te permitirá ahorrar 
            <strong>${formatCurrency(monthlySavings)}</strong> al mes y 
            <strong>${formatCurrency(totalSavings)}</strong> en total.
        `;
    } else if (monthlySavings > 0 && totalSavings < 0) {
        alertBox.className = 'alert-box alert-warning';
        alertBox.innerHTML = `
            <strong>Ten cuidado:</strong> Aunque tu cuota mensual bajará 
            <strong>${formatCurrency(monthlySavings)}</strong>, pagarás 
            <strong>${formatCurrency(Math.abs(totalSavings))}</strong> más en intereses totales 
            debido al plazo más largo.
        `;
    } else {
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = `
            <strong>No recomendado:</strong> Consolidar en estas condiciones no te ahorraría dinero. 
            Considera negociar una mejor tasa o mantener tus deudas actuales.
        `;
    }
    
    // Mostrar sección de resultados
    document.getElementById('results').classList.add('show');
    
    // Generar tabla de amortización
    generateAmortizationTable(totalBalance, newRate, newTerm, newMonthlyPayment);
    
    // Generar gráfico
    generateChart(totalMonthlyPayment, newMonthlyPayment, totalCurrentInterest, newTotalInterest);
    
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

// Generar gráfico de comparación
function generateChart(beforeMonthly, afterMonthly, beforeInterest, afterInterest) {
    const ctx = document.getElementById('consolidationChart');
    
    if (consolidationChart) {
        consolidationChart.destroy();
    }
    
    consolidationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cuota Mensual', 'Intereses Totales'],
            datasets: [
                {
                    label: 'Antes',
                    data: [beforeMonthly, beforeInterest],
                    backgroundColor: '#f56565',
                    borderColor: '#e53e3e',
                    borderWidth: 2
                },
                {
                    label: 'Después',
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

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}