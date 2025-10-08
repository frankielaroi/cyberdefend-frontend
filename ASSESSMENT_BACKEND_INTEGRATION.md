# Assessment System Backend Integration Guide

## Overview

The frontend has been fully integrated with real backend endpoints for the comprehensive Cyber Safety Index (CSI) assessment system. This document outlines the complete API specification and integration details.

## API Endpoints Summary

### Assessment Management
```
POST   /api/v1/assessments                          // Create/start assessment
POST   /api/v1/assessments/{id}/submit              // Submit responses
GET    /api/v1/assessments                          // Get assessment history
GET    /api/v1/assessments/{id}                     // Get assessment details
GET    /api/v1/assessments/{id}/result              // Get assessment results
GET    /api/v1/assessments/{id}/report              // Download reports
GET    /api/v1/assessments/latest-result            // Get latest CSI score
GET    /api/v1/assessments/dashboard                // Dashboard data
POST   /api/v1/assessments/{id}/complete            // Mark as completed
PUT    /api/v1/assessments/{id}/progress            // Save progress
POST   /api/v1/assessments/{id}/cancel              // Cancel assessment
```

### CSI Directory (Public Results)
```
GET    /api/v1/csi-directory                        // Browse public results
GET    /api/v1/csi-directory/leaderboard            // Top performers
GET    /api/v1/csi-directory/heatmap                // Geographic visualization
GET    /api/v1/csi-directory/trends                 // Trend analysis
GET    /api/v1/csi-directory/profile/{id}           // Organization profile
GET    /api/v1/csi-directory/search                 // Search directory
GET    /api/v1/csi-directory/filters                // Available filters
GET    /api/v1/csi-directory/export                 // Export data
GET    /api/v1/csi-directory/insights               // Analytics insights
```

### Statistics & Benchmarking
```
GET    /api/v1/statistics/regional                  // Regional statistics
GET    /api/v1/statistics/sectoral                  // Sector statistics
GET    /api/v1/statistics/benchmarking              // Organization benchmarks
GET    /api/v1/statistics/maturity                  // Maturity metrics
GET    /api/v1/statistics/threat-landscape          // Threat analysis
GET    /api/v1/statistics/compliance                // Compliance metrics
GET    /api/v1/statistics/trends                    // Historical trends
GET    /api/v1/statistics/export/{type}             // Export statistics
GET    /api/v1/statistics/dashboard                 // Statistics dashboard
```

## Assessment Lifecycle

### 1. **Start Assessment** - `POST /api/v1/assessments`

**Frontend Implementation:**
```typescript
// AssessmentDashboard.tsx
const [startAssessmentMutation] = useStartAssessmentMutation();

const handleStartAssessment = async () => {
  const result = await startAssessmentMutation({
    title: 'Cyber Safety Index Assessment',
    description: 'Comprehensive cybersecurity readiness evaluation',
    type: 'CSI_ASSESSMENT'
  }).unwrap();
  
  // Result contains assessment + questions
  dispatch(startAssessment(result.data));
};
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "assess_abc123",
      "organizationId": "org_xyz789",
      "title": "Cyber Safety Index Assessment",
      "type": "CSI_ASSESSMENT",
      "status": "in_progress",
      "startedAt": "2024-01-01T12:00:00Z",
      "totalQuestions": 45,
      "estimatedDuration": 25
    },
    "questions": [
      {
        "id": "q_001",
        "category": "Access Control",
        "text": "Does your organization enforce multi-factor authentication?",
        "type": "yes_no",
        "weight": 3,
        "options": ["Yes", "No"]
      }
    ]
  }
}
```

### 2. **Submit Assessment** - `POST /api/v1/assessments/{id}/submit`

**Frontend Implementation:**
```typescript
// AssessmentQuestionnaire.tsx
const [submitAssessment] = useSubmitAssessmentMutation();

const handleSubmit = async () => {
  const result = await submitAssessment({
    assessmentId: currentAssessment.id,
    responses: [
      { questionId: "q_001", answer: "Yes" },
      { questionId: "q_002", answer: 4 }
    ]
  }).unwrap();
  
  setResults(result.data);
};
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "result_def456",
    "score": 78,
    "tier": "B",
    "completedAt": "2024-01-01T12:30:00Z",
    "breakdown": [
      {
        "category": "Access Control",
        "score": 85,
        "maxScore": 100,
        "percentage": 85,
        "weight": 25
      }
    ],
    "recommendations": [
      {
        "title": "Enhance Network Monitoring",
        "description": "Implement continuous network monitoring",
        "priority": "high",
        "category": "Network Security"
      }
    ],
    "benchmark": {
      "sector": { "average": 72, "percentile": 75 },
      "region": { "average": 68, "percentile": 80 },
      "national": { "average": 70, "percentile": 78 }
    }
  }
}
```

### 3. **Assessment History** - `GET /api/v1/assessments`

**Frontend Implementation:**
```typescript
// AssessmentDashboard.tsx
const { data: assessments } = useGetOrganizationAssessmentsQuery({
  page: 1,
  limit: 10,
  status: 'completed'
});
```

