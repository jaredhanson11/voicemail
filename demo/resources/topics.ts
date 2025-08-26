export type Subtopic = {
  id: string;
  title: string;
  // If using remote URL (legacy) keep audioUri optional
  audioUri?: string;
  // Preferred: index into local bundled sample list
  audioLocalIndex?: number;
  durationSeconds?: number;
};
export type Topic = { id: string; label: string; subtopics: Subtopic[] };

// Reusable sample 20s (approx) audio clip URIs (placeholder public domain / free sounds)
// In a production app you would bundle local assets (e.g. require("@/assets/audio/sample1.mp3"))
// or upload user-generated recordings. For now we rotate these three.
// We will use three locally bundled audio samples (see resources/audioSamples.ts)
// Keep the shape so we can still fallback to remote if needed.
const LOCAL_SAMPLE_COUNT = 3;
const SAMPLE_DURATION = 20; // seconds (display only)

export const TOPICS: Topic[] = [
  {
    id: "encouragement",
    label: "Words of Encouragement",
    subtopics: [
      "Facing a difficult challenge",
      "Starting something new",
      "Feeling overwhelmed",
      "Lacking confidence",
      "Going through a tough time",
      "Before a big decision",
      "When you're scared",
      "Pushing through obstacles",
    ].map((t, i) => ({
      id: `enc_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "comfort",
    label: "Comfort & Support",
    subtopics: [
      "When you're sad",
      "After a loss or disappointment",
      "Feeling lonely",
      "Having a bad day",
      "When you're worried",
      "Dealing with stress",
      "Missing someone",
      "Need a shoulder to cry on",
    ].map((t, i) => ({
      id: `com_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "success",
    label: "Celebrating Success",
    subtopics: [
      "Got a promotion",
      "Graduated or finished school",
      "Reached a personal goal",
      "Overcame a fear",
      "Made someone proud",
      "Small daily wins",
      "Big life milestones",
      "Personal achievements",
    ].map((t, i) => ({
      id: `suc_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "wisdom",
    label: "Life Wisdom",
    subtopics: [
      "About relationships",
      "Making important choices",
      "Learning from mistakes",
      "Growing older gracefully",
      "Finding your purpose",
      "Dealing with change",
      "What really matters",
      "Family advice",
    ].map((t, i) => ({
      id: `wis_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "reminders",
    label: "Daily Reminders",
    subtopics: [
      "Morning motivation",
      "End of day reflection",
      "Remember to take care of yourself",
      "You are loved",
      "Stay positive today",
      "Don't forget to smile",
      "Take it one day at a time",
      "Evening comfort",
    ].map((t, i) => ({
      id: `rem_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "love",
    label: "Love & Affection",
    subtopics: [
      "Just because I love you",
      "Thinking of you",
      "You make me proud",
      "Missing you",
      "Sweet dreams",
      "Good morning sunshine",
      "You're special to me",
      "Family bond messages",
    ].map((t, i) => ({
      id: `lov_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "holidays",
    label: "Holiday & Special Occasions",
    subtopics: [
      "Birthday wishes",
      "Christmas/holiday greetings",
      "Anniversary messages",
      "Mother's/Father's Day",
      "Thanksgiving gratitude",
      "New Year encouragement",
      "Special memories we shared",
      "Tradition reminders",
    ].map((t, i) => ({
      id: `hol_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
  {
    id: "practical",
    label: "Practical Life Advice",
    subtopics: [
      "About money and savings",
      "Career guidance",
      "Health reminders",
      "Home and family tips",
      "Relationship advice",
      "Being a good person",
      "Learning and growing",
      "Making good choices",
    ].map((t, i) => ({
      id: `pra_${i}`,
      title: t,
      audioLocalIndex: i % LOCAL_SAMPLE_COUNT,
      durationSeconds: SAMPLE_DURATION,
    })),
  },
];

export function getTopicById(id?: string) {
  return TOPICS.find((t) => t.id === id);
}
