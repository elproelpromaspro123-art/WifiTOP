import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-gray-400 mb-6">Página no encontrada</p>
      <Link href="/" className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition">
        Volver al inicio
      </Link>
    </div>
  )
}
