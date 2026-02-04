// src/scripts/seed.js
// Run: node src/scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Route = require('../models/Route.model');
const Bus = require('../models/Bus.model');
const Broadcast = require('../models/Broadcast.model');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        await User.deleteMany({});
        await Route.deleteMany({});
        await Bus.deleteMany({});
        await Broadcast.deleteMany({});
        console.log('✓ Cleared existing data');

        // ============ USERS ============

        // Admin Users
        const admin = await User.create({
            name: 'Super Admin',
            phone: '9999999999',
            email: 'admin@trackmybus.com',
            role: 'admin',
            isVerified: true,
            profileComplete: true,
        });
        console.log('✓ Created Admin:', admin.name);

        // Coordinators
        const coordinator1 = await User.create({
            name: 'Rahul Sharma',
            phone: '9876543210',
            email: 'rahul.coordinator@trackmybus.com',
            role: 'coordinator',
            isVerified: true,
            profileComplete: true,
        });

        const coordinator2 = await User.create({
            name: 'Priya Verma',
            phone: '9876543211',
            email: 'priya.coordinator@trackmybus.com',
            role: 'coordinator',
            isVerified: true,
            profileComplete: true,
        });
        console.log('✓ Created 2 Coordinators');

        // Drivers
        const driver1 = await User.create({
            name: 'Ramesh Kumar',
            phone: '9123456780',
            email: 'ramesh.driver@trackmybus.com',
            role: 'driver',
            isVerified: true,
            profileComplete: true,
        });

        const driver2 = await User.create({
            name: 'Suresh Yadav',
            phone: '9123456781',
            email: 'suresh.driver@trackmybus.com',
            role: 'driver',
            isVerified: true,
            profileComplete: true,
        });

        const driver3 = await User.create({
            name: 'Mahesh Singh',
            phone: '9123456782',
            email: 'mahesh.driver@trackmybus.com',
            role: 'driver',
            isVerified: true,
            profileComplete: true,
        });

        const driver4 = await User.create({
            name: 'Dinesh Patel',
            phone: '9123456783',
            email: 'dinesh.driver@trackmybus.com',
            role: 'driver',
            isVerified: true,
            profileComplete: true,
        });
        console.log('✓ Created 4 Drivers');

        // Students
        const students = await User.insertMany([
            {
                name: 'Arjun Mehta',
                phone: '8529657145',
                email: 'arjun.student@college.edu',
                role: 'student',
                isVerified: true,
                profileComplete: true,
            },
            {
                name: 'Sneha Gupta',
                phone: '9784357844',
                email: 'sneha.student@college.edu',
                role: 'student',
                isVerified: true,
                profileComplete: true,
            },
            {
                name: 'Vikram Joshi',
                phone: '7896541230',
                email: 'vikram.student@college.edu',
                role: 'student',
                isVerified: true,
                profileComplete: true,
            },
            {
                name: 'Pooja Agarwal',
                phone: '7896541231',
                email: 'pooja.student@college.edu',
                role: 'student',
                isVerified: true,
                profileComplete: true,
            },
            {
                name: 'Rohan Kapoor',
                phone: '7896541232',
                email: 'rohan.student@college.edu',
                role: 'student',
                isVerified: true,
                profileComplete: true,
            },
        ]);
        console.log('✓ Created 5 Students');

        // ============ ROUTES ============

        const route1 = await Route.create({
            name: 'Route A - City Center',
            startingPoint: 'Railway Station',
            routeDetails: 'Railway Station → MG Road → City Mall → Bus Stand → College Campus',
            waypoints: [
                { name: 'Railway Station', latitude: 26.9124, longitude: 75.7873, order: 1 },
                { name: 'MG Road', latitude: 26.9180, longitude: 75.7920, order: 2 },
                { name: 'City Mall', latitude: 26.9220, longitude: 75.7980, order: 3 },
                { name: 'Bus Stand', latitude: 26.9280, longitude: 75.8050, order: 4 },
                { name: 'College Campus', latitude: 26.9350, longitude: 75.8120, order: 5 },
            ],
            coordinator: coordinator1._id,
            createdBy: admin._id,
        });

        const route2 = await Route.create({
            name: 'Route B - Industrial Area',
            startingPoint: 'Industrial Estate',
            routeDetails: 'Industrial Estate → Tech Park → Hospital → Market → College Campus',
            waypoints: [
                { name: 'Industrial Estate', latitude: 26.8800, longitude: 75.7500, order: 1 },
                { name: 'Tech Park', latitude: 26.8900, longitude: 75.7600, order: 2 },
                { name: 'Hospital', latitude: 26.9000, longitude: 75.7700, order: 3 },
                { name: 'Market', latitude: 26.9150, longitude: 75.7850, order: 4 },
                { name: 'College Campus', latitude: 26.9350, longitude: 75.8120, order: 5 },
            ],
            coordinator: coordinator1._id,
            createdBy: admin._id,
        });

        const route3 = await Route.create({
            name: 'Route C - Residential',
            startingPoint: 'Green Valley',
            routeDetails: 'Green Valley → Sunrise Apartments → School Junction → Temple Road → College Campus',
            waypoints: [
                { name: 'Green Valley', latitude: 26.9500, longitude: 75.7300, order: 1 },
                { name: 'Sunrise Apartments', latitude: 26.9450, longitude: 75.7500, order: 2 },
                { name: 'School Junction', latitude: 26.9400, longitude: 75.7700, order: 3 },
                { name: 'Temple Road', latitude: 26.9380, longitude: 75.7900, order: 4 },
                { name: 'College Campus', latitude: 26.9350, longitude: 75.8120, order: 5 },
            ],
            coordinator: coordinator2._id,
            createdBy: admin._id,
        });

        const route4 = await Route.create({
            name: 'Route D - Highway',
            startingPoint: 'Highway Toll Plaza',
            routeDetails: 'Highway Toll Plaza → Petrol Pump → Village Turn → Main Gate → College Campus',
            waypoints: [
                { name: 'Highway Toll Plaza', latitude: 26.8500, longitude: 75.8500, order: 1 },
                { name: 'Petrol Pump', latitude: 26.8700, longitude: 75.8400, order: 2 },
                { name: 'Village Turn', latitude: 26.9000, longitude: 75.8300, order: 3 },
                { name: 'Main Gate', latitude: 26.9200, longitude: 75.8200, order: 4 },
                { name: 'College Campus', latitude: 26.9350, longitude: 75.8120, order: 5 },
            ],
            coordinator: coordinator2._id,
            createdBy: admin._id,
        });
        console.log('✓ Created 4 Routes');

        // ============ BUSES ============

        const buses = await Bus.insertMany([
            {
                busNumber: 'RJ-14-PA-1234',
                driver: driver1._id,
                route: route1._id,
                departureTime: '07:30',
                capacity: 45,
                isAvailableToday: true,
                coordinator: coordinator1._id,
                status: 'active',
                currentLocation: {
                    latitude: 26.9124,
                    longitude: 75.7873,
                    timestamp: new Date(),
                },
            },
            {
                busNumber: 'RJ-14-PA-5678',
                driver: driver2._id,
                route: route2._id,
                departureTime: '07:45',
                capacity: 50,
                isAvailableToday: true,
                coordinator: coordinator1._id,
                status: 'active',
                currentLocation: {
                    latitude: 26.8800,
                    longitude: 75.7500,
                    timestamp: new Date(),
                },
            },
            {
                busNumber: 'RJ-14-PA-9012',
                driver: driver3._id,
                route: route3._id,
                departureTime: '08:00',
                capacity: 40,
                isAvailableToday: true,
                coordinator: coordinator2._id,
                status: 'active',
                currentLocation: {
                    latitude: 26.9500,
                    longitude: 75.7300,
                    timestamp: new Date(),
                },
            },
            {
                busNumber: 'RJ-14-PA-3456',
                driver: driver4._id,
                route: route4._id,
                departureTime: '08:15',
                capacity: 55,
                isAvailableToday: false, // Not running today
                coordinator: coordinator2._id,
                status: 'maintenance',
            },
        ]);
        console.log('✓ Created 4 Buses');

        // ============ BROADCASTS ============

        await Broadcast.insertMany([
            {
                title: 'Welcome to Track My Bus!',
                message: 'Dear students, welcome to our new bus tracking system. You can now track your bus in real-time.',
                targetRole: 'all',
                channels: { email: false, push: false, inApp: true },
                sentBy: admin._id,
            },
            {
                title: 'Bus Schedule Update',
                message: 'Due to road construction on Route B, buses may be delayed by 10-15 minutes. We apologize for the inconvenience.',
                targetRole: 'student',
                channels: { email: true, push: false, inApp: true },
                sentBy: admin._id,
            },
            {
                title: 'Driver Meeting Notice',
                message: 'All drivers are requested to attend a safety meeting on Monday at 9 AM in the main office.',
                targetRole: 'driver',
                channels: { email: true, push: false, inApp: true },
                sentBy: coordinator1._id,
            },
        ]);
        console.log('✓ Created 3 Broadcasts');

        // ============ SUMMARY ============

        console.log('\n========== SEED DATA SUMMARY ==========');
        console.log('Users:');
        console.log('  - Admin: 1 (Phone: 9999999999)');
        console.log('  - Coordinators: 2');
        console.log('  - Drivers: 4');
        console.log('  - Students: 5');
        console.log('Routes: 4');
        console.log('Buses: 4');
        console.log('Broadcasts: 3');
        console.log('\n========== LOGIN CREDENTIALS ==========');
        console.log('Admin:       Phone: 9999999999');
        console.log('Coordinator: Phone: 9876543210');
        console.log('Driver:      Phone: 9123456780');
        console.log('Student:     Phone: 8529657145');
        console.log('\n(Use OTP login - check console for OTP)');
        console.log('=========================================\n');

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('✗ Seed failed:', error);
        process.exit(1);
    }
};

seedData();
