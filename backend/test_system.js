const axios = require('axios');

async function test() {
  const query = "Find B2B SaaS companies in New York with more than 50 employees";
  const sessionId = "test-session-" + Date.now();

  console.log(`\n--- Test 1: Initial Run ---`);
  console.log(`Query: ${query}`);
  
  try {
    const response = await axios.post('http://localhost:5000/api/query', {
      query: query,
      sessionId: sessionId
    });
    console.log(`Response:`, response.data);
    
    // Wait for the pipeline to finish (simulated)
    // In a real test we would listen to SSE, but here we can just wait or check memory
    console.log(`Waiting for pipeline...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log(`\n--- Test 2: Cache Check (Same Query) ---`);
    const response2 = await axios.post('http://localhost:5000/api/query', {
      query: query,
      sessionId: sessionId + "_retry"
    });
    console.log(`Response 2:`, response2.data);
    
  } catch (err) {
    console.error(`Error:`, err.message);
  }
}

test();
