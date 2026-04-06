import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SellerDashboard from "./pages/SellerDashboard";
import Layout from "./components/Layout";
import AddSeller from "./pages/AddSeller";
import UploadDocument from "./pages/UploadDocument";
import Approvers from "./pages/Approvers";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import IndustrySetupPage from "./pages/IndustrySetupPage";
import ScrollToTop from "./components/ScrollToTop";
import SetPassword from "./pages/SetPassword";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";


const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
              <Route path="/set-password" element={<SetPassword />} />
          </Route>
          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<SellerDashboard />} />
              <Route path="/seller/add" element={<AddSeller />} />
              <Route path="/seller/upload" element={<UploadDocument />} />
              <Route path="/industory-setup" element={<IndustrySetupPage />} />
              <Route path="/approvers" element={<Approvers />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<div><p>404 Not Found</p></div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
