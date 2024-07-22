document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'application
    initApp();

    // Initialiser les événements de formulaire de connexion et d'inscription
    initAuthForms();

    // Initialiser le calendrier
    initCalendar();

    // Initialiser les produits
    initProducts();
});

const initApp = () => {
    console.log('Application initialisée');
};

const initCalendar = () => {
    const calendarContainer = document.getElementById('calendar');
    flatpickr(calendarContainer, {
        inline: true,
        onChange: (selectedDates, dateStr, instance) => {
            loadProducts(dateStr);
        }
    });
    

    document.getElementById('show-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    const displayFieldError = (fieldId, message) => {
        const errorContainer = document.getElementById(`${fieldId}-error`);
        errorContainer.innerText = message;
        errorContainer.style.display = 'block';
    };
    
    const hideFieldError = (fieldId) => {
        const errorContainer = document.getElementById(`${fieldId}-error`);
        errorContainer.style.display = 'none';
    };
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        hideFieldError('login-email');
        hideFieldError('login-password');
        
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
                const today = new Date().toISOString().split('T')[0];
                loadProducts(today);
            })
            .catch((error) => {
                if (error.code.includes('email')) {
                    displayFieldError('login-email', 'Email incorrect');
                } else if (error.code.includes('password')) {
                    displayFieldError('login-password', 'Mot de passe incorrect');
                } else {
                    displayError('Erreur lors de la connexion : ' + error.message);
                }
            });
    });
    
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
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
                const today = new Date().toISOString().split('T')[0];
                loadProducts(today); // Charger les produits pour la date actuelle
            })
            .catch((error) => {
                displayError('Erreur lors de la connexion : ' + error.message);
            });
    });
    
    document.getElementById('logout').addEventListener('click', () => {
        auth.signOut().then(() => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('auth-container').style.display = 'block';
            displayMessage('Déconnexion réussie.');
        }).catch((error) => {
            displayError('Erreur lors de la déconnexion : ' + error.message);
        });
    });
    
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
                        <h2 class="card__title">${product.name}</h2>
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
                    // Ajout des événements pour les icônes
                    const editIcon = card.querySelector('.edit-product');
                    const deleteIcon = card.querySelector('.delete-product');
                    const checkbox = card.querySelector('.product-checkbox');
        
                    editIcon.addEventListener('click', () => {
                        // Logique de modification
                        const productId = editIcon.getAttribute('data-product-id');
                        const productNameInput = document.createElement('input');
                        productNameInput.type = 'text';
                        productNameInput.value = product.name;
                        const productPriceInput = document.createElement('input');
                        productPriceInput.type = 'number';
                        productPriceInput.value = product.price;
                        const productQuantityInput = document.createElement('input');
                        productQuantityInput.type = 'number';
                        productQuantityInput.value = product.quantity;
                        const saveButton = document.createElement('button');
                        saveButton.textContent = 'Enregistrer';
                        saveButton.style.backgroundColor= "#68902b"
                        saveButton.addEventListener('click', () => {
                            db.collection('products').doc(productId).update({
                                name: productNameInput.value,
                                price: productPriceInput.value,
                                quantity: productQuantityInput.value
                            }).then(() => {
                                loadProducts(selectedDate);
                            }).catch((error) => {
                                displayError('Erreur lors de la mise à jour du produit : ' + error.message);
                            });
                        });
                        card.innerHTML = '';
                        card.appendChild(productNameInput);
                        card.appendChild(productPriceInput);
                        card.appendChild(productQuantityInput);
                        card.appendChild(saveButton);
                    });
        
                    deleteIcon.addEventListener('click', () => {
                        const productId = deleteIcon.getAttribute('data-product-id');
                        db.collection('products').doc(productId).delete().then(() => {
                            loadProducts(selectedDate);
                        }).catch((error) => {
                            displayError('Erreur lors de la suppression du produit : ' + error.message);
                        });
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
    
    const displayError = (message) => {
        const errorContainer = document.getElementById('error-container');
        errorContainer.innerText = message;
        errorContainer.style.display = 'block';
    };
    
    const displayMessage = (message) => {
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerText = message;
        messageContainer.style.display = 'block';
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        initProducts();
    });
    
    
    document.addEventListener('DOMContentLoaded', () => {
        initProducts();
    });
    
};


const initAuthForms = () => {
    // Les événements de formulaire de connexion et d'inscription
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
            })
            .catch((error) => {
                console.error('Erreur lors de l\'inscription', error);
            });
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

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
            });
    });

    document.getElementById('logout').addEventListener('click', () => {
        auth.signOut().then(() => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('auth-container').style.display = 'block';
        }).catch((error) => {
            console.error('Erreur lors de la déconnexion', error);
        });
    });
};
