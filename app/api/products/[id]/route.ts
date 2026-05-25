import {
  deleteProduct,
  productInputSchema,
  updateProduct,
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
    const input = productInputSchema.parse(body);
    const product = await updateProduct(id, input);

    if (!product) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update product.",
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
    const product = await deleteProduct(id);

    if (!product) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete product.",
      },
      { status: 500 },
    );
  }
}
