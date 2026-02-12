
import React, { useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Repository, RepositoryStatus } from './types';
import { MOCK_REPOS } from './constants';
import Dashboard from './components/Dashboard';
import RepositoryDetail from './components/RepositoryDetail';
import NewRepoModal from './components/NewRepoModal';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Box } from 'lucide-react';

const AppContent: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>(MOCK_REPOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const addRepository = (name: string, url: string) => {
    const newRepo: Repository = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      fullName: `nexus-user/${name}`,
      owner: 'nexus-user',
      url,
      status: RepositoryStatus.IDLE,
      securityFindings: [],
      pipelineRuns: [],
      metrics: {
        timeSavedMinutes: 0,
        aiFixSuccesses: 0,
        aiFixAttempts: 0
      }
    };
    setRepositories([...repositories, newRepo]);
  };

  const updateRepository = (updatedRepo: Repository) => {
    setRepositories(prev => prev.map(r => r.id === updatedRepo.id ? updatedRepo : r));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Ultra-Modern Vertical Sidebar */}
      <nav className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="p-10 border-b border-slate-800/50 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 border border-indigo-400/20"
          >
            <Box className="w-7 h-7 text-white" />
          </motion.div>
          <span className="text-white font-black text-3xl tracking-tighter">Nexus</span>
        </div>
        
        <div className="flex-1 py-10 px-6 overflow-y-auto space-y-12">
          <section>
            <div className="px-4 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Central Control</div>
            <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5"/>} label="Intelligence Deck" />
          </section>

          <section>
            <div className="px-4 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Active Nodes</div>
            <div className="space-y-1.5">
              {repositories.map(repo => (
                <RepoNavItem key={repo.id} repo={repo} />
              ))}
            </div>
          </section>
        </div>

        <div className="p-8">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-3xl font-black shadow-2xl shadow-indigo-600/20 transition-all border border-indigo-400/20"
          >
            <PlusCircle className="w-6 h-6" />
            Nexus Link
          </motion.button>
        </div>
      </nav>

      {/* Dynamic Main Viewport */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#1e1b4b,transparent_50%)]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard repositories={repositories} />} />
            <Route path="/repository/:id" element={<RepositoryDetail repositories={repositories} onUpdate={updateRepository} />} />
          </Routes>
        </AnimatePresence>
      </main>

      {isModalOpen && (
        <NewRepoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addRepository} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-indigo-500 font-black">INITIALIZING NEXUS...</div>}>
        <AppContent />
      </Suspense>
    </Router>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
        active ? 'bg-indigo-600/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      }`}
    >
      {active && <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" />}
      <div className={`transition-colors duration-300 ${active ? 'text-indigo-500' : 'group-hover:text-indigo-400'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
  );
};

const RepoNavItem: React.FC<{ repo: Repository }> = ({ repo }) => {
  const location = useLocation();
  const active = location.pathname === `/repository/${repo.id}`;
  
  return (
    <Link 
      to={`/repository/${repo.id}`} 
      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
        active ? 'bg-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-4 truncate">
        <div className={`w-2.5 h-2.5 rounded-full shadow-lg transition-all duration-500 ${
          repo.status === RepositoryStatus.COMPLETED ? 'bg-emerald-500 shadow-emerald-500/30' : 
          repo.status === RepositoryStatus.IDLE ? 'bg-slate-700' : 'bg-amber-400 animate-pulse'
        }`}></div>
        <span className="truncate font-bold text-[13px] tracking-tight">{repo.name}</span>
      </div>
      {repo.securityFindings.length > 0 && (
        <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-black border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
          {repo.securityFindings.length}
        </span>
      )}
    </Link>
  );
};

export default App;
