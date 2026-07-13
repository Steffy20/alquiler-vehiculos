export const BRANCH_CITIES = ["Manta", "Quito", "Guayaquil", "Cuenca"] as const;

export type BranchCity = (typeof BRANCH_CITIES)[number];
export type BranchInventory = Record<BranchCity, { stock: number; occupied: number }>;

export const createBranchInventory = (stock = 0, occupied = 0): BranchInventory => {
  const result = {} as BranchInventory;
  BRANCH_CITIES.forEach((city, index) => {
    const cityStock = Math.floor(stock / BRANCH_CITIES.length) + (index < stock % BRANCH_CITIES.length ? 1 : 0);
    const cityOccupied = Math.min(cityStock, Math.floor(occupied / BRANCH_CITIES.length) + (index < occupied % BRANCH_CITIES.length ? 1 : 0));
    result[city] = { stock: cityStock, occupied: cityOccupied };
  });
  return result;
};

export const inventoryTotals = (inventory: BranchInventory) =>
  BRANCH_CITIES.reduce(
    (total, city) => ({
      stock: total.stock + (inventory[city]?.stock || 0),
      occupied: total.occupied + (inventory[city]?.occupied || 0),
    }),
    { stock: 0, occupied: 0 }
  );
