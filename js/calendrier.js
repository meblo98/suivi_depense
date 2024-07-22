document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar');

    flatpickr.localize(flatpickr.l10ns.fr); // Localisation en français

    flatpickr(calendarContainer, {
        inline: true,
        onChange: (selectedDates, dateStr, instance) => {
            loadProducts(dateStr);
        }
    });

    // Charger les produits pour la date sélectionnée
    const loadProducts = (selectedDate = null) => {
        const user = firebase.auth().currentUser;
        if (user) {
            let query = db.collection('products').where('uid', '==', user.uid);
            
            if (selectedDate) {
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0); // Début de la journée
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999); // Fin de la journée
                
                query = query.where('date', '>=', startOfDay).where('date', '<=', endOfDay);
            }
    
            query.get().then((querySnapshot) => {
                const productCards = document.getElementById('product-cards');
                productCards.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const card = document.createElement('div');
                    card.className = 'card card-1';
                    card.innerHTML = `
                        <div class="card__icon"><i class="fas fa-shopping-cart"></i></div>
                        <p class="card__exit"><i class="fas fa-times"></i></p>
                        <h2 class="card__title">${product.name}</h2>
                        <p>Date: ${product.date.toDate().toLocaleDateString()}</p>
                        <p>Prix: ${product.price} FCFA</p>
                        <p>Quantité: ${product.quantity}</p>
                        <p>Total: ${product.price * product.quantity} FCFA</p>
                        <div class="card__actions">
                            <i class="fas fa-edit edit-product"></i>
                            <i class="fas fa-trash delete-product"></i>
                            <input type="checkbox" class="product-checkbox">
                        </div>
                    `;
                    productCards.appendChild(card);
    
                    // Ajout des événements pour les icônes
                    const editIcon = card.querySelector('.edit-product');
                    const deleteIcon = card.querySelector('.delete-product');
                    const checkbox = card.querySelector('.product-checkbox');
    
                    editIcon.addEventListener('click', () => {
                        // Logique de modification
                    });
    
                    deleteIcon.addEventListener('click', () => {
                        // Logique de suppression
                    });
    
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            editIcon.style.display = 'none';
                            deleteIcon.style.display = 'none';
                        } else {
                            editIcon.style.display = 'inline';
                            deleteIcon.style.display = 'inline';
                        }
                    });
                });
            }).catch((error) => {
                displayError('Erreur lors du chargement des produits : ' + error.message);
            });
        } else {
            displayError('Utilisateur non authentifié');
        }
    };
});
