const Property = require("../../models/Property-Model");
const Unit = require("../../models/Unit-model");
const Tenant = require("../../models/Tenant-model");
const Maintenance = require("../../models/Maintenance-model");
const Invoice = require("../../models/Invoice-model");

const getManagerDashboardStats = async (req, res) => {
    try {
        const managerId = req.user._id;

        // 1. Get properties managed by this manager
        const managedProperties = await Property.find({ manager: managerId }).select("_id");
        const propertyIds = managedProperties.map(p => p._id);

        if (propertyIds.length === 0) {
            return res.status(200).json({
                stats: { totalUnits: 0, activeTenants: 0, vacantUnits: 0, pendingMaintenance: 0 },
                revenueData: [],
                occupancyData: [],
                recentPayments: [],
                upcomingExpiries: []
            });
        }

        // 2. Aggregate Stats
        const totalUnitsCount = await Unit.countDocuments({ propertyId: { $in: propertyIds } });
        const vacantUnitsCount = await Unit.countDocuments({ propertyId: { $in: propertyIds }, status: "Vacant" });
        const occupiedUnitsCount = await Unit.countDocuments({ propertyId: { $in: propertyIds }, status: "Occupied" });

        // Active Tenants: Tenants in properties managed by this person
        const activeTenantsCount = await Tenant.countDocuments({ propertyId: { $in: propertyIds }, isActive: true });

        // Pending Maintenance
        const pendingMaintenanceCount = await Maintenance.countDocuments({
            propertyId: { $in: propertyIds },
            status: "Pending"
        });

        // 3. Chart Data: Rent Collection (Last 6 Months)
        // We'll group by month from the Invoice model
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const rentAggregation = await Invoice.aggregate([
            {
                $match: {
                    propertyId: { $in: propertyIds },
                    status: "Paid",
                    paidAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%b %Y", date: "$paidAt" } },
                    total: { $sum: "$totalAmount" },
                    paidDate: { $min: "$paidAt" }
                }
            },
            { $sort: { paidDate: 1 } }
        ]);

        const revenueData = rentAggregation.map(item => ({
            name: item._id,
            amount: item.total
        }));

        // 4. Chart Data: Occupancy
        const occupancyData = [
            { name: "Occupied", value: occupiedUnitsCount },
            { name: "Vacant", value: vacantUnitsCount },
            { name: "Reserved", value: await Unit.countDocuments({ propertyId: { $in: propertyIds }, status: "Reserved" }) },
            { name: "Maintenance", value: await Unit.countDocuments({ propertyId: { $in: propertyIds }, status: "Under Maintenance" }) }
        ].filter(item => item.value > 0);

        // 5. Table Data: Recent Rent Payments
        const recentPayments = await Invoice.find({
            propertyId: { $in: propertyIds },
            status: "Paid"
        })
            .populate("tenantId", "name")
            .populate("unitId", "unitNumber")
            .sort({ paidAt: -1 })
            .limit(5);

        // 6. Table Data: Upcoming Lease Expiries
        const currentDate = new Date();
        const upcomingExpiries = await Tenant.find({
            propertyId: { $in: propertyIds },
            leaseEnd: { $gte: currentDate },
            isActive: true
        })
            .populate("userId", "name")
            .populate("unitId", "unitNumber")
            .sort({ leaseEnd: 1 })
            .limit(5);

        res.status(200).json({
            stats: {
                totalUnits: totalUnitsCount,
                activeTenants: activeTenantsCount,
                vacantUnits: vacantUnitsCount,
                pendingMaintenance: pendingMaintenanceCount
            },
            revenueData,
            occupancyData,
            recentPayments,
            upcomingExpiries
        });

    } catch (error) {
        console.error("Manager Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

module.exports = { getManagerDashboardStats };
