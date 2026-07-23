// توقيت طنطا الغربية مصر - يدعم التوقيت الصيفي (+3) والشتوي (+2)
function getZeftaNow() {
    const now = new Date();
    const isDST = localStorage.getItem('zefta_dst') === '1';
    const offsetHours = isDST ? 3 : 2;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + offsetHours * 3600000);
}

document.addEventListener('DOMContentLoaded', () => {

        // --- AOS Init ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 500,
            offset: 100,
            mirror: true,
            once: false
        });
    }

    // --- تعريف المتغيرات والعناصر (DOM Elements) ---
    const header = document.getElementById('main-header');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null; 
    const loginBtn = document.getElementById('login-btn');
    const profileIcon = document.getElementById('profile-icon');

    const dateToggleBtn = document.getElementById('date-toggle-btn');
    const dateDropdown = document.getElementById('date-dropdown');
    const currentDateDisplay = document.getElementById('current-date-display');

    const ibadatGrid = document.getElementById('ibadat-grid');
    const addWorshipBtn = document.getElementById('add-worship-btn');
    const addWorshipModal = document.getElementById('add-worship-modal');
    const closeWorshipModalBtn = document.getElementById('close-worship-modal');
    const saveWorshipBtn = document.getElementById('save-worship-btn');
    const worshipNameInput = document.getElementById('worship-name');
    const worshipTimeInput = document.getElementById('worship-time');
    const worshipPointsInput = document.getElementById('worship-points');

    const totalScoreDisplay = document.getElementById('total-score');
    const globalProgressBar = document.getElementById('global-progress-bar');

    const adhkarModal = document.getElementById('adhkar-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const completeAdhkarBtn = document.getElementById('complete-adhkar-btn');
    const adhkarListContainer = document.getElementById('adhkar-list');
    const modalTitle = document.getElementById('modal-title');

    const extraPrayerModal = document.getElementById('extra-prayer-modal');
    const closeExtraModalBtn = document.getElementById('close-extra-modal');
    const extraWorshipList = document.getElementById('extra-worship-list');

    // عناصر مودال الإعدادات الجديد
    const setupModal = document.getElementById('setup-modal');
    const saveSetupBtn = document.getElementById('save-setup-btn');

    const settingsBtn = document.getElementById('settings-btn');

    // --- زر إغلاق (X) مودال إعداد الحساب (المتطلب 5) ---
    const closeSetupModalBtn = document.getElementById('close-setup-modal');
    if (closeSetupModalBtn && setupModal) {
        closeSetupModalBtn.addEventListener('click', () => {
            setupModal.classList.add('hidden');
        });
    }

    // --- شكل عرض الصلوات: طولي / Grid / Sidebar ---
    const LAYOUT_MODE_KEY = 'prayers_layout_mode';
    const layoutModeToggle = document.getElementById('layout-mode-toggle');

    function applyLayoutMode(mode) {
        const mainLayoutWrapper = document.getElementById('main-layout-wrapper');
        const prayersContainerEl = document.getElementById('prayers-container-wrapper');
        const layoutModeToggle = document.getElementById('layout-mode-toggle');
        
        if (!mainLayoutWrapper || !prayersContainerEl) return;
        
        if (!mode || mode === 'stack') mode = 'classic';
        
        if (window.innerWidth <= 768) {
                    mode = 'classic';
        } else if (!mode || mode === 'stack') {
            mode = 'classic';
        }

        // 1. تنظيف وتطبيق كلاسات الوضع الجديد
        mainLayoutWrapper.className = 'main-layout-wrapper'; 
        prayersContainerEl.classList.remove('layout-grid');
        
        if (mode === 'sidebar') {
            mainLayoutWrapper.classList.add('mode-sidebar');
        } else if (mode === 'grid') {
            mainLayoutWrapper.classList.add('mode-grid');
            prayersContainerEl.classList.add('layout-grid');
        } else {
            mainLayoutWrapper.classList.add('mode-classic');
        }

        // 2. التصحيح الجوهري: نبحث في الحاوية العامة الكبيرة (mainLayoutWrapper) 
        // ليشمل التعديل كروت الصلوات وكروت السايدبار (بصائر الإيمان والسؤال) معاً
        const allLayoutItems = mainLayoutWrapper.querySelectorAll('.prayer-item');
        
        allLayoutItems.forEach((item, index) => {
            if (mode === 'grid') {
                // إلغاء تجميد الكروت وجعلها تظهر فوراً بمجرد دخولها الشاشة بـ 10 بكسل فقط
                item.setAttribute('data-aos', 'fade-up');
                item.setAttribute('data-aos-offset', '10'); 
                if (window.innerWidth > 768) {
                    item.setAttribute('data-aos-delay', (index * 40).toString());
                }
            } else {
                item.setAttribute('data-aos', 'fade-up');
                item.removeAttribute('data-aos-offset');
                item.removeAttribute('data-aos-delay');
            }
        });

        // 3. تحديث أبعاد المكتبة بعد استقرار الـ CSS
        if (typeof AOS !== 'undefined') {
            setTimeout(() => { AOS.refresh(); }, 50);
            setTimeout(() => { AOS.refreshHard(); }, 400); // تحديث عميق
        }
        
        if (layoutModeToggle) {
            layoutModeToggle.querySelectorAll('.layout-mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
            });
        }
    }

    // التطبيق الفوري عند تحميل الصفحة
    applyLayoutMode(localStorage.getItem(LAYOUT_MODE_KEY) || 'classic');

    // تشغيل أزرار التحويل
    if (layoutModeToggle) {
        layoutModeToggle.querySelectorAll('.layout-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                localStorage.setItem(LAYOUT_MODE_KEY, mode);
                applyLayoutMode(mode);
            });
        });
    }

    // --- علامة توضيح احتساب التقدم بجانب شريط الهيدر (المتطلب 4) ---
    const headerProgressInfoBtn = document.getElementById('header-progress-info-btn');
    const headerProgressInfoPopup = document.getElementById('header-progress-info-popup');
    const closeHeaderProgressInfo = document.getElementById('close-header-progress-info');

    function renderHeaderProgressInfo() {
        const content = document.getElementById('header-progress-info-content');
        if (!content || typeof calculateScoreAndSummary !== 'function') return;
        const data = calculateScoreAndSummary();
        const rows = Object.keys(data.summary).map(key => {
            const [earned, max] = data.summary[key];
            const pct = max === 0 ? 0 : Math.round((earned / max) * 100);
            return `<div class="progress-info-row"><span>${key}</span><span>${pct}%</span></div>`;
        }).join('');

        content.innerHTML = `
            <p style="margin-bottom:8px;">
                تُحسب نسبة الإنجاز اليومي بقسمة مجموع النقاط التي أنجزتها فعلياً
                على إجمالي النقاط الممكن تحقيقها في يومك (الصلوات، الأذكار، السنن، القرآن، القيام...)، ثم تُحوَّل لنسبة مئوية.
            </p>
            <div style="font-weight:700; margin-bottom:4px; color:var(--accent-color);">نسبتك اليوم: ${data.percentage}%</div>
            ${rows}
        `;
    }

    if (headerProgressInfoBtn && headerProgressInfoPopup) {
        headerProgressInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willShow = headerProgressInfoPopup.classList.contains('hidden');
            if (willShow) renderHeaderProgressInfo();
            headerProgressInfoPopup.classList.toggle('hidden', !willShow);
        });
    }
    if (closeHeaderProgressInfo && headerProgressInfoPopup) {
        closeHeaderProgressInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            headerProgressInfoPopup.classList.add('hidden');
        });
    }
// إغلاق نافذة التقدم عند الضغط في الخارج
    window.addEventListener('click', (e) => {
        if (e.target === headerProgressInfoPopup) {
            headerProgressInfoPopup.classList.add('hidden');
        }
    });

    // --- تأثير الاحتفال عند إنجاز مهمة (Gamification - المتطلب 3) ---
    const CELEBRATION_EMOJIS = ['✨', '🎉', '⭐', '💫', '🌟'];
    function fireCelebration(originEvent) {
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        if (originEvent) {
            if (typeof originEvent.clientX === 'number' && (originEvent.clientX || originEvent.clientY)) {
                x = originEvent.clientX;
                y = originEvent.clientY;
            } else if (originEvent.target && originEvent.target.getBoundingClientRect) {
                const rect = originEvent.target.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            }
        }

        const count = 14;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            particle.className = 'celebration-particle';
            particle.textContent = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];

            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 60 + Math.random() * 90;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance - 40; // ميل لأعلى شوية عشان تحس إنها "بتطير"

            particle.style.setProperty('--start-x', `${x}px`);
            particle.style.setProperty('--start-y', `${y}px`);
            particle.style.setProperty('--end-x', `${x + endX}px`);
            particle.style.setProperty('--end-y', `${y + endY}px`);
            particle.style.setProperty('--rotate', `${Math.random() * 360}deg`);
            particle.style.animation = `celebration-fly ${0.8 + Math.random() * 0.5}s ease-out forwards`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
    }
    window.fireCelebration = fireCelebration;

    let lastCelebrationToastTime = 0;
    function showCelebrationToast(message) {
        // نمنع إظهار أكثر من رسالة في نفس اللحظة عشان مايبقاش فيه تكديس
        const now = Date.now();
        if (now - lastCelebrationToastTime < 900) return;
        lastCelebrationToastTime = now;

        const toast = document.createElement('div');
        toast.className = 'celebration-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 1800);
    }
    window.showCelebrationToast = showCelebrationToast;

    // متغيرات البروفايل
    let userProfile = {
        name: '',
        gender: 'male',
        quranGoal: ''
    };

    // تحميل البروفايل المحفوظ محلياً
    const savedProfile = localStorage.getItem('mohasba_user_profile');
    if (savedProfile) {
        try {
            const parsed = JSON.parse(savedProfile);
            Object.assign(userProfile, parsed);
        } catch (e) {}
    }

    // متغير لحفظ العبادات الثابتة (التي تتكرر يومياً)
    let globalHabits = {
        prayerExtras: [], // {id, prayer, name, points}
        generalIbadat: [] // {id, name, time, points}
    };

//===========================================================
        // --- دوال مساعدة للتحويل بين الهجري والميلادي ---
function gMod(n, m) { return ((n % m) + m) % m; }

function kuwaitiCalendar(date) {
    var today = date ? new Date(date) : getZeftaNow();
    var day = today.getDate();
    var month = today.getMonth();
    var year = today.getFullYear();
    var m = month + 1;
    var y = year;
    if (m < 3) { y -= 1; m += 12; }
    var a = Math.floor(y / 100);
    var b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;
    if (y == 1582) {
        if (m > 10) b = -10;
        if (m == 10) { b = 0; if (day > 4) b = -10; }
    }
    var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    var b = 0;
    if (jd > 2299160) {
        var a = Math.floor((jd - 1867216.25) / 36524.25);
        b = 1 + a - Math.floor(a / 4);
    }
    var bb = jd + b + 1524;
    var cc = Math.floor((bb - 122.1) / 365.25);
    var dd = Math.floor(365.25 * cc);
    var ee = Math.floor((bb - dd) / 30.6001);
    var day = (bb - dd) - Math.floor(30.6001 * ee);
    var month = ee - 1;
    if (ee > 13) { cc += 1; month = ee - 13; }
    var year = cc - 4716;
    var iyear = 10631.0 / 30.0;
    var epochastro = 1948084;
    var epochcivil = 1948085;
    var shift1 = 8.01 / 60.0;
    var z = jd - epochastro;
    var cyc = Math.floor(z / 10631.0);
    var z = z - 10631 * cyc;
    var j = Math.floor((z - shift1) / iyear);
    var iy = 30 * cyc + j;
    var z = z - Math.floor(j * iyear + shift1);
    var im = Math.floor((z + 28.5001) / 29.5);
    if (im == 13) im = 12;
    var id = z - Math.floor(29.5001 * im - 29);
    
    const islamicMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    
    return {
        day: id,
        month: im - 1, // 0-indexed
        year: iy,
        monthName: islamicMonths[im - 1]
    };
}



    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

// =========================================
    // نظام التحكم الذكي في رسالة تثبيت التطبيق (PWA)
    // =========================================
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        // 1. منع المتصفح من إظهار الرسالة التلقائية المزعجة فوراً
        e.preventDefault();
        
        // 2. حفظ الحدث (Event) لنقوم باستدعائه لاحقاً بمزاجنا
        deferredPrompt = e;
        
        // 3. التحقق مما إذا كان المستخدم قد أنهى الجولة التعريفية مسبقاً
        // (إذا كان مستخدم قديم، يمكننا إظهار زر التثبيت له في الإعدادات)
        const isTourCompleted = localStorage.getItem('tour_completed');
        if (isTourCompleted) {
            enableInstallButton(); 
        }
    });

    // دالة لتفعيل زر التثبيت (لو كنت واضع زر تثبيت في الإعدادات)
    function enableInstallButton() {
        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn && deferredPrompt) {
            installBtn.style.display = 'block'; // إظهار الزر
            installBtn.addEventListener('click', async () => {
                // إظهار رسالة التثبيت الرسمية للمتصفح
                deferredPrompt.prompt();
                // انتظار رد المستخدم (موافق أم رفض)
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null; // تفريغ المتغير بعد استخدامه
                installBtn.style.display = 'none'; // إخفاء الزر بعد التثبيت
            });
        }
    }

    // --- Scroll Logic (تحديث الهيدر والبار) ---
// متغير لضمان عدم تكرار التنفيذ
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            updateHeaderOnScroll();
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true }); // passive: true مهمة جداً للموبايل

function updateHeaderOnScroll() {
    // 1. تأثير الهيدر
    if (window.scrollY > 50) {
        header.classList.add('liquid-glass');
    } else {
        header.classList.remove('liquid-glass');
    }

    // 2. منطق ظهور بار الإنجاز
    const mainProgressContainer = document.querySelector('.global-progress-container');
    if (mainProgressContainer) {
        const rect = mainProgressContainer.getBoundingClientRect();
        if (rect.bottom < 0) {
            header.classList.add('show-progress');
        } else {
            header.classList.remove('show-progress');
        }
    }
}

    // --- 1. إعدادات Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyD8ltXQrl8XhRbjLlOfr5QiTGx_IQMan3U",
        authDomain: "mohasba-app.firebaseapp.com",
        projectId: "mohasba-app",
        storageBucket: "mohasba-app.firebasestorage.app",
        messagingSenderId: "24957282420",
        appId: "1:24957282420:web:982d83e0e0b1f7d6da8921"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    window._db = db;
    window._auth = auth;
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- 2. دالة تسجيل الدخول (معدلة للفحص) ---
    loginBtn.addEventListener('click', () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                // لا نحدث الواجهة مباشرة، بل نفحص البروفايل أولاً
                checkUserProfile(user);
            }).catch((error) => {
                console.error("Error:", error.message);
                alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
            });
    });

    // --- 3. دالة تسجيل الخروج ---
    profileIcon.addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            auth.signOut().then(() => {
                updateUI(null);
                // تصفير الإعدادات عند الخروج
                userProfile = { name: '', gender: 'male', quranGoal: '' };
                applyUserProfileSettings(); // لإعادة الأزرار لوضعها الطبيعي
            }).catch((error) => {
                console.error("Sign out error", error);
            });
        }
    });

    // --- 4. مراقبة حالة المستخدم (معدلة) ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            // لو مسجل دخول، افحص البروفايل وطبق الإعدادات
            checkUserProfile(user);
        } else {
            updateUI(null);
        }
    });

function updateUI(user) {
    if (user) {
        loginBtn.classList.add('hidden');
        profileIcon.classList.remove('hidden');
        
        // إظهار زر الإعدادات
        if(settingsBtn) settingsBtn.classList.remove('hidden');

        const img = profileIcon.querySelector('img');
        if (img && user.photoURL) {
            img.src = user.photoURL;
        }
    } else {
        profileIcon.classList.add('hidden');
        loginBtn.classList.remove('hidden');
    }
}

// --- آيات محاسبة النفس المتغيرة ---
    const quranVerses = [
        "يَوْمَئِذٍ تُعْرَضُونَ لَا تَخْفَىٰ مِنكُمْ خَافِيَةٌ",
        "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ",
        "وَكَفَىٰ بِنَا حَاسِبِينَ",
        "اقْرَأْ كِتَابَكَ كَفَىٰ بِنَفْسِكَ الْيَوْمَ عَلَيْكَ حَسِيبًا",
        "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ * وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ",
        "إِنَّ اللّهَ كَانَ عَلَيْكُمْ رَقِيبًا",
        "يَوْمَ تَجِدُ كُلُّ نَفْسٍ مَّا عَمِلَتْ مِنْ خَيْرٍ مُّحْضَرًا",
        "وَاتَّقُوا يَوْمًا تُرْجَعُونَ فِيهِ إِلَى اللَّهِ ۖ ثُمَّ تُوَفَّىٰ كُلُّ نَفْسٍ مَّا كَسَبَتْ",
        "بَلِ الْإِنسَانُ عَلَىٰ نَفْسِهِ بَصِيرَةٌ * وَلَوْ أَلْقَىٰ مَعَاذِيرَهُ",
        "وَأَمَّا مَنْ خَافَ مَقَامَ رَبِّهِ وَنَهَى النَّفْسَ عَنِ الْهَوَىٰ * فَإِنَّ الْجَنَّةَ هِيَ الْمَأْوَىٰ"
    ];

    function setRandomVerse() {
        const verseElement = document.getElementById('daily-verse');
        if (verseElement) {
            const randomIndex = Math.floor(Math.random() * quranVerses.length);
            verseElement.textContent = quranVerses[randomIndex];
        }
    }

    // استدعاء الدالة لتغيير الآية عند فتح الصفحة
    setRandomVerse();

    // --- منطق البروفايل الجديد والمواقيت ---

    // التحقق من صحة المدخلات لتفعيل زر الحفظ
    function checkSetupValidity() {
        const name = document.getElementById('setup-name').value;
        const goal = document.getElementById('setup-quran-goal').value;

        if (name && goal) {
            saveSetupBtn.disabled = false;
        } else {
            saveSetupBtn.disabled = true;
        }
    }

    if (document.getElementById('setup-name')) {
        ['setup-name', 'setup-quran-goal', 'setup-gender'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', checkSetupValidity);
        });
    }

    // 3. حفظ تلقائي لكل حقل في الإعدادات
    function autoSaveSetup() {
        userProfile.name = document.getElementById('setup-name')?.value || '';
        userProfile.gender = document.getElementById('setup-gender')?.value || 'male';
        userProfile.quranGoal = document.getElementById('setup-quran-goal')?.value || '';
        userProfile.level = document.getElementById('setup-level')?.value || '3';

        notificationSettings.morningTime = document.getElementById('setup-morning-time')?.value || '06:00';
        notificationSettings.eveningTime = document.getElementById('setup-evening-time')?.value || '17:00';
        notificationSettings.wirdTime = document.getElementById('setup-wird-time')?.value || '21:00';

        localStorage.setItem('mohasba_user_profile', JSON.stringify(userProfile));
        localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));

        const user = typeof auth !== 'undefined' && auth.currentUser;
        if (user && typeof db !== 'undefined') {
            const batch = db.batch();
            batch.set(db.collection('users').doc(user.uid).collection('settings').doc('profile'), userProfile);
            batch.set(db.collection('users').doc(user.uid).collection('settings').doc('notifications'), notificationSettings);
            batch.commit().catch(() => {});
        }
    }

    // ربط كل حقل بالحفظ التلقائي
    ['setup-name', 'setup-gender', 'setup-quran-goal', 'setup-level',
     'setup-morning-time', 'setup-evening-time', 'setup-wird-time'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', autoSaveSetup);
        if (el) el.addEventListener('change', autoSaveSetup);
    });

    window.closeSetupAndApply = function() {
        autoSaveSetup();
        if (setupModal) setupModal.classList.add('hidden');
        applyUserProfileSettings();
        const user = typeof auth !== 'undefined' && auth.currentUser;
        updateUI(user || null);
    };

    // 4. دالة فحص وجود البروفايل
    // --- 4. دالة فحص وتحميل البروفايل والتنبيهات ---
// function checkUserProfile(user) {
//     const settingsRef = db.collection('users').doc(user.uid).collection('settings');

//     // جلب البروفايل والتنبيهات معاً
//     Promise.all([
//         settingsRef.doc('profile').get(),
//         settingsRef.doc('notifications').get()
//     ]).then(([profileDoc, notifDoc]) => {
        
//         // 1. معالجة البروفايل
//         if (profileDoc.exists) {
//             userProfile = profileDoc.data();
//             applyUserProfileSettings();
//             updateUI(user);
//             loadGlobalHabits();
//             syncFromCloud();
//         } else {
//             // مستخدم جديد
//             updateUI(user);
//             if (setupModal) setupModal.classList.remove('hidden');
//         }

//         // 2. معالجة التنبيهات (استرجاعها من السحابة)
//         if (notifDoc.exists) {
//             const savedNotifs = notifDoc.data();
//             // تحديث المتغير العام
//             notificationSettings.morningTime = savedNotifs.morningTime;
//             notificationSettings.eveningTime = savedNotifs.eveningTime;
//             notificationSettings.wirdTime = savedNotifs.wirdTime;
            
//             // تحديث الحقول في المودال (عشان لو فتح الإعدادات يلاقيها موجودة)
//             if(document.getElementById('setup-morning-time')) {
//                 document.getElementById('setup-morning-time').value = savedNotifs.morningTime;
//                 document.getElementById('setup-evening-time').value = savedNotifs.eveningTime;
//                 document.getElementById('setup-wird-time').value = savedNotifs.wirdTime;
//             }
            
//             // تحديث التخزين المحلي
//             localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
//         }

//     }).catch(err => console.error("Error fetching user data:", err));
// }

// --- 4. دالة فحص وتحميل البروفايل والتنبيهات ---
    function checkUserProfile(user) {
        const settingsRef = db.collection('users').doc(user.uid).collection('settings');

        // جلب البروفايل والتنبيهات معاً
        Promise.all([
            settingsRef.doc('profile').get(),
            settingsRef.doc('notifications').get()
        ]).then(([profileDoc, notifDoc]) => {
            
            // 1. معالجة البروفايل
            if (profileDoc.exists) {
                userProfile = profileDoc.data();
                applyUserProfileSettings();
                updateUI(user);
                loadGlobalHabits();
                
                // التعديل هنا: مزامنة كاملة لكل الأيام والأرشيف بدلاً من اليوم فقط
                syncAllHistoricalDataFromCloud(user); 
            } else {
                // مستخدم جديد
                updateUI(user);
                if (setupModal) setupModal.classList.remove('hidden');
            }

            // 2. معالجة التنبيهات (استرجاعها من السحابة)
            if (notifDoc.exists) {
                const savedNotifs = notifDoc.data();
                // تحديث المتغير العام
                notificationSettings.morningTime = savedNotifs.morningTime;
                notificationSettings.eveningTime = savedNotifs.eveningTime;
                notificationSettings.wirdTime = savedNotifs.wirdTime;
                
                // تحديث الحقول في المودال 
                if(document.getElementById('setup-morning-time')) {
                    document.getElementById('setup-morning-time').value = savedNotifs.morningTime;
                    document.getElementById('setup-evening-time').value = savedNotifs.eveningTime;
                    document.getElementById('setup-wird-time').value = savedNotifs.wirdTime;
                }
                
                // تحديث التخزين المحلي
                localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));

                // لو جوه تطبيق أندرويد وكانت التنبيهات مفعّلة، أعد جدولتها على مستوى النظام
                if (window.isNativeApp && window.isNativeApp() && notificationSettings.enabled) {
                    window.scheduleDailyNotification('morning', 'أذكار الصباح', 'بداية يوم مبارك بذكر الله.', notificationSettings.morningTime);
                    window.scheduleDailyNotification('evening', 'أذكار المساء', 'حصّن نفسك قبل الغروب.', notificationSettings.eveningTime);
                    window.scheduleDailyNotification('wird', 'الورد القرآني', 'لا تهجر القرآن، ولو صفحة واحدة.', notificationSettings.wirdTime);
                }
            }

        }).catch(err => console.error("Error fetching user data:", err));
    }

    // =========================================
    // دالة المزامنة الشاملة لجميع الأجهزة
    // =========================================
    function syncAllHistoricalDataFromCloud(user) {
        if (!user) return;
        
        const dataRef = db.collection('users').doc(user.uid).collection('data');
        
        // إظهار إشعار خفيف للمستخدم عند فتح الجهاز الجديد
        if (typeof showCelebrationToast === 'function') {
            showCelebrationToast('🔄 جاري مزامنة سجلاتك السابقة من السحابة...');
        }

        // سحب جميع السجلات الخاصة بالمستخدم من فايربيس دفعة واحدة
        dataRef.get().then((querySnapshot) => {
            let dataFound = false;
            
            querySnapshot.forEach((doc) => {
                // تخزين كل يوم وكل الإحصائيات في مساحة التخزين الخاصة بالجهاز الجديد
                localStorage.setItem(doc.id, JSON.stringify(doc.data()));
                dataFound = true;
            });
            
            // بعد الانتهاء من التحميل، نقوم بتحديث واجهة المستخدم والكروت
            loadData();
            loadIbadatData();
            loadExtras();
            
            // تحديث الإحصائيات (قسم حصادك الإيماني) لتظهر البيانات السابقة فوراً
            if (document.getElementById('analytics-section') && typeof updateCharts === 'function') {
                const activeTabBtn = document.querySelector('.filter-btn.active');
                updateCharts(activeTabBtn && activeTabBtn.textContent.includes('شهر') ? 'month' : 'week');
            }

            // إشعار بالنجاح لو كان هناك بيانات تم سحبها بالفعل
            if (dataFound && typeof showCelebrationToast === 'function') {
                setTimeout(() => {
                    showCelebrationToast('✅ تمت المزامنة، تقدمك محفوظ!');
                }, 2000);
            }
            
        }).catch((error) => {
            console.error("خطأ في مزامنة البيانات السابقة:", error);
        });
    }

