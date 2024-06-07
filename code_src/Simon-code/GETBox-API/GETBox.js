const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const winston = require('winston');
const bodyParser = require('body-parser');

const app = express();
const port = 8020;

const config = {
  apiKey: 'root'
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey || apiKey !== config.apiKey) {
    res.status(401).json({ message: 'Mot clé API invalide' });
    logger.error({
      message: 'Mot clé API invalide',
      ip: req.ip,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    return;
  }

  next();
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', apiKeyMiddleware);

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

const connection = mysql.createPool({
  host: '192.168.64.119',
  user: 'root',
  password: 'root',
  database: 'Conso'
});

app.get('/api/selectBox', (req, res) => {
  const sql = 'SELECT id_box, power_box, source_verte, date, ratio, proportion_temp_vert FROM `box`';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send({ message: 'Erreur lors de la récupération des données.' });
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


app.get('/api/selectRatioFromBox', (req, res) => {
  const sql = 'SELECT ratio FROM `box` ORDER BY id_box DESC LIMIT 1';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send({ message: 'Erreur lors de la récupération des données.' });
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

app.post('/api/insertBox', (req, res) => {

  req.body.forEach(element => {
    const{power_box, source_verte, date, ratio, proportion_temp_vert}=element;
    console.log('');
    console.log('powerbox :',power_box);
    console.log('source_verte :',source_verte);
    console.log('date :',date);
    console.log('ratio :',ratio);
    console.log('proportion_temp_vert :',proportion_temp_vert);
    
     // Vérifier que les valeurs sont correctes
 /* if (isNaN(power_box) || isNaN(source_verte) || isNaN(proportion_temp_vert) || !date) {
    res.status(400).send({ message: 'Erreur lors de l\'insertion des données. Vérifiez les valeurs envoyées.' });
    logger.error({
      message: 'Erreur lors de l\'insertion des données. Vérifiez les valeurs envoyées.',
      body: req.body
    });
    return;
  }*/

  const sql = 'INSERT INTO `box` (power_box, source_verte, date, ratio, proportion_temp_vert) VALUES (?, ?, ?, ?, ?)';

  connection.query(sql, [power_box, source_verte, date, ratio, proportion_temp_vert], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send({ message: 'Erreur lors de l\'insertion des données.' });
      logger.error({
        message: "Erreur lors de l'insertion des données",
        error: err
      });
      return;
    }
  })
    
    logger.info({ message: 'Données insérées avec succès' });
  });
  res.send({ message: 'Ligne insérée avec succès.' });
});

app.put('/api/updateBox/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { source_verte } = req.body;

  // Vérifier que la valeur est correcte
  if (isNaN(source_verte)) {
    res.status(400).send({ message: 'Erreur lors de la mise à jour des données. Vérifiez la valeur envoyée.' });
    logger.error({
      message: 'Erreur lors de la mise à jour des données. Vérifiez la valeur envoyée.',
      body: req.body
    });
    return;
  }

  const sql = 'UPDATE `box` SET source_verte = ? WHERE id_box = ?';

  connection.query(sql, [source_verte, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send({ message: 'Erreur lors de la mise à jour des données.' });
      logger.error({
        message: 'Erreur lors de la mise à jour des données',
        error: err
      });
      return;
    }

    res.send({ message: 'Ligne mise à jour avec succès.' });
    logger.info({ message: 'Données mises à jour avec succès' });
  });
});

app.delete('/api/deleteBox/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const sql = 'DELETE FROM `box` WHERE id_box = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
      res.status(500).send({ message: 'Erreur lors de la suppression de la ligne.' });
      logger.error({
        message: 'Erreur lors de la suppression de la ligne',
        error: err
      });
      return;
    }

    res.send({ message: 'Ligne supprimée avec succès.' });
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
  res.status(500).send({ message: 'Erreur interne du serveur' });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur <http://localhost:${port}>`);
});
