document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        ncm: document.getElementById('ncm').value.trim(),
        quantity: parseFloat(document.getElementById('quantity').value),
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0,
        state: document.getElementById('state').value
    };

    const resultDiv = document.getElementById('result');
    const resultBody = document.querySelector('#result .card-body');
    const spinner = document.querySelector('.loading-spinner');

    // Basic validation
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
    if (isNaN(formData.productCost) || formData.productCost <= 0) {
        resultDiv.style.display = 'block';
        resultBody.innerHTML = '<p class="text-danger">Product cost must be a positive number.</p>';
        return;
    }
    if (!formData.state) {
        resultDiv.style.display = 'block';
        resultBody.innerHTML = '<p class="text-danger">Please select a state.</p>';
        return;
    }

    console.log("Sending calculate request with state:", formData.state);  // Updated debug log
    resultDiv.style.display = 'none';
    spinner.style.display = 'block';

    fetch('https://comexai-backend.onrender.com/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("Calculate response status:", response.status);
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Unknown error');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Received data:", data);
        spinner.style.display = 'none';
        resultDiv.style.display = 'block';
        resultBody.innerHTML = `
            <h3 class="card-title">Import Cost Breakdown for ${formData.state}</h3>
            <div class="card mb-3">
                <div class="card-header">Valor Aduaneiro</div>
                <div class="card-body">
                    <p>Product Cost: R$ ${data.total_product_cost.toFixed(2)}</p>
                    <p>Freight: R$ ${data.freight.toFixed(2)}</p>
                    <p>Insurance: R$ ${data.insurance.toFixed(2)}</p>
                    <p><strong>Total Valor Aduaneiro: R$ ${data.valor_aduaneiro.toFixed(2)}</strong></p>
                </div>
            </div>
            <div class="card mb-3">
                <div class="card-header">Tributos Devidos no Desembaraço</div>
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
                <div class="card-header">Custo Líquido da Importação</div>
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
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0,
        state: document.getElementById('state').value
    };

    const resultDiv = document.getElementById('result');
    const resultBody = document.querySelector('#result .card-body');
    const spinner = document.querySelector('.loading-spinner');

    if (!formData.ncm || isNaN(formData.quantity) || isNaN(formData.productCost) || !formData.state) {
        resultDiv.style.display = 'block';
        resultBody.innerHTML = '<p class="text-danger">Please complete the form before downloading.</p>';
        return;
    }

    console.log("Sending PDF request with state:", formData.state);  // Updated debug log
    spinner.style.display = 'block';

    fetch('https://comexai-backend.onrender.com/generate_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("PDF Response status:", response.status, "Headers:", response.headers.get('Content-Type'));
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
        console.log("PDF Blob received:", blob.size, "bytes");
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