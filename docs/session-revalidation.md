# Session Revalidation Implementation

## Overview
Implemented session revalidation to handle the scenario when a user logs in with the same device. Instead of creating a new session every time, the system now revalidates and reuses the existing active session.

## Changes Made

### 1. SessionService (`src/session/session.service.ts`)

#### Modified `checkIsDeviceExists()`
- Changed to return `boolean` instead of throwing an exception
- Now returns `true` if device exists, `false` otherwise

#### Added `findActiveSessionByDevice()`
```typescript
async findActiveSessionByDevice(userId: string, deviceId: string): Promise<Session | null>
```
- Finds an active (non-revoked) session for a specific user on a specific device
- Returns the most recent session based on `lastSeenAt`
- Returns `null` if no active session exists

#### Added `revalidateSession()`
```typescript
async revalidateSession(sessionId: string, locationInfo?: Partial<Location>)
```
- Revalidates an existing session by rotating its JTIs (JWT IDs)
- Updates the location if new location info is provided
- Updates `lastSeenAt` timestamp
- Generates new `refreshJti` and `accessJti` for security
- Returns the updated session with new JTIs

### 2. AuthService (`src/auth/auth.service.ts`)

#### Updated `signin()` Logic
The signin flow now follows this logic:

1. **Check for existing session**: First, check if the user already has an active session on this device
   
2. **If existing session found**:
   - Revalidate the session (rotate tokens, update location, update lastSeenAt)
   - Log the revalidation
   - Use the existing session with new tokens

3. **If no existing session**:
   - Check if the device is known in the system (for any user)
   - If device is completely new → trigger OTP verification
   - If device exists but not for this user → create a new session

## Benefits

1. **Better Session Management**: Prevents accumulation of duplicate sessions for the same device
2. **Improved Security**: Still rotates tokens even when revalidating
3. **Better UX**: Users on known devices don't need to go through OTP verification again
4. **Accurate Session Tracking**: One active session per device per user
5. **Updated Location**: Location is updated on each login even when revalidating

## Security Considerations

- Token rotation still occurs on revalidation (new JTIs generated)
- Old tokens become invalid when session is revalidated
- Session timestamps are updated for accurate tracking
- Revoked sessions cannot be revalidated

## Example Flow

### Scenario 1: User logs in with same device
```
User logs in with deviceId: "abc123"
→ Active session found for this user + device
→ Session revalidated (new tokens generated)
→ Location updated
→ User logged in with refreshed tokens
```

### Scenario 2: User logs in with new device
```
User logs in with deviceId: "xyz789"
→ No active session found
→ Device not known in system
→ OTP verification required
```

### Scenario 3: User logs in with different user's device
```
User A logs in with User B's deviceId: "def456"
→ No active session found for User A + this device
→ Device exists in system (belongs to User B)
→ New session created for User A
```

## Testing Recommendations

1. Test logging in multiple times with the same device
2. Verify only one active session exists per user per device
3. Test that old tokens become invalid after revalidation
4. Verify location updates on revalidation
5. Test OTP flow still works for new devices
6. Test session isolation between different users on same device