### 4. **Latest CSI Result** - `GET /api/v1/assessments/latest-result`

**Frontend Implementation:**
```typescript
const { data: latestResult } = useGetLatestCSIResultQuery();
```

## CSI Directory Integration

### **Browse Directory** - `GET /api/v1/csi-directory`

**Frontend Implementation:**
```typescript
// CSIDirectory.tsx
const { data: directoryData } = useGetCSIDirectoryQuery({
  page: 1,
  limit: 20,
  sector: 'TECHNOLOGY',
  region: 'Greater Accra',
  minScore: 70
});
```

### **Heatmap Data** - `GET /api/v1/csi-directory/heatmap`

**Frontend Implementation:**
```typescript
const { data: heatmapData } = useGetCSIHeatmapQuery();
```

## Statistics & Benchmarking

### **Regional Statistics** - `GET /api/v1/statistics/regional`

**Frontend Implementation:**
```typescript
const { data: regionalStats } = useGetRegionalStatsQuery({
  includeHistorical: true,
  timeframe: 'quarterly'
});
```

### **Benchmarking Data** - `GET /api/v1/statistics/benchmarking`

**Frontend Implementation:**
```typescript
const { data: benchmarks } = useGetBenchmarkingDataQuery({
  includeRecommendations: true,
  peerCount: 5
});
```

## Enhanced Features

### **Auto-Save Progress**
```typescript
// Automatically save progress every 30 seconds
const [saveProgress] = useSaveAssessmentProgressMutation();

useEffect(() => {
  const interval = setInterval(async () => {
    if (currentAssessment && responses.length > 0) {
      await saveProgress({
        assessmentId: currentAssessment.id,
        responses,
        currentQuestionIndex
      });
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, [responses, currentQuestionIndex]);
```

### **Resume Assessment**
```typescript
const { data: resumeData } = useResumeAssessmentQuery(assessmentId, {
  skip: !assessmentId
});
```

### **Report Downloads**
```typescript
const [downloadReport] = useLazyDownloadAssessmentReportQuery();

const handleDownloadReport = async (format: 'pdf' | 'html') => {
  const blob = await downloadReport({
    assessmentId: assessment.id,
    format
  }).unwrap();
  
  // Handle blob download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `assessment-report.${format}`;
  link.click();
};
```

## Data Flow Architecture

### **State Management**
The frontend uses Redux for assessment state:
```typescript
// defendxSlice.ts
interface DefendXState {
  currentAssessment: Assessment | null;
  currentQuestions: Question[];
  responses: AssessmentResponse[];
  currentQuestionIndex: number;
  isLoading: boolean;
}
```

### **Real-time Updates**
- Auto-save progress every 30 seconds
- Token refresh during long assessments
- Network error recovery
- Session timeout handling

## Error Handling Patterns

### **Network Errors**
```typescript
try {
  const result = await submitAssessment(data).unwrap();
  // Success handling
} catch (error: any) {
  if (error.status === 'FETCH_ERROR') {
    // Network connectivity issues
    showRetryDialog();
  } else if (error.status === 401) {
    // Token expired, handled by apiSlice
    redirectToLogin();
  } else {
    // Other API errors
    showErrorMessage(error.data?.message);
  }
}
```

### **Validation Errors**
```typescript
// Backend returns validation errors
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "responses[0].answer",
      "message": "Answer is required for this question"
    }
  ]
}
```

## Security Considerations

### **Access Control**
- All endpoints require authentication
- Organization-scoped data access
- Role-based permissions for advanced features

### **Data Privacy**
- Assessment responses are encrypted
- Public directory requires opt-in
- Anonymized benchmarking data

### **Rate Limiting**
- Assessment creation: 10 per hour
- API calls: 1000 per hour per organization
- Report downloads: 50 per day

## Performance Optimization

### **Caching Strategy**
- Assessment results cached for 1 hour
- Statistics cached for 4 hours
- Directory data cached for 2 hours

### **Pagination**
- Directory: 20 items per page
- Assessment history: 10 items per page
- Statistics: Configurable limits

### **Background Processing**
- Score calculation: Async processing
- Report generation: Queue-based
- Email notifications: Event-driven

## Testing Integration

### **Test Assessment Flow**
1. **Create test organization** with demo data
2. **Start assessment** with sample questions
3. **Submit responses** with various answer types
4. **Verify scoring** algorithm and tier assignment
5. **Check benchmarking** against test data
6. **Download reports** in different formats

### **Test Data Requirements**
- Sample questions for each category
- Mock responses for scoring validation
- Test organizations for benchmarking
- Regional/sectoral test data

## Next Steps

1. **Backend Implementation**: Implement all endpoints according to specification
2. **Database Setup**: Create tables for assessments, questions, responses, results
3. **Scoring Engine**: Implement weighted scoring algorithm
4. **Report Generator**: Set up PDF/HTML report generation
5. **Statistics Engine**: Implement benchmarking and analytics
6. **Testing**: End-to-end testing of assessment lifecycle

The frontend is fully prepared for backend integration with comprehensive error handling, real-time features, and scalable architecture!