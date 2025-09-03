# Psychological Advisor Chatbot

An AI-powered psychological advisor that provides emotional support and guidance through text and voice interactions. Built with FastAPI backend using Gemini LLM and React frontend with modern UI and voice recording capabilities.

## ✨ Features

- 🤖 **AI-Powered Support**: Uses Google's Gemini LLM for empathetic psychological guidance
- 🎤 **Voice Integration**: Speech-to-text for hands-free interaction
- 🛡️ **Safety Guardrails**: NeMo Guardrails ensures safe and appropriate responses
- 💬 **Session Memory**: Maintains conversation context throughout the session
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🐳 **Docker Ready**: Complete containerization for easy deployment
- 🔒 **Privacy Focused**: No database - conversations are session-based only

## 🏗️ Architecture

```
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── utils/          # LLM handler, session manager, guardrails
│   │   └── app.py          # Main FastAPI application
│   └── Dockerfile.api      # Backend container
├── frontend/advisor-frontend/  # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Voice recording hook
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
   git clone <repository-url>
   cd chatbot_advisor
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with your Gemini API key
   echo "API_KEY=your_gemini_api_key_here" > .env
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

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
   export API_KEY=your_gemini_api_key_here
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

## 🎯 Usage

### Text Chat
1. Type your message in the text input area
2. Press Enter or click the send button
3. The AI advisor will respond with empathetic guidance

### Voice Chat
1. Click the microphone button to start recording
2. Speak your message clearly
3. The system will automatically convert speech to text
4. Review the text and send your message

### Safety Features
- The system includes built-in safety guardrails
- For crisis situations, it directs users to emergency services
- All responses are filtered to ensure appropriate psychological support

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Gemini API Key
API_KEY=your_gemini_api_key_here

# Optional: Override default API URL for frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Backend Configuration

The backend uses the following key components:

- **LLM Handler**: `src/utils/llm_handler.py` - Manages Gemini LLM integration
- **Session Manager**: `src/utils/session_manager.py` - Handles conversation memory
- **Guardrails**: `src/utils/guardrails_config.py` - Safety filters and constraints
- **API Routes**: `src/api/chat.py` - Chat endpoints and request handling

### Frontend Configuration

- **API Service**: `src/services/api.js` - Backend communication
- **Voice Hook**: `src/hooks/useVoiceRecording.js` - Speech recognition
- **Components**: Modern React components with Tailwind CSS styling

## 🛡️ Safety & Privacy

- **No Data Persistence**: Conversations are not stored in any database
- **Session-Based Memory**: Context is maintained only during active sessions
- **Safety Guardrails**: AI responses are filtered for harmful content
- **Crisis Support**: Automatic redirection to emergency services when needed
- **Privacy First**: No user data collection or tracking

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
- Ensure microphone permissions are granted
- Use HTTPS in production (required for Web Speech API)
- Check browser compatibility (Chrome/Edge recommended)

**API key issues:**
- Verify your Gemini API key is valid
- Ensure the .env file is properly formatted
- Check environment variable is loaded: `echo $API_KEY`

### Browser Compatibility

- **Voice Features**: Chrome, Edge (WebKit-based browsers)
- **General Chat**: All modern browsers
- **HTTPS Required**: For voice features in production

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

This application is a demonstration/proof-of-concept only. It is not intended to replace professional psychological treatment or therapy. For mental health crises, please contact:

- **Emergency Services**: 911 (US)
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988

## 📄 License

This project is for demonstration purposes. Please ensure compliance with relevant regulations when deploying AI-powered health-related applications.

---

**Built with**: FastAPI, React, Gemini LLM, NeMo Guardrails, LangChain, Tailwind CSS, Docker