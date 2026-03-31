// ===================================
// CALCULADORA DE PRÉSTAMOS - SCRIPT.JS (ESPAÑOL)
// Versión: EUR, locale es-ES
// ===================================

let loanChart = null;

// Cambiar entre tabs
function switchTab(tab) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar el tab seleccionado
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Ocultar resultados cuando se cambia de tab
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('show');
    });
}

// Calcular préstamo personal
function calculatePersonal() {
    const amount = parseFloat(document.getElementById('amount').value);
    const interestRate = parseFloat(document.getElementById('interest').value);
    const months = parseInt(document.getElementById('months').value);
    
    // Validar inputs
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingresa un monto válido');
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
    
    // Calcular
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, months);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    // Mostrar resultados
    displayResults('personal-results', monthlyPayment, totalInterest, totalPayment);
    
    // Generar tabla de amortización
    generateAmortizationTable('personal-table', amount, interestRate, months, monthlyPayment);
    
    // Generar gráfico
    generateChart(amount, totalInterest);
}

// Calcular hipoteca
function calculateMortgage() {
    const amount = parseFloat(document.getElementById('mortgage-amount').value);
    const interestRate = parseFloat(document.getElementById('mortgage-interest').value);
    const years = parseInt(document.getElementById('mortgage-years').value);
    
    // Validar inputs
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingresa un monto válido');
        return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert('Por favor, ingresa una tasa de interés válida');
        return;
    }
    
    if (isNaN(years) || years <= 0) {
        alert('Por favor, ingresa un plazo válido');
        return;
    }
    
    const months = years * 12;
    
    // Calcular
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, months);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    // Mostrar resultados
    displayResults('mortgage-results', monthlyPayment, totalInterest, totalPayment);
    
    // Generar tabla de amortización
    generateAmortizationTable('mortgage-table', amount, interestRate, months, monthlyPayment);
    
    // Generar gráfico
    generateChart(amount, totalInterest);
}

// Fórmula para calcular pago mensual (PMT)
function calculateMonthlyPayment(principal, annualRate, months) {
    if (annualRate === 0) {
        return principal / months;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
    
    return payment;
}

// Mostrar resultados
function displayResults(sectionId, monthlyPayment, totalInterest, totalPayment) {
    const section = document.getElementById(sectionId);
    
    section.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <h3>💰 Cuota Mensual</h3>
                <div class="amount">${formatCurrency(monthlyPayment)}</div>
            </div>
            <div class="result-card">
                <h3>📊 Total Intereses</h3>
                <div class="amount">${formatCurrency(totalInterest)}</div>
            </div>
            <div class="result-card">
                <h3>💳 Total a Pagar</h3>
                <div class="amount">${formatCurrency(totalPayment)}</div>
            </div>
        </div>
    `;
    
    section.classList.add('show');
}

// Generar tabla de amortización
function generateAmortizationTable(tableId, principal, annualRate, months, monthlyPayment) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    
    let balance = principal;
    const monthlyRate = annualRate / 100 / 12;
    
    for (let month = 1; month <= months; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        // Corregir balance final por redondeo
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

// Generar gráfico con Chart.js
function generateChart(principal, interest) {
    const ctx = document.getElementById('loanChart');
    
    // Destruir gráfico anterior si existe
    if (loanChart) {
        loanChart.destroy();
    }
    
    loanChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Capital', 'Intereses'],
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

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Imprimir tabla de amortización
function printAmortization() {
    window.print();
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Establecer valores por defecto si existen los campos
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
