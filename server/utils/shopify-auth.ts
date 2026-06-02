import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getRequestHost, getRequestProtocol, type H3Event } from "h3";
import { nodeAdapterInitialized } from "@shopify/shopify-api/adapters/node";
import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

const AUTH_COOKIE_NAME = "shopify_auth_context";
const RESULT_COOKIE_NAME = "shopify_auth_result";
const AUTH_COOKIE_TTL_SECONDS = 10 * 60;
const RESULT_COOKIE_TTL_SECONDS = 30 * 60;

if (!nodeAdapterInitialized) {
  throw new Error("Failed to initialize Shopify Node adapter");
}

type AuthContext = {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string[];
  createdAt: string;
};

type SuccessResult = {
  status: "success";
  shop: string;
  accessToken: string;
  scopes: string[];
  issuedAt: string;
};

type ErrorResult = {
  status: "error";
  message: string;
  issuedAt: string;
};

type AuthResult = SuccessResult | ErrorResult;

export type StartAuthPayload = {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string;
};

function getSessionSecret() {
  const config = useRuntimeConfig();
  const secret = config.sessionSecret;

  if (!secret || typeof secret !== "string") {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing server session secret",
    });
  }

  return secret;
}

function getCookieOptions(event: H3Event, maxAge: number) {
  const protocol = getRequestProtocol(event, { xForwardedProto: true });

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: protocol === "https",
    path: "/",
    maxAge,
  };
}

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

function sealPayload(payload: Record<string, unknown>, secret: string) {
  const iv = randomBytes(12);
  const key = deriveKey(secret);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function unsealPayload<T>(value: string, secret: string) {
  const parts = value.split(".");

  if (parts.length !== 3) {
    throw new Error("Malformed cookie payload");
  }

  const [ivPart, tagPart, encryptedPart] = parts;
  const iv = Buffer.from(ivPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");
  const encrypted = Buffer.from(encryptedPart, "base64url");
  const key = deriveKey(secret);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}

export function getBaseUrl(event: H3Event) {
  const protocol = getRequestProtocol(event, { xForwardedProto: true });
  const host = getRequestHost(event, { xForwardedHost: true });
  return `${protocol}://${host}`;
}

export function getCallbackUrl(event: H3Event) {
  return `${getBaseUrl(event)}/api/auth/callback`;
}

export function getNormalizedShop(value: string) {
  const shop = value.trim().toLowerCase();

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid shop domain",
    });
  }

  return shop;
}

export function parseScopes(value: string) {
  const scopes = value
    .split(/[\n,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!scopes.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing scopes",
    });
  }

  for (const scope of scopes) {
    if (!/^[a-z][a-z0-9_]*$/.test(scope)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid scope: ${scope}`,
      });
    }
  }

  return scopes;
}

function buildAuthContext(payload: StartAuthPayload): AuthContext {
  const clientId = payload.clientId.trim();
  const clientSecret = payload.clientSecret.trim();

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing app credentials",
    });
  }

  return {
    clientId,
    clientSecret,
    shop: getNormalizedShop(payload.shop),
    scopes: parseScopes(payload.scopes),
    createdAt: new Date().toISOString(),
  };
}

function setAuthContext(event: H3Event, context: AuthContext) {
  setCookie(
    event,
    AUTH_COOKIE_NAME,
    sealPayload(context, getSessionSecret()),
    getCookieOptions(event, AUTH_COOKIE_TTL_SECONDS),
  );
}

function getAuthContext(event: H3Event) {
  const sealed = getCookie(event, AUTH_COOKIE_NAME);

  if (!sealed) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing auth context cookie",
    });
  }

  try {
    return unsealPayload<AuthContext>(sealed, getSessionSecret());
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid auth context cookie",
    });
  }
}

function setAuthResult(event: H3Event, result: AuthResult) {
  setCookie(
    event,
    RESULT_COOKIE_NAME,
    sealPayload(result, getSessionSecret()),
    getCookieOptions(event, RESULT_COOKIE_TTL_SECONDS),
  );
}

export function storeErrorResult(event: H3Event, message: string) {
  setAuthResult(event, {
    status: "error",
    message,
    issuedAt: new Date().toISOString(),
  });
}

export function readAuthResult(event: H3Event) {
  const sealed = getCookie(event, RESULT_COOKIE_NAME);

  if (!sealed) {
    return null;
  }

  try {
    return unsealPayload<AuthResult>(sealed, getSessionSecret());
  } catch {
    deleteCookie(event, RESULT_COOKIE_NAME, { path: "/" });
    return null;
  }
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, AUTH_COOKIE_NAME, { path: "/" });
  deleteCookie(event, RESULT_COOKIE_NAME, { path: "/" });
}

function createShopifyClient(event: H3Event, context: AuthContext) {
  const baseUrl = getBaseUrl(event);
  const hostName = baseUrl.replace(/^https?:\/\//, "");

  return shopifyApi({
    apiKey: context.clientId,
    apiSecretKey: context.clientSecret,
    scopes: context.scopes,
    hostName,
    hostScheme: baseUrl.startsWith("https://") ? "https" : "http",
    apiVersion: ApiVersion.April26,
    isEmbeddedApp: false,
  });
}

export async function beginAuth(event: H3Event, payload: StartAuthPayload) {
  const context = buildAuthContext(payload);
  const shopify = createShopifyClient(event, context);

  setAuthContext(event, context);
  deleteCookie(event, RESULT_COOKIE_NAME, { path: "/" });

  await shopify.auth.begin({
    shop: context.shop,
    callbackPath: "/api/auth/callback",
    isOnline: false,
    rawRequest: event.node.req,
    rawResponse: event.node.res,
  });
}

function applyShopifyHeaders(event: H3Event, headers: Record<string, string | string[]>) {
  for (const [key, value] of Object.entries(headers)) {
    event.node.res.setHeader(key, value);
  }
}

export async function completeAuth(event: H3Event) {
  const context = getAuthContext(event);
  const shopify = createShopifyClient(event, context);

  try {
    const callback = await shopify.auth.callback({
      rawRequest: event.node.req,
      rawResponse: event.node.res,
    });

    applyShopifyHeaders(event, callback.headers);

    const result: SuccessResult = {
      status: "success",
      shop: callback.session.shop,
      accessToken: callback.session.accessToken || "",
      scopes: callback.session.scope
        ? callback.session.scope.split(",").map((scope) => scope.trim()).filter(Boolean)
        : context.scopes,
      issuedAt: new Date().toISOString(),
    };

    setAuthResult(event, result);
    deleteCookie(event, AUTH_COOKIE_NAME, { path: "/" });
    return result;
  } catch (error) {
    deleteCookie(event, AUTH_COOKIE_NAME, { path: "/" });
    throw error;
  }
}
