// Mock sensor data generator
export const generateMockSensorData = () => {
  const sensors = [
    { type: 'NPK', name: 'Nitrogen-Phosphorus-Potassium', unit: 'ppm' },
    { type: 'pH', name: 'Soil Acidity', unit: 'pH' },
    { type: 'Moisture', name: 'Soil Moisture', unit: '%' },
    { type: 'Temperature', name: 'Soil Temperature', unit: '°C' },
  ]

  return sensors.map(sensor => ({
    ...sensor,
    value: sensor.type === 'pH' 
      ? (Math.random() * 2 + 6).toFixed(1)
      : sensor.type === 'Moisture'
      ? Math.floor(Math.random() * 40 + 30)
      : sensor.type === 'Temperature'
      ? Math.floor(Math.random() * 15 + 15)
      : Math.floor(Math.random() * 200 + 50),
    timestamp: new Date().toISOString(),
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.01,
      lng: -122.4194 + (Math.random() - 0.5) * 0.01,
    },
  }))
}

// Mock chat responses for Eden
export const getMockEdenResponse = (message) => {
  const responses = [
    "Based on the current sensor readings, your soil pH is optimal for most crops. The nitrogen levels are slightly low - consider adding organic compost.",
    "The moisture sensors indicate adequate hydration in the topsoil layer. However, deeper probes show some dry zones that may need attention.",
    "Temperature readings are within normal range for this season. The rover's multi-depth sensing shows consistent data across all probe depths.",
    "I'm analyzing the NPK levels across your field. The phosphorus readings are particularly strong in the northern quadrant.",
    "The topographic data suggests some areas with higher compaction. I recommend adjusting the rover's probe depth settings for those zones.",
    "All systems are operating normally. The secure data pipeline is transmitting real-time readings to the dashboard without interruption.",
  ]
  
  // Simple keyword matching for more contextual responses
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('ph') || lowerMessage.includes('acid')) {
    return "Your soil pH readings are currently at 6.8, which is ideal for most agricultural crops. This level supports optimal nutrient availability."
  }
  if (lowerMessage.includes('moisture') || lowerMessage.includes('water')) {
    return "Moisture sensors show 45% at surface level and 38% at 15cm depth. The irrigation system appears to be maintaining adequate hydration."
  }
  if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
    return "Current soil temperature is 18°C at the surface and 16°C at depth. These readings are consistent with seasonal expectations."
  }
  if (lowerMessage.includes('npk') || lowerMessage.includes('nutrient')) {
    return "NPK analysis shows: Nitrogen 85ppm, Phosphorus 120ppm, Potassium 95ppm. Phosphorus levels are excellent, while nitrogen could be enhanced with organic amendments."
  }
  
  return responses[Math.floor(Math.random() * responses.length)]
}

