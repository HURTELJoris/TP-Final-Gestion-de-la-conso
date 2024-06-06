<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Box</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Box</h1>

  <form id="insert-form" action="/insertBox" method="POST">
    <label for="power_box">Box allumé : </label>
    <input type="number" id="power_box" name="power_box" required><br>

    <label for="source_verte">utilisation de la source verte : </label>
    <input type="number" id="source_verte" name="source_verte" required><br>

    <label for="date">Date : </label>
    <input type="datetime-local" id="date" name="date" required><br>

    <label for="ratio">ratio énergie verte/EDF: </label>
    <input type="number" id="ratio" name="ratio" required><br>

    <label for="proportion_temp_vert">ratio énergie vert (en %) : </label>
    <input type="number" id="proportion_temp_vert" name="proportion_temp_vert" required><br>

    <button type="submit">Ajouter</button>
  </form>

  <table id="capteurs-table">
    <tr>
      <th>ID box</th>
      <th>box allumé</th>
      <th>utilisation de la source verte</th>
      <th>Date</th>
      <th>ratio énergie verte/EDF</th>
      <th>ratio énergie vert (en %):</th>
      <th>Supprimer</th>
      <th>Modifier</th>
    </tr>
    <!-- Les lignes du tableau seront insérées ici -->
  </table>

  <script src="main.js"></script>

</body>
</html>
