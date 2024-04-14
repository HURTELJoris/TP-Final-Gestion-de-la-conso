#include "Test_Module.h"

// Constructeur de la classe CarteES
// @param serverAddress : adresse IP du serveur Node.js
// @param serverPort : port d'ecoute du serveur Node.js
CarteES::CarteES(const std::string& serverAddress, int serverPort)
    : endpoint_(boost::asio::ip::address::from_string(serverAddress), serverPort) {}

// Méthode pour établir la connexion avec le serveur Node.js et envoyer les données
bool CarteES::connectAndSend() {
    try {
        boost::asio::io_context io_context;
        tcp::socket socket(io_context);

        boost::system::error_code errorConnect;
        socket.connect(endpoint_, errorConnect);

        // Debogage : affichage d'un message de connexion réussie ou echouée
        if (!errorConnect) {
            std::cout << "Connexion reussie au serveur Node.js" << std::endl;
            
            
          
            return sendData(socket);
        }
        else {
            std::cerr << "Echec de la connexion au serveur Node.js : " << std::endl << errorConnect.message() << std::endl << std::endl;
            
            return false;
        }  
        socket.close();
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << e.what() << std::endl;
        return false;
    }
}

// Méthode pour envoyer des données au serveur Node.js
// @param socket : socket TCP pour la communication avec le serveur Node.js
bool CarteES::sendData(tcp::socket& socket) {
    boost::property_tree::ptree data;

    // Génération aléatoire des données (en attendant les vraies données de la carte E/S)
    int sourceVerte = rand() % 2;
    int tabPowerBox[8];
    for (int i = 0; i < 8; i++) {
        tabPowerBox[i] = rand() % 2;
    }

    // Ajout des données à l'objet boost::property_tree::ptree
    data.put("sourceVerte", sourceVerte);
    for (int i = 0; i < 8; i++) {
        data.put("tabPowerBox." + std::to_string(i), tabPowerBox[i]);
    }

    // Conversion de l'objet boost::property_tree::ptree en chaîne de caracteres JSON
    std::stringstream ss;
    boost::property_tree::write_json(ss, data, false);
    std::string jsonData = ss.str();


    // Envoi des données au serveur Node.js
    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(jsonData), error);

    if (/*!*/error) { //METTRE UN '!' DEVANT ERROR POUR TESTER TOUTES LES CONDITIONS
        std::cout << "Envoi des donnees echouee" << std::endl << std::endl;
        return false;
    }
    else {
        std::cout << "Envoi des donnees reussie" << std::endl << std::endl;
        return true;
    }
}


// Fonction de test pour la connexion et l'envoi de données
void testConnectAndSend() {
    // Adresse IP et port du serveur Node.js pour les tests
    std::string testServerAddress = "192.168.85.128";
    int testServerPort = 1234;

    // Création d'un objet CarteES pour les tests
    CarteES testSender(testServerAddress, testServerPort);

    // Test de la connexion et de l'envoi de données
    if (testSender.connectAndSend()) {
        std::cout << "Test reussi : Connexion et envoi de donnees reussis" << std::endl;
    }
    else {
        std::cerr << "Test echoue : Erreur lors de la connexion et/ou de l\'envoi de donnees : " << std::endl;
    }
}

int main() {
    // Exécution du test
    testConnectAndSend();
    return 0;
}