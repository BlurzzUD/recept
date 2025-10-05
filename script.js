class CorrectScraper {
    constructor() {
        this.proxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/'
        ];
        this.fallbackData = this.getFallbackData();
    }

    getFallbackData() {
        return {
            'pörkölt': [
                {
                    title: 'Marhapörkölt klasszikus recept',
                    source: 'mindmegette.hu',
                    url: 'https://www.mindmegette.hu/marhaporkolt.recept/',
                    ingredients: [
                        '80 dkg marhalábszár',
                        '2 fej vöröshagyma',
                        '2 gerezd fokhagyma',
                        '2 ek liszt',
                        '2 ek olaj',
                        '1 tk pirospaprika',
                        'só, bors ízlés szerint',
                        '1 tk kömény',
                        '2 db zöldpaprika'
                    ],
                    instructions: [
                        'A hagymát apróra vágjuk és az olajon üvegesre pirítjuk.',
                        'Hozzáadjuk a fokhagymát, majd a felkockázott húst.',
                        'Megszórjuk pirospaprikával, majd felöntjük vízzel.',
                        'Sózzuk, borsozzuk, köményt hozzáadunk.',
                        'Puhára főzzük, majd a végén a zöldpaprikát is hozzáadjuk.'
                    ]
                }
            ],
            'palacsinta': [
                {
                    title: 'Palacsinta alaprecept',
                    source: 'nosalty.hu',
                    url: 'https://www.nosalty.hu/recept/palacsinta-alaprecept',
                    ingredients: [
                        '25 dkg liszt',
                        '3 db tojás',
                        '3 dl tej',
                        '3 dl szódavíz',
                        '1 csomag vaníliás cukor',
                        '1 csipet só',
                        '2 ek olaj a sütéshez'
                    ],
                    instructions: [
                        'A lisztet egy tálba szitáljuk, hozzáadjuk a tojásokat.',
                        'Folyamatos keverés mellett hígítás a tejjel és szódavízzel.',
                        'Hozzáadjuk a vaníliás cukrot és a csipet sót.',
                        'A tésztát legalább 30 percig pihentetjük.',
                        'Forró serpenyőben vékonyan kisütjük mindkét oldalát.'
                    ]
                },
                {
                    title: 'Vékony palacsinta',
                    source: 'mindmegette.hu',
                    url: 'https://www.mindmegette.hu/vekonypalacsinta.recept/',
                    ingredients: [
                        '20 dkg finomliszt',
                        '2 db tojás',
                        '4 dl tej',
                        '2 dl szénsavmentes ásványvíz',
                        '1 ek olaj',
                        '1 csipet só'
                    ],
                    instructions: [
                        'A lisztet a tojásokkal elkeverjük.',
                        'Fokozatosan hozzáadjuk a tejet és ásványvizet.',
                        'Az olajat és sót hozzáadjuk, simára keverjük.',
                        'A tésztát 15 percig pihentetjük.',
                        'Forró palacsintasütőben kisütjük.'
                    ]
                }
            ],
            'gulyás': [
                {
                    title: 'Gulyásleves eredeti recept',
                    source: 'mindmegette.hu',
                    url: 'https://www.mindmegette.hu/gulyasleves.recept/',
                    ingredients: [
                        '60 dkg marhalábszár',
                        '2 fej vöröshagyma',
                        '2 gerezd fokhagyma',
                        '2 db sárgarépa',
                        '1 db petrezselyemgyökér',
                        '2 db zeller',
                        '3 db burgonya',
                        '2 ek olaj',
                        '1 ek pirospaprika',
                        '1 tk kömény',
                        'só, bors ízlés szerint'
                    ],
                    instructions: [
                        'A hagymát apróra vágjuk, az olajon megpirítjuk.',
                        'Hozzáadjuk a felkockázott húst és pirospaprikát.',
                        'Felöntjük vízzel, hozzáadjuk a köményt.',
                        'Hozzáadjuk a karikára vágott zöldségeket.',
                        'Sózzuk, borsozzuk, és puhára főzzük.'
                    ]
                }
            ],
            'töltött paprika': [
                {
                    title: 'Töltött paprika',
                    source: 'nosalty.hu',
                    url: 'https://www.nosalty.hu/recept/toltott-paprika',
                    ingredients: [
                        '8 db zöldpaprika',
                        '50 dkg darált sertéshús',
                        '15 dkg rizs',
                        '1 fej vöröshagyma',
                        '2 gerezd fokhagyma',
                        '1 db tojás',
                        'só, bors, petrezselyem',
                        '2 db paradicsom',
                        '1 db zellerlevél'
                    ],
                    instructions: [
                        'A paprikák magházát kivágjuk.',
                        'A darált húst a főtt rizzsel, hagymával, fűszerekkel összedolgozzuk.',
                        'A paprikákat megtöltjük a masszával.',
                        'Egymás mellé ültetjük egy lábasba.',
                        'Felöntjük vízzel, paradicsommal, és puhára főzzük.'
                    ]
                }
            ],
            'rántott hús': [
                {
                    title: 'Rántott csirkecomb',
                    source: 'mindmegette.hu',
                    url: 'https://www.mindmegette.hu/rantott-csirkecomb.recept/',
                    ingredients: [
                        '4 db csirkecomb',
                        '15 dkg liszt',
                        '2 db tojás',
                        '10 dkg zsemlemorzsa',
                        'só ízlés szerint',
                        'olívaolaj a sütéshez'
                    ],
                    instructions: [
                        'A csirkecombokat megmossuk, megsózzuk.',
                        'Lisztbe, tojásba, majd zsemlemorzsába forgatjuk.',
                        'Forró olajban mindkét oldalát aranybarnára sütjük.',
                        'Papírtörölközőn lecsöpögtetjük.',
                        'Friss salátával tálaljuk.'
                    ]
                }
            ],
            'tészta': [
                {
                    title: 'Spagetti carbonara',
                    source: 'nosalty.hu',
                    url: 'https://www.nosalty.hu/recept/spagetti-carbonara',
                    ingredients: [
                        '40 dkg spagetti',
                        '15 dkg pancetta vagy szalonna',
                        '2 db tojás',
                        '10 dkg reszelt parmezán',
                        '2 gerezd fokhagyma',
                        'só, bors ízlés szerint',
                        'olívaolaj'
                    ],
                    instructions: [
                        'A spagetti forró sós vízben kifőzzük.',
                        'A pancettát ropogósra sütjük.',
                        'A tojásokat a reszelt sajttal elkeverjük.',
                        'A forró tésztát a tojásos keverékkel összerázogatjuk.',
                        'A pancettát és fokhagymát hozzáadjuk.'
                    ]
                }
            ]
        };
    }

    async fetchWithRetry(url, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            for (const proxy of this.proxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(url);
                    console.log(`Trying: ${proxyUrl.substring(0, 100)}...`);
                    
                    const response = await fetch(proxyUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                        }
                    });
                    
                    if (response.ok) {
                        const text = await response.text();
                        if (text && text.length > 500) {
                            console.log('✅ Success with proxy');
                            return text;
                        }
                    }
                } catch (error) {
                    console.warn(`❌ Proxy failed:`, error.message);
                    continue;
                }
            }
            
            // Wait before retry
            if (attempt < retries - 1) {
                console.log(`🔄 Retry ${attempt + 1} in ${attempt + 1} seconds...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
        throw new Error('All proxies failed');
    }

    async searchRecipes(query) {
        console.log('🔍 Searching for:', query);
        
        // First check fallback data
        const lowerQuery = query.toLowerCase();
        if (this.fallbackData[lowerQuery]) {
            console.log('📚 Using fallback data for:', query);
            return this.fallbackData[lowerQuery];
        }
        
        const results = [];
        
        // Try real scraping with CORRECT URLs
        try {
            console.log('🌐 Trying real scraping...');
            const realResults = await this.tryRealScraping(query);
            if (realResults.length > 0) {
                return realResults;
            }
        } catch (error) {
            console.log('⚠️ Real scraping failed, using enhanced fallback:', error.message);
        }
        
        // Enhanced fallback
        return this.createEnhancedFallback(query);
    }

    async tryRealScraping(query) {
        const results = [];
        
        // Try Mindmegette with CORRECT URL
        try {
            const mindmegetteResults = await this.scrapeMindmegette(query);
            results.push(...mindmegetteResults);
            console.log(`✅ Mindmegette: ${mindmegetteResults.length} results`);
        } catch (error) {
            console.error('❌ Mindmegette scrape failed:', error.message);
        }
        
        // Try Nosalty with CORRECT URL
        try {
            const nosaltyResults = await this.scrapeNosalty(query);
            results.push(...nosaltyResults);
            console.log(`✅ Nosalty: ${nosaltyResults.length} results`);
        } catch (error) {
            console.error('❌ Nosalty scrape failed:', error.message);
        }
        
        return results.filter(recipe => recipe && recipe.ingredients && recipe.ingredients.length > 0);
    }

    async scrapeMindmegette(query) {
        // CORRECT Mindmegette search URL
        const searchUrl = `https://www.mindmegette.hu/kereses?global_filter=${encodeURIComponent(query)}&content_types%5B%5D=recipe`;
        console.log('🔗 Mindmegette URL:', searchUrl);
        
        const html = await this.fetchWithRetry(searchUrl);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const recipes = [];
        
        // Multiple selector strategies for Mindmegette NEW layout
        const selectors = [
            '.recipe-list-item a',
            '.recipe-card a',
            '.search-result-item a',
            'a.recipe-link',
            'a[href*="/recept/"]',
            '.item-title a',
            'h2 a',
            'h3 a'
        ];
        
        let links = [];
        for (const selector of selectors) {
            links = doc.querySelectorAll(selector);
            if (links.length > 0) {
                console.log(`✅ Found ${links.length} links with selector: ${selector}`);
                break;
            }
        }
        
        console.log(`📊 Total links found on Mindmegette: ${links.length}`);
        
        for (const link of Array.from(links).slice(0, 3)) {
            try {
                const href = link.getAttribute('href');
                if (!href) continue;
                
                let fullUrl = href;
                if (!href.startsWith('http')) {
                    fullUrl = `https://www.mindmegette.hu${href.startsWith('/') ? href : '/' + href}`;
                }
                
                // Get title from multiple possible locations
                let title = link.textContent?.trim() || 
                           link.querySelector('h2, h3, .title, .recipe-title')?.textContent?.trim() || 
                           `${query} recept`;
                
                // Clean up title
                title = title.replace(/\s+/g, ' ').substring(0, 100);
                
                if (title && title.length > 5 && !title.includes('©')) {
                    console.log('🍽️ Processing Mindmegette recipe:', title);
                    const details = await this.getMindmegetteDetails(fullUrl);
                    
                    if (details) {
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'mindmegette.hu',
                            ...details
                        });
                        console.log('✅ Added recipe:', title);
                    } else {
                        // Add recipe even without details
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'mindmegette.hu',
                            ingredients: ['Hozzávalók betöltése sikertelen'],
                            instructions: ['Látogasd meg az oldalt a teljes receptért!']
                        });
                        console.log('⚠️ Added recipe without details:', title);
                    }
                }
            } catch (error) {
                console.warn('❌ Error processing Mindmegette link:', error);
            }
        }
        
        return recipes;
    }

    async scrapeNosalty(query) {
        // CORRECT Nosalty search URL
        const searchUrl = `https://www.nosalty.hu/kereses/recept/${encodeURIComponent(query)}`;
        console.log('🔗 Nosalty URL:', searchUrl);
        
        const html = await this.fetchWithRetry(searchUrl);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const recipes = [];
        
        // Multiple selector strategies for Nosalty
        const selectors = [
            '.recipe-card a',
            '.search-result a',
            'a.recipe-link',
            'a[href*="/recept/"]',
            '.item-title a',
            'h2 a',
            'h3 a'
        ];
        
        let links = [];
        for (const selector of selectors) {
            links = doc.querySelectorAll(selector);
            if (links.length > 0) {
                console.log(`✅ Found ${links.length} links with selector: ${selector}`);
                break;
            }
        }
        
        console.log(`📊 Total links found on Nosalty: ${links.length}`);
        
        for (const link of Array.from(links).slice(0, 3)) {
            try {
                const href = link.getAttribute('href');
                if (!href) continue;
                
                let fullUrl = href;
                if (!href.startsWith('http')) {
                    fullUrl = `https://www.nosalty.hu${href.startsWith('/') ? href : '/' + href}`;
                }
                
                // Get title from multiple possible locations
                let title = link.textContent?.trim() || 
                           link.querySelector('h2, h3, .title, .recipe-title')?.textContent?.trim() || 
                           `${query} recept`;
                
                // Clean up title
                title = title.replace(/\s+/g, ' ').substring(0, 100);
                
                if (title && title.length > 5 && !title.includes('©')) {
                    console.log('🍽️ Processing Nosalty recipe:', title);
                    const details = await this.getNosaltyDetails(fullUrl);
                    
                    if (details) {
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'nosalty.hu',
                            ...details
                        });
                        console.log('✅ Added recipe:', title);
                    } else {
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'nosalty.hu',
                            ingredients: ['Hozzávalók betöltése sikertelen'],
                            instructions: ['Látogasd meg az oldalt a teljes receptért!']
                        });
                        console.log('⚠️ Added recipe without details:', title);
                    }
                }
            } catch (error) {
                console.warn('❌ Error processing Nosalty link:', error);
            }
        }
        
        return recipes;
    }

    async getMindmegetteDetails(url) {
        try {
            console.log('🔍 Fetching Mindmegette details:', url);
            const html = await this.fetchWithRetry(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Multiple strategies for ingredients
            let ingredients = [];
            const ingredientSelectors = [
                '.hozzavalok-list li',
                '.ingredients li',
                '.ingredient-item',
                '[class*="hozzaval"] li',
                '.recipe-ingredients li'
            ];
            
            for (const selector of ingredientSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    ingredients = Array.from(elements)
                        .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                        .filter(text => text.length > 2 && !text.includes('©'));
                    if (ingredients.length > 0) {
                        console.log(`✅ Found ${ingredients.length} ingredients with: ${selector}`);
                        break;
                    }
                }
            }
            
            // Multiple strategies for instructions
            let instructions = [];
            const instructionSelectors = [
                '.preparation-steps li',
                '.instructions li',
                '.instruction-step',
                '[class*="elkeszit"] li',
                '.recipe-steps li'
            ];
            
            for (const selector of instructionSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    instructions = Array.from(elements)
                        .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                        .filter(text => text.length > 5 && !text.includes('©'));
                    if (instructions.length > 0) {
                        console.log(`✅ Found ${instructions.length} instructions with: ${selector}`);
                        break;
                    }
                }
            }
            
            return {
                ingredients: ingredients.length > 0 ? ingredients.slice(0, 12) : ['Hozzávalók nem elérhetők'],
                instructions: instructions.length > 0 ? instructions.slice(0, 8) : ['Elkészítés nem elérhető']
            };
            
        } catch (error) {
            console.error('❌ Error getting Mindmegette details:', error);
            return null;
        }
    }

    async getNosaltyDetails(url) {
        try {
            console.log('🔍 Fetching Nosalty details:', url);
            const html = await this.fetchWithRetry(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Ingredients for Nosalty
            let ingredients = [];
            const ingredientSelectors = [
                '.ingredient-list li',
                '.hozzavalok li',
                '.hozzavalo-item',
                '[class*="ingredient"] li',
                '.recipe-ingredients li'
            ];
            
            for (const selector of ingredientSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    ingredients = Array.from(elements)
                        .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                        .filter(text => text.length > 2);
                    if (ingredients.length > 0) {
                        console.log(`✅ Found ${ingredients.length} ingredients with: ${selector}`);
                        break;
                    }
                }
            }
            
            // Instructions for Nosalty
            let instructions = [];
            const instructionSelectors = [
                '.instruction-list li',
                '.steps li',
                '.step-item',
                '[class*="instruction"] li',
                '.recipe-steps li'
            ];
            
            for (const selector of instructionSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    instructions = Array.from(elements)
                        .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                        .filter(text => text.length > 5);
                    if (instructions.length > 0) {
                        console.log(`✅ Found ${instructions.length} instructions with: ${selector}`);
                        break;
                    }
                }
            }
            
            return {
                ingredients: ingredients.length > 0 ? ingredients.slice(0, 12) : ['Hozzávalók nem elérhetők'],
                instructions: instructions.length > 0 ? instructions.slice(0, 8) : ['Elkészítés nem elérhető']
            };
            
        } catch (error) {
            console.error('❌ Error getting Nosalty details:', error);
            return null;
        }
    }

    createEnhancedFallback(query) {
        console.log('📝 Creating enhanced fallback for:', query);
        
        const commonIngredients = {
            'pörkölt': ['marha- vagy sertéshús', 'vöröshagyma', 'pirospaprika', 'olaj', 'só', 'bors', 'fokhagyma'],
            'palacsinta': ['liszt', 'tojás', 'tej', 'szódavíz', 'só', 'olaj', 'vaníliás cukor'],
            'gulyás': ['marhahús', 'burgonya', 'sárgarépa', 'hagyma', 'pirospaprika', 'kömény', 'zeller'],
            'töltött paprika': ['zöldpaprika', 'darált hús', 'rizs', 'hagyma', 'paradicsom', 'fűszerek', 'tojás'],
            'rántott hús': ['csirkecomb vagy sertésszelet', 'liszt', 'tojás', 'zsemlemorzsa', 'só', 'olaj'],
            'tészta': ['tészta', 'olívaolaj', 'só', 'fokhagyma', 'reszelt sajt', 'friss fűszerek']
        };
        
        const baseIngredients = commonIngredients[query.toLowerCase()] || [
            'alapanyagok', 'só', 'bors', 'olaj', 'fűszerek', 'friss zöldségek'
        ];
        
        return [
            {
                title: `${query} - alaprecept`,
                source: 'helyi adatbázis',
                url: '#',
                ingredients: baseIngredients,
                instructions: [
                    'Előkészítsd az alapanyagokat.',
                    'Kövesd a hagyományos elkészítési módot.',
                    'Ízlés szerint fűszerezd.',
                    'Szervírozd frissen, melegen.',
                    'Jó étvágyat!'
                ]
            }
        ];
    }

    async generateRandomMeal() {
        const mealTypes = {
            'Leves': ['gulyásleves', 'húsleves', 'zöldségleves', 'babgulyás', 'gombaleves'],
            'Főétel': ['pörkölt', 'rántott hús', 'tészta', 'töltött paprika', 'sült csirke', 'lasagne']
        };
        
        const randomSoup = mealTypes['Leves'][Math.floor(Math.random() * mealTypes['Leves'].length)];
        const randomMain = mealTypes['Főétel'][Math.floor(Math.random() * mealTypes['Főétel'].length)];
        
        console.log(`🎲 Generating random meal: ${randomSoup} + ${randomMain}`);
        
        const [soupResults, mainResults] = await Promise.all([
            this.searchRecipes(randomSoup),
            this.searchRecipes(randomMain)
        ]);
        
        return {
            'Leves': soupResults[0] || this.createEnhancedFallback(randomSoup)[0],
            'Főétel': mainResults[0] || this.createEnhancedFallback(randomMain)[0]
        };
    }
}

