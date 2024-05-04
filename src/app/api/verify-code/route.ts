import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST (request: Request) {
    await dbConnect();
    
    try {
        
        const {username, code} = await request.json();

        const decodeUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({username: decodeUsername});

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 500}
            )
        }

        const isCodeValide = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCode) > new Date();

        if( isCodeValide && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                {status: 200}
            )

        } else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Verification code is expired, please signup again to get new code"
                },
                {status: 400}
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "incorrect verification code"
                },
                {status: 400}
            )
        }



    } catch (error) {
        console.error("error verifying code", error);
        return Response.json(
            {
                success: false,
                message: "error verifing code"
            },
            {status: 500}
        )
    }
}