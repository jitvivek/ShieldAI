const STATS = [
  { value: '< 50ms', label: 'Avg Latency' },
  { value: '99.2%', label: 'Detection Rate' },
  { value: '12+', label: 'Languages' },
  { value: '200+', label: 'Detection Rules' },
  { value: '0.3%', label: 'False Positive Rate' },
];

export default function StatsBanner() {
  return (
    <section className="border-y bg-gray-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6 text-center">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-bold text-shield-700">{s.value}</div>
            <div className="mt-1 text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