// 5. تطبيق الإعدادات (إخفاء المسجد + تشغيل التايمر + تحديث الورد)
function applyUserProfileSettings() {
    // أ) منطق الجنس
    const mosqueBtns = document.querySelectorAll('[data-type="mosque"]');
    if (userProfile.gender === 'female') {
        mosqueBtns.forEach(btn => {
            btn.style.display = 'none'; // إخفاء الزر
            btn.setAttribute('data-points', '0'); // تصفير النقاط
        });
    } else {
        mosqueBtns.forEach(btn => {
            btn.style.display = 'inline-block'; // إظهار الزر
            btn.setAttribute('data-points', '3'); // إرجاع النقاط
        });
    }

    // ب) تحديث نص الورد القرآني (الحل هنا)
    const quranBox = document.querySelector('.ibada-box[data-id="quran"]');
    if (quranBox) {
        const quranTitle = quranBox.querySelector('.ibada-title');
        // إذا كان المستخدم حدد ورداً في الإعدادات، نستخدمه، وإلا نستخدم النص الافتراضي
        const goalText = userProfile.quranGoal ? userProfile.quranGoal : 'ريعين';
        quranTitle.textContent = `ورد القرآن - ${goalText} (4 نقاط)`;
    }

    // د) إعادة حساب النقاط
    updateGlobalScore();
}

    // --- Date Logic ---
    // --- Dual Calendar Variables ---
    let currentViewDateG = getZeftaNow();
    let currentViewDateH = getZeftaNow(); 
    let currentDate = getZeftaNow();
    window.currentDate = currentDate;

    // وظيفة لتحديث التاريخ في كل مكان
    function setCurrentDate(d) {
        currentDate = d;
        window.currentDate = d;
    }

    // --- تحديث النص في الزر الرئيسي ---
    function updateDateDisplay() {
        // إذا كان المتغير currentDate غير معرف، نستخدم تاريخ اليوم
        if (typeof currentDate === 'undefined') currentDate = getZeftaNow();
        
        const gregStr = currentDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
        const hijriObj = kuwaitiCalendar(currentDate);
        const hijriStr = `${hijriObj.day} ${hijriObj.monthName} ${hijriObj.year}`;
        
        if(currentDateDisplay) {
            currentDateDisplay.innerHTML = `<span>${gregStr}</span> <span style="margin: 0 10px; opacity: 0.6;">|</span> <span style="color: var(--accent-color);">${hijriStr}</span>`;
        }
    }

    // --- الدالة الرئيسية لرسم التقويمين ---
    function renderDualCalendar() {
        renderGregorianGrid();
        renderHijriGrid();
    }

    function renderGregorianGrid() {
        const grid = document.getElementById('days-grid-g');
        const monthLabel = document.getElementById('current-month-display-g');
        if(!grid || !monthLabel) return; // حماية من الأخطاء

        const year = currentViewDateG.getFullYear();
        const month = currentViewDateG.getMonth();
        monthLabel.textContent = new Date(year, month).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        grid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startDayIndex = (firstDayOfMonth + 1) % 7; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('date-day', 'empty');
            grid.appendChild(empty);
        }
        
        const todayRef = getZeftaNow();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('date-day');
            dayEl.textContent = i;
            
            if (i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayEl.classList.add('active');
            }
            if (i === todayRef.getDate() && month === todayRef.getMonth() && year === todayRef.getFullYear()) {
                dayEl.classList.add('today');
            }
            
            dayEl.addEventListener('click', () => {
                setCurrentDate(new Date(year, month, i));
                currentViewDateH = new Date(currentDate); 
                onDateSelected();
            });
            grid.appendChild(dayEl);
        }
    }

    function renderHijriGrid() {
        const grid = document.getElementById('days-grid-h');
        const monthLabel = document.getElementById('current-month-display-h');
        if(!grid || !monthLabel) return;

        const hObj = kuwaitiCalendar(currentViewDateH);
        const hMonth = hObj.month;
        const hYear = hObj.year;
        monthLabel.textContent = `${hObj.monthName} ${hObj.year}`;
        grid.innerHTML = '';

        let tempDate = new Date(currentViewDateH);
        tempDate.setDate(tempDate.getDate() - 35); 
        let firstDayDate = null;
        // البحث عن بداية الشهر الهجري
        for(let i=0; i<70; i++) {
            tempDate.setDate(tempDate.getDate() + 1);
            let check = kuwaitiCalendar(tempDate);
            if (check.month === hMonth && check.year === hYear && check.day === 1) {
                firstDayDate = new Date(tempDate);
                break;
            }
        }
        if (!firstDayDate) firstDayDate = new Date(currentViewDateH); 

        const dayOfWeek = firstDayDate.getDay(); 
        const startDayIndex = (dayOfWeek + 1) % 7;

        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('date-day', 'empty');
            grid.appendChild(empty);
        }

        let iteratorDate = new Date(firstDayDate);
        for (let i = 1; i <= 30; i++) {
            const currH = kuwaitiCalendar(iteratorDate);
            if (currH.month !== hMonth) break; 
            
            const dayEl = document.createElement('div');
            dayEl.classList.add('date-day');
            dayEl.textContent = i;
            
            const selectedH = kuwaitiCalendar(currentDate);
            if (i === selectedH.day && hMonth === selectedH.month && hYear === selectedH.year) {
                dayEl.classList.add('active');
            }
            
            // حفظ التاريخ الميلادي لهذا اليوم الهجري
            const thisGregorianDate = new Date(iteratorDate); 
            dayEl.addEventListener('click', () => {
                setCurrentDate(thisGregorianDate);
                currentViewDateG = new Date(currentDate); 
                onDateSelected();
            });
            grid.appendChild(dayEl);
            iteratorDate.setDate(iteratorDate.getDate() + 1);
        }
    }

    function onDateSelected() {
        updateDateDisplay();
        renderDualCalendar();
        
        // 1. تصفير العدادات والنقاط مؤقتاً لضمان عدم تداخل بيانات الأيام
        updateGlobalScore(); 

        // 2. تحميل البيانات بناءً على حالة تسجيل الدخول
        if (typeof auth !== 'undefined' && auth.currentUser) {
            syncFromCloud(); // سيقوم بالتحميل من السحابة ثم التخزين المحلي ثم العرض
        } else {
            loadData(); // تحميل من التخزين المحلي مباشرة
        }
    }

    // --- أزرار التنقل (Navigation) ---
    // (تأكد من حذف الـ Listeners القديمة الخاصة بـ prev-month و next-month قبل إضافة هذا)
    const pmg = document.getElementById('prev-month-g'); if(pmg) pmg.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateG.setMonth(currentViewDateG.getMonth() - 1); renderGregorianGrid(); });
    const nmg = document.getElementById('next-month-g'); if(nmg) nmg.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateG.setMonth(currentViewDateG.getMonth() + 1); renderGregorianGrid(); });
    
    const pmh = document.getElementById('prev-month-h'); if(pmh) pmh.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateH.setDate(currentViewDateH.getDate() - 29); renderHijriGrid(); });
    const nmh = document.getElementById('next-month-h'); if(nmh) nmh.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateH.setDate(currentViewDateH.getDate() + 29); renderHijriGrid(); });

    if (dateToggleBtn) {
        dateToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(dateDropdown) {
                dateDropdown.classList.toggle('hidden');
                if (!dateDropdown.classList.contains('hidden')) {
                    currentViewDateG = new Date(currentDate);
                    currentViewDateH = new Date(currentDate);
                    renderDualCalendar();
                }
            }
        });
    }
    // --- Constants ---
    const ADHKAR_TYPES = ['morning', 'wakeup', 'evening', 'post_fajr', 'post_dhuhr', 'post_asr', 'post_maghrib', 'post_isha'];
    window.ADHKAR_TYPES = ADHKAR_TYPES;

    // دالة مساعدة لإنشاء كائن الذكر (النص الكامل، العدد، الفضل)
    // d(Text, Count, Fadl)
    const d = (text, count = 1, fadl = null) => ({ text, count, fadl });

    // أذكار ما بعد الصلاة (تم ضبط العدادات لها)
    const postPrayerAdhkar = [
        d('أستغفر الله', 3),
        d('اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام', 1, 'عن ثوبان رضي الله عنه قال: كان رسول الله ﷺ إذا انصرف من صلاته استغفر ثلاثا وقال: اللهم أنت السلام...'),
        d('اللهم أعنا على ذكرك وشكرك وحسن عبادتك', 1),
        d('لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 3),
        d('سبحان الله', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('الحمد لله', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('الله أكبر', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 1, 'تمام المائة لغفران الذنوب.'),
        d('آية الكرسي', 1, 'من قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.')
    ];

    // بيانات الأذكار كاملة (بنفس نصوصك الأصلية مع إضافة العدادات)
    const adhkarData = {
        'wakeup': [
            d('الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 1, 'رواه البخاري'),
            d('لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَريكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ للَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفرْ لِي', 1, 'من قالها غفرت له ذنوبه ولو كانت مثل زبد البحر'),
            d('الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لي بِذِكْرِهِ', 1),
            d('﴿إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ (190) الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ (191) رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ ۖ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ (192) رَّبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ (193) رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ (194) فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لَا أُضِيعُ عَمَلَ عَامِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَىٰ ۖ بَعْضُكُم مِّن بَعْضٍ ۖ فَالَّذِينَ هَاجَرُوا وَأُخْرِجُوا مِن دِيَارِهِمْ وَأُوذُوا فِي سَبِيلِي وَقَاتَلُوا وَقُتِلُوا لَأُكَفِّرَنَّ عَنْهُمْ سَيِّئَاتِهِمْ وَلَأُدْخِلَنَّهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ثَوَابًا مِّنْ عِندِ اللَّهِ ۗ وَاللَّهُ عِندَهُ حُسْنُ الثَّوَابِ (195) لَا يَغُرَّنَّكَ تَقَلُّبُ الَّذِينَ كَفَرُوا فِي الْبِلَادِ (196) مَتَاعٌ قَلِيلٌ ثُمَّ مَأْوَاهُمْ جَهَنَّمُ ۚ وَبِئْسَ الْمِهَادُ (197) لَٰكِنِ الَّذِينَ اتَّقَوْا رَبَّهُمْ لَهُمْ جَنَّاتٌ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا نُزُلًا مِّنْ عِندِ اللَّهِ ۗ وَمَا عِندَ اللَّهِ خَيْرٌ لِّلْأَبْرَارِ (198) وَإِنَّ مِنْ أَهْلِ الْكِتَابِ لَمَن يُؤْمِنُ بِاللَّهِ وَمَا أُنزِلَ إِلَيْكُمْ وَمَا أُنزِلَ إِلَيْهِمْ خَاشِعِينَ لِلَّهِ لَا يَشْتَرُونَ بِآيَاتِ اللَّهِ ثَمَنًا قَلِيلًا ۗ أُولَٰئِكَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ ۗ إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ (199) يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ (200)﴾', 1, 'كان النبي ﷺ يقرؤها إذا استيقظ من الليل')
        ],
        'morning': [
            d('أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيم اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ۝٢٥٥', 1, 'من قالها حين يصبح أجير من الجن حتى يمسي'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦', 3, 'تكفيك من كل شيء'),
            d('أَصْـبَحْنا وَأَصْـبَحَ المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذا اليوم وَخَـيرَ ما بَعْـدَه ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذا اليوم وَشَرِّ ما بَعْـدَه، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر.', 1),
            d('اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ .', 1, 'من قاله موقناً به حين يصبح فمات من يومه دخل الجنة'),
            d('رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً', 3, 'من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة'),
            d('اللّهُـمَّ إِنِّـي أَصْبَـحْتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك.', 4, 'من قالها أعتقه الله من النار'),
            d('اللّهُـمَّ ما أَصْبَـَحَ بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.', 1, 'من قالها فقد أدى شكر يومه'),
            d('حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم', 7, 'من قالها كفاه الله ما أهمه من أمر الدنيا والآخرة'),
            d('بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم', 3, 'لم يضره شيء'),
            d('اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشُور', 1),
            d('أَصْبَـحْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.', 1),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه', 3),
            d('اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ.', 3),
            d('اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي.', 1),
            d('يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ', 1),
            d('أَصْبَـحْـنا وَأَصْبَـحْ المُـلكُ للهِ رَبِّ العـالَمـين ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ خَـيْرَ هـذا الـيَوْم ، فَـتْحَهُ ، وَنَصْـرَهُ ، وَنـورَهُ وَبَـرَكَتَـهُ ، وَهُـداهُ ، وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهِ وَشَـرِّ ما بَعْـدَه.', 1),
            d('اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم.', 1),
            d('أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق', 3),
            d('اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا', 1),
            d('لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ', 10, 'أخرج الإمام أحمد في المسند عن أبي هريرة، قال: قال رسول الله صلى الله عليه وسلم: من قال: لا إله إلا الله، وحده لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير، من قالها عشر مرات حين يصبح، كتب له بها مائة حسنة ومحي عنه بها مائة سيئة، وكانت له عدل رقبة، وحفظ بها يومئذ حتى يمسي، ومن قال مثل ذلك حين يمسي، كان له مثل ذلك.'),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ', 100, 'حطت خطاياه وإن كانت مثل زبد البحر'),
            d('أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيْهِ', 100),
            d('اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ', 10, 'أدركته شفاعتي يوم القيامة')
        ],
'evening': [
            d('أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيم اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ', 1, 'من قالها حين يمسي أجير من الجن حتى يصبح'),
            d('آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝٢٨٥ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَّسِينَآ أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', 1, 'من قرأهما في ليلة كفتاه'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦', 3, 'تكفيك من كل شيء'),
            d('أَمْسَيْـنا وَأَمْسـى المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذهِ اللَّـيْلَةِ وَخَـيرَ ما بَعْـدَهـا ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذهِ اللَّـيْلةِ وَشَرِّ ما بَعْـدَهـا ، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر.', 1),
            d('اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ .', 1, 'من قاله موقناً به حين يمسي فمات من ليلته دخل الجنة'),
            d('رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً', 3, 'كان حقاً على الله أن يرضيه يوم القيامة'),
            d('اللّهُـمَّ إِنِّـي أَمسيتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك.', 4, 'من قالها أعتقه الله من النار'),
            d('اللّهُـمَّ ما أَمسى بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.', 1, 'من قالها فقد أدى شكر ليلته'),
            d('حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم', 7, 'من قالها كفاه الله ما أهمه من أمر الدنيا والآخرة'),
            d('بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم', 3, 'لم يضره شيء'),
            d('اللّهُـمَّ بِكَ أَمْسَيْـنا وَبِكَ أَصْـبَحْنا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ الْمَصِيرُ', 1),
            d('أَمْسَيْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.', 1),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه', 3),
            d('اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ.', 3),
            d('اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي.', 1),
            d('يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ', 1),
            d('أَمْسَيْنا وَأَمْسَى الْمُلْكُ للهِ رَبِّ الْعَالَمَيْنِ، اللَّهُمَّ إِنَّي أسْأَلُكَ خَيْرَ هَذَه اللَّيْلَةِ فَتْحَهَا ونَصْرَهَا، ونُوْرَهَا وبَرَكَتهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فيهِا وَشَرَّ مَا بَعْدَهَا.', 1),
            d('اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم.', 1),
            d('أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق', 3),
            d('لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ', 10, 'أخرج الإمام أحمد في المسند عن أبي هريرة، قال: قال رسول الله صلى الله عليه وسلم: من قال: لا إله إلا الله، وحده لا شريك له، له الملك، وله الحمد، وهو على كل شيء قدير، من قالها عشر مرات حين يصبح، كتب له بها مائة حسنة ومحي عنه بها مائة سيئة، وكانت له عدل رقبة، وحفظ بها يومئذ حتى يمسي، ومن قال مثل ذلك حين يمسي، كان له مثل ذلك.'),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ', 100, 'حطت خطاياه وإن كانت مثل زبد البحر'),
            d('أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيهِ', 100),
            d('اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ', 10, 'أدركته شفاعتي يوم القيامة')
        ],
        'post_fajr': postPrayerAdhkar,
        'post_dhuhr': postPrayerAdhkar,
        'post_asr': postPrayerAdhkar,
        'post_maghrib': postPrayerAdhkar,
        'post_isha': postPrayerAdhkar
    };

    const PRAYER_EXTRAS = {
        fajr: [
            { name: 'جلسة الإشراق (الجلوس لذكر الله حتى تطلع الشمس ثم صلاة ركعتين) - أجر حجة وعمرة.', points: 3 },
            { name: 'صلاة الضحى (8 ركعات)', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ],
        dhuhr: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرآن', points: 3 }
        ],
        asr: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 },
            { name: 'كثرة الاستغفار', points: 3 },
            { name: 'جلسة دعاء قبل الغروب', points: 3 }
        ],
        maghrib: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ],
        isha: [
            { name: 'سورة الملك (المنجية من عذاب القبر).', points: 3 },
            { name: 'الوضوء قبل النوم: (من بات طاهراً بات في شعاره ملك).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ]
    };

    let currentAdhkarType = '';
    let currentSelectedPrayer = null;

    // --- Scoring System (Updated for Gender) ---
    // --- دالة حساب النقاط وتجهيز تفاصيل العبادات ---
function calculateScoreAndSummary() {
    let currentPoints = 0;
    let maxPossiblePoints = 0;
    
    // كائن لتجميع إحصائيات التصنيفات (للرادار شارت)
    // نجمع: [النقاط المحققة, النقاط الكلية]
    let summary = {
        'الصلوات': [0, 0],
        'القرآن': [0, 0],
        'الأذكار': [0, 0],
        'السنن': [0, 0],
        'قيام الليل': [0, 0]
    };

    // 1. الصلوات المفروضة
    document.querySelectorAll('.prayer-item').forEach(card => {
        // البحث عن أزرار الصلاة الأساسية فقط (داخل أول task-box)
        const prayerBox = card.querySelector('.task-box'); 
        if(prayerBox) {
            const prayerBtns = Array.from(prayerBox.querySelectorAll('.prayer-btn')).filter(btn => window.getComputedStyle(btn).display !== 'none');
            
            if (prayerBtns.length > 0) {
                // حساب الماكسيمم
                let maxForPrayer = 0;
                prayerBtns.forEach(btn => {
                    const pts = parseInt(btn.getAttribute('data-points') || 0);
                    if (pts > maxForPrayer) maxForPrayer = pts;
                });
                
                maxPossiblePoints += maxForPrayer;
                summary['الصلوات'][1] += maxForPrayer;

                // حساب المحقق
                const activeBtn = prayerBox.querySelector('.prayer-btn.active');
                if (activeBtn) {
                    const pts = parseInt(activeBtn.getAttribute('data-points') || 0);
                    currentPoints += pts;
                    summary['الصلوات'][0] += pts;
                }
            }
        }
    });

    // 2. الأزرار التبديلية (سنن + نوافل)
    document.querySelectorAll('.task-btn.toggle-btn').forEach(btn => {
        const points = parseInt(btn.getAttribute('data-points') || 0);
        maxPossiblePoints += points;
        summary['السنن'][1] += points; // نفترض مبدئياً أنها سنن

        if (btn.classList.contains('active')) {
            currentPoints += points;
            summary['السنن'][0] += points;
        }
    });

    // 3. الأذكار (التقدم)
    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) {
            maxPossiblePoints += 2;
            summary['الأذكار'][1] += 2;
            
            if (progress.style.width === '100%') {
                currentPoints += 2;
                summary['الأذكار'][0] += 2;
            }
        }
    });

    // 4. ركن العبادات (قرآن، قيام، وتر، وغيرها)
    document.querySelectorAll('.ibada-box').forEach(box => {
        const points = parseInt(box.getAttribute('data-points') || 0);
        const title = box.querySelector('.ibada-title').textContent;
        const isDone = box.classList.contains('done');

        maxPossiblePoints += points;
        
        // تصنيف العبادة
        if (title.includes('قرآن')) {
            summary['القرآن'][1] += points;
            if (isDone) summary['القرآن'][0] += points;
        } else if (title.includes('قيام') || title.includes('وتر')) {
            summary['قيام الليل'][1] += points;
            if (isDone) summary['قيام الليل'][0] += points;
        } else {
            // أي عبادات إضافية تضاف للسنن
            summary['السنن'][1] += points;
            if (isDone) summary['السنن'][0] += points;
        }

        if (isDone) currentPoints += points;
    });

    // 5. العبادات الإضافية (صدقة، استغفار، صلاة على النبي...)
    document.querySelectorAll('.extra-worship-item').forEach(item => {
        const points = parseInt(item.getAttribute('data-points') || 0);
        maxPossiblePoints += points;
        summary['السنن'][1] += points;
        if (item.classList.contains('done')) {
            currentPoints += points;
            summary['السنن'][0] += points;
        }
    });

    // 6. البونص
    const bonusSection = document.getElementById('bonus-section');
    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusSection && !bonusSection.classList.contains('hidden') && bonusBtn) {
        const ptr = parseInt(bonusBtn.getAttribute('data-points') || 0);
        maxPossiblePoints += ptr;
        summary['السنن'][1] += ptr;
        if (bonusBtn.classList.contains('active')) {
            currentPoints += ptr;
            summary['السنن'][0] += ptr;
        }
    }

    // النسبة المئوية النهائية
    const percentage = maxPossiblePoints === 0 ? 0 : Math.round((currentPoints / maxPossiblePoints) * 100);

    return {
        percentage,
        summary // هذا هو الكنز الذي سنحفظه للرسم البياني
    };
}

// دالة تحديث الواجهة (تستدعي الدالة السابقة)
let __dailyFullCelebrationDone = false;
function updateGlobalScore() {
    const data = calculateScoreAndSummary();
    const percentage = data.percentage;

    // تحديث النصوص والبار
    const reflectionTitle = document.getElementById('reflection-title');
    if (reflectionTitle) {
        if (percentage >= 50) {
            reflectionTitle.textContent = "أحسنت! ما الذي أعانك على هذا الإنجاز اليوم؟";
            reflectionTitle.style.color = "#22c55e";
        } else {
            reflectionTitle.textContent = "ما الذي منعك وشغلك عن وردك اليوم؟";
            reflectionTitle.style.color = "#ef4444";
        }
    }

    if (totalScoreDisplay) totalScoreDisplay.textContent = `${percentage}%`;
    if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;

    const headerFill = document.getElementById('header-progress-fill');
    const headerText = document.getElementById('header-progress-text');
    if (headerFill) headerFill.style.width = `${percentage}%`;
    if (headerText) headerText.textContent = `${percentage}%`;

    // تحسين Gamification: احتفال كبير عند إتمام اليوم بالكامل (100%)
    if (percentage >= 100 && !__dailyFullCelebrationDone) {
        __dailyFullCelebrationDone = true;
        if (typeof window.fireCelebration === 'function') {
            window.fireCelebration({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 3 });
            setTimeout(() => window.fireCelebration({ clientX: window.innerWidth / 3, clientY: window.innerHeight / 2 }), 200);
            setTimeout(() => window.fireCelebration({ clientX: (window.innerWidth / 3) * 2, clientY: window.innerHeight / 2 }), 400);
        }
        if (typeof window.showCelebrationToast === 'function') {
            window.showCelebrationToast('أتممت وردك اليوم بالكامل! تقبل الله منك 🎉');
        }
    } else if (percentage < 100) {
        __dailyFullCelebrationDone = false;
    }

    return data; // نرجع البيانات لاستخدامها في الحفظ
}

    // --- Data Persistence Functions ---
    // --- هذه هي الدالة الناقصة، ضفها فوراً ---
// function getStorageKey(date) {
//     if (!date) date = getZeftaNow();
//     return `mohasba_data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
// }

// // دالة لتوحيد صيغة التاريخ في كل مكان (هام جداً لفصل الأيام)
// function getDateKey(date) {
//     if (!date) date = getZeftaNow();
//     // الصيغة: YYYY-M-D (مثال: 2026-2-8)
//     return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
// }

// // تحديث دالة مفتاح التخزين الرئيسي
// function getStorageKey(date) {
//     return `mohasba_data_${getDateKey(date)}`;
// }

// دالة موحدة لمفتاح التخزين تعتمد على التاريخ الممرر لها
function getStorageKey(date) {
    if (!date) date = getZeftaNow();
    // نستخدم دالة getDateKey لضمان توحيد الصيغة YYYY-M-D
    return `mohasba_data_${getDateKey(date)}`;
}

// دالة مساعدة لاستخراج صيغة التاريخ فقط
function getDateKey(date) {
    if (!date) date = getZeftaNow();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}


    // --- Mobile Menu Logic ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const actionIcons = document.getElementById('action-icons');

    if (mobileMenuBtn && actionIcons) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            actionIcons.classList.toggle('show-mobile');
        });

        // إغلاق القائمة لو ضغطت بره
        document.addEventListener('click', (e) => {
            if (!actionIcons.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                actionIcons.classList.remove('show-mobile');
            }
        });
    }

function saveData() {
    const key = getStorageKey(currentDate);
    
    // 1. تجهيز حالة الأزرار والأذكار
    const data = { buttons: {}, adhkar: {} };

    document.querySelectorAll('.task-btn:not(.extra-worship-box .task-btn)').forEach((btn, index) => {
        if (btn.classList.contains('active') || btn.classList.contains('completed')) {
            data.buttons[index] = true;
        }
    });

    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) {
            data.adhkar[type] = progress.style.width;
        }
    });

    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusBtn && bonusBtn.classList.contains('active')) {
        data.bonus = {
            id: bonusBtn.getAttribute('data-bonus-id'),
            done: true,
            points: parseInt(bonusBtn.getAttribute('data-points'))
        };
    }

    // 2. تحديث الإحصائيات
    const scoreData = updateGlobalScore(); 
    
    // 3. حفظ الملاحظات (الجديد)
    const reflectionInput = document.getElementById('reflection-input');
    const userNote = reflectionInput ? reflectionInput.value : "";

    data.stats = {
        totalScore: scoreData.percentage,
        breakdown: scoreData.summary
    };
    
    // إضافة الملاحظة للبيانات المحفوظة
    data.note = userNote;

    // 4. الحفظ الفعلي
    localStorage.setItem(key, JSON.stringify(data));
    
    // حفظ سحابي
    try { saveToCloud(key, data); } catch (e) {}

    if (window.radarChartInstance || window.lineChartInstance) {
        updateCharts(document.querySelector('.filter-btn.active')?.textContent === 'شهري' ? 'month' : 'week');
    }
}

    // --- تحديث دالة حفظ عبادات الركن (عشان تسمع في الإحصائيات) ---
function saveIbadatData() {
    // 1. الحفظ الخاص بالعبادات (عشان نحفظ حالتها وتفاصيلها)
    const key = `ibadat_data_${getDateKey(currentDate)}`;
    const data = { static: {}, dynamic: [] };

    // العبادات الثابتة
    document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
        data.static[box.dataset.id] = box.classList.contains('done');
    });

    // العبادات المضافة يدوياً
    document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => {
        const title = box.querySelector('.ibada-title').textContent;
        const time = box.querySelector('.ibada-time').textContent;
        const isDone = box.classList.contains('done');
        const points = box.getAttribute('data-points');
        data.dynamic.push({ name: title, time: time, done: isDone, points: points });
    });

    localStorage.setItem(key, JSON.stringify(data));
    
    // حفظ سحابي
    try { saveToCloud(key, data); } catch (e) {}

    // 2. (هام جداً) استدعاء الدالة الرئيسية لتحديث الإحصائيات العامة والشارتات
    saveData(); 
}

