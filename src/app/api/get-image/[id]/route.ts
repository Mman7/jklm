import { base64ToBlob } from "@/src/utils/blob_helper";
import { getImage } from "@/src/utils/question_utils";

export function GET(_request: Request, { params }: any): Promise<Response> {
  return new Promise(async (resolve) => {
    const { id } = await params;
    const dataInStore = getImage(id);

    if (!dataInStore || dataInStore === "") {
      resolve(
        new Response(JSON.stringify({ error: "Image not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      );
      return;
    }
    const blob = base64ToBlob(dataInStore);

    blob.arrayBuffer().then((buffer) => {
      const base64 = Buffer.from(buffer).toString("base64");
      resolve(
        new Response(JSON.stringify({ data: base64 }), {
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
  });
}
