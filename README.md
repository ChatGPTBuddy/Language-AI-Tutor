# Language AI Tutor

An interactive language learning application powered by OpenAI's GPT-3.5 Turbo model. This application provides personalized language tutoring experiences by adapting to users' native language, target language, and proficiency level.

## Features

- **Personalized Learning Experience**
  - Support for multiple native languages
  - Customizable target language selection
  - Adjustable difficulty levels (beginner, intermediate, advanced)
  - AI-powered conversational practice
  - Voice input/output capabilities
  - Progress tracking and session history

- **Intelligent Tutoring**
  - Context-aware responses
  - Level-appropriate language usage
  - Real-time feedback and corrections
  - Natural conversation flow
  - Pronunciation guides with audio samples
  - Vocabulary tracking and saved phrases

- **Modern UI/UX**
  - Clean, intuitive interface
  - Dark/Light mode toggle
  - Real-time typing indicators
  - Message timestamps
  - Animated transitions and interactions
  - Language icons and visual aids
  - Chat bubble interface
  - Copy/save conversation functionality
  - Session progress indicators

## Technology Stack

- **Frontend**
  - HTML5
  - JavaScript (ES6+)
  - CSS3
  - Web Speech API
  - LocalStorage for session management

- **Backend**
  - Node.js
  - Express.js
  - OpenAI API Integration
  - WebSocket for real-time communication

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key
- Modern web browser with Web Speech API support

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd language-ai-tutor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the server:
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
language-ai-tutor/
├── language-tutor/      # Frontend files
│   ├── index.html      # Main HTML file
│   ├── app.js          # Frontend JavaScript
│   ├── styles/         # CSS styles
│   │   ├── main.css    # Main styles
│   │   └── themes.css  # Theme configurations
│   └── assets/         # Images and icons
├── server.js           # Express server and API endpoints
├── package.json        # Project dependencies
└── .env               # Environment variables
```

## Usage

1. Open the application in your browser
2. Select your native language
3. Choose your target language
4. Set your proficiency level
5. Start conversing with the AI tutor
6. Use voice input/output if desired
7. Save important phrases and track progress
8. Review conversation history

## API Endpoints

- `GET /` - Serves the main application
- `POST /api/chat` - Handles chat interactions with the AI tutor
- `POST /api/speech` - Handles voice input/output
- `GET /api/history` - Retrieves conversation history

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Planned Improvements

- Mobile responsive design
- Multiple theme options
- Offline mode support
- Integration with language learning resources
- Gamification elements
- Progress statistics and analytics
- Social sharing features
- Export conversations to PDF
- Custom vocabulary lists
- Flashcard system

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-3.5 Turbo API
- Express.js community for the robust server framework
- Contributors and maintainers of this project
