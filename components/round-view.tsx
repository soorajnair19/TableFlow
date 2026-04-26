import { Attendee, RoundPlan } from "@/lib/types";
import { Card } from "@/components/ui";

export function RoundView({ round, attendees }: { round: RoundPlan; attendees: Attendee[] }) {
  const attendeeById = new Map(attendees.map((a) => [a.id, a]));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {round.tables.map((table) => (
        <Card key={table.tableId} className="p-5">
          <h3 className="text-base font-semibold">{table.tableName}</h3>
          <div className="mt-3 space-y-2">
            {table.attendeeIds.map((attendeeId) => (
              <div key={attendeeId} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                {attendeeById.get(attendeeId)?.name ?? attendeeId}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
