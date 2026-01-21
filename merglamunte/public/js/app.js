// App - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
  initForm();
});

/**
 * Inițializează formularul
 */
function initForm() {
  const form = document.getElementById('mountainForm');
  const masivSelect = document.getElementById('masiv');
  const dataInput = document.getElementById('data');
  const altitudineSlider = document.getElementById('altitudine');
  const altitudineValue = document.getElementById('altitudine-value');
  const pragIndicator = document.getElementById('prag-indicator');
  const maxAlt = document.getElementById('max-alt');
  
  // Populează dropdown-ul cu masive
  MASIVE.forEach(masiv => {
    const option = document.createElement('option');
    option.value = masiv.id;
    option.textContent = `${masiv.nume} (max ${masiv.altitudine_maxima}m)`;
    masivSelect.appendChild(option);
  });
  
  // Setează data minimă (azi) și maximă (14 zile)
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);
  
  dataInput.min = today.toISOString().split('T')[0];
  dataInput.max = maxDate.toISOString().split('T')[0];
  dataInput.value = today.toISOString().split('T')[0];
  
  // Event: schimbare masiv -> actualizează slider
  masivSelect.addEventListener('change', function() {
    const masiv = MASIVE.find(m => m.id === this.value);
    if (masiv) {
      altitudineSlider.max = masiv.altitudine_maxima;
      altitudineSlider.value = Math.min(altitudineSlider.value, masiv.altitudine_maxima);
      maxAlt.textContent = `${masiv.altitudine_maxima}m`;
      pragIndicator.textContent = `Prag: ${masiv.altitudine_prag}m`;
      updateAltitudineDisplay();
    }
  });
  
  // Event: schimbare slider altitudine
  altitudineSlider.addEventListener('input', updateAltitudineDisplay);
  
  function updateAltitudineDisplay() {
    const val = altitudineSlider.value;
    altitudineValue.textContent = val;
    
    const masiv = MASIVE.find(m => m.id === masivSelect.value);
    if (masiv) {
      if (parseInt(val) >= masiv.altitudine_prag) {
        altitudineValue.style.color = '#f59e0b';
        altitudineValue.textContent = `${val} (peste prag)`;
      } else {
        altitudineValue.style.color = '#22c55e';
        altitudineValue.textContent = `${val} (sub prag)`;
      }
    }
  }
  
  // Event: submit form
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    await handleSubmit();
  });
}

/**
 * Procesează submit-ul formularului
 */
async function handleSubmit() {
  const masivId = document.getElementById('masiv').value;
  const dataStr = document.getElementById('data').value;
  const nivel = document.getElementById('nivel').value;
  const altitudine = parseInt(document.getElementById('altitudine').value);
  
  // Validare
  if (!masivId || !dataStr || !nivel) {
    alert('Te rog completează toate câmpurile!');
    return;
  }
  
  // Ascunde rezultatele anterioare și afișează loading
  document.getElementById('results').classList.add('hidden');
  document.getElementById('loading').classList.remove('hidden');
  
  try {
    const data = new Date(dataStr);
    const rezultat = await evalueazaDrumetie(masivId, altitudine, data, nivel);
    afiseazaRezultate(rezultat);
  } catch (error) {
    console.error('Eroare:', error);
    alert('A apărut o eroare. Te rog încearcă din nou.');
  } finally {
    document.getElementById('loading').classList.add('hidden');
  }
}

/**
 * Afișează rezultatele evaluării
 */
