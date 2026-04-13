'use client';

const STATUS_COLORS = {
  live: 'bg-green-400',
  deploying: 'bg-yellow-400',
  error: 'bg-red-400',
  sleeping: 'bg-blue-400',
  stopped: 'bg-dark-500'
};

const STATUS_LABELS = {
  live: '🟢 Live',
  deploying: '🟡 Deploying...',
  error: '🔴 Error',
  sleeping: '💤 Sleeping',
  stopped: '⏹️ Stopped'
};

const HEALTH_CLASSES = {
  healthy: 'status-healthy',
  degraded: 'status-degraded',
  unhealthy: 'status-unhealthy',
  unknown: ''
};

const TEMPLATE_ICONS = {
  'personal-assistant': '🤖',
  'customer-support': '💼',
  'code-helper': '👨‍💻',
  'custom': '🛠️'
};

export default function AgentCard({ agent, onRestart, onDelete, onChat }) {
  return (
    <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">
              {TEMPLATE_ICONS[agent.template] || '🤖'}
            </span>
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${STATUS_COLORS[agent.status]} ${HEALTH_CLASSES[agent.health]}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <p className="text-xs text-dark-400">
              {STATUS_LABELS[agent.status]}
            </p>
          </div>
        </div>

        {/* Keep-alive indicator */}
        {agent.keepAlive && (
          <span className="text-xs bg-rook-500/10 text-rook-400 px-2 py-1 rounded-full">
            ⏰ Always on
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-dark-800/50 rounded-lg">
          <div className="text-sm font-semibold text-white">{agent.messages}</div>
          <div className="text-xs text-dark-400">Messages</div>
        </div>
        <div className="text-center p-2 bg-dark-800/50 rounded-lg">
          <div className="text-sm font-semibold text-white">{agent.uptime?.toFixed(0)}%</div>
          <div className="text-xs text-dark-400">Uptime</div>
        </div>
        <div className="text-center p-2 bg-dark-800/50 rounded-lg">
          <div className="text-sm font-semibold text-white">
            {agent.model?.split('/')[1]?.replace('-', ' ').slice(0, 10) || 'free'}
          </div>
          <div className="text-xs text-dark-400">Model</div>
        </div>
      </div>

      {/* Messaging badges */}
      <div className="flex gap-1 mb-4">
        {agent.messaging?.telegram && (
          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">📱 Telegram</span>
        )}
        {agent.messaging?.whatsapp && (
          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">💬 WhatsApp</span>
        )}
        {agent.messaging?.discord && (
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">🎮 Discord</span>
        )}
      </div>

      {/* URL */}
      {agent.url && (
        <div className="mb-4">
          <a
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dark-500 hover:text-rook-400 transition truncate block"
          >
            🔗 {agent.url}
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {agent.status === 'live' && (
          <button
            onClick={() => onChat(agent)}
            className="flex-1 py-2 text-sm bg-rook-600/20 text-rook-400 hover:bg-rook-600/30 rounded-lg transition"
          >
            💬 Chat
          </button>
        )}
        {agent.url && (
          <a
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 text-sm bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition text-center"
          >
            🌐 Open
          </a>
        )}
        <button
          onClick={() => onRestart(agent.id)}
          className="py-2 px-3 text-sm bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition"
        >
          🔄
        </button>
        <button
          onClick={() => onDelete(agent.id)}
          className="py-2 px-3 text-sm bg-dark-800 text-dark-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
