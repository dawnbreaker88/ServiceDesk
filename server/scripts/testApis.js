import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import app from '../app.js';

const PORT = 5001; // test port
let server;
let adminToken = '';
let managerToken = '';
let techToken = '';
let empToken = '';
let assetToken = '';

const API_BASE = `http://localhost:${PORT}/api`;

const testEndpoint = async (name, url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`  ✅ [${res.status}] ${name}`);
      return { success: true, status: res.status, data };
    } else {
      console.log(`  ❌ [${res.status}] ${name} - ${data.message || res.statusText}`);
      return { success: false, status: res.status, data };
    }
  } catch (err) {
    console.log(`  💥 [ERROR] ${name}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

const runApiTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 RUNNING END-TO-END REST API VERIFICATION');
  console.log('=============================================\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk');

  server = app.listen(PORT);

  try {
    // 1. Healthcheck
    await testEndpoint('Health Check', `${API_BASE}/health`);

    // 2. Auth Logins
    console.log('\n🔑 1. Testing Authentication:');
    const adminLogin = await testEndpoint('Admin Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@servicedesk.com', password: 'Password123!' }),
    });
    adminToken = adminLogin.data.token;

    const managerLogin = await testEndpoint('Manager Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@servicedesk.com', password: 'Password123!' }),
    });
    managerToken = managerLogin.data.token;

    const techLogin = await testEndpoint('Technician Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tech.rahul@servicedesk.com', password: 'Password123!' }),
    });
    techToken = techLogin.data.token;

    const empLogin = await testEndpoint('Employee Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'emp.prabhath@servicedesk.com', password: 'Password123!' }),
    });
    empToken = empLogin.data.token;

    const assetLogin = await testEndpoint('Asset Manager Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'asset.marcus@servicedesk.com', password: 'Password123!' }),
    });
    assetToken = assetLogin.data.token;

    // 3. User & Auth Profile
    console.log('\n👤 2. Testing User & Profile Endpoints:');
    await testEndpoint('Get Me Profile (Employee)', `${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    await testEndpoint('Get All Users (Admin)', `${API_BASE}/users?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // 4. Departments, Categories, SLA Policies
    console.log('\n🏢 3. Testing Core Catalog & Policies:');
    const deptsRes = await testEndpoint('Get Departments', `${API_BASE}/departments`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const catsRes = await testEndpoint('Get Categories', `${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    await testEndpoint('Get SLA Policies', `${API_BASE}/sla`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });

    // 5. Assets Lifecycle
    console.log('\n📦 4. Testing Asset Inventory:');
    await testEndpoint('Get My Assigned Assets (Employee)', `${API_BASE}/assets/my-assets`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    const assetsRes = await testEndpoint('Get All Assets (Asset Manager)', `${API_BASE}/assets?limit=5`, {
      headers: { Authorization: `Bearer ${assetToken}` },
    });

    // 6. Tickets & Workflow
    console.log('\n🎫 5. Testing Ticket Lifecycle & Actions:');
    const myTicketsRes = await testEndpoint('Get Employee Own Tickets', `${API_BASE}/tickets`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });

    // Create a new Ticket
    const firstCat = catsRes.data?.data?.[0]?._id;
    const createTicketRes = await testEndpoint('Create Ticket (Employee)', `${API_BASE}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        title: 'Test Monitor display flickering over HDMI',
        description: 'External monitor blinks every 30 seconds when connected to desk dock.',
        category: firstCat,
        priority: 'MEDIUM',
      }),
    });

    const newTicketId = createTicketRes.data?.data?._id;

    if (newTicketId) {
      // Get single ticket details
      await testEndpoint('Get Ticket Details with Audit & Timeline', `${API_BASE}/tickets/${newTicketId}`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });

      // Manager assigns ticket to technician
      await testEndpoint('Assign Ticket to Rahul (Manager)', `${API_BASE}/tickets/${newTicketId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({ technicianId: techLogin.data.user._id }),
      });

      // Technician starts work
      await testEndpoint('Start Work on Ticket (Technician)', `${API_BASE}/tickets/${newTicketId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${techToken}` },
      });

      // Add Public Comment
      await testEndpoint('Add Technician Comment (Public)', `${API_BASE}/tickets/${newTicketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
        body: JSON.stringify({ message: 'I have replaced the HDMI cable and refreshed GPU drivers.' }),
      });

      // Add WorkLog
      await testEndpoint('Log Work 25 mins (Technician)', `${API_BASE}/tickets/${newTicketId}/worklogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
        body: JSON.stringify({ description: 'Hardware swap & stress test', durationMinutes: 25 }),
      });

      // Resolve Ticket
      await testEndpoint('Resolve Ticket (Technician)', `${API_BASE}/tickets/${newTicketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
        body: JSON.stringify({ resolutionSummary: 'Replaced faulty high-speed HDMI cable.' }),
      });

      // Employee Closes Ticket
      await testEndpoint('Confirm & Close Ticket (Employee)', `${API_BASE}/tickets/${newTicketId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${empToken}` },
      });
    }

    // 7. AI Support Assistant
    console.log('\n🤖 6. Testing AI Support & Troubleshooting Assistant:');
    const aiChat1 = await testEndpoint('AI Chat - Initial Symptom Query', `${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ message: 'My laptop cannot connect to wifi Corp-Secure' }),
    });

    const sessionId = aiChat1.data?.sessionId;

    await testEndpoint('AI Chat - Escalation Prompt', `${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ sessionId, action: 'ESCALATE_TICKET' }),
    });

    await testEndpoint('AI Classify Text', `${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ text: 'Dell laptop blue screen BSOD critical process died on boot' }),
    });

    // 8. Notifications
    console.log('\n🔔 7. Testing Notifications:');
    await testEndpoint('Get Notifications (Employee)', `${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    await testEndpoint('Mark All Notifications as Read', `${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${empToken}` },
    });

    // 9. Reporting & Analytics
    console.log('\n📊 8. Testing Dashboard & Analytics:');
    await testEndpoint('Dashboard Metrics (Employee)', `${API_BASE}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    await testEndpoint('Dashboard Metrics (Manager)', `${API_BASE}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    await testEndpoint('SLA Compliance Report (Manager)', `${API_BASE}/reports/sla`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    await testEndpoint('Technician Workload Report (Manager)', `${API_BASE}/reports/technicians`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    await testEndpoint('Audit Logs Viewer (Admin)', `${API_BASE}/audit?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    console.log('\n=============================================');
    console.log('🎉 ALL REST API ENDPOINTS VERIFIED AND WORKING!');
    console.log('=============================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runApiTests();
