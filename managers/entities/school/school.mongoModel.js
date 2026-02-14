const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true
        },
        website: String
    },
    principalName: {
        type: String,
        trim: true
    },
    establishedYear: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
    },
    totalCapacity: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
schoolSchema.index({ name: 'text', code: 'text' });
schoolSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('School', schoolSchema);