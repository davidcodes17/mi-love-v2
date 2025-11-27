# Call Management System Documentation

## Overview

This document explains how incoming and outgoing calls are managed in the Mi Love v2 application using GetStream Video SDK.

## Architecture

### Components

1. **CallProvider** (`context/call-provider.tsx`)
   - Manages GetStream client initialization
   - Provides call context to the entire app
   - Handles incoming call detection and routing
   - Exposes `createCall` and `joinCall` functions

2. **IncomingCallScreen** (`components/common/calls/incoming-call-screen.tsx`)
   - Custom UI for incoming calls
   - Shows caller information (name, avatar)
   - Accept/Reject buttons
   - Automatically navigates to call screen when accepted

3. **OutgoingCallScreen** (`components/common/calls/outgoing-call-screen.tsx`)
   - Custom UI for outgoing calls
   - Shows recipient information
   - Cancel button
   - Loading indicator while connecting

4. **VideoCallScreen** (`app/video-call.tsx`)
   - Main call interface
   - Handles both audio and video calls
   - Call controls (mute, camera toggle, end call)
   - Uses GetStream's `CallContent` component

## Call Flow

### Outgoing Calls

1. **Initiation** (`components/common/chats/header-chat.tsx`)
   - User taps audio/video call button
   - `createCall()` is called with recipient ID and call type
   - Call is created and caller joins immediately
   - Navigation to `/outgoing-call` screen

2. **Outgoing Call Screen** (`app/outgoing-call.tsx`)
   - Displays recipient information
   - Shows "Calling..." status
   - Monitors call state
   - Automatically navigates to `/video-call` when call is connected
   - User can cancel the call

3. **Active Call Screen** (`app/video-call.tsx`)
   - Full call interface with controls
   - Audio/Video toggle based on call type
   - Mute/unmute functionality
   - Camera on/off (for video calls)
   - End call button

### Incoming Calls

1. **Detection** (`context/call-provider.tsx`)
   - GetStream SDK detects incoming call
   - Call state changes to `RINGING`
   - Provider checks if call was created by current user
   - If not, shows `IncomingCallScreen`

2. **Incoming Call Screen** (`components/common/calls/incoming-call-screen.tsx`)
   - Displays caller information
   - Shows call type (audio/video)
   - Accept button → navigates to call screen
   - Reject button → ends the call

3. **Active Call Screen** (`app/video-call.tsx`)
   - Same interface as outgoing calls
   - Both parties can control the call

## Key Functions

### `createCall(userId: string, callType: "audio" | "video")`

Creates a new call and joins it immediately.

```typescript
const call = await createCall(recipientId, "audio");
if (call) {
  router.push(`/outgoing-call?recipientId=${recipientId}&callType=audio&callId=${call.id}`);
}
```

**Parameters:**
- `userId`: Recipient's user ID
- `callType`: "audio" or "video"

**Returns:**
- `Call` object if successful
- `undefined` if failed

### `joinCall(callId: string, callType: "audio" | "video")`

Joins an existing call by ID.

```typescript
const call = await joinCall(callId, "video");
```

**Parameters:**
- `callId`: The call ID to join
- `callType`: "audio" or "video"

**Returns:**
- `Call` object if successful
- `undefined` if failed

## Call States

The system uses GetStream's `CallingState` enum:

- `RINGING`: Incoming call is ringing
- `JOINING`: Call is being joined
- `JOINED`: Call is active
- `LEFT`: User has left the call
- `ENDED`: Call has ended

## Navigation Flow

```
Outgoing Call:
Chat Screen → Outgoing Call Screen → Video Call Screen

Incoming Call:
Any Screen → Incoming Call Screen → Video Call Screen
```

## Customization

### Call UI

Both incoming and outgoing call screens can be customized in:
- `components/common/calls/incoming-call-screen.tsx`
- `components/common/calls/outgoing-call-screen.tsx`

### Call Controls

Call controls are in:
- `app/video-call.tsx` - `CallUI` component

## Error Handling

- All call functions include try-catch blocks
- Errors are logged to console
- User-friendly alerts are shown for critical errors
- Failed calls automatically navigate back

## Permissions

Ensure the app has:
- Camera permission (for video calls)
- Microphone permission (for audio/video calls)
- Network access

## Testing

To test calls:
1. Use two devices or emulators with different user accounts
2. Initiate a call from one device
3. Accept on the other device
4. Test audio/video toggles
5. Test mute/unmute
6. Test call ending

## Troubleshooting

### Call not connecting
- Check GetStream token is valid
- Verify user IDs are correct
- Check network connectivity
- Review console logs for errors

### Incoming call not showing
- Ensure CallProvider is properly initialized
- Check that client is connected
- Verify call state is RINGING
- Check that call wasn't created by current user

### Call controls not working
- Ensure call is in JOINED state
- Check microphone/camera permissions
- Verify call object is valid

## Future Enhancements

- Call history/logging
- Push notifications for incoming calls
- Call recording
- Screen sharing
- Group calls
- Call quality indicators

