import WebSocket from 'ws';
import axios from 'axios';

async function main() {
    try {
        // Check if server is running
        console.log('Checking server connection...');
        try {
            await axios.get('http://localhost:3000/api/orders/execute', { timeout: 2000 });
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED') {
                console.error('\n Error: Server is not running!');
                console.error('Please start the server first with: npm run dev\n');
                process.exit(1);
            }
        }

        // 1. Submit Order
        console.log('Submitting order...');
        const response = await axios.post('http://localhost:3000/api/orders/execute', {
            tokenIn: 'SOL',
            tokenOut: 'USDC',
            amount: 1.5,
        });

        const { orderId } = response.data;
        console.log(`Order submitted. ID: ${orderId}`);

        // 2. Connect to WebSocket
        console.log('Connecting to WebSocket...');
        const ws = new WebSocket(`ws://localhost:3000/api/orders/ws/${orderId}`);

        ws.on('open', () => {
            console.log('WebSocket connected');
        });

        ws.on('message', (data) => {
            const update = JSON.parse(data.toString());
            console.log('Update received:', update);

            if (update.status === 'confirmed' || update.status === 'failed') {
                console.log('Final status reached. Closing connection.');
                ws.close();
            }
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
