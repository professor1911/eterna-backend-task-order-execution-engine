import { DexRouter } from './dex-router';

describe('DexRouter', () => {
    let router: DexRouter;

    beforeEach(() => {
        router = new DexRouter();
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
        ] as any;

        const best = router.selectBestRoute(quotes);
        expect(best.dex).toBe('meteora');
        expect(best.price).toBe(101);
    });
});
