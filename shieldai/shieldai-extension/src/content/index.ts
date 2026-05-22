import { initInterceptor } from './interceptor';

// Content script entry point — wrapped in try/catch to never break the host page
try {
  initInterceptor();
} catch (e) {
  console.warn('[ShieldAI] Content script initialization failed:', e);
}
