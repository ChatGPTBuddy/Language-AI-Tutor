// DOM Elements
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    nativeLanguageSelect: document.getElementById('nativeLanguageSelect'),
    targetLanguageSelect: document.getElementById('targetLanguageSelect'),
    difficultySelect: document.getElementById('difficultySelect'),
    startButton: document.getElementById('startButton'),
    stopButton: document.getElementById('stopButton'),
    resetButton: document.getElementById('resetButton'),
    speakButton: document.getElementById('speakButton'),
    replayButton: document.getElementById('replayButton'),
    conversation: document.getElementById('conversation'),
    userInputArea: document.getElementById('userInputArea'),
    userInput: document.getElementById('userInput'),
    sendButton: document.getElementById('sendButton'),
    emojiButton: document.getElementById('emojiButton'),
};

// State
let state = {
    isDarkMode: false,
    isConversationActive: false,
    sessionStartTime: null,
    messageCount: 0,
    lastResponse: '',
    isStopped: false
};

// Theme Toggle
elements.themeToggle.addEventListener('click', () => {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark');
    updateTheme();
});

function updateTheme() {
    if (state.isDarkMode) {
        document.body.style.backgroundColor = 'var(--background-dark)';
        document.body.style.color = 'var(--text-dark)';
    } else {
        document.body.style.backgroundColor = 'var(--background-light)';
        document.body.style.color = 'var(--text-light)';
    }
}

// Conversation Management
elements.startButton.addEventListener('click', startConversation);
elements.stopButton.addEventListener('click', stopConversation);
elements.resetButton.addEventListener('click', resetConversation);
elements.sendButton.addEventListener('click', sendMessage);
elements.userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Speech Synthesis
let currentSpeech = null;

function speakText(text, lang) {
    // Cancel any ongoing speech
    if (currentSpeech) {
        window.speechSynthesis.cancel();
    }

    // Create new speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    currentSpeech = utterance;

    // Speak the text
    window.speechSynthesis.speak(utterance);
}

async function startConversation() {
    state.isConversationActive = true;
    state.isStopped = false;
    state.sessionStartTime = new Date();
    state.messageCount = 0;
    
    elements.conversation.innerHTML = '';
    elements.userInputArea.classList.remove('hidden');
    elements.speakButton.classList.remove('hidden');
    elements.replayButton.classList.remove('hidden');
    elements.stopButton.classList.remove('hidden');
    elements.resetButton.classList.remove('hidden');
    elements.startButton.classList.add('hidden');
    
    // Initial greeting
    const greeting = await getAIResponse('Hello! I am ready to help you learn ' + 
        elements.targetLanguageSelect.options[elements.targetLanguageSelect.selectedIndex].text);
    addMessage(greeting, 'ai');
    // Speak the greeting
    speakText(greeting, elements.targetLanguageSelect.value);
    updateProgress();
}

function stopConversation() {
    state.isStopped = true;
    state.isConversationActive = false;
    
    // Stop any ongoing speech
    if (currentSpeech) {
        window.speechSynthesis.cancel();
        currentSpeech = null;
    }
    
    // Disable input and show appropriate buttons
    elements.userInputArea.classList.add('hidden');
    elements.speakButton.classList.add('hidden');
    elements.replayButton.classList.add('hidden');
    elements.stopButton.classList.add('hidden');
    elements.startButton.classList.remove('hidden');
    
    // Add system message
    addMessage('Conversation paused. Click "Start Conversation" to begin a new session or "Reset" to clear the current conversation.', 'system');
}

function resetConversation() {
    // Stop any ongoing speech
    if (currentSpeech) {
        window.speechSynthesis.cancel();
        currentSpeech = null;
    }
    
    // Reset state
    state.isConversationActive = false;
    state.isStopped = false;
    state.sessionStartTime = null;
    state.messageCount = 0;
    state.lastResponse = '';
    
    // Reset UI
    elements.conversation.innerHTML = '';
    elements.userInputArea.classList.add('hidden');
    elements.speakButton.classList.add('hidden');
    elements.replayButton.classList.add('hidden');
    elements.stopButton.classList.add('hidden');
    elements.resetButton.classList.add('hidden');
    elements.startButton.classList.remove('hidden');
    elements.userInput.value = '';
    
    // Reset progress
    updateProgress();
    
    // Add initial message
    const initialMessage = document.createElement('div');
    initialMessage.className = 'flex justify-center items-center h-full text-gray-500';
    initialMessage.innerHTML = `
        <div class="text-center">
            <i class="fas fa-comments text-4xl mb-2"></i>
            <p>Click "Start Conversation" to begin...</p>
        </div>
    `;
    elements.conversation.appendChild(initialMessage);
}

