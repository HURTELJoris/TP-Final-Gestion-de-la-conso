#pragma once

#ifndef CARTE_ES_H
#define CARTE_ES_H

#include <boost/asio.hpp> // Inclusion de la bibliothèque Boost.Asio pour les opérations d'entrée/sortie asynchrones
#include <boost/property_tree/ptree.hpp> // Inclusion de la bibliothèque Boost.PropertyTree pour manipuler des arbres de propriétés
#include <boost/property_tree/json_parser.hpp> // Inclusion de la bibliothèque Boost.PropertyTree pour parser du JSON
#include <deque> 
#include <iostream> 
#include <chrono> 
#include <thread> 

using boost::asio::ip::tcp; // Utilisation de l'espace de noms TCP de Boost.Asio

class CarteES {
public:
    // Constructeur de la classe CarteES
    // @param serverAddress : adresse IP du serveur Node.js
    // @param serverPort : port d'écoute du serveur Node.js
    CarteES(const std::string& serverAddress, int serverPort);

    // Méthode pour établir la connexion avec le serveur Node.js et envoyer les données
    void connectAndSend();

private:
    // Méthode pour envoyer des données au serveur Node.js
    // @param socket : socket TCP pour la communication avec le serveur Node.js
    bool sendData(tcp::socket& socket);

    tcp::endpoint endpoint_; // Point de terminaison TCP représentant l'adresse IP et le port du serveur Node.js

    static const size_t maxQueueSize = 2; // Définir la taille maximale de la file d'attente (ajustable au choix)
    std::deque<std::string> dataQueue_; // File d'attente pour stocker les données à envoyer en cas d'échec d'envoi
};

#endif /* CARTE_ES_H */
