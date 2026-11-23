import { API_BASE_URL } from "@/lib/config";

export interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
  auth?: boolean;
  includeBranch?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body: unknown = await response.json();

      if (typeof body === "string") return body;

      if (body && typeof body === "object") {
        const data = body as Record<string, unknown>;

        for (const key of ["message", "detail", "title", "error"]) {
          if (typeof data[key] === "string" && data[key]) {
            return data[key];
          }
        }
      }
    } else {
      const text = await response.text();
      if (text.trim()) return text;
    }
  } catch {
    // پاسخ خطا ممکن است خالی یا غیرقابل‌خواندن باشد.
  }

  return `درخواست ناموفق بود. کد خطا: ${response.status}`;
}

export async function apiFetch<T>(
  path: string,
  {
    headers: initialHeaders,
    auth = true,
    includeBranch = true,
    cache = "no-store",
    ...options
  }: ApiFetchOptions = {}
): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("apiFetch فقط در محیط مرورگر قابل استفاده است.");
  }

  const headers = new Headers(initialHeaders);

  headers.set("Accept", "application/json");

  if (auth) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new ApiError(
        401,
        "توکن احراز هویت پیدا نشد. لطفاً دوباره وارد شوید."
      );
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  if (includeBranch) {
    const branchId = localStorage.getItem("currentBranchId");

    if (!branchId) {
      throw new ApiError(
        400,
        "شناسه شعبه فعال پیدا نشد."
      );
    }

    headers.set("X-Branch-Id", branchId);
  }

  if (
    options.body !== undefined &&
    options.body !== null &&
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...options,
    headers,
    cache,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);

    throw new ApiError(response.status, message);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}