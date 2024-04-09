// Importation du module axios pour les requêtes HTTP
const axios = require('axios');

// Classe Compteurs qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.

class Compteurs {
    // Constructeur de la classe Simulateur.
    constructor() {
        this.proportionsTempVertStockees = [];
        // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix et déprendra de l'abonnement de temps pris par l'utilisateur (demander HUGO).
        this.MAX_SIZE = 10;
        this.previousSourceVerte = null;
    }

    /**
     * Méthode pour communiquer avec l'API située à l'adresse IP 192.168.65.185.
     *
     * @param {Array} data - Tableau contenant les données à insérer dans l'API.
     * @returns {Promise<void>} - Une promesse qui se résout lorsque la requête HTTP est terminée.
     */
    async SendBoxDataInAPIToBDD(data) {
        try {
            // Envoi d'une requête POST à l'API pour insérer les données
            const response = await axios.post('http://192.168.65.185:8080/insert', data); // Changer le chemin lorsque Simon aura fait le code pour la box

            // Traitement de la réponse de l'API (à personnaliser en fonction de vos besoins)
            console.log('Réponse de l\'API :', response.data);
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API :', error.message);
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
    async boucle() {
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

            // Création du tableau de données à insérer dans l'API
            const data = [];
            for (let i = 0; i < 8; i++) {
                data.push({
                    num_box: i + 1,
                    powerbox: tabPowerBox[i],
                    source_verte: sourceVerte,
                    proportion_temp_vert: moyennesProportions[i]
                });
            }

            // Appel de la méthode SendBoxDataInAPIToBDD avec le tableau de données en paramètre
            await this.SendBoxDataInAPIToBDD(data);
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
compteurs.boucle();