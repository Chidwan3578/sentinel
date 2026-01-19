# Changelog

All notable changes to Sentinel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Web-based admin dashboard for reviewing requests
- Custom policy language (Rego or Cedar integration)
- Multi-user approval workflows
- Vault backend integration (HashiCorp Vault, AWS Secrets Manager)
- Slack/Discord notifications for pending approvals
- OpenTelemetry metrics and tracing
- Role-based access control (RBAC)
- Request templates and presets

## [1.0.0] - Upcoming Release

### Added
- **Initial Release** of Sentinel Community Edition
- REST API server with Hono framework
- Intent-based access request system
- SQLite persistence layer
- Policy engine with auto-approve/require-approval/deny rules
- Time-limited secret access with TTL
- Admin API for approving/denying requests
- TypeScript SDK with automatic polling
- Comprehensive audit logging
- Bearer token authentication
- Docker Compose setup for local development
- Complete documentation and contribution guidelines

### Features
- `/v1/access/request` - Request access to secrets with intent context
- `/v1/access/requests/:id` - Poll request status
- `/v1/admin/requests` - List all requests (with optional status filter)
- `/v1/admin/requests/:id/approve` - Approve pending request
- `/v1/admin/requests/:id/deny` - Deny pending request

### Technical
- Built with Bun runtime
- Hono web framework
- SQLite database with automatic schema initialization
- TypeScript SDK with error handling and retries
- Comprehensive test suite
- CI/CD pipeline with GitHub Actions

---

## Version History

- **1.0.0** - Initial public release (upcoming)

## Upgrade Guide

### From Pre-release to 1.0.0

This is the first stable release. No migration needed.

## Breaking Changes

None - this is the initial release.

---

For detailed commit history, see [GitHub Releases](https://github.com/subcode-ventures/sentinel/releases).
