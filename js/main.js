document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initAuthForms();
    initCalendar();
    initProducts();
});

const initApp = () => {
    console.log('Application initialisée');
};

const initAuthForms = () => {
    document.getElementById('show-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const prenom = document.getElementById('signup-prenom').value;
        const nom = document.getElementById('signup-nom').value;
        const telephone = document.getElementById('signup-telephone').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!prenom || !nom || !telephone || !email || !password) {
            displayError('Tous les champs sont obligatoires', 'signup');
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return db.collection('users').doc(user.uid).set({
                    prenom: prenom,
                    nom: nom,
                    telephone: telephone,
                    email: email
                });
            })
            .then(() => {
                document.getElementById('signup-form').reset();
                document.getElementById('signup-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
                displayMessage('Inscription réussie. Veuillez vous connecter.');
            })
            .catch((error) => {
                console.error('Erreur lors de l\'inscription', error);
                displayError(error.message, 'signup');
            });
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            displayError('Tous les champs sont obligatoires', 'login');
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                document.getElementById('auth-container').style.display = 'none';
                document.getElementById('main-container').style.display = 'block';
                const user = userCredential.user;
                db.collection('users').doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        document.getElementById('user-name').innerText = `${userData.prenom} ${userData.nom}`;
                    }
                });
            })
            .catch((error) => {
                console.error('Erreur lors de la connexion', error);
                displayError('Email ou mot de passe incorrect', 'login');
            });
    });

    document.getElementById('logout').addEventListener('click', () => {
        auth.signOut().then(() => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('auth-container').style.display = 'block';
            displayMessage('Déconnexion réussie.');
        }).catch((error) => {
            console.error('Erreur lors de la déconnexion', error);
            displayError('Erreur lors de la déconnexion : ' + error.message);
        });
    });
};

const displayError = (message, formType = '') => {
    let errorContainer;
    if (formType === 'login') {
        errorContainer = document.getElementById('error-message');
    } else if (formType === 'signup') {
        errorContainer = document.getElementById('error-message');
    } else {
        errorContainer = document.getElementById('error-container');
    }
    errorContainer.innerText = message;
    errorContainer.style.display = 'block';

    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 3000);
};

const displayMessage = (message) => {
    const messageContainer = document.getElementById('success-message');
    messageContainer.innerText = message;
    messageContainer.style.display = 'block';

    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
};

// Init Calendar and Products functions
const initCalendar = () => {
    const calendarContainer = document.getElementById('calendar');
    flatpickr(calendarContainer, {
        inline: true,
        onChange: (selectedDates, dateStr, instance) => {
            loadProducts(dateStr);
        }
    });
};

const initProducts = () => {
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('product-popup').style.display = 'block';
    });

    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = document.getElementById('product-price').value;
        const date = document.getElementById('product-date').value;
        const quantity = document.getElementById('product-quantity').value;

        if (!name || !price || !date || !quantity) {
            displayError('Tous les champs sont obligatoires');
            return;
        }

        const user = firebase.auth().currentUser;
        if (user) {
            const newProduct = {
                name: name,
                price: parseFloat(price),
                date: new Date(date),
                quantity: parseFloat(quantity),
                uid: user.uid
            };

            db.collection('products').add(newProduct)
                .then(() => {
                    document.getElementById('product-popup').style.display = 'none';
                    loadProducts(date);
                    displayMessage('Produit ajouté avec succès.');
                })
                .catch((error) => {
                    console.error('Erreur lors de l\'ajout du produit', error);
                    displayError('Erreur lors de l\'ajout du produit : ' + error.message);
                });
        } else {
            console.error('Utilisateur non authentifié');
        }
    });
};

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
                    <p>${product.name}</p>
                    <p>Prix: ${product.price} FCFA</p>
                    <p>Quantité: ${product.quantity}</p>
                    <p>Total: ${product.price * product.quantity} FCFA</p>
                    <div class="card__actions">
                        <i class="fas fa-edit edit-product" data-product-id="${doc.id}"></i>
                        <i class="fas fa-trash delete-product" data-product-id="${doc.id}"></i>
                        <input type="checkbox" class="product-checkbox">
                    </div>
                `;
                productCards.appendChild(card);
                card.style.marginBottom = '20px';

                // Ajouter les événements pour les icônes
                const editIcon = card.querySelector('.edit-product');
                editIcon.addEventListener('click', () => {
                    editProduct(doc.id);
                });

                const deleteIcon = card.querySelector('.delete-product');
                deleteIcon.addEventListener('click', () => {
                    deleteProduct(doc.id);
                });

                const checkbox = card.querySelector('.product-checkbox');
                checkbox.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        card.classList.add('completed');
                    } else {
                        card.classList.remove('completed');
                    }
                });
            });
        });
    }
};

const editProduct = (productId) => {
    // Récupérer les informations du produit à éditer et les afficher dans le formulaire
    db.collection('products').doc(productId).get().then((doc) => {
        if (doc.exists) {
            const product = doc.data();
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-date').value = new Date(product.date).toISOString().slice(0, 10);
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-id').value = productId;
            document.getElementById('product-popup').style.display = 'block';
        }
    }).catch((error) => {
        console.error('Erreur lors de la récupération du produit', error);
        displayError('Erreur lors de la récupération du produit : ' + error.message);
    });
};

const deleteProduct = (productId) => {
    db.collection('products').doc(productId).delete().then(() => {
        displayMessage('Produit supprimé avec succès.');
        loadProducts();
    }).catch((error) => {
        console.error('Erreur lors de la suppression du produit', error);
        displayError('Erreur lors de la suppression du produit : ' + error.message);
    });
};
