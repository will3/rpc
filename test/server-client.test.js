describe('server client', () => {
	let server, client;
	const runner = {
		add(a, b) {
			return a + b;
		},
		addAsync(a, b) {
			return Promise.resolve(a + b);
		}
	};

	beforeEach(async () => {
		server = require('../server')();
		client = require('../client')(runner);

		await server.onceConnected();
	});

	afterEach(() => {
		server.close();
	});

	it('close server with close', () => { 
		// Test would fail if server not released properly
	});

	it('runs rpc', async () => {
		const result = await server.rpc('add', [1, 2]);
		expect(result).toEqual(3);
	});

	it('runs async rpc', async () => {
		const result = await server.rpc('addAsync', [3, 4]);
		expect(result).toEqual(7);
	});
});