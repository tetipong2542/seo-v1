const https = require('https');

// Test OpenRouter API
async function testOpenRouterAPI() {
  console.log('🔧 Testing OpenRouter API...\n');
  
  // API Key from Settings (demo key)
  const apiKey = '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';
  const model = 'deepseek/deepseek-r1-0528-qwen3-8b';
  
  console.log('📋 Test Details:');
  console.log(`- API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`- Model: ${model}`);
  console.log(`- Endpoint: https://openrouter.ai/api/v1/chat/completions\n`);
  
  const requestBody = JSON.stringify({
    model: model,
    messages: [
      {
        role: 'user',
        content: 'ทดสอบการเชื่อมต่อ กรุณาตอบกลับว่า "การเชื่อมต่อสำเร็จ"'
      }
    ],
    max_tokens: 50,
    temperature: 0.1
  });

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'SEO Content Generator Test'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📊 Response Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📄 Response Body:');
        console.log(data);
        
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('\n✅ Test PASSED!');
            console.log(`🤖 AI Response: ${jsonData.choices?.[0]?.message?.content || 'No content'}`);
            resolve(jsonData);
          } else {
            console.log('\n❌ Test FAILED!');
            console.log(`Error: ${jsonData.error?.message || 'Unknown error'}`);
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.error?.message || data}`));
          }
        } catch (parseError) {
          console.log('\n❌ Test FAILED! Invalid JSON response');
          console.log('Parse Error:', parseError.message);
          reject(new Error(`Parse error: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('\n❌ Request FAILED!');
      console.log('Error:', error.message);
      reject(error);
    });
    
    console.log('📤 Sending request...\n');
    req.write(requestBody);
    req.end();
  });
}

// Test different API keys to debug the issue
async function testMultipleKeys() {
  console.log('🧪 Testing Multiple API Key Formats...\n');
  
  const testKeys = [
    // Original key from settings
    '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',
    // Test with different format (if needed)
    'sk-or-v1-test',
    // Empty key test
    ''
  ];
  
  for (let i = 0; i < testKeys.length; i++) {
    const key = testKeys[i];
    console.log(`\n📝 Test ${i + 1}: Testing key "${key.substring(0, 20)}${key.length > 20 ? '...' : ''}"`);
    
    if (!key) {
      console.log('❌ Empty key - skipping');
      continue;
    }
    
    try {
      await testSingleKey(key);
    } catch (error) {
      console.log(`❌ Test ${i + 1} failed:`, error.message);
    }
  }
}

async function testSingleKey(apiKey) {
  const model = 'deepseek/deepseek-r1-0528-qwen3-8b';
  
  const requestBody = JSON.stringify({
    model: model,
    messages: [{ role: 'user', content: 'Hello test' }],
    max_tokens: 10
  });

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'SEO Content Generator Test'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Key works!');
          resolve(data);
        } else {
          console.log(`❌ Key failed - Status: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Run tests
console.log('🚀 Starting OpenRouter API Tests...\n');

testOpenRouterAPI()
  .then(() => {
    console.log('\n🎉 Main test completed successfully!');
  })
  .catch((error) => {
    console.log('\n💥 Main test failed, running additional diagnostics...');
    return testMultipleKeys();
  })
  .finally(() => {
    console.log('\n🏁 All tests completed.');
  }); 