# IIT Connect

Private networking portal for Indian Institutes of Technology (IITs). Registration/login allowed **only** via whitelisted IIT email domains.

## Tech
- Frontend: React (Vite), TailwindCSS, Framer Motion, React Router, Axios, Socket.IO client, React Hot Toast
- Backend: Node.js, Express, MongoDB/Mongoose, JWT (HttpOnly cookie), bcrypt, multer + Cloudinary, Socket.IO

## Monorepo
- `backend/` - API + realtime
- `frontend/` - web client

## Quick start (local)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm i
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm i
npm run dev
```

Visit: http://localhost:5173

---

## Deployment

### MongoDB Atlas
- Create a cluster
- Create DB user + IP allowlist
- Copy connection string to `MONGO_URI`

### Cloudinary
- Create Cloudinary account
- Get Cloud name, API key, API secret
- Put into backend env

### Backend (Render/Railway)
- Root directory: `backend`
- Build: `npm i`
- Start: `npm start`
- Set env vars from `.env.example`

### Frontend (Vercel/Netlify)
- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://<your-backend>`

> Ensure backend CORS allows the deployed frontend and sets cookies with `SameSite=None; Secure` in production.
