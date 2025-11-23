"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dex_router_1 = require("./dex-router");
describe('DexRouter', () => {
    let router;
    beforeEach(() => {
        router = new dex_router_1.DexRouter();
    });
    it('should return quotes from both DEXs', async () => {
        const quotes = await router.getQuotes('SOL', 'USDC', 1);
        expect(quotes).toHaveLength(2);
        expect(quotes.find(q => q.dex === 'raydium')).toBeDefined();
        expect(quotes.find(q => q.dex === 'meteora')).toBeDefined();
    });
    it('should select the best route (highest price)', () => {
        const quotes = [
            { dex: 'raydium', price: 100, fee: 0.01 },
            { dex: 'meteora', price: 101, fee: 0.01 },
        ];
        const best = router.selectBestRoute(quotes);
        expect(best.dex).toBe('meteora');
        expect(best.price).toBe(101);
    });
});
