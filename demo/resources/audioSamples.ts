// Local bundled 20s sample audio clips.
// Replace these placeholder files with real 20 second .m4a assets.
// Ensure the referenced files exist in assets/audio/.
// Example: place sample1.m4a, sample2.m4a, sample3.m4a in demo/assets/audio/

export const audioSamples: any[] = [require("@/assets/audio/sample1.m4a")];

export const missingSomeoneAudio = require("@/assets/audio/missing_someone.mp3");
export const oneDayAtATimeAudio = require("@/assets/audio/one_day_at_a_time.mp3");
export const promotionAudio = require("@/assets/audio/promotion.mp3");

export function getLocalSample(index?: number) {
  if (index === undefined || index === null) return undefined;
  return audioSamples[index % audioSamples.length];
}

export function getAudio(subtopic: string) {
  if (subtopic === "Missing someone") {
    return missingSomeoneAudio;
  } else if (subtopic === "Take it one day at a time") {
    return oneDayAtATimeAudio;
  } else if (subtopic === "Got a promotion") {
    return promotionAudio;
  } else {
    return audioSamples[0];
  }
}
