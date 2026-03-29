const User = require("../models/User-model");
const Owner = require("../models/Owner-model");
const Property = require("../models/Property-Model");
const Floor = require("../models/Floor-model");
const Unit = require("../models/Unit-model");
const Tenant = require("../models/Tenant-model");
const Invoice = require("../models/Invoice-model");
const Maintenance = require("../models/Maintenance-model");

const seedDemoData = async (user) => {
    try {
        if (!user || !user.isDemoAccount) return;

        // Check if data already exists to avoid duplication
        const existingData = await Property.findOne({ 
             $or: [
                 { owner: user._id }, 
                 { manager: user._id }
             ] 
        });
        if (existingData) return; // Properties already assigned/owned

        // Helper to ensure owner exists
        const ensureOwner = async (email) => {
            let u = await User.findOne({ email });
            if (!u) {
                u = await User.create({
                    name: "Demo Owner",
                    email: email,
                    password: "demo123",
                    role: "OWNER",
                    isDemoAccount: true,
                    isActive: true
                });
            }
            let o = await Owner.findOne({ user: u._id });
            if (!o) {
                o = await Owner.create({
                    user: u._id,
                    companyName: "Zenith Real Estate Solutions",
                    ownerType: "COMPANY",
                    contactNumber: "9876543210",
                    isApproved: true,
                    approvedBy: u._id
                });
            }
            return { u, o };
        };

        if (user.role === "OWNER" || user.role === "MANAGER") {
            const { u: ownerUser, o: ownerProfile } = await ensureOwner("owner@demo.com");
            
            // 2. Create Properties
            const property1 = await Property.create({
                owner: ownerProfile._id,
                propertyName: "Skyline Residency",
                propertyType: "RESIDENTIAL",
                description: "Luxury residential complex with modern amenities.",
                location: "Worli, Mumbai",
                address: "Worli Sea Face Road",
                city: "Mumbai",
                state: "Maharashtra",
                zipCode: "400018",
                country: "India",
                isActive: true,
                manager: user.role === "MANAGER" ? user._id : null
            });

            const property2 = await Property.create({
                owner: ownerProfile._id,
                propertyName: "Elite Business Park",
                propertyType: "COMMERCIAL",
                description: "Premium office spaces in the heart of the business district.",
                location: "Bandra East, Mumbai",
                address: "G-Block, BKC",
                city: "Mumbai",
                state: "Maharashtra",
                zipCode: "400051",
                country: "India",
                isActive: true,
                manager: user.role === "MANAGER" ? user._id : null
            });

            // 3. Create Floors for Property 1
            const floorsP1 = [];
            for (let i = 1; i <= 3; i++) {
                floorsP1.push(await Floor.create({
                    propertyId: property1._id,
                    name: `Floor ${i}`,
                    floorNumber: i
                }));
            }

            // 4. Create Units for Floors
            const units = [];
            for (const floor of floorsP1) {
                for (let j = 1; j <= 2; j++) {
                    units.push(await Unit.create({
                        propertyId: property1._id,
                        floorId: floor._id,
                        unitNumber: `${floor.floorNumber}0${j}`,
                        unitType: "2BHK",
                        rentAmount: 45000 + (floor.floorNumber * 2000),
                        securityDeposit: 150000,
                        status: j === 1 ? "Occupied" : "Vacant"
                    }));
                }
            }

            // 5. Create some Tenants for occupied units
            const occupiedUnits = units.filter(u => u.status === "Occupied");
            for (let k = 0; k < occupiedUnits.length; k++) {
                const unit = occupiedUnits[k];
                // Create a User for the tenant
                const tenantUser = await User.create({
                    name: `Demo Tenant ${k + 1}`,
                    email: `tenant${k + 1}_demo@example.com`,
                    password: "password123",
                    role: "TENANT",
                    phone: `900000000${k}`,
                    createdBy: ownerUser._id
                });

                const tenant = await Tenant.create({
                    userId: tenantUser._id,
                    propertyId: property1._id,
                    floorId: unit.floorId,
                    unitId: unit._id,
                    managerId: user.role === "MANAGER" ? user._id : ownerUser._id,
                    leaseStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
                    leaseEnd: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // Next year
                    rent: unit.rentAmount,
                    deposit: unit.securityDeposit,
                    paymentStatus: k === 0 ? "Paid" : "Pending",
                    leaseStatus: "Active"
                });

                // 6. Create some Invoices
                await Invoice.create({
                    tenantId: tenant._id,
                    propertyId: property1._id,
                    unitId: unit._id,
                    amount: unit.rentAmount,
                    taxAmount: unit.rentAmount * 0.18,
                    totalAmount: unit.rentAmount * 1.18,
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    status: k === 0 ? "Paid" : "Pending",
                    invoiceNumber: `INV-DEMO-${Date.now()}-${k}`
                });
                
                // 7. Create Maintenance Requests
                if (k === 0) {
                   await Maintenance.create({
                      propertyId: property1._id,
                      tenantId: tenant._id,
                      unitId: unit._id,
                      issueType: "Plumbing",
                      description: "Leaking tap in the kitchen area.",
                      priority: "High",
                      status: "Pending",
                      reportedBy: tenantUser._id
                   });
                }
            }
        }

        console.log(`Demo data seeded successfully for ${user.email}`);
    } catch (error) {
        console.error("Error seeding demo data:", error);
    }
};

module.exports = { seedDemoData };