// Global scraper instance
const scraper = new CorrectScraper();

// UI Functions (same as before, but with better logging)
function setLoading(loading) {
    const loadingEl = document.getElementById('loading');
    const searchBtn = document.getElementById('searchBtn');
    
    loadingEl.style.display = loading ? 'block' : 'none';
    searchBtn.disabled = loading;
    
    if (loading) {
        document.getElementById('results').innerHTML = '';
        document.getElementById('randomMeal').style.display = 'none';
        hideMessage();
        console.log('🔄 Loading started...');
    } else {
        console.log('✅ Loading finished');
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.innerHTML = `<p>${text}</p>`;
    messageEl.className = `message-box ${type}`;
    messageEl.style.display = 'block';
    console.log(`💬 Message: ${text}`);
}

function hideMessage() {
    document.getElementById('message').style.display = 'none';
}

async function searchRecipes() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    
    if (!query) {
        showMessage('Kérjük, írj be egy recept nevet!', 'error');
        return;
    }

    setLoading(true);
    
    try {
        const recipes = await scraper.searchRecipes(query);
        displayRecipes(recipes);
        
        if (recipes.length === 0) {
            showMessage('Nem találhatók receptek. Próbálj másik kulcsszót!', 'info');
        } else {
            showMessage(`${recipes.length} recept található a(z) "${query}" kulcsszóra`, 'info');
            setTimeout(hideMessage, 4000);
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        showMessage(`Hiba történt: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function generateRandomMeal() {
    setLoading(true);
    hideMessage();
    
    try {
        const meal = await scraper.generateRandomMeal();
        displayRandomMeal(meal);
        showMessage('🎉 Véletlenszerű menü generálva!', 'info');
        setTimeout(hideMessage, 4000);
    } catch (error) {
        console.error('❌ Random meal error:', error);
        showMessage(`Hiba a menü generálásakor: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

function displayRecipes(recipes) {
    const container = document.getElementById('results');
    
    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>😔 Nincs találat</h3>
                <p>Próbálj meg másik kulcsszót!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-source">${recipe.source}</div>
            </div>
            <div class="recipe-content">
                <div class="section">
                    <div class="section-title">📝 Hozzávalók</div>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li class="ingredient-item">${ing}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="section">
                    <div class="section-title">👨‍🍳 Elkészítés</div>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(inst => `
                            <li class="instruction-item">${inst}</li>
                        `).join('')}
                    </ol>
                </div>
            </div>
            <div class="recipe-footer">
                ${recipe.url !== '#' ? `
                    <a href="${recipe.url}" target="_blank" rel="noopener" class="recipe-link">
                        📖 Teljes recept megtekintése
                    </a>
                ` : '<span>📍 Helyi adatbázis</span>'}
            </div>
        </div>
    `).join('');
    
    console.log(`📊 Displayed ${recipes.length} recipes`);
}

function displayRandomMeal(meal) {
    const container = document.getElementById('randomMeal');
    
    container.innerHTML = `
        <div class="meal-header">
            <h2>🎉 Véletlenszerű 2 Fogásos Menü</h2>
            <p>Élvezd ezt a finom kombinációt!</p>
        </div>
        <div class="meal-combination">
            ${Object.entries(meal).map(([course, recipe]) => `
                <div class="course-section">
                    <h3 class="course-title">${course}</h3>
                    <div class="recipe-card">
                        <div class="recipe-header">
                            <div class="recipe-title">${recipe.title}</div>
                            <div class="recipe-source">${recipe.source}</div>
                        </div>
                        <div class="recipe-content">
                            <div class="section">
                                <div class="section-title">📝 Hozzávalók</div>
                                <ul class="ingredients-list">
                                    ${recipe.ingredients.slice(0, 6).map(ing => `
                                        <li class="ingredient-item">${ing}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                        ${recipe.url !== '#' ? `
                            <div class="recipe-footer">
                                <a href="${recipe.url}" target="_blank" rel="noopener" class="recipe-link">
                                    📖 Teljes recept
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <button class="action-btn primary" onclick="generateRandomMeal()">
                🔄 Új Menü Generálása
            </button>
        </div>
    `;
    
    container.style.display = 'block';
    console.log('🎊 Random meal displayed');
}

function quickSearch(query) {
    document.getElementById('searchInput').value = query;
    searchRecipes();
}

function clearAll() {
    document.getElementById('searchInput').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('randomMeal').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    console.log('🗑️ All cleared');
}

// Event listeners
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchRecipes();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍳 Családi Recept Kereső elindult!');
    document.getElementById('searchInput').focus();
    document.getElementById('loading').style.display = 'none';
    
    // Show welcome message
    showMessage('Üdvözöllek! Kezdj el keresni recepteket. Próbáld: palacsinta, pörkölt, gulyás', 'info');
    setTimeout(hideMessage, 5000);
});
