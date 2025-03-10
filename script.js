document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        category: document.getElementById('category').value,
        quantity: document.getElementById('quantity').value,
        productCost: document.getElementById('productCost').value,
        freight: document.getElementById('freight').value || 0,
        insurance: document.getElementById('insurance').value || 0
    };

    fetch('https://comexai-backend.onrender.com/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerHTML = `<p>${data.message}</p>`;
    })
    .catch(error => {
        document.getElementById('result').innerHTML = `<p>Error: ${error}</p>`;
    });
});