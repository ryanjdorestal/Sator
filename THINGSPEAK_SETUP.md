# ThingSpeak Dashboard Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# ThingSpeak Top Sensors (DHT22 + Light + Air Quality)
THINGSPEAK_TOP_CHANNEL_ID=your_top_channel_id_here
THINGSPEAK_TOP_READ_KEY=2ZZ9Y9ZPT0PYCWGN

# ThingSpeak Bottom Sensors (NPK + Soil Moisture)
THINGSPEAK_BOTTOM_CHANNEL_ID=your_bottom_channel_id_here
THINGSPEAK_BOTTOM_READ_KEY=3S2GXG7G6FLX3KF6

# ESP32 Camera URL (optional)
ESP32_CAMERA_URL=http://192.168.1.100:81/stream
```

## How to Get Your ThingSpeak Channel IDs

1. Go to https://thingspeak.com/
2. Sign in to your account
3. Click on "Channels" in the top menu
4. Click on your channel name (e.g., "Sator Top Sensors" or "Sator Bottom Sensors")
5. The Channel ID is displayed at the top of the page under the channel name
6. Copy the Channel ID and paste it into your `.env` file

## Sensor Field Mapping

### Top Sensors (DHT22 + Light + Air Quality)
- **Field 1**: Temperature (°C)
- **Field 2**: Humidity (%)
- **Field 3**: Light Intensity (%)
- **Field 4**: Air Quality Index (AQI) - 0-600 scale
  * 0-50: Good
  * 51-100: Moderate
  * 101-150: Unhealthy for Sensitive Groups
  * 151-200: Unhealthy
  * 201-300: Very Unhealthy
  * 301-600: Hazardous
- **Field 5**: Raw Light (optional)
- **Field 6**: Raw Air (optional)

### Bottom Sensors (NPK + Soil Moisture)
- **Field 1**: Nitrogen (mg/kg)
- **Field 2**: Phosphorus (mg/kg)
- **Field 3**: Potassium (mg/kg)
- **Field 4**: Soil Moisture (%)

## Features Implemented

✅ **Real-time Data Display**: Auto-refreshes every 30 seconds  
✅ **Interactive Charts**: Select any sensor to view historical data  
✅ **Current Readings**: View all sensor values at a glance  
✅ **AI Integration**: Gemini chatbot automatically receives sensor data  
✅ **Color-coded Visualizations**: Each sensor has a unique color  
✅ **Historical Trends**: Last 100 readings stored and displayed  

## Running the Application

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Start both the backend and frontend:
   ```bash
   npm run dev:all
   ```

   Or start them separately:
   ```bash
   npm start      # Backend on port 5000
   npm run dev    # Frontend on Vite dev server
   ```

3. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`)

## Troubleshooting

### "ThingSpeak credentials not configured" Error
- Make sure you've created the `.env` file in the root directory
- Verify that your Channel IDs are correct
- Check that the Read API Keys match your ThingSpeak channels

### "No data available" Message
- Ensure your Arduino devices are running and uploading data
- Check that they're using the correct Channel IDs and Write API Keys
- Verify your internet connection
- Wait at least 20 seconds after starting the Arduinos (ThingSpeak rate limit)

### Charts Not Displaying
- Check browser console for errors
- Ensure Chart.js packages are installed: `npm install chart.js react-chartjs-2`
- Clear browser cache and refresh

### Gemini Chatbot Not Responding
- Verify your `GEMINI_API_KEY` is set in the `.env` file
- Check the backend console for error messages
- Ensure the backend server is running on port 5000

## API Endpoints

- `POST /api/chat` - Send messages to Gemini with sensor context
- `GET /api/thingspeak/top` - Get top sensor data (temperature, humidity, light, air quality)
- `GET /api/thingspeak/bottom` - Get bottom sensor data (NPK, soil moisture)
- `GET /api/camera-stream` - Proxy ESP32 camera stream

## Sensor Data Access for Gemini

The Eden AI chatbot automatically receives ALL current sensor readings with every message, including:
- Temperature, Humidity, Light Intensity, Air Quality Index (AQI)
- Nitrogen, Phosphorus, Potassium levels
- Soil Moisture percentage
- Last update timestamp

The chatbot understands the AQI scale (0-600) and its health implications:
- 0-50: Good (safe for all activities)
- 51-100: Moderate (acceptable quality)
- 101-150: Unhealthy for Sensitive Groups
- 151-200: Unhealthy
- 201-300: Very Unhealthy
- 301-600: Hazardous

You can ask Eden questions like:
- "What's the current soil condition?"
- "Should I water the plants?"
- "Is the nitrogen level good for growing tomatoes?"
- "What do the current readings suggest?"
- "Is the air quality safe for field work today?"

