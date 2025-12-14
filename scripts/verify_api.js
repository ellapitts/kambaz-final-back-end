
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000/api';
// We need a session, so we might need to login or mock it if auth is required.
// Looking at routes, createCourse checks for currentUser in session.
// We must simulate a logged in user.
// Since we don't have a frontend easy way to login here, we'll hit the signin endpoint first?
// Or we can disable auth for testing? 
// The routes check `req.session["currentUser"]`.
// We need to sign in as a user first.

async function verify() {
    console.log("Starting Verification...");

    // 1. Sign In (Assuming a user exists or we need to creaet one)
    // Let's try to create a user first
    const testUser = {
        username: "verify_test_user_" + Date.now(),
        password: "password123",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "FACULTY"
    };

    let cookie = "";

    try {
        console.log("1. Creating/Signing In User...");
        // Try Register
        let response = await fetch(`${BASE_URL}/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (!response.ok) {
            // Maybe user exists, try login
            console.log("   Signup failed (maybe exists), trying login...");
            response = await fetch(`${BASE_URL}/users/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: testUser.username, password: testUser.password })
            });
        }

        if (!response.ok) {
            throw new Error(`Failed to auth: ${response.status} ${response.statusText}`);
        }

        // Get cookie
        const rawCookie = response.headers.get('set-cookie');
        if (rawCookie) {
            cookie = rawCookie.split(';')[0];
            console.log("   Auth successful, cookie obtained.");
        } else {
            console.warn("   Auth successful but NO COOKIE returned. Future requests might fail.");
        }

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': cookie
        };

        // 2. Create Course
        console.log("2. Creating Course...");
        const courseData = {
            name: "Test Course " + Date.now(),
            number: "TEST101",
            startDate: "2023-01-01",
            endDate: "2023-05-01",
            description: "A course for testing"
        };

        let courseRes = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(courseData)
        });

        if (!courseRes.ok) throw new Error(`Create Course Failed: ${courseRes.status}`);
        const course = await courseRes.json();
        console.log(`   Course Created: ${course._id}`);

        // 3. Create Module
        console.log("3. Creating Module...");
        const moduleData = {
            name: "Test Module 1",
            description: "Testing modules"
        };
        let modRes = await fetch(`${BASE_URL}/courses/${course._id}/modules`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(moduleData)
        });
        if (!modRes.ok) throw new Error(`Create Module Failed: ${modRes.status}`);
        const module = await modRes.json();
        console.log(`   Module Created: ${module._id}`);

        // 4. Create Assignment
        console.log("4. Creating Assignment...");
        const assignData = {
            title: "Test Assignment 1",
            description: "Testing assignments",
            points: 100,
            dueDate: "2023-12-31"
        };
        let assignRes = await fetch(`${BASE_URL}/courses/${course._id}/assignments`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(assignData)
        });
        if (!assignRes.ok) throw new Error(`Create Assignment Failed: ${assignRes.status}`);
        const assignment = await assignRes.json();
        console.log(`   Assignment Created: ${assignment._id}`);

        // 5. Verify Assignment in List
        console.log("5. Verifying Assignment List...");
        let listRes = await fetch(`${BASE_URL}/courses/${course._id}/assignments`, { headers });
        const list = await listRes.json();
        const found = list.find(a => a._id === assignment._id);
        if (!found) throw new Error("Assignment not found in list!");
        console.log("   Assignment verified in list.");

        // 6. Verify Auto-Enrollment
        console.log("6. Verifying Auto-Enrollment...");
        // After creating course, creator should be enrolled
        // We can check /api/users/current/courses or /api/courses/:id/users
        // But our login cookie is for the creator.
        let myCoursesRes = await fetch(`${BASE_URL}/users/current/courses`, { headers });
        const myCourses = await myCoursesRes.json();
        const enrolled = myCourses.find(c => c._id === course._id);
        if (!enrolled) throw new Error("Creator NOT automatically enrolled in course!");
        console.log("   Creator auto-enrolled successfully.");

        // 7. Cleanup (Deleting Course)
        console.log("7. Cleanup (Deleting Course)...");
        await fetch(`${BASE_URL}/courses/${course._id}`, { method: 'DELETE', headers });
        console.log("   Cleanup done.");

        console.log("VERIFICATION SUCCESSFUL!");

    } catch (e) {
        console.error("VERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verify();