// --- تحديث دالة حفظ النوافل (عشان تسمع في الإحصائيات) ---
function saveExtras() {
    // 1. الحفظ الخاص بالنوافل
    const key = `extras_${getDateKey(currentDate)}`;
    const extrasData = [];

    document.querySelectorAll('.extra-worship-box').forEach(box => {
        const prayerCard = box.closest('.prayer-item');
        // حماية: التأكد من وجود الكارد قبل القراءة
        if (prayerCard) {
            const prayerId = prayerCard.id.replace('-card', '');
            const name = box.querySelector('.task-btn').textContent;
            const points = box.getAttribute('data-points');
            const isDone = box.querySelector('.task-btn').classList.contains('active');

            extrasData.push({
                prayer: prayerId,
                name: name,
                points: points,
                done: isDone
            });
        }
    });

    localStorage.setItem(key, JSON.stringify(extrasData));
    
    // حفظ سحابي
    try { saveToCloud(key, { ...extrasData }); } catch(e) {}

    // 2. (هام جداً) استدعاء الدالة الرئيسية لتحديث الإحصائيات العامة والشارتات
    saveData();
}

    function saveToCloud(key, data) {
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('data').doc(key).set(data)
                .catch((error) => console.error("Cloud Save Error:", error));
        }
    }



    // --- دوال العبادات الثابتة (Global Habits) ---

    function saveGlobalHabits() {
        localStorage.setItem('mohasba_global_habits', JSON.stringify(globalHabits));
        // حفظ في الفايربيس أيضاً
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('settings').doc('custom_habits').set(globalHabits)
                .catch(err => console.error("Error saving habits:", err));
        }
    }

    function loadGlobalHabits() {
        // 1. تحميل من LocalStorage أولاً للسرعة
        const saved = localStorage.getItem('mohasba_global_habits');
        if (saved) {
            try { globalHabits = JSON.parse(saved); } catch(e) { globalHabits = {}; }
            renderGlobalHabits(); // رسم العبادات على الشاشة
        }

        // 2. تحميل من Firebase للتحديث
        try {
            const user = auth.currentUser;
            if (user) {
                db.collection('users').doc(user.uid).collection('settings').doc('custom_habits').get()
                    .then(doc => {
                        if (doc.exists) {
                            globalHabits = doc.data();
                            localStorage.setItem('mohasba_global_habits', JSON.stringify(globalHabits));
                            renderGlobalHabits();
                            // بعد رسم العبادات، يجب إعادة تحميل حالة اليوم (هل تم إنجازها أم لا؟)
                            loadData(); 
                        }
                });
            }
        } catch(e) {}
    }

    // دالة رسم العبادات الثابتة على الشاشة
    function renderGlobalHabits() {
        // مسح العبادات الإضافية القديمة لتجنب التكرار
        document.querySelectorAll('.extra-worship-box').forEach(box => box.remove());
        document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => box.remove());

        // 1. رسم نوافل الصلوات
        if (globalHabits.prayerExtras) {
            globalHabits.prayerExtras.forEach(item => {
                renderExtraPrayerBox(item.prayer, item.name, item.points, item.id);
            });
        }

        // 2. رسم العبادات العامة
        if (globalHabits.generalIbadat) {
            globalHabits.generalIbadat.forEach(item => {
                renderGeneralIbadatBox(item.name, item.time, item.points, item.id);
            });
        }
    }


    function syncFromCloud() {
        const user = auth.currentUser;
        if (!user) return;

        // استخدام المفاتيح الموحدة التي تعتمد على currentDate
        const dateKey = getStorageKey(currentDate);
        const ibadatKey = `ibadat_data_${getDateKey(currentDate)}`;
        const extrasKey = `extras_${getDateKey(currentDate)}`;

        const docRef = db.collection('users').doc(user.uid).collection('data');

        // جلب البيانات الرئيسية
        docRef.doc(dateKey).get().then((doc) => {
            if (doc.exists) {
                localStorage.setItem(dateKey, JSON.stringify(doc.data()));
                loadData();
            } else {
                // إذا لم توجد بيانات في السحابة لهذا اليوم، نعتبرها فارغة ونعيد التحميل للتصفير
                loadData(); 
            }
        });

        // جلب بيانات العبادات
        docRef.doc(ibadatKey).get().then((doc) => {
            if (doc.exists) {
                localStorage.setItem(ibadatKey, JSON.stringify(doc.data()));
                loadIbadatData();
            } else {
                loadIbadatData();
            }
        });

        // جلب بيانات النوافل
        docRef.doc(extrasKey).get().then((doc) => {
            if (doc.exists) {
                const dataObj = doc.data();
                const dataArray = Object.values(dataObj);
                localStorage.setItem(extrasKey, JSON.stringify(dataArray));
                loadExtras();
            } else {
                loadExtras();
            }
        });
    }

    // --- Download Report Logic ---
    const downloadBtn = document.getElementById('download-report-btn');
    const reflectionInput = document.getElementById('reflection-input');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const date = currentDateDisplay.textContent;
            const score = totalScoreDisplay.textContent;
            const note = reflectionInput.value;

            const fileContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>تقرير محاسبة النفس</title>
                </head>
                <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                    <h1 style="color: #4f46e5; text-align: center;">تقرير محاسبة النفس</h1>
                    <h3 style="text-align: center; color: #555;">التاريخ: ${date}</h3>
                    <hr>
                    <h2 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                        نسبة الإنجاز اليوم: <span style="${parseInt(score) >= 50 ? 'color: green' : 'color: red'}">${score}</span>
                    </h2>
                    <br>
                    <h3>خواطرك وملاحظاتك:</h3>
                    <p style="font-size: 14pt; line-height: 1.6; white-space: pre-wrap;">${note ? note : 'لا يوجد ملاحظات مسجلة.'}</p>
                    <br>
                    <hr>
                    <p style="text-align: center; font-size: 10pt; color: #888;"> تم تصدير هذا التقرير من منصة محاسبة النفس، الرجاء الدعاء للمهندس محمد حمدي منفذ الموقع.</p>
                </body>
                </html>
            `;

            const blob = new Blob(['\ufeff', fileContent], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `تقرير_محاسبة_${date.replace(/\//g, '-')}.doc`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }


    function loadData() {
    const key = getStorageKey(currentDate);
    const saved = localStorage.getItem(key);

    // 1. تنظيف الحالة (Reset) قبل التحميل
    document.querySelectorAll('.task-btn').forEach(btn => btn.classList.remove('active', 'completed'));
    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) progress.style.width = '0%';
        const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
        if (btn) btn.classList.remove('completed');
    });

    let needsMigration = false; // متغير للتحقق هل نحتاج تحديث البيانات أم لا

    // 2. تطبيق البيانات المحفوظة
    if (saved) {
        let data;
        try { data = JSON.parse(saved); } catch(e) { data = null; }
        if (data) {
            // استعادة الأزرار
            if (data.buttons) {
                Object.keys(data.buttons).forEach(index => {
                    const btns = document.querySelectorAll('.task-btn:not(.extra-worship-box .task-btn)');
                    if (btns[index]) {
                        btns[index].classList.add(btns[index].classList.contains('action-btn') ? 'completed' : 'active');
                    }
                });
            }

            // استعادة الأذكار
            if (data.adhkar) {
                Object.keys(data.adhkar).forEach(type => {
                    const progress = document.getElementById(`progress-${type}`);
                    if (progress) progress.style.width = data.adhkar[type];
                    
                    const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
                    if (btn && data.adhkar[type] === '100%') btn.classList.add('completed');
                });
            }
            
            // استعادة البونص
            if (data.bonus) {
                const bonusBtn = document.getElementById('bonus-action-btn');
                if(bonusBtn && bonusBtn.getAttribute('data-bonus-id') === data.bonus.id && data.bonus.done) {
                    bonusBtn.classList.add('active');
                    bonusBtn.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${data.bonus.points}+)`;
                }
            }

            if (!data.stats) {
                needsMigration = true;
            }
        }
    }

    // استدعاء باقي دوال التحميل
    loadExtras();
    loadIbadatData();

    // 3. الخطوة الحاسمة: إذا كان هناك بيانات قديمة بدون إحصائيات، أو لمجرد تحديث الواجهة
    // نقوم بحساب النقاط فوراً بناءً على ما تم تحميله في الـ DOM
    // ثم نحفظ النسخة الجديدة المحدثة
    if (saved || needsMigration) {
        saveData(); // هذا السطر سيقوم بملء الـ Charts فوراً
    } else {
        updateGlobalScore(); // تحديث العرض فقط للأيام الفارغة
    }
    
    // تحديث الشارتات لو القسم مفتوح
    if (document.getElementById('analytics-section')) {
        updateCharts('week'); 
    }
}
    function loadIbadatData() {
        const key = `ibadat_data_${getDateKey(currentDate)}`;
        const saved = localStorage.getItem(key);

        // 1. تنظيف الحالة
        document.querySelectorAll('.ibada-box').forEach(box => box.classList.remove('done'));

        // 2. تطبيق البيانات
        if (saved) {
            let data;
            try { data = JSON.parse(saved); } catch(e) { data = null; }
            if (data) {
            
            // الثابتة
            if (data.static) {
                Object.keys(data.static).forEach(id => {
                    const box = document.querySelector(`.ibada-box[data-id="${id}"]`);
                    if (box && data.static[id]) box.classList.add('done');
                });
            }

            // المضافة
            if (data.dynamic) {
                data.dynamic.forEach(item => {
                    const boxes = document.querySelectorAll('.ibada-box:not([data-id])');
                    boxes.forEach(box => {
                        const title = box.querySelector('.ibada-title').textContent;
                        if (title.includes(item.name) && item.done) {
                            box.classList.add('done');
                        }
                    });
                });
            }
            } // end if (data)
        } // end if (saved)
        updateGlobalScore();
    }

    function loadExtras() {
        const key = `extras_${getDateKey(currentDate)}`;
        const saved = localStorage.getItem(key);

        // 1. تنظيف الحالة
        document.querySelectorAll('.extra-worship-box').forEach(box => {
            box.classList.remove('done');
            box.querySelector('.task-btn').classList.remove('active');
        });

        // 2. تطبيق البيانات
        if (saved) {
            try {
                const extrasData = JSON.parse(saved);
                extrasData.forEach(item => {
                    document.querySelectorAll('.extra-worship-box').forEach(box => {
                        const btn = box.querySelector('.task-btn');
                        if (btn.textContent === item.name && item.done) {
                            btn.classList.add('active');
                            box.classList.add('done');
                        }
                    });
                });
            } catch(e) {}
        }
        updateGlobalScore();
    }

    // --- Event Listeners for UI ---

    // 1. Static Prayer Buttons
    document.querySelectorAll('.prayer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = btn.parentElement;
            const wasActive = btn.classList.contains('active');
            const prayerName = btn.closest('.prayer-item')?.querySelector('.prayer-name')?.textContent || '';
            
            parent.querySelectorAll('.prayer-btn').forEach(sibling => {
                if (sibling !== btn) sibling.classList.remove('active');
            });
            btn.classList.toggle('active');
            
            if (!wasActive && btn.classList.contains('active')) {
                fireCelebration(e);
                showUndoBar(prayerName + ' ✓', () => {
                    btn.classList.remove('active');
                    saveData();
                    updateGlobalScore();
                });
                addInlineUndoButton(btn, () => {
                    btn.classList.remove('active');
                    saveData();
                    updateGlobalScore();
                });
            }
            saveData();
        });
    });

    // 2. Static Toggle Buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const wasActive = btn.classList.contains('active');
            const btnText = btn.textContent.trim();
            btn.classList.toggle('active');
            
            if (!wasActive && btn.classList.contains('active')) {
                fireCelebration(e);
                showUndoBar(btnText + ' ✓', () => {
                    btn.classList.remove('active');
                    saveData();
                    updateGlobalScore();
                });
                addInlineUndoButton(btn, () => {
                    btn.classList.remove('active');
                    saveData();
                    updateGlobalScore();
                });
            }
            saveData();
        });
    });

    // 3. Static Rukn Al-Ibadat
    document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
        box.addEventListener('click', (e) => {
            if (e.target.closest('.undo-inline-btn')) return;
            const wasDone = box.classList.contains('done');
            const boxName = box.querySelector('.ibada-title')?.textContent || '';
            box.classList.toggle('done');
            
            if (!wasDone && box.classList.contains('done')) {
                fireCelebration(e);
                showUndoBar(boxName + ' ✓', () => {
                    box.classList.remove('done');
                    saveIbadatData();
                    updateGlobalScore();
                });
                addInlineUndoButton(box, () => {
                    box.classList.remove('done');
                    saveIbadatData();
                    updateGlobalScore();
                });
            }
            saveIbadatData();
        });
    });

    // 4. Adhkar Modal (تحديث كامل لدعم العداد وأيقونة الفضل مع دعم النصوص القديمة والجديدة)
    // 4. Adhkar Modal (نسخة محسنة تدعم التلميح العائم Global Tooltip)
    window.openAdhkar = function (type) {
    currentAdhkarType = type;
    const titleMap = {
        'wakeup': 'أذكار الاستيقاظ',
        'morning': 'أذكار الصباح',
        'evening': 'أذكار المساء',
        'post_fajr': 'أذكار بعد صلاة الفجر',
        'post_dhuhr': 'أذكار بعد صلاة الظهر',
        'post_asr': 'أذكار بعد صلاة العصر',
        'post_maghrib': 'أذكار بعد صلاة المغرب',
        'post_isha': 'أذكار بعد صلاة العشاء'
    };
    if (modalTitle) modalTitle.textContent = titleMap[type];

    // --- منطق تحديد المستوى (الجديد) ---
    const userLevel = parseInt(userProfile.level || '3'); // الافتراضي 3 (كامل)
    let limit;
    let levelName;

    // تحديد عدد الأذكار بناءً على المستوى
    if (userLevel === 1) {
        limit = 5; // المبتدئ: أول 5 أذكار فقط (الأساسيات)
        levelName = '(مستوى مبتدئ)';
    } else if (userLevel === 2) {
        limit = 12; // المتوسط: أول 12 ذكر
        levelName = '(مستوى متوسط)';
    } else {
        limit = 100; // المجتهد: الكل
        levelName = '';
    }

    // إضافة التلميح العام (Tooltip) إن لم يكن موجوداً
    let globalTooltip = document.getElementById('global-fadl-tooltip');
    if (!globalTooltip) {
        globalTooltip = document.createElement('div');
        globalTooltip.id = 'global-fadl-tooltip';
        globalTooltip.className = 'fadl-tooltip-global';
        document.body.appendChild(globalTooltip);
    }

    if (adhkarListContainer) {
        adhkarListContainer.classList.toggle('hide-scrollbar', type.startsWith('post_'));
        adhkarListContainer.innerHTML = '';
        
        // إضافة عنوان جانبي يوضح المستوى
        if (levelName) {
            const levelHint = document.createElement('div');
            levelHint.style.cssText = "text-align:center; color:#888; font-size:0.8rem; margin-bottom:10px;";
            levelHint.textContent = `يتم عرض أهم الأذكار فقط ${levelName}`;
            adhkarListContainer.appendChild(levelHint);
        }

        const rawItems = adhkarData[type] || [];
        
        // === تطبيق الفلتر هنا ===
        // نأخذ فقط العدد المسموح به بناءً على الـ limit
        const filteredItems = rawItems.slice(0, limit);
        // =======================

        const items = filteredItems.map(item => {
            if (typeof item === 'string') {
                return { text: item, count: 1, fadl: null };
            }
            return item;
        });

        items.forEach((item) => {
            // ... (باقي كود إنشاء العناصر كما هو تماماً بدون تغيير) ...
            const itemDiv = document.createElement('div');
            itemDiv.className = 'adhkar-item';
            
            // تحقق من الـ localStorage إذا كان هذا العنصر مكتمل سابقاً
            // (ملاحظة: نحتاج للتأكد من حالة الاكتمال بناءً على النص أو الفهرس)
            
            let currentCount = 0;
            let counterBtn = null;

            // دالة موحدة لزيادة العداد (تُستخدم سواء بالضغط على زر العداد نفسه
            // أو بالضغط على المربع/الـ checkbox بالكامل - تصحيح الخطأ المطلوب)
            const incrementDhikrCount = () => {
                if (currentCount < item.count) {
                    currentCount++;
                    if (counterBtn) counterBtn.querySelector('.count-display').textContent = `${currentCount} / ${item.count}`;
                    if (currentCount === item.count) {
                        if (counterBtn) {
                            counterBtn.classList.add('completed');
                            counterBtn.innerHTML = `<i class="fa-solid fa-check"></i> تم (${item.count})`;
                        }
                        if (!itemDiv.classList.contains('completed')) toggleItemCompletion(itemDiv, type);
                    }
                }
            };
            
            // --- المحتوى ---
            const contentTop = document.createElement('div');
            contentTop.style.display = "flex";
            contentTop.style.alignItems = "center";
            contentTop.style.gap = "10px";
            contentTop.style.width = "100%";
            
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'adhkar-checkbox';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            textSpan.style.flex = "1";

            contentTop.appendChild(checkboxDiv);
            contentTop.appendChild(textSpan);

            // --- أدوات التحكم (العداد والفضل) ---
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'adhkar-controls';

            if (item.count > 1) {
                counterBtn = document.createElement('button');
                counterBtn.className = 'counter-btn';
                counterBtn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> <span class="count-display">0 / ${item.count}</span>`;
                
                counterBtn.onclick = (e) => {
                    e.stopPropagation();
                    incrementDhikrCount();
                };
                controlsDiv.appendChild(counterBtn);
            }

            if (item.fadl) {
                const infoWrapper = document.createElement('div');
                infoWrapper.className = 'info-wrapper';
                infoWrapper.innerHTML = `<i class="fa-solid fa-circle-question info-icon"></i>`;
                
                // منطق التلميح (Tooltip)
                const showTooltip = () => {
                    const rect = infoWrapper.getBoundingClientRect();
                    globalTooltip.textContent = item.fadl;
                    globalTooltip.style.display = 'block';
                    let top = rect.top - globalTooltip.offsetHeight - 10;
                    let left = rect.left + (rect.width / 2) - (globalTooltip.offsetWidth / 2);
                    if (top < 10) top = rect.bottom + 10;
                    if (left < 10) left = 10;
                    if (left + globalTooltip.offsetWidth > window.innerWidth) left = window.innerWidth - globalTooltip.offsetWidth - 10;
                    globalTooltip.style.top = `${top}px`;
                    globalTooltip.style.left = `${left}px`;
                };

                infoWrapper.onmouseenter = showTooltip;
                infoWrapper.onmouseleave = () => { globalTooltip.style.display = 'none'; };
                infoWrapper.onclick = (e) => {
                    e.stopPropagation();
                    showTooltip();
                    setTimeout(() => { globalTooltip.style.display = 'none'; }, 3000);
                };
                controlsDiv.appendChild(infoWrapper);
            }

            itemDiv.appendChild(contentTop);
            if (item.count > 1 || item.fadl) {
                itemDiv.appendChild(controlsDiv);
            }

            itemDiv.addEventListener('click', (e) => {
                if (e.target.closest('.counter-btn') || e.target.closest('.info-wrapper')) return;
                // إذا كان للذكر عداد (تكرار أكثر من مرة): الضغط في أي مكان بالمربع
                // (بما في ذلك الـ checkbox) يزيد العداد فقط، ولا يقفل/يكمل الذكر مباشرة
                if (item.count > 1) {
                    if (!itemDiv.classList.contains('completed')) {
                        incrementDhikrCount();
                    }
                } else {
                    toggleItemCompletion(itemDiv, type);
                }
            });

            // استعادة حالة العنصر إذا كان مكتملاً في الذاكرة
            // (هذا الجزء يحتاج لمنطق متقدم قليلاً لربط النص بالحفظ، 
            // لكن الكود الحالي يعتمد على حفظ حالة الزر الخارجي، 
            // سنتركه كما هو ليعمل مع نظامك الحالي)

            adhkarListContainer.appendChild(itemDiv);
        });
    }
    if (adhkarModal) adhkarModal.classList.remove('hidden');
};

    // دالة مساعدة لتبديل حالة الإنجاز
    function toggleItemCompletion(element, type) {
        const wasCompleted = element.classList.contains('completed');
        element.classList.toggle('completed');
        updateAdhkarProgress(type);
        if (!wasCompleted && element.classList.contains('completed')) {
            showUndoBar('تم إنجاز الذكر ✓', () => {
                element.classList.remove('completed');
                updateAdhkarProgress(type);
            });
        }
    }

    function updateAdhkarProgress(type) {
        if (!adhkarListContainer) return;
        // نحسب فقط عناصر الأذكار (.adhkar-item) وليس كل عنصر بداخل القائمة،
        // لأن زر العداد الداخلي (.counter-btn) يأخذ هو الآخر كلاس "completed"
        // لتلوينه، وكان يُحتسب مرتين فيمنع الوصول لنسبة 100% بالضبط عند
        // الإتمام اليدوي (بدون الضغط على زرار "اتمام") - هذا هو تصحيح الخطأ.
        const items = adhkarListContainer.querySelectorAll('.adhkar-item');
        const total = items.length;
        const completed = adhkarListContainer.querySelectorAll('.adhkar-item.completed').length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;

        const bar = document.getElementById(`progress-${type}`);
        if (bar) bar.style.width = `${percentage}%`;

        const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
        if (btn) {
            const wasCompleted = btn.classList.contains('completed');
            if (percentage === 100) {
                btn.classList.add('completed');
                if (!wasCompleted && typeof fireCelebration === 'function') {
                    fireCelebration(btn.getBoundingClientRect ? { target: btn } : null);
                    if (typeof showCelebrationToast === 'function') showCelebrationToast('أحسنت! أتممت الذكر كاملاً ✨');
                }
            }
            else btn.classList.remove('completed');
        }
        saveData();
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => adhkarModal.classList.add('hidden'));
    if (completeAdhkarBtn) completeAdhkarBtn.addEventListener('click', () => {
        adhkarListContainer.querySelectorAll('.adhkar-item').forEach(item => item.classList.add('completed'));
        updateAdhkarProgress(currentAdhkarType);
        setTimeout(() => adhkarModal.classList.add('hidden'), 300);
    });
    window.addEventListener('click', (e) => { if (e.target === adhkarModal) adhkarModal.classList.add('hidden'); });

    // 5. Extra Worship (Rukn Al-Ibadat)
    if (addWorshipBtn) addWorshipBtn.addEventListener('click', () => addWorshipModal.classList.remove('hidden'));
    if (closeWorshipModalBtn) closeWorshipModalBtn.addEventListener('click', () => addWorshipModal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === addWorshipModal) addWorshipModal.classList.add('hidden'); });

    // داخل الحدث saveWorshipBtn.addEventListener...
    if (saveWorshipBtn) {
        saveWorshipBtn.addEventListener('click', () => {
            addCustomAdhkarFromModal();
        });
    }

    // دالة مساعدة لرسم عبادات الركن
    function renderGeneralIbadatBox(name, time, points, id) {
        const box = document.createElement('div');
        box.className = 'ibada-box';
        box.setAttribute('data-habit-id', id);
        box.setAttribute('data-points', points);

        box.innerHTML = `
            <button class="delete-ibada-btn">&times;</button>
            <h3 class="ibada-title">${name} (${points} نقاط)</h3>
            <span class="ibada-time">${time}</span>
        `;

        box.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-ibada-btn')) return;
            box.classList.toggle('done');
            saveIbadatData(); // حفظ حالة اليوم
        });

        box.querySelector('.delete-ibada-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('هل أنت متأكد من حذف هذه العبادة نهائياً؟')) {
                globalHabits.generalIbadat = globalHabits.generalIbadat.filter(h => h.id !== id);
                saveGlobalHabits();
                box.remove();
                saveIbadatData();
            }
        });

        ibadatGrid.insertBefore(box, addWorshipBtn);
    }

    function createNewWorshipBox(name, time, isDone = false, points = 1) {
        const box = document.createElement('div');
        box.className = 'ibada-box';
        box.setAttribute('data-points', points);
        if (isDone) box.classList.add('done');

        box.innerHTML = `
            <button class="delete-ibada-btn">&times;</button>
            <h3 class="ibada-title">${name} (${points} نقاط)</h3>
            <span class="ibada-time">${time}</span>
        `;

        box.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-ibada-btn')) return;
            box.classList.toggle('done');
            saveIbadatData();
        });

        box.querySelector('.delete-ibada-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('هل أنت متأكد من حذف هذه العبادة؟')) {
                box.remove();
                saveIbadatData();
            }
        });

        ibadatGrid.insertBefore(box, addWorshipBtn);
    }

    // 6. Prayer Extras Logic
    document.querySelectorAll('.add-prayer-extra-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedPrayer = btn.dataset.prayer;
            openExtraPrayerModal(currentSelectedPrayer);
        });
    });

    if (closeExtraModalBtn) closeExtraModalBtn.addEventListener('click', () => {
        editingExtraId = null;
        document.getElementById('add-custom-nawafil-btn').textContent = 'إضافة';
        document.getElementById('custom-nawafil-name').value = '';
        document.getElementById('custom-nawafil-points').value = '2';
        extraPrayerModal.classList.add('hidden');
    });

    // إضافة نافلة مخصصة بالكتابة
    let editingExtraId = null;
    const addCustomNawafilBtn = document.getElementById('add-custom-nawafil-btn');
    if (addCustomNawafilBtn) {
        addCustomNawafilBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('custom-nawafil-name');
            const pointsInput = document.getElementById('custom-nawafil-points');
            const name = nameInput.value.trim();
            const points = parseInt(pointsInput.value) || 2;
            if (!name) { nameInput.focus(); return; }
            const safePoints = Math.min(Math.max(points, 1), 10);

            if (editingExtraId) {
                const item = globalHabits.prayerExtras.find(h => h.id === editingExtraId);
                if (item) {
                    item.name = name;
                    item.points = safePoints;
                    saveGlobalHabits();
                    const prayerCard = document.getElementById(`${currentSelectedPrayer}-card`);
                    if (prayerCard) {
                        const oldBox = prayerCard.querySelector(`[data-habit-id="${editingExtraId}"]`);
                        if (oldBox) oldBox.remove();
                    }
                    renderExtraPrayerBox(currentSelectedPrayer, name, safePoints, editingExtraId);
                    updateGlobalScore();
                }
                editingExtraId = null;
                addCustomNawafilBtn.textContent = 'إضافة';
            } else {
                addExtraToPrayer(currentSelectedPrayer, { name, points: safePoints });
            }
            nameInput.value = '';
            pointsInput.value = '2';
            extraPrayerModal.classList.add('hidden');
        });
    }

    function openExtraPrayerModal(prayer) {
        editingExtraId = null;
        document.getElementById('add-custom-nawafil-btn').textContent = 'إضافة';
        document.getElementById('custom-nawafil-name').value = '';
        document.getElementById('custom-nawafil-points').value = '2';
        extraWorshipList.innerHTML = '';
        const extras = PRAYER_EXTRAS[prayer] || [];
        const prayerCard = document.getElementById(`${prayer}-card`);
        if (!prayerCard) return;
        const existingExtras = Array.from(prayerCard.querySelectorAll('.extra-worship-box .task-btn')).map(btn => btn.textContent.trim());

        extras.forEach(extra => {
            if (existingExtras.includes(extra.name)) return;
            const item = document.createElement('div');
            item.className = 'adhkar-item';
            item.innerHTML = `
                <span>${extra.name} (${extra.points} نقاط)</span>
                <button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;">إضافة</button>
            `;
            item.querySelector('button').addEventListener('click', () => {
                addExtraToPrayer(prayer, extra);
                extraPrayerModal.classList.add('hidden');
            });
            extraWorshipList.appendChild(item);
        });
        extraPrayerModal.classList.remove('hidden');
    }

    function addExtraToPrayer(prayer, extra) {
        // إنشاء ID فريد
        const id = Date.now().toString(); 
        
        // إضافة للمتغير العام
        if (!globalHabits.prayerExtras) globalHabits.prayerExtras = [];
        globalHabits.prayerExtras.push({
            id: id,
            prayer: prayer,
            name: extra.name,
            points: extra.points
        });

        saveGlobalHabits(); // حفظ دائم
        renderExtraPrayerBox(prayer, extra.name, extra.points, id); // رسم
        updateGlobalScore();
    }

    // دالة مساعدة للرسم فقط (مفصولة عن الحفظ)
    function renderExtraPrayerBox(prayer, name, points, id) {
        const prayerCard = document.getElementById(`${prayer}-card`);
        if(!prayerCard) return;
        
        const grid = prayerCard.querySelector('.prayer-content-grid');
        const box = document.createElement('div');
        box.className = 'task-box extra-worship-box';
        box.setAttribute('data-habit-id', id);
        box.setAttribute('data-points', points);
        
        box.innerHTML = `
            <h4 class="box-title">نافلة إضافية</h4>
            <button class="task-btn toggle-btn" data-points="${points}">${name}</button>
            <div class="extra-worship-actions">
              <button class="edit-extra-btn" title="تعديل"><i class="fa-solid fa-pen"></i></button>
              <button class="delete-extra-btn" title="حذف"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;

        const btn = box.querySelector('.task-btn');
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');
            btn.classList.toggle('active');
            box.classList.toggle('done', btn.classList.contains('active'));
            saveData();
            saveExtras();
            updateGlobalScore();
            if (!wasActive && btn.classList.contains('active')) {
                showUndoBar(name + ' ✓', () => {
                    btn.classList.remove('active');
                    box.classList.remove('done');
                    saveData();
                    saveExtras();
                    updateGlobalScore();
                });
            }
        });

        box.querySelector('.edit-extra-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditExtraModal(id, prayer, name, points);
        });

        box.querySelector('.delete-extra-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('حذف هذه النافلة نهائياً من كل الأيام؟')) {
                globalHabits.prayerExtras = globalHabits.prayerExtras.filter(h => h.id !== id);
                saveGlobalHabits();
                box.remove();
                updateGlobalScore();
            }
        });

        const addBtn = grid.querySelector('.add-prayer-extra-btn');
        grid.insertBefore(box, addBtn);
    }

    function openEditExtraModal(id, prayer, oldName, oldPoints) {
        editingExtraId = id;
        currentSelectedPrayer = prayer;
        document.getElementById('custom-nawafil-name').value = oldName;
        document.getElementById('custom-nawafil-points').value = oldPoints;
        document.getElementById('add-custom-nawafil-btn').textContent = 'حفظ التعديل';
        extraPrayerModal.classList.remove('hidden');
    }

    // =========================================
    //  نظام الإشعارات والتنبيهات الذكي
    // =========================================

    // 1. تعريف متغيرات الإعدادات الافتراضية
    let notificationSettings = {
        enabled: false,
        morningTime: '06:00',
        eveningTime: '17:00',
        wirdTime: '21:00'
    };

    // تحميل الإعدادات عند فتح الموقع
    const savedNotifSettings = localStorage.getItem('notification_settings');
    if (savedNotifSettings) {
        try { notificationSettings = JSON.parse(savedNotifSettings); } catch(e) {}
        // تحديث الحقول في المودال
        const morningTimeEl = document.getElementById('setup-morning-time');
        const eveningTimeEl = document.getElementById('setup-evening-time');
        const wirdTimeEl = document.getElementById('setup-wird-time');
        if (morningTimeEl) morningTimeEl.value = notificationSettings.morningTime;
        if (eveningTimeEl) eveningTimeEl.value = notificationSettings.eveningTime;
        if (wirdTimeEl) wirdTimeEl.value = notificationSettings.wirdTime;
    }

    // 4. الدالة الرئيسية: المراقب الدوري (يعمل كل دقيقة، وده بيشتغل بس والتطبيق مفتوح فعليًا -
    //    التنبيهات اليومية الثابتة (صباح/مساء/ورد) بقت متجدولة native في التطبيق، أما تنبيه
    //    الصلاة والمناسبات هنا فلسه بيعتمد على إن الصفحة تكون مفتوحة)
    setInterval(() => {
        const nativeApp = window.isNativeApp && window.isNativeApp();
        if (!nativeApp && (typeof Notification === 'undefined' || Notification.permission !== "granted")) return;
        if (nativeApp && !notificationSettings.enabled) return;

        const now = getZeftaNow();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // أ) تنبيهات الأذكار والورد (حسب اختيار المستخدم)
        if (currentTime === notificationSettings.morningTime) {
            sendNotification("أذكار الصباح", "بداية يوم مبارك بذكر الله.");
        }
        if (currentTime === notificationSettings.eveningTime) {
            sendNotification("أذكار المساء", "حصّن نفسك قبل الغروب.");
        }
        if (currentTime === notificationSettings.wirdTime) {
            sendNotification("الورد القرآني", "لا تهجر القرآن، ولو صفحة واحدة.");
        }

        // ب) تنبيهات عبادات الغد (نثبتها مثلاً الساعة 9 مساءً)
        if (currentTime === "21:00") {
            checkTomorrowWorships();
        }

    }, 60000); // يفحص كل 60 ثانية

    // دالة إرسال الإشعار
    function sendNotification(title, body) {
        // بنمرر عبر الجسر الموحّد: لو جوه تطبيق أندرويد هيستخدم الإشعار native،
        // ولو متصفح عادي هيستخدم Notification زي ما كان
        if (window.sendLocalNotification) {
            window.sendLocalNotification(title, body);
        } else if (typeof Notification !== 'undefined') {
            new Notification(title, { body: body, icon: 'logo.png', dir: 'rtl' });
        }
    }

    // منطق فحص عبادات الغد
    function checkTomorrowWorships() {
        // نستخدم مصفوفة sunnahEvents الموجودة في كودك السابق
        // نحتاج لمعرفة التاريخ الهجري لغد
        const tomorrow = getZeftaNow();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowHijri = kuwaitiCalendar(tomorrow); 
        
        // البحث في مصفوفة الأحداث
        const event = sunnahEvents.find(e => e.type === 'hijri' && e.day == tomorrowHijri.day);
        
        if (event && event.notifyBefore) {
            sendNotification("تذكير بعبادة غداً", event.notifyMsg);
        }
        
        // فحص يومي الإثنين والخميس
        const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayName === 'Monday' || dayName === 'Thursday') {
            sendNotification("صيام غداً", `غداً يوم ${dayName === 'Monday' ? 'الإثنين' : 'الخميس'}، هل نويت الصيام؟`);
        }
    }

    // --- Warning Section Logic ---

    const warningModal = document.getElementById('warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-modal');
    const warningTitle = document.getElementById('warning-modal-title');
    const warningQuran = document.getElementById('warning-quran');
    const warningHadith = document.getElementById('warning-hadith');


    // =========================================
//  بيانات المهلكات (التعريفات، الأمثلة اليومية، القصص)
// =========================================
const warningsData = {
    'lying': {
        title: 'الكذب',
        def: 'هو الإخبار بخلاف الواقع، سواء كان جاداً أو مازحاً. وهو من صفات المنافقين التي تهدم الثقة وتسقط المروءة.',
        quran: 'إِنَّمَا يَفْتَرِي الْكَذِبَ الَّذِينَ لَا يُؤْمِنُونَ بِآيَاتِ اللَّهِ ۖ وَأُولَٰئِكَ هُمُ الْكَاذِبُونَ',
        hadith: 'قال ﷺ: "وإياكم والكذب، فإن الكذب يهدي إلى الفجور، وإن الفجور يهدي إلى النار"',
        dailyExamples: [
            "أن تقول 'أنا في الطريق' وأنت لم تخرج من البيت بعد.",
            "المبالغة في وصف حدث بسيط لإضحاك الناس (كذب المزاح).",
            "نقل الأخبار من السوشيال ميديا دون التثبت من صحتها.",
            "الكذب على الأطفال بحجة إسكاتهم (يُكتب كذبة).",
            "شهادة الزور أو التوقيع مكان زميل في العمل."
        ],
        stories: [
            "قصة كعب بن مالك: حين تخلف عن غزوة تبوك، صدق الله ورسوله ولم يختلق عذراً كاذباً كما فعل المنافقون، فكان صدقه سبباً في نجاته وتوبة الله عليه بعد مقاطعة دامت 50 ليلة.",
            "قصة المرأة التي قالت لابنها 'تعال أعطك': سألها النبي ﷺ 'ما أردت أن تعطيه؟' قالت: تمراً. فقال: 'أما إنك لو لم تعطه شيئاً لكتبت عليك كذبة'."
        ]
    },
    'backbiting': {
        title: 'الغيبة',
        def: 'ذكرك أخاك بما يكره في غيبته، وإن كان فيه ما تقول. وهي تأكل الحسنات كما تأكل النار الحطب.',
        quran: 'وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ',
        hadith: 'قيل: يا رسول الله، أفرأيت إن كان في أخي ما أقول؟ قال: "إن كان فيه ما تقول فقد اغتبته، وإن لم يكن فيه فقد بهته"',
        dailyExamples: [
            "الحديث عن ملابس أو شكل شخص ما بسخرية مع الأصدقاء.",
            "تقليد طريقة كلام شخص ما للضحك عليه.",
            "الشكوى من 'مديرك' أو 'زميلك' بذكر عيوبهم الشخصية لا المهنية.",
            "قول 'فلان طيب بس مشكلته إنه...' وذكر عيب يكرهه.",
            "الهمز واللمز بالحركات عند مرور شخص معين."
        ],
        stories: [
            "مر النبي ﷺ بقبرين يعذبان، وكان أحدهما يمشي بالنميمة (وهي فرع من آفات اللسان)، وفي حادثة أخرى مر برجلين يغتابان رجلاً، فلما مروا بجيفة حمار ميت قال لهما: 'كلا من جيفة هذا'، فقالا: يا رسول الله من يأكل هذا؟ قال: 'فما نلتما من عرض أخيكما آنفاً أشد من أكل منه'.",
            "قالت عائشة رضي الله عنها للنبي ﷺ عن صفية: 'حسبك من صفية كذا وكذا' (تعني أنها قصيرة)، فقال لها: 'لقد قلت كلمة لو مزجت بماء البحر لمزجته'."
        ]
    },
    'gazing': {
        title: 'إطلاق البصر',
        def: 'النظر إلى ما حرم الله، سواء كان مباشراً أو عبر الشاشات. وهو سهم مسموم يفسد القلب ويضعف الإيمان.',
        quran: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ',
        hadith: 'قال ﷺ لعلي: "يا علي لا تتبع النظرة النظرة، فإن لك الأولى وليست لك الآخرة"',
        dailyExamples: [
            "التحديق في النساء/الرجال في الشوارع أو المواصلات.",
            "متابعة حسابات على تيك توك أو انستجرام تعرض محتوى غير لائق.",
            "مشاهدة الإعلانات أو المشاهد التي تحتوي على عري في الأفلام.",
            "تتبع عورات الناس وصورهم الشخصية على الإنترنت.",
            "إدامة النظر في 'التريندات' التي تعتمد على الإثارة."
        ],
        stories: [
            "قصة جرير بن عبد الله: سألت رسول الله ﷺ عن نظر الفجأة؟ فأمرني أن أصرف بصري.",
            "دخل رجل على عثمان بن عفان رضي الله عنه، وكان الرجل قد نظر لامرأة في الطريق، فقال له عثمان: 'يدخل أحدكم وعلي عينيه أثر الزنا!' فقال الرجل: أوحيٌ بعد رسول الله؟ قال عثمان: 'لا، ولكن فراسة صادقة'."
        ]
    },
    'cursing': {
        title: 'السب واللعن',
        def: 'التلفظ بالكلام الفاحش، أو الطعن في الأنساب، أو لعن الأشخاص والدواب. ليس المؤمن بالطعان ولا اللعان.',
        quran: 'وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ ۚ إِنَّ الشَّيْطَانَ يَنزَغُ بَيْنَهُمْ',
        hadith: 'قال ﷺ: "ليس المؤمن بالطعان، ولا اللعان، ولا الفاحش، ولا البذيء"',
        dailyExamples: [
            "شتم السائقين أو السيارات في الزحام.",
            "استخدام ألفاظ بذيئة 'على سبيل المزاح' مع الأصدقاء (تعتبر فاحشاً).",
            "لعن 'اليوم' أو 'الساعة' أو 'الظروف' عند الغضب.",
            "التعليق بتعليقات مسيئة وشتائم في السوشيال ميديا.",
            "مناداة الأصدقاء بأسماء قبيحة أو مهينة."
        ],
        stories: [
            "شتم رجلٌ أبا بكر الصديق رضي الله عنه في مجلس النبي ﷺ، فصمت أبو بكر، ثم شتمه الثانية فصمت، ثم شتمه الثالثة فانتصر أبو بكر لنفسه (رد عليه)، فقام النبي ﷺ وترك المجلس. لما سأله أبو بكر قال: 'نزل ملك من السماء يكذب بما قال لك، فلما انتصرت وقع الشيطان، فلم أكن لأجلس إذ وقع الشيطان'.",
            "لعنت امرأة ناقة لها وهي تسير مع النبي ﷺ، فقال النبي: 'خذوا ما عليها ودعوها فإنها ملعونة' (أي لا تصاحبنا ناقة ملعونة في طريقنا)."
        ]
    }
};

// =========================================
//  دوال التحكم في المودال المطور
// =========================================

// دالة لجلب مثال يومي ثابت (يعتمد على تاريخ اليوم)
function getDailyExample(examplesArray) {
    if (!examplesArray || examplesArray.length === 0) return "";
    
    // نستخدم تاريخ اليوم كرقم لضمان ثبات المثال طول اليوم
    const today = getZeftaNow();
    // معادلة بسيطة: (يوم + شهر + سنة) % عدد الأمثلة
    const dateCode = today.getDate() + today.getMonth() + today.getFullYear(); 
    const index = dateCode % examplesArray.length;
    
    return examplesArray[index];
}

// دالة فتح المودال وتعبئة البيانات
// دالة فتح المودال وتعبئة البيانات (مع ميزة تقليب القصص)
window.openWarning = function(type) {
    const data = warningsData[type];
    if (!data) return;

    // 1. تعبئة العناوين والنصوص الأساسية
    let _el;
    if ((_el = document.getElementById('warning-modal-title'))) _el.textContent = data.title;
    if ((_el = document.getElementById('warning-def'))) _el.textContent = data.def;
    if ((_el = document.getElementById('warning-quran'))) _el.textContent = data.quran;
    if ((_el = document.getElementById('warning-hadith'))) _el.textContent = data.hadith;
    
    // 2. تعبئة المثال اليومي (كما هو)
    const dailyEx = getDailyExample(data.dailyExamples);
    if ((_el = document.getElementById('warning-daily-example'))) _el.textContent = `"${dailyEx}"`;

    // 3. إعداد قسم القصة (Logic الجديد)
    const storyContent = document.getElementById('warning-story-content');
    const storyText = document.getElementById('story-text');
    const btnStory = document.getElementById('btn-show-story');
    if (!storyContent || !storyText || !btnStory) return;

    // إعادة تعيين الحالة عند فتح المودال
    storyContent.classList.add('hidden'); 
    storyText.textContent = "";
    storyText.style.opacity = "1"; // تأكد أن النص ظاهر
    btnStory.innerHTML = '<i class="fa-solid fa-book-open"></i> اقرأ قصة من السيرة'; // إعادة النص الأصلي للزر

    // متغير لتتبع القصة الحالية (يبدأ من 0)
    let currentStoryIndex = 0;

    // برمجة الزر للتقليب
    btnStory.onclick = function() {
        // الحالة الأولى: لو القصة مخفية، أظهرها واعرض القصة رقم 0
        if (storyContent.classList.contains('hidden')) {
            storyContent.classList.remove('hidden');
            storyText.textContent = data.stories[currentStoryIndex];
            
            // تغيير نص الزر ليشجع على القراءة المزيد
            btnStory.innerHTML = '<i class="fa-solid fa-rotate"></i> قصة أخرى';
        } 
        // الحالة الثانية: القصة معروضة، اقلب على اللي بعدها
        else {
            // زود العداد
            currentStoryIndex++;
            
            // لو العداد عدى عدد القصص، ارجع للأول (Loop)
            if (currentStoryIndex >= data.stories.length) {
                currentStoryIndex = 0;
            }

            // تأثير اختفاء وظهور بسيط (Fade Out/In)
            storyText.style.opacity = "0"; // اخفي النص القديم
            
            setTimeout(() => {
                storyText.textContent = data.stories[currentStoryIndex]; // غير النص
                storyText.style.opacity = "1"; // اظهر النص الجديد
            }, 300); // انتظر 0.3 ثانية (نفس مدة الـ transition في CSS)
        }
    };

    // إظهار المودال
    document.getElementById('warning-modal').classList.remove('hidden');
};

// إغلاق المودال
document.getElementById('close-warning-modal')?.addEventListener('click', () => {
    document.getElementById('warning-modal').classList.add('hidden');
});

    // (closeWarningBtn listener already set above via optional chaining)

    window.addEventListener('click', (e) => {
        if (e.target === warningModal) {
            warningModal.classList.add('hidden');
        }
    });


    // =========================================
//  نظام التحليلات والرسوم البيانية (Analytics)
// =========================================

let lineChartInstance = null;
let radarChartInstance = null;

// دالة التمرير للقسم
function scrollToAnalytics() {
    const section = document.getElementById('analytics-section');
    if(section) {
        section.scrollIntoView({ behavior: 'smooth' });
        updateCharts('week'); // تشغيل الافتراضي (أسبوعي)
    }
}

// الدالة الرئيسية لتحديث البيانات
// --- تحديث الشارتات والبيانات ---
function updateCharts(period) {
    // 1. تحديث الأزرار
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.filter-btn[onclick="updateCharts('${period}')"]`);
    if(activeBtn) activeBtn.classList.add('active');

    // 2. تحديد النطاق الزمني
    const daysCount = period === 'week' ? 7 : 30;
    
    // 3. جلب البيانات
    const historyData = getHistoryData(daysCount);
    
    // 4. تحديث "نسبة الإنجاز" العلوية لتعكس متوسط الفترة وليس اليوم
    if(document.getElementById('period-score')) {
        // نستخدم المتوسط المحسوب من دالة getHistoryData
        document.getElementById('period-score').textContent = historyData.averageScore + '%';
        
        // تلوين النسبة
        const scoreEl = document.getElementById('period-score');
        if(historyData.averageScore >= 80) scoreEl.style.color = '#10b981';
        else if(historyData.averageScore >= 50) scoreEl.style.color = '#eab308';
        else scoreEl.style.color = '#ef4444';
    }
    
    if(document.getElementById('best-day'))
        document.getElementById('best-day').textContent = historyData.bestDay;
    
    if(document.getElementById('perfect-days'))
        document.getElementById('perfect-days').textContent = historyData.perfectDays;

    // 5. رسم الشارتات
    renderLineChart(historyData.labels, historyData.scores);
    renderRadarChart(historyData.radarData);
    updateHabitsLists(historyData.radarData);

    // 6. رسم جدول التفاصيل اليومي (مع الترتيب الجديد)
    renderAnalyticsTable(historyData.dailyDetails);

    // 7. بناء جداول الأرشيف (جديد)
    buildArchives();
}

