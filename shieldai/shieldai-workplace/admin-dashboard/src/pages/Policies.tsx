import { useState } from 'react';
import PolicyEditor from '../components/PolicyEditor';

export default function Policies() {
  const [yaml, setYaml] = useState(`name: default
org_type: general
policies:
  - name: block_sensitive_pii
    action: block
    detector: pii_scanner
    patterns: [aadhaar, pan, credit_card]
    message: "Sharing sensitive identifiers with AI bots is blocked."
`);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Policy Configuration</h1>
      <PolicyEditor value={yaml} onChange={setYaml} />
    </div>
  );
}
