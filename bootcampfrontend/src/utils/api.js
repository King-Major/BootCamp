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

  const rawText = await response.text();
  let body = null;

  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }
  }

  if (!response.ok) {
    const message = body?.message || (typeof body === 'string' ? body : `Request failed with status ${response.status}`);
    throw new Error(message);
  }

  if (body === null) {
    throw new Error('The server responded without data. Please try again.');
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

export const verifyPaymentWithRetry = async (reference, attempts = 5) => {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await verifyPayment(reference);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  throw lastError;
};
