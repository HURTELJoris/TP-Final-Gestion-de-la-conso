// Fonction setup(), appelée au démarrage de la carte Arduino
void setup() {
  // Initialise la communication avec le PC
  Serial.begin(9600);
}

// Fonction loop(), appelée continuellement en boucle tant que la carte Arduino est alimentée
void loop() {
  
  // Mesure la tension sur la broche A0
  int valeur = analogRead(A0);
  //int valeurdigital = digitalRead(8);
  int valeurdigital2 = analogRead(A5);
  
  // Transforme la mesure (nombre entier) en tension via un produit en croix
  float tension = valeurdigital2 * (1.0 / 198.0);

   if(tension > 0.5)
  {
    Serial.println(1);
  }
  else
  {
    Serial.println(0);
  }
 

  delay(1000);
}