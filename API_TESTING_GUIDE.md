# API Testing Guide for New Features

## Prerequisites
- Server running on http://localhost:5000 (or your configured port)
- Valid JWT token for authenticated requests
- Admin JWT token for admin requests

## Setup
```bash
# Set environment variables
export API_URL="http://localhost:5000"
export USER_TOKEN="your_user_jwt_token_here"
export ADMIN_TOKEN="your_admin_jwt_token_here"
```

---

## 1. Travel Companion System Tests

### Create Travel Post
```bash
curl -X POST "${API_URL}/api/travel" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Kumar",
    "branch": "Computer Science",
    "batch": "2024",
    "travelMode": "Train",
    "seatDetails": "A1-23",
    "travelDate": "2026-02-15T10:00:00.000Z",
    "from": "Delhi",
    "to": "Mumbai",
    "notes": "Looking for travel companion, can share cab from station",
    "contactPreference": "WhatsApp"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "post": {
    "_id": "...",
    "name": "Rahul Kumar",
    "status": "Pending",
    ...
  }
}
```

### List My Travel Posts
```bash
curl -X GET "${API_URL}/api/travel/mine" \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

### List Approved Travel Posts (Public)
```bash
curl -X GET "${API_URL}/api/travel"
```

### Admin: Approve Travel Post
```bash
curl -X PUT "${API_URL}/api/admin/approvals/travel/<post_id>" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved"
  }'
```

### Admin: Reject Travel Post
```bash
curl -X PUT "${API_URL}/api/admin/approvals/travel/<post_id>" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Rejected",
    "rejectionReason": "Incomplete information"
  }'
```

---

## 2. Study Materials Hub Tests

### Create Study Material Post
```bash
curl -X POST "${API_URL}/api/study" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Data Structures and Algorithms Course",
    "description": "Comprehensive playlist covering all DSA topics from basics to advanced",
    "tags": ["algorithms", "coding", "interview-prep", "competitive-programming"],
    "iit": "IIT Bombay",
    "subject": "Data Structures",
    "semester": "3",
    "branch": "CSE",
    "resourceType": "Video",
    "links": [
      "https://youtube.com/playlist?list=PLeo1K3hjS3uu_n_a__MI_KktGTLYopZ12",
      "https://drive.google.com/drive/folders/..."
    ]
  }'
```

### Create Assignment Resource
```bash
curl -X POST "${API_URL}/api/study" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Linear Algebra Practice Problems",
    "description": "50+ solved problems with detailed explanations",
    "tags": ["mathematics", "linear-algebra", "practice"],
    "subject": "Mathematics",
    "semester": "1",
    "branch": "",
    "resourceType": "Assignment",
    "links": ["https://drive.google.com/file/d/..."]
  }'
```

### List Approved Study Materials (No Filter)
```bash
curl -X GET "${API_URL}/api/study"
```

### List with Subject Filter
```bash
curl -X GET "${API_URL}/api/study?subject=Data%20Structures"
```

### List with Multiple Filters
```bash
curl -X GET "${API_URL}/api/study?subject=Mathematics&branch=CSE&semester=1"
```

### List My Study Posts
```bash
curl -X GET "${API_URL}/api/study/mine" \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

### Admin: Approve Study Post
```bash
curl -X PUT "${API_URL}/api/admin/approvals/study/<post_id>" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved"
  }'
```

---

## 3. Community Chat Tests

### Get or Create Community Conversation
```bash
curl -X POST "${API_URL}/api/chat/community" \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

**Expected Response:**
```json
{
  "success": true,
  "conversation": {
    "_id": "...",
    "type": "community",
    "title": "IIT Community - All IITs",
    "participants": [],
    ...
  }
}
```

### List All Conversations (Including Community)
```bash
curl -X GET "${API_URL}/api/chat/conversations" \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

### Get Community Messages
```bash
curl -X GET "${API_URL}/api/chat/messages/<community_conversation_id>" \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

---

## 4. Admin Dashboard Tests

### Get Enhanced Statistics
```bash
curl -X GET "${API_URL}/api/admin/stats" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalPosts": 450,
    "pendingApprovals": 12,
    "pendingGallery": 3,
    "pendingPlacements": 2,
    "pendingEvents": 1,
    "pendingTravel": 4,
    "pendingStudy": 2
  }
}
```

### Get All Pending Approvals
```bash
curl -X GET "${API_URL}/api/admin/approvals/pending" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

**Expected Response:**
```json
{
  "success": true,
  "gallery": [...],
  "placements": [...],
  "events": [...],
  "travel": [...],
  "study": [...]
}
```

