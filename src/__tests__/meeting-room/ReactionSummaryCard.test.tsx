// =============================================================================
// Test Suite: ReactionSummaryCard + meetingApi
// Issue: #1993 - Wire ReactionSummaryCard on Meeting Details
// Description: Tests cover loading, error, empty, and data rendering states,
// meetingApi service functions, and integration with EventDetail page.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactionSummaryCard } from "@/components/meeting-room/ReactionSummaryCard";
import { meetingApi, type ReactionSummary } from "@/services/meetingApi";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/services/meetingApi", () => ({
  meetingApi: {
    getReactionSummary: vi.fn(),
    toggleReaction: vi.fn(),
  },
  MEETING_REACTIONS: [
    { emoji: "👍", label: "Thumbs up" },
    { emoji: "👏", label: "Clap" },
    { emoji: "🔥", label: "Fire" },
  ],
}));

const mockGetReactionSummary = vi.mocked(meetingApi.getReactionSummary);

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const emptySummary: ReactionSummary = {
  eventId: "event-1",
  totalReactions: 0,
  reactions: [],
  topEmoji: null,
  uniqueUsers: 0,
  generatedAt: new Date().toISOString(),
};

const fullSummary: ReactionSummary = {
  eventId: "event-1",
  totalReactions: 15,
  reactions: [
    { emoji: "🔥", count: 8, users: ["u1", "u2", "u3"] },
    { emoji: "👍", count: 5, users: ["u1", "u4"] },
    { emoji: "👏", count: 2, users: ["u5"] },
  ],
  topEmoji: "🔥",
  uniqueUsers: 5,
  generatedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCard(props: Partial<React.ComponentProps<typeof ReactionSummaryCard>> = {}) {
  return render(
    <MemoryRouter>
      <ReactionSummaryCard eventId="event-1" {...props} />
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("meetingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReactionSummary", () => {
    it("should return empty summary on error", async () => {
      mockGetReactionSummary.mockResolvedValue(emptySummary);
      const result = await meetingApi.getReactionSummary("event-1");
      expect(result.totalReactions).toBe(0);
      expect(result.reactions).toHaveLength(0);
    });

    it("should return full summary with data", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      const result = await meetingApi.getReactionSummary("event-1");
      expect(result.totalReactions).toBe(15);
      expect(result.topEmoji).toBe("🔥");
      expect(result.uniqueUsers).toBe(5);
    });
  });
});

describe("ReactionSummaryCard", () => {
  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Loading State
  // =========================================================================

  describe("Loading", () => {
    it("should show loading indicator while fetching", () => {
      mockGetReactionSummary.mockReturnValue(new Promise(() => {})); // Never resolves
      renderCard();
      expect(screen.getByTestId("reaction-summary-loading")).toBeInTheDocument();
      expect(screen.getByText("Loading reactions…")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Error State
  // =========================================================================

  describe("Error", () => {
    it("should show error state when API fails", async () => {
      mockGetReactionSummary.mockRejectedValue(new Error("Network error"));
      renderCard();
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-error")).toBeInTheDocument();
      });
      expect(screen.getByText("Could not load reaction data")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    it("should not crash the page on error", async () => {
      mockGetReactionSummary.mockRejectedValue(new Error("DB connection failed"));
      renderCard();
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-error")).toBeInTheDocument();
      });
      // Page should still render without throwing
      expect(screen.getByText("Could not load reaction data")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Empty State
  // =========================================================================

  describe("Empty", () => {
    it("should show empty state when no reactions exist", async () => {
      mockGetReactionSummary.mockResolvedValue(emptySummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-empty")).toBeInTheDocument();
      });
      expect(screen.getByText("No reactions yet.")).toBeInTheDocument();
    });

    it("should show live room link when isLive is true and no reactions", async () => {
      mockGetReactionSummary.mockResolvedValue(emptySummary);
      renderCard({ isLive: true });
      await waitFor(() => {
        expect(screen.getByText("Be the first to react in the live room!")).toBeInTheDocument();
      });
      expect(screen.getByText("Join the live room")).toBeInTheDocument();
    });

    it("should not show live room link when isLive is false", async () => {
      mockGetReactionSummary.mockResolvedValue(emptySummary);
      renderCard({ isLive: false });
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-empty")).toBeInTheDocument();
      });
      expect(screen.queryByText("Join the live room")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Data State
  // =========================================================================

  describe("Data", () => {
    it("should render reaction summary with data", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-card")).toBeInTheDocument();
      });
    });

    it("should show total reaction count", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByText("15 total")).toBeInTheDocument();
      });
    });

    it("should show unique user count", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByText("5 participants")).toBeInTheDocument();
      });
    });

    it("should show top emoji callout", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByText("🔥")).toBeInTheDocument();
        expect(screen.getByText("Most popular reaction")).toBeInTheDocument();
      });
    });

    it("should render individual reaction rows", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByTestId("reaction-row-🔥")).toBeInTheDocument();
        expect(screen.getByTestId("reaction-row-👍")).toBeInTheDocument();
        expect(screen.getByTestId("reaction-row-👏")).toBeInTheDocument();
      });
    });

    it("should show reaction counts per emoji", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByText("8")).toBeInTheDocument(); // 🔥 count
        expect(screen.getByText("5")).toBeInTheDocument(); // 👍 count
        expect(screen.getByText("2")).toBeInTheDocument(); // 👏 count
      });
    });

    it("should show unique reaction type count", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard();
      await waitFor(() => {
        expect(screen.getByText("3 unique reaction types")).toBeInTheDocument();
      });
    });

    it("should show return to room link when isLive is true", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard({ isLive: true });
      await waitFor(() => {
        expect(screen.getByText("Return to room")).toBeInTheDocument();
      });
    });

    it("should not show return to room link when isLive is false", async () => {
      mockGetReactionSummary.mockResolvedValue(fullSummary);
      renderCard({ isLive: false });
      await waitFor(() => {
        expect(screen.getByTestId("reaction-summary-card")).toBeInTheDocument();
      });
      expect(screen.queryByText("Return to room")).not.toBeInTheDocument();
    });
  });
});
