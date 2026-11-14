# IIT-Connect Enhanced - New Features Documentation

## Overview
This enhanced version adds three major features to the IIT-Connect platform:
1. **Travel Companion System** - Find travel buddies from your IIT
2. **Community Chat** - Global conversation connecting all IITs
3. **Study Materials Hub** - Share and discover educational resources

---

## Feature 1: Travel Companion System

### Description
A platform for IIT students to find travel companions going to the same destination on the same date.

### Database Model: `TravelPost`
**File:** `backend/src/models/TravelPost.js`

**Fields:**
- `authorId` - Reference to User (required)
- `name` - Traveler's name (required)
- `branch` - Academic branch (required)
- `batch` - Academic batch/year (required)
- `iit` - IIT name (required)
- `travelMode` - Enum: 'Train', 'Flight', 'Bus' (required)
- `seatDetails` - Coach/seat number (optional)
- `travelDate` - Date of travel (required)
- `from` - Starting location (required)
- `to` - Destination (required)
- `notes` - Additional information (optional)
- `contactPreference` - Enum: 'Email', 'Phone', 'WhatsApp' (default: 'Email')
- `status` - Enum: 'Pending', 'Approved', 'Rejected' (default: 'Pending')
- `rejectionReason` - Admin rejection reason (optional)

### API Endpoints
**File:** `backend/src/routes/travel.routes.js`

```
GET    /api/travel           - List approved travel posts (public)
GET    /api/travel/mine      - List my travel posts (authenticated)
POST   /api/travel           - Create new travel post (authenticated)
```

### Admin Endpoints
```
GET    /api/admin/approvals/pending  - Includes travel posts
PUT    /api/admin/approvals/travel/:id - Approve/reject travel post
```

**Body for approval:**
```json
{
  "status": "Approved" | "Rejected",
  "rejectionReason": "Optional reason if rejected"
}
```

### Controller Functions
**File:** `backend/src/controllers/travel.controller.js`
- `createTravelPost` - Create new travel companion request
- `listApprovedTravel` - Get all approved travel posts (sorted by date)
- `listMyTravel` - Get user's own travel posts

---

## Feature 2: Community Chat

### Description
A global conversation room connecting all IIT students, no admin approval required.

### Database Model Update: `Conversation`
**File:** `backend/src/models/Conversation.js`

**Updated field:**
- `type` - Now includes: 'dm', 'group', **'community'** (new)

### API Endpoints
**File:** `backend/src/routes/chat.routes.js`

```
POST   /api/chat/community   - Get or create community conversation
```

### Controller Function
**File:** `backend/src/controllers/chat.controller.js`
- `getOrCreateCommunity` - Get/create the global community chat

### Features
- **No approval needed** - Users can join instantly
- **Open to all IITs** - Connects students across all IIT campuses
- **Moderation ready** - Admin ban system still applies
- **Real-time** - Uses existing Socket.IO infrastructure

### Socket.IO Support
**File:** `backend/src/socket/index.js`
- Updated `message:send` handler to allow community chat without membership check
- Community conversations are open to all authenticated users

---

## Feature 3: Study Materials Hub

### Description
A repository for sharing educational resources like lecture notes, YouTube playlists, assignments, and study materials.

### Database Model: `StudyPost`
**File:** `backend/src/models/StudyPost.js`

**Fields:**
- `authorId` - Reference to User (required)
- `title` - Resource title (required)
- `description` - Detailed description (optional)
- `tags` - Array of tags for categorization
- `iit` - Specific IIT or empty for all IITs (optional)
- `links` - Array of URLs (YouTube, Drive, etc.)
- `subject` - Subject name (required)
- `semester` - Semester/year (optional)
- `branch` - Academic branch (optional)
- `resourceType` - Enum: 'Video', 'Notes', 'Assignment', 'Book', 'Practice', 'Other'
- `status` - Enum: 'Pending', 'Approved', 'Rejected' (default: 'Pending')
- `rejectionReason` - Admin rejection reason (optional)

### API Endpoints
**File:** `backend/src/routes/study.routes.js`

```
GET    /api/study            - List approved study materials (with filters)
GET    /api/study/mine       - List my study posts (authenticated)
POST   /api/study            - Create new study material (authenticated)
```

**Query parameters for GET /api/study:**
- `subject` - Filter by subject
- `branch` - Filter by branch
- `semester` - Filter by semester

### Admin Endpoints
```
GET    /api/admin/approvals/pending  - Includes study posts
PUT    /api/admin/approvals/study/:id - Approve/reject study post
```

**Body for approval:**
```json
{
  "status": "Approved" | "Rejected",
  "rejectionReason": "Optional reason if rejected"
}
```

### Controller Functions
**File:** `backend/src/controllers/study.controller.js`
- `createStudyPost` - Create new study material
- `listApprovedStudy` - Get approved materials (with optional filters)
- `listMyStudy` - Get user's own study posts

---

## Admin Panel Updates

### Enhanced Statistics
**File:** `backend/src/controllers/admin.controller.js`

The `stats` endpoint now includes:
```json
{
  "totalUsers": 0,
  "totalPosts": 0,
  "pendingApprovals": 0,
  "pendingGallery": 0,
  "pendingPlacements": 0,
  "pendingEvents": 0,
  "pendingTravel": 0,      // NEW
  "pendingStudy": 0        // NEW
}
```

