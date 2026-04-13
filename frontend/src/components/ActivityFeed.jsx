'use client';

import { useState, useEffect } from 'react';

const LEVEL_ICONS = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  debug: '🔍'
};

const LEVEL_COLORS = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-dark-400'
};

export default function ActivityFeed({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/dashboard/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Activity Feed 📋</h3>
        <div className="text-dark-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Activity Feed 📋</h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-dark-400">No activity yet ✨</p>
          <p className="text-dark-500 text-sm mt-1">Deploy an agent to see activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition"
            >
              <span className="text-sm mt-0.5">{LEVEL_ICONS[activity.level] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{activity.agent}</span>
                  <span className="text-xs text-dark-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm truncate ${LEVEL_COLORS[activity.level] || 'text-dark-300'}`}>
                  {activity.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
