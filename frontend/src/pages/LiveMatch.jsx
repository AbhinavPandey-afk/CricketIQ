import { useState } from "react";
import MomentumChart from "../components/MomentumChart"
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"
import LIVE_API from "../services/liveApi";
import toast from "react-hot-toast"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function LiveMatch() {

  const [formData, setFormData] = useState({

    batting_team: "",

    bowling_team: "",

    city: "",

    target: 180,

    current_score: 120,

    wickets_left: 6,

    overs_completed: 15.2
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const teams = [

    "Chennai Super Kings",

    "Mumbai Indians",

    "Royal Challengers Bangalore",

    "Kolkata Knight Riders",

    "Delhi Capitals",

    "Punjab Kings",

    "Rajasthan Royals",

    "Sunrisers Hyderabad"
  ];

  const cities = [

    "Mumbai",

    "Chennai",

    "Delhi",

    "Bangalore",

    "Kolkata",

    "Hyderabad",

    "Jaipur"
  ];

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value
    });
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await LIVE_API.post(

        "/predict_live",

        {

          ...formData,

          target: Number(formData.target),

          current_score: Number(
            formData.current_score
          ),

          wickets_left: Number(
            formData.wickets_left
          ),

          overs_completed: Number(
            formData.overs_completed
          )
        }
      );

      setResult(response.data);

toast.success(
  "Prediction Generated Successfully!"
);
    } catch (error) {

      console.log(error);

      toast.error(
  "Prediction Failed. Backend may be offline."
);
    }

    setLoading(false);
  };

  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = result
    ? [
        {
          name: result.batting_team,
          value:
            result.batting_team_win_probability
        },
        {
          name: result.bowling_team,
          value:
            result.bowling_team_win_probability
        }
      ]
    : [];

  const COLORS = [
    "#06b6d4",
    "#8b5cf6"
  ];
  // ==========================================
// LIVE MATCH CALCULATIONS
// ==========================================

const runsLeft =
  formData.target - formData.current_score;

const ballsLeft =
  120 - Math.floor(
    formData.overs_completed * 6
  );

const currentRunRate =
  (
    formData.current_score /
    formData.overs_completed
  ).toFixed(2);

const requiredRunRate =
  (
    (runsLeft * 6) /
    ballsLeft
  ).toFixed(2);
  // ==========================================
  // PRESSURE INDEX
  // ==========================================

  const pressureIndex = result
    ? Math.min(
        100,
        Math.max(
          0,
          (
            result.bowling_team_win_probability
            -
            result.batting_team_win_probability
          ) + 50
        )
      )
    : 50;

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-4 md:px-6 py-6 md:py-10">

      {/* HERO */}

      <motion.div

        initial={{ opacity: 0, y: -30 }}

        animate={{ opacity: 1, y: 0 }}

        className="text-center mb-12"

      >

        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

          Live Match AI

        </h1>

        <p className="mt-4 text-slate-400 text-base md:text-xl">

          Real-Time IPL Win Probability Engine

        </p>

      </motion.div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">

        {/* LEFT PANEL */}

        <motion.div

          initial={{ opacity: 0, x: -40 }}

          animate={{ opacity: 1, x: 0 }}

          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl"

        >

          <h2 className="text-3xl font-bold mb-8">

            Match State

          </h2>

          <form
  onSubmit={handleSubmit}
  className={`
    space-y-5
    transition-all
    duration-300

    ${
      loading
        ? "pointer-events-none opacity-70"
        : ""
    }
  `}
>

            {/* BATTING TEAM */}

            <select
              name="batting_team"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
              required
            >

              <option value="">
                Select Batting Team
              </option>

              {
                teams.map(team => (

                  <option
                    key={team}
                    value={team}
                  >

                    {team}

                  </option>
                ))
              }

            </select>

            {/* BOWLING TEAM */}

            <select
              name="bowling_team"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
              required
            >

              <option value="">
                Select Bowling Team
              </option>

              {
                teams.map(team => (

                  <option
                    key={team}
                    value={team}
                  >

                    {team}

                  </option>
                ))
              }

            </select>

            {/* CITY */}

            <select
              name="city"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
              required
            >

              <option value="">
                Select City
              </option>

              {
                cities.map(city => (

                  <option
                    key={city}
                    value={city}
                  >

                    {city}

                  </option>
                ))
              }

            </select>

            {/* TARGET */}

            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="Target"
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            />

            {/* SCORE */}

            <input
              type="number"
              name="current_score"
              value={formData.current_score}
              onChange={handleChange}
              placeholder="Current Score"
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            />

            {/* WICKETS */}

            <input
              type="number"
              name="wickets_left"
              value={formData.wickets_left}
              onChange={handleChange}
              placeholder="Wickets Left"
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            />

            {/* OVERS */}

            <input
              type="number"
              step="0.1"
              name="overs_completed"
              value={formData.overs_completed}
              onChange={handleChange}
              placeholder="Overs Completed"
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            />

            {/* BUTTON */}

            <motion.button

  whileHover={{
    scale: loading ? 1 : 1.03
  }}

  whileTap={{
    scale: loading ? 1 : 0.98
  }}

  type="submit"

  disabled={loading}

  className={`
    w-full
    p-4
    rounded-xl
    font-bold
    text-lg
    flex
    items-center
    justify-center
    gap-3
    transition-all
    duration-300

    ${
      loading
        ? `
          bg-slate-700
          cursor-not-allowed
          opacity-80
        `
        : `
          bg-gradient-to-r
          from-cyan-500
          to-blue-600
          hover:shadow-cyan-500/30
          hover:shadow-2xl
        `
    }
  `}
