interface PolicyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PolicyEditor({ value, onChange }: PolicyEditorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">YAML Policy Editor</h2>
        <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm">
          Save Policy
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 font-mono text-sm border rounded p-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        spellCheck={false}
      />
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <strong>Live Preview:</strong> Policy has {value.split('\n').filter((l) => l.includes('- name:')).length} rules defined.
      </div>
    </div>
  );
}
