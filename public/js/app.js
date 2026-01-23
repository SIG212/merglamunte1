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
  
  // Populează dropdown-ul cu masive (grupate)
  const grupuri = {
    'populare': { label: '⭐ Cele mai căutate', ids: ['bucegi', 'fagaras', 'retezat', 'piatra_craiului'] },
    'meridionali': { label: '🏔️ Carpații Meridionali', ids: ['baiului', 'buila', 'cindrel', 'ciucas_piatra_mare', 'cozia', 'tarcu_godeanu', 'iezer', 'parang_sureanu'] },
    'orientali': { label: '🌲 Carpații Orientali', ids: ['bistritei', 'calimani', 'ceahlau', 'hasmas', 'maramuresului', 'rodnei'] },
    'occidentali': { label: '🌄 Carpații Occidentali', ids: ['apuseni', 'mehedinti_cernei'] }
  };
  
  Object.values(grupuri).forEach(grup => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = grup.label;
    
    grup.ids.forEach(id => {
      const masiv = MASIVE.find(m => m.id === id);
      if (masiv) {
        const option = document.createElement('option');
        option.value = masiv.id;
        option.textContent = `${masiv.nume} (max ${masiv.altitudine_maxima}m)`;
        optgroup.appendChild(option);
      }
    });
    
    masivSelect.appendChild(optgroup);
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
    
    const masiv = MASIVE.find(m => m.id === masivSelect.value);
    if (masiv) {
      if (parseInt(val) >= masiv.altitudine_prag) {
        altitudineValue.style.color = '#f59e0b';
        altitudineValue.textContent = `${val}m (peste prag)`;
      } else {
        altitudineValue.style.color = '#22c55e';
        altitudineValue.textContent = `${val}m (sub prag)`;
      }
    } else {
      altitudineValue.style.color = '#3b82f6';
      altitudineValue.textContent = `${val}m`;
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
  
  if (!masivId || !dataStr || !nivel) {
    alert('Te rog completează toate câmpurile!');
    return;
  }
  
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
 * Sortează factorii de la cel mai grav la cel mai ok
 */
function sorteazaFactori(factori) {
  const prioritate = { blocant: 0, rosu: 1, galben: 2, verde: 3 };
  return [...factori].sort((a, b) => prioritate[a.status] - prioritate[b.status]);
}

/**
 * Obține clasa CSS pentru badge
 */
function getBadgeClass(status) {
  const classes = {
    verde: 'ok',
    galben: 'atentie',
    rosu: 'pericol',
    blocant: 'critic'
  };
  return classes[status] || 'ok';
}

/**
 * Obține textul pentru badge
 */
function getBadgeText(status) {
  const texts = {
    verde: 'OK',
    galben: 'ATENȚIE',
    rosu: 'PERICOL',
    blocant: 'CRITIC'
  };
  return texts[status] || 'OK';
}

/**
 * Afișează rezultatele evaluării
 */
function afiseazaRezultate(rezultat) {
  const container = document.getElementById('results');
  const nivelText = { incepator: 'Începător', mediu: 'Mediu', experimentat: 'Experimentat' };
  
  // Sortează factorii în fiecare categorie
  const factoriPrognozaSortati = sorteazaFactori(rezultat.factoriPrognoza);
  const factoriPrezentSortati = sorteazaFactori(rezultat.factoriPrezent);
  
  // Numără factorii OK
  const factoriPrognozaOk = factoriPrognozaSortati.filter(f => f.status === 'verde');
  const factoriPrognozaCritici = factoriPrognozaSortati.filter(f => f.status !== 'verde');
  const factoriPrezentOk = factoriPrezentSortati.filter(f => f.status === 'verde');
  const factoriPrezentCritici = factoriPrezentSortati.filter(f => f.status !== 'verde');
  
  // Determină badge-urile pentru verdict
  const verdictBadges = [];
  verdictBadges.push({ text: nivelText[rezultat.nivel], class: 'badge-neutral', icon: '👤' });
  
  if (rezultat.verdict === 'verde') {
    verdictBadges.push({ text: 'Condiții meteo bune', class: 'badge-success', icon: '🌤️' });
  } else if (rezultat.verdict === 'galben') {
    verdictBadges.push({ text: 'Atenție la condiții', class: 'badge-warning', icon: '⚠️' });
  } else {
    verdictBadges.push({ text: 'Condiții nefavorabile', class: 'badge-danger', icon: '⛔' });
  }
  
  verdictBadges.push({ 
    text: `Traseu în ${rezultat.masiv.nume} la ${rezultat.altitudine}m`, 
    class: 'badge-info', 
    icon: '🥾' 
  });
  
  // Generează HTML pentru verdict
  const verdictIcon = rezultat.verdict === 'verde' ? '✓' : (rezultat.verdict === 'galben' ? '!' : '✕');
  const verdictTitle = rezultat.verdict === 'verde' ? 'Condiții bune' : (rezultat.verdict === 'galben' ? 'Atenție' : 'Nu se recomandă');
  const verdictSubtitle = MESAJE[rezultat.verdict].descriere;
  
  container.innerHTML = `
    <!-- ═══════════════ VERDICT CARD ═══════════════ -->
    <div class="verdict-card ${rezultat.verdict}">
      <div class="verdict-icon-circle">${verdictIcon}</div>
      <div class="verdict-title">${verdictTitle}</div>
      <div class="verdict-subtitle">${verdictSubtitle}</div>
      <div class="verdict-badges">
        ${verdictBadges.map(b => `
          <span class="badge ${b.class}">${b.icon} ${b.text}</span>
        `).join('')}
      </div>
    </div>
    
    <!-- ═══════════════ EVALUARE FACTORI ═══════════════ -->
    <div class="info-card">
      <h3>📊 Evaluare Factori</h3>
      
      <!-- SECȚIUNEA 1: Prognoză pentru data selectată -->
      <div class="section-container">
        <div class="section-header">
          <span class="section-icon">🔮</span>
          <span class="section-title">Prognoza pentru ${formatDateShort(rezultat.data)}</span>
        </div>
        <p class="section-subtitle">Date de la Meteoblue pentru ${rezultat.masiv.nume} la ${rezultat.altitudine}m</p>
        
        <div class="factors-list">
          ${factoriPrognozaCritici.map(f => renderFactorCard(f)).join('')}
          
          ${factoriPrognozaOk.length > 0 ? `
            <button class="expand-btn" onclick="toggleFactors(this, 'prognoza-ok')">
              Vezi factorii OK (${factoriPrognozaOk.length})
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="factors-hidden" id="prognoza-ok">
              ${factoriPrognozaOk.map(f => renderFactorCard(f)).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      
      ${factoriPrezentSortati.length > 0 ? `
      <!-- SECȚIUNEA 2: Factori din prezent -->
      <div class="section-container" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
        <div class="section-header">
          <span class="section-icon">📡</span>
          <span class="section-title">Factori din prezent care pot influența drumeția</span>
        </div>
        <p class="section-subtitle">Date în timp real de la stațiile ANM și buletinul nivologic</p>
        
        <div class="factors-list">
          ${factoriPrezentCritici.map(f => renderFactorCard(f)).join('')}
          
          ${factoriPrezentOk.length > 0 ? `
            <button class="expand-btn" onclick="toggleFactors(this, 'prezent-ok')">
              Vezi factorii OK (${factoriPrezentOk.length})
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="factors-hidden" id="prezent-ok">
              ${factoriPrezentOk.map(f => renderFactorCard(f)).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
    </div>
    
    <!-- ═══════════════ ECHIPAMENT ═══════════════ -->
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
    
    <!-- ═══════════════ CONTACT URGENȚĂ ═══════════════ -->
    <div class="info-card">
      <h3>📞 Contact Urgență</h3>
      <div class="emergency-box">
        <div>🚨 ${rezultat.salvamont.nume}</div>
        <div class="phone">${rezultat.salvamont.telefon}</div>
        <a href="tel:${rezultat.salvamont.telefon.replace(/-/g, '')}" class="btn-call">
          📱 Apelează
        </a>
      </div>
      <p class="emergency-national">
        Dispecerat Național: <strong>0SALVAMONT</strong> (0725-826668)
      </p>
    </div>
    
    ${rezultat.verdict !== 'verde' ? `
    <!-- ═══════════════ RECOMANDĂRI ═══════════════ -->
    <div class="info-card">
      <h3>💡 Recomandări</h3>
      <ul class="recommendations-list">
        ${getRecomandari(rezultat).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;
  
  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Renderează un card pentru factor
 */
function renderFactorCard(factor) {
  const hasSource = factor.sursa || factor.actualizat;
  
  return `
    <div class="factor-card ${factor.status}">
      <div class="factor-header">
        <div class="factor-label">
          <span>${factor.icon}</span>
          <span>${factor.nume}</span>
        </div>
        <span class="factor-badge ${getBadgeClass(factor.status)}">${getBadgeText(factor.status)}</span>
      </div>
      <div class="factor-value">${factor.valoare}</div>
      <div class="factor-description">${factor.mesaj}</div>
      ${hasSource ? `
        <div class="factor-details">
          <div class="factor-source">
            ${factor.sursa ? `<span>📍 ${factor.sursa}</span>` : ''}
            ${factor.actualizat ? `<span>🕐 ${factor.actualizat}</span>` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Toggle pentru factorii OK
 */
function toggleFactors(btn, containerId) {
  const container = document.getElementById(containerId);
  btn.classList.toggle('expanded');
  container.classList.toggle('show');
  
  const isExpanded = container.classList.contains('show');
  const count = container.children.length;
  btn.innerHTML = `
    ${isExpanded ? 'Ascunde factorii OK' : `Vezi factorii OK (${count})`}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  `;
}

/**
 * Formatează data pentru afișare
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('ro-RO', options);
}

/**
 * Formatează data scurt (pentru titluri)
 */
function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('ro-RO', options);
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
    recomandari.push('🕐 Pornește devreme pentru a coborî înainte de întuneric');
  }
  
  const totiFactorii = [...rezultat.factoriPrognoza, ...rezultat.factoriPrezent];
  totiFactorii.forEach(f => {
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
  
  recomandari.push('📱 Informează pe cineva despre traseu și ora estimată de întoarcere');
  recomandari.push('🔋 Asigură-te că ai telefonul încărcat complet');
  
  return [...new Set(recomandari)].slice(0, 6);
}