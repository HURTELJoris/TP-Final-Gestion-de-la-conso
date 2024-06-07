#include <Wire.h>
#include <BH1750.h>
#include <Ethernet.h>

// Paramètres réseau
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };  // Adresse MAC de l'appareil
IPAddress ip(192, 168, 65, 177);  // Adresse IP statique de l'appareil
IPAddress server(192, 168, 65, 151);  // Adresse IP du serveur avec lequel communiquer

// Initialise la classe Ethernet client
EthernetClient client;

// Initialise le capteur BH1750
BH1750 lightMeter;

void setup() {
  // Initialise la communication série
  Serial.begin(9600);

  // Initialise la broche numérique LED_BUILTIN comme sortie
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);  // Éteindre la LED

  // Initialise l'Ethernet avec l'adresse MAC et IP
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

  // Initialise le capteur BH1750
  Wire.begin();
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 initialisé avec succès");
  } else {
    Serial.println("Erreur d'initialisation du BH1750");
  }
}

void loop() {
  // Lire la valeur de luminosité du capteur BH1750
  float lux = lightMeter.readLightLevel();
  Serial.print("Luminosité: ");
  Serial.print(lux);
  Serial.println(" lx");

  // Envoyer la valeur de luminosité au serveur si connecté
  if (client.connected()) {
    client.print("Luminosité: ");
    client.print(lux);
    client.println(" lx");
  }

  // Faire clignoter la LED
  digitalWrite(LED_BUILTIN, LOW);  // Allumer la LED
  delay(1000);  // Attendre une seconde
  digitalWrite(LED_BUILTIN, HIGH);  // Éteindre la LED
  
  // Attendre une seconde avant la prochaine lecture
  delay(1000);
}
