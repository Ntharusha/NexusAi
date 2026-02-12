
export const CLASSIFIER_SYSTEM_INSTRUCTION = `
You are a DevOps expert. Analyze the provided project files and README content to identify:
1. Primary programming language
2. Framework/runtime (e.g., Express, Django, FastAPI)
3. Database requirements
4. Recommended build entry point
5. Confidence score (0-100)

Respond ONLY with a valid JSON object.
`;

export const CONFIG_GENERATOR_SYSTEM_INSTRUCTION = `
You are a senior DevOps engineer. Generate a production-ready Dockerfile and a GitHub Actions workflow YAML.
Dockerfile should follow best practices: multi-stage builds, non-root user, optimized caching.
Workflow should include: checkout, setup-env, install-deps, test, build-docker.
Respond ONLY with a JSON object containing 'dockerfile' and 'workflow' keys.
`;

export const SECURITY_SYSTEM_INSTRUCTION = `
You are a security expert. Scan code for:
1. Secrets (API keys, tokens, high-entropy strings)
2. Vulnerabilities (common CVEs in package manifests)
Explain findings clearly with severity and remediation.
Respond ONLY with a valid JSON array of objects.
`;

export const HEALER_SYSTEM_INSTRUCTION = `
You are a specialist in self-healing CI/CD pipelines.
Analyze build failure logs, pinpoint the root cause (e.g., missing package, wrong port, syntax error),
and propose a precise fix.
Respond ONLY with a JSON object matching the requested schema.
`;

export const MOCK_REPOS: any[] = [
  {
    id: '1',
    name: 'nexus-backend',
    fullName: 'nexus-ai/nexus-backend',
    owner: 'nexus-ai',
    url: 'https://github.com/nexus-ai/nexus-backend',
    lastScanned: '2024-05-10T14:30:00Z',
    status: 'completed',
    stack: {
      language: 'Python',
      framework: 'FastAPI',
      database: 'PostgreSQL',
      entry_point: 'uvicorn main:app --host 0.0.0.0',
      confidence: 98,
      reasoning: 'Found requirements.txt with fastapi and uvicorn. README mentions PostgreSQL.'
    },
    configs: {
      dockerfile: 'FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD ["uvicorn", "main:app"]',
      workflow: 'name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4'
    },
    securityFindings: [
      {
        type: 'vulnerability',
        severity: 'medium',
        title: 'Outdated package: fastapi',
        file: 'requirements.txt',
        description: 'Version 0.90.0 has a vulnerability in dependency resolution.',
        recommendation: 'Upgrade to 0.100.0 or higher.'
      }
    ],
    pipelineRuns: [
      { 
        id: 'run-1', 
        timestamp: '2024-05-11T09:00:00Z', 
        status: 'success', 
        duration: '45s',
        stages: [] 
      },
      { 
        id: 'run-2', 
        timestamp: '2024-05-11T12:30:00Z', 
        status: 'failure', 
        duration: '12s', 
        log: 'ModuleNotFoundError: No module named "requests"',
        stages: [] 
      }
    ],
    metrics: {
      timeSavedMinutes: 120,
      aiFixSuccesses: 1,
      aiFixAttempts: 2
    }
  },
  {
    id: '2',
    name: 'user-service-go',
    fullName: 'nexus-ai/user-service-go',
    owner: 'nexus-ai',
    url: 'https://github.com/nexus-ai/user-service-go',
    status: 'idle',
    securityFindings: [],
    pipelineRuns: [],
    metrics: {
      timeSavedMinutes: 0,
      aiFixSuccesses: 0,
      aiFixAttempts: 0
    }
  }
];
