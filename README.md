# Psychological Advisor Chatbot MVP

An AI-powered psychological advisor that provides empathetic support and practical wellness guidance through text and voice interactions. Built with FastAPI backend using Google's Gemini LLM and React frontend with voice recording capabilities.

## ✨ Features

- 🤖 **AI-Powered Support**: Uses Google's Gemini LLM for empathetic psychological guidance with actionable wellness recommendations
- 🎤 **Voice Chat**: Full voice interaction with speech-to-text input and text-to-speech responses
- 🛡️ **Enhanced Safety**: Built-in safety filtering for crisis intervention and appropriate responses
- 💬 **Session Memory**: Maintains conversation context throughout the session
- 🎨 **Modern UI**: Clean, responsive interface with Tailwind CSS
- 🐳 **Docker Ready**: Complete containerization for easy deployment
- 🔒 **Privacy Focused**: No database - conversations are session-based only

## 🏗️ Architecture

```
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── utils/          # LLM handler, session manager, safety filtering
│   │   └── app.py          # Main FastAPI application
│   └── Dockerfile.api      # Backend container
├── frontend/advisor-frontend/  # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Voice recording and TTS hooks
│   │   ├── services/       # API communication
│   │   └── App.js          # Main React app
│   └── Dockerfile.frontend # Frontend container
└── docker-compose.yml      # Multi-container orchestration
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Python 3.12+** and **Node.js 18+** for local development
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <https://github.com/MichalKokolus/chatbot_advisor.git>
   cd chatbot_advisor
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in the backend directory with your Gemini API key
   echo "API_KEY=your_gemini_api_key_here" > .env
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

**Note:** Voice features are tested in Chrome browser.

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies with Poetry**
   ```bash
   poetry install
   ```

3. **Set environment variable**
   ```bash
   # Create .env file in backend directory
   echo "API_KEY=your_gemini_api_key_here" > .env
   ```

4. **Run the backend**
   ```bash
   poetry run uvicorn src.app:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/advisor-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend will be proxied automatically

**Note:** For best experience with voice features, use Chrome or Edge browsers.

## 🎯 Usage

### Text Chat
1. Type your message in the text input area
2. Press Enter or click the send button
3. The AI advisor will respond with empathetic guidance and practical recommendations

### Voice Chat
1. Click the microphone button to start recording
2. Speak your message clearly
3. Click the microphone again to stop recording
4. The message will be automatically sent and the response will be spoken aloud
5. Use the speaker toggle in the header to enable/disable voice responses

### Safety Features
- Built-in safety filtering for crisis intervention
- Automatic redirection to emergency services for serious concerns
- Enhanced wellness recommendations including mindfulness, exercise, and self-care tips
- All responses focused on psychological support and emotional wellbeing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Required: Gemini API Key
API_KEY=your_gemini_api_key_here

# Optional: Override default API URL for frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Backend Configuration

The backend uses the following key components:

- **LLM Handler**: `src/utils/llm_handler.py` - Manages Gemini LLM integration with enhanced safety filtering
- **Session Manager**: `src/utils/session_manager.py` - Handles conversation memory
- **Safety Filtering**: Built-in crisis intervention and medical advice prevention
- **API Routes**: `src/api/chat.py` - Chat endpoints and request handling

### Frontend Configuration

- **API Service**: `src/services/api.js` - Backend communication
- **Voice Hooks**: `src/hooks/useVoiceRecording.js` and `src/hooks/useTextToSpeech.js` - Full voice interaction
- **Components**: Modern React components with Tailwind CSS styling

## 🛡️ Safety & Privacy

- **No Data Persistence**: Conversations are not stored in any database
- **Session-Based Memory**: Context is maintained only during active sessions
- **Enhanced Safety Filtering**: AI responses are filtered for harmful content with crisis intervention
- **Crisis Support**: Automatic redirection to emergency services when needed
- **Privacy First**: No user data collection or tracking
- **Wellness Focus**: Responses include actionable recommendations for mental health and wellbeing

## 🐛 Troubleshooting

### Common Issues

**Backend not connecting:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check logs
docker-compose logs backend
```

**Voice recording not working:**
- Ensure microphone permissions are granted in browser
- **Use Chrome or Edge browsers** (voice features are optimized for these)
- Check microphone volume in Windows settings if levels are low
- Use HTTPS in production (required for Web Speech API)

**API key issues:**
- Verify your Gemini API key is valid
- Ensure the .env file is in the correct location (backend)
- Check environment variable is loaded properly

### Browser Compatibility

- **Voice Features**: **Chrome recommended**
- **General Chat**: All modern browsers
- **HTTPS Required**: For voice features in production deployment

## 📝 API Documentation

When running, visit http://localhost:8000/docs for interactive API documentation.

### Main Endpoints

- `POST /api/v1/chat/message` - Send message to advisor
- `GET /api/v1/chat/session/{id}/history` - Get conversation history
- `POST /api/v1/chat/session/new` - Create new session
- `DELETE /api/v1/chat/session/{id}` - End session

## 🤝 Contributing

This is a demonstration project showcasing AI integration, modern web development, and safety considerations in psychological AI assistants.

## ⚠️ Disclaimer

This application is a **demonstration/proof-of-concept MVP only**. It is not intended to replace professional psychological treatment or therapy. For mental health crises, please contact:

---

**Built with**: FastAPI, React, Google Gemini LLM, Tailwind CSS, Docker, Web Speech API