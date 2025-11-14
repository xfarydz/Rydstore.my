// Global type definitions for window object extensions
export {}

declare global {
  interface Window {
    showAlert?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  }
}