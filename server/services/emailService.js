const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'd24dce147@charusat.edu.in',
    pass: process.env.EMAIL_PASSWORD || 'fkpu tgiz ybjy mkko'
  }
});

// Test email configuration on startup
const testEmailConfig = async () => {
  try {
    await transporter.verify();
  } catch (error) {
    // Email service not configured properly
  }
};

// Test on startup
testEmailConfig();

// Function to send welcome email to new SC
const sendWelcomeEmail = async (scEmail, scName, poName, poEmail, department, defaultPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'd24dce147@charusat.edu.in', // Use configured email as sender
      to: scEmail,
      subject: 'Welcome to NSS Connect - Student Coordinator Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">NSS Connect</h1>
            <p style="margin: 10px 0 0 0;">National Service Scheme</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome to NSS Connect!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${scName}</strong>,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Your Student Coordinator account has been successfully created by <strong>${poName}</strong> 
              for the <strong>${department}</strong> department.
            </p>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Your Login Credentials:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${scEmail}</p>
              <p style="margin: 5px 0;"><strong>Default Password:</strong> ${defaultPassword}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              <strong>Important:</strong> Please change your password after your first login for security purposes.
            </p>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">🔐 Security Notice:</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                For your account security, please change your password immediately after logging in for the first time.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You can now access the NSS Connect dashboard to manage volunteers, events, and working hours for your department.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/login" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              If you have any questions, please contact your Program Officer: ${poEmail}
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to send notification email to PO when SC is added
const sendNotificationToPO = async (poEmail, poName, scName, scEmail, department) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: poEmail,
      subject: 'NSS Connect - New Student Coordinator Added',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">NSS Connect</h1>
            <p style="margin: 10px 0 0 0;">National Service Scheme</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #059669; margin-bottom: 20px;">Student Coordinator Added Successfully</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${poName}</strong>,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              A new Student Coordinator has been successfully added to your department.
            </p>
            
            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
              <h3 style="color: #059669; margin: 0 0 10px 0;">New Student Coordinator Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${scName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${scEmail}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${department}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              The Student Coordinator has been sent a welcome email with their login credentials.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard" 
                 style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              This is an automated notification from NSS Connect system.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendNotificationToPO
}; 