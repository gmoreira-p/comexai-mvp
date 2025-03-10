document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        category: document.getElementById('category').value,
        quantity: document.getElementById('quantity').value,
        productCost: document.getElementById('productCost').value,
        freight: document.getElementById('freight').value || 0,
        insurance: document.getElementById('insurance').value || 0
    };
    document.getElementById('result').innerHTML = `<pre>${JSON.stringify(formData, null, 2)}</pre>`;
});