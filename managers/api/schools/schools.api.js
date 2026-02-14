const { apiConfig } = require('../../../static_arch/main.system');


module.exports = {
    /**
     * Create School (Superadmin only)
     * POST /api/schools/create
     */
    create: {
        httpExposed: true,
        method: 'POST',
         preStack: apiConfig.schools.create.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { 
                    name, code, address, contactInfo, 
                    principalName, establishedYear, totalCapacity 
                } = req.body;
                
                // Validate required fields
                if (!name || !code || !address || !contactInfo || !totalCapacity) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Missing required fields: name, code, address, contactInfo, totalCapacity'
                    };
                }

                // Validate school name
                if (!validators.name(name)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School name must be between 2 and 100 characters'
                    };
                }

                // Validate school code
                if (!validators.code(code)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School code must be 2-20 uppercase alphanumeric characters with hyphens or underscores'
                    };
                }

                // Validate address fields
                if (!address.street || !validators.street(address.street)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid street address is required (1-200 characters)'
                    };
                }

                if (!address.city || !validators.city(address.city)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid city is required (1-100 characters)'
                    };
                }

                if (!address.state || !validators.state(address.state)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid state is required (1-100 characters)'
                    };
                }

                if (!address.country || !validators.country(address.country)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid country is required (1-100 characters)'
                    };
                }

                if (!address.postalCode || !validators.postalCode(address.postalCode)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid postal code is required (3-20 characters)'
                    };
                }

                // Validate contact info
                if (!contactInfo.email || !validators.email(contactInfo.email)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid contact email is required'
                    };
                }

                if (!contactInfo.phone || !validators.phone(contactInfo.phone)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid contact phone number is required'
                    };
                }

                if (contactInfo.website && !validators.url(contactInfo.website)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid website URL format'
                    };
                }

                // Validate principal name if provided
                if (principalName && !validators.name(principalName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Principal name must be between 2 and 100 characters'
                    };
                }

                // Validate established year if provided
                if (establishedYear && !validators.year(establishedYear)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Established year must be between 1800 and current year'
                    };
                }

                // Validate total capacity
                if (!validators.positiveNumber(totalCapacity)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Total capacity must be a positive number'
                    };
                }

                const result = await managers.school.createSchool(req.body);
                return result;
            } catch (error) {
                console.error('Create school API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to create school'
                };
            }
        }
    },

    /**
     * Get School
     * POST /api/schools/get
     */
    get: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.schools.get.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const schoolId = req.body.id || req.query.id;
                
                if (!schoolId) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School ID is required'
                    };
                }

                if (!validators.objectId(schoolId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }
                
                // School admin can only view their own school
                if (token.role === 'school_admin' && 
                    schoolId !== token.schoolId?.toString()) {
                    return {
                        ok: false,
                        code: 403,
                        errors: 'You can only view your assigned school'
                    };
                }

                const result = await managers.school.getSchool({ schoolId });
                return result;
            } catch (error) {
                console.error('Get school API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve school'
                };
            }
        }
    },

    /**
     * List Schools
     * POST /api/schools/list
     */
    list: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.schools.list.preStack,
        handler: async function({ req, res, token, query, managers, validators }) {
            try {
                const { page, limit, search, isActive } = { ...query, ...req.body };
                
                // Validate pagination
                if (page && !validators.positiveNumber(page)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Page must be a positive number'
                    };
                }

                if (limit && !validators.positiveNumber(limit)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Limit must be a positive number'
                    };
                }

                // Validate isActive
                if (isActive !== undefined && !validators.boolean(isActive)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'isActive must be a boolean'
                    };
                }
                
                // School admin can only see their school
                if (token.role === 'school_admin') {
                    const result = await managers.school.getSchool({ 
                        schoolId: token.schoolId 
                    });
                    
                    if (result.ok) {
                        return {
                            ok: true,
                            code: 200,
                            data: {
                                schools: [result.data],
                                pagination: {
                                    page: 1,
                                    limit: 1,
                                    total: 1,
                                    totalPages: 1
                                }
                            }
                        };
                    }
                    return result;
                }

                const result = await managers.school.listSchools({
                    page, limit, search, isActive
                });
                return result;
            } catch (error) {
                console.error('List schools API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to list schools'
                };
            }
        }
    },

    /**
     * Update School (Superadmin only)
     * PUT /api/schools/update
     */
    update: {
        httpExposed: true,
        method: 'PUT',
        preStack: apiConfig.schools.update.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id, ...updates } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }

                // Validate name if provided
                if (updates.name && !validators.name(updates.name)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School name must be between 2 and 100 characters'
                    };
                }

                // Validate address fields if provided
                if (updates.address) {
                    if (updates.address.street && !validators.street(updates.address.street)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid street address (1-200 characters)'
                        };
                    }
                    if (updates.address.city && !validators.city(updates.address.city)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid city (1-100 characters)'
                        };
                    }
                    if (updates.address.state && !validators.state(updates.address.state)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid state (1-100 characters)'
                        };
                    }
                    if (updates.address.country && !validators.country(updates.address.country)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid country (1-100 characters)'
                        };
                    }
                    if (updates.address.postalCode && !validators.postalCode(updates.address.postalCode)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid postal code (3-20 characters)'
                        };
                    }
                }

                // Validate contact info if provided
                if (updates.contactInfo) {
                    if (updates.contactInfo.email && !validators.email(updates.contactInfo.email)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid contact email format'
                        };
                    }
                    if (updates.contactInfo.phone && !validators.phone(updates.contactInfo.phone)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid contact phone number'
                        };
                    }
                    if (updates.contactInfo.website && !validators.url(updates.contactInfo.website)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid website URL'
                        };
                    }
                }

                // Validate principal name if provided
                if (updates.principalName && !validators.name(updates.principalName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Principal name must be between 2 and 100 characters'
                    };
                }

                // Validate total capacity if provided
                if (updates.totalCapacity && !validators.positiveNumber(updates.totalCapacity)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Total capacity must be a positive number'
                    };
                }

                // Validate isActive if provided
                if (updates.isActive !== undefined && !validators.boolean(updates.isActive)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'isActive must be a boolean'
                    };
                }

                const result = await managers.school.updateSchool({
                    schoolId: id,
                    updates
                });
                return result;
            } catch (error) {
                console.error('Update school API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to update school'
                };
            }
        }
    },

    /**
     * Delete School (Superadmin only)
     * DELETE /api/schools/delete
     */
    delete: {
        httpExposed: true,
        method: 'DELETE',
        preStack: apiConfig.schools.delete.preStack,
        handler: async function({ req, res, managers, validators }) {
            try {
                const { id } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }

                const result = await managers.school.deleteSchool({ schoolId: id });
                return result;
            } catch (error) {
                console.error('Delete school API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to delete school'
                };
            }
        }
    },

    /**
     * Get School Statistics
     * POST /api/schools/stats
     */
    stats: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.schools.stats.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const schoolId = req.body.id || req.query.id;
                
                if (!schoolId) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'School ID is required'
                    };
                }

                if (!validators.objectId(schoolId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }
                
                // School admin can only view their own school stats
                if (token.role === 'school_admin' && 
                    schoolId !== token.schoolId?.toString()) {
                    return {
                        ok: false,
                        code: 403,
                        errors: 'You can only view statistics for your assigned school'
                    };
                }

                const result = await managers.school.getSchoolStats({ schoolId });
                return result;
            } catch (error) {
                console.error('Get school stats API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve school statistics'
                };
            }
        }
    }
};






