// Weather API - Meteoblue (prognoză) + ANM (zăpadă curentă) + GitHub (avalanșă)

const METEOBLUE_API_KEY = 'cljvDyWgqXQe4T1x';
const AVALANSA_URL = 'https://raw.githubusercontent.com/SIG212/meteo-scraper/main/date_meteo.json';

// ANM API cu fallback pentru CORS
const ANM_URL_DIRECT = 'https://www.meteoromania.ro/wp-json/meteoapi/v2/starea-vremii';
const ANM_URL_PROXY = 'https://corsproxy.io/?' + encodeURIComponent('https://www.meteoromania.ro/wp-json/meteoapi/v2/starea-vremii');

// Mapare masiv -> stații ANM pentru zăpadă (în ordinea priorității)
// Numele trebuie să fie EXACT ca în API-ul ANM (majuscule)
const STATII_ZAPADA = {
  "bucegi": ["VARFUL OMU", "SINAIA 1500", "PREDEAL", "FUNDATA"],
  "fagaras": ["BALEA LAC", "FAGARAS"],
  "retezat": ["TARCU", "CUNTU", "PETROSANI"],
  "piatra_craiului": ["FUNDATA", "PREDEAL", "BRASOV GHIMBAV"],
  "rodnei": ["IEZER", "BISTRITA", "POIANA STAMPEI"],
  "calimani": ["CALIMANI (RETITIS)", "TOPLITA", "BATOS"],
  "ceahlau": ["CEAHLAU TOACA", "PIATRA NEAMT"],
  "parang_sureanu": ["PARANG", "STRAJA", "RANCA", "PETROSANI", "VOINEASA"],
  "tarcu_godeanu": ["TARCU", "CUNTU", "SEMENIC"],
  "iezer": ["CAMPULUNG MUSCEL", "CURTEA DE ARGES"],
  "cindrel": ["PALTINIS", "SIBIU"],
  "buila": ["VOINEASA", "RAMNICU VALCEA", "POLOVRAGI"],
  "apuseni": ["STANA DE VALE", "VLADEASA 1800", "CAMPENI (BISTRA)", "ROSIA MONTANA"],
  "ciucas_piatra_mare": ["PREDEAL", "BRASOV GHIMBAV", "LACAUTI"],
  "cozia": ["RAMNICU VALCEA", "VOINEASA"],
  "baiului": ["PREDEAL", "SINAIA 1500"],
  "bistritei": ["BISTRITA", "POIANA STAMPEI"],
  "hasmas": ["MIERCUREA CIUC", "JOSENI", "BUCIN"],
  "maramuresului": ["IEZER", "OCNA SUGATAG", "BAIA MARE"],
  "mehedinti_cernei": ["BOZOVICI", "DROBETA TURNU SEVERIN", "BAILE HERCULANE"]
};

/**
 * Obține prognoza meteo de la Meteoblue pentru o dată viitoare
 */
