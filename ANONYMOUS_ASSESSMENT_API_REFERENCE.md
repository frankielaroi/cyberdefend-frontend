# Quick Reference: Anonymous Assessment API

## Public Endpoints (No Authentication Required)

### Base URL Configuration
```javascript
// Environment variable
VITE_API_URL=http://localhost:3000/api/v1

// For public endpoints, remove /api/v1 suffix
const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
// Result: http://localhost:3000
```

---

## 1. Get Questions

**Endpoint**: `GET /defendx/questions`

**Full URL**: `http://localhost:3000/defendx/questions`

**Auth**: None required

**Response**:
```json
{
  "total": 30,
  "categories": [
    {
      "category": {
        "id": "cat-1",
        "name": "Data Protection",
        "description": "...",
        "weight": 20,
        "order": 1
      },
      "questions": [
        {
          "id": "q1",
          "text": "Do you have a data protection policy?",
          "type": "yes_no",
          "options": ["Yes", "No"],
          "weight": 5,
          "categoryId": "cat-1"
        }
      ]
    }
  ]
}
```

**React Hook**:
```javascript
import { useGetQuestionsQuery } from '../../store/api/realDefendXApi';

const { data, isLoading, error } = useGetQuestionsQuery();
const questions = data?.categories.flatMap(cat => cat.questions) || [];
```

---

## 2. Create Anonymous Assessment

**Endpoint**: `POST /defendx/assessments/anonymous`

**Full URL**: `http://localhost:3000/defendx/assessments/anonymous`

**Auth**: None required

**Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "id": "assessment-uuid",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "createdAt": "2025-01-15T10:00:00Z",
  "isAnonymous": true
}
```

**React Hook**:
```javascript
import { useCreateAnonymousAssessmentMutation } from '../../store/api/realDefendXApi';

const [createAssessment] = useCreateAnonymousAssessmentMutation();

const sessionId = crypto.randomUUID();
const result = await createAssessment({ sessionId }).unwrap();
```

---

## 3. Submit Anonymous Responses (Bulk)

**Endpoint**: `POST /defendx/assessments/{assessmentId}/responses/bulk/anonymous`

**Full URL**: `http://localhost:3000/defendx/assessments/{assessmentId}/responses/bulk/anonymous`

**Auth**: None required

**Request Body**:
```json
{
  "responses": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "questionId": "q1",
      "answer": "yes",
      "timeSpent": 30
    },
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "questionId": "q2",
      "answer": 4,
      "timeSpent": 45
    }
  ]
}
```

**Response**:
```json
{
  "message": "Responses submitted successfully"
}
```

**React Hook**:
```javascript
import { useSubmitAnonymousResponsesMutation } from '../../store/api/realDefendXApi';

const [submitResponses] = useSubmitAnonymousResponsesMutation();

await submitResponses({
  assessmentId,
  sessionId,
  responses: [
    { questionId: 'q1', answer: 'yes', timeSpent: 30 }
  ]
}).unwrap();
```

---

## 4. Complete Anonymous Assessment

**Endpoint**: `POST /defendx/assessments/{assessmentId}/complete/anonymous`

**Full URL**: `http://localhost:3000/defendx/assessments/{assessmentId}/complete/anonymous`

**Auth**: None required

**Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "assessmentId": "assessment-uuid",
  "score": 85,
  "tier": "A",
  "completedAt": "2025-01-15T10:30:00Z",
  "responses": 30,
  "questionsCount": 30,
  "isAnonymous": true
}
```

**React Hook**:
```javascript
import { useCompleteAnonymousAssessmentMutation } from '../../store/api/realDefendXApi';

const [completeAssessment] = useCompleteAnonymousAssessmentMutation();

const result = await completeAssessment({
  assessmentId,
  sessionId
}).unwrap();

console.log('Score:', result.score);
console.log('Tier:', result.tier);
```

---

## 5. Transfer Assessment to User Account

**Endpoint**: `POST /defendx/assessments/transfer`

**Full URL**: `http://localhost:3000/defendx/assessments/transfer`

**Auth**: ✅ **Required** (Bearer token)

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "organizationId": "org-uuid"  // optional
}
```

**Response**:
```json
{
  "id": "assessment-uuid",
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "transferredAt": "2025-01-15T11:00:00Z",
  "message": "Assessment transferred successfully"
}
```

**React Hook**:
```javascript
import { useTransferAnonymousAssessmentMutation } from '../../store/api/realDefendXApi';

