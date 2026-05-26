import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import { productSchema, type IProductInput } from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/products/[productId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { productId } = await ctx.params;
    const body: IProductInput = productSchema.parse(await request.json());
    const product = await beautyService.updateProduct(productId, body);

    if (!product) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }

    return Response.json({ product, message: "Product updated successfully" });
  } catch (error) {
    return Response.json(
      { message: getApiErrorMessage(error, "Could not update product") },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/products/[productId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { productId } = await ctx.params;
    const product = await beautyService.deleteProduct(productId);

    if (!product) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }

    return Response.json({ product, message: "Product deleted successfully" });
  } catch (error) {
    return Response.json(
      { message: getApiErrorMessage(error, "Could not delete product") },
      { status: 400 },
    );
  }
}
