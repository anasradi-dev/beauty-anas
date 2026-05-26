import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const representatives = await beautyService.seedBeautyData();
    return Response.json({
      representatives,
      message: "BEAUTY data seeded successfully",
    });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not seed BEAUTY data"),
      },
      { status: 500 },
    );
  }
}
