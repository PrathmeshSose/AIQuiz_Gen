
# 📚 Quizify – AI Powered Interactive Quiz Generator

**Quizify** is an AI-powered web app that automatically creates quizzes based on content input by users. It uses Genkit for summarization and question generation and is designed to help educators, students, and trainers efficiently generate assessments.

🔗 **Live App**: *https://quiz-gen-oeij.onrender.com/*  
📦 **GitHub Repo**: *https://github.com/PrathmeshSose/AIQuiz_Gen/*
**Report**: [Report_Quiz.pdf](https://github.com/user-attachments/files/21220765/Report_Quiz.pdf)


---

## ✨ Features

- 📄 Input from raw text, PDF, TXT, or URL
- 🤖 Genkit-powered summarization
- 🧠 AI-generated MCQ / True/False questions
- 🎛 Quiz customization: difficulty, number, type
- 💯 Real-time quiz scoring and feedback
- 📥 Download/print quizzes and results
- 🌐 Built with: Next.js, React, Tailwind CSS, ShadCN UI

---

## 🔧 Tech Stack

| Component       | Technology Used          |
|----------------|---------------------------|
| Frontend       | Next.js, React, Tailwind CSS, ShadCN UI |
| Backend        | Node.js (via Next.js API Routes) |
| AI Integration | Genkit (Google Gen AI SDK) |
| File Handling  | pdf-parse, axios          |
| Hosting        | Firebase / Vercel         |

---

## ⚙️ System Architecture

### 1. Input Layer
- Accepts raw text, PDF, TXT, or URL input
- Parses and extracts readable content

### 2. AI Layer
- Summarizes input using Genkit
- Generates quiz questions based on summarized content

### 3. UI Layer
- Interactive quiz display and scoring
- Real-time feedback with explanation

---

## 🛠 How to Run Locally

```bash
git clone https://github.com/your-username/quizify
cd quizify

npm install
npm run dev
```

Make sure you configure `.env` with your Genkit credentials and hosting settings.

---

## 📋 Sample Workflow

1. Upload or paste content
2. Click “Summarize”
3. Set quiz configuration (difficulty, count, type)
4. AI generates questions
5. Take quiz, see feedback
6. Print or download results

---

## 📈 Future Enhancements

- 🌍 Multi-language support
- 🗣 Voice input integration
- 🧠 Adaptive difficulty
- 🎮 Gamification (points, badges)
- 📱 Mobile App version
- 📊 Analytics dashboard for users
- 📡 LMS integration

---

## 👨‍💻 Authors

- Prathmesh G. Sose – [2267571242114]
- Om A. Shedage – [2267571242112]
- Rohit R. Gaikwad – [2267571242113]
- Sujit B. Chavan – [2267571242115]
- Jay S. Ithape – [2267571242120]

YSPM’s YTC, Satara

---

## 📚 References

1. [Genkit by Google](https://github.com/google/genkit)
2. [Next.js Docs](https://nextjs.org/docs)
3. [Tailwind CSS](https://tailwindcss.com/)
4. [Research Paper - AI Quiz Generation](https://arxiv.org/abs/2005.14165)
5. [PDF Parsing in Node](https://www.npmjs.com/package/pdf-parse)

---

## ✅ Conclusion

Quizify is a fully functional prototype demonstrating the integration of Generative AI in EdTech. It turns educational material into interactive, personalized assessments in seconds, making learning more efficient and engaging.

