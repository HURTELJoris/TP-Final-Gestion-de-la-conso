#ifndef CAPTEUR_LUMINOSITE_H
#define CAPTEUR_LUMINOSITE_H

#include "Dask.h"


#include <deque>
#include <iostream>
#include <chrono>
#include <thread>
#include <ctime>
#include <vector>
#include <numeric>

#include <string>
#include <sstream>
#include <iterator>
#include <algorithm>

#include <ws2tcpip.h>
#include <winsock2.h>




#pragma comment(lib, "Ws2_32.lib")

class capteur_luminosite
{
public:
    capteur_luminosite(const std::string& serverAddress, int serverPort, int carte = PCI_9111DG);
    ~capteur_luminosite();

    void lire_tension(double& tension, int canal = 0, int gamme = AD_B_10_V);
    double lire_tension(int canal = 0, int gamme = AD_B_10_V);


    unsigned short lire_tension_AI_ReadChannel(int canal = 0, int gamme = AD_B_10_V);

    int getnumcarte() { return this->numcarte; };
    void setnumcarte(int value) { this->numcarte = value; };


    //------------------------------------------------//
   

    // M�thode pour �tablir la connexion avec le serveur Node.js et envoyer les donn�es
    void connectAndSend();
    //M�thode pour cr�er un string de la date actuelle au format SQL DATETIME
    std::string createDateTime();


    //------------------------------------------------//

    double getresistance() { return this->resistance; };

private:
    int m_carte;
    int numcarte;

    //------------------------------------------------//

    // M�thode pour envoyer des donn�es au serveur Node.js
    // @param socket : socket TCP pour la communication avec le serveur Node.js
    bool sendData(SOCKET& socket);


    std::string serverAddress_; // Adresse IP du serveur Node.js
    int serverPort_; // Port d'�coute du serveur Node.js

    static const size_t maxQueueSize = 3; // D�finir la taille maximale de la file d'attente (ajustable au choix)
    std::deque<std::string> dataQueue_; // File d'attente pour stocker les donn�es � envoyer en cas d'�chec d'envoi


    sockaddr_in endpoint_; // Point de terminaison TCP repr�sentant l'adresse IP et le port du serveur Node.js


    //------------------------------------------------//

    double resistance = 44.6; // Par exemple, une r�sistance de 44.6 ohms
};

#endif // CAPTEUR_LUMINOSITE_H


