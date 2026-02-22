'use client';
import { useState } from 'react';
import { DELAY_OPTIONS, DelayOption } from '../config/company';

interface DelayUpdateProps {
  jobId: string;
  currentDelay?: number;
  onUpdate: (jobId: string, delay: number) => Promise<void>;
}

export function DelayUpdate({ jobId, currentDelay = 0, onUpdate }: DelayUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState<DelayOption | 0>(currentDelay as DelayOption | 0);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(jobId, selectedDelay);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <select
        value={selectedDelay}
        onChange={(e) => setSelectedDelay(Number(e.target.value) as DelayOption | 0)}
        disabled={isUpdating}
        style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.9rem', cursor: 'pointer' }}
      >
        <option value={0}>No Delay</option>
        {DELAY_OPTIONS.map((d) => (
          <option key={d} value={d}>{d} mins</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        style={{ padding: '0.4rem 1rem', backgroundColor: isUpdating ? '#9CA3AF' : '#D97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', cursor: isUpdating ? 'not-allowed' : 'pointer', fontWeight: '600' }}
      >
        {isUpdating ? 'Updating...' : 'Set Delay'}
      </button>
    </div>
  );
}
