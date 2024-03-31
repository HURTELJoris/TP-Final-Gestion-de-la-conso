/*
    Classe créée par Joris HURTEL et Mathias SENEPART, élèves de BTS SN2 de décembre 2023 à janvier 2024.

    La classe Compteur_Histo est conçue pour gérer et surveiller les statistiques d'une chaîne YouTube spécifique, 
    et ce, en utilisant l'API YouTube. Voici une description détaillée de la classe et de ses méthodes :

        Cette classe utilise des méthodes asynchrones pour effectuer des requêtes HTTP asynchrones vers l'API YouTube et le serveur back-end. 
        Elle utilise également une connexion WebSocket pour envoyer des informations au serveur C++. 
        La méthode principale updateData orchestre l'ensemble du processus de mise à jour des données, appelant les autres méthodes de manière séquentielle.
*/

class Compteur_Histo {
    constructor(apiKey1, apiKey2, channelId) {

        this.apiKey1 = apiKey1;
        this.apiKey2 = apiKey2;
        this.apiKey = localStorage.getItem('apiKey') || apiKey1;
        this.channelId = channelId;

        /* 
            On instancie directement la date et le nombre de requêtes de la BDD dans le constructeur 
            pour un soucis de réactivité lors du chargement de la page. 
        */
        this.DateBDD = this.getDateFromBack();

        this.NBRequete = this.getNbRequetesFromBack();

        //console.error("Requetes  :", this.NBRequete);

        // Connexion WebSocket au serveur C++
        this.socket = new WebSocket('ws://192.168.65.61:667');

        // Appel de la fonction principale au chargement de la page et toutes les 5 secondes
        window.onload = this.updateData.bind(this);
        setInterval(this.updateData.bind(this), 5000);
    }

