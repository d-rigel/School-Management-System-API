const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('../managers/entities/user/user.mongoModel');
const School = require('../managers/entities/school/school.mongoModel');
const Classroom = require('../managers/entities/classroom/classroom.mongoModel');
const Student = require('../managers/entities/student/student.mongoModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_management';
const BCRYPT_ROUNDS = 10;

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            School.deleteMany({}),
            Classroom.deleteMany({}),
            Student.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create Superadmin
        const superadminPassword = await bcrypt.hash('Superadmin@123', BCRYPT_ROUNDS);
        const superadmin = await User.create({
            email: 'superadmin@schoolsystem.com',
            password: superadminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'superadmin',
            isActive: true
        });
        console.log('Created superadmin user');

        // Create Schools
        const schools = await School.insertMany([
            {
                name: 'Greenwood High School',
                code: 'GHS001',
                address: {
                    street: '123 Education Lane',
                    city: 'Lagos',
                    state: 'Lagos',
                    country: 'Nigeria',
                    postalCode: '100001'
                },
                contactInfo: {
                    email: 'info@greenwoodhigh.edu.ng',
                    phone: '+234-123-456-7890',
                    website: 'https://greenwoodhigh.edu.ng'
                },
                principalName: 'Dr. Jane Okonkwo',
                establishedYear: 1995,
                totalCapacity: 1000,
                isActive: true
            },
            {
                name: 'Riverside Academy',
                code: 'RSA001',
                address: {
                    street: '456 River Road',
                    city: 'Abuja',
                    state: 'FCT',
                    country: 'Nigeria',
                    postalCode: '900001'
                },
                contactInfo: {
                    email: 'contact@riverside.edu.ng',
                    phone: '+234-987-654-3210',
                    website: 'https://riverside.edu.ng'
                },
                principalName: 'Mr. Chukwuma Nwankwo',
                establishedYear: 2005,
                totalCapacity: 800,
                isActive: true
            }
        ]);
        console.log('Created schools');

        // Create School Administrators
        const adminPassword = await bcrypt.hash('Admin@123', BCRYPT_ROUNDS);
        const schoolAdmins = await User.insertMany([
            {
                email: 'admin@greenwoodhigh.edu.ng',
                password: adminPassword,
                firstName: 'John',
                lastName: 'Adebayo',
                role: 'school_admin',
                schoolId: schools[0]._id,
                isActive: true
            },
            {
                email: 'admin@riverside.edu.ng',
                password: adminPassword,
                firstName: 'Mary',
                lastName: 'Okoro',
                role: 'school_admin',
                schoolId: schools[1]._id,
                isActive: true
            }
        ]);
        console.log('Created school administrators');

        // Create Classrooms for Greenwood High School
        const greenwoodClassrooms = await Classroom.insertMany([
            {
                name: 'Grade 10 Science A',
                code: 'G10-SCI-A',
                schoolId: schools[0]._id,
                grade: 'Grade 10',
                section: 'A',
                capacity: 40,
                currentEnrollment: 0,
                resources: [
                    { name: 'Desks', quantity: 40, condition: 'good' },
                    { name: 'Whiteboard', quantity: 1, condition: 'excellent' },
                    { name: 'Projector', quantity: 1, condition: 'good' }
                ],
                academicYear: '2024-2025',
                isActive: true
            },
            {
                name: 'Grade 10 Arts B',
                code: 'G10-ART-B',
                schoolId: schools[0]._id,
                grade: 'Grade 10',
                section: 'B',
                capacity: 35,
                currentEnrollment: 0,
                resources: [
                    { name: 'Desks', quantity: 35, condition: 'good' },
                    { name: 'Whiteboard', quantity: 1, condition: 'good' }
                ],
                academicYear: '2024-2025',
                isActive: true
            },
            {
                name: 'Grade 11 Science A',
                code: 'G11-SCI-A',
                schoolId: schools[0]._id,
                grade: 'Grade 11',
                section: 'A',
                capacity: 38,
                currentEnrollment: 0,
                resources: [
                    { name: 'Desks', quantity: 38, condition: 'excellent' },
                    { name: 'Smart Board', quantity: 1, condition: 'excellent' },
                    { name: 'Lab Equipment', quantity: 15, condition: 'good' }
                ],
                academicYear: '2024-2025',
                isActive: true
            }
        ]);

        // Create Classrooms for Riverside Academy
        const riversideClassrooms = await Classroom.insertMany([
            {
                name: 'Year 9 Alpha',
                code: 'Y9-ALPHA',
                schoolId: schools[1]._id,
                grade: 'Year 9',
                section: 'Alpha',
                capacity: 30,
                currentEnrollment: 0,
                resources: [
                    { name: 'Desks', quantity: 30, condition: 'excellent' },
                    { name: 'Interactive Display', quantity: 1, condition: 'excellent' }
                ],
                academicYear: '2024-2025',
                isActive: true
            },
            {
                name: 'Year 10 Beta',
                code: 'Y10-BETA',
                schoolId: schools[1]._id,
                grade: 'Year 10',
                section: 'Beta',
                capacity: 32,
                currentEnrollment: 0,
                resources: [
                    { name: 'Desks', quantity: 32, condition: 'good' },
                    { name: 'Whiteboard', quantity: 1, condition: 'good' }
                ],
                academicYear: '2024-2025',
                isActive: true
            }
        ]);
        console.log('Created classrooms');

        // Create Students for Greenwood High School
        const greenwoodStudents = await Student.insertMany([
            {
                studentId: 'GHS-2024-001',
                firstName: 'Emmanuel',
                lastName: 'Adekunle',
                dateOfBirth: new Date('2008-03-15'),
                gender: 'male',
                schoolId: schools[0]._id,
                classroomId: greenwoodClassrooms[0]._id,
                guardianInfo: {
                    name: 'Mr. Tunde Adekunle',
                    relationship: 'Father',
                    email: 'tunde.adekunle@email.com',
                    phone: '+234-801-234-5678',
                    address: {
                        street: '45 Palm Avenue',
                        city: 'Lagos',
                        state: 'Lagos',
                        country: 'Nigeria',
                        postalCode: '100001'
                    }
                },
                enrollmentDate: new Date('2024-09-01'),
                status: 'active',
                medicalInfo: {
                    bloodGroup: 'O+',
                    allergies: ['Peanuts'],
                    medications: [],
                    emergencyContact: '+234-802-345-6789'
                },
                academicYear: '2024-2025'
            },
            {
                studentId: 'GHS-2024-002',
                firstName: 'Chioma',
                lastName: 'Okafor',
                dateOfBirth: new Date('2008-07-22'),
                gender: 'female',
                schoolId: schools[0]._id,
                classroomId: greenwoodClassrooms[0]._id,
                guardianInfo: {
                    name: 'Mrs. Ngozi Okafor',
                    relationship: 'Mother',
                    email: 'ngozi.okafor@email.com',
                    phone: '+234-803-456-7890'
                },
                enrollmentDate: new Date('2024-09-01'),
                status: 'active',
                medicalInfo: {
                    bloodGroup: 'A+',
                    allergies: [],
                    medications: [],
                    emergencyContact: '+234-804-567-8901'
                },
                academicYear: '2024-2025'
            },
            {
                studentId: 'GHS-2024-003',
                firstName: 'Ibrahim',
                lastName: 'Mohammed',
                dateOfBirth: new Date('2007-11-08'),
                gender: 'male',
                schoolId: schools[0]._id,
                classroomId: greenwoodClassrooms[2]._id,
                guardianInfo: {
                    name: 'Alhaji Musa Mohammed',
                    relationship: 'Father',
                    email: 'musa.mohammed@email.com',
                    phone: '+234-805-678-9012'
                },
                enrollmentDate: new Date('2024-09-01'),
                status: 'active',
                academicYear: '2024-2025'
            }
        ]);

        // Update classroom enrollments for Greenwood
        await Classroom.updateOne(
            { _id: greenwoodClassrooms[0]._id },
            { $set: { currentEnrollment: 2 } }
        );
        await Classroom.updateOne(
            { _id: greenwoodClassrooms[2]._id },
            { $set: { currentEnrollment: 1 } }
        );

        // Create Students for Riverside Academy
        const riversideStudents = await Student.insertMany([
            {
                studentId: 'RSA-2024-001',
                firstName: 'Blessing',
                lastName: 'Ezeh',
                dateOfBirth: new Date('2009-05-12'),
                gender: 'female',
                schoolId: schools[1]._id,
                classroomId: riversideClassrooms[0]._id,
                guardianInfo: {
                    name: 'Dr. Chinedu Ezeh',
                    relationship: 'Father',
                    email: 'chinedu.ezeh@email.com',
                    phone: '+234-806-789-0123'
                },
                enrollmentDate: new Date('2024-09-01'),
                status: 'active',
                academicYear: '2024-2025'
            },
            {
                studentId: 'RSA-2024-002',
                firstName: 'Daniel',
                lastName: 'Akinwale',
                dateOfBirth: new Date('2008-09-30'),
                gender: 'male',
                schoolId: schools[1]._id,
                classroomId: riversideClassrooms[1]._id,
                guardianInfo: {
                    name: 'Mrs. Funmi Akinwale',
                    relationship: 'Mother',
                    email: 'funmi.akinwale@email.com',
                    phone: '+234-807-890-1234'
                },
                enrollmentDate: new Date('2024-09-01'),
                status: 'active',
                medicalInfo: {
                    bloodGroup: 'B+',
                    allergies: [],
                    medications: ['Inhaler for asthma'],
                    emergencyContact: '+234-808-901-2345'
                },
                academicYear: '2024-2025'
            }
        ]);

        // Update classroom enrollments for Riverside
        await Classroom.updateOne(
            { _id: riversideClassrooms[0]._id },
            { $set: { currentEnrollment: 1 } }
        );
        await Classroom.updateOne(
            { _id: riversideClassrooms[1]._id },
            { $set: { currentEnrollment: 1 } }
        );

        console.log('Created students and updated classroom enrollments');

        // Summary
        console.log('\n Seed Summary:');
        console.log('================');
        console.log(`Users: ${await User.countDocuments()}`);
        console.log(`  - Superadmins: ${await User.countDocuments({ role: 'superadmin' })}`);
        console.log(`  - School Admins: ${await User.countDocuments({ role: 'school_admin' })}`);
        console.log(`Schools: ${await School.countDocuments()}`);
        console.log(`Classrooms: ${await Classroom.countDocuments()}`);
        console.log(`Students: ${await Student.countDocuments()}`);
        console.log('================\n');

        console.log('Login Credentials:');
        console.log('====================');
        console.log('Superadmin:');
        console.log('  Email: superadmin@schoolsystem.com');
        console.log('  Password: Superadmin@123\n');
        console.log('Greenwood High School Admin:');
        console.log('  Email: admin@greenwoodhigh.edu.ng');
        console.log('  Password: Admin@123\n');
        console.log('Riverside Academy Admin:');
        console.log('  Email: admin@riverside.edu.ng');
        console.log('  Password: Admin@123\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();