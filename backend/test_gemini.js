require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API key with gemini-2.5-flash...');

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('Sending test prompt: "Hello, say test successful!"');
    const result = await model.generateContent('Hello, say test successful!');
    console.log('Gemini API Response Success:');
    console.log(result.response.text());
  } catch (error) {
    console.error('Gemini API Test Failed with Error:');
    console.error(error.message);
  }
}

test();
