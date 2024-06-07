#pragma once

#ifndef ARDUINO_LUMINOSITE_H
#define ARDUINO_LUMINOSITE_H

#include <boost/asio.hpp> // Inclusion de la biblioth�que Boost.Asio pour les op�rations d'entr�e/sortie asynchrones
#include <boost/property_tree/ptree.hpp> // Inclusion de la biblioth�que Boost.PropertyTree pour manipuler des arbres de propri�t�s
#include <boost/property_tree/json_parser.hpp> // Inclusion de la biblioth�que Boost.PropertyTree pour parser du JSON
#include <boost/asio/serial_port.hpp> // Inclusion de la biblioth�que Boost.Serial pour la communication s�rie

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
    // @param serverPort : port d'�coute du serveur Node.js
    ARDUINO_LUMINOSITE(const std::string& serverAddress, int serverPort, const std::string& serialPort);

    // M�thode pour �tablir la connexion avec le serveur Node.js et envoyer les donn�es
    void connectAndSend();
    //M�thode pour cr�er un string de la date actuelle au format SQL DATETIME
    std::string createDateTime();

    // M�thode pour �tablir la connexion s�rie avec une carte Arduino
    void connectSerial(const std::string& port, unsigned int baud_rate = 9600);

    // M�thode pour lire les donn�es depuis le port s�rie
    std::string readFromSerial();

private:
    // M�thode pour envoyer des donn�es au serveur Node.js
    // @param socket : socket TCP pour la communication avec le serveur Node.js
    bool sendData(tcp::socket& socket);

    tcp::endpoint endpoint_; // Point de terminaison TCP repr�sentant l'adresse IP et le port du serveur Node.js

    static const size_t maxQueueSize = 3; // D�finir la taille maximale de la file d'attente (ajustable au choix)
    std::deque<std::string> dataQueue_; // File d'attente pour stocker les donn�es � envoyer en cas d'�chec d'envoi

    boost::asio::io_context io_context_; // io_context pour g�rer les op�rations asynchrones
    boost::asio::serial_port serialPort_; // Port s�rie pour la communication avec la carte Arduino

    std::string buffer;

    std::string receivedData_; // Buffer pour stocker les donn�es re�ues
};

#endif /* ARDUINO_LUMINOSITE_H */