// ------------------------------------------------------------------------------------------


// module.exports = {
//     /**
//      * Create School (Superadmin only)
//      * POST /api/schools/create
//      */
//     create: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token', '__rbac:superadmin'],
//         preStack: apiConfig.schools.create.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const result = await managers.school.createSchool(req.body);
//                 return result;
//             } catch (error) {
//                 console.error('Create school API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to create school'
//                 };
//             }
//         }
//     },

//     /**
//      * Get School by ID
//      * GET /api/schools/get?id=xxx
//      * POST /api/schools/get with { id: "xxx" }
//      */
//     get: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.schools.get.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const schoolId = req.body.id || req.query.id;
                
//                 if (!schoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }
                
//                 // School admin can only view their own school
//                 if (token.role === 'school_admin' && 
//                     schoolId !== token.schoolId?.toString()) {
//                     return {
//                         ok: false,
//                         code: 403,
//                         errors: 'You can only view your assigned school'
//                     };
//                 }

//                 const result = await managers.school.getSchool({ schoolId });
//                 return result;
//             } catch (error) {
//                 console.error('Get school API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve school'
//                 };
//             }
//         }
//     },

//     /**
//      * List Schools
//      * GET /api/schools/list?page=1&limit=20
//      * POST /api/schools/list
//      */
//     list: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token', '__query'],
//         preStack: apiConfig.schools.list.preStack,
//         handler: async function({ req, res, token, query, managers }) {
//             try {
//                 const { page, limit, search, isActive } = { ...query, ...req.body };
                
//                 // School admin can only see their school
//                 if (token.role === 'school_admin') {
//                     const result = await managers.school.getSchool({ 
//                         schoolId: token.schoolId 
//                     });
                    
//                     if (result.ok) {
//                         return {
//                             ok: true,
//                             code: 200,
//                             data: {
//                                 schools: [result.data],
//                                 pagination: {
//                                     page: 1,
//                                     limit: 1,
//                                     total: 1,
//                                     totalPages: 1
//                                 }
//                             }
//                         };
//                     }
//                     return result;
//                 }

//                 const result = await managers.school.listSchools({
//                     page, limit, search, isActive
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('List schools API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to list schools'
//                 };
//             }
//         }
//     },

//     /**
//      * Update School (Superadmin only)
//      * PUT /api/schools/update
//      */
//     update: {
//         httpExposed: true,
//         method: 'PUT',
//         // preStack: ['__token', '__rbac:superadmin'],
//         preStack: apiConfig.schools.update.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id, ...updates } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }

//                 const result = await managers.school.updateSchool({
//                     schoolId: id,
//                     updates
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Update school API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to update school'
//                 };
//             }
//         }
//     },

//     /**
//      * Delete School (Superadmin only)
//      * DELETE /api/schools/delete
//      */
//     delete: {
//         httpExposed: true,
//         method: 'DELETE',
//         // preStack: ['__token', '__rbac:superadmin'],
//         preStack: apiConfig.schools.delete.preStack,
//         handler: async function({ req, res, managers }) {
//             try {
//                 const { id } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }

//                 const result = await managers.school.deleteSchool({ schoolId: id });
//                 return result;
//             } catch (error) {
//                 console.error('Delete school API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to delete school'
//                 };
//             }
//         }
//     },

//     /**
//      * Get School Statistics
//      * POST /api/schools/stats
//      */
//     stats: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.schools.stats.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const schoolId = req.body.id || req.query.id;
                
//                 if (!schoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }
                
//                 // School admin can only view their own school stats
//                 if (token.role === 'school_admin' && 
//                     schoolId !== token.schoolId?.toString()) {
//                     return {
//                         ok: false,
//                         code: 403,
//                         errors: 'You can only view statistics for your assigned school'
//                     };
//                 }

//                 const result = await managers.school.getSchoolStats({ schoolId });
//                 return result;
//             } catch (error) {
//                 console.error('Get school stats API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve school statistics'
//                 };
//             }
//         }
//     }
// };