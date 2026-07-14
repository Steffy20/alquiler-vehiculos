export const ECUADOR_CITIES = [
  "Ambato", "Atacames", "Azogues", "Babahoyo", "Bahía de Caráquez", "Balzar",
  "Baños de Agua Santa", "Cayambe", "Chone", "Cuenca", "Daule", "Durán",
  "El Carmen", "El Coca", "El Guabo", "El Triunfo", "Esmeraldas", "Galápagos",
  "Gualaceo", "Guano", "Guaranda", "Guayaquil", "Huaquillas", "Ibarra", "Jipijapa",
  "La Concordia", "La Libertad", "La Maná", "Lago Agrio", "Latacunga", "Loja",
  "Macas", "Machala", "Manta", "Milagro", "Montecristi", "Naranjal", "Nueva Loja",
  "Otavalo", "Pasaje", "Pedernales", "Pedro Carbo", "Playas", "Portoviejo", "Pujilí",
  "Puerto Ayora", "Puerto Baquerizo Moreno", "Puerto López", "Puyo", "Quevedo", "Quito",
  "Riobamba", "Salinas", "Samborondón", "San Gabriel", "San Lorenzo", "Santa Elena",
  "Santo Domingo", "Shushufindi", "Tena", "Tulcán", "Ventanas", "Vinces", "Yaguachi",
  "Zamora", "Zaruma"
] as const;

const normalizeCity = (value: string) => value
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("es");

export const findEcuadorCity = (value: string) =>
  ECUADOR_CITIES.find((city) => normalizeCity(city) === normalizeCity(value));
