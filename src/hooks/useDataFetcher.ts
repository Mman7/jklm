import { useEffect, useState } from "react";
import { Question } from "../types/question";

export default function useDataFetcher() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<Question | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (url === "") return;
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(url);
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error as Error);
        console.error("Error fetching data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [url]);

  return { url, setUrl, data, error, isFetching };
}
