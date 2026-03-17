const User = require("../../models/User-model");
const Owner = require("../../models/Owner-model");
const Property = require("../../models/Property-Model");
const Tenant = require("../../models/Tenant-model");
const Invoice = require("../../models/Invoice-model");
const Unit = require("../../models/Unit-model");

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

const getRevenueStats = async (req, res) => {
    try {
        // 1. Revenue Summary Cards
        const totalRentAggregation = await Invoice.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$rent" } } }
        ]);
        const totalMaintenanceAggregation = await Invoice.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$maintenanceCharges" } } }
        ]);
        const totalUtilityAggregation = await Invoice.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$utilityCharges" } } }
        ]);
        const totalRevenueAggregation = await Invoice.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const pendingRentAggregation = await Invoice.aggregate([
            { $match: { status: "Unpaid" } },
            { $group: { _id: null, total: { $sum: "$rent" } } }
        ]);

        const summaryCards = {
            totalRent: totalRentAggregation[0]?.total || 0,
            totalMaintenance: totalMaintenanceAggregation[0]?.total || 0,
            totalUtility: totalUtilityAggregation[0]?.total || 0,
            totalRevenue: totalRevenueAggregation[0]?.total || 0,
            pendingRent: pendingRentAggregation[0]?.total || 0
        };

        // 2. Revenue by Owner
        const revenueByOwner = await Owner.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            { $unwind: "$userData" },
            {
                $lookup: {
                    from: "properties",
                    localField: "_id",
                    foreignField: "owner",
                    as: "properties"
                }
            },
            {
                $lookup: {
                    from: "invoices",
                    localField: "userData._id",
                    foreignField: "ownerId",
                    as: "invoices"
                }
            },
            {
                $project: {
                    ownerName: { $ifNull: ["$companyName", "$userData.name"] },
                    propertyCount: { $size: "$properties" },
                    totalUnits: { $sum: "$properties.totalUnits" },
                    revenue: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$invoices",
                                        as: "inv",
                                        cond: { $eq: ["$$inv.status", "Paid"] }
                                    }
                                },
                                as: "paidInv",
                                in: "$$paidInv.totalAmount"
                            }
                        }
                    }
                }
            }
        ]);

        // 3. Revenue by Property
        const revenueByProperty = await Property.aggregate([
            {
                $lookup: {
                    from: "owners",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerData"
                }
            },
            { $unwind: "$ownerData" },
            {
                $lookup: {
                    from: "users",
                    localField: "ownerData.user",
                    foreignField: "_id",
                    as: "ownerUser"
                }
            },
            { $unwind: "$ownerUser" },
            {
                $lookup: {
                    from: "invoices",
                    localField: "_id",
                    foreignField: "propertyId",
                    as: "invoices"
                }
            },
            {
                $project: {
                    propertyName: 1,
                    ownerName: { $ifNull: ["$ownerData.companyName", "$ownerUser.name"] },
                    units: "$totalUnits",
                    monthlyRevenue: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$invoices",
                                        as: "inv",
                                        cond: { $eq: ["$$inv.status", "Paid"] }
                                    }
                                },
                                as: "paidInv",
                                in: "$$paidInv.totalAmount"
                            }
                        }
                    }
                }
            }
        ]);

        // 4. Monthly Revenue Trend
        const monthlyRevenueTrend = await Invoice.aggregate([
            { $match: { status: "Paid" } },
            {
                $group: {
                    _id: "$month",
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 5. Occupancy vs Revenue
        const totalUnits = await Unit.countDocuments();
        const occupiedUnits = await Unit.countDocuments({ status: "Occupied" });
        const vacantUnits = totalUnits - occupiedUnits;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        const occupancyStats = {
            totalUnits,
            occupiedUnits,
            vacantUnits,
            occupancyRate: Math.round(occupancyRate)
        };

        // 6. Pending Rent Report
        const pendingRentReport = await Invoice.find({ status: "Unpaid" })
            .populate("tenantId", "name")
            .populate("propertyId", "propertyName")
            .select("tenantId propertyId totalAmount dueDate")
            .sort({ dueDate: 1 });

        const formattedPendingRent = pendingRentReport.map(inv => ({
            tenant: inv.tenantId?.name || "Unknown",
            property: inv.propertyId?.propertyName || "Unknown",
            amount: inv.totalAmount,
            daysLate: Math.max(0, Math.floor((new Date() - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24)))
        }));

        res.status(200).json({
            summaryCards,
            revenueByOwner,
            revenueByProperty,
            monthlyRevenueTrend: monthlyRevenueTrend.map(item => ({ month: item._id, revenue: item.revenue })),
            occupancyStats,
            pendingRentReport: formattedPendingRent
        });

    } catch (error) {
        console.error("Super Admin Revenue Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch revenue stats", error: error.message });
    }
};

module.exports = { getDashboardStats, getRevenueStats };
