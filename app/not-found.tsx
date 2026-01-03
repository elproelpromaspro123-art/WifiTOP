import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="glow-border rounded-lg p-8 text-center max-w-md">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-gray-400 mb-6">Página no encontrada</p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
