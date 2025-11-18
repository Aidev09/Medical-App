# Medical App API Documentation

This document provides comprehensive information about all available API endpoints in the Medical App backend.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Medications](#medications)
- [Health Metrics](#health-metrics)
- [Diet & Nutrition](#diet--nutrition)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1234567890"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google-id-token"
}
```

### Firebase Authentication
```http
POST /api/auth/firebase
Content-Type: application/json

{
  "firebaseToken": "firebase-id-token"
}
```

### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "newPassword123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

## User Management

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

### Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01"
}
```

### Get Preferences
```http
GET /api/users/preferences
Authorization: Bearer <jwt-token>
```

### Update Preferences
```http
PATCH /api/users/preferences
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "timezone": "America/New_York",
  "units": {
    "weight": "kg",
    "height": "cm",
    "temperature": "celsius"
  },
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "medicationReminders": true,
    "healthAlerts": true
  }
}
```

### Upload Profile Picture
```http
POST /api/users/profile-picture
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

image: <file>
```

### Delete Account
```http
DELETE /api/users/delete-account
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "password": "current-password",
  "confirmation": "DELETE_ACCOUNT"
}
```

### Get Statistics
```http
GET /api/users/stats
Authorization: Bearer <jwt-token>
```

### Export Data
```http
GET /api/users/export-data
Authorization: Bearer <jwt-token>
```

## Medications

### Get Medications
```http
GET /api/medications?active=true&page=1&limit=10
Authorization: Bearer <jwt-token>
```

### Create Medication
```http
POST /api/medications
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Aspirin",
  "dosage": "81mg",
  "frequency": "once",
  "startDate": "2024-01-01",
  "endDate": "2024-06-01",
  "reminders": [
    {
      "time": "09:00",
      "days": [0, 1, 2, 3, 4, 5, 6],
      "enabled": true
    }
  ],
  "notes": "Take with food"
}
```

### Get Medication by ID
```http
GET /api/medications/{id}
Authorization: Bearer <jwt-token>
```

### Update Medication
```http
PATCH /api/medications/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Aspirin",
  "active": false
}
```

### Delete Medication
```http
DELETE /api/medications/{id}
Authorization: Bearer <jwt-token>
```

### Record Medication Intake
```http
POST /api/medications/{id}/take
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "notes": "Taken with water",
  "takenAt": "2024-01-01T09:00:00Z"
}
```

### Search Medications
```http
GET /api/medications/search/{query}?limit=10
Authorization: Bearer <jwt-token>
```

### Get Due Medications
```http
GET /api/medications/due
Authorization: Bearer <jwt-token>
```

### Get Medication Statistics
```http
GET /api/medications/stats
Authorization: Bearer <jwt-token>
```

## Health Metrics

### Get Health Metrics
```http
GET /api/health/metrics?type=bloodPressure&startDate=2024-01-01&endDate=2024-01-31&limit=50
Authorization: Bearer <jwt-token>
```

### Create Health Metric
```http
POST /api/health/metrics
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "type": "bloodPressure",
  "value": 120,
  "unit": "mmHg",
  "metadata": {
    "systolic": 120,
    "diastolic": 80,
    "position": "sitting"
  },
  "notes": "Morning measurement",
  "source": "manual"
}
```

### Get Metric Summary
```http
GET /api/health/metrics/{type}/summary?period=month
Authorization: Bearer <jwt-token>
```

### Delete Health Metric
```http
DELETE /api/health/metrics/{id}
Authorization: Bearer <jwt-token>
```

### Export Health Data
```http
GET /api/health/export?format=csv&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt-token>
```

### Get Latest Metrics
```http
GET /api/health/latest
Authorization: Bearer <jwt-token>
```

### Get Health Goals
```http
GET /api/health/goals
Authorization: Bearer <jwt-token>
```

## Diet & Nutrition

### Get Diet Plans
```http
GET /api/diet/plans
Authorization: Bearer <jwt-token>
```

### Create Diet Plan
```http
POST /api/diet/plans
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Weight Loss Plan",
  "targetCalories": 2000,
  "dietaryRestrictions": ["vegetarian"],
  "preferences": {
    "vegetarian": true,
    "glutenFree": false
  }
}
```

### Calculate BMR and TDEE
```http
GET /api/diet/calculator?weight=70&height=175&age=30&gender=male&activityLevel=moderately_active
Authorization: Bearer <jwt-token>
```

### Log Meal
```http
POST /api/diet/meal-log
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "meal": "breakfast",
  "foods": [
    {
      "name": "Oatmeal",
      "quantity": 1,
      "unit": "cup",
      "calories": 150
    }
  ],
  "calories": 150,
  "timestamp": "2024-01-01T08:00:00Z"
}
```

### Get Meal Suggestions
```http
GET /api/diet/meal-suggestions?mealType=breakfast&calories=400&dietaryRestrictions=vegetarian
Authorization: Bearer <jwt-token>
```

### Get Nutrition Summary
```http
GET /api/diet/nutrition-summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt-token>
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

### Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Rate Limiting

- Global rate limit: 100 requests per 15 minutes per IP
- API-specific rate limits may vary

## Response Headers

All responses include CORS headers for cross-origin requests.

## Pagination

List endpoints support pagination with `page` and `limit` query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Filtering

Many endpoints support filtering via query parameters. Available filters are documented in each endpoint section.

## Date Formats

- Dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`

## Email Format

Email addresses must be valid email format and will be automatically converted to lowercase.

## Password Requirements

- Minimum 8 characters
- Must contain at least one uppercase letter, one lowercase letter, one number, and one special character

## Environment Variables

See `.env.example` for all required environment variables.