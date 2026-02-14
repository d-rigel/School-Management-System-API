const { apiConfig } = require('../../../static_arch/main.system');


module.exports = {
    /**
     * Create Student
     * POST /api/students/create
     */
    create: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.students.create.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { 
                    schoolId, studentId, firstName, lastName, 
                    dateOfBirth, gender, classroomId, guardianInfo, 
                    medicalInfo, academicYear 
                } = req.body;
                
                // Validate required fields
                if (!schoolId || !studentId || !firstName || !lastName || !dateOfBirth || !gender || !guardianInfo || !academicYear) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Missing required fields: schoolId, studentId, firstName, lastName, dateOfBirth, gender, guardianInfo, academicYear'
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

                // Validate studentId
                if (!validators.studentId(studentId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Student ID must be 1-50 uppercase alphanumeric characters with hyphens or underscores'
                    };
                }

                // Validate names
                if (!validators.name(firstName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'First name must be between 2 and 100 characters'
                    };
                }

                if (!validators.name(lastName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Last name must be between 2 and 100 characters'
                    };
                }

                // Validate date of birth
                if (!validators.dateOfBirth(dateOfBirth)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid date of birth. Must be a valid past date'
                    };
                }

                // Validate gender
                if (!validators.gender(gender)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Gender must be male, female, or other'
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

                // Validate guardian info
                if (!guardianInfo.name || !validators.name(guardianInfo.name)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Guardian name must be between 2 and 200 characters'
                    };
                }

                if (!guardianInfo.relationship || !validators.relationship(guardianInfo.relationship)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid guardian relationship'
                    };
                }

                if (!guardianInfo.email || !validators.email(guardianInfo.email)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid guardian email is required'
                    };
                }

                if (!guardianInfo.phone || !validators.phone(guardianInfo.phone)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Valid guardian phone number is required'
                    };
                }

                // Validate guardian address if provided
                if (guardianInfo.address) {
                    if (guardianInfo.address.street && !validators.street(guardianInfo.address.street)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian street address'
                        };
                    }
                    if (guardianInfo.address.city && !validators.city(guardianInfo.address.city)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian city'
                        };
                    }
                    if (guardianInfo.address.state && !validators.state(guardianInfo.address.state)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian state'
                        };
                    }
                    if (guardianInfo.address.country && !validators.country(guardianInfo.address.country)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian country'
                        };
                    }
                    if (guardianInfo.address.postalCode && !validators.postalCode(guardianInfo.address.postalCode)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian postal code'
                        };
                    }
                }

                // Validate medical info if provided
                if (medicalInfo) {
                    if (medicalInfo.bloodGroup && !validators.bloodGroup(medicalInfo.bloodGroup)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid blood group. Must be A+, A-, B+, B-, AB+, AB-, O+, or O-'
                        };
                    }

                    if (medicalInfo.emergencyContact && !validators.phone(medicalInfo.emergencyContact)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid emergency contact phone number'
                        };
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
                
                const result = await managers.student.createStudent({
                    schoolId,
                    studentData: req.body,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Create student API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to create student'
                };
            }
        }
    },

    /**
     * Get Student
     * POST /api/students/get
     */
    get: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.students.get.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const studentId = req.body.id || req.query.id;
                
                if (!studentId) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Student ID is required'
                    };
                }

                if (!validators.objectId(studentId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid student ID format'
                    };
                }
                
                const result = await managers.student.getStudent({
                    studentId,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Get student API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve student'
                };
            }
        }
    },

    /**
     * List Students
     * POST /api/students/list
     */
    list: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.students.list.preStack,
        handler: async function({ req, res, token, query, managers, validators }) {
            try {
                const { 
                    schoolId, classroomId, status, 
                    page, limit, search 
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

                // Validate status if provided
                if (status && !validators.studentStatus(status)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid status. Must be active, inactive, transferred, or graduated'
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
                
                const result = await managers.student.listStudents({
                    schoolId, classroomId, status, 
                    page, limit, search,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('List students API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to list students'
                };
            }
        }
    },

    /**
     * Update Student
     * PUT /api/students/update
     */
    update: {
        httpExposed: true,
        method: 'PUT',
         preStack: apiConfig.students.update.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id, ...updates } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Student ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid student ID format'
                    };
                }

                // Validate firstName if provided
                if (updates.firstName && !validators.name(updates.firstName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'First name must be between 2 and 100 characters'
                    };
                }

                // Validate lastName if provided
                if (updates.lastName && !validators.name(updates.lastName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Last name must be between 2 and 100 characters'
                    };
                }

                // Validate classroomId if provided
                if (updates.classroomId && !validators.objectId(updates.classroomId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid classroom ID format'
                    };
                }

                // Validate status if provided
                if (updates.status && !validators.studentStatus(updates.status)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid status. Must be active, inactive, transferred, or graduated'
                    };
                }

                // Validate guardian info if provided
                if (updates.guardianInfo) {
                    if (updates.guardianInfo.name && !validators.name(updates.guardianInfo.name)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Guardian name must be between 2 and 200 characters'
                        };
                    }

                    if (updates.guardianInfo.email && !validators.email(updates.guardianInfo.email)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian email format'
                        };
                    }

                    if (updates.guardianInfo.phone && !validators.phone(updates.guardianInfo.phone)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian phone number'
                        };
                    }

                    if (updates.guardianInfo.relationship && !validators.relationship(updates.guardianInfo.relationship)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid guardian relationship'
                        };
                    }
                }

                // Validate medical info if provided
                if (updates.medicalInfo) {
                    if (updates.medicalInfo.bloodGroup && !validators.bloodGroup(updates.medicalInfo.bloodGroup)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid blood group'
                        };
                    }

                    if (updates.medicalInfo.emergencyContact && !validators.phone(updates.medicalInfo.emergencyContact)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid emergency contact phone number'
                        };
                    }
                }
                
                const result = await managers.student.updateStudent({
                    studentId: id,
                    updates,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Update student API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to update student'
                };
            }
        }
    },

    /**
     * Delete Student
     * DELETE /api/students/delete
     */
    delete: {
        httpExposed: true,
        method: 'DELETE',
        preStack: apiConfig.students.delete.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id } = req.body;
                
                if (!id) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Student ID is required'
                    };
                }

                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid student ID format'
                    };
                }
                
                const result = await managers.student.deleteStudent({
                    studentId: id,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Delete student API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to delete student'
                };
            }
        }
    },

    /**
     * Transfer Student
     * POST /api/students/transfer
     */
    transfer: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.students.transfer.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { id, newSchoolId, newClassroomId, reason } = req.body;
                
                // Validate required fields
                if (!id || !newSchoolId || !reason) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Student ID, new school ID, and reason are required'
                    };
                }

                // Validate student ID
                if (!validators.objectId(id)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid student ID format'
                    };
                }

                // Validate new school ID
                if (!validators.objectId(newSchoolId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid new school ID format'
                    };
                }

                // Validate new classroom ID if provided
                if (newClassroomId && !validators.objectId(newClassroomId)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid new classroom ID format'
                    };
                }

                // Validate transfer reason
                if (!validators.transferReason(reason)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Transfer reason must be between 10 and 1000 characters'
                    };
                }
                
                const result = await managers.student.transferStudent({
                    studentId: id,
                    newSchoolId,
                    newClassroomId,
                    reason,
                    userRole: token.role,
                    userSchoolId: token.schoolId
                });
                return result;
            } catch (error) {
                console.error('Transfer student API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to transfer student'
                };
            }
        }
    }
};




