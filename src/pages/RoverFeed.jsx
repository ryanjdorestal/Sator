import { useState } from 'react'
import { Link } from 'react-router-dom'

const RoverFeed = () => {
  const [streamError, setStreamError] = useState(false)
  
  // Use proxy endpoint to avoid CORS issues
  const esp32CameraUrl = '/api/camera-stream'

  return (
    <div className="min-h-screen bg-[#1B2A22] relative flex items-center justify-center">
      {/* Topographic pattern overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/topographic_pattern_dashboard.png')] bg-cover bg-center opacity-[0.11]" />
      </div>

      {/* Main Frame */}
      <div className="w-[820px] h-[520px] bg-[#E8E1C4] rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <h2 className="font-extrabold text-[18px] text-[#204D36]" style={{ fontFamily: 'Inconsolata, monospace' }}>
            ROVER VIEW
          </h2>
          <Link to="/" className="hover:opacity-80 transition">
            <img src="/home_button.png" alt="Home" className="w-6 h-6" />
          </Link>
        </div>

        {/* Inner Section */}
        <div className="absolute top-16 left-0 right-0 bottom-0 p-4">
          <h3 className="font-semibold text-[14px] text-[#204D36] mb-4" style={{ fontFamily: 'Inconsolata, monospace' }}>
            LIVE CAMERA FEED
          </h3>
          
          {/* ESP32 Camera Stream */}
          <div className="w-full h-[calc(100%-60px)] bg-black rounded-[4px] overflow-hidden flex items-center justify-center">
            {streamError || !esp32CameraUrl ? (
              <p className="text-white text-sm">
                {!esp32CameraUrl 
                  ? 'ESP32 camera URL not configured. Check .env file.' 
                  : 'Camera feed unavailable. Check ESP32 connection.'}
              </p>
            ) : (
              <img 
                src={esp32CameraUrl}
                alt="Live Rover Camera Feed"
                className="w-full h-full object-contain"
                onError={() => setStreamError(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoverFeed

