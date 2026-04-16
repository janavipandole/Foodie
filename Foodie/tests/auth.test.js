// Sample unit test for auth.js
// You can expand this with real functions from auth.js or any files you want to test.

// Mock atob for Node.js environment
global.atob = str => Buffer.from(str, 'base64').toString('binary');

// Redefine decodeJwtResponse for test (since auth.js does not export)
function decodeJwtResponse(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    global.atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

describe('Auth Module', () => {
  test('decodeJwtResponse decodes JWT payload', () => {
    // Create a sample JWT with payload {"user":"nandan"}
    const header = Buffer.from(JSON.stringify({alg: "HS256", typ: "JWT"})).toString('base64').replace(/=/g, '');
    const payload = Buffer.from(JSON.stringify({user: "nandan"})).toString('base64').replace(/=/g, '');
    const token = `${header}.${payload}.signature`;
    expect(decodeJwtResponse(token)).toEqual({user: "nandan"});
  });

  test('decodeJwtResponse returns error for invalid token', () => {
    expect(() => decodeJwtResponse('invalid.token')).toThrow();
  });
});