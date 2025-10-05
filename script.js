class RealBrowserScraper {
    constructor() {
        this.fallbackData = this.getFallbackData();
        this.recipeCache = new Map();
        this.userAgent = navigator.userAgent; // Get actual browser UA
        console.log('🌐 Using User Agent:', this.userAgent);
    }

    getFallbackData() {
        return {
            'birsalmasajt': [
                {
                    title: 'Birsalmasajt egyszerűen',
                    source: 'mindmegette.hu',
                    url: 'https://www.mindmegette.hu/birsalmasajt-egyszeruen.recept/',
                    ingredients: [
                        '2 kg birsalma',
                        '1 kg cukor', 
                        '2 db citrom leve',
                        '1 tk fahéj',
                        '1/2 tk szegfűszeg',
                        '1 csomag vaníliás cukor'
                    ],
                    instructions: [
                        'A birsalmát megmossuk, kicsumázzuk és felaprítjuk.',
                        'Egy lábasba tesszük a birsalmát, cukrot, citromlevet és fűszereket.',
                        'Lassú tűzön főzzük, amíg az alma szétesik és a massza sűrű lesz.',
                        'Folyamatosan keverjük, hogy ne égjen le.',
                        'Forrón üvegekbe töltjük és lekötjük.'
                    ]
                }
            ],
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
                }
            ]
        };
    }

    async fetchWithUserAgent(url) {
        try {
            console.log('🔗 Fetching:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            
            if (!text || text.length < 1000) {
                throw new Error('Response too short or empty');
            }

            console.log('✅ Successfully fetched page');
            return text;

        } catch (error) {
            console.error('❌ Fetch failed:', error.message);
            throw error;
        }
    }

    async searchRecipes(query) {
        console.log('🔍 Searching for:', query);
        
        const lowerQuery = query.toLowerCase();
        
        // Check cache first
        if (this.recipeCache.has(lowerQuery)) {
            console.log('📚 Using cached results');
            return this.recipeCache.get(lowerQuery);
        }
        
        // Check fallback data
        if (this.fallbackData[lowerQuery]) {
            console.log('📚 Using fallback data');
            const results = this.fallbackData[lowerQuery];
            this.recipeCache.set(lowerQuery, results);
            return results;
        }
        
        // Try real scraping with user's browser
        try {
            console.log('🌐 Attempting real search with user browser...');
            const realResults = await this.performRealSearch(query);
            if (realResults && realResults.length > 0) {
                this.recipeCache.set(lowerQuery, realResults);
                return realResults;
            }
        } catch (error) {
            console.log('⚠️ Real search failed:', error.message);
        }
        
        // Enhanced fallback
        console.log('📝 Creating enhanced fallback');
        const fallback = this.createEnhancedFallback(query);
        this.recipeCache.set(lowerQuery, fallback);
        return fallback;
    }

    async performRealSearch(query) {
        const results = [];
        
        // Search both sites in parallel
        const [mindmegetteResults, nosaltyResults] = await Promise.allSettled([
            this.searchMindmegette(query),
            this.searchNosalty(query)
        ]);

        if (mindmegetteResults.status === 'fulfilled') {
            results.push(...mindmegetteResults.value);
        }

        if (nosaltyResults.status === 'fulfilled') {
            results.push(...nosaltyResults.value);
        }

        return results.filter(recipe => recipe && recipe.ingredients && recipe.ingredients.length > 0);
    }

    async searchMindmegette(query) {
        try {
            // CORRECT Mindmegette search URL
            const searchUrl = `https://www.mindmegette.hu/kereses?global_filter=${encodeURIComponent(query)}&content_types%5B%5D=recipe`;
            console.log('🔍 Mindmegette search URL:', searchUrl);
            
            const html = await this.fetchWithUserAgent(searchUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const recipes = [];
            
            // Look for recipe links - multiple selector strategies
            const linkSelectors = [
                'a[href*="/recept/"]',
                '.recipe-list-item a',
                '.search-result-item a',
                '.item-title a',
                'h2 a',
                'h3 a'
            ];
            
            let links = [];
            for (const selector of linkSelectors) {
                links = doc.querySelectorAll(selector);
                if (links.length > 0) {
                    console.log(`✅ Found ${links.length} links with selector: ${selector}`);
                    break;
                }
            }
            
            console.log(`📊 Total Mindmegette links found: ${links.length}`);
            
            // Process up to 3 recipes
            for (const link of Array.from(links).slice(0, 3)) {
                try {
                    const href = link.getAttribute('href');
                    if (!href) continue;
                    
                    // Construct full URL
                    let fullUrl = href;
                    if (!href.startsWith('http')) {
                        fullUrl = `https://www.mindmegette.hu${href.startsWith('/') ? href : '/' + href}`;
                    }
                    
                    // Get title
                    let title = link.textContent?.trim() || 
                               link.querySelector('h2, h3, .title')?.textContent?.trim() || 
                               `${query} recept`;
                    
                    title = title.replace(/\s+/g, ' ').substring(0, 100);
                    
                    if (title && title.length > 5) {
                        console.log('🍽️ Processing Mindmegette recipe:', title);
                        
                        // Get recipe details
                        const details = await this.getRecipeDetails(fullUrl, 'mindmegette');
                        
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'mindmegette.hu',
                            ...details
                        });
                    }
                } catch (error) {
                    console.warn('❌ Error processing Mindmegette link:', error);
                }
            }
            
            return recipes;
            
        } catch (error) {
            console.error('❌ Mindmegette search failed:', error);
            return [];
        }
    }

    async searchNosalty(query) {
        try {
            // CORRECT Nosalty search URL
            const searchUrl = `https://www.nosalty.hu/kereses/recept/${encodeURIComponent(query)}`;
            console.log('🔍 Nosalty search URL:', searchUrl);
            
            const html = await this.fetchWithUserAgent(searchUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const recipes = [];
            
            // Look for recipe links
            const linkSelectors = [
                'a[href*="/recept/"]',
                '.recipe-card a',
                '.search-result a',
                '.item-title a',
                'h2 a',
                'h3 a'
            ];
            
            let links = [];
            for (const selector of linkSelectors) {
                links = doc.querySelectorAll(selector);
                if (links.length > 0) {
                    console.log(`✅ Found ${links.length} links with selector: ${selector}`);
                    break;
                }
            }
            
            console.log(`📊 Total Nosalty links found: ${links.length}`);
            
            // Process up to 3 recipes
            for (const link of Array.from(links).slice(0, 3)) {
                try {
                    const href = link.getAttribute('href');
                    if (!href) continue;
                    
                    // Construct full URL
                    let fullUrl = href;
                    if (!href.startsWith('http')) {
                        fullUrl = `https://www.nosalty.hu${href.startsWith('/') ? href : '/' + href}`;
                    }
                    
                    // Get title
                    let title = link.textContent?.trim() || 
                               link.querySelector('h2, h3, .title')?.textContent?.trim() || 
                               `${query} recept`;
                    
                    title = title.replace(/\s+/g, ' ').substring(0, 100);
                    
                    if (title && title.length > 5) {
                        console.log('🍽️ Processing Nosalty recipe:', title);
                        
                        // Get recipe details
                        const details = await this.getRecipeDetails(fullUrl, 'nosalty');
                        
                        recipes.push({
                            title: title,
                            url: fullUrl,
                            source: 'nosalty.hu',
                            ...details
                        });
                    }
                } catch (error) {
                    console.warn('❌ Error processing Nosalty link:', error);
                }
            }
            
            return recipes;
            
        } catch (error) {
            console.error('❌ Nosalty search failed:', error);
            return [];
        }
    }

    async getRecipeDetails(url, source) {
        try {
            console.log('🔍 Fetching recipe details:', url);
            
            const html = await this.fetchWithUserAgent(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let ingredients = [];
            let instructions = [];
            
            if (source === 'mindmegette') {
                // Mindmegette ingredient selectors
                const ingredientSelectors = [
                    '.hozzavalok-list li',
                    '.ingredients li',
                    '[class*="hozzaval"] li',
                    '.recipe-ingredients li'
                ];
                
                for (const selector of ingredientSelectors) {
                    const elements = doc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        ingredients = Array.from(elements)
                            .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                            .filter(text => text.length > 2);
                        break;
                    }
                }
                
                // Mindmegette instruction selectors
                const instructionSelectors = [
                    '.preparation-steps li',
                    '.instructions li',
                    '[class*="elkeszit"] li',
                    '.recipe-steps li'
                ];
                
                for (const selector of instructionSelectors) {
                    const elements = doc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        instructions = Array.from(elements)
                            .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                            .filter(text => text.length > 5);
                        break;
                    }
                }
            } else {
                // Nosalty ingredient selectors
                const ingredientSelectors = [
                    '.ingredient-list li',
                    '.hozzavalok li',
                    '[class*="ingredient"] li',
                    '.recipe-ingredients li'
                ];
                
                for (const selector of ingredientSelectors) {
                    const elements = doc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        ingredients = Array.from(elements)
                            .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                            .filter(text => text.length > 2);
                        break;
                    }
                }
                
                // Nosalty instruction selectors
                const instructionSelectors = [
                    '.instruction-list li',
                    '.steps li',
                    '[class*="instruction"] li',
                    '.recipe-steps li'
                ];
                
                for (const selector of instructionSelectors) {
                    const elements = doc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        instructions = Array.from(elements)
                            .map(el => el.textContent?.trim().replace(/\s+/g, ' ') || '')
                            .filter(text => text.length > 5);
                        break;
                    }
                }
            }
            
            console.log(`📝 Found ${ingredients.length} ingredients, ${instructions.length} instructions`);
            
            return {
                ingredients: ingredients.length > 0 ? ingredients.slice(0, 15) : ['Hozzávalók betöltése sikertelen'],
                instructions: instructions.length > 0 ? instructions.slice(0, 10) : ['Elkészítés betöltése sikertelen']
            };
            
        } catch (error) {
            console.error('❌ Error getting recipe details:', error);
            return {
                ingredients: ['Hozzávalók betöltése sikertelen'],
                instructions: ['Elkészítés betöltése sikertelen']
            };
        }
    }

    createEnhancedFallback(query) {
        console.log('📝 Creating enhanced fallback for:', query);
        
        const commonRecipes = {
            'sajt': {
                title: `${query} - sajtos specialitás`,
                ingredients: [
                    'sajt (trappista, ementáli, vagy parmezán)',
                    'tejföl vagy tej',
                    'tojás',
                    'liszt',
                    'só, bors',
                    'fűszerek ízlés szerint'
                ],
                instructions: [
                    'Előkészítsd az alapanyagokat.',
                    'Keverd össze a hozzávalókat.',
                    'Süsd vagy főzd meg a megfelelő hőmérsékleten.',
                    'Szervírozd frissen.',
                    'Jó étvágyat!'
                ]
            },
            'torta': {
                title: `${query} - torta recept`,
                ingredients: [
                    'liszt',
                    'cukor', 
                    'tojás',
                    'vaj vagy olaj',
                    'sütőpor',
                    'vanília',
                    'tej vagy tejföl'
                ],
                instructions: [
                    'Elkészítjük a tésztát.',
                    'Kiolajozott formába öntjük.',
                    'Előmelegített sütőben megsütjük.',
                    'Kihűtjük és tálaljuk.',
                    'Porcukorral megszórhatjuk.'
                ]
            }
        };

        let bestMatch = commonRecipes.sajt;
        for (const [category, recipe] of Object.entries(commonRecipes)) {
            if (query.toLowerCase().includes(category)) {
                bestMatch = recipe;
                break;
            }
        }

        return [{
            title: bestMatch.title,
            source: 'helyi adatbázis',
            url: '#',
            ingredients: bestMatch.ingredients,
            instructions: bestMatch.instructions
        }];
    }

    async generateRandomMeal() {
        const mealTypes = {
            'Leves': ['gulyásleves', 'húsleves', 'zöldségleves', 'babgulyás'],
            'Főétel': ['pörkölt', 'rántott hús', 'tészta', 'töltött paprika', 'sült csirke']
        };
        
        const randomSoup = mealTypes['Leves'][Math.floor(Math.random() * mealTypes['Leves'].length)];
        const randomMain = mealTypes['Főétel'][Math.floor(Math.random() * mealTypes['Főétel'].length)];
        
        console.log(`🎲 Generating random meal: ${randomSoup} + ${randomMain}`);
        
        const [soupResults, mainResults] = await Promise.all([
            this.searchRecipes(randomSoup),
            this.searchRecipes(randomMain)
        ]);
        
        return {
            'Leves': soupResults[0],
            'Főétel': mainResults[0]
        };
    }
}

