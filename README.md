# Tomato 🍅

A modern, full-stack food delivery application and 4-sided ecosystem (Customer, Restaurant Partner, Delivery Rider, and Operations Admin) inspired by Zomato and Swiggy.

---

## ✨ Features

### 1. 🍽️ Customer Experience
- **Advanced Multi-Criteria Filtering & Sorting**: Filter by multiple cuisines, dietary preferences (Pure Veg, Vegan, Eggetarian, Jain, Keto, etc.), price brackets, delivery time, ratings, and discounts.
- **Craving Roulette 🎰**: An interactive 3D gamified food wheel with real dish photography that helps undecided users pick a meal and win exclusive discount coupons.
- **Dynamic Restaurant Menus**: Detailed item views, dish customizer modal with add-ons, spice levels, and dietary indicators.
- **Checkout & Live Order Tracking**: Multi-step checkout, coupon discounts, wallet integration, and live rider delivery tracking simulator.

### 2. 👨‍🍳 Restaurant Partner Portal
- Live kitchen order tickets (Accept, Preparing, Ready for Pickup).
- Menu & Dish Management (toggle availability, add dishes, set prices).
- Business analytics, sales insights, and outlet profile settings.

### 3. 🛵 Delivery Rider App
- Real-time incoming delivery orders and dispatch acceptance.
- GPS route navigation simulator with customer and restaurant pins.
- Digital proof-of-delivery (photo & OTP verification).
- Rider KYC onboarding, trip history, and daily earnings dashboard.

### 4. 📊 Admin Operations HQ
- System-wide live operations monitoring and order heatmaps.
- Coupon and promo campaign creator.
- Restaurant partner approval and rider fleet management.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Modern CSS variables, glassmorphism, responsive mobile & desktop frame
- **Icons & Effects**: Lucide React, Canvas Confetti
- **State Management**: React Context (`TomatttoContext`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/RudranilMondal/Tomato.git

# Navigate into the project directory
cd Tomato

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

---

## 📄 License
MIT
