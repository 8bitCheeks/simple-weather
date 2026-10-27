# Walkthrough - Node.js Backend: Weather API Proxy, Favorites CRUD, and Custom Middlewares

We implemented a secure, modular Node.js backend using **Express** for the Weather App, delivering:
1. **Feature 1: Weather API Proxy & Key Protection (Zero Client Secret Leaks)**
2. **Feature 2: Favorites / Saved Locations (CRUD)**
3. **Feature 3: Custom Middlewares (Logging, Input Validation, Error Handling)**

---

## 1. Summary of Changes

### Backend ([server.js](file:///c:/Users/sanch/Downloads/simpleWeather-master/simpleWeather-master/server.js))
- **Environment Variables**: Integrated `dotenv` to safely load `WEATHER_API_KEY` exclusively on the server from [.env](file:///c:/Users/sanch/Downloads/simpleWeather-master/simpleWeather-master/.env).
- **Feature 1: Weather Proxy Route (`GET /api/weather`)**:
  - Accepts `?city=...` query parameter and validates the input.
  - Verifies server-side API key configuration.
  - Queries Visual Crossing Weather API from Node.js using native `fetch`.
  - Forwards weather data to client or cleanly relays provider error responses.
- **Feature 2: Favorites CRUD Endpoints**:
  - `GET /api/favorites`: Returns all saved cities from `data/favorites.json`.
  - `POST /api/favorites`: Validates input, prevents duplicate entries (`409 Conflict`), and persists new entries.
  - `DELETE /api/favorites/:city`: Removes a city by name or ID.
- **Feature 3: Custom Middlewares**:
  - **Request Logger**: Tracks incoming requests, method, URL, status code, and duration in ms.
  - **Input Validation**: Validates city parameters (length, types, non-empty, allowed characters).
  - **Central Error Handling**: Intercepts unhandled exceptions and formats clean `{ error, message }` JSON responses.
  - **404 Route Handler**: Returns structured JSON for unknown routes.

### Frontend Modernization & Cleanup
- **[src/components/fetchWeather.js](file:///c:/Users/sanch/Downloads/simpleWeather-master/simpleWeather-master/src/components/fetchWeather.js)**:
  - **Direct Visual Crossing Calls Removed**: Deleted the old direct-call code that communicated directly with `https://weather.visualcrossing.com`.
  - **Secret Exposure Eliminated**: Removed all references to `process.env.WEATHER_API_KEY` from client-side code.
  - **Routed to Backend Proxy**: Now calls `/api/weather?city=...` with automatic fallback to `http://localhost:3000/api/weather`.
- **[src/main.js](file:///c:/Users/sanch/Downloads/simpleWeather-master/simpleWeather-master/src/main.js)**:
  - Added user-facing error alerts if the weather fetch fails.
  - Dynamic loading of saved favorites and interactive star toggle button.
- **[package.json](file:///c:/Users/sanch/Downloads/simpleWeather-master/simpleWeather-master/package.json)**:
  - Added `dotenv` to runtime dependencies.
  - Added `concurrently` and `npm run dev:all` script to run backend and frontend together with one command.

---

## 2. Verification & Test Results

### Automated Backend & Proxy Tests
| Feature | Test Case | Method & Endpoint | Expected | Status | Result Payload |
|---|---|---|---|---|---|
| **Feature 1** | **Missing city on proxy** | `GET /api/weather` | `400 Bad Request` | **Passed** | `{ error: 'Bad Request', message: 'Query parameter "city" is required...' }` |
| **Feature 1** | **Valid weather query** | `GET /api/weather?city=London` | `200 OK` | **Passed** | Received weather timeline JSON for London |
| **Feature 2** | **Get favorites** | `GET /api/favorites` | `200 OK` | **Passed** | Returns array of favorite cities |
| **Feature 2** | **Add city** | `POST /api/favorites` | `201 Created` | **Passed** | `{ id: 'tokyo', name: 'Tokyo', ... }` |
| **Feature 2** | **Duplicate favorite** | `POST /api/favorites` | `409 Conflict` | **Passed** | `{ error: 'Conflict', message: '...' }` |
| **Feature 2** | **Delete favorite** | `DELETE /api/favorites/:city` | `200 OK` | **Passed** | Success message & updated list |
| **Feature 3** | **404 Route Handling** | `GET /api/unknown` | `404 Not Found` | **Passed** | Route does not exist JSON |

### Webpack Build Verification
- Production build ran cleanly with `cross-env NODE_ENV=production webpack --config config/webpack.config.js`.
- Verified with ripgrep that **zero** occurrences of `process.env` or secret keys exist in the frontend `src/` directory.

---

## 3. How to Run

1. **One-Command Dev Mode (Recommended)**:
   ```bash
   npm run dev:all
   ```
   Starts both the Node.js server (`http://localhost:3000`) and the Webpack dev server (`https://localhost:8080`) simultaneously.

2. **Or run separately in two terminals**:
   - Terminal 1: `npm run server:dev`
   - Terminal 2: `npm run dev`
