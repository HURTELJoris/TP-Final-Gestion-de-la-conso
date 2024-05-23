<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Box</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Capteurs Luminosité</h1>

  <form id="insert-form" action="/insertBox" method="POST">
    <label for="power_box">power_box : </label>
    <input type="number" id="power_box" name="power_box" required><br>

    <label for="source_verte">source_verte : </label>
    <input type="number" id="source_verte" name="source_verte" required><br>

    <label for="date">Date : </label>
    <input type="datetime-local" id="date" name="date" required><br>

    <label for="proportion_temp_vert">proportion_temp_vert : </label>
    <input type="number" id="proportion_temp_vert" name="proportion_temp_vert" required><br>

    <button type="submit">Ajouter</button>
  </form>

  <table id="capteurs-table">
    <tr>
      <th>ID box</th>
      <th>power box</th>
      <th>source_verte</th>
      <th>Date</th>
      <th>proportion_temp_vert</th>
      <th>Supprimer</th>
      <th>Modifier</th>
    </tr>
    <!-- Les lignes du tableau seront insérées ici -->
  </table>

  <script src="main.js"></script>

</body>
</html>
