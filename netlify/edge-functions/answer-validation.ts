import rawAnswerMap from "../../public/data/answers_pairs.json" with { type: "json" };
import { AnswerComparator } from "../../src/utils/answer_comparator";
import _ from "lodash";
import ky from "ky";

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

const answerMap: AnswerMap = _.mapValues(rawAnswerMap as AnswerMap, (answer) =>
  normalize(answer),
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

    const functionResponse = await ky.post(internalApiUrl.toString(), {
      json: payload,
      headers: {
        "x-answer-prevalidated": "true",
      },
      throwHttpErrors: false,
    });

    return new Response(functionResponse.body, {
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
