# Refresh Token Implementation

This document explains the refresh token feature added to the Tilla POS authentication system.

## Overview

The refresh token feature provides a secure way to maintain user sessions without requiring frequent re-authentication. When a user signs in, they receive both an access token (short-lived) and a refresh token (long-lived).

## Architecture

### Token Types

1. **Access Token**: Short-lived (1 hour by default), used for API authentication
2. **Refresh Token**: Long-lived (24 hours by default), used to obtain new access tokens

### Components Added

#### DTOs
- `RefreshTokenDto`: Input DTO for refresh token requests
- `AuthResponseDto`: Standardized response containing both tokens

#### Guards
- `RefreshTokenGuard`: Validates refresh tokens (optional, for token-in-header approach)

#### Enhanced Services
- Updated `JwtProviders` with refresh token methods
- Updated `AuthService` with refresh token handling

## API Endpoints

### Sign In
```
POST /api/v1/auth/sign-in
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Refresh Token
```
POST /api/v1/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

## Usage Flow

1. **Initial Authentication**: User signs in with credentials
2. **Token Storage**: Client stores both tokens securely
3. **API Requests**: Client uses access token for authenticated requests
4. **Token Refresh**: When access token expires, client uses refresh token to get new tokens
5. **Automatic Renewal**: Process repeats until refresh token expires

## Security Features

### Token Validation
- Refresh tokens include a `tokenType: 'refresh'` claim
- Tokens are validated for proper audience and issuer
- User existence is verified during refresh

### Error Handling
- Invalid refresh tokens return 401 Unauthorized
- Expired refresh tokens require re-authentication
- Deleted users cannot refresh tokens

## Environment Variables

The following environment variables control token lifetimes:

```env
JWT_ACCESS_TOKEN_TTL=3600      # 1 hour (in seconds)
JWT_REFRESH_TOKEN_TTL=86400    # 24 hours (in seconds)
```

## Client Implementation Example

```typescript
class AuthClient {
  private accessToken: string;
  private refreshToken: string;

  async signIn(email: string, password: string) {
    const response = await fetch('/api/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const tokens = await response.json();
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    // Store tokens securely (e.g., in httpOnly cookies or secure storage)
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  async refreshTokens() {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    
    if (!response.ok) {
      // Refresh token expired, redirect to login
      this.redirectToLogin();
      return;
    }
    
    const tokens = await response.json();
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  async apiRequest(url: string, options: RequestInit = {}) {
    // Add access token to request
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    let response = await fetch(url, { ...options, headers });
    
    // If access token expired, try to refresh
    if (response.status === 401) {
      await this.refreshTokens();
      
      // Retry request with new token
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      response = await fetch(url, { ...options, headers });
    }
    
    return response;
  }
}
```

## Testing

The implementation includes unit tests for:
- Successful token refresh
- Invalid refresh token handling
- User not found scenarios

Run tests with:
```bash
yarn test auth.service.refresh.spec.ts
```

## Migration Notes

### Breaking Changes
- Sign-in response now includes `refreshToken`, `tokenType`, and `expiresIn` fields
- Business creation response format updated to match new token format

### Backward Compatibility
- Existing access tokens continue to work
- No database migrations required
- Environment variables have sensible defaults

## Best Practices

1. **Secure Storage**: Store refresh tokens securely (httpOnly cookies recommended)
2. **Token Rotation**: Each refresh generates a new refresh token
3. **Expiration Handling**: Implement proper fallback to re-authentication
4. **Error Handling**: Handle token refresh failures gracefully
5. **Logout**: Clear both tokens on logout