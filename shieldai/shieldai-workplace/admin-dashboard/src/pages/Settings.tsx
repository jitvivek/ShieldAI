export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Integration Settings</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Microsoft Teams</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bot Endpoint</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">/api/teams/messages</code>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Slack</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Socket Mode</span>
              <span className="text-gray-600">Enabled</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Bot Configuration</h2>
          <p className="text-gray-500 text-sm mb-3">No bots configured. Add AI bot user IDs to enable scanning.</p>
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm">
            Add Bot
          </button>
        </div>
      </div>
    </div>
  );
}
