const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

export const loadPaystack = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required for Paystack.'));
    }

    if (window.PaystackPop) {
      return resolve(window.PaystackPop);
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Paystack is taking too long to load. Please check your connection and try again.'));
    }, 120000);

    const resolvePaystack = () => {
      clearTimeout(timeoutId);
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error('Paystack script loaded, but PaystackPop is unavailable.'));
    };

    const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', resolvePaystack, { once: true });
      existingScript.addEventListener('error', () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load Paystack script.'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = resolvePaystack;
    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load Paystack script.'));
    };
    document.body.appendChild(script);
  });
};

export const openPaystackCheckout = async ({ publicKey, reference, email, amount, onClose }) => {
  const PaystackPop = await loadPaystack();

  return new Promise((resolve, reject) => {
    if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
      return reject(new Error('Paystack checkout is unavailable.'));
    }

    // Give Paystack more time on slower networks and mobile connections before failing.
    const timeoutId = setTimeout(() => {
      reject(new Error('The payment window took too long to load. Please try again. If the problem persists, check your internet connection.'));
    }, 120000);

    const popup = PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      ref: reference,
      currency: 'NGN',
      onClose: () => {
        clearTimeout(timeoutId);
        if (typeof onClose === 'function') onClose();
        reject(new Error('You closed the payment window without completing payment. Click "Continue to payment" to try again.'));
      },
      callback: (response) => {
        clearTimeout(timeoutId);
        resolve(response);
      },
    });

    if (!popup || typeof popup.openIframe !== 'function') {
      clearTimeout(timeoutId);
      return reject(new Error('Paystack checkout popup could not be opened.'));
    }

    popup.openIframe();
  });
};