// --- تحديث قوائم القوة والضعف (3 عناصر) ---
function updateHabitsLists(stats) {
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    
    const topList = document.getElementById('top-habits-list');
    const lowList = document.getElementById('low-habits-list');
    
    if (topList) topList.innerHTML = '';
    if (lowList) lowList.innerHTML = '';

    const validStats = sorted.filter(item => !isNaN(item[1]));

    if (validStats.length === 0) {
        if(topList) topList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        if(lowList) lowList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        return;
    }

    // تعديل: عرض 3 عناصر بدلاً من 2
    validStats.slice(0, 3).forEach(([name, score]) => {
        if (topList) topList.innerHTML += `<li>${name} <span style="float:left; color:#10b981; font-weight:bold">${score}%</span></li>`;
    });

    // العادات المقصر فيها (أقل 3)
    const weak = validStats.filter(i => i[1] < 100).reverse().slice(0, 3);
    weak.forEach(([name, score]) => {
        if (lowList) lowList.innerHTML += `<li>${name} <span style="float:left; color:#ef4444; font-weight:bold">${score}%</span></li>`;
    });
}

// دالة جلب البيانات من الذاكرة وتحليلها
function getHistoryData(days) {
    let labels = [];
    let scores = [];
    let totalScoreSum = 0;
    let daysWithData = 0;
    let perfectDays = 0;
    let maxScore = -1;
    let bestDayName = '-';

    // مصفوفة جديدة لتخزين تفاصيل كل يوم للجدول
    let dailyDetails = []; 

    let habitsTotals = {
        'الصلوات': [], 'القرآن': [], 'الأذكار': [], 'السنن': [], 'قيام الليل': []
    };

    // التكرار من الماضي لليوم
    for (let i = days - 1; i >= 0; i--) {
        const d = getZeftaNow();
        d.setDate(d.getDate() - i);
        
        const key = getStorageKey(d); 
        const savedJSON = localStorage.getItem(key);
        
        const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
        const dayNum = d.toLocaleDateString('ar-EG', { day: 'numeric' });
        const fullDate = `${dayName} ${dayNum}`;
        labels.push(fullDate);

        // كائن لتخزين تفاصيل اليوم الحالي
        let dayStats = {
            date: fullDate,
            total: 0,
            cats: { 'الصلوات': '-', 'القرآن': '-', 'الأذكار': '-', 'السنن': '-', 'قيام الليل': '-' }
        };

        if (savedJSON) {
            const data = JSON.parse(savedJSON);
            
            if (data.stats) {
                const score = data.stats.totalScore || 0;
                scores.push(score);
                dayStats.total = score; // تخزين المجموع للجدول

                totalScoreSum += score;
                daysWithData++;

                if (score > maxScore) { maxScore = score; bestDayName = dayName; }
                if (score >= 95) perfectDays++;

                // تفاصيل التصنيفات
                const bd = data.stats.breakdown;
                if (bd) {
                    for (const [cat, val] of Object.entries(bd)) {
                        // val = [achieved, total]
                        const perc = val[1] === 0 ? 0 : Math.round((val[0] / val[1]) * 100);
                        if (habitsTotals[cat]) habitsTotals[cat].push(perc);
                        
                        // تخزين النسبة للجدول
                        dayStats.cats[cat] = perc + '%';
                    }
                }
            } else {
                scores.push(0);
            }
        } else {
            scores.push(0);
        }
        // إضافة اليوم لقائمة التفاصيل
        dailyDetails.push(dayStats);
    }

    // حساب متوسط الرادار
    let radarAverages = {};
    for (const [cat, arr] of Object.entries(habitsTotals)) {
        const sum = arr.reduce((a, b) => a + b, 0);
        const count = arr.length || 1;
        radarAverages[cat] = arr.length > 0 ? Math.round(sum / count) : 0;
    }

    const avg = daysWithData > 0 ? Math.round(totalScoreSum / daysWithData) : 0;

    return {
        labels: labels,
        scores: scores,
        averageScore: avg,
        bestDay: bestDayName,
        perfectDays: perfectDays,
        radarData: radarAverages,
        dailyDetails: dailyDetails // <-- ده الجزء الجديد المهم
    };
}

// --- دالة رسم جدول التفاصيل ---
function renderAnalyticsTable(details) {
    const tbody = document.getElementById('analytics-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // ترتيب: الأحدث أولاً
    // (details تأتي جاهزة من getHistoryData، لكن نتأكد من الترتيب)
    // ملاحظة: getHistoryData ترجع 7 أو 30 يوم، هنا نريد الجدول يعرض كل شيء لو في التبويب اليومي
    // لذا سنستخدم getAllHistoryData بدلاً من details القادمة من الشارت إذا أردنا عرض كل الأرشيف
    
    // سنعيد جلب كل البيانات لضمان شمولية الجدول في التبويب الخاص به
    const allData = getAllHistoryData().reverse(); // الأحدث فوق

    if (allData.length === 0) {
         tbody.innerHTML = '<tr><td colspan="8">لا توجد سجلات</td></tr>';
         return;
    }

    allData.forEach(day => {
        // day.breakdown قد تكون undefined في البيانات القديمة
        const cats = day.breakdown || {};
        const getPerc = (arr) => arr ? Math.round((arr[0]/arr[1])*100) + '%' : '-';
        
        // استخراج اسم اليوم
        const dayName = day.dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
        const dateStr = day.dateObj.toLocaleDateString('ar-EG'); // التاريخ فقط

        const row = document.createElement('tr');
        const totalColor = day.score >= 80 ? '#10b981' : day.score >= 50 ? '#eab308' : '#ef4444';

        row.innerHTML = `
            <td>${dateStr}</td>
            <td style="color:var(--text-secondary)">${dayName}</td>
            <td style="color: ${totalColor}; font-weight:bold">${day.score}%</td>
            <td>${getPerc(cats['الصلوات'])}</td>
            <td>${getPerc(cats['القرآن'])}</td>
            <td>${getPerc(cats['الأذكار'])}</td>
            <td>${getPerc(cats['السنن'])}</td>
            <td>${getPerc(cats['قيام الليل'])}</td>
        `;
        tbody.appendChild(row);
    });
}

// رسم الخط البياني (Line Chart)
// رسم الخط البياني (Line Chart) مع إصلاح الحجم
function renderLineChart(labels, data) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    // --- بداية الإصلاح: إنشاء حاوية مرنة للشارت ---
    // نتأكد إننا لم نقم بإضافة الحاوية من قبل
    if (!canvas.parentElement.classList.contains('chart-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('chart-wrapper');
        // نضع الحاوية مكان الكانفاس، ثم نضع الكانفاس داخلها
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }
    // -------------------------------------------

    if (lineChartInstance) lineChartInstance.destroy();

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#4f46e5';

    lineChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'نسبة الإنجاز',
                data: data,
                borderColor: accentColor,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: document.body.classList.contains('dark') ? '#fff' : accentColor,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // مهم: يسمح للشارت بملء الحاوية المرنة الجديدة
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7 // تقليل عدد التواريخ لمنع الزحام
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// رسم الرادار (Radar Chart) مع إصلاح الحجم
function renderRadarChart(stats) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;

    // --- بداية الإصلاح: إنشاء حاوية مرنة للشارت ---
    if (!canvas.parentElement.classList.contains('chart-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('chart-wrapper');
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }
    // -------------------------------------------

    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.keys(stats),
            datasets: [{
                label: 'مستوى الالتزام',
                data: Object.values(stats),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                pointBackgroundColor: '#10b981',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // مهم جداً
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                    pointLabels: {
                        font: { size: 12, family: 'Tajawal' },
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// تحديث القوائم النصية


// تفعيل زر تحميل التقرير
const dlAnalyticsBtn = document.getElementById('download-analytics-btn');
if (dlAnalyticsBtn) {
    dlAnalyticsBtn.addEventListener('click', () => {
        const element = document.getElementById('analytics-section');
        // نحتاج لتغيير حجم الشارت مؤقتاً ليظهر كاملاً في الـ PDF
        
        const opt = {
            margin: [0.5, 0.5],
            filename: `تقرير_أداء_${getZeftaNow().toLocaleDateString('ar-EG').replace(/\//g,'-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        const originalText = dlAnalyticsBtn.innerHTML;
        dlAnalyticsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
        
        html2pdf().set(opt).from(element).save().then(() => {
            dlAnalyticsBtn.innerHTML = originalText;
        });
    });
}

// --- إعدادات نظام البونص والسنن ---
const sunnahEvents = [
    // 1. الأيام البيض (صيام)
    {
        id: 'white_day_13',
        type: 'hijri',
        day: '13',
        title: 'صيام الأيام البيض (13)',
        desc: 'صيام اليوم الثالث عشر من الشهر الهجري. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً أول الأيام البيض، هل نويت الصيام؟',
        points: 5
    },
    {
        id: 'white_day_14',
        type: 'hijri',
        day: '14',
        title: 'صيام الأيام البيض (14)',
        desc: 'صيام اليوم الرابع عشر. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً منتصف الأيام البيض، ذكر فإن الذكرى تنفع المؤمنين.',
        points: 5
    },
    {
        id: 'white_day_15',
        type: 'hijri',
        day: '15',
        title: 'صيام الأيام البيض (15)',
        desc: 'صيام اليوم الخامس عشر. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً آخر الأيام البيض، لا تفوت الأجر.',
        points: 5
    },
    // 2. سنن أسبوعية (صيام الإثنين والخميس)
    {
        id: 'monday_fast',
        type: 'weekly',
        dayName: 'Monday', // كما يرجع من API
        title: 'صيام الإثنين',
        desc: 'تُعرض الأعمال يوم الإثنين، فاحرص أن يُعرض عملك وأنت صائم.',
        notifyBefore: true, // يظهر التنبيه يوم الأحد
        notifyMsg: 'غداً الإثنين، فرصة لرفع عملك وأنت صائم.',
        points: 5
    },
    {
        id: 'thursday_fast',
        type: 'weekly',
        dayName: 'Thursday',
        title: 'صيام الخميس',
        desc: 'تُعرض الأعمال يوم الخميس، صم لتنال الأجر.',
        notifyBefore: true, // يظهر التنبيه يوم الأربعاء
        notifyMsg: 'غداً الخميس، نية الصيام تجدد الإيمان.',
        points: 5
    },
    // 3. يوم الجمعة
    {
        id: 'friday_kahf',
        type: 'weekly',
        dayName: 'Friday',
        title: 'سنن الجمعة',
        desc: 'قراءة سورة الكهف، الصلاة على النبي، ساعة الاستجابة.',
        notifyBefore: true,
        notifyMsg: 'غداً الجمعة، جهز قلبك لسورة الكهف والصلاة على الحبيب.',
        points: 5
    }
];

// --- الدالة الرئيسية للتحكم في السُّنن ---
function handleSunnahSystem(hijriData, gregorianData) {
    const hijriDay = hijriData.day; // رقم اليوم الهجري (مثلاً "13")
    const weekDay = gregorianData.weekday.en; // اسم اليوم (مثلاً "Monday")

    // 1. فحص بونص "اليوم" (لإظهار الكارت)
    const todayBonus = sunnahEvents.find(e => {
        if (e.type === 'hijri' && e.day === hijriDay) return true;
        if (e.type === 'weekly' && e.dayName === weekDay) return true;
        return false;
    });
    
    // رسم كارت البونص
    renderBonusSection(todayBonus);

    // 2. فحص تنبيه "الغد" (لإظهار الجرس)
    // نحسب ما هو الغد؟
    // ملاحظة: للتبسيط سنعتمد على منطق اليوم التالي للأسبوع، واليوم التالي للهجري
    const nextHijriDay = (parseInt(hijriDay) + 1).toString();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = daysOfWeek.indexOf(weekDay);
    const nextDayName = daysOfWeek[(currentDayIndex + 1) % 7];

    const tomorrowNotification = sunnahEvents.find(e => {
        if (!e.notifyBefore) return false;
        if (e.type === 'hijri' && e.day === nextHijriDay) return true;
        if (e.type === 'weekly' && e.dayName === nextDayName) return true;
        return false;
    });

    // تشغيل التنبيه
    renderNotification(tomorrowNotification);
}

// --- رسم قسم البونص ---
function renderBonusSection(bonus) {
    const section = document.getElementById('bonus-section');
    if (!bonus) {
        if(section) section.classList.add('hidden');
        return;
    }

    if(section) {
        section.classList.remove('hidden');
        document.getElementById('bonus-title').textContent = bonus.title;
        document.getElementById('bonus-desc').textContent = bonus.desc;
        
        const btn = document.getElementById('bonus-action-btn');
        btn.setAttribute('data-points', bonus.points);
        btn.setAttribute('data-bonus-id', bonus.id);

        // التحقق من الحفظ السابق
        const key = getStorageKey(currentDate);
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (savedData.bonus && savedData.bonus.id === bonus.id && savedData.bonus.done) {
            btn.classList.add('active');
            btn.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${bonus.points}+)`;
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `إتمام (${bonus.points} نقاط)`;
        }
    }
}

// --- تشغيل التنبيهات (الجرس) ---

    // --- دوال التحكم في الـ UI الخاص بالبونص والتنبيهات ---

    // 1. تفعيل زر البونص عند الضغط
    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusBtn) {
        bonusBtn.addEventListener('click', function(e) {
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                const pts = this.getAttribute('data-points');
                this.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${pts}+)`;
                if (typeof fireCelebration === 'function') fireCelebration(e);
            } else {
                const pts = this.getAttribute('data-points');
                this.innerHTML = `إتمام (${pts} نقاط)`;
            }
            saveData(); // حفظ البيانات وتحديث النقاط
        });
    }

    // 2. تفعيل فتح/غلق قائمة التنبيهات
    const notifBtn = document.getElementById('notification-btn');
    const notifPopup = document.getElementById('notification-popup');
    const closeNotif = document.getElementById('close-notif'); // تأكدنا من وجود زر الإغلاق

    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifPopup) notifPopup.classList.toggle('hidden');
            
            // إخفاء العلامة الحمراء عند الفتح
            const badge = document.getElementById('notif-badge');
            if (badge) badge.classList.add('hidden'); 
        });
    }

    if (closeNotif) {
        closeNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifPopup) notifPopup.classList.add('hidden');
        });
    }

    // إغلاق القائمة عند الضغط في الخارج
    window.addEventListener('click', (e) => {
        if (notifPopup && !notifPopup.classList.contains('hidden') && notifBtn && !notifBtn.contains(e.target)) {
            notifPopup.classList.add('hidden');
        }
    });

    // --- تحديث دالة renderNotification ---
    // (استبدل الدالة القديمة بهذه الدالة لتضمن ظهور الزر والرسالة الافتراضية)
    function renderNotification(notif) {
        const notifBtn = document.getElementById('notification-btn');
        const badge = document.getElementById('notif-badge');
        const popupContent = document.getElementById('notif-content');

        if (!notifBtn) return;

        // 1. إظهار الزر دائماً (تأكيد)
        notifBtn.classList.remove('hidden');

        if (notif) {
            // حالة وجود تنبيه
            if (badge) badge.classList.remove('hidden'); // إظهار النقطة الحمراء
            if (popupContent) popupContent.innerHTML = `<p style="color: var(--accent-color); font-weight:bold;">${notif.notifyMsg}</p>`;
        } else {
            // حالة عدم وجود تنبيه
            if (badge) badge.classList.add('hidden'); // إخفاء النقطة الحمراء
            if (popupContent) popupContent.innerHTML = '<p style="color: var(--text-secondary);">لا توجد عبادات موسمية خاصة غداً.</p>';
        }
    }

    // --- دالة تحميل التقارير المنفصلة ---
// =========================================
//  Advanced PDF Report Generation
// =========================================

async function downloadReport(period) {
    const originalBtnText = period === 'week' ? 'تحميل التقرير أسبوعي' : 'تحميل التقرير شهري';
    const btn = document.querySelector(`button[onclick="downloadReport('${period}')"]`);
    
    if(btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحضير...';

    const daysCount = period === 'week' ? 7 : 30;
    const historyData = getHistoryData(daysCount);
    
    const today = getZeftaNow();
    const startDate = getZeftaNow();
    startDate.setDate(today.getDate() - daysCount);
    const dateStr = `${startDate.toLocaleDateString('ar-EG')} - ${today.toLocaleDateString('ar-EG')}`;
    const periodTitle = period === 'week' ? 'التقرير الأسبوعي المفصل' : 'التقرير الشهري الشامل';

    // تعبئة البيانات الأساسية
    let _el2;
    if ((_el2 = document.getElementById('pdf-period-text'))) _el2.textContent = `${periodTitle} | ${dateStr}`;
    const scoreCircle = document.getElementById('pdf-total-score');
    if (scoreCircle) {
        scoreCircle.textContent = historyData.averageScore + '%';
        scoreCircle.style.background = historyData.averageScore >= 80 ? '#10b981' : historyData.averageScore >= 50 ? '#eab308' : '#ef4444';
    }

    if ((_el2 = document.getElementById('pdf-perfect-days'))) _el2.textContent = historyData.perfectDays;
    if ((_el2 = document.getElementById('pdf-best-day'))) _el2.textContent = historyData.bestDay;
    
    // نسب عامة
    const prayerAvg = historyData.radarData['الصلوات'] || 0;
    const quranAvg = historyData.radarData['القرآن'] || 0;
    if ((_el2 = document.getElementById('pdf-prayer-avg'))) _el2.textContent = prayerAvg + '%';
    if ((_el2 = document.getElementById('pdf-quran-avg'))) _el2.textContent = quranAvg + '%';
    if ((_el2 = document.getElementById('pdf-generated-date'))) _el2.textContent = `تاريخ الإصدار: ${getZeftaNow().toLocaleString('ar-EG')}`;

    // تحويل الشارتات لصور
    const lineCanvas = document.getElementById('progressChart');
    const radarCanvas = document.getElementById('distributionChart');
    if (lineCanvas) document.getElementById('pdf-chart-line').src = lineCanvas.toDataURL("image/png");
    if (radarCanvas) document.getElementById('pdf-chart-radar').src = radarCanvas.toDataURL("image/png");

    // === بناء الجدول التفصيلي (الجزء المهم) ===
    const tbody = document.getElementById('pdf-daily-rows');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    // تعديل هيدر الجدول (يجب أن يكون في HTML، لكن يمكننا تعديله هنا برمجياً لضمان التنسيق)
    const tableHead = document.querySelector('.pdf-table thead tr');
    if(tableHead) {
        tableHead.innerHTML = `
            <th width="15%">التاريخ</th>
            <th width="10%">اليوم</th>
            <th width="10%">النسبة</th>
            <th width="40%">تفاصيل العبادات</th>
            <th width="25%">ملاحظاتك</th>
        `;
    }

    for (let i = 0; i < daysCount; i++) {
        const d = getZeftaNow();
        d.setDate(d.getDate() - i);
        const key = getStorageKey(d);
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        
        const dayDate = d.toLocaleDateString('ar-EG');
        const dayName = d.toLocaleDateString('ar-EG', { weekday: 'long' });
        const score = savedData.stats ? savedData.stats.totalScore : 0;
        
        // 1. جلب الملاحظات
        const note = savedData.note ? savedData.note : '<span style="color:#ccc">لا توجد ملاحظات</span>';

        // 2. بناء تفاصيل العبادات
        let detailsHTML = '<div style="display:flex; flex-wrap:wrap; gap:5px;">';
        
        if (savedData.stats && savedData.stats.breakdown) {
            const cats = savedData.stats.breakdown;
            // cats = { 'الصلوات': [المنجز, الكلي], 'القرآن': [المنجز, الكلي] ... }

            for (const [category, values] of Object.entries(cats)) {
                // values[0] = النقاط المحققة، values[1] = النقاط الكلية
                const achieved = values[0];
                const total = values[1];
                
                if (total > 0) {
                    const perc = Math.round((achieved / total) * 100);
                    let colorClass = 'missed'; // أحمر افتراضياً
                    if (perc === 100) colorClass = 'full'; // أخضر
                    else if (perc >= 50) colorClass = 'half'; // أصفر
                    
                    // تنسيق الـ HTML لكل عبادة
                    // مثال: الصلوات: 100%
                    detailsHTML += `
                        <span class="detail-tag ${colorClass}">
                            ${category}: ${perc}%
                        </span>
                    `;
                }
            }
            
            // إضافة البونص إذا وجد
            if (savedData.bonus && savedData.bonus.done) {
                detailsHTML += `<span class="detail-tag bonus">بونص (+${savedData.bonus.points})</span>`;
            }

        } else {
            detailsHTML += '<span style="color:#ccc; font-size:10px;">لا توجد بيانات</span>';
        }
        detailsHTML += '</div>';

        // لون النسبة العامة
        const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#eab308' : '#ef4444';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dayDate}</td>
            <td>${dayName}</td>
            <td style="font-weight:bold; color:${scoreColor}; font-size:14px;">${score}%</td>
            <td>${detailsHTML}</td>
            <td style="font-size:11px; color:#555; white-space: pre-wrap;">${note}</td>
        `;
        tbody.appendChild(tr);
    }

    // تجهيز الـ PDF
    const container = document.getElementById('report-template-container');
    const element = document.getElementById('pdf-content');
    if (!container || !element) { if(btn) btn.innerHTML = originalBtnText; return; }
    container.style.opacity = '1'; 

    const opt = {
        margin: [0.3, 0.3],
        filename: `تقرير_${period}_${getZeftaNow().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Error:", err);
        alert("حدث خطأ أثناء التصدير.");
    } finally {
        container.style.opacity = '0';
        if(btn) btn.innerHTML = originalBtnText;
    }
}

// --- دوال بناء الأرشيف (أسابيع وشهور) ---

function buildArchives() {
    const allData = getAllHistoryData(); // دالة مساعدة لجلب كل شيء
    renderWeeklyArchive(allData);
    renderMonthlyArchive(allData);
}

// جلب كل البيانات من الذاكرة
function getAllHistoryData() {
    let history = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('mohasba_data_')) {
            const dateStr = key.replace('mohasba_data_', ''); // YYYY-M-D
            const rawData = JSON.parse(localStorage.getItem(key));
            
            if (rawData.stats) {
                // تحويل التاريخ لكائن Date صحيح
                const parts = dateStr.split('-');
                const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                
                history.push({
                    dateObj: dateObj,
                    dateStr: dateStr,
                    score: rawData.stats.totalScore || 0,
                    breakdown: rawData.stats.breakdown
                });
            }
        }
    }
    // ترتيب زمني من الأقدم للأحدث
    return history.sort((a, b) => a.dateObj - b.dateObj);
}

function renderWeeklyArchive(allData) {
    const tbody = document.getElementById('weekly-archive-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 1. تجميع البيانات حسب "مفتاح الجمعة"
    let weeksMap = {};

    allData.forEach(entry => {
        const fridayDate = getFridayStart(entry.dateObj);
        // مفتاح فريد للأسبوع (تاريخ الجمعة)
        const weekKey = `${fridayDate.getFullYear()}-${fridayDate.getMonth()}-${fridayDate.getDate()}`;

        if (!weeksMap[weekKey]) {
            weeksMap[weekKey] = {
                startDate: fridayDate,
                scores: [],
                details: []
            };
        }
        weeksMap[weekKey].scores.push(entry.score);
        weeksMap[weekKey].details.push(entry);
    });

    // 2. تحويل الماب لمصفوفة وترتيبها (الأحدث أولاً)
    const sortedWeeks = Object.values(weeksMap).sort((a, b) => b.startDate - a.startDate);

    // 3. الرسم
    if (sortedWeeks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">لا توجد بيانات مسجلة بعد</td></tr>';
        return;
    }

    sortedWeeks.forEach(weekData => {
        // حساب المتوسط الحقيقي لكل الأيام المسجلة في هذا الأسبوع
        const avg = Math.round(weekData.scores.reduce((a, b) => a + b, 0) / weekData.scores.length);
        
        // التواريخ (من الجمعة إلى الخميس)
        const endDate = new Date(weekData.startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = `${weekData.startDate.getDate()}/${weekData.startDate.getMonth()+1}`;
        const endStr = `${endDate.getDate()}/${endDate.getMonth()+1}`;
        
        // الاسم الجميل (الأسبوع الأول من ...)
        // نأخذ تاريخ الجمعة كمرجع للاسم
        const labelName = getWeekLabelName(weekData.startDate);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:bold; color:var(--text-primary)">${labelName}</td>
            <td style="font-size:0.9rem; color:var(--text-secondary)">${startStr} - ${endStr}</td>
            <td>
                <span style="font-weight:bold; color: ${avg>=80?'#10b981':avg>=50?'#eab308':'#ef4444'}">${avg}%</span>
            </td>
            <td>${avg>=90 ? 'ممتاز 🌟' : avg>=75 ? 'جيد جداً' : avg>=50 ? 'جيد' : 'ضعيف'}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderMonthlyArchive(allData) {
    const tbody = document.getElementById('monthly-archive-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // تجميع بالشهر
    let monthsMap = {};
    allData.forEach(entry => {
        const monthKey = `${entry.dateObj.getFullYear()}-${entry.dateObj.getMonth()}`;
        if (!monthsMap[monthKey]) {
            monthsMap[monthKey] = {
                dateObj: entry.dateObj, // نحفظ أي تاريخ من الشهر لاستخراج الاسم
                scores: []
            };
        }
        monthsMap[monthKey].scores.push(entry.score);
    });

    const sortedMonths = Object.values(monthsMap).sort((a, b) => b.dateObj - a.dateObj);

    if (sortedMonths.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">لا توجد بيانات مسجلة بعد</td></tr>';
        return;
    }

    sortedMonths.forEach(m => {
        const avg = Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length);
        const monthName = m.dateObj.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:bold">${monthName}</td>
            <td style="font-weight:bold; color: ${avg>=80?'#10b981':avg>=50?'#eab308':'#ef4444'}">${avg}%</td>
            <td>${avg>=90 ? 'ممتاز' : avg>=50 ? 'جيد' : 'ضعيف'}</td>
        `;
        tbody.appendChild(row);
    });
}

window.switchTab = function(tabName) {
    // 1. Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // نحتاج لتحديد الزر الذي تم ضغطه (يمكن تمريره أو البحث عنه)
    const clickedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabName));
    if(clickedBtn) clickedBtn.classList.add('active');

    // 2. Show Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) tabEl.classList.add('active');

    // 3. Refresh data if needed (خاصة الجداول)
    if(tabName === 'weekly' || tabName === 'monthly' || tabName === 'daily') {
        buildArchives(); // إعادة بناء الجداول للتأكد من التحديث
    }
}

function getWeekLabelName(dateObj) {
    const day = dateObj.getDate();
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const month = monthNames[dateObj.getMonth()];
    
    // تقسيم تقريبي: 1-7 (أول)، 8-14 (ثاني)، 15-21 (ثالث)، 22+ (رابع)
    let weekNum = Math.ceil(day / 7);
    if (weekNum > 4) weekNum = 4; // ما زاد عن ذلك نضمه للرابع أو نسميه الأخير
    
    const ordinals = ["الأول", "الثاني", "الثالث", "الرابع"];
    return `الأسبوع ${ordinals[weekNum - 1]} من ${month}`;
}

function getFridayStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) ... 5 (Fri) ... 6 (Sat)
    // المعادلة: نريد العودة للوراء حتى نصل ليوم 5 (الجمعة)
    // الجمعة (5) -> الفرق 0
    // السبت (6) -> الفرق 1
    // الأحد (0) -> الفرق 2 (نحتاج (0 + 2) % 7 لضبط الحساب)
    
    let diff = (day + 2) % 7; 
    // تفصيل:
    // Fri(5): (5+2)%7 = 0 (يومنا هذا)
    // Sat(6): (6+2)%7 = 1 (نرجع يوم)
    // Sun(0): (0+2)%7 = 2 (نرجع يومين)
    // ...
    // Thu(4): (4+2)%7 = 6 (نرجع 6 أيام)

    const friday = new Date(d);
    friday.setDate(d.getDate() - diff);
    friday.setHours(0, 0, 0, 0);
    return friday;
}
// --- Init ---
    updateDateDisplay();
    renderDualCalendar(); // <-- ضع هذا السطر
    loadData();



    // --- تشغيل زر الإعدادات ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 1. ملء الحقول بالبيانات الحالية
            document.getElementById('setup-name').value = userProfile.name || '';
            document.getElementById('setup-gender').value = userProfile.gender || 'male';
            document.getElementById('setup-quran-goal').value = userProfile.quranGoal || '';

            document.getElementById('setup-level').value = userProfile.level || '3';

            // 2. تفعيل زر الحفظ فوراً (لأن البيانات موجودة)
            checkSetupValidity();

            // 3. فتح المودال
            document.getElementById('setup-modal').classList.remove('hidden');
        });
    }
// --- حل مشكلة الأزرار (تعريف الدوال لتراها HTML) ---
    window.updateCharts = updateCharts;
    window.downloadReport = downloadReport;
    window.openWarning = openWarning; // بالمرة عشان زرار التحذيرات يشتغل
    window.openAdhkar = openAdhkar;   // وعشان زرار الأذكار يشتغل
    window.scrollToAnalytics = scrollToAnalytics;

    // --- تعريف المتغيرات والدوال الحيوية للنطاق العام ---
    window.ADHKAR_TYPES = ADHKAR_TYPES;
    window.currentDate = currentDate;
    window.SUNNAH_ITEMS = window.SUNNAH_ITEMS || SUNNAH_ITEMS;
    window.calculateScoreAndSummary = calculateScoreAndSummary;
    window.updateGlobalScore = updateGlobalScore;
    window.saveData = saveData;
    window.saveIbadatData = saveIbadatData;
    window.saveExtras = saveExtras;

    // --- تطبيق تحسينات النقاط (إحياء السُّنة + الصلاة على النبي + الوقت + أذكار مخصصة) ---
    const _origCalcScore = window.calculateScoreAndSummary;
    window.calculateScoreAndSummary = function() {
        const result = _origCalcScore();
        
        // إضافة نقاط إحياء السُّنة
        if (typeof getSunnahScore === 'function') {
            result.summary['السنن'][0] += getSunnahScore();
            result.summary['السنن'][1] += getSunnahMaxPoints();
        }
        // إضافة نقاط الصلاة على النبي ﷺ
        if (typeof getSalawatScore === 'function') {
            result.summary['السنن'][0] += getSalawatScore();
            result.summary['السنن'][1] += getSalawatMaxPoints();
        }
        // إضافة نقاط الوقت المقضي
        if (typeof getTimePoints === 'function') {
            result.summary['السنن'][0] += getTimePoints();
            result.summary['السنن'][1] += getTimeMaxPoints();
        }
        // إضافة نقاط الأذكار والنوافل المخصصة
        if (typeof getCustomAdhkarScore === 'function') {
            result.summary['الأذكار'][0] += getCustomAdhkarScore();
            result.summary['الأذكار'][1] += getCustomAdhkarMaxPoints();
        }
        
        // إعادة حساب النسبة
        let totalPts = 0, maxPts = 0;
        for (const key in result.summary) {
            totalPts += result.summary[key][0];
            maxPts += result.summary[key][1];
        }
        result.percentage = maxPts === 0 ? 0 : Math.round((totalPts / maxPts) * 100);
        return result;
    };
    // استبدال الدالة المحلية بالنسخة المحسّنة
    calculateScoreAndSummary = window.calculateScoreAndSummary;

    // --- تطبيق تحديث واجهة النقاط + العضوية ---
    const _origUpdateGlobalScore = window.updateGlobalScore;
    window.updateGlobalScore = function() {
        const result = _origUpdateGlobalScore();
        if (typeof updateTotalPoints === 'function') updateTotalPoints();
        if (typeof updateMembershipPreview === 'function') updateMembershipPreview();
        const streakEl = document.getElementById('streak-days-value');
        if (streakEl) {
            const streakData = JSON.parse(localStorage.getItem('mohasba_streak') || '{"current":0}');
            streakEl.textContent = streakData.current || 0;
        }
        return result;
    };
    updateGlobalScore = window.updateGlobalScore;

    // --- إضافات DOMContentLoaded المفقودة (كانت في listener منفصل وسببت ReferenceError) ---
    loadFastingData();
    updateFastingTodayStatus();
    loadExtraWorships();
    renderStreakDisplay();
    renderGoalsPreview();
    updateSunnahPreview();
    startTimeTracker();
    updateMembershipPreview();
    initAddWorshipModal();
    renderCustomAdhkar();
    renderDailyTodo();
    renderSmartReminders();
    setInterval(renderSmartReminders, 30 * 60 * 1000);
    renderBadgesPreview();
    initNightMode();

    // تشغيل نظام السُّنن (يحتاج بيانات هجرية)
    const todayHijri = kuwaitiCalendar(getZeftaNow());
    const todayGregorian = { weekday: { en: getZeftaNow().toLocaleDateString('en-US', { weekday: 'long' }) } };
    handleSunnahSystem(todayHijri, todayGregorian);

    // تحديث الشاشة الرئيسية بالنقاط الإجمالية والسلسلة والعضوية فور اكتمال التهيئة
    updateGlobalScore();

    // إظهار مودال الإعدادات أول مرة إذا ما فيش بروفايل محفوظ
    if (!userProfile.name) {
        const setupModal = document.getElementById('setup-modal');
        if (setupModal) setupModal.classList.remove('hidden');
    }

    // Service Worker للوضع بدون إنترنت
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker registered for offline mode');
        }).catch(err => {
            console.log('SW registration skipped:', err.message);
        });
    }

    // تأخير بسيط لتشغيل الشارت بعد تحميل المكتبات
    setTimeout(() => { updateCharts('week'); }, 1000);

}); // <--- دي قفلة الـ DOMContentLoaded اللي في آخر الملف عندك

