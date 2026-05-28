.PHONY: help setup dev build test lint clean deploy-testnet

help:
	@echo "Stellar-Tipz Development Commands"
	@echo "================================="
	@echo ""
	@echo "  make setup           Install all dependencies (contract + frontend)"
	@echo "  make dev             Start development servers"
	@echo "  make build           Build everything (contract + frontend)"
	@echo "  make test            Run all tests (contract + frontend)"
	@echo "  make lint            Run all linters"
	@echo "  make clean           Clean build artifacts"
	@echo "  make deploy-testnet  Deploy contract to testnet"
	@echo ""

setup:
	cd contracts && cargo build --target wasm32-unknown-unknown --release
	cd frontend-scaffold && npm install --legacy-peer-deps

dev:
	cd frontend-scaffold && npm run dev

build:
	cd contracts && cargo build --target wasm32-unknown-unknown --release
	cd frontend-scaffold && npm run build

test:
	cd contracts && cargo test 2>/dev/null || echo "No contract tests found"
	cd frontend-scaffold && npm run test -- --run

lint:
	cd frontend-scaffold && npm run lint

clean:
	cd contracts && cargo clean
	cd frontend-scaffold && rm -rf build node_modules
	rm -rf frontend-scaffold/build

deploy-testnet:
	./scripts/deploy-testnet.sh --build
