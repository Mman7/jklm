import { getQuestions } from "@/src/utils/question_utils";

type BatchQuestionRequest = {
  hashes: string[];
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as BatchQuestionRequest;
    const hashes = Array.isArray(body?.hashes)
      ? body.hashes.filter(
          (hash) => typeof hash === "string" && hash.length > 0,
        )
      : [];

    if (hashes.length === 0) {
      return new Response(
        JSON.stringify({ error: "No question hashes provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const questions = await getQuestions(hashes);

    return new Response(JSON.stringify(questions), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to load questions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
