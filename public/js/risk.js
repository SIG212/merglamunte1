// Risk Assessment - Evaluarea condițiilor pentru drumeție

/**
 * Evaluează un singur factor meteo
 */
function evalueazaFactor(nume, valoare, praguri) {
  const p = praguri;
  
  switch(nume) {
    case 'windchill':
      if (valoare >= p.verde) return { status: 'verde', mesaj: `Temperatură resimțită acceptabilă` };
      if (valoare >= p.galben) return { status: 'galben', mesaj: `Frig moderat - echipament termic necesar` };
      if (valoare >= p.rosu) return { status: 'rosu', mesaj: `Frig sever - risc de hipotermie` };
      return { status: 'blocant', mesaj: `Frig extrem - pericol de viață` };
    
    case 'vant':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Vânt ușor` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Vânt moderat - atenție pe creste` };
      if (valoare <= p.rosu) return { status: 'rosu', mesaj: `Vânt puternic - evitați zonele expuse` };
      return { status: 'blocant', mesaj: `Vânt extrem - imposibil de mers` };
    
    case 'precipitatii':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Precipitații minime` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Precipitații moderate` };
      return { status: 'rosu', mesaj: `Precipitații abundente` };
    
    case 'risc_avalansa':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Risc scăzut de avalanșă` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Risc moderat de avalanșă` };
      if (valoare <= p.rosu) return { status: 'rosu', mesaj: `Risc însemnat - evitați pantele >30°` };
      return { status: 'blocant', mesaj: `Risc foarte mare - NU URCAȚI!` };
    
    case 'zapada':
      if (valoare < 10) return { status: 'verde', mesaj: `Fără zăpadă sau zăpadă minimă` };
      if (valoare <= 50) return { status: 'galben', mesaj: `Crampoane recomandate` };
      return { status: 'rosu', mesaj: `Crampoane + ceapcan obligatorii` };
      
    default:
      return { status: 'verde', mesaj: 'OK' };
  }
}

/**
 * Evaluează toate condițiile și returnează verdictul final
 */
function evalueazaConditii(data) {
  const { masiv, weather, snow, avalanche, pestePrag, altitudine } = data;
  const sezon = getSezon(new Date(weather.data), snow.valoare);
  
  // Factori pentru PROGNOZĂ (data selectată)
  const factoriPrognoza = [];
  
  // 1. Windchill
  const windchillEval = evalueazaFactor('windchill', weather.windchill, PRAGURI.windchill);
  factoriPrognoza.push({
    nume: 'Temperatură resimțită',
    icon: '🌡️',
    valoare: `${weather.windchill}°C`,
    ...windchillEval
  });
  
  // 2. Vânt
  const vantEval = evalueazaFactor('vant', weather.vant_max, PRAGURI.vant);
  factoriPrognoza.push({
    nume: 'Vânt maxim',
    icon: '💨',
    valoare: `${weather.vant_max} km/h`,
    ...vantEval
  });
  
  // 3. Precipitații
  const precipEval = evalueazaFactor('precipitatii', weather.precipitatii, PRAGURI.precipitatii);
  factoriPrognoza.push({
    nume: 'Precipitații',
    icon: sezon === 'iarna' ? '🌨️' : '🌧️',
    valoare: `${weather.precipitatii} mm`,
    ...precipEval
  });
  
  // Factori pentru PREZENT (condiții curente)
  const factoriPrezent = [];
  
  // 4. Zăpadă curentă (de la ANM)
  if (snow.valoare > 0 || sezon === 'iarna') {
    const zapadaEval = evalueazaFactor('zapada', snow.valoare, {});
    factoriPrezent.push({
      nume: 'Strat zăpadă',
      icon: '❄️',
      valoare: snow.raw !== 'indisponibil' ? snow.raw : `${snow.valoare} cm`,
      sursa: `Stația ${snow.statie}`,
      actualizat: snow.actualizat,
      ...zapadaEval
    });
  }
  
  // 5. Risc avalanșă (de la meteo-scraper)
  if (masiv.avalanse && (sezon === 'iarna' || snow.valoare > 10)) {
    const avalansaEval = evalueazaFactor('risc_avalansa', avalanche.nivel, PRAGURI.risc_avalansa);
    factoriPrezent.push({
      nume: 'Risc avalanșă',
      icon: '⛰️',
      valoare: `${avalanche.nivel}/5 - ${avalanche.text}`,
      sursa: `Zona: ${avalanche.zona}`,
      actualizat: avalanche.ultima_actualizare ? formatDateTime(avalanche.ultima_actualizare) : 'Necunoscut',
      ...avalansaEval
    });
  }
  
  // Determină statusul meteo general (combinând toți factorii)
  const totiFactorii = [...factoriPrognoza, ...factoriPrezent];
  let meteoStatus = 'verde';
  let areBlocant = false;
  
  for (const factor of totiFactorii) {
    if (factor.status === 'blocant') {
      areBlocant = true;
      meteoStatus = 'blocant';
      break;
    }
    if (factor.status === 'rosu' && meteoStatus !== 'blocant') {
      meteoStatus = 'rosu';
    }
    if (factor.status === 'galben' && meteoStatus === 'verde') {
      meteoStatus = 'galben';
    }
  }
  
  return {
    factoriPrognoza,
    factoriPrezent,
    meteoStatus,
    areBlocant,
    sezon,
    pestePrag
  };
}

