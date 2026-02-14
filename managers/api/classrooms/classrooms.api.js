const { apiConfig } = require('../../../static_arch/main.system')


module.exports = {
    /**
     * Create Classroom
     * POST /api/classrooms/create
     */
    create: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.classroom.create.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { 
                    schoolId, name, code, grade, section, 
                    capacity, resources, academicYear 
                } = req.body;
                
                // Validate required fields
                if (!schoolId || !name || !code || !grade || !capacity || !academicYear) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Missing required fields: schoolId, name, code, grade, capacity, academicYear'
                    };
                }

                // Validate schoolId
                if (!validators.objectId(schoolId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }

                // Validate classroom name
                if (!validators.name(name)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom name must be between 2 and 100 characters'
                    };
                }

                // Validate classroom code
                if (!validators.code(code)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom code must be 2-20 uppercase alphanumeric characters with hyphens or underscores'
                    };
                }

                // Validate grade
                if (!validators.grade(grade)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid grade. Must be Grade 1-12 or Year 1-13'
                    };
                }

                // Validate section if provided
                if (section && !validators.section(section)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Section must be between 1 and 10 characters'
                    };
                }

                // Validate capacity
                if (!validators.capacity(capacity)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Capacity must be between 1 and 1000'
                    };
                }

                // Validate resources if provided
                if (resources && !validators.nonEmptyArray(resources)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Resources must be a non-empty array'
                    };
                }

                if (resources) {
                    for (let i = 0; i < resources.length; i++) {
                        const resource = resources[i];
                        
                        if (!resource.name || !validators.name(resource.name)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: name must be between 2 and 100 characters`
                            };
                        }

                        if (!resource.quantity || !validators.nonNegativeNumber(resource.quantity)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: quantity must be a non-negative number`
                            };
                        }

                        if (resource.condition && !validators.resourceCondition(resource.condition)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: condition must be excellent, good, fair, or poor`
                            };
                        }
                    }
                }

                // Validate academic year
                if (!validators.academicYear(academicYear)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)'
                    };
                }
                
                const result = await managers.classroom.createClassroom({
                    schoolId,
                    classroomData: req.body,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Create classroom API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to create classroom'
                };
            }
        }
    },

    /**
     * Get Classroom
     * POST /api/classrooms/get
     */
    get: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.classroom.get.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const classroomId = req.body.id || req.query.id;
                
                if (!classroomId) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom ID is required'
                    };
                }

                if (!validators.objectId(classroomId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }
                
                const result = await managers.classroom.getClassroom({
                    classroomId,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Get classroom API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve classroom'
                };
            }
        }
    },

    /**
     * List Classrooms
     * POST /api/classrooms/list
     */
    list: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.classroom.list.preStack,
        handler: async function({ req, res, token, query, managers, validators }) {
            try {
                const { 
                    schoolId, classroomId, page, limit, 
                    grade, academicYear, isActive 
                } = { ...query, ...req.body };
                
                // Validate schoolId if provided
                if (schoolId && !validators.objectId(schoolId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid school ID format'
                    };
                }

                // Validate classroomId if provided
                if (classroomId && !validators.objectId(classroomId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }

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

                // Validate grade if provided
                if (grade && !validators.grade(grade)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid grade format'
                    };
                }

                // Validate academic year if provided
                if (academicYear && !validators.academicYear(academicYear)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Academic year must be in format YYYY-YYYY'
                    };
                }

                // Validate isActive if provided
                if (isActive !== undefined && !validators.boolean(isActive)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'isActive must be a boolean'
                    };
                }
                
                const result = await managers.classroom.listClassrooms({
                    schoolId, classroomId, page, limit, 
                    grade, academicYear, isActive,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('List classrooms API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to list classrooms'
                };
            }
        }
    },

    /**
     * Update Classroom
     * PUT /api/classrooms/update
     */
    update: {
        httpExposed: true,
        method: 'PUT',
        preStack: apiConfig.classroom.update.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id, ...updates } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }

                // Validate name if provided
                if (updates.name && !validators.name(updates.name)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom name must be between 2 and 100 characters'
                    };
                }

                // Validate capacity if provided
                if (updates.capacity && !validators.capacity(updates.capacity)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Capacity must be between 1 and 1000'
                    };
                }

                // Validate resources if provided
                if (updates.resources) {
                    if (!validators.nonEmptyArray(updates.resources)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Resources must be a non-empty array'
                        };
                    }

                    for (let i = 0; i < updates.resources.length; i++) {
                        const resource = updates.resources[i];
                        
                        if (!resource.name || !validators.name(resource.name)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: name must be between 2 and 100 characters`
                            };
                        }

                        if (resource.quantity === undefined || !validators.nonNegativeNumber(resource.quantity)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: quantity must be a non-negative number`
                            };
                        }

                        if (resource.condition && !validators.resourceCondition(resource.condition)) {
                            return {
                                ok: false,
                                code: 400,
                                errors: `Resource ${i + 1}: condition must be excellent, good, fair, or poor`
                            };
                        }
                    }
                }

                // Validate isActive if provided
                if (updates.isActive !== undefined && !validators.boolean(updates.isActive)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'isActive must be a boolean'
                    };
                }
                
                const result = await managers.classroom.updateClassroom({
                    classroomId: id,
                    updates,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Update classroom API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to update classroom'
                };
            }
        }
    },

    /**
     * Delete Classroom
     * DELETE /api/classrooms/delete
     */
    delete: {
        httpExposed: true,
        method: 'DELETE',
        preStack: apiConfig.classroom.delete.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }
                
                const result = await managers.classroom.deleteClassroom({
                    classroomId: id,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Delete classroom API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to delete classroom'
                };
            }
        }
    },

    /**
     * Get Classroom Statistics
     * POST /api/classrooms/stats
     */
    stats: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.classroom.stats.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const classroomId = req.body.id || req.query.id;
                
                if (!classroomId) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom ID is required'
                    };
                }

                if (!validators.objectId(classroomId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }
                
                const result = await managers.classroom.getClassroomStats({
                    classroomId,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Get classroom stats API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve classroom statistics'
                };
            }
        }
    }
};





// -----------------------------------------------------------------------------------------


// module.exports = {
//     /**
//      * Create Classroom
//      * POST /api/classrooms/create
//      */
//     create: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.classroom.create.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { schoolId, ...classroomData } = req.body;
                
//                 if (!schoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }
                
//                 const result = await managers.classroom.createClassroom({
//                     schoolId,
//                     classroomData,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Create classroom API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to create classroom'
//                 };
//             }
//         }
//     },

//     /**
//      * Get Classroom
//      * POST /api/classrooms/get
//      */
//     get: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.classroom.get.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const classroomId = req.body.id || req.query.id;
                
//                 if (!classroomId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Classroom ID is required'
//                     };
//                 }
                
//                 const result = await managers.classroom.getClassroom({
//                     classroomId,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Get classroom API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve classroom'
//                 };
//             }
//         }
//     },

//     /**
//      * List Classrooms
//      * POST /api/classrooms/list
//      */
//     list: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token', '__query'],
//         preStack: apiConfig.classroom.list.preStack,
//         handler: async function({ req, res, token, query, managers }) {
//             try {
//                 const { schoolId, classroomId, page, limit, grade, academicYear, isActive } = { ...query, ...req.body };
                
//                 const result = await managers.classroom.listClassrooms({
//                     schoolId,
//                     classroomId,
//                     page,
//                     limit,
//                     grade,
//                     academicYear,
//                     isActive,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('List classrooms API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to list classrooms'
//                 };
//             }
//         }
//     },

//     /**
//      * Update Classroom
//      * PUT /api/classrooms/update
//      */
//     update: {
//         httpExposed: true,
//         method: 'PUT',
//         // preStack: ['__token'],
//         preStack: apiConfig.classroom.update.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id, ...updates } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Classroom ID is required'
//                     };
//                 }
                
//                 const result = await managers.classroom.updateClassroom({
//                     classroomId: id,
//                     updates,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Update classroom API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to update classroom'
//                 };
//             }
//         }
//     },

//     /**
//      * Delete Classroom
//      * DELETE /api/classrooms/delete
//      */
//     delete: {
//         httpExposed: true,
//         method: 'DELETE',
//         // preStack: ['__token'],
//         preStack: apiConfig.classroom.delete.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Classroom ID is required'
//                     };
//                 }
                
//                 const result = await managers.classroom.deleteClassroom({
//                     classroomId: id,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Delete classroom API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to delete classroom'
//                 };
//             }
//         }
//     },

//     /**
//      * Get Classroom Statistics
//      * POST /api/classrooms/stats
//      */
//     stats: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.classroom.stats.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const classroomId = req.body.id || req.query.id;
                
//                 if (!classroomId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Classroom ID is required'
//                     };
//                 }
                
//                 const result = await managers.classroom.getClassroomStats({
//                     classroomId,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Get classroom stats API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve classroom statistics'
//                 };
//             }
//         }
//     }
// };