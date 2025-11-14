#!/usr/bin/env node

/**
 * Test script to verify the ROI metrics API endpoint
 * 
 * Usage: node test-metrics-api.js [startupProfileId]
 */

const startupProfileId = process.argv[2] || 'test-id';
const apiUrl = `http://localhost:3000/api/metrics/${startupProfileId}`;

console.log('Testing Metrics API...');
console.log(`URL: ${apiUrl}\n`);

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n❌ API returned an error');
    } else {
      console.log('\n✅ Success! Metrics retrieved:');
      console.log(`   - Consolidated_AI_Impact: ${data.Consolidated_AI_Impact ?? 'null'}`);
      console.log(`   - AI_Impact_Startup_i: ${data.AI_Impact_Startup_i ?? 'null'}`);
      console.log(`   - MRR_now: ${data.MRR_now ?? 'null'}`);
      console.log(`   - Active Customers: ${data.active_customers ?? 'null'}`);
      console.log(`   - Churn Rate: ${data.churn_rate ?? 'null'}`);
    }
  })
  .catch(error => {
    console.error('❌ Error fetching metrics:', error.message);
    console.error('\nMake sure the Next.js dev server is running:');
    console.error('  npm run dev');
  });
