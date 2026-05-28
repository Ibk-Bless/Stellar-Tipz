#!/bin/bash

# Bundle Size Optimization - Testing & Validation Script
# This script helps verify the implementation is working correctly

set -e

echo "🔍 Stellar-Tipz Bundle Size Optimization - Testing Script"
echo "=========================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the frontend-scaffold directory"
    exit 1
fi

echo -e "${BLUE}📍 Working Directory: $(pwd)${NC}"
echo ""

# Step 1: Check dependencies
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules found${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found, installing...${NC}"
    npm install
fi
echo ""

# Step 2: Build the project
echo -e "${BLUE}Step 2: Building frontend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 3: Run bundle analysis
echo -e "${BLUE}Step 3: Analyzing bundle size...${NC}"
npm run analyze
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bundle analysis successful${NC}"
else
    echo -e "${RED}❌ Bundle analysis failed${NC}"
    exit 1
fi
echo ""

# Step 4: Run bundle size tests
echo -e "${BLUE}Step 4: Running bundle size tests...${NC}"
npm test -- bundle-size.test.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bundle size tests passed${NC}"
else
    echo -e "${RED}❌ Bundle size tests failed${NC}"
    exit 1
fi
echo ""

# Step 5: Check key files exist
echo -e "${BLUE}Step 5: Verifying required files...${NC}"
FILES_TO_CHECK=(
    "vite.config.ts"
    "scripts/analyze-bundle.mjs"
    "src/__tests__/bundle-size.test.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        exit 1
    fi
done
echo ""

# Step 6: Verify CI workflow
echo -e "${BLUE}Step 6: Checking CI workflow...${NC}"
CI_WORKFLOW="../.github/workflows/bundle-size.yml"
if [ -f "$CI_WORKFLOW" ]; then
    echo -e "${GREEN}✅ CI workflow found${NC}"
else
    echo -e "${RED}❌ CI workflow missing${NC}"
    exit 1
fi
echo ""

# Step 7: Check documentation
echo -e "${BLUE}Step 7: Verifying documentation...${NC}"
DOCS=(
    "../docs/BUNDLE_OPTIMIZATION.md"
    "../docs/BUNDLE_SIZE_OPTIMIZATION_SUMMARY.md"
    "../BUNDLE_SIZE_QUICK_REFERENCE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $(basename $doc) exists${NC}"
    else
        echo -e "${RED}❌ $(basename $doc) missing${NC}"
        exit 1
    fi
done
echo ""

# Summary
echo "=========================================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Build: ✅ Successful"
echo "- Bundle Analysis: ✅ Passed"
echo "- Size Tests: ✅ Passed"
echo "- Files: ✅ All present"
echo "- CI Workflow: ✅ Configured"
echo "- Documentation: ✅ Complete"
echo ""
echo -e "${GREEN}🎉 Bundle optimization implementation is ready!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the changes:"
echo "   - Check vite.config.ts for optimization config"
echo "   - Review docs/BUNDLE_OPTIMIZATION.md for details"
echo ""
echo "2. Create a pull request with these changes"
echo ""
echo "3. CI will automatically:"
echo "   - Run bundle analysis"
echo "   - Execute size tests"
echo "   - Comment on PR with results"
echo ""
echo "4. Monitor bundle size regularly with: npm run analyze"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- Quick Reference: BUNDLE_SIZE_QUICK_REFERENCE.md"
echo "- Full Guide: docs/BUNDLE_OPTIMIZATION.md"
echo "- Implementation: docs/BUNDLE_SIZE_OPTIMIZATION_SUMMARY.md"
echo ""
