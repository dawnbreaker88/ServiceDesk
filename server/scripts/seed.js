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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to database: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Database connected successfully.');

    // 1. Clear existing collections
    console.log('[Seed] Clearing existing collections...');
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
    console.log('[Seed] Old data wiped.');

    // 2. Seed Departments
    console.log('[Seed] Seeding departments...');
    const departments = await Department.create([
      { name: 'Engineering', code: 'ENG', description: 'Software and systems engineering' },
      { name: 'Finance & Accounting', code: 'FIN', description: 'Financial planning and operations' },
      { name: 'Human Resources', code: 'HR', description: 'People, culture, and talent' },
      { name: 'Operations & Logistics', code: 'OPS', description: 'Business and office operations' },
      { name: 'Marketing & Sales', code: 'MKT', description: 'Growth, marketing and sales' },
    ]);
    const [engDept, finDept, hrDept, opsDept] = departments;

    // 3. Seed Categories
    console.log('[Seed] Seeding categories...');
    const categories = await Category.create([
      { name: 'Hardware', code: 'HW', description: 'Laptops, desktops, monitors, peripherals', icon: 'laptop' },
      { name: 'Software', code: 'SW', description: 'OS, productivity apps, dev tools, licenses', icon: 'code' },
      { name: 'Network & VPN', code: 'NET', description: 'Wi-Fi, Ethernet, VPN, office network', icon: 'wifi' },
      { name: 'Email & Communication', code: 'EMAIL', description: 'Outlook, Slack, Teams, Google Workspace', icon: 'mail' },
      { name: 'Account & Access', code: 'ACCESS', description: 'SSO, password reset, permissions, role grants', icon: 'key' },
      { name: 'Security & Compliance', code: 'SEC', description: 'Antivirus, suspicious emails, certificate alerts', icon: 'shield' },
    ]);
    const [hwCat, swCat, netCat, emailCat, accessCat, secCat] = categories;

    // 4. Seed SLA Policies
    console.log('[Seed] Seeding SLA policies...');
    const slaPolicies = await SlaPolicy.create([
      {
        name: 'Critical Priority SLA',
        priority: 'CRITICAL',
        responseTimeMinutes: 15,
        resolutionTimeMinutes: 120, // 2 hours
        warningThresholdPercent: 75,
        description: 'Outages, executive blockers, security incidents',
      },
      {
        name: 'High Priority SLA',
        priority: 'HIGH',
        responseTimeMinutes: 30,
        resolutionTimeMinutes: 240, // 4 hours
        warningThresholdPercent: 75,
        description: 'Single user work stopped, urgent meeting room equipment',
      },
      {
        name: 'Medium Priority SLA',
        priority: 'MEDIUM',
        responseTimeMinutes: 120, // 2 hours
        resolutionTimeMinutes: 480, // 8 hours
        warningThresholdPercent: 80,
        description: 'Non-critical software issues, accessory requests',
      },
      {
        name: 'Low Priority SLA',
        priority: 'LOW',
        responseTimeMinutes: 480, // 8 hours
        resolutionTimeMinutes: 1440, // 24 hours
        warningThresholdPercent: 80,
        description: 'General questions, low impact hardware inquiries',
      },
    ]);
    const slaMap = slaPolicies.reduce((acc, p) => ({ ...acc, [p.priority]: p }), {});

    // 5. Seed Users (with hashed passwords handled by pre-save hook)
    console.log('[Seed] Seeding users with role separation...');
    const users = await User.create([
      // Admin
      {
        name: 'Alex Admin',
        email: 'admin@servicedesk.com',
        password: 'Password123!',
        role: 'ADMIN',
        department: engDept._id,
        phone: '+1 (555) 010-0001',
      },
      // IT Manager
      {
        name: 'Elena Rostova (IT Manager)',
        email: 'manager@servicedesk.com',
        password: 'Password123!',
        role: 'MANAGER',
        department: engDept._id,
        phone: '+1 (555) 010-0002',
      },
      // Technicians
      {
        name: 'Rahul Sharma (Senior Tech)',
        email: 'tech.rahul@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: engDept._id,
        phone: '+1 (555) 010-0010',
      },
      {
        name: 'Sarah Chen (Network Tech)',
        email: 'tech.sarah@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: engDept._id,
        phone: '+1 (555) 010-0011',
      },
      {
        name: 'Alex Rivera (Support Tech)',
        email: 'tech.alex@servicedesk.com',
        password: 'Password123!',
        role: 'TECHNICIAN',
        department: engDept._id,
        phone: '+1 (555) 010-0012',
      },
      // Asset Manager
      {
        name: 'Marcus Vance (Asset Manager)',
        email: 'asset.marcus@servicedesk.com',
        password: 'Password123!',
        role: 'ASSET_MANAGER',
        department: opsDept._id,
        phone: '+1 (555) 010-0020',
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
        department: finDept._id,
        phone: '+1 (555) 010-0102',
      },
      {
        name: 'David Kim',
        email: 'emp.david@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: hrDept._id,
        phone: '+1 (555) 010-0103',
      },
      {
        name: 'Lisa Morales',
        email: 'emp.lisa@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: opsDept._id,
        phone: '+1 (555) 010-0104',
      },
      {
        name: 'James Wilson',
        email: 'emp.james@servicedesk.com',
        password: 'Password123!',
        role: 'EMPLOYEE',
        department: engDept._id,
        phone: '+1 (555) 010-0105',
      },
    ]);

    const adminUser = users[0];
    const managerUser = users[1];
    const [techRahul, techSarah, techAlex] = [users[2], users[3], users[4]];
    const assetManagerUser = users[5];
    const [empPrabhath, empEmma, empDavid, empLisa, empJames] = [users[6], users[7], users[8], users[9], users[10]];

    // 6. Seed Assets
    console.log('[Seed] Seeding hardware & software assets...');
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);

    const assets = await Asset.create([
      {
        assetTag: 'AST-LP-001',
        name: 'MacBook Pro 16" M3 Max',
        category: 'LAPTOP',
        serialNumber: 'C02G89XYMD6N',
        status: 'ASSIGNED',
        assignedUser: empPrabhath._id,
        department: engDept._id,
        vendor: 'Apple Inc.',
        model: 'MacBook Pro 16" 2024',
        cost: 3499,
        purchaseDate: twoYearsAgo,
        warrantyExpiry: oneYearLater,
        specs: { cpu: 'Apple M3 Max', ram: '36GB', storage: '1TB SSD', os: 'macOS Sonoma' },
      },
      {
        assetTag: 'AST-LP-002',
        name: 'Dell XPS 15 9530',
        category: 'LAPTOP',
        serialNumber: 'DLXPS-99238',
        status: 'ASSIGNED',
        assignedUser: empEmma._id,
        department: finDept._id,
        vendor: 'Dell',
        model: 'XPS 15 9530',
        cost: 2199,
        purchaseDate: twoYearsAgo,
        warrantyExpiry: oneYearLater,
        specs: { cpu: 'Intel Core i9-13900H', ram: '32GB', storage: '1TB SSD', os: 'Windows 11 Pro' },
      },
      {
        assetTag: 'AST-LP-003',
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        category: 'LAPTOP',
        serialNumber: 'LNV-X1C-44810',
        status: 'ASSIGNED',
        assignedUser: empDavid._id,
        department: hrDept._id,
        vendor: 'Lenovo',
        model: 'ThinkPad X1 Carbon',
        cost: 1899,
        purchaseDate: twoYearsAgo,
        warrantyExpiry: oneYearLater,
        specs: { cpu: 'Intel Core i7-1365U', ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' },
      },
      {
        assetTag: 'AST-LP-004',
        name: 'MacBook Air 15" M2',
        category: 'LAPTOP',
        serialNumber: 'C02H55LKMD6R',
        status: 'ASSIGNED',
        assignedUser: empLisa._id,
        department: opsDept._id,
        vendor: 'Apple Inc.',
        model: 'MacBook Air 15"',
        cost: 1499,
        purchaseDate: twoYearsAgo,
        warrantyExpiry: oneYearLater,
        specs: { cpu: 'Apple M2', ram: '16GB', storage: '512GB SSD', os: 'macOS Sequoia' },
      },
      {
        assetTag: 'AST-LP-005',
        name: 'Dell Latitude 5540',
        category: 'LAPTOP',
        serialNumber: 'DL-LAT-88412',
        status: 'IN_STOCK',
        assignedUser: null,
        department: engDept._id,
        vendor: 'Dell',
        model: 'Latitude 5540',
        cost: 1350,
        purchaseDate: now,
        warrantyExpiry: oneYearLater,
        specs: { cpu: 'Intel Core i7-1355U', ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' },
      },
      {
        assetTag: 'AST-LP-006',
        name: 'ThinkPad T14s Gen 4',
        category: 'LAPTOP',
        serialNumber: 'LNV-T14-33120',
        status: 'IN_REPAIR',
        assignedUser: null,
        department: engDept._id,
        vendor: 'Lenovo',
        model: 'ThinkPad T14s',
        cost: 1420,
        purchaseDate: twoYearsAgo,
        warrantyExpiry: oneYearLater,
        notes: 'Motherboard power rail diagnostics in progress at vendor depot.',
      },
      {
        assetTag: 'AST-MON-001',
        name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor (U2723QE)',
        category: 'MONITOR',
        serialNumber: 'DL-U27-99124',
        status: 'ASSIGNED',
        assignedUser: empPrabhath._id,
        department: engDept._id,
        vendor: 'Dell',
        model: 'U2723QE',
        cost: 580,
      },
      {
        assetTag: 'AST-MON-002',
        name: 'LG UltraWide 34" Curved WQHD (34WN80C-B)',
        category: 'MONITOR',
        serialNumber: 'LG-34W-77412',
        status: 'ASSIGNED',
        assignedUser: empEmma._id,
        department: finDept._id,
        vendor: 'LG Electronics',
        model: '34WN80C-B',
        cost: 549,
      },
      {
        assetTag: 'AST-PRN-001',
        name: 'HP LaserJet Enterprise Flow MFP M528c',
        category: 'PRINTER',
        serialNumber: 'HP-M528-66190',
        status: 'ASSIGNED',
        assignedUser: null,
        department: opsDept._id,
        vendor: 'HP',
        model: 'LaserJet M528c',
        cost: 2150,
      },
      {
        assetTag: 'AST-NET-001',
        name: 'Cisco Catalyst 9200L 48-Port PoE+ Switch',
        category: 'ROUTER',
        serialNumber: 'CSCO-CAT-11099',
        status: 'ASSIGNED',
        assignedUser: null,
        department: engDept._id,
        vendor: 'Cisco',
        model: 'Catalyst 9200L',
        cost: 4200,
      },
    ]);

    // 7. Seed Asset Assignment Records
    console.log('[Seed] Seeding asset assignment histories...');
    await AssetAssignment.create([
      {
        asset: assets[0]._id,
        user: empPrabhath._id,
        assignedBy: assetManagerUser._id,
        assignedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        reason: 'Onboarding workstation allocation',
      },
      {
        asset: assets[1]._id,
        user: empEmma._id,
        assignedBy: assetManagerUser._id,
        assignedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        reason: 'Standard laptop allocation for Finance lead',
      },
      {
        asset: assets[2]._id,
        user: empDavid._id,
        assignedBy: assetManagerUser._id,
        assignedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        reason: 'HR operations device provisioning',
      },
    ]);

    // 8. Seed Troubleshooting Guides (for AI assistant)
    console.log('[Seed] Seeding AI troubleshooting guides...');
    await TroubleshootingGuide.create([
      {
        title: 'Wi-Fi Connection & Network Dropout',
        category: netCat._id,
        suggestedPriority: 'MEDIUM',
        symptoms: ['wifi not working', 'cannot connect to wifi', 'no internet', 'wifi disconnected', 'network dropped', 'limited connectivity'],
        diagnosticQuestions: [
          {
            question: 'Is your Wi-Fi turned on and is the company SSID (Corp-Secure) visible in your network list?',
            options: ['Yes, visible but fails to connect', 'No, network list is completely empty', 'Connected but says No Internet'],
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Toggle Wi-Fi Off, wait 5 seconds, and toggle it back On.',
            details: 'Open Network Settings or control center and reset the radio interface.',
          },
          {
            stepNumber: 2,
            instruction: 'Forget the "Corp-Secure" network and reconnect using your domain credentials.',
            details: 'In Wi-Fi settings, select Forget Network, click Corp-Secure, and re-enter your company email and password.',
          },
          {
            stepNumber: 3,
            instruction: 'Flush DNS and reset TCP/IP stack.',
            details: 'On Windows run "ipconfig /flushdns" in terminal; on Mac run "sudo dscacheutil -flushcache".',
          },
          {
            stepNumber: 4,
            instruction: 'Reboot your workstation to clear cached network leases.',
            details: 'A fresh reboot clears stale DHCP leases and restarts driver services.',
          },
        ],
        active: true,
      },
      {
        title: 'Corporate VPN Connection Failed (GlobalProtect / AnyConnect)',
        category: netCat._id,
        suggestedPriority: 'HIGH',
        symptoms: ['vpn failed', 'cannot connect to vpn', 'vpn auth error', 'globalprotect error', 'anyconnect timeout'],
        diagnosticQuestions: [
          {
            question: 'What error message are you receiving when attempting to connect to VPN?',
            options: ['Gateway not reachable', 'Authentication / 2FA failed', 'Connection timed out', 'Certificate untrusted'],
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Verify you have a stable standard internet connection first.',
            details: 'Try opening a public webpage (e.g. google.com) without VPN.',
          },
          {
            stepNumber: 2,
            instruction: 'Ensure Portal Address is set to "vpn.company.com".',
            details: 'Check VPN client settings to verify the portal hostname.',
          },
          {
            stepNumber: 3,
            instruction: 'Re-authenticate with MFA (Authenticator App).',
            details: 'Approve the push notification on your registered mobile authenticator.',
          },
        ],
        active: true,
      },
      {
        title: 'Password Expired / Account Locked (Active Directory & SSO)',
        category: accessCat._id,
        suggestedPriority: 'HIGH',
        symptoms: ['account locked', 'password expired', 'cannot login to sso', 'wrong password', 'okta locked'],
        diagnosticQuestions: [
          {
            question: 'Are you locked out of your laptop lock screen, or only cloud applications (SSO)?',
            options: ['Laptop lock screen', 'Cloud apps / SSO portal', 'Both'],
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Visit the self-service password reset portal (identity.company.com).',
            details: 'Use your secondary email or SMS OTP to unlock or reset your password.',
          },
          {
            stepNumber: 2,
            instruction: 'Ensure Caps Lock is not turned on and keyboard layout is US English.',
            details: 'Special characters and layouts can cause silent login failures.',
          },
        ],
        active: true,
      },
      {
        title: 'Printer Not Printing / Spooler Stuck',
        category: hwCat._id,
        suggestedPriority: 'LOW',
        symptoms: ['printer offline', 'printer not printing', 'print spooler error', 'paper jam', 'printer queue stuck'],
        diagnosticQuestions: [
          {
            question: 'Is the physical printer showing an error light (paper jam, low toner, or offline)?',
            options: ['Ready light is green', 'Error light / out of paper', 'Printer is completely powered off'],
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Clear your local print queue and restart Print Spooler service.',
            details: 'Open Printers & Scanners, click your printer, and cancel all queued print jobs.',
          },
          {
            stepNumber: 2,
            instruction: 'Verify you are connected to the office network (Printers are not accessible on guest Wi-Fi).',
            details: 'Connect to Corp-Secure Wi-Fi to reach internal printer subnets.',
          },
        ],
        active: true,
      },
    ]);

    // 9. Seed Sample Tickets across multiple states
    console.log('[Seed] Seeding sample tickets across lifecycles...');

    // Ticket 1: OPEN - AI Created - Network
    const ticket1 = await Ticket.create({
      ticketNumber: 'SD-1001',
      title: 'Intermittent Wi-Fi disconnections on MacBook Pro',
      description: 'Wi-Fi drops every 10-15 minutes on Corp-Secure network in the 4th floor engineering wing. Troubleshooting steps attempted with AI assistant (reset network adapter, flush DNS) did not resolve the dropouts.',
      requester: empPrabhath._id,
      department: engDept._id,
      category: netCat._id,
      priority: 'HIGH',
      status: 'OPEN',
      assignee: null,
      asset: assets[0]._id,
      slaPolicy: slaMap['HIGH']._id,
      slaStatus: 'NORMAL',
      responseDeadline: new Date(now.getTime() + 25 * 60 * 1000), // 25 mins remaining
      resolutionDeadline: new Date(now.getTime() + 210 * 60 * 1000),
      source: 'AI_ASSISTANT',
      tags: ['wifi', 'macbook', '4th-floor'],
    });

    // Ticket 2: ASSIGNED - Critical Laptop Issue
    const ticket2 = await Ticket.create({
      ticketNumber: 'SD-1002',
      title: 'Critical: Dell XPS BSOD boot loop after Windows Update',
      description: 'Laptop crashed with CRITICAL_PROCESS_DIED error after installing the latest patch. Unable to boot into Windows even in safe mode. Need urgent assistance before executive presentation.',
      requester: empEmma._id,
      department: finDept._id,
      category: hwCat._id,
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      assignee: techRahul._id,
      asset: assets[1]._id,
      slaPolicy: slaMap['CRITICAL']._id,
      slaStatus: 'APPROACHING_DEADLINE',
      responseDeadline: new Date(now.getTime() + 5 * 60 * 1000), // 5 mins left
      resolutionDeadline: new Date(now.getTime() + 90 * 60 * 1000),
      source: 'MANUAL',
      tags: ['bsod', 'bootloop', 'urgent-finance'],
    });

    // Ticket 3: IN_PROGRESS - Active Technician Work
    const ticket3 = await Ticket.create({
      ticketNumber: 'SD-1003',
      title: 'Figma and Adobe Creative Cloud License Activation Error',
      description: 'Employee license seat expired or revoked during recent seat sync. Unable to access design files.',
      requester: empLisa._id,
      department: opsDept._id,
      category: swCat._id,
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignee: techAlex._id,
      asset: assets[3]._id,
      slaPolicy: slaMap['MEDIUM']._id,
      slaStatus: 'NORMAL',
      responseDeadline: new Date(now.getTime() - 30 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 300 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 25 * 60 * 1000),
      source: 'MANUAL',
      tags: ['license', 'adobe', 'figma'],
    });

    // Work log & comment for Ticket 3
    await WorkLog.create({
      ticket: ticket3._id,
      technician: techAlex._id,
      description: 'Contacted vendor licensing portal, unassigned inactive legacy seat, generated new enterprise invitation token.',
      startTime: new Date(now.getTime() - 25 * 60 * 1000),
      endTime: new Date(now.getTime() - 5 * 60 * 1000),
      durationMinutes: 20,
    });

    await Comment.create({
      ticket: ticket3._id,
      author: techAlex._id,
      message: 'I have re-provisioned your enterprise Adobe license. Please check your inbox for an invitation email from Adobe Admin Console.',
      isInternal: false,
    });

    // Ticket 4: RESOLVED - Awaiting confirmation
    const ticket4 = await Ticket.create({
      ticketNumber: 'SD-1004',
      title: 'Outlook calendar sync failing across mobile and desktop',
      description: 'Calendar invites sent from mobile client do not reflect on Outlook desktop client.',
      requester: empDavid._id,
      department: hrDept._id,
      category: emailCat._id,
      priority: 'LOW',
      status: 'RESOLVED',
      assignee: techSarah._id,
      asset: assets[2]._id,
      slaPolicy: slaMap['LOW']._id,
      slaStatus: 'NORMAL',
      responseDeadline: new Date(now.getTime() - 360 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() - 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 300 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 30 * 60 * 1000),
      resolutionSummary: 'Removed corrupted Exchange ActiveSync profile cache and performed resync of mailbox folder hierarchy.',
      source: 'MANUAL',
      tags: ['outlook', 'calendar', 'exchange'],
    });

    await Comment.create({
      ticket: ticket4._id,
      author: techSarah._id,
      message: 'Exchange cache has been cleared and resynchronized. All test invites confirmed appearing on both devices. Please test and confirm resolution.',
      isInternal: false,
    });

    // Ticket 5: CLOSED - Confirmed Completed
    const ticket5 = await Ticket.create({
      ticketNumber: 'SD-1005',
      title: 'Request dual-monitor USB-C docking cable & adapter',
      description: 'Need a Thunderbolt 4 / USB-C docking connector for multi-display setup in desk pod 12.',
      requester: empJames._id,
      department: engDept._id,
      category: hwCat._id,
      priority: 'LOW',
      status: 'CLOSED',
      assignee: techRahul._id,
      slaPolicy: slaMap['LOW']._id,
      slaStatus: 'NORMAL',
      firstResponseAt: new Date(now.getTime() - 800 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 200 * 60 * 1000),
      closedAt: new Date(now.getTime() - 100 * 60 * 1000),
      resolutionSummary: 'Delivered and configured Thunderbolt 4 dock at workstation desk 12.',
      source: 'MANUAL',
      tags: ['dock', 'accessories', 'completed'],
    });

    // Ticket 6: ESCALATED - SLA Breach
    const ticket6 = await Ticket.create({
      ticketNumber: 'SD-1006',
      title: 'Production database read-replica access timeout',
      description: 'Engineering staging and read query cluster unreachable via VPN subnet. Multiple engineers blocked.',
      requester: empPrabhath._id,
      department: engDept._id,
      category: secCat._id,
      priority: 'CRITICAL',
      status: 'ESCALATED',
      assignee: techSarah._id,
      slaPolicy: slaMap['CRITICAL']._id,
      slaStatus: 'BREACHED',
      responseDeadline: new Date(now.getTime() - 60 * 60 * 1000), // Breached 1h ago
      resolutionDeadline: new Date(now.getTime() - 10 * 60 * 1000),
      source: 'MANUAL',
      tags: ['security', 'database', 'sla-breach'],
    });

    // 10. Seed Notifications
    console.log('[Seed] Seeding sample notifications...');
    await Notification.create([
      {
        recipient: techRahul._id,
        type: 'TICKET_ASSIGNED',
        title: 'New Critical Ticket Assigned',
        message: 'You have been assigned ticket SD-1002: "Critical: Dell XPS BSOD boot loop after Windows Update".',
        relatedEntity: 'Ticket',
        relatedId: ticket2._id,
        isRead: false,
      },
      {
        recipient: managerUser._id,
        type: 'SLA_BREACH',
        title: 'SLA Breach Alert: SD-1006',
        message: 'Ticket SD-1006 (Critical: Production database read-replica access timeout) has breached its resolution SLA deadline.',
        relatedEntity: 'Ticket',
        relatedId: ticket6._id,
        isRead: false,
      },
      {
        recipient: empDavid._id,
        type: 'TICKET_RESOLVED',
        title: 'Ticket SD-1004 has been marked Resolved',
        message: 'Technician Sarah Chen resolved your ticket. Please review and confirm.',
        relatedEntity: 'Ticket',
        relatedId: ticket4._id,
        isRead: false,
      },
    ]);

    // 11. Seed Initial Audit Logs
    console.log('[Seed] Seeding audit log records...');
    await AuditLog.create([
      {
        actor: adminUser._id,
        actorName: adminUser.name,
        action: 'SYSTEM_INITIALIZATION',
        entity: 'Department',
        entityId: engDept._id,
        details: 'Initial department and user directory seeded.',
      },
      {
        actor: managerUser._id,
        actorName: managerUser.name,
        action: 'TICKET_ASSIGNED',
        entity: 'Ticket',
        entityId: ticket2._id,
        previousState: { status: 'OPEN', assignee: null },
        newState: { status: 'ASSIGNED', assignee: techRahul.name },
        details: `Assigned ticket SD-1002 to ${techRahul.name}`,
      },
      {
        actor: null,
        actorName: 'SLA Monitor Daemon',
        action: 'SLA_BREACHED',
        entity: 'Ticket',
        entityId: ticket6._id,
        previousState: { slaStatus: 'APPROACHING_DEADLINE' },
        newState: { slaStatus: 'BREACHED', status: 'ESCALATED' },
        details: 'Resolution deadline expired without resolution.',
      },
    ]);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Demo Accounts Created:');
    console.log('  👑 Admin:         admin@servicedesk.com        (PW: Password123!)');
    console.log('  👔 IT Manager:    manager@servicedesk.com      (PW: Password123!)');
    console.log('  🔧 Technician 1:  tech.rahul@servicedesk.com   (PW: Password123!)');
    console.log('  🔧 Technician 2:  tech.sarah@servicedesk.com   (PW: Password123!)');
    console.log('  🔧 Technician 3:  tech.alex@servicedesk.com    (PW: Password123!)');
    console.log('  📦 Asset Manager: asset.marcus@servicedesk.com (PW: Password123!)');
    console.log('  👤 Employee 1:    emp.prabhath@servicedesk.com (PW: Password123!)');
    console.log('  👤 Employee 2:    emp.emma@servicedesk.com     (PW: Password123!)');
    console.log('  👤 Employee 3:    emp.david@servicedesk.com    (PW: Password123!)');
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
