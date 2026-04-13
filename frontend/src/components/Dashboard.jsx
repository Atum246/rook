'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import AgentCard from './AgentCard';
import DeployModal from './DeployModal';
import ChatPanel from './ChatPanel';
import ActivityFeed from './ActivityFeed';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const [overviewRes, agentsRes] = await Promise.all([
        fetch('/api/dashboard/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard/agents', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const overviewData = await overviewRes.json();
      const agentsData = await agentsRes.json();

      setOverview(overviewData.overview);
      setAgents(agentsData.agents || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (agentId) => {
    try {
      await fetch(`/api/agents/${agentId}/restart`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (agentId) => {
    if (!confirm('Are you sure? This will delete the agent and all its resources. 🗑️')) return;
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = (agent) => {
    setSelectedAgent(agent);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">♜</div>
          <p className="text-dark-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♜</span>
            <span className="text-xl font-bold bg-gradient-to-r from-rook-400 to-rook-600 bg-clip-text text-transparent">
              Rook
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-dark-400 text-sm">
              Hey, {user?.name} 👋
            </span>
            <button
              onClick={logout}
              className="text-sm text-dark-400 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
              <div className="text-dark-400 text-sm mb-1">Total Agents</div>
              <div className="text-2xl font-bold text-white">
                {overview.totalAgents} 🤖
              </div>
            </div>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
              <div className="text-dark-400 text-sm mb-1">Online</div>
              <div className="text-2xl font-bold text-green-400">
                {overview.online} 🟢
              </div>
            </div>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
              <div className="text-dark-400 text-sm mb-1">Messages</div>
              <div className="text-2xl font-bold text-white">
                {overview.totalMessages} 💬
              </div>
            </div>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
              <div className="text-dark-400 text-sm mb-1">Uptime</div>
              <div className="text-2xl font-bold text-rook-400">
                {overview.avgUptime?.toFixed(1)}% ⚡
              </div>
            </div>
          </div>
        )}

        {/* Agents Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            My Agents 🤖
          </h2>
          <button
            onClick={() => setShowDeploy(true)}
            disabled={agents.length >= (overview?.agentLimit || 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rook-600 to-rook-500 hover:from-rook-500 hover:to-rook-400 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rook-600/20"
          >
            <span>+</span> Deploy Agent
          </button>
        </div>

        {/* Agent Grid */}
        {agents.length === 0 ? (
          <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No agents yet
            </h3>
            <p className="text-dark-400 mb-6">
              Deploy your first agent and bring it to life! ✨
            </p>
            <button
              onClick={() => setShowDeploy(true)}
              className="px-6 py-3 bg-gradient-to-r from-rook-600 to-rook-500 hover:from-rook-500 hover:to-rook-400 text-white rounded-lg transition shadow-lg shadow-rook-600/20"
            >
              Deploy Your First Agent 🚀
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRestart={handleRestart}
                onDelete={handleDelete}
                onChat={handleChat}
              />
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <div className="mt-8">
          <ActivityFeed token={token} />
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeploy && (
        <DeployModal
          token={token}
          onClose={() => setShowDeploy(false)}
          onDeployed={() => {
            setShowDeploy(false);
            fetchDashboard();
          }}
        />
      )}

      {/* Chat Panel */}
      {showChat && selectedAgent && (
        <ChatPanel
          token={token}
          agent={selectedAgent}
          onClose={() => { setShowChat(false); setSelectedAgent(null); }}
        />
      )}
    </div>
  );
}
