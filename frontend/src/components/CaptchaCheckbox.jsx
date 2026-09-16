import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/**
 * Reusable reCAPTCHA v2 checkbox component.
 * Wraps react-google-recaptcha with consistent styling.
 *
 * Props:
 *   onVerify(token)   — called when user completes CAPTCHA; receives the token string
 *   onExpire()        — called when CAPTCHA token expires (user must re-verify)
 *   disabled          — disable the CAPTCHA (e.g. while submitting)
 *   className         — optional extra classes
 */
export default function CaptchaCheckbox({ onVerify, onExpire, disabled = false, className = '' }) {
  if (!SITE_KEY) {
    // Graceful fallback if no key is configured yet
    console.warn('[CaptchaCheckbox] VITE_RECAPTCHA_SITE_KEY is not set. CAPTCHA is disabled.');
    return null;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <ReCAPTCHA
        sitekey={SITE_KEY}
        onChange={onVerify}
        onExpired={onExpire}
        theme="light"
        size="normal"
        disabled={disabled}
      />
    </div>
  );
}
