import {
  createProductCollection,
  getProductCollections,
  productCollectionInputSchema,
} from "@/lib/beauty-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await getProductCollections();
    return Response.json({ collections });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load product collections.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = productCollectionInputSchema.parse(body);
    const collection = await createProductCollection(input);

    return Response.json({ collection }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create product collection.",
      },
      { status: 400 },
    );
  }
}
