import useDataFetcher from "@/src/hooks/useDataFetcher";
import useGame from "@/src/zustands/useGameStore";
import useLoadingDialog from "@/src/zustands/useLoadingStore";
import { useEffect } from "react";

export default function ChallengeDisplayer() {
  const { currentQuestionHash, setCurrentQuestion } = useGame();
  const { setUrl, data, isFetching } = useDataFetcher();
  const { setShowLoading } = useLoadingDialog();

  useEffect(() => {
    if (!currentQuestionHash) return;
    setUrl(`/api/question/${currentQuestionHash?.hash}`);
  }, [currentQuestionHash]);

  useEffect(() => {
    if (data) setCurrentQuestion(data);
  }, [data]);

  useEffect(() => {
    if (isFetching) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [isFetching]);

  // return loading
  if (!data)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="font-bold">Loading...</h1>
      </div>
    );

  if (data && data?.challenge.text !== null)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="mb-2 font-bold">{data?.challenge.prompt}</h1>
        <section className="rounded-2xl bg-gray-200 p-6">
          <q>{data?.challenge.text}</q>
        </section>
      </div>
    );
  else {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <h1 className="mb-2 text-xl font-bold">{data?.challenge.prompt}</h1>
        <figure className="rounded-2xl">
          <img
            className="max-w-100"
            src={`data:${data?.challenge.image?.type};base64,${data?.challenge.image?.base64}`}
            alt={data?.details}
          />
        </figure>
      </div>
    );
  }
}
