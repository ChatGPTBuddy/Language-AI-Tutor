// Language mapping for full names
const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'zh': 'Mandarin',
    'nl': 'Dutch'
};

let currentAudio = null;
let recognition = null;

// Debug function
function log(message) {
    console.log(message);
    const debugDiv = document.getElementById('debug');
    if (debugDiv) {
        debugDiv.style.display = 'block';
        debugDiv.textContent = message;
    }
}

// Add message to conversation
function addMessage(role, content) {
    const conversationDiv = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `inline-block p-3 rounded-lg ${
        role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
    }`;
    bubble.textContent = content;
    
    messageDiv.appendChild(bubble);
    conversationDiv.appendChild(messageDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

// Speech synthesis setup
function speak(text, lang) {
    if ('speechSynthesis' in window) {
        if (currentAudio) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        currentAudio = utterance;
    }
}

// Speech recognition setup
function setupSpeechRecognition(lang) {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onresult = function(event) {
            const text = event.results[0][0].transcript;
            document.getElementById('userInput').value = text;
            sendMessage();
        };

        recognition.onerror = function(event) {
            log('Speech recognition error: ' + event.error);
        };
    } else {
        log('Speech recognition not supported in this browser');
    }
}

// Send message function
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    userInput.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nativeLanguage: document.getElementById('nativeLanguageSelect').value,
                targetLanguage: document.getElementById('targetLanguageSelect').value,
                difficulty: document.getElementById('difficultySelect').value,
                message: message
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        const tutorMessage = data.message;
        addMessage('system', tutorMessage);
        speak(tutorMessage, document.getElementById('targetLanguageSelect').value);
    } catch (error) {
        console.error('Error:', error);
        log(`Error: ${error.message}`);
        addMessage('system', 'Error: ' + error.message);
    }
}

// Start conversation handler
async function startConversation() {
    log('Starting conversation...');
    const nativeLanguage = document.getElementById('nativeLanguageSelect').value;
    const targetLanguage = document.getElementById('targetLanguageSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    
    // Clear previous conversation
    const conversationDiv = document.getElementById('conversation');
    conversationDiv.innerHTML = '';
    
    // Show controls
    document.getElementById('speakButton').classList.remove('hidden');
    document.getElementById('replayButton').classList.remove('hidden');
    document.getElementById('userInputArea').classList.remove('hidden');
    
    // Setup speech recognition
    setupSpeechRecognition(targetLanguage);
    
    try {
        log('Sending request to server...');
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nativeLanguage,
                targetLanguage,
                difficulty,
                message: "Let's start the conversation!"
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        const tutorMessage = data.message;
        addMessage('system', tutorMessage);
        speak(tutorMessage, targetLanguage);
        log('Conversation started successfully');
    } catch (error) {
        console.error('Error:', error);
        log(`Error: ${error.message}`);
        addMessage('system', 'Failed to start conversation. Error: ' + error.message);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up start button handler
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Start button clicked');
            try {
                await startConversation();
            } catch (error) {
                console.error('Error:', error);
            }
        });
        console.log('Start button handler attached');
    }

    // Set up speak button handler
    const speakButton = document.getElementById('speakButton');
    if (speakButton) {
        speakButton.addEventListener('click', () => {
            if (recognition) {
                recognition.start();
                log('Listening...');
            }
        });
    }

    // Set up replay button handler
    const replayButton = document.getElementById('replayButton');
    if (replayButton) {
        replayButton.addEventListener('click', () => {
            const lastMessage = document.querySelector('#conversation div:last-child div').textContent;
            speak(lastMessage, document.getElementById('targetLanguageSelect').value);
        });
    }

    // Set up send button handler
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Set up enter key handler for input
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Language selection handler
    const nativeLanguageSelect = document.getElementById('nativeLanguageSelect');
    const targetLanguageSelect = document.getElementById('targetLanguageSelect');
    
    if (nativeLanguageSelect && targetLanguageSelect) {
        nativeLanguageSelect.addEventListener('change', () => {
            const selectedNative = nativeLanguageSelect.value;
            Array.from(targetLanguageSelect.options).forEach(option => {
                option.disabled = option.value === selectedNative;
            });
            if (targetLanguageSelect.value === selectedNative) {
                const firstEnabled = Array.from(targetLanguageSelect.options)
                    .find(option => !option.disabled);
                if (firstEnabled) targetLanguageSelect.value = firstEnabled.value;
            }
        });

        // Trigger initial language validation
        nativeLanguageSelect.dispatchEvent(new Event('change'));
    }

    log('App initialized successfully!');
}); 