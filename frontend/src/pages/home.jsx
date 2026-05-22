import { useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import MatchupCard from "../components/MatchupCard";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function Home() {

  const [formData, setFormData] = useState({
    team1: "",
    team2: "",
    venue: "",
    toss_winner: "",
    toss_decision: "",
    season: 2023
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const teams = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Delhi Capitals",
    "Punjab Kings",
    "Rajasthan Royals",
    "Sunrisers Hyderabad"
  ];

  const venues = [
    "Wankhede Stadium",
    "Eden Gardens",
    "M Chinnaswamy Stadium",
    "MA Chidambaram Stadium"
  ];

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await API.post(
        "/predict",
        formData
      );

      setResult(response.data);

    } catch (error) {

      console.log(error);

      alert("Prediction Failed");
    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">

      {/* BACKGROUND GLOW */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      {/* MAIN CONTENT */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* HERO SECTION */}

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >

          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">

            CricketIQ

          </h1>

          <p className="mt-4 text-slate-300 text-xl">

            AI-Powered IPL Match Prediction Dashboard

          </p>

        </motion.div>

        {/* MATCHUP CARD */}

        <MatchupCard
          team1={formData.team1}
          team2={formData.team2}
        />

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT PANEL */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl"
          >

            <h2 className="text-3xl font-bold mb-8">

              Match Configuration

            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* TEAM 1 */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Team 1
                </label>

                <select
                  name="team1"
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select Team 1
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team}
                      value={team}
                    >
                      {team}
                    </option>
                  ))}

                </select>

              </div>

              {/* TEAM 2 */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Team 2
                </label>

                <select
                  name="team2"
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select Team 2
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team}
                      value={team}
                    >
                      {team}
                    </option>
                  ))}

                </select>

              </div>

              {/* VENUE */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Venue
                </label>

                <select
                  name="venue"
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select Venue
                  </option>

                  {venues.map((venue) => (
                    <option
                      key={venue}
                      value={venue}
                    >
                      {venue}
                    </option>
                  ))}

                </select>

              </div>

              {/* TOSS WINNER */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Toss Winner
                </label>

                <select
                  name="toss_winner"
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Select Toss Winner
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team}
                      value={team}
                    >
                      {team}
                    </option>
                  ))}

                </select>

              </div>

              {/* TOSS DECISION */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Toss Decision
                </label>

                <select
                  name="toss_decision"
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Toss Decision
                  </option>

                  <option value="bat">
                    Bat
                  </option>

                  <option value="field">
                    Field
                  </option>

                </select>

              </div>

              {/* SEASON */}

              <div>

                <label className="block mb-2 text-slate-300">
                  Season
                </label>

                <input
                  type="number"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* BUTTON */}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              >

                {
                  loading
                  ? "Analyzing Match..."
                  : "Predict Match"
                }

              </motion.button>

            </form>

          </motion.div>

          {/* RIGHT PANEL */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-center"
          >

            {
              !result ? (

                <div className="text-center">

                  <h2 className="text-4xl font-bold mb-4">
                    Match Intelligence
                  </h2>

                  <p className="text-slate-400 text-lg">

                    Configure the match details and let CricketIQ predict the winner using machine learning.

                  </p>

                </div>

              ) : (

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >

                  <h2 className="text-4xl font-bold mb-8">

                    Prediction Result

                  </h2>

                  <div className="text-6xl font-extrabold text-cyan-400 mb-6">

                    {result.predicted_winner}

                  </div>

                  <p className="text-slate-300 text-xl mb-6">

                    Predicted Match Winner

                  </p>

                  {/* PROBABILITY BAR */}

                  <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden mb-4">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${result.win_probability}%`
                      }}
                      transition={{
                        duration: 1
                      }}
                      className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                    />

                  </div>

                  <div className="text-3xl font-bold text-green-400">

                    {result.win_probability.toFixed(2)}%

                  </div>

                  <p className="mt-2 text-slate-400">

                    Win Probability

                  </p>

                </motion.div>

              )
            }

          </motion.div>

        </div>
            <AnalyticsPanel
  result={result}
  team1={formData.team1}
  team2={formData.team2}
/>
      </div>
    </div>
    
  );
}