const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the connection string in process.env.MONGODB_URI.
 * Logs a clear message on success.
 * If the connection fails, logs the error and exits the process (code 1)
 * so the server won't run in a broken state.
 */
async function connectDB() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		console.error('[Database Error] MONGODB_URI is missing from environment variables.');
		process.exit(1);
	}

	try {
		const conn = await mongoose.connect(uri);
		console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		console.error(`[Database Error] Failed to connect to MongoDB Atlas: ${error.message}`);
		process.exit(1);
	}
}

module.exports = connectDB;
