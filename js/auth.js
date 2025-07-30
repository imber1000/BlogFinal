// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCTPVBL_S2jF3qlfQVSaBvKybynDvkeAOA",
    authDomain: "blognuevonuevo-ea2c9.firebaseapp.com",
    projectId: "blognuevonuevo-ea2c9",
    storageBucket: "blognuevonuevo-ea2c9.firebasestorage.app",
    messagingSenderId: "68082621538",
    appId: "1:68082621538:web:c0a005499e2652e837053b"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Estado de autenticación
let currentUser = null;

// Escuchar cambios en la autenticación
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    
    if (user) {
        // Cargar el nombre del usuario desde Firestore
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById("username-display").textContent = userData.name;
            }
        });
    }
});

// Actualizar la UI según el estado de autenticación
function updateAuthUI() {
    const userInfo = document.getElementById("user-info");
    const authButtons = document.getElementById("auth-buttons");
    
    if (currentUser) {
        userInfo.classList.remove("d-none");
        authButtons.classList.add("d-none");
    } else {
        userInfo.classList.add("d-none");
        authButtons.classList.remove("d-none");
    }
}

// Iniciar sesión
document.getElementById("loginForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Cerrar el modal después de iniciar sesión
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            loginModal.hide();
        })
        .catch(error => {
            alert("Error al iniciar sesión: " + error.message);
        });
});

// Registrarse
document.getElementById("registerForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Guardar información adicional del usuario en Firestore
            return db.collection("users").doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            // Cerrar el modal después de registrarse
            const registerModal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
            registerModal.hide();
        })
        .catch(error => {
            alert("Error al registrarse: " + error.message);
        });
});

// Cerrar sesión
document.getElementById("logout-btn")?.addEventListener("click", () => {
    auth.signOut().catch(error => {
        alert("Error al cerrar sesión: " + error.message);
    });
});

// Alternar entre modales de login y registro
document.getElementById("showRegister")?.addEventListener("click", e => {
    e.preventDefault();
    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    loginModal.hide();
    
    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
    registerModal.show();
});

document.getElementById("showLogin")?.addEventListener("click", e => {
    e.preventDefault();
    const registerModal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
    registerModal.hide();
    
    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    loginModal.show();
});