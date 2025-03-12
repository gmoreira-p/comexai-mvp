document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('state').addEventListener('change', function() {
        const customIcmsDiv = document.getElementById('customIcmsRate');
        if (this.value === 'Custom') {
            customIcmsDiv.style.display = 'block';
        } else {
            customIcmsDiv.style.display = 'none';
        }
    });

    document.getElementById('importForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = {
            ncm: document.getElementById('ncm').value.trim(),
            quantity: parseFloat(document.getElementById('quantity').value),
            productCostUsd: parseFloat(document.getElementById('productCost').value), // Now in USD
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value), // New field
            freight: parseFloat(document.getElementById('freight').value) || 0,
            insurance: parseFloat(document.getElementById('insurance').value) || 0,
            state: document.getElementById('state').value
        };

        if (formData.state === 'Custom') {
            const icmsRate = parseFloat(document.getElementById('icmsRate').value);
            if (isNaN(icmsRate) || icmsRate < 0 || icmsRate > 100) {
                const resultDiv = document.getElementById('result');
                const resultBody = document.querySelector('#result .card-body');
                resultDiv.style.display = 'block';
                resultBody.innerHTML = '<p class="text-danger">Custom ICMS rate must be between 0 and 100.</p>';
                return;
            }
            formData.icmsRate = icmsRate / 100;
        }

        const resultDiv = document.getElementById('result');
        const resultBody = document.querySelector('#result .card-body');
        const spinner = document.querySelector('.loading-spinner');

        if (!formData.ncm) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Please enter an NCM code.</p>';
            return;
        }
        if (isNaN(formData.quantity) || formData.quantity <= 0) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Quantity must be a positive number.</p>';
            return;
        }
        if (isNaN(formData.productCostUsd) || formData.productCostUsd <= 0) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Product cost must be a positive number.</p>';
            return;
        }
        if (isNaN(formData.exchangeRate) || formData.exchangeRate <= 0) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Exchange rate must be a positive number.</p>';
            return;
        }
        if (!formData.state) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Please select a state.</p>';
            return;
        }

        console.log("Sending calculate request with state:", formData.state, "ICMS Rate:", formData.icmsRate || 'Predefined');
        resultDiv.style.display = 'none';
        spinner.style.display = 'block';

        fetch('https://comexai-backend.onrender.com/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            spinner.style.display = 'none';
            resultDiv.style.display = 'block';
            resultBody.innerHTML = `
                <h3 class="card-title">Import Cost Breakdown for ${formData.state}${formData.state === 'Custom' ? ' (Custom ICMS: ' + (formData.icmsRate * 100).toFixed(2) + '%)' : ''}</h3>
                <div class="card mb-3">
                    <div class="card-header">Valor Aduaneiro (BRL)</div>
                    <div class="card-body">
                        <p>Product Cost: $${formData.productCostUsd.toFixed(2)} USD (R$ ${data.total_product_cost.toFixed(2)} BRL @ ${formData.exchangeRate.toFixed(2)})</p>
                        <p>Freight: R$ ${data.freight.toFixed(2)} BRL</p>
                        <p>Insurance: R$ ${data.insurance.toFixed(2)} BRL</p>
                        <p><strong>Total Valor Aduaneiro: R$ ${data.valor_aduaneiro.toFixed(2)} BRL</strong></p>
                    </div>
                </div>
                <div class="card mb-3">
                    <div class="card-header">Tributos Devidos no Desembaraço (BRL)</div>
                    <div class="card-body">
                        <p>II: R$ ${data.II.toFixed(2)}</p>
                        <p>IPI: R$ ${data.IPI.toFixed(2)}</p>
                        <p>PIS: R$ ${data.PIS.toFixed(2)}</p>
                        <p>COFINS: R$ ${data.COFINS.toFixed(2)}</p>
                        <p>ICMS: R$ ${data.ICMS.toFixed(2)}</p>
                        <p><strong>Total de Tributos: R$ ${data.total_tributos.toFixed(2)}</strong></p>
                    </div>
                </div>
                <div class="card mb-3">
                    <div class="card-header">Custo Líquido da Importação (BRL)</div>
                    <div class="card-body">
                        <p><strong>Total: R$ ${data.custo_liquido.toFixed(2)}</strong></p>
                        <p><strong>Cost Per Unit: R$ ${data.cost_per_unit.toFixed(2)}</strong></p>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error("Calculate fetch error:", error);
            spinner.style.display = 'none';
            resultDiv.style.display = 'block';
            resultBody.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        });
    });

    document.getElementById('downloadPdf').addEventListener('click', function() {
        const formData = {
            ncm: document.getElementById('ncm').value.trim(),
            quantity: parseFloat(document.getElementById('quantity').value),
            productCostUsd: parseFloat(document.getElementById('productCost').value),
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
            freight: parseFloat(document.getElementById('freight').value) || 0,
            insurance: parseFloat(document.getElementById('insurance').value) || 0,
            state: document.getElementById('state').value
        };

        if (formData.state === 'Custom') {
            const icmsRate = parseFloat(document.getElementById('icmsRate').value);
            if (isNaN(icmsRate) || icmsRate < 0 || icmsRate > 100) {
                const resultDiv = document.getElementById('result');
                const resultBody = document.querySelector('#result .card-body');
                resultDiv.style.display = 'block';
                resultBody.innerHTML = '<p class="text-danger">Custom ICMS rate must be between 0 and 100.</p>';
                return;
            }
            formData.icmsRate = icmsRate / 100;
        }

        const resultDiv = document.getElementById('result');
        const resultBody = document.querySelector('#result .card-body');
        const spinner = document.querySelector('.loading-spinner');

        if (!formData.ncm || isNaN(formData.quantity) || isNaN(formData.productCostUsd) || isNaN(formData.exchangeRate) || !formData.state) {
            resultDiv.style.display = 'block';
            resultBody.innerHTML = '<p class="text-danger">Please complete the form before downloading.</p>';
            return;
        }

        console.log("Sending PDF request with state:", formData.state, "ICMS Rate:", formData.icmsRate || 'Predefined');
        spinner.style.display = 'block';

        fetch('https://comexai-backend.onrender.com/generate_pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.headers.get('Content-Type').includes('application/json')) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Unknown server error');
                    });
                }
                throw new Error('Failed to generate PDF - Server error');
            }
            return response.blob();
        })
        .then(blob => {
            spinner.style.display = 'none';
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'import_cost_report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error("PDF fetch error:", error);
            spinner.style.display = 'none';
            resultDiv.style.display = 'block';
            resultBody.innerHTML = `<p class="text-danger">Error generating PDF: ${error.message}</p>`;
        });
    });
});