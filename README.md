# 🏔️ MergLaMunte.ro

**Verifică dacă e sigur să mergi la munte** - Sistem de evaluare automată a condițiilor pentru drumeții montane în România.

![MergLaMunte Preview](https://img.shields.io/badge/Status-Active-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Ce Problemă Rezolvă

Turiștii români care vor să meargă la munte se confruntă cu:
- **Informații meteo fragmentate** - date generale, neadaptate pentru altitudine
- **Lipsa expertizei** - majoritatea nu știu să evalueze dacă condițiile sunt sigure  
- **Risc crescut de accidente** - Salvamont intervine în sute de cazuri/an
- **Incertitudine** - "E sigur să merg mâine în Făgăraș?" → răspuns greu de găsit

## ✅ Soluția

Un sistem care îți spune direct:

| Verdict | Semnificație |
|---------|--------------|
| 🟢 **MERGI** | Condiții favorabile |
| 🟡 **AI GRIJĂ** | Condiții dificile, necesită experiență |
| 🔴 **NU MERGE** | Condiții periculoase, amână drumeția |

## 📊 Cum Funcționează

1. **Selectezi**: masivul, data, nivelul de experiență, altitudinea țintă
2. **Sistemul evaluează** 12 factori:
   - Temperatură și windchill
   - Viteză vânt
   - Precipitații
   - Risc avalanșă (buletin nivologic ANM)
   - Strat zăpadă
   - Dificultate traseu
3. **Primești verdictul** + echipament recomandat + contact Salvamont

## 🗺️ Masive Suportate

- Bucegi, Făgăraș, Retezat, Piatra Craiului
- Rodnei, Ceahlău, Călimani, Hășmaș
- Parâng, Șureanu, Țarcu, Godeanu
- Ciucaș, Piatra Mare, Cozia, Iezer
- Apuseni, Cindrel, Baiului, și altele

## 🛠️ Tehnologii

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API Meteo**: [Meteoblue](https://www.meteoblue.com/) 
- **Date Avalanșă**: [Buletin Nivologic ANM](https://www.meteoromania.ro)
- **Hosting**: GitHub Pages

## 🚀 Instalare Locală

```bash
# Clonează repo-ul
git clone https://github.com/SIG212/merglamunte.git
cd merglamunte

# Instalează dependențele
npm install

# Pornește serverul local
npm start
# Deschide http://localhost:3000
```

## 📁 Structură Proiect

```
merglamunte/
├── public/
│   ├── index.html          # Pagina principală
│   ├── css/
│   │   └── style.css       # Stiluri
│   └── js/
│       ├── data.js         # Date masive, stații, matrici
│       ├── weather.js      # API Meteoblue + avalanșă
│       ├── risk.js         # Logica de evaluare risc
│       └── app.js          # Aplicația principală
├── data/
│   ├── masive.json         # Date masive montane
│   ├── statii_meteo.json   # Mapare stații meteo
│   ├── matrice_risc.json   # Matrice decizie
│   └── config.json         # Configurare praguri
├── scripts/
│   └── update-avalanche.js # Script actualizare date
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions
└── README.md
```

## 🔧 Configurare API

### Meteoblue
```javascript
// În public/js/weather.js
const METEOBLUE_API_KEY = 'your-api-key';
```

### Buletin Nivologic
Datele sunt preluate automat din repo-ul [meteo-scraper](https://github.com/SIG212/meteo-scraper).

## ⚠️ Disclaimer

Acest instrument oferă o **evaluare orientativă**. 
- Verifică întotdeauna mai multe surse
- Consultă buletinul nivologic oficial
- Ia decizii responsabile
- În caz de urgență: **0SALVAMONT (0725-826668)**

## 📄 Licență

MIT License - vezi [LICENSE](LICENSE)

## 🤝 Contribuții

Pull requests sunt binevenite! Pentru modificări majore, deschide mai întâi un issue.

---

**Made with ❤️ for Romanian mountain lovers**
