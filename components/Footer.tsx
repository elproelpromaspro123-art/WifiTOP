export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>Made with 💙 by WifiTOP Team</p>
        <p className="mt-2">© {new Date().getFullYear()} WifiTOP - Speedtest Ranking</p>
      </div>
    </footer>
  )
}