// =========================================
//  نظام المحلل الذكي (محدث ليعمل دائماً)
// =========================================

function runDailyAnalysis(force = false) {
    const todayStr = getZeftaNow().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const lastCheck = localStorage.getItem('last_smart_check_date');
    
    // لو لم يتم الفحص اليوم، أو لو تم إجبار الدالة (للاختبار)
    if (lastCheck !== todayStr || force) {
        
        // 1. تحديد التواريخ
        const yesterday = getZeftaNow();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dayBefore = getZeftaNow();
        dayBefore.setDate(dayBefore.getDate() - 2);

        // جلب البيانات
        const dataYest = getStoredStats(yesterday);
        const dataBefore = getStoredStats(dayBefore);

        let title, body, icon, analysis = [];

        // 2. السيناريوهات المختلفة
        if (!dataYest) {
            // السيناريو 1: المستخدم لم يسجل شيئاً بالأمس (البيانات مفقودة)
            icon = "👋";
            title = "افتقدناك بالأمس!";
            body = "لم نجد سجلاً ليوم أمس. لا بأس، المهم أنك هنا اليوم. جدد النية وابدأ صفحة جديدة قوية.";
        } else {
            // السيناريو 2: توجد بيانات للأمس (نقوم بالمقارنة)
            const scoreYest = dataYest.totalScore || 0;
            const scoreBefore = dataBefore ? (dataBefore.totalScore || 0) : 0;
            const diff = scoreYest - scoreBefore;

            // تحليل التفاصيل
            analysis = analyzeBreakdown(dataYest.breakdown, dataBefore ? dataBefore.breakdown : null);

            if (scoreYest === 0) {
                icon = "😔";
                title = "يومك كان فارغاً!";
                body = "سجلت الدخول أمس لكنك لم تنجز شيئاً (0%). الأيام تمضي، فلا تتركها تسرقك.";
            } else if (diff > 0) {
                icon = "🏆";
                title = `أحسنت! تقدمت بنسبة ${diff}%`;
                body = `أداؤك أمس (${scoreYest}%) كان أفضل من اليوم الذي قبله. ${getRandomMotivation('good')}`;
            } else if (diff < 0) {
                icon = "📉";
                title = `تراجع بسيط (${Math.abs(diff)}%-)`;
                body = `أداؤك أمس (${scoreYest}%) كان أقل من قبله. ${getRandomMotivation('bad')}`;
            } else {
                icon = "⚖️";
                title = "مستواك ثابت";
                body = `حافظت على نفس المستوى (${scoreYest}%). الثبات جيد، لكن المؤمن يطمح للزيادة.`;
            }
        }

        // 3. عرض النافذة والإشعار
        showSmartPopup(icon, title, body, analysis);

        if (!force && ((window.isNativeApp && window.isNativeApp()) || Notification.permission === "granted")) {
            if (window.sendLocalNotification) {
                window.sendLocalNotification(title, body);
            } else {
                new Notification(title, { body: body, icon: 'logo.png', dir: 'rtl' });
            }
        }

        // 4. تسجيل أننا عرضنا التقرير اليوم (عشان ميظهرش تاني لنفس اليوم)
        if (!force) {
            localStorage.setItem('last_smart_check_date', todayStr);
        }
    }
}

// --- دوال مساعدة ---

function getStoredStats(dateObj) {
    const key = getStorageKey(dateObj); // نستخدم دالتك الموجودة مسبقاً
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).stats : null;
}

function analyzeBreakdown(curr, prev) {
    if (!curr) return [];
    if (!prev) prev = { 'الصلوات': [0,0], 'القرآن': [0,0], 'الأذكار': [0,0], 'السنن': [0,0] };

    let details = [];
    
    // الفئات التي نقارنها
    const cats = ['الصلوات', 'القرآن', 'الأذكار', 'السنن', 'قيام الليل'];

    cats.forEach(cat => {
        // نحسب النسبة المئوية لكل فئة
        const getPerc = (obj) => obj && obj[cat] && obj[cat][1] > 0 ? Math.round((obj[cat][0]/obj[cat][1])*100) : 0;
        
        const pCurr = getPerc(curr);
        const pPrev = getPerc(prev);
        const pDiff = pCurr - pPrev;

        if (pDiff > 0) {
            details.push({ cat: cat, change: pDiff, type: 'up' });
        } else if (pDiff < 0) {
            details.push({ cat: cat, change: Math.abs(pDiff), type: 'down' });
        }
    });

    return details;
}

function showSmartPopup(icon, title, body, details) {
    const modal = document.getElementById('smart-report-modal');
    const smartIcon = document.getElementById('smart-icon');
    const smartTitle = document.getElementById('smart-title');
    const smartMessage = document.getElementById('smart-message');
    const detailsContainer = document.getElementById('smart-details');
    if (!modal || !smartIcon || !smartTitle || !smartMessage || !detailsContainer) return;

    smartIcon.textContent = icon;
    smartTitle.textContent = title;
    smartMessage.textContent = body;

    detailsContainer.innerHTML = '';
    detailsContainer.style.display = '';

    if (details.length > 0) {
        detailsContainer.innerHTML = '<div style="margin-bottom:5px; font-weight:bold; color:#555">تفاصيل التغيير:</div>';
        
        details.forEach(item => {
            const row = document.createElement('div');
            row.className = 'trend-item';
            
            let colorClass = item.type === 'up' ? 'trend-up' : 'trend-down';
            let arrow = item.type === 'up' ? '⬆️ تحسن في' : '⬇️ تراجع في';
            
            row.innerHTML = `
                <span style="color:var(--text-primary)">${arrow} ${item.cat}</span>
                <span class="${colorClass}">${item.change}%</span>
            `;
            detailsContainer.appendChild(row);
        });
    } else {
        if (title.includes("ثابت")) {
            detailsContainer.innerHTML = '<p style="text-align:center; color:#888; margin:0;">لا يوجد تغييرات ملحوظة في التفاصيل.</p>';
        } else {
             detailsContainer.style.display = 'none'; // إخفاء لو مفيش تفاصيل
        }
    }

    modal.classList.remove('hidden');
}

function getRandomMotivation(type) {
    const good = [
        "استمر، أحب الأعمال إلى الله أدومها.",
        "من سار على الدرب وصل، زادك الله همة.",
        "اللهم بارك، اجعل يومك هذا خيراً من أمسك.",
        "هذا توفيق من الله، فاشكره يزدك."
    ];
    const bad = [
        "تدارك نفسك، ما زال في الوقت سعة.",
        "لا يغلبنك الشيطان، قم وجدد العهد.",
        "إن الحسنات يذهبن السيئات، استغفر وعوض ما فات.",
        "لكل جواد كبوة، المهم أن تنهض سريعاً."
    ];

    const arr = type === 'good' ? good : bad;
    return arr[Math.floor(Math.random() * arr.length)];
}

// =========================================
//  نظام الجولة التعريفية (Onboarding Tour)
// =========================================

// =========================================
//  نظام الجولة التعريفية الشامل (Driver.js)
// =========================================

// =========================================
//  1. نظام الجولة التعريفية الشامل (Onboarding Tour)
// =========================================

function startAppTour() {
    const driver = window.driver.js.driver;

    // --- تجهيز المسرح للجولة ---
    
    // أ) فتح قائمة الموبايل لكي تظهر الأزرار المخفية
    if (window.innerWidth < 600) {
        const actionIcons = document.getElementById('action-icons');
        if(actionIcons) actionIcons.classList.add('show-mobile');
    }

    // ب) إظهار قسم البونص مؤقتاً للشرح (حتى لو لم يكن هناك بونص اليوم)
    const bonusSection = document.getElementById('bonus-section');
    let wasBonusHidden = false;
    if (bonusSection && bonusSection.classList.contains('hidden')) {
        bonusSection.classList.remove('hidden');
        wasBonusHidden = true;
    }
// ج) تعريف خطوات الجولة
    const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'ابدأ رحلتك',
        nextBtnText: 'التالي',
        prevBtnText: 'السابق',
        progressText: '{{current}} من {{total}}',
        
        // --- تنظيف المسرح وتفعيل التثبيت عند الإغلاق ---
        onDestroyed: () => {
            localStorage.setItem('tour_seen_v2', 'true'); // تسجيل أن المستخدم رأى التحديث الجديد
            
            // تشغيل المحلل الذكي بعد انتهاء الجولة
            setTimeout(() => { if (typeof runDailyAnalysis === 'function') runDailyAnalysis(); }, 2000);
            
            // إغلاق قائمة الموبايل
            if (window.innerWidth < 600) {
                document.getElementById('action-icons')?.classList.remove('show-mobile');
            }
            // إخفاء البونص إذا كان مخفياً أصلاً
            if (typeof wasBonusHidden !== 'undefined' && wasBonusHidden && typeof bonusSection !== 'undefined' && bonusSection) {
                bonusSection.classList.add('hidden');
            }

            // --- التعديل الجديد: إظهار رسالة التثبيت للموبايل بعد انتهاء الجولة بـ 2 ثانية ---
            localStorage.setItem('tour_completed', 'true');
            setTimeout(() => {
                if (typeof deferredPrompt !== 'undefined' && deferredPrompt) {
                    deferredPrompt.prompt();
                } else if (typeof enableInstallButton === 'function') {
                    enableInstallButton();
                }
            }, 2000);
        },

        steps: [
            // 1. التاريخ الهجري
            { 
                element: '#date-toggle-btn', 
                popover: { 
                    title: '📅 التقويم الهجري المدمج', 
                    description: 'تمت إضافة التاريخ الهجري. اضغط هنا للتبديل بين التقويمين ومعرفة الأيام البيض والمواسم الفاضلة.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 2. البونص والعبادات الموسمية
            { 
                element: '#bonus-section', 
                popover: { 
                    title: '⭐ عبادات المواسم (بونص)', 
                    description: 'في الأيام الفاضلة (مثل الإثنين، الخميس، عاشوراء) سيظهر لك هذا القسم تلقائياً مع تنبيه لتغتنم الأجر.', 
                    side: "top", align: 'center' 
                } 
            },
            // 4. تحسينات الأذكار
            { 
                element: '#fajr-card .action-btn',
                popover: { 
                    title: '📿 العدادات وثواب الأعمال', 
                    description: 'داخل الأذكار، أضفنا <b>عداداً تفاعلياً</b>، وستجد <b>علامة استفهام</b> عند الوقوف عليها يظهر لك ثواب هذا الذكر وفضله.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 5. الركن المخصص (السايدبار)
            { 
                element: '#app-sidebar-column', 
                popover: { 
                    title: '📚 ركنك المخصص', 
                    description: 'تم تجميع ركن العبادات، الخواطر، والتحذيرات هنا لسهولة الوصول إليها أثناء متابعة يومك بجانب الصلوات.', 
                    side: "right", align: 'start' 
                } 
            },
            // 6. جدد نواياك والمهلكات (تم دمجهم وتحديث الكلاس لأن القديم تم حذفه)
            { 
                element: '#knowledge-card-sidebar', 
                popover: { 
                    title: '💡 جدد نواياك واحذر المهلكات', 
                    description: 'قسم جديد يجيب عن أسئلتك (لماذا نصلي؟ كيف نخشع؟) مع مقاطع فيديو، بالإضافة للتنبيه من مهلكات القلوب كالغيبة والكذب.', 
                    side: "right", align: 'center' 
                } 
            },
            // 7. الإحصائيات
            { 
                element: '#analytics-btn', 
                popover: { 
                    title: '📊 الإحصائيات والتقدم', 
                    description: 'قسم جديد كلياً! تابع أداءك أسبوعياً وشهرياً، واعرف نقاط قوتك وقصورك لتعالجها بالأرقام.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 8. التنبيهات
            { 
                element: '#notification-btn', 
                popover: { 
                    title: '🔔 التنبيهات الذكية', 
                    description: 'وافق على إذن الإشعارات لنذكرك بعبادات الغد (مثل صيام الخميس) والصلوات في وقتها.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 9. الإعدادات
            { 
                element: '#settings-btn', 
                popover: { 
                    title: '⚙️ خصص تجربتك', 
                    description: 'من هنا حدد: مستواك، أشكال العرض (Grid/Sidebar)، وتغيير ألوان الموقع أو وضع صورة للحرم كخلفية.', 
                    side: "bottom", align: 'start' 
                } 
            }
        ]
    });

    driverObj.drive();
}

// =========================================
//  3. المايسترو (التحكم في بدء التشغيل)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // التحقق مما إذا كان الجهاز موبايل (عرض الشاشة أصغر من أو يساوي 768 بكسل)
    const isMobileDevice = window.innerWidth <= 768;

    // إضافة زر "إعادة الجولة" داخل قائمة الإعدادات (للشاشات الكبيرة فقط)
    const setupModalBody = document.querySelector('#setup-modal .modal-body');
    if(setupModalBody && !document.getElementById('restart-tour-btn') && !isMobileDevice) {
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restart-tour-btn';
        restartBtn.className = 'btn-primary';
        restartBtn.style.cssText = 'margin-top: 1rem; width: 100%; background: #0891b2;';
        restartBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i> تشغيل الجولة التعريفية';
        
        restartBtn.onclick = () => {
            document.getElementById('setup-modal').classList.add('hidden');
            if (typeof startAppTour === 'function') startAppTour();
        };
        setupModalBody.appendChild(restartBtn);
    }

    // --- منطق التشغيل الرئيسي ---
    const tourSeen = localStorage.getItem('tour_seen_v2');
    
    if (!tourSeen) {
        // منع ظهور المحلل الذكي في أول يوم لعدم التشتيت
        const todayStr = getZeftaNow().toLocaleDateString('en-CA');
        localStorage.setItem('last_smart_check_date', todayStr);

        if (isMobileDevice) {
            // الحالة 1 (موبايل): تخطي الجولة نهائياً وتسجيلها كمقروءة
            localStorage.setItem('tour_seen_v2', 'true');
            localStorage.setItem('tour_completed', 'true');
            
            // إظهار رسالة تثبيت التطبيق (PWA) للموبايل بصمت بعد 3 ثوانٍ من فتح الموقع
            setTimeout(() => {
                if (typeof deferredPrompt !== 'undefined' && deferredPrompt) {
                    deferredPrompt.prompt();
                } else if (typeof enableInstallButton === 'function') {
                    enableInstallButton();
                }
            }, 3000);

        } else {
            // الحالة 2 (لابتوب): تشغيل الجولة التعريفية بشكل طبيعي
            setTimeout(() => {
                if (typeof startAppTour === 'function') startAppTour();
            }, 1500);
        }

    } else {
        // الحالة 3: مستخدم قديم (رأى الجولة مسبقاً) -> شغل المحلل الذكي
        setTimeout(() => {
            if (typeof runDailyAnalysis === 'function') runDailyAnalysis(); 
        }, 2000);
    }

    // --- 8 & 9. نظام الثيمات والصور ---
    const themePresetsBtns = document.querySelectorAll('.theme-preset-btn');
    const bgImgBtns = document.querySelectorAll('.bg-img-btn:not(.upload-btn)');
    const customBgUpload = document.getElementById('custom-bg-upload');
    const bgBlurToggle = document.getElementById('bg-blur-toggle');
    const customBgLayer = document.getElementById('custom-bg-layer');
    const liquidBg = document.querySelector('.liquid-background'); // لاخفائها عند وضع صورة

    // تطبيق الثيم
    function applyColorTheme(themeId, customColors) {
        if(themeId !== 'default') {
            document.documentElement.style.setProperty('--bg-primary', customColors.bg);
            document.documentElement.style.setProperty('--accent-color', customColors.b1);
            // تعديل البلوجز إذا كانت موجودة
            const b1 = document.querySelector('.blob-g-1');
            const b2 = document.querySelector('.blob-g-2');
            if(b1) b1.style.background = `radial-gradient(circle, ${customColors.b1}, transparent)`;
            if(b2) b2.style.background = `radial-gradient(circle, ${customColors.b2}, transparent)`;
        } else {
            // إعادة الافتراضي
            document.documentElement.style.removeProperty('--bg-primary');
            document.documentElement.style.removeProperty('--accent-color');
            const b1 = document.querySelector('.blob-g-1');
            const b2 = document.querySelector('.blob-g-2');
            if(b1) b1.style.background = '';
            if(b2) b2.style.background = '';
        }
    }

    // تطبيق الصورة
    function applyBgImage(imgSrc, isBlurred) {
        if(imgSrc && imgSrc !== 'none') {
            customBgLayer.style.backgroundImage = `url(${imgSrc})`;
            customBgLayer.classList.remove('hidden');
            if(liquidBg) liquidBg.style.display = 'none'; // إخفاء الألوان
            if(isBlurred) customBgLayer.classList.add('blurred');
            else customBgLayer.classList.remove('blurred');
            document.body.style.background = 'transparent';
        } else {
            customBgLayer.classList.add('hidden');
            customBgLayer.style.backgroundImage = '';
            if(liquidBg) liquidBg.style.display = 'block'; // إرجاع الألوان
        }
    }

    // Event Listeners للثيمات
    themePresetsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themePresetsBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const themeId = btn.getAttribute('data-theme-id');
            const colors = {
                bg: btn.style.getPropertyValue('--bg'),
                b1: btn.style.getPropertyValue('--b1'),
                b2: btn.style.getPropertyValue('--b2')
            };
            localStorage.setItem('selected_color_theme', JSON.stringify({id: themeId, colors}));
            applyColorTheme(themeId, colors);
            
            // إلغاء الصورة إذا تم اختيار ثيم
            localStorage.removeItem('selected_bg_image');
            applyBgImage('none', false);
            bgImgBtns.forEach(b => b.classList.remove('active'));
            const noneBtn = document.querySelector('.bg-img-btn[data-img-path="none"]');
            if (noneBtn) noneBtn.classList.add('active');
        });
    });

    // Event Listeners للصور الثابتة
    bgImgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bgImgBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const path = btn.getAttribute('data-img-path');
            const isBlurred = bgBlurToggle.checked;
            localStorage.setItem('selected_bg_image', path);
            applyBgImage(path, isBlurred);
        });
    });


    // تفعيل الـ Blur
    if(bgBlurToggle) {
        bgBlurToggle.addEventListener('change', () => {
            const currentImg = localStorage.getItem('selected_bg_image');
            localStorage.setItem('bg_image_blur', bgBlurToggle.checked);
            applyBgImage(currentImg, bgBlurToggle.checked);
        });
    }

    // تحميل الإعدادات المحفوظة عند فتح الموقع
    const savedThemeColor = JSON.parse(localStorage.getItem('selected_color_theme'));
    const savedBgImage = localStorage.getItem('selected_bg_image');
    const savedBlur = localStorage.getItem('bg_image_blur') === 'true';
    
    if(bgBlurToggle) bgBlurToggle.checked = savedBlur;

    if(savedBgImage && savedBgImage !== 'none') {
        applyBgImage(savedBgImage, savedBlur);
        // تحديث زر الأكتيف للصور
        const btn = document.querySelector(`.bg-img-btn[data-img-path="${savedBgImage}"]`);
        if(btn) { bgImgBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
    } else if(savedThemeColor) {
        applyColorTheme(savedThemeColor.id, savedThemeColor.colors);
        const btn = document.querySelector(`.theme-preset-btn[data-theme-id="${savedThemeColor.id}"]`);
        if(btn) { themePresetsBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
    }



    // إغلاق أي Accordion مفتوح عند فتح واحد جديد في قسم بصائر الإيمان
    const insightItems = document.querySelectorAll('.insight-item');
    insightItems.forEach((item) => {
        item.addEventListener('toggle', (e) => {
            if (item.open) {
                insightItems.forEach((otherItem) => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.removeAttribute('open');
                    }
                });
            }
        });
    });
});

// =========================================
// نظام النوافذ المنبثقة لـ "مفاهيم مضيئة"
// =========================================

const conceptsData = {
    'khushoo': {
        title: 'كيف أصل للخشوع في الصلاة؟',
        text: 'الخشوع يبدأ من استحضار أنك تستعد لمقابلة ملك الملوك. تدبّر معاني الفاتحة وحركات جسدك لتتواطأ حركة جسدك مع تفكير عقلك.',
        video: 'https://www.youtube.com/embed/8oR9D8yMvU4'
    },
    'adhkar': {
        title: 'كيف أستشعر الأذكار؟',
        text: 'الذكر ليس مجرد كلمات. حلاوة الذكر تأتي من "مواطأة القلب للسان". عندما تسبح، اربط التسبيح بموقف حقيقي واجهته اليوم.',
        video: 'https://www.youtube.com/embed/J7gWfW5c4yM'
    },
    'why_pray': {
        title: 'ليه بنصلي؟ (حقيقة الصلاة)',
        text: 'الصلاة هي الحبل الممدود بينك وبين الله. هي محطة يومية ترتاح فيها من ضغوطات الدنيا وأحزانها، وتتحدث فيها مباشرة مع خالقك.',
        video: 'https://www.youtube.com/embed/aE1h9J8P2sU'
    },
    'why_fast': {
        title: 'ليه بنصوم؟',
        text: 'الصوم هو مدرسة لتدريب عضلة الإرادة. يعلمنا ترك الحلال طاعة لله، لنكون أقوى على ترك الحرام، ويكسر الكبر في النفس.',
        video: 'https://www.youtube.com/embed/gS22XvXF9pY'
    },
    'sunnah': {
        title: 'ليه نهتم بالنوافل؟',
        text: 'النوافل تعمل كسياج حماية للفروض، تجبر أي نقص أو سرحان، وهي الطريق المباشر لنيل محبة الله الخاصة.',
        video: 'https://www.youtube.com/embed/WJ7sXk9m5-4'
    }
};

function openConcept(conceptId) {
    const data = conceptsData[conceptId];
    if (!data) return;

    // تعبئة البيانات في النافذة
    let _el3;
    if ((_el3 = document.querySelector('#concept-modal-title span'))) _el3.textContent = data.title;
    if ((_el3 = document.getElementById('concept-modal-text'))) _el3.textContent = data.text || '';
    
    // حقن الفيديو (لو موجود فقط، وإلا نخفي الحاوية)
    const videoContainer = document.getElementById('concept-modal-video');
    if (videoContainer) {
        if (data.video && data.video.trim() !== '') {
            videoContainer.style.display = 'block';
            videoContainer.innerHTML = `<iframe src="${data.video}" title="${data.title}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px;"></iframe>`;
        } else {
            videoContainer.style.display = 'none';
            videoContainer.innerHTML = '';
        }
    }
    
    // إظهار النافذة
    document.getElementById('concept-modal').classList.remove('hidden');
}

function closeConceptModal() {
    // إخفاء النافذة
    let _el4;
    if ((_el4 = document.getElementById('concept-modal'))) _el4.classList.add('hidden');
    
    // إفراغ محتوى الفيديو لإيقاف تشغيله بالخلفية
    if ((_el4 = document.getElementById('concept-modal-video'))) _el4.innerHTML = ''; 
}

// إغلاق النافذة عند الضغط خارجها (اختياري)
const conceptModalEl = document.getElementById('concept-modal');
if (conceptModalEl) conceptModalEl.addEventListener('click', function(e) {
    if (e.target === this) {
        closeConceptModal();
    }
}); 
// =========================================
// نظام الإشعارات المتوافق مع الكمبيوتر والموبايل (PWA)
// =========================================

let swRegistration = null;

// 1. تسجيل الـ Service Worker (لعمل الإشعارات في الخلفية للموبايل)
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
        console.log('Service Worker is registered', swReg);
        swRegistration = swReg;
    })
    .catch(function(error) {
        console.error('Service Worker Error', error);
    });
}

// 2. طلب صلاحية إرسال الإشعارات (مربوطة بـ window لكي يراها الـ HTML)
window.requestNotificationPermission = function() {
    // لو جوه تطبيق أندرويد (Capacitor)، استخدم طلب الإذن الأصلي بتاع النظام
    if (window.isNativeApp && window.isNativeApp()) {
        window.requestNotificationPermissionUnified().then((granted) => {
            if (granted) {
                const btn = document.querySelector('button[onclick="requestNotificationPermission()"]');
                if(btn) {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التفعيل بنجاح';
                    btn.style.background = '#22c55e';
                }
                window.sendLocalNotification('محاسبة النفس', 'تم التفعيل! هتوصلك تنبيهاتك حتى لو التطبيق مقفول.');
            } else {
                alert('تم رفض الإشعارات. يرجى السماح بها من إعدادات التطبيق على جهازك.');
            }
        });
        return;
    }

    if (!('Notification' in window)) {
        alert('عذراً، متصفحك أو جهازك لا يدعم الإشعارات.');
        return;
    }
    
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            // تغيير شكل الزر لتأكيد التفعيل
            const btn = document.querySelector('button[onclick="requestNotificationPermission()"]');
            if(btn) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التفعيل بنجاح';
                btn.style.background = '#22c55e';
            }
            
            // إرسال إشعار تجريبي فوري للتأكد من عملها
            window.sendLocalNotification('محاسبة النفس', 'تم التفعيل! سنذكرك بأورادك طالما التطبيق يعمل.');
        } else {
            alert('تم رفض الإشعارات. يرجى السماح بها من إعدادات المتصفح.');
        }
    });
};

// 3. دالة إرسال الإشعار الذكية (تدعم الحالات: تطبيق أندرويد، موبايل ويب، ولابتوب)
window.sendLocalNotification = function(title, body) {
    // لو جوه تطبيق أندرويد، استخدم الإشعار الأصلي بتاع النظام (بيشتغل حتى لو التطبيق مقفول)
    if (window.isNativeApp && window.isNativeApp()) {
        window.sendLocalNotificationUnified(title, body);
        return;
    }

    if (Notification.permission === 'granted') {
        const options = {
            body: body,
            icon: 'logo.png', // تأكد أن لديك صورة بهذا الاسم في مجلد المشروع
            badge: 'logo.png',
            vibrate: [200, 100, 200]
        };


        // محاولة الإرسال عبر الـ Service Worker (الأفضل للموبايل)
        if (typeof swRegistration !== 'undefined' && swRegistration && swRegistration.showNotification) {
            swRegistration.showNotification(title, options);
        } else {
            // الطريقة الاحتياطية العادية (للكمبيوتر)
            new Notification(title, options);
        }
    }
};



async function loadNiyyatSection() {
    try {
        const fdb = window._db;
        if (!fdb) return;
        // بنطلب البيانات من الوثيقة اللي هنكريتها في فايربيس
        const docRef = fdb.collection("app_settings").doc("niyyat_section");
        const doc = await docRef.get();

        const niyyatContainer = document.getElementById('niyyat-section-container');
        if (!niyyatContainer) return;

        if (!doc.exists) {
            niyyatContainer.style.display = 'none';
            return;
        }

        const data = doc.data();

        // 1. لو أنت عامل إخفاء للقسم من لوحة التحكم، هنخفيه من الواجهة
        if (data.isVisible === false) {
            niyyatContainer.style.display = 'none';
            return; // بنوقف الكود هنا
        }
        niyyatContainer.style.display = 'block';

        // 2. تجهيز قائمة العناصر (بتدعم الشكل الجديد "items" وكمان الشكل القديم "intentions" كنص فقط)
        let items = [];
        if (Array.isArray(data.items) && data.items.length > 0) {
            items = data.items;
        } else if (Array.isArray(data.intentions)) {
            // شكل قديم: كانت كل نية عبارة عن نص فقط بدون فيديو أو أيقونة
            items = data.intentions.map((text, i) => ({
                id: 'legacy_' + i,
                title: text,
                text: '',
                video: '',
                icon: 'fa-solid fa-star'
            }));
        }

        // 3. بناء الواجهة: عنوان القسم + شبكة من الكروت القابلة للضغط
        let htmlContent = `<h4 class="box-title" style="color: #10b981; margin-bottom: 0.75rem; font-size: 1.19rem;"><i class="fa-solid fa-lightbulb"></i> ${data.title || 'جدد نواياك'}</h4>`;

        if (items.length === 0) {
            niyyatContainer.innerHTML = htmlContent;
            return;
        }

        htmlContent += `<div class="warning-grid niyyat-grid" style="grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">`;

        items.forEach((item, index) => {
            const itemId = item.id || ('niyya_' + index);
            const conceptKey = 'niyya_' + itemId;

            // بنسجل بيانات كل عنصر جوه conceptsData عشان نافذة openConcept تقدر تعرضها
            conceptsData[conceptKey] = {
                title: item.title || '',
                text: item.text || '',
                video: item.video || ''
            };

            const icon = item.icon || 'fa-solid fa-star';
            htmlContent += `
                <div class="warning-box niyya-box" onclick="openConcept('${conceptKey}')" style="padding: 1rem 0.5rem; gap: 0.5rem;">
                    <i class="${icon} warning-icon niyya-icon" style="font-size: 1.5rem;"></i>
                    <h3 class="warning-title" style="font-size: 0.85rem;">${item.title || ''}</h3>
                </div>`;
        });

        htmlContent += `</div>`;

        // 4. بنطبع الـ HTML الجديد ده جوه الديف الفاضي
        niyyatContainer.innerHTML = htmlContent;
    } catch (error) {
        console.error("خطأ في جلب بيانات النوايا:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadNiyyatSection();
});

// =========================================
// عداد الذكر الذكي
// =========================================

const DHIKR_PRESETS = [
    { name: 'سبحان الله', target: 33, arabic: 'سبحان الله' },
    { name: 'الحمد لله', target: 33, arabic: 'الحمد لله' },
    { name: 'الله أكبر', target: 34, arabic: 'الله أكبر' },
    { name: 'لا إله إلا الله', target: 100, arabic: 'لا إله إلا الله' },
    { name: 'أستغفر الله', target: 100, arabic: 'أستغفر الله' },
    { name: 'سبحان الله وبحمده', target: 100, arabic: 'سبحان الله وبحمده' },
    { name: 'اللهم صل على محمد', target: 100, arabic: 'اللهم صل على محمد ﷺ' },
    { name: 'لا حول ولا قوة إلا بالله', target: 100, arabic: 'لا حول ولا قوة إلا بالله' }
];

let currentDhikrPreset = DHIKR_PRESETS[0];
let dhikrCount = 0;
let customDhikrs = [];

function openDhikrCounter() {
    const modal = document.getElementById('dhikr-counter-modal');
    if (!modal) return;

    // تحميل العداد المحفوظ
    const savedData = JSON.parse(localStorage.getItem('dhikr_counter_data') || '{}');
    const todayKey = getDateKey(getZeftaNow());
    if (savedData[todayKey]) {
        dhikrCount = savedData[todayKey].count || 0;
        const savedPreset = savedData[todayKey].preset;
        if (savedPreset) {
            const found = DHIKR_PRESETS.find(p => p.name === savedPreset);
            if (found) currentDhikrPreset = found;
        }
    }

    // رسم الأزرار
    renderDhikrPresets();
    updateDhikrDisplay();
    modal.classList.remove('hidden');
}

function closeDhikrCounter() {
    const modal = document.getElementById('dhikr-counter-modal');
    if (modal) modal.classList.add('hidden');
}

function renderDhikrPresets() {
    const container = document.getElementById('dhikr-presets');
    if (!container) return;
    container.innerHTML = '';
    const allPresets = [...DHIKR_PRESETS, ...customDhikrs.map(c => ({ name: c, target: 100, arabic: c, isCustom: true }))];
    allPresets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'dhikr-preset-btn' + (currentDhikrPreset.name === preset.name ? ' active' : '');
        btn.textContent = preset.name;
        btn.onclick = () => selectDhikrPreset(preset);
        container.appendChild(btn);
    });
}

