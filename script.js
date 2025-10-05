// CORS proxy - INGYENES alternatívák
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

class GitHubScraper {
    constructor() {
        this.currentProxyIndex = 0;
        this.retryCount = 2;
    }

    async fetchWithRetry(url, retries = this.retryCount) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const proxyUrl = CORS_PROXIES[this.currentProxyIndex] + encodeURIComponent(url);
                console.log(`Attempt ${attempt + 1}: Fetching from ${url}`);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const text = await response.text();
                if (text && text.length > 100) return text;
                
                throw new Error('Empty response');
                
            } catch (error) {
                console.warn(`Attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt === retries) throw error;
                
                // Váltás következő proxy-ra
                this.currentProxyIndex = (this.currentProxyIndex + 1) % CORS_PROXIES.length;
                await this.delay(1000 * (attempt + 1));
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchRecipes(query) {
        console.log(`Searching recipes for: "${query}"`);
        
        const results = [];
        
        // Párhuzamosan scrapeljük mindkét oldalt
        const [mindmegetteResults, nosaltyResults] = await Promise.allSettled([
            this.scrapeMindmegette(query),
            this.scrapeNosalty(query)
        ]);

        if (mindmegetteResults.status === 'fulfilled') {
            results.push(...mindmegetteResults.value);
        } else {
            console.error('Mindmegette failed:', mindmegetteResults.reason);
        }

        if (nosaltyResults.status === 'fulfilled') {
            results.push(...nosaltyResults.value);
        } else {
            console.error('Nosalty failed:', nosaltyResults.reason);
        }

        return this.validateResults(results, query);
    }

    async scrapeMindmegette(query) {
        try {
            const searchUrl = `https://www.mindmegette.hu/kereso/recipes/${encodeURIComponent(query)}/`;
            const html = await this.fetchWithRetry(searchUrl);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const recipes = [];
            const recipeLinks = doc.querySelectorAll('a[href*="/recept/"]');
            
            for (const link of Array.from(recipeLinks).slice(0, 3)) {
                try {
                    const href = link.getAttribute('href');
                    const fullUrl = href.startsWith('http') ? href : `https://www.mindmegette.hu${href}`;
                    const title = link.textContent.trim() || link.querySelector('h2, h3, .title')?.textContent.trim();
                    
                    if (title && title.length > 3) {
                        const details = await this.getMindmegetteDetails(fullUrl);
                        if (details) {
                            recipes.push({
                                title: title,
                                url: fullUrl,
                                source: 'mindmegette.hu',
                                ...details
                            });
                        }
                    }
                } catch (error) {
                    console.warn('Error processing mindmegette link:', error);
                }
                
                await this.delay(500); // Rate limiting
            }
            
            return recipes;
        } catch (error) {
            throw new Error(`Mindmegette search failed: ${error.message}`);
        }
    }

    async getMindmegetteDetails(url) {
        try {
            const html = await this.fetchWithRetry(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Hozzávalók - több lehetséges selector
            let ingredients = [];
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
                        .map(el => el.textContent.trim().replace(/\s+/g, ' '))
                        .filter(text => text.length > 2 && !text.includes('©'));
                    if (ingredients.length > 0) break;
                }
            }

            // Elkészítés - több lehetséges selector
            let instructions = [];
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
                        .map(el => el.textContent.trim().replace(/\s+/g, ' '))
                        .filter(text => text.length > 5 && !text.includes('©'));
                    if (instructions.length > 0) break;
                }
            }

            // Ha még mindig nincs találat, próbáljunk más megközelítést
            if (ingredients.length === 0) {
                const allElements = doc.querySelectorAll('li, p, div');
                for (const el of allElements) {
                    const text = el.textContent.trim().toLowerCase();
                    if (text.includes('hozzávaló') || text.includes('hozzavaló') || text.includes('alapanyag')) {
                        const parent = el.parentElement;
                        if (parent) {
                            const siblings = parent.querySelectorAll('li');
                            ingredients = Array.from(siblings)
                                .map(li => li.textContent.trim())
                                .filter(t => t.length > 2)
                                .slice(0, 10);
                            break;
                        }
                    }
                }
            }

            return {
                ingredients: ingredients.slice(0, 12),
                instructions: instructions.slice(0, 8)
            };

        } catch (error) {
            console.warn('Error getting mindmegette details:', error);
            return null;
        }
    }

    async scrapeNosalty(query) {
        try {
            const searchUrl = `https://www.nosalty.hu/kereses?q=${encodeURIComponent(query)}`;
            const html = await this.fetchWithRetry(searchUrl);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const recipes = [];
            const recipeLinks = doc.querySelectorAll('a[href*="/recept/"]');
            
            for (const link of Array.from(recipeLinks).slice(0, 3)) {
                try {
                    const href = link.getAttribute('href');
                    const fullUrl = href.startsWith('http') ? href : `https://www.nosalty.hu${href}`;
                    const title = link.textContent.trim() || link.querySelector('h2, h3, .title')?.textContent.trim();
                    
                    if (title && title.length > 3) {
                        const details = await this.getNosaltyDetails(fullUrl);
                        if (details) {
                            recipes.push({
                                title: title,
                                url: fullUrl,
                                source: 'nosalty.hu',
                                ...details
                            });
                        }
                    }
                } catch (error) {
                    console.warn('Error processing nosalty link:', error);
                }
                
                await this.delay(500);
            }
            
            return recipes;
        } catch (error) {
            throw new Error(`Nosalty search failed: ${error.message}`);
        }
    }

    async getNosaltyDetails(url) {
        try {
            const html = await this.fetchWithRetry(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Hozzávalók
            let ingredients = [];
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
                        .map(el => el.textContent.trim().replace(/\s+/g, ' '))
                        .filter(text => text.length > 2);
                    if (ingredients.length > 0) break;
                }
            }

            // Elkészítés
            let instructions = [];
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
                        .map(el => el.textContent.trim().replace(/\s+/g, ' '))
                        .filter(text => text.length > 5);
                    if (instructions.length > 0) break;
                }
            }

            return {
                ingredients: ingredients.slice(0, 12),
                instructions: instructions.slice(0, 8)
            };

        } catch (error) {
            console.warn('Error getting nosalty details:', error);
            return null;
        }
    }

    validateResults(results, query) {
        return results.filter(recipe => 
            recipe && 
            recipe.title && 
            recipe.title.length > 3 &&
            recipe.ingredients && 
            recipe.ingredients.length > 0 &&
            recipe.instructions && 
            recipe.instructions.length > 0
        ).map(recipe => ({
            ...recipe,
            ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : ['Hozzávalók betöltése sikertelen'],
            instructions: recipe.instructions.length > 0 ? recipe.instructions : ['Elkészítési útmutató betöltése sikertelen']
        }));
    }

    async generateRandomMeal() {
        const meals = {
            'Leves': ['gulyásleves', 'húsleves', 'zöldségleves', 'babgulyás', 'halászlé', 'krumplileves'],
            'Főétel': ['pörkölt', 'rántott hús', 'tészta', 'főzelék', 'sült csirke', 'töltött paprika', 'lasagne']
        };

        const randomSoup = meals['Leves'][Math.floor(Math.random() * meals['Leves'].length)];
        const randomMain = meals['Főétel'][Math.floor(Math.random() * meals['Főétel'].length)];

        console.log(`Generating random meal: ${randomSoup} + ${randomMain}`);

        const [soupResults, mainResults] = await Promise.allSettled([
            this.searchRecipes(randomSoup),
            this.searchRecipes(randomMain)
        ]);

        const meal = {
            'Leves': soupResults.status === 'fulfilled' && soupResults.value[0] ? 
                    soupResults.value[0] : this.createFallbackRecipe(randomSoup, 'Leves'),
            'Főétel': mainResults.status === 'fulfilled' && mainResults.value[0] ? 
                     mainResults.value[0] : this.createFallbackRecipe(randomMain, 'Főétel')
        };

        return meal;
    }

    createFallbackRecipe(name, type) {
        return {
            title: `${name} - ${type}`,
            source: 'fallback',
            url: '#',
            ingredients: [
                `${type.toLowerCase()} alapanyagok`,
                'só ízlés szerint',
                'bors ízlés szerint',
                'fűszerek',
                'olaj vagy zsír'
            ],
            instructions: [
                'Készítsd elő az alapanyagokat.',
                'Kövesd a hagyományos elkészítési módszert.',
                'Ízlés szerint fűszerezd.',
                'Szervírozd melegen, friss zöldségekkel.'
            ]
        };
    }
}

