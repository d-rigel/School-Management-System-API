/**
 * School Management System Architecture
 * Defines layers, actions, and system-wide configurations
 * 
 * IMPORTANT: SharkFin manager requires actions to NOT use 0 as a rank
 * All action values must be >= 1 or -1 for blocked
 */

const layers = {
    // Core middleware layers
    security: ['__device', '__rateLimiter', '__inputSanitizer'],
    logging: ['__requestLogger'],
    auth: ['__token'],
    
    // Role-based access layers
    roles: {
        superadmin: ['__token', '__rbac:superadmin'],
        schoolAdmin: ['__token', '__rbac:school_admin'],
        authenticated: ['__token']
    },
    
    // Data access layers
    data: {
        withQuery: ['__query'],
        withParams: ['__params'],
        withHeaders: ['__headers']
    }
};

/**
 * Permission levels (hierarchical)
 * CRITICAL: SharkFin requires NO 0 values!
 * Values must start from 1 or higher (or -1 for blocked)
 */
const actions = {
    blocked: -1,    // Blocked users
    none: 1,        // ✅ CHANGED from 0 to 1 (minimum access)
    read: 2,        // ✅ CHANGED from 1 to 2
    create: 3,      // ✅ CHANGED from 2 to 3
    update: 4,      // ✅ CHANGED from 3 to 4
    delete: 5,      // ✅ CHANGED from 4 to 5
    admin: 6,       // ✅ CHANGED from 5 to 6
    superadmin: 7   // ✅ CHANGED from 6 to 7
};

const permissions = {
    // Schools
    schools: {
        create: ['superadmin'],
        read: ['superadmin', 'school_admin'],
        update: ['superadmin'],
        delete: ['superadmin'],
        list: ['superadmin', 'school_admin'],
        stats: ['superadmin', 'school_admin']
    },
    
    // Classrooms
    classrooms: {
        create: ['superadmin', 'school_admin'],
        read: ['superadmin', 'school_admin'],
        update: ['superadmin', 'school_admin'],
        delete: ['superadmin', 'school_admin'],
        list: ['superadmin', 'school_admin'],
        stats: ['superadmin', 'school_admin']
    },
    
    // Students
    students: {
        create: ['superadmin', 'school_admin'],
        read: ['superadmin', 'school_admin'],
        update: ['superadmin', 'school_admin'],
        delete: ['superadmin', 'school_admin'],
        transfer: ['superadmin', 'school_admin'],
        list: ['superadmin', 'school_admin']
    },
    
    // Users
    users: {
        register: ['public'],
        login: ['public'],
        profile: ['superadmin', 'school_admin'],
        updateProfile: ['superadmin', 'school_admin'],
        changePassword: ['superadmin', 'school_admin']
    }
};

const preStackConfig = {
    // Public endpoints (no auth required)
    public: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer'],
    
    // Authenticated endpoints (any role)
    authenticated: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token'],
    
    // Superadmin only endpoints
    superadmin: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token', '__rbac:superadmin'],
    
    // School admin endpoints
    schoolAdmin: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token', '__rbac:school_admin']
};

const apiConfig = {
    // Auth endpoints
    auth: {
        register: {
            preStack: preStackConfig.public,
            permissions: ['public']
        },
        login: {
            preStack: preStackConfig.public,
            permissions: ['public']
        },
        logout: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        refresh: {
            preStack: preStackConfig.public,
            permissions: ['public']
        },
        profile: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        updateProfile: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        changePassword: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        }
    },
    
    // Schools endpoints
    schools: {
        create: {
            preStack: preStackConfig.superadmin,
            permissions: ['superadmin']
        },
        get: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        list: {
            preStack: [...preStackConfig.authenticated, '__query'],
            permissions: ['superadmin', 'school_admin']
        },
        update: {
            preStack: preStackConfig.superadmin,
            permissions: ['superadmin']
        },
        delete: {
            preStack: preStackConfig.superadmin,
            permissions: ['superadmin']
        },
        stats: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        }
    },
    
    // Classrooms endpoints
    classrooms: {
        create: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        get: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        list: {
            preStack: [...preStackConfig.authenticated, '__query'],
            permissions: ['superadmin', 'school_admin']
        },
        update: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        delete: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        stats: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        }
    },
    
    // Students endpoints
    students: {
        create: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        get: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        list: {
            preStack: [...preStackConfig.authenticated, '__query'],
            permissions: ['superadmin', 'school_admin']
        },
        update: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        delete: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        },
        transfer: {
            preStack: preStackConfig.authenticated,
            permissions: ['superadmin', 'school_admin']
        }
    }
};

