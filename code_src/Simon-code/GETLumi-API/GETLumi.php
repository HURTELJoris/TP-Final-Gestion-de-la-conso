<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Capteurs Luminosité</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Capteurs Luminosité</h1>

    <form id="insert-form">
        <label for="luminosite">Luminosité : </label>
        <input type="number" id="luminosite" name="luminosite" required><br>

        <label for="date">Date : </label>
        <input type="datetime-local" id="date" name="date" required><br>

        <button type="submit">Ajouter</button>
    </form>

    <table id="capteurs-table">
        <tr>
            <th>ID Capteur</th>
            <th>Luminosité</th>
            <th>Date</th>
            <th>Supprimer</th>
            <th>Modifier</th>
        </tr>
        <!-- Les lignes du tableau seront insérées ici -->
    </table>

    <script src="main.js"></script>

</body>
</html> 