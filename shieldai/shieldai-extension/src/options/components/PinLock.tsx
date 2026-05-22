import { useState } from 'react';

interface Props {
  onVerify: (pin: string) => boolean;
  children: React.ReactNode;
}

export function PinLock({ onVerify, children }: Props) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(pin)) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <span className="text-4xl mb-4">🔒</span>
      <p className="text-sm text-gray-600 mb-4">Enter PIN to access parental controls</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
          className="w-24 text-center border border-gray-300 rounded-lg px-3 py-2 text-lg tracking-widest"
        />
        <button type="submit" className="bg-shield-safe text-white px-4 py-2 rounded-lg text-sm">
          Unlock
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2">Incorrect PIN</p>}
    </div>
  );
}
