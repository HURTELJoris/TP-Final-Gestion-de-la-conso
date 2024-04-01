const express = require('express');
const bodyParser = require('body-parser');

// Classe Compteurs qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.

class Compteurs {
    // Constructeur de la classe Compteurs.
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        this.app.post('/data', (req, res) => this.handlePostRequest(req, res));

        this.proportionsTempVertStockees = [];
        // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix et déprendra de l'abonnement de temps pris par l'utilisateur (demander HUGO).
        this.MAX_SIZE = 10;
        this.previousSourceVerte = null;
    }

    //////////////////////////////////////////////////////////////////////////

    startServer() {
        const server = this.app.listen(3000, () => {
            console.log('Serveur HTTP démarré sur le port 3000');
        });
    }

    //////////////////////////////////////////////////////////////////////////

    handlePostRequest(req, res) {
        const { sourceVerte, tabPowerBox } = req.body;

        // Vérifiez si sourceVerte et tabPowerBox existent dans la requête
        if (sourceVerte !== undefined && tabPowerBox !== undefined) {
            this.boucle(sourceVerte, tabPowerBox);
            res.status(200).send('Données reçues');
        } else {
            res.status(400).send('Données invalides');
        }
    }

    //////////////////////////////////////////////////////////////////////////

    /**
      * Méthode pour calculer les proportions de temps vert en fonction de sourceVerte et tabPowerBox.
      
      * @param {number} sourceVerte - État de la source verte (0 ou 1).
      * @param {Array.<number>} tabPowerBox - Tableau représentant l'état des power boxes (0 ou 1).
      * @returns {Array.<string>} - Tableau des proportions de temps vert arrondies à deux décimales.
      */

    calculerProportionTempVert(sourceVerte, tabPowerBox) {
        const tempsPuissanceVerte = sourceVerte === 1 ? 5000 : 0;
        const tempsPuissanceBox = new Array(8).fill(0);

        for (let i = 0; i < tabPowerBox.length; i++) {
            if (tabPowerBox[i] === 1) {
                tempsPuissanceBox[i] = 5000;
            }
        }

        const proportionsTempVert = tempsPuissanceBox.map((tempsBox) => {
            if (tempsBox !== 0) {
                return (tempsPuissanceVerte / tempsBox) * 100;
            } else {
                return 0;
            }
        });

        const proportionsArrondies = proportionsTempVert.map((proportion) => {
            return parseFloat(proportion.toFixed(2));
        });

        if (this.proportionsTempVertStockees.length >= this.MAX_SIZE) {
            this.proportionsTempVertStockees.pop();
        }
        this.proportionsTempVertStockees.unshift(proportionsArrondies);

        return proportionsArrondies;
    }

    //////////////////////////////////////////////////////////////////////////

    //Méthode principale qui simule les données d'entrée/sortie et affiche les résultats en console.
    boucle(sourceVerte, tabPowerBox) {
        console.log(``);
        //const sourceVerte = Math.floor(Math.random() * 2); (UPDATE V2 HTTP)
        //const tabPowerBox = new Array(8).fill(0).map(() => Math.floor(Math.random() * 2)); (UPDATE V2 HTTP)

        console.log(`Valeur de sourceVerte : ${sourceVerte}`);
        console.log(`Valeurs de tabPowerBox : ${JSON.stringify(tabPowerBox)}`);
        console.log(``);

        const proportionsTempVert = this.calculerProportionTempVert(sourceVerte, tabPowerBox);
        console.log(`Proportions de temps vert : ${JSON.stringify(proportionsTempVert)}`);
        console.log(``);
        console.log(`Tableau de proportions : ${JSON.stringify(this.proportionsTempVertStockees)}`);
        console.log(``);

        const moyennesProportions = new Array(8).fill(0);
        for (let i = 0; i < this.proportionsTempVertStockees.length; i++) {
            for (let j = 0; j < this.proportionsTempVertStockees[i].length; j++) {
                moyennesProportions[j] += this.proportionsTempVertStockees[i][j];
            }
        }
        for (let i = 0; i < moyennesProportions.length; i++) {
            moyennesProportions[i] /= this.proportionsTempVertStockees.length;
            moyennesProportions[i] = parseFloat(moyennesProportions[i].toFixed(2));
        }

        console.log(`Moyennes des proportions de temps vert : ${JSON.stringify(moyennesProportions)}`);
        console.log(``);


        // Vérifier si la valeur de sourceVerte a changé
        if (this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte) {
            console.log(`La valeur de sourceVerte a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);

            // Appele de la méthode insertBoxData de l'instance energieRecordAPI
            for (let i = 0; i < 8; i++) {
                energieRecordAPI.insertBoxData(i + 1, tabPowerBox[i], sourceVerte, moyennesProportions[i]);
            }

        } else {
            console.log(``);
        }
        this.previousSourceVerte = sourceVerte;

        //const interval = Math.random() < 0.5 ? 2000 : 5000; (UPDATE V2 HTTP)
        //setTimeout(() => this.boucle(), interval); (UPDATE V2 HTTP)
    }
}

//////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();

const EnergieRecordAPI = require('./EnergieRecordAPI');
const energieRecordAPI = new EnergieRecordAPI('192.168.85.131', 'root', 'root', 'Conso', 8080);

compteurs.startServer();
//compteurs.boucle(); (UPDATE V2 HTTP)
energieRecordAPI.listen();