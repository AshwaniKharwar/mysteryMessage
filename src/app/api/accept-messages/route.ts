import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";

export async function GET(request: Request) {
  // database connection
  dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const userId = user._id;
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "accept message status",
        isAcceptingMessages: foundUser.isAccetingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching accept messages route", error);
    return Response.json(
      {
        success: false,
        message: "Error in fetching accept messages route",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // db connection
  dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const userId = user._id;
    const { acceptMessages } = await request.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAccetingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User accept messages status changed",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in updating accept messages status route", error);
    return Response.json(
      {
        success: false,
        message: "Error in updating accept messages status route",
      },
      { status: 200 }
    );
  }
}
