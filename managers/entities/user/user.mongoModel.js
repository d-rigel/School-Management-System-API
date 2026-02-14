const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'school_admin'],
        required: true,
        index: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function() {
            return this.role === 'school_admin';
        },
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastLogin: {
        type: Date
    },
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ schoolId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);