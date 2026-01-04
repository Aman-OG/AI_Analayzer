# Security Policy

## Overview

This document outlines the security measures implemented in the AI Resume Analyzer application to protect user data, prevent abuse, and ensure secure API operations.

## API Key Protection

### Gemini API Key Security

- **Server-Side Only**: The Gemini API key is stored exclusively on the server side in environment variables
- **Never Exposed**: The API key is never sent to the client or included in client-side code
- **Environment Variables**: Stored in `.env` file (never committed to version control)
- **Validation**: Server validates that no API keys are sent from client requests

### Best Practices

1. Never commit `.env` files to version control
2. Use different API keys for development and production
3. Rotate API keys regularly
4. Monitor API usage for unusual patterns

## Rate Limiting

Rate limiting is implemented to prevent abuse and protect against various attacks:

### Authentication Endpoints (`/api/auth/login`, `/api/auth/signup`)

- **Limit**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent brute force attacks
- **Response**: `429 Too Many Requests` when exceeded

### Resume Upload (`/api/resumes/upload`)

- **Limit**: 10 uploads per hour per IP
- **Purpose**: Prevent abuse of AI analysis and file storage
- **Response**: `429 Too Many Requests` when exceeded

### Job Creation (`/api/jobs`)

- **Limit**: 20 job creations per hour per IP
- **Purpose**: Prevent spam job postings
- **Response**: `429 Too Many Requests` when exceeded

### General API

- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: Baseline protection for all API endpoints
- **Response**: `429 Too Many Requests` when exceeded

### Rate Limit Headers

All responses include standard rate limit headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Security Headers (Helmet.js)

The application uses Helmet.js to set various HTTP security headers:

### Content Security Policy (CSP)

Prevents XSS attacks by controlling which resources can be loaded:
- Scripts: Only from same origin
- Styles: Same origin + inline styles (for development)
- Images: Same origin, data URIs, and HTTPS sources
- Frames: Blocked entirely

### HTTP Strict Transport Security (HSTS)

Forces HTTPS connections:
- Max Age: 1 year
- Includes subdomains
- Preload enabled

### X-Frame-Options

- **Value**: `DENY`
- **Purpose**: Prevents clickjacking attacks

### X-Content-Type-Options

- **Value**: `nosniff`
- **Purpose**: Prevents MIME type sniffing

### X-XSS-Protection

- **Value**: `1; mode=block`
- **Purpose**: Enables browser XSS filtering

### Referrer-Policy

- **Value**: `strict-origin-when-cross-origin`
- **Purpose**: Controls referrer information sent with requests

## MongoDB Injection Prevention

### NoSQL Injection Protection

- **Library**: `express-mongo-sanitize`
- **Function**: Removes `$` and `.` characters from user input
- **Logging**: Suspicious requests are logged for monitoring

## CORS Configuration

### Allowed Origins

- Configurable via `ALLOWED_ORIGINS` environment variable
- Default development origins: `http://localhost:3000`, `http://localhost:5173`
- Production: Only specified domains allowed
- Credentials: Enabled for authenticated requests

### Security Benefits

- Prevents unauthorized domains from accessing the API
- Protects against CSRF attacks
- Allows controlled cross-origin resource sharing

## Request Size Limits

- **JSON Body**: 10MB maximum
- **URL Encoded**: 10MB maximum
- **Purpose**: Prevent denial-of-service attacks via large payloads

## Deployment Recommendations

### Production Environment

1. **Use HTTPS**: Always use SSL/TLS certificates in production
2. **Environment Variables**: Use secure secret management (e.g., AWS Secrets Manager, Azure Key Vault)
3. **Rate Limiting**: Consider using Redis for distributed rate limiting across multiple servers
4. **Monitoring**: Set up alerts for:
   - Excessive rate limit violations
   - Suspicious authentication attempts
   - API key usage anomalies
5. **Regular Updates**: Keep all dependencies updated for security patches

### Infrastructure Security

1. **Firewall**: Configure firewall rules to restrict access
2. **VPC**: Deploy in a Virtual Private Cloud when possible
3. **Database**: Use connection encryption and authentication
4. **Backups**: Regular encrypted backups of data

## Incident Response

If you suspect a security breach:

1. Immediately rotate all API keys
2. Review server logs for suspicious activity
3. Check rate limit violations
4. Verify no unauthorized access to database
5. Contact security team if applicable

## Reporting Security Issues

If you discover a security vulnerability, please email: dreambigatall1@gmail.com

**Do not** open public GitHub issues for security vulnerabilities.

## Security Checklist for Developers

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Test rate limiting before deployment
- [ ] Verify CORS configuration for production domains
- [ ] Enable HTTPS in production
- [ ] Review security headers in browser DevTools
- [ ] Monitor API usage patterns
- [ ] Keep dependencies updated
- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Implement proper error handling (don't leak sensitive info)

## Dependencies

Security-related packages used:

- `helmet` (^8.0.0): Security headers
- `express-rate-limit` (^7.0.0): Rate limiting
- `express-mongo-sanitize` (^2.2.0): NoSQL injection prevention
- `cors` (^2.8.5): CORS configuration

## Updates

This security policy should be reviewed and updated:
- When new security features are added
- After security incidents
- Quarterly as part of security review
- When dependencies are updated

---

**Last Updated**: January 4, 2026
**Version**: 1.0
