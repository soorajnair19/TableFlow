export type RepeatAvoidance = "low" | "medium" | "high";

export interface Attendee {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  /** Draft UI may use `""` while editing custom capacities; persist / schedule with a positive number. */
  capacity: number | "";
}

export interface EventConfig {
  attendees: Attendee[];
  tables: Table[];
  rounds: number;
  durationMinutes?: number;
  repeatAvoidance: RepeatAvoidance;
  uiPreferences?: {
    useEqual: boolean;
    tableCount: number;
    customTables: Table[];
  };
}

export interface RoundTable {
  tableId: string;
  tableName: string;
  attendeeIds: string[];
}

export interface RoundPlan {
  id: string;
  index: number;
  tables: RoundTable[];
  repeatedPairCount: number;
}

export interface SessionPlan {
  rounds: RoundPlan[];
  totalRepeatedPairs: number;
}