// Enhanced UI with better feedback
class RecipeManager {
    constructor() {
        this.scraper = new RealBrowserScraper();
    }

    async searchRecipes(query) {
        return await this.scraper.searchRecipes(query);
    }

    async generateRandomMeal() {
        return await this.scraper.generateRandomMeal();
    }
}

// Global recipe manager
const recipeManager = new RecipeManager();

// UI Functions
function setLoading(loading) {
    const loadingEl = document.getElementById('loading');
    const searchBtn = document.getElementById('searchBtn');
    
    loadingEl.style.display = loading ? 'block' : 'none';
    searchBtn.disabled = loading;
    
    if (loading) {
        document.getElementById('results').innerHTML = '';
        document.getElementById('randomMeal').style.display = 'none';
        hideMessage();
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.innerHTML = `<p>${text}</p>`;
    messageEl.className = `message-box ${type}`;
    messageEl.style.display = 'block';
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
        const recipes = await recipeManager.searchRecipes(query);
        displayRecipes(recipes);
        
        if (recipes.length === 0) {
            showMessage('Nem találhatók receptek. Próbálj másik kulcsszót!', 'info');
        } else {
            const sourceCount = {};
            recipes.forEach(recipe => {
                sourceCount[recipe.source] = (sourceCount[recipe.source] || 0) + 1;
            });
            
            const sourceText = Object.entries(sourceCount).map(([source, count]) => 
                `${count} ${source}`
            ).join(', ');
            
            showMessage(`${recipes.length} recept található (${sourceText})`, 'info');
            setTimeout(hideMessage, 4000);
        }
    } catch (error) {
        console.error('Search error:', error);
        showMessage(`Hiba történt: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function generateRandomMeal() {
    setLoading(true);
    hideMessage();
    
    try {
        const meal = await recipeManager.generateRandomMeal();
        displayRandomMeal(meal);
        showMessage('🎉 Véletlenszerű menü generálva!', 'info');
        setTimeout(hideMessage, 3000);
    } catch (error) {
        console.error('Random meal error:', error);
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
                <div class="suggestions">
                    <p><strong>Próbáld ezeket:</strong></p>
                    <button onclick="quickSearch('birsalmasajt')">Birsalmasajt</button>
                    <button onclick="quickSearch('pörkölt')">Pörkölt</button>
                    <button onclick="quickSearch('palacsinta')">Palacsinta</button>
                </div>
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
}

// Event listeners
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchRecipes();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍳 Családi Recept Kereső elindult!');
    console.log('🌐 User Agent:', navigator.userAgent);
    document.getElementById('searchInput').focus();
    document.getElementById('loading').style.display = 'none';
    
    // Show welcome message
    showMessage('Üdvözöllek! A kereső a böngésződdel fogja lekérni a recepteket.', 'info');
    setTimeout(hideMessage, 5000);
});
