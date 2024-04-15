#include "CARTE E.S.h"

// Constructeur de la classe CarteES
// @param serverAddress : adresse IP du serveur Node.js
// @param serverPort : port d'ecoute du serveur Node.js
CarteES::CarteES(const std::string& serverAddress, int serverPort)
    : endpoint_(boost::asio::ip::address::from_string(serverAddress), serverPort) {}

// Méthode pour établir la connexion avec le serveur Node.js et envoyer les données
void CarteES::connectAndSend() {
    try {
        boost::asio::io_context io_context;
        tcp::socket socket(io_context);

        while (true) {
            boost::system::error_code errorConnect;
            socket.connect(endpoint_, errorConnect);

            // Debogage : affichage d'un message de connexion réussie ou echouée
            if (!errorConnect) {
                std::cout << "Connexion reussie au serveur Node.js" << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des données toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(3));
                    errorr = sendData(socket);
                }
            }
            else {
                std::cerr << "Echec de la connexion au serveur Node.js : " << std::endl << "    " << errorConnect.message() << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des données toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(3));
                    errorr = sendData(socket);
                }
            }

            // Debogage : affichage d'un message de tentative de reconnexion
            std::cout << std::endl << "Tentative de reconnexion au serveur Node.js dans 5 secondes..." << std::endl << "    ";
            std::this_thread::sleep_for(std::chrono::seconds(4));


            socket.close();
        }
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << std::endl <<"    "<< e.what() << std::endl;
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

    // Debogage : affichage des données à envoyer
    std::cout << std::endl << "Donnees a envoyer : " << std::endl;
    for (const std::string& data : dataQueue_) {
        std::cout << data;
    }
    std::cout << jsonData;
    std::cout << std::endl << std::endl;

    // Si la file d'attente est pleine, retirez l'élément le plus ancien
    if (dataQueue_.size() >= maxQueueSize) {
        const std::string Olddata = dataQueue_.front();
        dataQueue_.pop_front();
        std::cout << std::endl << "File d\'attente pleine. " << std::endl << "    Suppression des anciennes donnees : " << std::endl << "    "+Olddata << std::endl << std::endl;
    }

    // Si la file d'attente n'est pas vide, on ajoute les nouvelles données à la file d'attente
    bool con = true;
    if (!dataQueue_.empty()) {
        dataQueue_.push_back(jsonData);
        std::cout << "Donnees mises en file d\'attente : " << std::endl << jsonData << std::endl;
        jsonData = dataQueue_.front();
        con = false;
    }

    // Envoi des données au serveur Node.js
    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(jsonData), error);

    if (error) {

        // Si l'envoi des données échoue, on les stocke dans la file d'attente
        if (con) {
            dataQueue_.push_back(jsonData);
        }

        std::cerr << "Erreur lors de l\'envoi des donnees au serveur Node.js : " << std::endl << std::endl << error.message() << std::endl << std::endl;

        std::cout << "Stockees : " << std::endl << jsonData;

        return false;
    }
    else {
        std::cout << "Donnees envoyees avec succes" << std::endl;

        // On vérifie s'il reste des données dans la file d'attente et on les envoie
        while (!dataQueue_.empty()) {
            std::string queuedData = dataQueue_.front();
            dataQueue_.pop_front();
            std::cout << "Envoi des donnees stockees : " << std::endl << queuedData << std::endl;
            boost::asio::write(socket, boost::asio::buffer(queuedData), error);
            if (error) {
                std::cerr << "Erreur lors de l\'envoi des donnees stockees au serveur Node.js : " << std::endl << "    "+error.message() << std::endl << std::endl;
            }
            else {
                std::cout << "Donnees stockees envoyees avec succes" << std::endl << std::endl;
            }
        }
        return true;
    }
}

int main() {
    CarteES sender("192.168.64.88", 1234);
    sender.connectAndSend();

    return 0;
}