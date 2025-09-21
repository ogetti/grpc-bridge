# Contributing to gRPC Bridge

Thank you for your interest in contributing to gRPC Bridge! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup

1. **Prerequisites**: Ensure you have the required tools installed:
   - Node.js 18+ 
   - Rust 1.70+
   - pnpm 8+

2. **Quick Setup**: Run the setup script for your platform:
   ```bash
   # macOS/Linux
   ./setup-dev.sh
   
   # Windows (PowerShell as Administrator)
   .\setup-dev.ps1
   ```

3. **Manual Setup**:
   ```bash
   git clone https://github.com/your-username/grpc-bridge.git
   cd grpc-bridge
   pnpm install
   pnpm tauri dev
   ```

## 🏗️ Project Structure

```
grpc-bridge/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── *.tsx          # Feature components
│   ├── lib/               # Utilities and helpers
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Application entry point
│   │   ├── proto_index/   # Proto file parsing logic
│   │   ├── commands.rs    # Tauri commands
│   │   └── lib.rs         # Library modules
│   └── Cargo.toml         # Rust dependencies
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## 🛠️ Development Workflow

### Available Scripts

```bash
# Development
pnpm tauri dev              # Start dev server with hot reload
pnpm dev                    # Frontend only development
pnpm build                  # Build frontend assets

# Code Quality
pnpm lint                   # Run ESLint
pnpm format                 # Format code with Prettier
pnpm type-check            # TypeScript type checking

# Building
pnpm tauri build           # Build production app
./cross-build.sh           # Cross-platform build (macOS)

# Maintenance
pnpm deps:update           # Update dependencies
pnpm deps:check            # Check for vulnerabilities
pnpm clean                 # Clean build artifacts
```

### Code Style Guidelines

- **TypeScript**: Use strict typing, prefer interfaces over types for object shapes
- **React**: Use functional components with hooks
- **Styling**: Use Tailwind CSS classes, leverage shadcn/ui components
- **Rust**: Follow Rust conventions, use `cargo fmt` and `cargo clippy`

### Commit Message Format

Follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(ui): add dark mode support
fix(grpc): resolve connection timeout issues
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
pnpm test

# Rust tests
cd src-tauri && cargo test

# Integration tests
pnpm test:integration
```

### Writing Tests

- **Frontend**: Use Vitest and React Testing Library
- **Backend**: Use Rust's built-in test framework
- **E2E**: Use Playwright for end-to-end testing

## 📋 Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Write** clear, concise commit messages
3. **Update** documentation if needed
4. **Add** tests for new functionality
5. **Ensure** all checks pass (lint, type-check, tests)
6. **Submit** a pull request with a clear description

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] All checks passing

## 🐛 Bug Reports

When filing bug reports, please include:

1. **Environment**: OS, Node.js version, Rust version
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Console output or error messages

## 💡 Feature Requests

For feature requests, please provide:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered
4. **Use Cases**: Who would benefit from this?

## 🏷️ Release Process

Releases follow semantic versioning:

- **Major** (x.0.0): Breaking changes
- **Minor** (x.y.0): New features, backward compatible
- **Patch** (x.y.z): Bug fixes, backward compatible

```bash
# Create release
pnpm release:patch   # or minor/major
git push --follow-tags
```

## 📚 Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💬 Community

- **Issues**: [GitHub Issues](https://github.com/your-username/grpc-bridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/grpc-bridge/discussions)
- **Discord**: [Community Server](https://discord.gg/your-invite)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to gRPC Bridge! 🎉