### Enhanced Pending Approvals
The `/api/admin/approvals/pending` endpoint now returns:
```json
{
  "gallery": [...],
  "placements": [...],
  "events": [...],
  "travel": [...],       // NEW
  "study": [...]         // NEW
}
```

### New Admin Functions
- `approveTravel` - Approve/reject travel posts
- `approveStudy` - Approve/reject study materials

### Admin Logging
New action types for admin logs:
- `APPROVE_TRAVEL` / `REJECT_TRAVEL`
- `APPROVE_STUDY` / `REJECT_STUDY`

---

## Server Configuration

### Updated Routes
**File:** `backend/src/server.js`

New route registrations:
```javascript
app.use('/api/travel', travelRoutes)
app.use('/api/study', studyRoutes)
```

---

## Testing Guide

### 1. Test Travel Posts

**Create a travel post:**
```bash
POST /api/travel
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "branch": "Computer Science",
  "batch": "2024",
  "travelMode": "Train",
  "seatDetails": "A1-23",
  "travelDate": "2026-02-15",
  "from": "Delhi",
  "to": "Mumbai",
  "notes": "Looking for travel companion",
  "contactPreference": "WhatsApp"
}
```

**List approved posts:**
```bash
GET /api/travel
```

**Admin approval:**
```bash
PUT /api/admin/approvals/travel/<post_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

### 2. Test Community Chat

**Get/create community conversation:**
```bash
POST /api/chat/community
Authorization: Bearer <token>
```

**Join via Socket.IO:**
```javascript
socket.emit('conversation:join', { conversationId: '<community_id>' })
socket.emit('message:send', { 
  conversationId: '<community_id>', 
  text: 'Hello everyone!' 
})
```

### 3. Test Study Materials

**Create study post:**
```bash
POST /api/study
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Data Structures Complete Course",
  "description": "Full DSA playlist covering all topics",
  "tags": ["algorithms", "coding", "interview"],
  "subject": "Data Structures",
  "semester": "3",
  "branch": "CSE",
  "resourceType": "Video",
  "links": ["https://youtube.com/playlist?list=..."]
}
```

**List with filters:**
```bash
GET /api/study?subject=Data%20Structures&branch=CSE
```

**Admin approval:**
```bash
PUT /api/admin/approvals/study/<post_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

---

## Migration Notes

### No Database Migration Required
All new features use separate collections:
- `travelposts`
- `studyposts`
- Existing `conversations` collection extended

### Backward Compatibility
- All existing endpoints remain unchanged
- Existing conversations (dm, group) continue to work
- No breaking changes to frontend

---

## Security Considerations

1. **Authentication Required** - All POST endpoints require valid JWT token
2. **Admin Approval** - Travel and Study posts require admin approval before being public
3. **User Profile Validation** - Travel posts require user to have IIT set in profile
4. **Content Limits** - Message text limited to 2000 characters
5. **Ban System** - Banned users cannot access any features including community chat

---

## Frontend Integration Tips

### Travel Posts UI
```javascript
// Fetch approved travel posts
const response = await fetch('/api/travel')
const { posts } = await response.json()

// Display with filters: date, travelMode, from/to
// Show contact preference for connection
```

### Community Chat UI
```javascript
// Get community conversation
const response = await fetch('/api/chat/community', { method: 'POST' })
const { conversation } = await response.json()

// Join socket room
socket.emit('conversation:join', { conversationId: conversation._id })

// Display as "All IITs Community" in chat list
```

### Study Materials UI
```javascript
// Fetch with filters
const response = await fetch('/api/study?subject=Physics&semester=2')
const { posts } = await response.json()

// Display with:
// - Tags as chips
// - Links as clickable buttons
// - Filter UI for subject/branch/semester
```

---

## Files Modified/Created

### New Files
1. `backend/src/models/TravelPost.js`
2. `backend/src/models/StudyPost.js`
3. `backend/src/controllers/travel.controller.js`
4. `backend/src/controllers/study.controller.js`
5. `backend/src/routes/travel.routes.js`
6. `backend/src/routes/study.routes.js`

### Modified Files
1. `backend/src/models/Conversation.js` - Added 'community' type
2. `backend/src/controllers/chat.controller.js` - Added getOrCreateCommunity
3. `backend/src/controllers/admin.controller.js` - Added travel/study approval
4. `backend/src/routes/chat.routes.js` - Added community route
5. `backend/src/routes/admin.routes.js` - Added travel/study approval routes
6. `backend/src/server.js` - Registered new routes
7. `backend/src/socket/index.js` - Updated for community chat support

---

## API Summary

### New Public Endpoints
- `GET /api/travel` - List approved travel posts
- `GET /api/study` - List approved study materials

### New Authenticated Endpoints
- `POST /api/travel` - Create travel post
- `GET /api/travel/mine` - My travel posts
- `POST /api/study` - Create study material
- `GET /api/study/mine` - My study posts
- `POST /api/chat/community` - Get/create community chat

### New Admin Endpoints
- `PUT /api/admin/approvals/travel/:id` - Approve/reject travel
- `PUT /api/admin/approvals/study/:id` - Approve/reject study material

---

## Success! 🎉

All three features have been successfully implemented with:
- ✅ Proper models with validation
- ✅ RESTful API endpoints
- ✅ Admin approval workflow
- ✅ Authentication & authorization
- ✅ Socket.IO real-time support for community chat
- ✅ Comprehensive documentation
- ✅ Syntax validation passed
- ✅ Backward compatibility maintained

Ready for frontend integration and deployment!
