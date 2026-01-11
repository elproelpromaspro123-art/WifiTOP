'use client'

import Link from 'next/link'

export default function PrivacidadPage() {
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
              Política de Privacidad
            </span>
          </h1>
          <p className="text-gray-400">
            Última actualización: 11 de enero de 2026
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">1.</span> Introducción
              </h2>
              <p className="text-gray-400 leading-relaxed">
                En WifiTOP, nos comprometemos a proteger tu privacidad. Esta política describe qué información 
                recopilamos, cómo la usamos y los derechos que tienes sobre tus datos. Al utilizar nuestro 
                servicio de test de velocidad, aceptas las prácticas descritas en esta política.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">2.</span> Información que Recopilamos
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p><strong className="text-white">Datos del Test de Velocidad:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Velocidad de descarga y subida (en Mbps)</li>
                  <li>Latencia (ping) y jitter (en milisegundos)</li>
                  <li>Estabilidad de la conexión (porcentaje)</li>
                  <li>País de origen (detectado por IP)</li>
                  <li>Fecha y hora del test</li>
                </ul>
                <p><strong className="text-white">Datos Técnicos (temporales):</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dirección IP (para detección de país y límites de uso)</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Sistema operativo</li>
                </ul>
              </div>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">3.</span> Cómo Usamos tu Información
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>Utilizamos la información recopilada para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proporcionar resultados precisos del test de velocidad</li>
                  <li>Mantener el ranking global de velocidades</li>
                  <li>Calcular y otorgar insignias (badges) basadas en rendimiento</li>
                  <li>Generar estadísticas agregadas y anónimas</li>
                  <li>Prevenir abuso del servicio (límites de uso)</li>
                  <li>Detectar y prevenir actividad fraudulenta</li>
                  <li>Mejorar nuestro servicio y algoritmos de medición</li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">4.</span> Cookies y Almacenamiento Local
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>WifiTOP utiliza las siguientes tecnologías de almacenamiento:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Cookies de sesión:</strong> Para mantener tu preferencia de idioma</li>
                  <li><strong className="text-white">LocalStorage:</strong> Para guardar configuraciones locales del usuario</li>
                  <li><strong className="text-white">Cookies de análisis:</strong> Para entender cómo se usa el servicio (opcional)</li>
                </ul>
                <p>
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar 
                  algunas funcionalidades del sitio.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">5.</span> Retención de Datos
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los resultados del ranking se mantienen indefinidamente (solo top 100,000)</li>
                  <li>Las direcciones IP se almacenan temporalmente (máximo 24 horas) para límites de uso</li>
                  <li>Los datos de análisis agregados se mantienen de forma anónima</li>
                  <li>No almacenamos información personal identificable a largo plazo</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">6.</span> Compartición de Datos
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cuando sea requerido por ley o proceso legal</li>
                  <li>Para proteger nuestros derechos o seguridad</li>
                  <li>Con proveedores de servicios que nos ayudan a operar (bajo acuerdos de confidencialidad)</li>
                </ul>
                <p>
                  Los resultados del ranking son públicos pero solo muestran velocidad, país y fecha, 
                  sin información identificable.
                </p>
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">7.</span> Seguridad
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, 
                incluyendo cifrado HTTPS, acceso restringido a bases de datos, y monitoreo de seguridad. 
                Sin embargo, ningún sistema es 100% seguro, y no podemos garantizar la seguridad absoluta 
                de los datos transmitidos por internet.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">8.</span> Tus Derechos
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>Dependiendo de tu ubicación, puedes tener derecho a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceder a los datos que tenemos sobre ti</li>
                  <li>Solicitar la corrección de datos inexactos</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al procesamiento de tus datos</li>
                  <li>Solicitar la portabilidad de tus datos</li>
                </ul>
              </div>
            </section>

            {/* Children */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">9.</span> Menores de Edad
              </h2>
              <p className="text-gray-400 leading-relaxed">
                WifiTOP no está dirigido a menores de 13 años. No recopilamos conscientemente 
                información de niños. Si descubrimos que hemos recopilado datos de un menor, 
                tomaremos medidas para eliminar esa información.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">10.</span> Cambios a esta Política
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Podemos actualizar esta política de privacidad ocasionalmente. Los cambios serán 
                publicados en esta página con una nueva fecha de actualización. Te recomendamos 
                revisar esta política periódicamente.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">11.</span> Contacto
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu 
                información, puedes contactarnos a través de nuestro repositorio en GitHub.
              </p>
            </section>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Test
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