const rateLimits = {
    // Public endpoints - stricter limits
    public: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50 // 50 requests per window
    },
    
    // Authenticated endpoints - more lenient
    authenticated: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // 100 requests per window
    },
    
    // Admin endpoints - highest limits
    admin: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200 // 200 requests per window
    }
};

const validationRules = {
    // Field validation patterns
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[0-9]{10,20}$/,
    objectId: /^[0-9a-fA-F]{24}$/,
    academicYear: /^[0-9]{4}-[0-9]{4}$/,
    code: /^[A-Z0-9_-]+$/,
    
    // Length constraints
    constraints: {
        password: { min: 8, max: 128 },
        name: { min: 2, max: 100 },
        email: { min: 5, max: 255 },
        code: { min: 2, max: 20 },
        description: { min: 10, max: 1000 }
    }
};

const systemDefaults = {
    // Pagination
    pagination: {
        defaultPage: 1,
        defaultLimit: 20,
        maxLimit: 100
    },
    
    // JWT
    jwt: {
        accessTokenExpiry: '24h',
        refreshTokenExpiry: '7d'
    },
    
    // Academic
    academic: {
        currentYear: '2024-2025',
        grades: [
            'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
            'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
            'Grade 11', 'Grade 12'
        ]
    },
    
    // Status values
    status: {
        student: ['active', 'inactive', 'transferred', 'graduated'],
        general: ['active', 'inactive']
    }
};

module.exports = {
    layers,
    actions,
    permissions,
    preStackConfig,
    apiConfig,
    rateLimits,
    validationRules,
    systemDefaults
};





// const layers = {
//     // Core middleware layers
//     security: ['__device', '__rateLimiter', '__inputSanitizer'],
//     logging: ['__requestLogger'],
//     auth: ['__token'],
    
//     // Role-based access layers
//     roles: {
//         superadmin: ['__token', '__rbac:superadmin'],
//         schoolAdmin: ['__token', '__rbac:school_admin'],
//         authenticated: ['__token']
//     },
    
//     // Data access layers
//     data: {
//         withQuery: ['__query'],
//         withParams: ['__params'],
//         withHeaders: ['__headers']
//     }
// };

// const actions = {
//     // Permission levels (hierarchical)
//     blocked: -1,
//     none: 0,
//     read: 1,
//     create: 2,
//     update: 3,
//     delete: 4,
//     admin: 5,
//     superadmin: 6
// };

// const permissions = {
//     // Schools
//     schools: {
//         create: ['superadmin'],
//         read: ['superadmin', 'school_admin'],
//         update: ['superadmin'],
//         delete: ['superadmin'],
//         list: ['superadmin', 'school_admin'],
//         stats: ['superadmin', 'school_admin']
//     },
    
//     // Classrooms
//     classrooms: {
//         create: ['superadmin', 'school_admin'],
//         read: ['superadmin', 'school_admin'],
//         update: ['superadmin', 'school_admin'],
//         delete: ['superadmin', 'school_admin'],
//         list: ['superadmin', 'school_admin'],
//         stats: ['superadmin', 'school_admin']
//     },
    
//     // Students
//     students: {
//         create: ['superadmin', 'school_admin'],
//         read: ['superadmin', 'school_admin'],
//         update: ['superadmin', 'school_admin'],
//         delete: ['superadmin', 'school_admin'],
//         transfer: ['superadmin', 'school_admin'],
//         list: ['superadmin', 'school_admin']
//     },
    
//     // Users
//     users: {
//         register: ['public'],
//         login: ['public'],
//         profile: ['superadmin', 'school_admin'],
//         updateProfile: ['superadmin', 'school_admin'],
//         changePassword: ['superadmin', 'school_admin']
//     }
// };

// const preStackConfig = {
//     // Public endpoints (no auth required)
//     public: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer'],
    
//     // Authenticated endpoints (any role)
//     authenticated: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token'],
    
//     // Superadmin only endpoints
//     superadmin: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token', '__rbac:superadmin'],
    
//     // School admin endpoints
//     schoolAdmin: ['__device', '__requestLogger', '__rateLimiter', '__inputSanitizer', '__token', '__rbac:school_admin']
// };

// const apiConfig = {
//     // Auth endpoints
//     auth: {
//         register: {
//             preStack: preStackConfig.public,
//             permissions: ['public']
//         },
//         login: {
//             preStack: preStackConfig.public,
//             permissions: ['public']
//         },
//         logout: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         refresh: {
//             preStack: preStackConfig.public,
//             permissions: ['public']
//         },
//         profile: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         updateProfile: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         changePassword: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         }
//     },
    
