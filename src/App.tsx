import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SellerDashboard from "./pages/SellerDashboard";


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SellerDashboard />} />
        <Route path="*" element={<div><p>404 Not Found</p></div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
