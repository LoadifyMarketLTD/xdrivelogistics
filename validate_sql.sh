#!/bin/bash

# SQL Migration Validation Script
# Validates RUN_THIS_SQL_FIX.sql for common issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FILE="RUN_THIS_SQL_FIX.sql"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SQL MIGRATION VALIDATION SCRIPT                       ║${NC}"
echo -e "${BLUE}║     Checking: $FILE                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ ERROR: $FILE not found!${NC}"
    echo -e "${YELLOW}Make sure you're in the repository root directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ File exists${NC}"

# Check file size (should be around 457 lines)
LINE_COUNT=$(wc -l < "$FILE")
echo -e "${BLUE}📊 Line count: $LINE_COUNT${NC}"

if [ "$LINE_COUNT" -lt 400 ]; then
    echo -e "${RED}❌ WARNING: File seems too short (expected ~457 lines)${NC}"
    echo -e "${YELLOW}You might have an incomplete version!${NC}"
elif [ "$LINE_COUNT" -gt 500 ]; then
    echo -e "${YELLOW}⚠️  WARNING: File seems longer than expected${NC}"
else
    echo -e "${GREEN}✅ Line count looks good${NC}"
fi

# Check for DROP VIEW statements
DROP_VIEW_COUNT=$(grep -c "DROP VIEW IF EXISTS" "$FILE" || true)
echo -e "${BLUE}🔍 DROP VIEW statements: $DROP_VIEW_COUNT${NC}"

if [ "$DROP_VIEW_COUNT" -lt 2 ]; then
    echo -e "${RED}❌ ERROR: Missing DROP VIEW statements!${NC}"
    echo -e "${YELLOW}Views must be dropped before dropping status column.${NC}"
else
    echo -e "${GREEN}✅ DROP VIEW statements present${NC}"
fi

# Check for CREATE VIEW statements
CREATE_VIEW_COUNT=$(grep -c "CREATE OR REPLACE VIEW" "$FILE" || true)
echo -e "${BLUE}🔍 CREATE VIEW statements: $CREATE_VIEW_COUNT${NC}"

if [ "$CREATE_VIEW_COUNT" -lt 2 ]; then
    echo -e "${RED}❌ ERROR: Missing CREATE VIEW statements!${NC}"
    echo -e "${YELLOW}Views must be recreated after migration.${NC}"
else
    echo -e "${GREEN}✅ CREATE VIEW statements present${NC}"
fi

# Check for incomplete column lists
INCOMPLETE_COLUMNS=$(grep -F "... rest of columns" "$FILE" 2>/dev/null | wc -l || echo "0")
INCOMPLETE_COLUMNS=$(echo "$INCOMPLETE_COLUMNS" | tr -d '\n' | tr -d ' ')
echo -e "${BLUE}🔍 Incomplete column lists: $INCOMPLETE_COLUMNS${NC}"

if [ "$INCOMPLETE_COLUMNS" -gt 0 ]; then
    echo -e "${RED}❌ ERROR: Found '-- ... rest of columns' comment!${NC}"
    echo -e "${YELLOW}This causes syntax errors. Use the complete file from repository.${NC}"
    echo -e "${YELLOW}Lines with this issue:${NC}"
    grep -n "\-\- \.\.\. rest of columns" "$FILE" 2>/dev/null || true
else
    echo -e "${GREEN}✅ No incomplete column lists${NC}"
fi

# Check for trailing commas before FROM
echo -e "${BLUE}🔍 Checking for trailing commas...${NC}"
TRAILING_COMMA_ISSUES=$(grep -B1 "^FROM public\." "$FILE" | grep ",$" | wc -l || true)

if [ "$TRAILING_COMMA_ISSUES" -gt 0 ]; then
    echo -e "${RED}❌ WARNING: Possible trailing comma before FROM${NC}"
    echo -e "${YELLOW}Check lines before 'FROM public.' statements${NC}"
else
    echo -e "${GREEN}✅ No obvious trailing comma issues${NC}"
fi

# Check for proper BEGIN/COMMIT
BEGIN_COUNT=$(grep -c "^BEGIN;" "$FILE" || true)
COMMIT_COUNT=$(grep -c "^COMMIT;" "$FILE" || true)
echo -e "${BLUE}🔍 Transactions: BEGIN=$BEGIN_COUNT, COMMIT=$COMMIT_COUNT${NC}"

if [ "$BEGIN_COUNT" -ne "$COMMIT_COUNT" ]; then
    echo -e "${RED}❌ ERROR: Unbalanced BEGIN/COMMIT!${NC}"
    echo -e "${YELLOW}Every BEGIN should have a matching COMMIT.${NC}"
