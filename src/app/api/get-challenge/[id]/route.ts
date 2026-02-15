import { Challenge } from "@/src/types/question";
import { base64ToBlob } from "@/src/utils/blob_helper";
import { getChallenge } from "@/src/utils/question_utils";

export function GET(_request: Request, { params }: any): Promise<Response> {
  return new Promise(async (resolve) => {
    const { id } = await params;
    const challenge: Challenge | null = await getChallenge(id);

    // ? investigate send blob base64 image or pure json base64

    // const blob = base64ToBlob(challenge!.image!.base64);
    // blob.arrayBuffer().then((buffer) => {
    // });
    resolve(
      new Response(JSON.stringify(challenge), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
}
