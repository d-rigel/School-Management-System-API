const { validationRules } = require('../../static_arch/main.system');

module.exports = {
    // 'username': (data) => {
    //     if (data.trim().length < 3) {
    //         return false;
    //     }
    //     return true;
    // },

    // Email validator
    'email': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        return validationRules.email.test(data.trim());
    },

    // Password validator
    'password': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const { min, max } = validationRules.constraints.password;
        if (data.length < min || data.length > max) {
            return false;
        }
        return true;
    },

    // Strong password validator (with complexity requirements)
    'strongPassword': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const { min, max } = validationRules.constraints.password;
        if (data.length < min || data.length > max) {
            return false;
        }
        // At least 1 uppercase, 1 lowercase, 1 number, 1 special char
        const hasUppercase = /[A-Z]/.test(data);
        const hasLowercase = /[a-z]/.test(data);
        const hasNumber = /\d/.test(data);
        const hasSpecial = /[@$!%*?&]/.test(data);
        
        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            return false;
        }
        return true;
    },

    // Phone number validator
    'phone': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const cleanedPhone = data.replace(/[\s()-]/g, '');
        return validationRules.phone.test(cleanedPhone);
    },

    // MongoDB ObjectId validator
    'objectId': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        return validationRules.objectId.test(data);
    },

    // Academic year validator (e.g., 2024-2025)
    'academicYear': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        if (!validationRules.academicYear.test(data)) {
            return false;
        }
        const [startYear, endYear] = data.split('-').map(Number);
        if (endYear !== startYear + 1) {
            return false;
        }
        return true;
    },

    // School/Classroom code validator (uppercase alphanumeric with - and _)
    'code': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const { min, max } = validationRules.constraints.code;
        if (data.length < min || data.length > max) {
            return false;
        }
        return validationRules.code.test(data);
    },

    // Name validator (for first name, last name, etc.)
    'name': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const { min, max } = validationRules.constraints.name;
        const trimmed = data.trim();
        if (trimmed.length < min || trimmed.length > max) {
            return false;
        }
        return true;
    },

    // Date validator (ISO date string or Date object)
    'date': (data) => {
        if (!data) {
            return false;
        }
        const date = new Date(data);
        if (isNaN(date.getTime())) {
            return false;
        }
        return true;
    },

    // Date of birth validator (must be in the past)
    'dateOfBirth': (data) => {
        if (!data) {
            return false;
        }
        const date = new Date(data);
        if (isNaN(date.getTime())) {
            return false;
        }
        const now = new Date();
        if (date >= now) {
            return false;
        }
        return true;
    },

    // Gender validator
    'gender': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validGenders = ['male', 'female', 'other'];
        return validGenders.includes(data.toLowerCase());
    },

    // Role validator
    'role': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validRoles = ['superadmin', 'school_admin'];
        return validRoles.includes(data);
    },

    // Student status validator
    'studentStatus': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validStatuses = ['active', 'inactive', 'transferred', 'graduated'];
        return validStatuses.includes(data);
    },

    // Resource condition validator
    'resourceCondition': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validConditions = ['excellent', 'good', 'fair', 'poor'];
        return validConditions.includes(data);
    },

    // Positive number validator
    'positiveNumber': (data) => {
        const num = Number(data);
        if (isNaN(num)) {
            return false;
        }
        if (num <= 0) {
            return false;
        }
        return true;
    },

    // Non-negative number validator (includes 0)
    'nonNegativeNumber': (data) => {
        const num = Number(data);
        if (isNaN(num)) {
            return false;
        }
        if (num < 0) {
            return false;
        }
        return true;
    },

    // Year validator (for established year, etc.)
    'year': (data) => {
        const year = Number(data);
        if (isNaN(year)) {
            return false;
        }
        const currentYear = new Date().getFullYear();
        if (year < 1800 || year > currentYear) {
            return false;
        }
        return true;
    },

    // URL validator (for website)
    'url': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        try {
            new URL(data);
            return true;
        } catch (err) {
            return false;
        }
    },

    // Boolean validator
    'boolean': (data) => {
        if (typeof data === 'boolean') {
            return true;
        }
        if (data === 'true' || data === 'false') {
            return true;
        }
        return false;
    },

    // Array validator (checks if it's an array and not empty)
    'nonEmptyArray': (data) => {
        if (!Array.isArray(data)) {
            return false;
        }
        if (data.length === 0) {
            return false;
        }
        return true;
    },

    // String length validator
    'minLength': (min) => {
        return (data) => {
            if (!data || typeof data !== 'string') {
                return false;
            }
            if (data.trim().length < min) {
                return false;
            }
            return true;
        };
    },

    // Max length validator
    'maxLength': (max) => {
        return (data) => {
            if (!data || typeof data !== 'string') {
                return false;
            }
            if (data.length > max) {
                return false;
            }
            return true;
        };
    },

    // Range validator for numbers
    'inRange': (min, max) => {
        return (data) => {
            const num = Number(data);
            if (isNaN(num)) {
                return false;
            }
            if (num < min || num > max) {
                return false;
            }
            return true;
        };
    },

    // Postal code validator (flexible for different countries)
    'postalCode': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 3 || trimmed.length > 20) {
            return false;
        }
        return true;
    },

    // Address street validator
    'street': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 200) {
            return false;
        }
        return true;
    },

    // City validator
    'city': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 100) {
            return false;
        }
        return true;
    },

    // State/Province validator
    'state': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 100) {
            return false;
        }
        return true;
    },

    // Country validator
    'country': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 100) {
            return false;
        }
        return true;
    },

    // Relationship validator (for guardian)
    'relationship': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validRelationships = [
            'father', 'mother', 'parent', 'guardian', 
            'grandfather', 'grandmother', 'uncle', 'aunt', 
            'brother', 'sister', 'other'
        ];
        return validRelationships.includes(data.toLowerCase());
    },

    // Blood group validator
    'bloodGroup': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        return validGroups.includes(data.toUpperCase());
    },

    // Capacity validator (for classrooms)
    'capacity': (data) => {
        const num = Number(data);
        if (isNaN(num)) {
            return false;
        }
        if (num < 1 || num > 1000) {
            return false;
        }
        return true;
    },

    // Grade validator
    'grade': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const validGrades = [
            'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
            'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
            'Grade 11', 'Grade 12',
            'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5',
            'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10',
            'Year 11', 'Year 12', 'Year 13'
        ];
        return validGrades.includes(data);
    },

    // Section validator (A, B, C, etc.)
    'section': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 10) {
            return false;
        }
        return true;
    },

    // Student ID validator
    'studentId': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const trimmed = data.trim();
        if (trimmed.length < 1 || trimmed.length > 50) {
            return false;
        }
        return validationRules.code.test(trimmed);
    },

    // Transfer reason validator
    'transferReason': (data) => {
        if (!data || typeof data !== 'string') {
            return false;
        }
        const { min, max } = validationRules.constraints.description;
        const trimmed = data.trim();
        if (trimmed.length < min || trimmed.length > max) {
            return false;
        }
        return true;
    }
};


// module.exports = {
//     'username': (data)=>{
//         if(data.trim().length < 3){
//             return false;
//         }
//         return true;
//     },
// }