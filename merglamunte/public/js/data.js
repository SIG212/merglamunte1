// Data - Masive montane din România
const MASIVE = [
  {"id": "bucegi", "nume": "Bucegi", "altitudine_maxima": 2505, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "fagaras", "nume": "Făgăraș", "altitudine_maxima": 2544, "altitudine_prag": 1600, "dificultate_vara_peste_prag": 4, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "rodnei", "nume": "Rodnei", "altitudine_maxima": 2303, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "retezat", "nume": "Retezat", "altitudine_maxima": 2509, "altitudine_prag": 1600, "dificultate_vara_peste_prag": 4, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "piatra_craiului", "nume": "Piatra Craiului", "altitudine_maxima": 2238, "altitudine_prag": 1400, "dificultate_vara_peste_prag": 5, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 3, "avalanse": true},
  {"id": "bistritei", "nume": "Bistriței", "altitudine_maxima": 1859, "altitudine_prag": 1700, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 4, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "ceahlau", "nume": "Ceahlău", "altitudine_maxima": 1907, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 3, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "calimani", "nume": "Călimani", "altitudine_maxima": 2100, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "hasmas", "nume": "Hășmaș", "altitudine_maxima": 1792, "altitudine_prag": 1700, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 2, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "maramuresului", "nume": "Maramureșului", "altitudine_maxima": 1957, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 4, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "parang_sureanu", "nume": "Parâng, Șureanu", "altitudine_maxima": 2519, "altitudine_prag": 2000, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "ciucas_piatra_mare", "nume": "Ciucaș, Piatra Mare", "altitudine_maxima": 1954, "altitudine_prag": 1600, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 3, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "tarcu_godeanu", "nume": "Țarcu, Godeanu", "altitudine_maxima": 2190, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 4, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "buila", "nume": "Buila-Vânturărița", "altitudine_maxima": 1885, "altitudine_prag": 1400, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 5, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "cozia", "nume": "Cozia", "altitudine_maxima": 1668, "altitudine_prag": 1668, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 2, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "iezer", "nume": "Iezer-Păpușa", "altitudine_maxima": 2391, "altitudine_prag": 1700, "dificultate_vara_peste_prag": 3, "dificultate_iarna_peste_prag": 4, "dificultate_vara_sub_prag": 2, "avalanse": true},
  {"id": "baiului", "nume": "Baiului", "altitudine_maxima": 1799, "altitudine_prag": 1700, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 3, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "cindrel", "nume": "Cindrel", "altitudine_maxima": 2244, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 3, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "mehedinti_cernei", "nume": "Mehedinți, Cernei", "altitudine_maxima": 1466, "altitudine_prag": 1800, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 2, "dificultate_vara_sub_prag": 2, "avalanse": false},
  {"id": "apuseni", "nume": "Apuseni", "altitudine_maxima": 1849, "altitudine_prag": 1500, "dificultate_vara_peste_prag": 2, "dificultate_iarna_peste_prag": 3, "dificultate_vara_sub_prag": 1, "avalanse": false}
];

// Coordonate Meteoblue pentru fiecare masiv
const STATII_METEO = {
  "bucegi": { "lat": 45.467, "lon": 25.500, "lat_high": 45.400, "lon_high": 25.457 },
  "fagaras": { "lat": 45.653, "lon": 24.787, "lat_high": 45.596, "lon_high": 24.635 },
  "rodnei": { "lat": 47.613, "lon": 24.856, "lat_high": 47.590, "lon_high": 24.630 },
  "retezat": { "lat": 45.372, "lon": 23.064, "lat_high": 45.350, "lon_high": 22.880 },
  "piatra_craiului": { "lat": 45.506, "lon": 25.265, "lat_high": 45.520, "lon_high": 25.215 },
  "bistritei": { "lat": 47.111, "lon": 25.247, "lat_high": 47.111, "lon_high": 25.247 },
  "ceahlau": { "lat": 46.988, "lon": 25.958, "lat_high": 46.978, "lon_high": 25.945 },
  "calimani": { "lat": 47.111, "lon": 25.247, "lat_high": 47.096, "lon_high": 25.233 },
  "hasmas": { "lat": 46.685, "lon": 25.826, "lat_high": 46.685, "lon_high": 25.826 },
  "maramuresului": { "lat": 47.930, "lon": 24.550, "lat_high": 47.930, "lon_high": 24.550 },
  "parang_sureanu": { "lat": 45.387, "lon": 23.482, "lat_high": 45.345, "lon_high": 23.530 },
  "ciucas_piatra_mare": { "lat": 45.522, "lon": 25.926, "lat_high": 45.522, "lon_high": 25.926 },
  "tarcu_godeanu": { "lat": 45.290, "lon": 22.530, "lat_high": 45.290, "lon_high": 22.530 },
  "buila": { "lat": 45.238, "lon": 24.132, "lat_high": 45.238, "lon_high": 24.132 },
  "cozia": { "lat": 45.302, "lon": 24.341, "lat_high": 45.302, "lon_high": 24.341 },
  "iezer": { "lat": 45.464, "lon": 25.088, "lat_high": 45.440, "lon_high": 25.010 },
  "baiului": { "lat": 45.412, "lon": 25.667, "lat_high": 45.412, "lon_high": 25.667 },
  "cindrel": { "lat": 45.623, "lon": 23.892, "lat_high": 45.623, "lon_high": 23.892 },
  "mehedinti_cernei": { "lat": 45.163, "lon": 22.699, "lat_high": 45.163, "lon_high": 22.699 },
  "apuseni": { "lat": 46.544, "lon": 22.854, "lat_high": 46.682, "lon_high": 22.711 }
};

