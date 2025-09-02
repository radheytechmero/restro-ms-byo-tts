# Twilio Endpoints

This directory contains Twilio-related endpoints for the restaurant management system.

## Endpoints

### POST /api/twilio

Twilio webhook endpoint for handling incoming calls.

**Purpose**: Receives incoming call notifications from Twilio and initiates the call flow.

**Request Body**: 
- Content-Type: `application/x-www-form-urlencoded`
- `CallSid`: Unique call identifier from Twilio
- `To`: The phone number being called (restaurant number)
- `From`: The phone number making the call (customer number)
- `CallStatus`: Current call status (e.g., "ringing", "in-progress")
- `Direction`: Call direction (e.g., "inbound")
- Other Twilio parameters as needed

**Response**: 
- XML TwiML response that connects the call to the WebSocket stream
- Content-Type: `application/xml`

**Flow**:
1. Receives webhook from Twilio when a call is initiated
2. Extracts restaurant and customer phone numbers
3. Generates a unique call ID
4. Stores call data in memory for later use
5. Starts background processes to fetch menu and customer data
6. Returns TwiML response to connect call to WebSocket stream

**Integration**: 
- Works with the WebSocket server in `deepgram.ts`
- Shares call data with the WebSocket connection via `callId` parameter
- Fetches menu items and customer information from the API

## Usage

Configure your Twilio phone number's webhook URL to point to:
```
https://your-domain.com/api/twilio
```

The webhook will automatically handle incoming calls and connect them to the AI agent via WebSocket. 