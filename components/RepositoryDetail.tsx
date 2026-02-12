
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Repository, RepositoryStatus, HealingAnalysis, PipelineStage } from '../types';
import { GeminiService } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  ShieldAlert,
  FileCode, 
  History, 
  Settings, 
  Play, 
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Code2
} from 'lucide-react';

interface RepositoryDetailProps {
  repositories: Repository[];
  onUpdate: (repo: Repository) => void;
}

const RepositoryDetail: React.FC<RepositoryDetailProps> = ({ repositories, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const repo = repositories.find(r => r.id === id);
  const [isHealing, setIsHealing] = useState(false);
  const [healingResult, setHealingResult] = useState<HealingAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'configs' | 'history'>('overview');
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!repo) return <div className="p-20 text-center font-bold text-slate-500">Repository not found.</div>;

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFullOnboarding = async () => {
    setLogs([]);
    onUpdate({ ...repo, status: RepositoryStatus.SCANNING });
    addLog("Initializing autonomous scanning engine...");
    await new Promise(r => setTimeout(r, 1000));
    
    addLog("Scanning file manifest...");
    const mockFiles = ["package.json", "src/index.ts", "README.md", "Dockerfile"];
    addLog(`Found ${mockFiles.length} critical project files.`);
    
    onUpdate({ ...repo, status: RepositoryStatus.CLASSIFYING });
    addLog("Gemini intelligence analyzing stack fingerprint...");
    const readme = "# Nexus Project\nBuild automation platform using Node.js and PostgreSQL.";
    const stack = await GeminiService.classifyStack(mockFiles, readme);
    addLog(`Identified ${stack.language}/${stack.framework} with ${stack.confidence}% confidence.`);

    onUpdate({ ...repo, status: RepositoryStatus.GENERATING });
    addLog("Architecting production configurations...");
    const configs = await GeminiService.generateConfigs(stack);
    addLog("Dockerfile and CI workflows successfully generated.");
    
    addLog("Executing security gate scan...");
    const security = await GeminiService.scanSecurity([{ path: 'package.json', content: '{"dependencies": {"express": "4.18.0"}}' }]);
    addLog(`Security scan complete: ${security.length} warnings detected.`);

    onUpdate({ 
      ...repo, 
      status: RepositoryStatus.COMPLETED, 
      stack, 
      configs, 
      securityFindings: security,
      lastScanned: new Date().toISOString()
    });
    addLog("Onboarding complete. Autonomy active.");
  };

  const handleHeal = async (failureLog: string) => {
    if (!repo.stack) return;
    setIsHealing(true);
    addLog("Self-healing sequence initiated...");
    try {
      const result = await GeminiService.analyzeBuildFailure(failureLog, repo.stack);
      addLog(`Root cause identified: ${result.rootCause}`);
      // Simulate providing "before" code for the diff
      const enhancedResult: HealingAnalysis = {
        ...result,
        suggestedFix: {
          ...result.suggestedFix,
          before: '// ... existing code ...\nimport requests from "reqs";' // Simulating old code
        }
      };
      setHealingResult(enhancedResult);
    } catch (error) {
      addLog("Healing analysis failed. AI model timeout.");
    } finally {
      setIsHealing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 max-w-7xl mx-auto space-y-10"
    >
      {/* Dynamic Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-8">
          <motion.div 
            layoutId={`repo-icon-${repo.id}`}
            className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl border border-slate-700"
          >
            {repo.name[0].toUpperCase()}
          </motion.div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-6xl font-black text-white tracking-tighter">{repo.name}</h1>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                repo.status === RepositoryStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {repo.status}
              </div>
            </div>
            <div className="flex items-center gap-6 text-slate-500 text-sm font-bold">
              <a href={repo.url} className="hover:text-indigo-400 flex items-center gap-2 transition-colors">
                <ExternalLink className="w-4 h-4" />
                {repo.fullName}
              </a>
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Autonomous Mode: <span className="text-emerald-500">Active</span>
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleFullOnboarding}
          disabled={repo.status !== RepositoryStatus.IDLE && repo.status !== RepositoryStatus.COMPLETED}
          className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-current" />
          {repo.status === RepositoryStatus.IDLE ? 'Initialize Fleet' : 'Recalibrate AI'}
        </button>
      </div>

      {/* Visual Pipeline Graph */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full"></div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Live Pipeline Flow</h3>
        <div className="flex items-center justify-between relative z-10">
          <PipelineStep name="Scanner" status={repo.status === RepositoryStatus.COMPLETED ? 'success' : 'pending'} />
          <PipelineConnector active={repo.status === RepositoryStatus.COMPLETED} />
          <PipelineStep name="Test Gate" status={repo.status === RepositoryStatus.COMPLETED ? 'success' : 'pending'} />
          <PipelineConnector active={repo.status === RepositoryStatus.COMPLETED} />
          <PipelineStep name="Security Guard" status={repo.securityFindings.length > 0 ? 'failure' : repo.status === RepositoryStatus.COMPLETED ? 'success' : 'pending'} />
          <PipelineConnector active={repo.status === RepositoryStatus.COMPLETED} />
          <PipelineStep name="Build Logic" status={repo.status === RepositoryStatus.COMPLETED ? 'success' : 'pending'} />
          <PipelineConnector active={repo.status === RepositoryStatus.COMPLETED} />
          <PipelineStep name="Deployment" status={repo.status === RepositoryStatus.COMPLETED ? 'success' : 'pending'} />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <TabItem icon={<Cpu className="w-4 h-4"/>} label="Project Insight" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <TabItem icon={<ShieldCheck className="w-4 h-4"/>} label="Security Perimeter" active={activeTab === 'security'} onClick={() => setActiveTab('security')} badge={repo.securityFindings.length} />
        <TabItem icon={<FileCode className="w-4 h-4"/>} label="AI Generated Files" active={activeTab === 'configs'} onClick={() => setActiveTab('configs')} />
        <TabItem icon={<History className="w-4 h-4"/>} label="Health History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
      </div>

      {/* Multi-Tab Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {/* Stack Detection Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                  <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    Detected Infrastructure
                  </h2>
                  {repo.stack ? (
                    <div className="grid grid-cols-2 gap-10">
                      <DetailRow label="Core Language" value={repo.stack.language} icon="IND" />
                      <DetailRow label="Framework Architecture" value={repo.stack.framework} icon="FRM" />
                      <DetailRow label="Data Persistence" value={repo.stack.database} icon="DB" />
                      <DetailRow label="Entry Point Matrix" value={repo.stack.entry_point} code />
                      <div className="col-span-2 bg-slate-950/50 p-6 rounded-2xl border border-slate-800 italic text-slate-400 text-sm leading-relaxed">
                         "{repo.stack.reasoning}"
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs opacity-50">
                      Run scan to derive project stack
                    </div>
                  )}
                </div>

                {/* Healing Engine Terminal */}
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
                  <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <TerminalIcon className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-sm font-black text-white uppercase tracking-widest">Self-Healing Logic Gate</h2>
                    </div>
                    {isHealing && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                  </div>
                  
                  <div className="p-0">
                    {repo.pipelineRuns.some(run => run.status === 'failure') && !healingResult ? (
                      <div className="p-8 space-y-6">
                        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                          <div className="text-rose-500 text-xs font-black uppercase mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Active Runtime Failure
                          </div>
                          <code className="text-[11px] font-mono text-rose-200 whitespace-pre-wrap leading-relaxed block max-h-40 overflow-y-auto">
                            {repo.pipelineRuns.find(run => run.status === 'failure')?.log}
                          </code>
                        </div>
                        <button 
                          onClick={() => handleHeal(repo.pipelineRuns.find(run => run.status === 'failure')?.log || '')}
                          disabled={isHealing}
                          className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black transition-all flex items-center justify-center gap-3"
                        >
                          {isHealing ? 'Synthesizing Solution...' : 'Execute AI Self-Heal'}
                        </button>
                      </div>
                    ) : healingResult ? (
                      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-5">
                        <div className="space-y-2">
                           <div className="text-emerald-500 font-black text-lg flex items-center gap-2">
                             <CheckCircle2 className="w-6 h-6" /> Root Cause Identified
                           </div>
                           <p className="text-slate-400 text-sm font-medium leading-relaxed">{healingResult.explanation}</p>
                        </div>
                        
                        {/* Fix Diff View */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 overflow-hidden">
                              <span className="text-[9px] font-black text-rose-500 uppercase block mb-3">Broken Implementation</span>
                              <pre className="text-[10px] font-mono text-slate-500 line-through leading-relaxed opacity-60">
                                {healingResult.suggestedFix.before}
                              </pre>
                           </div>
                           <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 overflow-hidden shadow-inner">
                              <span className="text-[9px] font-black text-emerald-500 uppercase block mb-3">AI-Refactored Fix</span>
                              <pre className="text-[10px] font-mono text-emerald-300 leading-relaxed">
                                {healingResult.suggestedFix.change}
                              </pre>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all">Submit Fix PR</button>
                           <button onClick={() => setHealingResult(null)} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black hover:text-white">Discard</button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">No active failures detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl space-y-8"
              >
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-white flex items-center gap-3">Security Perimeter</h2>
                   <div className="px-4 py-1.5 bg-rose-500/10 text-rose-500 rounded-full text-xs font-black uppercase tracking-widest border border-rose-500/20">
                      {repo.securityFindings.length} Active Threats
                   </div>
                </div>
                
                <div className="grid gap-6">
                  {repo.securityFindings.map((finding, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50 group hover:border-rose-500/40 transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex gap-3">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                             finding.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                           }`}>
                             {finding.severity}
                           </span>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NEX-IDS-0{idx}</span>
                         </div>
                         <ShieldAlert className="w-5 h-5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{finding.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">{finding.description}</p>
                      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/50">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Nexus-AI Remediation Plan</span>
                        <div className="text-sm font-bold text-slate-300 flex items-center gap-2">
                           <ChevronRight className="w-4 h-4 text-indigo-500" />
                           {finding.recommendation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'configs' && (
              <motion.div key="configs" className="space-y-10">
                {repo.configs ? (
                  <>
                    <ConfigPanel title="Dockerfile" content={repo.configs.dockerfile} lang="dockerfile" />
                    <ConfigPanel title="GitHub Workflow" content={repo.configs.workflow} lang="yaml" />
                  </>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-20 text-center text-slate-600 font-black uppercase tracking-widest text-sm">
                    Generate configuration to view artifacts
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <Cpu className="w-10 h-10 text-indigo-600/20" />
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Intelligence Feed</h3>
              <div className="max-h-96 overflow-y-auto space-y-4 font-mono text-[10px] text-slate-400 pr-2 scrollbar-thin">
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex gap-3 items-start"
                  >
                    <span className="text-indigo-500/50 shrink-0 tracking-tighter">[{i.toString().padStart(2, '0')}]</span>
                    <span className="leading-relaxed">{log}</span>
                  </motion.div>
                ))}
                <div ref={logEndRef} />
              </div>
           </div>

           <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-600/30">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-xl">
                   <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tighter">Optimization Insight</h3>
             </div>
             <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
               Detected <span className="text-white font-bold">Node.js</span> architecture. Gemini has optimized your Docker build with <span className="text-white font-bold">Multi-Stage Caching</span>, saving approximately 4.2 minutes per CI run.
             </p>
             <div className="text-[10px] font-black text-white/50 uppercase tracking-widest border-t border-white/10 pt-4 flex justify-between">
                <span>Confidence Factor</span>
                <span>{repo.stack?.confidence || 0}%</span>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const PipelineStep: React.FC<{ name: string; status: 'pending' | 'running' | 'success' | 'failure' }> = ({ name, status }) => (
  <div className="flex flex-col items-center gap-4 relative z-10 group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
      status === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 
      status === 'failure' ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-slate-800 border-slate-700 text-slate-600'
    }`}>
      {status === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
       status === 'failure' ? <AlertCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 opacity-30" />}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${
      status === 'success' ? 'text-emerald-500' : 'text-slate-500'
    }`}>{name}</span>
  </div>
);

const PipelineConnector: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex-1 h-[2px] bg-slate-800 mx-4 mt-[-1.5rem] relative">
    {active && (
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      />
    )}
  </div>
);

const TabItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
      active ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    {label}
    {badge ? (
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${active ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
        {badge}
      </span>
    ) : null}
  </button>
);

const DetailRow: React.FC<{ label: string; value: string; code?: boolean; icon?: string }> = ({ label, value, code, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className={`font-bold text-lg tracking-tight ${code ? 'font-mono text-indigo-400 text-sm' : 'text-slate-200'}`}>
      {code ? `> ${value}` : value}
    </div>
  </div>
);

const ConfigPanel: React.FC<{ title: string; content: string; lang: string }> = ({ title, content, lang }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
    <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Code2 className="w-5 h-5 text-indigo-500" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <span className="text-[10px] text-slate-600 font-mono tracking-tighter">ARTIFACT-ID: NEX-{lang.toUpperCase()}-01</span>
    </div>
    <div className="p-8 bg-slate-950/50 overflow-x-auto">
      <pre className="text-slate-400 font-mono text-xs leading-relaxed">
        {content}
      </pre>
    </div>
  </div>
);

export default RepositoryDetail;
