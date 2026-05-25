import { seedBeautyData } from "@/lib/beauty-repository";

export const runtime = "nodejs";

export async function POST() {
  try {
    const representatives = await seedBeautyData();
    return Response.json({ representatives });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to seed BEAUTY data.",
      },
      { status: 500 },
    );
  }
}
