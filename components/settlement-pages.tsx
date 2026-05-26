import { SettlementManager } from "@/components/settlement-manager";
import { beautyService } from "@/src/services/beauty-service";

async function settlementData() {
  const representatives = await beautyService.getRepresentatives();
  return { representatives };
}

export async function MoneyDepositsPageContent() {
  const { representatives } = await settlementData();

  return (
    <SettlementManager
      initialRepresentatives={representatives}
      view="money-deposits"
    />
  );
}

export async function SettlementDatesPageContent() {
  const { representatives } = await settlementData();

  return (
    <SettlementManager initialRepresentatives={representatives} view="dates" />
  );
}

export async function TotalDepositedPageContent() {
  const { representatives } = await settlementData();

  return (
    <SettlementManager
      initialRepresentatives={representatives}
      view="total-deposited"
    />
  );
}
