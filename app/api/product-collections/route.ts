import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import {
  productCollectionSchema,
  type IProductCollectionInput,
} from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await beautyService.getProductCollections();
    return Response.json({ collections });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not load product collections"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const body: IProductCollectionInput = productCollectionSchema.parse(
      await request.json(),
    );
    const collection = await beautyService.createProductCollection(body);

    return Response.json(
      { collection, message: "Product collection created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not create product collection"),
      },
      { status: 400 },
    );
  }
}
