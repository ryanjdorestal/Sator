import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  if (isDashboard) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-[#E0A622] font-bold text-[22px]">λ</span>
              <span className="text-[#204D36] font-semibold text-[20px]">Sator</span>
            </Link>
            <Link 
              to="/" 
              className="px-4 py-2 bg-[#E0A622] text-white font-bold text-xs rounded-full hover:bg-[#E3B341] transition"
            >
              ← Home
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className="bg-white rounded-full py-3.5 px-8 shadow-md flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[22px] text-[#E0A622] font-bold leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>λ</span>
          <span className="text-[20px] font-semibold text-[#204D36] leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Sator</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center">
          <a 
            href="#hero" 
            onClick={(e) => scrollToSection(e, 'hero')}
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Home
          </a>
          <span className="text-[#2A2A2A] opacity-60 text-sm">|</span>
          <a 
            href="#mission" 
            onClick={(e) => scrollToSection(e, 'mission')}
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Mission
          </a>
          <span className="text-[#2A2A2A] opacity-60 text-sm">|</span>
          <a 
            href="#systems" 
            onClick={(e) => scrollToSection(e, 'systems')}
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            System
          </a>
          <span className="text-[#2A2A2A] opacity-60 text-sm">|</span>
          <a 
            href="#dashboard-preview" 
            onClick={(e) => scrollToSection(e, 'dashboard-preview')}
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Dashboard
          </a>
          <span className="text-[#2A2A2A] opacity-60 text-sm">|</span>
          <a 
            href="#team" 
            onClick={(e) => scrollToSection(e, 'team')}
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Team
          </a>
          <span className="text-[#2A2A2A] opacity-60 text-sm">|</span>
          <Link 
            to="/rewards" 
            className="text-[14px] font-medium text-[#204D36] mx-4 hover:text-[#E0A622] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Rewards
          </Link>
        </div>
        
        {/* CTA Button */}
        <Link 
          to="/dashboard" 
          className="text-[13px] font-semibold bg-[#E0A622] text-white py-1.5 px-4 rounded-full hover:bg-[#E3B341] transition-all duration-200 whitespace-nowrap"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Live Rover View
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
