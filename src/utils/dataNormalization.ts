import { NewCoffeeShop } from "../../types";

export const normalizeStringArray = (
  data: any, 
  toHumanReadable: boolean = false
): string[] => {
    if (!data) return [];

    let arr: string[] = [];

    // normalize input to a standard array
    if (Array.isArray(data)) {
        arr = data;
    } else if (typeof data === 'string') {
        // remove postgres/JSON wrapping: {}, [], or whitespace
        const cleanStr = data.replace(/^[{[]|[}\]]$/g, '').trim();
        
        // Split by comma only if string isn't empty
        arr = cleanStr ? cleanStr.split(',') : [];
    }

  return arr
    .filter(item => !!item)
    .map(item => {
      const cleaned = item.trim().replace(/^['"]+|['"]+$/g, '');
      return toHumanReadable ? cleaned.replace(/_/g, " ") : cleaned;
    });
};

export const normalizeCafe = (cafe: Partial<NewCoffeeShop>) => {
  return {
    ...cafe,
    popular_items: normalizeStringArray(cafe.popular_items, true),
    alt_milks: normalizeStringArray(cafe.alt_milks, true),
    name: cafe.name || "",
    address: cafe.address || "",
    neighborhood: cafe.neighborhood || "",
    website: cafe.website || "",
    opening_hours: cafe.opening_hours || "",
    phone: cafe.phone || "",
    instagram: cafe.instagram || "",
    parking: cafe.parking || "",
    closest_metro: cafe.closest_metro || "",
    bathroom_access: cafe.bathroom_access || "",
    roaster: cafe.roaster || "",
    matcha_brand: cafe.matcha_brand || "",
    alt_milks_cost: cafe.alt_milks_cost || "",
    latte_price: cafe.latte_price || "",
    notes: cafe.notes || "",
    specialty: cafe.specialty ?? false,
    coffee_rec: cafe.coffee_rec ?? false,
    matcha_rec: cafe.matcha_rec ?? false,
    in_house_roast: cafe.in_house_roast ?? false,
    matcha: cafe.matcha ?? false,
    indoor_seating: cafe.indoor_seating ?? false,
    outdoor_seating: cafe.outdoor_seating ?? false,
    wifi: cafe.wifi ?? false,
    outlets: cafe.outlets ?? false,
    laptop_friendly: cafe.laptop_friendly ?? false,
    bathroom: cafe.bathroom ?? false,
  };
};