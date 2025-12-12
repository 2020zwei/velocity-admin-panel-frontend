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


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="/seller/add" element={<AddSeller />} />
            <Route path="/seller/upload" element={<UploadDocument />} />
            <Route path="/approvers" element={<Approvers />} />
          </Route>
        </Route>
        <Route path="*" element={<div><p>404 Not Found</p></div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
