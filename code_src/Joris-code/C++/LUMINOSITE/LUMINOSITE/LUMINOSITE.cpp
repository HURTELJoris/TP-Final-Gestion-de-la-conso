#include "LUMINOSITE.h"

// Constructeur de la classe LUMINOSITE
// @param serverAddress : adresse IP du serveur Node.js
// @param serverPort : port d'ecoute du serveur Node.js
LUMINOSITE::LUMINOSITE(const std::string& serverAddress, int serverPort)
    : endpoint_(boost::asio::ip::address::from_string(serverAddress), serverPort) {}

//M�thode pour cr�er un string de la date actuelle au format SQL DATETIME
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



// M�thode pour �tablir la connexion avec le serveur Node.js et envoyer les donn�es
void LUMINOSITE::connectAndSend() {
    try {
        boost::asio::io_context io_context;
        tcp::socket socket(io_context);

        while (true) {
            boost::system::error_code errorConnect;
            socket.connect(endpoint_, errorConnect);

            // Debogage : affichage d'un message de connexion r�ussie ou echou�e
            if (!errorConnect) {
                std::cout << "Connexion reussie au serveur Node.js" << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des donn�es toutes les 5 secondes
                while (errorr) {
                    std::this_thread::sleep_for(std::chrono::seconds(3));
                    errorr = sendData(socket);
                }
            }
            else {
                std::cerr << "Echec de la connexion au serveur Node.js : " << std::endl << "    " << errorConnect.message() << std::endl << std::endl;

                bool errorr = true;
                // Boucle d'envoi des donn�es toutes les 5 secondes
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
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << std::endl << "    " << e.what() << std::endl;
    }
}

// M�thode pour envoyer des donn�es au serveur Node.js
// @param socket : socket TCP pour la communication avec le serveur Node.js
bool LUMINOSITE::sendData(tcp::socket& socket) {
    boost::property_tree::ptree data;

    // G�n�ration al�atoire des donn�es (en attendant les vraies donn�es de luminosit�)

    /*
    int sourceVerte = rand() % 2;
    int tabPowerBox[8];
    for (int i = 0; i < 8; i++) {
        tabPowerBox[i] = rand() % 2;
    }
    */
    // Initialisation du g�n�rateur de nombres al�atoires avec le temps actuel
    srand(time(NULL));
    // G�n�ration de la luminosit� al�atoire bas�e sur le temps
    float luminosity = static_cast<float>(rand()) / (static_cast<float>(RAND_MAX / 99999.0f)) + 1.0f;
    std::string DateTime = createDateTime();
    //std::cout << DateTime;
    // Ajout des donn�es � l'objet boost::property_tree::ptree

    /*
    data.put("sourceVerte", sourceVerte);
    for (int i = 0; i < 8; i++) {
        data.put("tabPowerBox." + std::to_string(i), tabPowerBox[i]);
    }
    */
    data.put("luminosity", luminosity);
    data.put("date", DateTime);

    // Conversion de l'objet boost::property_tree::ptree en cha�ne de caracteres JSON
    std::stringstream ss;
    boost::property_tree::write_json(ss, data, false);
    std::string jsonData = ss.str();

    // Debogage : affichage des donn�es � envoyer
    std::cout << std::endl << "Donnees a envoyer : " << std::endl;
    for (const std::string& data : dataQueue_) {
        std::cout << data;
    }
    std::cout << jsonData;
    std::cout << std::endl << std::endl;

    // Si la file d'attente est pleine, retirez l'�l�ment le plus ancien
    if (dataQueue_.size() >= maxQueueSize) {
        const std::string Olddata = dataQueue_.front();
        dataQueue_.pop_front();
        std::cout << std::endl << "File d\'attente pleine. " << std::endl << "    Suppression des anciennes donnees : " << std::endl << "    " + Olddata << std::endl << std::endl;
    }

    // Si la file d'attente n'est pas vide, on ajoute les nouvelles donn�es � la file d'attente
    bool con = true;
    if (!dataQueue_.empty()) {
        dataQueue_.push_back(jsonData);
        std::cout << "Donnees mises en file d\'attente : " << std::endl << jsonData << std::endl;
        jsonData = dataQueue_.front();
        con = false;
    }

    // Envoi des donn�es au serveur Node.js
    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(jsonData), error);

    if (error) {

        // Si l'envoi des donn�es �choue, on les stocke dans la file d'attente
        if (con) {
            dataQueue_.push_back(jsonData);
        }

        std::cerr << "Erreur lors de l\'envoi des donnees au serveur Node.js : " << std::endl << std::endl << error.message() << std::endl << std::endl;

        std::cout << "Stockees : " << std::endl << jsonData;

        return false;
    }
    else {
        std::cout << "Donnees envoyees avec succes" << std::endl;

        // On v�rifie s'il reste des donn�es dans la file d'attente et on les envoie
        while (!dataQueue_.empty()) {
            std::string queuedData = dataQueue_.front();
            dataQueue_.pop_front();
            std::cout << "Envoi des donnees stockees : " << std::endl << queuedData << std::endl;
            boost::asio::write(socket, boost::asio::buffer(queuedData), error);
            if (error) {
                std::cerr << "Erreur lors de l\'envoi des donnees stockees au serveur Node.js : " << std::endl << "    " + error.message() << std::endl << std::endl;
            }
            else {
                std::cout << "Donnees stockees envoyees avec succes" << std::endl << std::endl;
            }
        }
        return true;
    }
}

int main() {

    LUMINOSITE sender("192.168.64.88", 1234);

    /*
        std::string DateTime = sender.createDateTime();
        // Afficher la date et l'heure au format SQL DATETIME
        std::cout << "Date et heure actuelles au format SQL DATETIME : " << DateTime << std::endl;
    */

    sender.connectAndSend();

    return 0;
}