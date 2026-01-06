// Utility to manage sounds based on settings
export const playSound = (type) => {
  // جلب الإعدادات المحفوظة أو استخدام الافتراضي
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { barcodeSound: true, clickSound: true };
  
  // التحقق من إعدادات المستخدم قبل التشغيل
  if (type === 'barcode' && !settings.barcodeSound) return;
  if (type === 'click' && !settings.clickSound) return;

  try {
    if (type === 'click') {
      // --- CUSTOM SOUND (sound2.mp3) ---
      // التأكد من استخدام الملف الجديد sound2.mp3
      const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
      
      // Cache Busting: Adding a version query param to force browser to re-download if changed
      const audioPath = `${baseUrl}sound2.mp3?v=3.0`; 
      
      const audio = new Audio(audioPath);
      audio.volume = 1.0; // أعلى مستوى للصوت
      
      // إعادة تعيين الوقت لضمان التشغيل السريع عند النقر المتتابع
      audio.currentTime = 0;
      
      // التعامل مع سياسات المتصفح التي قد تمنع التشغيل التلقائي
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Click sound play failed (browser policy):", error);
        });
      }
    } else if (type === 'barcode') {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "square";
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    }
  } catch (e) {
    console.error("Audio Error", e);
  }
};
