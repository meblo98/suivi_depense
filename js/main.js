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

    const loadProducts = (date) => {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '';
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('products').where('userId', '==', user.uid).where('date', '==', date).get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const productData = doc.data();
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');
                        productCard.innerHTML = `
                            <div>
                                <h3>${productData.name}</h3>
                                <p>${productData.price} FCFA x ${productData.quantity} = ${productData.price * productData.quantity} FCFA</p>
                            </div>
                            <div>
                                <button class="edit-product" data-id="${doc.id}">Modifier</button>
                                <button class="delete-product" data-id="${doc.id}">Supprimer</button>
                            </div>
                        `;
                        productsContainer.appendChild(productCard);
                    });
                })
                .catch((error) => {
                    console.error('Erreur lors du chargement des produits :', error);
                });
        }
    };
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
