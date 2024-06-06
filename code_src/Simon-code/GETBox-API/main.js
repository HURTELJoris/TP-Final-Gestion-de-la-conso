document.getElementById('insert-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const power_box = document.getElementById('power_box').value;
  const source_verte = document.getElementById('source_verte').value;
  const date = document.getElementById('date').value;
  const ratio = document.getElementById('ratio').value;
  const proportion_temp_vert = document.getElementById('proportion_temp_vert').value;

  try {
    const response = await fetch('http://localhost:8020/api/insertBox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'root' // Inclusion du mot clé dans l'en-tête
      },
      body: JSON.stringify([{ power_box, source_verte, date,ratio, proportion_temp_vert }])
    });

    if (response.ok) {
      location.reload(); // Recharge la page pour mettre à jour le tableau
    } else {
      console.error('Erreur lors de l\'insertion des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
});

async function deleteRow(id) {
  try {
    const response = await fetch(`http://localhost:8020/api/deleteBox/${id}`,{
      method: 'DELETE',
      headers: {
          'x-api-key': 'root' // Inclusion du mot clé dans l'en-tête
      }
  });
    if (response.ok) {
      location.reload(); // Recharge la page pour mettre à jour le tableau
    } else {
      console.error('Erreur lors de la suppression de la ligne : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
}

async function updateLuminosite(id, source_verte) {
  try {
    const response = await fetch(`http://localhost:8020/api/updateBox/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'root' // Inclusion du mot clé dans l'en-tête
      },
      body: JSON.stringify({ source_verte }) // Mettre à jour le nom de la propriété ici
    });

    if (response.ok) {
      location.reload(); // Recharge la page pour mettre à jour le tableau
    } else {
      console.error('Erreur lors de la mise à jour des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
}

// Récupération et affichage des données initiales
(async function () {
  try {
    const response = await fetch('http://localhost:8020/api/selectBox',{
      headers: {
        'x-api-key': 'root' // Inclusion du mot clé dans l'en-tête
    }
  });
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('capteurs-table');

      data.forEach((row) => {
        const newRow = table.insertRow();

        const idCell = newRow.insertCell();
        idCell.textContent = row.id_box;

        const powerCell = newRow.insertCell();
        powerCell.textContent = row.power_box;

        const luminositeCell = newRow.insertCell();
        luminositeCell.textContent = row.source_verte;

        const dateCell = newRow.insertCell();
        dateCell.textContent = row.date;

        const ratioCell = newRow.insertCell();
        ratioCell.textContent = row.ratio;

        const tempCell = newRow.insertCell();
        tempCell.textContent = row.proportion_temp_vert;

        const actionCell = newRow.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', () => deleteRow(row.id_box));
        actionCell.appendChild(deleteButton);

        const editCell = newRow.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Modifier';
        editButton.addEventListener('click', () => {
          const newSourceVerte = prompt('Nouvelle valeur de source_verte :', row.source_verte);
          if (newSourceVerte !== null) {
            updateLuminosite(row.id_box, newSourceVerte);
          }
        });
        editCell.appendChild(editButton);
      });
    } else {
      console.error('Erreur lors de la récupération des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
})();
