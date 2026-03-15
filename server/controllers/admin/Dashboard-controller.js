const User = require("../../models/User-model");
const Owner = require("../../models/Owner-model");
const Property = require("../../models/Property-Model");
const Tenant = require("../../models/Tenant-model");
const Invoice = require("../../models/Invoice-model");

const getDashboardStats = async (req, res) => {
    try {
        // 1. Top Summary Cards
        const totalUsers = await User.countDocuments();
        const totalOwners = await Owner.countDocuments();
        const totalProperties = await Property.countDocuments();
        const totalTenants = await Tenant.countDocuments();

        // Monthly Revenue (Paid invoices in the current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenueAggregation = await Invoice.aggregate([
            {
                $match: {
                    status: "Paid",
                    paidAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);
        const monthlyRevenue = monthlyRevenueAggregation.length > 0 ? monthlyRevenueAggregation[0].total : 0;

        // 2. Platform Growth line Chart (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const propertyGrowth = await Property.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Property Distribution pie chart
        const propertyDistribution = await Property.aggregate([
            {
                $group: {
                    _id: "$propertyType",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Recent Owners (Pending Approval)
        const recentOwners = await Owner.find({ isApproved: false })
            .populate("user", "name email createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            summary: {
                totalUsers,
                totalOwners,
                totalProperties,
                totalTenants,
                monthlyRevenue
            },
            growth: {
                userGrowth,
                propertyGrowth
            },
            propertyDistribution,
            recentOwners
        });

    } catch (error) {
        console.error("Super Admin Dashboard Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

module.exports = { getDashboardStats };
