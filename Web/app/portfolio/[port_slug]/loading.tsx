import { InformationFormLoading } from "@/components/form/loading/information";
import { Header } from "@/components/ui/header";

export default async function PortfolioLoading() {
  return (
    <Header
      title="Portfolio Information"
      description="Basic information about your portfolio."
    >
      <InformationFormLoading />
    </Header>
  );
}
