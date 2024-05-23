 document.getElementById('insert-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const luminosite = document.getElementById('luminosite').value;
            const date = document.getElementById('date').value;

            try {
                const response = await fetch('http://192.168.65.12:8080/insertLumi', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([{luminosite:luminosite,date:date}])
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
                const response = await fetch('http://192.168.65.12:8080/deleteLumi/' + id, { method: 'DELETE' });

                if (response.ok) {
                    location.reload(); // Recharge la page pour mettre à jour le tableau
                } else {
                    console.error('Erreur lors de la suppression de la ligne : ' + response.statusText);
                }
            } catch (err) {
                console.error('Erreur lors de la requête fetch : ' + err.message);
            }
        }

        async function updateLuminosite(id, luminosite) {
          try {
            const response = await fetch(`http://192.168.65.12:8080/updateLumi/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ luminosite })
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
                const response = await fetch('http://192.168.65.12:8080/selectLumi');

                if (response.ok) {
                    const data = await response.json();
                    const table = document.getElementById('capteurs-table');

                    data.forEach((row) => {
                        const newRow = table.insertRow();

                        const idCell = newRow.insertCell();
                        idCell.textContent = row.id_capteur;

                        const luminositeCell = newRow.insertCell();
                        luminositeCell.textContent = row.luminosité;

                        const dateCell = newRow.insertCell();
                        dateCell.textContent = row.date;

                        const actionCell = newRow.insertCell();
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Supprimer';
                        deleteButton.addEventListener('click', () => deleteRow(row.id_capteur));
                        actionCell.appendChild(deleteButton);

                        const editCell = newRow.insertCell();
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Modifier';
                        editButton.addEventListener('click', () => {
                          const newLuminosite = prompt('Nouvelle valeur de luminosité :', row.luminosité);
                          if (newLuminosite !== null) {
                            updateLuminosite(row.id_capteur, newLuminosite);
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