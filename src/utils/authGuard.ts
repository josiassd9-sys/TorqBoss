let loginInProgress = false;

export const acquireLoginLock = () => {
  if (loginInProgress) return false;
  loginInProgress = true;
  return true;
};

export const releaseLoginLock = () => {
  loginInProgress = false;
};
