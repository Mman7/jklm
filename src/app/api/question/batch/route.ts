import { getQuestions } from "@/src/utils/question_utils";

type BatchQuestionRequest = {
  hashes: string[];
  questionDurationSeconds?: number;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as BatchQuestionRequest;
    const parsedQuestionDurationSeconds = Number(body?.questionDurationSeconds);
    const questionDurationSeconds =
      Number.isFinite(parsedQuestionDurationSeconds) &&
      parsedQuestionDurationSeconds >= 5 &&
      parsedQuestionDurationSeconds <= 180
        ? Math.trunc(parsedQuestionDurationSeconds)
        : 20;
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

    const questions = await getQuestions(hashes, questionDurationSeconds);

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
