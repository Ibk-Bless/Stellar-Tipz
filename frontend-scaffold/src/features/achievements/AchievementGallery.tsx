import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS, AchievementId } from "@/hooks/useAchievements";

interface AchievementGalleryProps {
  /** IDs of achievements the user has unlocked */
  unlockedIds: AchievementId[];
  className?: string;
}

/**
 * Displays all achievements in a grid, showing locked/unlocked state.
 * Used on the profile page to showcase earned achievements.
 */
const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  unlockedIds,
  className = "",
}) => {
  const all = Object.values(ACHIEVEMENTS);

  return (
    <div className={className}>
      <h3 className="text-xl font-black uppercase tracking-tight mb-4">
        Achievements
      </h3>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="list"
        aria-label="Achievement gallery"
      >
        {all.map((achievement, i) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              role="listitem"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`flex flex-col items-center gap-2 border-[3px] p-4 text-center transition-transform duration-200 ${
                isUnlocked
                  ? "border-black bg-yellow-50 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "border-gray-300 bg-gray-50 opacity-50"
              }`}
              aria-label={
                isUnlocked
                  ? `${achievement.label} — unlocked`
                  : `${achievement.label} — locked`
              }
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {isUnlocked ? achievement.emoji : <Lock size={28} className="text-gray-400" />}
              </span>
              <p
                className={`text-xs font-black uppercase tracking-wide ${
                  isUnlocked ? "text-black" : "text-gray-400"
                }`}
              >
                {achievement.label}
              </p>
              <p
                className={`text-xs font-bold leading-snug ${
                  isUnlocked ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {achievement.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementGallery;
