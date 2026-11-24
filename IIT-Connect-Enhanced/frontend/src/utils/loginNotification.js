export async function requestLoginNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch (error) {
    console.warn('Notification permission was not granted:', error);
  }
}

export async function notifySuccessfulLogin(user) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    let registration = null;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.ready;
      } catch {
        // Use the standard Notification API as a fallback.
      }
    }

    const displayName = user?.profile?.name || user?.email?.split('@')[0] || 'there';
    const options = {
      body: `Welcome back, ${displayName}. You're signed in to IIT Connect.`,
      icon: '/iit-connect-emblem.png',
      badge: '/iit-connect-emblem.png',
      tag: 'iit-connect-login',
      renotify: false,
      data: { url: '/app' }
    };

    if (registration?.showNotification) {
      await registration.showNotification('IIT Connect — Login successful', options);
    } else {
      new Notification('IIT Connect — Login successful', options);
    }
  } catch (error) {
    // Notification failures must never block authentication.
    console.warn('Login notification could not be displayed:', error);
  }
}
