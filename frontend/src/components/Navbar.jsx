import { Link } from "react-router-dom";

export default function Navbar() {

  return (

    <nav className="w-full backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}

        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

          CricketIQ

        </h1>

        {/* LINKS */}

        <div className="flex items-center gap-6 text-lg">

          <Link
            to="/"
            className="hover:text-cyan-400 transition"
          >
            Home
          </Link>

          <Link
            to="/live"
            className="hover:text-cyan-400 transition"
          >
            Live Match AI
          </Link>

        </div>

      </div>

    </nav>
  );
}