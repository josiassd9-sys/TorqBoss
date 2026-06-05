import { devopsBus } from './eventBus';

export function captureError(error: any, context?: string) {
  devopsBus.emit('error', 'APP_ERROR', {
    message: error?.message,
    stack: error?.stack,
    context
  });
}
