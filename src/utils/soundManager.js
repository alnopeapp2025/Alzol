// Utility to manage sounds based on settings
export const playSound = (type) => {
  // جلب الإعدادات المحفوظة أو استخدام الافتراضي
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { barcodeSound: true, clickSound: true };
  
  // التحقق من إعدادات المستخدم قبل التشغيل
  if (type === 'barcode' && !settings.barcodeSound) return;
  if (type === 'click' && !settings.clickSound) return;

  try {
    if (type === 'click') {
      // --- TEST SOUND (صوت تجريبي) ---
      // نستخدم رابط خارجي مضمون (Pop Sound) للتأكد من أن الكود يعمل
      // We use a reliable external URL to prove the code works
      const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
      
      // --- YOUR CUSTOM SOUND (صوتك الخاص) ---
      // عندما تريد تفعيل ملفك، احذف السطر أعلاه وفعل السطر أدناه:
      // When you want to use your file, remove the line above and uncomment below:
      // const audio = new Audio('/sound1.wav');
      
      audio.volume = 0.6;
      audio.play().catch(e => {
        console.warn("Click sound play failed:", e);
      });
    } else if (type === 'barcode') {
      // الإبقاء على صوت الباركود الإلكتروني (Beep) كما هو
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