function selectDhikrPreset(preset) {
    currentDhikrPreset = preset;
    dhikrCount = 0;
    renderDhikrPresets();
    updateDhikrDisplay();
}

function incrementDhikrCounter() {
    dhikrCount++;
    const circle = document.getElementById('dhikr-counter-circle');
    if (circle) {
        circle.classList.remove('pulse');
        void circle.offsetWidth;
        circle.classList.add('pulse');
    }
    // اهتزاز
    if (navigator.vibrate) navigator.vibrate(30);
    updateDhikrDisplay();
}

function updateDhikrDisplay() {
    const countEl = document.getElementById('dhikr-count');
    const targetEl = document.getElementById('dhikr-target');
    const nameEl = document.getElementById('dhikr-preset-name');
    if (countEl) countEl.textContent = dhikrCount;
    if (targetEl) targetEl.textContent = `الهدف: ${currentDhikrPreset.target}`;
    if (nameEl) nameEl.textContent = currentDhikrPreset.arabic || currentDhikrPreset.name;

    // تحديث الإحصائيات
    const statsEl = document.getElementById('dhikr-stats');
    if (statsEl) {
        const savedData = JSON.parse(localStorage.getItem('dhikr_counter_data') || '{}');
        const todayKey = getDateKey(getZeftaNow());
        const todayData = savedData[todayKey] || { totalToday: 0 };
        const totalSessions = Object.values(savedData).reduce((sum, d) => sum + (d.totalToday || 0), 0);
        statsEl.innerHTML = `
            <div style="display:flex; justify-content:space-around;">
                <div><strong>${todayData.totalToday || 0}</strong><br><span style="font-size:0.75rem;">اليوم</span></div>
                <div><strong>${totalSessions}</strong><br><span style="font-size:0.75rem;">الإجمالي</span></div>
                <div><strong>${Math.floor(dhikrCount / currentDhikrPreset.target * 100)}%</strong><br><span style="font-size:0.75rem;">التقدم</span></div>
            </div>
        `;
    }
}

function resetDhikrCounter() {
    dhikrCount = 0;
    updateDhikrDisplay();
}

function saveDhikrSession() {
    const savedData = JSON.parse(localStorage.getItem('dhikr_counter_data') || '{}');
    const todayKey = getDateKey(getZeftaNow());
    if (!savedData[todayKey]) savedData[todayKey] = { count: 0, totalToday: 0, preset: '' };
    savedData[todayKey].count = dhikrCount;
    savedData[todayKey].totalToday = (savedData[todayKey].totalToday || 0) + dhikrCount;
    savedData[todayKey].preset = currentDhikrPreset.name;
    localStorage.setItem('dhikr_counter_data', JSON.stringify(savedData));
    dhikrCount = 0;
    updateDhikrDisplay();
    if (typeof window.showCelebrationToast === 'function') {
        window.showCelebrationToast('تم حفظ جلسة الذكر بنجاح!');
    }
}

function addCustomDhikr() {
    const input = document.getElementById('dhikr-custom-input');
    if (!input || !input.value.trim()) return;
    customDhikrs.push(input.value.trim());
    input.value = '';
    renderDhikrPresets();
}


// =========================================
// تقويم الصيام المتقدم
// =========================================

let fastingData = {};

function loadFastingData() {
    fastingData = JSON.parse(localStorage.getItem('mohasba_fasting_data') || '{}');
}

function saveFastingData() {
    localStorage.setItem('mohasba_fasting_data', JSON.stringify(fastingData));
}

function openFastingCalendar() {
    loadFastingData();
    const modal = document.getElementById('fasting-calendar-modal');
    if (!modal) return;
    renderFastingCalendar();
    modal.classList.remove('hidden');
}

function closeFastingCalendar() {
    const modal = document.getElementById('fasting-calendar-modal');
    if (modal) modal.classList.add('hidden');
}

function renderFastingCalendar() {
    const grid = document.getElementById('fasting-calendar-grid');
    if (!grid) return;

    const today = getZeftaNow();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    grid.innerHTML = '';

    // أسماء الأيام
    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    dayNames.forEach(name => {
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;font-size:0.7rem;color:var(--text-secondary);padding:4px 0;font-weight:600;';
        header.textContent = name;
        grid.appendChild(header);
    });

    // ملء الفراغات
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }

    let monthFastCount = 0;
    let totalFastCount = 0;
    let streak = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = getDateKey(date);
        const isToday = day === today.getDate();
        const dayOfWeek = date.getDay();
        const isMonday = dayOfWeek === 1;
        const isThursday = dayOfWeek === 4;

        // حساب اليوم الهجري
        let hijriDay = 0;
        try {
            const hijriObj = kuwaitiCalendar(date);
            hijriDay = parseInt(hijriObj.day) || 0;
        } catch(e) {}
        const isWhiteDay = hijriDay === 13 || hijriDay === 14 || hijriDay === 15;

        const isFasted = fastingData[dateKey] === true;
        if (isFasted) monthFastCount++;

        const cell = document.createElement('div');
        cell.className = 'fasting-day-cell';
        if (isToday) cell.classList.add('today');
        if (isFasted) cell.classList.add('fasted');
        if (isWhiteDay && !isFasted) cell.classList.add('white-day');
        if ((isMonday || isThursday) && !isWhiteDay && !isFasted) cell.classList.add('monday-thursday');
        if (day < today.getDate() && !isFasted && (isMonday || isThursday || isWhiteDay)) cell.classList.add('missed');

        cell.innerHTML = `<span>${day}</span>`;
        cell.onclick = () => toggleFastingDay(dateKey, day);
        grid.appendChild(cell);
    }

    // حساب الإجمالي
    totalFastCount = Object.values(fastingData).filter(v => v === true).length;

    // حساب السلسلة
    let checkDate = new Date(today);
    while (true) {
        const key = getDateKey(checkDate);
        if (fastingData[key] === true) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    document.getElementById('fasting-month-count').textContent = monthFastCount;
    document.getElementById('fasting-total-count').textContent = totalFastCount;
    document.getElementById('fasting-streak-count').textContent = streak;

    // تحديث الحالة اليومية
    updateFastingTodayStatus();
}

function toggleFastingDay(dateKey, day) {
    if (fastingData[dateKey] === true) {
        delete fastingData[dateKey];
    } else {
        fastingData[dateKey] = true;
    }
    saveFastingData();
    renderFastingCalendar();
}

function toggleFastingToday() {
    const todayKey = getDateKey(getZeftaNow());
    loadFastingData();
    if (fastingData[todayKey] === true) {
        delete fastingData[todayKey];
    } else {
        fastingData[todayKey] = true;
    }
    saveFastingData();
    updateFastingTodayStatus();
}

function updateFastingTodayStatus() {
    const todayKey = getDateKey(getZeftaNow());
    const textEl = document.getElementById('fasting-today-text');
    const btnEl = document.getElementById('fasting-today-btn');
    if (!textEl || !btnEl) return;

    const isFasted = fastingData[todayKey] === true;
    const today = getZeftaNow();
    const dayOfWeek = today.getDay();
    const isMonday = dayOfWeek === 1;
    const isThursday = dayOfWeek === 4;

    let hijriDay = 0;
    try {
        const hijriObj = kuwaitiCalendar(today);
        hijriDay = parseInt(hijriObj.day) || 0;
    } catch(e) {}
    const isWhiteDay = hijriDay === 13 || hijriDay === 14 || hijriDay === 15;

    if (isFasted) {
        textEl.innerHTML = '✅ صمت اليوم';
        textEl.style.color = '#10b981';
        btnEl.textContent = 'إلغاء التسجيل';
        btnEl.classList.add('active');
    } else {
        let hint = '';
        if (isWhiteDay) hint = ' (اليوم الأبيض!)';
        else if (isMonday) hint = ' (الإثنين)';
        else if (isThursday) hint = ' (الخميس)';
        textEl.innerHTML = 'لم تسجل الصيام بعد' + hint;
        textEl.style.color = 'var(--text-secondary)';
        btnEl.textContent = 'صمت اليوم';
        btnEl.classList.remove('active');
    }
}


// =========================================
// =========================================
// العبادات الإضافية
// =========================================

function loadExtraWorships() {
    const key = `extra_worships_${getDateKey(getZeftaNow())}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    document.querySelectorAll('.extra-worship-item').forEach(item => {
        const id = item.getAttribute('data-id');
        if (saved[id]) {
            item.classList.add('done');
        }
    });
}

function toggleExtraWorship(el) {
    el.classList.toggle('done');
    const key = `extra_worships_${getDateKey(getZeftaNow())}`;
    const data = {};
    document.querySelectorAll('.extra-worship-item.done').forEach(item => {
        data[item.getAttribute('data-id')] = true;
    });
    localStorage.setItem(key, JSON.stringify(data));

    // تحديث النقاط
    if (typeof updateGlobalScore === 'function') updateGlobalScore();
    if (typeof window.saveData === 'function') window.saveData();
}

// تحميل العبادات الإضافية عند بدء الصفحة



// =========================================
// نظام الـ Streak (السلسلة)
// =========================================

function calculateStreak() {
    let streak = 0;
    let today = getZeftaNow();

    while (true) {
        const key = getStorageKey(today);
        const data = localStorage.getItem(key);
        if (!data) break;
        try {
            const parsed = JSON.parse(data);
            const score = parsed.stats ? parsed.stats.totalScore : 0;
            if (score >= 50) {
                streak++;
                today.setDate(today.getDate() - 1);
            } else {
                break;
            }
        } catch(e) {
            break;
        }
    }
    return streak;
}

function calculateBestStreak() {
    let best = 0;
    let current = 0;
    const today = getZeftaNow();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = getStorageKey(date);
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                const score = parsed.stats ? parsed.stats.totalScore : 0;
                if (score >= 50) {
                    current++;
                    if (current > best) best = current;
                } else {
                    current = 0;
                }
            } catch(e) {
                current = 0;
            }
        } else {
            current = 0;
        }
    }
    return best;
}

function renderStreakDisplay() {
    const streak = calculateStreak();
    const best = calculateBestStreak();
    const numberEl = document.getElementById('streak-number');
    const labelEl = document.getElementById('streak-label');
    const bestEl = document.getElementById('streak-best');
    const badgesEl = document.getElementById('streak-badges');

    if (numberEl) numberEl.textContent = streak;
    if (labelEl) labelEl.textContent = streak === 1 ? 'يوم متتالي' : 'أيام متتالية';
    if (bestEl) bestEl.textContent = best > 0 ? `أفضل سلسلة: ${best} يوم` : '';

    // الشارات
    if (badgesEl) {
        const badges = [
            { days: 3, icon: '🔥', label: '3 أيام' },
            { days: 7, icon: '⭐', label: 'أسبوع' },
            { days: 30, icon: '🏆', label: 'شهر' },
            { days: 100, icon: '👑', label: '100 يوم' },
            { days: 365, icon: '💎', label: 'سنة كاملة' }
        ];
        badgesEl.innerHTML = badges.map(b => {
            const earned = streak >= b.days || best >= b.days;
            return `<span class="streak-badge ${earned ? 'earned' : 'locked'}">${b.icon} ${b.label}</span>`;
        }).join('');
    }
}




// =========================================
// المساعد الروحاني الذكي
// =========================================

const ASSISTANT_RESPONSES = {
    prayer: [
        'الصلاة عمود الدين. حاول تocusing على معاني الكلمات اللي بتقولها في الصلاة.',
        'الخشوع يبدأ من تدبر الفاتحة. اقرأها بتمعن كل ركعة.',
        'النبي ﷺ كان يقول: "إذا قام أحدكم إلى الصلاة فليقل بسم الله الرحمن الرحيم". البسملة بداية الخشوع.',
        'حاول تصلي في أول وقتها. الفرق كبير بين من يصلي في أول الوقت ومن يتأخر.',
        'السنة قبلية وبعدها حصن للصلاة. لا تتركها.'
    ],
    fasting: [
        'الصيام مدربة للإرادة. كل يوم تصوم فيه تقوى نفسك على المعصية.',
        'الأيام البيض فرصة ذهبية. صيام 3 أيام في الشهر كفارة لذنوب السنة.',
        'الإثنين والخميس تُعرض فيه الأعمال. فرصة لرفع عملك وأنت صائم.',
        'لا تنسَ النية قبل الفجر. الصيام بدون نية لا يُقبل.'
    ],
    quran: [
        'القرآن شافع صاحبه يوم القيامة. اجعله رفيقك اليومي.',
        'حاول تقرأ صفحة واحدة على الأقل يومياً. الاستمرارية أهم من الكمية.',
        'تدبر معنى الآية قبل ما تقرأ التالية. القرآن أنزل للتدبر.',
        'القرآن يشفع لأهله. اقرأ ولو آية واحدة بتدبر.'
    ],
    general: [
        'اللهم اجعلنا ممن يسمعون القول فيتبعون أحسنه.',
        'الذكر سلاح المؤمن. لا تنسَ أذكارك الصباح والمساء.',
        'اطلب العفو من الله دائماً. الاستغفار يجلب البركة.',
        'بر الوالدين من أعظم الأعمال. اتصل بوالديك اليوم.',
        'صلة الرحم تengthens ties and increases sustenance.',
        'الصدقة تطفيء الذنوب كما يطفيء الماء النار.'
    ],
    analysis: []
};

function openAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    // رسالة ترحيب
    const messagesEl = document.getElementById('assistant-messages');
    if (messagesEl && messagesEl.children.length === 0) {
        addAssistantMessage('bot', 'السلام عليكم! أنا مساعدك الروحاني. كيف أقدر أساعدك اليوم؟ 🌙');
    }
}

function closeAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) modal.classList.add('hidden');
}

function addAssistantMessage(type, text) {
    const messagesEl = document.getElementById('assistant-messages');
    if (!messagesEl) return;
    const msg = document.createElement('div');
    msg.className = `assistant-msg ${type}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendAssistantMessage() {
    const input = document.getElementById('assistant-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    addAssistantMessage('user', text);

    setTimeout(() => {
        const response = generateAssistantResponse(text);
        addAssistantMessage('bot', response);
    }, 500);
}

function sendAssistantQuick(text) {
    addAssistantMessage('user', text);
    setTimeout(() => {
        const response = generateAssistantResponse(text);
        addAssistantMessage('bot', response);
    }, 500);
}

function generateAssistantResponse(input) {
    const lower = input.toLowerCase();

    // تحليل الأداء
    if (lower.includes('تحليل') || lower.includes('أدائي') || lower.includes('أداء')) {
        return analyzeUserPerformance();
    }

    // نصائح الصلاة
    if (lower.includes('صلاة') || lower.includes('صلاة')) {
        return getRandomResponse('prayer');
    }

    // الصيام
    if (lower.includes('صيام') || lower.includes('صوم')) {
        return getRandomResponse('fasting');
    }

    // القرآن
    if (lower.includes('قرآن') || lower.includes('قراءة')) {
        return getRandomResponse('quran');
    }

    // الدعاء
    if (lower.includes('دعاء') || lower.includes('أدعية')) {
        const duas = [
            'اللهم اهد قلبي واصلاح لي شأني كله، ولا تكلني إلى نفسي طرفة عين.',
            'رب اشرح لي صدري ويسر لي أمري.',
            'اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً.',
            'اللهم اجعلني ممن تحبهم وتراضى عنهم.',
            'اللهم بلغنا رمضان وارزقنا صيامه وقيامه.'
        ];
        return duas[Math.floor(Math.random() * duas.length)];
    }

    // الضعف
    if (lower.includes('تقصير') || lower.includes('ضعف') || lower.includes('ما بقدر')) {
        return 'لا تحبط! النبي ﷺ قال: "إنما الأعمال بالنيات". ابدأ بخطوة صغيرة اليوم، واذكر لماذا تريد أن تتغير. الله يرى نيتك ولا يضيع أجرك.';
    }

    // رد عام ذكي
    return getRandomResponse('general');
}

function analyzeUserPerformance() {
    const last7Days = [];
    const today = getZeftaNow();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = getStorageKey(d);
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                last7Days.push({ date: d, score: parsed.stats ? parsed.stats.totalScore : 0 });
            } catch(e) {
                last7Days.push({ date: d, score: 0 });
            }
        } else {
            last7Days.push({ date: d, score: 0 });
        }
    }

    const avgScore = Math.round(last7Days.reduce((sum, d) => sum + d.score, 0) / last7Days.length);
    const daysWithData = last7Days.filter(d => d.score > 0).length;
    const trend = last7Days[0].score > last7Days[1].score ? 'تحسن' : last7Days[0].score < last7Days[1].score ? 'تراجع' : 'ثبات';

    let advice = '';
    if (avgScore < 30) {
        advice = 'متوسط أدائك ضعيف هذا الأسبوع. حاول تبدأ بخطوة صغيرة: صلاة الفجر في أول وقتها فقط.';
    } else if (avgScore < 60) {
        advice = 'أداؤك متوسط. حاول تركز على نقطة ضعف واحدة وتحسّنها.';
    } else if (avgScore < 80) {
        advice = 'أداؤك جيد بحمد الله! حاول تضيف عبادة جديدة كل أسبوع.';
    } else {
        advice = 'ما شاء الله! أداؤك ممتاز. استمرارك نعمة من الله.';
    }

    return `📊 تحليل آخر 7 أيام:\n\n• المتوسط: ${avgScore}%\n• أيام التسجيل: ${daysWithData}/7\n• الاتجاه: ${trend}\n\n${advice}`;
}

function getRandomResponse(category) {
    const responses = ASSISTANT_RESPONSES[category] || ASSISTANT_RESPONSES.general;
    return responses[Math.floor(Math.random() * responses.length)];
}


// =========================================
// الأهداف الشهرية
// =========================================

const GOALS_KEY = 'mohasba_monthly_goals';

function loadGoals() {
    return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
}

function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function openGoalsModal() {
    const modal = document.getElementById('goals-modal');
    if (!modal) return;
    renderGoalsList();
    modal.classList.remove('hidden');
}

function closeGoalsModal() {
    const modal = document.getElementById('goals-modal');
    if (modal) modal.classList.add('hidden');
}