function afiseazaRezultate(rezultat) {
  const container = document.getElementById('results');
  const nivelText = { incepator: 'Începător', mediu: 'Mediu', experimentat: 'Experimentat' };
  
  container.innerHTML = `
    <!-- Verdict Card -->
    <div class="verdict-card ${rezultat.verdict}">
      <div class="verdict-icon">${rezultat.mesaj.icon}</div>
      <div class="verdict-title">${rezultat.mesaj.titlu}</div>
      <div class="verdict-subtitle">${rezultat.mesaj.subtitlu}</div>
      <div class="verdict-meta">
        <span>📍 ${rezultat.masiv.nume}</span>
        <span>📅 ${formatDate(rezultat.data)}</span>
        <span>🎿 ${nivelText[rezultat.nivel]}</span>
        <span>📏 ${rezultat.altitudine}m</span>
      </div>
    </div>
    
    <!-- Weather Card -->
    <div class="info-card">
      <h3>🌤️ Condiții Meteo - ${formatDate(rezultat.data)}</h3>
      <div class="weather-grid">
        <div class="weather-item">
          <div class="value">${rezultat.weather.temperatura}°C</div>
          <div class="label">Temperatură</div>
        </div>
        <div class="weather-item">
          <div class="value">${rezultat.weather.windchill}°C</div>
          <div class="label">Resimțită</div>
        </div>
        <div class="weather-item">
          <div class="value">${rezultat.weather.vant_max} km/h</div>
          <div class="label">Vânt maxim</div>
        </div>
        <div class="weather-item">
          <div class="value">${rezultat.weather.precipitatii} mm</div>
          <div class="label">Precipitații</div>
        </div>
      </div>
      <p style="margin-top: 12px; color: #6b7280; font-size: 0.9rem;">
        🌈 ${descrieVreme(rezultat.weather.cod_vreme)} | 
        Sezon: ${rezultat.sezon === 'iarna' ? '❄️ Iarnă' : '☀️ Vară'} |
        Dificultate traseu: ${rezultat.dificultate}/5
      </p>
      ${rezultat.weather.isMock ? '<p style="color: #f59e0b; font-size: 0.8rem;">⚠️ Date simulate - API indisponibil</p>' : ''}
    </div>
    
    <!-- Factors Card -->
    <div class="info-card">
      <h3>📊 Factori Evaluați</h3>
      <div class="factors-list">
        ${rezultat.factori.map(f => `
          <div class="factor-item ${f.status}">
            <span class="factor-status">${getStatusIcon(f.status)}</span>
            <div class="factor-info">
              <div class="factor-name">${f.icon} ${f.nume}: ${f.valoare}</div>
              <div class="factor-detail">${f.mesaj}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Equipment Card -->
    <div class="info-card">
      <h3>🎒 Echipament Recomandat</h3>
      <div class="equipment-grid">
        ${rezultat.echipament.map(e => `
          <div class="equipment-item">
            <span>${e.icon}</span>
            <span>${e.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Emergency Card -->
    <div class="info-card">
      <h3>📞 Contact Urgență</h3>
      <div class="emergency-box">
        <div>🚨 ${rezultat.salvamont.nume}</div>
        <div class="phone">${rezultat.salvamont.telefon}</div>
        <a href="tel:${rezultat.salvamont.telefon.replace(/-/g, '')}" class="btn-call">
          📱 Apelează
        </a>
      </div>
      <p style="margin-top: 12px; text-align: center; color: #6b7280; font-size: 0.85rem;">
        Dispecerat Național: 0SALVAMONT (0725-826668)
      </p>
    </div>
    
    ${rezultat.verdict !== 'verde' ? `
    <!-- Recommendations Card -->
    <div class="info-card">
      <h3>💡 Recomandări</h3>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
        ${getRecomandari(rezultat).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;
  
  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Formatează data pentru afișare
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('ro-RO', options);
}

/**
 * Returnează iconul pentru status
 */
function getStatusIcon(status) {
  const icons = {
    verde: '✅',
    galben: '⚠️',
    rosu: '❌',
    blocant: '🚫'
  };
  return icons[status] || '❓';
}

/**
 * Generează recomandări în funcție de rezultat
 */
function getRecomandari(rezultat) {
  const recomandari = [];
  
  if (rezultat.verdict === 'rosu') {
    recomandari.push('⛔ Amână drumeția pentru o zi cu condiții mai bune');
    recomandari.push('🗺️ Caută trasee alternative la altitudine mai joasă');
  }
  
  if (rezultat.sezon === 'iarna') {
    recomandari.push('❄️ Echipament tehnic de iarnă obligatoriu (crampoane, ceapcan)');
    recomandari.push('🕐 Pornește devreme pentru a coborî înainte de întunerec');
  }
  
  rezultat.factori.forEach(f => {
    if (f.status === 'galben' || f.status === 'rosu') {
      if (f.nume.includes('Vânt')) {
        recomandari.push('🏔️ Evită crestele expuse și zonele de vânt');
      }
      if (f.nume.includes('avalanș')) {
        recomandari.push('⛰️ Evită pantele abrupte peste 30° și zonele cu cornise');
        recomandari.push('📻 Consultă buletinul nivologic actualizat');
      }
      if (f.nume.includes('Precipitații')) {
        recomandari.push('🌧️ Pregătește echipament impermeabil și haine de schimb');
      }
    }
  });
  
  if (rezultat.pestePrag) {
    recomandari.push('📍 Ești peste pragul de siguranță - vigilență sporită!');
  }
  
  // Adaugă recomandări generale
  recomandari.push('📱 Informează pe cineva despre traseu și ora estimată de întoarcere');
  recomandari.push('🔋 Asigură-te că ai telefonul încărcat complet');
  
  return [...new Set(recomandari)].slice(0, 6); // Max 6 recomandări unice
}
