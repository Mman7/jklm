import { useEffect } from "react";
import { getRoom } from "../library/client/client";
import useLoadingDialog from "../zustands/useLoadingStore";
import { useParams, useRouter } from "next/navigation";
import useRoom from "../zustands/useRoomStore";
import useQuestion from "../zustands/useQuestionStore";

export default function useRoomInitializer() {
  const { setShowLoading } = useLoadingDialog();
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "";
  const { setRoom } = useRoom();
  const { setQuestionList } = useQuestion();

  useEffect(() => {
    const loadRoom = async () => {
      setShowLoading(true);
      try {
        await getRoom(roomId).then((res) => {
          setRoom(res);
          setQuestionList(res?.questionList || []);
        });
      } catch {
        // handle room not found
        router.push("/");
      } finally {
        setShowLoading(false);
      }
    };

    loadRoom();
  }, []);
  return {};
}
