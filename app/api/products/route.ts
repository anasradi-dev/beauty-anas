import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import { productSchema, type IProductInput } from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await beautyService.getProducts();
    return Response.json({ products });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not load products"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const body: IProductInput = productSchema.parse(await request.json());
    const product = await beautyService.createProduct(body);

    return Response.json(
      { product, message: "Product created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(error, "Could not create product"),
      },
      { status: 400 },
    );
  }
}
