#include "capteur_luminosite.h"

#include <cstdio>

capteur_luminosite::capteur_luminosite(const std::string& serverAddress, int serverPort, int carte)
    : m_carte(carte), numcarte(-1), serverAddress_(serverAddress), serverPort_(serverPort)  // Initialisation de numcarte à une valeur invalide
{
    int err = 0;

    // Enregistrement de la carte
    err = Register_Card(m_carte, 0);

    if (err >= 0)
    {
        setnumcarte(err);
    }
    else if (err < 0)
    {
        printf("Register_Card() error: %d\n", err);
    }


    //-------------------------//

    // Initialisation de Winsock
    WSADATA wsaData;
    int iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != NO_ERROR) {
        std::cerr << "Erreur lors de l'initialisation de Winsock : " << iResult << std::endl;
        throw std::runtime_error("Erreur lors de l'initialisation de Winsock");
    }

    // Création du point de terminaison TCP
    memset(&endpoint_, 0, sizeof(endpoint_));
    endpoint_.sin_family = AF_INET;
    int inet_result = inet_pton(AF_INET, serverAddress.c_str(), &endpoint_.sin_addr);
    if (inet_result <= 0) {
        std::cerr << "Erreur lors de la conversion de l'adresse IP : " << inet_result << std::endl;
        throw std::runtime_error("Erreur lors de la conversion de l'adresse IP");
    }
    endpoint_.sin_port = htons(serverPort);
}

capteur_luminosite::~capteur_luminosite()
{
    int err = 0;

    // Libération de la carte
    err = Release_Card(numcarte);  // Utilisation du numéro de carte enregistré
    if (err != NoErrorDask)
    {
        printf("Release_Card() error: %d\n", err);
    }
}

void capteur_luminosite::lire_tension(double& tension, int canal, int gamme)
{
    int err = 0;

    // Utilisation du numéro de carte enregistré
    // 
    //printf("Valeur de numcarte: %d\n", numcarte);
    //printf("Canal: %d, Gamme: %d\n", canal, gamme);

    // Lecture de la valeur brute
    err = AI_VReadChannel(numcarte, canal, gamme, &tension);  // Utilisation du numéro de carte enregistré
    if (err != NoErrorDask)
    {
        printf("AI_VReadChannel() error: %d\n", err);
    }
}

double capteur_luminosite::lire_tension(int canal, int gamme)
{
    double tension = 0.0;
    if (1 <= gamme && gamme <= 5)
    {
        lire_tension(tension, canal, gamme);
        return tension;
    }
    {
        printf("Gamme invalide\n");
        return 0.0;
    }
}

unsigned short capteur_luminosite::lire_tension_AI_ReadChannel(int canal, int gamme)
{
    int err = 0;
    unsigned short raw_value = 0;

    // Lecture de la valeur brute
    err = AI_ReadChannel(numcarte, canal, gamme, &raw_value);  // Utilisation du numéro de carte enregistré
    if (err != NoErrorDask)
    {
        printf("AI_ReadChannel() error: %d\n", err);
        return 0.0;
    }

    return raw_value;
}




//----------------------------------------//


void capteur_luminosite::connectAndSend() {
    try {
        while (true) {
            SOCKET clientSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
            if (clientSocket == INVALID_SOCKET) {
                std::cerr << "Erreur lors de la création de la socket : " << std::endl << "    " << WSAGetLastError() << std::endl;
                throw std::runtime_error("Erreur lors de la création de la socket");
            }

            // Tentative de connexion à la socket
            int iResult = connect(clientSocket, (sockaddr*)&endpoint_, sizeof(endpoint_));

            if (iResult == SOCKET_ERROR) {
                std::cerr << "Echec de la connexion au serveur Node.js : " << std::endl << "    " << WSAGetLastError() << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des données toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(3));
                    errorr = sendData(clientSocket);
                }
            }
            else {
                std::cout << "Connexion reussie au serveur Node.js" << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des données toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(3));
                    errorr = sendData(clientSocket);
                }
            }

            // Debogage : affichage d'un message de tentative de reconnexion
            std::cout << std::endl << "Tentative de reconnexion au serveur Node.js dans 5 secondes..." << std::endl << "    ";
            std::this_thread::sleep_for(std::chrono::seconds(4));

            // Fermeture de la socket
            iResult = closesocket(clientSocket);
            if (iResult == SOCKET_ERROR) {
                std::cerr << "Erreur lors de la fermeture de la socket : " << std::endl << "    " << WSAGetLastError() << std::endl;
                throw std::runtime_error("Erreur lors de la fermeture de la socket");
            }
        }
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << std::endl << "    " << e.what() << std::endl;
        WSACleanup();
    }
}

