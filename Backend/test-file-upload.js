const fs = require('fs');
const path = require('path');

// Create a simple test file
const testContent = 'This is a test file for upload testing.';
const testFilePath = path.join(__dirname, 'test-upload.txt');

fs.writeFileSync(testFilePath, testContent);
console.log('✅ Test file created:', testFilePath);

// Test the upload endpoint
const FormData = require('form-data');
const axios = require('axios');

async function testFileUpload() {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', 'Test Upload File');

    console.log('📁 Testing file upload...');
    
    const response = await axios.post('http://localhost:3000/api/notes/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Upload successful!');
    console.log('📄 Response:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

testFileUpload();
