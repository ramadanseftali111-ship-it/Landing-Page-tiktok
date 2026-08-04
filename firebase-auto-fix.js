// ============================================
// FIREBASE AUTO-FIX SCRIPT
// Firebase Console'dan indirilen eksik dosyayı TAMİR EDER
// ============================================

(function() {
    console.log('🔧 Firebase Auto-Fix kontrol ediliyor...');
    
    // Gerekli fonksiyonlar var mı kontrol et
    var needsFix = false;
    
    if (typeof onFirebaseReady === 'undefined') {
        console.log('⚠️ onFirebaseReady fonksiyonu eksik!');
        needsFix = true;
    }
    
    if (typeof getUserFirebaseConfig === 'undefined') {
        console.log('⚠️ getUserFirebaseConfig fonksiyonu eksik!');
        needsFix = true;
    }
    
    if (typeof _firebaseReadyCallbacks === 'undefined') {
        console.log('⚠️ _firebaseReadyCallbacks değişkeni eksik!');
        needsFix = true;
    }
    
    // Eksik fonksiyonlar varsa ekle
    if (needsFix) {
        console.log('🔧 Eksik fonksiyonlar ekleniyor...');
        
        // Global variables
        if (typeof _firebaseReadyCallbacks === 'undefined') {
            window._firebaseReadyCallbacks = [];
        }
        if (typeof _firebaseReady === 'undefined') {
            window._firebaseReady = false;
        }
        
        // getUserFirebaseConfig function
        if (typeof getUserFirebaseConfig === 'undefined') {
            window.getUserFirebaseConfig = function() {
                try {
                    var userApiKey = localStorage.getItem('__FIREBASE_API_KEY__');
                    var userProjectId = localStorage.getItem('__FIREBASE_PROJECT_ID__');
                    var userDbUrl = localStorage.getItem('__FIREBASE_DATABASE_URL__');
                    
                    if (userApiKey && userProjectId && userDbUrl) {
                        console.log('✅ User Firebase config found:', userProjectId);
                        return {
                            apiKey: userApiKey,
                            authDomain: userProjectId + ".firebaseapp.com",
                            databaseURL: userDbUrl,
                            projectId: userProjectId,
                            storageBucket: userProjectId + ".appspot.com",
                            messagingSenderId: "",
                            appId: ""
                        };
                    }
                } catch(e) {
                    console.log('⚠️ User config error:', e.message);
                }
                
                // Return default firebaseConfig if exists
                if (typeof firebaseConfig !== 'undefined') {
                    console.log('📦 Using default Firebase config');
                    return firebaseConfig;
                }
                
                return null;
            };
        }
        
        // onFirebaseReady function
        if (typeof onFirebaseReady === 'undefined') {
            window.onFirebaseReady = function(callback) {
                if (window._firebaseReady && window.database) {
                    console.log('✅ Firebase ready, executing callback');
                    try {
                        callback(window.database);
                    } catch(e) {
                        console.error('❌ Callback error:', e);
                    }
                } else {
                    console.log('⏳ Firebase not ready, queuing callback');
                    window._firebaseReadyCallbacks.push(callback);
                }
            };
        }
        
        // _triggerFirebaseReady function
        if (typeof _triggerFirebaseReady === 'undefined') {
            window._triggerFirebaseReady = function() {
                console.log('🔥 Firebase ready! Executing ' + window._firebaseReadyCallbacks.length + ' callbacks');
                window._firebaseReady = true;
                
                var callbacks = window._firebaseReadyCallbacks.slice();
                window._firebaseReadyCallbacks = [];
                
                callbacks.forEach(function(callback) {
                    try {
                        callback(window.database);
                    } catch(e) {
                        console.error('❌ Callback error:', e);
                    }
                });
            };
        }
        
        // Override initFirebase if it exists
        if (typeof initFirebase !== 'undefined') {
            var originalInitFirebase = initFirebase;
            window.initFirebase = function() {
                originalInitFirebase();
                
                // Trigger callbacks after init
                setTimeout(function() {
                    if (window.database && !window._firebaseReady) {
                        window._triggerFirebaseReady();
                    }
                }, 500);
            };
        } else {
            // Create initFirebase from scratch
            window.initFirebase = function() {
                if (typeof firebase === 'undefined') {
                    console.log('⏳ Waiting for Firebase SDK...');
                    setTimeout(window.initFirebase, 200);
                    return;
                }
                
                try {
                    var config = window.getUserFirebaseConfig();
                    
                    if (!config) {
                        console.error('❌ No Firebase config found!');
                        return;
                    }
                    
                    if (!firebase.apps || firebase.apps.length === 0) {
                        firebase.initializeApp(config);
                        console.log('✅ Firebase initialized:', config.projectId);
                    }
                    
                    window.database = firebase.database();
                    if (firebase.storage) {
                        window.storage = firebase.storage();
                    }
                    
                    window._triggerFirebaseReady();
                    
                } catch(e) {
                    console.error('❌ Firebase init error:', e.message);
                    setTimeout(window.initFirebase, 500);
                }
            };
            
            // Auto-start
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', window.initFirebase);
            } else {
                window.initFirebase();
            }
        }
        
        console.log('✅ Firebase Auto-Fix tamamlandı!');
        console.log('📦 Eksik fonksiyonlar eklendi - Admin sayfaları çalışacak');
        
    } else {
        console.log('✅ Firebase config tam - Auto-fix gerekmedi');
    }
})();
