// API endpoint - Netlify Functions vagy similar service
const API_BASE_URL = 'https://your-netlify-app.netlify.app/.netlify/functions';

class RealRecipeScraper {
    constructor() {
        this.retryCount = 3;
        this.timeout = 10000;
    }

    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async searchRecipes(query) {
        console.log(`Searching for: ${query}`);
        
        try {
            // Használj Netlify Functions-t vagy más serverless megoldást
            const results = await this.makeRequest(
                `${API_BASE_URL}/scraper?query=${encodeURIComponent(query)}`
            );
            
            return this.processResults(results);
        } catch (error) {
            console.error('Search error:', error);
            
            // Fallback: próbálj meg közvetlen scrapelést CORS proxy-val
            return await this.directScrape(query);
        }
    }

    async directScrape(query) {
        const results = [];
        
        // Mindmegette.hu scrapelés
        try {
            const mindmegetteResults = await this.scrapeMindmegette(query);
            results.push(...mindmegetteResults);
        } catch (error) {
            console.error('Mindmegette scrape error:', error);
        }
        
        // Nosalty.hu scrapelés
        try {
            const nosaltyResults = await this.scrapeNosalty(query);
            results.push(...nosaltyResults);
        } catch (error) {
            console.error('Nosalty scrape error:', error);
        }
        
        return results;
    }

    async scrapeMindmegette(query) {
        const searchUrl = `https://www.mindmegette.hu/kereso/recipes/${encodeURIComponent(query)}`;
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        try {
            const response = await this.makeRequest(corsProxy + encodeURIComponent(searchUrl));
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            
            const recipes = [];
            const recipeElements = doc.querySelectorAll('.recipe-list-item, .recipe-card');
            
            for (const element of recipeElements) {
                try {
                    const titleElem = element.querySelector('.recipe-title, h2, h3');
                    const linkElem = element.querySelector('a');
                    const imageElem = element.querySelector('img');
                    
                    if (titleElem && linkElem) {
                        const title = titleElem.textContent.trim();
                        const relativeUrl = linkElem.getAttribute('href');
                        const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://www.mindmegette.hu${relativeUrl}`;
                        
                        // Scrape recipe details
                        const recipeDetails = await this.scrapeMindmegetteDetails(fullUrl);
                        
                        if (recipeDetails) {
                            recipes.push({
                                title: title,
                                url: fullUrl,
                                source: 'mindmegette.hu',
                                image: imageElem ? imageElem.getAttribute('src') : null,
                                ...recipeDetails
                            });
                        }
                        
                        // Limit to 3 recipes per source
                        if (recipes.length >= 3) break;
                    }
                } catch (itemError) {
                    console.error('Error processing recipe item:', itemError);
                }
            }
            
            return recipes;
        } catch (error) {
            throw new Error(`Mindmegette scrape failed: ${error.message}`);
        }
    }

    async scrapeMindmegetteDetails(url) {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        try {
            const response = await this.makeRequest(corsProxy + encodeURIComponent(url));
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            
            // Hozzávalók
            const ingredients = [];
            const ingredientElements = doc.querySelectorAll('.hozzavalok-list li, .ingredient-item');
            ingredientElements.forEach(elem => {
                const text = elem.textContent.trim().replace(/\s+/g, ' ');
                if (text && text.length > 2) {
                    ingredients.push(text);
                }
            });
            
            // Elkészítés
            const instructions = [];
            const instructionElements = doc.querySelectorAll('.preparation-steps li, .instruction-step');
            instructionElements.forEach(elem => {
                const text = elem.textContent.trim().replace(/\s+/g, ' ');
                if (text && text.length > 5) {
                    instructions.push(text);
                }
            });
            
            // Ha nincs találat, próbálj más selectorokat
            if (ingredients.length === 0) {
                const altIngredients = doc.querySelectorAll('[class*="hozzaval"], [class*="ingredient"]');
                altIngredients.forEach(elem => {
                    const text = elem.textContent.trim();
                    if (text && !text.includes('©') && text.length > 3) {
                        ingredients.push(text);
                    }
                });
            }
            
            if (instructions.length === 0) {
                const altInstructions = doc.querySelectorAll('[class*="elkeszit"], [class*="instruction"]');
                altInstructions.forEach(elem => {
                    const text = elem.textContent.trim();
                    if (text && !text.includes('©') && text.length > 10) {
                        instructions.push(text);
                    }
                });
            }
            
            return {
                ingredients: ingredients.slice(0, 15), // Limit ingredients
                instructions: instructions.slice(0, 10) // Limit instructions
            };
            
        } catch (error) {
            console.error('Error scraping recipe details:', error);
            return null;
        }
    }

