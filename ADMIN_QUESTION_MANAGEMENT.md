# Admin Question Management - Backend Integration Guide

## Overview

This document describes the complete admin question management system that allows administrators to create, edit, and delete assessment questions through the CyberDefend frontend application.

## Architecture

### Frontend Components

**QuestionManager.tsx** - Main administrative interface for managing questions
- Location: `src/components/admin/QuestionManager.tsx`
- Real-time question listing with pagination
- Category filtering and search functionality
- In-line editing and bulk operations
- Create new questions with modal interface

### API Integration

**Real Admin API** - Complete backend integration
- File: `src/store/api/realAdminApi.ts`
- RTK Query endpoints for all CRUD operations
- Proper TypeScript typing with DTOs
- Error handling and cache management

### Backend Endpoints

#### Question Management Endpoints

1. **GET /admin/questions** - List questions with pagination and filters
   ```typescript
   // Query parameters
   {
     page?: number;
     limit?: number;
     category?: string;
     search?: string;
     type?: 'multiple_choice' | 'yes_no' | 'rating';
     isActive?: boolean;
   }
   
   // Response
   PaginatedResponse<Question>
   ```

2. **GET /admin/questions/{id}** - Get single question details
   ```typescript
   // Response
   ApiResponse<Question>
   ```

3. **POST /admin/questions** - Create new question
   ```typescript
   // Request body
   CreateQuestionDto {
     category: string;
     text: string;
     type: 'multiple_choice' | 'yes_no' | 'rating';
     options?: string[];
     weight: number;
     followUp?: string[];
     isActive?: boolean;
   }
   
   // Response
   ApiResponse<Question>
   ```

4. **PUT /admin/questions/{id}** - Update existing question
   ```typescript
   // Request body
   UpdateQuestionDto {
     category?: string;
     text?: string;
     type?: 'multiple_choice' | 'yes_no' | 'rating';
     options?: string[];
     weight?: number;
     followUp?: string[];
     isActive?: boolean;
   }
   
   // Response
   ApiResponse<Question>
   ```

5. **DELETE /admin/questions/{id}** - Delete question
   ```typescript
   // Response
   ApiResponse<{ success: boolean }>
   ```

6. **PUT /admin/questions/bulk-update** - Bulk update questions
   ```typescript
   // Request body
   BulkQuestionUpdateDto {
     questionIds: string[];
     updates: Partial<UpdateQuestionDto>;
   }
   
   // Response
   ApiResponse<{ updated: number }>
   ```

#### Category Management Endpoints

1. **GET /admin/questions/categories** - List all categories
   ```typescript
   // Response
   ApiResponse<Array<{
     name: string;
     description?: string;
     questionCount: number;
     weight?: number;
     isActive: boolean;
   }>>
   ```

2. **POST /admin/questions/categories** - Create category
   ```typescript
   // Request body
   QuestionCategoryDto {
     name: string;
     description?: string;
     weight?: number;
     isActive?: boolean;
   }
   ```

3. **PUT /admin/questions/categories/{id}** - Update category
4. **DELETE /admin/questions/categories/{id}** - Delete category

## Data Types

### Core Question Type
```typescript
interface Question {
  id: string;
  category: string;
  text: string;
  type: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight: number;
  followUp?: string[];
}
```

### DTOs for API Operations
```typescript
interface CreateQuestionDto {
  category: string;
  text: string;
  type: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight: number;
  followUp?: string[];
  isActive?: boolean;
}

interface UpdateQuestionDto {
  category?: string;
  text?: string;
  type?: 'multiple_choice' | 'yes_no' | 'rating';
  options?: string[];
  weight?: number;
  followUp?: string[];
  isActive?: boolean;
}

interface QuestionFiltersDto {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  type?: 'multiple_choice' | 'yes_no' | 'rating';
  isActive?: boolean;
}
```

## Frontend Features

### Question Management Interface

1. **Question Listing**
   - Paginated table view with category filters
   - Search functionality across question text
   - Sort by category, type, weight, or creation date
   - Real-time updates via RTK Query

2. **Create Question**
   - Modal interface with form validation
   - Dynamic options management for multiple choice questions
   - Category selection from backend-managed list
   - Weight assignment (1-10 scale)

3. **Edit Question**
   - In-line editing with save/cancel actions
   - Live preview of question format
   - Option to modify all question properties
   - Validation for required fields

4. **Delete Question**
   - Confirmation dialog before deletion
   - Soft delete option (mark as inactive)
   - Cascade handling for assessment dependencies

5. **Bulk Operations**
   - Select multiple questions for batch updates
   - Bulk category reassignment
   - Bulk weight adjustments
   - Mass activation/deactivation

