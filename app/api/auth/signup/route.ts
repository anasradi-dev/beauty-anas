import { createSessionCookie } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { authService } from "@/src/services/auth-service";
import { authSchema, type IAuthInput } from "@/src/validators/auth-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: IAuthInput = authSchema.parse(await request.json());
    const user = await authService.signupUser(body);

    return Response.json(
      { user, message: "Account created successfully" },
      {
        status: 201,
        headers: { "Set-Cookie": createSessionCookie(user) },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          getApiErrorMessage(error, "Could not create account"),
      },
      { status: 400 },
    );
  }
}
