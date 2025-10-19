# Security Policy

## 🔒 Reporting Security Vulnerabilities

The OpenAsk team takes security seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### Reporting Process

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**[security@openask.com]** (or your actual security contact email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include in Your Report

To help us better understand the nature and scope of the issue, please include as much of the following information as possible:

- **Type of issue** (e.g., SQL injection, XSS, CSRF, authentication bypass)
- **Full paths of source file(s)** related to the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue** - what an attacker might be able to do
- **Potential mitigations** you've identified (if any)

This information will help us triage your report more quickly.

### What to Expect

After you submit a report, here's what will happen:

1. **Acknowledgment** - We'll acknowledge receipt of your vulnerability report within 48 hours
2. **Investigation** - We'll investigate and validate the issue within 7 days
3. **Communication** - We'll keep you informed about our progress
4. **Fix & Disclosure** - We'll work on a fix and coordinate disclosure timing with you
5. **Credit** - If you desire, we'll credit you in our security advisories

### Our Commitment

- We will respond to your report within 48 hours with our evaluation and expected resolution date
- We will handle your report with strict confidentiality and not share it with third parties without your permission
- We will keep you informed about our progress towards resolving the issue
- We will credit you (if desired) when we publish a fix

## 🛡️ Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

**Note:** Only the latest minor version receives security updates.

## 🔐 Security Best Practices

When deploying OpenAsk, please follow these security best practices:

### Environment Variables

- **Never commit `.env` files** to version control
- Use **strong, unique secrets** for production
- Rotate **API keys and tokens** regularly
- Use **environment-specific credentials** (dev/staging/prod)

### Authentication & Authorization

- Configure **Auth0 properly** with production tenants
- Use **audience validation** for JWT tokens
- Set **appropriate CORS origins**
- Enable **rate limiting** on all write endpoints
- Implement **session timeouts**

### Database Security

- Use **MongoDB authentication** in production
- Enable **SSL/TLS** for database connections
- Implement **IP whitelisting** where possible
- Regular **backup and recovery testing**
- Use **least privilege** access for database users

### API Security

- Always use **HTTPS** in production
- Enable **Helmet.js** security headers (already configured)
- Implement **rate limiting** (already configured)
- Validate **all user inputs** with Zod schemas (already configured)
- Sanitize **markdown content** (already configured)
- Use **parameterized queries** (Mongoose handles this)

### Infrastructure

- Keep **dependencies up to date**
- Run **security audits** regularly: `pnpm audit`
- Use **container scanning** for Docker images
- Implement **logging and monitoring**
- Set up **intrusion detection**
- Use **Web Application Firewall (WAF)**

### Code Security

```bash
# Run security audit
pnpm audit

# Fix auto-fixable vulnerabilities
pnpm audit fix

# Check for outdated dependencies
pnpm outdated

# Update dependencies
pnpm update
```

## 🚨 Known Security Considerations

### Current Implementation

OpenAsk implements the following security measures:

✅ **Auth0 JWT Validation** - Industry-standard authentication  
✅ **CORS Protection** - Restricted to configured origins  
✅ **Rate Limiting** - 100 requests per 15 minutes on write operations  
✅ **Input Validation** - Zod schemas on all endpoints  
✅ **Markdown Sanitization** - XSS prevention with safe HTML allowlist  
✅ **Helmet Security Headers** - Protection against common vulnerabilities  
✅ **Ownership Checks** - Users can only edit their own content  
✅ **MongoDB Injection Prevention** - Mongoose query escaping  

### Areas for Additional Security (Production Recommendations)

⚠️ **API Keys** - Store Gemini API key in secure vault (AWS Secrets Manager, Azure Key Vault)  
⚠️ **HTTPS** - Enforce HTTPS in production (use reverse proxy like nginx)  
⚠️ **Session Management** - Implement refresh tokens for long-lived sessions  
⚠️ **2FA** - Enable two-factor authentication in Auth0  
⚠️ **Audit Logging** - Log all sensitive operations  
⚠️ **DDoS Protection** - Use CloudFlare or AWS Shield  
⚠️ **Content Security Policy** - Implement strict CSP headers  
⚠️ **Subresource Integrity** - Use SRI for CDN resources  

## 📋 Security Checklist for Deployment

Before deploying to production, ensure:

- [ ] All environment variables use production values
- [ ] Auth0 configured with production tenant and callback URLs
- [ ] MongoDB uses authentication and SSL/TLS
- [ ] HTTPS enforced for all connections
- [ ] Rate limiting configured appropriately
- [ ] CORS origins restricted to production domain
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date (`pnpm audit`)
- [ ] Secrets are stored in secure vault
- [ ] Logging and monitoring enabled
- [ ] Backup and recovery tested
- [ ] Security headers properly configured
- [ ] DDoS protection in place

## 🔍 Vulnerability Disclosure Policy

We follow **coordinated vulnerability disclosure**:

1. **Report received** - Acknowledgment sent within 48 hours
2. **Validation** - Issue validated within 7 days
3. **Fix development** - Patch developed and tested
4. **Coordinated disclosure** - We work with you on timing
5. **Public disclosure** - Security advisory published
6. **Credit given** - Reporter credited (if desired)

### Timeline

- **Critical vulnerabilities**: Patched within 7 days
- **High severity**: Patched within 30 days
- **Medium severity**: Patched within 90 days
- **Low severity**: Next scheduled release

## 🏆 Security Hall of Fame

We recognize security researchers who help make OpenAsk more secure:

<!-- Will be updated as security reports are received and resolved -->

*No security vulnerabilities reported yet. Be the first to help us improve!*

## 📞 Contact

For security issues: **[security@openask.com]** (replace with actual email)

For general questions: [GitHub Issues](https://github.com/9jaDevo/OpenAsk/issues)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Auth0 Security Documentation](https://auth0.com/docs/secure)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 📄 Legal

This security policy is subject to our [Terms of Service](https://openask.com/terms) and [Privacy Policy](https://openask.com/privacy).

---

**Thank you for helping keep OpenAsk and our users safe!** 🛡️

*Last Updated: October 19, 2025*
