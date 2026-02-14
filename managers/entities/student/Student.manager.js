module.exports = class StudentManager {
    constructor({ config, cache, cortex, mongomodels, utils }) {
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.Student = mongomodels.Student;
        this.School = mongomodels.School;
        this.Classroom = mongomodels.Classroom;
        this.utils = utils;
    }

    async createStudent({ schoolId, studentData, userRole, userSchoolId }) {
        try {
            // Authorization check
            if (userRole === 'school_admin' && schoolId !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only create students for your assigned school'
                };
            }

            // Verify school exists
            const school = await this.School.findById(schoolId);
            if (!school) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'School not found'
                };
            }

            // Check for duplicate student ID
            const existing = await this.Student.findOne({
                studentId: studentData.studentId
            });

            if (existing) {
                return {
                    ok: false,
                    code: 409,
                    errors: 'Student with this ID already exists'
                };
            }

            // If classroom is specified, verify it exists and has capacity
            if (studentData.classroomId) {
                const classroom = await this.Classroom.findOne({
                    _id: studentData.classroomId,
                    schoolId,
                    isActive: true
                });

                if (!classroom) {
                    return {
                        ok: false,
                        code: 404,
                        errors: 'Classroom not found or not active'
                    };
                }

                // Check capacity
                if (classroom.currentEnrollment >= classroom.capacity) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Classroom has reached maximum capacity'
                    };
                }

                // Increment classroom enrollment
                await this.Classroom.updateOne(
                    { _id: classroom._id },
                    { $inc: { currentEnrollment: 1 } }
                );
            }

            const student = await this.Student.create({
                ...studentData,
                schoolId
            });

            // Populate references
            await student.populate([
                { path: 'schoolId', select: 'name code' },
                { path: 'classroomId', select: 'name code grade' }
            ]);

            return {
                ok: true,
                code: 201,
                data: student
            };
        } catch (error) {
            console.error('Create student error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to create student'
            };
        }
    }

    async getStudent({ studentId, userRole, userSchoolId }) {
        try {
            const student = await this.Student.findById(studentId)
                .populate('schoolId', 'name code')
                .populate('classroomId', 'name code grade');

            if (!student) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Student not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                student.schoolId._id.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only access students from your assigned school'
                };
            }

            return {
                ok: true,
                code: 200,
                data: student
            };
        } catch (error) {
            console.error('Get student error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to retrieve student'
            };
        }
    }

    async listStudents({ 
        schoolId, 
        classroomId,
        status,
        page = 1, 
        limit = 20,
        search,
        userRole,
        userSchoolId 
    }) {
        try {
            // Build query
            const query = {};
            
            // Authorization
            if (userRole === 'school_admin') {
                query.schoolId = userSchoolId;
            } else if (schoolId) {
                query.schoolId = schoolId;
            }

            if (classroomId) query.classroomId = classroomId;
            if (status) query.status = status;
            if (search) {
                query.$text = { $search: search };
            }

            const pageNum = parseInt(page);
            const limitNum = Math.min(
                parseInt(limit),
                this.config.dotEnv.MAX_PAGE_SIZE
            );
            const skip = (pageNum - 1) * limitNum;

            const [students, total] = await Promise.all([
                this.Student.find(query)
                    .populate('schoolId', 'name code')
                    .populate('classroomId', 'name code grade')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                this.Student.countDocuments(query)
            ]);

            return {
                ok: true,
                code: 200,
                data: {
                    students,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                }
            };
        } catch (error) {
            console.error('List students error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to list students'
            };
        }
    }

    async updateStudent({ studentId, updates, userRole, userSchoolId }) {
        try {
            const student = await this.Student.findById(studentId);

            if (!student) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Student not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                student.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only update students from your assigned school'
                };
            }

            // Handle classroom change
            if (updates.classroomId && updates.classroomId !== student.classroomId?.toString()) {
                // Verify new classroom
                const newClassroom = await this.Classroom.findOne({
                    _id: updates.classroomId,
                    schoolId: student.schoolId,
                    isActive: true
                });

                if (!newClassroom) {
                    return {
                        ok: false,
                        code: 404,
                        errors: 'New classroom not found or not active'
                    };
                }

                // Check capacity
                if (newClassroom.currentEnrollment >= newClassroom.capacity) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'New classroom has reached maximum capacity'
                    };
                }

                // Decrement old classroom enrollment
                if (student.classroomId) {
                    await this.Classroom.updateOne(
                        { _id: student.classroomId },
                        { $inc: { currentEnrollment: -1 } }
                    );
                }

                // Increment new classroom enrollment
                await this.Classroom.updateOne(
                    { _id: newClassroom._id },
                    { $inc: { currentEnrollment: 1 } }
                );
            }

            const updatedStudent = await this.Student.findByIdAndUpdate(
                studentId,
                { $set: updates },
                { new: true, runValidators: true }
            )
            .populate('schoolId', 'name code')
            .populate('classroomId', 'name code grade');

            return {
                ok: true,
                code: 200,
                data: updatedStudent
            };
        } catch (error) {
            console.error('Update student error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to update student'
            };
        }
    }

    async deleteStudent({ studentId, userRole, userSchoolId }) {
        try {
            const student = await this.Student.findById(studentId);

            if (!student) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Student not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                student.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only delete students from your assigned school'
                };
            }

            // Decrement classroom enrollment if student is assigned
            if (student.classroomId && student.status === 'active') {
                await this.Classroom.updateOne(
                    { _id: student.classroomId },
                    { $inc: { currentEnrollment: -1 } }
                );
            }

            await this.Student.findByIdAndDelete(studentId);

            return {
                ok: true,
                code: 200,
                message: 'Student deleted successfully'
            };
        } catch (error) {
            console.error('Delete student error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to delete student'
            };
        }
    }

    async transferStudent({ 
        studentId, 
        newSchoolId, 
        newClassroomId, 
        reason,
        userRole,
        userSchoolId 
    }) {
        try {
            const student = await this.Student.findById(studentId);

            if (!student) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Student not found'
                };
            }

            // Authorization: only superadmin or student's current school admin
            if (userRole === 'school_admin' && 
                student.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only transfer students from your assigned school'
                };
            }

            // Verify new school
            const newSchool = await this.School.findById(newSchoolId);
            if (!newSchool || !newSchool.isActive) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'New school not found or not active'
                };
            }

            // Verify new classroom if provided
            let newClassroom = null;
            if (newClassroomId) {
                newClassroom = await this.Classroom.findOne({
                    _id: newClassroomId,
                    schoolId: newSchoolId,
                    isActive: true
                });

                if (!newClassroom) {
                    return {
                        ok: false,
                        code: 404,
                        errors: 'New classroom not found or not active'
                    };
                }

                if (newClassroom.currentEnrollment >= newClassroom.capacity) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'New classroom has reached maximum capacity'
                    };
                }
            }

            // Add to enrollment history
            const historyEntry = {
                schoolId: student.schoolId,
                classroomId: student.classroomId,
                enrollmentDate: student.enrollmentDate,
                exitDate: new Date(),
                reason
            };

            // Decrement old classroom enrollment
            if (student.classroomId) {
                await this.Classroom.updateOne(
                    { _id: student.classroomId },
                    { $inc: { currentEnrollment: -1 } }
                );
            }

            // Increment new classroom enrollment if assigned
            if (newClassroomId) {
                await this.Classroom.updateOne(
                    { _id: newClassroomId },
                    { $inc: { currentEnrollment: 1 } }
                );
            }

            // Update student
            student.schoolId = newSchoolId;
            student.classroomId = newClassroomId || null;
            student.enrollmentDate = new Date();
            student.status = 'active';
            student.enrollmentHistory.push(historyEntry);

            await student.save();
            await student.populate([
                { path: 'schoolId', select: 'name code' },
                { path: 'classroomId', select: 'name code grade' }
            ]);

            return {
                ok: true,
                code: 200,
                data: student,
                message: 'Student transferred successfully'
            };
        } catch (error) {
            console.error('Transfer student error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to transfer student'
            };
        }
    }
};