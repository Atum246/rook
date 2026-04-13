'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

// ─── Icons ───────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ConnectIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const SERVICES = [
  {
    key: 'openrouter',
    icon: '🤖',
    name: 'OpenRouter',
    description: 'AI model provider — the brain of your agent',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'sk-or-...' }
    ],
    helpUrl: 'https://openrouter.ai/keys'
  },
  {
    key: 'render',
    icon: '🚀',
    name: 'Render',
    description: 'Cloud hosting — where your agent lives',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'rnd_...' }
    ],
    helpUrl: 'https://dashboard.render.com/u/settings#api-keys'
  },
  {
    key: 'mongodb',
    icon: '🗄️',
    name: 'MongoDB Atlas',
    description: 'Database — your agent\'s long-term memory',
    fields: [
      { key: 'publicKey', label: 'Public Key', placeholder: 'Atlas public key' },
      { key: 'privateKey', label: 'Private Key', placeholder: 'Atlas private key' },
      { key: 'projectId', label: 'Project ID', placeholder: 'Atlas project ID' },
      { key: 'orgId', label: 'Org ID (optional)', placeholder: 'Atlas org ID' }
    ],
    helpUrl: 'https://cloud.mongodb.com/v2#/account/publicApi'
  },
  {
    key: 'cronjob',
    icon: '⏰',
    name: 'Cron-job.org',
    description: 'Keep-alive — prevents your agent from sleeping',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Cron-job API key' }
    ],
    helpUrl: 'https://console.cron-job.org/settings'
  }
];

export default function SetupWizard() {
  const { token, updateUser } = useAuth();
  const [connections, setConnections] = useState({});
  const [activeService, setActiveService] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/auth/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConnections(data.connections);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (serviceKey) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/auth/connect/${serviceKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formValues)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`${data.message}`);
      setActiveService(null);
      setFormValues({});
      await fetchConnections();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = Object.values(connections).filter(c => c.connected).length;
  const totalCount = SERVICES.length;
  const allRequired = connections.openrouter?.connected && connections.render?.connected;

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Connect Your Services 🔗
          </h1>
          <p className="text-dark-400">
            Link your accounts to start deploying agents
          </p>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-dark-400">{connectedCount}/{totalCount} connected</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-dark-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-rook-600 to-rook-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(connectedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
            {success}
          </div>
        )}

        {/* Service Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {SERVICES.map((service) => {
            const isConnected = connections[service.key]?.connected;
            const isActive = activeService === service.key;

            return (
              <div
                key={service.key}
                className={`bg-dark-900 border rounded-xl p-6 transition-all duration-200 ${
                  isConnected
                    ? 'border-green-500/30 bg-green-500/5'
                    : isActive
                    ? 'border-rook-500/50 shadow-lg shadow-rook-500/10'
                    : 'border-dark-800 hover:border-dark-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-sm text-dark-400">{service.description}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full">
                      <CheckIcon /> Connected
                    </span>
                  ) : (
                    <span className="text-dark-500 text-sm bg-dark-800 px-2 py-1 rounded-full">
                      Not connected
                    </span>
                  )}
                </div>

                {!isConnected && !isActive && (
                  <button
                    onClick={() => setActiveService(service.key)}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-white rounded-lg transition"
                  >
                    <ConnectIcon /> Connect
                  </button>
                )}

                {/* Connection Form */}
                {isActive && !isConnected && (
                  <div className="mt-4 space-y-3">
                    {service.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs text-dark-400 mb-1">{field.label}</label>
                        <input
                          type="password"
                          value={formValues[field.key] || ''}
                          onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-600 focus:outline-none focus:border-rook-500"
                        />
                      </div>
                    ))}

                    <div className="flex gap-2 mt-4">
                      <a
                        href={service.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 text-sm text-dark-400 hover:text-white border border-dark-700 rounded-lg transition"
                      >
                        Get API Key 🔗
                      </a>
                      <button
                        onClick={() => handleConnect(service.key)}
                        disabled={loading}
                        className="flex-1 py-2 text-sm bg-rook-600 hover:bg-rook-500 text-white rounded-lg transition disabled:opacity-50"
                      >
                        {loading ? 'Connecting...' : 'Save ♜'}
                      </button>
                      <button
                        onClick={() => { setActiveService(null); setFormValues({}); setError(''); }}
                        className="py-2 px-3 text-sm text-dark-400 hover:text-white transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        {allRequired && (
          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 bg-gradient-to-r from-rook-600 to-rook-500 hover:from-rook-500 hover:to-rook-400 text-white font-semibold rounded-xl shadow-lg shadow-rook-600/25 transition-all duration-200"
            >
              Continue to Dashboard → 🚀
            </button>
            <p className="text-dark-500 text-sm mt-2">
              {connections.mongodb?.connected && connections.cronjob?.connected
                ? '✨ All services connected! Full power mode!'
                : '⚡ MongoDB & Cron-job are optional but recommended'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
