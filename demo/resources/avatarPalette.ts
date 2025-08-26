// Central avatar palette for emoji-based elder avatars
// Each entry includes the emoji char and a soft pastel background
export type EmojiAvatar = { char: string; bg: string };

export const EMOJI_AVATARS: EmojiAvatar[] = [
  { char: "👵🏻", bg: "#FDE2C8" },
  { char: "👴🏻", bg: "#FFE3D3" },
  { char: "👩🏻‍🦳", bg: "#E6F1FF" },
  { char: "👨🏻‍🦳", bg: "#E8ECFF" },
  { char: "👵🏽", bg: "#FFE9B5" },
  { char: "👴🏽", bg: "#E2F7D9" },
  { char: "👩🏻‍🦱", bg: "#FFE4F1" },
  { char: "👨🏻‍🦲", bg: "#F1E4FF" },
];

export const EMOJI_NAME_PRESETS: Record<string, string> = {
  "👵🏻": "Grandma Mae",
  "👵🏽": "Grandma Mae",
  "👩🏻‍🦳": "Grandma Mae",
  "👩🏻‍🦱": "Grandma Mae",
  "👴🏻": "Grandpa Joe",
  "👴🏽": "Grandpa Joe",
  "👨🏻‍🦳": "Grandpa Joe",
  "👨🏻‍🦲": "Grandpa Joe",
};

export function getEmojiBg(emoji: string): string {
  return EMOJI_AVATARS.find((e) => e.char === emoji)?.bg || "#EEE";
}
