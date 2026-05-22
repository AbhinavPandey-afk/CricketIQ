import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { motion } from "framer-motion";

export default function AnalyticsPanel({

  result,
  team1,
  team2

}) {

  if (!result) return null;

  // ==========================================
  // REAL ANALYTICS FROM BACKEND
  // ==========================================

  const analytics = result.analytics;

  // ==========================================
  // PIE CHART DATA
  // ==========================================

  const probabilityData = [
  {
    name: team1,
    probability: Number(
      result.win_probability.toFixed(2)
    )
  },
  {
    name: team2,
    probability: Number(
      (100 - result.win_probability).toFixed(2)
    )
  }
];

  // ==========================================
  // BAR CHART DATA
  // ==========================================

  const comparisonData = [
    {
      metric: "Recent Form",
      value: analytics.recent_form
    },
    {
      metric: "Head-to-Head",
      value: analytics.head_to_head
    },
    {
      metric: "Venue Advantage",
      value: analytics.venue_advantage
    },
    {
      metric: "Toss Impact",
      value: analytics.toss_impact
    }
  ];

  const COLORS = [
    "#06b6d4",
    "#8b5cf6"
  ];

  return (

    <motion.div

      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.8 }}

      className="mt-10"

    >

      {/* HEADER */}

      <h2 className="text-4xl font-bold mb-8 text-center">

        Match Analytics

      </h2>

      {/* CHART GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PIE CHART */}

        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h3 className="text-2xl font-bold mb-6">

            Win Probability

          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={probabilityData}
                dataKey="probability"
                nameKey="name"
                outerRadius={110}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(2)}%`
                }
              >

                {
                  probabilityData.map(
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

        {/* BAR CHART */}

        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h3 className="text-2xl font-bold mb-6">

            Match Factors

          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={comparisonData}
            >

              <XAxis
                dataKey="metric"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#06b6d4"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ANALYTICS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

        {/* RECENT FORM */}

        <motion.div

          whileHover={{ scale: 1.03 }}

          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl"

        >

          <h4 className="text-slate-400">

            Recent Form

          </h4>

          <div className="text-4xl font-bold mt-3 text-cyan-400">

            {analytics.recent_form}%

          </div>

        </motion.div>

        {/* HEAD TO HEAD */}

        <motion.div

          whileHover={{ scale: 1.03 }}

          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl"

        >

          <h4 className="text-slate-400">

            Head-to-Head

          </h4>

          <div className="text-4xl font-bold mt-3 text-purple-400">

            {analytics.head_to_head}%

          </div>

        </motion.div>

        {/* VENUE ADVANTAGE */}

        <motion.div

          whileHover={{ scale: 1.03 }}

          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl"

        >

          <h4 className="text-slate-400">

            Venue Advantage

          </h4>

          <div className="text-4xl font-bold mt-3 text-green-400">

            {analytics.venue_advantage}%

          </div>

        </motion.div>

        {/* TOSS IMPACT */}

        <motion.div

          whileHover={{ scale: 1.03 }}

          className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl"

        >

          <h4 className="text-slate-400">

            Toss Impact

          </h4>

          <div className="text-4xl font-bold mt-3 text-yellow-400">

            {analytics.toss_impact}%

          </div>

        </motion.div>

      </div>

    </motion.div>
  );
}