const [transferAssessment] = useTransferAnonymousAssessmentMutation();

// After user logs in
await transferAssessment({
  sessionId,
  userId: currentUser.id
}).unwrap();

// Clean up localStorage
localStorage.removeItem('assessment_session_id');
localStorage.removeItem('assessment_id');
```

---

## Complete Flow Example

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetQuestionsQuery,
  useCreateAnonymousAssessmentMutation,
  useSubmitAnonymousResponsesMutation,
  useCompleteAnonymousAssessmentMutation,
} from '../../store/api/realDefendXApi';

function AnonymousAssessment() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  // 1. Fetch questions
  const { data: questionsData } = useGetQuestionsQuery();
  const questions = questionsData?.categories.flatMap(cat => cat.questions) || [];

  // 2. Create mutations
  const [createAssessment] = useCreateAnonymousAssessmentMutation();
  const [submitResponses] = useSubmitAnonymousResponsesMutation();
  const [completeAssessment] = useCompleteAnonymousAssessmentMutation();

  // 3. Initialize assessment
  useEffect(() => {
    const init = async () => {
      const sid = crypto.randomUUID();
      setSessionId(sid);
      
      const result = await createAssessment({ sessionId: sid }).unwrap();
      setAssessmentId(result.id);
    };
    init();
  }, []);

  // 4. Handle answer selection
  const handleAnswer = (answer) => {
    const newResponse = {
      questionId: questions[currentIndex].id,
      answer,
      timeSpent: 30
    };
    setResponses([...responses, newResponse]);
  };

  // 5. Handle next/complete
  const handleNext = async () => {
    // Submit response
    await submitResponses({
      assessmentId,
      sessionId,
      responses: [responses[responses.length - 1]]
    });

    if (currentIndex === questions.length - 1) {
      // Complete assessment
      const result = await completeAssessment({
        assessmentId,
        sessionId
      }).unwrap();
      
      // Show results
      console.log('Score:', result.score);
      console.log('Tier:', result.tier);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      {/* Render question UI */}
    </div>
  );
}
```

---

## cURL Examples

### 1. Get Questions
```bash
curl http://localhost:3000/defendx/questions
```

### 2. Create Assessment
```bash
SESSION_ID=$(uuidgen)
curl -X POST http://localhost:3000/defendx/assessments/anonymous \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\"}"
```

### 3. Submit Responses
```bash
curl -X POST http://localhost:3000/defendx/assessments/ASSESSMENT_ID/responses/bulk/anonymous \
  -H "Content-Type: application/json" \
  -d '{
    "responses": [
      {
        "sessionId": "SESSION_ID",
        "questionId": "q1",
        "answer": "yes",
        "timeSpent": 30
      }
    ]
  }'
```

### 4. Complete Assessment
```bash
curl -X POST http://localhost:3000/defendx/assessments/ASSESSMENT_ID/complete/anonymous \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\"}"
```

### 5. Transfer (with auth)
```bash
curl -X POST http://localhost:3000/defendx/assessments/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sessionId": "SESSION_ID",
    "userId": "user-uuid"
  }'
```

---

## Key Differences: Public vs Protected Endpoints

| Feature | Public Endpoints | Protected Endpoints |
|---------|------------------|---------------------|
| Base URL | `http://localhost:3000` | `http://localhost:3000/api/v1` |
| Auth Required | ❌ No | ✅ Yes (Bearer token) |
| Prefix | `/defendx/...` | `/api/v1/...` |
| CORS | Must be enabled | Configured with auth |
| Rate Limiting | May be applied | User-based limits |

---

## Troubleshooting

### ❌ 404 Not Found
**Issue**: Endpoint returns 404
**Fix**: Verify URL doesn't include `/api/v1` prefix for public endpoints

### ❌ CORS Error
**Issue**: Browser blocks request
**Fix**: Ensure backend CORS allows your frontend origin

### ❌ Questions Not Loading
**Issue**: Empty response or error
**Fix**: Check backend is running, verify endpoint in Network tab

### ❌ Assessment Not Creating
**Issue**: Create endpoint fails
**Fix**: Verify sessionId is a valid UUID format

---

## Notes

- **Session ID**: Use `crypto.randomUUID()` or `uuid.v4()` to generate
- **Storage**: Save sessionId and assessmentId to localStorage
- **Cleanup**: Remove localStorage data after successful transfer
- **Error Handling**: Always wrap API calls in try-catch
- **Progress**: Submit responses incrementally for better UX
