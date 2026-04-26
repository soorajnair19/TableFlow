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

## Core Features

### 1) Flexible Attendee Input
- Upload attendees via CSV
- Paste comma/newline-separated names
- Add attendees manually
- Remove individual attendees or clear all

### 2) Session Configuration
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

### 4) Plan Review (Step 2)
- Tabbed round view (`Round 1`, `Round 2`, etc.)
- Total repeated-pair count
- Detailed repeated-pairs modal with:
  - Repetition (`Round X - Table Y`)
  - Attendee Pair
  - Met Before (`Round A - Table B`)
- Regenerate plan quickly with current configuration

### 5) Live Session Mode (Step 3)
- Presenter-friendly live display of current round tables
- Round tabs for quick navigation during the event
- Built-in timer controls (start/pause/reset)
- Last-minute timer warning (turns red in final 60 seconds)
- Fast return to Configure from live mode

## Product Flow

1. **Step 1: Generate** - configure attendees and session rules  
2. **Step 2: Plan Review** - inspect rounds and repeated interactions  
3. **Step 3: Live** - run the event with a clear round display and timer

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

