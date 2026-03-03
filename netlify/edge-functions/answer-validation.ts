import { validateAnswerSubmission } from "../../src/library/server/answer_validation";
import type { AnswerValidationRequest } from "../../src/types/answer_validation";

interface EdgeContext {
  requestId?: string;
}

export default async function answerValidation(
  request: Request,
  _context: EdgeContext,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const payload = (await request.json()) as AnswerValidationRequest;
    const { questionHash, answerSubmit } = payload;

    if (!questionHash || typeof answerSubmit !== "string") {
      return new Response(JSON.stringify({ error: "Missing request body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const response = await validateAnswerSubmission(payload);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to validate answer" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
