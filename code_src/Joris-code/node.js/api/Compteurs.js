// Importation du module axios pour les requêtes HTTP
const axios = require('axios');
// Importation du module net pour les sockets avec le CPP
const net = require('net');

const fs = require('fs');
const { assert } = require('console');
const { resolve } = require('dns');

// Classe Compteurs qui simule les données d'une carte d'entrée/sortie et calcule les proportions de temps vert.
class Compteurs {
    // Constructeur de la classe Simulateur.
    constructor() {
        this.proportionsTempVertStockees = []; // Proportions de temps vert stockées
        this.sourceVerteStockees = []; // Valeurs de source verte stockées

        this.MAX_SIZE = 10; // Taille maximale du tableau de toutes les proportion de temps vert stockées. Ajustable au choix.
        this.previousSourceVerte = null; // Valeur précédente de source verte
        this.previoustabPowerBox = null; // Valeur précédente des états des PowerBox
        this.previousDate = null // Valeur précédente de la date
        this.config = this.loadConfig(); // Configuration chargée depuis le fichier

        this.dataAPISolarPannel = []; // Données pour l'API des panneaux solaires
        this.dataAPILumi = []; // Données pour l'API de luminosité
        this.dataAPIBox = []; // Données pour l'API des PowerBox
        this.dataAPIAcces = []; // Données pour l'API d'accès
        this.MAX_SIZE_API = 3; // Taille maximale du tableau des données API

        this.reconnectionIntervals = {}; // Intervalles de reconnexion aux API

        // Variables pour le suivi du temps permettants de calculer les proportions
        this.firstTimer = null; // Premier temps enregistré
        this.timer = null; // Temps actuel
        this.previousTimer = null; // Temps précédent
        this.timerVert = 0; // Temps passé avec source verte active
        this.timerTotal = 0; // Temps total écoulé
    

        this.MoyennetempsPuissanceBox = new Array(8).fill(0); // Moyenne des temps verts pour chaque PowerBox
        this.tempsPuissanceBox = new Array(8).fill(0); // Temps VERT écoulé pour chaque PowerBox

        this.ratio = null // Valeur du ratio de temps vert
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
                        console.log('');
                        console.log('Données reçues des compteurs :');
                        console.table(data);
                        //this.boucle(data);
                    }

                    if (data.luminosity !== undefined && data.power !== undefined && data.intensity !== undefined) {

                        data.luminosity = Number(data.luminosity);
                        data.power = Number(data.power);
                        data.intensity = Number(data.intensity);
                        console.log('');
                        console.log('Données reçues du capteur :');
                        console.table(data);
                        //this.boucle(data);
                    }
                    else if (data.luminosity !== undefined) {

                        data.luminosity = Number(data.luminosity);
                        console.log('');
                        console.log('Données reçues de la luminosité :');
                        console.table(data);
                        //this.boucle(data);
                    }

                    if(data.sourceVerte !== undefined || data.tabPowerBox !== undefined || /*Object.values(data.tabPowerBox).every(value => value !== undefined)*/ data.tabPowerBox !== undefined || data.luminosity !== undefined
                        || data.power !== undefined || data.intensity !== undefined)
                    {
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

        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': 'root' // Remplacez 'root' par votre clé d'API
        };


