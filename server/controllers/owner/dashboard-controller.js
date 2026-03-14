const Property = require("../../models/Property-Model");
const Unit = require("../../models/Unit-model");
const Invoice = require("../../models/Invoice-model");
const Maintenance = require("../../models/Maintenance-model");

const getOwnerDashboardData = async (req, res) => {
    try {
        const ownerId = req.user._id; // Use _id so it inherently contains an ObjectId for aggregation queries

        // 1. Properties
        const properties = await Property.find({ owner: ownerId });
        const propertyIds = properties.map(p => p._id);
        const totalProperties = properties.length;

        // 2 & 3 & 4. Units
        const units = await Unit.find({ propertyId: { $in: propertyIds } });
        const totalUnits = units.length;

        let occupiedUnits = 0;
        let vacantUnits = 0;
        let otherUnits = 0;

        units.forEach(unit => {
            if (unit.status === "Occupied") occupiedUnits++;
            else if (unit.status === "Vacant") vacantUnits++;
            else otherUnits++;
        });

        // 5. Monthly Rental Income (Current month)
        // Check invoices that have been paid in current month, or the `month` field is current month.
        // Let's use `paidAt` for calculating collected income.
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const currentMonthInvoices = await Invoice.find({
            ownerId: ownerId,
            status: "Paid",
            paidAt: { $gte: startOfMonth, $lt: startOfNextMonth }
        });

        const monthlyRentalIncome = currentMonthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        // 6. Pending Maintenance
        const pendingMaintenanceApprovals = await Maintenance.countDocuments({
            ownerId: ownerId,
            status: "Pending"
        });

        // 7. Income Overview Chart (Group by month string, e.g., "Mar 2026")
        // Alternatively, calculate based on `paidAt` using aggregation to get proper month ordering
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const incomeData = await Invoice.aggregate([
            {
                $match: {
                    ownerId: ownerId,
                    status: "Paid",
                    paidAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paidAt" },
                        month: { $month: "$paidAt" }
                    },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedIncomeChart = incomeData.map(item => {
            const date = new Date(item._id.year, item._id.month - 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            return {
                name: `${monthName} ${item._id.year}`,
                income: item.total
            };
        });

        // 8. Occupancy Rate Chart (Format for UI)
        const occupancyChart = [
            { name: "Occupied", value: occupiedUnits },
            { name: "Vacant", value: vacantUnits },
            { name: "Other", value: otherUnits }
        ];

        return res.status(200).json({
            success: true,
            data: {
                totalProperties,
                totalUnits,
                occupiedUnits,
                vacantUnits,
                monthlyRentalIncome,
                pendingMaintenanceApprovals,
                incomeChart: formattedIncomeChart,
                occupancyChart
            }
        });

    } catch (error) {
        console.error("Owner Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Error fetching dashboard data" });
    }
};

module.exports = {
    getOwnerDashboardData
};
