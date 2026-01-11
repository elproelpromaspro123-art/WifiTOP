'use client'

import Link from 'next/link'

export default function TerminosPage() {
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
              Términos de Servicio
            </span>
          </h1>
          <p className="text-gray-400">
            Última actualización: 11 de enero de 2026
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 space-y-8">
            
            {/* Acceptance */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">1.</span> Aceptación de los Términos
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Al acceder y utilizar WifiTOP ("el Servicio"), aceptas estar sujeto a estos Términos de Servicio. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar el Servicio. 
                Nos reservamos el derecho de modificar estos términos en cualquier momento, y tu uso continuado 
                del Servicio constituye la aceptación de dichos cambios.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">2.</span> Descripción del Servicio
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>WifiTOP proporciona:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Test de velocidad de conexión a internet</li>
                  <li>Medición de ping, jitter y estabilidad</li>
                  <li>Ranking global de velocidades</li>
                  <li>Sistema de insignias y logros</li>
                  <li>Estadísticas agregadas de uso</li>
                </ul>
                <p>
                  El Servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de 
                  ningún tipo sobre la precisión de las mediciones o la disponibilidad continua.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">3.</span> Uso Aceptable
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>Al usar WifiTOP, te comprometes a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Usar el Servicio solo para propósitos legítimos</li>
                  <li>No intentar manipular o falsificar resultados de tests</li>
                  <li>No usar bots, scripts o automatizaciones no autorizadas</li>
                  <li>No intentar sobrecargar o interferir con los servidores</li>
                  <li>No eludir los límites de uso establecidos (5 tests/minuto, 20 tests/hora)</li>
                  <li>No utilizar VPNs o proxies para evadir restricciones geográficas o de uso</li>
                  <li>No realizar ingeniería inversa del Servicio</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">4.</span> Actividades Prohibidas
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>Está estrictamente prohibido:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Manipular artificialmente los resultados de velocidad</li>
                  <li>Crear múltiples cuentas o identidades para evadir límites</li>
                  <li>Usar el Servicio para actividades ilegales</li>
                  <li>Intentar acceder a sistemas o datos no autorizados</li>
                  <li>Distribuir malware o código malicioso</li>
                  <li>Acosar o abusar de otros usuarios</li>
                  <li>Violar derechos de propiedad intelectual</li>
                </ul>
                <p>
                  La violación de estas reglas puede resultar en la suspensión o prohibición 
                  permanente del acceso al Servicio.
                </p>
              </div>
            </section>

            {/* Rate Limits */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">5.</span> Límites de Uso
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>Para garantizar la calidad del Servicio para todos los usuarios:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Máximo 5 tests por minuto por IP</li>
                  <li>Máximo 20 tests por hora por IP</li>
                  <li>Los resultados sospechosos pueden ser descartados automáticamente</li>
                </ul>
                <p>
                  Estos límites pueden cambiar sin previo aviso según las necesidades del Servicio.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">6.</span> Propiedad Intelectual
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Todo el contenido, diseño, código, gráficos, logotipos y marcas de WifiTOP son 
                propiedad de sus respectivos dueños y están protegidos por leyes de propiedad 
                intelectual. No puedes copiar, modificar, distribuir o crear obras derivadas 
                sin autorización expresa por escrito.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">7.</span> Descargo de Responsabilidad
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p className="uppercase text-sm font-semibold text-yellow-400/80">
                  El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD".
                </p>
                <p>WifiTOP no garantiza:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La precisión absoluta de las mediciones de velocidad</li>
                  <li>Que el Servicio estará disponible sin interrupciones</li>
                  <li>Que el Servicio estará libre de errores o defectos</li>
                  <li>Que los resultados serán consistentes con otros servicios de medición</li>
                  <li>Que el ranking reflejará con exactitud el rendimiento real</li>
                </ul>
                <p>
                  Los resultados del test son aproximaciones y pueden variar según múltiples 
                  factores fuera de nuestro control.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">8.</span> Limitación de Responsabilidad
              </h2>
              <div className="text-gray-400 leading-relaxed space-y-4">
                <p>
                  En la máxima medida permitida por la ley aplicable, WifiTOP y sus operadores 
                  no serán responsables por:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Daños directos, indirectos, incidentales o consecuentes</li>
                  <li>Pérdida de datos, beneficios o ingresos</li>
                  <li>Interrupciones del Servicio</li>
                  <li>Decisiones tomadas basándose en los resultados del test</li>
                  <li>Problemas con tu proveedor de internet o equipos</li>
                </ul>
                <p>
                  El uso del Servicio es bajo tu propio riesgo. No debes usar los resultados 
                  como única base para reclamaciones contra tu proveedor de internet.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">9.</span> Indemnización
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Aceptas defender, indemnizar y mantener indemne a WifiTOP y sus operadores 
                de cualquier reclamación, daño, obligación, pérdida, responsabilidad, costo 
                o deuda que surja de tu uso del Servicio o violación de estos términos.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">10.</span> Terminación
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nos reservamos el derecho de suspender o terminar tu acceso al Servicio en 
                cualquier momento, por cualquier razón, sin previo aviso. Puedes dejar de 
                usar el Servicio en cualquier momento. Las disposiciones que por su naturaleza 
                deban sobrevivir a la terminación, lo harán.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">11.</span> Ley Aplicable
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Estos términos se regirán e interpretarán de acuerdo con las leyes aplicables, 
                sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier 
                disputa se resolverá en los tribunales competentes.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">12.</span> Modificaciones
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios entrarán en vigor inmediatamente después de su publicación en 
                esta página. Es tu responsabilidad revisar periódicamente estos términos.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">13.</span> Contacto
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos 
                a través de nuestro repositorio en GitHub.
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
