import { RepresentativeManager } from "@/components/representative-manager";
import { salesReps } from "@/lib/data";

export default function RepresentativeProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 lg:px-10">
      <div className="container mx-auto">
        <RepresentativeManager initialReps={salesReps} view="products" />
      </div>
    </main>
  );
}
