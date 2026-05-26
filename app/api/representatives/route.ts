import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import {
  representativeSchema,
  type IRepresentativeInput,
} from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const representatives = await beautyService.getRepresentatives();
    return Response.json({ representatives });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not load representatives"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const body: IRepresentativeInput = representativeSchema.parse(
      await request.json(),
    );
    const representative = await beautyService.createRepresentative(body);

    return Response.json(
      { representative, message: "Representative created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not create representative"),
      },
      { status: 400 },
    );
  }
}
