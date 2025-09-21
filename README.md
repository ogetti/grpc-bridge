# gRPC Bridge

A modern, cross-platform gRPC testing tool built with Tauri, React, and TypeScript. Test gRPC services with an intuitive desktop interface featuring proto file discovery, request/response handling, and beautiful UI components powered by shadcn/ui.

## ✨ Features

- 🔍 **Auto Proto Discovery**: Automatically scan and parse .proto files
- 🚀 **Unary gRPC Calls**: Test unary gRPC methods with ease
- 💾 **Request History**: Save and reuse previous requests
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS + shadcn/ui
- 🌍 **Cross Platform**: Works on macOS, Windows, and Linux
- 🌐 **Multi-language Support**: English, Japanese, Korean interface
- ⚡ **Fast Performance**: Native Rust backend with React frontend
- 🔧 **Developer Friendly**: JSON syntax highlighting and validation

## 📦 Installation

### Prerequisites

Before building gRPC Bridge, ensure you have the following installed:

#### For All Platforms:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **pnpm** - Package manager
- **Rust** (v1.70 or later) - [Install via rustup](https://rustup.rs/)

#### Platform-Specific Requirements:

##### macOS:

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

##### Windows:

```powershell
# Install Rust
winget install Rustlang.Rustup

# Install C++ Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Install Node.js
winget install OpenJS.NodeJS
```

##### Ubuntu/Debian:

```bash
# Install dependencies
sudo apt update
sudo apt install -y libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install pnpm

```bash
npm install -g pnpm
```

## 🏗️ Building from Source

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/grpc-bridge.git
cd grpc-bridge
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install
```

### 3. Build Options

#### Development Build (with hot reload)

```bash
# Start development server
pnpm tauri dev
```

#### Production Build

```bash
# Build for current platform
pnpm tauri build

# The built application will be available in:
# - macOS: src-tauri/target/release/bundle/dmg/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/deb/ or bundle/appimage/
```

#### Cross-Platform Build (macOS only)

```bash
# Make cross-build script executable
chmod +x cross-build.sh

# Build for multiple platforms
./cross-build.sh

# Built binaries will be in dist/ folder:
# - grpc-bridge-macos-arm64 (Apple Silicon)
# - grpc-bridge-macos-x64 (Intel Mac)
# - grpc-bridge-windows-x64.exe (Windows)
```

## 🚀 Usage

### Quick Start

1. **Launch the application**

   ```bash
   # Development
   pnpm tauri dev

   # Or run the built application
   ./grpc-bridge  # macOS/Linux
   grpc-bridge.exe  # Windows
   ```

2. **Load Proto Files**
   - Click "Scan Directory" to automatically discover .proto files
   - Or manually select individual .proto files

3. **Configure gRPC Target**
   - Enter your gRPC server address (e.g., `localhost:50051`)
   - Select the service and method from discovered protos

4. **Send Requests**
   - Fill in the request JSON payload
   - Add any required headers or metadata
   - Click "Send Request" to execute the gRPC call

5. **Change Language**
   - Click the language switcher in the Configuration panel
   - Choose from English (🇺🇸), Japanese (🇯🇵), or Korean (🇰🇷)
   - Language preference is automatically saved

## 🛠️ Development

### Project Structure

```
grpc-bridge/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── UnaryRequestPanel.tsx
│   │   ├── ProtoFileTree.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── locales/           # i18n translation files
│   │   ├── en.json        # English translations
│   │   ├── ja.json        # Japanese translations
│   │   └── ko.json        # Korean translations
│   ├── lib/               # Utilities
│   ├── stores/            # Zustand state management
│   └── i18n.ts            # Internationalization setup
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Tauri app entry
│   │   ├── proto_index/   # Proto file parsing
│   │   └── commands/      # Backend commands
│   └── Cargo.toml
├── dist/                  # Built frontend assets
└── docs/                  # Documentation
```

### Tech Stack

**Frontend:**

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **Monaco Editor** - Code editing
- **Radix UI** - Accessible primitives
- **react-i18next** - Internationalization (English, Japanese, Korean)

**Backend:**

- **Rust** - System programming language
- **Tauri** - Desktop app framework
- **Tokio** - Async runtime
- **serde** - Serialization
- **anyhow** - Error handling

### Development Scripts

```bash
# Start development server with hot reload
pnpm tauri dev

# Build frontend only
pnpm build

# Run linting
pnpm lint

# Build production app
pnpm tauri build

# Cross-platform build (macOS only)
./cross-build.sh
```

## 📋 Requirements

### Minimum System Requirements

- **OS**: macOS 10.15+, Windows 10+, or Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB for application
- **Network**: Internet connection for gRPC calls

### Development Requirements

- **Node.js**: v18.0.0 or later
- **Rust**: v1.70.0 or later
- **pnpm**: v8.0.0 or later (recommended package manager)

## Commands (Rust Backend)

| Command                                  | Description                         |
| ---------------------------------------- | ----------------------------------- |
| `register_proto_root(path)`              | Register a new proto root directory |
| `scan_proto_root(rootId)`                | Scan and index proto files          |
| `list_proto_roots()`                     | List all registered proto roots     |
| `list_services(rootId?)`                 | Get available gRPC services         |
| `get_method_skeleton(fqService, method)` | Get method request skeleton         |
| `run_grpc_call(params)`                  | Execute gRPC unary call via grpcurl |
| `remove_proto_root(rootId)`              | Remove proto root                   |

### RunParams Structure

```json
{
  "target": "localhost:50051",
  "service": "your.package.Service",
  "method": "YourMethod",
  "payload": "{\"field\":\"value\"}",
  "proto_files": [],
  "root_id": "root-uuid-here"
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
