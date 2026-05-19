import {
  deleteRepresentative,
  representativeInputSchema,
  updateRepresentative,
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
    const input = representativeInputSchema.parse(body);
    const representative = await updateRepresentative(id, input);

    if (!representative) {
      return Response.json(
        { error: "Representative not found." },
        { status: 404 },
      );
    }

    return Response.json({ representative });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update representative.",
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
    const representative = await deleteRepresentative(id);

    if (!representative) {
      return Response.json(
        { error: "Representative not found." },
        { status: 404 },
      );
    }

    return Response.json({ representative });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete representative.",
      },
      { status: 500 },
    );
  }
}
