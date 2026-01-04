export type Language = 'en' | 'es' | 'zh' | 'hi' | 'fr'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'header.title': 'WifiTOP',
    'header.tagline': 'Show off your WiFi speed',
    'nav.home': '🏠 Home',
    'nav.ranking': '🏆 Ranking',
    'nav.about': 'ℹ️ About',

    // Hero
    'hero.title': 'WifiTOP',
    'hero.subtitle': 'Show off your WiFi speed 🚀',
    'hero.description': 'Global ranking with 10,000+ users | Accurate measurements | Exclusive badges',
    'hero.cta': 'Ultra-precise speedtest with automatic fraud detection. Compete with users worldwide, unlock unique badges and prove you have the best connection.',

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

    // Ranking
    'ranking.title': 'Global Ranking',
    'ranking.users_competing': 'users competing',
    'ranking.users_short': 'users',
    'ranking.live_update': 'Live Update',
    'ranking.all': 'All',
    'ranking.top100': '🥇 Top 100',
    'ranking.fast': '⚡ Fast',
    'ranking.lowping': '📡 Low Ping',
    'ranking.sort_speed': 'Sort: Speed ↓',
    'ranking.sort_ping': 'Sort: Ping ↑',
    'ranking.sort_upload': 'Sort: Upload ↓',
    'ranking.sort_date': 'Sort: Recent ↓',
    'ranking.loading': 'Loading ranking...',
    'ranking.no_results': 'No results yet',
    'ranking.be_first': 'Be the first to test your speed!',
    'ranking.tip': '💡 Tip: The ranking updates in real-time. The best 10,000 verified results are shown here with automatic fraud detection.',
    'ranking.position': 'Position',
    'ranking.user': 'User',
    'ranking.download': 'Download',
    'ranking.upload': 'Upload',
    'ranking.ping': 'Ping',
    'ranking.location': 'Location',

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

    // Badges
    'badges.unlocked': '🏅 Your Unlocked Badges',
    'badges.total': 'Total',
    'badges.epic': 'Epic',
    'badges.rare': 'Rare',
    'badges.uncommon': 'Uncommon',
    'badges.common': 'Common',
    'badges.loading': 'Loading badges...',
    'badges.none': 'No Badges Unlocked Yet',
    'badges.none_desc': 'Complete speed tests to unlock your first badges',
    'badges.available': 'Available Badges',

    // WhatsNew Modal
    'whatsnew.title': 'What\'s New',
    'whatsnew.subtitle': 'Everything WifiTOP has to offer',
    'whatsnew.close': 'Got it, Let\'s Go',
    'whatsnew.f1': 'Accurate Speedtest with Cloudflare',
    'whatsnew.f1_desc': 'Ultra-precise measurements of download, upload, and latency speed using Cloudflare\'s global servers.',
    'whatsnew.f2': 'Expanded Global Ranking',
    'whatsnew.f2_desc': 'Compete with the best. Top 10,000 users in the world ranking updated in real-time.',
    'whatsnew.f3': 'Intelligent Fraud Detection',
    'whatsnew.f3_desc': 'Automatic system that detects and rejects suspicious results to maintain ranking integrity.',
    'whatsnew.f4': 'Automatic Geolocation',
    'whatsnew.f4_desc': 'Automatically identifies your country and ISP for accurate global statistics.',
    'whatsnew.f5': '12+ Unlockable Badges',
    'whatsnew.f5_desc': 'Unlock exclusive badges based on your achievements: Extreme Speedster, Gaming Beast, Stability King and more.',
    'whatsnew.f6': 'Multi-language Support',
    'whatsnew.f6_desc': 'Interface available in 5 languages: Spanish, English, Chinese, Hindi and French. Automatically detected by your browser.',
    'whatsnew.f7': 'Abuse Protection',
    'whatsnew.f7_desc': 'Intelligent limitations to ensure the service is fair for all users. Test without limits when you are honest.',
    'whatsnew.f8': 'Anonymous Mode Available',
    'whatsnew.f8_desc': 'Test your speed without appearing in the ranking. Data is not saved.',
    'whatsnew.f9': 'Local History',
    'whatsnew.f9_desc': 'Automatically saves your test history in localStorage.',
    'whatsnew.f10': 'Share on Social Networks',
    'whatsnew.f10_desc': 'Create links to share your results on Twitter and Facebook.',
    'whatsnew.f11': 'Improved Name Validation',
    'whatsnew.f11_desc': 'Protection against offensive and malicious names. Maximum 30 characters to maintain a respectful environment.',
    'whatsnew.f12': 'Enhanced Security',
    'whatsnew.f12_desc': 'Modern security headers and protections against common attacks. Your experience is secure from start to finish.',

    // Features List
    'features.ultra_precision': 'Ultra-precise measurements: download, upload, ping, jitter, stability',
    'features.global_ranking': 'Real-time global ranking with top 10,000 results',
    'features.badges': '12+ unlockable badges based on your achievements',
    'features.fraud_detection': 'Intelligent fraud and anomaly detection',
    'features.anonymous_mode': 'Anonymous mode for private tests',
    'features.social_sharing': 'Share results on social networks',

    // Footer
    'footer.made_with': 'Made with ❤️ by the WifiTOP Team',
    'footer.speedtest_ranking': 'Speedtest Ranking',

    // Placeholder
    'placeholder.loading': 'Loading...',
  },

  es: {
    // Header & Navigation
    'header.title': 'WifiTOP',
    'header.tagline': 'Presume tu velocidad de WiFi',
    'nav.home': '🏠 Inicio',
    'nav.ranking': '🏆 Ranking',
    'nav.about': 'ℹ️ Acerca de',

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

    // Ranking
    'ranking.title': 'Ranking Global',
    'ranking.users_competing': 'usuarios compitiendo',
    'ranking.users_short': 'usuarios',
    'ranking.live_update': 'Actualizado en tiempo real',
    'ranking.all': 'Todos',
    'ranking.top100': '🥇 Top 100',
    'ranking.fast': '⚡ Rápidos',
    'ranking.lowping': '📡 Bajo Ping',
    'ranking.sort_speed': 'Ordenar: Velocidad ↓',
    'ranking.sort_ping': 'Ordenar: Ping ↑',
    'ranking.sort_upload': 'Ordenar: Subida ↓',
    'ranking.sort_date': 'Ordenar: Reciente ↓',
    'ranking.loading': 'Cargando ranking...',
    'ranking.no_results': 'No hay resultados aún',
    'ranking.be_first': '¡Sé el primero en probar tu velocidad!',
    'ranking.tip': '💡 Tip: El ranking se actualiza en tiempo real. Los mejores 10,000 resultados verificados se muestran aquí con detección automática de fraude.',
    'ranking.position': 'Posición',
    'ranking.user': 'Usuario',
    'ranking.download': 'Descarga',
    'ranking.upload': 'Subida',
    'ranking.ping': 'Ping',
    'ranking.location': 'Ubicación',

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

    // Badges
    'badges.unlocked': '🏅 Tus Badges Desbloqueados',
    'badges.total': 'Total',
    'badges.epic': 'Épicos',
    'badges.rare': 'Raros',
    'badges.uncommon': 'Poco Comunes',
    'badges.common': 'Comunes',
    'badges.loading': 'Cargando badges...',
    'badges.none': 'Aún sin Badges Desbloqueados',
    'badges.none_desc': 'Completa pruebas de velocidad para desbloquear tus primeros badges',
    'badges.available': 'Badges Disponibles',

    // WhatsNew Modal
    'whatsnew.title': 'Novedades',
    'whatsnew.subtitle': 'Todo lo que ofrece WifiTOP',
    'whatsnew.close': 'Entendido, Vamos',
    'whatsnew.f1': 'Speedtest Preciso con Cloudflare',
    'whatsnew.f1_desc': 'Mediciones ultra precisas de velocidad descarga, subida y latencia usando servidores de Cloudflare globales.',
    'whatsnew.f2': 'Ranking Global Expandido',
    'whatsnew.f2_desc': 'Compite con los mejores. Top 10,000 usuarios en el ranking mundial actualizado en tiempo real.',
    'whatsnew.f3': 'Detección de Fraude Inteligente',
    'whatsnew.f3_desc': 'Sistema automático que detecta y rechaza resultados sospechosos para mantener la integridad del ranking.',
    'whatsnew.f4': 'Geolocalización Automática',
    'whatsnew.f4_desc': 'Identifica automáticamente tu país e ISP para estadísticas globales precisas.',
    'whatsnew.f5': '12+ Badges Desbloqueables',
    'whatsnew.f5_desc': 'Desbloquea badges exclusivos según tus logros: Speedster Extremo, Gaming Beast, Stability King y más.',
    'whatsnew.f6': 'Soporte Multiidioma',
    'whatsnew.f6_desc': 'Interfaz disponible en 5 idiomas: Español, Inglés, Chino, Hindi y Francés. Se detecta automáticamente según tu navegador.',
    'whatsnew.f7': 'Protección Contra Abuso',
    'whatsnew.f7_desc': 'Limitaciones inteligentes para garantizar que el servicio sea justo para todos los usuarios. Prueba sin límites cuando eres honesto.',
    'whatsnew.f8': 'Modo Anónimo Disponible',
    'whatsnew.f8_desc': 'Prueba tu velocidad sin aparecer en el ranking. Los datos no se guardan.',
    'whatsnew.f9': 'Histórico Local',
    'whatsnew.f9_desc': 'Guarda automáticamente tu histórico de pruebas en localStorage.',
    'whatsnew.f10': 'Compartir en Redes Sociales',
    'whatsnew.f10_desc': 'Crea links para compartir tus resultados en Twitter y Facebook.',
    'whatsnew.f11': 'Validación de Nombres Mejorada',
    'whatsnew.f11_desc': 'Protección contra nombres ofensivos y maliciosos. Máximo 30 caracteres para mantener un ambiente respetable.',
    'whatsnew.f12': 'Seguridad Reforzada',
    'whatsnew.f12_desc': 'Headers de seguridad modernos y protecciones contra ataques comunes. Tu experiencia es segura de principio a fin.',

    // Features List
    'features.ultra_precision': 'Mediciones ultra precisas: descarga, subida, ping, jitter, estabilidad',
    'features.global_ranking': 'Ranking global en tiempo real con 10,000 mejores resultados',
    'features.badges': '12+ badges desbloqueables según tus logros',
    'features.fraud_detection': 'Detección inteligente de fraude y anomalías',
    'features.anonymous_mode': 'Modo anónimo para pruebas privadas',
    'features.social_sharing': 'Compartir resultados en redes sociales',

    // Footer
    'footer.made_with': 'Hecho con ❤️ por el equipo WifiTOP',
    'footer.speedtest_ranking': 'Speedtest Ranking',

    // Placeholder
    'placeholder.loading': 'Cargando...',
  },

  zh: {
    // Header & Navigation
    'header.title': 'WifiTOP',
    'header.tagline': '炫耀你的WiFi速度',
    'nav.home': '🏠 主页',
    'nav.ranking': '🏆 排名',
    'nav.about': 'ℹ️ 关于',

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

    // Ranking
    'ranking.title': '全球排名',
    'ranking.users_competing': '用户竞争',
    'ranking.users_short': '用户',
    'ranking.live_update': '实时更新',
    'ranking.all': '全部',
    'ranking.top100': '🥇 前100名',
    'ranking.fast': '⚡ 快速',
    'ranking.lowping': '📡 低延迟',
    'ranking.sort_speed': '排序：速度 ↓',
    'ranking.sort_ping': '排序：延迟 ↑',
    'ranking.sort_upload': '排序：上传 ↓',
    'ranking.sort_date': '排序：最近 ↓',
    'ranking.loading': '加载排名中...',
    'ranking.no_results': '还没有结果',
    'ranking.be_first': '成为第一个测试你的速度！',
    'ranking.tip': '💡 提示：排名实时更新。最好的 10,000 个验证结果显示在这里，具有自动欺诈检测。',
    'ranking.position': '排名',
    'ranking.user': '用户',
    'ranking.download': '下载',
    'ranking.upload': '上传',
    'ranking.ping': '延迟',
    'ranking.location': '地点',

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

    // Badges
    'badges.unlocked': '🏅 您解锁的徽章',
    'badges.total': '总计',
    'badges.epic': '史诗',
    'badges.rare': '稀有',
    'badges.uncommon': '不常见',
    'badges.common': '常见',
    'badges.loading': '加载徽章中...',
    'badges.none': '还没有解锁徽章',
    'badges.none_desc': '完成速度测试以解锁您的第一个徽章',
    'badges.available': '可用徽章',

    // WhatsNew Modal
    'whatsnew.title': '新增功能',
    'whatsnew.subtitle': 'WifiTOP 提供的一切',
    'whatsnew.close': '好的，开始使用',
    'whatsnew.f1': '使用 Cloudflare 的精确测速',
    'whatsnew.f1_desc': '使用 Cloudflare 全球服务器对下载、上传和延迟速度进行超精确测量。',
    'whatsnew.f2': '扩展全球排名',
    'whatsnew.f2_desc': '与最好的竞争。世界排名前 10,000 用户实时更新。',
    'whatsnew.f3': '智能欺诈检测',
    'whatsnew.f3_desc': '自动系统，检测并拒绝可疑结果以维护排名完整性。',
    'whatsnew.f4': '自动地理定位',
    'whatsnew.f4_desc': '自动识别您的国家和 ISP 以获得准确的全球统计信息。',
    'whatsnew.f5': '12+ 可解锁徽章',
    'whatsnew.f5_desc': '根据您的成就解锁独家徽章：极速先驱、游戏野兽、稳定性之王等。',
    'whatsnew.f6': '多语言支持',
    'whatsnew.f6_desc': '5 种语言的界面：西班牙语、英语、中文、印地语和法语。由浏览器自动检测。',
    'whatsnew.f7': '滥用保护',
    'whatsnew.f7_desc': '智能限制，确保服务对所有用户公平。当您诚实时可以无限制地测试。',
    'whatsnew.f8': '可用匿名模式',
    'whatsnew.f8_desc': '测试您的速度而不在排名中出现。数据不保存。',
    'whatsnew.f9': '本地历史',
    'whatsnew.f9_desc': '在 localStorage 中自动保存您的测试历史。',
    'whatsnew.f10': '在社交网络上分享',
    'whatsnew.f10_desc': '创建链接以在 Twitter 和 Facebook 上分享您的结果。',
    'whatsnew.f11': '改进的名称验证',
    'whatsnew.f11_desc': '防止冒犯性和恶意名称。最多 30 个字符以维持尊重的环境。',
    'whatsnew.f12': '增强的安全性',
    'whatsnew.f12_desc': '现代安全标头和对常见攻击的保护。您的体验从始至终都是安全的。',

    // Features List
    'features.ultra_precision': '超精确测量：下载、上传、延迟、抖动、稳定性',
    'features.global_ranking': '实时全球排名，包含前 10,000 个结果',
    'features.badges': '12+ 可解锁徽章，基于您的成就',
    'features.fraud_detection': '智能欺诈和异常检测',
    'features.anonymous_mode': '用于私密测试的匿名模式',
    'features.social_sharing': '在社交网络上分享结果',

    // Footer
    'footer.made_with': '由 WifiTOP 团队用 ❤️ 制作',
    'footer.speedtest_ranking': 'Speedtest 排名',

    // Placeholder
    'placeholder.loading': '加载中...',
  },

  hi: {
    // Header & Navigation
    'header.title': 'WifiTOP',
    'header.tagline': 'अपनी WiFi गति दिखाएं',
    'nav.home': '🏠 होम',
    'nav.ranking': '🏆 रैंकिंग',
    'nav.about': 'ℹ️ परिचय',

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

    // Ranking
    'ranking.title': 'वैश्विक रैंकिंग',
    'ranking.users_competing': 'उपयोगकर्ता प्रतिस्पर्धा कर रहे हैं',
    'ranking.users_short': 'उपयोगकर्ता',
    'ranking.live_update': 'लाइव अपडेट',
    'ranking.all': 'सभी',
    'ranking.top100': '🥇 शीर्ष 100',
    'ranking.fast': '⚡ तेज़',
    'ranking.lowping': '📡 कम पिंग',
    'ranking.sort_speed': 'क्रमांकित करें: गति ↓',
    'ranking.sort_ping': 'क्रमांकित करें: पिंग ↑',
    'ranking.sort_upload': 'क्रमांकित करें: अपलोड ↓',
    'ranking.sort_date': 'क्रमांकित करें: हाल ही ↓',
    'ranking.loading': 'रैंकिंग लोड हो रही है...',
    'ranking.no_results': 'अभी तक कोई परिणाम नहीं',
    'ranking.be_first': 'अपनी गति परीक्षण करने वाले पहले व्यक्ति बनें!',
    'ranking.tip': '💡 सुझाव: रैंकिंग रीयल-टाइम में अपडेट होती है। सर्वश्रेष्ठ 10,000 सत्यापित परिणाम यहां स्वचालित धोखाधड़ी का पता लगाने के साथ दिखाए जाते हैं।',
    'ranking.position': 'स्थिति',
    'ranking.user': 'उपयोगकर्ता',
    'ranking.download': 'डाउनलोड',
    'ranking.upload': 'अपलोड',
    'ranking.ping': 'पिंग',
    'ranking.location': 'स्थान',

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

    // Badges
    'badges.unlocked': '🏅 आपके अनलॉक किए गए बैज',
    'badges.total': 'कुल',
    'badges.epic': 'महाकाव्य',
    'badges.rare': 'दुर्लभ',
    'badges.uncommon': 'असामान्य',
    'badges.common': 'सामान्य',
    'badges.loading': 'बैज लोड हो रहे हैं...',
    'badges.none': 'अभी तक कोई बैज अनलॉक नहीं किया गया',
    'badges.none_desc': 'अपना पहला बैज अनलॉक करने के लिए गति परीक्षण पूरा करें',
    'badges.available': 'उपलब्ध बैज',

    // WhatsNew Modal
    'whatsnew.title': 'क्या नया है',
    'whatsnew.subtitle': 'WifiTOP के सभी विकल्प',
    'whatsnew.close': 'समझ गया, शुरू करते हैं',
    'whatsnew.f1': 'Cloudflare के साथ सटीक स्पीडटेस्ट',
    'whatsnew.f1_desc': 'Cloudflare के ग्लोबल सर्वर का उपयोग करके डाउनलोड, अपलोड और लेटेंसी गति का अल्ट्रा सटीक माप।',
    'whatsnew.f2': 'विस्तारित वैश्विक रैंकिंग',
    'whatsnew.f2_desc': 'सर्वश्रेष्ठ के साथ प्रतिस्पर्धा करें। विश्व रैंकिंग में शीर्ष 10,000 उपयोगकर्ता रीयल-टाइम में अपडेट किए जाते हैं।',
    'whatsnew.f3': 'बुद्धिमान धोखाधड़ी का पता लगाना',
    'whatsnew.f3_desc': 'स्वचालित प्रणाली जो रैंकिंग अखंडता बनाए रखने के लिए संदिग्ध परिणामों का पता लगाती है और अस्वीकार करती है।',
    'whatsnew.f4': 'स्वचालित भूगोल स्थान',
    'whatsnew.f4_desc': 'आपके देश और ISP को स्वचालित रूप से पहचानता है सटीक वैश्विक आंकड़ों के लिए।',
    'whatsnew.f5': '12+ अनलॉक करने योग्य बैज',
    'whatsnew.f5_desc': 'अपनी उपलब्धियों के आधार पर विशेष बैज अनलॉक करें: एक्सट्रीम स्पीडस्टर, गेमिंग बीस्ट, स्टेबिलिटी किंग और अधिक।',
    'whatsnew.f6': 'बहुभाषी समर्थन',
    'whatsnew.f6_desc': '5 भाषाओं में इंटरफेस: स्पेनिश, अंग्रेजी, चीनी, हिंदी और फ्रेंच। आपके ब्राउज़र द्वारा स्वचालित रूप से पहचाना जाता है।',
    'whatsnew.f7': 'दुरुपयोग संरक्षण',
    'whatsnew.f7_desc': 'बुद्धिमान सीमाएं यह सुनिश्चित करती हैं कि सेवा सभी उपयोगकर्ताओं के लिए उचित है। ईमानदार होने पर बिना सीमा के परीक्षण करें।',
    'whatsnew.f8': 'अनाम मोड उपलब्ध',
    'whatsnew.f8_desc': 'रैंकिंग में दिखाई दिए बिना अपनी गति का परीक्षण करें। डेटा सहेजा नहीं जाता।',
    'whatsnew.f9': 'स्थानीय इतिहास',
    'whatsnew.f9_desc': 'localStorage में अपने परीक्षण इतिहास को स्वचालित रूप से सहेजता है।',
    'whatsnew.f10': 'सोशल नेटवर्क पर साझा करें',
    'whatsnew.f10_desc': 'Twitter और Facebook पर अपने परिणाम साझा करने के लिए लिंक बनाएं।',
    'whatsnew.f11': 'सुधारा गया नाम सत्यापन',
    'whatsnew.f11_desc': 'आक्रामक और दुर्भावनापूर्ण नाम से सुरक्षा। सम्मानजनक वातावरण बनाए रखने के लिए अधिकतम 30 वर्ण।',
    'whatsnew.f12': 'बढ़ी हुई सुरक्षा',
    'whatsnew.f12_desc': 'आधुनिक सुरक्षा हेडर और सामान्य हमलों से सुरक्षा। आपका अनुभव शुरू से अंत तक सुरक्षित है।',

    // Features List
    'features.ultra_precision': 'अल्ट्रा सटीक माप: डाउनलोड, अपलोड, पिंग, जिटर, स्थिरता',
    'features.global_ranking': 'शीर्ष 10,000 परिणामों के साथ रीयल-टाइम वैश्विक रैंकिंग',
    'features.badges': '12+ अनलॉक करने योग्य बैज आपकी उपलब्धियों पर आधारित',
    'features.fraud_detection': 'बुद्धिमान धोखाधड़ी और विसंगति का पता लगाना',
    'features.anonymous_mode': 'निजी परीक्षण के लिए अनाम मोड',
    'features.social_sharing': 'सोशल नेटवर्क पर परिणाम साझा करें',

    // Footer
    'footer.made_with': 'WifiTOP टीम द्वारा ❤️ से बनाया गया',
    'footer.speedtest_ranking': 'Speedtest रैंकिंग',

    // Placeholder
    'placeholder.loading': 'लोड हो रहा है...',
  },

  fr: {
    // Header & Navigation
    'header.title': 'WifiTOP',
    'header.tagline': 'Montrez votre vitesse WiFi',
    'nav.home': '🏠 Accueil',
    'nav.ranking': '🏆 Classement',
    'nav.about': 'ℹ️ À propos',

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

    // Ranking
    'ranking.title': 'Classement mondial',
    'ranking.users_competing': 'utilisateurs en concurrence',
    'ranking.users_short': 'utilisateurs',
    'ranking.live_update': 'Mise à jour en direct',
    'ranking.all': 'Tous',
    'ranking.top100': '🥇 Top 100',
    'ranking.fast': '⚡ Rapide',
    'ranking.lowping': '📡 Ping faible',
    'ranking.sort_speed': 'Trier : Vitesse ↓',
    'ranking.sort_ping': 'Trier : Ping ↑',
    'ranking.sort_upload': 'Trier : Téléversement ↓',
    'ranking.sort_date': 'Trier : Récent ↓',
    'ranking.loading': 'Chargement du classement...',
    'ranking.no_results': 'Pas de résultats pour l\'instant',
    'ranking.be_first': 'Soyez le premier à tester votre vitesse!',
    'ranking.tip': '💡 Conseil: Le classement se met à jour en temps réel. Les 10 000 meilleurs résultats vérifiés sont affichés ici avec détection automatique des fraudes.',
    'ranking.position': 'Position',
    'ranking.user': 'Utilisateur',
    'ranking.download': 'Téléchargement',
    'ranking.upload': 'Téléversement',
    'ranking.ping': 'Ping',
    'ranking.location': 'Localisation',

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

    // Badges
    'badges.unlocked': '🏅 Vos badges déverrouillés',
    'badges.total': 'Total',
    'badges.epic': 'Épique',
    'badges.rare': 'Rare',
    'badges.uncommon': 'Peu courant',
    'badges.common': 'Courant',
    'badges.loading': 'Chargement des badges...',
    'badges.none': 'Aucun badge déverrouillé pour le moment',
    'badges.none_desc': 'Terminez des tests de vitesse pour déverrouiller vos premiers badges',
    'badges.available': 'Badges disponibles',

    // WhatsNew Modal
    'whatsnew.title': 'Quoi de neuf',
    'whatsnew.subtitle': 'Tout ce que WifiTOP offre',
    'whatsnew.close': 'Compris, Allons-y',
    'whatsnew.f1': 'Test de vitesse précis avec Cloudflare',
    'whatsnew.f1_desc': 'Mesures ultra-précises de vitesse de téléchargement, d\'envoi et de latence à l\'aide des serveurs mondiaux de Cloudflare.',
    'whatsnew.f2': 'Classement mondial étendu',
    'whatsnew.f2_desc': 'Concourez avec les meilleurs. Top 10 000 utilisateurs du classement mondial mis à jour en temps réel.',
    'whatsnew.f3': 'Détection intelligente des fraudes',
    'whatsnew.f3_desc': 'Système automatique qui détecte et rejette les résultats suspects pour maintenir l\'intégrité du classement.',
    'whatsnew.f4': 'Géolocalisation automatique',
    'whatsnew.f4_desc': 'Identifie automatiquement votre pays et votre FAI pour des statistiques mondiales précises.',
    'whatsnew.f5': '12+ Badges déverrouillables',
    'whatsnew.f5_desc': 'Déverrouillez des badges exclusifs selon vos réalisations: Speedster extrême, Beast de jeu, Roi de la stabilité et plus.',
    'whatsnew.f6': 'Support multilingue',
    'whatsnew.f6_desc': 'Interface disponible en 5 langues: Espagnol, Anglais, Chinois, Hindi et Français. Détecté automatiquement par votre navigateur.',
    'whatsnew.f7': 'Protection contre les abus',
    'whatsnew.f7_desc': 'Limitations intelligentes pour garantir que le service est équitable pour tous les utilisateurs. Testez sans limites lorsque vous êtes honnête.',
    'whatsnew.f8': 'Mode anonyme disponible',
    'whatsnew.f8_desc': 'Testez votre vitesse sans apparaître dans le classement. Les données ne sont pas sauvegardées.',
    'whatsnew.f9': 'Historique local',
    'whatsnew.f9_desc': 'Enregistre automatiquement l\'historique de vos tests dans localStorage.',
    'whatsnew.f10': 'Partager sur les réseaux sociaux',
    'whatsnew.f10_desc': 'Créez des liens pour partager vos résultats sur Twitter et Facebook.',
    'whatsnew.f11': 'Validation de nom améliorée',
    'whatsnew.f11_desc': 'Protection contre les noms offensants et malveillants. 30 caractères maximum pour maintenir un environnement respectueux.',
    'whatsnew.f12': 'Sécurité renforcée',
    'whatsnew.f12_desc': 'En-têtes de sécurité modernes et protections contre les attaques courantes. Votre expérience est sécurisée du début à la fin.',

    // Features List
    'features.ultra_precision': 'Mesures ultra précises : téléchargement, envoi, ping, gigue, stabilité',
    'features.global_ranking': 'Classement mondial en temps réel avec 10 000 meilleurs résultats',
    'features.badges': '12+ badges déverrouillables selon vos réalisations',
    'features.fraud_detection': 'Détection intelligente des fraudes et des anomalies',
    'features.anonymous_mode': 'Mode anonyme pour les tests privés',
    'features.social_sharing': 'Partager les résultats sur les réseaux sociaux',

    // Footer
    'footer.made_with': 'Fait avec ❤️ par l\'équipe WifiTOP',
    'footer.speedtest_ranking': 'Classement de vitesse',

    // Placeholder
    'placeholder.loading': 'Chargement...',
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