//     // Schools endpoints
//     schools: {
//         create: {
//             preStack: preStackConfig.superadmin,
//             permissions: ['superadmin']
//         },
//         get: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         list: {
//             preStack: [...preStackConfig.authenticated, '__query'],
//             permissions: ['superadmin', 'school_admin']
//         },
//         update: {
//             preStack: preStackConfig.superadmin,
//             permissions: ['superadmin']
//         },
//         delete: {
//             preStack: preStackConfig.superadmin,
//             permissions: ['superadmin']
//         },
//         stats: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         }
//     },
    
//     // Classrooms endpoints
//     classrooms: {
//         create: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         get: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         list: {
//             preStack: [...preStackConfig.authenticated, '__query'],
//             permissions: ['superadmin', 'school_admin']
//         },
//         update: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         delete: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         stats: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         }
//     },
    
//     // Students endpoints
//     students: {
//         create: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         get: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         list: {
//             preStack: [...preStackConfig.authenticated, '__query'],
//             permissions: ['superadmin', 'school_admin']
//         },
//         update: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         delete: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         },
//         transfer: {
//             preStack: preStackConfig.authenticated,
//             permissions: ['superadmin', 'school_admin']
//         }
//     }
// };

// const rateLimits = {
//     // Public endpoints - stricter limits
//     public: {
//         windowMs: 15 * 60 * 1000, // 15 minutes
//         max: 50 // 50 requests per window
//     },
    
//     // Authenticated endpoints - more lenient
//     authenticated: {
//         windowMs: 15 * 60 * 1000, // 15 minutes
//         max: 100 // 100 requests per window
//     },
    
//     // Admin endpoints - highest limits
//     admin: {
//         windowMs: 15 * 60 * 1000, // 15 minutes
//         max: 200 // 200 requests per window
//     }
// };

// const validationRules = {
//     // Field validation patterns
//     email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//     phone: /^\+?[0-9]{10,20}$/,
//     objectId: /^[0-9a-fA-F]{24}$/,
//     academicYear: /^[0-9]{4}-[0-9]{4}$/,
//     code: /^[A-Z0-9_-]+$/,
    
//     // Length constraints
//     constraints: {
//         password: { min: 8, max: 128 },
//         name: { min: 2, max: 100 },
//         email: { min: 5, max: 255 },
//         code: { min: 2, max: 20 },
//         description: { min: 10, max: 1000 }
//     }
// };

// const systemDefaults = {
//     // Pagination
//     pagination: {
//         defaultPage: 1,
//         defaultLimit: 20,
//         maxLimit: 100
//     },
    
//     // JWT
//     jwt: {
//         accessTokenExpiry: '24h',
//         refreshTokenExpiry: '7d'
//     },
    
//     // Academic
//     academic: {
//         currentYear: '2024-2025',
//         grades: [
//             'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
//             'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
//             'Grade 11', 'Grade 12'
//         ]
//     },
    
//     // Status values
//     status: {
//         student: ['active', 'inactive', 'transferred', 'graduated'],
//         general: ['active', 'inactive']
//     }
// };

// module.exports = {
//     layers,
//     actions,
//     permissions,
//     preStackConfig,
//     apiConfig,
//     rateLimits,
//     validationRules,
//     systemDefaults
// };


// const layers = {

//     board: {

//         /** all board are public by default */   
//         _default: { anyoneCan: 'read', ownerCan: 'audit' },
//         _public:  { anyoneCan: 'create', ownerCan: 'audit' },
//         _private: { anyoneCan: 'none' },
//         _store:   { anyoneCan: 'read', noOneCan: 'create' },

//         post: {

//             _default: { inherit: true }, 
//             _public:  { inherit: true },
//             _private: { inherit: true },
            
//             comment: {
//                 _default: { inherit: true }, 
//                 reply: {
//                     _default: {inherit: true},
//                     vote: {
//                         _default: {anyoneCan: 'create'},
//                     },
//                 },
//                 vote: {
//                     _default: {anyoneCan: 'create'},
//                 },
//             },
//             vote: {
//                 _default: {anyoneCan: 'create'},
//             },
//             sticker: {
//                 _default: {inherit: true},
//             }
//         }
//     }
// }

// const actions = {
//     blocked: -1,
//     none: 1,
//     read: 2,
//     create: 3,
//     audit: 4,
//     config: 5
// }


// module.exports = {
//     layers,
//     actions
// }