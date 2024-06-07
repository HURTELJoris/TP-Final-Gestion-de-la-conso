#include <Ethernet.h>

// Paramètres réseau
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };  // Adresse MAC de l'appareil
IPAddress ip(192, 168, 65, 177);  // Adresse IP statique de l'appareil
IPAddress server(192, 168, 65, 151);  // Adresse IP du serveur avec lequel communiquer

// Initialise la classe Ethernet client
EthernetClient client;

void setup() {
  // Initialise la broche numérique LED_BUILTIN comme sortie
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);  // Éteindre la LED

  // Démarrer Ethernet avec l'adresse MAC et IP
  Ethernet.begin(mac, ip);

  // Donne le temps au shield de se connecter au réseau
  delay(1000);

  // Essayer de se connecter au serveur
  if (client.connect(server, 8080)) {
    Serial.println("Connecté au serveur");
    client.println("Bonjour du Portenta H7 !");
  } else {
    Serial.println("Échec de la connexion au serveur");
  }
}

void loop() {
  // Faire clignoter la LED
  digitalWrite(LED_BUILTIN, LOW);  // Allumer la LED
  delay(1000);  // Attendre une seconde
  digitalWrite(LED_BUILTIN, HIGH);  // Éteindre la LED
  
  // Envoie un message au serveur TCP
  if (client.connected()) {
    client.println("Bonjour du Portenta H7 !");
  }

  delay(1000);  // Attendre une seconde
}
