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
        this.sourceVerteStockees = [];
        // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix.
        this.MAX_SIZE = 10;
        this.previousSourceVerte = null;
        this.previoustabPowerBox = null;
        this.config = this.loadConfig();

        this.dataAPILumi = [];
        this.dataAPIBox = [];
        this.dataAPIAcces = [];
        this.MAX_SIZE_API = 3;

        // Initialiser les intervalles de reconnexion
        this.reconnectionIntervals = {};  // Ajouté ici
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Charge les configurations à partir d'un fichier JSON.
        *
        * Lit le fichier 'config.json', parse son contenu et retourne les données sous forme d'objet.
        * En cas d'erreur, log une erreur et retourne un objet vide.
        *
        * @returns {Object} - Un objet contenant les configurations lues.
    */

    loadConfig() {
        try {
            const data = fs.readFileSync('config.json', 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading config file:', err);
            return {};
        }
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Méthode pour écouter les données provenant d'un code C++ via une communication socket.
        *
        * @returns {Promise<void>} - Une promesse qui se résout lorsque les données ont été reçues et traitées.
    */

    async ecouterDonneesCpp() {
        // Création d'un serveur socket pour écouter les données provenant du code C++
        const server = net.createServer((socket) => {
            console.log('');
            console.log(`Connexion socket établie avec un client : ${socket.remoteAddress}:${socket.remotePort}`);
            // Gestion des données reçues du code C++
            
            socket.on('data', (data) => {

                let dataReceived = '';
                dataReceived += data.toString().split('\n').join('</json>\n<json>');
                dataReceived += '\n';
                const jsonData = dataReceived.split('</json>\n<json>').filter(line => line.trim() !== '');
                //const parsedData = jsonData.map(line => JSON.parse(line));

                const parsedData = jsonData.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (error) {
                        console.error('Erreur de parsing JSON:', error.message);
                        return null;
                    }
                }).filter(item => item !== null);

                //console.log(parsedData.length);
                //console.log('Données reçues des compteurs :', dataReceived);

                dataReceived = '';

                for (const data of parsedData) {
                    // Vérifier si toutes les données ont été reçues. Si toutes les données sont reçues, alors on les affiche et on les envoie au programme principal.
                    if (data.sourceVerte !== undefined && data.tabPowerBox !== undefined && /*Object.values(data.tabPowerBox).every(value => value !== undefined)*/ data.tabPowerBox !== undefined) {

                        data.sourceVerte = Number(data.sourceVerte);
                        data.tabPowerBox = Object.values(data.tabPowerBox).map(Number);

                        console.log('Données reçues des compteurs :');
                        console.table(data);
                        //this.boucle(data);
                    }

                    if (data.luminosity !== undefined) {

                        data.luminosity = Number(data.luminosity);

                        console.log('Données reçues du capteur :');
                        console.table(data);
                        //this.boucle(data);
                    }

                    if(data.sourceVerte !== undefined || data.tabPowerBox !== undefined || /*Object.values(data.tabPowerBox).every(value => value !== undefined)*/ data.tabPowerBox !== undefined || data.luminosity !== undefined)
                    {
                        console.log('Envoi des données :');
                        this.boucle(data);
                    }
                }
            });


            // Gestion de la fermeture de la connexion socket par les compteurs
            socket.on('end', () => {
                console.log('Connexion socket fermée par les compteurs');
            });

            // Gestion des erreurs lors de la communication socket
            socket.on('error', (error) => {
                console.error(`Un client s\'est déconnecté : ${socket.remoteAddress}:${socket.remotePort}`, error.message);
            });
        });

        // Écoute des connexions socket entrantes du code C++
        server.listen(this.config.PortNode_js, this.config.IPNode_js, () => {
            console.log('Serveur socket en écoute sur l\'adresse IP', this.config.IPNode_js ,'et le port', JSON.stringify(this.config.PortNode_js));
        });

        // Gestion de la fermeture du serveur socket
        server.on('close', () => {
            console.log('Serveur socket fermé');
        });
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Méthode pour envoyer des données de box à une API spécifiée.
        *
        * @param {string} config - URL de l'API.
        * @param {Array} data - Tableau contenant les données de box à envoyer à l'API.
        * @param {string} dataKey - Nom de la file d'attente pour les logs.
        * @returns {Promise<void>} - Une promesse qui se résout lorsque la requête HTTP est terminée.
    */

    async SendBoxDataToAPI(config, data, dataKey) {
        //console.log(data);
        //console.log(config);
        try {
            // Envoi d'une requête POST à l'API avec les données de box
            const response = await axios.post(config, data); // Changer le chemin lorsque Simon et Hassan auront fait le code pour la box
            
            console.log(`Réponse de l\'API (${dataKey}) :`, response.data);
            return 1;
        } catch (error) {
            console.error(`Erreur lors de la communication avec l\'API (${dataKey}) :`, error.message);
            console.log('');
            return 0;
        }
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
    * Méthode pour calculer les proportions de temps vert en fonction de sourceVerte et tabPowerBox.
    * Cette méthode stocke les proportions de temps vert calculées, affiche les proportions,
    * et retourne la moyenne des proportions stockées.
    *
    * @param {number} sourceVerte - État de la source verte (0 ou 1).
    * @param {Array.<number>} tabPowerBox - Tableau représentant l'état des power boxes (0 ou 1).
    * @returns {Array.<number>} - Tableau des moyennes des proportions de temps vert arrondies à deux décimales.
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

        console.log(``);
        console.log(`Proportions de temps vert : ${JSON.stringify(proportionsArrondies)}`);
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

        return moyennesProportions;
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Calcule la moyenne des valeurs de sourceVerte stockées.
        *
        * Cette méthode parcourt toutes les valeurs de sourceVerte stockées, 
        * calcule leur somme et retourne la moyenne de ces valeurs, arrondie à deux décimales.
        * Si aucune valeur n'est stockée, elle retourne 0.
        *
        * @returns {number} - La moyenne des valeurs de sourceVerte arrondie à deux décimales.
    */

    calculerMoyennesTempVert() {
        if (this.sourceVerteStockees.length === 0) {
            return 0;  // Eviter la division par zéro
        }
        
        const somme = this.sourceVerteStockees.reduce((acc, val) => acc + val, 0);
        const moyenne = somme / this.sourceVerteStockees.length * 100;
        return parseFloat(moyenne.toFixed(2));
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Méthode pour tenter de se reconnecter à une API spécifiée à intervalles réguliers.
        *
        * Cette méthode lance un intervalle qui tente de se reconnecter à l'API toutes les 5 secondes.
        * Si la reconnexion réussit, l'intervalle est effacé et la file d'attente des données est vidée.
        *
        * @param {string} configKey - Clé de configuration de l'URL de l'API dans le fichier config.
        * @param {Array} reach - Tableau représentant la file d'attente des données à envoyer.
        * @param {string} dataKey - Nom de la file d'attente pour les logs.
        * @returns {Promise<number>} - Une promesse qui se résout à 1 si la reconnexion à l'API réussit, sinon à 0.
    */

    async reconnectToAPI(configKey, reach, dataKey) {
        const interval = setInterval(async () => {

            console.log(`Tentative de reconnexion à l'API (${dataKey})...`);
            if (await this.SendBoxDataToAPI(this.config[configKey], reach, dataKey)) {
                reach.length = 0;
                console.log(`DELETE ${dataKey} : `, reach);
                clearInterval(interval);
                delete this.reconnectionIntervals[configKey]; // Supprimer la référence à l'intervalle
            }
        }, 5000);
        return interval;
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Méthode pour gérer l'ajout des données à une file d'attente et leur envoi à une API spécifiée.
        *
        * Cette méthode ajoute les données reçues à une file d'attente, et si la taille maximale de la file
        * est atteinte, elle supprime le premier élément. Ensuite, elle envoie les données accumulées à l'API
        * spécifiée. Si l'envoi réussit, elle vide la file d'attente.
        *
        * @param {Object} data - Données à ajouter à la file d'attente.
        * @param {Array} reach - Tableau représentant la file d'attente des données à envoyer.
        * @param {string} configKey - Clé de configuration de l'URL de l'API dans le fichier config.
        * @param {string} dataKey - Nom de la file d'attente pour les logs.
        * @returns {Promise<number>} - Une promesse qui se résout à 1 si l'envoi à l'API réussit, sinon à 0.
    */

    async queue(data, reach, configKey, dataKey) {
        if (reach.length == this.MAX_SIZE_API) {
            reach.shift();
            console.log(`SHIFT ${dataKey} : `, reach);
        }
    
        reach.push(data);
    
        console.log(`${dataKey} : `, reach);

        if (await this.SendBoxDataToAPI(this.config[configKey], reach, dataKey)) {
            reach.length = 0;
            //console.log(`DELETE ${dataKey} : `, reach);
            if (this.reconnectionIntervals[configKey]) {
                clearInterval(this.reconnectionIntervals[configKey]);
                delete this.reconnectionIntervals[configKey]; // Supprimer la référence à l'intervalle
            }
            return 1;
        }
        else {
            // Vérifier si une tentative de reconnexion est déjà en cours pour cette API
            if (!this.reconnectionIntervals[configKey]) 
            {
                // Si aucune tentative de reconnexion n'est en cours, démarrer une nouvelle
                this.reconnectionIntervals[configKey] = await this.reconnectToAPI(configKey, reach, dataKey);
               
            }
        return 0;
        }
    }

    //////////////////////////////////////////////////////////////////////////

    /** DESCRIPTION :
        * Méthode principale qui simule les données d'entrée/sortie et affiche les résultats en console.
        * @param {Object} dataCPP - Objet contenant les données reçues du code C++.
        * @returns {Promise<void>} - Une promesse qui se résout lorsque les données ont été traitées et affichées en console.
    */

    async boucle(dataCPP) {

        // Attendre que les données soient reçues du code C++ avant de continuer
        try {

            //console.log('data :',dataCPP);

            // Si les données du capteur de luminosité sont connues
            if(dataCPP.luminosity !== undefined && dataCPP.date !== undefined)
            {
                if (await this.queue(
                    { luminosite: dataCPP.luminosity, date: dataCPP.date },
                    this.dataAPILumi,
                    'oldAPICallbackURLuminosite',
                    'luminosityQueue'
                )) {
                    this.dataAPILumi = [];
                }
            }

            // Si les données des box sont connues
            if(dataCPP.sourceVerte !== undefined && Object.values(dataCPP.tabPowerBox).every(value => value !== undefined && dataCPP.date !== undefined))
            {
                //console.log('typeof (sourceVerte)', typeof (sourceVerte));
                //console.log('data.sourceVerte', dataCPP.sourceVerte);
                //console.log('data.sourceVerte', dataCPP.sourceVerte !== null);
                const {sourceVerte, tabPowerBox, date} = dataCPP;
                /* 
                    console.log(``);
                    console.log(`Valeur de sourceVerte : ${sourceVerte}`);
                    console.log(`Valeurs de tabPowerBox : ${JSON.stringify(tabPowerBox)}`);
                    console.log(``);
                */

                // Ajouter la nouvelle valeur de sourceVerte au tableau
                this.sourceVerteStockees.push(sourceVerte);
                if (this.sourceVerteStockees.length > this.MAX_SIZE) {
                    this.sourceVerteStockees.shift();  // Maintenir la taille du tableau
                }

                const moyennesProportions = this.calculerProportionTempVert(sourceVerte, tabPowerBox);
   

                // Calculer la moyenne des valeurs de sourceVerte
                const moyenneSourceVerte = this.calculerMoyennesTempVert();
                console.log(`Moyenne des valeurs de sourceVerte : ${moyenneSourceVerte}`);



                console.log(`Moyennes des proportions de temps vert : ${JSON.stringify(moyennesProportions)}`);
                console.log(``);

                // Vérifier si la valeur de sourceVerte a changé. Si oui, on ajoute les données en BDD grâce à l'API de Simon.
                if (this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte && this.previoustabPowerBox !== null) {

                    console.log(`La valeur de sourceVerte a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);

                    if (await this.queue(
                        {   
                            power_box: JSON.stringify(tabPowerBox), 
                            source_verte: sourceVerte,
                            date: date,
                            ratio:moyenneSourceVerte,
                            proportion_temp_vert: JSON.stringify(moyennesProportions) 
                        },
                        this.dataAPIBox,
                        'oldAPICallbackURLBDD',
                        'boxQueue'
                    )) {
                        this.dataAPIBox = [];
                    }

                    /* A REMETTRE POUR HASSAN :  
                    if (await this.queue(
                        {   
                            greenEnergy: sourceVerte,
                            boxState: JSON.stringify(tabPowerBox),
                            date: date
                        },
                        this.dataAPIAcces,
                        'APICallbackURLAccesAbris',
                        'accessQueue'
                    )) {
                        this.dataAPIAcces = [];
                    }
                    */
                
                } 

                // Sinon, si une des valeurs à changée, on envoie à l'API d'Hassan
                else if ((this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte) || (this.previoustabPowerBox !== null && this.previoustabPowerBox !== tabPowerBox))
                {
                    console.log(`Une des valeurs a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);
                    console.log(`Une des valeurs a changé : ${JSON.stringify(this.previoustabPowerBox)} -> ${JSON.stringify(tabPowerBox)}`);
                    /* A REMETTRE POUR HASSAN :  
                    if (await this.queue(
                        {   
                            greenEnergy: sourceVerte,
                            boxState: JSON.stringify(tabPowerBox),
                            date: date
                        },
                        this.dataAPIAcces,
                        'APICallbackURLAccesAbris',
                        'accessQueue'
                    )) {
                        this.dataAPIAcces = [];
                    }
                    */
                }
                else 
                {
                    console.log(``);
                }  

                this.previousSourceVerte = sourceVerte;
                this.previoustabPowerBox = tabPowerBox;
            }
            
        } catch (error) {
            console.error('Erreur lors de la réception des données provenant du code C++ :', error.message);
            return;
        }
    }

// FIN DE LA CLASSE COMPTEURS
}

//////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();
compteurs.ecouterDonneesCpp();