import swaggerUi from "swagger-ui-express";
import cfg from "./config.js";

const bearer = () => [{ bearerAuth: [] }];

const jsonBody = (schema) => ({
  required: true,
  content: {
    "application/json": { schema },
  },
});

const resp = (codes = [200]) =>
  Object.fromEntries(codes.map((c) => [c, { description: String(c) }]));

const pathParam = (name, description) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
  description,
});

const queryParam = (name, type, description, required = false) => ({
  name,
  in: "query",
  required,
  schema: { type },
  description,
});

// базові схеми (мінімально достатні для Swagger UI)
const registerSchema = {
  type: "object",
  properties: {
    name: { type: "string", example: "John Doe" },
    email: { type: "string", example: "john@example.com" },
    password: { type: "string", example: "12345678" },
  },
  required: ["name", "email", "password"],
  additionalProperties: false,
};

const loginSchema = {
  type: "object",
  properties: {
    email: { type: "string", example: "john@example.com" },
    password: { type: "string", example: "12345678" },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

const refreshSchema = {
  type: "object",
  properties: {
    refreshToken: { type: "string" },
  },
  required: ["refreshToken"],
  additionalProperties: false,
};

const googleIdTokenSchema = {
  type: "object",
  properties: {
    idToken: { type: "string", description: "Google ID token (JWT)" },
  },
  required: ["idToken"],
  additionalProperties: false,
};

const patchMeSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    avatarUrl: { type: "string" },
  },
  additionalProperties: false,
};

const prefsSchema = {
  type: "object",
  properties: {
    interests: {
      type: "array",
      items: { type: "string" },
      example: ["food", "history"],
    },
    budget: { type: "string", example: "medium" },
    travelStyle: { type: "string", example: "relaxed" },
  },
  additionalProperties: true,
};

// Trips
const tripCreateSchema = {
  type: "object",
  properties: {
    title: { type: "string", example: "Weekend in Lviv" },
    startDate: { type: "string", example: "2026-01-10" },
    endDate: { type: "string", example: "2026-01-12" },
    city: { type: "string", example: "Lviv" },
    country: { type: "string", example: "Ukraine" },
  },
  required: ["title"],
  additionalProperties: false,
};

const tripPatchSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    startDate: { type: "string" },
    endDate: { type: "string" },
    city: { type: "string" },
    country: { type: "string" },
  },
  additionalProperties: false,
};

