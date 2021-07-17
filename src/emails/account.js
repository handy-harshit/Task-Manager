const sgMail = require('@sendgrid/mail');
const fromEmail = process.env.FROM_EMAIL;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: `Goodbye ${name}!`,
        text: `Is there anything we could have done, to have keept you on board?`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}