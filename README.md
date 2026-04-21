# VoteNavigator Backend (Node.js + Express)

A minimal backend API that gives election guidance for India based on user details.

## Project Structure

- `server.js`
- `routes/assistant.js`
- `utils/decisionEngine.js`
- `utils/googleService.js`
- `README.md`

## Setup

```bash
npm install
npm start
```

Server runs at: `http://localhost:3000`

## API

### POST `/assist`

Request body:

```json
{
  "age": 19,
  "hasVoterID": false,
  "movedCity": false
}
```

Response shape:

```json
{
  "status": "eligible",
  "message": "short explanation",
  "steps": ["numbered steps"],
  "timeline": "estimated time",
  "nextAction": "what to do next"
}
```

---

## Example Requests and Expected Responses

### 1) Under 18 (ineligible)

```bash
curl -X POST http://localhost:3000/assist \
  -H "Content-Type: application/json" \
  -d '{"age":16,"hasVoterID":false,"movedCity":false}'
```

Expected response (example):

```json
{
  "status": "ineligible",
  "message": "You are not eligible to vote yet...",
  "steps": [
    "1. Keep a valid proof of age...",
    "2. Keep your address proof ready...",
    "3. Set a reminder to apply on NVSP..."
  ],
  "timeline": "Eligible around ...",
  "nextAction": "Wait until age 18 and then apply for voter registration on NVSP."
}
```

### 2) 18+ and no voter ID

```bash
curl -X POST http://localhost:3000/assist \
  -H "Content-Type: application/json" \
  -d '{"age":22,"hasVoterID":false,"movedCity":false}'
```

Expected response (example):

```json
{
  "status": "eligible",
  "message": "You are eligible to vote, but you need to register for a voter ID first.",
  "steps": [
    "1. Go to NVSP...",
    "2. Fill your personal details...",
    "3. Upload required documents...",
    "4. Submit the application...",
    "5. Track status on NVSP..."
  ],
  "timeline": "Usually 2-4 weeks for verification and voter ID generation.",
  "nextAction": "Complete Form 6 on NVSP today and keep your reference number safe."
}
```

### 3) Already has voter ID and moved city

```bash
curl -X POST http://localhost:3000/assist \
  -H "Content-Type: application/json" \
  -d '{"age":30,"hasVoterID":true,"movedCity":true}'
```

Expected response (example):

```json
{
  "status": "eligible",
  "message": "You are eligible to vote, but your voter details should be updated to your new city.",
  "steps": [
    "1. Visit NVSP and select voter transfer/address update (Form 8).",
    "2. Enter your EPIC number and new residential address details.",
    "3. Upload your new address proof and submit the request.",
    "4. Track the request on NVSP...",
    "5. Verify your name in the updated electoral roll..."
  ],
  "timeline": "Usually 2-4 weeks for address verification and transfer.",
  "nextAction": "Submit Form 8 on NVSP to transfer your voter record to the new city."
}
```

### 4) Already has voter ID and did not move

```bash
curl -X POST http://localhost:3000/assist \
  -H "Content-Type: application/json" \
  -d '{"age":28,"hasVoterID":true,"movedCity":false}'
```

Expected response (example):

```json
{
  "status": "eligible",
  "message": "You are eligible and your voter ID appears ready for voting.",
  "steps": [
    "1. Check your name in the electoral roll on NVSP before voting day.",
    "2. Find your polling booth details using NVSP or the Voter Helpline app.",
    "3. Keep your voter ID (EPIC) or other approved ID proof ready.",
    "4. Reach the polling booth during voting hours...",
    "5. Verify your vote carefully on the EVM/VVPAT screen..."
  ],
  "timeline": "Ready now; complete checklist before election day.",
  "nextAction": "Confirm your polling booth location and keep your ID ready."
}
```

## Basic Error Handling

If request body has invalid types, API returns `400` with a helpful message.
