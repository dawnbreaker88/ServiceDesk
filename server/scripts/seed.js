import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import {
  User,
  Department,
  Category,
  SlaPolicy,
  Asset,
  AssetAssignment,
  Ticket,
  Comment,
  WorkLog,
  TroubleshootingGuide,
  Notification,
  AuditLog,
} from '../models/index.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/servicedesk';

const seedDatabase = async () => {
  try {
    console.log(`\n======================================================`);
    console.log(`[ServiceDesk Pro Seed] Connecting to Database...`);
    console.log(`URI: ${MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    console.log(`======================================================\n`);

    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Database connected successfully.');

    // 1. Wipe existing data
    console.log('[Seed] Wiping existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      SlaPolicy.deleteMany({}),
      Asset.deleteMany({}),
      AssetAssignment.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      WorkLog.deleteMany({}),
      TroubleshootingGuide.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Collections cleared.');

    // 2. Seed Departments
    console.log('[Seed] Creating corporate departments...');
    const departments = await Department.create([
      { name: 'Engineering', code: 'ENG', description: 'Software engineering, cloud systems & infrastructure' },
      { name: 'Product & Design', code: 'PRD', description: 'Product management and UI/UX design' },
      { name: 'Marketing & Sales', code: 'MKT', description: 'Brand marketing, demand gen and sales operations' },
      { name: 'Finance & Legal', code: 'FIN', description: 'Financial planning, accounting and compliance' },
      { name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition and benefits' },
      { name: 'Operations & Facilities', code: 'OPS', description: 'Office management and logistics' },
    ]);
    const [engDept, prdDept, mktDept, finDept, hrDept, opsDept] = departments;

    // 3. Seed Categories
    console.log('[Seed] Creating ticket taxonomy categories...');
    const categories = await Category.create([
      { name: 'Hardware & Devices', code: 'HW', description: 'Laptops, desktops, monitors, docking stations, peripherals', icon: 'laptop' },
      { name: 'Software & Applications', code: 'SW', description: 'OS issues, developer tooling, app crashes, license requests', icon: 'code' },
      { name: 'Network & Connectivity', code: 'NET', description: 'Corp-Secure Wi-Fi, WireGuard/GlobalProtect VPN, DNS, LAN latency', icon: 'wifi' },
      { name: 'Identity & Access', code: 'ACCESS', description: 'Okta SSO, Active Directory, 2FA/MFA reset, role permissions', icon: 'key' },
      { name: 'Email & Collaboration', code: 'EMAIL', description: 'Outlook 365, Teams, Slack, calendar sync and Exchange', icon: 'mail' },
      { name: 'Security & Compliance', code: 'SEC', description: 'Phishing alerts, endpoint protection, antivirus, audit checks', icon: 'shield' },
    ]);
    const [hwCat, swCat, netCat, accessCat, emailCat, secCat] = categories;

    // 4. Seed SLA Policies
    console.log('[Seed] Setting up enterprise SLA matrix...');
    const slaPolicies = await SlaPolicy.create([
      {
        name: 'Critical Priority SLA (Tier 1)',
        priority: 'CRITICAL',
        responseTimeMinutes: 15,
        resolutionTimeMinutes: 120, // 2 Hours
        warningThresholdPercent: 75,
        description: 'Company-wide outages, executive workstation blockers, active security incidents',
      },
      {
        name: 'High Priority SLA (Tier 2)',
        priority: 'HIGH',
        responseTimeMinutes: 30,
        resolutionTimeMinutes: 240, // 4 Hours
        warningThresholdPercent: 75,
        description: 'Single user work stopped, conference room AV failure, VPN cluster failure',
      },
      {
        name: 'Medium Priority SLA (Tier 3)',
        priority: 'MEDIUM',
        responseTimeMinutes: 120, // 2 Hours
        resolutionTimeMinutes: 480, // 8 Hours
        warningThresholdPercent: 80,
        description: 'Software glitch with workaround, peripheral accessory replacement',
      },
      {
        name: 'Low Priority SLA (Tier 4)',
        priority: 'LOW',
        responseTimeMinutes: 480, // 8 Hours
        resolutionTimeMinutes: 1440, // 24 Hours
        warningThresholdPercent: 80,
        description: 'General IT inquiries, documentation clarification, software license requests',
      },
    ]);
    const slaMap = slaPolicies.reduce((acc, p) => ({ ...acc, [p.priority]: p }), {});

    // 5. Seed Users
    console.log('[Seed] Creating demo user personas...');
    const users = await User.create([
      // Admin
      {
        name: 'Alex Rivera',
        email: 'admin@servicedesk.com',
        password: 'Password123!',
        role: 'ADMIN',
        department: engDept._id,
        phone: '+1 (555) 010-0001',
      },
      // IT Manager
      {
        name: 'Elena Rostova',
        email: 'manager@servicedesk.com',
        password: 'Password123!',
        role: 'MANAGER',
        department: engDept._id,
        phone: '+1 (555) 010-0002',
      },
      // Technicians
      {
        name: 'Rahul Sharma',
        email: 'tech.rahul@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: engDept._id,
        phone: '+1 (555) 010-0010',
      },
      {
        name: 'Sarah Chen',
        email: 'tech.sarah@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: engDept._id,
        phone: '+1 (555) 010-0011',
      },
      {
        name: 'Marcus Vance',
        email: 'tech.marcus@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: opsDept._id,
        phone: '+1 (555) 010-0012',
      },
      // Employees
      {
        name: 'Prabhath Perera',
        email: 'emp.prabhath@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: engDept._id,
        phone: '+1 (555) 010-0101',
      },
      {
        name: 'Emma Watson',
        email: 'emp.emma@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: mktDept._id,
        phone: '+1 (555) 010-0102',
      },
      {
        name: 'David Kim',
        email: 'emp.david@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: finDept._id,
        phone: '+1 (555) 010-0103',
      },
      {
        name: 'Lisa Morales',
        email: 'emp.lisa@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: hrDept._id,
        phone: '+1 (555) 010-0104',
      },
    ]);

    const [adminUser, managerUser, techRahul, techSarah, techMarcus, empPrabhath, empEmma, empDavid, empLisa] = users;

    // 6. Seed Hardware Assets
    console.log('[Seed] Provisioning hardware fleet...');
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const twoYearsLater = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);

    const assets = await Asset.create([
      {
        assetTag: 'AST-00101',
        name: 'MacBook Pro 16" M3 Max',
        category: 'LAPTOP',
        model: 'Apple M3 Max 36GB / 1TB SSD',
        serialNumber: 'C02G9988MD6T',
        status: 'ASSIGNED',
        assignedUser: empPrabhath._id,
        purchaseDate: new Date('2024-01-15'),
        warrantyExpiry: twoYearsLater,
        cost: 3499,
        location: 'Building A, Floor 3 (Engineering)',
        specs: { cpu: 'Apple M3 Max 14-core', ram: '36 GB', storage: '1 TB NVMe', os: 'macOS Sonoma 14.5' },
      },
      {
        assetTag: 'AST-00102',
        name: 'Dell UltraSharp 32" 4K Monitor',
        category: 'MONITOR',
        model: 'Dell U3223QE 4K USB-C Hub',
        serialNumber: 'CN-0K7982-74261',
        status: 'ASSIGNED',
        assignedUser: empPrabhath._id,
        purchaseDate: new Date('2024-02-10'),
        warrantyExpiry: twoYearsLater,
        cost: 899,
        location: 'Desk 342 - Prabhath',
      },
      {
        assetTag: 'AST-00103',
        name: 'ThinkPad X1 Carbon Gen 11',
        category: 'LAPTOP',
        model: 'Lenovo ThinkPad X1 Carbon (Intel i7)',
        serialNumber: 'PF388910',
        status: 'ASSIGNED',
        assignedUser: empEmma._id,
        purchaseDate: new Date('2023-11-20'),
        warrantyExpiry: oneYearLater,
        cost: 2199,
        location: 'Building B, Floor 2 (Marketing)',
        specs: { cpu: 'Intel Core i7-1365U', ram: '16 GB', storage: '512 GB SSD', os: 'Windows 11 Pro' },
      },
      {
        assetTag: 'AST-00104',
        name: 'MacBook Air 15" M2',
        category: 'LAPTOP',
        model: 'Apple M2 16GB / 512GB',
        serialNumber: 'C02H1122AA44',
        status: 'ASSIGNED',
        assignedUser: empDavid._id,
        purchaseDate: new Date('2024-03-01'),
        warrantyExpiry: twoYearsLater,
        cost: 1499,
        location: 'Building A, Floor 1 (Finance)',
      },
      {
        assetTag: 'AST-00105',
        name: 'Dell Latitude 5540',
        category: 'LAPTOP',
        model: 'Dell Latitude 5540 Core i5',
        serialNumber: '89JJL22',
        status: 'ASSIGNED',
        assignedUser: empLisa._id,
        purchaseDate: new Date('2023-09-15'),
        warrantyExpiry: oneYearLater,
        cost: 1250,
        location: 'Building A, Floor 2 (HR)',
      },
      {
        assetTag: 'AST-00106',
        name: 'CalDigit TS4 Thunderbolt Dock',
        category: 'ACCESSORY',
        model: 'TS4-US-AMZ',
        serialNumber: 'TS4908129',
        status: 'IN_STOCK',
        purchaseDate: new Date('2024-04-10'),
        warrantyExpiry: twoYearsLater,
        cost: 399,
        location: 'IT Supply Closet B-12',
      },
      {
        assetTag: 'AST-00107',
        name: 'ThinkPad T14s Gen 4',
        category: 'LAPTOP',
        model: 'Lenovo ThinkPad T14s AMD Ryzen 7',
        serialNumber: 'PF499102',
        status: 'IN_STOCK',
        purchaseDate: new Date('2024-05-01'),
        warrantyExpiry: twoYearsLater,
        cost: 1650,
        location: 'IT Hardware Stockroom Shelf 4',
      },
      {
        assetTag: 'AST-00108',
        name: 'Apple Studio Display 27" 5K',
        category: 'MONITOR',
        model: 'Studio Display Nano-texture Glass',
        serialNumber: 'F17HH228800',
        status: 'IN_REPAIR',
        purchaseDate: new Date('2023-08-10'),
        warrantyExpiry: oneYearLater,
        cost: 1899,
        location: 'Apple Authorized Service Center',
      },
    ]);

    const [macPrabhath, monPrabhath, thinkEmma, macDavid] = assets;

    // 7. Seed Knowledge Base Troubleshooting Guides
    console.log('[Seed] Publishing Knowledge Base Guides...');
    await TroubleshootingGuide.create([
      {
        title: 'Connecting to Corp-Secure Wi-Fi',
        category: netCat._id,
        symptoms: ['wifi', 'network', 'corp-secure', 'disconnected', 'certificate', 'wireless', 'internet drops'],
        diagnosticQuestions: [
          { question: 'Are you located inside a company facility or working remotely?', expectedAnswerType: 'TEXT' },
          { question: 'Did you recently change your corporate Okta/SSO password?', expectedAnswerType: 'YES_NO' },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Forget Corp-Secure and re-authenticate',
            details: 'Open Wi-Fi settings, select Corp-Secure, click "Forget Network", then reconnect entering your corporate email and current password.',
          },
          {
            stepNumber: 2,
            instruction: 'Verify Device Trust Certificate',
            details: 'Open Keychain Access (macOS) or Certificate Manager (Windows) and ensure the "Company-Root-CA" certificate is marked Trusted.',
          },
          {
            stepNumber: 3,
            instruction: 'Renew DHCP Lease',
            details: 'In Network Settings -> Advanced -> TCP/IP, click "Renew DHCP Lease" to obtain a fresh corporate IP assignment.',
          },
        ],
        suggestedPriority: 'MEDIUM',
        active: true,
      },
      {
        title: 'Corporate VPN Connection & Authentication',
        category: netCat._id,
        symptoms: ['vpn', 'wireguard', 'globalprotect', 'remote access', 'cannot connect to internal tools', 'gateway unreachable'],
        diagnosticQuestions: [
          { question: 'What specific error code or gateway status is displayed on your VPN client?', expectedAnswerType: 'TEXT' },
          { question: 'Can you reach public internet sites like google.com normally?', expectedAnswerType: 'YES_NO' },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Switch to the secondary regional VPN gateway',
            details: 'Click the VPN server dropdown and select the secondary gateway (e.g., US-East-Backup or EU-Central-Backup).',
          },
          {
            stepNumber: 2,
            instruction: 'Re-authenticate your 2FA MFA Token',
            details: 'Log out of your VPN client, initiate a fresh connection, and approve the push notification on your Authenticator app.',
          },
          {
            stepNumber: 3,
            instruction: 'Flush local DNS cache',
            details: 'Run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` (macOS) or `ipconfig /flushdns` (Windows).',
          },
        ],
        suggestedPriority: 'HIGH',
        active: true,
      },
      {
        title: 'Outlook Email Sync & Exchange Mailbox Errors',
        category: emailCat._id,
        symptoms: ['outlook', 'email', 'exchange', 'sync', 'not receiving emails', 'mailbox full', 'disconnected'],
        diagnosticQuestions: [
          { question: 'Are you experiencing the issue on Outlook desktop app, Outlook web, or mobile?', expectedAnswerType: 'TEXT' },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Verify webmail access',
            details: 'Log into https://outlook.office.com in a private browser window to confirm your cloud mailbox is operational.',
          },
          {
            stepNumber: 2,
            instruction: 'Clear Outlook local credential cache',
            details: 'Close Outlook, open Windows Credential Manager or macOS Keychain, remove cached entries for "MicrosoftOffice16", and restart Outlook.',
          },
          {
            stepNumber: 3,
            instruction: 'Rebuild Exchange OST / Cache Profile',
            details: 'Go to File -> Account Settings -> Data Files -> Open File Location, rename the OST file to .old, and relaunch Outlook to resync.',
          },
        ],
        suggestedPriority: 'MEDIUM',
        active: true,
      },
      {
        title: 'External Monitor Not Detected or Flickering',
        category: hwCat._id,
        symptoms: ['monitor', 'display', 'screen', 'usb-c', 'hdmi', 'dock', 'black screen', 'flickering'],
        diagnosticQuestions: [
          { question: 'Is the display connected directly via USB-C/HDMI or through a docking station?', expectedAnswerType: 'TEXT' },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Power cycle the monitor and dock',
            details: 'Unplug the power cable from both the dock and monitor for 15 seconds, reconnect, and firmly re-seat the video cable.',
          },
          {
            stepNumber: 2,
            instruction: 'Detect displays in system preferences',
            details: 'Navigate to System Settings -> Displays, hold Option key and click "Detect Displays" to force the GPU to poll connected ports.',
          },
        ],
        suggestedPriority: 'LOW',
        active: true,
      },
    ]);

    // 8. Seed Realistic Tickets with Timeline, Comments, & Work Logs
    console.log('[Seed] Creating demo ticket queues...');

    // Ticket 1: Critical Outage (Assigned to Rahul - In Progress with Stopwatch & Dual Notes)
    const t1 = await Ticket.create({
      ticketNumber: 'SD-1001',
      title: 'Production Build Server SSH Gateway Unreachable',
      description: `### Problem Summary\nEngineering team cannot access the internal build staging cluster gateway via VPN.\n\n### Symptoms Observed\n- SSH connection times out on port 2222\n- Multiple engineers reporting blocker for scheduled release\n\n### Recommended Technician Action\nInspect security group rules and restart the SSH proxy container.`,
      requester: empPrabhath._id,
      department: engDept._id,
      category: netCat._id,
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignee: techRahul._id,
      asset: macPrabhath._id,
      slaPolicy: slaMap['CRITICAL']._id,
      responseDeadline: new Date(now.getTime() - 10 * 60 * 1000), // Responded
      resolutionDeadline: new Date(now.getTime() + 45 * 60 * 1000), // 45 min left
      firstResponseAt: new Date(now.getTime() - 25 * 60 * 1000),
      source: 'AI_ASSISTANT',
      tags: ['production', 'infrastructure', 'vpn'],
      createdAt: new Date(now.getTime() - 35 * 60 * 1000),
    });

    await Comment.create([
      {
        ticket: t1._id,
        author: techRahul._id,
        message: 'Hello Prabhath, I have taken ownership of this critical ticket. Investigating the VPN routing table and AWS SSH bastion proxy now.',
        isInternal: false,
        createdAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
      {
        ticket: t1._id,
        author: techRahul._id,
        message: 'Internal Note: Bastion host CPU spiked to 100% due to hung Docker daemon. Cycling the staging-proxy container now.',
        isInternal: true,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        ticket: t1._id,
        author: empPrabhath._id,
        message: 'Thanks Rahul, our deployment window closes in 40 minutes so the quick turnaround is appreciated!',
        isInternal: false,
        createdAt: new Date(now.getTime() - 8 * 60 * 1000),
      },
    ]);

    await WorkLog.create([
      {
        ticket: t1._id,
        technician: techRahul._id,
        description: 'Diagnosed SSH proxy hanging connections and reviewed AWS CloudWatch container metrics.',
        durationMinutes: 20,
        startTime: new Date(now.getTime() - 25 * 60 * 1000),
        endTime: new Date(now.getTime() - 5 * 60 * 1000),
      },
    ]);

    // Ticket 2: High Priority Unassigned Pool (For Manager to Dispatch or Techs to Claim)
    await Ticket.create({
      ticketNumber: 'SD-1002',
      title: 'Marketing Presentation Display Dock Flickering in Boardroom 4',
      description: `### Problem Summary\nBoardroom 4 dual HDMI conference monitors are disconnecting every 30 seconds when plugged into USB-C docks.\n\n### Symptoms Observed\n- Display link cuts audio and video\n- Executive quarterly business review begins at 3:00 PM\n\n### Recommended Technician Action\nReplace the USB-C dock with spare CalDigit unit and test with Windows and macOS laptops.`,
      requester: empEmma._id,
      department: mktDept._id,
      category: hwCat._id,
      priority: 'HIGH',
      status: 'OPEN',
      assignee: null,
      asset: thinkEmma._id,
      slaPolicy: slaMap['HIGH']._id,
      responseDeadline: new Date(now.getTime() + 20 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 180 * 60 * 1000),
      source: 'WEB_PORTAL',
      tags: ['boardroom', 'hardware', 'vip'],
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    });

    // Ticket 3: SLA Breached Ticket (Assigned to Sarah)
    await Ticket.create({
      ticketNumber: 'SD-1003',
      title: 'Finance ERP System Export Formatting Corrupted',
      description: `### Problem Summary\nMonthly payroll Excel exports from NetSuite are showing garbled character encoding.\n\n### Symptoms Observed\n- UTF-8 vs ISO-8859 mismatch during report generation\n\n### Recommended Technician Action\nCheck default locale on the application server and update regional formatting.`,
      requester: empDavid._id,
      department: finDept._id,
      category: swCat._id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: techSarah._id,
      asset: macDavid._id,
      slaPolicy: slaMap['HIGH']._id,
      responseDeadline: new Date(now.getTime() - 300 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() - 30 * 60 * 1000), // BREACHED
      firstResponseAt: new Date(now.getTime() - 280 * 60 * 1000),
      slaStatus: 'BREACHED',
      source: 'AI_ASSISTANT',
      tags: ['finance', 'netsuite', 'sla-breach'],
      createdAt: new Date(now.getTime() - 320 * 60 * 1000),
    });

    // Ticket 4: Medium Priority Unassigned (For Claiming)
    await Ticket.create({
      ticketNumber: 'SD-1004',
      title: 'Request for Docker Desktop Business License Activation',
      description: `### Problem Summary\nDeveloper onboarded this week needs license key activation for Docker Desktop.\n\n### Recommended Technician Action\nAssign seat in Okta Docker Organization and send welcome invite.`,
      requester: empPrabhath._id,
      department: engDept._id,
      category: swCat._id,
      priority: 'MEDIUM',
      status: 'OPEN',
      assignee: null,
      slaPolicy: slaMap['MEDIUM']._id,
      responseDeadline: new Date(now.getTime() + 90 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 380 * 60 * 1000),
      source: 'WEB_PORTAL',
      tags: ['software', 'license', 'docker'],
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    });

    // Ticket 5: Resolved Ticket (with Satisfaction rating)
    const t5 = await Ticket.create({
      ticketNumber: 'SD-1005',
      title: 'Okta 2FA Token Reset Following Phone Upgrade',
      description: `### Problem Summary\nEmployee upgraded their personal iPhone and lost access to Okta Push authentication.\n\n### Symptoms Observed\n- Cannot sign in to corporate apps\n\n### Recommended Technician Action\nVerify identity via manager call and reset Okta MFA factors.`,
      requester: empLisa._id,
      department: hrDept._id,
      category: accessCat._id,
      priority: 'HIGH',
      status: 'RESOLVED',
      assignee: techRahul._id,
      slaPolicy: slaMap['HIGH']._id,
      responseDeadline: new Date(now.getTime() - 200 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() - 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 190 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 75 * 60 * 1000),
      resolutionSummary: 'Verified employee identity with HR director and re-enrolled new device in Okta Verify.',
      satisfactionRating: { rating: 5, feedback: 'Rahul resolved my MFA issue in under 15 minutes! Excellent support.' },
      source: 'AI_ASSISTANT',
      createdAt: new Date(now.getTime() - 210 * 60 * 1000),
    });

    await Comment.create([
      {
        ticket: t5._id,
        author: techRahul._id,
        message: 'Hello Lisa, I have sent a secure temporary bypass code to your backup mobile number. Please click the registration link to pair your new phone.',
        isInternal: false,
        createdAt: new Date(now.getTime() - 180 * 60 * 1000),
      },
      {
        ticket: t5._id,
        author: empLisa._id,
        message: 'All paired and working smoothly now! Thank you so much Rahul.',
        isInternal: false,
        createdAt: new Date(now.getTime() - 80 * 60 * 1000),
      },
    ]);

    await WorkLog.create([
      {
        ticket: t5._id,
        technician: techRahul._id,
        description: 'Identity verification and Okta Verify MFA enrollment assistance.',
        durationMinutes: 15,
        startTime: new Date(now.getTime() - 190 * 60 * 1000),
        endTime: new Date(now.getTime() - 175 * 60 * 1000),
      },
    ]);

    // 9. Notifications & Initial Audit Trail
    console.log('[Seed] Generating audit logs...');
    await AuditLog.create([
      {
        actor: adminUser._id,
        actorName: adminUser.name,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: adminUser._id,
        newState: { status: 'INITIALIZED', database: 'MongoDB Atlas' },
        details: 'Initial database bootstrap and corporate persona seeding complete.',
      },
      {
        actor: adminUser._id,
        actorName: adminUser.name,
        action: 'TICKET_CREATED',
        entity: 'Ticket',
        entityId: t1._id,
        newState: { status: 'IN_PROGRESS', priority: 'CRITICAL' },
        details: 'Initial seed critical infrastructure ticket dispatched.',
      },
    ]);

    console.log(`\n======================================================`);
    console.log(`✅ [ServiceDesk Pro] Seed Complete!`);
    console.log(`======================================================`);
    console.log(`\nDemo Credentials (Password: Password123! for all):`);
    console.log(`  👑 Admin:        admin@servicedesk.com`);
    console.log(`  👔 IT Manager:   manager@servicedesk.com`);
    console.log(`  🛠️  Senior Tech:  tech.rahul@servicedesk.com`);
    console.log(`  🛠️  Network Tech: tech.sarah@servicedesk.com`);
    console.log(`  🛠️  Support Tech: tech.marcus@servicedesk.com`);
    console.log(`  👤 Employee 1:   emp.prabhath@servicedesk.com (Engineering)`);
    console.log(`  👤 Employee 2:   emp.emma@servicedesk.com (Marketing)`);
    console.log(`  👤 Employee 3:   emp.david@servicedesk.com (Finance)`);
    console.log(`  👤 Employee 4:   emp.lisa@servicedesk.com (HR)`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seed Error] Seeding failed:`, error);
    process.exit(1);
  }
};

seedDatabase();
