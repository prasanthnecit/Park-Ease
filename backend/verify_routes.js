const port = 5000;
const baseUrl = `http://localhost:${port}/api`;

async function testRoutes() {
    console.log("--- Starting Automated Route Verification ---");

    // 1. Login as Admin
    console.log("\n[1] Logging in as Admin...");
    const adminRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "admin@gmail.com", password: "admin" })
    });

    if (!adminRes.ok) {
        console.error("Failed to login as admin. Make sure you registered the admin user.");
        return;
    }

    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    console.log("Admin Login Successful. Token received.");

    // 2. Test Admin Route (See All Users)
    console.log("\n[2] Testing Admin Route: GET /admin/users (as Admin)");
    const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
        headers: { 'x-auth-token': adminToken }
    });

    if (adminUsersRes.ok) {
        const users = await adminUsersRes.json();
        console.log(`✅ Success! Retrieved ${users.length} users.`);
    } else {
        console.error(`❌ Failed! Status: ${adminUsersRes.status}`);
    }

    // 3. Register and Login a Test User
    const testEmail = `testuser_${Date.now()}@req.com`;
    console.log(`\n[3] Registering new Test User: ${testEmail}`);

    await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Test User",
            email: testEmail,
            password: "password123",
            vehicleNumber: "TEST-123",
            vehicleType: "Bike",
            phone: "1234567890",
            role: "user"
        })
    });

    console.log("Logging in as Test User...");
    const userRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: "password123" })
    });

    const userData = await userRes.json();
    const userToken = userData.token;
    console.log("User Login Successful. Token received.");

    // 4. Test User Route (Dashboard)
    console.log("\n[4] Testing User Route: GET /user/dashboard (as User)");
    const userDashRes = await fetch(`${baseUrl}/user/dashboard`, {
        headers: { 'x-auth-token': userToken }
    });

    if (userDashRes.ok) {
        const msg = await userDashRes.json();
        console.log(`✅ Success! Response: "${msg.message}"`);
    } else {
        console.error(`❌ Failed! Status: ${userDashRes.status}`);
    }

    // 5. Negative Test: User accessing Admin Route
    console.log("\n[5] Negative Test: User accessing Admin Route");
    const failRes1 = await fetch(`${baseUrl}/admin/users`, {
        headers: { 'x-auth-token': userToken }
    });
    if (failRes1.status === 403) {
        console.log("✅ Success! Access Denied (403) as expected.");
    } else {
        console.error(`❌ Failed! Expected 403, got ${failRes1.status}`);
    }

    // 6. Negative Test: Admin accessing User Route
    console.log("\n[6] Negative Test: Admin accessing User Route");
    const failRes2 = await fetch(`${baseUrl}/user/dashboard`, {
        headers: { 'x-auth-token': adminToken }
    });
    if (failRes2.status === 403) {
        console.log("✅ Success! Access Denied (403) as expected.");
    } else {
        console.error(`❌ Failed! Expected 403, got ${failRes2.status}`);
    }

    console.log("\n--- Verification Complete ---");
}

testRoutes().catch(err => console.error("Script Error:", err));
