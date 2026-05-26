import { RepresentativeManager } from "@/components/representative-manager";
import { beautyService } from "@/src/services/beauty-service";

export const dynamic = "force-dynamic";

export default async function RepresentativeProductsPage() {
  const representatives = await beautyService.getRepresentatives();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 lg:px-10">
      <div className="container mx-auto">
        <RepresentativeManager initialReps={representatives} view="products" />
      </div>
    </main>
  );
}
