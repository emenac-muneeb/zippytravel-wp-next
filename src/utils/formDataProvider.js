export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
};

export const formdataProvider = (fare) => {
  return {
    originLabel: `${fare.origin?.city} (${fare.origin?.code})`,
    destinationLabel: `${fare.destination?.city} (${fare.destination?.code})`,
    destinationCity: fare.destination?.city || "",
    destinationCountry: fare.destination?.country || "",
    departureDate: fare.departure || "",
    returnDate: fare.return || "",
    selectedClass: fare.flght_class,
    adults: fare.adults || 1,
    children: fare.children || 0,
    infants: fare.infants || 0,
  };
};
