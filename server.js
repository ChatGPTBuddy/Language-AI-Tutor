import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies
app.use(express.json());

// Serve static files from the language-tutor directory using absolute path
app.use(express.static(path.join(__dirname, 'language-tutor')));

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'language-tutor', 'index.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { nativeLanguage, targetLanguage, difficulty, message } = req.body;
        
        console.log('Received chat request:', { nativeLanguage, targetLanguage, difficulty, message });
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful language tutor. The student's native language is ${nativeLanguage} and they are learning ${targetLanguage} at a ${difficulty} level. Keep responses appropriate for their level.`
                    },
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('OpenAI response:', data);
        res.json({ message: data.choices[0].message.content });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling for 404
app.use((req, res) => {
    res.status(404).send('Not Found: ' + req.url);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving files from: ${path.join(__dirname, 'language-tutor')}`);
}); 