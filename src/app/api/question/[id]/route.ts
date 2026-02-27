import { getQuestion } from "@/src/utils/question_utils";

export async function GET(
  _request: Request,
  { params }: any,
): Promise<Response> {
  try {
    const { id } = await params;
    const question = await getQuestion(id);

    if (!question) {
      return new Response(JSON.stringify({ error: "Question not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(question), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to load question" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
