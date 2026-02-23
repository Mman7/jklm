import { getQuestion } from "@/src/utils/question_utils";

export function GET(_request: Request, { params }: any): Promise<Response> {
  return new Promise(async (resolve) => {
    const { id } = await params;
    const question = await getQuestion(id);

    // ? investigate send blob base64 image or pure json base64

    // const blob = base64ToBlob(challenge!.image!.base64);
    // blob.arrayBuffer().then((buffer) => {
    // });
    resolve(
      new Response(JSON.stringify(question), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
}
