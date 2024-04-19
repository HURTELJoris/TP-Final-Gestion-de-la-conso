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
        //const { power_box, source_verte, proportion_temp_vert } = req;
        const power_box = req.powerbox;
        const source_verte = req.source_verte;
        const date = req.date;
        const proportion_temp_vert = req.proportion_temp_vert;
        
        // Vérifiez si les données nécessaires sont présentes dans la requête
        if (power_box == null|| source_verte == null || date == null || proportion_temp_vert == null) {
            //return res.status(400).send('Données manquantes');
            console.log('Données manquantes');
            console.log(power_box, source_verte, date, proportion_temp_vert);
        }

        this.connection.query(
            'INSERT INTO `box`(`power_box`, `source_verte`, `date`, `proportion_temp_vert`) VALUES (?, ?, ?, ?)',
            [power_box, source_verte, date, proportion_temp_vert] /* ,
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
        //const {PuissanceVerte, id_statut_box} = req;
        const PuissanceVerte = req.PuissanceVerte;
        const id_statut_box = req.id_statut_box;
        const date = req.date;
        
        // Vérifiez si les données nécessaires sont présentes dans la requête
        if (PuissanceVerte == null || id_statut_box == null || date == null) {
            //return res.status(400).send('Données manquantes');
            console.log('Données manquantes');
            console.log(PuissanceVerte, id_statut_box, date);
        }

        this.connection.query(
            'INSERT INTO `test`(`PuissanceVerte`, `id_statut_box`, `date`) VALUES (?, ?, ?)',
            [PuissanceVerte, id_statut_box, date] /* ,
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
                const {powerbox, source_verte, date, proportion_temp_vert} = item;
                //console.log(num_box, powerbox, source_verte, proportion_temp_vert);
                return {powerbox, source_verte, date, proportion_temp_vert };
                
            });

            // Afficher chaque objet dans la console
            //let i = 0;
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
                const {PuissanceVerte, id_statut_box, date} = item;
                return {PuissanceVerte, id_statut_box, date};
            });

            // Afficher chaque objet dans la console
            //let i = 0;
            boxes.forEach(box => {
                //console.log(box, i);
                //i++;
                energieRecordAPI.insertBoxDataAcces(box);
            });

            /// AJOUTER PLUS DE STATUT
            res.status(200).send(`Données insérées avec succès à : ${this.config.APICallbackURLAccesAbris}`);
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`BDD exécution sur le port ${this.port}`);
        });
    }
}

const energieRecordAPI = new EnergieRecordAPI('192.168.64.119', 'root', 'root', 'Conso', 8080);
energieRecordAPI.listen();