async function getWeatherForecast(lat, lon, altitude, date) {
  try {
    const url = `https://my.meteoblue.com/packages/basic-day?apikey=${METEOBLUE_API_KEY}&lat=${lat}&lon=${lon}&asl=${altitude}&format=json`;
    
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
  
  const targetDateStr = targetDate.toISOString().split('T')[0];
  let dayIndex = dates.findIndex(d => d === targetDateStr);
  
  if (dayIndex === -1) dayIndex = 0;
  
  return {
    temperatura: daily.temperature_mean ? Math.round(daily.temperature_mean[dayIndex]) : null,
    temperatura_min: daily.temperature_min ? Math.round(daily.temperature_min[dayIndex]) : null,
    temperatura_max: daily.temperature_max ? Math.round(daily.temperature_max[dayIndex]) : null,
    vant_max: daily.windspeed_max ? Math.round(daily.windspeed_max[dayIndex]) : null,
    vant_mediu: daily.windspeed_mean ? Math.round(daily.windspeed_mean[dayIndex]) : null,
    precipitatii: daily.precipitation ? Math.round(daily.precipitation[dayIndex] * 10) / 10 : 0,
    probabilitate_precipitatii: daily.precipitation_probability ? daily.precipitation_probability[dayIndex] : 0,
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
  if (temp > 10 || vant < 5) return Math.round(temp);
  
  const windchill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(vant, 0.16) + 0.3965 * temp * Math.pow(vant, 0.16);
  return Math.round(windchill);
}

/**
 * Obține datele curente de zăpadă de la ANM
 */
async function getSnowData(masivId) {
  const statiiPentruMasiv = STATII_ZAPADA[masivId] || [];
  
  // Încearcă mai multe metode de a obține datele
  const urls = [
    ANM_URL_DIRECT,
    ANM_URL_PROXY,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(ANM_URL_DIRECT)
  ];
  
  let data = null;
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        data = await response.json();
        if (data && data.features) {
          break; // Am reușit să obținem datele
        }
      }
    } catch (error) {
      console.log('Încercare eșuată pentru:', url);
      continue;
    }
  }
  
  if (!data || !data.features) {
    return {
      valoare: 0,
      statie: 'Date indisponibile',
      actualizat: '-',
      raw: 'API indisponibil'
    };
  }
  
  // Caută stația cu zăpadă
  for (const numeStatie of statiiPentruMasiv) {
    const statie = data.features.find(f => {
      const numeANM = f.properties.nume.toUpperCase().trim();
      const numeCautat = numeStatie.toUpperCase().trim();
      return numeANM === numeCautat || numeANM.includes(numeCautat) || numeCautat.includes(numeANM);
    });
    
    if (statie && statie.properties.zapada && statie.properties.zapada !== 'indisponibil') {
      const zapada = parseZapada(statie.properties.zapada);
      return {
        valoare: zapada,
        statie: statie.properties.nume,
        actualizat: statie.properties.actualizat.replace(/&nbsp;/g, ' '),
        raw: statie.properties.zapada
      };
    }
  }
  
  // Dacă nu găsim cu zăpadă, returnează prima stație găsită
  for (const numeStatie of statiiPentruMasiv) {
    const statie = data.features.find(f => {
      const numeANM = f.properties.nume.toUpperCase().trim();
      const numeCautat = numeStatie.toUpperCase().trim();
      return numeANM === numeCautat || numeANM.includes(numeCautat) || numeCautat.includes(numeANM);
    });
    
    if (statie) {
      return {
        valoare: 0,
        statie: statie.properties.nume,
        actualizat: statie.properties.actualizat.replace(/&nbsp;/g, ' '),
        raw: statie.properties.zapada || 'fără zăpadă'
      };
    }
  }
  
  return {
    valoare: 0,
    statie: 'Stație negăsită',
    actualizat: '-',
    raw: 'indisponibil'
  };
}

/**
 * Parsează textul zăpezii de la ANM
 */
function parseZapada(text) {
  if (!text || text === 'indisponibil') return 0;
  if (text.includes('discontinuu')) return 1;
  if (text.includes('sub 0.5')) return 0;
  
  const match = text.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return 0;
}

/**
 * Obține datele de risc avalanșă din GitHub (meteo-scraper)
 */
async function getAvalancheRisk(masivId, altitudine) {
  try {
    const response = await fetch(AVALANSA_URL);
    if (!response.ok) {
      throw new Error('Eroare la obținerea datelor de avalanșă');
    }
    
    const data = await response.json();
    const masivKey = AVALANSA_MAPPING[masivId] || masivId;
    
    if (data.date && data.date[masivKey]) {
      const masivData = data.date[masivKey];
      const nivel = altitudine >= 1800 ? masivData.peste_1800 : masivData.sub_1800;
      
      return {
        nivel: nivel.nivel,
        text: nivel.text,
        ultima_actualizare: data.ultima_actualizare,
        zona: altitudine >= 1800 ? 'peste 1800m' : 'sub 1800m'
      };
    }
    
    return { 
      nivel: 0, 
      text: "Necunoscut", 
      ultima_actualizare: null,
      zona: altitudine >= 1800 ? 'peste 1800m' : 'sub 1800m'
    };
  } catch (error) {
    console.error('Eroare avalanșă:', error);
    return { 
      nivel: 0, 
      text: "Necunoscut", 
      ultima_actualizare: null,
      zona: altitudine >= 1800 ? 'peste 1800m' : 'sub 1800m'
    };
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
  
  const pestePrag = altitudine >= masiv.altitudine_prag;
  
  const lat = pestePrag ? (statii.lat_high || statii.lat) : statii.lat;
  const lon = pestePrag ? (statii.lon_high || statii.lon) : statii.lon;
  
  const [weather, snow, avalanche] = await Promise.all([
    getWeatherForecast(lat, lon, altitudine, date),
    getSnowData(masivId),
    masiv.avalanse ? getAvalancheRisk(masivId, altitudine) : Promise.resolve({ nivel: 0, text: "N/A", zona: "" })
  ]);
  
  weather.windchill = calculeazaWindchill(weather.temperatura, weather.vant_max);
  
  return {
    masiv,
    weather,
    snow,
    avalanche,
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