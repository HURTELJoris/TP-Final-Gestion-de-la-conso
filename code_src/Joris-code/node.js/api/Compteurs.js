// Importation du module axios pour les requêtes HTTP
const axios = require('axios');
// Importation du module net pour les sockets avec le CPP
const net = require('net');

// Classe Compteurs qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.
class Compteurs {
    // Constructeur de la classe Simulateur.
    constructor() {
        this.proportionsTempVertStockees = [];
        // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix et déprendra de l'abonnement de temps pris par l'utilisateur (demander HUGO).
        this.MAX_SIZE = 10;
        this.previousSourceVerte = null;
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * Méthode pour écouter les données provenant d'un code C++ via une communication socket.
     *
     * @returns {Promise<Object>} - Une promesse qui se résout avec un objet contenant les données reçues du code C++.
     */
    async ecouterDonneesCpp() {
        return new Promise((resolve, reject) => {
            // Création d'un serveur socket pour écouter les données provenant du code C++
            const server = net.createServer((socket) => {
                console.log('Connexion socket établie avec le code C++');

                // Gestion des données reçues du code C++
                let dataReceived = '';
                socket.on('data', (data) => {
                    dataReceived += data.toString();
                    // Vérifier si toutes les données ont été reçues (à personnaliser en fonction de vos besoins)
                    const parsedData = JSON.parse(dataReceived);
                    console.log('Données reçues du code C++ :', dataReceived);
                    if (parsedData.sourceVerte !== null && parsedData.tabPowerBox !== null && Object.values(parsedData.tabPowerBox).every(value => value !== null)) {

                        resolve(parsedData);
                    }
                });

                // Gestion de la fermeture de la connexion socket par le code C++
                socket.on('end', () => {
                    console.log('Connexion socket fermée par le code C++');
                });

                // Gestion des erreurs lors de la communication socket
                socket.on('error', (error) => {
                    console.error('Erreur lors de la communication socket avec le code C++ :', error.message);
                    reject(error);
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
        });
    }

    //////////////////////////////////////////////////////////////////////////

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

        // Attendre que les données soient reçues du code C++ avant de continuer
        try {
            const data = await this.ecouterDonneesCpp();
            const sourceVerte = data.sourceVerte;
            const tabPowerBox = data.tabPowerBox;

            console.log(``);
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

            // Appeler à nouveau la méthode boucle() lorsque la promesse de ecouterDonneesCpp() est résolue
            this.ecouterDonneesCpp().then(() => this.boucle());

        } catch (error) {
            console.error('Erreur lors de la réception des données provenant du code C++ :', error.message);
            return;
        }

        // const interval = Math.random() < 0.5 ? 2000 : 5000;
        // setTimeout(() => this.boucle(), interval);
    }
}

//////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();
compteurs.ecouterDonneesCpp().then(() => compteurs.boucle());