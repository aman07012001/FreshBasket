

console.log('🌐 Frontend Connection Diagnostic');
console.log('=================================');

console.log('Test 1: Environment Configuration');
console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('  API_BASE_URL (computed):', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
console.log('  NODE_ENV:', import.meta.env.NODE_ENV);
console.log('  Current URL:', window.location.href);

console.log('Test 2: Network Status');
console.log('  Online:', navigator.onLine);
console.log('  Connection:', navigator.connection ? navigator.connection.effectiveType : 'Unknown');

async function testBackendConnection() {
  console.log('Test 3: Testing Backend Connection');

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const healthUrl = `${apiUrl}/health`;

  console.log('  Testing URL:', healthUrl);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit' 
    });

    console.log('  Response Status:', response.status);
    console.log('  Response OK:', response.ok);
    console.log('  Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('  Response Data:', data);
      console.log('✅ Backend is reachable!');
    } else {
      console.log('❌ Backend returned error:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 This suggests the backend server is not running or not accessible');
  }
}

async function testBackendConnectionWithCredentials() {
  console.log('Test 4: Testing Backend Connection with Credentials');

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const meUrl = `${apiUrl}/api/auth/me`;

  console.log('  Testing URL:', meUrl);

  try {
    const response = await fetch(meUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include' 
    });

    console.log('  Response Status:', response.status);
    console.log('  Response OK:', response.ok);
    console.log('  Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('  Response Data:', data);

    if (response.ok) {
      console.log('✅ Authenticated endpoint is reachable!');
    } else {
      console.log('❌ Authenticated endpoint returned error:', response.status);
      if (response.status === 401) {
        console.log('💡 This suggests authentication is working but no valid session');
      }
    }
  } catch (error) {
    console.log('❌ Authenticated connection failed:', error.message);
  }
}

console.log('Test 5: Local Storage Tokens');
const token = localStorage.getItem('token');
console.log('  Token exists:', !!token);
if (token) {
  console.log('  Token length:', token.length);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('  Token payload:', payload);
    console.log('  Token expires at:', new Date(payload.exp * 1000));
    console.log('  Token expired:', payload.exp * 1000 < Date.now());
  } catch (e) {
    console.log('  Token decode error:', e.message);
  }
}

console.log('Test 6: Cookies');
console.log('  Cookies:', document.cookie);
console.log('  Cookie count:', document.cookie.split(';').filter(c => c.trim()).length);

testBackendConnection().then(() => {
  setTimeout(() => {
    testBackendConnectionWithCredentials();
  }, 1000);
});

window.diagnosticTests = {
  testBackendConnection,
  testBackendConnectionWithCredentials
};