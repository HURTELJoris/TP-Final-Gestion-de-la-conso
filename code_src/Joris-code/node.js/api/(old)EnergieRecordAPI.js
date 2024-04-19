// EnergieRecordAPI_class.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const { assert } = require('console');

class EnergieRecordAPI {
    constructor(host, user, password, database, port) {
        this.app = express();
        this.port = port;
        this.connection = mysql.createConnection({
            host,
            user,
            password,
            database
        });

        this.app.use(bodyParser.json());
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });


         // Fichier qui gère les adresses sur lesquelles POST/GET
         fs.readFile("./config.json", "utf8", (error, data) => {
            if(error) console.log(error);
            assert(!error); // Quitte si erreur de chargement du fichier de configuration.
            this.config = JSON.parse(data);

            //console.log(this.config);
        });
    

        this.connectToDatabase();
        this.setupRoutes();



    }

    connectToDatabase() {
        this.connection.connect((error) => {
            if (error) {
                console.error('Erreur de connexion à la base de données :', error);
                throw error;
            }
            console.log('Connecté à la base de données MySQL');
        });
    }


    // Méthode permettant de convertir une variable de type Date en variable au format SQL DateTime
    generateDatabaseDateTime(date) {
        date.setHours(date.getHours() + 1);
        const p = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        }).formatToParts(date).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});

        return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
    }






    insertBoxData(req) {
        //const { num_box, power_box, source_verte, proportion_temp_vert } = req;
        const num_box = req.num_box;
        const power_box = req.powerbox;
        const source_verte = req.source_verte;
        const proportion_temp_vert = req.proportion_temp_vert;
        
        // Vérifiez si les données nécessaires sont présentes dans la requête
        if (num_box == null|| power_box == null|| source_verte == null || proportion_temp_vert == null) {
            //return res.status(400).send('Données manquantes');
            console.log('Données manquantes');
            console.log(num_box, power_box, source_verte, proportion_temp_vert);
        }

        this.connection.query(
            'INSERT INTO `box`(`num_box`, `power_box`, `source_verte`, `date`, `proportion_temp_vert`) VALUES (?, ?, ?, NOW(), ?)',
            [num_box, power_box, source_verte, proportion_temp_vert] /* ,
            (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'exécution de la requête SQL:', error);
                    return res.status(500).send('Erreur lors de l\'exécution de la requête SQL');
                } else {
                    console.log('Requête(s) SQL envoyée(s)');
                    return res.status(200).json({ data: req.body });
                }
            }
            */
        );

    }

    insertBoxDataAcces(req) {
        //const { num_box, power_box, source_verte, proportion_temp_vert } = req;
        const num_box = req.num_box;
        const PuissanceVerte = req.PuissanceVerte;
        const id_statut_box = req.id_statut_box;
        
        // Vérifiez si les données nécessaires sont présentes dans la requête
        if (num_box == null|| PuissanceVerte == null|| id_statut_box == null) {
            //return res.status(400).send('Données manquantes');
            console.log('Données manquantes');
            console.log(num_box, PuissanceVerte, id_statut_box);
        }

        this.connection.query(
            'INSERT INTO `test`(`num_box`, `PuissanceVerte`, `id_statut_box`, `date`) VALUES (?, ?, ?, NOW())',
            [num_box, PuissanceVerte, id_statut_box] /* ,
            (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'exécution de la requête SQL:', error);
                    return res.status(500).send('Erreur lors de l\'exécution de la requête SQL');
                } else {
                    console.log('Requête(s) SQL envoyée(s)');
                    return res.status(200).json({ data: req.body });
                }
            }
            */
        );

    }

    setupRoutes() {

        this.app.post('/insert', (req, res) => {
            const data = req.body;

            // Créer un nouveau tableau contenant chaque objet sous forme de variable séparée
            const boxes = data.map(item => {
                const { num_box, powerbox, source_verte, proportion_temp_vert } = item;
                //console.log(num_box, powerbox, source_verte, proportion_temp_vert);
                return { num_box, powerbox, source_verte, proportion_temp_vert };
                
            });

            // Afficher chaque objet dans la console
            let i = 0;
            boxes.forEach(box => {
                //console.log(box, i);
                //i++;
                energieRecordAPI.insertBoxData(box);
            });

            /// AJOUTER PLUS DE STATUT
            res.status(200).send(`Données insérées avec succès à : ${this.config.APICallbackURLBDD}`);
        });


        this.app.post('/insertAcces', (req, res) => {
            const data = req.body;

            // Créer un nouveau tableau contenant chaque objet sous forme de variable séparée
            const boxes = data.map(item => {
                const { num_box, PuissanceVerte, id_statut_box} = item;
                return { num_box, PuissanceVerte, id_statut_box };
            });

            // Afficher chaque objet dans la console
            let i = 0;
            boxes.forEach(box => {
                //console.log(box, i);
                //i++;
                energieRecordAPI.insertBoxDataAcces(box);
            });

            /// AJOUTER PLUS DE STATUT
            res.status(200).send(`Données insérées avec succès à : ${this.config.APICallbackURLAccesAbris}`);
        });
        /*

        // Route servant à récolter la dernière date à obtenir un nombre correspondant au jour du mois de la date, et à l'envoyer au front.

        this.app.post('/new/Classes/Compteur_Histo/PostDate', (req, res) => {
            this.connection.query('SELECT * FROM `Compteur Histo` ORDER BY Date DESC LIMIT 1;', (error, results) => {
                if (error) {
                    console.error('Erreur lors de la récupération du nombre de requêtes :', error);
                    res.status(500).send('Erreur lors de la récupération du nombre de requêtes');
                } else {
                    const date = results[0].Date;
                    date.setHours(date.getHours() + 1);
                    let number = date.getDate();
                    res.status(200).json({ number });
                }
            });
        });

        // Route servant à récolter le plus grand nombre de requête actuel et à l'envoyer au front

        this.app.post('/new/Classes/Compteur_Histo/PostNBRequetes', (req, res) => {
            this.connection.query('SELECT * FROM `Compteur Histo` ORDER BY Date DESC, Nb_Requetes DESC LIMIT 1;', (error, results) => {
                if (error) {
                    console.error('Erreur lors de la récupération du nombre de requêtes :', error);
                    res.status(500).send('Erreur lors de la récupération du nombre de requêtes');
                } else {
                    const nbrequetes = results[0].Nb_Requetes;
                    res.status(200).json({ nbrequetes });
                }
            });
        });

        // Route servant à envoyer les données récoltées au front vers la BDD

        this.app.post('/new/Classes/Compteur_Histo', (req, res) => {
            console.log(req.body);
            const channelName = req.body.channelName;
            const subscriberCount = req.body.subscriberCount;
            const NBRequetes = req.body.NBRequete;

            if (channelName != null && channelName !== '' && subscriberCount != null && NBRequetes != null) {
                let datenow = new Date();
                const datenow2 = generateDatabaseDateTime(datenow);

                this.connection.query(
                    'INSERT INTO `Compteur Histo` (`Nom_chaine`, `Abo_chaine`, `Nb_Requetes`, `Date`) VALUES (?, ?, ?, ?)',
                    [channelName, subscriberCount, NBRequetes, datenow2],
                    (error, results) => {
                        if (error) {
                            console.error('Erreur lors de l\'exécution de la requête :', error);
                            res.status(500).send('Erreur lors de l\'exécution de la requête');
                        }
                        else {
                            res.status(200).json({ data: req.body });
                        }
                    }
                );

            }
            else {
                res.status(400).send('Paramètres manquants ou invalides');
            }
        });
        */
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`BDD exécution sur le port ${this.port}`);
        });
    }
}

const energieRecordAPI = new EnergieRecordAPI('192.168.64.119', 'root', 'root', 'Conso', 8080);
energieRecordAPI.listen();