// =============================================================================
// Component: CollaborativeCanvas
// Issue: #2234 - Wire CollaborativeCanvas into Meeting Room as a live whiteboard panel
// Description: Real-time SVG whiteboard that broadcasts strokes and cursor positions
// via Supabase Realtime channels. Supports freehand drawing, color picking, undo,
// clear, and PNG export. Mounts inside MeetingRoomPanel for facilitator use.
//
// Architecture:
// - Local strokes are drawn immediately (optimistic UI)
// - Each stroke is broadcast via Supabase broadcast channel
// - Remote strokes arrive via channel subscription and merge into local state
// - Cursor positions are throttled to 50ms to avoid flooding
// - Cleanup on unmount removes channel subscribers
// =============================================================================

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Undo2 from "lucide-react/dist/esm/icons/undo-2";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Download from "lucide-react/dist/esm/icons/download";
import Palette from "lucide-react/dist/esm/icons/palette";
import Users from "lucide-react/dist/esm/icons/users";
import Pencil from "lucide-react/dist/esm/icons/pencil";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  userId: string;
  timestamp: number;
}

export interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
  name: string;
  timestamp: number;
}

export interface CollaborativeCanvasProps {
  /** Room/channel identifier for socket isolation */
  roomId: string;
  /** Current user's ID */
  userId: string;
  /** Current user's display name */
  userName: string;
  /** Color for the current user's strokes and cursor */
  userColor?: string;
  /** Whether the user can draw (facilitators only) */
  canDraw?: boolean;
  /** Width of the SVG canvas */
  width?: number;
  /** Height of the SVG canvas */
  height?: number;
  /** Callback when canvas state changes (for snapshot persistence) */
  onStateChange?: (strokes: Stroke[]) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
];

const DEFAULT_USER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f97316",
  "#8b5cf6", "#ec4899", "#06b6d4", "#eab308",
];

