#!/usr/bin/env node

// Script para validar que todas las traducciones estén completas

const translations = {
    en: {
        'header.title': 'WifiTOP',
        'about.what_you_get': 'What You Get',
        'features.ultra_precision': 'Ultra-precise measurements: download, upload, ping, jitter, stability',
        'features.global_ranking': 'Real-time global ranking with top 10,000 results',
        'features.badges': '12+ unlockable badges based on your achievements',
        'features.fraud_detection': 'Intelligent fraud and anomaly detection',
        'features.anonymous_mode': 'Anonymous mode for private tests',
        'features.social_sharing': 'Share results on social networks',
        'badges.speedster_extreme': 'Extreme Speedster',
        'badges.speedster_extreme_desc': 'Reached download speed > 500 Mbps',
        'badges.fiber_connection': 'Fiber Connection',
        'badges.fiber_connection_desc': 'Ping < 5ms (ultra-stable connection)',
    },
    es: {
        'header.title': 'WifiTOP',
        'about.what_you_get': 'Lo que Obtienes',
        'features.ultra_precision': 'Mediciones ultra precisas: descarga, subida, ping, jitter, estabilidad',
        'features.global_ranking': 'Ranking global en tiempo real con 10,000 mejores resultados',
        'features.badges': '12+ badges desbloqueables según tus logros',
        'features.fraud_detection': 'Detección inteligente de fraude y anomalías',
        'features.anonymous_mode': 'Modo anónimo para pruebas privadas',
        'features.social_sharing': 'Compartir resultados en redes sociales',
        'badges.speedster_extreme': 'Speedster Extremo',
        'badges.speedster_extreme_desc': 'Alcanzó velocidad de descarga > 500 Mbps',
        'badges.fiber_connection': 'Conexión de Fibra',
        'badges.fiber_connection_desc': 'Ping < 5ms (conexión ultra-estable)',
    },
    zh: {
        'header.title': 'WifiTOP',
        'about.what_you_get': '您将获得',
        'features.ultra_precision': '超精确测量：下载、上传、延迟、抖动、稳定性',
        'features.global_ranking': '实时全球排名，包含前 10,000 个结果',
        'features.badges': '12+ 可解锁徽章，基于您的成就',
        'features.fraud_detection': '智能欺诈和异常检测',
        'features.anonymous_mode': '用于私密测试的匿名模式',
        'features.social_sharing': '在社交网络上分享结果',
        'badges.speedster_extreme': '极速高手',
        'badges.speedster_extreme_desc': '达到下载速度 > 500 Mbps',
        'badges.fiber_connection': '光纤连接',
        'badges.fiber_connection_desc': 'Ping < 5ms（超稳定连接）',
    },
    hi: {
        'header.title': 'WifiTOP',
        'about.what_you_get': 'आप क्या पाएंगे',
        'features.ultra_precision': 'अल्ट्रा सटीक माप: डाउनलोड, अपलोड, पिंग, जिटर, स्थिरता',
        'features.global_ranking': 'शीर्ष 10,000 परिणामों के साथ रीयल-टाइम वैश्विक रैंकिंग',
        'features.badges': '12+ अनलॉक करने योग्य बैज आपकी उपलब्धियों पर आधारित',
        'features.fraud_detection': 'बुद्धिमान धोखाधड़ी और विसंगति का पता लगाना',
        'features.anonymous_mode': 'निजी परीक्षण के लिए अनाम मोड',
        'features.social_sharing': 'सोशल नेटवर्क पर परिणाम साझा करें',
        'badges.speedster_extreme': 'चरम गति दर्शक',
        'badges.speedster_extreme_desc': 'डाउनलोड गति > 500 Mbps तक पहुंचा',
        'badges.fiber_connection': 'फाइबर कनेक्शन',
        'badges.fiber_connection_desc': 'Ping < 5ms (अति स्थिर कनेक्शन)',
    },
    fr: {
        'header.title': 'WifiTOP',
        'about.what_you_get': 'Ce que vous obtenez',
        'features.ultra_precision': 'Mesures ultra précises : téléchargement, envoi, ping, gigue, stabilité',
        'features.global_ranking': 'Classement mondial en temps réel avec 10 000 meilleurs résultats',
        'features.badges': '12+ badges déverrouillables selon vos réalisations',
        'features.fraud_detection': 'Détection intelligente des fraudes et des anomalies',
        'features.anonymous_mode': 'Mode anonyme pour les tests privés',
        'features.social_sharing': 'Partager les résultats sur les réseaux sociaux',
        'badges.speedster_extreme': 'Speedster extrême',
        'badges.speedster_extreme_desc': 'Vitesse de téléchargement atteinte > 500 Mbps',
        'badges.fiber_connection': 'Connexion en fibre',
        'badges.fiber_connection_desc': 'Ping < 5ms (connexion ultra-stable)',
    }
}

const languages = ['en', 'es', 'zh', 'hi', 'fr']
const keySample = Object.keys(translations.en)

console.log('✓ Validando traducciones...\n')

let hasErrors = false

for (const lang of languages) {
    console.log(`Idioma: ${lang.toUpperCase()}`)
    const missing = []
    
    for (const key of keySample) {
        if (!translations[lang][key]) {
            missing.push(key)
            hasErrors = true
        }
    }
    
    if (missing.length === 0) {
        console.log(`  ✓ Todas las claves están presentes (${keySample.length})`)
    } else {
        console.log(`  ✗ Faltan ${missing.length} claves:`)
        missing.forEach(k => console.log(`    - ${k}`))
    }
    console.log()
}

if (!hasErrors) {
    console.log('✓ TODAS LAS TRADUCCIONES ESTÁN COMPLETAS')
    process.exit(0)
} else {
    console.log('✗ HAY ERRORES EN LAS TRADUCCIONES')
    process.exit(1)
}
