# MongoDB Integration Setup

## 🗄️ **Database Integration Complete!**

Your prompt optimizer now has full MongoDB integration for storing user history, optimization data, and carbon footprint tracking.

## 📋 **Setup Instructions**

### **1. Install MongoDB**

**Option A: Using Homebrew (macOS)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Option B: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: Download from MongoDB Website**
- Visit: https://www.mongodb.com/try/download/community
- Download and install MongoDB Community Server

### **2. Start the Backend Server**

```bash
# Start MongoDB (if not using Docker)
brew services start mongodb/brew/mongodb-community

# Start the backend server
npm run server
```

### **3. Start the Full Application**

```bash
# Start both frontend and backend
npm run dev
```

## 🚀 **What's Been Added**

### **Database Models:**
- **User**: User accounts and statistics
- **Optimization**: Individual optimization records
- **Session**: Anonymous session tracking

### **API Endpoints:**
- `POST /api/optimization/save` - Save optimization results
- `GET /api/optimization/history/:sessionId` - Get optimization history
- `GET /api/optimization/stats/:sessionId` - Get session statistics
- `GET /api/optimization/global-stats` - Get global statistics
- `POST /api/session/create` - Create new session
- `GET /api/session/:sessionId` - Get session info

### **Frontend Features:**
- **Automatic Data Saving**: Every optimization is saved to MongoDB
- **Session Tracking**: Anonymous sessions with persistent data
- **Real-time Statistics**: Live updates of carbon savings and tokens
- **History Tracking**: View past optimizations
- **Global Impact**: See community-wide statistics

## 📊 **Data Stored**

### **For Each Optimization:**
- Original and optimized prompts
- Token counts (before/after/saved)
- Carbon footprint savings
- Quality scores
- Applied optimizations
- Timestamps

### **Session Data:**
- Total optimizations
- Total carbon saved
- Total tokens saved
- Session duration
- User agent and IP

### **User Data (Future):**
- User accounts
- Personal statistics
- Optimization history
- Carbon footprint goals

## 🔧 **Configuration**

The app uses these environment variables (in `.env`):
```
MONGODB_URI=mongodb://localhost:27017/prompt-optimizer
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🧪 **Testing the Integration**

1. **Start the application**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Optimize a prompt**: Type a prompt and click "Send"
4. **Check the Stats tab**: See your carbon savings
5. **Check browser console**: See "Optimization saved successfully" messages

## 📈 **Features Working**

✅ **Automatic Data Persistence**: Every optimization is saved
✅ **Session Management**: Anonymous sessions with persistent data
✅ **Real-time Statistics**: Live updates of your impact
✅ **Global Impact Tracking**: Community-wide statistics
✅ **History Tracking**: View past optimizations
✅ **Carbon Footprint Tracking**: Detailed environmental impact

## 🎯 **Next Steps (Optional)**

- Add user authentication
- Add optimization history viewer
- Add carbon footprint goals
- Add data export features
- Add admin dashboard

Your MongoDB integration is complete and ready to use! 🎉
