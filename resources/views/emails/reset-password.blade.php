<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
        <tr>
            <td align="center">

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #f1f5f9;overflow:hidden;">

                    {{-- Brand header --}}
                    <tr>
                        <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <img src="https://ramyeon.bhrmsystem.com/images/ramyeon-logo-clear.png"
                                             alt="Ramyeon Corner"
                                             width="40"
                                             height="40"
                                             style="display:block;width:40px;height:40px;border:0;">
                                    </td>
                                    <td style="padding-left:14px;vertical-align:middle;">
                                        <p style="margin:0;font-size:15px;font-weight:700;line-height:20px;color:#0f172a;">
                                            Ramyeon Corner
                                        </p>
                                        <p style="margin:2px 0 0 0;font-size:13px;line-height:18px;color:#64748b;">
                                            Loyalty Program
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 12px 0;font-size:22px;line-height:30px;font-weight:600;color:#0f172a;">
                                Hi {{ $customerName }},
                            </h1>

                            <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#475569;">
                                We received a request to reset the password for your Ramyeon Corner loyalty account.
                                Click the button below to choose a new password.
                            </p>

                            {{-- Reset button --}}
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                                <tr>
                                    <td style="border-radius:12px;background-color:#b91c1c;">
                                        <a href="{{ $resetUrl }}"
                                           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px 0;font-size:13px;line-height:20px;color:#64748b;">
                                If the button doesn&rsquo;t work, copy and paste this link into your browser:
                            </p>

                            <p style="margin:0 0 24px 0;font-size:12px;line-height:18px;color:#64748b;word-break:break-all;">
                                <a href="{{ $resetUrl }}" style="color:#b91c1c;text-decoration:underline;">{{ $resetUrl }}</a>
                            </p>

                            {{-- Warning box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefce8;border:1px solid #fde68a;border-radius:12px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <p style="margin:0;font-size:13px;line-height:20px;color:#78350f;">
                                            <strong>This link expires in {{ $expireMinutes }} minutes.</strong>
                                            After that, you&rsquo;ll need to request a new one.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-size:14px;line-height:22px;color:#475569;">
                                If you didn&rsquo;t request this, you can safely ignore this email.
                                Your password will stay the same.
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding:20px 32px 28px 32px;border-top:1px solid #f1f5f9;">
                            <p style="margin:0;font-size:12px;line-height:18px;color:#94a3b8;">
                                Sent by Ramyeon Corner Loyalty System.
                            </p>
                            <p style="margin:4px 0 0 0;font-size:12px;line-height:18px;color:#94a3b8;">
                                Please do not reply to this email.
                            </p>
                        </td>
                    </tr>

                </table>

                <p style="margin:16px 0 0 0;font-size:11px;color:#cbd5e1;">
                    &copy; {{ date('Y') }} Ramyeon Corner
                </p>

            </td>
        </tr>
    </table>

</body>
</html>