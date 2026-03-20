require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('📧 Email Configuration Test');
    console.log('============================');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
    console.log('');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('🔌 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        console.log('📤 Sending test email to gusainaman813@gmail.com...');
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'gusainaman813@gmail.com',
            subject: 'Test Email - Grocery App Password Reset',
            text: 'This is a test email from your Grocery app. If you received this, email delivery is working correctly!',
            html: '<h2>Test Email - Grocery App</h2><p>This is a test email from your Grocery app.</p><p>If you received this, email delivery is working correctly!</p>',
        });

        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Accepted:', result.accepted);
        console.log('   Rejected:', result.rejected);
        console.log('\n📬 Check your inbox at gusainaman813@gmail.com (also check spam folder)');
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.error('\nFull error:', error);
    }
}

testEmail();
