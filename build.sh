#!/bin/bash

# gRPC Bridge 빌드 및 배포 스크립트

echo "🚀 Building gRPC Bridge..."

# 프론트엔드 빌드
echo "📦 Building frontend..."
pnpm install
pnpm build

# Tauri 앱 빌드
echo "🔨 Building Tauri app..."
pnpm tauri build

echo "✅ Build complete!"
echo ""
echo "📁 Built files location:"
echo "  Mac: ./src-tauri/target/release/grpc-bridge"
echo ""
echo "🎯 To run:"
echo "  ./src-tauri/target/release/grpc-bridge"
echo ""
echo "📋 To distribute:"
echo "  1. Copy the 'grpc-bridge' file to target machine"
echo "  2. Make it executable: chmod +x grpc-bridge"
echo "  3. Run: ./grpc-bridge"
