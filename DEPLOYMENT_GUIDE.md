# 🚀 Deployment Guide for Type-less Prompt Optimizer

## 📋 Prerequisites
- MongoDB Atlas account (free tier available)
- Netlify account (free tier available)
- Heroku account (free tier available, or Railway/Render)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free
3. Create a new project

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region
4. Name your cluster (e.g., "prompt-optimizer-cluster")

### 1.3 Set up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Set privileges to "Read and write to any database"

### 1.4 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For production, add `0.0.0.0/0` (allow all IPs)
4. For development, add your current IP

### 1.5 Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `prompt-optimizer`

Example: `mongodb+srv://your-username:your-password@your-cluster.mongodb.net/prompt-optimizer?retryWrites=true&w=majority`

## 🌐 Step 2: Deploy Backend (Heroku)

### 2.1 Prepare Backend for Deployment
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name-backend
```

### 2.2 Configure Environment Variables
```bash
# Set MongoDB URI
heroku config:set MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/prompt-optimizer?retryWrites=true&w=majority"

# Set JWT Secret (generate a secure random string)
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-here"

# Set other environment variables
heroku config:set NODE_ENV="production"
heroku config:set PORT="5001"
```

### 2.3 Create Heroku Configuration Files
Create `Procfile` in the root directory:
```
web: cd backend && npm start
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "heroku-postbuild": "npm install"
  }
}
```

### 2.4 Deploy Backend
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Add Heroku remote
heroku git:remote -a your-app-name-backend

# Deploy
git push heroku main
```

## 🎨 Step 3: Deploy Frontend (Netlify)

### 3.1 Build Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 3.2 Configure Environment Variables
Create a `.env.production` file:
```
REACT_APP_API_URL=https://your-app-name-backend.herokuapp.com/api
```

### 3.3 Deploy to Netlify

#### Option A: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=build
```

#### Option B: Netlify Web Interface
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Add environment variables in Site settings → Environment variables:
   - `REACT_APP_API_URL`: `https://your-app-name-backend.herokuapp.com/api`

## 🔧 Step 4: Configure CORS

Update `backend/server.js` CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app-name.netlify.app'
  ],
  credentials: true
}));
```

## ✅ Step 5: Test Deployment

1. **Test Backend**: Visit `https://your-app-name-backend.herokuapp.com/api/health`
2. **Test Frontend**: Visit your Netlify URL
3. **Test Database**: Try creating an account and optimizing a prompt
4. **Check Logs**: 
   - Heroku: `heroku logs --tail`
   - Netlify: Site settings → Functions → View function logs

## 🔒 Security Notes

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **MongoDB**: Use a strong password for your database user
3. **CORS**: Only allow your frontend domain in CORS
4. **Environment Variables**: Never commit `.env` files to git

## 📊 Monitoring

- **Heroku**: Use Heroku metrics and logs
- **Netlify**: Use Netlify analytics
- **MongoDB**: Use Atlas monitoring dashboard

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS configuration in backend
2. **Database Connection**: Verify MongoDB URI and network access
3. **Build Failures**: Check build logs in Netlify
4. **Environment Variables**: Ensure all required env vars are set

### Useful Commands:
```bash
# Check Heroku logs
heroku logs --tail -a your-app-name-backend

# Check Heroku config
heroku config -a your-app-name-backend

# Restart Heroku app
heroku restart -a your-app-name-backend
```
