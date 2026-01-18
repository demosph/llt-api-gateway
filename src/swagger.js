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
// Auth
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

// Users
const patchMeSchema = {
  type: "object",
  properties: {
    name: { type: "string", example: "John Doe" },
    avatar_url: { type: "string", example: "https://example.com/avatar.png" },

    plan: {
      type: "string",
      enum: ["Explorer", "Nomad", "Globetrotter"],
      example: "Explorer",
    },
  },
  additionalProperties: false,
};

const prefsSchema = {
  type: "object",
  minProperties: 1,
  properties: {
    home_city: { type: "string", example: "Kyiv", nullable: true },
    home_lat: { type: "number", example: 50.4501, nullable: true },
    home_lng: { type: "number", example: 30.5234, nullable: true },
    interests: {
      type: "array",
      items: { type: "string" },
      example: ["food", "history"],
    },
    avg_daily_budget: { type: "integer", example: 5000, nullable: true },
    currency: {
      type: "string",
      enum: ["USD", "EUR", "UAH"],
      example: "UAH",
    },
    transport_modes: {
      type: "array",
      items: { type: "string", enum: ["car", "public", "bike", "walk"] },
      example: ["car", "walk"],
    },
    theme: {
      type: "string",
      enum: ["light", "dark", "system"],
      example: "system",
    },
    language: {
      type: "string",
      description: "BCP-47-like language tag (e.g. en, uk, en-US, uk-UA)",
      example: "uk",
    },
    notifications_enabled: { type: "boolean", example: false },
    notification_channels: {
      type: "array",
      items: { type: "string", enum: ["email", "push", "sms"] },
      example: ["email"],
    },
  },
  additionalProperties: false,
};

// Trips
const tripCreateSchema = {
  type: "object",
  properties: {
    userId: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    title: { type: "string", example: "Weekend in Paris" },
    startDate: { type: "string", example: "2024-06-01" },
    endDate: { type: "string", example: "2024-06-03" },
    originCity: { type: "string", example: "Kyiv" },
    originLat: { type: "number", example: 50.4501 },
    originLng: { type: "number", example: 30.5234 },
  },
  required: [
    "userId",
    "title",
    "startDate",
    "endDate",
    "originCity",
    "originLat",
    "originLng",
  ],
  additionalProperties: false,
};

const tripPatchSchema = {
  type: "object",
  properties: {
    title: { type: "string", example: "Updated Trip Title" },
    startDate: { type: "string", example: "2024-06-01" },
    endDate: { type: "string", example: "2024-06-05" },
    originCity: { type: "string", example: "Lviv" },
    originLat: { type: "number", example: 49.8397 },
    originLng: { type: "number", example: 24.0297 },
  },
  additionalProperties: false,
};

const tripAddItemSchema = {
  type: "object",
  properties: {
    googlePlaceId: {
      type: "string",
      example: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
    },
    name: { type: "string", example: "Eiffel Tower" },
    location: {
      type: "object",
      properties: {
        lat: { type: "number", example: 48.8584 },
        lng: { type: "number", example: 2.2945 },
      },
      required: ["lat", "lng"],
      additionalProperties: false,
    },
    address: {
      type: "string",
      example: "Champ de Mars, 5 Av. Anatole France",
    },
    categories: {
      type: "array",
      items: { type: "string" },
      example: ["string"],
    },
    dayIndex: { type: "integer", example: 0 },
    orderIndex: { type: "integer", example: 1 },
    title: { type: "string", example: "string" },
    description: { type: "string", example: "string" },
  },
  required: ["googlePlaceId", "name", "location", "dayIndex", "orderIndex"],
  additionalProperties: false,
};

// Integrations
// POST /maps/pois (request)
const integrationPoisSchema = {
  type: "object",
  properties: {
    city: { type: "string", example: "Київ" },
    interests: {
      type: "array",
      items: { type: "string" },
      example: ["history", "food"],
    },
  },
  required: ["city", "interests"],
  additionalProperties: false,
};

