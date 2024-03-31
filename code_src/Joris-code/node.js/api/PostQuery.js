/*
Node.js : recevoir une requête POST avec le module Express de node.js
Pour traiter une requête POST avec Express en Node.js, vous pouvez utiliser le code suivant en utilisant le code d'envoi POST de cette leçon . Dans cet exemple, nous supposons que vous envoyez des données JSON au serveur. ( login et mdp 
*/

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080; //on 80 si apache est fermé

// Middleware pour analyser les données JSON du corps de la requête POST
app.use(bodyParser.json());


const Host = '192.168.85.131';
const User = 'root';
const Password = 'root';
const DataBase = 'Conso';

// Fonction permettant de se connecter à une base de données.
function ConnexionBDD(host_, user_, password_, database_) {
  const mysql = require('mysql');

  // Configuration de la connexenion à la base de données
  const connection = mysql.createConnection({
    host: host_, // L'hôte de la base de données
    user: user_, // Votre nom d'utilisateur MySQL
    password: password_, // Votre mot de passe MySQL
    database: database_ // Le nom de votre base de données
  });


  // Connexion à la base de données
  connection.connect((error) => {
    if (error) {
      console.error('Erreur de connexion à la base de données :', error);
      throw error;
    }
    console.log('Connecté à la base de données MySQL');
  });

  return connection;
}

const connection = ConnexionBDD(Host, User, Password, DataBase);


// Exemple en Node.js (Express)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Vous pouvez restreindre l'origine en fonction de vos besoins.
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Gestionnaire de route pour la soumission de la requête POST


// Route servant à récolter la dernière date à obtenir un nombre correspondant au jour du mois de la date, et à l'envoyer au front.
app.post('/new/Classes/Compteur_Histo/PostDate', (req, res) => {
  connection.query('SELECT * FROM `Compteur Histo` ORDER BY Date DESC LIMIT 1;', (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération du nombre de requêtes :', error);
      res.status(500).send('Erreur lors de la récupération du nombre de requêtes');
    } else {
      const date = results[0].Date;
      date.setHours(date.getHours() + 1);
      //console.log(results[0].Date);
      //console.log(date.getDay());
      let number = date.getDate();
      res.status(200).json({ number });
    }
  });
});

// Route servant à récolter le plus grand nombre de requête actuel et à l'envoyer au front
app.post('/new/Classes/Compteur_Histo/PostNBRequetes', (req, res) => {
  connection.query('SELECT * FROM `Compteur Histo` ORDER BY Date DESC, Nb_Requetes DESC LIMIT 1;', (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération du nombre de requêtes :', error);
      res.status(500).send('Erreur lors de la récupération du nombre de requêtes');
    } else {
      const nbrequetes = results[0].Nb_Requetes;
      //console.log(results[0].Nb_Requetes);
      res.status(200).json({ nbrequetes });
    }
  });
});


// Route servant à envoyer les données récoltées au front vers la BDD
app.post('/new/Classes/Compteur_Histo', (req, res) => {
  console.log(req.body);
  const channelName = req.body.channelName;
  //console.log(channelName);
  const subscriberCount = req.body.subscriberCount;
  const NBRequetes = req.body.NBRequete;
  //console.log(NBRequetes);


  if (channelName != null && channelName !== '' && subscriberCount != null && NBRequetes != null) {
    //console.log(channelName);
    let datenow = new Date();
    const datenow2 = generateDatabaseDateTime(datenow);

    connection.query(
      'INSERT INTO `Compteur Histo` (`Nom_chaine`, `Abo_chaine`, `Nb_Requetes`, `Date`) VALUES (?, ?, ?, ?)',
      [channelName, subscriberCount, NBRequetes, datenow2],
      (error, results) => {
        if (error) {
          console.error('Erreur lors de l\'exécution de la requête :', error);
          res.status(500).send('Erreur lors de l\'exécution de la requête');
        }
        else {
          // Vous pouvez manipuler les résultats de la requête ici
          res.status(200).json({ data: req.body }); // Envoie des résultats en tant que réponse JSON
        }
      }
    );

  }
  else {
    res.status(400).send('Paramètres manquants ou invalides');
  }

  //res.json({data : req.body }); // ajouté 'test:'
});


app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});