const CURSOR_THROTTLE_MS = 50;
const CURSOR_STALE_MS = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateStrokeId(): string {
  return `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

// ---------------------------------------------------------------------------
// CollaborativeCanvas Component
// ---------------------------------------------------------------------------

export function CollaborativeCanvas({
  roomId,
  userId,
  userName,
  userColor,
  canDraw = true,
  width = 800,
  height = 500,
  onStateChange,
}: CollaborativeCanvasProps) {
  const supabase = useMemo(() => createClient(), []);

  // --- State ---
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(
    userColor || DEFAULT_USER_COLORS[hashCode(userId) % DEFAULT_USER_COLORS.length],
  );
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState(false);

  // --- Refs ---
  const svgRef = useRef<SVGSVGElement>(null);
  const channelRef = useRef<any>(null);
  const cursorThrottledRef = useRef<((x: number, y: number) => void) | null>(null);

  // --- Channel setup ---
  useEffect(() => {
    const channel = supabase.channel(`canvas:${roomId}`, {
      config: { presence: { key: userId } },
    });

    // Handle incoming strokes from other users
    channel.on("broadcast", { event: "stroke" }, ({ payload }) => {
      const stroke = payload as Stroke;
      if (stroke.userId !== userId) {
        setStrokes((prev) => [...prev, stroke]);
      }
    });

    // Handle stroke clear
    channel.on("broadcast", { event: "clear" }, () => {
      setStrokes([]);
    });

    // Handle remote cursor positions
    channel.on("broadcast", { event: "cursor" }, ({ payload }) => {
      const cursor = payload as RemoteCursor;
      if (cursor.userId !== userId) {
        setRemoteCursors((prev) => {
          const next = new Map(prev);
          next.set(cursor.userId, cursor);
          return next;
        });
      }
    });

    // Handle undo (last stroke removal)
    channel.on("broadcast", { event: "undo" }, ({ payload }) => {
      const { strokeId, authorId } = payload as { strokeId: string; authorId: string };
      setStrokes((prev) => prev.filter((s) => s.id !== strokeId));
    });

    // Presence tracking for connected users
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users = new Set<string>();
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => users.add(p.user_id || p.key));
      });
      setConnectedUsers(users);
    });

    // Track own presence
    channel.track({
      user_id: userId,
      user_name: userName,
      online_at: new Date().toISOString(),
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, userId, userName, supabase]);

  // --- Throttled cursor broadcast ---
  useEffect(() => {
    cursorThrottledRef.current = throttle((x: number, y: number) => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "cursor",
          payload: {
            userId,
            x,
            y,
            color: selectedColor,
            name: userName,
            timestamp: Date.now(),
          },
        });
      }
    }, CURSOR_THROTTLE_MS);
  }, [userId, userName, selectedColor]);

  // --- Cleanup stale cursors ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        let changed = false;
        next.forEach((cursor, key) => {
          if (now - cursor.timestamp > CURSOR_STALE_MS) {
            next.delete(key);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Notify parent of state changes ---
  useEffect(() => {
    onStateChange?.(strokes);
  }, [strokes, onStateChange]);

  // --- Drawing handlers ---
  const getSvgPoint = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): Point => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    },
    [width, height],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!canDraw) return;
      const point = getSvgPoint(e);
      const stroke: Stroke = {
        id: generateStrokeId(),
        points: [point],
        color: selectedColor,
        width: strokeWidth,
        userId,
        timestamp: Date.now(),
      };
      setCurrentStroke(stroke);
    },
    [canDraw, getSvgPoint, selectedColor, strokeWidth, userId],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getSvgPoint(e);

      // Broadcast cursor position
      cursorThrottledRef.current?.(point.x, point.y);

      // Extend current stroke
      if (currentStroke && canDraw) {
        setCurrentStroke((prev) =>
          prev ? { ...prev, points: [...prev.points, point] } : null,
        );
      }
    },
    [getSvgPoint, currentStroke, canDraw],
  );

  const handleMouseUp = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 1) {
      // Add to local state
      setStrokes((prev) => [...prev, currentStroke]);

      // Broadcast to other users
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "stroke",
          payload: currentStroke,
        });
      }
    }
    setCurrentStroke(null);
  }, [currentStroke]);

  // --- Actions ---
  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      // Only allow undoing own strokes
      if (lastStroke.userId !== userId) return prev;

      // Broadcast undo
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "undo",
          payload: { strokeId: lastStroke.id, authorId: userId },
        });
      }
      return prev.slice(0, -1);
    });
  }, [userId]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "clear",
        payload: {},
      });
    }
  }, []);

  const handleExport = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `whiteboard-${roomId}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, [roomId, width, height]);

  // --- Stroke to SVG path ---
  const strokeToPath = useCallback((stroke: Stroke): string => {
    if (stroke.points.length < 2) return "";
    const [first, ...rest] = stroke.points;
    let d = `M ${first.x} ${first.y}`;
    for (const pt of rest) {
      d += ` L ${pt.x} ${pt.y}`;
    }
    return d;
  }, []);

  // --- Render ---
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-background/50 px-3 py-2">
        {canDraw && (
          <>
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0 || strokes[strokes.length - 1]?.userId !== userId}
              className="rounded p-1.5 hover:bg-muted disabled:opacity-40"
              title="Undo last stroke"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="rounded p-1.5 hover:bg-muted disabled:opacity-40"
              title="Clear canvas"
            >
              <Trash2 size={16} />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="rounded p-1.5 hover:bg-muted"
                title="Pick color"
              >
                <div className="flex items-center gap-1">
                  <Pencil size={14} />
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: selectedColor }}
                  />
                </div>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-lg border bg-background p-2 shadow-lg">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedColor === color ? "border-primary scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16"
              title={`Stroke width: ${strokeWidth}px`}
            />
            <div className="mx-1 h-4 w-px bg-border" />
          </>
        )}
        <button
          onClick={handleExport}
          className="rounded p-1.5 hover:bg-muted"
          title="Export as PNG"
        >
          <Download size={16} />
        </button>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={14} />
          <span>{connectedUsers.size + 1}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden bg-slate-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          data-testid="collaborative-canvas"
        >
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Committed strokes */}
          {strokes.map((stroke) => (
            <path
              key={stroke.id}
              d={strokeToPath(stroke)}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              data-testid={`stroke-${stroke.id}`}
            />
          ))}

          {/* Current (in-progress) stroke */}
          {currentStroke && (
            <path
              d={strokeToPath(currentStroke)}
              fill="none"
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
              data-testid="current-stroke"
            />
          )}

          {/* Remote cursors */}
          {Array.from(remoteCursors.values()).map((cursor) => (
            <g key={cursor.userId} data-testid={`cursor-${cursor.userId}`}>
              <circle cx={cursor.x} cy={cursor.y} r={4} fill={cursor.color} opacity={0.8} />
              <text
                x={cursor.x + 8}
                y={cursor.y - 4}
                fill={cursor.color}
                fontSize="10"
                fontFamily="sans-serif"
              >
                {cursor.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple string hash for color assignment
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default CollaborativeCanvas;
