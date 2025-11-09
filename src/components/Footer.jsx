import { Link } from 'react-router-dom'

const Footer = () => {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <footer className="bg-earth-darkBrown text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">INFRASTRUCTURE FOR EARTH'S FUTURE</h3>
            <p className="text-earth-cream/80 text-sm">A Sator</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">[Quick Links]</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#hero" 
                  onClick={(e) => scrollToSection(e, 'hero')}
                  className="text-earth-cream/80 hover:text-white transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#mission" 
                  onClick={(e) => scrollToSection(e, 'mission')}
                  className="text-earth-cream/80 hover:text-white transition"
                >
                  Mission
                </a>
              </li>
              <li>
                <a 
                  href="#systems" 
                  onClick={(e) => scrollToSection(e, 'systems')}
                  className="text-earth-cream/80 hover:text-white transition"
                >
                  Systems
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="text-earth-cream/80 hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <a 
                  href="#team" 
                  onClick={(e) => scrollToSection(e, 'team')}
                  className="text-earth-cream/80 hover:text-white transition"
                >
                  Team
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">[Connect]</h4>
            <div className="flex gap-4 mb-4">
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center hover:border-white transition cursor-pointer">
                <span className="text-xs">📧</span>
              </div>
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center hover:border-white transition cursor-pointer">
                <span className="text-xs">🐦</span>
              </div>
              <div className="w-8 h-8 border border-white/30 rounded flex items-center justify-center hover:border-white transition cursor-pointer">
                <span className="text-xs">💼</span>
              </div>
            </div>
            <p className="text-earth-cream/60 text-xs">© Sator 2024</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