---

## 5. Socket.IO Community Chat Test

### JavaScript Client Example
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    Cookie: `accessToken=${YOUR_JWT_TOKEN}`
  }
})

// Get community conversation ID first
const response = await fetch('http://localhost:5000/api/chat/community', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${YOUR_JWT_TOKEN}`
  }
})
const { conversation } = await response.json()
const communityId = conversation._id

// Join community room
socket.emit('conversation:join', { conversationId: communityId })

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('New message:', message)
})

// Send a message
socket.emit('message:send', {
  conversationId: communityId,
  text: 'Hello everyone from all IITs!'
})

// Typing indicator
socket.emit('conversation:typing', {
  conversationId: communityId,
  isTyping: true
})
```

---

## 6. Integration Test Scenarios

### Scenario 1: Complete Travel Post Lifecycle
```bash
# 1. User creates travel post
POST_RESPONSE=$(curl -s -X POST "${API_URL}/api/travel" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","branch":"CSE","batch":"2024","travelMode":"Train","travelDate":"2026-03-01","from":"Delhi","to":"Mumbai"}')

POST_ID=$(echo $POST_RESPONSE | jq -r '.post._id')

# 2. Verify it's in pending
curl "${API_URL}/api/admin/approvals/pending" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

# 3. Admin approves
curl -X PUT "${API_URL}/api/admin/approvals/travel/${POST_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'

# 4. Verify it's in public list
curl "${API_URL}/api/travel"
```

### Scenario 2: Study Material with Filters
```bash
# Create multiple study materials
curl -X POST "${API_URL}/api/study" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Physics Notes","subject":"Physics","semester":"2","branch":"ECE","resourceType":"Notes","links":["https://..."]}'

curl -X POST "${API_URL}/api/study" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Chemistry Videos","subject":"Chemistry","semester":"1","branch":"","resourceType":"Video","links":["https://..."]}'

# Filter by subject
curl "${API_URL}/api/study?subject=Physics"

# Filter by branch
curl "${API_URL}/api/study?branch=ECE"
```

---

## Testing Checklist

### Travel Feature
- [ ] Create travel post (authenticated)
- [ ] View own travel posts
- [ ] Public cannot see pending posts
- [ ] Admin can see pending posts
- [ ] Admin can approve posts
- [ ] Admin can reject posts with reason
- [ ] Approved posts visible publicly
- [ ] Posts sorted by travel date

### Study Feature
- [ ] Create study material (authenticated)
- [ ] View own study posts
- [ ] Filter by subject
- [ ] Filter by branch
- [ ] Filter by semester
- [ ] Multiple filters work together
- [ ] Admin approval workflow
- [ ] Links array stored correctly

### Community Chat
- [ ] Create/get community conversation
- [ ] Community appears in conversation list
- [ ] Can send messages without being in participants
- [ ] Messages received in real-time
- [ ] Multiple users can join
- [ ] Banned users cannot send messages

### Admin Panel
- [ ] Stats include new post types
- [ ] Pending approvals include travel/study
- [ ] Can approve/reject travel posts
- [ ] Can approve/reject study posts
- [ ] Admin logs record new actions

---

## Common Issues & Solutions

### Issue: "Set your IIT in profile before posting"
**Solution:** Update user profile with IIT:
```bash
curl -X PUT "${API_URL}/api/profile" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"iit": "IIT Bombay"}'
```

### Issue: 401 Unauthorized
**Solution:** Check if JWT token is valid and not expired

### Issue: 403 Forbidden on admin endpoints
**Solution:** Ensure user role is 'admin' in database

### Issue: Cannot send messages in community
**Solution:** Ensure user is authenticated and not banned

---

## Postman Collection Import

You can import these tests into Postman. Create a collection with:

**Variables:**
- `base_url`: http://localhost:5000
- `user_token`: Your user JWT
- `admin_token`: Your admin JWT

Then add the requests above as individual items.

---

## Performance Testing

### Load Test Community Chat
```bash
# Use artillery or similar tool
artillery quick --count 50 --num 100 \
  http://localhost:5000/api/chat/community
```

### Stress Test Approvals
```bash
# Create 100 travel posts
for i in {1..100}; do
  curl -X POST "${API_URL}/api/travel" \
    -H "Authorization: Bearer ${USER_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User$i\",\"branch\":\"CSE\",\"batch\":\"2024\",\"travelMode\":\"Train\",\"travelDate\":\"2026-03-01\",\"from\":\"Delhi\",\"to\":\"Mumbai\"}"
done
```

---

Happy Testing! 🧪
