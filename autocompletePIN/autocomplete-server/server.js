const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const data = require('./search.json');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data (in reality, you'll likely query a database)
//const data = [
    // Your 2 million records go here...
//];

app.get('/search-endpoint', (req, res) => {
    const query = req.query.query.toLowerCase();
    const results = data.filter(item => 
        item.TaxpayerName.toLowerCase().includes(query) || 
        item.PIN.toLowerCase().includes(query) || 
        item.Address.toLowerCase().includes(query)
    ).slice(0, 20);  // Return top 20 results
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
