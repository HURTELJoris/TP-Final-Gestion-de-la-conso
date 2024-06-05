#include "ARDUINO CARTE E.S.h"

// Constructeur de la classe CarteES
// @param serverAddress : adresse IP du serveur Node.js
// @param serverPort : port d'ecoute du serveur Node.js
ArduinoCarteES::ArduinoCarteES(const std::string& serverAddress, int serverPort, const std::string& serialPort)
    : endpoint_(boost::asio::ip::address::from_string(serverAddress), serverPort),
    serialPort_(io_context_)
{
    connectSerial(serialPort);
}

//M�thode pour cr�er un string de la date actuelle au format SQL DATETIME
std::string ArduinoCarteES::createDateTime()
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

void ArduinoCarteES::connectSerial(const std::string& port, unsigned int baud_rate) {
    try {
        boost::asio::io_context io_context;
        serialPort_.open(port);
        serialPort_.set_option(boost::asio::serial_port_base::baud_rate(baud_rate));

        std::cout << "Connexion serie etablie avec la carte Arduino sur le port " << port << " a " << baud_rate << " baud." << std::endl;
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la connexion serie avec la carte Arduino : " << e.what() << std::endl;
    }
}


std::string ArduinoCarteES::readFromSerial() {
    std::cout << "READ" << std::endl;
    // Cr�er un objet buffer pour stocker la donn�e lue
    boost::asio::streambuf buffer;

    // Lire la donn�e � partir du port s�rie en utilisant la fonction read_until
    // qui s'arr�te d�s qu'elle a lu le d�limiteur sp�cifi� ('\n' dans ce cas)
    boost::asio::read_until(serialPort_, buffer, '\n');

    // Extraire la donn�e lue du buffer et la convertir en cha�ne de caract�res
    std::istream is(&buffer);
    std::string donnee;
    std::getline(is, donnee);

    // Renvoie la donn�e lue
    return donnee;
}








// M�thode pour �tablir la connexion avec le serveur Node.js et envoyer les donn�es
void ArduinoCarteES::connectAndSend() {
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
bool ArduinoCarteES::sendData(tcp::socket& socket) {
    boost::property_tree::ptree data;

    // G�n�ration al�atoire des donn�es (en attendant les vraies donn�es de la carte E/S)
    //int sourceVerte = rand() % 2;
    int sourceVerte = std::stoi(readFromSerial());
    int tabPowerBox[8];
    for (int i = 0; i < 8; i++) {
        tabPowerBox[i] = rand() % 2;
    }
    std::string DateTime = createDateTime();
    //std::cout << DateTime;
    // Ajout des donn�es � l'objet boost::property_tree::ptree
    data.put("sourceVerte", sourceVerte);
    for (int i = 0; i < 8; i++) {
        data.put("tabPowerBox." + std::to_string(i), tabPowerBox[i]);
    }
    data.put("date", DateTime);

    // Conversion de l'objet boost::property_tree::ptree en cha�ne de caracteres JSON
    std::stringstream ss;
    boost::property_tree::write_json(ss, data, false);
    std::string jsonData = ss.str();


    // Si la file d'attente est pleine, retirez l'�l�ment le plus ancien
    if (dataQueue_.size() == maxQueueSize) {
        const std::string Olddata = dataQueue_.front();
        dataQueue_.pop_front();
        std::cout << std::endl << "File d\'attente pleine. " << std::endl << "    Suppression des anciennes donnees : " << std::endl << "    " + Olddata;
    }

    // Si la file d'attente n'est pas vide, on ajoute les nouvelles donn�es � la file d'attente
    bool con = true;
    if (!dataQueue_.empty()) {
        dataQueue_.push_back(jsonData);
        std::cout << "Donnees mises en file d\'attente : " << std::endl << "    " + jsonData << std::endl;
        jsonData = dataQueue_.front();
        con = false;
    }

    // Debogage : affichage des donn�es � envoyer
    std::cout << std::endl << "Donnees a envoyer : " << std::endl;
    for (const std::string& data : dataQueue_) {
        std::cout << data;
    }
    if (dataQueue_.size() == 0) {
        std::cout << jsonData;
    }

    std::cout << std::endl;





    // Envoi des donn�es au serveur Node.js
    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(jsonData), error);

    if (error) {

        // Si l'envoi des donn�es �choue, on les stocke dans la file d'attente
        if (con) {
            dataQueue_.push_back(jsonData);
        }

        std::cerr << "Erreur lors de l\'envoi des donnees au serveur Node.js : " << std::endl << std::endl << error.message() << std::endl << std::endl;

        std::cout << "Stockees : " << std::endl;
        for (const std::string& data : dataQueue_) {
            std::cout << data;
        }
        if (dataQueue_.size() == 0) {
            std::cout << jsonData;
        }

        return false;
    }
    else {
        std::cout << "Donnees envoyees avec succes" << std::endl;

        // On v�rifie s'il reste des donn�es dans la file d'attente et on les envoie
        while (!dataQueue_.empty()) {
            dataQueue_.pop_front();
            if (dataQueue_.empty()) { break; }
            std::string queuedData = dataQueue_.front();
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

    ArduinoCarteES sender("192.168.64.88", 1234, "COM4");

    /*
        std::string DateTime = sender.createDateTime();
        // Afficher la date et l'heure au format SQL DATETIME
        std::cout << "Date et heure actuelles au format SQL DATETIME : " << DateTime << std::endl;
    */

    sender.connectAndSend();
    //sender.readFromSerial();

    return 0;
}