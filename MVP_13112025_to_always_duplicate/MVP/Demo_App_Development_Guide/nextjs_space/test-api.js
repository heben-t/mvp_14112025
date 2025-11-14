const fetch = require('node-fetch');

async function testAPI() {
  const startupProfileId = 'eb4b7820-691b-43fc-b159-6ebf05a6346c';
  const url = `http://localhost:3000/api/metrics/${startupProfileId}`;
  
  console.log(`Testing API: ${url}\n`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.Consolidated_AI_Impact !== null) {
      console.log(`\n✅ Consolidated_AI_Impact: ${data.Consolidated_AI_Impact}`);
      console.log(`   Formatted: ${data.Consolidated_AI_Impact.toFixed(2)}%`);
    } else {
      console.log('\n❌ Consolidated_AI_Impact is null');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
  }
}

testAPI();