// ------------------------------------------------------------------------------------------


// module.exports = {
//     /**
//      * Create Student
//      * POST /api/students/create
//      */
//     create: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.students.create.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { schoolId, ...studentData } = req.body;
                
//                 if (!schoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required'
//                     };
//                 }
                
//                 const result = await managers.student.createStudent({
//                     schoolId,
//                     studentData,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Create student API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to create student'
//                 };
//             }
//         }
//     },

//     /**
//      * Get Student
//      * POST /api/students/get
//      * GET /api/students/get?id=xxx
//      */
//     get: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.students.get.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const studentId = req.body.id || req.query.id;
                
//                 if (!studentId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Student ID is required'
//                     };
//                 }
                
//                 const result = await managers.student.getStudent({
//                     studentId,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Get student API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve student'
//                 };
//             }
//         }
//     },

//     /**
//      * List Students
//      * POST /api/students/list
//      * GET /api/students/list?schoolId=xxx&classroomId=xxx&status=active&page=1&limit=20
//      */
//     list: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token', '__query'],
//         preStack: apiConfig.students.list.preStack,
//         handler: async function({ req, res, token, query, managers }) {
//             try {
//                 const { 
//                     schoolId, 
//                     classroomId, 
//                     status, 
//                     page, 
//                     limit, 
//                     search 
//                 } = { ...query, ...req.body };
                
//                 const result = await managers.student.listStudents({
//                     schoolId,
//                     classroomId,
//                     status,
//                     page,
//                     limit,
//                     search,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('List students API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to list students'
//                 };
//             }
//         }
//     },

//     /**
//      * Update Student
//      * PUT /api/students/update
//      */
//     update: {
//         httpExposed: true,
//         method: 'PUT',
//         // preStack: ['__token'],
//         preStack: apiConfig.students.update.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id, ...updates } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Student ID is required'
//                     };
//                 }
                
//                 const result = await managers.student.updateStudent({
//                     studentId: id,
//                     updates,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Update student API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to update student'
//                 };
//             }
//         }
//     },

//     /**
//      * Delete Student
//      * DELETE /api/students/delete
//      */
//     delete: {
//         httpExposed: true,
//         method: 'DELETE',
//         // preStack: ['__token'],
//         preStack: apiConfig.students.delete.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Student ID is required'
//                     };
//                 }
                
//                 const result = await managers.student.deleteStudent({
//                     studentId: id,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Delete student API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to delete student'
//                 };
//             }
//         }
//     },

//     /**
//      * Transfer Student
//      * POST /api/students/transfer
//      */
//     transfer: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.students.transfer.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { id, newSchoolId, newClassroomId, reason } = req.body;
                
//                 if (!id) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Student ID is required'
//                     };
//                 }

//                 if (!newSchoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'New school ID is required'
//                     };
//                 }

//                 if (!reason) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Transfer reason is required'
//                     };
//                 }
                
//                 const result = await managers.student.transferStudent({
//                     studentId: id,
//                     newSchoolId,
//                     newClassroomId,
//                     reason,
//                     userRole: token.role,
//                     userSchoolId: token.schoolId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Transfer student API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to transfer student'
//                 };
//             }
//         }
//     }
// };