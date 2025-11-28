/**
 * Toast notification for QuickLinks extension
 */

const TOAST_STYLES = `
  .quicklinks-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    z-index: 2147483647;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  .quicklinks-toast.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .quicklinks-toast.success {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .quicklinks-toast.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .quicklinks-toast.info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
`;

let styleInjected = false;
let currentToast: HTMLElement | null = null;

function injectStyles(): void {
  if (styleInjected) return;

  const style = document.createElement("style");
  style.textContent = TOAST_STYLES;
  document.head.appendChild(style);
  styleInjected = true;
}

export type ToastType = "success" | "error" | "info";

export function showToast(
  message: string,
  type: ToastType = "success",
  duration = 3000
): void {
  injectStyles();

  // Remove existing toast if any
  if (currentToast) {
    currentToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `quicklinks-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  currentToast = toast;

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  // Auto-hide after duration
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
      if (currentToast === toast) {
        currentToast = null;
      }
    }, 300);
  }, duration);
}
