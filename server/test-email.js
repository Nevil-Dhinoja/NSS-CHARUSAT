const nodemailer = require('nodemailer');

// Test email configuration
const testEmail = async () => {
  console.log('Testing email configuration...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'd24dce147@charusat.edu.in',
      pass: process.env.EMAIL_PASSWORD || 'N29554677'
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection verified successfully');
    
    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'd24dce147@charusat.edu.in',
      to: 'd24dce147@charusat.edu.in', // Send to yourself for testing
      subject: 'NSS Connect - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">NSS Connect Email Test</h1>
          <p>This is a test email to verify the email configuration is working properly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Possible solutions:');
      console.log('1. Check if EMAIL_USER and EMAIL_PASSWORD are set correctly');
      console.log('2. Make sure you\'re using an App Password (not regular password)');
      console.log('3. Enable 2-factor authentication on your Gmail account');
      console.log('4. Generate an App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection Error - Check your internet connection');
    } else {
      console.log('\n🔧 Other error - Check the error details above');
    }
  }
};

testEmail(); 