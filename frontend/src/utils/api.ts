import Constants from "expo-constants";
import { Platform } from "react-native";

function getDevHost(): string | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }
  const legacyConstants = Constants as typeof Constants & {
    expoGoConfig?: { hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    manifest?: { debuggerHost?: string };
  };
  const hostUri =
    Constants.expoConfig?.hostUri ||
    legacyConstants.expoGoConfig?.hostUri ||
    legacyConstants.manifest2?.extra?.expoGo?.debuggerHost ||
    legacyConstants.manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0];
}

const devHost = getDevHost();
const prodApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export const BASE_URL = prodApi
  ? `${prodApi}/api`
  : devHost
  ? `http://${devHost}:5000/api`
  : "http://192.168.1.37:5000/api";

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export class ApiTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "ApiTimeoutError";
  }
}

type ApiRequestOptions = {
  timeoutMs?: number;
  signal?: AbortSignal;
};

const DEFAULT_TIMEOUT_MS = 45_000;

// Shared transport for JSON and multipart requests. It gives every network
// action a finite timeout and keeps 401/non-JSON handling consistent.
export async function apiFetch<T = any>(
  endpoint: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const relayAbort = () => controller.abort();

  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", relayAbort);

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError" && timedOut) throw new ApiTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", relayAbort);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (data === null) throw new Error("Server returned an invalid response");
  return data as T;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string,
  options?: ApiRequestOptions
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return apiFetch<T>(
    endpoint,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    },
    options
  );
}
