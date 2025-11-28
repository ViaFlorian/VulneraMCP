#!/usr/bin/env node

/**
 * Quick script to verify your Caido token
 * Usage: node verify-caido-token.js <your-token>
 */

const axios = require('axios');
const token = process.argv[2];

if (!token) {
  console.error('Usage: node verify-caido-token.js <your-caido-token>');
  process.exit(1);
}

async function testToken() {
  console.log('Testing Caido Cloud API token...\n');
  
  // Test cloud API
  try {
    const response = await axios.post(
      'https://api.caido.io/graphql',
      {
        query: `
          query {
            requests(first: 1) {
              count {
                value
              }
            }
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    
    if (response.data.errors) {
      console.error('❌ Token validation failed:');
      response.data.errors.forEach(err => {
        console.error(`   - ${err.message}`);
        if (err.extensions?.CAIDO?.code === 'AUTHORIZATION') {
          console.error('\n💡 This token is invalid or expired.');
          console.error('   Get a new token from: https://app.caido.io → Settings → API');
        }
      });
      process.exit(1);
    }
    
    console.log('✅ Token is valid!');
    console.log(`   Total requests in Caido: ${response.data.data?.requests?.count?.value || 0}`);
    console.log('\n✅ Your token works with Caido Cloud API');
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.status === 404) {
        console.error('   The endpoint might be wrong. Trying alternative...');
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.error('   Token is invalid or expired.');
        console.error('   Get a new token from: https://app.caido.io → Settings → API');
      }
    } else {
      console.error(`❌ Network error: ${error.message}`);
    }
    process.exit(1);
  }
}

testToken();

