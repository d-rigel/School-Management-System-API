module.exports = {
    // User Schemas
    userRegister: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'role'],
        properties: {
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string', minLength: 8, maxLength: 128 },
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            role: { type: 'string', enum: ['superadmin', 'school_admin'] },
            schoolId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
        }
    },

    userLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 }
        }
    },

    userUpdate: {
        type: 'object',
        properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            isActive: { type: 'boolean' }
        }
    },

    // School Schemas
    schoolCreate: {
        type: 'object',
        required: ['name', 'code', 'address', 'contactInfo', 'totalCapacity'],
        properties: {
            name: { type: 'string', minLength: 3, maxLength: 200 },
            code: { type: 'string', minLength: 2, maxLength: 20, pattern: '^[A-Z0-9_-]+$' },
            address: {
                type: 'object',
                required: ['street', 'city', 'state', 'country', 'postalCode'],
                properties: {
                    street: { type: 'string', minLength: 1, maxLength: 200 },
                    city: { type: 'string', minLength: 1, maxLength: 100 },
                    state: { type: 'string', minLength: 1, maxLength: 100 },
                    country: { type: 'string', minLength: 1, maxLength: 100 },
                    postalCode: { type: 'string', minLength: 1, maxLength: 20 }
                }
            },
            contactInfo: {
                type: 'object',
                required: ['email', 'phone'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', minLength: 10, maxLength: 20 },
                    website: { type: 'string', format: 'uri' }
                }
            },
            principalName: { type: 'string', maxLength: 200 },
            establishedYear: { type: 'integer', minimum: 1800, maximum: new Date().getFullYear() },
            totalCapacity: { type: 'integer', minimum: 1 }
        }
    },

    schoolUpdate: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 3, maxLength: 200 },
            address: {
                type: 'object',
                properties: {
                    street: { type: 'string', minLength: 1, maxLength: 200 },
                    city: { type: 'string', minLength: 1, maxLength: 100 },
                    state: { type: 'string', minLength: 1, maxLength: 100 },
                    country: { type: 'string', minLength: 1, maxLength: 100 },
                    postalCode: { type: 'string', minLength: 1, maxLength: 20 }
                }
            },
            contactInfo: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', minLength: 10, maxLength: 20 },
                    website: { type: 'string', format: 'uri' }
                }
            },
            principalName: { type: 'string', maxLength: 200 },
            totalCapacity: { type: 'integer', minimum: 1 },
            isActive: { type: 'boolean' }
        }
    },

    // Classroom Schemas
    classroomCreate: {
        type: 'object',
        required: ['name', 'code', 'grade', 'capacity', 'academicYear'],
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 200 },
            code: { type: 'string', minLength: 1, maxLength: 50, pattern: '^[A-Z0-9_-]+$' },
            grade: { type: 'string', minLength: 1, maxLength: 50 },
            section: { type: 'string', maxLength: 10 },
            capacity: { type: 'integer', minimum: 1 },
            resources: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'quantity'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        quantity: { type: 'integer', minimum: 0 },
                        condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] }
                    }
                }
            },
            academicYear: { type: 'string', pattern: '^[0-9]{4}-[0-9]{4}$' }
        }
    },

    classroomUpdate: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 200 },
            capacity: { type: 'integer', minimum: 1 },
            resources: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'quantity'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        quantity: { type: 'integer', minimum: 0 },
                        condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] }
                    }
                }
            },
            isActive: { type: 'boolean' }
        }
    },

    // Student Schemas
    studentCreate: {
        type: 'object',
        required: ['studentId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'guardianInfo', 'academicYear'],
        properties: {
            studentId: { type: 'string', minLength: 1, maxLength: 50, pattern: '^[A-Z0-9_-]+$' },
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            classroomId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
            guardianInfo: {
                type: 'object',
                required: ['name', 'relationship', 'email', 'phone'],
                properties: {
                    name: { type: 'string', minLength: 2, maxLength: 200 },
                    relationship: { type: 'string', minLength: 2, maxLength: 50 },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', minLength: 10, maxLength: 20 },
                    address: {
                        type: 'object',
                        properties: {
                            street: { type: 'string', maxLength: 200 },
                            city: { type: 'string', maxLength: 100 },
                            state: { type: 'string', maxLength: 100 },
                            country: { type: 'string', maxLength: 100 },
                            postalCode: { type: 'string', maxLength: 20 }
                        }
                    }
                }
            },
            medicalInfo: {
                type: 'object',
                properties: {
                    bloodGroup: { type: 'string', maxLength: 10 },
                    allergies: { type: 'array', items: { type: 'string' } },
                    medications: { type: 'array', items: { type: 'string' } },
                    emergencyContact: { type: 'string', maxLength: 20 }
                }
            },
            academicYear: { type: 'string', pattern: '^[0-9]{4}-[0-9]{4}$' }
        }
    },

    studentUpdate: {
        type: 'object',
        properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            classroomId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
            guardianInfo: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 2, maxLength: 200 },
                    relationship: { type: 'string', minLength: 2, maxLength: 50 },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', minLength: 10, maxLength: 20 }
                }
            },
            status: { type: 'string', enum: ['active', 'inactive', 'transferred', 'graduated'] },
            medicalInfo: {
                type: 'object',
                properties: {
                    bloodGroup: { type: 'string', maxLength: 10 },
                    allergies: { type: 'array', items: { type: 'string' } },
                    medications: { type: 'array', items: { type: 'string' } },
                    emergencyContact: { type: 'string', maxLength: 20 }
                }
            }
        }
    },

    studentTransfer: {
        type: 'object',
        required: ['newSchoolId', 'reason'],
        properties: {
            newSchoolId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
            newClassroomId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
            reason: { type: 'string', minLength: 10, maxLength: 500 }
        }
    },

    // Pagination & Query Schemas
    paginationQuery: {
        type: 'object',
        properties: {
            page: { type: 'string', pattern: '^[0-9]+$' },
            limit: { type: 'string', pattern: '^[0-9]+$' },
            sort: { type: 'string', maxLength: 100 },
            order: { type: 'string', enum: ['asc', 'desc'] }
        }
    }
};