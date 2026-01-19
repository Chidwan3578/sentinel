# Security Policy

## Reporting a Vulnerability

Security is critical for a secret management system. We take all security reports seriously.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by emailing:

**security@subcode.ventures**

Include the following information:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact (what could an attacker do?)
- Suggested fix (if you have one)
- Your contact information

### What to Expect

1. **Acknowledgment**: We'll acknowledge your report within 48 hours
2. **Investigation**: We'll investigate and confirm the vulnerability
3. **Fix Development**: We'll develop a patch for the issue
4. **Disclosure**: We'll coordinate disclosure timing with you
5. **Credit**: We'll credit you in the security advisory (unless you prefer anonymity)

### Response Timeline

- **Critical vulnerabilities**: Patch within 7 days
- **High severity**: Patch within 14 days
- **Medium severity**: Patch within 30 days
- **Low severity**: Patch in next scheduled release

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

When deploying Sentinel in production:

### Authentication

- **Change the default API token** (`sentinel_dev_key` is for development only)
- **Use strong, randomly generated tokens** (minimum 32 characters)
- **Rotate tokens regularly** (every 90 days recommended)
- **Store tokens securely** (environment variables, not in code)

### Network Security

- **Use HTTPS in production** (TLS 1.2 or higher)
- **Deploy behind a reverse proxy** (nginx, Caddy, Traefik)
- **Restrict network access** (firewall rules, VPC)
- **Use private networks** for agent-to-Sentinel communication

### Database Security

- **Set appropriate file permissions** on `sentinel.db` (600 or more restrictive)
- **Encrypt the database at rest** (LUKS, dm-crypt, cloud encryption)
- **Regular backups** (encrypted and off-site)
- **Monitor database access logs**

### Secrets Management

- **Never commit real secrets** to version control
- **Use unique secrets per environment** (dev/staging/prod)
- **Implement secret rotation** (automated when possible)
- **Set appropriate TTLs** (shorter is better)
- **Monitor expired secret usage attempts**

### Audit Logging

- **Enable comprehensive logging** (all requests, approvals, denials)
- **Ship logs to a SIEM** (Splunk, ELK, Datadog)
- **Set up alerts** for suspicious patterns
- **Retain logs** according to compliance requirements

### Access Control

- **Implement least privilege** (agents only access what they need)
- **Require approval for production secrets** (configure policies)
- **Review access logs regularly** (at least weekly)
- **Revoke unused agent credentials**

### Updates and Patching

- **Subscribe to security advisories** (watch the GitHub repo)
- **Test updates in staging first**
- **Apply security patches promptly**
- **Review release notes** before upgrading

## Known Limitations

Current implementation has the following security limitations:

### Development Version

- **Hardcoded API token**: `sentinel_dev_key` is not secure for production
- **HTTP only**: No built-in HTTPS support (use reverse proxy)
- **Mock policy engine**: Simple string-matching policies (extend for production)
- **No secret encryption**: Secrets stored in plaintext in DB (use encrypted volumes)
- **Single token auth**: No multi-user authentication (coming in future release)

### Production Recommendations

For production use, we recommend:

1. **Deploy with reverse proxy** (nginx + Let's Encrypt for HTTPS)
2. **Use environment-based configuration** (avoid hardcoded secrets)
3. **Implement custom policy engine** (integrate with OPA, Cedar, or custom logic)
4. **Encrypt database volume** (LUKS, cloud KMS)
5. **Consider Sentinel Cloud** (managed service with enhanced security)

## Security Features

Sentinel includes the following security features:

- **Intent-based access**: All requests require context and justification
- **Audit trail**: Complete log of all access requests and decisions
- **Human-in-the-loop**: Configurable approval workflows
- **Time-limited access**: Secrets automatically expire after TTL
- **Bearer token authentication**: API access requires valid token
- **Policy engine**: Flexible rules for access control
- **Request tracking**: Persistent storage of all security events

## Compliance

Sentinel is designed to support compliance with:

- **SOC 2**: Audit logging and access controls
- **GDPR**: Data retention and access tracking
- **HIPAA**: Access controls and audit trails (when properly configured)
- **PCI DSS**: Secret management and access logging

Note: Compliance requires proper configuration and operational practices beyond the software itself.

## Security Contacts

- **General security questions**: security@subcode.ventures
- **Urgent security issues**: security@subcode.ventures (mark as URGENT)
- **Security consulting**: For enterprise deployments, contact sales@subcode.ventures

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we deeply appreciate security research. Responsible disclosure of vulnerabilities may be eligible for:

- Public acknowledgment (with your permission)
- Swag and thank-you gifts
- Priority support

Contact us at security@subcode.ventures to discuss.

---

Thank you for helping keep Sentinel and our community safe!
