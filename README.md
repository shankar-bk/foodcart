# FoodCart - AI Powered Food Delivery

A production-ready food delivery web application containing an AI-powered conversational ordering system. Built using **Next.js 14 (App Router)**, **Tailwind CSS**, **MongoDB + Mongoose**, **NextAuth**, and local **Ollama AI (Qwen2.5)**.

## Core Features
1. **Customer View**: AI Smart Ordering, Restaurant listings, Cart, Razorpay checkout, Live Tracking UI. Premium Mobile-First Design.
2. **Restaurant View**: Dashboard, Menu CRUD operations, Order Accept/Reject workflow.
3. **Delivery View**: Agent dashboard to find local orders, accept deliveries, and update delivery status.
4. **Admin View**: Unified platform analytics, and user/role moderation.

## Tech Stack
- **Framework**: Next.js 14 
- **Database**: MongoDB
- **Auth**: NextAuth.js (Credentials/JWT)
- **AI Integration**: Local Ollama instance (`qwen2.5:0.5b`)
- **Payments**: Razorpay
- **Styling**: Tailwind CSS, Lucide React Icons

## Getting Started

### 1. Requirements
- Node.js > 18.x
- MongoDB Instance / Atlas URI

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=a_very_secure_random_string
NEXTAUTH_URL=http://localhost:3000

# Optional depending on testing needs
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

*(Note: The app has fallbacks so you can test basic UI flows even without valid payment keys).*

### 3. Start Local AI Engine (Crucial for Chat)
Ensure you have Ollama installed and the model downloaded. Run this in a separate terminal:
```bash
ollama run qwen2.5:0.5b
```

### 4. Installation
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Production Build
```bash
npm run build
npm start
```

## How to Test Roles
When registering a new account at `/register`, you can select your role:
- Customer
- Restaurant
- Delivery Agent
- Admin (For testing, you might need to register as a customer and then manually switch your role to 'admin' in MongoDB compass, or register via the UI if the dropdown is enabled for it).

*Enjoy building the future of conversational commerce!*
