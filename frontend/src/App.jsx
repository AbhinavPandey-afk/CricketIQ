import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/home";

import LiveMatch from "./pages/LiveMatch";

export default function App() {

  return (

    <BrowserRouter>

      <div className="min-h-screen bg-slate-950 text-white">

        <Navbar />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/live"
            element={<LiveMatch />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}