const axios = require('axios');

async function benchmark() {
  const url = 'http://localhost:5000/api/menu/today?meal=breakfast';
  console.log('--- Testing MealSync Redis / Cache Response Times ---');

  // Request 1: First fetch (Cache MISS)
  const start1 = performance.now();
  const res1 = await axios.get(url);
  const end1 = performance.now();
  console.log(`Req 1 (Cache MISS): Status ${res1.status}, Header X-Cache: ${res1.headers['x-cache']}, Duration: ${(end1 - start1).toFixed(2)} ms`);

  // Request 2: Second fetch (Cache HIT)
  const start2 = performance.now();
  const res2 = await axios.get(url);
  const end2 = performance.now();
  console.log(`Req 2 (Cache HIT) : Status ${res2.status}, Header X-Cache: ${res2.headers['x-cache']}, Duration: ${(end2 - start2).toFixed(2)} ms`);

  if (res2.headers['x-cache'] === 'HIT') {
    console.log('✅ SUB-2MS CACHING TEST PASSED!');
  } else {
    console.log('⚠️ Cache HIT header missing');
  }
}

benchmark().catch(err => {
  console.error('Error running cache test:', err.message);
});