const tripAddItemSchema = {
  type: "object",
  properties: {
    day: { type: "integer", example: 1 },
    title: { type: "string", example: "Visit old town" },
    description: { type: "string" },
    time: { type: "string", example: "10:00" },
    location: {
      type: "object",
      properties: {
        lat: { type: "number", example: 49.8419 },
        lng: { type: "number", example: 24.0315 },
        address: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  required: ["title"],
  additionalProperties: false,
};

// Integrations
const integrationPoisSchema = {
  type: "object",
  properties: {
    city: { type: "string", example: "Kyiv" },
    interests: {
      type: "array",
      items: { type: "string" },
      example: ["museum", "coffee"],
    },
    limit: { type: "integer", example: 10 },
  },
  required: ["city"],
  additionalProperties: false,
};

const calendarEventSchema = {
  type: "object",
  properties: {
    summary: { type: "string", example: "LittleLifeTrip event" },
    description: { type: "string" },
    start: { type: "string", example: "2026-01-10T10:00:00Z" },
    end: { type: "string", example: "2026-01-10T12:00:00Z" },
  },
  required: ["summary", "start", "end"],
  additionalProperties: false,
};

// AI
const aiRecommendSchema = {
  type: "object",
  properties: {
    city: { type: "string", example: "Lviv" },
    days: { type: "integer", example: 2 },
    interests: {
      type: "array",
      items: { type: "string" },
      example: ["food", "history"],
    },
    budget: { type: "string", example: "medium" },
  },
  required: ["city"],
  additionalProperties: false,
};

const aiExplainSchema = {
  type: "object",
  properties: {
    itinerary: {
      type: "object",
      description: "Previously generated itinerary JSON",
    },
  },
  required: ["itinerary"],
  additionalProperties: true,
};

const aiImproveSchema = {
  type: "object",
  properties: {
    itinerary: { type: "object" },
    feedback: {
      type: "string",
      example: "Make it more kid-friendly and add museums",
    },
  },
  required: ["itinerary"],
  additionalProperties: true,
};

const serverUrl =
  typeof cfg.publicBaseUrl === "string" &&
  /^https?:\/\//.test(cfg.publicBaseUrl)
    ? cfg.publicBaseUrl
    : "http://localhost:3000";

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "LittleLifeTrip API Gateway",
    version: "1.0.0",
    description:
      "Aggregated API (Auth, Trips, Integrations, AI) via API Gateway.",
  },

  // ВАЖЛИВО: тут має бути URL зі схемою http/https
  servers: [{ url: serverUrl }],

  tags: [
    { name: "Gateway" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Trips" },
    { name: "Integrations" },
    { name: "AI" },
  ],

  paths: {
    // Gateway
    "/api/health": {
      get: {
        tags: ["Gateway"],
        summary: "Health check",
        responses: { 200: { description: "OK" } },
      },
    },

    // -------- Auth (Auth service) --------
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        requestBody: jsonBody(registerSchema),
        responses: resp([201, 400, 409]),
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: jsonBody(loginSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/auth/oauth/google/idtoken": {
      post: {
        tags: ["Auth"],
        summary: "Google OAuth by idToken",
        requestBody: jsonBody(googleIdTokenSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh tokens",
        requestBody: jsonBody(refreshSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        requestBody: jsonBody(refreshSchema),
        responses: resp([200, 400, 401]),
      },
    },

    // -------- Users (Auth service) --------
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        security: bearer(),
        responses: resp([200, 401]),
      },
      patch: {
        tags: ["Users"],
        summary: "Update current user",
        security: bearer(),
        requestBody: jsonBody(patchMeSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/users/me/preferences": {
      get: {
        tags: ["Users"],
        summary: "Get preferences",
        security: bearer(),
        responses: resp([200, 401]),
      },
      put: {
        tags: ["Users"],
        summary: "Update preferences",
        security: bearer(),
        requestBody: jsonBody(prefsSchema),
        responses: resp([200, 400, 401]),
      },
    },

    // -------- Trips --------
    "/api/v1/trips": {
      post: {
        tags: ["Trips"],
        summary: "Create a new trip",
        security: bearer(),
        requestBody: jsonBody(tripCreateSchema),
        responses: resp([201, 400, 401]),
      },
    },
    "/api/v1/trips/{id}": {
      parameters: [pathParam("id", "Trip ID")],
      get: {
        tags: ["Trips"],
        summary: "Get trip by ID",
        security: bearer(),
        responses: resp([200, 401, 404]),
      },
      patch: {
        tags: ["Trips"],
        summary: "Update a trip",
        security: bearer(),
        requestBody: jsonBody(tripPatchSchema),
        responses: resp([200, 400, 401, 404]),
      },
      delete: {
        tags: ["Trips"],
        summary: "Delete a trip",
        security: bearer(),
        responses: resp([200, 401, 404]),
      },
    },
    "/api/v1/users/{userId}/trips": {
      parameters: [pathParam("userId", "User ID")],
      get: {
        tags: ["Trips"],
        summary: "Get all trips for a user",
        security: bearer(),
        responses: resp([200, 401]),
      },
    },
    "/api/v1/trips/{id}/items": {
      parameters: [pathParam("id", "Trip ID")],
      post: {
        tags: ["Trips"],
        summary: "Add itinerary item to trip",
        security: bearer(),
        requestBody: jsonBody(tripAddItemSchema),
        responses: resp([201, 400, 401, 404]),
      },
    },
    "/api/v1/trips/{id}/map": {
      parameters: [pathParam("id", "Trip ID")],
      get: {
        tags: ["Trips"],
        summary: "Get map data for trip",
        security: bearer(),
        responses: resp([200, 401, 404]),
      },
    },

    // -------- Integrations --------
    "/api/v1/integrations/maps/pois": {
      post: {
        tags: ["Integrations"],
        summary: "Search POIs by city and interests",
        security: bearer(),
        requestBody: jsonBody(integrationPoisSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/integrations/maps/city": {
      get: {
        tags: ["Integrations"],
        summary: "Get city information",
        security: bearer(),
        parameters: [queryParam("city", "string", "City name", true)],
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/integrations/weather/city": {
      get: {
        tags: ["Integrations"],
        summary: "Get 5-day weather forecast",
        security: bearer(),
        parameters: [queryParam("city", "string", "City name", true)],
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/integrations/calendar/google/connect": {
      get: {
        tags: ["Integrations"],
        summary: "Start Google OAuth2 flow",
        security: bearer(),
        responses: resp([302, 401]),
      },
    },
    "/api/v1/integrations/calendar/google/callback": {
      get: {
        tags: ["Integrations"],
        summary: "Google OAuth2 callback",
        parameters: [
          queryParam("code", "string", "OAuth2 code", false),
          queryParam("state", "string", "OAuth2 state", false),
        ],
        responses: resp([200, 400]),
      },
    },
    "/api/v1/integrations/calendar/status": {
      get: {
        tags: ["Integrations"],
        summary: "Check calendar connection status",
        security: bearer(),
        responses: resp([200, 401]),
      },
    },
    "/api/v1/integrations/calendar/events": {
      post: {
        tags: ["Integrations"],
        summary: "Create calendar event",
        security: bearer(),
        requestBody: jsonBody(calendarEventSchema),
        responses: resp([201, 400, 401]),
      },
    },

    // -------- AI (gateway /api/v1/ai/* -> ai-service internal) --------
    "/api/v1/ai/recommend": {
      post: {
        tags: ["AI"],
        summary: "Generate recommendation",
        security: bearer(),
        requestBody: jsonBody(aiRecommendSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/ai/explain": {
      post: {
        tags: ["AI"],
        summary: "Explain itinerary",
        security: bearer(),
        requestBody: jsonBody(aiExplainSchema),
        responses: resp([200, 400, 401]),
      },
    },
    "/api/v1/ai/improve": {
      post: {
        tags: ["AI"],
        summary: "Improve itinerary",
        security: bearer(),
        requestBody: jsonBody(aiImproveSchema),
        responses: resp([200, 400, 401]),
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};

export function mountSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
}
