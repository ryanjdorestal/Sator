import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import DashboardPreview from '../sections/DashboardPreview'
import Team from '../sections/Team'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Mission + Vision Container with Continuous Gradient */}
      <div className="bg-gradient-to-b from-[#4B3A28] via-[#2E241A] to-[#0F0F0F] py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Mission Section */}
          <section id="mission" className="mb-16">
            {/* Mission Header Card */}
            <div className="bg-white/95 rounded-[20px] shadow-md p-8 md:p-12 max-w-[1300px] mx-auto mb-10">
              <h2 className="text-[32px] md:text-[44px] font-extrabold text-[#204D36] tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                Mission: Turning Data into Growth
              </h2>
              <div className="h-[3px] bg-[#E0A622] mt-2 mb-6 rounded-full w-full"></div>
              
              <p className="text-[16px] leading-relaxed text-[#2A2A2A]">
                At sunrise, a farmer walks the same field and gets five different answers: wet here, dry there, strong leaves, yellow corners. Guessing is expensive. Agriculture already uses ~70% of the world's freshwater, over a third of soils are degraded, and the food system drives ~a quarter of global emissions—while demand is projected to rise ~50% by 2050. SATOR exists so decisions aren't guesses.
              </p>
              
              <p className="text-[16px] leading-relaxed text-[#2A2A2A] mt-4">
                We turn the hidden layers of a field into readable intelligence—nutrients, moisture, and air—so farmers can place water, fertilizer, and seed where they actually matter. Our work aligns with SDG 2 (Zero Hunger) and SDG 13 (Climate Action): grow more with less, and protect the soil that feeds us.
              </p>
            </div>
            
            {/* Mission Image Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[1300px] mx-auto">
              <div className="relative rounded-[20px] overflow-hidden h-[300px]">
                <div className="absolute inset-0 scale-110">
                  <img src="/root-sensing.png" alt="Root Level Sensing" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-[48px] font-extrabold text-center px-4 leading-tight tracking-wide drop-shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ROOT LEVEL SENSING
                  </h3>
                </div>
              </div>
              
              <div className="relative rounded-[20px] overflow-hidden h-[300px]">
                <div className="absolute inset-0 scale-110">
                  <img src="/greener-decisions.png" alt="Greener Decisions" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-[48px] font-extrabold text-center px-4 leading-tight tracking-wide drop-shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                    GREENER DECISIONS
                  </h3>
                </div>
              </div>
              
              <div className="relative rounded-[20px] overflow-hidden h-[300px]">
                <div className="absolute inset-0 scale-110">
                  <img src="/data-dashboard.png" alt="Data to Dashboard" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-[48px] font-extrabold text-center px-4 leading-tight tracking-wide drop-shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                    DATA TO DASHBOARD
                  </h3>
                </div>
              </div>
            </div>
          </section>
          
          {/* Vision Section */}
          <section id="vision" className="mt-16">
            <div className="bg-white/95 rounded-[20px] shadow-md p-10 md:p-14 max-w-[1300px] mx-auto">
              <h2 className="text-[32px] md:text-[44px] font-extrabold text-[#204D36] tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                Vision: Fields that Learn
              </h2>
              <div className="h-[3px] bg-[#E0A622] mt-2 mb-6 rounded-full w-full"></div>
              
              <p className="text-[16px] leading-relaxed text-[#2A2A2A]">
                Like planetary rovers mapping new worlds, SATOR aims for multi-rover coverage that slowly, precisely charts a farm's growth zones. Each pass compares to the last, flags change, and guides where to plant, feed, and save water—practical autonomy at farm scale.
              </p>
            </div>
          </section>
          
        </div>
      </div>
      
      {/* Product Overview Section */}
      <section id="systems" className="relative overflow-hidden bg-gradient-to-b from-[#204D36] via-[#2E6B4D] to-[#4AB37E] py-20 md:py-24 px-6 md:px-12">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid-overlay.png')] bg-repeat opacity-10 pointer-events-none"></div>
        
        {/* Product Overview Header - Absolute positioned top-left (desktop) / centered (mobile) */}
        <h2 className="absolute top-12 left-1/2 md:left-[12%] -translate-x-1/2 md:translate-x-0 text-white text-[40px] md:text-[50px] font-extrabold leading-tight tracking-wide z-20 text-center md:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
          PRODUCT OVERVIEW
        </h2>
        
        <div className="relative z-10 max-w-7xl mx-auto pt-24 md:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Rover Image + Specs - Scaled up */}
            <div className="flex flex-col scale-[1.15] md:scale-[1.2] origin-top-left">
              <img 
                src="/rover-arepo.png" 
                alt="AREPO (SC-01) Rover" 
                className="max-w-[550px] md:max-w-[650px] w-full h-auto mb-8 object-contain"
              />
              
              <div>
                <h3 className="text-[25px] text-white mb-2" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  AREPO (SC-01)
                </h3>
                <h4 className="text-[25px] text-white mb-6" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800, letterSpacing: '0.02em' }}>
                  ROVER PLATFORM – BASE SPECS
                </h4>
                
                <ul className="space-y-2 text-white" style={{ fontFamily: 'Inconsolata, monospace', fontSize: '16px', letterSpacing: '0.02em' }}>
                  <li>Dimensions: ~780 x 520 x 420 mm</li>
                  <li>Weight: ~10-14 kg (battery dependent)</li>
                  <li>Drive: 4WD, independent suspension</li>
                  <li>Speed: up to 15 km/h</li>
                  <li>Runtime: up to 12 hr continuous</li>
                  <li>Battery: modular Li-ion pack, hot-swap</li>
                  <li>Comms: Wi-Fi / optional LTE; MQTT or HTTPS</li>
                  <li>Rating: target IP54 (dust/splash)</li>
                  <li>Operating temp: -10°C to 45°C</li>
                  <li>Expansion: 2x sensor bays, 1x external probe port</li>
                </ul>
              </div>
            </div>
            
            {/* Right Column: Product Overview + Systems - Closer to right edge */}
            <div className="flex flex-col gap-12 md:gap-16 w-full md:max-w-[620px] md:ml-auto md:mr-12">
              <p className="text-white text-[16px] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Built for autonomy and environmental precision, Sator's rover operates as a living bridge between soil and system. By combining adaptive hardware, real-time sensing, and secure data transfer, it enables farmers to monitor, predict, and act with scientific accuracy - turning raw terrain into readable intelligence.
              </p>
              
              <div className="w-full border-t-[10px] border-[#E0A622]"></div>
              
              {/* SYSTEM 01 */}
              <div>
                <h3 className="text-[25px] text-white mb-2" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  SYSTEM 01
                </h3>
                <h4 className="text-[25px] text-white mb-4" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  adaptive Chassis & Terrain Control
                </h4>
                <ul className="space-y-2 text-white mb-6" style={{ fontFamily: 'Inconsolata, monospace', fontSize: '16px', letterSpacing: '0.02em' }}>
                  <li>Drive: 4WD, independent suspension</li>
                  <li>Terrain: 45° incline / 0.4m obstacle clearance</li>
                  <li>Power: 1.5 kWh modular lithium pack</li>
                  <li>Runtime: 12 hr continuous</li>
                </ul>
              </div>
              
              <div className="w-full border-t-[10px] border-[#E0A622]"></div>
              
              {/* SYSTEM 02 */}
              <div>
                <h3 className="text-[25px] text-white mb-2" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  SYSTEM 02
                </h3>
                <h4 className="text-[25px] text-white mb-4" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  Multi-Depth Soil Sensing
                </h4>
                <ul className="space-y-2 text-white mb-6" style={{ fontFamily: 'Inconsolata, monospace', fontSize: '16px', letterSpacing: '0.02em' }}>
                  <li>Ground-contact sensor bay on chassis; drop-in probe for topsoil reads</li>
                  <li>Supported sensors: NPK + pH, moisture, temp/humidity/pressure, light, air quality</li>
                  <li>Quick-swap cartridges; guided warm-up and stabilization</li>
                  <li>Designed for repeatable passes and fixed points (no robotic arm)</li>
                </ul>
              </div>
              
              <div className="w-full border-t-[10px] border-[#E0A622]"></div>
              
              {/* SYSTEM 03 */}
              <div>
                <h3 className="text-[25px] text-white mb-2" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  SYSTEM 03
                </h3>
                <h4 className="text-[25px] text-white mb-4" style={{ fontFamily: 'Inconsolata, monospace', fontWeight: 800 }}>
                  Secure Data-to-Dashboard Pipeline
                </h4>
                <ul className="space-y-2 text-white mb-6" style={{ fontFamily: 'Inconsolata, monospace', fontSize: '16px', letterSpacing: '0.02em' }}>
                  <li>Edge capture: timestamp + location; offline cache</li>
                  <li>Transport: MQTT/HTTPS with retries + checksums</li>
                  <li>Ingest: authed gateway + time-series store</li>
                  <li>Process: normalize units, apply calibration, flag outliers</li>
                  <li>Dashboard: live tiles + history via WS</li>
                  <li>Eden: trends, anomalies, explanations</li>
                  <li>Security: TLS in transit, AES-128 at rest, signed device tokens</li>
                </ul>
              </div>
              
              <div className="w-full border-t-[10px] border-[#E0A622]"></div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Dashboard Preview Section */}
      <DashboardPreview />
      
      {/* Team Section */}
      <Team />
      
      {/* Footer Section */}
      <Footer />
    </>
  )
}

export default Home
