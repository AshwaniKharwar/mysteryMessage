import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuearySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await dbConnect();

    try {
        
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        }

        // validate with zod
        const result = UsernameQuearySchema.safeParse(queryParam);
        console.log("result: ", result) // TODO: remove
         
        if(!result.success){
            const usernameErros = result.error.format().username?._errors || [];
            return Response.json({
                success : false,
                message: usernameErros?.length > 0 ? 
                usernameErros?.join(", ")
                : "invalide query parameter"
            }, {status: 400})
        }

        const {username} = result.data;

        const existVerifiedUser = await UserModel.findOne({username, isVerified: true});

        if(existVerifiedUser){
            return Response.json({
                success : false,
                message: "username is already taken"
            }, {status: 400})
        }

        return Response.json({
            success : true,
            message: "username is unique"
        }, {status: 401})

    } catch (error) {
        console.error("error checking username", error);
        return Response.json(
            {
                success: false,
                message: "error checking username"
            },
            {status: 500}
        )
    }
}