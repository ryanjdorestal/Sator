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
    <footer className="bg-[#3B2C22] text-[#E0A622] w-full" style={{ minHeight: '350px' }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12" style={{ paddingTop: '30px', paddingBottom: '48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center" style={{ minHeight: '272px' }}>
          {/* Left Column - Flush with Team section content margin */}
          <div>
            <h3 className="font-bold text-[36px] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%', lineHeight: '50px' }}>
              INFRASTRUCTURE FOR EARTH'S FUTURE
            </h3>
            <p className="font-semibold text-[18px]" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%', lineHeight: '50px' }}>
              ɣ Sator
            </p>
          </div>
          
          {/* Center Column */}
          <div>
            <h4 className="font-medium text-[16px] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}>
              [ Quick Links ]
            </h4>
            <ul className="space-y-2" style={{ lineHeight: '120%' }}>
              <li>
                <a 
                  href="#hero" 
                  onClick={(e) => scrollToSection(e, 'hero')}
                  className="text-[#E0A622] hover:opacity-80 transition text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#mission" 
                  onClick={(e) => scrollToSection(e, 'mission')}
                  className="text-[#E0A622] hover:opacity-80 transition text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}
                >
                  Mission
                </a>
              </li>
              <li>
                <a 
                  href="#systems" 
                  onClick={(e) => scrollToSection(e, 'systems')}
                  className="text-[#E0A622] hover:opacity-80 transition text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}
                >
                  System
                </a>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-[#E0A622] hover:opacity-80 transition text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a 
                  href="#team" 
                  onClick={(e) => scrollToSection(e, 'team')}
                  className="text-[#E0A622] hover:opacity-80 transition text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}
                >
                  Team
                </a>
              </li>
            </ul>
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col h-full justify-between">
            <div>
              <h4 className="font-medium text-[16px] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}>
                [ Connect ]
              </h4>
              <div className="flex gap-4">
                <a href="mailto:contact@sator.com" className="hover:opacity-80 transition">
                  <img src="/email_icon_gold.png" alt="Email" className="w-8 h-8" />
                </a>
                <a href="https://linkedin.com/company/sator" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                  <img src="/linkedin_icon_gold.png" alt="LinkedIn" className="w-8 h-8" />
                </a>
                <a href="https://github.com/sator" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                  <img src="/github_icon_gold.png" alt="GitHub" className="w-8 h-8" />
                </a>
              </div>
            </div>
            <p className="text-[14px] text-right" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0%' }}>
              © 2025 Sator
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
