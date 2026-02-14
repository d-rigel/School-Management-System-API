module.exports = class SchoolManager {
    constructor({ config, cache, cortex, mongomodels, utils }) {
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.School = mongomodels.School;
        this.utils = utils;
    }

    async createSchool(schoolData) {
        try {
            // Check if school code already exists
            const existing = await this.School.findOne({ code: schoolData.code });
            if (existing) {
                return {
                    ok: false,
                    code: 409,
                    errors: 'School with this code already exists'
                };
            }

            const school = await this.School.create(schoolData);

            // Invalidate cache
            await this.cache.del({ key: 'schools:list' });

            return {
                ok: true,
                code: 201,
                data: school
            };
        } catch (error) {
            console.error('Create school error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to create school'
            };
        }
    }

    async getSchool({ schoolId }) {
        try {
            // Try cache first
            const cacheKey = `school:${schoolId}`;
            const cached = await this.cache.get({ key: cacheKey });
            
            if (cached) {
                return {
                    ok: true,
                    code: 200,
                    data: JSON.parse(cached),
                    fromCache: true
                };
            }

            const school = await this.School.findById(schoolId);

            if (!school) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'School not found'
                };
            }

            // Cache for 1 hour
            await this.cache.set({
                key: cacheKey,
                value: JSON.stringify(school),
                ttl: 3600
            });

            return {
                ok: true,
                code: 200,
                data: school
            };
        } catch (error) {
            console.error('Get school error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to retrieve school'
            };
        }
    }

    async listSchools({ page = 1, limit = 20, search, isActive }) {
        try {
            const pageNum = parseInt(page);
            const limitNum = Math.min(
                parseInt(limit), 
                this.config.dotEnv.MAX_PAGE_SIZE || 100
            );
            const skip = (pageNum - 1) * limitNum;

            // Build query
            const query = {};
            if (search) {
                query.$text = { $search: search };
            }
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            // Execute query with pagination
            const [schools, total] = await Promise.all([
                this.School.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                this.School.countDocuments(query)
            ]);

            return {
                ok: true,
                code: 200,
                data: {
                    schools,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                }
            };
        } catch (error) {
            console.error('List schools error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to list schools'
            };
        }
    }

    async updateSchool({ schoolId, updates }) {
        try {
            const school = await this.School.findByIdAndUpdate(
                schoolId,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!school) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'School not found'
                };
            }

            // Invalidate caches
            await Promise.all([
                this.cache.del({ key: `school:${schoolId}` }),
                this.cache.del({ key: 'schools:list' })
            ]);

            return {
                ok: true,
                code: 200,
                data: school
            };
        } catch (error) {
            console.error('Update school error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to update school'
            };
        }
    }

    async deleteSchool({ schoolId }) {
        try {
            // Check if school has active classrooms or students
            const Classroom = this.cortex.get('Classroom') || this.School.db.model('Classroom');
            const Student = this.cortex.get('Student') || this.School.db.model('Student');

            const [classroomCount, studentCount] = await Promise.all([
                Classroom.countDocuments({ 
                    schoolId, 
                    isActive: true 
                }),
                Student.countDocuments({ 
                    schoolId, 
                    status: 'active' 
                })
            ]);

            if (classroomCount > 0 || studentCount > 0) {
                return {
                    ok: false,
                    code: 400,
                    errors: 'Cannot delete school with active classrooms or students'
                };
            }

            const school = await this.School.findByIdAndDelete(schoolId);

            if (!school) {
                return {
                    ok: false,
                    code: 404,
                    errors: 'School not found'
                };
            }

            // Invalidate caches
            await Promise.all([
                this.cache.del({ key: `school:${schoolId}` }),
                this.cache.del({ key: 'schools:list' })
            ]);

            return {
                ok: true,
                code: 200,
                message: 'School deleted successfully'
            };
        } catch (error) {
            console.error('Delete school error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to delete school'
            };
        }
    }

    async getSchoolStats({ schoolId }) {
        try {
            const Classroom = this.cortex.get('Classroom') || this.School.db.model('Classroom');
            const Student = this.cortex.get('Student') || this.School.db.model('Student');

            const [classrooms, students, activeStudents] = await Promise.all([
                Classroom.countDocuments({ 
                    schoolId, 
                    isActive: true 
                }),
                Student.countDocuments({ schoolId }),
                Student.countDocuments({ 
                    schoolId, 
                    status: 'active' 
                })
            ]);

            return {
                ok: true,
                code: 200,
                data: {
                    totalClassrooms: classrooms,
                    totalStudents: students,
                    activeStudents,
                    inactiveStudents: students - activeStudents
                }
            };
        } catch (error) {
            console.error('Get school stats error:', error);
            return {
                ok: false,
                code: 500,
                errors: 'Failed to retrieve school statistics'
            };
        }
    }
};