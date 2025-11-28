#!/usr/bin/env node

/**
 * Introspect Caido's GraphQL schema to find the correct query structure
 * 
 * Usage:
 *   node scripts/introspect-caido-schema.js
 * 
 * Or with auth token:
 *   CAIDO_API_TOKEN=your_token node scripts/introspect-caido-schema.js
 */

const axios = require('axios');

const CAIDO_URL = process.env.CAIDO_MCP_SERVER || 'http://localhost:8080';
const API_TOKEN = process.env.CAIDO_API_TOKEN;

async function introspectSchema() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  console.log('🔍 Introspecting Caido GraphQL schema...\n');
  console.log(`URL: ${CAIDO_URL}/graphql`);
  console.log(`Auth: ${API_TOKEN ? 'Yes (token provided)' : 'No (public access)'}\n`);

  // Get all query types
  const queryTypes = {
    query: `
      {
        __schema {
          queryType {
            name
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `,
  };

  try {
    const response = await axios.post(`${CAIDO_URL}/graphql`, queryTypes, { headers });
    
    if (response.data.errors) {
      console.error('❌ GraphQL Errors:');
      console.error(JSON.stringify(response.data.errors, null, 2));
      return;
    }

    if (response.data.data && response.data.data.__schema) {
      const fields = response.data.data.__schema.queryType.fields;
      console.log('✅ Available Query Fields:\n');
      
      fields.forEach(field => {
        console.log(`📋 ${field.name}`);
        if (field.description) {
          console.log(`   ${field.description}`);
        }
        if (field.args && field.args.length > 0) {
          console.log(`   Arguments:`);
          field.args.forEach(arg => {
            console.log(`     - ${arg.name}: ${arg.type.name || arg.type.kind}`);
          });
        }
        console.log(`   Returns: ${field.type.name || field.type.kind || 'Unknown'}\n`);
      });

      // Look for request-related fields
      const requestFields = fields.filter(f => 
        f.name.toLowerCase().includes('request') || 
        f.name.toLowerCase().includes('traffic') ||
        f.name.toLowerCase().includes('http')
      );

      if (requestFields.length > 0) {
        console.log('\n🎯 Request/Traffic Related Fields:\n');
        requestFields.forEach(field => {
          console.log(`   ${field.name}`);
        });
      }
    } else {
      console.log('⚠️  Unexpected response structure:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error introspecting schema:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Get all types
async function getAllTypes() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const query = {
    query: `
      {
        __schema {
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    `,
  };

  try {
    const response = await axios.post(`${CAIDO_URL}/graphql`, query, { headers });
    
    if (response.data.data && response.data.data.__schema) {
      const types = response.data.data.__schema.types;
      const requestTypes = types.filter(t => 
        t.name && (
          t.name.toLowerCase().includes('request') ||
          t.name.toLowerCase().includes('traffic') ||
          t.name.toLowerCase().includes('http')
        )
      );

      if (requestTypes.length > 0) {
        console.log('\n📦 Request/Traffic Related Types:\n');
        requestTypes.forEach(type => {
          console.log(`   ${type.name} (${type.kind})`);
          if (type.fields) {
            type.fields.forEach(field => {
              console.log(`     - ${field.name}: ${field.type.name || field.type.kind}`);
            });
          }
        });
      }
    }
  } catch (error) {
    // Silent fail for this query
  }
}

async function main() {
  await introspectSchema();
  await getAllTypes();
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check Caido Settings → API for authentication token');
  console.log('2. Use the field names above to construct queries');
  console.log('3. Test queries in Caido\'s GraphQL playground (if available)');
  console.log('4. Update integration code with correct query structure\n');
}

main().catch(console.error);








