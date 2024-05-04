import { transporter } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmailNodemailer(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await transporter.sendMail({
            from: `Mystery Message || ${process.env.MAIL_HOST}`,
            to: email,
            subject: 'Mystery Message | Verification code',
            html: VerificationEmail({username, otp: verifyCode}),
        })

        return {
            success: true,
            message: "verification code sent successfully"
        }
    } catch (error) {
        console.error("error sending verification email", error);
        return {
            success: false,
            message: "error sending verification email"
        }
    }
}