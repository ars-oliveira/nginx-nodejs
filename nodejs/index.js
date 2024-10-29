const express = require('express');
const axios = require('axios').default;
const mysql = require('mysql2');

const app = express();
const port = 3000;

const dbConfig = {
  host: 'db',
  user: 'root',
  password: 'password',
  database: 'nodedb',
};

app.get('/', (_req, res) => {
  insertPeople(res);
});

app.listen(port, () => {
  console.log(`Application running on port...: ${port}`);
});

async function getRandomName() {
  const random = Math.floor(Math.random() * 10);
  const response = await axios.get('https://randomuser.me/api/?results=10&inc=name');
  return response.data.results[random].name.first;
}

async function insertPeople(res) {
  const name = await getRandomName();
  const connection = mysql.createConnection(dbConfig);

  const sqlTable = `CREATE TABLE IF NOT EXISTS people(id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, PRIMARY KEY(id))`;
  connection.query(sqlTable)
  
  const insertSql = `INSERT INTO people(name) values('${name}')`;

  connection.query(insertSql, (error, _results, _fields) => {
    if (error) {
      console.log(`Error inserting name: ${error}`);
      res.status(500).send('Error inserting name');
      return;
    }

    console.log(`${name} inserted successfully in the database!`);
    getAllPeople(res, connection);
  });
}

function getAllPeople(res, connection) {
  const SELECT_QUERY = `SELECT id, name FROM people`;

  connection.query(SELECT_QUERY, (error, results) => {
    if (error) {
      console.log(`Error getting people: ${error}`);
      res.status(500).send('Error getting people');
      return;
    }

    const tableRows = results
      .map(
        (person) => `
        <tr>
          <td>${person.id}</td>
          <td>${person.name}</td>
        </tr>
      `
      )
      .join('');
    const table = `
      <table>
        <tr>
          <th>#</th>
          <th>Name</th>
        </tr>${tableRows}
      </table>`;

    res.send(`
      <h1>Full Cycle Rocks!</h1>
      ${table}
    `);

    connection.end();
  });
}