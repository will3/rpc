const guid = require('uuid/v4');
const ee = require('event-emitter');

module.exports = (config) => {
	config = config || {};
	const port = config.port || 8083;
	const interval = config.interval || 20;
	const maxWait = config.maxWait || 20000;

	const io = require("socket.io").listen(port);

	const resolved = {};
	const rejected = {};

	const events = ee();

	const sockets = [];

	io.on('connection', (socket) => {
		events.emit('connection', socket);
		sockets.push(socket);

		socket.on('resolve', (data) => {
			resolved[data.id] = data;
		});

		socket.on('reject', (data) => {
			rejected[data.id] = data;
		});

		socket.on('disconnect', () => {
			events.emit('disconnect', socket);
			sockets.splice(sockets.indexOf(socket), 1);
		})
	});

	const rpc = async(method, params) => {
		if (sockets.length === 0) {
			return;
		}

		const socket = sockets[0];

		const id = guid();
		socket.emit('rpc', {
			id,
			method,
			params
		});

		return new Promise((resolve, reject) => {
			const start = new Date().getTime();
			const instance = setInterval(() => {
				if (resolved[id] != null) {
					resolve(resolved[id].result);
					clearInterval(instance);
				} else if (rejected[id] != null) {
					reject(rejected[id].error);
					clearInterval(instance);
				}

				if (new Date().getTime() - start > maxWait) {
					reject(new Error('Rpc timed out'));
					clearInterval(instance);
				}
			}, interval);
		});
	};

	const close = () => {
		io.close();
	};

	const onceConnected = async () => {
		return new Promise((resolve, reject) => {
			events.once('connection', () => {
				resolve();
			});
		});
	};

	return {
		rpc, close, events, onceConnected
	};
};