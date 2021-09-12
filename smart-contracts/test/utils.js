async function shouldThrow(promise, errorMessage='') {
	try {
		await promise;
		assert(true);
	}
	catch(e) {
		return;
	}
	assert(false, errorMessage);
}


//Using CommonJS module because NodeJS doesn't understand ES6
module.exports = {
	shouldThrow,
};