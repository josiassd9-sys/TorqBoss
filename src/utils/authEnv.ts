export const isWebView = () => {
  return /wv/.test(navigator.userAgent);
};

export const isCapacitor = () => {
  return !!(window as any).Capacitor;
};

export const isMobileApp = () => {
  return isCapacitor() || isWebView();
};
