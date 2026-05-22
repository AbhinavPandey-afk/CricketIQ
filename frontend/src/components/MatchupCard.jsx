import { motion } from "framer-motion";
import teamData from "../data/teamData";

export default function MatchupCard({

  team1,
  team2

}) {

  if (!team1 || !team2) return null;

  const t1 = teamData[team1];
  const t2 = teamData[team2];

  return (

    <motion.div

      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}

      className="mb-10"

    >

      <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-6 shadow-2xl">

        <div className="flex items-center justify-between">

          {/* TEAM 1 */}

          <div className="flex flex-col items-center w-1/3">

            <div className={`
              w-28 h-28
              rounded-full
              bg-gradient-to-br
              ${t1.color}
              p-1
              shadow-lg
            `}>

              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">

                <img
                  src={t1.logo}
                  alt={team1}
                  className="w-20 h-20 object-contain"
                />

              </div>

            </div>

            <h2 className="mt-4 text-2xl font-bold">

              {t1.short}

            </h2>

          </div>

          {/* VS SECTION */}

          <div className="flex flex-col items-center">

            <motion.div

              animate={{
                scale: [1, 1.1, 1]
              }}

              transition={{
                duration: 2,
                repeat: Infinity
              }}

              className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-extrabold shadow-2xl"
            >

              VS

            </motion.div>

          </div>

          {/* TEAM 2 */}

          <div className="flex flex-col items-center w-1/3">

            <div className={`
              w-28 h-28
              rounded-full
              bg-gradient-to-br
              ${t2.color}
              p-1
              shadow-lg
            `}>

              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">

                <img
                  src={t2.logo}
                  alt={team2}
                  className="w-20 h-20 object-contain"
                />

              </div>

            </div>

            <h2 className="mt-4 text-2xl font-bold">

              {t2.short}

            </h2>

          </div>

        </div>

      </div>

    </motion.div>
  );
}