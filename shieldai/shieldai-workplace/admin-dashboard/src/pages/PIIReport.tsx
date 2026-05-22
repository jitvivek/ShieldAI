export default function PIIReport() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">PII Detection Report</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['Aadhaar', 'PAN', 'Credit Card', 'Phone', 'Email', 'UPI', 'IFSC'].map((type) => (
            <div key={type} className="border rounded p-3 text-center">
              <div className="text-2xl font-bold text-teal-600">0</div>
              <div className="text-sm text-gray-500">{type}</div>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold mb-3">Recent Detections</h2>
        <p className="text-gray-500 text-sm">No PII detections recorded yet.</p>
      </div>
    </div>
  );
}
