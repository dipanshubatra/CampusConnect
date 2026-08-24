// =============================================================================
// Service: meetingApi
// Issue: #1993 - Wire ReactionSummaryCard on Meeting Details
// Description: API service for fetching meeting reaction summaries from Supabase.
// Provides getReactionSummary for post-meeting analytics and live reaction counts.
// =============================================================================

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReactionEmoji {
  emoji: string;
  label: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  users: string[];
}

export interface ReactionSummary {
  eventId: string;
  totalReactions: number;
  reactions: ReactionCount[];
  topEmoji: string | null;
  uniqueUsers: number;
  generatedAt: string;
}

export interface MeetingReactionRow {
  id: string;
  event_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Supported reaction emojis (matches post_reactions pattern)
// ---------------------------------------------------------------------------

export const MEETING_REACTIONS: ReactionEmoji[] = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "🎉", label: "Celebrate" },
];

// ---------------------------------------------------------------------------
// meetingApi
// ---------------------------------------------------------------------------

export const meetingApi = {
  /**
   * Fetch the reaction summary for a specific meeting/event.
   * Returns aggregated counts per emoji, total reactions, top emoji, and unique user count.
   * Gracefully handles missing table or empty data.
   */
  async getReactionSummary(eventId: string): Promise<ReactionSummary> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("meeting_reactions")
        .select("id, event_id, user_id, emoji, created_at")
        .eq("event_id", eventId);

      // If table doesn't exist or query fails, return empty summary
      if (error) {
        console.warn("[meetingApi] Could not fetch reactions:", error.message);
        return emptySummary(eventId);
      }

      const rows = (data as MeetingReactionRow[]) || [];
      return aggregateReactions(eventId, rows);
    } catch (err) {
      console.warn("[meetingApi] Unexpected error fetching reactions:", err);
      return emptySummary(eventId);
    }
  },

  /**
   * Record a reaction for a meeting/event.
   * Uses upsert to allow toggling — if the user already reacted with this emoji, remove it.
   */
  async toggleReaction(
    eventId: string,
    userId: string,
    emoji: string,
  ): Promise<{ added: boolean }> {
    const supabase = createClient();

    try {
      // Check if reaction already exists
      const { data: existing } = await supabase
        .from("meeting_reactions")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .eq("emoji", emoji)
        .maybeSingle();

      if (existing) {
        // Remove existing reaction (toggle off)
        await supabase.from("meeting_reactions").delete().eq("id", existing.id);
        return { added: false };
      }

      // Add new reaction
      await supabase.from("meeting_reactions").insert({
        event_id: eventId,
        user_id: userId,
        emoji,
      });
      return { added: true };
    } catch (err) {
      console.warn("[meetingApi] Error toggling reaction:", err);
      return { added: false };
    }
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptySummary(eventId: string): ReactionSummary {
  return {
    eventId,
    totalReactions: 0,
    reactions: [],
    topEmoji: null,
    uniqueUsers: 0,
    generatedAt: new Date().toISOString(),
  };
}

function aggregateReactions(
  eventId: string,
  rows: MeetingReactionRow[],
): ReactionSummary {
  const emojiMap = new Map<string, { count: number; users: Set<string> }>();

  for (const row of rows) {
    const entry = emojiMap.get(row.emoji) || { count: 0, users: new Set() };
    entry.count++;
    entry.users.add(row.user_id);
    emojiMap.set(row.emoji, entry);
  }

  const reactions: ReactionCount[] = Array.from(emojiMap.entries())
    .map(([emoji, { count, users }]) => ({
      emoji,
      count,
      users: Array.from(users),
    }))
    .sort((a, b) => b.count - a.count);

  const totalReactions = rows.length;
  const uniqueUsers = new Set(rows.map((r) => r.user_id)).size;
  const topEmoji = reactions.length > 0 ? reactions[0].emoji : null;

  return {
    eventId,
    totalReactions,
    reactions,
    topEmoji,
    uniqueUsers,
    generatedAt: new Date().toISOString(),
  };
}

export default meetingApi;
