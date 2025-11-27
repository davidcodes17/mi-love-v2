import Toast from 'react-native-toast-message';

interface ToastOptions {
  type?: 'success' | 'error' | 'info';
  text1?: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  duration?: number;
  title?: string;
}

export const toast = {
  show: (options: ToastOptions) => {
    Toast.show({
      type: options.type || 'info',
      text1: options.title || options.text1 || '',
      text2: options.text2,
      position: options.position || 'top',
      visibilityTime: options.duration || options.visibilityTime || 3000,
    });
  },
  success: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  error: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  info: (message: string, subtitle?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  },
};

// Export Toast component for use in _layout.tsx
export { Toast };

// Support old API format
export default toast;
