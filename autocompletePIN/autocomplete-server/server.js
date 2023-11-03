const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const data = require('./search.json');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var whitelist = ['https://dduubb.github.io'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

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
