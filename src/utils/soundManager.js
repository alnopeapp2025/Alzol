// Utility to manage sounds based on settings
export const playSound = (type) => {
  // جلب الإعدادات المحفوظة أو استخدام الافتراضي
  const settings = JSON.parse(localStorage.getItem('appSettings')) || { barcodeSound: true, clickSound: true };
  
  // التحقق من إعدادات المستخدم قبل التشغيل
  if (type === 'barcode' && !settings.barcodeSound) return;
  if (type === 'click' && !settings.clickSound) return;

  try {
    if (type === 'click') {
      // تشغيل الملف الصوتي المخصص sound1.wav من مجلد public
      // المسار /sound1.wav يشير مباشرة إلى الملف الذي قمت برفعه في public
      const audio = new Audio('/sound1.wav');
      audio.volume = 5.6; // مستوى صوت مناسب
      audio.play().catch(e => {
        // تجاهل الأخطاء إذا لم يكن الملف قد حمل بالكامل بعد أو قيود المتصفح
        console.warn("Audio play failed or file not found:", e);
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
    console.error("Audio Context not supported", e);
  }
};
