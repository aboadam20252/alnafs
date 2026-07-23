// =========================================================
// جسر الإشعارات (Native Notifications Bridge)
// =========================================================
// المشكلة اللي بيحلها الملف ده:
// نظام الإشعارات الحالي في script.js شغال بمنطق setInterval بيفحص الوقت
// كل دقيقة، وده بيشتغل بس والصفحة/التاب مفتوحة. لما التطبيق يتقفل تمامًا
// من أندرويد، الـ JS بتاعه بيوقف، فمفيش أي إشعار هيوصل.
//
// الحل: لما نكون جوه تطبيق Capacitor (مش متصفح عادي)، بنستخدم بلجن
// @capacitor/local-notifications اللي بيجدول الإشعار على مستوى نظام
// أندرويد نفسه (زي أي منبه)، فهيشتغل حتى لو التطبيق مقفول 100%.
//
// طريقة الاستخدام: ضيف السكريبت ده في index.html قبل script.js:
//   <script src="native-notifications.js"></script>
// وبعدين استبدل الاستدعاءات القديمة لـ requestNotificationPermission()
// و sendLocalNotification() بالدوال الجديدة الموجودة تحت (نفس الأسماء
// تقريبًا فبتفضل متوافقة مع باقي الكود من غير ما تغيّر حاجة كتير).
// =========================================================

(function () {
    const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

    // أرقام ثابتة لكل نوع إشعار متكرر، عشان لو المستخدم غيّر الميعاد
    // نقدر نلغي القديم ونجدول الجديد بدل ما يتكرروا فوق بعض
    const NOTIF_IDS = {
        morning: 1001,
        evening: 1002,
        wird: 1003,
        tomorrowWorship: 1004
    };

    // ---------------------------------------------------
    // طلب الإذن (بيغطي الحالتين: تطبيق أندرويد أو متصفح ويب)
    // ---------------------------------------------------
    window.requestNotificationPermissionUnified = async function () {
        if (isNative()) {
            const { LocalNotifications } = window.Capacitor.Plugins;
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } else {
            if (!('Notification' in window)) return false;
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
    };

    // ---------------------------------------------------
    // إشعار فوري لمرة واحدة (تجريبي، أو تنبيه لحظي)
    // ---------------------------------------------------
    window.sendLocalNotificationUnified = async function (title, body) {
        if (isNative()) {
            const { LocalNotifications } = window.Capacitor.Plugins;
            await LocalNotifications.schedule({
                notifications: [{
                    id: Math.floor(Math.random() * 100000) + 2000,
                    title,
                    body,
                    schedule: { at: new Date(Date.now() + 1000) } // بعد ثانية واحدة
                }]
            });
        } else {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: 'logo.png' });
            }
        }
    };

    // ---------------------------------------------------
    // جدولة إشعار يومي متكرر بميعاد ثابت (HH:MM)
    // ده البديل الحقيقي لمنطق setInterval القديم
    // ---------------------------------------------------
    window.scheduleDailyNotification = async function (key, title, body, timeHHMM) {
        if (!isNative()) return; // على المتصفح العادي بنسيب المنطق القديم (setInterval) شغال زي ما هو

        const { LocalNotifications } = window.Capacitor.Plugins;
        const id = NOTIF_IDS[key];
        if (!id) return;

        const [hour, minute] = timeHHMM.split(':').map(Number);

        // إلغاء أي جدولة قديمة بنفس الرقم قبل ما نحط الجديدة (عشان لو المستخدم غيّر الميعاد)
        await LocalNotifications.cancel({ notifications: [{ id }] });

        await LocalNotifications.schedule({
            notifications: [{
                id,
                title,
                body,
                schedule: {
                    on: { hour, minute }, // يتكرر كل يوم في نفس الميعاد ده تلقائيًا
                    allowWhileIdle: true
                }
            }]
        });
    };

    // ---------------------------------------------------
    // إلغاء إشعار متكرر معين (لو المستخدم قفل التنبيهات مثلاً)
    // ---------------------------------------------------
    window.cancelDailyNotification = async function (key) {
        if (!isNative()) return;
        const { LocalNotifications } = window.Capacitor.Plugins;
        const id = NOTIF_IDS[key];
        if (!id) return;
        await LocalNotifications.cancel({ notifications: [{ id }] });
    };

    window.isNativeApp = isNative;
})();
