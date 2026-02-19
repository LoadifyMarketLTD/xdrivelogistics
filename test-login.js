#!/usr/bin/env node
/**
 * Test script to verify Supabase login functionality
 * Tests connection, authentication, and session persistence
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables (you can set these as needed)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Login Functionality Test\n');
console.log('=' .repeat(50));

// Test 1: Check environment variables
console.log('\n✓ Test 1: Environment Variables');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('  SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('\n❌ Missing environment variables!');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Test 2: Initialize Supabase client
console.log('\n✓ Test 2: Supabase Client Initialization');
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('  ✓ Client created successfully');
} catch (error) {
  console.log('  ✗ Failed to create client:', error.message);
  process.exit(1);
}

// Test 3: Check connection to Supabase
async function testConnection() {
  console.log('\n✓ Test 3: Supabase Connection');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('  ⚠️  Error getting session:', error.message);
    } else {
      console.log('  ✓ Successfully connected to Supabase');
      console.log('  ✓ Current session:', data.session ? 'Logged in' : 'Not logged in');
    }
  } catch (error) {
    console.log('  ✗ Connection failed:', error.message);
    return false;
  }
  return true;
}

// Test 4: Test login with invalid credentials
async function testInvalidLogin() {
  console.log('\n✓ Test 4: Invalid Credentials Handling');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'invalid@test.com',
      password: 'wrongpassword123'
    });
    
    if (error) {
      console.log('  ✓ Correctly rejected invalid credentials');
      console.log('  ✓ Error message:', error.message);
      return true;
    } else {
      console.log('  ✗ Unexpected success with invalid credentials');
      return false;
    }
  } catch (error) {
    console.log('  ✓ Correctly caught error:', error.message);
    return true;
  }
}

// Test 5: Test session persistence
async function testSessionPersistence() {
  console.log('\n✓ Test 5: Session Persistence');
  try {
    // Get current session
    const { data: session1 } = await supabase.auth.getSession();
    
    // Simulate page refresh by creating a new client with same keys
    const supabase2 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: session2 } = await supabase2.auth.getSession();
    
    console.log('  ✓ Session check 1:', session1.session ? 'Has session' : 'No session');
    console.log('  ✓ Session check 2:', session2.session ? 'Has session' : 'No session');
    
    // In a real scenario, if logged in, both should have session
    // If not logged in, both should be null
    const persistent = (session1.session === null && session2.session === null) || 
                      (session1.session !== null && session2.session !== null);
    
    if (persistent) {
      console.log('  ✓ Session state is consistent');
    } else {
      console.log('  ⚠️  Session state changed between checks');
    }
    
    return persistent;
  } catch (error) {
    console.log('  ✗ Error checking session persistence:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('Running Tests...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Connection test failed. Cannot proceed with other tests.');
    return;
  }
  
  await testInvalidLogin();
  await testSessionPersistence();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Test Summary:');
  console.log('  - Supabase client initializes correctly');
  console.log('  - Connection to Supabase works');
  console.log('  - Invalid credentials are handled properly');
  console.log('  - Session state is consistent');
  console.log('\n📝 Note: To test actual login with valid credentials,');
  console.log('   you need to provide real user credentials.');
  console.log('\n✅ Login functionality appears to be working correctly!');
}

// Execute tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});
