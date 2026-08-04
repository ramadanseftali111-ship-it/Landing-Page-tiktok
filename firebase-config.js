// ============================================
// FIREBASE YAPILANDIRMA DOSYASI
// Otomatik oluşturuldu: 04.08.2026 06:48:27
// ============================================

// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyDurAad1UeBOfKGiGrYzWoYeaM8kfyMqK0",
    authDomain: "hizlikargo-93a30.firebaseapp.com",
    databaseURL: "https://hizlikargo-93a30-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hizlikargo-93a30",
    storageBucket: "hizlikargo-93a30.appspot.com",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Firebase değişkenleri
var database = null;
var storage = null;
var firebaseHazir = false;

// Firebase'i başlat
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.log('⏳ Firebase SDK yükleniyor...');
        setTimeout(initFirebase, 200);
        return;
    }
    
    try {
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase başlatıldı!');
        }
        
        database = firebase.database();
        if (firebase.storage) {
            storage = firebase.storage();
        }
        
        firebaseHazir = true;
        console.log('✅ Firebase hazır!');
        
    } catch(e) {
        console.error('⚠️ Firebase başlatma hatası:', e.message);
        setTimeout(initFirebase, 200);
    }
}

// Sayfa yüklendiğinde Firebase'i başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

console.log('📦 Firebase Config yüklendi - Project:', firebaseConfig.projectId);
