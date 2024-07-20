const initProducts = () => {
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('product-popup').style.display = 'block';
    });

    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('product-name').value;
        const productPrice = document.getElementById('product-price').value;
        const productDate = document.getElementById('product-date').value;
        const productQuantity = document.getElementById('product-quantity').value;
        const user = firebase.auth().currentUser;

        if (user) {
            db.collection('products').add({
                uid: user.uid,
                name: productName,
                price: parseFloat(productPrice),
                date: new Date(productDate),
                quantity: parseInt(productQuantity)
            }).then(() => {
                document.getElementById('product-popup').style.display = 'none';
                document.getElementById('product-form').reset();
                loadProducts();
            }).catch((error) => {
                console.error('Erreur lors de l\'ajout du produit', error);
            });
        } else {
            console.error('Utilisateur non authentifié');
        }
    });

    loadProducts();
};

const loadProducts = () => {
    const user = firebase.auth().currentUser;
    if (user) {
        db.collection('products').where('uid', '==', user.uid).get().then((querySnapshot) => {
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
        }).catch((error) => {
            console.error('Erreur lors du chargement des produits', error);
        });
    }
};
