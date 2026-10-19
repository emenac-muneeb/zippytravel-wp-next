import { useParams } from "next/navigation";
import CityFlightFares from "../Components/CityFlightFares";
import CountryFares from "../Components/CountryFares";
import SpecificContinent from "../Pages/SpecificContinent";

export default function RouteDecider() {

  const { continentSlug, countrySlug, citySlug } = useParams();

  if (continentSlug && countrySlug && citySlug) {
    return <CityFlightFares />;
  }

  if (continentSlug && countrySlug) {
    return <CountryFares />;
  }

  if (continentSlug) {
    return <SpecificContinent />;
  }

  return (
    <div className="text-center text-red-500 py-20">
      ❌ Invalid Route
    </div>
  );
}