import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { generateMockSensorData, getMockEdenResponse } from '../utils/mockData'

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([])
  const [selectedSensor, setSelectedSensor] = useState('all')
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

  useEffect(() => {
    // Generate initial sensor data
    setSensorData(generateMockSensorData())
    
    // Update sensor data every 5 seconds
    const interval = setInterval(() => {
      setSensorData(generateMockSensorData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const edenResponse = {
        id: Date.now() + 1,
        text: getMockEdenResponse(inputMessage),
        sender: 'eden',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, edenResponse])
      setIsLoading(false)
    }, 1000)
  }

  const filteredSensorData = selectedSensor === 'all' 
    ? sensorData 
    : sensorData.filter(s => s.type === selectedSensor)

  const sensorTypes = ['all', ...new Set(sensorData.map(s => s.type))]

  return (
    <div className="min-h-screen bg-earth-darkGreen topographic-pattern-dark">
      <Navbar />
      
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Title */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-mutedYellow rounded flex items-center justify-center">
              <span className="text-earth-darkBrown font-bold">▶</span>
            </div>
            <h1 className="text-white text-2xl font-semibold">/dashboard</h1>
            <div className="ml-auto w-8 h-8 border border-white/30 rounded flex items-center justify-center hover:border-white transition cursor-pointer">
              <span className="text-white text-xl">+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Live Data Feed */}
            <div className="lg:col-span-7 bg-earth-cream/90 backdrop-blur-sm rounded-lg border border-earth-lightGreen/30 p-6 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-earth-darkGreen">LIVE DATA FEED</h2>
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  className="px-4 py-2 bg-earth-mutedYellow text-earth-darkBrown font-medium rounded border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-earth-darkGreen"
                >
                  {sensorTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'ALL SENSORS' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredSensorData.length === 0 ? (
                  <div className="text-center py-12 text-earth-darkGreen/60">
                    <p>No sensor data available</p>
                  </div>
                ) : (
                  filteredSensorData.map((sensor, index) => (
                    <div
                      key={index}
                      className="bg-white/70 rounded-lg p-6 border border-earth-lightGreen/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-earth-darkGreen">{sensor.name}</h3>
                        <span className="text-sm text-earth-darkGreen/60">
                          {new Date(sensor.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-earth-darkGreen">
                          {sensor.value}
                        </span>
                        <span className="text-earth-darkGreen/70">{sensor.unit}</span>
                      </div>
                      <div className="mt-3 text-sm text-earth-darkGreen/60">
                        Location: {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Middle Navigation Bar */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 bg-earth-brown/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-earth-brown/70 transition">
                <span className="text-white text-xl">🏠</span>
              </div>
              <div className="w-12 h-12 bg-earth-brown/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-earth-brown/70 transition">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <div className="w-12 h-12 bg-earth-brown/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-earth-brown/70 transition">
                <span className="text-white text-xl">?</span>
              </div>
            </div>

            {/* Right Panel: Chat Console with Eden */}
            <div className="lg:col-span-4 bg-earth-cream/90 backdrop-blur-sm rounded-lg border border-earth-lightGreen/30 p-6 min-h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-earth-lightGreen flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-earth-darkGreen">Eden</h2>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-earth-darkGreen/70">(Online)</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.sender === 'user'
                          ? 'bg-earth-mutedYellow text-earth-darkBrown'
                          : 'bg-white/70 text-earth-darkGreen'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-earth-darkGreen rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-earth-darkGreen rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-earth-darkGreen rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Eden about your soil data..."
                  className="flex-1 px-4 py-3 bg-white rounded-lg border border-earth-lightGreen/30 focus:outline-none focus:ring-2 focus:ring-earth-darkGreen text-earth-darkGreen placeholder-earth-darkGreen/50"
                />
                <button
                  type="submit"
                  className="w-12 h-12 bg-earth-brown rounded-lg flex items-center justify-center hover:bg-earth-brown/80 transition"
                >
                  <span className="text-white text-xl">▶</span>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Label */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-white/80">
              <span className="text-2xl">🤖</span>
              <span className="text-lg font-semibold">[ AI DASHBOARD ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

