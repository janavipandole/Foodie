import { decodeJwtResponse } from '../auth.js';

// Mock atob for Node.js environment
global.atob = str => Buffer.from(str, 'base64').toString('binary');

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
