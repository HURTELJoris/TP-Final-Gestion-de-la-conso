// Fonction setup(), appelée au démarrage de la carte Arduino
void setup() {

  // Initialise la communication avec le PC
  Serial.begin(9600);
  // Définit la broche 6 comme une sortie pour contrôler le composant seuil (LED ou autre)
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(A1, OUTPUT);
}

// Fonction loop(), appelée continuellement en boucle tant que la carte Arduino est alimentée
void loop() {
  
  // Mesure la tension sur la broche A0
  int valeur = analogRead(A0);
  int valeurdigital = digitalRead(8);
  
  
  // Transforme la mesure (nombre entier) en tension via un produit en croix
  float tension = valeur * (5.0 / 1023.0);
  
  
  if (tension > 0.15) { // Si la tension dépasse environ 0.2V (1023 * 0.2/5 >= 41)
    digitalWrite(6, HIGH); // Allumer la LED ou effectuer une action
  } else {
    digitalWrite(6, LOW); // Éteindre la LED ou effectuer une action
  }
  
  
  
  if (valeurdigital)
  {
    digitalWrite(7, HIGH);
  }
  else
  {
    digitalWrite(7, LOW);
  }
  
  
  // Envoi la mesure au PC pour affichage et attends 1s
  Serial.print("Valeur du potentiometre : ");
  Serial.print(valeur);
  Serial.print(", Tension : ");
  Serial.print(tension);
  Serial.print(" V");
  Serial.print(", Digital : ");
  Serial.println(valeurdigital);

  delay(1000);
}