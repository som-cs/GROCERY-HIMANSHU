fetch('http://localhost:3000/add-product', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJSb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDE5MTkwMzAsImV4cCI6MTcwMTkyMjYzMH0.GR-eMk1wnJ6iuwgLYdk6M3FnDcUclfi7dFQ2_o8CVP4'
    },
    body: JSON.stringify({
        name: "Apple",
        price: 0.99,
        description: "Fresh green apple",
        category: "Fruits"
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => console.log(data))
.catch((error) => console.error('Error:', error));
