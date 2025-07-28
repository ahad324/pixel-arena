import { useMemo } from "react";
import type { Emoji } from "@custom-types/index";
import { emojiData } from "../data/emojis";

export const useEmojis = () => {
  const groupedEmojis = useMemo(() => {
    if (!emojiData.length) return [];

    const groups: Record<string, Emoji[]> = {};

    emojiData.forEach((emoji) => {
      const groupName = emoji.group
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(emoji);
    });

    return Object.entries(groups).map(([name, emojis]) => ({ name, emojis }));
  }, []); // Empty dependency array as emojiData is a constant import

  // isLoading is always false and error is null as we are using local, reliable data.
  // This maintains the hook's contract with the components using it.
  return { emojis: emojiData, groupedEmojis, isLoading: false, error: null };
};
