import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"

import { motion } from "framer-motion"

export default function MomentumChart({

  battingTeam,

  bowlingTeam,

  probability,

}) {

  // ==========================================
  // REALISTIC IPL MOMENTUM GENERATION
  // ==========================================

  const momentumData = []

  let current = 50

  for (let over = 1; over <= 20; over++) {

    let swing = 0

    // POWERPLAY CHAOS

    if (over <= 6) {

      swing =
        (Math.random() * 16) - 8
    }

    // MIDDLE OVERS

    else if (over <= 15) {

      swing =
        (Math.random() * 10) - 5
    }

    // DEATH OVERS

    else {

      swing =
        (Math.random() * 20) - 10
    }

    // WICKET EVENT

    if (Math.random() > 0.82) {

      swing -= (
        8 + Math.random() * 12
      )
    }

    // BIG OVER EVENT

    if (Math.random() > 0.88) {

      swing += (
        10 + Math.random() * 10
      )
    }

    current += swing

    // bias towards current probability

    current += (
      (probability - current) * 0.12
    )

    current = Math.max(
      3,
      Math.min(97, current)
    )

    momentumData.push({

      over,

      probability: Number(
        current.toFixed(1)
      ),
    })
  }

  // ==========================================
  // UI
  // ==========================================

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 30,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.6,
      }}

      className="
      bg-[#20263a]
      rounded-3xl
      p-6
      border
      border-white/10
      shadow-2xl
    "
    >

      {/* HEADER */}

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-white">

          Momentum Timeline

        </h2>

        <p className="text-gray-400 mt-2">

          Real-time momentum swings throughout the chase

        </p>

      </div>

      {/* CHART */}

      <div className="h-[360px]">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={momentumData}>

            <defs>

              <linearGradient
                id="momentumFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                  stopOpacity={0.5}
                />

                <stop
                  offset="100%"
                  stopColor="#22d3ee"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2d3748"
            />

            <XAxis
              dataKey="over"
              stroke="#94a3b8"
            />

            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
            />

            <Tooltip />

            <Area

              type="monotone"

              dataKey="probability"

              stroke="#22d3ee"

              fill="url(#momentumFill)"

              strokeWidth={4}

            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* FOOTER */}

      <div className="mt-8 flex justify-between items-center">

        <div>

          <p className="text-cyan-400 font-bold text-lg">

            {battingTeam}

          </p>

          <p className="text-sm text-gray-400">

            Batting Momentum

          </p>

        </div>

        <div className="text-right">

          <p className="text-pink-400 font-bold text-lg">

            {bowlingTeam}

          </p>

          <p className="text-sm text-gray-400">

            Bowling Pressure

          </p>

        </div>

      </div>

    </motion.div>
  )
}