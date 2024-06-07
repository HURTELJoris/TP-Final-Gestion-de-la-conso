#pragma once

#ifndef ARDUINO_LUMINOSITE_H
#define ARDUINO_LUMINOSITE_H

#include <boost/asio.hpp> // Inclusion de la bibliothèque Boost.Asio pour les opérations d'entrée/sortie asynchrones
#include <boost/property_tree/ptree.hpp> // Inclusion de la bibliothèque Boost.PropertyTree pour manipuler des arbres de propriétés
#include <boost/property_tree/json_parser.hpp> // Inclusion de la bibliothèque Boost.PropertyTree pour parser du JSON
#include <boost/asio/serial_port.hpp> // Inclusion de la bibliothèque Boost.Serial pour la communication série

#include <deque> 
#include <iostream> 
#include <chrono> 
#include <thread> 

#include <ctime>

using boost::asio::ip::tcp; // Utilisation de l'espace de noms TCP de Boost.Asio

class ARDUINO_LUMINOSITE {
public:
    // Constructeur de la classe ARDUINO_LUMINOSITE
    // @param serverAddress : adresse IP du serveur Node.js
    // @param serverPort : port d'écoute du serveur Node.js
    ARDUINO_LUMINOSITE(const std::string& serverAddress, int serverPort, const std::string& serialPort);

    // Méthode pour établir la connexion avec le serveur Node.js et envoyer les données
    void connectAndSend();
    //Méthode pour créer un string de la date actuelle au format SQL DATETIME
    std::string createDateTime();

    // Méthode pour établir la connexion série avec une carte Arduino
    void connectSerial(const std::string& port, unsigned int baud_rate = 9600);

    // Méthode pour lire les données depuis le port série
    std::string readFromSerial();

private:
    // Méthode pour envoyer des données au serveur Node.js
    // @param socket : socket TCP pour la communication avec le serveur Node.js
    bool sendData(tcp::socket& socket);

    tcp::endpoint endpoint_; // Point de terminaison TCP représentant l'adresse IP et le port du serveur Node.js

    static const size_t maxQueueSize = 3; // Définir la taille maximale de la file d'attente (ajustable au choix)
    std::deque<std::string> dataQueue_; // File d'attente pour stocker les données à envoyer en cas d'échec d'envoi

    boost::asio::io_context io_context_; // io_context pour gérer les opérations asynchrones
    boost::asio::serial_port serialPort_; // Port série pour la communication avec la carte Arduino

    std::string buffer;

    std::string receivedData_; // Buffer pour stocker les données reçues
};

#endif /* ARDUINO_LUMINOSITE_H */