function renderGoalsList() {
    const container = document.getElementById('goals-list');
    if (!container) return;
    const goals = loadGoals();

    if (goals.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">لم تضف أي أهداف بعد. ابدأ بإضافة هدف!</p>';
        return;
    }

    container.innerHTML = goals.map((goal, idx) => {
        const progress = calculateGoalProgress(goal);
        const percentage = Math.min(Math.round((progress / goal.target) * 100), 100);
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <span class="goal-name">${goal.name}</span>
                    <div>
                        <span style="font-size:0.85rem;color:var(--text-secondary);">${progress}/${goal.target}</span>
                        <button class="goal-delete-btn" onclick="deleteGoal(${idx})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill ${percentage >= 100 ? 'complete' : ''}" style="width: ${percentage}%;"></div>
                </div>
                <div style="text-align:center;margin-top:5px;font-size:0.8rem;color:${percentage >= 100 ? '#10b981' : 'var(--text-secondary)'};">
                    ${percentage >= 100 ? '✅ تم الإنجاز!' : `${percentage}% مكتمل`}
                </div>
            </div>`;
    }).join('');
}

function calculateGoalProgress(goal) {
    const today = getZeftaNow();
    let count = 0;

    if (goal.type === 'days') {
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = getStorageKey(d);
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.stats && parsed.stats.totalScore >= (goal.threshold || 50)) {
                        count++;
                    }
                } catch(e) {}
            }
        }
    } else if (goal.type === 'count') {
        const key = `goal_count_${goal.name}_${today.getMonth()}_${today.getFullYear()}`;
        count = parseInt(localStorage.getItem(key) || '0');
    } else if (goal.type === 'percentage') {
        const key = getStorageKey(today);
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                count = parsed.stats ? parsed.stats.totalScore : 0;
            } catch(e) {}
        }
        return count;
    }

    return count;
}

function addNewGoal() {
    document.getElementById('add-goal-modal').classList.remove('hidden');
}

function closeAddGoalModal() {
    document.getElementById('add-goal-modal').classList.add('hidden');
}

function saveNewGoal() {
    const name = document.getElementById('goal-name-input').value.trim();
    const type = document.getElementById('goal-type-input').value;
    const target = parseInt(document.getElementById('goal-target-input').value);

    if (!name || !target || target < 1) {
        alert('يرجى ملء جميع الحقول بشكل صحيح');
        return;
    }

    const goals = loadGoals();
    goals.push({ name, type, target, threshold: 50, createdAt: getZeftaNow().toISOString() });
    saveGoals(goals);

    document.getElementById('goal-name-input').value = '';
    document.getElementById('goal-target-input').value = '';
    closeAddGoalModal();
    renderGoalsList();
    renderGoalsPreview();
}

function deleteGoal(idx) {
    const goals = loadGoals();
    goals.splice(idx, 1);
    saveGoals(goals);
    renderGoalsList();
    renderGoalsPreview();
}

function renderGoalsPreview() {
    const container = document.getElementById('goals-preview');
    if (!container) return;
    const goals = loadGoals();

    if (goals.length === 0) {
        container.innerHTML = '<p style="text-align:center;font-size:0.8rem;color:var(--text-secondary);">اضغط لإضافة أهدافك الشهرية</p>';
        return;
    }

    container.innerHTML = goals.slice(0, 3).map(goal => {
        const progress = calculateGoalProgress(goal);
        const percentage = Math.min(Math.round((progress / goal.target) * 100), 100);
        return `
            <div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:3px;">
                    <span>${goal.name}</span>
                    <span style="color:${percentage >= 100 ? '#10b981' : 'var(--text-secondary)'};">${percentage}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill ${percentage >= 100 ? 'complete' : ''}" style="width:${percentage}%;"></div>
                </div>
            </div>`;
    }).join('');

    if (goals.length > 3) {
        container.innerHTML += `<p style="text-align:center;font-size:0.75rem;color:var(--text-secondary);">+${goals.length - 3} أهداف أخرى</p>`;
    }
}

// =========================================
// تحميل جميع الميزات الجديدة
// =========================================

// =========================================
// إحياء السُّنة النبوية
// =========================================
const SUNNAH_ITEMS = [
    { id: 'miswak', name: 'السواك', desc: 'قبل الوضوء أو الصلاة', icon: '🦷', points: 2 },
    { id: 'sleep_right', name: 'النوم على الجانب الأيمن', desc: 'سنة نبوية ثابتة', icon: '🛏️', points: 2 },
    { id: 'two_rakat_fajr', name: 'ركعتا الفجر', desc: 'قبل أذان الفجر', icon: '🕌', points: 5 },
    { id: 'adhkar_morning', name: 'أذكار الصباح', desc: 'حصناً من يومك', icon: '☀️', points: 3 },
    { id: 'adhkar_evening', name: 'أذكار المساء', desc: 'حصناً من ليلتك', icon: '🌙', points: 3 },
    { id: 'dua_iftar', name: 'دعاء قبل الطعام', desc: 'بسم الله وعند الانتهاء الحمد لله', icon: '🍽️', points: 2 },
    { id: 'enter_mosque', name: 'صلاة تحية المسجد', desc: 'ركعتين عند الدخول', icon: '🏛️', points: 3 },
    { id: 'sunnah_prayers', name: 'السنن الرواتب', desc: '12 ركعة في اليوم', icon: '📖', points: 5 },
    { id: 'istighfar_100', name: 'الاستغفار 100 مرة', desc: 'يشرح الله الصدر ويرزق', icon: '🤲', points: 3 },
    { id: 'tasbih_tahmid', name: 'التسبيح والتحميد', desc: 'سبحان الله 33 - الحمد لله 33 - الله أكبر 34', icon: '✨', points: 2 },
    { id: 'walk_mosque', name: 'المشي إلى المسجد', desc: 'لكل خطوة درجة', icon: '🚶', points: 2 },
    { id: 'sunnah_eating', name: 'الأكل باليمنى', desc: 'و食べる ما قرب إليك', icon: '✋', points: 1 },
    { id: 'siwak_before_prayer', name: 'السواك قبل كل صلاة', desc: 'إحدىسنن النبي ﷺ', icon: '🪥', points: 2 },
    { id: 'istikharah', name: 'صلاة الاستخارة', desc: 'عند الحاجة لقرار', icon: '🙏', points: 5 }
];

function getSunnahData() {
    const d = window.currentDate || getZeftaNow();
    const key = `mohasba_sunnah_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
}

function saveSunnahData(data) {
    const d = window.currentDate || getZeftaNow();
    const key = `mohasba_sunnah_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function openSunnahModal() {
    document.getElementById('sunnah-modal').classList.remove('hidden');
    renderSunnahList();
}

function closeSunnahModal() {
    document.getElementById('sunnah-modal').classList.add('hidden');
}

function renderSunnahList() {
    const container = document.getElementById('sunnah-list');
    if (!container) return;
    const data = getSunnahData();
    container.innerHTML = SUNNAH_ITEMS.map(item => {
        const done = data[item.id] === true;
        return `
            <div class="sunnah-item ${done ? 'done' : ''}" onclick="toggleSunnah('${item.id}')">
                <div class="sunnah-check"><i class="fa-solid fa-check"></i></div>
                <div style="font-size:1.3rem;">${item.icon}</div>
                <div class="sunnah-info">
                    <div class="sunnah-name">${item.name} <span style="font-size:0.7rem;color:#eab308;">(+${item.points})</span></div>
                    <div class="sunnah-desc">${item.desc}</div>
                </div>
                ${done ? '<button class="undo-inline-btn fade-out" onclick="event.stopPropagation(); undoSunnahItem(\'' + item.id + '\')" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
            </div>`;
    }).join('');
}

function toggleSunnah(id) {
    const data = getSunnahData();
    const wasDone = data[id] === true;
    data[id] = !data[id];
    saveSunnahData(data);
    
    if (!wasDone && data[id]) {
        const item = SUNNAH_ITEMS.find(s => s.id === id);
        showUndoBar((item ? item.name : id) + ' ✓', () => {
            data[id] = false;
            saveSunnahData(data);
            renderSunnahList();
            updateSunnahPreview();
            updateGlobalScore();
        });
    }
    
    renderSunnahList();
    updateSunnahPreview();
    updateGlobalScore();
}

function undoSunnahItem(id) {
    const data = getSunnahData();
    data[id] = false;
    saveSunnahData(data);
    renderSunnahList();
    updateSunnahPreview();
    updateGlobalScore();
}

function updateSunnahPreview() {
    const data = getSunnahData();
    const done = Object.values(data).filter(v => v === true).length;
    const total = SUNNAH_ITEMS.length;
    const el = document.getElementById('sunnah-today-count');
    if (el) el.textContent = `${done}/${total}`;
}

function getSunnahScore() {
    const data = getSunnahData();
    let pts = 0;
    SUNNAH_ITEMS.forEach(item => {
        if (data[item.id]) pts += item.points;
    });
    return pts;
}

function getSunnahMaxPoints() {
    return SUNNAH_ITEMS.reduce((sum, item) => sum + item.points, 0);
}

// =========================================
// الصلاة على النبي ﷺ
// =========================================
let salawatSessionCount = 0;
const SALAWAT_MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];
const SALAWAT_KHATMAH = 100000;

function loadSalawatData() {
    const d = window.currentDate || getZeftaNow();
    const key = `mohasba_salawat_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { total: 0, sessions: [] };
}

function saveSalawatData(data) {
    const d = window.currentDate || getZeftaNow();
    const key = `mohasba_salawat_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function loadSalawatLifetime() {
    const raw = localStorage.getItem('mohasba_salawat_lifetime');
    return raw ? parseInt(raw) : 0;
}

function saveSalawatLifetime(val) {
    localStorage.setItem('mohasba_salawat_lifetime', val.toString());
}

function openSalawatModal() {
    document.getElementById('salawat-modal').classList.remove('hidden');
    const data = loadSalawatData();
    salawatSessionCount = 0;
    updateSalawatUI(data);
}

function closeSalawatModal() {
    document.getElementById('salawat-modal').classList.add('hidden');
}

function incrementSalawat() {
    salawatSessionCount++;
    const circle = document.getElementById('salawat-counter-circle');
    if (circle) {
        circle.classList.remove('pulse');
        void circle.offsetWidth;
        circle.classList.add('pulse');
    }
    
    const data = loadSalawatData();
    document.getElementById('salawat-count').textContent = salawatSessionCount;
    updateSalawatMilestones();
    updateGlobalScore();
}

function resetSalawat() {
    salawatSessionCount = 0;
    document.getElementById('salawat-count').textContent = '0';
    updateSalawatMilestones();
}

function saveSalawatSession() {
    if (salawatSessionCount === 0) return;
    const data = loadSalawatData();
    data.total += salawatSessionCount;
    data.sessions.push({ count: salawatSessionCount, time: getZeftaNow().toLocaleTimeString('ar-SA') });
    saveSalawatData(data);
    
    const lifetime = loadSalawatLifetime() + salawatSessionCount;
    saveSalawatLifetime(lifetime);
    
    updateSalawatUI(data);
    salawatSessionCount = 0;
    document.getElementById('salawat-count').textContent = '0';
    updateSalawatMilestones();
    showCelebrationToast('تم الحفظ! +' + data.sessions[data.sessions.length-1].count + ' صلاة');
    updateGlobalScore();
}

function updateSalawatUI(data) {
    const totalEl = document.getElementById('salawat-total-display');
    if (totalEl) totalEl.textContent = data.total;
    const lifetime = loadSalawatLifetime();
    const khatmahCount = Math.floor(lifetime / SALAWAT_KHATMAH);
    const statsEl = document.getElementById('salawat-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div style="display:flex;justify-content:space-around;">
                <div><strong style="color:#a855f7;font-size:1.2rem;">${data.total}</strong><br>اليوم</div>
                <div><strong style="color:#a855f7;font-size:1.2rem;">${lifetime}</strong><br>المجموع الكلي</div>
                <div><strong style="color:#a855f7;font-size:1.2rem;">${khatmahCount}</strong><br>ختم (${SALAWAT_KHATMAH.toLocaleString()})</div>
            </div>`;
    }
}

function updateSalawatMilestones() {
    const container = document.getElementById('salawat-milestones');
    if (!container) return;
    const data = loadSalawatData();
    const todayTotal = data.total + salawatSessionCount;
    container.innerHTML = SALAWAT_MILESTONES.map(m => {
        const achieved = todayTotal >= m;
        return `<div class="salawat-milestone ${achieved ? 'achieved' : ''}">${achieved ? '✓' : ''} ${m.toLocaleString()}</div>`;
    }).join('');
}

function getSalawatScore() {
    const data = loadSalawatData();
    if (data.total === 0) return 0;
    if (data.total >= 1000) return 10;
    if (data.total >= 500) return 8;
    if (data.total >= 100) return 6;
    if (data.total >= 50) return 4;
    if (data.total >= 10) return 2;
    return 1;
}

function getSalawatMaxPoints() { return 10; }

// =========================================
// حصن المسلم الرقمي
// =========================================
const HISN_CATEGORIES = {
    'السفر': [
        { title: 'دعاء السفر', text: 'اللهم إنا نسألك في سفرنا هذا البر والتقوى، ومن العمل ما ترضاه، اللهم هون علينا سفرنا هذا واطوِ عنا بُعدَه، اللهم أنت الصاحب في السفر والخليفة في الأهل، اللهم إني أعوذ بك من عسف السفر وآباء السوء والمنظر في الأهل والمال عند المنقلب.', source: 'صحيح مسلم 1343' },
        { title: 'دعاء دخول البلد', text: 'اللهم بارك لنا فيما رزقتنا و قنا عذاب النار.', source: 'صحيح مسلم 1015' },
        { title: 'دعاء المسافر', text: 'اللهم أنت رفيق تحب الرفق في الأمر فأ refactor معنا.', source: 'سنن أبي داود 2610' }
    ],
    'الخوف': [
        { title: 'دعاء الاستعاذة من الخوف', text: 'اللهم إني أعوذ بك من الهم والحزن، وأعوذ بك من العجز والكسل، وأعوذ بك من الجبن والبخل، وأعوذك من غلبة الدين وقهر الرجال.', source: 'سنن أبي داود 5094' },
        { title: 'دعاء الكرب', text: 'اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين وأصلح لي شأني كله، لا إله إلا أنت.', source: 'سنن أبي داود 5090' },
        { title: 'آية الكرسي', text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.', source: 'سورة البقرة 255' }
    ],
    'الحزن': [
        { title: 'دعاء الكرب', text: 'اللهم إني أعوذ بك من الهم والحزن، وأعوذ بك من العجز والكسل، وأعوذ بك من الجبن والبخل، وأعوذ بك من غلبة الدين وقهر الرجال.', source: 'سنن أبي داود 5094' },
        { title: 'دعاء الرزق', text: 'اللهم إني أسألك إيماناً لا يرتد، ونعمة لا تنفد، ومرافقة نبيك محمد في أعلى جنة الخلد.', source: 'صحيح مسلم 2827' },
        { title: 'دعاء تفريج الكرب', text: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً.', source: 'صحيح ابن حبان 974' }
    ],
    'المرض': [
        { title: 'دعاء المريض', text: 'اللهم رب الناس أذهب البأس اشفِ أنت الشافِي لا شفاء إلا شفاؤك شفاءً لا يُغادر سقماً.', source: 'صحيح البخاري 5750' },
        { title: 'دعاء ال visited Sick', text: 'أسألك الله العظيم رب العرش العظيم أن يشفيك.', source: 'سنن أبي داود 3106' },
        { title: ' Protection من البلاء', text: 'بسم الله أرقيك من كل شيء يؤذيك، من شر كل نفس أو عين حاسد، الله يشفيك، بسم الله أرقيك.', source: 'صحيح مسلم 2196' }
    ],
    'ال惬': [
        { title: 'دعاء الاستخارة', text: 'اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك وأسألك من فضلك العظيم، فإنك تقدر ولا أقدر، وتعلم ولا أعلم وأنت علام الغيوب.', source: 'صحيح البخاري 1162' },
        { title: 'دعاء تيسير الأمور', text: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً.', source: 'صحيح ابن حبان 974' }
    ],
    'الذنوب': [
        { title: 'دعاء الاستغفار', text: 'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.', source: 'صحيح البخاري 6326' },
        { title: 'دعاء التوبة', text: 'اللهم تب علي إنك أنت التواب الرحيم.', source: 'سنن أبي داود 1515' },
        { title: 'دعاء محو الذنوب', text: 'اللهم إني ظلمت نفسي ظلماً كثيراً ولا يغفر الذنوب إلا أنت فاغفر لي مغفرة من عندك وارحمني إنك أنت الغفور الرحيم.', source: 'سورةآل عمران 135' }
    ],
    'الهم': [
        { title: 'دعاء الهم والحزن', text: 'اللهم إني أعوذ بك من الهم والحزن، وأعوذ بك من العجز والكسل، وأعوذ بك من الجبن والبخل، وأعوذ بك من غلبة الدين وقهر الرجال.', source: 'سنن أبي داود 5094' },
        { title: 'دعاء الكرب', text: 'لا إله إلا الله العظيم الحليم، لا إله إلا الله رب العرش العظيم، لا إله إلا الله رب السماوات ورب الأرض ورب العرش العظيم.', source: 'صحيح البخاري 6318' },
        { title: 'تفريج الهم', text: 'اللهم إني أسألك موجبات رحمتك وعزائم مغفرتك والغنيمة من كل بر والسلامة من كل إثم والنجاح في كل حسنة والفوز بالجنة والنجاة من النار.', source: 'صحيح البخاري 6313' }
    ],
    'الرزق': [
        { title: 'دعاء طلب الرزق', text: 'اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً.', source: 'سنن ابن ماجه 922' },
        { title: 'توسيع الرزق', text: 'اللهم اكتب لي الخير واجنبنى الشر واكتب لي الحياة بعد الموت.', source: 'سنن أبي داود 5095' },
        { title: 'دعاء الرزق الواسع', text: 'اللهم إني أسألك رزقاً حلالاً طيباً واسعاً.', source: 'صحيح الجامع 1300' }
    ]
};

function openHisnModal() {
    document.getElementById('hisn-modal').classList.remove('hidden');
    renderHisnCategories();
    renderHisnDuas('السفر');
}

function closeHisnModal() {
    document.getElementById('hisn-modal').classList.add('hidden');
}

function renderHisnCategories() {
    const container = document.getElementById('hisn-categories');
    if (!container) return;
    container.innerHTML = Object.keys(HISN_CATEGORIES).map((cat, i) =>
        `<button class="hisn-category-btn ${i === 0 ? 'active' : ''}" onclick="renderHisnDuas('${cat}'); this.parentElement.querySelectorAll('.hisn-category-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">${cat}</button>`
    ).join('');
}

function renderHisnDuas(category) {
    const container = document.getElementById('hisn-duas');
    if (!container) return;
    const duas = HISN_CATEGORIES[category] || [];
    container.innerHTML = duas.map(dua => `
        <div class="hisn-dua-card">
            <div class="hisn-dua-title">${dua.title}</div>
            <div class="hisn-dua-text">${dua.text}</div>
            <div class="hisn-dua-source">📚 ${dua.source}</div>
        </div>`
    ).join('');
}

// =========================================
// نظام الإلغاء (Undo) - زر بجانب كل عبادة
// =========================================
let lastAction = null;
let undoTimeout = null;

function showUndoBar(message, undoFn) {
    clearTimeout(undoTimeout);
    const bar = document.getElementById('undo-bar');
    const msgEl = document.getElementById('undo-message');
    if (!bar || !msgEl) return;

    lastAction = undoFn;
    msgEl.textContent = message;
    bar.classList.remove('hidden', 'hiding');

    undoTimeout = setTimeout(() => {
        bar.classList.add('hiding');
        setTimeout(() => {
            bar.classList.add('hidden');
            lastAction = null;
        }, 300);
    }, 4000);
}

function undoLastAction() {
    if (lastAction) {
        lastAction();
        lastAction = null;
        clearTimeout(undoTimeout);
        const bar = document.getElementById('undo-bar');
        if (bar) {
            bar.classList.add('hiding');
            setTimeout(() => bar.classList.add('hidden'), 300);
        }
        showCelebrationToast('تم التراجع بنجاح');
    }
}

function addInlineUndoButton(el, undoFn) {
    const existing = el.querySelector('.undo-inline-btn');
    if (existing) return;
    
    const btn = document.createElement('button');
    btn.className = 'undo-inline-btn fade-out';
    btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    btn.title = 'تراجع';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        undoFn();
        btn.remove();
    });
    el.appendChild(btn);
    
    setTimeout(() => { if (btn.parentElement) btn.classList.add('fade-out'); }, 100);
}

function addUndoToElement(el, className, undoFn) {
    if (el.classList.contains(className)) {
        addInlineUndoButton(el, undoFn);
    }
}

// =========================================
// الأذكار والنوافل المخصصة
// =========================================
let customAdhkarType = 'ibadah'; // 'ibadah' or 'dhikr'

function loadCustomAdhkar(dateKey) {
    const key = `mohasba_custom_adhkar_${dateKey || getDateKey(window.currentDate || getZeftaNow())}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { items: [] };
}

function saveCustomAdhkar(data, dateKey) {
    const key = `mohasba_custom_adhkar_${dateKey || getDateKey(window.currentDate || getZeftaNow())}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function initAddWorshipModal() {
    const ibadahBtn = document.getElementById('add-type-ibadah');
    const dhikrBtn = document.getElementById('add-type-dhikr');
    
    if (ibadahBtn) ibadahBtn.addEventListener('click', () => {
        customAdhkarType = 'ibadah';
        ibadahBtn.style.background = '#10b981';
        if (dhikrBtn) dhikrBtn.style.background = 'rgba(139,92,246,0.2)';
        document.getElementById('worship-name').placeholder = 'مثال: صلاة الضحى';
        document.getElementById('worship-time').placeholder = 'مثال: بعد الفجر';
    });
    
    if (dhikrBtn) dhikrBtn.addEventListener('click', () => {
        customAdhkarType = 'dhikr';
        dhikrBtn.style.background = '#8b5cf6';
        if (ibadahBtn) ibadahBtn.style.background = 'rgba(16,185,129,0.2)';
        document.getElementById('worship-name').placeholder = 'مثال: سبحان الله وبحمده 100 مرة';
        document.getElementById('worship-time').placeholder = 'مثال: في الصباح';
    });
}

function renderCustomAdhkar() {
    const container = document.getElementById('custom-dhikr-list');
    if (!container) return;
    
    const data = loadCustomAdhkar();
    
    if (!data.items || data.items.length === 0) {
        container.innerHTML = '<p style="text-align:center;font-size:0.8rem;color:var(--text-secondary);">لا توجد أذكار مخصصة بعد</p>';
        return;
    }
    
    container.innerHTML = data.items.map((item, i) => `
        <div class="custom-dhikr-item ${item.done ? 'done' : ''}" onclick="toggleCustomDhikr(${i})">
            <div class="custom-dhikr-check"><i class="fa-solid fa-check"></i></div>
            <div class="custom-dhikr-info">
                <div class="custom-dhikr-name">${item.name}</div>
                <div class="custom-dhikr-meta">${item.time || ''} • ${item.points} نقطة${item.type === 'dhikr' ? ' • ذكر' : ''}</div>
            </div>
            ${item.done ? '<button class="undo-inline-btn fade-out" onclick="event.stopPropagation(); undoCustomDhikr(' + i + ')" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
            <button class="custom-dhikr-delete" onclick="event.stopPropagation(); deleteCustomDhikr(${i})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function toggleCustomDhikr(index) {
    const data = loadCustomAdhkar();
    if (!data.items[index]) return;
    
    const item = data.items[index];
    const wasDone = item.done;
    item.done = !item.done;
    saveCustomAdhkar(data);
    
    if (!wasDone && item.done) {
        showUndoBar(item.name + ' ✓', () => {
            item.done = false;
            saveCustomAdhkar(data);
            renderCustomAdhkar();
            updateGlobalScore();
        });
    }
    
    renderCustomAdhkar();
    updateGlobalScore();
}

function undoCustomDhikr(index) {
    const data = loadCustomAdhkar();
    if (!data.items[index]) return;
    data.items[index].done = false;
    saveCustomAdhkar(data);
    renderCustomAdhkar();
    updateGlobalScore();
}

function deleteCustomDhikr(index) {
    const data = loadCustomAdhkar();
    const item = data.items[index];
    if (!item) return;
    
    if (confirm(`هل تريد حذف "${item.name}"؟`)) {
        data.items.splice(index, 1);
        saveCustomAdhkar(data);
        renderCustomAdhkar();
        updateGlobalScore();
    }
}

function addCustomAdhkarFromModal() {
    const name = document.getElementById('worship-name').value.trim();
    const time = document.getElementById('worship-time').value.trim();
    const points = parseInt(document.getElementById('worship-points').value);
    
    if (!name) {
        showCelebrationToast('أدخل الاسم أولاً');
        return;
    }
    
    const data = loadCustomAdhkar();
    data.items.push({
        name: name,
        time: time,
        points: points,
        done: false,
        type: customAdhkarType,
        created: Date.now()
    });
    saveCustomAdhkar(data);
    
    document.getElementById('worship-name').value = '';
    document.getElementById('worship-time').value = '';
    document.getElementById('worship-points').value = '1';
    document.getElementById('add-worship-modal').classList.add('hidden');
    
    renderCustomAdhkar();
    updateGlobalScore();
    showCelebrationToast('تمت الإضافة!');
}

function getCustomAdhkarScore() {
    const data = loadCustomAdhkar();
    let pts = 0;
    (data.items || []).forEach(item => {
        if (item.done) pts += item.points || 0;
    });
    return pts;
}

function getCustomAdhkarMaxPoints() {
    const data = loadCustomAdhkar();
    let pts = 0;
    (data.items || []).forEach(item => { pts += item.points || 0; });
    return pts;
}

// =========================================
// نظام العضويات والرتب (إنجازي)
// =========================================
const MEMBERSHIP_RANKS = [
    { id: 'beginner', name: 'مبتدئ', icon: '🌿', color: '#9ca3af', req: 0, reqText: 'ابدأ رحلتك', features: ['access_basic'] },
    { id: 'bronze', name: 'برونزي', icon: '🥉', color: '#cd7f32', req: 100, reqText: '100 نقطة', features: ['access_basic', 'analytics_weekly'] },
    { id: 'silver', name: 'فضي', icon: '🥈', color: '#94a3b8', req: 500, reqText: '500 نقطة', features: ['access_basic', 'analytics_weekly', 'custom_themes'] },
    { id: 'gold', name: 'ذهبي', icon: '🥇', color: '#d97706', req: 2000, reqText: '2,000 نقطة', features: ['access_basic', 'analytics_weekly', 'custom_themes', 'pdf_export'] },
    { id: 'diamond', name: 'ماسي', icon: '💎', color: '#3b82f6', req: 10000, reqText: '10,000 نقطة', features: ['access_basic', 'analytics_weekly', 'custom_themes', 'pdf_export', 'ai_assistant_full'] },
    { id: 'pearl', name: 'لؤلؤي', icon: '🫧', color: '#a855f7', req: 50000, reqText: '50,000 نقطة', features: ['access_basic', 'analytics_weekly', 'custom_themes', 'pdf_export', 'ai_assistant_full', 'golden_theme'] }
];

const MEMBERSHIP_FEATURES = {
    access_basic: { name: 'الميزات الأساسية', icon: '✅' },
    analytics_weekly: { name: 'التحليلات الأسبوعية المتقدمة', icon: '📊' },
    custom_themes: { name: 'ثيمات مخصصة (3 ألوان إضافية)', icon: '🎨' },
    pdf_export: { name: 'تصدير التقارير PDF', icon: '📄' },
    ai_assistant_full: { name: 'المساعد الذكي وضع كامل', icon: '🤖' },
    golden_theme: { name: 'الثيم الذهبي الحصري', icon: '✨' }
};

function getLifetimePoints() {
    let total = 0;

    // حساب نقاط كل يوم محفوظ في localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // بيانات اليوم الرئيسي (صلوات + أذكار + بونص)
        if (key.startsWith('mohasba_data_')) {
            try {
                const dayData = JSON.parse(localStorage.getItem(key));
                if (dayData.stats && dayData.stats.breakdown) {
                    for (const cat in dayData.stats.breakdown) {
                        total += dayData.stats.breakdown[cat][0] || 0;
                    }
                }
            } catch(e) {}
        }

        // بيانات العادات الإضافية (نوافل الركن)
        if (key.startsWith('ibadat_data_')) {
            try {
                const ibData = JSON.parse(localStorage.getItem(key));
                if (ibData.static) {
                    //静态 ibadat لها نقاط ثابتة محفوظة في DOM
                }
                if (ibData.dynamic) {
                    ibData.dynamic.forEach(d => {
                        if (d.done && d.points) total += parseInt(d.points) || 0;
                    });
                }
            } catch(e) {}
        }

        // بيانات النوافل الإضافية
        if (key.startsWith('extras_')) {
            try {
                const exData = JSON.parse(localStorage.getItem(key));
                exData.forEach(d => {
                    if (d.done && d.points) total += parseInt(d.points) || 0;
                });
            } catch(e) {}
        }

        // أذكار مخصصة
        if (key.startsWith('mohasba_custom_adhkar_')) {
            try {
                const caData = JSON.parse(localStorage.getItem(key));
                if (caData.items) {
                    caData.items.forEach(d => {
                        if (d.done && d.points) total += parseInt(d.points) || 0;
                    });
                }
            } catch(e) {}
        }

        // السُّنة
        if (key.startsWith('mohasba_sunnah_')) {
            try {
                const sData = JSON.parse(localStorage.getItem(key));
                SUNNAH_ITEMS.forEach(item => {
                    if (sData[item.id]) total += item.points;
                });
            } catch(e) {}
        }

        // الصلاة على النبي ﷺ
        if (key.startsWith('mohasba_salawat_') && !key.endsWith('_lifetime')) {
            try {
                const salData = JSON.parse(localStorage.getItem(key));
                if (salData.total) {
                    if (salData.total >= 1000) total += 10;
                    else if (salData.total >= 500) total += 8;
                    else if (salData.total >= 100) total += 6;
                    else if (salData.total >= 50) total += 4;
                    else if (salData.total >= 10) total += 2;
                    else if (salData.total > 0) total += 1;
                }
            } catch(e) {}
        }

        // نقاط الوقت
        if (key.startsWith('mohasba_time_')) {
            try {
                const tData = JSON.parse(localStorage.getItem(key));
                total += Math.min(tData.points || 0, TIME_POINTS_MAX);
            } catch(e) {}
        }
    }

    return total;
}

function getCurrentRank() {
    const pts = getLifetimePoints();
    let current = MEMBERSHIP_RANKS[0];
    for (const rank of MEMBERSHIP_RANKS) {
        if (pts >= rank.req) current = rank;
    }
    return current;
}

function getNextRank() {
    const pts = getLifetimePoints();
    for (const rank of MEMBERSHIP_RANKS) {
        if (pts < rank.req) return rank;
    }
    return null;
}

function hasFeature(featureId) {
    const rank = getCurrentRank();
    return rank.features.includes(featureId);
}

function updateMembershipPreview() {
    const rank = getCurrentRank();
    const next = getNextRank();
    const pts = getLifetimePoints();

    const iconEl = document.getElementById('membership-rank-icon');
    const nameEl = document.getElementById('membership-rank-name');
    const textEl = document.getElementById('membership-progress-text');
    const barEl = document.getElementById('membership-progress-bar');

    if (iconEl) iconEl.textContent = rank.icon;
    if (nameEl) {
        nameEl.textContent = rank.name;
        nameEl.style.color = rank.color;
    }
    if (next && barEl) {
        const progress = Math.min(Math.round(((pts - rank.req) / (next.req - rank.req)) * 100), 100);
        textEl.textContent = `${pts} / ${next.req} نقطة للرتبة التالية (${next.name})`;
        barEl.style.width = progress + '%';
        barEl.style.background = rank.color;
    } else if (!next && textEl) {
        textEl.textContent = `${pts} نقطة - أعلى رتبة! 🎉`;
        if (barEl) {
            barEl.style.width = '100%';
            barEl.style.background = rank.color;
        }
    }
}

function openMembershipModal() {
    document.getElementById('membership-modal').classList.remove('hidden');
    renderMembershipModal();
}

function closeMembershipModal() {
    document.getElementById('membership-modal').classList.add('hidden');
}

function renderMembershipModal() {
    const pts = getLifetimePoints();
    const current = getCurrentRank();

    // العرض الحالي
    const currentEl = document.getElementById('membership-current');
    if (currentEl) {
        currentEl.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 8px;">${current.icon}</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: ${current.color};">${current.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${pts.toLocaleString()} نقطة مكتسبة</div>
        `;
    }

    // قائمة الرتب
    const listEl = document.getElementById('membership-ranks-list');
    if (listEl) {
        listEl.innerHTML = MEMBERSHIP_RANKS.map(rank => {
            const isCurrent = rank.id === current.id;
            const isUnlocked = pts >= rank.req;
            const statusClass = isCurrent ? 'current' : (isUnlocked ? '' : 'locked');
            const badgeClass = isCurrent ? 'current-badge' : (isUnlocked ? 'unlocked-badge' : 'locked-badge');
            const badgeText = isCurrent ? 'الحالية' : (isUnlocked ? '✓ مفتوحة' : rank.reqText);

            return `
              <div class="membership-rank-card ${statusClass}">
                <div class="membership-rank-icon">${rank.icon}</div>
                <div class="membership-rank-info">
                  <div class="membership-rank-title" style="color: ${isUnlocked ? rank.color : 'var(--text-secondary)'};">${rank.name}</div>
                  <div class="membership-rank-req">${rank.reqText}</div>
                </div>
                <div class="membership-rank-badge ${badgeClass}">${badgeText}</div>
              </div>`;
        }).join('');
    }

    // الميزات المفتوحة
    const featuresEl = document.getElementById('membership-unlocked');
    if (featuresEl) {
        const allFeatures = Object.entries(MEMBERSHIP_FEATURES);
        featuresEl.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 8px; color: var(--text-primary);"><i class="fa-solid fa-lock-open" style="color: #16a34a;"></i> ميزات رتبتك</div>
          ${allFeatures.map(([id, feat]) => {
              const unlocked = current.features.includes(id);
              return `
                <div class="membership-feature-item ${unlocked ? 'unlocked' : 'locked-feature'}">
                  <span class="membership-feature-icon">${unlocked ? '✅' : '🔒'}</span>
                  <span>${feat.icon} ${feat.name}</span>
                </div>`;
          }).join('')}
        `;
    }
}

// =========================================
// تتبع الوقت المقضي على الموقع + نقاط
// =========================================
let timeTrackerInterval = null;
let timeSpentSeconds = 0;
const TIME_POINTS_RATE = 3;           // كل 3 دقائق = 1 نقطة
const TIME_POINTS_MAX = 15;           // أقصى نقاط من الوقت في اليوم

function loadTimeData(dateObj) {
    const d = dateObj || window.currentDate || getZeftaNow();
    const key = `mohasba_time_${getDateKey(d)}`;
    const raw = localStorage.getItem(key);
    try {
        return raw ? JSON.parse(raw) : { seconds: 0, points: 0 };
    } catch(e) {
        return { seconds: 0, points: 0 };
    }
}

function saveTimeData(data) {
    const key = `mohasba_time_${getDateKey(getZeftaNow())}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function getTimePoints() {
    const data = loadTimeData();
    return Math.min(data.points || 0, TIME_POINTS_MAX);
}

function getTimeMaxPoints() { return TIME_POINTS_MAX; }

function startTimeTracker() {
    const saved = loadTimeData(getZeftaNow());
    timeSpentSeconds = saved.seconds || 0;
    updateTimeDisplay();

    let lastPoints = Math.min(Math.floor(timeSpentSeconds / (TIME_POINTS_RATE * 60)), TIME_POINTS_MAX);

    if (timeTrackerInterval) clearInterval(timeTrackerInterval);
    timeTrackerInterval = setInterval(() => {
        timeSpentSeconds++;
        // كل TIME_POINTS_RATE دقائق = 1 نقطة
        const newPoints = Math.min(Math.floor(timeSpentSeconds / (TIME_POINTS_RATE * 60)), TIME_POINTS_MAX);
        const data = { seconds: timeSpentSeconds, points: newPoints };
        saveTimeData(data);
        updateTimeDisplay();

        if (newPoints !== lastPoints) {
            lastPoints = newPoints;
            if (typeof updateGlobalScore === 'function') updateGlobalScore();
        }
    }, 1000);
}

function updateTimeDisplay() {
    const mins = Math.floor(timeSpentSeconds / 60);
    const secs = timeSpentSeconds % 60;
    const display = document.getElementById('time-spent-value');
    const trackerEl = document.getElementById('time-tracker-display');
    if (display) {
        display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (trackerEl) {
        if (timeSpentSeconds > 10) {
            trackerEl.classList.add('tracking');
        }
    }
}

function updateTotalPoints() {
    const data = calculateScoreAndSummary();

    // النقاط الفعلية من كل المصادر (الوقت مضمن مسبقاً في summary من خلال Override)
    let totalPts = 0;
    for (const key in data.summary) {
        totalPts += data.summary[key][0];
    }

    const el = document.getElementById('total-points-value');
    if (el) el.textContent = totalPts;

    // تحديث بطاقة العضوية
    updateMembershipPreview();
}

// =========================================
// تحسينات لنظام النقاط - مكافآت إضافية
// =========================================

function getTimeBonusBreakdown() {
    const data = loadTimeData();
    const mins = Math.floor(data.seconds / 60);
    const pts = Math.min(data.points, TIME_POINTS_MAX);
    return { minutes: mins, points: pts, max: TIME_POINTS_MAX };
}

function getDailySummaryFull() {
    const data = calculateScoreAndSummary();
    const timeData = loadTimeData();
    const timePts = Math.min(timeData.points, TIME_POINTS_MAX);
    const timeMins = Math.floor(timeData.seconds / 60);

    let totalPts = 0;
    for (const key in data.summary) {
        totalPts += data.summary[key][0];
    }

    return {
        percentage: data.percentage,
        summary: data.summary,
        time: { minutes: timeMins, points: timePts, max: TIME_POINTS_MAX },
        totalPoints: totalPts
    };
}

// =========================================
// مودال تفاصيل النقاط
// =========================================
function openPointsDetailModal() {
    document.getElementById('points-detail-modal').classList.remove('hidden');
    const btn = document.getElementById('filter-completed-btn');
    if (btn) btn.classList.toggle('active', filterCompletedOnly);
    renderPointsDetail();
}

function closePointsDetailModal() {
    document.getElementById('points-detail-modal').classList.add('hidden');
}

let filterCompletedOnly = false;
function toggleFilterCompleted() {
    filterCompletedOnly = !filterCompletedOnly;
    const btn = document.getElementById('filter-completed-btn');
    if (btn) btn.classList.toggle('active', filterCompletedOnly);
    document.querySelectorAll('#points-detail-list .points-detail-item').forEach(item => {
        if (filterCompletedOnly && item.dataset.completed !== '1') {
            item.classList.add('filter-hidden');
        } else {
            item.classList.remove('filter-hidden');
        }
    });
    document.querySelectorAll('#points-detail-list .points-detail-category').forEach(cat => {
        const visibleItems = cat.querySelectorAll('.points-detail-item:not(.filter-hidden)');
        cat.style.display = visibleItems.length === 0 ? 'none' : '';
    });
}

function renderPointsDetail() {
    try {
    const listEl = document.getElementById('points-detail-list');
    const summaryEl = document.getElementById('points-detail-summary');
    if (!listEl) return;

    let html = '';
    let totalEarned = 0;
    let totalMax = 0;

    // 1. الصلوات المفروضة
    let prayerHtml = '';
    let prayerEarned = 0;
    let prayerMax = 0;
    document.querySelectorAll('.prayer-item').forEach(card => {
        const prayerBox = card.querySelector('.task-box');
        if (!prayerBox) return;
        const prayerBtns = Array.from(prayerBox.querySelectorAll('.prayer-btn')).filter(btn => window.getComputedStyle(btn).display !== 'none');
        if (prayerBtns.length === 0) return;
        const prayerName = card.querySelector('.prayer-name')?.textContent?.trim() || '';
        
        prayerBtns.forEach(btn => {
            const pts = parseInt(btn.getAttribute('data-points') || 0);
            const isActive = btn.classList.contains('active');
            prayerMax += pts;
            if (isActive) prayerEarned += pts;
            
            const btnText = btn.textContent.trim().replace(/\d+\+?\s*نقاط?/, '').trim();
            prayerHtml += `
              <div class="points-detail-item" data-completed="${isActive ? '1' : '0'}">
                <div class="detail-icon">${isActive ? '🕌' : '⬜'}</div>
                <div class="detail-name">${prayerName} - ${btnText}</div>
                <div class="detail-points ${isActive ? 'earned' : 'pending'}">${isActive ? '+' + pts : pts}</div>
                ${isActive ? '<button class="detail-undo" onclick="event.stopPropagation(); undoPrayerBtn(this)" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
              </div>`;
        });
    });
    if (prayerHtml) {
        totalEarned += prayerEarned;
        totalMax += prayerMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(59,130,246,0.1);color:#3b82f6;"><i class="fa-solid fa-mosque"></i> الصلوات (${prayerEarned}/${prayerMax})</div>
            ${prayerHtml}
          </div>`;
    }

    // 2. النوافل (Toggle buttons)
    let sunnaHtml = '';
    let sunnaEarned = 0;
    let sunnaMax = 0;
    document.querySelectorAll('.task-btn.toggle-btn').forEach(btn => {
        const pts = parseInt(btn.getAttribute('data-points') || 0);
        const isActive = btn.classList.contains('active');
        sunnaMax += pts;
        if (isActive) sunnaEarned += pts;
        
        const btnText = btn.textContent.trim().replace(/\d+\+?\s*نقاط?/, '').trim();
        sunnaHtml += `
          <div class="points-detail-item" data-completed="${isActive ? '1' : '0'}">
            <div class="detail-icon">${isActive ? '✅' : '⬜'}</div>
            <div class="detail-name">${btnText}</div>
            <div class="detail-points ${isActive ? 'earned' : 'pending'}">${isActive ? '+' + pts : pts}</div>
            ${isActive ? '<button class="detail-undo" onclick="event.stopPropagation(); undoToggleBtn(this)" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
          </div>`;
    });
    if (sunnaHtml) {
        totalEarned += sunnaEarned;
        totalMax += sunnaMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(34,197,94,0.1);color:#16a34a;"><i class="fa-solid fa-check-double"></i> السنن والنوافل (${sunnaEarned}/${sunnaMax})</div>
            ${sunnaHtml}
          </div>`;
    }

    // 3. الأذكار
    let adhkarHtml = '';
    let adhkarEarned = 0;
    let adhkarMax = 0;
    (window.ADHKAR_TYPES || []).forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (!progress) return;
        const isComplete = progress.style.width === '100%';
        const titleMap = {
            'wakeup': 'أذكار الاستيقاظ', 'morning': 'أذكار الصباح', 'evening': 'أذكار المساء',
            'post_fajr': 'بعد الفجر', 'post_dhuhr': 'بعد الظهر', 'post_asr': 'بعد العصر',
            'post_maghrib': 'بعد المغرب', 'post_isha': 'بعد العشاء'
        };
        adhkarMax += 2;
        if (isComplete) adhkarEarned += 2;
        
        adhkarHtml += `
          <div class="points-detail-item" data-completed="${isComplete ? '1' : '0'}">
            <div class="detail-icon">${isComplete ? '📿' : '⬜'}</div>
            <div class="detail-name">${titleMap[type] || type}</div>
            <div class="detail-points ${isComplete ? 'earned' : 'pending'}">${isComplete ? '+2' : '0'}</div>
            ${isComplete ? `<button class="detail-undo" onclick="event.stopPropagation(); undoAdhkarItem('${type}')" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>` : ''}
          </div>`;
    });
    if (adhkarHtml) {
        totalEarned += adhkarEarned;
        totalMax += adhkarMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(139,92,246,0.1);color:#8b5cf6;"><i class="fa-solid fa-book-quran"></i> الأذكار (${adhkarEarned}/${adhkarMax})</div>
            ${adhkarHtml}
          </div>`;
    }

    // 4. ركن العبادات (قيام، وتر، قرآن...)
    let ibadatHtml = '';
    let ibadatEarned = 0;
    let ibadatMax = 0;
    document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
        const pts = parseInt(box.getAttribute('data-points') || 0);
        const isDone = box.classList.contains('done');
        const name = box.querySelector('.ibada-title')?.textContent || '';
        ibadatMax += pts;
        if (isDone) ibadatEarned += pts;
        
        ibadatHtml += `
          <div class="points-detail-item" data-completed="${isDone ? '1' : '0'}">
            <div class="detail-icon">${isDone ? '✅' : '⬜'}</div>
            <div class="detail-name">${name}</div>
            <div class="detail-points ${isDone ? 'earned' : 'pending'}">${isDone ? '+' + pts : pts}</div>
            ${isDone ? '<button class="detail-undo" onclick="event.stopPropagation(); undoIbadatBox(this)" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
          </div>`;
    });
    if (ibadatHtml) {
        totalEarned += ibadatEarned;
        totalMax += ibadatMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(245,158,11,0.1);color:#f59e0b;"><i class="fa-solid fa-star"></i> ركن العبادات (${ibadatEarned}/${ibadatMax})</div>
            ${ibadatHtml}
          </div>`;
    }

    // 5. العبادات الإضافية
    let extraHtml = '';
    let extraEarned = 0;
    let extraMax = 0;
    document.querySelectorAll('.extra-worship-item').forEach(item => {
        const pts = parseInt(item.getAttribute('data-points') || 0);
        const isDone = item.classList.contains('done');
        const name = item.querySelector('.ibada-title')?.textContent || '';
        extraMax += pts;
        if (isDone) extraEarned += pts;
        
        extraHtml += `
          <div class="points-detail-item" data-completed="${isDone ? '1' : '0'}">
            <div class="detail-icon">${isDone ? '✅' : '⬜'}</div>
            <div class="detail-name">${name}</div>
            <div class="detail-points ${isDone ? 'earned' : 'pending'}">${isDone ? '+' + pts : pts}</div>
            ${isDone ? '<button class="detail-undo" onclick="event.stopPropagation(); undoExtraWorship(this)" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
          </div>`;
    });
    if (extraHtml) {
        totalEarned += extraEarned;
        totalMax += extraMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(168,85,247,0.1);color:#a855f7;"><i class="fa-solid fa-plus-circle"></i> العبادات الإضافية (${extraEarned}/${extraMax})</div>
            ${extraHtml}
          </div>`;
    }

    // 6. الأذكار والنوافل المخصصة
    const customData = loadCustomAdhkar();
    let customHtml = '';
    let customEarned = 0;
    let customMax = 0;
    (customData.items || []).forEach((item, i) => {
        customMax += item.points || 0;
        if (item.done) customEarned += item.points || 0;
        
        customHtml += `
          <div class="points-detail-item" data-completed="${item.done ? '1' : '0'}">
            <div class="detail-icon">${item.done ? '✅' : '⬜'}</div>
            <div class="detail-name">${item.name} ${item.time ? '(' + item.time + ')' : ''}</div>
            <div class="detail-points ${item.done ? 'earned' : 'pending'}">${item.done ? '+' + item.points : item.points}</div>
            ${item.done ? '<button class="detail-undo" onclick="event.stopPropagation(); undoCustomDhikr(' + i + '); renderPointsDetail();" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
          </div>`;
    });
    if (customHtml) {
        totalEarned += customEarned;
        totalMax += customMax;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(139,92,246,0.1);color:#8b5cf6;"><i class="fa-solid fa-spell-check"></i> أذكار ونوافل مخصصة (${customEarned}/${customMax})</div>
            ${customHtml}
          </div>`;
    }

    // 7. إحياء السُّنة
    const sunnahData = getSunnahData();
    let sunnahHtml = '';
    let sunnahEarned = 0;
    let sunnahMaxPts = getSunnahMaxPoints();
    SUNNAH_ITEMS.forEach(item => {
        const isDone = sunnahData[item.id] === true;
        if (isDone) sunnahEarned += item.points;
        
        sunnahHtml += `
          <div class="points-detail-item" data-completed="${isDone ? '1' : '0'}">
            <div class="detail-icon">${isDone ? item.icon : '⬜'}</div>
            <div class="detail-name">${item.name}</div>
            <div class="detail-points ${isDone ? 'earned' : 'pending'}">${isDone ? '+' + item.points : item.points}</div>
            ${isDone ? '<button class="detail-undo" onclick="event.stopPropagation(); undoSunnahItem(\'' + item.id + '\'); renderPointsDetail();" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>' : ''}
          </div>`;
    });
    if (sunnahHtml) {
        totalEarned += sunnahEarned;
        totalMax += sunnahMaxPts;
        html += `
          <div class="points-detail-category">
            <div class="points-detail-category-title" style="background:rgba(234,179,8,0.1);color:#eab308;"><i class="fa-solid fa-sun"></i> إحياء السُّنة (${sunnahEarned}/${sunnahMaxPts})</div>
            ${sunnahHtml}
          </div>`;
    }

    // 8. الصلاة على النبي ﷺ
    const salawatPts = getSalawatScore();
    const salawatMaxPts = getSalawatMaxPoints();
    totalEarned += salawatPts;
    totalMax += salawatMaxPts;
    html += `
      <div class="points-detail-category" data-category="salawat">
        <div class="points-detail-category-title" style="background:rgba(168,85,247,0.1);color:#a855f7;"><i class="fa-solid fa-star-and-crescent"></i> الصلاة على النبي ﷺ (${salawatPts}/${salawatMaxPts})</div>
        <div class="points-detail-item" data-completed="${salawatPts > 0 ? '1' : '0'}">
          <div class="detail-icon">${salawatPts > 0 ? '🌟' : '⬜'}</div>
          <div class="detail-name">صلاة على النبي ﷺ</div>
          <div class="detail-points ${salawatPts > 0 ? 'earned' : 'pending'}">${salawatPts > 0 ? '+' + salawatPts : salawatMaxPts}</div>
        </div>
      </div>`;

    // 9. الوقت المقضي
    const timePts = getTimePoints();
    const timeMaxPts = getTimeMaxPoints();
    const timeData = loadTimeData();
    const mins = Math.floor(timeData.seconds / 60);
    totalEarned += timePts;
    totalMax += timeMaxPts;
    html += `
      <div class="points-detail-category" data-category="time">
        <div class="points-detail-category-title" style="background:rgba(59,130,246,0.1);color:#3b82f6;"><i class="fa-solid fa-clock"></i> الوقت المقضي (${timePts}/${timeMaxPts})</div>
        <div class="points-detail-item" data-completed="${timePts > 0 ? '1' : '0'}">
          <div class="detail-icon">⏱️</div>
          <div class="detail-name">${mins} دقيقة على الموقع</div>
          <div class="detail-points ${timePts > 0 ? 'earned' : 'pending'}">${timePts > 0 ? '+' + timePts : timeMaxPts}</div>
        </div>
      </div>`;

    // الملخص
    const pct = totalMax === 0 ? 0 : Math.round((totalEarned / totalMax) * 100);
    summaryEl.innerHTML = `
      <div style="font-size:2.5rem; font-weight:800; color:${pct >= 50 ? '#16a34a' : '#ef4444'};">${pct}%</div>
      <div style="font-size:0.9rem; color:var(--text-secondary);">${totalEarned} من ${totalMax} نقطة</div>
      <div style="width:100%;height:6px;border-radius:3px;background:rgba(0,0,0,0.08);margin-top:8px;overflow:hidden;">
        <div style="height:100%;border-radius:3px;background:${pct >= 50 ? '#16a34a' : '#ef4444'};width:${pct}%;"></div>
      </div>
    `;

    listEl.innerHTML = html || '<p style="text-align:center;color:var(--text-secondary);">لم تُنجز أي عبادة اليوم بعد</p>';

    if (filterCompletedOnly) {
        listEl.querySelectorAll('.points-detail-item').forEach(item => {
            if (item.dataset.completed !== '1') item.classList.add('filter-hidden');
        });
        listEl.querySelectorAll('.points-detail-category').forEach(cat => {
            const vis = cat.querySelectorAll('.points-detail-item:not(.filter-hidden)');
            cat.style.display = vis.length === 0 ? 'none' : '';
        });
    }
    } catch(e) {
        console.error('renderPointsDetail error:', e);
        const listEl = document.getElementById('points-detail-list');
        if (listEl) listEl.innerHTML = '<p style="text-align:center;color:#ef4444;">حدث خطأ في تحميل التفاصيل</p>';
    }
}

// دوال التراجع من داخل المودال
function undoPrayerBtn(btnEl) {
    const item = btnEl.closest('.points-detail-item');
    const name = item.querySelector('.detail-name')?.textContent || '';
    // البحث عن الزر الفعلي في الصفحة
    document.querySelectorAll('.prayer-btn.active').forEach(btn => {
        const btnText = btn.textContent.trim().replace(/\d+\+?\s*نقاط?/, '').trim();
        if (name.includes(btnText) || btnText.includes(name.split(' - ').pop())) {
            btn.classList.remove('active');
        }
    });
    saveData();
    updateGlobalScore();
    renderPointsDetail();
}

function undoToggleBtn(btnEl) {
    const item = btnEl.closest('.points-detail-item');
    const name = item.querySelector('.detail-name')?.textContent || '';
    document.querySelectorAll('.toggle-btn.active').forEach(btn => {
        const btnText = btn.textContent.trim().replace(/\d+\+?\s*نقاط?/, '').trim();
        if (name.includes(btnText) || btnText.includes(name)) {
            btn.classList.remove('active');
        }
    });
    saveData();
    updateGlobalScore();
    renderPointsDetail();
}

function undoIbadatBox(btnEl) {
    const item = btnEl.closest('.points-detail-item');
    const name = item.querySelector('.detail-name')?.textContent || '';
    document.querySelectorAll('.ibada-box[data-id].done').forEach(box => {
        const boxName = box.querySelector('.ibada-title')?.textContent || '';
        if (boxName === name || name.includes(boxName.split(' (')[0])) {
            box.classList.remove('done');
        }
    });
    saveIbadatData();
    updateGlobalScore();
    renderPointsDetail();
}

function undoExtraWorship(btnEl) {
    const item = btnEl.closest('.points-detail-item');
    const name = item.querySelector('.detail-name')?.textContent || '';
    document.querySelectorAll('.extra-worship-item.done').forEach(el => {
        const elName = el.querySelector('.ibada-title')?.textContent || '';
        if (elName === name || name.includes(elName)) {
            el.classList.remove('done');
            el.querySelector('.task-btn')?.classList.remove('active');
        }
    });
    saveExtras();
    updateGlobalScore();
    renderPointsDetail();
}

function undoAdhkarItem(type) {
    const progress = document.getElementById(`progress-${type}`);
    if (progress) progress.style.width = '0%';
    const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
    if (btn) btn.classList.remove('completed');
    const adhkarList = document.getElementById('adhkar-list');
    if (adhkarList) {
        adhkarList.querySelectorAll('.adhkar-item').forEach(el => el.classList.remove('completed'));
    }
    saveData();
    updateGlobalScore();
    renderPointsDetail();
}

// =========================================
// الدايلي تودو الإسلامي - مهام اليوم
// =========================================

const DAILY_TODO_TASKS = [
    { id: 'fajr_on_time', text: 'صلاة الفجر على الوقت', points: 2, time: 'morning' },
    { id: 'morning_adhkar', text: 'قراءة أذكار الصباح', points: 2, time: 'morning' },
    { id: 'duha_prayer', text: 'صلاة الضحى', points: 2, time: 'morning' },
    { id: 'quran_pages', text: 'قراءة القرآن (صفحة على الأقل)', points: 2, time: 'general' },
    { id: 'istighfar_100', text: 'الاستغفار 100 مرة', points: 1, time: 'general' },
    { id: 'charity', text: 'صدقة يومية', points: 1, time: 'general' },
    { id: 'evening_adhkar', text: 'قراءة أذكار المساء', points: 2, time: 'evening' },
    { id: 'isha_on_time', text: 'صلاة العشاء في الوقت', points: 2, time: 'evening' },
    { id: 'witr', text: 'صلاة الوتر', points: 2, time: 'evening' },
    { id: 'salawat_10', text: 'الصلاة على النبي ﷺ 10 مرات', points: 1, time: 'evening' },
];

function getDailyTodoStorageKey() {
    const d = window.getZeftaNow ? getZeftaNow() : new Date();
    return `mohasba_daily_todo_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadDailyTodoProgress() {
    const key = getDailyTodoStorageKey();
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}

function saveDailyTodoProgress(progress) {
    localStorage.setItem(getDailyTodoStorageKey(), JSON.stringify(progress));
}

function isEvening() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const h = now.getHours();
    return h >= 16;
}

function renderDailyTodo() {
    const list = document.getElementById('daily-todo-list');
    const bar = document.getElementById('daily-todo-bar');
    const count = document.getElementById('daily-todo-count');
    const doneMsg = document.getElementById('daily-todo-done-msg');
    if (!list) return;

    const progress = loadDailyTodoProgress();
    const evening = isEvening();

    const visibleTasks = DAILY_TODO_TASKS.filter(t => {
        if (evening) return true;
        return t.time !== 'evening';
    });

    const completedCount = visibleTasks.filter(t => progress[t.id]).length;
    const total = visibleTasks.length;

    list.innerHTML = visibleTasks.map(t => {
        const done = !!progress[t.id];
        return `<div class="daily-todo-item ${t.time} ${done ? 'done' : ''}" onclick="toggleDailyTodo('${t.id}')">
            <div class="daily-todo-check">${done ? '<i class="fa-solid fa-check"></i>' : ''}</div>
            <span class="daily-todo-text">${t.text}</span>
            <span class="daily-todo-points">+${t.points}</span>
        </div>`;
    }).join('');

    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = `${completedCount}/${total}`;

    if (doneMsg) {
        if (completedCount === total && total > 0) {
            doneMsg.style.display = 'block';
            list.style.display = 'none';
        } else {
            doneMsg.style.display = 'none';
            list.style.display = 'flex';
        }
    }
}

function toggleDailyTodo(taskId) {
    const progress = loadDailyTodoProgress();
    progress[taskId] = !progress[taskId];
    saveDailyTodoProgress(progress);
    renderDailyTodo();
}

// =========================================
// الإحصائيات المقارنة
// =========================================

let statsCurrentPeriod = 'week';

function getDayData(dateStr) {
    try { return JSON.parse(localStorage.getItem('mohasba_data_' + dateStr)) || null; } catch { return null; }
}

function getDateRange(daysAgo) {
    const dates = [];
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    for (let i = daysAgo; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    return dates;
}

function getWeekRanges() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const dayOfWeek = now.getDay();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - dayOfWeek);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeek = [], lastWeek = [];
    for (let i = 0; i < 7; i++) {
        const d1 = new Date(thisWeekStart); d1.setDate(d1.getDate() + i);
        thisWeek.push(`${d1.getFullYear()}-${d1.getMonth() + 1}-${d1.getDate()}`);
        const d2 = new Date(lastWeekStart); d2.setDate(d2.getDate() + i);
        lastWeek.push(`${d2.getFullYear()}-${d2.getMonth() + 1}-${d2.getDate()}`);
    }
    return { current: thisWeek, previous: lastWeek };
}

function getMonthRanges() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const thisMonth = [], lastMonth = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const daysInLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        if (d <= now) thisMonth.push(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    for (let i = 1; i <= daysInLastMonth; i++) {
        const d = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), i);
        lastMonth.push(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
    return { current: thisMonth, previous: lastMonth };
}

function calcStats(dates) {
    let totalScore = 0, fastingDays = 0, daysActive = 0, totalAdhkar = 0;
    let bestDayScore = 0, bestDayStr = '';

    dates.forEach(dateStr => {
        const data = getDayData(dateStr);
        if (!data) return;
        const score = data.score || 0;
        totalScore += score;
        if (data.fasting) fastingDays++;
        if (score > 0) daysActive++;
        if (score > bestDayScore) {
            bestDayScore = score;
            bestDayStr = dateStr;
        }
        if (data.adhkar) {
            Object.values(data.adhkar).forEach(v => { if (v) totalAdhkar++; });
        }
    });

    return { totalScore, fastingDays, daysActive, totalAdhkar, bestDayScore, bestDayStr, daysCount: dates.length };
}

function renderStatsModal() {
    const summaryCards = document.getElementById('stats-summary-cards');
    const compBars = document.getElementById('stats-comparison-bars');
    const bestDay = document.getElementById('stats-best-day');
    if (!summaryCards) return;

    const ranges = statsCurrentPeriod === 'week' ? getWeekRanges() : getMonthRanges();
    const current = calcStats(ranges.current);
    const previous = calcStats(ranges.previous);

    const avgCurrent = current.daysCount > 0 ? (current.totalScore / current.daysCount).toFixed(1) : 0;
    const avgPrevious = previous.daysCount > 0 ? (previous.totalScore / previous.daysCount).toFixed(1) : 0;
    const scoreDiff = current.totalScore - previous.totalScore;
    const scoreDiffPct = previous.totalScore > 0 ? Math.round((scoreDiff / previous.totalScore) * 100) : 0;

    summaryCards.innerHTML = `
        <div class="stats-summary-card">
            <div class="stats-label">مجموع النقاط</div>
            <div class="stats-value">${current.totalScore}</div>
            <div class="stats-change ${scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : 'same'}">
                ${scoreDiff > 0 ? '↑' : scoreDiff < 0 ? '↓' : '—'} ${Math.abs(scoreDiffPct)}% عن السابق
            </div>
        </div>
        <div class="stats-summary-card">
            <div class="stats-label">متوسط يومي</div>
            <div class="stats-value">${avgCurrent}</div>
            <div class="stats-change ${avgCurrent > avgPrevious ? 'up' : avgCurrent < avgPrevious ? 'down' : 'same'}">
                السابق: ${avgPrevious}
            </div>
        </div>
        <div class="stats-summary-card">
            <div class="stats-label">أيام النشاط</div>
            <div class="stats-value">${current.daysActive}/${current.daysCount}</div>
            <div class="stats-change ${current.daysActive > previous.daysActive ? 'up' : current.daysActive < previous.daysActive ? 'down' : 'same'}">
                السابق: ${previous.daysActive}/${previous.daysCount}
            </div>
        </div>
        <div class="stats-summary-card">
            <div class="stats-label">أيام الصيام</div>
            <div class="stats-value">${current.fastingDays}</div>
            <div class="stats-change ${current.fastingDays >= previous.fastingDays ? 'up' : 'down'}">
                السابق: ${previous.fastingDays}
            </div>
        </div>
    `;

    const metrics = [
        { label: 'النقاط', current: current.totalScore, previous: previous.totalScore },
        { label: 'الصيام', current: current.fastingDays, previous: previous.fastingDays },
        { label: 'الأذكار', current: current.totalAdhkar, previous: previous.totalAdhkar },
        { label: 'النشاط', current: current.daysActive, previous: previous.daysActive }
    ];

    const maxVal = Math.max(...metrics.map(m => Math.max(m.current, m.previous)), 1);

    compBars.innerHTML = metrics.map(m => {
        const cPct = (m.current / maxVal) * 100;
        const pPct = (m.previous / maxVal) * 100;
        return `<div class="stats-compare-row">
            <div class="stats-compare-label">${m.label}</div>
            <div class="stats-compare-bars">
                <div class="stats-bar-track"><div class="stats-bar-fill current" style="width:${cPct}%"></div></div>
                <div class="stats-bar-track"><div class="stats-bar-fill previous" style="width:${pPct}%"></div></div>
                <div class="stats-bar-legend"><span>الحالي: ${m.current}</span><span>السابق: ${m.previous}</span></div>
            </div>
        </div>`;
    }).join('');

    if (current.bestDayStr && current.bestDayScore > 0) {
        const parts = current.bestDayStr.split('-');
        bestDay.innerHTML = `<div class="stats-best-day-card">
            <div class="stats-label">أفضل يوم</div>
            <div class="stats-value">${parts[2]}/${parts[1]} — ${current.bestDayScore} نقطة</div>
        </div>`;
    } else {
        bestDay.innerHTML = '';
    }
}

function switchStatsPeriod(period) {
    statsCurrentPeriod = period;
    document.getElementById('stats-week-btn')?.classList.toggle('active', period === 'week');
    document.getElementById('stats-month-btn')?.classList.toggle('active', period === 'month');
    renderStatsModal();
}

function openStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) { modal.classList.remove('hidden'); renderStatsModal(); }
}

function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) modal.classList.add('hidden');
}

// =========================================
// التنبيهات الذكية
// =========================================

function getSmartReminders() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const hour = now.getHours();
    const reminders = [];
    const progress = loadDailyTodoProgress();

    const morningTasks = DAILY_TODO_TASKS.filter(t => t.time === 'morning');
    const eveningTasks = DAILY_TODO_TASKS.filter(t => t.time === 'evening');
    const generalTasks = DAILY_TODO_TASKS.filter(t => t.time === 'general');

    if (hour >= 6 && hour < 12) {
        morningTasks.forEach(t => {
            if (!progress[t.id]) reminders.push({ icon: 'fa-sun', text: `لم تكمل: ${t.text}` });
        });
    }

    if (hour >= 12 && hour < 16) {
        generalTasks.slice(0, 2).forEach(t => {
            if (!progress[t.id]) reminders.push({ icon: 'fa-book', text: `لا تنسَ: ${t.text}` });
        });
    }

    if (hour >= 16 || hour < 6) {
        eveningTasks.forEach(t => {
            if (!progress[t.id]) reminders.push({ icon: 'fa-moon', text: `فاتك: ${t.text}` });
        });
        if (!progress['charity']) reminders.push({ icon: 'fa-hand-holding-heart', text: 'صدقة يومية' });
    }

    const completedCount = DAILY_TODO_TASKS.filter(t => progress[t.id]).length;
    if (completedCount === 0 && hour >= 8) {
        reminders.unshift({ icon: 'fa-exclamation-circle', text: 'لم تنجز أي مهمة اليوم بعد!' });
    }

    return reminders.slice(0, 4);
}

function renderSmartReminders() {
    const card = document.getElementById('smart-reminder-card');
    const list = document.getElementById('smart-reminder-list');
    if (!card || !list) return;

    const reminders = getSmartReminders();
    if (reminders.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    list.innerHTML = reminders.map(r =>
        `<div class="smart-reminder-item"><i class="fa-solid ${r.icon}"></i><span>${r.text}</span></div>`
    ).join('');
}

// =========================================
// نظام الإنجازات والشارات
// =========================================

const BADGES_DEF = [
    { id: 'first_day', icon: '🌟', name: 'أول خطوة', desc: 'أول يوم في التطبيق', check: () => true },
    { id: 'perfect_day', icon: '💯', name: 'يوم مثالي', desc: 'حصلت على 100% في يوم واحد', check: () => { for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);const k=`mohasba_data_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.stats&&v.stats.totalScore>=100)return true;}catch{}}return false; }},
    { id: 'streak_3', icon: '🔥', name: '3 أيام', desc: 'سلسلة 3 أيام متتالية', check: () => calculateStreak() >= 3 || calculateBestStreak() >= 3 },
    { id: 'streak_7', icon: '⭐', name: 'أسبوع متكامل', desc: 'سلسلة 7 أيام متتالية', check: () => calculateStreak() >= 7 || calculateBestStreak() >= 7 },
    { id: 'streak_30', icon: '🏆', name: 'شهر كامل', desc: 'سلسلة 30 يوم متتالي', check: () => calculateStreak() >= 30 || calculateBestStreak() >= 30 },
    { id: 'streak_100', icon: '👑', name: 'مئة يوم', desc: 'سلسلة 100 يوم', check: () => calculateBestStreak() >= 100 },
    { id: 'streak_365', icon: '💎', name: 'سنة كاملة', desc: 'سلسلة 365 يوم', check: () => calculateBestStreak() >= 365 },
    { id: 'fast_mon_thu', icon: '🌙', name: 'صائم الإثنين والخميس', desc: 'صمت الإثنين والخميس مرة واحدة', check: () => { const fd=loadFastingDataRaw();let mon=false,thu=false;Object.keys(fd).forEach(k=>{if(!fd[k])return;const p=k.split('-');const d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));const day=d.getDay();if(day===1)mon=true;if(day===4)thu=true;});return mon&&thu; }},
    { id: 'fast_white', icon: '🕌', name: 'أيام بيض', desc: 'صمت الأيام البيض (13-14-15 هجري)', check: () => { const fd=loadFastingDataRaw();return fd['white_day_13'] && fd['white_day_14'] && fd['white_day_15']; }},
    { id: 'quran_30', icon: '📖', name: 'قارئ نشط', desc: 'قرأت 30 صفحة قرآن في يوم واحد', check: () => { for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);const ib=getIbadatData(d);if(ib&&ib.dynamic){const q=ib.dynamic.find(x=>x.name&&(x.name.includes('قرآن')||x.name.includes('quran')));if(q&&q.done)return true;}}return false; }},
    { id: 'adhkar_7', icon: '🤲', name: 'حافظ الأذكار', desc: 'أكملت أذكار الصباح 7 أيام', check: () => { let count=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=`mohasba_data_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.adhkar&&v.adhkar.morning&&v.adhkar.morning==='100%'){count++;if(count>=7)return true;}}catch{}count=0;}return false; }},
    { id: 'salawat_100', icon: '📿', name: 'صلاة على النبي', desc: 'صلّيت على النبي ﷺ 100 مرة', check: () => { try{const v=JSON.parse(localStorage.getItem('salawat_counter'));return v&&v.total>=100;}catch{return false;} }},
    { id: 'total_1000', icon: '🎖️', name: 'ألف نقطة', desc: 'مجموع نقاطك 1000 نقطة', check: () => { let total=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);const k=`mohasba_data_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.stats)total+=v.stats.totalScore||0;}catch{}if(total>=1000)return true;}return false; }},
    { id: 'rank_silver', icon: '🥈', name: 'رتبة فضية', desc: 'وصلت للرتبة الفضية (500 نقطة)', check: () => { try{const p=JSON.parse(localStorage.getItem('mohasba_user_profile'));return p&&p.lifetimePoints>=500;}catch{return false;} }},
    { id: 'rank_gold', icon: '🥇', name: 'رتبة ذهبية', desc: 'وصلت للرتبة الذهبية (2000 نقطة)', check: () => { try{const p=JSON.parse(localStorage.getItem('mohasba_user_profile'));return p&&p.lifetimePoints>=2000;}catch{return false;} }},
];

