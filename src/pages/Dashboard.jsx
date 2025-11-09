import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [selectedSensor, setSelectedSensor] = useState('SENSOR TYPE')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Eden, your AI agricultural assistant. I can help you interpret sensor data, provide insights about your soil health, and answer questions about your fields. How can I assist you today?",
      sender: 'eden',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  const sensorOptions = [
    'Temperature Sensor',
    'Soil Moisture Sensor',
    'Air Quality Sensor',
    'Light Intensity Sensor',
    'Humidity Sensor'
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSensorSelect = (sensor) => {
    setSelectedSensor(sensor)
    setIsDropdownOpen(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    const messageToSend = inputMessage
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sensorData: selectedSensor !== 'SENSOR TYPE' ? { sensor: selectedSensor } : null,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      const edenResponse = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process your request.",
        sender: 'eden',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, edenResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please make sure the backend server is running and your GEMINI_API_KEY is configured in the .env file.",
        sender: 'eden',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1B2A22] relative">
      {/* Topographic pattern overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/topographic_pattern_dashboard.png')] bg-cover bg-center opacity-15" />
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 gap-6">
          {/* Left Card */}
          <div className="w-[627px] h-[866px] bg-[#F8F5E1] rounded-none shadow-[0_2px_4px_rgba(0,0,0,0.15)] p-6 flex flex-col">
            {/* Header */}
            <h2 className="font-extrabold text-[18px] text-[#204D36] mb-4" style={{ fontFamily: 'Inconsolata, monospace' }}>
              LIVE DATA FEED
            </h2>

            {/* Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#E0A622] text-[#204D36] font-extrabold text-[18px] px-5 py-3 rounded-[4px] flex items-center justify-between"
                style={{ fontFamily: 'Inconsolata, monospace' }}
              >
                <span>{selectedSensor} ▼</span>
                <img src="/dropdown_arrow.png" alt="Dropdown" className="w-4 h-4 ml-2" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#204D36] rounded-[4px] shadow-[0_6px_12px_rgba(0,0,0,0.05)] z-50">
                  {sensorOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSensorSelect(option)}
                      className="w-full text-left px-5 py-3 font-extrabold text-[18px] text-[#204D36] hover:bg-[#E8E1C4] transition-colors first:rounded-t-[4px] last:rounded-b-[4px]"
                      style={{ fontFamily: 'Inconsolata, monospace' }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data Feed Placeholder */}
            <div className="flex-1 mt-6 bg-[#F8F5E1]">
              {/* Placeholder for live data feed */}
            </div>
          </div>

          {/* Center Control Bar */}
          <div className="w-[122px] h-[411px] bg-[#F8F5E1] rounded-[30px] flex flex-col items-center justify-center gap-8 shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <Link to="/" className="hover:opacity-80 transition">
              <img src="/home_button.png" alt="Home" className="w-8 h-8" />
            </Link>
            <Link to="/rover-feed" className="hover:opacity-80 transition">
              <img src="/drone_button.png" alt="Rover Feed" className="w-8 h-8" />
            </Link>
            <button className="hover:opacity-80 transition cursor-not-allowed" disabled>
              <img src="/help_button.png" alt="Help" className="w-8 h-8 opacity-60" />
            </button>
          </div>

          {/* Right Card - AI Chat */}
          <div className="w-[627px] h-[866px] bg-[#F8F5E1] rounded-none shadow-[0_2px_4px_rgba(0,0,0,0.15)] p-6 flex flex-col">
            {/* Top Row */}
            <div className="flex items-center gap-3 mb-6">
              <img src="/eden_profile.png" alt="Eden" className="w-12 h-12 rounded-full" />
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[18px] text-[#204D36]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Eden
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#4AB37E] rounded-full"></div>
                  <span className="font-medium text-[16px] text-[#204D36]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    (Online)
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-[#E0A622] text-[#204D36]'
                        : 'bg-white text-[#204D36]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-white rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#204D36] text-[#204D36] placeholder-[#204D36]/50"
                style={{ borderRadius: '100px' }}
              />
              <button
                type="submit"
                className="hover:opacity-80 transition"
              >
                <img src="/send_button.png" alt="Send" className="w-8 h-8" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="font-bold text-[24px]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="text-[#E0A622]">ɣ</span>{' '}
            <span className="text-white">[ DASHBOARD ]</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