/**
 * Formatează data/ora pentru afișare
 */
function formatDateTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Calculează verdictul final bazat pe matrice
 */
function calculeazaVerdict(nivel, sezon, dificultate, meteoStatus) {
  const dif = Math.min(5, Math.max(1, dificultate));
  
  const matriceNivel = MATRICE_RISC[nivel];
  if (!matriceNivel) return 'galben';
  
  const matriceSezon = matriceNivel[sezon];
  if (!matriceSezon) return 'galben';
  
  const matriceDif = matriceSezon[dif];
  if (!matriceDif) return 'galben';
  
  return matriceDif[meteoStatus] || 'galben';
}

/**
 * Generează lista de echipament recomandat
 */
function getEchipamentRecomandat(sezon, zapada, verdict) {
  let echipament = [...ECHIPAMENT.baza];
  
  if (sezon === 'iarna') {
    echipament = [...echipament, ...ECHIPAMENT.iarna];
  } else if (zapada > 10) {
    echipament = [...echipament, ...ECHIPAMENT.zapada];
  }
  
  if (verdict === 'galben' || verdict === 'rosu') {
    echipament = [...echipament, ...ECHIPAMENT.vreme_rea];
  }
  
  const seen = new Set();
  return echipament.filter(item => {
    if (seen.has(item.text)) return false;
    seen.add(item.text);
    return true;
  });
}

/**
 * Obține contactul Salvamont pentru masiv
 */
function getSalvamont(masivId) {
  return SALVAMONT.zone[masivId] || SALVAMONT.national;
}

/**
 * Funcția principală de evaluare
 */
async function evalueazaDrumetie(masivId, altitudine, data, nivel) {
  const weatherData = await getAllWeatherData(masivId, altitudine, data);
  
  const evaluare = evalueazaConditii(weatherData);
  
  const masiv = weatherData.masiv;
  const dificultate = evaluare.pestePrag 
    ? (evaluare.sezon === 'iarna' ? masiv.dificultate_iarna_peste_prag : masiv.dificultate_vara_peste_prag)
    : masiv.dificultate_vara_sub_prag;
  
  const verdict = calculeazaVerdict(nivel, evaluare.sezon, dificultate, evaluare.meteoStatus);
  
  const echipament = getEchipamentRecomandat(evaluare.sezon, weatherData.snow.valoare, verdict);
  
  const salvamont = getSalvamont(masivId);
  
  return {
    verdict,
    mesaj: MESAJE[verdict],
    masiv,
    altitudine,
    data: data.toISOString().split('T')[0],
    nivel,
    sezon: evaluare.sezon,
    dificultate,
    pestePrag: evaluare.pestePrag,
    weather: weatherData.weather,
    snow: weatherData.snow,
    avalanche: weatherData.avalanche,
    factoriPrognoza: evaluare.factoriPrognoza,
    factoriPrezent: evaluare.factoriPrezent,
    echipament,
    salvamont,
    areBlocant: evaluare.areBlocant
  };
}