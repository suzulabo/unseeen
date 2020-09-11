import { FunctionalComponent, h } from '@stencil/core';

interface props {}

export const UIreCAPTCHA: FunctionalComponent<props> = () => {
  return (
    <div class="reCAPTCHA">
      This site is protected by reCAPTCHA and the Google
      <br />
      <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
      <a href="https://policies.google.com/terms">Terms of Service</a> apply.
    </div>
  );
};