        try {
            // Envoi d'une requête POST à l'API avec les données de box
            const response = await axios.post(config, data, { headers }); // Changer le chemin lorsque Simon et Hassan auront fait le code pour la box
            
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
        * Méthode pour calculer les proportions du temps vert pour chaque PowerBox.
        *
        * Cette méthode calcule la proportion du temps passé avec des PowerBox vertes, ainsi que les moyennes
        * pour chaque PowerBox. Les proportions et les moyennes sont mises à jour en fonction des données reçues.
        *
        * @param {Array} tabPowerBox - Tableau des états des PowerBox.
        * @returns {Object} - Un objet contenant la proportion du temps vert global et les moyennes des temps
        * verts pour chaque PowerBox.
    */

    calculerProportions(tabPowerBox) {
        const elapsedTime = (this.timer - (this.previousTimer || this.firstTimer)) / 1000;
    
        // Calculer la proportion du temps passé sur les PowerBox vertes
        for (let i = 0; i < tabPowerBox.length; i++) {
            if (tabPowerBox[i] === 1 && this.previousSourceVerte === 1) {
                this.tempsPuissanceBox[i] += elapsedTime;
                this.tempsPuissanceBox[i] = parseFloat(this.tempsPuissanceBox[i].toFixed(2));
            }
        }
    
        // Calculer la proportion du temps total passé sur les PowerBox vertes
        if (this.previousSourceVerte === 1) {
            this.timerVert += elapsedTime;
        }
    
        this.timerTotal += elapsedTime;
    
        // Mettre à jour le timer précédent
        this.previousTimer = this.timer;
    
        // Calculer la proportion du temps vert global
        const proportionTempsVert = ((this.timerVert.toFixed(2) / this.timerTotal.toFixed(2)) * 100) || 0;
    
        // Calculer la moyenne de chaque PowerBox verte
        for (let i = 0; i < tabPowerBox.length; i++) {
            this.MoyennetempsPuissanceBox[i] = (this.tempsPuissanceBox[i] / this.timerTotal.toFixed(2)) * 100;
            this.MoyennetempsPuissanceBox[i] = parseFloat(this.MoyennetempsPuissanceBox[i].toFixed(2)) || 0;
        }
    
        //console.log(`Temps VERT depuis la première lecture : ${this.timerVert.toFixed(2)} secondes`);
        //console.log(`tempsPuissanceBox depuis la première lecture :  ${JSON.stringify(this.tempsPuissanceBox)} secondes`);
        //console.log(`Temps total écoulé depuis la première lecture : ${this.timerTotalBOX.toFixed(2)||0} secondes`);
        //console.log(`MoyennetempsPuissanceBox depuis la première lecture : ${JSON.stringify(this.MoyennetempsPuissanceBox)} %`);
    
        return {
            proportionTempsVert: parseFloat(proportionTempsVert.toFixed(2)),
            MoyennetempsPuissanceBox: this.MoyennetempsPuissanceBox
        };
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
    
        //console.log(`${dataKey} : `, reach);

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
            const date = new Date(dataCPP.date);

            // Si les données de luminosité sont connues
            if(dataCPP.luminosity !== undefined && dataCPP.date !== undefined)
            {
                console.log('Envoi des données :');
                if (await this.queue(
                    { luminosite: dataCPP.luminosity, date: dataCPP.date },
                    this.dataAPILumi,
                    'APICallbackURLuminosite',
                    'luminosityQueue'
                )) {
                    this.dataAPILumi = [];
                }
            }

            // Si les données du capteur de luminosité sont connues
            if(dataCPP.power !== undefined && dataCPP.intensity !== undefined && dataCPP.date !== undefined && this.previousDate !== null && this.previousDate !== date)
            { /*dataCPP.energy !== undefined && dataCPP.EDF !== undefined*/
                if(this.ratio == null)
                {
                    const response = await axios.get(this.config.oldAPIGETURLBDD);
                    this.ratio = response.data[0].ratio;
                }
                //console.log('this.ratio : ',this.ratio);

                if(this.id_capteur == null)
                {
                    const response = await axios.get(this.config.oldAPIGETURLLuminosite);
                    this.id_capteur = response.data[0].id_capteur;
                }
                //console.log('this.id_capteur : ',this.id_capteur);

                const difference_date = (date - this.previousDate) / 1000; 
                //console.log('difference_date (s): ',difference_date);

                let energiepanneaux = dataCPP.power * (3600 / difference_date);
                energiepanneaux = parseFloat(energiepanneaux.toFixed(3));
                //console.log('energiepanneaux : ', energiepanneaux, 'W/h');

                let energieEDF = energiepanneaux * (this.ratio / 100 * 2);
                energieEDF = parseFloat(energieEDF.toFixed(3));
                //console.log('energieEDF : ', energieEDF, 'W/h');

                console.log('Envoi des données :');
                if (await this.queue(
                    { id_capteur: this.id_capteur, puissance: dataCPP.power, intensité: dataCPP.intensity, production_energie: energiepanneaux, SuiviEdf: energieEDF, date: dataCPP.date },
                    this.dataAPISolarPannel,
                    'oldAPICallbackURCapteurLuminosite',
                    'SolarPannelQueue'
                )) {
                    this.dataAPISolarPannel = [];
                    this.ratio = null;
                    this.id_capteur = null;
                }
            }

            // Si les données des box sont connues
            if(dataCPP.sourceVerte !== undefined && Object.values(dataCPP.tabPowerBox).every(value => value !== undefined && dataCPP.date !== undefined))
            {
                //console.log('typeof (sourceVerte)', typeof (sourceVerte));
                //console.log('data.sourceVerte', dataCPP.sourceVerte);
                //console.log('data.sourceVerte', dataCPP.sourceVerte !== null);
                const {sourceVerte,tabPowerBox, date} = dataCPP;
                /* 
                    console.log(``);
                    console.log(`Valeur de sourceVerte : ${sourceVerte}`);
                    console.log(`Valeurs de tabPowerBox : ${JSON.stringify(tabPowerBox)}`);
                    console.log(``);
                */
              
                const datee = new Date(date);
       
                this.previousSourceVerte ??= sourceVerte;
                this.firstTimer ??= datee;
                this.previousTimer ??= datee;
                this.timer = datee;

                // Ajouter la nouvelle valeur de sourceVerte au tableau
                this.sourceVerteStockees.push(sourceVerte);
                if (this.sourceVerteStockees.length > this.MAX_SIZE) {
                    this.sourceVerteStockees.shift();  // Maintenir la taille du tableau
                }

                const {proportionTempsVert, MoyennetempsPuissanceBox} = this.calculerProportions(tabPowerBox);
                
                console.log(`Moyenne des valeurs de sourceVerte : ${proportionTempsVert}%`);
                console.log(`Moyennes des proportions de temps vert : ${JSON.stringify(MoyennetempsPuissanceBox)}`);

                // Vérifier si la valeur de sourceVerte a changé. Si oui, on ajoute les données en BDD grâce à l'API de Simon.
                if (this.previousSourceVerte !== null && this.previousSourceVerte !== sourceVerte && this.previoustabPowerBox !== null) {
                    console.log(`La valeur de sourceVerte a changé : ${this.previousSourceVerte} -> ${sourceVerte}`);
                    console.log('');
                    console.log('Envoi des données :');
                    if (await this.queue(
                        {   
                            power_box: JSON.stringify(tabPowerBox), 
                            source_verte: sourceVerte,
                            date: date,
                            ratio:proportionTempsVert,
                            proportion_temp_vert: JSON.stringify(MoyennetempsPuissanceBox) 
                        },
                        this.dataAPIBox,
                        'oldAPICallbackURLBDD',
                        'boxQueue'
                    )) {
                        this.dataAPIBox = [];
                    }

                    // A REMETTRE POUR HASSAN :  
                    /* 
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
                    console.log('');
                    console.log('Envoi des données :');
                    // A REMETTRE POUR HASSAN :  
                    /* 
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
            this.previousDate = date;

        } catch (error) {
            console.error('Erreur lors de la réception des données provenant du code C++ :', error.message);
            return;
        }
    }

// FIN DE LA CLASSE COMPTEURS
}

/////////////////////////////////////////////////////////////////////////

//Création d'une instance de la classe Compteurs et démarrage de la récupération des données des compteurs.

const compteurs = new Compteurs();
compteurs.ecouterDonneesCpp();