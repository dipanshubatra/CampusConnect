// =============================================================================
// Component: ReactionSummaryCard
// Issue: #1993 - Wire ReactionSummaryCard on Meeting Details
// Description: Displays a post-meeting reaction summary with emoji breakdown,
// total counts, and unique user stats. Shows empty state when no reactions exist.
// Optionally links back to live room if the meeting is still active.
// =============================================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { meetingApi, type ReactionSummary, MEETING_REACTIONS } from "@/services/meetingApi";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Users from "lucide-react/dist/esm/icons/users";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReactionSummaryCardProps {
  /** Event/meeting ID to fetch reactions for */
  eventId: string;
  /** Whether the meeting is currently live (shows "Return to room" link) */
  isLive?: boolean;
  /** Optional className for the container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReactionSummaryCard({
  eventId,
  isLive = false,
  className = "",
}: ReactionSummaryCardProps) {
  const [summary, setSummary] = useState<ReactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);
        const data = await meetingApi.getReactionSummary(eventId);
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load reactions";
          setError(message);
          console.error("[ReactionSummaryCard]", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [eventId]);

  // --- Loading state ---
  if (loading) {
    return (
      <div
        className={`rounded-lg border bg-card p-6 ${className}`}
        data-testid="reaction-summary-loading"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading reactions…</span>
        </div>
      </div>
    );
  }

  // --- Error state (does not crash the page) ---
  if (error) {
    return (
      <div
        className={`rounded-lg border border-destructive/30 bg-destructive/5 p-6 ${className}`}
        data-testid="reaction-summary-error"
      >
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Could not load reaction data</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  // --- Empty state ---
  if (!summary || summary.totalReactions === 0) {
    return (
      <div
        className={`rounded-lg border bg-card p-6 ${className}`}
        data-testid="reaction-summary-empty"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Reactions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No reactions yet. {isLive ? "Be the first to react in the live room!" : "Reactions will appear here after participants respond."}
        </p>
        {isLive && (
          <Link
            to={`/events/${eventId}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Join the live room <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    );
  }

  // --- Data state ---
  const maxCount = Math.max(...summary.reactions.map((r) => r.count));

  return (
    <div
      className={`rounded-lg border bg-card p-6 ${className}`}
      data-testid="reaction-summary-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Reactions</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {summary.uniqueUsers} participant{summary.uniqueUsers !== 1 ? "s" : ""}
          </span>
          <span>{summary.totalReactions} total</span>
        </div>
      </div>

      {/* Top emoji callout */}
      {summary.topEmoji && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
          <span className="text-2xl">{summary.topEmoji}</span>
          <span className="text-sm font-medium">
            Most popular reaction
          </span>
        </div>
      )}

      {/* Reaction bars */}
      <div className="space-y-2">
        {summary.reactions.map((reaction) => {
          const pct = maxCount > 0 ? (reaction.count / maxCount) * 100 : 0;
          const emojiLabel = MEETING_REACTIONS.find((e) => e.emoji === reaction.emoji)?.label;

          return (
            <div key={reaction.emoji} className="flex items-center gap-3" data-testid={`reaction-row-${reaction.emoji}`}>
              <span className="w-8 text-center text-lg" title={emojiLabel}>
                {reaction.emoji}
              </span>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm font-medium tabular-nums">
                {reaction.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          {summary.reactions.length} unique reaction type{summary.reactions.length !== 1 ? "s" : ""}
        </span>
        {isLive && (
          <Link
            to={`/events/${eventId}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Return to room <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default ReactionSummaryCard;
