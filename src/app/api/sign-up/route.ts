import UserModel from "@/model/User";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/dbConnect";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { sendVerificationEmailNodemailer } from "@/helpers/sendVerificationEmailNodemailer";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserByUsernameAndVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUsernameAndVerified) {
      return Response.json(
        {
          success: false,
          message: "Username is already exist",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();

    if (existingUserByEmail) {
      
        if(existingUserByEmail.isVerified){
            return Response.json(
                {
                  success: false,
                  message: "user already exist with email",
                },
                { status: 400 }
              );
        } else {
            const hashedPassword = await bcryptjs.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
            await existingUserByEmail.save();
        }

    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      
      const userByUsername = await UserModel.findOne({username});
      if(userByUsername){
        userByUsername.email= email;
        userByUsername.password = hashedPassword;
        userByUsername.verifyCode = verifyCode;
        userByUsername.verifyCodeExpiry = expiryDate;
        userByUsername.messages = []
        await userByUsername.save();
      } else {

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            messages: [],
          });
        await newUser.save();
      }
    }

    // send verification email
    // const emailResponse = await sendVerificationEmail(
    //   email,
    //   username,
    //   verifyCode
    // );
    const emailResponse = await sendVerificationEmailNodemailer(email, username, verifyCode);
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "user register successfully. Pls verify user ",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error registering user", error);
    return Response.json(
      {
        success: false,
        message: "error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
