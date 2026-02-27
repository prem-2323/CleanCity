import { Platform } from 'react-native';

type AnalyzeRequest = {
  imageSource: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  nearbyReportCount?: number;
};

type VerifyRequest = {
  beforeImageSource?: string;
  afterImageSource: string;
  severityScore: number;
};

function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) {
    return explicit;
  }

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain;
    }
    // Use http for localhost/127.0.0.1 (local dev), https for everything else
    const isLocal = domain.startsWith('localhost') || domain.startsWith('127.0.0.1');
    return `${isLocal ? 'http' : 'https'}://${domain}`;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:5000';
}

async function postJson<TResponse>(endpoint: string, body: unknown): Promise<TResponse> {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export function analyzeWasteApi<TResponse>(payload: AnalyzeRequest): Promise<TResponse> {
  return postJson<TResponse>('/api/ai/analyze', payload);
}

export function verifyCleanupApi<TResponse>(payload: VerifyRequest): Promise<TResponse> {
  return postJson<TResponse>('/api/ai/verify-cleanup', payload);
}

/** Upload a base64 data-URL image to the server (stored in MongoDB Atlas). */
export async function uploadImageToServer(key: string, dataUrl: string): Promise<string> {
  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/images/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data: dataUrl }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Image upload failed (${res.status})`);
  }
  const json = (await res.json()) as { url: string; key: string };
  // Return full URL so it can be stored in Firestore and loaded anywhere
  return `${baseUrl}${json.url}`;
}
