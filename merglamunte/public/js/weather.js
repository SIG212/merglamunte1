// Weather API - Meteoblue + Avalanșă
const METEOBLUE_API_KEY = 'cljvDyWgqXQe4T1x';
const AVALANSA_URL = 'https://raw.githubusercontent.com/SIG212/meteo-scraper/main/date_meteo.json';

/**
 * Obține prognoza meteo de la Meteoblue
 */
async function getWeatherForecast(lat, lon, date) {
  try {
    const url = `https://my.meteoblue.com/packages/basic-day?apikey=${METEOBLUE_API_KEY}&lat=${lat}&lon=${lon}&asl=2000&format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Eroare la obținerea datelor meteo');
    }
    
    const data = await response.json();
    return parseWeatherData(data, date);
  } catch (error) {
    console.error('Eroare Meteoblue:', error);
    return getMockWeatherData(date);
  }
}

/**
 * Parsează datele meteo de la Meteoblue
 */
function parseWeatherData(data, targetDate) {
  const daily = data.data_day;
  const dates = daily.time;
  
  // Găsește indexul pentru data țintă
  const targetDateStr = targetDate.toISOString().split('T')[0];
  let dayIndex = dates.findIndex(d => d === targetDateStr);
  
  // Dacă data nu e în prognoză, folosește prima zi disponibilă
  if (dayIndex === -1) dayIndex = 0;
  
  return {
    temperatura: daily.temperature_mean ? daily.temperature_mean[dayIndex] : null,
    temperatura_min: daily.temperature_min ? daily.temperature_min[dayIndex] : null,
    temperatura_max: daily.temperature_max ? daily.temperature_max[dayIndex] : null,
    vant_max: daily.windspeed_max ? daily.windspeed_max[dayIndex] : null,
    vant_mediu: daily.windspeed_mean ? daily.windspeed_mean[dayIndex] : null,
    precipitatii: daily.precipitation ? daily.precipitation[dayIndex] : 0,
    probabilitate_precipitatii: daily.precipitation_probability ? daily.precipitation_probability[dayIndex] : 0,
    zapada: daily.snowfraction ? (daily.snowfraction[dayIndex] > 0.5 ? daily.precipitation[dayIndex] * 10 : 0) : 0,
    cod_vreme: daily.pictocode ? daily.pictocode[dayIndex] : 1,
    uv_index: daily.uvindex ? daily.uvindex[dayIndex] : 0,
    data: targetDateStr
  };
}

/**
 * Date mock pentru când API-ul nu funcționează
 */
function getMockWeatherData(date) {
  const luna = date.getMonth() + 1;
  const esteIarna = [11, 12, 1, 2, 3].includes(luna);
  
  return {
    temperatura: esteIarna ? -8 : 15,
    temperatura_min: esteIarna ? -12 : 10,
    temperatura_max: esteIarna ? -4 : 20,
    vant_max: esteIarna ? 45 : 25,
    vant_mediu: esteIarna ? 25 : 15,
    precipitatii: esteIarna ? 5 : 2,
    probabilitate_precipitatii: 30,
    zapada: esteIarna ? 80 : 0,
    cod_vreme: esteIarna ? 14 : 2,
    uv_index: esteIarna ? 2 : 6,
    data: date.toISOString().split('T')[0],
    isMock: true
  };
}

/**
 * Calculează windchill (temperatură resimțită)
 */
function calculeazaWindchill(temp, vant) {
  if (temp > 10 || vant < 5) return temp;
  
  // Formula windchill
  const windchill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(vant, 0.16) + 0.3965 * temp * Math.pow(vant, 0.16);
  return Math.round(windchill);
}

/**
 * Obține datele de risc avalanșă din GitHub
 */
async function getAvalancheRisk(masivId) {
  try {
    const response = await fetch(AVALANSA_URL);
    if (!response.ok) {
      throw new Error('Eroare la obținerea datelor de avalanșă');
    }
    
    const data = await response.json();
    const masivKey = AVALANSA_MAPPING[masivId] || masivId;
    
    if (data.date && data.date[masivKey]) {
      return {
        ...data.date[masivKey],
        ultima_actualizare: data.ultima_actualizare
      };
    }
    
    return { peste_1800: { nivel: 0, text: "Necunoscut" }, sub_1800: { nivel: 0, text: "Necunoscut" } };
  } catch (error) {
    console.error('Eroare avalanșă:', error);
    return { peste_1800: { nivel: 0, text: "Necunoscut" }, sub_1800: { nivel: 0, text: "Necunoscut" } };
  }
}

/**
 * Obține toate datele necesare pentru evaluare
 */
async function getAllWeatherData(masivId, altitudine, date) {
  const masiv = MASIVE.find(m => m.id === masivId);
  const statii = STATII_METEO[masivId];
  
  if (!masiv || !statii) {
    throw new Error('Masiv necunoscut');
  }
  
  // Determină dacă e peste sau sub prag
  const pestePrag = altitudine >= masiv.altitudine_prag;
  
  // Coordonate pentru prognoză
  const lat = pestePrag ? (statii.lat_high || statii.lat) : statii.lat;
  const lon = pestePrag ? (statii.lon_high || statii.lon) : statii.lon;
  
  // Obține date în paralel
  const [weather, avalanche] = await Promise.all([
    getWeatherForecast(lat, lon, date),
    getAvalancheRisk(masivId)
  ]);
  
  // Calculează windchill
  weather.windchill = calculeazaWindchill(weather.temperatura, weather.vant_max);
  
  // Selectează riscul de avalanșă în funcție de altitudine
  const avalancheLevel = altitudine >= 1800 ? avalanche.peste_1800 : avalanche.sub_1800;
  
  return {
    masiv,
    weather,
    avalanche: {
      nivel: avalancheLevel.nivel,
      text: avalancheLevel.text,
      ultima_actualizare: avalanche.ultima_actualizare
    },
    pestePrag,
    altitudine
  };
}

/**
 * Determină sezonul (vară/iarnă)
 */
function getSezon(date, zapada = 0) {
  const luna = date.getMonth() + 1;
  const luniIarna = [11, 12, 1, 2, 3];
  
  // Iarnă dacă e în lunile de iarnă SAU dacă e zăpadă semnificativă
  if (luniIarna.includes(luna) || zapada > 10) {
    return 'iarna';
  }
  return 'vara';
}

/**
 * Descrie codul pictocode de la Meteoblue
 */
function descrieVreme(cod) {
  const coduri = {
    1: "Senin",
    2: "Parțial senin",
    3: "Nori variabili",
    4: "Înnorat",
    5: "Ceață",
    6: "Ceață + ploaie",
    7: "Ploaie ușoară",
    8: "Ploaie",
    9: "Ploaie torențială",
    10: "Ploaie înghețată",
    11: "Ninsoare ușoară",
    12: "Ninsoare",
    13: "Ninsoare abundentă",
    14: "Viscol",
    15: "Furtună",
    16: "Grindină",
    17: "Furtună cu grindină"
  };
  return coduri[cod] || "Necunoscut";
}
