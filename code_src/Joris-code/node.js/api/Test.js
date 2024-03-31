let proportionsTempVertStockees = [];

function calculerProportionTempVert(sourceVerte, tabPowerBox) {
    const tempsPuissanceVerte = sourceVerte === 1 ? 5000 : 0; // 5000 ms si sourceVerte = 1, 0 sinon
    const tempsPuissanceBox = new Array(8).fill(0); // Tableau de 8 éléments remplis de 0

    // Pour chaque box du tableau tabPowerBox
    for (let i = 0; i < tabPowerBox.length; i++) {
        if (tabPowerBox[i] === 1) {
            tempsPuissanceBox[i] = 5000; // 5000 ms si tabPowerBox[i] = 1
        }
    }

    // Calcul des proportions de temps vert
    const proportionsTempVert = tempsPuissanceBox.map((tempsBox) => {
        if (tempsBox !== 0) {
            return (tempsPuissanceVerte / tempsBox) * 100;
        } else {
            return 0;
        }
    });

    // Arrondi des proportions à 2 chiffres après la virgule
    const proportionsArrondies = proportionsTempVert.map((proportion) => {
        return proportion.toFixed(2);
    });

    // Stockage des proportions dans le tableau de tableaux
    proportionsTempVertStockees.push(proportionsArrondies);

    return proportionsArrondies;
}

setInterval(() => {
    const sourceVerte = Math.floor(Math.random() * 2); // 0 ou 1 aléatoirement
    const tabPowerBox = new Array(8).fill(0).map(() => Math.floor(Math.random() * 2)); // Tableau de 8 éléments avec des 0 ou des 1 aléatoirement

    console.log(`Valeur de sourceVerte : ${sourceVerte}`);
    console.log(`Valeurs de tabPowerBox : ${tabPowerBox}`);
    console.log(``);
    const proportionsTempVert = calculerProportionTempVert(sourceVerte, tabPowerBox);
    console.log(`Proportions de temps vert : ${JSON.stringify(proportionsTempVert)}`);
    console.log(`Tableau de proportions : ${JSON.stringify(proportionsTempVertStockees)}`);
    console.log(``);
    console.log(``);
    // Calcul des moyennes des proportions de temps vert
    const moyennesProportions = new Array(8).fill(0);
    for (let i = 0; i < proportionsTempVertStockees.length; i++) {
        for (let j = 0; j < proportionsTempVertStockees[i].length; j++) {
            moyennesProportions[j] += parseFloat(proportionsTempVertStockees[i][j]);
        }
    }
    for (let i = 0; i < moyennesProportions.length; i++) {
        moyennesProportions[i] /= proportionsTempVertStockees.length;
        moyennesProportions[i] = moyennesProportions[i].toFixed(2);
    }

    // Affichage des moyennes des proportions de temps vert
    console.log(`Moyennes des proportions de temps vert : ${JSON.stringify(moyennesProportions)}`);
    console.log(``);
    console.log(``);
}, 5000);