const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const winston = require('winston');

const app = express();
const port = 8080;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info({
    ip: req.ip,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

const connection = mysql.createConnection({
  host: '192.168.64.119',
  user: 'root',
  password: 'root',
  database: 'Conso'
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données avec l\'identifiant ' + connection.threadId);
});

app.get('/select', (req, res) => {
  const sql = 'SELECT id_capteur, luminosité, date FROM `capteur-luminosité` WHERE id_capteur != 1';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send('Erreur lors de la récupération des données.');
      logger.error({
        message: 'Erreur lors de la récupération des données',
        error: err
      });
      return;
    }

    res.json(results);
    logger.info({ message: 'Données sélectionnées avec succès' });
  });
});

app.post('/insert', (req, res) => {
  const { luminosite, date } = req.body;

  const sql = 'INSERT INTO `capteur-luminosité` (luminosité, date) VALUES (?, ?)';

  connection.query(sql, [luminosite, date], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send('Erreur lors de l\'insertion des données.');
      logger.error({
        message: 'Erreur lors de l\'insertion des données',
        error: err
      });
      return;
    }

    res.send('Ligne insérée avec succès.');
    logger.info({ message: 'Données insérées avec succès' });
  });
});

app.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { luminosite } = req.body;

  const sql = 'UPDATE `capteur-luminosité` SET luminosité = ? WHERE id_capteur = ?';

  connection.query(sql, [luminosite, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send('Erreur lors de la mise à jour des données.');
      logger.error({
        message: 'Erreur lors de la mise à jour des données',
        error: err
      });
      return;
    }

    res.send('Ligne mise à jour avec succès.');
    logger.info({ message: 'Données mises à jour avec succès' });
  });
});

app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM `capteur-luminosité` WHERE id_capteur = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send('Erreur lors de la suppression de la ligne.');
      logger.error({
        message: 'Erreur lors de la suppression de la ligne',
        error: err
      });
      return;
    }

    res.send('Ligne supprimée avec succès.');
    logger.info({ message: 'Données supprimées avec succès' });
  });
});

app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    ip: req.ip,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  res.status(500).send('Erreur interne du serveur');
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
