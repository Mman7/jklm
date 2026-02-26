import { findAnswer } from "@/src/utils/question_utils";

export async function GET(_request: Request, { params }: any) {
  const { id } = await params;
  const question = await findAnswer(id);

  return new Response(JSON.stringify(question), {
    headers: { "Content-Type": "application/json" },
  });
}
