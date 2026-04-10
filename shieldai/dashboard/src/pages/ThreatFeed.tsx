import { useState, useEffect, useRef } from 'react';

interface ThreatEvent {
  id: string;
  request_id: string;
  verdict: string;
  risk_score: number;
  category: string | null;
  type: 'input' | 'output' | 'guard';
  timestamp: string;
}

export default function ThreatFeed() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3000/ws/threats`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ThreatEvent;
          setEvents((prev) => [data, ...prev].slice(0, 200)); // Keep last 200
        } catch {
          // Ignore invalid messages
        }
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.verdict === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Threat Feed</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time scan activity stream</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${connected ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5"
          >
            <option value="all">All</option>
            <option value="block">Blocked</option>
            <option value="flag">Flagged</option>
            <option value="pass">Passed</option>
          </select>
        </div>
      </div>

      <div ref={feedRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {connected ? 'Waiting for scan events...' : 'Connecting to threat feed...'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.verdict === 'block'
                      ? 'bg-red-500'
                      : event.verdict === 'flag'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{event.request_id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        event.verdict === 'block'
                          ? 'bg-red-100 text-red-700'
                          : event.verdict === 'flag'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {event.verdict.toUpperCase()}
                    </span>
                    {event.category && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700">
                        {event.category}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-medium text-gray-700">
                    {(event.risk_score * 100).toFixed(0)}%
                  </span>
                  <p className="text-[10px] text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
