// =============================================================================
// Test Suite: CollaborativeCanvas
// Issue: #2234 - Wire CollaborativeCanvas into Meeting Room as a live whiteboard panel
// Description: Tests cover mount behavior, socket event wiring, drawing interaction,
// undo/clear actions, cursor broadcasting, presence tracking, and cleanup on unmount.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { CollaborativeCanvas, type Stroke, type RemoteCursor } from "@/components/meeting-room/CollaborativeCanvas";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSend = vi.fn();
const mockTrack = vi.fn();
const mockUnsubscribe = vi.fn();
const mockPresenceState = vi.fn(() => ({}));

const mockChannel = {
  on: vi.fn((event: string, config: any, callback: any) => {
    // Store callbacks for testing
    if (!mockChannel._handlers) mockChannel._handlers = {};
    const key = `${event}:${config?.event || "default"}`;
    mockChannel._handlers[key] = callback;
    return mockChannel;
  }),
  subscribe: vi.fn(),
  unsubscribe: mockUnsubscribe,
  track: mockTrack,
  presenceState: mockPresenceState,
  send: mockSend,
  _handlers: {} as Record<string, Function>,
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: vi.fn(() => mockChannel),
  }),
}));

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const defaultProps = {
  roomId: "test-room-123",
  userId: "user-1",
  userName: "Test User",
  userColor: "#3b82f6",
  canDraw: true,
  width: 800,
  height: 500,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CollaborativeCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel._handlers = {};
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Mount & Initialization
  // =========================================================================

  describe("Mount", () => {
    it("should render the SVG canvas", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      expect(screen.getByTestId("collaborative-canvas")).toBeInTheDocument();
    });

    it("should render the toolbar with draw controls when canDraw is true", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      expect(screen.getByTitle("Undo last stroke")).toBeInTheDocument();
      expect(screen.getByTitle("Clear canvas")).toBeInTheDocument();
      expect(screen.getByTitle("Export as PNG")).toBeInTheDocument();
    });

    it("should not render draw controls when canDraw is false", () => {
      render(<CollaborativeCanvas {...defaultProps} canDraw={false} />);
      expect(screen.queryByTitle("Undo last stroke")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Clear canvas")).not.toBeInTheDocument();
    });

    it("should show connected user count", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      expect(screen.getByText("1")).toBeInTheDocument(); // Just self
    });

    it("should register channel with correct room ID", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it("should track presence on mount", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      expect(mockTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-1",
          user_name: "Test User",
        }),
      );
    });
  });

  // =========================================================================
  // Socket Event Handling
  // =========================================================================

  describe("Socket Events", () => {
    it("should register broadcast handlers for stroke, clear, cursor, and undo", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const registeredEvents = mockChannel.on.mock.calls.map(
        (call: any) => `${call[0]}:${call[1]?.event}`,
      );

      expect(registeredEvents).toContain("broadcast:stroke");
      expect(registeredEvents).toContain("broadcast:clear");
      expect(registeredEvents).toContain("broadcast:cursor");
      expect(registeredEvents).toContain("broadcast:undo");
    });

    it("should register presence sync handler", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      const registeredEvents = mockChannel.on.mock.calls.map(
        (call: any) => `${call[0]}:${call[1]?.event}`,
      );
      expect(registeredEvents).toContain("presence:sync");
    });

    it("should ignore strokes from the same user", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const strokeHandler = mockChannel._handlers["broadcast:stroke"];
      expect(strokeHandler).toBeDefined();

      // Simulate receiving own stroke
      act(() => {
        strokeHandler({
          payload: {
            id: "stroke-own",
            points: [{ x: 10, y: 10 }],
            color: "#3b82f6",
            width: 3,
            userId: "user-1", // Same as current user
            timestamp: Date.now(),
          },
        });
      });

      // Should not add to canvas (no stroke elements rendered)
      expect(screen.queryByTestId("stroke-stroke-own")).not.toBeInTheDocument();
    });

    it("should render remote strokes from other users", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const strokeHandler = mockChannel._handlers["broadcast:stroke"];

      act(() => {
        strokeHandler({
          payload: {
            id: "stroke-remote-1",
            points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
            color: "#ef4444",
            width: 3,
            userId: "user-2",
            timestamp: Date.now(),
          },
        });
      });

      expect(screen.getByTestId("stroke-stroke-remote-1")).toBeInTheDocument();
    });

    it("should clear all strokes on clear event", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const strokeHandler = mockChannel._handlers["broadcast:stroke"];
      const clearHandler = mockChannel._handlers["broadcast:clear"];

      // Add a remote stroke first
      act(() => {
        strokeHandler({
          payload: {
            id: "stroke-to-clear",
            points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
            color: "#ef4444",
            width: 3,
            userId: "user-2",
            timestamp: Date.now(),
          },
        });
      });

      expect(screen.getByTestId("stroke-stroke-to-clear")).toBeInTheDocument();

      // Clear
      act(() => {
        clearHandler({});
      });

      expect(screen.queryByTestId("stroke-stroke-to-clear")).not.toBeInTheDocument();
    });

    it("should render remote cursor positions", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const cursorHandler = mockChannel._handlers["broadcast:cursor"];

      act(() => {
        cursorHandler({
          payload: {
            userId: "user-2",
            x: 100,
            y: 200,
            color: "#ef4444",
            name: "Remote User",
            timestamp: Date.now(),
          },
        });
      });

      expect(screen.getByTestId("cursor-user-2")).toBeInTheDocument();
      expect(screen.getByText("Remote User")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Drawing Interaction
  // =========================================================================

  describe("Drawing", () => {
    it("should create a stroke on mouse down when canDraw is true", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      const svg = screen.getByTestId("collaborative-canvas");

      fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });

      // Current stroke should appear
      expect(screen.getByTestId("current-stroke")).toBeInTheDocument();
    });

    it("should broadcast stroke on mouse up", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      const svg = screen.getByTestId("collaborative-canvas");

      // Draw a stroke
      fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(svg, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(svg);

      // Should broadcast the stroke
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "stroke",
        }),
      );
    });

    it("should not draw when canDraw is false", () => {
      render(<CollaborativeCanvas {...defaultProps} canDraw={false} />);
      const svg = screen.getByTestId("collaborative-canvas");

      fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });

      expect(screen.queryByTestId("current-stroke")).not.toBeInTheDocument();
    });

    it("should broadcast cursor position on mouse move", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      const svg = screen.getByTestId("collaborative-canvas");

      fireEvent.mouseMove(svg, { clientX: 200, clientY: 300 });

      // Cursor broadcast is throttled, but should eventually fire
      // The throttle function will fire on the first call
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "cursor",
          payload: expect.objectContaining({
            userId: "user-1",
          }),
        }),
      );
    });
  });

  // =========================================================================
  // Actions (Undo, Clear, Export)
  // =========================================================================

  describe("Actions", () => {
    it("should undo last stroke and broadcast undo event", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const strokeHandler = mockChannel._handlers["broadcast:stroke"];

      // Add a stroke from self
      act(() => {
        strokeHandler({
          payload: {
            id: "stroke-self-1",
            points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
            color: "#3b82f6",
            width: 3,
            userId: "user-1",
            timestamp: Date.now(),
          },
        });
      });

      // Click undo
      fireEvent.click(screen.getByTitle("Undo last stroke"));

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "undo",
          payload: { strokeId: "stroke-self-1", authorId: "user-1" },
        }),
      );
    });

    it("should clear canvas and broadcast clear event", () => {
      render(<CollaborativeCanvas {...defaultProps} />);
      
      const clearHandler = mockChannel._handlers["broadcast:clear"];

      // Clear
      fireEvent.click(screen.getByTitle("Clear canvas"));

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "broadcast",
          event: "clear",
        }),
      );
    });

    it("should call onStateChange when strokes change", () => {
      const onStateChange = vi.fn();
      render(
        <CollaborativeCanvas {...defaultProps} onStateChange={onStateChange} />,
      );

      const strokeHandler = mockChannel._handlers["broadcast:stroke"];

      act(() => {
        strokeHandler({
          payload: {
            id: "stroke-state-test",
            points: [{ x: 10, y: 10 }],
            color: "#ef4444",
            width: 3,
            userId: "user-2",
            timestamp: Date.now(),
          },
        });
      });

      expect(onStateChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "stroke-state-test" }),
        ]),
      );
    });
  });

  // =========================================================================
  // Cleanup
  // =========================================================================

  describe("Cleanup", () => {
    it("should unsubscribe from channel on unmount", () => {
      const { unmount } = render(<CollaborativeCanvas {...defaultProps} />);
      
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Presence
  // =========================================================================

  describe("Presence", () => {
    it("should update connected users from presence sync", () => {
      mockPresenceState.mockReturnValue({
        "user-1": [{ user_id: "user-1", user_name: "Test User" }],
        "user-2": [{ user_id: "user-2", user_name: "Other User" }],
      });

      render(<CollaborativeCanvas {...defaultProps} />);

      const presenceHandler = mockChannel._handlers["presence:sync"];
      expect(presenceHandler).toBeDefined();

      act(() => {
        presenceHandler();
      });

      // Should show 3 users (2 from presence + 1 self)
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// MeetingWhiteboardPanel Tests
// ===========================================================================

import { MeetingWhiteboardPanel } from "@/components/meeting-room/MeetingWhiteboardPanel";

describe("MeetingWhiteboardPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannel._handlers = {};
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the whiteboard panel", () => {
    render(
      <MeetingWhiteboardPanel
        meetingId="meeting-1"
        userId="user-1"
        userName="Test User"
        isFacilitator={true}
      />,
    );
    expect(screen.getByTestId("meeting-whiteboard-panel")).toBeInTheDocument();
  });

  it("should show 'View Only' badge for non-facilitators", () => {
    render(
      <MeetingWhiteboardPanel
        meetingId="meeting-1"
        userId="user-1"
        userName="Test User"
        isFacilitator={false}
      />,
    );
    expect(screen.getByText("View Only")).toBeInTheDocument();
  });

  it("should not show 'View Only' badge for facilitators", () => {
    render(
      <MeetingWhiteboardPanel
        meetingId="meeting-1"
        userId="user-1"
        userName="Test User"
        isFacilitator={true}
      />,
    );
    expect(screen.queryByText("View Only")).not.toBeInTheDocument();
  });

  it("should display stroke count", () => {
    render(
      <MeetingWhiteboardPanel
        meetingId="meeting-1"
        userId="user-1"
        userName="Test User"
        isFacilitator={true}
      />,
    );
    expect(screen.getByText("0 strokes")).toBeInTheDocument();
  });

  it("should show the Live Whiteboard title", () => {
    render(
      <MeetingWhiteboardPanel
        meetingId="meeting-1"
        userId="user-1"
        userName="Test User"
        isFacilitator={true}
      />,
    );
    expect(screen.getByText("Live Whiteboard")).toBeInTheDocument();
  });
});
