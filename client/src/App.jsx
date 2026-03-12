import React from 'react'
import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PublicRoute from './store/PubliRoute.jsx'
import SignInPage from './auth/SignInPage.jsx'
import SignUpPage from './auth/SignUpPage.jsx'
import ProtectedRoute from './store/ProtectedRoute.jsx'
import Sidebar from './layouts/Sidebar.jsx'
import Layout from './layouts/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import User from './pages/User.jsx'
import Role from './pages/Role.jsx'
import Property from './pages/Property.jsx'
import Settings from './pages/Settings.jsx'
import Subscriptions from './pages/Subscriptions.jsx'
import AuditLogs from './pages/AuditLogs.jsx'
import Profile from './pages/Profile.jsx'
import Logout from './auth/Logout.jsx'
import FloorUnit from './pages/FloorUnit.jsx'
import Tenant from './pages/Tenant.jsx'
import RevenueReport from './pages/RevenueReport.jsx'
import Lease from './pages/Lease.jsx'
import Maintenance from './pages/Maintenance.jsx'
import Invoice from './pages/Invoice.jsx'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* Auth routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* App Layout Wrapper */}
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT", "TECHNICIAN"]} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

              {/* All logged in users can access these */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Roles: Super Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
                <Route path="/roles" element={<Role />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>

              {/* Roles: Super Admin & Manager */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "MANAGER"]} />}>
                <Route path="/users" element={<User />} />
              </Route>



              {/* Roles: Super Admin, Owner, Manager, Tenant */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "OWNER"]} />}>
                <Route path="/properties" element={<Property />} />
              </Route>

              {/* Roles: Super Admin, Owner */}
              <Route element={<ProtectedRoute allowedRoles={[]} />}>
                <Route path="/subscriptions" element={<Subscriptions />} />
              </Route>

              {/* Roles: Super Admin */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "OWNER", "MANAGER"]} />}>
                <Route path="/tenant" element={<Tenant />} />
              </Route>

              {/* Roles: Super Admin, Owner */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "OWNER"]} />}>
                <Route path="/revenue-report" element={<RevenueReport />} />
              </Route>

              {/* Roles: Owner */}
              <Route element={<ProtectedRoute allowedRoles={["OWNER"]} />}>
                <Route path="/floor" element={<FloorUnit />} />
              </Route>

              {/* Roles: Tenant */}
              <Route element={<ProtectedRoute allowedRoles={["TENANT"]} />}>
                <Route path="/lease" element={<Lease />} />
              </Route>

              {/* Roles: Tenant, Manager */}
              <Route element={<ProtectedRoute allowedRoles={["TENANT", "MANAGER", "OWNER"]} />}>
                <Route path="/maintenance" element={<Maintenance />} />
              </Route>

              {/* Roles: Tenant , Manager */}
              <Route element={<ProtectedRoute allowedRoles={["TENANT", "MANAGER"]} />}>
                <Route path="/invoice" element={<Invoice />} />
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center text-white bg-[var(--bg-main)]">Unauthorized Access</div>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
