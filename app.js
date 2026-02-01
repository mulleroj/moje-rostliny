// Pomocné funkce pro zálivku
const STORAGE_KEY = 'plantWateringData';

// Převod frekvence zálivky na dny
function getWateringDays(waterFrequency) {
    const freq = waterFrequency.toLowerCase();
    if (freq.includes('2-3× týdně')) return 3;
    if (freq.includes('2× týdně')) return 4;
    if (freq.includes('1× týdně') || freq.includes('7-10')) return 7;
    if (freq.includes('10-14')) return 12;
    if (freq.includes('2-3 týdn')) return 18;
    if (freq.includes('2-4 týdn')) return 21;
    return 7; // výchozí
}

// Načtení dat o zálivce z localStorage
function loadWateringData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    let data = stored ? JSON.parse(stored) : {};
    
    // Přidat nové rostliny, které ještě nejsou v datech
    let updated = false;
    plants.forEach(plant => {
        if (!data[plant.id]) {
            data[plant.id] = { lastWatered: today };
            updated = true;
        }
    });
    
    if (updated || !stored) {
        saveWateringData(data);
    }
    
    return data;
}

// Uložení dat o zálivce
function saveWateringData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Výpočet dnů do další zálivky
function getDaysUntilWatering(plant, wateringData) {
    const lastWatered = new Date(wateringData[plant.id]?.lastWatered || new Date());
    const intervalDays = getWateringDays(plant.waterFrequency);
    const nextWatering = new Date(lastWatered);
    nextWatering.setDate(nextWatering.getDate() + intervalDays);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextWatering.setHours(0, 0, 0, 0);
    
    const diffTime = nextWatering - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// Zalít rostlinu
function waterPlant(plantId, event) {
    if (event) {
        event.stopPropagation();
    }
    const wateringData = loadWateringData();
    const today = new Date().toISOString().split('T')[0];
    wateringData[plantId] = { lastWatered: today };
    saveWateringData(wateringData);
    
    // Animace
    const card = document.querySelector(`.plant-card[data-id="${plantId}"]`);
    if (card) {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'waterSplash 0.5s ease';
    }
    
    renderPlants(currentFilter);
    updateWateringAlert();
    
    // Zavřít modal pokud je otevřený
    if (modal.classList.contains('active')) {
        openModal(plantId);
    }
}

// Aktualizace upozornění
function updateWateringAlert() {
    const wateringData = loadWateringData();
    const alertSection = document.getElementById('wateringAlert');
    const alertPlantsContainer = document.getElementById('alertPlants');
    
    const plantsNeedingWater = plants.filter(plant => {
        const days = getDaysUntilWatering(plant, wateringData);
        return days <= 0;
    });
    
    if (plantsNeedingWater.length === 0) {
        alertSection.classList.remove('active');
        return;
    }
    
    alertSection.classList.add('active');
    alertPlantsContainer.innerHTML = plantsNeedingWater.map(plant => `
        <div class="alert-plant-chip">
            <img src="${plant.image}" alt="${plant.name}">
            <span>${plant.name}</span>
            <button class="water-btn" onclick="waterPlant(${plant.id}, event)" title="Zalít">💧</button>
        </div>
    `).join('');
}

let currentFilter = 'all';

// Data o rostlinách
const plants = [
    {
        id: 1,
        name: "Posvátka",
        latin: "Tradescantia fluminensis",
        image: "fotky/20260201_135709.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Polostín",
        humidity: "Střední",
        temperature: "18-24°C",
        difficulty: "Snadná",
        catSafe: false,
        catWarning: "Může způsobit podráždění kůže a zažívacího traktu u koček.",
        description: "Posvátka je nenáročná převislá rostlina s krásnými zelenofialovými listy. Rychle roste a snadno se množí řízkováním.",
        care: "Udržujte půdu mírně vlhkou, ale ne přemokřenou. V zimě zaléváme méně. Rostlina ocení pravidelné rosení listů.",
        tips: [
            "Pravidelně zastřihujte pro hustší růst",
            "Snadno se množí odřezky ve vodě",
            "Fialové zbarvení se zintenzivní na světlejším místě",
            "Pozor na přímé polední slunce - může spálit listy"
        ]
    },
    {
        id: 2,
        name: "Plazivka",
        latin: "Callisia repens",
        image: "fotky/20260201_135716.jpg",
        waterLevel: "medium-water",
        waterFrequency: "2× týdně",
        light: "Světlo/Polostín",
        humidity: "Střední",
        temperature: "15-25°C",
        difficulty: "Snadná",
        catSafe: false,
        catWarning: "Mírně toxická, může způsobit podráždění trávicího traktu.",
        description: "Drobnolistá převislá rostlina, která vytváří husté koberce. Perfektní do závěsných košíků nebo jako pokryvná rostlina.",
        care: "Zalévejte pravidelně, ale nechte vrchní vrstvu substrátu proschnout. Miluje vlhkost vzduchu.",
        tips: [
            "Ideální do závěsných nádob",
            "Pravidelně přihnojujte v období růstu",
            "Snáší i sušší vzduch, ale lépe roste při vyšší vlhkosti",
            "Odstřihávejte zaschlé výhony"
        ]
    },
    {
        id: 3,
        name: "Voskovka",
        latin: "Hoya carnosa",
        image: "fotky/20260201_135724.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 10-14 dní",
        light: "Jasné nepřímé",
        humidity: "Střední",
        temperature: "18-26°C",
        difficulty: "Střední",
        catSafe: true,
        catWarning: null,
        description: "Elegantní popínavá rostlina s voskovitými listy a nádhernými voňavými květy. Může kvést opakovaně na stejných stopkách.",
        care: "Nechte substrát zcela proschnout mezi zálivkami. Neodstřihávejte odkvetlé stopky - květy se na nich objeví znovu!",
        tips: [
            "Pro kvetení potřebuje období chladu v zimě",
            "Nikdy neodstraňujte odkvetlé stopky",
            "Popíná se na opoře nebo volně převisá",
            "Přesazujte jen když je to nutné - těsný květináč podporuje kvetení"
        ]
    },
    {
        id: 4,
        name: "Maranta",
        latin: "Maranta leuconeura",
        image: "fotky/20260201_135733.jpg",
        waterLevel: "high-water",
        waterFrequency: "2-3× týdně",
        light: "Polostín",
        humidity: "Vysoká",
        temperature: "18-24°C",
        difficulty: "Střední",
        catSafe: true,
        catWarning: null,
        description: "Modlitební rostlina - pojmenovaná podle večerního sklápění listů. Má nádherné vzorované listy se zelenými pruhy.",
        care: "Vyžaduje stále mírně vlhký substrát a vysokou vzdušnou vlhkost. Citlivá na chlór ve vodě - používejte odstátou vodu.",
        tips: [
            "Používejte pouze odstátou nebo filtrovanou vodu",
            "Pravidelně rosete listy",
            "Vyhněte se přímému slunci",
            "Zvyšte vlhkost mističkou s vodou a kamínky"
        ]
    },
    {
        id: 5,
        name: "Zelenec",
        latin: "Chlorophytum comosum",
        image: "fotky/20260201_135740.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Jasné nepřímé",
        humidity: "Nízká-střední",
        temperature: "12-25°C",
        difficulty: "Velmi snadná",
        catSafe: true,
        catWarning: null,
        description: "Klasická pokojovka s pruhovanými listy. Čistí vzduch a je prakticky nezničitelná. Vytváří odnože na dlouhých výběžcích.",
        care: "Toleruje nepravidelnou zálivku díky hlíznatým kořenům, které ukládají vodu. Ideální pro začátečníky.",
        tips: [
            "Výborně čistí vzduch od formaldehydu",
            "Odnože lze snadno zakořenit",
            "Snese i stín, ale méně roste",
            "Hnědé špičky značí příliš suchý vzduch nebo přehnojení"
        ]
    },
    {
        id: 6,
        name: "Zelenec",
        latin: "Chlorophytum comosum 'Vittatum'",
        image: "fotky/20260201_135745.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Jasné nepřímé",
        humidity: "Nízká-střední",
        temperature: "12-25°C",
        difficulty: "Velmi snadná",
        catSafe: true,
        catWarning: null,
        description: "Varieta zelence s výrazným bílým středovým pruhem. Robustní a odolná rostlina vhodná do každého interiéru.",
        care: "Pravidelná zálivka, ale snese i občasné zaschnutí. V létě zaléváme častěji, v zimě méně.",
        tips: [
            "Více světla = výraznější zbarvení",
            "Masité kořeny ukládají vodu pro období sucha",
            "Dělejte výhony s odnožemi zajímavou převislou dekoraci",
            "Bezpečná pro domácí mazlíčky"
        ]
    },
    {
        id: 7,
        name: "Tchýnin jazyk",
        latin: "Sansevieria trifasciata 'Star'",
        image: "fotky/20260201_135758.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 2-3 týdny",
        light: "Jakékoliv",
        humidity: "Nízká",
        temperature: "15-30°C",
        difficulty: "Velmi snadná",
        catSafe: false,
        catWarning: "Mírně toxická - obsahuje saponiny, které mohou způsobit nevolnost a zvracení.",
        description: "Kompaktní rozeta s tuhými tmavě zelenými listy s atraktivním oranžovým lemováním. Prakticky nezničitelná.",
        care: "Zalévejte střídmě - přelití je hlavní příčina úhynu. V zimě stačí zalít 1× měsíčně.",
        tips: [
            "Nejčastější chyba je přelévání!",
            "Čistí vzduch i v noci (produkuje kyslík)",
            "Snese i tmavé kouty",
            "Při přesazování volte těžší květináč - rostlina je těžká"
        ]
    },
    {
        id: 8,
        name: "Sloupovitý kaktus",
        latin: "Cactaceae (Cereus)",
        image: "fotky/20260201_135818.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 2-4 týdny",
        light: "Plné slunce",
        humidity: "Nízká",
        temperature: "10-35°C",
        difficulty: "Velmi snadná",
        catSafe: true,
        catWarning: null,
        description: "Majestátní sloupovitý kaktus s typickými žebry. Pomalu roste a může dosáhnout značné výšky.",
        care: "Vyžaduje hodně světla a minimální zálivku. V zimě téměř nezalévat. Propustný kaktusový substrát je nutností.",
        tips: [
            "V létě může být venku na přímém slunci",
            "V zimě udržujte v chladu (10-15°C) pro podporu kvetení",
            "Zalévejte jen když je substrát zcela suchý",
            "Pozor na hnilobu kořenů při přelití"
        ]
    },
    {
        id: 9,
        name: "Posvátka",
        latin: "Tradescantia spathacea",
        image: "fotky/20260201_135829.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Jasné nepřímé",
        humidity: "Střední",
        temperature: "18-28°C",
        difficulty: "Snadná",
        catSafe: false,
        catWarning: "Šťáva z listů může dráždit kůži a sliznice koček.",
        description: "Efektní rostlina s mečovitými listy - zelené nahoře, fialové zespodu. Kompaktní růst s růžicovitým uspořádáním.",
        care: "Udržujte půdu mírně vlhkou. Snáší i sušší období. Pravidelně odstraňujte staré listy.",
        tips: [
            "Fialová barva se zintenzivní na světle",
            "Malé bílé květy se objevují mezi listy",
            "Množí se odnožemi",
            "Nerosete listy - voda by mohla zůstat v růžici"
        ]
    },
    {
        id: 10,
        name: "Peperomie",
        latin: "Peperomia obtusifolia",
        image: "fotky/20260201_135839.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 7-10 dní",
        light: "Střední/Jasné nepřímé",
        humidity: "Střední",
        temperature: "18-24°C",
        difficulty: "Snadná",
        catSafe: true,
        catWarning: null,
        description: "Kompaktní rostlina s tlustými lesklými listy. Ukládá vodu v listech, takže snese nepravidelnou zálivku.",
        care: "Nechte substrát mezi zálivkami proschnout. Přelití je častější chybou než nedolití.",
        tips: [
            "Ideální na pracovní stůl nebo poličku",
            "Listy lze použít k množení",
            "Kompaktní růst - nepotřebuje velký květináč",
            "Bezpečná pro domácí mazlíčky"
        ]
    },
    {
        id: 11,
        name: "Sansevieria",
        latin: "Sansevieria cylindrica",
        image: "fotky/20260201_135851.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 2-3 týdny",
        light: "Jakékoliv",
        humidity: "Nízká",
        temperature: "15-30°C",
        difficulty: "Velmi snadná",
        catSafe: false,
        catWarning: "Mírně toxická - obsahuje saponiny způsobující zažívací potíže.",
        description: "Válcovité tuhé listy rostoucí přímo ze země. Extrémně odolná rostlina s moderním vzhledem.",
        care: "Minimální péče. Zalévejte střídmě, v zimě téměř vůbec. Propustný substrát.",
        tips: [
            "Perfektní pro zapomnětlivé pěstitele",
            "Roste pomalu ale vytrvale",
            "Čistí vzduch",
            "Snese i umělé osvětlení"
        ]
    },
    {
        id: 12,
        name: "Korálový kaktus",
        latin: "Rhipsalis cereuscula",
        image: "fotky/20260201_135907.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Jasné nepřímé",
        humidity: "Střední",
        temperature: "15-25°C",
        difficulty: "Snadná",
        catSafe: true,
        catWarning: null,
        description: "Epifytický kaktus s jemnými větvičkami připomínajícími korál. Na rozdíl od pouštních kaktusů potřebuje více vody.",
        care: "Pravidelná zálivka, ale nechte povrch proschnout. Nesnáší přímé slunce ani přemokření.",
        tips: [
            "Původem z deštných pralesů - potřebuje vlhkost",
            "Ideální do závěsného květináče",
            "Na jaře kvete drobnými bílými kvítky",
            "Vyhněte se přímému slunci"
        ]
    },
    {
        id: 13,
        name: "Philodendron",
        latin: "Philodendron hederaceum",
        image: "fotky/20260201_135919.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Střední/Polostín",
        humidity: "Střední-vysoká",
        temperature: "18-28°C",
        difficulty: "Snadná",
        catSafe: false,
        catWarning: "TOXICKÝ! Obsahuje oxalát vápenatý - způsobuje silné pálení a otoky v ústech, slintání, potíže s polykáním.",
        description: "Populární pokojovka se srdčitými listy. Může růst jako převislá nebo s oporou vzhůru.",
        care: "Zalévejte když vrchní vrstva substrátu zaschne. Miluje vlhkost, ale snese i sušší vzduch.",
        tips: [
            "Snadno se množí ve vodě",
            "Vzdušné kořeny mohou zakořenit v substrátu",
            "Pravidelně otírejte listy od prachu",
            "POZOR: Toxický pro kočky a psy!"
        ]
    },
    {
        id: 14,
        name: "Zamiokulkas",
        latin: "Zamioculcas zamiifolia",
        image: "fotky/20260201_135949.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 2-3 týdny",
        light: "Jakékoliv",
        humidity: "Nízká",
        temperature: "15-28°C",
        difficulty: "Velmi snadná",
        catSafe: false,
        catWarning: "TOXICKÝ! Obsahuje oxalát vápenatý - při požití způsobuje bolest, otoky a zažívací potíže.",
        description: "ZZ rostlina - královna pokojovek pro začátečníky. Lesklé tmavozelené listy a extrémní odolnost.",
        care: "Téměř nezničitelná. Zalévejte střídmě, snese i několikatýdenní sucho. Hlízy ukládají vodu.",
        tips: [
            "Perfektní do tmavých prostor",
            "Přelití je jediný způsob jak ji zahubit",
            "Pomalu roste, ale vytrvale",
            "POZOR: Toxický pro kočky a psy!"
        ]
    },
    {
        id: 15,
        name: "Kalanchoe",
        latin: "Kalanchoe blossfeldiana",
        image: "fotky/20260201_143017.jpg",
        waterLevel: "low-water",
        waterFrequency: "1× za 7-10 dní",
        light: "Jasné nepřímé",
        humidity: "Nízká",
        temperature: "15-25°C",
        difficulty: "Snadná",
        catSafe: false,
        catWarning: "TOXICKÁ! Obsahuje glykosidy, které mohou způsobit srdeční problémy, zvracení a průjem.",
        description: "Oblíbená sukulentní rostlina s masitými vroubkovanými listy. Často kvete nádhernými drobnými kvítky různých barev.",
        care: "Zalévejte střídmě, nechte substrát mezi zálivkami zcela proschnout. Vyžaduje dobře propustný substrát.",
        tips: [
            "Pro opětovné kvetení potřebuje 6 týdnů krátkého dne (max 10h světla)",
            "Snadno se množí listy nebo odnožemi",
            "Přelití vede k hnilobě kořenů",
            "POZOR: Toxická pro kočky a psy!"
        ]
    },
    {
        id: 16,
        name: "Pokojový smrček",
        latin: "Picea glauca 'Conica'",
        image: "fotky/20260201_143031.jpg",
        waterLevel: "medium-water",
        waterFrequency: "2× týdně",
        light: "Jasné nepřímé",
        humidity: "Střední-vysoká",
        temperature: "5-18°C",
        difficulty: "Náročná",
        catSafe: true,
        catWarning: null,
        description: "Miniaturní smrček s jemnými jehličkami. Původně venkovní rostlina, v interiéru vyžaduje speciální péči a chladné prostředí.",
        care: "Vyžaduje chlad a vysokou vlhkost vzduchu. Pravidelně rosete. Substrát udržujte stále mírně vlhký, nikdy ne přemokřený.",
        tips: [
            "V zimě ideálně umístěte do chladné místnosti (5-15°C)",
            "Pravidelně rosete - suché topení je jeho nepřítel",
            "Nesnáší přímé slunce ani horko",
            "Po Vánocích lze vysadit ven do zahrady"
        ]
    },
    {
        id: 17,
        name: "Potos",
        latin: "Epipremnum aureum",
        image: "fotky/20260201_143130.jpg",
        waterLevel: "medium-water",
        waterFrequency: "1× týdně",
        light: "Střední/Polostín",
        humidity: "Střední",
        temperature: "18-30°C",
        difficulty: "Velmi snadná",
        catSafe: false,
        catWarning: "TOXICKÝ! Obsahuje oxalát vápenatý - způsobuje pálení a otoky úst, slintání, potíže s polykáním.",
        description: "Jedna z nejoblíbenějších pokojovek. Popínavá nebo převislá rostlina se srdčitými listy s krémově-zelenými skvrnami.",
        care: "Nenáročná rostlina. Zalévejte když vrchní vrstva substrátu zaschne. Snese i zanedbání.",
        tips: [
            "Čistí vzduch od toxinů",
            "Snadno se množí ve vodě",
            "Více světla = výraznější panašování listů",
            "POZOR: Toxický pro kočky a psy!"
        ]
    }
];

// DOM Elements
const plantsGrid = document.getElementById('plantsGrid');
const modal = document.getElementById('plantModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const filterBtns = document.querySelectorAll('.filter-btn');

// Render plant cards
function renderPlants(filter = 'all') {
    currentFilter = filter;
    const wateringData = loadWateringData();
    
    let filteredPlants;
    if (filter === 'all') {
        filteredPlants = plants;
    } else if (filter === 'needs-water') {
        filteredPlants = plants.filter(plant => getDaysUntilWatering(plant, wateringData) <= 0);
    } else if (filter === 'cat-safe') {
        filteredPlants = plants.filter(plant => plant.catSafe === true);
    } else if (filter === 'cat-danger') {
        filteredPlants = plants.filter(plant => plant.catSafe === false);
    } else {
        filteredPlants = plants.filter(plant => plant.waterLevel === filter);
    }
    
    plantsGrid.innerHTML = filteredPlants.map((plant, index) => {
        const daysUntil = getDaysUntilWatering(plant, wateringData);
        const needsWater = daysUntil <= 0;
        const statusClass = needsWater ? 'needs-water' : 'ok';
        const statusText = needsWater 
            ? '🚿 Zalít!' 
            : (daysUntil === 1 ? '💧 Zítra' : `💧 za ${daysUntil} dní`);
        
        const catBadgeClass = plant.catSafe ? 'safe' : (plant.catWarning?.includes('TOXICKÝ') ? 'toxic' : 'danger');
        const catBadgeText = plant.catSafe ? '🐱 OK' : (plant.catWarning?.includes('TOXICKÝ') ? '☠️ Toxická!' : '⚠️ Pozor');
        
        return `
        <article class="plant-card" data-id="${plant.id}" style="animation-delay: ${index * 0.1}s">
            <div class="plant-image-container">
                <img src="${plant.image}" alt="${plant.name}" class="plant-image" loading="lazy">
                <span class="water-status ${statusClass}">${statusText}</span>
                <span class="plant-badge">${plant.difficulty}</span>
                <span class="cat-badge ${catBadgeClass}">${catBadgeText}</span>
                <button class="water-now-btn" onclick="waterPlant(${plant.id}, event)" title="Zalít nyní">💧</button>
            </div>
            <div class="plant-info">
                <h2 class="plant-name">${plant.name}</h2>
                <p class="plant-latin">${plant.latin}</p>
                <div class="plant-quick-info">
                    <span class="quick-item">
                        <span class="icon">💧</span>
                        ${plant.waterFrequency}
                    </span>
                    <span class="quick-item">
                        <span class="icon">☀️</span>
                        ${plant.light}
                    </span>
                </div>
            </div>
        </article>
    `}).join('');
    
    // Add click handlers
    document.querySelectorAll('.plant-card').forEach(card => {
        card.addEventListener('click', () => {
            const plantId = parseInt(card.dataset.id);
            openModal(plantId);
        });
    });
}

// Open modal with plant details
function openModal(plantId) {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;
    
    const wateringData = loadWateringData();
    const daysUntil = getDaysUntilWatering(plant, wateringData);
    const needsWater = daysUntil <= 0;
    const lastWatered = wateringData[plant.id]?.lastWatered;
    const lastWateredDate = lastWatered ? new Date(lastWatered).toLocaleDateString('cs-CZ') : 'Neznámé';
    
    const wateringStatusHtml = needsWater 
        ? `<div class="modal-watering-alert">
               <span>🚿 Tato rostlina potřebuje zalít!</span>
               <button class="modal-water-btn" onclick="waterPlant(${plant.id})">Zalít nyní</button>
           </div>`
        : `<div class="modal-watering-ok">
               <span>✅ Další zálivka za ${daysUntil} ${daysUntil === 1 ? 'den' : (daysUntil < 5 ? 'dny' : 'dní')}</span>
               <button class="modal-water-btn secondary" onclick="waterPlant(${plant.id})">Zalít nyní</button>
           </div>`;
    
    modalBody.innerHTML = `
        <img src="${plant.image}" alt="${plant.name}" class="modal-image">
        <div class="modal-info">
            <div class="modal-header">
                <h2 class="modal-name">${plant.name}</h2>
                <p class="modal-latin">${plant.latin}</p>
            </div>
            
            ${wateringStatusHtml}
            
            <div class="care-grid">
                <div class="care-item">
                    <div class="care-icon">💧</div>
                    <div class="care-label">Zálivka</div>
                    <div class="care-value">${plant.waterFrequency}</div>
                </div>
                <div class="care-item">
                    <div class="care-icon">📅</div>
                    <div class="care-label">Poslední zálivka</div>
                    <div class="care-value">${lastWateredDate}</div>
                </div>
                <div class="care-item">
                    <div class="care-icon">☀️</div>
                    <div class="care-label">Světlo</div>
                    <div class="care-value">${plant.light}</div>
                </div>
                <div class="care-item">
                    <div class="care-icon">💨</div>
                    <div class="care-label">Vlhkost</div>
                    <div class="care-value">${plant.humidity}</div>
                </div>
                <div class="care-item">
                    <div class="care-icon">🌡️</div>
                    <div class="care-label">Teplota</div>
                    <div class="care-value">${plant.temperature}</div>
                </div>
            </div>
            
            <div class="care-section cat-info ${plant.catSafe ? 'cat-safe-section' : 'cat-danger-section'}">
                <h3>${plant.catSafe ? '🐱 Bezpečná pro kočky' : '⚠️ Pozor - nebezpečná pro kočky!'}</h3>
                <p>${plant.catSafe 
                    ? 'Tato rostlina je bezpečná pro kočky. Můžete ji mít v dosahu vašeho mazlíčka.' 
                    : plant.catWarning}</p>
            </div>
            
            <div class="care-section">
                <h3>📖 O rostlině</h3>
                <p>${plant.description}</p>
            </div>
            
            <div class="care-section">
                <h3>🌿 Péče</h3>
                <p>${plant.care}</p>
            </div>
            
            <div class="care-section">
                <h3>💡 Tipy pro pěstování</h3>
                <ul class="tips-list">
                    ${plant.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPlants(btn.dataset.filter);
    });
});

// Initial render
renderPlants();
updateWateringAlert();

// Kontrola upozornění každou minutu
setInterval(updateWateringAlert, 60000);

// ============================================
// PWA & Notifikace
// ============================================

// Registrace Service Workeru
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registrován:', registration.scope);
        } catch (error) {
            console.log('Service Worker registrace selhala:', error);
        }
    });
}

// PWA Instalace
let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const installClose = document.getElementById('installClose');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Zobrazit banner jen pokud nebyl zavřen
    if (!localStorage.getItem('installBannerDismissed')) {
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 3000);
    }
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Aplikace nainstalována');
        }
        
        deferredPrompt = null;
        installBanner.classList.remove('show');
    });
}

if (installClose) {
    installClose.addEventListener('click', () => {
        installBanner.classList.remove('show');
        localStorage.setItem('installBannerDismissed', 'true');
    });
}

// Notifikace
const notificationBanner = document.getElementById('notificationBanner');
const notificationBtn = document.getElementById('notificationBtn');
const notificationClose = document.getElementById('notificationClose');
const NOTIFICATION_STORAGE_KEY = 'notificationsEnabled';
const NOTIFICATION_TIME_KEY = 'notificationTime';

// Zkontrolovat stav notifikací při načtení
function checkNotificationStatus() {
    if (!('Notification' in window)) {
        console.log('Prohlížeč nepodporuje notifikace');
        return;
    }
    
    if (Notification.permission === 'default' && !localStorage.getItem('notificationBannerDismissed')) {
        // Zobrazit banner po chvíli
        setTimeout(() => {
            if (!installBanner.classList.contains('show')) {
                notificationBanner.classList.add('show');
            }
        }, 5000);
    } else if (Notification.permission === 'granted') {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        scheduleNotifications();
    }
}

// Požádat o povolení notifikací
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Váš prohlížeč nepodporuje notifikace');
        return false;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        notificationBanner.classList.remove('show');
        
        // Ukázat testovací notifikaci
        showNotification('🌱 Notifikace povoleny!', 'Budeme vás upozorňovat na zálivku vašich rostlin.');
        
        // Naplánovat denní kontrolu
        scheduleNotifications();
        
        return true;
    } else {
        alert('Notifikace byly zamítnuty. Můžete je povolit v nastavení prohlížeče.');
        return false;
    }
}

// Zobrazit notifikaci
function showNotification(title, body) {
    if (Notification.permission !== 'granted') return;
    
    const options = {
        body: body,
        icon: 'icons/icon.svg',
        badge: 'icons/icon.svg',
        vibrate: [100, 50, 100],
        tag: 'watering-reminder',
        renotify: true
    };
    
    // Pokusit se použít Service Worker notifikaci (pro mobily)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    } else {
        // Fallback na běžnou notifikaci
        new Notification(title, options);
    }
}

// Zkontrolovat rostliny a poslat notifikaci
function checkAndNotify() {
    const wateringData = loadWateringData();
    const plantsNeedingWater = plants.filter(plant => {
        const days = getDaysUntilWatering(plant, wateringData);
        return days <= 0;
    });
    
    if (plantsNeedingWater.length > 0) {
        const names = plantsNeedingWater.slice(0, 3).map(p => p.name).join(', ');
        const more = plantsNeedingWater.length > 3 ? ` a ${plantsNeedingWater.length - 3} dalších` : '';
        
        showNotification(
            '🚿 Čas na zálivku!',
            `${names}${more} potřebují zalít.`
        );
    }
}

// Naplánovat denní notifikace
function scheduleNotifications() {
    if (Notification.permission !== 'granted') return;
    
    // Kontrola každou hodinu
    setInterval(() => {
        const now = new Date();
        // Notifikovat ráno v 9:00 a večer v 18:00
        if ((now.getHours() === 9 || now.getHours() === 18) && now.getMinutes() < 5) {
            checkAndNotify();
        }
    }, 5 * 60 * 1000); // Každých 5 minut
    
    // Také zkontrolovat ihned při načtení
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 8 && hour <= 20) {
        // Během dne zkontrolovat při načtení (s malým zpožděním)
        setTimeout(checkAndNotify, 10000);
    }
}

// Event listenery pro notifikační banner
if (notificationBtn) {
    notificationBtn.addEventListener('click', requestNotificationPermission);
}

if (notificationClose) {
    notificationClose.addEventListener('click', () => {
        notificationBanner.classList.remove('show');
        localStorage.setItem('notificationBannerDismissed', 'true');
    });
}

// Inicializace notifikací
setTimeout(checkNotificationStatus, 2000);

// Přidat tlačítko pro ruční test notifikace (pro debugging)
window.testNotification = () => {
    checkAndNotify();
};

// ============================================
// QR Code Modal
// ============================================

const qrBtn = document.getElementById('qrBtn');
const qrModal = document.getElementById('qrModal');
const qrModalClose = document.getElementById('qrModalClose');
const qrCodeContainer = document.getElementById('qrCode');

// Generovat QR kód pomocí Google Charts API
function generateQRCode() {
    const appUrl = 'https://moje-rostliny.netlify.app';
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&bgcolor=ffffff&color=0d1f0d&margin=10`;
    
    qrCodeContainer.innerHTML = `<img src="${qrApiUrl}" alt="QR kód pro stažení aplikace" />`;
}

// Otevřít QR modal
function openQRModal() {
    generateQRCode();
    qrModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Zavřít QR modal
function closeQRModal() {
    qrModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listenery
if (qrBtn) {
    qrBtn.addEventListener('click', openQRModal);
}

if (qrModalClose) {
    qrModalClose.addEventListener('click', closeQRModal);
}

if (qrModal) {
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) closeQRModal();
    });
}

// Zavřít i pomocí Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrModal.classList.contains('active')) {
        closeQRModal();
    }
});
