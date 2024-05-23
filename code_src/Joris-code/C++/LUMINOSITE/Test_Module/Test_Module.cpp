#include "Test_Module.h"

// Constructeur de la classe LUMINOSITE
// @param serverAddress : adresse IP du serveur Node.js
// @param serverPort : port d'ecoute du serveur Node.js
LUMINOSITE::LUMINOSITE(const std::string& serverAddress, int serverPort)
    : endpoint_(boost::asio::ip::address::from_string(serverAddress), serverPort) {}

//Méthode pour créer un string de la date actuelle au format SQL DATETIME
std::string LUMINOSITE::createDateTime()
{
    std::time_t t = std::time(nullptr);
    // Struct tm pour stocker la date et l'heure locale
    std::tm now;

#ifdef _MSC_VER
    localtime_s(&now, &t);
#else
    localtime_r(&t, &now);
#endif

    std::ostringstream oss;
    oss << std::put_time(&now, "%Y-%m-%d %H:%M:%S");

    return oss.str();
};



// Méthode pour établir la connexion avec le serveur Node.js et envoyer les données
bool LUMINOSITE::connectAndSend() {
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
bool LUMINOSITE::sendData(tcp::socket& socket) {
    boost::property_tree::ptree data;

    // Initialisation du générateur de nombres aléatoires avec le temps actuel
    srand(time(NULL));
    // Génération de la luminosité aléatoire basée sur le temps
    float luminosity = static_cast<float>(rand()) / (static_cast<float>(RAND_MAX / 99999.0f)) + 1.0f;
    std::string DateTime = createDateTime();
    //std::cout << DateTime;
    // Ajout des données à l'objet boost::property_tree::ptree
    data.put("luminosity", luminosity);
    data.put("date", DateTime);

    // Conversion de l'objet boost::property_tree::ptree en chaîne de caracteres JSON
    std::stringstream ss;
    boost::property_tree::write_json(ss, data, false);
    std::string jsonData = ss.str();


    // Debogage : affichage des données à envoyer
    std::cout << std::endl << "Donnees a envoyer : " << std::endl;
    for (const std::string& data : dataQueue_) {
        std::cout << data;
    }
    std::cout << jsonData;
    std::cout << std::endl << std::endl;

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
    std::string testServerAddress = "192.168.64.88";
    int testServerPort = 1236;

    // Création d'un objet CarteES pour les tests
    LUMINOSITE testSender(testServerAddress, testServerPort);

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
