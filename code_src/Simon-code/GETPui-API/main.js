document.getElementById('insert-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id_capteur = document.getElementById('id_capteur').value;
  const puissance = document.getElementById('puissance').value;
  const intensité = document.getElementById('intensité').value;
  const production_energie = document.getElementById('production_energie').value;
  const SuiviEdf = document.getElementById('suivi_edf').value; // Corrected the ID here
  const date = document.getElementById('date').value;

  try {
    const response = await fetch('http://192.168.65.12:8050/insertPui', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ id_capteur: id_capteur, puissance: puissance, intensité: intensité, production_energie: production_energie, SuiviEdf: SuiviEdf, date: date }], null, 2)
    });

    if (response.ok) {
      location.reload(); // Recharge la page pour mettre à jour le tableau
    } else {
      console.error('Erreur lors de l’insertion des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
});

async function deleteRow(id) {
  try {
    const response = await fetch('http://192.168.65.12:8050/deletePui/' + id, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      location.reload(); // Recharge
    } else {
      console.error('Erreur lors de la suppression de la ligne : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
}

async function updateLuminosite(id, puissance) {
  try {
    const response = await fetch(`http://192.168.65.12:8050/updatePui/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ puissance: puissance }, null, 2)
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
    const response = await fetch('http://192.168.65.12:8050/selectPui', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('capteurs-table');

      data.forEach((row) => {
        const newRow = table.insertRow();

        const idpCell = newRow.insertCell();
        idpCell.textContent = row.id_panneau;

        const idcCell = newRow.insertCell();
        idcCell.textContent = row.id_capteur;

        const puissanceCell = newRow.insertCell();
        puissanceCell.textContent = row.puissance;

        const intensiteCell = newRow.insertCell();
        intensiteCell.textContent = row.intensité;

        const productionEnergieCell = newRow.insertCell();
        productionEnergieCell.textContent = row.production_energie;

        const SuiviEdfCell = newRow.insertCell();
        SuiviEdfCell.textContent = row.SuiviEdf;

        const dateCell = newRow.insertCell();
        dateCell.textContent = row.date;

        const actionCell = newRow.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', () => deleteRow(row.id_panneau));
        actionCell.appendChild(deleteButton);

        const editCell = newRow.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Modifier';
        editButton.addEventListener('click', () => {
          const newPuissance = prompt('Nouvelle valeur de puissance :', row.puissance);
          if (newPuissance !== null) {
            updateLuminosite(row.id_panneau, newPuissance);
          }
        });
        editCell.appendChild(editButton);
      })
    } else {
      console.error('Erreur lors de la récupération des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
})();

// Récupération et affichage des données pour le select "id_capteur"
(async function () {
  try {
    const response = await fetch('http://192.168.65.12:8050/selectCapteur', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const select = document.getElementById('id_capteur');

      data.forEach((row) => {
        const option = document.createElement('option');
        option.value = row.id_capteur;
        option.textContent = row.id_capteur;
        select.appendChild(option);
      });
    } else {
      console.error('Erreur lors de la récupération des données : ' + response.statusText);
    }
  } catch (err) {
    console.error('Erreur lors de la requête fetch : ' + err.message);
  }
})();
