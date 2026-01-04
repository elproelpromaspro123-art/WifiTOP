export type Language = 'en' | 'es' | 'zh' | 'hi' | 'fr'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'WifiTOP',
    'header.tagline': 'Show off your WiFi speed',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': 'Show off your WiFi speed 🚀',
    'hero.description': 'Global ranking with 10,000+ users | Accurate measurements | Exclusive badges',
    'hero.cta': 'Speedtest with automatic fraud detection. Compete with users worldwide, unlock unique badges and prove you have the best connection.',

    // About
    'about.title': 'About WifiTOP',
    'about.subtitle': 'The ultimate internet speed testing platform with global ranking',
    'about.what_is': 'What is WifiTOP?',
    'about.what_is_desc': 'WifiTOP is the most advanced internet speed testing platform. Accurately measure your download, upload, ping and jitter using Cloudflare global servers. Compete in a ranking of 10,000+ users and unlock exclusive badges while maintaining integrity with automatic fraud detection.',
    'about.what_you_get': 'What You Get',
    'about.why': 'Why WifiTOP?',
    'about.why_desc': 'We are the only platform with automatic fraud detection, verified ranking and exclusive badges. With Cloudflare technology and real-time analysis, WifiTOP is your ultimate ally to measure, share and improve your internet connection.',

    // Features
    'features.title': 'Why WifiTOP',
    'features.f1': 'Accurate with Cloudflare',
    'features.f1_desc': 'Ultra precise measurements with 1GB data and global servers',
    'features.f2': 'Ranking 10,000+',
    'features.f2_desc': 'Compete against the best. Top 10,000 users in real time',
    'features.f3': 'Automatic Anti-Fraud',
    'features.f3_desc': 'Intelligent detection rejects suspicious results',
    'features.f4': '12+ Unlockable Badges',
    'features.f4_desc': 'Extreme Speedster, Gaming Beast, Stability King and more',

    // Stats
    'stats.completed': 'Tests Completed',
    'stats.max_speed': 'Max Speed',
    'stats.avg_speed': 'Average Speed',

    // Speed Test
    'speedtest.enter_name': 'Enter your name',
    'speedtest.start_test': 'Start Test',
    'speedtest.testing': 'Testing...',
    'speedtest.your_result': 'Your Current Result',
    'speedtest.download': 'DOWNLOAD',
    'speedtest.upload': 'UPLOAD',
    'speedtest.ping': 'PING',
    'speedtest.stability': 'Stability',
    'speedtest.jitter': 'Jitter',
    'speedtest.thanks': 'Thank you for participating',
    'speedtest.congrats': 'Congratulations! You made it to the top 1000 at position',

    // Validation
    'validation.name_required': 'Name is required',
    'validation.name_too_short': 'Name must be at least 2 characters',
    'validation.name_too_long': 'Name cannot exceed 30 characters',
    'validation.name_invalid_chars': 'Name contains invalid characters',
    'validation.name_bad_words': 'Name contains forbidden words',

    // Footer
    'footer.made_with': 'Made with ❤️ by the WifiTOP Team',
  },

  es: {
    // Header
    'header.title': 'WifiTOP',
    'header.tagline': 'Presume tu velocidad de WiFi',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': 'Presume tu velocidad de WiFi 🚀',
    'hero.description': 'Ranking global con 10,000+ usuarios | Mediciones precisas | Badges exclusivos',
    'hero.cta': 'Speedtest ultra preciso con detección automática de fraude. Compite con usuarios de todo el mundo, desbloquea badges únicos y demuestra que tienes la mejor conexión.',

    // About
    'about.title': 'Sobre WifiTOP',
    'about.subtitle': 'La plataforma definitiva de speedtest con ranking global',
    'about.what_is': '¿Qué es WifiTOP?',
    'about.what_is_desc': 'WifiTOP es la plataforma más avanzada de pruebas de velocidad de internet. Mide con precisión tu descarga, subida, ping y jitter usando servidores globales de Cloudflare. Compite en un ranking de 10,000+ usuarios y desbloquea badges exclusivos mientras mantienes la integridad con detección automática de fraude.',
    'about.what_you_get': 'Lo que Obtienes',
    'about.why': '¿Por qué WifiTOP?',
    'about.why_desc': 'Somos la única plataforma con detección automática de fraude, ranking verificado y badges exclusivos. Con tecnología de Cloudflare y análisis en tiempo real, WifiTOP es tu aliado definitivo para medir, compartir y mejorar tu conexión de internet.',

    // Features
    'features.title': 'Por qué WifiTOP',
    'features.f1': 'Preciso con Cloudflare',
    'features.f1_desc': 'Mediciones ultra precisas con 1GB de datos y servidores globales',
    'features.f2': 'Ranking 10,000+',
    'features.f2_desc': 'Compite contra los mejores. Top 10,000 usuarios en tiempo real',
    'features.f3': 'Anti-Fraude Automático',
    'features.f3_desc': 'Detección inteligente rechaza resultados sospechosos',
    'features.f4': '12+ Badges Desbloqueables',
    'features.f4_desc': 'Speedster Extremo, Gaming Beast, Stability King y más',

    // Stats
    'stats.completed': 'Pruebas Completadas',
    'stats.max_speed': 'Velocidad Máxima',
    'stats.avg_speed': 'Velocidad Promedio',

    // Speed Test
    'speedtest.enter_name': 'Ingresa tu nombre',
    'speedtest.start_test': 'Iniciar Prueba',
    'speedtest.testing': 'Probando...',
    'speedtest.your_result': 'Tu Resultado Actual',
    'speedtest.download': 'DESCARGA',
    'speedtest.upload': 'SUBIDA',
    'speedtest.ping': 'PING',
    'speedtest.stability': 'Estabilidad',
    'speedtest.jitter': 'Jitter',
    'speedtest.thanks': 'Gracias por participar',
    'speedtest.congrats': 'Felicidades! Entraste en el top 1000 en la posición',

    // Validation
    'validation.name_required': 'El nombre es requerido',
    'validation.name_too_short': 'El nombre debe tener al menos 2 caracteres',
    'validation.name_too_long': 'El nombre no puede exceder 30 caracteres',
    'validation.name_invalid_chars': 'El nombre contiene caracteres inválidos',
    'validation.name_bad_words': 'El nombre contiene palabras no permitidas',

    // Footer
    'footer.made_with': 'Hecho con ❤️ por el equipo WifiTOP',
  },

  zh: {
    // Header
    'header.title': 'WifiTOP',
    'header.tagline': '炫耀你的WiFi速度',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': '炫耀你的WiFi速度 🚀',
    'hero.description': '全球排名 10,000+ 用户 | 精确测量 | 独家徽章',
    'hero.cta': '超精确的测速，带有自动欺诈检测。与全球用户竞争，解锁独特徽章，证明你有最好的连接。',

    // About
    'about.title': '关于 WifiTOP',
    'about.subtitle': '具有全球排名的终极互联网速度测试平台',
    'about.what_is': 'WifiTOP 是什么？',
    'about.what_is_desc': 'WifiTOP 是最先进的互联网速度测试平台。使用 Cloudflare 全球服务器精确测量您的下载、上传、延迟和抖动。与 10,000+ 用户竞争并解锁独家徽章，同时通过自动欺诈检测保持完整性。',
    'about.what_you_get': '您会获得什么',
    'about.why': '为什么选择 WifiTOP？',
    'about.why_desc': '我们是唯一具有自动欺诈检测、经过验证的排名和独家徽章的平台。凭借 Cloudflare 技术和实时分析，WifiTOP 是您衡量、共享和改进互联网连接的最终盟友。',

    // Features
    'features.title': '为什么选择 WifiTOP',
    'features.f1': 'Cloudflare 精确',
    'features.f1_desc': '超精确测量，包含 1GB 数据和全球服务器',
    'features.f2': '排名 10,000+',
    'features.f2_desc': '与最好的竞争。实时前 10,000 用户',
    'features.f3': '自动反欺诈',
    'features.f3_desc': '智能检测拒绝可疑结果',
    'features.f4': '12+ 可解锁徽章',
    'features.f4_desc': '极速先驱、游戏野兽、稳定性之王等',

    // Stats
    'stats.completed': '完成的测试',
    'stats.max_speed': '最大速度',
    'stats.avg_speed': '平均速度',

    // Speed Test
    'speedtest.enter_name': '输入您的名字',
    'speedtest.start_test': '开始测试',
    'speedtest.testing': '测试中...',
    'speedtest.your_result': '您的当前结果',
    'speedtest.download': '下载',
    'speedtest.upload': '上传',
    'speedtest.ping': '延迟',
    'speedtest.stability': '稳定性',
    'speedtest.jitter': '抖动',
    'speedtest.thanks': '感谢您的参与',
    'speedtest.congrats': '恭喜！您进入了前 1000 名，排名',

    // Validation
    'validation.name_required': '名字是必需的',
    'validation.name_too_short': '名字至少需要 2 个字符',
    'validation.name_too_long': '名字不能超过 30 个字符',
    'validation.name_invalid_chars': '名字包含无效字符',
    'validation.name_bad_words': '名字包含禁止词汇',

    // Footer
    'footer.made_with': '由 WifiTOP 团队用 ❤️ 制作',
  },

  hi: {
    // Header
    'header.title': 'WifiTOP',
    'header.tagline': 'अपनी WiFi गति दिखाएं',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': 'अपनी WiFi गति दिखाएं 🚀',
    'hero.description': '10,000+ उपयोगकर्ताओं के साथ वैश्विक रैंकिंग | सटीक माप | विशेष बैज',
    'hero.cta': 'स्वचालित धोखाधड़ी का पता लगाने के साथ अल्ट्रा सटीक स्पीडटेस्ट। दुनियाभर के उपयोगकर्ताओं के साथ प्रतिस्पर्धा करें, अद्वितीय बैज अनलॉक करें और साबित करें कि आपके पास सर्वोत्तम कनेक्शन है।',

    // About
    'about.title': 'WifiTOP के बारे में',
    'about.subtitle': 'वैश्विक रैंकिंग के साथ अंतिम इंटरनेट गति परीक्षण मंच',
    'about.what_is': 'WifiTOP क्या है?',
    'about.what_is_desc': 'WifiTOP सबसे उन्नत इंटरनेट गति परीक्षण मंच है। Cloudflare ग्लोबल सर्वर का उपयोग करके अपनी डाउनलोड, अपलोड, पिंग और जिटर को सटीकता से मापें। 10,000+ उपयोगकर्ताओं के साथ प्रतिस्पर्धा करें और स्वचालित धोखाधड़ी का पता लगाने के साथ अद्वितीय बैज अनलॉक करें।',
    'about.what_you_get': 'आपको क्या मिलता है',
    'about.why': 'WifiTOP क्यों?',
    'about.why_desc': 'हम स्वचालित धोखाधड़ी का पता लगाने, सत्यापित रैंकिंग और विशेष बैज वाला एकमात्र मंच हैं। Cloudflare तकनीक और वास्तविक समय विश्लेषण के साथ, WifiTOP आपके इंटरनेट कनेक्शन को मापने, साझा करने और सुधारने का आपका अंतिम सहयोगी है।',

    // Features
    'features.title': 'WifiTOP क्यों?',
    'features.f1': 'Cloudflare के साथ सटीक',
    'features.f1_desc': '1GB डेटा और ग्लोबल सर्वर के साथ अल्ट्रा सटीक माप',
    'features.f2': 'रैंकिंग 10,000+',
    'features.f2_desc': 'सर्वश्रेष्ठ के साथ प्रतिस्पर्धा करें। वास्तविक समय में शीर्ष 10,000 उपयोगकर्ता',
    'features.f3': 'स्वचालित विरोधी धोखाधड़ी',
    'features.f3_desc': 'बुद्धिमान पहचान संदिग्ध परिणामों को अस्वीकार करती है',
    'features.f4': '12+ अनलॉक करने योग्य बैज',
    'features.f4_desc': 'एक्सट्रीम स्पीडस्टर, गेमिंग बीस्ट, स्टेबिलिटी किंग और अधिक',

    // Stats
    'stats.completed': 'पूर्ण परीक्षण',
    'stats.max_speed': 'अधिकतम गति',
    'stats.avg_speed': 'औसत गति',

    // Speed Test
    'speedtest.enter_name': 'अपना नाम दर्ज करें',
    'speedtest.start_test': 'परीक्षण शुरू करें',
    'speedtest.testing': 'परीक्षण चल रहा है...',
    'speedtest.your_result': 'आपका वर्तमान परिणाम',
    'speedtest.download': 'डाउनलोड',
    'speedtest.upload': 'अपलोड',
    'speedtest.ping': 'पिंग',
    'speedtest.stability': 'स्थिरता',
    'speedtest.jitter': 'जिटर',
    'speedtest.thanks': 'भाग लेने के लिए धन्यवाद',
    'speedtest.congrats': 'बधाई हो! आप शीर्ष 1000 में प्रवेश कर गए हैं',

    // Validation
    'validation.name_required': 'नाम आवश्यक है',
    'validation.name_too_short': 'नाम कम से कम 2 वर्ण होना चाहिए',
    'validation.name_too_long': 'नाम 30 वर्णों से अधिक नहीं हो सकता',
    'validation.name_invalid_chars': 'नाम में अमान्य वर्ण हैं',
    'validation.name_bad_words': 'नाम में प्रतिबंधित शब्द हैं',

    // Footer
    'footer.made_with': 'WifiTOP टीम द्वारा ❤️ से बनाया गया',
  },

  fr: {
    // Header
    'header.title': 'WifiTOP',
    'header.tagline': 'Montrez votre vitesse WiFi',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': 'Montrez votre vitesse WiFi 🚀',
    'hero.description': 'Classement mondial avec 10 000+ utilisateurs | Mesures précises | Badges exclusifs',
    'hero.cta': 'Test de vitesse ultra précis avec détection automatique des fraudes. Concourez avec les utilisateurs du monde entier, déverrouillez des badges uniques et prouvez que vous avez la meilleure connexion.',

    // About
    'about.title': 'À propos de WifiTOP',
    'about.subtitle': 'La plateforme ultime de test de vitesse Internet avec classement mondial',
    'about.what_is': 'Qu\'est-ce que WifiTOP?',
    'about.what_is_desc': 'WifiTOP est la plateforme de test de vitesse Internet la plus avancée. Mesurez avec précision votre téléchargement, votre chargement, votre ping et votre gigue en utilisant les serveurs mondiaux de Cloudflare. Concourez avec plus de 10 000 utilisateurs et déverrouillez des badges exclusifs tout en maintenant l\'intégrité avec la détection automatique des fraudes.',
    'about.what_you_get': 'Ce que vous obtenez',
    'about.why': 'Pourquoi WifiTOP?',
    'about.why_desc': 'Nous sommes la seule plateforme avec détection automatique des fraudes, classement vérifié et badges exclusifs. Avec la technologie Cloudflare et l\'analyse en temps réel, WifiTOP est votre allié ultime pour mesurer, partager et améliorer votre connexion Internet.',

    // Features
    'features.title': 'Pourquoi WifiTOP',
    'features.f1': 'Précis avec Cloudflare',
    'features.f1_desc': 'Mesures ultra précises avec données 1GB et serveurs mondiaux',
    'features.f2': 'Classement 10 000+',
    'features.f2_desc': 'Concourez contre les meilleurs. Top 10 000 utilisateurs en temps réel',
    'features.f3': 'Anti-fraude automatique',
    'features.f3_desc': 'La détection intelligente rejette les résultats suspects',
    'features.f4': '12+ Badges déverrouillables',
    'features.f4_desc': 'Speedster extrême, Beast de jeu, Roi de la stabilité et plus',

    // Stats
    'stats.completed': 'Tests complétés',
    'stats.max_speed': 'Vitesse maximale',
    'stats.avg_speed': 'Vitesse moyenne',

    // Speed Test
    'speedtest.enter_name': 'Entrez votre nom',
    'speedtest.start_test': 'Démarrer le test',
    'speedtest.testing': 'Test en cours...',
    'speedtest.your_result': 'Votre résultat actuel',
    'speedtest.download': 'TÉLÉCHARGEMENT',
    'speedtest.upload': 'TÉLÉVERSEMENT',
    'speedtest.ping': 'PING',
    'speedtest.stability': 'Stabilité',
    'speedtest.jitter': 'Gigue',
    'speedtest.thanks': 'Merci d\'avoir participé',
    'speedtest.congrats': 'Félicitations! Vous êtes entré dans le top 1000 à la position',

    // Validation
    'validation.name_required': 'Le nom est obligatoire',
    'validation.name_too_short': 'Le nom doit comporter au moins 2 caractères',
    'validation.name_too_long': 'Le nom ne peut pas dépasser 30 caractères',
    'validation.name_invalid_chars': 'Le nom contient des caractères invalides',
    'validation.name_bad_words': 'Le nom contient des mots interdits',

    // Footer
    'footer.made_with': 'Fait avec ❤️ par l\'équipe WifiTOP',
  }
}

/**
 * Obtiene la traducción para una clave dada en el idioma especificado
 */
export function t(key: string, language: Language): string {
  return translations[language]?.[key] || translations['en']?.[key] || key
}

/**
 * Detecta el idioma del navegador y lo mapea a uno de nuestros idiomas soportados
 */
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language.split('-')[0].toLowerCase()

  const languageMap: Record<string, Language> = {
    'en': 'en',
    'es': 'es',
    'zh': 'zh',
    'hi': 'hi',
    'fr': 'fr',
  }

  return languageMap[browserLang] || 'en'
}