// POST /maps/pois (response)
const poiSchema = {
  type: "object",
  properties: {
    name: { type: "string", example: "Софійський собор" },
    lat: { type: "number", example: 50.4529 },
    lng: { type: "number", example: 30.5143 },
    rating: { type: "number", example: 4.9 },
    category: { type: "string", example: "history" },
    city: { type: "string", example: "Київ" },
  },
  required: ["name", "lat", "lng", "category", "city"],
  additionalProperties: false,
};

const poisResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "array",
      items: poiSchema,
    },
  },
  required: ["data"],
  additionalProperties: false,
};

// GET /maps/city (response)
const cityInfoResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        name: { type: "string", example: "Київ" },
        name_en: { type: "string", example: "Kyiv" },
        coordinates: {
          type: "object",
          properties: {
            lat: { type: "number", example: 50.4501 },
            lng: { type: "number", example: 30.5234 },
          },
          required: ["lat", "lng"],
          additionalProperties: false,
        },
        country: { type: "string", example: "Ukraine" },
      },
      required: ["name", "name_en", "coordinates", "country"],
      additionalProperties: false,
    },
  },
  required: ["data"],
  additionalProperties: false,
};

// GET /weather/city (response)
const weatherForecastItemSchema = {
  type: "object",
  properties: {
    date: { type: "string", example: "2025-12-18" },
    temp_min_c: { type: "number", example: -2.5 },
    temp_max_c: { type: "number", example: 3.8 },
    condition: { type: "string", example: "light snow" },
    humidity_percent: { type: "number", example: 78 },
    precipitation_chance: { type: "number", example: 60 },
  },
  required: [
    "date",
    "temp_min_c",
    "temp_max_c",
    "condition",
    "humidity_percent",
    "precipitation_chance",
  ],
  additionalProperties: false,
};

const weatherForecastResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        city: { type: "string", example: "Київ" },
        city_en: { type: "string", example: "Kyiv" },
        coordinates: {
          type: "object",
          properties: {
            lat: { type: "number", example: 50.4501 },
            lng: { type: "number", example: 30.5234 },
          },
          required: ["lat", "lng"],
          additionalProperties: false,
        },
        forecast: {
          type: "array",
          items: weatherForecastItemSchema,
        },
      },
      required: ["city", "city_en", "coordinates", "forecast"],
      additionalProperties: false,
    },
  },
  required: ["data"],
  additionalProperties: false,
};

// GET /calendar/status (response)
const calendarStatusResponseSchema = {
  type: "object",
  properties: {
    connected: { type: "boolean", example: true },
  },
  required: ["connected"],
  additionalProperties: false,
};

// POST /calendar/events (request)
const calendarEventSchema = {
  type: "object",
  properties: {
    userId: {
      type: "string",
      format: "uuid",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    title: { type: "string", example: "Trip to Paris" },
    startDate: { type: "string", example: "2024-01-15" },
    endDate: { type: "string", example: "2024-01-20" },
    description: { type: "string", example: "Vacation in France" },
  },
  required: ["userId", "title", "startDate", "endDate"],
  additionalProperties: false,
};

// POST /calendar/events (response)
const calendarEventCreateResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        eventId: { type: "string", example: "abc123xyz" },
        link: {
          type: "string",
          example: "https://calendar.google.com/event?eid=abc123xyz",
        },
      },
      required: ["eventId", "link"],
      additionalProperties: false,
    },
  },
  required: ["data"],
  additionalProperties: false,
};

// AI

