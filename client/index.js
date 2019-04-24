const io = require('socket.io-client');

module.exports = (handler, config) => {
	config = config || {};
	const host = config.host || 'http://localhost:8083';
	const socket = io(host);

	socket.on('rpc', (data) => {
		if (typeof handler[data.method] !== 'function') {
			// TODO error
			return;
		}

		const result = handler[data.method].apply(handler, data.params);
		const id = data.id;

		if (typeof result.then === 'function') {
			result.then((obj) => {
				resolve(id, obj);
			}).catch((err) => {
				reject(id, err);
			});
		} else {
			resolve(id, result);
		}

		function resolve(id, result) {
			socket.emit('resolve', {
				id,
				result
			});
		};

		function reject(id, error) {
			socket.emit('reject', {
				id,
				error
			});
		};
	});
};