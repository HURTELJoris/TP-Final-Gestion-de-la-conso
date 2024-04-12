#include <iostream>
#include <boost/asio.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <thread>
#include <chrono>

using boost::asio::ip::tcp;

// Creation d un objet boost::property_tree::ptree pour stocker les donnees a envoyer
boost::property_tree::ptree data;

bool envoyerDonnees(tcp::socket& socket, boost::property_tree::ptree& data) {
    
    //boost::property_tree::ptree data;

    // Generation aleatoire des donnees (a personnaliser en fonction de vos besoins)
    int sourceVerte = rand() % 2;
    int tabPowerBox[8];
    for (int i = 0; i < 8; i++) {
        tabPowerBox[i] = rand() % 2;
    }

    // Ajout des donnees a l objet boost::property_tree::ptree
    data.put("sourceVerte", sourceVerte);
    for (int i = 0; i < 8; i++) {
        data.put("tabPowerBox." + std::to_string(i), tabPowerBox[i]);
    }

    // Conversion de l objet boost::property_tree::ptree en chaîne de caracteres JSON
    std::stringstream ss;
    boost::property_tree::write_json(ss, data, false);
    std::string jsonData = ss.str();

    // Debogage : affichage des donnees a envoyer
    std::cout << "Donnees a envoyer : " << jsonData;

    // Envoi des donnees au serveur Node.js
    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(jsonData), error);

    if (error) {
        std::cerr << "Erreur lors de l envoi des donnees au serveur Node.js : " << std::endl << std::endl << error.message() << std::endl << std::endl;

        std::cout << "Stockees : " << jsonData;

        return false;
    }
    else {
        std::cout << "Donnees envoyees avec succes" << std::endl << std::endl;

        std::stringstream ss;
        boost::property_tree::write_json(ss, data, false);
        std::string jsonDataBeforeClear = ss.str();
        std::cout << "Donnees avant nettoyage : " << jsonDataBeforeClear << std::endl;

        data.clear();

        ss.str(""); // effacer le contenu de ss
        ss.clear(); // réinitialiser ss

        boost::property_tree::write_json(ss, data, false);
        std::string jsonDataAfterClear = ss.str();
        std::cout << "Donnees apres nettoyage : " << jsonDataAfterClear << std::endl;


        return true;
    }
}

int main() {
    try {
        // Creation d un objet boost::asio::io_context
        boost::asio::io_context io_context;

        // Creation d un socket TCP
        tcp::socket socket(io_context);

        while (true) {
            // Tentative de connexion au serveur Node.js
            tcp::endpoint endpoint(boost::asio::ip::address::from_string("192.168.64.88"), 1234);
            boost::system::error_code errorConnect;
            socket.connect(endpoint, errorConnect);

            // Debogage : affichage d un message de connexion reussie ou echouee
            if (!errorConnect) {
                std::cout << "Connexion reussie au serveur Node.js" << std::endl << std::endl;

                bool errorr = true;
                // Boucle d envoi des donnees toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(5));
                    errorr = envoyerDonnees(socket, data);
                    
                }
            }
            else {
                std::cerr << "Echec de la connexion au serveur Node.js : " << std::endl << errorConnect.message() << std::endl << std::endl;

                bool errorr = true;
                // Boucle d envoi des donnees toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(5));
                    errorr = envoyerDonnees(socket, data);

                }
            }

            // Debogage : affichage d un message de tentative de reconnexion
            std::cout << std::endl << "Tentative de reconnexion au serveur Node.js dans 5 secondes..." << std::endl << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(5));

            // Fermeture du socket
            socket.close();
        }
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
