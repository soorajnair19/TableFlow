# TableFlow

Try it out: [https://table-flow-table.vercel.app/](https://table-flow-table.vercel.app/)

TableFlow helps hosts plan and run structured speed-networking sessions without spreadsheet chaos.  
Generate table rotations quickly, reduce repeated pairings, and run rounds live with a clean host interface.

## What Problem It Solves

When you have 30-100 attendees, uneven table sizes, and limited time, manual planning gets messy fast.  
TableFlow is built for hosts who need:

- fast setup from a raw attendee list
- balanced table assignments across rounds
- fewer repeated attendee pairings
- a clear, live round-by-round display during the event

## Host flow (steps 1–3)

The setup wizard is three steps with a shared header and consistent page width:

1. **Step 1: Add Attendees** (`/attendees`) — CSV upload, paste names, or add people one at a time.  
2. **Step 2: Setup Session** (`/session`) — tables, rounds, duration, repeat avoidance, and distribution (equal or custom capacities).  
3. **Step 3: Review** (`/plan`) — inspect generated rounds, repeated-pair summary, manual seat tweaks (drag and drop), regenerate if needed, then **Go Live** (opens live mode in a new tab).

Legacy URL **`/generate`** redirects to **`/attendees`**.

**Live session** (`/live`) is the presentation view used during the event (timer, round tabs). It expects a plan already generated from Step 3; it is not a numbered step in the wizard.

## Core Features

### 1) Flexible Attendee Input (Step 1)
- Upload attendees via CSV
- Paste comma/newline-separated names
- Add attendees manually
- Remove individual attendees or clear all

### 2) Session Configuration (Step 2)
- Set number of tables, networking rounds, and round duration
- Choose repeat-avoidance level (`low`, `medium`, `high`)
- Select distribution mode:
  - Equal distribution
  - Custom table capacities
- Real-time equal-distribution summary (including approximate ranges for non-divisible attendee counts)

### 3) Smart Round Generation
- Round generation engine designed for speed and reliability
- Tracks prior interactions and biases assignments toward new pairings
- Avoidance strictness adapts to selected repeat-avoidance level
- Handles practical event constraints without overcomplicating host workflow

### 4) Plan Review (Step 3)
- Tabbed round view (`Round 1`, `Round 2`, etc.)
- Total repeated-pair count
- Detailed repeated-pairs modal with:
  - Repetition (`Round X - Table Y`)
  - Attendee Pair
  - Met Before (`Round A - Table B`)
- Drag-and-drop edits in the round view; metrics update after moves
- Regenerate plan quickly with current configuration

### 5) Live Session Mode
- Presenter-friendly live display of current round tables
- Round tabs for quick navigation during the event
- Built-in timer controls (start/pause/reset)
- Last-minute timer warning (turns red in the final 60 seconds)
- Opens from Review; state is persisted so a new tab can share the same plan

## Design Principles

- Minimal and host-first interface
- High readability for on-stage usage
- Clear controls, low cognitive load
- Practical optimization over theoretical perfection

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- Zustand
- PapaParse
- TypeScript
