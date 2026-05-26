import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import {
  representativeSchema,
  type IRepresentativeInput,
} from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/representatives/[representativeId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { representativeId } = await ctx.params;
    const body: IRepresentativeInput = representativeSchema.parse(
      await request.json(),
    );
    const representative = await beautyService.updateRepresentative(
      representativeId,
      body,
    );

    if (!representative) {
      return Response.json(
        { message: "Representative not found." },
        { status: 404 },
      );
    }

    return Response.json({
      representative,
      message: "Representative updated successfully",
    });
  } catch (error) {
    return Response.json(
      { message: getApiErrorMessage(error, "Could not update representative") },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/representatives/[representativeId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { representativeId } = await ctx.params;
    const representative =
      await beautyService.deleteRepresentative(representativeId);

    if (!representative) {
      return Response.json(
        { message: "Representative not found." },
        { status: 404 },
      );
    }

    return Response.json({
      representative,
      message: "Representative deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { message: getApiErrorMessage(error, "Could not delete representative") },
      { status: 400 },
    );
  }
}
