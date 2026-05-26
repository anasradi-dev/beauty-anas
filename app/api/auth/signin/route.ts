import { createSessionCookie } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { authService } from "@/src/services/auth-service";
import {
  signinSchema,
  type ISigninInput,
} from "@/src/validators/auth-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: ISigninInput = signinSchema.parse(await request.json());
    const user = await authService.signinUser(body);

    return Response.json(
      { user, message: "Signed in successfully" },
      { headers: { "Set-Cookie": createSessionCookie(user) } },
    );
  } catch (error) {
    return Response.json(
      {
        error: getApiErrorMessage(error, "Could not sign in"),
      },
      { status: 401 },
    );
  }
}
