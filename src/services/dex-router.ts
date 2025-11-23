import { Order } from '@prisma/client';

interface Quote {
    dex: 'raydium' | 'meteora';
    price: number;
    fee: number;
}

export class DexRouter {
    private basePrices: Record<string, number> = {
        'SOL-USDC': 150.0, // Mock base price
        'BTC-USDC': 60000.0,
    };

    async getQuotes(tokenIn: string, tokenOut: string, amount: number): Promise<Quote[]> {
        const pair = `${tokenIn}-${tokenOut}`;
        const basePrice = this.basePrices[pair] || 100; // Default mock price

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        const raydiumPrice = basePrice * (0.98 + Math.random() * 0.04); // +/- 2% variance
        const meteoraPrice = basePrice * (0.97 + Math.random() * 0.05); // +/- 2.5% variance

        return [
            { dex: 'raydium', price: raydiumPrice, fee: 0.003 },
            { dex: 'meteora', price: meteoraPrice, fee: 0.002 },
        ];
    }

    selectBestRoute(quotes: Quote[]): Quote {
        // Simple logic: highest price for sell (not handled here, assuming buy for simplicity or just price comparison)
        // Actually, for a swap, if we are buying, we want the lowest price (if price is quoted in QuoteToken/BaseToken).
        // Let's assume price is "Amount of TokenOut per 1 TokenIn". So we want the HIGHEST output.
        // So we want the highest price.
        return quotes.reduce((prev, current) => (prev.price > current.price ? prev : current));
    }

    async executeSwap(dex: string, order: Order): Promise<{ txHash: string; executedPrice: number }> {
        // Simulate execution delay
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

        // In a real app, we'd fetch the quote again or use the one we locked in.
        // Here we just simulate a successful execution close to the requested price.
        // We don't have the original quote here easily without passing it, but for mock it's fine.
        const pair = `${order.tokenIn}-${order.tokenOut}`;
        const basePrice = this.basePrices[pair] || 100;
        const variance = Math.random() * 0.01; // Small slippage
        const executedPrice = basePrice * (1 + variance);

        return {
            txHash: 'tx_' + Math.random().toString(36).substring(7),
            executedPrice,
        };
    }
}
