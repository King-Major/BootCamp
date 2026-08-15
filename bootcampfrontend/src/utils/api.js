const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  return '';
};

const API_BASE_URL = getApiBaseUrl();

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
