import {
  deleteProductCollection,
  productCollectionInputSchema,
  updateProductCollection,
} from "@/lib/beauty-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = productCollectionInputSchema.parse(body);
    const collection = await updateProductCollection(id, input);

    if (!collection) {
      return Response.json(
        { error: "Product collection not found." },
        { status: 404 },
      );
    }

    return Response.json({ collection });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product collection.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const collection = await deleteProductCollection(id);

    if (!collection) {
      return Response.json(
        { error: "Product collection not found." },
        { status: 404 },
      );
    }

    return Response.json({ collection });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete product collection.",
      },
      { status: 500 },
    );
  }
}
