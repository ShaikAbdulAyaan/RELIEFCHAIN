import "dotenv/config";
import { PrismaClient, DisasterType, OrganizationType, Severity } from "@prisma/client";

const prisma = new PrismaClient();

const IDS = {
  organization: "11111111-1111-4111-8111-111111111111",
  disaster: "22222222-2222-4222-8222-222222222222",
  camp: "33333333-3333-4333-8333-333333333333",
  warehouse: "44444444-4444-4444-8444-444444444444",
  beneficiary: "55555555-5555-4555-8555-555555555555",
};

async function main() {
  await prisma.role.upsert({
    where: { name: "DONOR" },
    update: {},
    create: { name: "DONOR", description: "Default donor role" },
  });

  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "System administrator" },
  });

  const organization = await prisma.organization.upsert({
    where: { id: IDS.organization },
    update: {
      name: "RELIEFCHAIN Integration NGO",
      type: OrganizationType.NGO,
      verificationStatus: "VERIFIED",
    },
    create: {
      id: IDS.organization,
      name: "RELIEFCHAIN Integration NGO",
      type: OrganizationType.NGO,
      registrationNumber: "RELIEFCHAIN-TEST-NGO",
      verificationStatus: "VERIFIED",
    },
  });

  const disaster = await prisma.disaster.upsert({
    where: { id: IDS.disaster },
    update: {
      name: "Assam Flood Integration Test",
      type: DisasterType.FLOOD,
      severity: Severity.HIGH,
      location: "Guwahati, Assam",
      affectedPeople: 500,
      requiredResources: ["Food", "Water", "Medicine", "Rescue Boats"],
    },
    create: {
      id: IDS.disaster,
      name: "Assam Flood Integration Test",
      type: DisasterType.FLOOD,
      description: "RELIEFCHAIN end-to-end integration disaster",
      severity: Severity.HIGH,
      location: "Guwahati, Assam",
      affectedPeople: 500,
      requiredResources: ["Food", "Water", "Medicine", "Rescue Boats"],
    },
  });

  const camp = await prisma.camp.upsert({
    where: { id: IDS.camp },
    update: {
      name: "Integration Relief Camp",
      location: "Guwahati, Assam",
      latitude: 26.1445,
      longitude: 91.7362,
    },
    create: {
      id: IDS.camp,
      disasterId: disaster.id,
      name: "Integration Relief Camp",
      location: "Guwahati, Assam",
      latitude: 26.1445,
      longitude: 91.7362,
      capacity: 1000,
      population: 250,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { id: IDS.warehouse },
    update: {
      name: "Integration Relief Warehouse",
      location: "Guwahati, Assam",
      latitude: 26.1500,
      longitude: 91.7400,
    },
    create: {
      id: IDS.warehouse,
      disasterId: disaster.id,
      name: "Integration Relief Warehouse",
      location: "Guwahati, Assam",
      latitude: 26.1500,
      longitude: 91.7400,
    },
  });

  const beneficiary = await prisma.beneficiary.upsert({
    where: { id: IDS.beneficiary },
    update: {
      anonymousCode: "BEN-INTEGRATION-001",
      campId: camp.id,
      location: "Integration Relief Camp",
      familySize: 4,
      eligibility: { verified: true, category: "FLOOD_AFFECTED" },
    },
    create: {
      id: IDS.beneficiary,
      anonymousCode: "BEN-INTEGRATION-001",
      campId: camp.id,
      location: "Integration Relief Camp",
      familySize: 4,
      eligibility: { verified: true, category: "FLOOD_AFFECTED" },
    },
  });

  console.log(JSON.stringify({
    success: true,
    organizationId: organization.id,
    disasterId: disaster.id,
    warehouseId: warehouse.id,
    campId: camp.id,
    beneficiaryId: beneficiary.id,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