// Mapare masiv -> cheie pentru buletinul nivologic
const AVALANSA_MAPPING = {
  "bucegi": "bucegi",
  "fagaras": "fagaras",
  "rodnei": "rodnei",
  "retezat": "retezat", // folosește parâng sau tarcu
  "piatra_craiului": "bucegi", // apropiat de Bucegi
  "calimani": "calimani",
  "ceahlau": "ceahlau",
  "parang_sureanu": "parang",
  "tarcu_godeanu": "tarcu",
  "bistritei": "bistritei",
  "maramuresului": "rodnei", // apropiat de Rodnei
  "buila": "parang", // apropiat de Parâng
  "iezer": "fagaras", // apropiat de Făgăraș
  "apuseni": "occidentali"
};

// Matrice de risc
const MATRICE_RISC = {
  "incepator": {
    "vara": { 1: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 2: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 3: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 4: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"}, 5: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"} },
    "iarna": { 1: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 2: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 3: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 4: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"}, 5: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"} }
  },
  "mediu": {
    "vara": { 1: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 2: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 3: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 4: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 5: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"} },
    "iarna": { 1: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 2: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 3: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 4: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"}, 5: {verde:"rosu",galben:"rosu",rosu:"rosu",blocant:"rosu"} }
  },
  "experimentat": {
    "vara": { 1: {verde:"verde",galben:"verde",rosu:"verde",blocant:"rosu"}, 2: {verde:"verde",galben:"verde",rosu:"verde",blocant:"rosu"}, 3: {verde:"verde",galben:"galben",rosu:"galben",blocant:"rosu"}, 4: {verde:"verde",galben:"galben",rosu:"rosu",blocant:"rosu"}, 5: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"} },
    "iarna": { 1: {verde:"verde",galben:"verde",rosu:"verde",blocant:"rosu"}, 2: {verde:"verde",galben:"verde",rosu:"verde",blocant:"rosu"}, 3: {verde:"verde",galben:"galben",rosu:"galben",blocant:"rosu"}, 4: {verde:"galben",galben:"galben",rosu:"rosu",blocant:"rosu"}, 5: {verde:"galben",galben:"rosu",rosu:"rosu",blocant:"rosu"} }
  }
};

// Configurare praguri meteo
const PRAGURI = {
  windchill: { verde: -15, galben: -25, rosu: -35 },
  vant: { verde: 30, galben: 50, rosu: 80 },
  precipitatii: { verde: 2, galben: 5 },
  vizibilitate: { verde: 5, galben: 1 },
  risc_avalansa: { verde: 1, galben: 2, rosu: 3, blocant: 4 }
};

// Salvamont
const SALVAMONT = {
  national: { nume: "Dispecerat Național", telefon: "0725-826668" },
  zone: {
    "bucegi": { nume: "Salvamont Prahova", telefon: "0244-315656" },
    "fagaras": { nume: "Salvamont Sibiu", telefon: "0745-815920" },
    "retezat": { nume: "Salvamont Hunedoara", telefon: "0745-140850" },
    "piatra_craiului": { nume: "Salvamont Brașov", telefon: "0268-471517" },
    "rodnei": { nume: "Salvamont Maramureș", telefon: "0262-220076" },
    "ceahlau": { nume: "Salvamont Neamț", telefon: "0744-525055" },
    "calimani": { nume: "Salvamont Mureș", telefon: "0744-625905" },
    "parang_sureanu": { nume: "Salvamont Gorj", telefon: "0253-214140" },
    "apuseni": { nume: "Salvamont Cluj", telefon: "0745-070144" }
  }
};

// Mesaje verdict
const MESAJE = {
  verde: {
    titlu: "MERGI",
    icon: "✅",
    subtitlu: "Condiții favorabile pentru drumeție",
    descriere: "Condițiile sunt bune. Respectă regulile de bază și bucură-te de munte!"
  },
  galben: {
    titlu: "AI GRIJĂ",
    icon: "⚠️",
    subtitlu: "Condiții dificile pentru drumeție",
    descriere: "Necesită experiență și echipament complet. Evaluează constant pe teren."
  },
  rosu: {
    titlu: "NU MERGE",
    icon: "❌",
    subtitlu: "Condiții periculoase",
    descriere: "Amână drumeția pentru o zi cu condiții mai bune."
  }
};

// Echipament recomandat
const ECHIPAMENT = {
  baza: [
    { icon: "🥾", text: "Bocanci montani" },
    { icon: "🎒", text: "Rucsac 25-35L" },
    { icon: "💧", text: "Apă 2L minim" },
    { icon: "🍫", text: "Gustări energizante" },
    { icon: "📱", text: "Telefon încărcat" },
    { icon: "🗺️", text: "Hartă + GPS" }
  ],
  iarna: [
    { icon: "❄️", text: "Crampoane" },
    { icon: "🪓", text: "Piolet/Ceapcan" },
    { icon: "🧥", text: "Geacă tehnică iarnă" },
    { icon: "🧤", text: "Mănuși tehnice + rezervă" },
    { icon: "☕", text: "Termos cu lichid cald" },
    { icon: "🎿", text: "Ochelari ski/viscol" }
  ],
  zapada: [
    { icon: "❄️", text: "Crampoane obligatorii" },
    { icon: "🪓", text: "Ceapcan" }
  ],
  vreme_rea: [
    { icon: "🧥", text: "Pelerină de ploaie" },
    { icon: "🔦", text: "Lanternă frontală" },
    { icon: "🆘", text: "Pătură termică urgență" }
  ]
};
