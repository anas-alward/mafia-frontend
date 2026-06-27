# Quickstart: Room Management

**Feature**: 003-room-management
**Date**: 2026-06-27

## Prerequisites

- Node.js / Bun installed
- Django backend running at `http://localhost:8000` (or `VITE_API_BASE_URL` env var set)
- Existing user account (sign up at `/signup`)
- Dependencies installed: `bun install`

## Setup

```bash
# Start dev server
bun run dev
# → http://localhost:3000
```

## Validation Scenarios

### 1. Browse Rooms (P1)

1. Log in (navigate to `/login`, enter credentials)
2. Navigate to `/rooms` via sidebar "Rooms" link
3. **Expected**: Table displays with columns: Name, Members (count/max), Created
4. If no rooms exist: **Expected** empty state message with "Create Room" prompt

### 2. Create a Room (P2)

1. From `/rooms`, click "Create Room" button
2. Navigates to `/rooms/new`
3. Fill in: Name ("Test Room"), Description (optional), Max Members (e.g., 10)
4. Submit the form
5. **Expected**: Redirected to `/rooms/:id` showing the new room's detail page
6. **Expected**: Room appears in the `/rooms` table list

### 3. View Room Detail (P1)

1. From `/rooms`, click a room row
2. Navigates to `/rooms/:id`
3. **Expected**: Shows room name, description, creator username, member count, max members, dates
4. **Expected**: Member list displays all current members
5. **Expected**: "Share" button is visible (click copies room URL to clipboard)

### 4. Edit Room (P3) — As Creator

1. On `/rooms/:id` (as the room creator), click "Edit Room"
2. Navigates to `/rooms/:id/edit`
3. Change the room name and submit
4. **Expected**: Redirected back to detail page with updated name shown

### 5. Edit Room (P3) — As Non-Creator

1. Log in as a different user
2. Navigate to a room created by another user
3. **Expected**: No "Edit Room" button is visible

### 6. Add Member — As Creator

1. On `/rooms/:id` (as creator), click "Add Member"
2. Dialog opens with user selection
3. Select a user and confirm
4. **Expected**: Member appears in the member list; member count increments

### 7. Add Member — Room Full

1. Fill a room to its max capacity
2. Attempt to add another member
3. **Expected**: Error message "Room has reached maximum capacity"

### 8. Remove Member — As Creator

1. On `/rooms/:id` (as creator), click remove button on a member row
2. **Expected**: Member removed from list; member count decrements

### 9. Share Room Link

1. On `/rooms/:id`, click "Share" button
2. **Expected**: Room URL copied to clipboard
3. Paste URL in a new tab → navigates to the same room detail page

### 10. Auth Gate

1. Log out
2. Navigate directly to `/rooms`
3. **Expected**: Redirected to `/login`

## Commands

```bash
bun run dev          # Start dev server (port 3000)
bun run build        # Production build
bun run test         # Run tests
bun run lint         # Lint check
bun run check        # Format check
```