>

  {
    loading ? (

      <>

        <Loader2
          className="animate-spin"
          size={24}
        />

        Analyzing Match...

      </>

    ) : (

      "Predict Live Match"

    )
  }

</motion.button>

          </form>

        </motion.div>

        {/* RIGHT PANEL */}

<motion.div

  initial={{ opacity: 0, x: 40 }}

  animate={{ opacity: 1, x: 0 }}

  className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl"

>

  {
    !result ? (

      <div className="h-full flex items-center justify-center text-center">

        <div>

          <h2 className="text-4xl font-bold mb-4">

            Live Prediction Engine

          </h2>

          <p className="text-slate-400 text-lg">

            Enter live match data to generate AI-powered win probabilities.

          </p>

        </div>

      </div>

    ) : (

      <div>

        {/* LIVE SCORE HEADER */}

        <div className="mb-10">

          {/* SCORE */}

          <div className="text-center">

            <h1 className="text-4xl md:text-6xl font-extrabold text-cyan-400">

              {
                formData.batting_team.split(" ")[0]
              }

              {" "}

              {
                formData.current_score
              }

              /

              {
                10 - formData.wickets_left
              }

            </h1>

            <p className="text-slate-400 mt-2 text-base md:text-xl">

              {
                formData.overs_completed
              } Overs

            </p>

          </div>

          {/* TARGET + NEED */}

          <div className="mt-8 grid grid-cols-2 gap-4">

            {/* TARGET */}

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">

              <p className="text-slate-400">

                Target

              </p>

              <h2 className="text-3xl font-bold text-white mt-2">

                {
                  formData.target
                }

              </h2>

            </div>

            {/* NEED */}

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">

              <p className="text-slate-400">

                Need

              </p>

              <h2 className="text-3xl font-bold text-red-400 mt-2">

                {
                  runsLeft
                }

                {" ("}

                {
                  ballsLeft
                }

                {" balls)"}

              </h2>

            </div>

          </div>

          {/* RUN RATES */}

          <div className="mt-4 grid grid-cols-2 gap-4">

            {/* CURRENT RR */}

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">

              <p className="text-slate-400">

                Current RR

              </p>

              <h2 className="text-3xl font-bold text-green-400 mt-2">

                {
                  currentRunRate
                }

              </h2>

            </div>

            {/* REQUIRED RR */}

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">

              <p className="text-slate-400">

                Required RR

              </p>

              <h2 className="text-3xl font-bold text-yellow-400 mt-2">

                {
                  requiredRunRate
                }

              </h2>

            </div>

          </div>

        </div>

        {/* LIVE WIN PROBABILITY */}

        <div className="text-center mb-8">

          <h2 className="text-4xl font-bold">

            Live Win Probability

          </h2>

        </div>

        {/* PIE CHART */}

        <div className="h-[320px]">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={110}
                label={({ percent }) =>
                  `${(
                    percent * 100
                  ).toFixed(2)}%`
                }
              >

                {
                  chartData.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />
                    )
                  )
                }

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* PROBABILITY BARS */}

        <div className="space-y-6 mt-8">

          {/* BATTING TEAM */}

          <div>

            <div className="flex justify-between mb-2">

              <span>

                {
                  result.batting_team
                }

              </span>

              <span>

                {
                  result.batting_team_win_probability
                }%

              </span>

            </div>

            <div className="w-full bg-slate-700 rounded-full h-5 overflow-hidden">

              <motion.div

                initial={{ width: 0 }}

                animate={{
                  width: `${result.batting_team_win_probability}%`
                }}

                transition={{
                  duration: 1
                }}

                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"

              />

            </div>

          </div>

          {/* BOWLING TEAM */}

          <div>

            <div className="flex justify-between mb-2">

              <span>

                {
                  result.bowling_team
                }

              </span>

              <span>

                {
                  result.bowling_team_win_probability
                }%

              </span>

            </div>

            <div className="w-full bg-slate-700 rounded-full h-5 overflow-hidden">

              <motion.div

                initial={{ width: 0 }}

                animate={{
                  width: `${result.bowling_team_win_probability}%`
                }}

                transition={{
                  duration: 1
                }}

                className="h-full bg-gradient-to-r from-purple-400 to-pink-500"

              />

            </div>

          </div>

        </div>

        {/* PRESSURE INDEX */}

        <div className="mt-10">

          <h3 className="text-2xl font-bold mb-4">

            Pressure Index

          </h3>

          <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">

            <motion.div

              initial={{ width: 0 }}

              animate={{
                width: `${pressureIndex}%`
              }}

              transition={{
                duration: 1
              }}

              className="h-full bg-gradient-to-r from-yellow-400 to-red-500"

            />

          </div>

          <div className="mt-3 text-center text-3xl font-bold text-yellow-400">

            {
              pressureIndex.toFixed(2)
            }%

          </div>

        </div>

      </div>

    )
  }

</motion.div>

      </div>
        {/* MOMENTUM CHART */}

      {
        result && (

          <div className="max-w-7xl mx-auto mt-12">

            <MomentumChart

              battingTeam={
                result.batting_team
              }

              bowlingTeam={
                result.bowling_team
              }

              probability={
                result.batting_team_win_probability
              }

            />

          </div>

        )
      }
    </div>
  );
}