import useDataFetcher from "@/src/hooks/useDataFetcher";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import { useEffect } from "react";

export default function ChallengeDisplayer() {
  const { currentQuestion } = useGame();
  const { setUrl, data, isFetching } = useDataFetcher();
  const { setShowLoading } = useLoadingDialog();

  useEffect(() => {
    setUrl(`/api/get-question/${currentQuestion?.hash}`);
  }, [currentQuestion]);

  useEffect(() => {
    console.log(data);
    console.log(currentQuestion);
  }, [data]);

  useEffect(() => {
    console.log(isFetching);
    if (isFetching) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [isFetching]);

  if (data && data?.challenge.text !== null)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <section className="mb-4 rounded-2xl bg-gray-200 p-6">
          <q>{data?.challenge.text}</q>
        </section>
        <h1 className="font-bold">{data?.challenge.prompt}</h1>
      </div>
    );
  else {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="mb-4 font-bold">{data?.challenge.prompt}</h1>
        <figure className="rounded-2xl bg-gray-200 p-6">
          <img
            src={`data:${data?.challenge.image?.type};base64,${data?.challenge.image?.base64}`}
            alt={data?.details}
          />
        </figure>
      </div>
    );
  }
}
