const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    currentEnrollment: {
        type: Number,
        default: 0,
        min: 0
    },
    resources: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        condition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor'],
            default: 'good'
        }
    }],
    academicYear: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
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

// Compound indexes
classroomSchema.index({ schoolId: 1, code: 1 }, { unique: true });
classroomSchema.index({ schoolId: 1, isActive: 1 });
classroomSchema.index({ schoolId: 1, grade: 1, academicYear: 1 });

// Validation: currentEnrollment cannot exceed capacity
classroomSchema.pre('save', function(next) {
    if (this.currentEnrollment > this.capacity) {
        next(new Error('Current enrollment cannot exceed classroom capacity'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Classroom', classroomSchema);