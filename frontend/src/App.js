import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom Glowing Radar Blip for the ISS
const glowingIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ff3366; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 15px #ff3366, 0 0 30px #ff3366; border: 2px solid #fff;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function App() {
  const [waveData, setWaveData] = useState(null);
  const [issPosition, setIssPosition] = useState([0, 0]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
  fetch('http://127.0.0.1:8000/api/marine-weather')
      .then(res => res.json())
      .then(data => setWaveData(data))
      .catch(err => console.error("FastAPI error:", err));

    const fetchISS = async () => {
      try {
        const response = await fetch('http://api.open-notify.org/iss-now.json');
        const data = await response.json();
        setIssPosition([parseFloat(data.iss_position.latitude), parseFloat(data.iss_position.longitude)]);
      } catch (err) {
        console.error("ISS API Error:", err);
      }
    };
    
    fetchISS();
    const interval = setInterval(fetchISS, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput) return;
    
    const newHistory = [...chatHistory, { sender: 'User', text: chatInput }];
    setChatHistory(newHistory);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatHistory([...newHistory, { sender: 'AI', text: data.reply }]);
    } catch (err) {
      setChatHistory([...newHistory, { sender: 'System', text: 'SERVER OFFLINE. SECURE CONNECTION LOST.' }]);
    }
    setChatInput('');
  };

  return (
    <div style={{ backgroundColor: '#050b14', color: '#8892b0', minHeight: '100vh', padding: '20px', fontFamily: '"Roboto Mono", monospace', boxSizing: 'border-box' }}>
      
      {/* Top Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #00f0ff', paddingBottom: '15px', marginBottom: '25px' }}>
        <div>
          <h1 style={{ color: '#00f0ff', margin: 0, fontFamily: '"Orbitron", sans-serif', letterSpacing: '2px', textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}>
            GLOBAL TELEMETRY & SYSTEM DASHBOARD
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#a8b2d1' }}>Real-time System Monitor: Sensor API & Orbital Tracking</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', backgroundColor: 'rgba(0, 240, 255, 0.05)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
           AUTHORIZED USER: <strong style={{ color: '#fff' }}>TANMAY PRAKASH SHETTY</strong><br/>
           CLEARANCE: <span style={{ color: '#00f0ff' }}>LEVEL 5 (ACTIVE)</span>
        </div>
      </header>
      
      <div style={{ display: 'flex', gap: '25px', height: 'calc(100vh - 120px)' }}>
        
        {/* Left Column: Map & Data */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ flex: 1, border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
             <MapContainer center={[20, 0]} zoom={2.5} style={{ height: '100%', width: '100%', backgroundColor: '#02060d' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
              <Marker position={issPosition} icon={glowingIcon}>
                <Popup className="custom-popup">
                  <strong style={{ color: '#000' }}>ISS Orbital Station</strong><br/>
                  Lat: {issPosition[0].toFixed(4)}
                </Popup>
              </Marker>
            </MapContainer>
            
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000, backgroundColor: 'rgba(5, 11, 20, 0.85)', padding: '15px', border: '1px solid #00f0ff', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
              <h3 style={{ color: '#00f0ff', margin: '0 0 10px 0', fontSize: '14px', fontFamily: '"Orbitron", sans-serif' }}>ORBITAL TELEMETRY</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#e6f1ff' }}>LAT: {issPosition[0].toFixed(4)}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#e6f1ff' }}>LNG: {issPosition[1].toFixed(4)}</p>
              <div style={{ marginTop: '10px', height: '2px', backgroundColor: '#00f0ff', width: '100%', boxShadow: '0 0 5px #00f0ff' }}></div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(5, 11, 20, 0.6)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <h2 style={{ color: '#00f0ff', fontSize: '16px', marginTop: 0, fontFamily: '"Orbitron", sans-serif', letterSpacing: '1px' }}>GLOBAL SENSOR ARRAY (CCZ / Red Sea)</h2>
            {waveData ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}><strong>Sector:</strong> <span style={{ color: '#e6f1ff' }}>{waveData.region}</span></p>
                <p style={{ margin: 0 }}><strong>Wave Height:</strong> <span style={{ color: '#ff3366', fontWeight: 'bold', fontSize: '16px' }}>{waveData.wave_height_meters}m</span></p>
                <p style={{ margin: 0, color: '#00f0ff' }}>[ DATA STREAM SECURE ]</p>
              </div>
            ) : <p style={{ color: '#ff3366', fontWeight: 'bold' }}>[!] SENSOR UPLINK FAILED. INITIALIZING RECONNECT PROTOCOL...</p>}
          </div>

        </div>

        {/* Right Column: AI Chatbot */}
        <div style={{ flex: 1.2, backgroundColor: 'rgba(5, 11, 20, 0.6)', padding: '25px', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#00f0ff', fontSize: '16px', marginTop: 0, borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '15px', fontFamily: '"Orbitron", sans-serif', letterSpacing: '1px' }}>
            STRATEGIC AI INTRANET
          </h2>
          
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'User' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                padding: '12px 15px',
                borderRadius: '6px',
                maxWidth: '85%',
                border: msg.sender === 'AI' ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                borderLeft: msg.sender === 'AI' ? '3px solid #00f0ff' : 'none',
                borderRight: msg.sender === 'User' ? '3px solid #ff3366' : 'none',
              }}>
                <span style={{ color: msg.sender === 'User' ? '#ff3366' : '#00f0ff', fontSize: '11px', display: 'block', marginBottom: '6px', fontFamily: '"Orbitron", sans-serif' }}>
                  {msg.sender === 'User' ? 'COMMANDER UPLINK' : 'SYSTEM AI RESPONSE'}
                </span>
                <span style={{ color: '#e6f1ff', lineHeight: '1.4' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Query AI regarding operational mandates..."
              style={{ flex: 1, padding: '12px 15px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 240, 255, 0.4)', color: '#00f0ff', borderRadius: '4px', outline: 'none', fontFamily: '"Roboto Mono", monospace' }}
            />
            <button onClick={handleSendMessage} style={{ padding: '0 25px', backgroundColor: 'transparent', color: '#00f0ff', border: '1px solid #00f0ff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif', textTransform: 'uppercase', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(0,240,255,0.2)' }}>
              EXECUTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;