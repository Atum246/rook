'use client';

import { useState } from 'react';

const TEMPLATES = [
  {
    id: 'personal-assistant',
    icon: '🤖',
    name: 'Personal Assistant',
    description: 'A helpful personal assistant with memory and skills'
  },
  {
    id: 'customer-support',
    icon: '💼',
    name: 'Customer Support',
    description: 'Professional support agent with FAQ knowledge'
  },
  {
    id: 'code-helper',
    icon: '👨‍💻',
    name: 'Code Helper',
    description: 'A coding assistant for development tasks'
  },
  {
    id: 'custom',
    icon: '🛠️',
    name: 'Custom Agent',
    description: 'Build your own agent from scratch'
  }
];

const REGIONS = [
  { id: 'oregon', label: '🇺🇸 Oregon (US West)' },
  { id: 'ohio', label: '🇺🇸 Ohio (US East)' },
  { id: 'frankfurt', label: '🇩🇪 Frankfurt (EU)' },
  { id: 'singapore', label: '🇸🇬 Singapore (Asia)' },
  { id: 'sydney', label: '🇦🇺 Sydney (Oceania)' }
];

export default function DeployModal({ token, onClose, onDeployed }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('personal-assistant');
  const [region, setRegion] = useState('oregon');
  const [modelId, setModelId] = useState('google/gemini-flash-1.5-free');
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState('');
  const [deployProgress, setDeployProgress] = useState('');

  const handleDeploy = async () => {
    if (!name.trim()) {
      setError('Give your agent a name! 📝');
      return;
    }

    setDeploying(true);
    setError('');
    setDeployProgress('Preparing deployment... 📦');

    try {
      // Simulate progress updates
      const progressSteps = [
        'Preparing deployment... 📦',
        'Validating API keys... 🔑',
        'Setting up database... 🗄️',
        'Deploying to Render... 🚀',
        'Configuring keep-alive... ⏰',
        'Going live! 🎉'
      ];

      let i = 0;
      const progressInterval = setInterval(() => {
        if (i < progressSteps.length) {
          setDeployProgress(progressSteps[i]);
          i++;
        }
      }, 2000);

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, template, modelId, region })
      });

      clearInterval(progressInterval);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDeployProgress('Deployed! 🎉');

      // Brief delay to show success
      setTimeout(() => {
        onDeployed();
      }, 1000);
    } catch (err) {
      setError(err.message);
      setDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Deploy New Agent 🚀
            </h2>
            <p className="text-sm text-dark-400 mt-1">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition p-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {deploying ? (
            /* Deploy Progress */
            <div className="text-center py-12">
              <div className="text-6xl mb-6 animate-bounce">🚀</div>
              <p className="text-lg text-white mb-2">{deployProgress}</p>
              <div className="w-48 mx-auto bg-dark-800 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-rook-600 to-rook-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Name & Template */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-dark-400 mb-2">Agent Name 📝</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My awesome agent"
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-rook-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-dark-400 mb-2">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does this agent do?"
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-rook-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-dark-400 mb-3">Template 📦</label>
                    <div className="grid grid-cols-2 gap-3">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={`p-4 rounded-xl border text-left transition ${
                            template === t.id
                              ? 'border-rook-500 bg-rook-500/10'
                              : 'border-dark-700 hover:border-dark-600'
                          }`}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <div className="mt-2 font-medium text-white text-sm">{t.name}</div>
                          <div className="text-xs text-dark-400 mt-1">{t.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!name.trim()}
                    className="w-full py-3 bg-rook-600 hover:bg-rook-500 text-white rounded-lg transition disabled:opacity-50"
                  >
                    Next: Configure →
                  </button>
                </div>
              )}

              {/* Step 2: Model & Region */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-dark-400 mb-2">AI Model 🤖</label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rook-500"
                    >
                      <option value="google/gemini-flash-1.5-free">Gemini Flash 1.5 (Free) ⚡</option>
                      <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free) 🦙</option>
                      <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free) 🌀</option>
                      <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo 💰</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-dark-400 mb-2">Region 🌍</label>
                    <div className="space-y-2">
                      {REGIONS.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRegion(r.id)}
                          className={`w-full p-3 rounded-lg border text-left transition ${
                            region === r.id
                              ? 'border-rook-500 bg-rook-500/10 text-white'
                              : 'border-dark-700 text-dark-300 hover:border-dark-600'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-dark-700 text-dark-300 hover:text-white rounded-lg transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-rook-600 hover:bg-rook-500 text-white rounded-lg transition"
                    >
                      Next: Review →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Deploy */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-dark-800 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-white mb-4">Review Your Agent 📋</h3>

                    <div className="flex justify-between">
                      <span className="text-dark-400">Name</span>
                      <span className="text-white">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Template</span>
                      <span className="text-white">
                        {TEMPLATES.find(t => t.id === template)?.icon} {TEMPLATES.find(t => t.id === template)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Model</span>
                      <span className="text-white">{modelId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Region</span>
                      <span className="text-white">
                        {REGIONS.find(r => r.id === region)?.label}
                      </span>
                    </div>

                    <div className="border-t border-dark-700 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-dark-400">
                        <span>💰 Cost:</span>
                        <span className="text-green-400 font-semibold">FREE</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rook-500/10 border border-rook-500/20 rounded-xl p-4">
                    <p className="text-sm text-rook-300">
                      🚀 This will automatically:
                    </p>
                    <ul className="text-sm text-dark-400 mt-2 space-y-1">
                      <li>✅ Create a MongoDB database (if connected)</li>
                      <li>✅ Deploy to Render</li>
                      <li>✅ Set up keep-alive pings (if connected)</li>
                      <li>✅ Configure your AI model</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-dark-700 text-dark-300 hover:text-white rounded-lg transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleDeploy}
                      className="flex-1 py-3 bg-gradient-to-r from-rook-600 to-rook-500 hover:from-rook-500 hover:to-rook-400 text-white font-semibold rounded-lg transition shadow-lg shadow-rook-600/25"
                    >
                      🚀 Deploy Now!
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
