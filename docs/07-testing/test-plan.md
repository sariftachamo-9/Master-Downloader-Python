# Project Test Plan

This document outlines the testing strategy for the Social Video Downloader project.

## 1. Test Levels

### Unit Testing (Backend)
- Testing of URL validation logic using various input formats.
- Testing of platform detection functions.
- Testing of database connector handlers (mock DB integration vs real Supabase connection).

### API Integration Testing
- Validation of HTTP requests: `GET /api/health`, `POST /api/download`, `GET /api/history`.
- Verification of rate limiters and payload schemas.

### Frontend End-to-End Testing
- Manual validation of UI input fields.
- Verifying progress bar states and error message displays.
- Playing retrieved MP4 samples inside the result card.

## 2. Test Execution
Unit and integration tests are located in the `tests/` directory and can be executed via:
```bash
cd backend
npm run test
```