// Globális scraper
const scraper = new GitHubScraper();

// UI vezérlés
function setLoading(loading) {
    const btn = document.getElementById('searchBtn');
    const loadingEl = document.getElementById('loading');
    
    btn.disabled = loading;
    loadingEl.style.display = loading ? 'block' : 'none';
    
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
        const recipes = await scraper.searchRecipes(query);
        displayRecipes(recipes);
        
        if (recipes.length === 0) {
            showMessage('Nem találhatók receptek. Próbálj másik kulcsszót!', 'info');
        }
    } catch (error) {
        console.error('Search error:', error);
        showMessage(`Hiba történt: ${error.message}. Próbáld újra!`, 'error');
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
    } catch (error) {
        console.error('Random meal error:', error);
        showMessage(`Hiba a menü generálásakor: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

function displayRecipes(recipes) {
    const container = document.getElementById('results');
    
    if (recipes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 15px;">
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
                        ${recipe.ingredients.map(ing => `<li class="ingredient-item">${ing}</li>`).join('')}
                    </ul>
                </div>
                <div class="section">
                    <div class="section-title">👨‍🍳 Elkészítés</div>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(inst => `<li class="instruction-item">${inst}</li>`).join('')}
                    </ol>
                </div>
            </div>
            <div class="recipe-footer">
                <a href="${recipe.url}" target="_blank" rel="noopener" class="recipe-link">
                    📖 Teljes recept megtekintése
                </a>
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
                                    ${recipe.ingredients.slice(0, 6).map(ing => 
                                        `<li class="ingredient-item">${ing}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="recipe-footer">
                            <a href="${recipe.url}" target="_blank" rel="noopener" class="recipe-link">
                                📖 Teljes recept
                            </a>
                        </div>
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
    document.getElementById('results').innerHTML = '';
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

// Oldal betöltése
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍳 Családi Recept Kereső elindult!');
    document.getElementById('searchInput').focus();
    
    // Elrejtjük a loading állapotot
    document.getElementById('loading').style.display = 'none';
});
