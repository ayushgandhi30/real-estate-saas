// Centralized Demo Data for Owner and Manager accounts
export const DEMO_LEASES = [
    {
        _id: "demo-lease-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        userId: { name: "John Doe", email: "john@example.com", phone: "+91 98765 43210" },
        propertyId: { propertyName: "Skyline Residency" },
        floorId: { name: "Floor 4" },
        unitId: { unitNumber: "402" },
        leaseStart: "2024-01-01",
        leaseEnd: "2024-12-31",
        rent: 25000,
        deposit: 75000,
        maintenanceCost: 2000,
        leaseStatus: "Active"
    },
    {
        _id: "demo-lease-2",
        name: "Sarah Williams",
        email: "sarah@example.com",
        phone: "+91 87654 32109",
        userId: { name: "Sarah Williams", email: "sarah@example.com", phone: "+91 87654 32109" },
        propertyId: { propertyName: "Elite Business Park" },
        floorId: { name: "Floor 2" },
        unitId: { unitNumber: "205" },
        leaseStart: "2023-06-15",
        leaseEnd: "2024-06-14",
        rent: 45000,
        deposit: 135000,
        maintenanceCost: 5000,
        leaseStatus: "Expiring"
    }
];

export const DEMO_TENANTS = [
    {
        _id: "demo-tenant-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        userId: { name: "John Doe", email: "john@example.com" },
        propertyId: { propertyName: "Skyline Residency", _id: "demo-prop-1" },
        floorId: { name: "Floor 4" },
        unitId: { unitNumber: "402" },
        leaseStart: "2024-01-01",
        leaseEnd: "2024-12-31",
        leaseStatus: "Active",
        rent: 25000,
        deposit: 75000,
        paymentStatus: "Paid",
        isActive: true
    },
    {
        _id: "demo-tenant-2",
        name: "Sarah Williams",
        email: "sarah@example.com",
        phone: "+91 87654 32109",
        userId: { name: "Sarah Williams", email: "sarah@example.com" },
        propertyId: { propertyName: "Elite Business Park", _id: "demo-prop-2" },
        floorId: { name: "Floor 2" },
        unitId: { unitNumber: "205" },
        leaseStart: "2023-06-15",
        leaseEnd: "2024-06-14",
        leaseStatus: "Expiring",
        rent: 45000,
        deposit: 135000,
        paymentStatus: "Pending",
        isActive: true
    }
];

export const DEMO_REQUESTS = [
    {
        _id: "demo-req-1",
        title: "Plumbing Leak in Unit 402",
        category: "Plumbing",
        priority: "High",
        description: "There is a significant leak in the bathroom kitchen pipe. Water is starting to pool.",
        status: "In Progress",
        propertyId: { propertyName: "Skyline Residency" },
        unitId: { unitNumber: "402" },
        createdBy: { name: "John Doe" },
        createdAt: "2024-03-15T10:00:00Z"
    },
    {
        _id: "demo-req-2",
        title: "HVAC System Not Cooling",
        category: "HVAC",
        priority: "Critical",
        description: "The AC unit has stopped working completely during the peak afternoon. Needs immediate attention.",
        status: "Pending",
        propertyId: { propertyName: "Elite Business Park" },
        unitId: { unitNumber: "205" },
        createdBy: { name: "Sarah Williams" },
        createdAt: "2024-03-20T14:30:00Z"
    }
];

export const DEMO_INVOICES = [
    {
        _id: "demo-inv-1",
        invoiceNumber: "INV-2024-001",
        tenantId: { name: "John Doe" },
        propertyId: { propertyName: "Skyline Residency" },
        unitId: { unitNumber: "402", floorId: { name: "Floor 4" } },
        month: "March 2026",
        rent: 25000,
        maintenanceCharges: 2000,
        utilityCharges: 1500,
        lateFee: 0,
        totalAmount: 28500,
        dueDate: "2026-04-05",
        status: "Paid",
        notes: "Monthly standard billing"
    },
    {
        _id: "demo-inv-2",
        invoiceNumber: "INV-2024-002",
        tenantId: { name: "Sarah Williams" },
        propertyId: { propertyName: "Elite Business Park" },
        unitId: { unitNumber: "205", floorId: { name: "Floor 2" } },
        month: "March 2026",
        rent: 45000,
        maintenanceCharges: 5000,
        utilityCharges: 3200,
        lateFee: 500,
        totalAmount: 53700,
        dueDate: "2026-04-05",
        status: "Unpaid",
        notes: "Includes arrears from last month"
    }
];

export const DEMO_FLOORS = [
    {
        _id: "demo-floor-1",
        name: "Lobby Level",
        floorNumber: 0,
        propertyId: { propertyName: "Skyline Residency" },
        description: "Main entrance and reception area"
    },
    {
        _id: "demo-floor-2",
        name: "Penthouse Level",
        floorNumber: 15,
        propertyId: { propertyName: "Skyline Residency" },
        description: "Premium residential suites"
    }
];

export const DEMO_UNITS = [
    {
        _id: "demo-unit-1",
        unitNumber: "L-01",
        propertyId: { propertyName: "Skyline Residency" },
        floorId: { floorNumber: 0, _id: "demo-floor-1" },
        unitType: "Retail",
        area: 1200,
        rentAmount: 45000,
        status: "Occupied"
    },
    {
         _id: "demo-unit-2",
         unitNumber: "PH-01",
         propertyId: { propertyName: "Skyline Residency" },
         floorId: { floorNumber: 15, _id: "demo-floor-2" },
         unitType: "Penthouse",
         area: 3500,
         rentAmount: 125000,
         status: "Vacant"
    }
];
