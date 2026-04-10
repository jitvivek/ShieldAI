import PlaygroundForm from '../components/PlaygroundForm';

export default function Playground() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Playground</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test prompts against the ShieldAI detection engine in real-time
        </p>
      </div>
      <PlaygroundForm />
    </div>
  );
}
