module.exports = class ClassroomManager {
    constructor({ config, cache, cortex, mongomodels, utils }) {
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.Classroom = mongomodels.Classroom;
        this.School = mongomodels.School;
        this.utils = utils;
    }

    async createClassroom({ schoolId, classroomData, userRole, userSchoolId }) {
        try {
            // Authorization check: school_admin can only create for their school
            if (userRole === 'school_admin' && schoolId !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only create classrooms for your assigned school'
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

            // Check for duplicate classroom code within school
            const existing = await this.Classroom.findOne({
                schoolId,
                code: classroomData.code
            });

            if (existing) {
                return {
                    ok: false,
                    code: 409,
                    errors: 'Classroom with this code already exists in this school'
                };
            }

            const classroom = await this.Classroom.create({
                ...classroomData,
                schoolId
            });

            return {
                ok: true,
                code: 201,
                data: classroom
            };
        } catch (error) {
            console.error('Create classroom error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to create classroom'
            };
        }
    }

    async getClassroom({ classroomId, userRole, userSchoolId }) {
        try {
            const classroom = await this.Classroom.findById(classroomId)
                .populate('schoolId', 'name code');

            if (!classroom) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Classroom not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                classroom.schoolId._id.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only access classrooms from your assigned school'
                };
            }

            return {
                ok: true,
                code: 200,
                data: classroom
            };
        } catch (error) {
            console.error('Get classroom error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to retrieve classroom'
            };
        }
    }

    async listClassrooms({ 
        schoolId, 
        page = 1, 
        limit = 20, 
        grade, 
        academicYear,
        isActive,
        userRole,
        userSchoolId 
    }) {
        try {
            // Build query
            const query = {};
            
            // Authorization: school_admin can only see their school's classrooms
            if (userRole === 'school_admin') {
                query.schoolId = userSchoolId;
            } else if (schoolId) {
                query.schoolId = schoolId;
            }

            if (grade) query.grade = grade;
            if (academicYear) query.academicYear = academicYear;
            if (isActive !== undefined) query.isActive = isActive === 'true';

            const pageNum = parseInt(page);
            const limitNum = Math.min(
                parseInt(limit),
                this.config.dotEnv.MAX_PAGE_SIZE
            );
            const skip = (pageNum - 1) * limitNum;

            const [classrooms, total] = await Promise.all([
                this.Classroom.find(query)
                    .populate('schoolId', 'name code')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                this.Classroom.countDocuments(query)
            ]);

            return {
                ok: true,
                code: 200,
                data: {
                    classrooms,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                }
            };
        } catch (error) {
            console.error('List classrooms error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to list classrooms'
            };
        }
    }

    async updateClassroom({ classroomId, updates, userRole, userSchoolId }) {
        try {
            const classroom = await this.Classroom.findById(classroomId);

            if (!classroom) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Classroom not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                classroom.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only update classrooms from your assigned school'
                };
            }

            // Update classroom
            const updatedClassroom = await this.Classroom.findByIdAndUpdate(
                classroomId,
                { $set: updates },
                { new: true, runValidators: true }
            ).populate('schoolId', 'name code');

            return {
                ok: true,
                code: 200,
                data: updatedClassroom
            };
        } catch (error) {
            console.error('Update classroom error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to update classroom'
            };
        }
    }

    async deleteClassroom({ classroomId, userRole, userSchoolId }) {
        try {
            const classroom = await this.Classroom.findById(classroomId);

            if (!classroom) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Classroom not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                classroom.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'You can only delete classrooms from your assigned school'
                };
            }

            // Check if classroom has active students
            const Student = this.cortex.get('Student');
            const studentCount = await Student.countDocuments({
                classroomId,
                status: 'active'
            });

            if (studentCount > 0) {
                return {
                    ok: false,
                    code: 400,
                    errors: `Cannot delete classroom with ${studentCount} active students`
                };
            }

            await this.Classroom.findByIdAndDelete(classroomId);

            return {
                ok: true,
                code: 200,
                message: 'Classroom deleted successfully'
            };
        } catch (error) {
            console.error('Delete classroom error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to delete classroom'
            };
        }
    }

    async getClassroomStats({ classroomId, userRole, userSchoolId }) {
        try {
            const classroom = await this.Classroom.findById(classroomId);

            if (!classroom) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'Classroom not found'
                };
            }

            // Authorization check
            if (userRole === 'school_admin' && 
                classroom.schoolId.toString() !== userSchoolId.toString()) {
                return {
                    ok: false,
                    code: 403,
                    errors: 'Access denied'
                };
            }

            const Student = this.cortex.get('Student');
            const [activeStudents, totalStudents] = await Promise.all([
                Student.countDocuments({ classroomId, status: 'active' }),
                Student.countDocuments({ classroomId })
            ]);

            return {
                ok: true,
                code: 200,
                data: {
                    classroom: {
                        id: classroom._id,
                        name: classroom.name,
                        code: classroom.code,
                        capacity: classroom.capacity
                    },
                    enrollment: {
                        active: activeStudents,
                        total: totalStudents,
                        available: classroom.capacity - activeStudents,
                        utilizationRate: ((activeStudents / classroom.capacity) * 100).toFixed(2) + '%'
                    }
                }
            };
        } catch (error) {
            console.error('Get classroom stats error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to retrieve classroom statistics'
            };
        }
    }
};