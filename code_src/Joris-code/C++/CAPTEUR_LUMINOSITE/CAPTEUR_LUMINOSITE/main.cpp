//									VRAI CODE
#include "capteur_luminosite.h"

int main()
{
    using namespace std;
    try {
        capteur_luminosite capteur("192.168.64.88", 1234);

        capteur.connectAndSend();


        

    
    }
    catch (std::exception& e) {
        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << std::endl << "    " << e.what() << std::endl;
    }

    return 0;
}




////									FAUX CODE
//#include "capteur_luminosite.h"
//#include <iostream>
//#include <thread>
//#include <chrono>
//#include <vector>
//#include <numeric>
//
//int main()
//{
//    using namespace std;
//    try {
//        capteur_luminosite capteur("192.168.64.88", 1234);
//      
//
//        
//
//        double resistance = 44.6; // Par exemple, une résistance de 44.6 ohms
//
//        while (true) // Boucle infinie pour mesurer en continu
//        {
//            vector<double> tensions;
//
//            for (int i = 0; i < 11; ++i)
//            {
//                double tension = capteur.lire_tension(0, 5); // Mesure du canal 0 avec la gamme 4
//                if (i >= 1)
//                {
//                    //cout << "Tension lue sur le canal 0 avec la gamme 5 : " << tension  << " V"<< endl;
//                    tensions.push_back(tension);
//                }
//                this_thread::sleep_for(chrono::milliseconds(300)); // Pause de 150ms entre chaque lecture
//            }
//
//
//            // Calcul de la moyenne des tensions lues
//            double moyenne_tension = accumulate(tensions.begin(), tensions.end(), 0.0) / tensions.size();
//            double wattm = moyenne_tension * 10000;
//            double lux = wattm * 126.7;
//
//            cout << "Tension lue sur le canal 0 avec la gamme 5 : " << moyenne_tension << " V, " << moyenne_tension * 1000 << " mV" << endl;
//            cout << "Puissance lumineuse lue sur le canal 0 avec la gamme 5 : " << wattm << " W/m^2, " << lux << " Lux" << endl << endl;
//
//            double tension = capteur.lire_tension(1, 1); // Mesure du canal 1 avec la gamme 1
//
//            double courant = tension / resistance; // Calcul de l'intensité du courant en utilisant la loi d'Ohm
//            double puissance = tension * courant;
//
//            cout << "Tension lue sur le canal 1 avec la gamme 1 : " << tension << " V" << endl;
//            cout << "Intensite moyenne du courant sur le canal 0 : " << courant << " A" << endl;
//            cout << "Puissance moyenne du courant sur le canal 0 : " << puissance << " W" << endl << endl;
//            cout << "-----------------------------------------------------------" << endl << endl;
//
//        }
//
//        capteur.connectAndSend();
//    }
//    catch (std::exception& e) {
//        std::cerr << "Erreur lors de la communication avec le serveur Node.js : " << std::endl << "    " << e.what() << std::endl;
//    }
//
//    return 0;
//}



////											POUR UNIQUEMENT TENSION CAPTEUR
//#include "capteur_luminosite.h"
//#include <iostream>
//#include <thread>
//#include <chrono>
//#include <vector>
//#include <numeric>
//
//int main()
//{
//    using namespace std;
//
//    capteur_luminosite capteur;
//
//    double resistance = 44.6; // Par exemple, une résistance de 44.6 ohms
//
//    while (true) // Boucle infinie pour mesurer en continu
//    {
//        double tension = capteur.lire_tension(0, 5); // Mesure du canal 0 avec la gamme 4
//        double courant = tension / resistance; // Calcul de l'intensité du courant en utilisant la loi d'Ohm
//        double puissance = tension * courant;
//
//        cout << "Tension sur le canal 0 avec la gamme 5 : " << tension << " V" << endl;
//        //cout << "Intensite du courant sur le canal 0 : " << courant << " A" << endl;
//        //cout << "Puissance du courant sur le canal 0 : " << puissance << " W" << endl << endl;
//
//        // Pause de 150ms avant la prochaine mesure
//        this_thread::sleep_for(chrono::milliseconds(150));
//    }
//
//    return 0;
//}


////                                            COMPARAISON AI_VReadChannel et AI_ReadChannel
//#include "capteur_luminosite.h"
//#include <iostream>
//#include <thread>
//#include <chrono>
//#include <cmath> // Pour la fonction pow
//#include <iomanip> // Pour la manipulation de la précision de sortie
//
//int main()
//{
//    using namespace std;
//
//    capteur_luminosite capteur;
//
//    double resistance = 44.6; // Par exemple, une résistance de 44.6 ohms
//
//    while (true) // Boucle infinie pour mesurer en continu
//    {
//        // Mesure du canal 0 avec la gamme 5 avec AI_VReadChannel
//        double tension_VReadChannel = capteur.lire_tension(0, 5);
//
//        // Mesure du canal 0 avec la gamme 5 avec AI_ReadChannel
//        unsigned short valeur_AI_ReadChannel = capteur.lire_tension_AI_ReadChannel(0, 5);
//        double tension_ReadChannel = (valeur_AI_ReadChannel / 65535.0) * 10.0; // Conversion de la valeur en tension
//
//        // Affichage des résultats pour AI_VReadChannel
//        cout << "AI_VReadChannel : " << tension_VReadChannel << " V" << endl << endl;
//
//        // Affichage des résultats pour AI_ReadChannel
//        cout << "AI_ReadChannel BRUT : " << valeur_AI_ReadChannel << endl;
//        cout << "AI_ReadChannel : " << tension_ReadChannel << " V" << endl << endl;
//        cout << "-----------------------------------------------------------" << endl << endl;
//
//        // Pause de 3 secondes avant la prochaine mesure
//        this_thread::sleep_for(chrono::seconds(3));
//    }
//
//    return 0;
//}