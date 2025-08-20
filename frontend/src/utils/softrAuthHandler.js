// Softr Authentication Handler for iframe integration
// This handles authentication when the app is embedded in Softr via iframe

const initSoftrAuthHandler = () => {
  // Only run if we're in an iframe
  if (window.self === window.top) {
    return;
  }

  console.log('Initializing Softr auth handler for iframe...');

  // Listen for messages from the parent Softr window
  window.addEventListener('message', async (event) => {
    try {
      // Basic security check - you should add origin validation in production
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const { email, name } = event.data;

      if (!email) {
        console.log('No email in postMessage data, ignoring...');
        return;
      }

      console.log('Received user data from Softr:', { email, name });

      // Send user data to backend for authentication
      const response = await fetch('https://schedulehq-saas.onrender.com/api/auth/softr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          redirect_url: 'https://softrcalendar.netlify.app'
        }),
      });

      const data = await response.json();
      console.log('Backend auth response:', data);

      if (data.success && data.magic_link) {
        // Redirect the iframe to the magic link for authentication
        console.log('Redirecting to magic link for authentication...');
        window.location.href = data.magic_link;
      } else {
        console.error('Authentication failed:', data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Error in Softr auth handler:', error);
    }
  });

  // Notify parent that we're ready to receive auth data
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'iframe-ready' }, '*');
  }
};

export default initSoftrAuthHandler;