function loadFastingDataRaw() {
    try { return JSON.parse(localStorage.getItem('mohasba_fasting_data')) || {}; } catch { return {}; }
}

function getIbadatData(date) {
    const k = `ibadat_data_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
}

function loadEarnedBadges() {
    try { return JSON.parse(localStorage.getItem('mohasba_earned_badges')) || {}; } catch { return {}; }
}

function saveEarnedBadges(badges) {
    localStorage.setItem('mohasba_earned_badges', JSON.stringify(badges));
}

function checkAndAwardBadges() {
    const earned = loadEarnedBadges();
    let newAward = false;
    BADGES_DEF.forEach(b => {
        if (!earned[b.id] && b.check()) {
            earned[b.id] = { date: new Date().toLocaleDateString('ar-EG') };
            newAward = true;
        }
    });
    if (newAward) saveEarnedBadges(earned);
    return earned;
}

function renderBadgesModal() {
    const grid = document.getElementById('badges-grid');
    const countEl = document.getElementById('badges-earned-count');
    if (!grid) return;

    const earned = checkAndAwardBadges();
    const total = BADGES_DEF.length;
    const earnedCount = BADGES_DEF.filter(b => earned[b.id]).length;

    countEl.innerHTML = `<span style="font-size:1.4rem;font-weight:800;color:#f43f5e;">${earnedCount}</span> <span style="color:var(--text-secondary);">/ ${total} إنجاز مكتمل</span>`;

    grid.innerHTML = BADGES_DEF.map(b => {
        const isEarned = !!earned[b.id];
        return `<div class="badge-card ${isEarned ? 'earned' : 'locked'}">
            <span class="badge-icon">${b.icon}</span>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
            ${isEarned ? `<div class="badge-earned-date">✓ ${earned[b.id].date}</div>` : ''}
        </div>`;
    }).join('');
}

function renderBadgesPreview() {
    const icons = document.getElementById('badges-preview-icons');
    const text = document.getElementById('badges-preview-text');
    if (!icons) return;

    const earned = checkAndAwardBadges();
    const earnedBadges = BADGES_DEF.filter(b => earned[b.id]);
    const total = BADGES_DEF.length;

    icons.innerHTML = earnedBadges.slice(0, 6).map(b =>
        `<span style="font-size:1.2rem;" title="${b.name}">${b.icon}</span>`
    ).join('') || '<span style="font-size:0.8rem;color:var(--text-secondary);">لم تحصل على أي شارة بعد</span>';

    if (text) text.textContent = `${earnedBadges.length} من ${total} إنجاز`;
}

function openBadgesModal() {
    const modal = document.getElementById('badges-modal');
    if (modal) { modal.classList.remove('hidden'); renderBadgesModal(); }
}

function closeBadgesModal() {
    const modal = document.getElementById('badges-modal');
    if (modal) modal.classList.add('hidden');
}

// =========================================
// التقرير الأسبوعي
// =========================================

let weeklyReportText = '';

function getWeeklyReportData() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const dayOfWeek = now.getDay();
    const days = [];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - dayOfWeek + i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        let score = 0, fasting = false, adhkar = 0;
        try {
            const data = JSON.parse(localStorage.getItem('mohasba_data_' + key));
            if (data && data.stats) score = data.stats.totalScore || 0;
            if (data && data.adhkar) adhkar = Object.values(data.adhkar).filter(v => v === '100%').length;
        } catch {}
        const fastingData = loadFastingDataRaw();
        fasting = !!fastingData[key];
        days.push({ name: dayNames[d.getDay()], score, fasting, adhkar, date: d, isToday: d.toDateString() === now.toDateString() });
    }
    return days;
}

function renderWeeklyReportModal() {
    const container = document.getElementById('weekly-report-content');
    if (!container) return;

    const days = getWeeklyReportData();
    const totalScore = days.reduce((s, d) => s + d.score, 0);
    const avgScore = (totalScore / 7).toFixed(1);
    const bestDay = days.reduce((b, d) => d.score > b.score ? d : b, days[0]);
    const fastingCount = days.filter(d => d.fasting).length;
    const totalAdhkar = days.reduce((s, d) => s + d.adhkar, 0);
    const activeDays = days.filter(d => d.score > 0).length;

    const earned = checkAndAwardBadges();
    const newBadges = BADGES_DEF.filter(b => earned[b.id]).length;

    const maxScore = Math.max(...days.map(d => d.score), 1);

    let html = '';

    html += `<div class="weekly-report-section">
        <h4><i class="fa-solid fa-chart-line"></i> ملخص الأسبوع</h4>
        <div class="weekly-report-row"><span class="wr-label">مجموع النقاط</span><span class="wr-value">${totalScore}</span></div>
        <div class="weekly-report-row"><span class="wr-label">المتوسط اليومي</span><span class="wr-value">${avgScore}</span></div>
        <div class="weekly-report-row"><span class="wr-label">أيام النشاط</span><span class="wr-value">${activeDays}/7</span></div>
        <div class="weekly-report-row"><span class="wr-label">أفضل يوم</span><span class="wr-value">${bestDay.name} (${bestDay.score} نقطة)</span></div>
        <div class="weekly-report-row"><span class="wr-label">أيام الصيام</span><span class="wr-value">${fastingCount}/7</span></div>
        <div class="weekly-report-row"><span class="wr-label">إجمالي الأذكار</span><span class="wr-value">${totalAdhkar} مرة</span></div>
        <div class="weekly-report-row"><span class="wr-label">الشارات المكتسبة</span><span class="wr-value">${newBadges} شارة</span></div>
    </div>`;

    html += `<div class="weekly-report-section">
        <h4><i class="fa-solid fa-calendar-week"></i> تفاصيل الأيام</h4>
        ${days.map(d => `<div class="weekly-day-bar">
            <span class="day-name">${d.isToday ? '← اليوم' : d.name}</span>
            <div class="day-track"><div class="day-fill" style="width:${(d.score / maxScore) * 100}%"></div></div>
            <span class="day-score">${d.score}</span>
        </div>`).join('')}
    </div>`;

    container.innerHTML = html;

    weeklyReportText = `📊 تقريري الأسبوعي - محاسبة النفس\n━━━━━━━━━━━━━━━━━━\n`;
    weeklyReportText += `📈 مجموع النقاط: ${totalScore}\n`;
    weeklyReportText += `📊 المتوسط اليومي: ${avgScore}\n`;
    weeklyReportText += `🔥 أيام النشاط: ${activeDays}/7\n`;
    weeklyReportText += `🏆 أفضل يوم: ${bestDay.name} (${bestDay.score} نقطة)\n`;
    weeklyReportText += `🌙 أيام الصيام: ${fastingCount}\n`;
    weeklyReportText += `🤲 الأذكار: ${totalAdhkar} مرة\n`;
    weeklyReportText += `⭐ الشارات: ${newBadges}\n`;
    weeklyReportText += `━━━━━━━━━━━━━━━━━━\n`;
    days.forEach(d => {
        weeklyReportText += `${d.isToday ? '→' : ' '} ${d.name}: ${d.score} نقطة${d.fasting ? ' 🌙' : ''}\n`;
    });
    weeklyReportText += `━━━━━━━━━━━━━━━━━━\n`;
    weeklyReportText += `تطبيق محاسبة النفس 🤲`;
}

function copyWeeklyReport() {
    navigator.clipboard.writeText(weeklyReportText).then(() => {
        const btn = document.getElementById('weekly-report-copy-btn');
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ!'; setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-copy"></i> نسخ التقرير'; }, 2000); }
    }).catch(() => {});
}

function openWeeklyReportModal() {
    const modal = document.getElementById('weekly-report-modal');
    if (modal) { modal.classList.remove('hidden'); renderWeeklyReportModal(); }
}

function closeWeeklyReportModal() {
    const modal = document.getElementById('weekly-report-modal');
    if (modal) modal.classList.add('hidden');
}

// =========================================
// وضع الليل المريح
// =========================================

const NIGHT_MESSAGES = [
    'لا تنسَ أذكار النوم واذكر الله',
    'سبحان الله وبحمده... عدد خلقه ورضا نفسه',
    'توكّل على الله فهو خير الوكيل',
    'لا إله إلا الله وحده لا شريك له',
    'اللهم اجعل نومتك نعيمًا و-Semit عليك سلامًا',
    'من قالها مائة مرة كانت له نورًا يوم القيامة',
    'أسألك العافية في الدنيا والآخرة',
    'اللهم قني عذابك يوم تبعث عبادك',
];

function initNightMode() {
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const hour = now.getHours();
    const isNight = hour >= 20 || hour < 5;

    if (isNight) {
        document.documentElement.classList.add('night-comfort-mode');
        showNightBanner();
    } else {
        document.documentElement.classList.remove('night-comfort-mode');
    }
}

function showNightBanner() {
    if (localStorage.getItem('mohasba_night_banner_dismissed_today')) return;
    const now = window.getZeftaNow ? getZeftaNow() : new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (localStorage.getItem('mohasba_night_banner_' + todayKey)) return;

    const msg = NIGHT_MESSAGES[Math.floor(Math.random() * NIGHT_MESSAGES.length)];
    const existing = document.querySelector('.night-mode-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = 'night-mode-banner';
    banner.innerHTML = `
        <div class="night-icon">🌙</div>
        <div class="night-msg">${msg}</div>
        <button class="night-dismiss" onclick="dismissNightBanner()">شكراً، تذكّرني غداً</button>
    `;
    document.body.appendChild(banner);
    localStorage.setItem('mohasba_night_banner_' + todayKey, '1');
}

function dismissNightBanner() {
    const banner = document.querySelector('.night-mode-banner');
    if (banner) banner.style.display = 'none';
    const todayKey = getZeftaNow().toLocaleDateString('en-CA');
    localStorage.setItem('mohasba_night_banner_dismissed_today', todayKey);
}
