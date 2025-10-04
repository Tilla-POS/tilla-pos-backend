# Current User Endpoint Documentation

## Overview

The current user endpoint allows authenticated users to retrieve their own profile information, including associated business details.

## Endpoint Details

### Get Current User
```
GET /api/v1/users/me
```

**Authentication**: Required (Bearer token)

**Description**: Returns the profile information of the currently authenticated user.

## Request

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Parameters
None required - the user information is extracted from the JWT token.

## Response

### Success Response (200 OK)
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "business": {
    "id": "business-123",
    "name": "My Business",
    "description": "Business description"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

#### 400 Bad Request (User not found)
```json
{
  "message": "User not found",
  "statusCode": 400
}
```

#### 408 Request Timeout
```json
{
  "message": "Failed to retrieve current user. Please try again later.",
  "statusCode": 408
}
```

## Implementation Details

### Controller Method
```typescript
@Get('me')
@ApiOperation({
  summary: 'Get current authenticated user',
  description: 'This endpoint returns the details of the currently authenticated user.',
})
getCurrentUser(@ActiveUser() user: ActiveUserInterface): Promise<CurrentUserResponseDto> {
  return this.usersService.getCurrentUser(user);
}
```

### Service Method
```typescript
async getCurrentUser(activeUser: ActiveUserInterface): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id: activeUser.sub },
    relations: ['business'],
  });
  
  if (!user) {
    throw new BadRequestException('User not found');
  }
  
  return user;
}
```

## Usage Examples

### JavaScript/TypeScript
```javascript
const response = await fetch('/api/v1/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const currentUser = await response.json();
console.log('Current user:', currentUser);
```

### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json"
```

### Response DTO Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Unique user identifier (UUID) | Yes |
| `username` | string | User's username | Yes |
| `email` | string | User's email address | Yes |
| `phone` | string | User's phone number | No |
| `business` | object | Associated business information | No |
| `createdAt` | Date | Account creation timestamp | Yes |
| `updatedAt` | Date | Last update timestamp | Yes |

## Security Considerations

1. **Authentication Required**: This endpoint requires a valid JWT access token
2. **User Context**: Users can only access their own profile information
3. **Token Validation**: The JWT token is validated and the user ID is extracted from the `sub` claim
4. **Business Association**: If the user has an associated business, it will be included in the response

## Error Handling

The endpoint implements comprehensive error handling:

- **Token Issues**: Returns 401 for missing or invalid tokens
- **User Not Found**: Returns 400 if the authenticated user doesn't exist in the database
- **Database Errors**: Returns 408 for database connection issues
- **General Errors**: Wraps unexpected errors in RequestTimeoutException

## Best Practices

1. **Caching**: Consider caching user profile data on the client side
2. **Error Handling**: Always handle potential 401 responses by redirecting to login
3. **Token Refresh**: Use refresh tokens to maintain authentication
4. **Data Updates**: Re-fetch user data after profile updates

## Related Endpoints

- `POST /api/v1/auth/sign-in` - Authenticate and get tokens
- `POST /api/v1/auth/refresh` - Refresh access tokens
- `PATCH /api/v1/users/:id` - Update user profile (requires matching user ID)
- `GET /api/v1/users/:id` - Get specific user by ID (admin access)