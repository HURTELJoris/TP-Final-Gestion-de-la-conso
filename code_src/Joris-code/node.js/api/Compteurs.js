// Importation du module axios pour les requêtes HTTP
const axios = require('axios');
// Importation du module net pour les sockets avec le CPP
const net = require('net');

const fs = require('fs');
const { assert } = require('console');

// Classe Compteurs qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.
class Compteurs {
    // Constructeur de la classe Simulateur.
    constructor() {
        this.proportionsTempVertStockees = [];
        // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix et déprendra de l'abonnement de temps pris par l'utilisateur (demander HUGO).
        this.MAX_SIZE = 10;
        this.previousSourceVerte = null;
        this.previoustabPowerBox = null;

        // Fichier qui gère les adresses sur lesquelles POST/GET
        fs.readFile("./config.json", "utf8", (error, data) => {
            if (error) console.log(error);
            assert(!error); // Quitte si erreur de chargement du fichier de configuration.
            this.config = JSON.parse(data);

            //console.log(this.config);
        });
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * Méthode pour écouter les données provenant d'un code C++ via une communication socket.
     *
    * @returns {Promise<void>} - Une promesse qui se résout lorsque les données ont été reçues et traitées.
     */
    async ecouterDonneesCpp() {
        // Création d'un serveur socket pour écouter les données provenant du code C++
        const server = net.createServer((socket) => {
            console.log('Connexion socket établie avec le code C++');

            // Gestion des données reçues du code C++
            let dataReceived = '';
            socket.on('data', (data) => {

                dataReceived += data.toString().split('\n').join('</json>\n<json>');
                dataReceived += '\n';
                const jsonData = dataReceived.split('</json>\n<json>').filter(line => line.trim() !== '');
                const parsedData = jsonData.map(line => JSON.parse(line));

                //console.log(parsedData.length);
                //console.log('Données reçues du code C++ :', dataReceived);

                dataReceived = '';

                for (const data of parsedData) {
                    // Vérifier si toutes les données ont été reçues. Si toutes les données sont reçues, alors on les affiche et on les envoie au programme principal.
                    if (data.sourceVerte !== null && data.tabPowerBox !== null && Object.values(data.tabPowerBox).every(value => value !== null)) {

                        data.sourceVerte = Number(data.sourceVerte);
                        data.tabPowerBox = Object.values(data.tabPowerBox).map(Number);

                        console.log('Données reçues du code C++ :');
                        console.table(data);
                        this.boucle(data);
                    }
                }
            });


            // Gestion de la fermeture de la connexion socket par le code C++
            socket.on('end', () => {
                console.log('Connexion socket fermée par le code C++');
            });

            // Gestion des erreurs lors de la communication socket
            socket.on('error', (error) => {

                console.error('Erreur lors de la communication socket avec le code C++ :', error.message);

            });
        });

        // Écoute des connexions socket entrantes du code C++
        server.listen(1234, '192.168.64.88', () => {
            console.log('Serveur socket en écoute sur l\'adresse IP 192.168.64.88 et le port 1234');
        });

        // Gestion de la fermeture du serveur socket
        server.on('close', () => {
            console.log('Serveur socket fermé');
        });
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * Méthode pour envoyer des données de box à une API spécifiée.
     *
     * @param {string} config - URL de l'API.
     * @param {Array} data - Tableau contenant les données de box à envoyer à l'API.
     * @returns {Promise<void>} - Une promesse qui se résout lorsque la requête HTTP est terminée.
     */
    async SendBoxDataToAPI(config, data) {
        try {
            // Envoi d'une requête POST à l'API avec les données de box
            const response = await axios.post(config, data); // Changer le chemin lorsque Simon et Hassan auront fait le code pour la box

            console.log('Réponse de l\'API :', response.data);
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API :', error.message);
            console.log('');
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

    /**
    * Méthode principale qui simule les données d'entrée/sortie et affiche les résultats en console.
    * @param {Object} dataCPP - Objet contenant les données reçues du code C++.
    * @returns {Promise<void>} - Une promesse qui se résout lorsque les données ont été traitées et affichées en console.
    */

    async boucle(dataCPP) {

        // Attendre que les données soient reçues du code C++ avant de continuer
        try {

            //console.log('data :',dataCPP);
            //console.log('data.sourceVerte', dataCPP.sourceVerte);
            const sourceVerte = dataCPP.sourceVerte;
            const tabPowerBox = dataCPP.tabPowerBox;
            const date = dataCPP.date;

            //console.log(typeof (sourceVerte));

            /* 
                console.log(``);
                console.log(`Valeur de sourceVerte : ${sourceVerte}`);
                console.log(`Valeurs de tabPowerBox : ${JSON.stringify(tabPowerBox)}`);
                console.log(``);
            */

            const proportionsTempVert = this.calculerProportionTempVert(sourceVerte, tabPowerBox);
            console.log(``);
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

            /* */

            // Vérifier si la valeur de sourceVerte a changé. Si oui, on ajoute les données en BDD grâce à l'API de Simon.
            if (this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte) {

                console.log(`La valeur de sourceVerte a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);

                // Création du tableau de données à insérer dans l'API
                const dataAPI = [];

                dataAPI.push({
                    powerbox: JSON.stringify(tabPowerBox),
                    source_verte: sourceVerte,
                    date: date,
                    proportion_temp_vert: JSON.stringify(moyennesProportions)
                });
                //console.log(dataAPI[0]);
                //console.table(dataAPI);

                // Appel de la méthode SendBoxDataInAPIToBDD avec le tableau de données en paramètre
                await this.SendBoxDataToAPI(this.config.APICallbackURLBDD, dataAPI);
            } else {
                console.log(``);
            }


            // Vérifier si une des valeurs parmis toutes les valeurs a changé. Si oui, envoie les données à l'API de Hassan (Groupe Gestion Accès Abris).
            if ((this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte) || (this.previoustabPowerBox !== null && this.previoustabPowerBox !== tabPowerBox)) {

                console.log(`Une des valeurs a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);
                console.log(`Une des valeurs a changé : ${JSON.stringify(this.previoustabPowerBox)} -> ${JSON.stringify(tabPowerBox)}`);

                // Création du tableau de données à insérer dans l'API
                const dataAPIAccesAbri = [];

                dataAPIAccesAbri.push({
                    PuissanceVerte: sourceVerte,
                    id_statut_box: JSON.stringify(tabPowerBox),
                    date: date
                });
                //console.log(dataAPIAccesAbri[0]);
                //console.table(dataAPIAccesAbri);

                // Appel de la méthode SendBoxDataInAPIAccesAbri avec le tableau de données en paramètre
                await this.SendBoxDataToAPI(this.config.APICallbackURLAccesAbris, dataAPIAccesAbri);
            } else {
                console.log(``);
            }

            this.previousSourceVerte = sourceVerte;
            this.previoustabPowerBox = tabPowerBox;

        } catch (error) {
            console.error('Erreur lors de la réception des données provenant du code C++ :', error.message);
            return;
        }
    }
}

//////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();
compteurs.ecouterDonneesCpp();