    async scrapeNosalty(query) {
        const searchUrl = `https://www.nosalty.hu/kereses?q=${encodeURIComponent(query)}`;
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        try {
            const response = await this.makeRequest(corsProxy + encodeURIComponent(searchUrl));
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            
            const recipes = [];
            const recipeElements = doc.querySelectorAll('.recipe-card, .search-result-item');
            
            for (const element of recipeElements) {
                try {
                    const titleElem = element.querySelector('.recipe-title, .title, h2, h3');
                    const linkElem = element.querySelector('a');
                    const imageElem = element.querySelector('img');
                    
                    if (titleElem && linkElem) {
                        const title = titleElem.textContent.trim();
                        const relativeUrl = linkElem.getAttribute('href');
                        const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://www.nosalty.hu${relativeUrl}`;
                        
                        const recipeDetails = await this.scrapeNosaltyDetails(fullUrl);
                        
                        if (recipeDetails) {
                            recipes.push({
                                title: title,
                                url: fullUrl,
                                source: 'nosalty.hu',
                                image: imageElem ? imageElem.getAttribute('src') : null,
                                ...recipeDetails
                            });
                        }
                        
                        if (recipes.length >= 3) break;
                    }
                } catch (itemError) {
                    console.error('Error processing nosalty item:', itemError);
                }
            }
            
            return recipes;
        } catch (error) {
            throw new Error(`Nosalty scrape failed: ${error.message}`);
        }
    }

    async scrapeNosaltyDetails(url) {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        try {
            const response = await this.makeRequest(corsProxy + encodeURIComponent(url));
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            
            // Hozzávalók
            const ingredients = [];
            const ingredientElements = doc.querySelectorAll('.ingredient-list li, .hozzavalo-item');
            ingredientElements.forEach(elem => {
                const text = elem.textContent.trim().replace(/\s+/g, ' ');
                if (text && text.length > 2) {
                    ingredients.push(text);
                }
            });
            
            // Elkészítés
            const instructions = [];
            const instructionElements = doc.querySelectorAll('.instruction-list li, .step-item');
            instructionElements.forEach(elem => {
                const text = elem.textContent.trim().replace(/\s+/g, ' ');
                if (text && text.length > 5) {
                    instructions.push(text);
                }
            });
            
            // Alternatív selectorok
            if (ingredients.length === 0) {
                const altIngredients = doc.querySelectorAll('[class*="ingredient"], [class*="hozzavalo"]');
                altIngredients.forEach(elem => {
                    const text = elem.textContent.trim();
                    if (text && !text.includes('©') && text.length > 3) {
                        ingredients.push(text);
                    }
                });
            }
            
            if (instructions.length === 0) {
                const altInstructions = doc.querySelectorAll('[class*="instruction"], [class*="step"]');
                altInstructions.forEach(elem => {
                    const text = elem.textContent.trim();
                    if (text && !text.includes('©') && text.length > 10) {
                        instructions.push(text);
                    }
                });
            }
            
            return {
                ingredients: ingredients.slice(0, 15),
                instructions: instructions.slice(0, 10)
            };
            
        } catch (error) {
            console.error('Error scraping nosalty details:', error);
            return null;
        }
    }

    processResults(results) {
        return results.map(recipe => ({
            ...recipe,
            ingredients: recipe.ingredients || ['Hozzávalók nem elérhetők'],
            instructions: recipe.instructions || ['Elkészítési leírás nem elérhető']
        })).filter(recipe => 
            recipe.ingredients.length > 0 && 
            recipe.instructions.length > 0
        );
    }

    async generateRandomMeal() {
        const mealTypes = {
            'Leves': ['gulyásleves', 'húsleves', 'zöldségleves', 'babgulyás', 'halászlé'],
            'Főétel': ['pörkölt', 'rántott hús', 'tészta', 'főzelék', 'sült csirke', 'töltött paprika']
        };
        
        const randomSoup = mealTypes['Leves'][Math.floor(Math.random() * mealTypes['Leves'].length)];
        const randomMain = mealTypes['Főétel'][Math.floor(Math.random() * mealTypes['Főétel'].length)];
        
        const [soupResults, mainResults] = await Promise.all([
            this.searchRecipes(randomSoup),
            this.searchRecipes(randomMain)
        ]);
        
        return {
            'Leves': soupResults[0] || await this.createFallbackRecipe(randomSoup, 'Leves'),
            'Főétel': mainResults[0] || await this.createFallbackRecipe(randomMain, 'Főétel')
        };
    }

    async createFallbackRecipe(name, type) {
        return {
            title: `${name} - ${type}`,
            source: 'fallback',
            url: '#',
            ingredients: [
                `${type.toLowerCase()} alapanyagok`,
                'só ízlés szerint',
                'bors ízlés szerint',
                'fűszerek'
            ],
            instructions: [
                'Készítsd el a hagyományos módon.',
                'Ízlés szerint fűszerezd.',
                'Szervírozd melegen.'
            ]
        };
    }
}

