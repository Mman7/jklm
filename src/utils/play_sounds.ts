"use client";

// play sounds
export enum SoundOptions {
  Correct = "correct",
}

const Sounds = {
  [SoundOptions.Correct]: "/sfx/correct.mp3",
};

export const playSound = (sound: SoundOptions) => {
  const audio = new Audio(Sounds[sound]);
  audio.play();
};
