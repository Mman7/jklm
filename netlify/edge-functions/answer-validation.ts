import rawAnswerMap from "../../public/data/answers_pairs.json" with { type: "json" };
import { AnswerComparator } from "../../src/utils/answer_comparator";
// Avoid importing `lodash` in edge functions (experimental support).
// Use a small native transformation instead to keep the bundle minimal.

interface EdgeContext {
  requestId?: string;
}

interface AnswerValidationRequest {
  playerId: string;
  roomId: string;
  questionHash: string;
  answerSubmit: string;
}

type AnswerMap = Record<string, string>;

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const answerMap: AnswerMap = Object.fromEntries(
  Object.entries(rawAnswerMap as AnswerMap).map(([k, v]) => [k, normalize(String(v))]),
);

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

    const expectedAnswer = answerMap[questionHash] || "";
    // Use the shared comparator to check correctness.
    const isCorrect = AnswerComparator(expectedAnswer, answerSubmit);

    // If the answer is incorrect, we can return early without invoking the internal API.
    if (!isCorrect) {
      return new Response(JSON.stringify({ correct: false }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // For correct answers, we call the internal API to handle scoring and notifications.
    const internalApiUrl = new URL("/api/answer-validation", request.url);

    // Use the native fetch API in edge runtime instead of `ky` to avoid
    // bundling unsupported npm modules into the edge function.
    const functionResponse = await fetch(internalApiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-answer-prevalidated": "true",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await functionResponse.text();
    return new Response(responseText, {
      status: functionResponse.status,
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
