import http from 'http';

const BASE_URL = 'http://127.0.0.1:5001';

const request = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING AUTOMATED API INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(` ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Health Check Endpoint
    const health = await request('/health');
    assert(health.status === 200 && health.body.status === 'ok', 'GET /health returns 200 OK & operational status');
    assert(health.body.database === 'connected', 'GET /health verifies active MongoDB connection');

    // 2. Seed Roles API
    const seed = await request('/api/auth/seed-roles', 'POST');
    assert(seed.status === 200 && seed.body.success === true, 'POST /api/auth/seed-roles seeds standard accounts');

    // 3. Login - Invalid Credentials Error Test
    const invalidLogin = await request('/api/auth/login', 'POST', {
      email: 'nonexistent@zaalima.com',
      password: 'wrongpassword'
    });
    assert(invalidLogin.status === 401 && invalidLogin.body.success === false, 'POST /api/auth/login returns 401 for invalid credentials');

    // 4. Login - Super Admin Success Test
    const superAdminLogin = await request('/api/auth/login', 'POST', {
      email: 'superadmin@zaalima.com',
      password: 'password123'
    });
    assert(superAdminLogin.status === 200 && superAdminLogin.body.data?.token, 'POST /api/auth/login authenticates Super Admin & returns JWT');

    const token = superAdminLogin.body.data?.token;

    // 5. Authenticated /me Route
    const me = await request('/api/auth/me', 'GET', null, { Authorization: `Bearer ${token}` });
    assert(me.status === 200 && me.body.data?.role === 'superadmin', 'GET /api/auth/me returns authenticated user details');

    // 6. Stores API Route
    const stores = await request('/api/stores');
    assert(stores.status === 200 && Array.isArray(stores.body.data), 'GET /api/stores returns multi-tenant stores array');

    // 7. Products API Route
    const products = await request('/api/products', 'GET', null, { 'x-tenant-id': 'tenant-megastore' });
    assert(products.status === 200 && Array.isArray(products.body.data || products.body.products), 'GET /api/products returns tenant catalog');

    // 8. 404 Route Not Found Error Middleware Test
    const notFound = await request('/api/non-existent-route-123');
    assert(notFound.status === 404 && notFound.body.success === false, 'GET /api/non-existent-route returns structured 404 JSON error');

    // 9. Super Admin Users API
    const users = await request('/api/auth/users', 'GET', null, { Authorization: `Bearer ${token}` });
    assert(users.status === 200 && Array.isArray(users.body.data), 'GET /api/auth/users returns populated user directory');

    // 10. Checkout Session - Unauthenticated Order Placement Test (Must fail with 401)
    const unauthCheckout = await request('/api/payments/create-checkout-session', 'POST', {
      items: [{ name: 'Test Product', price: 999, quantity: 1 }],
      customerInfo: { fullName: 'Guest User', email: 'guest@example.com' }
    });
    assert(unauthCheckout.status === 401, 'POST /api/payments/create-checkout-session blocks unauthenticated guests with 401 Unauthorized');

    // 11. Checkout Session - Non-Customer Role Order Placement Test (Must fail with 403 Forbidden)
    const adminCheckout = await request('/api/payments/create-checkout-session', 'POST', {
      items: [{ name: 'Test Product', price: 999, quantity: 1 }],
      customerInfo: { fullName: 'Super Admin', email: 'superadmin@zaalima.com' },
      tenantId: 'tenant-megastore'
    }, { Authorization: `Bearer ${token}` });
    assert(adminCheckout.status === 403, 'POST /api/payments/create-checkout-session blocks Super Admin/Vendor with 403 Forbidden');

    // 12. Customer Login & Authenticated Order Placement Test
    const customerLogin = await request('/api/auth/login', 'POST', {
      email: 'customer@zaalima.com',
      password: 'password123'
    });
    const customerToken = customerLogin.body.data?.token;

    const customerCheckout = await request('/api/payments/create-checkout-session', 'POST', {
      items: [{ name: 'Test Product', price: 999, quantity: 1 }],
      customerInfo: { fullName: 'Customer Account', email: 'customer@zaalima.com' },
      tenantId: 'tenant-megastore'
    }, { Authorization: `Bearer ${customerToken}` });
    assert(customerCheckout.status === 200 && customerCheckout.body.success === true, 'POST /api/payments/create-checkout-session places order for logged-in Customer account');

    // 13. Customer Orders Fetching & Isolation Test
    const customerOrders = await request('/api/orders', 'GET', null, { Authorization: `Bearer ${customerToken}`, 'x-tenant-id': 'tenant-megastore' });
    assert(customerOrders.status === 200 && customerOrders.body.data?.length > 0 && customerOrders.body.data.every(o => o.customerEmail === 'customer@zaalima.com' || String(o.customer) === String(customerLogin.body.data?.user?._id)), 'GET /api/orders returns orders associated with logged-in customer account session');

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Integration test execution error:', err);
    process.exit(1);
  }
}

runTests();
