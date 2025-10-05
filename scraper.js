class RealScraper {
    constructor() {
        this.userAgent = navigator.userAgent;
        console.log('🌐 RealScraper initialized with User Agent:', this.userAgent);
    }

    async fetchWithBrowser(url) {
        try {
            console.log('🔗 Browser fetch:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache'
                },
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();
            
            if (!text || text.length < 1000) {
                throw new Error('Empty response');
            }

            return text;

        } catch (error) {
            console.error('❌ Browser fetch failed:', error.message);
            throw error;
        }
    }

    async searchRecipes(query) {
        console.log('🔍 RealScraper searching:', query);
        
        const results = [];
        
        try {
            // Try Mindmegette
            const mindmegetteResults = await this.searchMindmegette(query);
            results.push(...mindmegetteResults);
        } catch (error) {
            console.error('❌ Mindmegette failed:', error.message);
        }
        
        try {
            // Try Nosalty
            const nosaltyResults = await this.searchNosalty(query);
            results.push(...nosaltyResults);
        } catch (error) {
            console.error('❌ Nosalty failed:', error.message);
        }
        
        // Filter valid results
        const validResults = results.filter(recipe => 
            recipe && 
            recipe.ingredients && 
            recipe.ingredients.length > 0 &&
            recipe.instructions &&
            recipe.instructions.length > 0
        );
        
        console.log(`✅ RealScraper found ${validResults.length} valid recipes`);
        return validResults;
    }

    async searchMindmegette(query) {
        const searchUrl = `https://www.mindmegette.hu/kereses?global_filter=${encodeURIComponent(query)}&content_types%5B%5D=recipe`;
        console.log('🔍 Mindmegette URL:', searchUrl);
        
        const html = await this.fetchWithBrowser(searchUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const recipes = [];
        const links = doc.querySelectorAll('a[href*="/recept/"]');
        
        console.log(`📊 Mindmegette links found: ${links.length}`);
        
        for (const link of Array.from(links).slice(0, 3)) {
            try {
                const href = link.getAttribute('href');
                if (!href) continue;
                
                let fullUrl = href.startsWith('http') ? href : `https://www.mindmegette.hu${href}`;
                let title = link.textContent?.trim() || `${query} recept`;
                
                if (title.length > 5) {
                    const details = await this.getMindmegetteDetails(fullUrl);
                    if (details) {
                        recipes.push({
                            title: title.substring(0, 100),
                            url: fullUrl,
                            source: 'mindmegette.hu',
                            ...details
                        });
                    }
                }
            } catch (error) {
                console.warn('Error processing Mindmegette link:', error);
            }
        }
        
        return recipes;
    }

    async searchNosalty(query) {
        const searchUrl = `https://www.nosalty.hu/kereses/recept/${encodeURIComponent(query)}`;
        console.log('🔍 Nosalty URL:', searchUrl);
        
        const html = await this.fetchWithBrowser(searchUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const recipes = [];
        const links = doc.querySelectorAll('a[href*="/recept/"]');
        
        console.log(`📊 Nosalty links found: ${links.length}`);
        
        for (const link of Array.from(links).slice(0, 3)) {
            try {
                const href = link.getAttribute('href');
                if (!href) continue;
                
                let fullUrl = href.startsWith('http') ? href : `https://www.nosalty.hu${href}`;
                let title = link.textContent?.trim() || `${query} recept`;
                
                if (title.length > 5) {
                    const details = await this.getNosaltyDetails(fullUrl);
                    if (details) {
                        recipes.push({
                            title: title.substring(0, 100),
                            url: fullUrl,
                            source: 'nosalty.hu',
                            ...details
                        });
                    }
                }
            } catch (error) {
                console.warn('Error processing Nosalty link:', error);
            }
        }
        
        return recipes;
    }

    async getMindmegetteDetails(url) {
        try {
            const html = await this.fetchWithBrowser(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let ingredients = [];
            let instructions = [];
            
            // Multiple ingredient selectors
            const ingSelectors = ['.hozzavalok-list li', '.ingredients li', '[class*="hozzaval"] li'];
            for (const selector of ingSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    ingredients = Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 2);
                    break;
                }
            }
            
            // Multiple instruction selectors
            const instSelectors = ['.preparation-steps li', '.instructions li', '[class*="elkeszit"] li'];
            for (const selector of instSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    instructions = Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 5);
                    break;
                }
            }
            
            return {
                ingredients: ingredients.length > 0 ? ingredients.slice(0, 12) : ['Hozzávalók betöltése sikertelen'],
                instructions: instructions.length > 0 ? instructions.slice(0, 8) : ['Elkészítés betöltése sikertelen']
            };
            
        } catch (error) {
            console.error('Error getting Mindmegette details:', error);
            return null;
        }
    }

    async getNosaltyDetails(url) {
        try {
            const html = await this.fetchWithBrowser(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let ingredients = [];
            let instructions = [];
            
            // Nosalty ingredient selectors
            const ingSelectors = ['.ingredient-list li', '.hozzavalok li', '[class*="ingredient"] li'];
            for (const selector of ingSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    ingredients = Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 2);
                    break;
                }
            }
            
            // Nosalty instruction selectors
            const instSelectors = ['.instruction-list li', '.steps li', '[class*="instruction"] li'];
            for (const selector of instSelectors) {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    instructions = Array.from(elements)
                        .map(el => el.textContent?.trim() || '')
                        .filter(text => text.length > 5);
                    break;
                }
            }
            
            return {
                ingredients: ingredients.length > 0 ? ingredients.slice(0, 12) : ['Hozzávalók betöltése sikertelen'],
                instructions: instructions.length > 0 ? instructions.slice(0, 8) : ['Elkészítés betöltése sikertelen']
            };
            
        } catch (error) {
            console.error('Error getting Nosalty details:', error);
            return null;
        }
    }
}

// Export for use in main script
window.RealScraper = RealScraper;