    // Méthode pour récupérer le plus grand nombre de requête actuel en BDD du back.
    async getNbRequetesFromBack() {
        try {
            const response = await fetch('http://192.168.65.237:8080/new/Classes/Compteur_Histo/PostNBRequetes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();
            console.log('Nombre de requêtes en BDD :', data.nbrequetes);
            return data.nbrequetes;
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de requêtes depuis le serveur :', error);
            throw error;
        }
    }

    // Méthode pour récupérer la dernière date entrée en BDD du back.
    async getDateFromBack() {
        try {
            const response = await fetch('http://192.168.65.237:8080/new/Classes/Compteur_Histo/PostDate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            let data = await response.json();
            console.log('Jour de la dernière entrée en BDD : ', data.number); // Ajout de ce log

            return data.number;
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de requêtes depuis le serveur :', error);
            throw error;
        }
    }

    // Méthode pour envoyer des informations au serveur WebSocket
    sendInfoToCpp(info) {
        // Vérifier si la connexion WebSocket est ouverte
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(info);
        }
        /* 
        else 
        {
            console.error('La connexion WebSocket n\'est pas encore établie.');
            // Vous pouvez ajouter une logique pour traiter cette situation, par exemple, mettre en file d'attente les informations à envoyer lorsque la connexion est établie.
        }
        */
    }

    /* 
        Méthode qui fait un switch key pour avoir les deux API et 20000 queries (19600). 
        Cette méthode permet de pouvoir utiliser le compteur toute une journée de manière réactive.
    */
    checkAndUpdateApiKey() {
        if (this.NBRequete >= 9800) {
            this.apiKey = this.apiKey2;
            localStorage.setItem('apiKey', this.apiKey2);
            //document.getElementById("APIKeys").textContent = `Fonction API Keys : True, Key 2 ${this.apiKey}`; // À enlever pour la version finale
        } else {
            this.apiKey = this.apiKey1;
            localStorage.setItem('apiKey', this.apiKey1);
            //document.getElementById("APIKeys").textContent = `Fonction API Keys : True, Key 1 ${this.apiKey}`; // À enlever pour la version finale
        }
    }

    /* 
        Méthode pour réinitialiser le nombre de requêtes si on change de jour à une nouvelle connexion, 
        ou l'incrémenter à chaque fois qu'on fait une nouvelle demande d'API. 
    */
    resetAutoIncrementValue() {
        const currentDate = new Date();
        console.log("Jour du mois actuel", currentDate.getDate());
        //console.log("Jour de la dernière entrée en BDD : ",this.DateBDD);

        if (currentDate.getDate() != this.DateBDD) {
            this.NBRequete = 2;
            localStorage.setItem('NBRequete', this.NBRequete);
        } else {
            this.NBRequete += 2;
            localStorage.setItem('NBRequete', this.NBRequete);
        }
        //document.getElementById("NBRequetes").textContent = `Nombre de requêtes : ${this.NBRequete}`; // À enlever pour la version finale
    }


    /* 
      Fonction la plus importante. Cette fonction est importée de l'API de Google Cloud. 
      Elle sert à chercher les informations d'une chaîne YouTube donnée avec un ID et une clé d'API.
      Nous l'avons modifiée dans notre code pour qu'elle marche avec une Promise.
      Le but de cette Promise est de permettre à la fonction updateData() d'attendre que l'API ait bien renvoyé les informations pour les afficher.
    */
    async getChannelInfo() {

        return new Promise((resolve, reject) => {
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${this.channelId}&key=${this.apiKey}`;
            const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${this.channelId}&key=${this.apiKey}`;

            // Effectue les deux requêtes en parallèle
            Promise.all([
                fetch(channelUrl).then(response => response.json()),
                fetch(statsUrl).then(response => response.json())
            ])
                .then(([channelData, statsData]) => {
                    const channelName = channelData.items[0].snippet.title;
                    const channelImage = channelData.items[0].snippet.thumbnails.high.url;
                    const subscriberCount = statsData.items[0].statistics.subscriberCount;

                    this.channelName = channelName;
                    this.subscriberCount = subscriberCount;

                    document.getElementById("channelName").textContent = `Nom de la chaîne : ${channelName}`;
                    document.getElementById("channelImage").src = channelImage;
                    document.getElementById("subscriberCount").textContent = `Nombre d'abonnés actuel : ${subscriberCount}`;

                    this.sendInfoToCpp(` ${channelName}`);
                    this.sendInfoToCpp(` ${subscriberCount}`);

                    resolve();
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des informations de la chaîne :", error);
                    reject(error);
                });
        });
    }

    // Méthode permettant d'envoyé les données du front au back en vérifiant qu'elles sont bien définies.
    PostToBack() {
        const waitForVariables = async () => {
            return new Promise((resolve, reject) => {
                const checkVariables = () => {
                    if (this.channelName !== undefined && this.subscriberCount !== undefined && this.NBRequete !== undefined) {
                        resolve();
                    } else {
                        setTimeout(checkVariables, 100); // Vérifie à nouveau après un court délai (1 seconde).
                    }
                };
                checkVariables();
            });
        };

        waitForVariables().then(() => {

            const dataToSend = {
                channelName: this.channelName,
                subscriberCount: Number(this.subscriberCount),
                NBRequete: this.NBRequete,
                // ... autres données
            };
            console.log('Données envoyées :', dataToSend);

            fetch('http://192.168.65.237:8080/new/Classes/Compteur_Histo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('La requête a échoué avec le statut ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Réponse du serveur :', data);
                })
                .catch(error => {
                    console.error('Erreur lors de la requête POST:', error);
                });
        });
    }

    // Méthode principale du programme. Sert à appeler toutes les autres méthode.
    async updateData() {
        try {

            this.DateBDD = await this.getDateFromBack();
            this.NBRequete = await this.getNbRequetesFromBack();

            this.checkAndUpdateApiKey();
            this.resetAutoIncrementValue();

            await this.getChannelInfo();

            this.PostToBack();

        } catch (error) {
            console.error("Erreur lors de la mise à jour des données :", error);
        }
    }
}

// Exporte la classe pour qu'elle puisse être utilisée dans d'autres fichiers
export default Compteur_Histo;