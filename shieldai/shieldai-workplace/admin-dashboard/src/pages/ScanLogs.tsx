import ScanTable from '../components/ScanTable';

export default function ScanLogs() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Scan Logs</h1>
      <ScanTable logs={[]} />
    </div>
  );
}
