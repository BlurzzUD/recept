class RecipeManager {
    constructor() {
        this.realScraper = new RealScraper();
        this.recipeDatabase = new RecipeDatabase();
        this.cache = new Map();
        console.log('🍳 RecipeManager initialized');
    }

    async searchRecipes(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        // Check cache first
        if (this.cache.has(lowerQuery)) {
            console.log('💾 Using cached results');
            return this.cache.get(lowerQuery);
        }
        
        let results = [];
        
        // Try real scraper first
        try {
            console.log('🌐 Attempting real scrape...');
            results = await this.realScraper.searchRecipes(query);
            
            if (results.length > 0) {
                console.log('✅ Real scraper successful');
                this.cache.set(lowerQuery, results);
                return results;
            }
        } catch (error) {
            console.log('❌ Real scraper failed:', error.message);
        }
        
        // Fall back to database
        console.log('📚 Falling back to recipe database');
        results = this.recipeDatabase.searchRecipes(query);
        
        if (results.length === 0) {
            console.log('📝 Creating fallback recipe');
            results = [this.createFallbackRecipe(query)];
        }
        
        this.cache.set(lowerQuery, results);
        return results;
    }

    createFallbackRecipe(query) {
        return {
            title: `${query} - recept`,
            source: 'helyi adatbázis',
            url: '#',
            ingredients: [
                `${query} alapanyagok`,
                'só ízlés szerint',
                'bors ízlés szerint',
                'olaj vagy vaj',
                'fűszerek',
                'friss zöldségek'
            ],
            instructions: [
                'Előkészítsd az alapanyagokat.',
                'Kövesd a hagyományos elkészítési módszert.',
                'Ízlés szerint fűszerezd.',
                'Szervírozd frissen, melegen.',
                'Jó étvágyat!'
            ]
        };
    }

    async generateRandomMeal() {
        try {
            // Try database first for reliability
            return await this.recipeDatabase.generateRandomMeal();
        } catch (error) {
            console.error('Random meal error:', error);
            // Fallback random meal
            const soups = this.recipeDatabase.searchRecipes('leves');
            const mains = this.recipeDatabase.searchRecipes('pörkölt');
            
            return {
                'Leves': soups[0] || this.createFallbackRecipe('húsleves'),
                'Főétel': mains[0] || this.createFallbackRecipe('pörkölt')
            };
        }
    }
}

// Global recipe manager
const recipeManager = new RecipeManager();

// UI Functions (same as before)
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
                    <button onclick="quickSearch('gulyás')">Gulyás</button>
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
    document.getElementById('searchInput').focus();
    document.getElementById('loading').style.display = 'none';
    
    showMessage('Üdvözöllek! A kereső először a weboldalakat próbálja, majd a 1000+ receptes adatbázist használja.', 'info');
    setTimeout(hideMessage, 5000);
});
