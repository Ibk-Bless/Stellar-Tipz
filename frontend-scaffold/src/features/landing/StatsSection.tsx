import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useContract } from '@/hooks';
import { useToastStore } from '@/store/toastStore';
import { ContractStats } from '@/types/contract';
import { categorizeError, ERRORS } from '@/helpers/error';
import { env } from '@/helpers/env';
import Skeleton from '@/components/ui/Skeleton';

const FALLBACK_STATS = {
  feePct: 2,
  settlementTime: '3-5s',
  txCost: '$0.0001',
  feesSaved: '95%',
  speedup: '10,000×',
};

// Demo stats shown when VITE_USE_MOCK_DATA=true or contract is unavailable
const MOCK_STATS: ContractStats = {
  totalCreators: 1234,
  totalTipsCount: 8765,
  totalTipsVolume: '0',
  totalFeesCollected: '0',
  feeBps: 200, // 2%
};

const comparisonRows = [
  { feature: 'Fees', traditional: '30–50%', tipz: '2%', highlight: true },
  { feature: 'Settlement', traditional: '7–30 days', tipz: '3-5 seconds', highlight: true },
  { feature: 'Access', traditional: 'Regional', tipz: 'Global', highlight: false },
  { feature: 'Transparency', traditional: 'Hidden', tipz: 'On-Chain', highlight: false },
];

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<ContractStats | null>(
    env.useMockData ? MOCK_STATS : null,
  );
  const { getStats } = useContract();

  useEffect(() => {
    // Skip contract call when ID is not configured — show mock data if enabled
    if (!env.contractId) {
      if (env.useMockData) {
        setStats(MOCK_STATS);
      }
      return;
    }

    getStats()
      .then(setStats)
      .catch((err) => {
        // Contract may not be deployed yet — render gracefully with fallback
        console.warn('[StatsSection] Could not fetch live platform stats:', err);
        const { addToast } = useToastStore.getState();
        addToast({
          message: categorizeError(err).category === 'network' ? ERRORS.NETWORK : 'Could not fetch live platform stats.',
          type: 'error',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      role="region"
      aria-labelledby="stats-heading"
      className="py-20 px-4 bg-off-white border-t-3 border-b-3 border-black"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          id="stats-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-black text-center mb-16"
        >
          TIPZ VS TRADITIONAL
        </motion.h2>

        {/* Live or mock stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="card-brutalist text-center">
            <div className="text-4xl font-black mb-1">
              {stats ? stats.totalCreators.toLocaleString() : (
                <div className="flex justify-center" role="status" aria-busy="true">
                  <Skeleton variant="text" width="140px" height="40px" />
                </div>
              )}
            </div>
            <div className="text-sm uppercase font-bold tracking-wide">Creators</div>
          </div>
          <div className="card-brutalist text-center">
            <div className="text-4xl font-black mb-1">
              {stats ? stats.totalTipsCount.toLocaleString() : (
                <div className="flex justify-center" role="status" aria-busy="true">
                  <Skeleton variant="text" width="140px" height="40px" />
                </div>
              )}
            </div>
            <div className="text-sm uppercase font-bold tracking-wide">Tips Sent</div>
          </div>
          <div className="card-brutalist text-center">
            <div className="text-4xl font-black mb-1">
              {stats ? `${stats.feeBps / 100}%` : (
                <div className="flex justify-center" role="status" aria-busy="true">
                  <Skeleton variant="text" width="110px" height="40px" />
                </div>
              )}
            </div>
            <div className="text-sm uppercase font-bold tracking-wide">Platform Fee</div>
          </div>
        </motion.div>

        {/* Comparison table */}
        <div className="card-brutalist overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-4 px-4 font-black uppercase">Feature</th>
                <th className="text-left py-4 px-4 font-black uppercase">Traditional</th>
                <th className="text-left py-4 px-4 font-black uppercase bg-black text-white">Tipz</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-gray-300">
                  <td className="py-4 px-4 font-bold">{row.feature}</td>
                  <td className="py-4 px-4 text-gray-600">{row.traditional}</td>
                  <td className={`py-4 px-4 font-bold ${row.highlight ? 'text-green-600' : ''}`}>
                    {row.tipz}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block card-brutalist bg-black text-white px-8 py-4">
            <p className="text-2xl font-black">
              {FALLBACK_STATS.feesSaved} SAVINGS | {FALLBACK_STATS.speedup} FASTER
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