bool capteur_luminosite::sendData(SOCKET& socket) {
    // std::string DateTime = createDateTime();

    // Sérialisation de l'objet JSON en chaîne de caractères à l'aide de la fonction print_json()
    // Création d'un objet JSON pour stocker les données à envoyer
    std::stringstream jsonData;

    // Mesure des tensions
    std::vector<double> tensions;
    for (int i = 0; i < 11; ++i) {
        double tension = lire_tension(0, 5);
        if (i >= 1) {
            tensions.push_back(tension);
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }

    // Calcul de la moyenne des tensions lues
    double moyenne_tension = std::accumulate(tensions.begin(), tensions.end(), 0.0) / tensions.size();
    double wattm = moyenne_tension * 10000;
    double lux = wattm * 126.7;


    std::cout << "Tension lue sur le canal 0 avec la gamme 5 : " << moyenne_tension << " V, " << moyenne_tension * 1000 << " mV" << std::endl;
    std::cout << "Puissance lumineuse lue sur le canal 0 avec la gamme 5 : " << wattm << " W/m^2, " << lux << " Lux" << std::endl << std::endl;

    // Mesure de la tension, du courant et de la puissance sur le canal 1
    double tension_canal1 = lire_tension(1, 1);
    double courant = tension_canal1 / getresistance();
    double puissance = tension_canal1 * courant;

    std::cout << "Tension lue sur le canal 1 avec la gamme 1 : " << tension_canal1 << " V" << std::endl;
    std::cout << "Intensite moyenne du courant sur le canal 0 : " << courant << " A" << std::endl;
    std::cout << "Puissance moyenne du courant sur le canal 0 : " << puissance << " W" << std::endl << std::endl;
    std::cout << "-----------------------------------------------------------" << std::endl << std::endl;

    // Mise à jour de l'objet JSON avec les nouvelles données
    jsonData << "{\"power\":" << puissance << ",\"intensity\":" << courant << ",\"luminosity\":" << lux << ",\"date\":\"" << createDateTime() << "\"}\n";


    // Si la file d'attente est pleine, retirez l'élément le plus ancien
    if (dataQueue_.size() == maxQueueSize) {
        const std::string Olddata = dataQueue_.front();
        dataQueue_.pop_front();
        std::cout << std::endl << "File d'attente pleine. " << std::endl << "    Suppression des anciennes donnees : " << std::endl << "    " + Olddata;
    }

    // Si la file d'attente n'est pas vide, on ajoute les nouvelles données à la file d'attente
    bool con = true;
    if (!dataQueue_.empty()) {
        dataQueue_.push_back(jsonData.str());
        std::cout << "Donnees mises en file d'attente : " << std::endl << "    " + jsonData.str() << std::endl;
        con = false;
    }

    // Debogage : affichage des données à envoyer
    std::cout << std::endl << "Donnees a envoyer : " << std::endl;
    if (con) {
        std::cout << jsonData.str();
    }
    else {
        std::string allData = "";
        for (const std::string& data : dataQueue_) {
            allData += data;
            //allData += "\n";
        }
        std::cout << allData;
    }
    std::cout << std::endl;

    // Envoi des données au serveur Node.js
    int iResult = 0;
    if (con) {
        iResult = send(socket, jsonData.str().c_str(), static_cast<int>(jsonData.str().size()), 0);
    }
    else {
        for (std::string& data : dataQueue_) {
            //data += "\n";
            iResult = send(socket, data.c_str(), static_cast<int>(data.size()), 0);
            if (iResult == SOCKET_ERROR) {
                break;
            }
        }
    }

    if (iResult == SOCKET_ERROR) {
        // Si l'envoi des données échoue, on les stocke dans la file d'attente
        if (con) {
            dataQueue_.push_back(jsonData.str());
        }

        std::cerr << "Erreur lors de l'envoi des donnees au serveur Node.js : " << std::endl << std::endl << WSAGetLastError() << std::endl << std::endl;

        std::cout << "Stockees : " << std::endl;
        if (con) {
            std::cout << jsonData.str();
        }
        else {
            std::string allData = "";
            for (const std::string& data : dataQueue_) {
                allData += data;
                // Supprimez cette ligne : allData += "\n";
            }
            std::cout << allData;
        }
        std::cout << std::endl;


        return false;
    }
    else {
        std::cout << "Donnees envoyees avec succes" << std::endl;

        // On vérifie s'il reste des données dans la file d'attente et on les envoie
        if (!dataQueue_.empty()) {
            dataQueue_.clear();
        }
        return true;
    }
}

std::string capteur_luminosite::createDateTime()
{
    std::time_t t = std::time(nullptr);
    tm buffer;
#ifdef _WIN32
    // Pour les systèmes Windows (y compris 32 bits), utilisez localtime_s avec un pointeur vers le tampon.
    errno_t error_code = localtime_s(&buffer, &t);
    if (error_code != 0) {
        std::cerr << "Erreur lors de la récupération de l'heure locale : " << error_code << std::endl;
        throw std::runtime_error("Erreur lors de la récupération de l'heure locale");
    }
#else
    // Pour les systèmes non-Windows, utilisez localtime comme avant.
    tm* now = std::localtime(&t);
    if (now == nullptr) {
        std::cerr << "Erreur lors de la récupération de l'heure locale : " << strerror(errno) << std::endl;
        throw std::runtime_error("Erreur lors de la récupération de l'heure locale");
    }
#endif

    char time_buffer[80];
    std::strftime(time_buffer, sizeof(time_buffer), "%Y-%m-%d %H:%M:%S", &buffer);

    return std::string(time_buffer);
}