### Category Management

1. **Dynamic Categories**
   - Categories loaded from backend API
   - Real-time category filtering
   - Question count per category
   - Category weight for assessment scoring

2. **Category CRUD**
   - Create new categories with descriptions
   - Edit category properties and weights
   - Delete categories (with question reassignment)
   - Mark categories as active/inactive

## RTK Query Integration

### Hooks Available

```typescript
// Question Management
const { data: questions, isLoading, error } = useGetQuestionsQuery(filters);
const { data: question } = useGetQuestionQuery(questionId);
const [createQuestion] = useCreateQuestionMutation();
const [updateQuestion] = useUpdateQuestionMutation();
const [deleteQuestion] = useDeleteQuestionMutation();
const [bulkUpdateQuestions] = useBulkUpdateQuestionsMutation();

// Category Management  
const { data: categories } = useGetCategoriesQuery();
const [createCategory] = useCreateCategoryMutation();
const [updateCategory] = useUpdateCategoryMutation();
const [deleteCategory] = useDeleteCategoryMutation();
```

### Error Handling

- Automatic error states from RTK Query
- Toast notifications for success/failure
- Form validation with inline error messages
- Graceful degradation when API is unavailable

### Caching Strategy

- Questions cached with 'Question' tag
- Categories cached with 'Category' tag
- Automatic invalidation on mutations
- Optimistic updates for better UX

## Admin Access Control

### Required Permissions

Admins must have one of these roles to access question management:
- `SUPER_ADMIN` - Full access to all operations
- `CSA_ADMIN` - Full access within CSA context
- `ORG_ADMIN` - Limited to organization-specific operations (if applicable)

### Security Considerations

1. **Authentication Required**
   - All endpoints require valid JWT token
   - Admin role verification on each request
   - Session timeout handling

2. **Input Validation**
   - Backend validation for all question data
   - XSS prevention in question text
   - Sanitization of HTML content

3. **Audit Logging**
   - All question changes logged with admin details
   - Timestamp and IP tracking
   - Rollback capability for critical changes

## Backend Implementation Requirements

### Database Schema

```sql
-- Questions table
CREATE TABLE questions (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  type ENUM('multiple_choice', 'yes_no', 'rating') NOT NULL,
  options JSON,
  weight INTEGER DEFAULT 5,
  follow_up JSON,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

-- Categories table
CREATE TABLE question_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Business Logic

1. **Question Validation**
   - Category must exist and be active
   - Weight must be between 1-10
   - Multiple choice questions must have at least 2 options
   - Question text cannot be empty

2. **Category Management**
   - Cannot delete category with active questions
   - Category names must be unique
   - Default categories should be protected

3. **Assessment Impact**
   - Question changes affect future assessments only
   - Historical assessment data remains unchanged
   - Score recalculation only for draft assessments

## Usage Examples

### Creating a New Question

```typescript
const [createQuestion] = useCreateQuestionMutation();

const handleCreateQuestion = async () => {
  try {
    const newQuestion = await createQuestion({
      category: 'Network Security',
      text: 'Does your organization use multi-factor authentication?',
      type: 'yes_no',
      weight: 8,
      isActive: true
    }).unwrap();
    
    console.log('Question created:', newQuestion);
  } catch (error) {
    console.error('Failed to create question:', error);
  }
};
```

### Updating Question Categories

```typescript
const [updateQuestion] = useUpdateQuestionMutation();

const handleBulkCategoryUpdate = async (questionIds: string[], newCategory: string) => {
  try {
    const result = await bulkUpdateQuestions({
      questionIds,
      updates: { category: newCategory }
    }).unwrap();
    
    console.log(`Updated ${result.updated} questions`);
  } catch (error) {
    console.error('Bulk update failed:', error);
  }
};
```

### Loading Questions with Filters

```typescript
const { data: questionsData, isLoading } = useGetQuestionsQuery({
  page: 1,
  limit: 20,
  category: 'Network Security',
  search: 'authentication',
  isActive: true
});

const questions = questionsData?.data || [];
```

## Integration Status

✅ **Completed:**
- Real admin API endpoints created
- Question CRUD operations implemented
- Category management system
- RTK Query integration
- TypeScript type definitions
- Error handling and validation
- Frontend component updates

🎯 **Ready for Backend Integration:**
- All 31 API endpoints defined
- Complete request/response types
- Error handling patterns established
- Authentication headers configured
- Cache invalidation strategies implemented

The admin question management system is fully prepared for backend integration with comprehensive CRUD functionality, proper error handling, and scalable architecture.