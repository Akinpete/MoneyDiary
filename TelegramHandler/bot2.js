fetch('https://cardinal-advanced-buffalo.ngrok-free.app/recent_transaction', {
    method: 'GET'
})
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            console.log('No recent transactions found.');
        }
        recent_txn = data;
        renderRecentTransactions(data);                 
    })
    .catch(error => {
        console.error('Error fetching recent transactions:', error);
    });