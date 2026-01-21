// Risk Assessment - Evaluarea condițiilor pentru drumeție

/**
 * Evaluează un singur factor meteo
 * Returnează: { status: 'verde'|'galben'|'rosu'|'blocant', mesaj: string }
 */
function evalueazaFactor(nume, valoare, praguri) {
  const p = praguri;
  
  switch(nume) {
    case 'windchill':
      if (valoare >= p.verde) return { status: 'verde', mesaj: `Temperatură resimțită acceptabilă (${valoare}°C)` };
      if (valoare >= p.galben) return { status: 'galben', mesaj: `Frig moderat - echipament termic necesar (${valoare}°C)` };
      if (valoare >= p.rosu) return { status: 'rosu', mesaj: `Frig sever - risc de hipotermie (${valoare}°C)` };
      return { status: 'blocant', mesaj: `Frig extrem - pericol de viață (${valoare}°C)` };
    
    case 'vant':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Vânt ușor (${valoare} km/h)` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Vânt moderat - atenție pe creste (${valoare} km/h)` };
      if (valoare <= p.rosu) return { status: 'rosu', mesaj: `Vânt puternic - evitați zonele expuse (${valoare} km/h)` };
      return { status: 'blocant', mesaj: `Vânt extrem - imposibil de mers (${valoare} km/h)` };
    
    case 'precipitatii':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Precipitații minime (${valoare} mm)` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Precipitații moderate (${valoare} mm)` };
      return { status: 'rosu', mesaj: `Precipitații abundente (${valoare} mm)` };
    
    case 'risc_avalansa':
      if (valoare <= p.verde) return { status: 'verde', mesaj: `Risc scăzut de avalanșă (${valoare}/5)` };
      if (valoare <= p.galben) return { status: 'galben', mesaj: `Risc moderat de avalanșă (${valoare}/5)` };
      if (valoare <= p.rosu) return { status: 'rosu', mesaj: `Risc însemnat de avalanșă (${valoare}/5) - evitați pantele >30°` };
      return { status: 'blocant', mesaj: `Risc foarte mare de avalanșă (${valoare}/5) - NU URCAȚI!` };
    
    case 'zapada':
      if (valoare < 10) return { status: 'verde', mesaj: `Fără zăpadă sau zăpadă minimă` };
      if (valoare <= 50) return { status: 'galben', mesaj: `Strat zăpadă ${valoare}cm - crampoane recomandate` };
      return { status: 'rosu', mesaj: `Strat zăpadă ${valoare}cm - crampoane + ceapcan obligatorii` };
      
    default:
      return { status: 'verde', mesaj: 'OK' };
  }
}

/**
 * Evaluează toate condițiile și returnează verdictul final
 */
function evalueazaConditii(data) {
  const { masiv, weather, avalanche, pestePrag, altitudine } = data;
  const sezon = getSezon(new Date(weather.data), weather.zapada);
  
  // Evaluează fiecare factor
  const factori = [];
  
  // 1. Windchill
  const windchillEval = evalueazaFactor('windchill', weather.windchill, PRAGURI.windchill);
  factori.push({
    nume: 'Temperatură resimțită',
    icon: '🌡️',
    valoare: `${weather.windchill}°C`,
    ...windchillEval
  });
  
  // 2. Vânt
  const vantEval = evalueazaFactor('vant', weather.vant_max, PRAGURI.vant);
  factori.push({
    nume: 'Vânt maxim',
    icon: '💨',
    valoare: `${weather.vant_max} km/h`,
    ...vantEval
  });
  
  // 3. Precipitații
  const precipEval = evalueazaFactor('precipitatii', weather.precipitatii, PRAGURI.precipitatii);
  factori.push({
    nume: 'Precipitații',
    icon: weather.zapada > 0 ? '🌨️' : '🌧️',
    valoare: `${weather.precipitatii} mm`,
    ...precipEval
  });
  
  // 4. Risc avalanșă (doar dacă masivul are risc și e iarnă)
  if (masiv.avalanse && (sezon === 'iarna' || weather.zapada > 10)) {
    const avalansaEval = evalueazaFactor('risc_avalansa', avalanche.nivel, PRAGURI.risc_avalansa);
    factori.push({
      nume: 'Risc avalanșă',
      icon: '⛰️',
      valoare: `${avalanche.nivel}/5 - ${avalanche.text}`,
      ...avalansaEval
    });
  }
  
  // 5. Zăpadă
  if (weather.zapada > 0 || sezon === 'iarna') {
    const zapadaEval = evalueazaFactor('zapada', weather.zapada, {});
    factori.push({
      nume: 'Strat zăpadă',
      icon: '❄️',
      valoare: `~${Math.round(weather.zapada)} cm`,
      ...zapadaEval
    });
  }
  
  // Determină statusul meteo general
  let meteoStatus = 'verde';
  let areBlocant = false;
  
  for (const factor of factori) {
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
    factori,
    meteoStatus,
    areBlocant,
    sezon,
    pestePrag
  };
}

/**
 * Calculează verdictul final bazat pe matrice
 */
function calculeazaVerdict(nivel, sezon, dificultate, meteoStatus) {
  // Asigură-te că dificultatea e între 1-5
  const dif = Math.min(5, Math.max(1, dificultate));
  
  // Obține verdictul din matrice
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
  
  // Elimină duplicate
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
  // Obține toate datele
  const weatherData = await getAllWeatherData(masivId, altitudine, data);
  
  // Evaluează condițiile
  const evaluare = evalueazaConditii(weatherData);
  
  // Determină dificultatea traseului
  const masiv = weatherData.masiv;
  const dificultate = evaluare.pestePrag 
    ? (evaluare.sezon === 'iarna' ? masiv.dificultate_iarna_peste_prag : masiv.dificultate_vara_peste_prag)
    : masiv.dificultate_vara_sub_prag;
  
  // Calculează verdictul final
  const verdict = calculeazaVerdict(nivel, evaluare.sezon, dificultate, evaluare.meteoStatus);
  
  // Generează echipament recomandat
  const echipament = getEchipamentRecomandat(evaluare.sezon, weatherData.weather.zapada, verdict);
  
  // Obține contact Salvamont
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
    avalanche: weatherData.avalanche,
    factori: evaluare.factori,
    echipament,
    salvamont,
    areBlocant: evaluare.areBlocant
  };
}
