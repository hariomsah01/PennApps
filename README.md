# 🌱 Type-less

> Write smarter prompts. Save tokens. Save energy. Save the planet.

---

## 🚀 About the Project

Have you ever thought about the **hidden environmental cost** of AI?  
Every query consumes **energy**, and scaled across millions of users, this translates into significant **CO₂ emissions**.  

We built **Type-less** at [PennApps](https://pennapps.com) to solve this challenge.  
Our tool helps people **communicate more efficiently** with AI by compressing prompts into their **essential form** — without losing meaning.  

With every optimized prompt:
- ⚡ Fewer tokens are processed  
- 🌍 Less compute → lower CO₂ footprint  
- 📊 Users track their savings in real time  

---

## ✨ Features

- 🔹 **Prompt Optimizer** – NLP/ML algorithms shorten redundant queries  
- 🔹 **Token & CO₂ Savings Tracker** – daily and monthly impact dashboard  
- 🔹 **MongoDB Storage** – saves usage history for cumulative stats  
- 🔹 **Netlify Hosting** – fast, serverless frontend deployment  
- 🔹 **Clean UI** – human-friendly design for easy adoption  

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Flask (Python)  
- **Database:** MongoDB  
- **Hosting:** Netlify (frontend), Flask backend on local/remote server  
- **Other Tools:** Axios, REST APIs  

---

## 📂 Project Structure

```
PennApps/
│── backend/           # Flask API (compression + savings logic)
│── frontend/          # React + Tailwind UI
│── database/          # MongoDB integration
│── utils/             # Helper scripts (CO₂ + token tracking)
│── README.md
```

---

## ⚡ Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/hariomsah01/PennApps.git
cd PennApps
```

### 2️⃣ Backend Setup (Flask API)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3️⃣ Frontend Setup (React + Netlify)
```bash
cd frontend
npm install
npm start
```

👉 To deploy frontend:
- Push your `frontend/` folder to a branch  
- Connect the repo to [Netlify](https://www.netlify.com/)  
- Netlify auto-builds & deploys your React app  

### 4️⃣ Environment Variables
Create a `.env` file in `backend/`:
```
MONGO_URI=your_mongodb_connection_string
```

---

## 📊 How It Works

1. User enters a long prompt in the React UI  
2. Text is sent to the Flask backend  
3. NLP/ML logic compresses the prompt (removes redundant words, simplifies)  
4. MongoDB logs:  
   - Tokens before vs. after  
   - Estimated CO₂ savings  
   - Cumulative daily/monthly impact  
5. Netlify-hosted frontend displays results + history  

---

## 🌍 Why It Matters

- AI queries consume **energy-intensive computation**  
- By saving tokens, we reduce **energy load on servers**  
- Even small savings per prompt → **large impact at scale**  

📌 Studies show:
- Training a single large AI model can emit **hundreds of tons of CO₂** (Strubell et al., 2019).  
- Even inference (day-to-day queries) adds up across millions of users.  

---

## 🎯 Future Scope

- Chrome extension for live prompt optimization  
- Gamified **leaderboards** (who saves most CO₂)  
- Visual dashboards with community impact stats  
- Advanced transformer-based compression  

---

## 🤝 Contributing

We welcome contributions:

1. Fork the repo  
2. Create a branch (`git checkout -b feature-name`)  
3. Commit changes (`git commit -m 'Add feature'`)  
4. Push (`git push origin feature-name`)  
5. Open a PR 🚀  

---

## 🏆 Hackathon

Built at **PennApps XXV (2024)**  
- [Devpost Link](https://devpost.com/software/type-less)  
- [GitHub Repo](https://github.com/hariomsah01/PennApps)  

---

## 👨‍💻 Authors

- Hari Om Sah – [GitHub](https://github.com/hariomsah01) | [LinkedIn](https://www.linkedin.com/in/hari-om-sah/)
- Bhavika Kothari – [GitHub](https://github.com/bhavikak20005) | [LinkedIn](https://www.linkedin.com/in/bhavikakothari/)  
- Sujal Shah – [GitHub](https://github.com/sujalshah0444) | [LinkedIn](https://www.linkedin.com/in/shahsujal/)
- Sourish Mudumby Venugopal – [GitHub](https://github.com/Sourish-07) | [LinkedIn](https://www.linkedin.com/in/sourish-mudumby-venugopal-251323358/)  
- Team Type-less 2025  

---

## 📜 License

Licensed under the University of Pennsylvania License.  
See `LICENSE` for details.  
