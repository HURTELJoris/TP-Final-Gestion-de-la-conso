<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panneau solaire</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <h1>Panneau solaire</h1>

        <form id="insert-form">

            <label for="id_capteur">ID capteur : </label>
            <input type="number" id="id_capteur" name="id_capteur" required><br>

            <label for="puissance">Puissance : </label>
            <input type="number" id="puissance" name="puissance" required><br>

            <label for="intensité">Intensité : </label>
            <input type="number" id="intensité" name="intensité" required><br>

            <label for="production_energie">production d'énergie : </label>
            <input type="number" id="production_energie" name="production_energie" required><br>

            <button type="submit">Ajouter</button>
        </form>

        <table id="capteurs-table">
            <tr>
                <th>ID panneau</th>
                <th>ID Capteur</th>
                <th>Puissance</th>
                <th>Intensité</th>
                <th>production d'énergie</th>
                <th>Supprimer</th>
                <th>Modifier</th>
            </tr>
            <!-- Les lignes du tableau seront insérées ici -->
        </table>

        <script src="main.js"></script>

    </body>
</html> 