import { useEffect, useState } from "react";

function useLoadData<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Request failed (${response.status}).`);
        }

        const records = (await response.json()) as T[];
        if (!Array.isArray(records)) {
          throw new Error("The server did not return a list.");
        }

        if (active) {
          setData(records);
        }
      } catch {
        if (active) {
          setHasError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [url, reloadCount]);

  function retry() {
    setIsLoading(true);
    setHasError(false);
    setReloadCount((count) => count + 1);
  }

  return { data, setData, isLoading, hasError, retry };
}

export default useLoadData;
