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
            document.getElementById('success-message').innerText = "Inscription réussie. Veuillez vous connecter.";
            document.getElementById('error-message').innerText = "";
            document.getElementById('signup-form').reset();
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        })
        .catch((error) => {
            document.getElementById('error-message').innerText = error.message;
            document.getElementById('success-message').innerText = "";
        });
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            localStorage.setItem('isLoggedIn', 'true');
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
            document.getElementById('error-message').innerText = error.message;
            document.getElementById('success-message').innerText = "";
        });
});

document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        localStorage.removeItem('isLoggedIn');
        document.getElementById('main-container').style.display = 'none';
        document.getElementById('auth-container').style.display = 'block';
    }).catch((error) => {
        document.getElementById('error-message').innerText = error.message;
        document.getElementById('success-message').innerText = "";
    });
});

window.addEventListener('load', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('user-name').innerText = `${userData.prenom} ${userData.nom}`;
                }
            });
        }
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('main-container').style.display = 'none';
    }
});
