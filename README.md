<img width="1920" height="975" alt="image" src="https://github.com/user-attachments/assets/947c1f8c-7452-4fd6-93f7-08678dbc5382" />
# 🍽️ SwiftServe SaaS - Restaurant POS & QR Menu System

SwiftServe is a full-stack, real-time Restaurant Management System designed to bridge the gap between customer ordering, kitchen operations, and front-desk billing. It eliminates friction in the dining experience by digitizing the entire restaurant workflow.

## 🚀 Key Features

* **📱 Interactive Customer QR Menu**
  * Customers can browse digital menus, add items to a cart, and place orders directly from their mobile phones without waiting for a waiter.
* **👨‍🍳 Live Kitchen Display System (KDS)**
  * Real-time ticket management for kitchen staff. Orders instantly appear on the kitchen monitor and flow through operational states: *Pending → Preparing → Ready*.
* **💳 Seamless Frontdesk Settlement**
  * Customers can request the bill from their phone. The system instantly alerts the front desk for payment collection and clears the table queue.
* **📊 Revenue & History Tracking**
  * Completed orders automatically sync to a secure owner dashboard, providing accurate, real-time financial history and daily metrics.

## 💻 Tech Stack

**Frontend (Client)**
* **React.js** - UI Component Architecture
* **Tailwind CSS** - Responsive, modern "Soft UI" styling
* **Lucide React** - Vector iconography

**Backend (Server)**
* **Node.js & Express.js** - RESTful API routing and server logic
* **MongoDB & Mongoose** - NoSQL database and schema modeling
* **Axios** - Promise-based HTTP client for data fetching
* **CORS & Environment Variables** - Secure origin handling and configuration

## 🔄 System Architecture & Workflow

The application operates on a strict, automated state-lifecycle engine to ensure no orders are lost:

1. **Order Generation:** Customer submits an order via the mobile-responsive React UI.
2. **Kitchen Processing:** The backend emits the order to the Kitchen dashboard. Staff accepts and prepares the food.
3. **Fulfillment:** Kitchen staff marks the order as "Ready".
4. **Settlement:** The customer receives their food and taps "Request Bill", finalizing the transaction.
5. **Data Aggregation:** The backend records the fulfilled order and updates the restaurant's total revenue metrics.

---
*Designed and Developed for Modern Cafe Workflows.*
