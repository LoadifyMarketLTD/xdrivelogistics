#!/bin/bash

# Netlify Environment Variables Verification Script
# This script helps verify that all required environment variables are set

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║       Netlify Environment Variables - Verification Checklist              ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ Found .env.local file"
    source .env.local
else
    echo "⚠️  No .env.local file found (OK for production, create one for local dev)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking Required Environment Variables:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to check if a variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name${NC} - NOT SET"
        return 1
    else
        # Show first 50 characters of the value
        local display_value=$(echo "$var_value" | cut -c1-50)
        if [ ${#var_value} -gt 50 ]; then
            display_value="${display_value}..."
        fi
        echo -e "${GREEN}✅ $var_name${NC} - ${display_value}"
        return 0
    fi
}

# Check all 5 required variables
total=5
passed=0

echo "1. Next.js Portal Variables:"
check_var "NEXT_PUBLIC_SUPABASE_URL" && ((passed++))
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" && ((passed++))
check_var "NEXT_PUBLIC_SITE_URL" && ((passed++))

echo ""
echo "2. Vite Landing Page Variables:"
check_var "VITE_SUPABASE_URL" && ((passed++))
check_var "VITE_SUPABASE_ANON_KEY" && ((passed++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ All $total environment variables are set correctly!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Ensure these same values are set in Netlify"
    echo "   2. Go to: Netlify Dashboard → Site Settings → Environment Variables"
    echo "   3. Verify all 5 variables are present"
    echo "   4. Trigger 'Clear cache and deploy'"
    echo ""
else
    echo -e "${RED}❌ $passed out of $total variables are set${NC}"
    echo -e "${YELLOW}⚠️  Please set the missing variables${NC}"
    echo ""
    echo "📖 See these guides:"
    echo "   - VALORILE_PENTRU_NETLIFY.md (Romanian)"
    echo "   - ENVIRONMENT_VARIABLES.md (English)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify URLs are correct
echo "🔍 Additional Checks:"
echo ""

if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    expected_url="https://jqxlauexhkonixtjvljw.supabase.co"
    if [ "$NEXT_PUBLIC_SUPABASE_URL" = "$expected_url" ]; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL matches expected value${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL doesn't match expected value${NC}"
        echo "   Expected: $expected_url"
        echo "   Got: $NEXT_PUBLIC_SUPABASE_URL"
    fi
fi

if [ ! -z "$VITE_SUPABASE_URL" ]; then
    expected_url="https://jqxlauexhkonixtjvljw.supabase.co"
    if [ "$VITE_SUPABASE_URL" = "$expected_url" ]; then
        echo -e "${GREEN}✅ VITE_SUPABASE_URL matches expected value${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_SUPABASE_URL doesn't match expected value${NC}"
        echo "   Expected: $expected_url"
        echo "   Got: $VITE_SUPABASE_URL"
    fi
fi

if [ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ ! -z "$VITE_SUPABASE_ANON_KEY" ]; then
    if [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "$VITE_SUPABASE_ANON_KEY" ]; then
        echo -e "${GREEN}✅ Both ANON_KEY variables have the same value (correct!)${NC}"
    else
        echo -e "${RED}❌ ANON_KEY variables have different values (should be the same!)${NC}"
    fi
fi

echo ""
echo "╚════════════════════════════════════════════════════════════════════════════╝"
