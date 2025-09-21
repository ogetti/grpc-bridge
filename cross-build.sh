#!/bin/bash

# Cross-platform build script for gRPC Bridge

set -e

echo "🚀 Cross-platform build for gRPC Bridge"
echo "======================================="

# Load cargo environment
source "$HOME/.cargo/env" 2>/dev/null || true

# Build frontend first
echo "📦 Building frontend..."
pnpm install
pnpm build

# Check available targets
echo "🎯 Available Rust targets:"
rustup target list --installed

echo ""
echo "🔨 Building for multiple platforms..."

# Build for macOS (current platform)
echo "🍎 Building for macOS (aarch64-apple-darwin)..."
cargo build --release --manifest-path src-tauri/Cargo.toml --target aarch64-apple-darwin
echo "   ✅ macOS build complete: ./src-tauri/target/aarch64-apple-darwin/release/grpc-bridge"

# Build for macOS Intel
echo "🍎 Building for macOS Intel (x86_64-apple-darwin)..."
rustup target add x86_64-apple-darwin 2>/dev/null || true
cargo build --release --manifest-path src-tauri/Cargo.toml --target x86_64-apple-darwin
echo "   ✅ macOS Intel build complete: ./src-tauri/target/x86_64-apple-darwin/release/grpc-bridge"

# Build for Windows
echo "🪟 Building for Windows (x86_64-pc-windows-gnu)..."
export CC_x86_64_pc_windows_gnu="x86_64-w64-mingw32-gcc"
export CXX_x86_64_pc_windows_gnu="x86_64-w64-mingw32-g++"
export AR_x86_64_pc_windows_gnu="x86_64-w64-mingw32-ar"
export CARGO_TARGET_X86_64_PC_WINDOWS_GNU_LINKER="x86_64-w64-mingw32-gcc"

cargo build --release --manifest-path src-tauri/Cargo.toml --target x86_64-pc-windows-gnu
echo "   ✅ Windows build complete: ./src-tauri/target/x86_64-pc-windows-gnu/release/grpc-bridge.exe"

echo ""
echo "📁 Built files:"
echo "  🍎 macOS ARM:   ./src-tauri/target/aarch64-apple-darwin/release/grpc-bridge"
echo "  🍎 macOS Intel: ./src-tauri/target/x86_64-apple-darwin/release/grpc-bridge" 
echo "  🪟 Windows:     ./src-tauri/target/x86_64-pc-windows-gnu/release/grpc-bridge.exe"
echo ""
echo "✅ Cross-platform build complete!"

# Create distribution directory
echo "📦 Creating distribution packages..."
mkdir -p dist
cp src-tauri/target/aarch64-apple-darwin/release/grpc-bridge dist/grpc-bridge-macos-arm64
cp src-tauri/target/x86_64-apple-darwin/release/grpc-bridge dist/grpc-bridge-macos-x64
cp src-tauri/target/x86_64-pc-windows-gnu/release/grpc-bridge.exe dist/grpc-bridge-windows-x64.exe

echo "📦 Distribution packages created in ./dist/"
ls -la dist/
