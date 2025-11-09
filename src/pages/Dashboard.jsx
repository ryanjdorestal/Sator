import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const [selectedSensor, setSelectedSensor] = useState('VALUE TYPE')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Eden, your AI agricultural assistant. I can help you interpret data, provide insights about your soil health, and answer questions about your fields. How can I assist you today?",
      sender: 'eden',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [topSensorData, setTopSensorData] = useState(null)
  const [bottomSensorData, setBottomSensorData] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const dropdownRef = useRef(null)
  const messagesEndRef = useRef(null)

  const sensorOptions = [
    'Temperature',
    'Humidity',
    'Light Intensity',
    'Air Quality',
    'Nitrogen (NPK)',
    'Phosphorus (NPK)',
    'Potassium (NPK)',
    'Soil Moisture'
  ]

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const [topRes, bottomRes] = await Promise.all([
          fetch('/api/thingspeak/top'),
          fetch('/api/thingspeak/bottom')
        ])
        
        if (topRes.ok) {
          const topData = await topRes.json()
          setTopSensorData(topData)
        }
        
        if (bottomRes.ok) {
          const bottomData = await bottomRes.json()
          setBottomSensorData(bottomData)
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchSensorData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSensorData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  // Get current sensor readings for Gemini context
  const getAllSensorReadings = () => {
    if (!topSensorData || !bottomSensorData) return null
    
    return {
      temperature: topSensorData.current.temperature,
      humidity: topSensorData.current.humidity,
      lightIntensity: topSensorData.current.lightPct,
      airQuality: topSensorData.current.airQuality,
      nitrogen: bottomSensorData.current.nitrogen,
      phosphorus: bottomSensorData.current.phosphorus,
      potassium: bottomSensorData.current.potassium,
      soilMoisture: bottomSensorData.current.soilMoisture,
      lastUpdated: topSensorData.current.timestamp
    }
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
      const allSensorData = getAllSensorReadings()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sensorData: allSensorData, // Send all current sensor data
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
        text: "I'm sorry, I'm having trouble connecting right now. Please make sure the backend server is running and configured properly.",
        sender: 'eden',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Render chart based on selected sensor
  const renderChart = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E0A622] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[#204D36] font-medium">Loading data...</p>
          </div>
        </div>
      )
    }

    if (selectedSensor === 'VALUE TYPE') {
      return (
        <div className="flex items-center justify-center h-full text-[#204D36] text-center px-8">
          <div>
            <p className="text-lg font-bold mb-2">Select a value from the dropdown above</p>
            <p className="text-sm opacity-70">View real-time data and historical trends</p>
          </div>
        </div>
      )
    }

    let chartData = null
    let label = ''
    let color = '#E0A622'
    let currentValue = 0

    // Map sensor selection to data
    switch (selectedSensor) {
      case 'Temperature':
        if (!topSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = topSensorData.history.map(d => d.temperature)
        currentValue = topSensorData.current.temperature
        label = 'Temperature (°C)'
        color = '#E74C3C'
        break
      case 'Humidity':
        if (!topSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = topSensorData.history.map(d => d.humidity)
        currentValue = topSensorData.current.humidity
        label = 'Humidity (%)'
        color = '#3498DB'
        break
      case 'Light Intensity':
        if (!topSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = topSensorData.history.map(d => d.lightPct)
        currentValue = topSensorData.current.lightPct
        label = 'Light Intensity (%)'
        color = '#F39C12'
        break
      case 'Air Quality':
        if (!topSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = topSensorData.history.map(d => d.airQuality)
        currentValue = topSensorData.current.airQuality
        label = 'Air Quality Index (AQI)'
        color = '#9B59B6'
        break
      case 'Nitrogen (NPK)':
        if (!bottomSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = bottomSensorData.history.map(d => d.nitrogen)
        currentValue = bottomSensorData.current.nitrogen
        label = 'Nitrogen (mg/kg)'
        color = '#2ECC71'
        break
      case 'Phosphorus (NPK)':
        if (!bottomSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = bottomSensorData.history.map(d => d.phosphorus)
        currentValue = bottomSensorData.current.phosphorus
        label = 'Phosphorus (mg/kg)'
        color = '#E67E22'
        break
      case 'Potassium (NPK)':
        if (!bottomSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = bottomSensorData.history.map(d => d.potassium)
        currentValue = bottomSensorData.current.potassium
        label = 'Potassium (mg/kg)'
        color = '#1ABC9C'
        break
      case 'Soil Moisture':
        if (!bottomSensorData) return <div className="text-[#204D36] p-4">No data available</div>
        chartData = bottomSensorData.history.map(d => d.soilMoisture)
        currentValue = bottomSensorData.current.soilMoisture
        label = 'Soil Moisture (%)'
        color = '#34495E'
        break
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-[#204D36] p-4">
          <p>No historical data available yet. Waiting for readings...</p>
        </div>
      )
    }

    const sourceData = topSensorData?.history || bottomSensorData?.history
    const timestamps = sourceData.map(d => 
      new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )

    const data = {
      labels: timestamps.slice(-20), // Last 20 readings
      datasets: [{
        label: label,
        data: chartData.slice(-20),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      }]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#204D36',
            font: { family: 'Space Grotesk, sans-serif', size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#204D36',
          titleColor: '#F8F5E1',
          bodyColor: '#F8F5E1',
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#204D36', 
            maxRotation: 45,
            font: { family: 'Inconsolata, monospace', size: 10 }
          },
          grid: { color: '#204D3620' }
        },
        y: {
          ticks: { 
            color: '#204D36',
            font: { family: 'Inconsolata, monospace', size: 11 }
          },
          grid: { color: '#204D3620' }
        }
      }
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <Line data={data} options={options} />
        </div>
        {/* Current Reading */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-[#204D36] opacity-70 mb-1">CURRENT READING</p>
          <p className="font-extrabold text-3xl" style={{ color: color, fontFamily: 'Inconsolata, monospace' }}>
            {currentValue?.toFixed(label.includes('AQI') ? 0 : 2)} 
            <span className="text-lg ml-2 opacity-70">
              {label.includes('(') ? label.match(/\((.*?)\)/)[1] : ''}
            </span>
          </p>
        </div>
      </div>
    )
  }

  // Render individual live data feeds
  const renderLiveDataFeeds = () => {
    if (dataLoading) return null
    
    const readings = [
      { label: 'Temperature', value: topSensorData?.current.temperature, unit: '°C', color: '#E74C3C' },
      { label: 'Humidity', value: topSensorData?.current.humidity, unit: '%', color: '#3498DB' },
      { label: 'Light Intensity', value: topSensorData?.current.lightPct, unit: '%', color: '#F39C12' },
      { label: 'Air Quality', value: topSensorData?.current.airQuality, unit: 'AQI', color: '#9B59B6' },
      { label: 'Nitrogen', value: bottomSensorData?.current.nitrogen, unit: 'mg/kg', color: '#2ECC71' },
      { label: 'Phosphorus', value: bottomSensorData?.current.phosphorus, unit: 'mg/kg', color: '#E67E22' },
      { label: 'Potassium', value: bottomSensorData?.current.potassium, unit: 'mg/kg', color: '#1ABC9C' },
      { label: 'Soil Moisture', value: bottomSensorData?.current.soilMoisture, unit: '%', color: '#34495E' },
    ]

    return (
      <div className="mt-4 space-y-2">
        {readings.map((reading, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-md border-l-4 flex items-center justify-between" style={{ borderColor: reading.color }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: reading.color }}></div>
                <p className="text-sm font-bold text-[#204D36]" style={{ fontFamily: 'Inconsolata, monospace' }}>
                  {reading.label.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold" style={{ color: reading.color, fontFamily: 'Inconsolata, monospace' }}>
                {reading.value !== undefined && reading.value !== null ? reading.value.toFixed(reading.unit === 'AQI' ? 0 : 1) : '--'}
                <span className="text-sm ml-2 opacity-70">{reading.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    )
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
                className="w-full bg-[#E0A622] text-[#204D36] font-extrabold text-[18px] px-5 py-3 rounded-[4px] flex items-center justify-between hover:bg-[#D09620] transition-colors"
                style={{ fontFamily: 'Inconsolata, monospace' }}
              >
                <span>{selectedSensor} ▼</span>
                <img src="/dropdown_arrow.png" alt="Dropdown" className="w-4 h-4 ml-2" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#204D36] rounded-[4px] shadow-[0_6px_12px_rgba(0,0,0,0.05)] z-50 max-h-60 overflow-y-auto">
                  {sensorOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSensorSelect(option)}
                      className="w-full text-left px-5 py-3 font-extrabold text-[16px] text-[#204D36] hover:bg-[#E8E1C4] transition-colors"
                      style={{ fontFamily: 'Inconsolata, monospace' }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data Feed - Chart */}
            <div className="flex-1 mt-6 bg-[#F8F5E1] overflow-auto">
              {renderChart()}
            </div>

            {/* Live Data Feeds */}
            {selectedSensor === 'VALUE TYPE' && renderLiveDataFeeds()}
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
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-[#E0A622] text-[#204D36]'
                        : 'bg-white text-[#204D36] shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#204D36] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#204D36] text-[#204D36] placeholder-[#204D36]/50 disabled:opacity-50"
                style={{ borderRadius: '100px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="hover:opacity-80 transition disabled:opacity-50"
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
