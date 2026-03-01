import rawAnswerMap from "../../public/data/answers_pairs.json" with { type: "json" };

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

const containsWholeWord = (text: string, word: string): boolean => {
  const index = text.indexOf(word);
  if (index === -1) return false;

  const leftBoundary = index === 0 || text[index - 1] === " ";
  const rightIndex = index + word.length;
  const rightBoundary = rightIndex === text.length || text[rightIndex] === " ";

  return leftBoundary && rightBoundary;
};

const answerMap: AnswerMap = Object.fromEntries(
  Object.entries(rawAnswerMap as AnswerMap).map(([hash, answer]) => [
    hash,
    normalize(answer),
  ]),
);

const compareAnswer = (
  answerInStore: string,
  submitAnswer: string,
): boolean => {
  if (!answerInStore || !submitAnswer || !submitAnswer.trim()) {
    return false;
  }

  const normalizedStore = answerInStore;
  const normalizedSubmit = normalize(submitAnswer);

  if (normalizedStore === normalizedSubmit) {
    return true;
  }

  return containsWholeWord(normalizedSubmit, normalizedStore);
};

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
    const isCorrect = compareAnswer(expectedAnswer, answerSubmit);

    if (!isCorrect) {
      return new Response(JSON.stringify({ correct: false }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const internalApiUrl = new URL("/api/answer-validation", request.url);

    const functionResponse = await fetch(internalApiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
