import { useState, useRef, useCallback } from 'react';

export interface UseAsyncActionOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  lockDurationMs?: number;
}

export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: UseAsyncActionOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const isExecutingRef = useRef(false);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      // Synchronous guard against rapid double clicks
      if (isExecutingRef.current) {
        return undefined;
      }

      isExecutingRef.current = true;
      setLoading(true);

      try {
        const result = await asyncFn(...args);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        options.onError?.(err);
        throw err;
      } finally {
        setTimeout(() => {
          isExecutingRef.current = false;
        }, options.lockDurationMs || 300);
        setLoading(false);
      }
    },
    [asyncFn, options]
  );

  return {
    execute,
    loading,
    isExecutingRef,
  };
}

export default useAsyncAction;
