const firebaseConfig = {
    apiKey: "AIzaSyBS23iyYfGY4qAaIuCmLXIvzSXfsHWA_6U",
    authDomain: "depense-25881.firebaseapp.com",
    projectId: "depense-25881",
    storageBucket: "depense-25881.appspot.com",
    messagingSenderId: "17376246025",
    appId: "1:17376246025:web:5489f7011f398a585cfbd8",
  };
  

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
