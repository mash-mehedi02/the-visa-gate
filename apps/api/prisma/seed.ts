import { PrismaClient, RoleName, ApplicationStatus, StepStatus, DocumentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encryptSensitiveData, maskSensitiveIdentifier } from '../src/utils/crypto';
import { config } from '../src/config';
import { PERMISSIONS } from '@thevisagate/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting The Visa Gate Database Seeding ---');

  // 1. Seed Roles
  console.log('Seeding Roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: {
      name: RoleName.ADMIN,
      description: 'System Administrator with unrestricted access',
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: RoleName.STAFF },
    update: {},
    create: {
      name: RoleName.STAFF,
      description: 'Operations Staff with configurable delegated access',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: RoleName.CLIENT },
    update: {},
    create: {
      name: RoleName.CLIENT,
      description: 'Client with restricted read-only tracking access',
    },
  });

  // 2. Seed Permissions
  console.log('Seeding Permissions...');
  const permissionsList = Object.entries(PERMISSIONS).map(([key, code]) => {
    const module = code.split(':')[0];
    return {
      code,
      module,
      description: `Permission to ${code.replace(':', ' ')}`,
    };
  });

  for (const perm of permissionsList) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });

    // Attach all permissions to Admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: created.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: created.id,
      },
    });

    // Attach operational permissions to Staff by default
    if (
      perm.code.startsWith('clients:') ||
      perm.code.startsWith('applications:') ||
      perm.code.startsWith('steps:') ||
      perm.code.startsWith('documents:')
    ) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: staffRole.id,
            permissionId: created.id,
          },
        },
        update: {},
        create: {
          roleId: staffRole.id,
          permissionId: created.id,
        },
      });
    }
  }

  // 3. Seed Document Types
  console.log('Seeding Document Types...');
  const docTypes = [
    { name: 'Passport Copy', code: 'PASSPORT', isRequired: true, description: 'Clear color copy of primary passport bio-data page' },
    { name: 'National ID (NID) Copy', code: 'NID', isRequired: true, description: 'Copy of Government National Identity Card' },
    { name: 'Photograph (35x45mm)', code: 'PHOTO', isRequired: true, description: 'Recent white background studio photograph' },
    { name: 'Educational Certificate', code: 'EDUCATION', isRequired: false, description: 'Highest degree or SSC/HSC certificate copy' },
    { name: 'Experience Certificate', code: 'EXPERIENCE', isRequired: false, description: 'Official work experience or job appointment letter' },
    { name: 'Medical Examination Report', code: 'MEDICAL', isRequired: true, description: 'Approved clinic medical fitness screening report' },
    { name: 'Police Clearance Certificate', code: 'POLICE_CLEARANCE', isRequired: true, description: 'Digital verified police clearance from Bangladesh Police' },
    { name: 'Bank Solvency Statement', code: 'BANK_STATEMENT', isRequired: false, description: 'Last 6 months verified bank statement with solvency certificate' },
    { name: 'Embassy Visa Application Form', code: 'VISA_FORM', isRequired: true, description: 'Completed and signed embassy visa application form' },
  ];

  for (const dt of docTypes) {
    await prisma.documentType.upsert({
      where: { code: dt.code },
      update: {},
      create: dt,
    });
  }

  // 4. Seed Countries & Visa Categories
  console.log('Seeding Countries & Categories...');
  const countriesData = [
    {
      name: 'Malaysia',
      code: 'MYS',
      flagEmoji: '🇲🇾',
      description: 'Major destination for construction, manufacturing, plantation, and higher education.',
      categories: [
        { name: 'Work Permit (Calling Visa)', code: 'WP', description: 'Factory, plantation, and service sector calling visa with approval letter', defaultProcessingDays: 60 },
        { name: 'Student Visa (EMGS)', code: 'ST', description: 'Undergraduate and postgraduate programs with EMGS approval', defaultProcessingDays: 45 },
        { name: 'Tourist / Social Visit', code: 'TR', description: 'eNTRI / eVISA for single or multiple entry tourism', defaultProcessingDays: 7 },
      ],
    },
    {
      name: 'Cyprus',
      code: 'CYP',
      flagEmoji: '🇨🇾',
      description: 'Mediterranean European nation with attractive hospitality, agriculture and tech opportunities.',
      categories: [
        { name: 'Employment Visa', code: 'WP', description: 'Work contract permit registered with Ministry of Labour', defaultProcessingDays: 75 },
        { name: 'Higher Education Visa', code: 'ST', description: 'College and University enrollment visas with entry permit', defaultProcessingDays: 40 },
      ],
    },
    {
      name: 'Belarus',
      code: 'BLR',
      flagEmoji: '🇧🇾',
      description: 'Eastern European destination with medical universities and specialized technical work sectors.',
      categories: [
        { name: 'Official Work Permit', code: 'WP', description: 'Ministry of Internal Affairs official work invitation and permit', defaultProcessingDays: 60 },
        { name: 'Medical / University Study Visa', code: 'ST', description: 'Official study invitation from Ministry of Education', defaultProcessingDays: 35 },
      ],
    },
    {
      name: 'Europe (Schengen Area)',
      code: 'SCH',
      flagEmoji: '🇪🇺',
      description: 'Comprehensive consultancy for Romania, Poland, Hungary, and other European destinations.',
      categories: [
        { name: 'Seasonal Work Permit', code: 'WP', description: 'Government registered work permit with legal immigration file', defaultProcessingDays: 90 },
        { name: 'Short Stay Business/Tourism', code: 'TR', description: 'Type C Schengen visa assistance and appointment booking', defaultProcessingDays: 30 },
      ],
    },
    {
      name: 'Serbia',
      code: 'SRB',
      flagEmoji: '🇷🇸',
      description: 'Southeast European destination offering official employment and work permit pathways for construction, manufacturing, and skilled services sectors.',
      categories: [
        { name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official Serbia employment and work permit', defaultProcessingDays: 120 },
      ],
    },
    {
      name: 'North Macedonia',
      code: 'MKD',
      flagEmoji: '🇲🇰',
      description: 'Southeast European destination with official employment authorization and work permit routes for manufacturing, construction, and hospitality sectors.',
      categories: [
        { name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official North Macedonia employment and work permit', defaultProcessingDays: 120 },
      ],
    },
    {
      name: 'Bosnia and Herzegovina',
      code: 'BIH',
      flagEmoji: '🇧🇦',
      description: 'Bosnia and Herzegovina offers employment opportunities in construction, manufacturing and services sectors.',
      categories: [
        { name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official Bosnia employment and work permit', defaultProcessingDays: 120 },
      ],
    },
  ];

  for (const c of countriesData) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        flagEmoji: c.flagEmoji,
        description: c.description,
      },
    });

    for (const cat of c.categories) {
      await prisma.visaCategory.upsert({
        where: {
          countryId_code: {
            countryId: country.id,
            code: cat.code,
          },
        },
        update: {},
        create: {
          countryId: country.id,
          name: cat.name,
          code: cat.code,
          description: cat.description,
          defaultProcessingDays: cat.defaultProcessingDays,
        },
      });
    }
  }

  // 5. Seed Workflow Templates
  console.log('Seeding Workflow Templates...');
  // The shared professional 9-step Work Permit workflow (120 days total).
  const WORK_PERMIT_STEPS = [
    { stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' },
    { stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' },
    { stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' },
    { stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' },
    { stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' },
    { stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' },
    { stepName: 'BMET Registration and Training', description: 'Workforce registration, permit endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your workforce registration and mandatory training are being arranged for you.' },
    { stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Employment clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your employment clearance is approved. Travel arrangements are being finalised.' },
    { stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' },
  ];

  // One independently managed template per destination country.
  const WORK_PERMIT_TEMPLATES = [
    { id: '00000000-0000-0000-0000-000000000001', code: 'MYS', name: 'Malaysia Work Permit Standard Procedure', description: 'Professional 9-step Work Permit Visa workflow for the Malaysia calling visa and work permit - 120 days (approx. 4 months) from document preparation to pre-departure clearance.' },
    { id: '00000000-0000-0000-0000-000000000002', code: 'SRB', name: 'Serbia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Serbia - 120 days (approx. 4 months) from document preparation to pre-departure clearance.' },
    { id: '00000000-0000-0000-0000-000000000003', code: 'MKD', name: 'North Macedonia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for North Macedonia - 120 days (approx. 4 months) from document preparation to pre-departure clearance.' },
    { id: '00000000-0000-0000-0000-000000000004', code: 'BIH', name: 'Bosnia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Bosnia and Herzegovina - 120 days (approx. 4 months) from document preparation to pre-departure clearance.' },
    { id: '00000000-0000-0000-0000-000000000005', code: 'CYP', name: 'Cyprus Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Cyprus - 120 days (approx. 4 months) from document preparation to pre-departure clearance.' },
  ];

  for (const wpTemplate of WORK_PERMIT_TEMPLATES) {
    const country = await prisma.country.findUnique({ where: { code: wpTemplate.code } });
    const wpCategory = country
      ? await prisma.visaCategory.findFirst({ where: { countryId: country.id, code: 'WP' } })
      : null;

    if (!country || !wpCategory) {
      console.warn(`Skipping workflow template ${wpTemplate.name}: country/category ${wpTemplate.code}/WP missing.`);
      continue;
    }

    await prisma.workflowTemplate.upsert({
      where: { id: wpTemplate.id },
      update: {
        name: wpTemplate.name,
        description: wpTemplate.description,
        countryId: country.id,
        visaCategoryId: wpCategory.id,
        steps: {
          deleteMany: {},
          create: WORK_PERMIT_STEPS,
        },
      },
      create: {
        id: wpTemplate.id,
        name: wpTemplate.name,
        description: wpTemplate.description,
        countryId: country.id,
        visaCategoryId: wpCategory.id,
        steps: {
          create: WORK_PERMIT_STEPS,
        },
      },
    });
  }

  // 6. Seed Initial Admin Account
  console.log('Seeding Initial Admin User...');
  const adminPasswordHash = await bcrypt.hash(config.bootstrap.adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { identifier: config.bootstrap.adminEmail.toLowerCase() },
    update: {
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      identifier: config.bootstrap.adminEmail.toLowerCase(),
      email: config.bootstrap.adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 7. Seed Sample Staff Account
  console.log('Seeding Sample Staff User...');
  const staffEmail = 'staff@thevisagate.com';
  const staffPasswordHash = await bcrypt.hash('StaffGate2026!', 12);
  const staffUser = await prisma.user.upsert({
    where: { identifier: staffEmail },
    update: {
      passwordHash: staffPasswordHash,
      isActive: true,
    },
    create: {
      identifier: staffEmail,
      email: staffEmail,
      passwordHash: staffPasswordHash,
      roleId: staffRole.id,
      isActive: true,
      mustChangePassword: false,
      staffProfile: {
        create: {
          employeeId: 'EMP-001',
          fullName: 'Tanvir Hossain',
          designation: 'Senior Visa Processing Officer',
          phone: '+8801700112233',
          email: staffEmail,
        },
      },
    },
  });

  // 8. Seed Sample Client Account
  console.log('Seeding Sample Client User...');
  const samplePassport = 'A12345678';
  const sampleNid = '19951234567890123';
  const clientPasswordHash = await bcrypt.hash('ClientPass2026!', 12);
  const clientUser = await prisma.user.upsert({
    where: { identifier: samplePassport },
    update: {
      passwordHash: clientPasswordHash,
      isActive: true,
    },
    create: {
      identifier: samplePassport,
      email: 'client.demo@example.com',
      passwordHash: clientPasswordHash,
      roleId: clientRole.id,
      isActive: true,
      mustChangePassword: false,
      clientProfile: {
        create: {
          clientCode: 'CL-2026-0001',
          fullName: 'Mohammad Rafiqul Islam',
          dateOfBirth: new Date('1995-05-15'),
          nidEncrypted: encryptSensitiveData(sampleNid),
          nidMasked: maskSensitiveIdentifier(sampleNid),
          passportEncrypted: encryptSensitiveData(samplePassport),
          passportMasked: maskSensitiveIdentifier(samplePassport),
          phone: '+8801812345678',
          email: 'client.demo@example.com',
          address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
        },
      },
    },
    include: { clientProfile: true },
  });

  console.log('--- Database Seeding Completed Successfully ---');
  console.log(`Admin Login: ${config.bootstrap.adminEmail} / ${config.bootstrap.adminPassword}`);
  console.log(`Staff Login: ${staffEmail} / StaffGate2026!`);
  console.log(`Client Login: Passport: ${samplePassport} / ClientPass2026!`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
