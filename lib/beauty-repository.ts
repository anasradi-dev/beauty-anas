import { z } from "zod";
import {
  ProductBatchModel,
  ProductCollectionModel,
  ProductModel,
  RepresentativeDocument,
  RepresentativeModel,
} from "@/lib/beauty-models";
import {
  collections,
  productBatches,
  products,
  salesReps,
  SalesRep,
} from "@/lib/data";
import { connectMongo } from "@/lib/mongodb";

export const representativeInputSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  settlementDate: z.string().trim().min(1),
  depositedAmount: z.coerce.number().min(0),
});

export type RepresentativeInput = z.infer<typeof representativeInputSchema>;

function serializeRepresentative(rep: RepresentativeDocument): SalesRep {
  return {
    id: rep.id,
    name: rep.name,
    address: rep.address,
    phone: rep.phone,
    settlementDate: rep.settlementDate,
    depositedAmount: rep.depositedAmount,
  };
}

export async function getRepresentatives() {
  await connectMongo();
  const representatives = await RepresentativeModel.find()
    .sort({ createdAt: 1 })
    .lean<RepresentativeDocument[]>();

  return representatives.map(serializeRepresentative);
}

export async function createRepresentative(input: RepresentativeInput) {
  await connectMongo();
  const representative = await RepresentativeModel.create({
    id: `rep-${Date.now()}`,
    ...input,
  });

  return serializeRepresentative(representative.toObject());
}

export async function updateRepresentative(
  id: string,
  input: RepresentativeInput,
) {
  await connectMongo();
  const representative = await RepresentativeModel.findOneAndUpdate(
    { id },
    input,
    { new: true, runValidators: true },
  ).lean<RepresentativeDocument | null>();

  if (!representative) {
    return null;
  }

  return serializeRepresentative(representative);
}

export async function deleteRepresentative(id: string) {
  await connectMongo();
  const representative = await RepresentativeModel.findOneAndDelete({
    id,
  }).lean<RepresentativeDocument | null>();

  return representative ? serializeRepresentative(representative) : null;
}

export async function seedBeautyData() {
  await connectMongo();

  await Promise.all([
    RepresentativeModel.deleteMany({}),
    ProductModel.deleteMany({}),
    ProductCollectionModel.deleteMany({}),
    ProductBatchModel.deleteMany({}),
  ]);

  await Promise.all([
    RepresentativeModel.insertMany(salesReps),
    ProductModel.insertMany(products),
    ProductCollectionModel.insertMany(collections),
    ProductBatchModel.insertMany(productBatches),
  ]);

  return getRepresentatives();
}
