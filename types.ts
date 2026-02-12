
export enum RepositoryStatus {
  IDLE = 'idle',
  SCANNING = 'scanning',
  CLASSIFYING = 'classifying',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  duration?: string;
}

export interface DetectedStack {
  language: string;
  framework: string;
  database: string;
  entry_point: string;
  confidence: number;
  reasoning: string;
}

export interface SecurityFinding {
  type: 'secret' | 'vulnerability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

export interface PipelineRun {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  duration: string;
  log?: string;
  stages: PipelineStage[];
}

export interface Configs {
  dockerfile: string;
  workflow: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  url: string;
  lastScanned?: string;
  status: RepositoryStatus;
  stack?: DetectedStack;
  configs?: Configs;
  securityFindings: SecurityFinding[];
  pipelineRuns: PipelineRun[];
  metrics: {
    timeSavedMinutes: number;
    aiFixSuccesses: number;
    aiFixAttempts: number;
  };
}

export interface HealingAnalysis {
  rootCause: string;
  fixType: 'dependency' | 'config' | 'code' | 'environment';
  confidence: number;
  explanation: string;
  suggestedFix: {
    type: string;
    target: string;
    change: string;
    before: string;
  };
}
