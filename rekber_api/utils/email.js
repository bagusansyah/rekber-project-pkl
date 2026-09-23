const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) { 
const transporter = nodemailer.createTransport({
  host: 'mail.rekber.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@rekber.com',
    pass: 'rekber123',
  },
});
    const html_layout = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body {
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              table { width: 100%; border-collapse: collapse; }
              td { padding: 0; }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header { background-color: #007bff; padding: 20px; text-align: center; }
              .header img { max-width: 200px; height: auto; display: block; margin: 0 auto; }
              .header h1 { color: #ffffff; margin: 10px 0 0; font-size: 24px; }
              .content { padding: 30px; }
              .content p { margin-bottom: 15px; }
              .button-container { text-align: center; margin: 25px 0; }
              .button {
                  background-color: #0d47a1;
                  color: #ffffff !important;
                  padding: 12px 25px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;
              }
              .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666666; }
              .footer a { color: #007bff; text-decoration: none; }
              .social-icons img { width: 24px; height: 24px; margin: 0 5px; }
          </style>
      </head>
      <body>
          <table role="presentation" class="container">
              <tr>
                  <td>
                      <table role="presentation" class="header">
                          <tr>
                                <td style="
                                    height: 70px !important;
                                    background-color: white !important;
                                ">
                                  <img src="https://www.rekber.com/images/logo.png" alt="Rekber.com Logo">
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td class="content" style="background-color: azure !important;">
                      ${html}
                  </td>
              </tr>
              <tr>
                  <td>
                      <table role="presentation" class="footer">
                          <tr>
                              <td>
                                  <p>&copy; ${new Date().getFullYear()}. PT Rekber Transaksi Aman. Semua Hak Dilindungi.</p>
                                  <p>
                                      <a href="www.rekber.com" target="_blank">Kunjungi Website</a> | 
                                      <a href="https://www.rekber.com/hubungi-kami">Hubungi Kami</a>
                                  </p>
                                  <div class="social-icons" style="margin-top: 10px;">
                                      <a href="" target="_blank">Facebook</a> 
                                      <a href="https://www.instagram.com/rekbercom" target="_blank">Instagram</a>
                                  </div>
                                  <p style="margin-top: 15px;">
                                      Anda menerima email ini karena Anda adalah pengguna rekber.com
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
   
    const mailOptions = {
      from: '"Rekber.com" <noreply@rekber.com>',
      to,
      subject,
      html: html_layout,
    };

    await transporter.sendMail(mailOptions); 
}

module.exports = { sendEmail };