async function sendMessage() {
    if (!state.isConversationActive || state.isStopped) return;
    
    const message = elements.userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    elements.userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response
    const response = await getAIResponse(message);
    if (!state.isStopped) {
        hideTypingIndicator();
        addMessage(response, 'ai');
        // Speak the AI response
        speakText(response, elements.targetLanguageSelect.value);
        
        state.lastResponse = response;
        state.messageCount += 2;
        updateProgress();
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Add different styling for system messages
    if (sender === 'system') {
        messageDiv.className = 'message system-message';
        messageDiv.style.backgroundColor = '#FEF3C7';
        messageDiv.style.color = '#92400E';
        messageDiv.style.margin = '8px auto';
    }
    
    messageDiv.textContent = text;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'text-xs text-gray-400 mt-1';
    timestamp.textContent = new Date().toLocaleTimeString();
    messageDiv.appendChild(timestamp);
    
    elements.conversation.appendChild(messageDiv);
    elements.conversation.scrollTop = elements.conversation.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    elements.conversation.appendChild(indicator);
    elements.conversation.scrollTop = elements.conversation.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = elements.conversation.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

// Progress Tracking
function updateProgress() {
    const progressBar = document.querySelector('.bg-blue-600');
    const messageCount = document.querySelector('span:first-child');
    const sessionTime = document.querySelector('span:last-child');
    
    // Update message count
    messageCount.textContent = `${state.messageCount} messages`;
    
    // Update session time
    if (state.sessionStartTime) {
        const duration = Math.floor((new Date() - state.sessionStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        sessionTime.textContent = `Session time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update progress bar (max at 100 messages)
    const progress = Math.min((state.messageCount / 100) * 100, 100);
    progressBar.style.width = `${progress}%`;
}

// Voice Input/Output
elements.speakButton.addEventListener('click', toggleVoiceInput);
elements.replayButton.addEventListener('click', replayLastResponse);

function toggleVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = elements.nativeLanguageSelect.value;
        
        elements.speakButton.classList.toggle('voice-active');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.userInput.value = transcript;
            elements.speakButton.classList.remove('voice-active');
        };
        
        recognition.start();
    }
}

function replayLastResponse() {
    if (state.lastResponse) {
        speakText(state.lastResponse, elements.targetLanguageSelect.value);
    }
}

// API Communication
async function getAIResponse(message) {
    try {
        const response = await axios.post('/api/chat', {
            nativeLanguage: elements.nativeLanguageSelect.value,
            targetLanguage: elements.targetLanguageSelect.value,
            difficulty: elements.difficultySelect.value,
            message: message
        });
        return response.data.message;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error. Please try again.';
    }
}

// Initialize
updateTheme();

// Add to the CSS styles for system message
const style = document.createElement('style');
style.textContent = `
    .system-message {
        background-color: #FEF3C7;
        color: #92400E;
        margin: 8px auto;
        text-align: center;
        border-radius: 8px;
        padding: 12px 16px;
        max-width: 90%;
        animation: messageAppear 0.3s ease;
    }
`;
document.head.appendChild(style); 

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US'; // Will be updated based on user's target language

// Voice Recording and Recognition
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let isRecording = false;
let transcriptText = '';
let tempMessageDiv = null;

elements.speakButton.addEventListener('click', async () => {
    if (!isRecording) {
        // Start recording and recognition
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            transcriptText = '';

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                elements.replayButton.classList.remove('hidden');
                
                // Remove temporary message and add final message
                if (tempMessageDiv) {
                    tempMessageDiv.remove();
                    tempMessageDiv = null;
                }
                
                // Send the transcribed text to the chat interface
                if (transcriptText.trim()) {
                    addMessage(transcriptText.trim(), 'user');
                    elements.userInput.value = transcriptText.trim();
                    sendMessage();
                }
            };

            mediaRecorder.start();
            recognition.start();
            isRecording = true;
            elements.speakButton.classList.add('bg-red-500', 'hover:bg-red-600');
            elements.speakButton.querySelector('i').classList.remove('fa-microphone');
            elements.speakButton.querySelector('i').classList.add('fa-stop');
            
            // Create temporary message div for real-time transcription
            tempMessageDiv = document.createElement('div');
            tempMessageDiv.className = 'message user-message opacity-50';
            tempMessageDiv.textContent = '...';
            elements.conversation.appendChild(tempMessageDiv);
            elements.conversation.scrollTop = elements.conversation.scrollHeight;
            
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Unable to access microphone. Please check your permissions.');
        }
    } else {
        // Stop recording and recognition
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        recognition.stop();
        isRecording = false;
        elements.speakButton.classList.remove('bg-red-500', 'hover:bg-red-600');
        elements.speakButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        elements.speakButton.querySelector('i').classList.remove('fa-stop');
        elements.speakButton.querySelector('i').classList.add('fa-microphone');
    }
});

// Speech Recognition Event Handlers
recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    transcriptText = transcript;
    
    // Update temporary message with current transcription
    if (tempMessageDiv) {
        tempMessageDiv.textContent = transcriptText;
        elements.conversation.scrollTop = elements.conversation.scrollHeight;
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (tempMessageDiv) {
        tempMessageDiv.remove();
        tempMessageDiv = null;
    }
};

recognition.onend = () => {
    if (isRecording) {
        recognition.start(); // Restart if we're still recording
    }
};

// Update recognition language when target language changes
elements.targetLanguageSelect.addEventListener('change', (e) => {
    recognition.lang = e.target.value;
});

elements.replayButton.addEventListener('click', () => {
    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
}); 