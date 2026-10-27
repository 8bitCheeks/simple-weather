const mongoose = require('mongoose');

/**
 * Favorite Schema
 * - city: String, required, trimmed
 * - timestamps: createdAt & updatedAt
 * - case-insensitive unique index on city with collation (strength: 2)
 * - virtual 'name' for backward compatibility with frontend
 */
const favoriteSchema = new mongoose.Schema(
	{
		city: {
			type: String,
			required: [true, 'City name is required.'],
			trim: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: (doc, ret) => {
				ret.name = ret.city;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
			transform: (doc, ret) => {
				ret.name = ret.city;
				return ret;
			},
		},
	}
);

// Virtual property 'name' so that frontend accessing fav.name continues to work seamlessly
favoriteSchema.virtual('name').get(function () {
	return this.city;
});

// Case-insensitive unique index so that duplicates like "London", "london", or "LONDON" cannot be saved
favoriteSchema.index(
	{ city: 1 },
	{
		unique: true,
		collation: { locale: 'en', strength: 2 },
	}
);

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
