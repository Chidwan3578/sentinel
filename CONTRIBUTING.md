# Contributing to Sentinel

Thank you for your interest in contributing to Sentinel! We welcome contributions from the community and are excited to see what you'll build.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a code of conduct that emphasizes respect, collaboration, and constructive feedback. By participating, you are expected to uphold these principles.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as [GitHub Issues](https://github.com/subcode-ventures/sentinel/issues). Before creating a new issue:

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** provided
3. **Include detailed information**:
   - Clear, descriptive title
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Environment details (OS, Bun version, etc.)
   - Relevant logs or error messages
   - Screenshots if applicable

### Suggesting Features

We love new ideas! To suggest a feature:

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template** provided
3. **Describe your use case**:
   - What problem does this solve?
   - How would you use this feature?
   - What alternatives have you considered?
   - Are you willing to implement it?

### Submitting Pull Requests

We actively review and welcome pull requests! See the [Pull Request Process](#pull-request-process) below for details.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- Git
- A code editor (we recommend VS Code with TypeScript support)

### Getting Started

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinel.git
   cd sentinel
   ```

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Run the development server**:
   ```bash
   bun run src/server.ts
   ```

5. **Run tests**:
   ```bash
   bun test
   ```

6. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Running the Full Stack

To test the complete system:

```bash
# Terminal 1: Start the Sentinel server
cd sentinel
bun run src/server.ts

# Terminal 2: Run the test client
bun test_client.ts
```

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**:
   - Write clear, concise commit messages
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   bun test
   bun run src/server.ts  # Manual testing
   ```

4. **Update documentation**:
   - Update README.md if adding features
   - Add/update JSDoc comments
   - Update CHANGELOG.md (see format below)

5. **Push to your fork**:
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Open a Pull Request**:
   - Use the PR template provided
   - Link any related issues
   - Describe what changed and why
   - Include screenshots/videos for UI changes
   - Request review from maintainers

7. **Address review feedback**:
   - Respond to comments
   - Make requested changes
   - Push updates to your branch

8. **Merge**:
   - Once approved, a maintainer will merge your PR
   - Your contribution will be included in the next release!

## Code Style Guidelines

### TypeScript

- **Use TypeScript strict mode** (we enforce type safety)
- **Prefer explicit types** over `any`
- **Use interfaces** for object shapes
- **Export types** that external users need

### Naming Conventions

- **Files**: `snake_case.ts` (e.g., `access_request.ts`)
- **Classes**: `PascalCase` (e.g., `SentinelClient`)
- **Functions/Variables**: `camelCase` (e.g., `requestSecret`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_TOKEN`)
- **Interfaces/Types**: `PascalCase` (e.g., `AccessRequest`)

### Code Organization

- **One class/interface per file** (except for closely related types)
- **Group imports**: external libraries, then internal modules
- **Export public API** at the end of files
- **Use meaningful names** that describe purpose

### Comments

- **Use JSDoc** for public APIs:
  ```typescript
  /**
   * Requests access to a secret resource with intent context.
   * @param options - The access request parameters
   * @returns Promise resolving to the access response
   * @throws {SentinelError} If the request fails
   */
  async requestSecret(options: RequestOptions): Promise<AccessResponse>
  ```
- **Explain "why"** not "what" in inline comments
- **Keep comments up-to-date** with code changes

### Formatting

We use standard TypeScript formatting:

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Line length**: 100 characters max (soft limit)

You can run the formatter (when configured):
```bash
bun run format
```

## Testing Requirements

All contributions must include appropriate tests:

### Test Coverage

- **New features**: Add tests covering happy path and error cases
- **Bug fixes**: Add a test that reproduces the bug
- **Refactoring**: Ensure existing tests still pass

### Test Structure

```typescript
import { describe, test, expect } from 'bun:test';

describe('SentinelClient', () => {
  test('should request secret successfully', async () => {
    const client = new SentinelClient({ /* config */ });
    const result = await client.requestSecret({ /* params */ });
    expect(result.status).toBe('APPROVED');
  });

  test('should handle network errors', async () => {
    const client = new SentinelClient({ baseUrl: 'http://invalid' });
    await expect(client.requestSecret({})).rejects.toThrow(SentinelNetworkError);
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/client.test.ts

# Run tests in watch mode
bun test --watch
```

## Project Structure

```
sentinel/
├── src/                    # Server source code
│   ├── server.ts           # Main API server
│   └── types.ts            # Shared type definitions
├── sdk/                    # TypeScript client SDK (future location)
├── docs/                   # Documentation
│   └── ARCHITECTURE.md     # Architecture overview
├── .github/                # GitHub templates and workflows
│   ├── workflows/          # CI/CD pipelines
│   └── ISSUE_TEMPLATE/     # Issue templates
├── test_client.ts          # Example client usage
├── test_admin.ts           # Example admin API usage
├── sentinel.db             # SQLite database (gitignored)
├── README.md               # Main documentation
├── CONTRIBUTING.md         # This file
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Version history
└── docker-compose.yml      # Local development setup
```

## Questions?

If you have questions about contributing:

- Check existing [GitHub Discussions](https://github.com/subcode-ventures/sentinel/discussions)
- Open a new discussion
- Reach out to maintainers in your PR

Thank you for contributing to Sentinel!
