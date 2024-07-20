document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar');

    // Initialiser flatpickr
    flatpickr(calendarContainer, {
        inline: true,
        onChange: (selectedDates, dateStr, instance) => {
            // Gérer le changement de date
            loadProducts(dateStr);
        }
    });

    // Charger les produits pour la date sélectionnée
    const loadProducts = (selectedDate) => {
        const user = firebase.auth().currentUser;
        if (user) {
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0); // Début de la journée
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999); // Fin de la journée
    
            db.collection('products')
              .where('uid', '==', user.uid)
              .where('date', '>=', startOfDay)
              .where('date', '<=', endOfDay)
              .get()
              .then((querySnapshot) => {
                const productCards = document.getElementById('product-cards');
                productCards.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>Date: ${product.date.toDate().toLocaleDateString()}</p>
                        <p>Prix: ${product.price} €</p>
                        <p>Quantité: ${product.quantity}</p>
                        <p>Total: ${product.price * product.quantity} €</p>
                    `;
                    productCards.appendChild(card);
                });
              })
              .catch((error) => {
                console.error('Erreur lors du chargement des produits', error);
              });
        }
    };
    
});
