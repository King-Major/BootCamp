const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export const initializePayment = (payload) => apiFetch('/api/payment/initialize', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const verifyPayment = (reference) => apiFetch('/api/payment/verify', {
  method: 'POST',
  body: JSON.stringify({ reference }),
});
