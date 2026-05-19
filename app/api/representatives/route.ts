import {
  createRepresentative,
  getRepresentatives,
  representativeInputSchema,
} from "@/lib/beauty-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const representatives = await getRepresentatives();
    return Response.json({ representatives });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load representatives.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = representativeInputSchema.parse(body);
    const representative = await createRepresentative(input);

    return Response.json({ representative }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create representative.",
      },
      { status: 400 },
    );
  }
}
