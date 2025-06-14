# 🛠️ Handman Pro

**Handman Pro** is a full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) designed to help handyman service providers manage clients, proposals, invoices, appointments, and team collaboration all in one platform.

## 📦 Tech Stack

- **Frontend:** React + Vite + Redux + Material-UI
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Authentication:** Firebase + Google OAuth
- **Deployment:** Netlify (Frontend), Heroku (Backend)
- **Integrations:** Google Contacts, Gmail API, Google Calendar API
- **PDF Generation:** pdf-lib
- **Storage:** Google Cloud Storage (for signed proposals/invoices)

---

## 🚀 Features

- 🔐 Google OAuth Authentication
- 📇 Client & Contact Management
- 📄 Create & Email Proposals/Invoices
- ✍️ Electronic Signature Support
- 📆 Sync with Google Calendar
- 📤 Attach PDFs to Gmail and send
- 📊 Dashboard & Financial Reports
- 🔔 Real-time Notifications
- ☁️ Google Cloud Storage Integration

---

## 🧱 Project Structure

```
handmanpro-frontend/
│
├── src/
│   ├── components/        # Shared UI components
│   ├── pages/             # Route-level pages (Dashboard, Clients, Invoices)
│   ├── redux/             # Redux slices and store config
│   ├── api/               # Axios API wrappers
│   ├── utils/             # Helper utilities
│   └── layouts/           # App and auth layouts
├── public/
├── .env
└── README.md
```

---

## ⚙️ Setup Instructions

1. **Clone the repo**

```bash
git clone https://github.com/your-username/handmanpro-frontend.git
cd handmanpro-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. **Run the app locally**

```bash
npm run dev
```

---

## 🧪 Testing

_TBD — Testing strategy will be added in future versions._

---

## 📌 Roadmap

- [x] Core MVP with client/proposal/invoice modules
- [x] Google OAuth & Calendar Sync
- [x] PDF Generation & Gmail Send
- [ ] Team Collaboration Tools
- [ ] Mobile Responsiveness Optimization
- [ ] Stripe Integration for Online Payments

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Josh Leduc – [@joshleducc](https://github.com/joshleducc)

---

## 🙌 Acknowledgements

- [Material UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)
- [pdf-lib](https://pdf-lib.js.org/)
- [React Redux](https://react-redux.js.org/)
