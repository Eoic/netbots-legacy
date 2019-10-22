import sendGridMail from "@sendgrid/mail";
sendGridMail.setApiKey(process.env.MAILER_API_KEY || "");
const buttonStyleString = `    padding: 10px;
background-color: #4ece4e;
border-radius: 3px;
text-decoration: none;
font-size: 17px;
color: #ffffff;
display: block;
max-width: 126px;`;

// Send new email
function sendMail(message: any) {
    sendGridMail.send(message);
}

// Returns email body for password reset email
function getPasswordResetEmail(email: any, passwordResetLink: any) {
    const passwordResetEmail = {
        from: "karolis.strazdas00@gmail.com",
        html: `We received a request restore your password for your Netbots account: ${email}.
        If you didn't ask to change your password, please ignore this email
        <a href='${passwordResetLink}' style='${buttonStyleString}'> Reset password </a>`,
        subject: "Password reset",
        to: email,
    };

    console.log(passwordResetLink);
    console.log(passwordResetEmail);

    return passwordResetEmail;
}

export {
    getPasswordResetEmail,
    sendMail,
};
