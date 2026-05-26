import { requireAdmin } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-errors";
import { beautyService } from "@/src/services/beauty-service";
import {
  productCollectionSchema,
  type IProductCollectionInput,
} from "@/src/validators/beauty-validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/product-collections/[collectionId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { collectionId } = await ctx.params;
    const body: IProductCollectionInput = productCollectionSchema.parse(
      await request.json(),
    );
    const collection = await beautyService.updateProductCollection(
      collectionId,
      body,
    );

    if (!collection) {
      return Response.json(
        { message: "Product collection not found." },
        { status: 404 },
      );
    }

    return Response.json({
      collection,
      message: "Product collection updated successfully",
    });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(
          error,
          "Could not update product collection",
        ),
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/product-collections/[collectionId]">,
) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const { collectionId } = await ctx.params;
    const collection = await beautyService.deleteProductCollection(collectionId);

    if (!collection) {
      return Response.json(
        { message: "Product collection not found." },
        { status: 404 },
      );
    }

    return Response.json({
      collection,
      message: "Product collection deleted successfully",
    });
  } catch (error) {
    return Response.json(
      {
        message: getApiErrorMessage(
          error,
          "Could not delete product collection",
        ),
      },
      { status: 400 },
    );
  }
}
