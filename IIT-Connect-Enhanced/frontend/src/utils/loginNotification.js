export async function notifySuccessfulLogin(user) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    let permission = Notification.permission;
    // Request permission only while handling the user's login action.
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    let registration = null;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.ready;
      } catch {
        // The regular Notification API is a fallback where service workers are unavailable.
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
