# API Contracts: Room Management

**Feature**: 003-room-management
**Base URL**: `{API_BASE}/api`

All endpoints require JWT authentication (Bearer token or httpOnly cookie). Responses follow the Django API convention: `{ success: true, data: ... }` or `{ success: false, errors: [...] }`.

## Rooms

### List Rooms

```
GET /api/rooms/
```

**Response 200** (Django REST Framework pagination):
```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "max_members": 10,
      "member_count": 3,
      "creator": { "id": "uuid", "username": "string" },
      "video_call_url": "string | null",
      "created_at": "2026-06-27T00:00:00Z",
      "updated_at": "2026-06-27T00:00:00Z"
    }
  ]
}
```

### Get Room Detail

```
GET /api/rooms/:id/
```

**Response 200**: Single room object (same shape as list item).

**Response 404**: `{ "success": false, "errors": [{ "code": "not_found", "message": "Room not found" }] }`

### Create Room

```
POST /api/rooms/
```

**Request Body**:
```json
{
  "name": "string (required, 1-100)",
  "description": "string (optional, max 500)",
  "max_members": 10
}
```

**Response 201**: Created room object.
**Response 400**: Validation errors.

### Update Room

```
PUT /api/rooms/:id/
```

**Request Body** (all fields optional):
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "max_members": 10 (optional)
}
```

**Response 200**: Updated room object.
**Response 403**: `{ "success": false, "errors": [{ "code": "forbidden", "message": "Only the room creator can edit" }] }`

### Delete Room

```
DELETE /api/rooms/:id/
```

**Response 200**: `{ "success": true, "data": null }`
**Response 403**: Non-creator cannot delete.

## Members

### List Members

```
GET /api/rooms/:id/members/
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "username": "string",
      "room_id": "uuid",
      "joined_at": "2026-06-27T00:00:00Z"
    }
  ]
}
```

### Add Member

```
POST /api/rooms/:id/members/
```

**Request Body**:
```json
{
  "user_id": "uuid"
}
```

**Response 201**: Created member object.
**Response 400**: `{ "success": false, "errors": [{ "code": "room_full", "message": "Room has reached maximum capacity" }] }`
**Response 409**: `{ "success": false, "errors": [{ "code": "already_member", "message": "User is already a member" }] }`

### Remove Member

```
DELETE /api/rooms/:id/members/:userId/
```

**Response 200**: `{ "success": true, "data": null }`
**Response 403**: Only the room creator can remove members.
