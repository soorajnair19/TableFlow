import { Attendee, RoundPlan } from "@/lib/types";
import { Card } from "@/components/ui";

export function RoundView({
  round,
  attendees,
  tableCapacities,
}: {
  round: RoundPlan;
  attendees: Attendee[];
  tableCapacities?: Record<string, number>;
}) {
  const attendeeById = new Map(attendees.map((a) => [a.id, a.name]));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {round.tables.map((table) => (
        <Card key={table.tableId} className="p-5">
          <h3 className="text-base font-semibold">
            {table.tableName}
            {tableCapacities?.[table.tableId] ? (
              <span className="ml-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                [{table.attendeeIds.length}/{tableCapacities[table.tableId]}]
              </span>
            ) : null}
          </h3>
          <div className="mt-3 space-y-2">
            {table.attendeeIds.map((attendeeId) => (
              <div
                key={attendeeId}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
              >
                {attendeeById.get(attendeeId) ?? attendeeId}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
