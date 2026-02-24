import React from "react";
import useShowAnswer from "../zustands/useShowAnswerStore";

export default function ShowAnswer() {
  const { setShowAnswer, showAnswer } = useShowAnswer();
  return (
    <div className={`${showAnswer ? "block" : "hidden"} flex-3`}>
      <section className="size-full">
        <h1 className="">Show Answer</h1>
      </section>
    </div>
  );
}
