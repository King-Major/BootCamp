const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

export const loadPaystack = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required for Paystack.'));
    }

    if (window.PaystackPop) {
      return resolve(window.PaystackPop);
    }

    const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.PaystackPop) resolve(window.PaystackPop);
        else reject(new Error('Paystack script loaded, but PaystackPop is unavailable.'));
      });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error('Paystack script loaded, but PaystackPop is unavailable.'));
    };
    script.onerror = () => reject(new Error('Failed to load Paystack script.'));
    document.body.appendChild(script);
  });
};

export const openPaystackCheckout = async ({ publicKey, reference, email, amount, onClose }) => {
  const PaystackPop = await loadPaystack();

  return new Promise((resolve, reject) => {
    if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
      return reject(new Error('Paystack checkout is unavailable.'));
    }

    PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      ref: reference,
      currency: 'NGN',
      onClose: () => {
        if (typeof onClose === 'function') onClose();
        reject(new Error('Payment window was closed before completion.'));
      },
      callback: (response) => {
        resolve(response);
      },
    });
  });
};
