// File này soạn nội dung email chứa mã 6 số.
// Email dùng bảng và kiểu chữ viết thẳng trong thẻ, vì các ứng dụng đọc mail
// không hỗ trợ đầy đủ CSS hiện đại.
// Luôn kèm bản chữ thuần bên cạnh bản HTML cho ứng dụng nào không hiện được HTML.
const EMAIL_CONTENT = {
  en: {
    codeLabel: "YOUR VERIFICATION CODE",
    expires: "This code expires in <strong style=\"color:#163C3A;\">10 minutes</strong>.",
    privacy: "<strong style=\"color:#163C3A;\">Keep this code private.</strong> MealMate will never ask you to share it by phone, message, or email.",
    tagline: "Eat well, feel better.",
    textCode: "Your verification code is",
    textNote: "This code expires in 10 minutes. Keep it private. MealMate will never ask you to share it.",
    registration: {
      documentTitle: "Verify your MealMate email",
      preheader: "Your 6-digit MealMate email verification code expires in 10 minutes.",
      badge: "EMAIL VERIFICATION",
      heading: "Verify your email address",
      introduction: "Enter the code below in MealMate to confirm this email and finish creating your account.",
      footer: "Didn't try to create a MealMate account? You can safely ignore this email.",
      subject: "MealMate - Verify your email",
      textHeading: "MealMate email verification",
    },
    password_reset: {
      documentTitle: "Reset your MealMate password",
      preheader: "Your 6-digit MealMate password reset code expires in 10 minutes.",
      badge: "PASSWORD RESET",
      heading: "Here is your verification code",
      introduction: "We received a request to reset your MealMate password. Enter the code below in the app to continue.",
      footer: "Didn't request a password reset? You can safely ignore this email.",
      subject: "MealMate - Reset your password",
      textHeading: "MealMate password reset",
    },
  },
  vi: {
    codeLabel: "MÃ XÁC MINH CỦA BẠN",
    expires: "Mã này hết hạn sau <strong style=\"color:#163C3A;\">10 phút</strong>.",
    privacy: "<strong style=\"color:#163C3A;\">Không chia sẻ mã này.</strong> MealMate sẽ không yêu cầu bạn cung cấp mã qua điện thoại, tin nhắn hoặc email.",
    tagline: "Ăn ngon, sống khỏe.",
    textCode: "Mã xác minh của bạn là",
    textNote: "Mã này hết hạn sau 10 phút. Không chia sẻ mã này. MealMate sẽ không yêu cầu bạn cung cấp mã.",
    registration: {
      documentTitle: "Xác minh email MealMate",
      preheader: "Mã xác minh email MealMate gồm 6 chữ số và hết hạn sau 10 phút.",
      badge: "XÁC MINH EMAIL",
      heading: "Xác minh địa chỉ email",
      introduction: "Nhập mã dưới đây trong MealMate để xác nhận email và hoàn tất đăng ký.",
      footer: "Nếu bạn không đăng ký tài khoản MealMate, bạn có thể bỏ qua email này.",
      subject: "MealMate - Xác minh email",
      textHeading: "Xác minh email MealMate",
    },
    password_reset: {
      documentTitle: "Đặt lại mật khẩu MealMate",
      preheader: "Mã đặt lại mật khẩu MealMate gồm 6 chữ số và hết hạn sau 10 phút.",
      badge: "ĐẶT LẠI MẬT KHẨU",
      heading: "Đây là mã xác minh của bạn",
      introduction: "MealMate nhận được yêu cầu đặt lại mật khẩu. Nhập mã dưới đây trong ứng dụng để tiếp tục.",
      footer: "Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.",
      subject: "MealMate - Đặt lại mật khẩu",
      textHeading: "Đặt lại mật khẩu MealMate",
    },
  },
};

const buildOtpEmail = (otp, purpose, language = "en") => {
  const localized = EMAIL_CONTENT[language];
  const content = localized?.[purpose];
  if (!content) throw new Error("Unsupported email purpose");

  const html = `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>${content.documentTitle}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-shell { padding: 16px 10px !important; }
        .email-content { padding: 30px 22px 28px !important; }
        .email-footer { padding: 22px !important; }
        .otp-code { font-size: 34px !important; letter-spacing: 6px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F4F8F7; color:#163C3A; font-family:Arial, Helvetica, sans-serif; -webkit-text-size-adjust:100%;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; mso-hide:all;">
      ${content.preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse; background-color:#F4F8F7;">
      <tr>
        <td class="email-shell" align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:540px; border-collapse:separate; background-color:#FFFFFF; border:1px solid #DFE9E7; border-radius:16px; overflow:hidden;">
            <tr>
              <td height="5" style="height:5px; background-color:#0E8F82; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:24px 30px; border-bottom:1px solid #E8EFED;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td align="center" valign="middle" width="38" height="38" style="width:38px; height:38px; border-radius:11px; background-color:#0E8F82; color:#FFFFFF; font-size:19px; line-height:38px; font-weight:800;">M</td>
                    <td style="padding-left:12px; color:#163C3A; font-size:20px; line-height:26px; font-weight:800;">MealMate</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="email-content" style="padding:38px 36px 34px;">
                <div style="color:#0E8F82; font-size:11px; line-height:16px; font-weight:800; letter-spacing:1.1px;">${content.badge}</div>
                <h1 style="margin:12px 0 12px; color:#163C3A; font-size:26px; line-height:34px; font-weight:800; letter-spacing:-0.2px;">${content.heading}</h1>
                <p style="margin:0; color:#4B6865; font-size:15px; line-height:24px;">${content.introduction}</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:28px 0 14px; border-collapse:separate; background-color:#EFF8F6; border:1px solid #CDE6E1; border-radius:12px;">
                  <tr>
                    <td align="center" style="padding:23px 16px 21px;">
                      <div style="color:#4B6865; font-size:11px; line-height:16px; font-weight:700; letter-spacing:0.9px;">${localized.codeLabel}</div>
                      <div class="otp-code" style="padding-top:8px; color:#087A70; font-size:38px; line-height:48px; font-weight:800; letter-spacing:8px; white-space:nowrap;">${otp}</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; color:#607A77; font-size:13px; line-height:20px; text-align:center;">
                  ${localized.expires}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin-top:28px; border-collapse:collapse;">
                  <tr>
                    <td style="padding-top:20px; border-top:1px solid #E8EFED; color:#607A77; font-size:13px; line-height:21px;">
                      ${localized.privacy}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="email-footer" style="padding:22px 36px 26px; background-color:#FAFCFB; border-top:1px solid #E8EFED; color:#718784; font-size:12px; line-height:19px; text-align:center;">
                ${content.footer}<br>
                <span style="display:inline-block; padding-top:8px; color:#0E8F82; font-weight:700;">MealMate</span>
                <span style="color:#9AACA9;"> &middot; ${localized.tagline}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${content.textHeading}\n\n${localized.textCode}: ${otp}\n\n${localized.textNote}\n\n${content.footer}`;
  return { subject: content.subject, html, text };
};

module.exports = { buildOtpEmail };
