import { useCallback, useState } from 'react';

export const useRevision = (init = 0): [number, () => void] => {
  const [rev, setRev] = useState(init);
  const increment = useCallback(() => setRev((v) => v + 1), []);

  return [rev, increment];
};
