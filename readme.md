🚀 Enginx

Real-Time Multiplayer Engineering Quiz Platform

Enginx is a fast-paced, real-time multiplayer web application that transforms engineering concepts into competitive 60-second battles. Inspired by platforms like Matiks, Enginx combines coding, computer science, and technical MCQs into an interactive game experience.

🎯 Features
⚡ Real-Time Multiplayer – Compete with friends using WebSockets
🧠 Engineering-Focused Questions – Coding, DSA, OS, DBMS, Electronics
🎮 Multiple Game Modes
Output Predictor
Debug Challenge
Rapid MCQ
⏱️ Timed Rounds – Quick 10–15 second challenges
🏆 Live Leaderboard – Instant score updates
🔐 Authentication – Powered by Convex
🎤 (Optional) Voice-based questions using AI
🏗️ Tech Stack
Frontend
Next.js
Tailwind CSS
Socket.IO Client
Backend
Bun
Node.js (Express)
Socket.IO
Database & Auth
Convex
📁 Project Structure
Backend
backend/
├── src/
│   ├── index.ts
│   ├── server.ts
│   ├── socket/
│   │   └── socket.ts
│   ├── game/
│   │   ├── gameManager.ts
│   │   ├── questionBank.ts
│   │   └── scoring.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── types/

Frontend
frontend/
├── app/
├── components/
├── lib/
│   ├── socket.ts
│   ├── convex.ts
│   └── auth.ts
├── providers/

⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/your-username/enginx.git
cd enginx

2. Backend Setup
cd backend
bun init
bun add express socket.io cors dotenv
bun add -d typescript @types/node @types/express


Run backend:

bun run index.ts

3. Frontend Setup
cd frontend
npm install
npm install socket.io-client


Run frontend:

npm run dev

🔐 Authentication Flow
User logs in via Convex (frontend)
Token/user ID is generated
Token is sent via Socket.IO connection
Backend verifies and attaches user to session
🔌 Multiplayer Flow
User connects via Socket.IO
Joins a game room
Game starts when enough players join
Questions are broadcast
Players submit answers
Scores update in real-time
Winner is घोषित at the end
🚀 Deployment
Frontend → Vercel
Backend → Render / Railway
Convex → Auth + Database
🧠 Future Improvements
🎯 Matchmaking system
🧩 More game modes
📊 Performance analytics
🎤 Full voice-based gameplay
🏆 Global leaderboard
🏆 Inspiration

Enginx is inspired by rapid-learning platforms like Matiks, reimagined for engineering students to make learning competitive and fun.

👨‍💻 Team

Built during a 24-hour hackathon to make technical learning engaging, fast, and competitive