const aiRecommendSchema = {
  type: "object",
  properties: {
    constraints: {
      type: "object",
      properties: {
        destination_city: { type: "string", example: "Львів" },
        duration_days: { type: "integer", example: 3 },
        origin_city: { type: "string", example: "Київ" },
        total_budget: { type: "integer", example: 15000 },
        travel_party_size: { type: "integer", example: 2 },
      },
      required: [
        "destination_city",
        "duration_days",
        "origin_city",
        "total_budget",
        "travel_party_size",
      ],
      additionalProperties: false,
    },
    timezone: { type: "string", example: "Europe/Kyiv" },
    user_id: {
      type: "string",
      format: "uuid",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    user_profile: {
      type: "object",
      properties: {
        avg_daily_budget: { type: "integer", example: 2000 },
        interests: {
          type: "array",
          items: { type: "string" },
          example: ["history", "food", "culture"],
        },
        transport_modes: {
          type: "array",
          items: { type: "string" },
          example: ["walking", "public_transport"],
        },
      },
      required: ["avg_daily_budget", "interests", "transport_modes"],
      additionalProperties: false,
    },
  },
  required: ["constraints", "timezone", "user_id", "user_profile"],
  additionalProperties: false,
};

// POST /ai/explain (request)
const aiExplainSchema = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    trip_id: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    trip_plan: {
      type: "object",
      description: "Previously generated trip plan JSON",
      additionalProperties: true,
      example: { additionalProp1: {} },
    },
    question: { type: "string", example: "Чому обрано саме цей ресторан?" },
  },
  required: ["user_id", "trip_id", "trip_plan", "question"],
  additionalProperties: false,
};

// POST /ai/improve (request)
const aiImproveSchema = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    trip_id: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    current_plan: {
      type: "object",
      description: "Current itinerary / trip plan JSON",
      additionalProperties: true,
      example: { additionalProp1: {} },
    },
    improvement_request: {
      type: "string",
      example: "Додай більше ресторанів української кухні",
    },
    constraints: {
      type: "object",
      properties: {
        origin_city: { type: "string", example: "string" },
        destination_city: { type: "string", example: "string" },
        start_date: { type: "string", format: "date", example: "2026-01-07" },
        end_date: { type: "string", format: "date", example: "2026-01-07" },
        duration_days: { type: "integer", example: 1 },
        total_budget: { type: "integer", example: 0 },
        travel_party_size: { type: "integer", example: 1 },
      },
      additionalProperties: false,
    },
  },
  required: ["user_id", "trip_id", "current_plan", "improvement_request"],
  additionalProperties: false,
};

const serverUrl =
  typeof cfg.publicBaseUrl === "string" &&
  /^https?:\/\//.test(cfg.publicBaseUrl)
    ? cfg.publicBaseUrl
    : "/";

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
      patch: {
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
        responses: resp([200, 404, 401]),
      },
    },
    "/api/v1/integrations/weather/city": {
      get: {
        tags: ["Integrations"],
        summary: "Get 5-day weather forecast by city name",
        security: bearer(),
        parameters: [
          queryParam("city", "string", "City name", true),
          queryParam(
            "start_date",
            "string",
            "Start date filter (YYYY-MM-DD)",
            false
          ),
          queryParam(
            "end_date",
            "string",
            "End date filter (YYYY-MM-DD)",
            false
          ),
        ],
        responses: resp([200, 404, 401]),
      },
    },
    "/api/v1/integrations/calendar/google/connect": {
      get: {
        tags: ["Integrations"],
        summary: "Start Google OAuth2 flow",
        security: bearer(),
        parameters: [queryParam("userId", "string", "User ID", true)],
        responses: resp([302, 401]),
      },
    },
    "/api/v1/integrations/calendar/google/callback": {
      get: {
        tags: ["Integrations"],
        summary: "Google OAuth2 callback",
        parameters: [
          queryParam("code", "string", "OAuth2 code", true),
          queryParam("state", "string", "OAuth2 state", true),
        ],
        responses: resp([200, 400]),
      },
    },
    "/api/v1/integrations/calendar/status": {
      get: {
        tags: ["Integrations"],
        summary: "Check calendar connection status",
        security: bearer(),
        parameters: [queryParam("userId", "string", "User ID", true)],
        responses: resp([200, 401]),
      },
    },
    "/api/v1/integrations/calendar/events": {
      post: {
        tags: ["Integrations"],
        summary: "Create calendar event",
        security: bearer(),
        requestBody: jsonBody(calendarEventSchema),
        responses: resp([200, 400, 401]),
      },
    },

    // -------- AI --------
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
