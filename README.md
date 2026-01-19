# Sentinel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)
[![GitHub Stars](https://img.shields.io/github/stars/subcode-ventures/sentinel?style=social)](#)

**Secure Secret Management for AI Agents**

Sentinel is an intent-based access control system built specifically for AI agents. It provides audit logging, human-in-the-loop approval workflows, and policy-based secret management to ensure your AI agents request credentials safely and transparently.

## Why Sentinel?

AI agents need access to secrets (API keys, database credentials, cloud tokens) to perform their tasks. Traditional secret management tools aren't built for the unique challenges of autonomous agents:

- **Intent Transparency**: Every secret request includes context (what task, why needed)
- **Audit Trail**: Complete logs of which agent requested what, when, and for what purpose
- **Human Oversight**: Sensitive resources require human approval before access is granted
- **Time-Limited Access**: Secrets expire automatically after use
- **Policy Engine**: Flexible rules determine when human approval is required

Sentinel makes it safe to give your AI agents the keys to the kingdom.

## Key Features

- **Intent-Based Requests**: Agents explain what they need and why
- **Audit Logging**: Complete trail of all access requests and decisions
- **Human-in-the-Loop**: Configurable approval workflows for sensitive resources
- **Policy Engine**: Define rules for automatic approval/denial/escalation
- **Time-Limited Secrets**: All secrets have TTL and auto-expire
- **REST API**: Simple HTTP interface for any agent platform
- **TypeScript SDK**: First-class client library included
- **SQLite Persistence**: Lightweight, zero-config data storage
- **Admin Dashboard**: Web UI for reviewing and approving requests (coming soon)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/subcode-ventures/sentinel.git
cd sentinel

# Install dependencies (requires Bun)
bun install

# Start the server
bun run src/server.ts
```

The server will start on `http://localhost:3000`.

### Basic Usage

#### Using the TypeScript SDK

```typescript
import { SentinelClient } from '@subcode/sentinel-client';

const client = new SentinelClient({
  baseUrl: 'http://localhost:3000',
  apiToken: 'sentinel_dev_key',
  agentId: 'my-agent',
});

// Request a secret with intent context
const result = await client.requestWithPolling({
  resourceId: 'github_api_token',
  intent: {
    task_id: 'TASK-123',
    summary: 'Deploy to production',
    description: 'Need GitHub token to push release tags',
  },
  ttlSeconds: 3600,
});

if (result.status === 'APPROVED') {
  console.log('Secret granted:', result.secret?.value);
} else {
  console.error('Access denied:', result.reason);
}
```

#### Using the REST API

```bash
curl -X POST http://localhost:3000/v1/access/request \
  -H "Authorization: Bearer sentinel_dev_key" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "my-agent",
    "resource_id": "aws_credentials",
    "intent": {
      "task_id": "DEPLOY-456",
      "summary": "Deploy v2.0.0",
      "description": "Need AWS creds for terraform apply"
    },
    "ttl_seconds": 3600
  }'
```

### Docker Setup

```bash
# Using docker-compose for easy local development
docker-compose up -d

# Sentinel will be available at http://localhost:3000
```

## Architecture Overview

Sentinel consists of three main components:

1. **Vault Server** (`src/server.ts`): REST API server built with Hono
   - Handles access requests
   - Enforces policies
   - Manages secret lifecycle
   - Persists requests in SQLite

2. **Client SDK** (`/sdk`): TypeScript library for agents
   - Type-safe API client
   - Automatic polling for pending approvals
   - Error handling and retries
   - Environment variable support

3. **Overseer** (Admin API): Human approval interface
   - Review pending requests
   - Approve/deny access
   - Audit trail viewer
   - Policy configuration (coming soon)

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Policy System

Sentinel uses a flexible policy engine to determine access decisions:

- **Auto-Approve**: Low-risk resources (dev environments, read-only tokens)
- **Require Approval**: Production credentials, sensitive data, financial systems
- **Auto-Deny**: Blocked resources, compliance violations

**Example Policy (current mock implementation)**:
- Resources containing `prod` or `sensitive` → Requires approval
- Resources containing `forbidden` → Automatically denied
- All others → Automatically approved

Customize policies in your deployment to match your security requirements.

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and components
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- [Security Policy](SECURITY.md) - Reporting vulnerabilities
- [Changelog](CHANGELOG.md) - Version history

## Roadmap

- [ ] Web-based admin dashboard
- [ ] Custom policy language (Rego/Cedar)
- [ ] Multi-user approval workflows
- [ ] Vault backend integration (HashiCorp Vault, AWS Secrets Manager)
- [ ] Slack/Discord notifications for pending approvals
- [ ] OpenTelemetry metrics and tracing
- [ ] Role-based access control (RBAC)
- [ ] Request templates and presets

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Reporting bugs
- Submitting feature requests
- Development setup
- Pull request process
- Code style guidelines

## License

Sentinel is open source software licensed under the [MIT License](LICENSE).

## Community & Support

- **Issues**: [GitHub Issues](https://github.com/subcode-ventures/sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/subcode-ventures/sentinel/discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities

## Enterprise & Cloud

Looking for a hosted solution with advanced features?

**Sentinel Cloud** offers:
- Managed hosting and updates
- Advanced policy engine
- Multi-region deployment
- SSO and SAML integration
- SLA guarantees
- Priority support

Learn more at [sentinel.subcode.ventures](https://sentinel.subcode.ventures)

---

Built with love by [SubCode Ventures](https://subcode.ventures) - AI-first software development
