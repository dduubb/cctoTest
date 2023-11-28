require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Configure database connection using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to read and parse the JSON file
const readJSONFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
};

// Function to insert a single JSON record into the database
const insertRecord = async (record, index) => {
  const client = await pool.connect();
  client.on('error', err => console.error('Unexpected error on idle client', err));

  try {
    // Modify this query based on your table structure and JSON object keys
    const queryText = 'INSERT INTO property_data (pin, taxpayer, address, param) VALUES ($1, $2, $3, $4)  ON CONFLICT (pin) DO NOTHING';
    await client.query(queryText, [record.PIN, record.TaxPayer, record.Address, record.param]);
    console.log(`${index}`);
    return true; // Indicates success
  } catch (err) {
    console.error(`Insertion error at record ${index}:`, err);
    await delay(1000); // Wait for 1 second before retrying
    return false; // Indicates failure
  } finally {
    client.release();
  }
};

// Function to iterate over JSON data and insert each record
const insertJSONData = async (jsonData) => {
  let lastSuccessfulIndex = -1;
  for (let i = 1276994; i < jsonData.length; i++) {
    const success = await insertRecord(jsonData[i], i);
    if (success) {
      lastSuccessfulIndex = i;
    } else {
      i = lastSuccessfulIndex; // Reset to the last successful index on failure
    }
  }
};

// Main function to execute the process
const main = async () => {
  try {
    const jsonData = await readJSONFile('./search.json'); // Replace with your file path
    await insertJSONData(jsonData);
  } catch (err) {
    console.error("Error:", err);
  }
};

main();
