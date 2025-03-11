// Calculation Form Submission
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
        if (data.error) {
            resultBody.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
        } else {
            // Display results (keep your existing result display code here)
            resultBody.innerHTML = `
                <h3 class="card-title">Import Cost Breakdown for ${formData.state}</h3>
                <!-- Add your result HTML here -->
            `;
        }
    })
    .catch(error => {
        spinner.style.display = 'none';
        resultDiv.style.display = 'block';
        resultBody.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    });
});

// PDF Download Button
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
                    throw new Error(data.error || 'Unknown error');
                });
            } else {
                throw new Error('Failed to generate PDF');
            }
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