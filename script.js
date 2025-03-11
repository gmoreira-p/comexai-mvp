document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        category: document.getElementById('category').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

    if (!formData.category) {
        document.getElementById('result').style.display = 'block';
        document.querySelector('#result .card-body').innerHTML = '<p class="text-danger">Please select a category.</p>';
        return;
    }
    if (isNaN(formData.quantity) || formData.quantity <= 0) {
        document.getElementById('result').style.display = 'block';
        document.querySelector('#result .card-body').innerHTML = '<p class="text-danger">Quantity must be a positive number.</p>';
        return;
    }
    if (isNaN(formData.productCost) || formData.productCost <= 0) {
        document.getElementById('result').style.display = 'block';
        document.querySelector('#result .card-body').innerHTML = '<p class="text-danger">Product cost must be a positive number.</p>';
        return;
    }

    document.getElementById('result').style.display = 'block';
    document.querySelector('#result .card-body').innerHTML = '<p>Loading...</p>';

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
        if (data.error) {
            document.querySelector('#result .card-body').innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
        } else {
            let resultHTML = '<h3 class="card-title">Import Cost Breakdown</h3>';
            resultHTML += `<p><strong>Total Product Cost:</strong> R$ ${data.total_product_cost.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Freight:</strong> R$ ${data.freight.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Insurance:</strong> R$ ${data.insurance.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Import Tax (II):</strong> R$ ${data.II.toFixed(2)}</p>`;
            resultHTML += `<p><strong>IPI:</strong> R$ ${data.IPI.toFixed(2)}</p>`;
            resultHTML += `<p><strong>ICMS:</strong> R$ ${data.ICMS.toFixed(2)}</p>`;
            resultHTML += `<p><strong>PIS:</strong> R$ ${data.PIS.toFixed(2)}</p>`;
            resultHTML += `<p><strong>COFINS:</strong> R$ ${data.COFINS.toFixed(2)}</p>`;
            resultHTML += `<p><strong>Total Import Cost:</strong> R$ ${data.total_import_cost.toFixed(2)}</p>`;
            document.querySelector('#result .card-body').innerHTML = resultHTML;
        }
    })
    .catch(error => {
        document.querySelector('#result .card-body').innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    });
});

document.getElementById('downloadPdf').addEventListener('click', function() {
    const formData = {
        category: document.getElementById('category').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

    if (!formData.category || isNaN(formData.quantity) || isNaN(formData.productCost)) {
        document.getElementById('result').style.display = 'block';
        document.querySelector('#result .card-body').innerHTML = '<p class="text-danger">Please complete the form before downloading.</p>';
        return;
    }

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
        document.getElementById('result').style.display = 'block';
        document.querySelector('#result .card-body').innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    });
});