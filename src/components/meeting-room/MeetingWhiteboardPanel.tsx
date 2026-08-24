// =============================================================================
// Component: MeetingWhiteboardPanel
// Issue: #2234 - Wire CollaborativeCanvas into Meeting Room as a live whiteboard panel
// Description: Wrapper panel that mounts the CollaborativeCanvas within the Meeting Room
// tab system. Provides the correct roomId, userId, and permissions based on the
// current meeting context.
// =============================================================================

import { Suspense, lazy, useCallback, useState } from "react";
import { CollaborativeCanvas, type Stroke } from "./CollaborativeCanvas";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Palette from "lucide-react/dist/esm/icons/palette";

const LazyCanvas = lazy(() =>
  import("./CollaborativeCanvas").then((m) => ({ default: m.CollaborativeCanvas })),
);

export interface MeetingWhiteboardPanelProps {
  /** Meeting/event ID used as the room channel */
  meetingId: string;
  /** Current user's ID */
  userId: string;
  /** Current user's display name */
  userName: string;
  /** Whether the user is a facilitator (can draw) */
  isFacilitator?: boolean;
  /** Optional callback when canvas state changes for persistence */
  onSnapshot?: (strokes: Stroke[]) => void;
}

export function MeetingWhiteboardPanel({
  meetingId,
  userId,
  userName,
  isFacilitator = false,
  onSnapshot,
}: MeetingWhiteboardPanelProps) {
  const [strokeCount, setStrokeCount] = useState(0);

  const handleStateChange = useCallback(
    (strokes: Stroke[]) => {
      setStrokeCount(strokes.length);
      onSnapshot?.(strokes);
    },
    [onSnapshot],
  );

  return (
    <div className="flex h-full flex-col" data-testid="meeting-whiteboard-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-primary" />
          <span className="text-sm font-semibold">Live Whiteboard</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{strokeCount} stroke{strokeCount !== 1 ? "s" : ""}</span>
          {!isFacilitator && (
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
              View Only
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <LazyCanvas
            roomId={`meeting-${meetingId}`}
            userId={userId}
            userName={userName}
            canDraw={isFacilitator}
            onStateChange={handleStateChange}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default MeetingWhiteboardPanel;
