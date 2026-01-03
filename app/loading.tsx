export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}
