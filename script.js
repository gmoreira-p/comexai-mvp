document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        ncm: document.getElementById('ncm').value.trim(),
        quantity: parseFloat(document.getElementById('quantity').value),
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

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
    if (isNaN(formData.productCost) || formData.productCost <= 0) {
        resultDiv.style.display = 'block';
        resultBody.innerHTML = '<p class="text-danger">Product cost must be a positive number.</p>';
        return;
    }

    resultDiv.style.display = 'none';
    spinner.style.display = 'block';

    fetch('https://comexai-backend.onrender.com/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        spinner.style.display = 'none';
        resultDiv.style.display = 'block';
        if (data.error) {
            resultBody.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
        } else {
            let resultHTML = '<h3 class="card-title">Import Cost Breakdown</h3>';
            resultHTML += `<p><strong>NCM Code:</strong> ${formData.ncm}</p>`;
            resultHTML += `<p><strong>Total Product Cost:</strong> R$ ${data.total_product_cost.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Freight:</strong> R$ ${data.freight.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Insurance:</strong> R$ ${data.insurance.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Import Tax (II):</strong> R$ ${data.II.toFixed(2)}</p>`;
            resultHTML += `<p><strong>IPI:</strong> R$ ${data.IPI.toFixed(2)}</p>`;
            resultHTML += `<p><strong>ICMS:</strong> R$ ${data.ICMS.toFixed(2)}</p>`;
            resultHTML += `<p><strong>PIS:</strong> R$ ${data.PIS.toFixed(2)}</p>`;
            resultHTML += `<p><strong>COFINS:</strong> R$ ${data.COFINS.toFixed(2)}</p>`;
            resultHTML += `<p class="mt-2 fw-bold"><strong>Total Import Cost:</strong> R$ ${data.total_import_cost.toFixed(2)}</p>`;
            resultBody.innerHTML = resultHTML;
        }
    })
    .catch(error => {
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
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

    const resultDiv = document.getElementById('result');
    const resultBody = document.querySelector('#result .card-body');
    const spinner = document.querySelector('.loading-spinner');

    if (!formData.ncm || isNaN(formData.quantity) || isNaN(formData.productCost)) {
        resultDiv.style.display = 'block';
        resultBody.innerHTML = '<p class="text-danger">Please complete the form before downloading.</p>';
        return;
    }

    spinner.style.display = 'block';

    fetch('https://comexai-backend.onrender.com/generate_pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to generate PDF');
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
        spinner.style.display = 'none';
        resultDiv.style.display = 'block';
        resultBody.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    });
});