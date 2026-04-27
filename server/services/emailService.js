const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: Resend free tier (sandbox mode) only allows sending emails from 'onboarding@resend.dev' 
// AND you can ONLY send emails to your own verified email address (the one you used to sign up).
// To send to other candidates, you must add and verify a custom domain in your Resend dashboard.
const FROM_EMAIL = 'onboarding@resend.dev'; // Default testing email from Resend

/**
 * Send an interview invitation email
 */
const sendInterviewEmail = async ({ candidateName, candidateEmail, jobTitle, company = 'Our Hiring Team' }) => {
    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: candidateEmail,
            subject: `Interview Invitation: ${jobTitle} at ${company}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #2563eb;">Interview Invitation</h2>
                    <p>Dear ${candidateName},</p>
                    <p>Thank you for applying for the <strong>${jobTitle}</strong> position at ${company}.</p>
                    <p>We were impressed by your background and would like to invite you to an interview to discuss your qualifications further.</p>
                    <p>Our team will be in touch shortly with scheduling details.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p><strong>${company}</strong></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="font-size: 12px; color: #999;">This email was sent via ResumeAI ATS.</p>
                </div>
            `,
        });
        console.log(`✅ Interview email sent to ${candidateEmail}`, data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Failed to send interview email:', error);
        return { success: false, error };
    }
};

/**
 * Send a polite rejection email
 */
const sendRejectionEmail = async ({ candidateName, candidateEmail, jobTitle, company = 'Our Hiring Team' }) => {
    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: candidateEmail,
            subject: `Update on your application for ${jobTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #475569;">Application Update</h2>
                    <p>Dear ${candidateName},</p>
                    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at ${company}.</p>
                    <p>While we were impressed by your background, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this specific role.</p>
                    <p>We appreciate your interest in joining our team and wish you the best in your job search.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p><strong>${company}</strong></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
                    <p style="font-size: 12px; color: #999;">This email was sent via ResumeAI ATS.</p>
                </div>
            `,
        });
        console.log(`✅ Rejection email sent to ${candidateEmail}`, data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Failed to send rejection email:', error);
        return { success: false, error };
    }
};

module.exports = {
    sendInterviewEmail,
    sendRejectionEmail,
};
