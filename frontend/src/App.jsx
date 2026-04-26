import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AuctionsPage from "./pages/AuctionsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import SearchPage from "./pages/SearchPage";
import ReturnsPage from "./pages/ReturnsPage";
import PickupPage from "./pages/PickupPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/auctions"    element={<AuctionsPage />} />
            <Route path="/auctions/:id" element={<ItemDetailPage />} />
            <Route path="/search"      element={<SearchPage />} />
            <Route path="/returns"     element={<ReturnsPage />} />
            <Route path="/pickup"      element={<PickupPage />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/about"       element={<AboutPage />} />
            <Route path="*"            element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
