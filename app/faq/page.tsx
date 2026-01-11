'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: '¿Cómo funciona el test de velocidad de WifiTOP?',
    answer: 'WifiTOP utiliza tecnología avanzada con servidores de Cloudflare CDN distribuidos globalmente. El test mide tu conexión en tres fases: primero el ping (latencia), luego la velocidad de descarga con 6 conexiones paralelas, y finalmente la velocidad de subida con 4 conexiones. Todo el proceso toma aproximadamente 30 segundos y utiliza chunks adaptativos para saturar completamente tu ancho de banda.'
  },
  {
    question: '¿Qué es el ping y por qué es importante?',
    answer: 'El ping (o latencia) es el tiempo que tarda un pequeño paquete de datos en ir desde tu dispositivo hasta el servidor y volver. Se mide en milisegundos (ms). Un ping bajo (menos de 20ms) es ideal para gaming online, videollamadas y aplicaciones en tiempo real. Un ping alto puede causar lag y retrasos notables.'
  },
  {
    question: '¿Qué es el jitter?',
    answer: 'El jitter es la variación en el tiempo de respuesta del ping. Un jitter bajo significa que tu conexión es estable y consistente. Un jitter alto puede causar problemas en videollamadas, streaming y juegos online, ya que los datos no llegan de manera uniforme. Idealmente, el jitter debería ser menor a 10ms.'
  },
  {
    question: '¿Por qué mi velocidad es diferente a la que promete mi ISP?',
    answer: 'Hay varias razones: 1) Los ISPs anuncian velocidades "hasta" que son máximos teóricos. 2) La congestión de red en horas pico reduce la velocidad. 3) Tu router o WiFi pueden ser un cuello de botella. 4) La distancia al router y obstáculos afectan la señal WiFi. 5) Otros dispositivos en tu red consumen ancho de banda. Para una medición más precisa, conecta por cable Ethernet directamente al router.'
  },
  {
    question: '¿Cómo puedo mejorar mi velocidad de internet?',
    answer: 'Algunas recomendaciones: 1) Usa conexión por cable Ethernet en lugar de WiFi. 2) Acerca tu dispositivo al router. 3) Actualiza el firmware de tu router. 4) Usa la banda de 5GHz en lugar de 2.4GHz si tu router lo soporta. 5) Reinicia tu router periódicamente. 6) Minimiza la cantidad de dispositivos conectados durante el test. 7) Cierra aplicaciones que consuman ancho de banda en segundo plano.'
  },
  {
    question: '¿Qué afecta los resultados del test de velocidad?',
    answer: 'Muchos factores pueden afectar los resultados: tipo de conexión (WiFi vs cable), distancia al router, congestión de la red, hora del día, otros dispositivos usando la red, la capacidad de tu dispositivo, extensiones del navegador, VPNs activas, y la calidad de tu hardware de red. Para resultados más precisos, realiza el test con conexión por cable y cierra otras aplicaciones.'
  },
  {
    question: '¿Cómo funciona el ranking global?',
    answer: 'El ranking global clasifica a todos los usuarios según su velocidad de descarga. Solo se guardan los mejores 100,000 resultados. Tu posición se actualiza cada vez que completas un test si tu nueva velocidad es mayor. El ranking incluye información del país detectado automáticamente mediante tu IP.'
  },
  {
    question: '¿Qué son las insignias (badges) y cómo las desbloqueo?',
    answer: 'Las insignias son logros que obtienes al alcanzar ciertos hitos de velocidad. Hay diferentes niveles de rareza: común, poco común, rara y épica. Por ejemplo, puedes obtener "Speedster Extremo" si tu descarga supera 500 Mbps, o "Gaming Beast" si tienes ping menor a 10ms con descarga mayor a 50 Mbps. ¡Completa tests para desbloquear todas las insignias!'
  },
  {
    question: '¿Qué significa la estabilidad de la conexión?',
    answer: 'La estabilidad mide qué tan consistente es tu velocidad durante el test. Una estabilidad del 100% significa que la velocidad fue constante todo el tiempo. Una estabilidad baja indica fluctuaciones, lo cual puede afectar la calidad de streaming, videollamadas y gaming. Una buena conexión debería tener estabilidad superior al 85%.'
  },
  {
    question: '¿Por qué WiFi es más lento que conexión por cable?',
    answer: 'El WiFi tiene limitaciones físicas: las ondas de radio se debilitan con la distancia, atravesar paredes reduce la señal, otros dispositivos WiFi y electrodomésticos causan interferencia, y el ancho de banda se comparte entre todos los dispositivos conectados. El cable Ethernet proporciona una conexión dedicada y estable sin estas limitaciones.'
  },
  {
    question: '¿Cada cuánto debería hacer un test de velocidad?',
    answer: 'Recomendamos hacer tests periódicos para monitorear tu conexión: una vez por semana en condiciones normales, o cuando notes problemas de rendimiento. También es útil hacer tests a diferentes horas del día para ver si hay congestión en ciertos horarios. WifiTOP tiene un límite de 5 tests por minuto y 20 por hora para prevenir abuso.'
  },
  {
    question: '¿Qué velocidad necesito para diferentes actividades?',
    answer: 'Navegación web básica: 5-10 Mbps. Streaming HD: 25 Mbps. Streaming 4K: 50+ Mbps. Gaming online: 25+ Mbps con ping bajo (<50ms). Videollamadas HD: 10-25 Mbps. Trabajo remoto: 50+ Mbps. Múltiples usuarios/dispositivos: multiplica por el número de usuarios simultáneos.'
  },
  {
    question: '¿WifiTOP guarda mis datos personales?',
    answer: 'WifiTOP solo guarda los resultados del test (velocidades, ping, país) de forma anónima para el ranking global. No recopilamos información personal identificable. Tu dirección IP se usa temporalmente para detectar el país y aplicar límites de uso, pero no se almacena permanentemente. Consulta nuestra política de privacidad para más detalles.'
  },
  {
    question: '¿Por qué los resultados varían entre diferentes tests?',
    answer: 'Es normal que haya pequeñas variaciones entre tests. Esto se debe a: fluctuaciones en la carga de la red, cambios en el enrutamiento de internet, variaciones en la carga del servidor, y condiciones de tu red local que cambian constantemente. Si las variaciones son muy grandes (más del 20%), puede indicar un problema con tu conexión.'
  },
  {
    question: '¿WifiTOP funciona en dispositivos móviles?',
    answer: 'Sí, WifiTOP está optimizado para funcionar en cualquier dispositivo con navegador web moderno: computadoras, tablets y smartphones. Ten en cuenta que las velocidades en dispositivos móviles por WiFi suelen ser menores que en computadoras con conexión por cable debido a las limitaciones del hardware WiFi móvil.'
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Preguntas Frecuentes
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre WifiTOP y cómo funciona nuestro test de velocidad.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">¿No encontraste tu respuesta?</h2>
            <p className="text-gray-400 mb-4">
              Si tienes más preguntas, no dudes en contactarnos.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300"
            >
              Volver al Test
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
