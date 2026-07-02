require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gemini AI Core
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // This gives the AI its personality and context for your specific dashboard!
    systemInstruction: "You are the primary tactical AI for a Global Logistics & Telemetry Dashboard. You assist Commander Tanmay Prakash Shetty. Keep your responses concise, highly professional, and slightly military-esque (e.g., use terms like 'Acknowledged', 'Commander', 'Analyzing'). Your core expertise includes international trade law, maritime security, deep-sea mining in the Clarion-Clipperton Zone (CCZ), UNCLOS mandates, and orbital telemetry."
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Send the user's message to the Gemini API
        const result = await model.generateContent(userMessage);
        const reply = result.response.text();

        res.json({ reply });
    } catch (error) {
        console.error("AI Core Error:", error);
        res.json({ reply: "[CRITICAL ERROR]: CONNECTION TO AI CORE SEVERED. CHECK API KEY." });
    }
});

app.listen(3001, () => {
    console.log('AI Core active on http://localhost:3001');
});