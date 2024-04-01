// Classe Simulateur qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.

class Compteurs {
    // Constructeur de la classe Simulateur.
    constructor() {
        this.proportionsTempVertStockees = [];
        this.MAX_SIZE = 10; // Ajustable au choix
        this.previousSourceVerte = null;
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
    boucle() {
        console.log(``);
        const sourceVerte = Math.floor(Math.random() * 2);
        const tabPowerBox = new Array(8).fill(0).map(() => Math.floor(Math.random() * 2));

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
                energieRecordAPI.insertBoxData(i + 1, tabPowerBox[i], sourceVerte, moyennesProportions[i]); //problème avec i
            }

        } else {
            console.log(``);
        }
        this.previousSourceVerte = sourceVerte;

        const interval = Math.random() < 0.5 ? 2000 : 5000;
        setTimeout(() => this.boucle(), interval);
    }
}

//////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();

const EnergieRecordAPI = require('./EnergieRecordAPI');
const energieRecordAPI = new EnergieRecordAPI('192.168.85.131', 'root', 'root', 'Conso', 8080);


compteurs.boucle();
energieRecordAPI.listen();
