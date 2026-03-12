const Tenant = require("../../models/Tenant-model");
const Property = require("../../models/Property-Model");
const Unit = require("../../models/Unit-model");
const Owner = require("../../models/Owner-model");
const Invoice = require("../../models/Invoice-model");
const Maintenance = require("../../models/Maintenance-model");

const getRevenueStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find Owner record
        const owner = await Owner.findOne({ user: userId });
        if (!owner) {
            return res.status(404).json({ message: "Owner record not found" });
        }

        const ownerId = owner._id;

        // Find all properties owned by this owner
        const properties = await Property.find({ owner: ownerId });
        const propertyIds = properties.map(p => p._id);

        if (propertyIds.length === 0) {
            return res.status(200).json({
                stats: {
                    totalRevenue: "₹0",
                    monthlyRevenue: "₹0",
                    occupancyRate: "0%",
                    pendingRent: "₹0",
                    netProfit: "₹0",
                    totalExpenses: "₹0",
                    rentCollected: "₹0",
                    lateFees: "₹0"
                },
                transactions: [],
                efficiency: 0,
                breakdown: {
                    rent: { collected: "₹0", pending: "₹0", lateFees: "₹0" },
                    other: { parking: "₹0", utilities: "₹0", services: "₹0" },
                    expenses: { maintenance: "₹0", repairs: "₹0", utilities: "₹0" }
                }
            });
        }

        // Fetch all tenants for these properties (for monthly revenue and occupancy)
        const tenants = await Tenant.find({ propertyId: { $in: propertyIds } });

        // Fetch all invoices for these properties/owner
        const invoices = await Invoice.find({ ownerId: userId })
            .populate('tenantId', 'name')
            .populate('unitId', 'unitNumber')
            .sort({ createdAt: -1 });

        // Fetch all maintenance requests for these properties/owner
        const maintenanceRequests = await Maintenance.find({ ownerId: userId });

        // Fetch all units for occupancy rate
        const units = await Unit.find({ propertyId: { $in: propertyIds } });

        // Calculations
        let rentCollected = 0;
        let collectedLateFees = 0;
        let pendingRent = 0;
        let monthlyRevenueActive = 0;
        let totalExpenses = 0;

        // Calculate Monthly Revenue from Active Tenants
        tenants.forEach(tenant => {
            if (tenant.leaseStatus === "Active") {
                monthlyRevenueActive += (tenant.rent || 0);
            }
        });

        // Calculate Revenue from Invoices
        invoices.forEach(invoice => {
            if (invoice.status === "Paid") {
                rentCollected += (invoice.totalAmount - (invoice.lateFee || 0));
                collectedLateFees += (invoice.lateFee || 0);
            } else if (invoice.status === "Unpaid" || invoice.status === "Overdue") {
                pendingRent += invoice.totalAmount;
            }
        });

        // Calculate Expenses from Maintenance Costs
        maintenanceRequests.forEach(req => {
            totalExpenses += (req.cost || 0);
        });

        const totalRevenue = rentCollected + collectedLateFees;
        
        const totalUnits = units.length;
        const occupiedUnits = units.filter(u => u.status === "Occupied").length;
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        const netProfit = totalRevenue - totalExpenses;

        // Transaction History from Invoices
        const transactionsList = invoices.map(inv => ({
            date: new Date(inv.paidAt || inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            tenant: inv.tenantId?.name || "Anonymous",
            unit: inv.unitId?.unitNumber || "N/A",
            invoice: inv.invoiceNumber || `INV-${inv._id.toString().slice(-4).toUpperCase()}`,
            amount: `₹${(inv.totalAmount || 0).toLocaleString('en-IN')}`,
            status: inv.status === "Paid" ? "Paid" : "Pending"
        })).slice(0, 10);

        res.status(200).json({
            stats: {
                totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
                monthlyRevenue: `₹${monthlyRevenueActive.toLocaleString('en-IN')}`,
                occupancyRate: `${occupancyRate}%`,
                pendingRent: `₹${pendingRent.toLocaleString('en-IN')}`,
                netProfit: `₹${netProfit.toLocaleString('en-IN')}`,
                totalExpenses: `₹${totalExpenses.toLocaleString('en-IN')}`,
                rentCollected: `₹${rentCollected.toLocaleString('en-IN')}`,
                lateFees: `₹${collectedLateFees.toLocaleString('en-IN')}`
            },
            transactions: transactionsList,
            efficiency: occupancyRate,
            breakdown: {
                rent: {
                    collected: `₹${rentCollected.toLocaleString('en-IN')}`,
                    pending: `₹${pendingRent.toLocaleString('en-IN')}`,
                    lateFees: `₹${collectedLateFees.toLocaleString('en-IN')}`
                },
                other: {
                    parking: "₹0",
                    utilities: "₹0",
                    services: "₹0"
                },
                expenses: {
                    maintenance: `₹${totalExpenses.toLocaleString('en-IN')}`,
                    repairs: "₹0",
                    utilities: "₹0"
                }
            }
        });


    } catch (error) {
        console.error("Error fetching revenue stats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getRevenueStats };

