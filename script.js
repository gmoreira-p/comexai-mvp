document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect and convert form data
    const formData = {
        category: document.getElementById('category').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        productCost: parseFloat(document.getElementById('productCost').value),
        freight: parseFloat(document.getElementById('freight').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

    // Validate inputs
    if (!formData.category) {
        document.getElementById('result').innerHTML = '<p>Please select a category.</p>';
        return;
    }
    if (isNaN(formData.quantity) || formData.quantity <= 0) {
        document.getElementById('result').innerHTML = '<p>Quantity must be a positive number.</p>';
        return;
    }
    if (isNaN(formData.productCost) || formData.productCost <= 0) {
        document.getElementById('result').innerHTML = '<p>Product cost must be a positive number.</p>';
        return;
    }

    // Show loading message
    document.getElementById('result').innerHTML = '<p>Loading...</p>';

    // Send request
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
            document.getElementById('result').innerHTML = `<p>Error: ${data.error}</p>`;
        } else {
            document.getElementById('result').innerHTML = `<p>${data.message || 'Calculation successful!'}</p>`;
            // Add more detailed output if backend provides it, e.g., data.totalCost
        }
    })
    .catch(error => {
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
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
        document.getElementById('result').innerHTML = '<p>Please complete the form before downloading.</p>';
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
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
    });
});