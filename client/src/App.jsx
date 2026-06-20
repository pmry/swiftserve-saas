import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 1. CORE MARKETING & AUTHENTICATION PAGES
// ==========================================
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// ==========================================
// 2. ADMIN & OWNER WORKSPACE MANAGEMENT HUBS
// ==========================================
import UserLandingPage from './pages/UserLandingPage';
import RestaurantDetails from './pages/RestaurantDetails';
import MenuSetup from './pages/MenuSetup';
import DashboardLayout from './pages/DashboardLayout'; // <-- Main collapsible control console

// ==========================================
// 3. PUBLIC FRONTEND GUEST EXPERIENCE PAGES
// ==========================================
import CustomerWelcome from './pages/CustomerWelcome'; // <-- Scan Landing Gatekeeper Page
import CustomerMenu from './pages/CustomerMenu';       // <-- Interactive Menu & Cart View

// ==========================================
// SECURITY: SYSTEM PROTECTED ROUTE WRAPPER
// ==========================================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Force bounce unauthenticated users directly to the login gate
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ---------------------------------------- */}
        {/* SECTION A: PUBLIC MARKETING & GATEWAYS   */}
        {/* ---------------------------------------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------------------------------------- */}
        {/* SECTION B: SECURE ADMIN CORE CONTROL PANELS */}
        {/* ---------------------------------------- */}
        
        {/* The Central Space Launcher Workspace Hub */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <UserLandingPage />
            </ProtectedRoute>
          } 
        />

        {/* Step 1: Branch Metadata Registration */}
        <Route 
          path="/onboarding/restaurant" 
          element={
            <ProtectedRoute>
              <RestaurantDetails />
            </ProtectedRoute>
          } 
        />

        {/* Step 2: Bulk Sandbox Menu Inventory Builder */}
        <Route 
          path="/onboarding/menu/:restaurantId" 
          element={
            <ProtectedRoute>
              <MenuSetup />
            </ProtectedRoute>
          } 
        />

        {/* The Master Control Console Panel (Menu, Tables, Kitchen tabs) */}
        <Route 
          path="/dashboard/:restaurantId" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />

        {/* ---------------------------------------- */}
        {/* SECTION C: DYNAMIC GUEST OPERATION LINKS */}
        {/* ---------------------------------------- */}
        
        {/* The QR Target Welcome Greeting Screen (Verifies Seating Node placement) */}
        <Route path="/welcome/:restaurantId" element={<CustomerWelcome />} />
        
        {/* The Active Live Guest Ordering Catalog & Digital Shopping Basket Cart */}
        <Route path="/menu/:restaurantId" element={<CustomerMenu />} />

        {/* ---------------------------------------- */}
        {/* SECTION D: CATCH-ALL PROTECTION FALLBACK */}
        {/* ---------------------------------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;