// Globális scraper példány
const scraper = new RealRecipeScraper();

// UI vezérlő függvények
function updateButtonState(loading) {
    const searchBtn = document.getElementById('searchBtn');
    const btnText = searchBtn.querySelector('.btn-text');
    const btnLoading = searchBtn.querySelector('.btn-loading');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        searchBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        searchBtn.disabled = false;
    }
}

async function searchRecipes() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Kérjük, írj be egy recept nevet!');
        return;
    }
    
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const randomMeal = document.getElementById('randomMeal');
    const errorMessage = document.getElementById('errorMessage');
    
    loading.style.display = 'block';
    results.innerHTML = '';
    randomMeal.style.display = 'none';
    errorMessage.style.display = 'none';
    updateButtonState(true);
    
    try {
        const recipes = await scraper.searchRecipes(query);
        displayResults(recipes);
        
        if (recipes.length === 0) {
            showInfo('Nem találhatók receptek a megadott kulcsszóra. Próbálj másik kifejezést.');
        }
    } catch (error) {
        showError(`Hiba történt a keresés során: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        updateButtonState(false);
    }
}

async function generateRandomMeal() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const randomMeal = document.getElementById('randomMeal');
    const errorMessage = document.getElementById('errorMessage');
    
    loading.style.display = 'block';
    results.innerHTML = '';
    randomMeal.style.display = 'none';
    errorMessage.style.display = 'none';
    
    try {
        const meal = await scraper.generateRandomMeal();
        displayRandomMeal(meal);
    } catch (error) {
        showError(`Hiba történt a menü generálása során: ${error.message}`);
    } finally {
        loading.style.display = 'none';
    }
}

function displayResults(recipes) {
    const results = document.getElementById('results');
    
    if (recipes.length === 0) {
        results.innerHTML = `
            <div class="no-results">
                <h3>😔 Nincs találat</h3>
                <p>Próbálj meg másik kulcsszót, vagy használd a véletlenszerű menü generátort!</p>
            </div>
        `;
        return;
    }
    
    results.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <h3 class="recipe-title">${recipe.title}</h3>
                <span class="source-badge">${recipe.source}</span>
            </div>
            <div class="recipe-content">
                <div class="ingredients-section">
                    <h4 class="section-title">📝 Hozzávalók</h4>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ingredient => `
                            <li class="ingredient-item">${ingredient}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="instructions-section">
                    <h4 class="section-title">👨‍🍳 Elkészítés</h4>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(instruction => `
                            <li class="instruction-item">${instruction}</li>
                        `).join('')}
                    </ol>
                </div>
            </div>
            <div class="recipe-footer">
                <a href="${recipe.url}" target="_blank" rel="noopener" class="original-link">
                    📖 Teljes recept megtekintése
                </a>
            </div>
        </div>
    `).join('');
}

function displayRandomMeal(meal) {
    const randomMeal = document.getElementById('randomMeal');
    
    randomMeal.innerHTML = `
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
                            <h4 class="recipe-title">${recipe.title}</h4>
                            <span class="source-badge">${recipe.source}</span>
                        </div>
                        <div class="recipe-content">
                            <div class="ingredients-section">
                                <h5 class="section-title">📝 Hozzávalók</h5>
                                <ul class="ingredients-list">
                                    ${recipe.ingredients.slice(0, 8).map(ingredient => `
                                        <li class="ingredient-item">${ingredient}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="recipe-footer">
                            <a href="${recipe.url}" target="_blank" rel="noopener" class="original-link">
                                📖 Teljes recept
                            </a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button class="random-btn" onclick="generateRandomMeal()">
                <span class="btn-icon">🔄</span>
                Új Menü Generálása
            </button>
        </div>
    `;
    
    randomMeal.style.display = 'block';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `
        <h3>❌ Hiba</h3>
        <p>${message}</p>
    `;
    errorMessage.style.display = 'block';
}

function showInfo(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `
        <h3>ℹ️ Információ</h3>
        <p>${message}</p>
    `;
    errorMessage.style.display = 'block';
}

function quickSearch(query) {
    document.getElementById('searchInput').value = query;
    searchRecipes();
}

function clearResults() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('randomMeal').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('searchInput').value = '';
}

// Event listeners
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});

// Inicializálás
document.addEventListener('DOMContentLoaded', function() {
    console.log('🥘 Családi Recept Kereső betöltve!');
    
    // Automatikus fókusz a keresőmezőre
    document.getElementById('searchInput').focus();
});
