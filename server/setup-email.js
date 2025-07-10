const fs = require('fs');
const path = require('path');

console.log('🔧 NSS Connect Email Setup');
console.log('==========================\n');

console.log('📧 To configure email functionality, follow these steps:\n');

console.log('1. Enable 2-Factor Authentication on your Gmail account:');
console.log('   https://myaccount.google.com/security\n');

console.log('2. Generate an App Password:');
console.log('   https://myaccount.google.com/apppasswords');
console.log('   - Select "Mail"');
console.log('   - Select your device or "Other"');
console.log('   - Copy the 16-character password\n');

console.log('3. Create a .env file in the server directory with:');
console.log('   EMAIL_USER=your-email@gmail.com');
console.log('   EMAIL_PASSWORD=your-16-character-app-password\n');

console.log('4. Or set environment variables when running the server:');
console.log('   EMAIL_USER=your-email@gmail.com EMAIL_PASSWORD=your-app-password node server.js\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('EMAIL_USER') && envContent.includes('EMAIL_PASSWORD')) {
    console.log('✅ Email environment variables are configured');
  } else {
    console.log('⚠️  .env file exists but email variables may be missing');
  }
} else {
  console.log('❌ .env file not found');
  console.log('💡 Create a .env file in the server directory with your email credentials');
}

console.log('\n📝 Example .env file content:');
console.log('EMAIL_USER=d24dce147@charusat.edu.in');
console.log('EMAIL_PASSWORD=abcd efgh ijkl mnop');
console.log('FRONTEND_URL=http://localhost:3000'); 