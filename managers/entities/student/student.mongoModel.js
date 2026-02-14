const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
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
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        index: true
    },
    guardianInfo: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        phone: { type: String, required: true },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    enrollmentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    enrollmentHistory: [{
        schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
        enrollmentDate: Date,
        exitDate: Date,
        reason: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'transferred', 'graduated'],
        default: 'active',
        index: true
    },
    medicalInfo: {
        bloodGroup: String,
        allergies: [String],
        medications: [String],
        emergencyContact: String
    },
    academicYear: {
        type: String,
        required: true
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
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ classroomId: 1, status: 1 });
studentSchema.index({ schoolId: 1, classroomId: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', studentId: 'text' });

module.exports = mongoose.model('Student', studentSchema);