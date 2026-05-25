import {
  createProduct,
  getProducts,
  productInputSchema,
} from "@/lib/beauty-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getProducts();
    return Response.json({ products });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load products.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = productInputSchema.parse(body);
    const product = await createProduct(input);

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create product.",
      },
      { status: 400 },
    );
  }
}