elif [ "$BEGIN_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: No transaction blocks found${NC}"
else
    echo -e "${GREEN}✅ Transaction blocks balanced${NC}"
fi

# Check for DO $$ blocks
DO_BLOCK_START=$(grep "^DO \$\$" "$FILE" 2>/dev/null | wc -l || echo "0")
DO_BLOCK_START=$(echo "$DO_BLOCK_START" | tr -d '\n' | tr -d ' ')
DO_BLOCK_END=$(grep "^END \$\$;" "$FILE" 2>/dev/null | wc -l || echo "0")
DO_BLOCK_END=$(echo "$DO_BLOCK_END" | tr -d '\n' | tr -d ' ')
echo -e "${BLUE}🔍 DO blocks: START=$DO_BLOCK_START, END=$DO_BLOCK_END${NC}"

if [ "$DO_BLOCK_START" -ne "$DO_BLOCK_END" ]; then
    echo -e "${YELLOW}⚠️  Note: DO block count mismatch (might be nested blocks)${NC}"
    echo -e "${YELLOW}This is usually OK if blocks are properly nested.${NC}"
else
    echo -e "${GREEN}✅ DO blocks balanced${NC}"
fi

# Check for essential columns in vehicle view
echo -e "${BLUE}🔍 Checking vehicles_with_tracking view...${NC}"
if grep -A 50 "CREATE OR REPLACE VIEW public.vehicles_with_tracking" "$FILE" | grep -q "v.vehicle_type"; then
    echo -e "${GREEN}✅ vehicle_type column present${NC}"
else
    echo -e "${RED}❌ ERROR: vehicle_type column missing in view!${NC}"
fi

if grep -A 50 "CREATE OR REPLACE VIEW public.vehicles_with_tracking" "$FILE" | grep -q "v.is_available"; then
    echo -e "${GREEN}✅ is_available column present (replaces status)${NC}"
else
    echo -e "${RED}❌ ERROR: is_available column missing in view!${NC}"
fi

if grep -A 50 "CREATE OR REPLACE VIEW public.vehicles_with_tracking" "$FILE" | grep -q "v.vehicle_size"; then
    echo -e "${GREEN}✅ vehicle_size column present${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: vehicle_size column not found in view${NC}"
fi

# Check that DROP VIEW comes before DROP COLUMN status
echo -e "${BLUE}🔍 Checking operation order...${NC}"
DROP_VIEW_LINE=$(grep -n "DROP VIEW IF EXISTS public.vehicles_with_tracking" "$FILE" | cut -d: -f1 || echo "0")
DROP_STATUS_LINE=$(grep -n "DROP COLUMN status" "$FILE" | grep "vehicles" | head -1 | cut -d: -f1 || echo "999999")

if [ "$DROP_VIEW_LINE" -lt "$DROP_STATUS_LINE" ]; then
    echo -e "${GREEN}✅ Views are dropped before status column${NC}"
else
    echo -e "${RED}❌ ERROR: Status column drop happens before view drop!${NC}"
    echo -e "${YELLOW}This will cause 'cannot drop column' error.${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    VALIDATION SUMMARY                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

if [ "$LINE_COUNT" -lt 400 ]; then ((ERRORS++)); fi
if [ "$DROP_VIEW_COUNT" -lt 2 ]; then ((ERRORS++)); fi
if [ "$CREATE_VIEW_COUNT" -lt 2 ]; then ((ERRORS++)); fi
if [ "${INCOMPLETE_COLUMNS:-0}" -gt 0 ]; then ((ERRORS++)); fi
if [ "$BEGIN_COUNT" -ne "$COMMIT_COUNT" ]; then ((ERRORS++)); fi
if [ "$DROP_VIEW_LINE" -ge "$DROP_STATUS_LINE" ]; then ((ERRORS++)); fi

if [ "$LINE_COUNT" -gt 500 ]; then ((WARNINGS++)); fi
if [ "$TRAILING_COMMA_ISSUES" -gt 0 ]; then ((WARNINGS++)); fi
if [ "$BEGIN_COUNT" -eq 0 ]; then ((WARNINGS++)); fi
if [ "${DO_BLOCK_START:-0}" -ne "${DO_BLOCK_END:-0}" ]; then ((WARNINGS++)); fi

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED: File looks good! Ready to run.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Make a backup of your database"
    echo "2. Open Supabase SQL Editor"
    echo "3. Copy entire content of $FILE"
    echo "4. Run it"
    echo ""
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS warning(s) found${NC}"
    echo -e "${YELLOW}File should work but double-check warnings above.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ FAILED: $ERRORS error(s) found${NC}"
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Also found $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    echo "1. Get the latest version from Git:"
    echo "   git pull origin copilot/fix-full-name-column-error"
    echo ""
    echo "2. Or download fresh from repository:"
    echo "   https://github.com/LoadifyMarketLTD/xdrivelogistics"
    echo ""
    echo "3. DO NOT copy from documentation snippets"
    echo "   Use the complete file only!"
    echo ""
    exit 1
fi
