
# FoodRescue Lite

A lightweight full-stack platform to connect restaurants with shelters and rescue surplus food.  
Built with **Next.js 15**, **MongoDB**, **Tailwind CSS v4**, **Nodemailer**, and **Pusher**.

---

## Features

- Authentication — secure login/register with JWT & bcrypt  
- Restaurants — post surplus food with pickup details  
- Shelters — browse available posts and claim food  
- Email notifications — restaurants get notified when a claim is made  
- Real-time in-app notifications powered by Pusher  
- Impact metrics — track total food rescued and meals served  
- Modern UI — TailwindCSS v4 + ShadCN + Radix Primitives  

---

## Setup & Installation

### 1. Clone repository
```bash
git clone https://github.com/your-username/foodrescue-lite.git
cd foodrescue-lite
````

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env.local` file in the project root and add:

```env
# Database
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_key

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

# Pusher (Realtime)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Client-side
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Tech Stack

* Frontend: Next.js 15, React 18, TailwindCSS v4, Radix UI
* Backend: Next.js API routes, Node.js, TypeScript
* Database: MongoDB + Mongoose
* Authentication: JWT + bcrypt
* Notifications: Nodemailer (email) + Pusher (realtime)
* Validation: Zod

---

## License

MIT License © 2025 — FoodRescue Lite

```

Do you want me to also create a **GitHub shields-style badges section** (build status, license, tech stack badges) at the top so the README looks more professional?
```



