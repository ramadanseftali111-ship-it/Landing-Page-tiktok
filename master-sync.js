// ============================================
// MASTER SYNC - SADECE ADMIN MODU
// Sadece admin sayfalarında çalışır
// ============================================

(function() {
    console.log('🔄 MASTER SYNC başlatılıyor...');
    
    var SYNC_PATH = 'MASTER_SETTINGS';
    
    // Firebase hazır mı kontrol et
    function waitFirebase(callback) {
        var maxWait = 100; // 10 saniye
        var waited = 0;
        
        var check = setInterval(function() {
            waited++;
            if (window.database) {
                clearInterval(check);
                console.log('✅ Firebase hazır! (Bekleme: ' + (waited * 100) + 'ms)');
                callback();
            } else if (waited >= maxWait) {
                clearInterval(check);
                console.error('❌ Firebase 10 saniyede hazır olmadı!');
            }
        }, 100);
    }
    
    // Admin sayfası mı kontrol et
    var isAdmin = window.location.pathname.includes('admin');
    
    if (isAdmin) {
        console.log('📝 ADMIN MODU - Değişiklikler Firebase\'e kaydedilecek');
        
        // Her localStorage değişikliğinde Firebase'e kaydet
        var saveToFirebase = function() {
            waitFirebase(function() {
                var allSettings = {};
                
                // Tüm localStorage'ı topla (Firebase internal key'leri hariç)
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    
                    // Firebase internal key'lerini atla
                    if (key.startsWith('firebase:') || 
                        key.startsWith('__FIREBASE_') || 
                        key.startsWith('_firebase') ||
                        key.startsWith('_triggerSync_')) {
                        continue;
                    }
                    
                    var value = localStorage.getItem(key);
                    allSettings[key] = value;
                }
                
                // Firebase'e kaydet - TEK PATH
                window.database.ref(SYNC_PATH).set(allSettings)
                    .then(function() {
                        console.log('✅ Firebase güncellendi (' + Object.keys(allSettings).length + ' ayar)');
                        syncBannerColorsToFirebase();
                    })
                    .catch(function(err) {
                        console.error('❌ Firebase kayıt hatası:', err);
                    });
            });
        };
        
        // Banner renklerini Firebase'de AYRI path'e de kaydet
        function syncBannerColorsToFirebase() {
            var adminNo = window.location.pathname.match(/admin-(\d+)\.html/);
            if (!adminNo) return;
            
            var no = adminNo[1];
            var siteId = localStorage.getItem('SITE_ID') || 'default';
            
            var bannerBg = localStorage.getItem(siteId + '_admin' + no + '_banner_bg_color');
            var bannerText = localStorage.getItem(siteId + '_admin' + no + '_banner_text_color');
            
            if (bannerBg && bannerText) {
                window.database.ref(siteId + '/admin' + no + '/bannerColors').set({
                    bgColor: bannerBg,
                    textColor: bannerText,
                    timestamp: Date.now()
                });
                console.log('🔥 Banner renkleri Firebase\'e kaydedildi (admin' + no + ')');
            }
        }
        
        // localStorage.setItem'i override et
        var originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.call(localStorage, key, value);
            
            // Her değişiklikte Firebase'e kaydet (debounce ile)
            clearTimeout(window._syncTimeout);
            window._syncTimeout = setTimeout(saveToFirebase, 500);
        };
        
        console.log('✅ Admin sync aktif - her değişiklik Firebase\'e kaydedilecek');
        
    } else {
        console.log('📱 MÜŞTERİ SAYFASI - Master-sync kapalı, sayfa kendi sistemini kullanıyor');
    }
    
    console.log('✅ Master Sync yüklendi');
})();
