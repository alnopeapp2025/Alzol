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
      // التأكد من استخدام الملف الجديد في مجلد public
      // تم رفع مستوى الصوت ليكون عالياً وواضحاً
      const audio = new Audio('/sound2.mp3');
      
      audio.volume = 1.0; 
      
      // إعادة تعيين الوقت لضمان التشغيل السريع عند النقر المتتابع
      audio.currentTime = 0;
      
      audio.play().catch(e => {
        console.warn("Click sound play failed:", e);
      });
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
