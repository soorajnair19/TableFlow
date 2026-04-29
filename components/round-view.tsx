import { DragEvent } from "react";
import { Attendee, RoundPlan } from "@/lib/types";
import { Card } from "@/components/ui";

type DragPayload = {
  attendeeId: string;
  fromTableId: string;
};

export function RoundView({
  round,
  attendees,
  onMoveAttendee,
  tableCapacities,
}: {
  round: RoundPlan;
  attendees: Attendee[];
  onMoveAttendee?: (payload: {
    attendeeId: string;
    fromTableId: string;
    toTableId: string;
    targetAttendeeId?: string;
  }) => void;
  tableCapacities?: Record<string, number>;
}) {
  const attendeeById = new Map(attendees.map((a) => [a.id, a]));
  const isEditable = Boolean(onMoveAttendee);

  const onDragStart = (event: DragEvent<HTMLDivElement>, payload: DragPayload) => {
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDropToTable = (event: DragEvent<HTMLDivElement>, toTableId: string, targetAttendeeId?: string) => {
    event.preventDefault();
    if (!onMoveAttendee) return;
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const parsed = JSON.parse(raw) as DragPayload;
    onMoveAttendee({ ...parsed, toTableId, targetAttendeeId });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {round.tables.map((table) => (
        <Card
          key={table.tableId}
          className="p-5"
          onDragOver={isEditable ? (e) => e.preventDefault() : undefined}
          onDrop={isEditable ? (e) => onDropToTable(e, table.tableId) : undefined}
        >
          <h3 className="text-base font-semibold">
            {table.tableName}
            {tableCapacities?.[table.tableId] ? (
              <span className="ml-2 text-sm font-medium text-neutral-500">
                [{table.attendeeIds.length}/{tableCapacities[table.tableId]}]
              </span>
            ) : null}
          </h3>
          <div className="mt-3 space-y-2">
            {table.attendeeIds.map((attendeeId) => (
              <div
                key={attendeeId}
                className={`flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm ${
                  isEditable ? "cursor-move" : ""
                }`}
                draggable={isEditable}
                onDragStart={(e) => onDragStart(e, { attendeeId, fromTableId: table.tableId })}
                onDragOver={isEditable ? (e) => e.preventDefault() : undefined}
                onDrop={isEditable ? (e) => onDropToTable(e, table.tableId, attendeeId) : undefined}
              >
                {isEditable ? (
                  <span className="grid grid-cols-2 gap-0.5 text-neutral-400" aria-hidden>
                    <span className="size-1 rounded-full bg-current" />
                    <span className="size-1 rounded-full bg-current" />
                    <span className="size-1 rounded-full bg-current" />
                    <span className="size-1 rounded-full bg-current" />
                    <span className="size-1 rounded-full bg-current" />
                    <span className="size-1 rounded-full bg-current" />
                  </span>
                ) : null}
                {attendeeById.get(attendeeId)?.name ?? attendeeId}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
