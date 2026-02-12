
import React from 'react';
import { Repository, RepositoryStatus } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Box, 
  Clock, 
  ShieldAlert, 
  Wrench, 
  ArrowUpRight, 
  Activity, 
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardProps {
  repositories: Repository[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Dashboard: React.FC<DashboardProps> = ({ repositories }) => {
  const stats = {
    total: repositories.length,
    active: repositories.filter(r => r.status === RepositoryStatus.COMPLETED).length,
    failures: repositories.reduce((acc, r) => acc + r.pipelineRuns.filter(run => run.status === 'failure').length, 0),
    security: repositories.reduce((acc, r) => acc + r.securityFindings.length, 0),
    timeSaved: repositories.reduce((acc, r) => acc + (r.metrics?.timeSavedMinutes || 0), 0),
    fixRate: repositories.reduce((acc, r) => acc + (r.metrics?.aiFixAttempts > 0 ? (r.metrics.aiFixSuccesses / r.metrics.aiFixAttempts) : 0), 0) / (repositories.filter(r => r.metrics?.aiFixAttempts > 0).length || 1)
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="p-10 max-w-7xl mx-auto space-y-10"
    >
      <header className="flex justify-between items-end">
        <div>
          <motion.h1 variants={item} className="text-4xl font-black text-white tracking-tighter">Command Center</motion.h1>
          <motion.p variants={item} className="text-slate-400 mt-2 font-medium">Autonomous CI/CD performance monitoring.</motion.p>
        </div>
        <motion.div variants={item} className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Nexus Core 1.2.0-Alpha</span>
          </div>
        </motion.div>
      </header>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Managed Fleet" value={stats.total} icon={<Box className="w-5 h-5"/>} />
        <StatCard 
          title="Autonomy Savings" 
          value={`${Math.floor(stats.timeSaved / 60)}h ${stats.timeSaved % 60}m`} 
          icon={<Clock className="w-5 h-5"/>} 
          trend="+12% this week"
        />
        <StatCard 
          title="AI Healing Accuracy" 
          value={`${(stats.fixRate * 100).toFixed(0)}%`} 
          icon={<Wrench className="w-5 h-5"/>} 
          alert={stats.fixRate < 0.3}
          trend="Target: 80%"
        />
        <StatCard 
          title="Threat Detection" 
          value={stats.security} 
          icon={<ShieldAlert className="w-5 h-5"/>} 
          alert={stats.security > 0} 
        />
      </motion.div>

      <motion.section variants={item} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-500" />
            Project Lifecycle
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-8 py-5">Project Node</th>
                <th className="px-8 py-5">Stack Definition</th>
                <th className="px-8 py-5">Pipeline Status</th>
                <th className="px-8 py-5">Intelligence</th>
                <th className="px-8 py-5 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {repositories.map((repo, i) => (
                <motion.tr 
                  key={repo.id}
                  variants={item}
                  className="hover:bg-slate-800/30 transition-all group cursor-default"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-black shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        {repo.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-white">{repo.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">{repo.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {repo.stack ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-black uppercase">{repo.stack.language}</span>
                          <span className="text-xs font-bold text-slate-400">{repo.stack.framework}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-1 rounded-full italic tracking-widest">AWAITING SCAN</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        repo.status === RepositoryStatus.COMPLETED ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                        repo.status === RepositoryStatus.IDLE ? 'bg-slate-600' : 'bg-amber-400 animate-pulse'
                      }`}></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{repo.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase mb-1">Fixes</span>
                        <span className="text-sm font-black text-slate-300">{repo.metrics?.aiFixSuccesses || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase mb-1">Vulns</span>
                        <span className={`text-sm font-black ${repo.securityFindings.length > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                          {repo.securityFindings.length}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      to={`/repository/${repo.id}`} 
                      className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all group/btn"
                    >
                      <ArrowUpRight className="w-5 h-5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {repositories.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto">
                <Box className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">No projects connected yet.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; trend?: string; alert?: boolean }> = ({ title, value, icon, trend, alert }) => (
  <motion.div 
    variants={item}
    whileHover={{ scale: 1.02 }}
    className={`bg-slate-900/50 border border-slate-800 p-7 rounded-3xl space-y-4 transition-all ${
      alert ? 'ring-2 ring-rose-500/20 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10'
    }`}
  >
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-slate-800/50 rounded-xl text-slate-400 border border-slate-700">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{trend}</span>
      )}
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</div>
      <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
    </div>
  </motion.div>
);

export default Dashboard;
