# Quickstart: Meet Lobby Refactor

## Prerequisites

- Backend running at `http://localhost:8000` (Django REST API with room endpoints)
- Frontend dev server: `bun run dev`
- A registered and verified user account (sign up at `/signup`, verify email)

## Validation Scenarios

### 1. Authenticated User Lands on Lobby

1. Open `http://localhost:3000/login`
2. Sign in with valid credentials
3. **Expected**: Redirected to `/lobby` (not `/dashboard`)
4. **Expected**: Page shows header with "Mafia" branding and profile avatar (top-right)
5. **Expected**: Page shows "Create Instant Meeting" button and "Join" input field centered on page
6. **Expected**: No sidebar visible

### 2. Create Instant Meeting

1. From lobby, click "Create Instant Meeting"
2. **Expected**: Button shows loading state ("Creating...")
3. **Expected**: Navigated to `/rooms/<new-room-id>` within 3 seconds
4. **Expected**: Room page shows the new room with user as creator

### 3. Join Meeting via Link

1. Copy the room URL from the browser address bar (e.g., `http://localhost:3000/rooms/<room-id>`)
2. Sign in as a different user (or use incognito window)
3. On the lobby page, paste the full URL into the "Paste a link or room code" input
4. Click "Join"
5. **Expected**: Navigated to the room page, user appears in the member list

### 4. Join with Raw Room ID

1. Copy just the room ID (UUID, e.g., `abc123-def456-...`) from a room URL
2. Paste the raw ID into the join input
3. Click "Join"
4. **Expected**: Same result as full URL join — navigated to the room

### 5. Invalid Join Link

1. Enter a random string like `not-a-real-room` into the join input
2. Click "Join"
3. **Expected**: Error message: "Room not found. It may have been deleted."

### 6. Join Full Room

1. Fill a room to its `max_members` capacity (add members until full)
2. Try to join that room from a new user account
3. **Expected**: Error message: "This room is full. Maximum capacity reached."

### 7. Empty Join Input

1. Leave the join input empty
2. **Expected**: The "Join" button is disabled

### 8. Profile Dropdown

1. Click the profile avatar in the top-right corner of the header
2. **Expected**: Dropdown shows username, email, "Change Password" link, and "Log Out"
3. Click "Log Out"
4. **Expected**: Session cleared, redirected to landing page (`/`)

### 9. Unauthenticated Access

1. Log out
2. Navigate directly to `http://localhost:3000/lobby`
3. **Expected**: Redirected to `/login?redirect=/lobby`
