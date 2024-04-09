// CARTE E.S.cpp : Ce fichier contient la fonction 'main'. L'exécution du programme commence et se termine à cet endroit.
//

#include <iostream>
#include <string>
#include <boost/asio.hpp>
#include <boost/property_tree/json_parser.hpp>

using boost::asio::ip::tcp;
using namespace std;

int main() {
    try {
        // Création d'un objet boost::asio::io_service
        boost::asio::io_service io_service;

        // Création d'un socket TCP
        tcp::socket socket(io_service);

        // Connexion au serveur Node.js
        tcp::endpoint endpoint(boost::asio::ip::address::from_string("192.168.64.88"), 1234);
        socket.connect(endpoint);

        // Création d'un objet boost::property_tree::ptree pour stocker les données à envoyer
        boost::property_tree::ptree data;

        // Génération aléatoire des données (à personnaliser en fonction de vos besoins)
        int sourceVerte = rand() % 2;
        int tabPowerBox[8];
        for (int i = 0; i < 8; i++) {
            tabPowerBox[i] = rand() % 2;
        }

        // Ajout des données à l'objet boost::property_tree::ptree
        data.put("sourceVerte", sourceVerte);
        for (int i = 0; i < 8; i++) {
            data.put("tabPowerBox." + to_string(i), tabPowerBox[i]);
        }

        // Conversion de l'objet boost::property_tree::ptree en chaîne de caractères JSON
        stringstream ss;
        boost::property_tree::write_json(ss, data, false);
        string jsonData = ss.str();

        // Envoi des données au serveur Node.js
        boost::system::error_code error;
        boost::asio::write(socket, boost::asio::buffer(jsonData), error);
        if (error) {
            cerr << "Erreur lors de l'envoi des données au serveur Node.js : " << error.message() << endl;
            return 1;
        }

        // Fermeture du socket
        socket.close();
    }
    catch (std::exception& e) {
        cerr << "Erreur lors de la communication avec le serveur Node.js : " << e.what() << endl;
        return 1;
    }

    return 0;
}


// Exécuter le programme : Ctrl+F5 ou menu Déboguer > Exécuter sans débogage
// Déboguer le programme : F5 ou menu Déboguer > Démarrer le débogage

// Astuces pour bien démarrer : 
//   1. Utilisez la fenêtre Explorateur de solutions pour ajouter des fichiers et les gérer.
//   2. Utilisez la fenêtre Team Explorer pour vous connecter au contrôle de code source.
//   3. Utilisez la fenêtre Sortie pour voir la sortie de la génération et d'autres messages.
//   4. Utilisez la fenêtre Liste d'erreurs pour voir les erreurs.
//   5. Accédez à Projet > Ajouter un nouvel élément pour créer des fichiers de code, ou à Projet > Ajouter un élément existant pour ajouter des fichiers de code existants au projet.
//   6. Pour rouvrir ce projet plus tard, accédez à Fichier > Ouvrir > Projet et sélectionnez le fichier .sln.
