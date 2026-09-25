import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AdminDashboardHome from "./admin/AdminDashboardHome.jsx";
import AdminBooks from "./admin/AdminBooks.jsx";
import AdminBookForm from "./admin/AdminBookForm.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminCustomers from "./admin/AdminCustomers.jsx";

export default function AdminDashboard() {
  const { isSuperAdmin, user } = useAuth();

  const tabClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm ${
      isActive ? "bg-gold-500 text-ink" : "text-ivory/70 hover:text-gold-400"
    }`;

  const defaultTab = isSuperAdmin ? "dashboard" : "books";

  const heading = isSuperAdmin
    ? `${user?.name ?? "CEO"} · CEO Dashboard`
    : "Admin";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ivory">{heading}</h1>

      <nav className="mt-6 flex flex-wrap gap-2">
        {isSuperAdmin && (
          <NavLink to="dashboard" className={tabClass}>
            Dashboard
          </NavLink>
        )}
        <NavLink to="books" className={tabClass} end>
          Books
        </NavLink>
        <NavLink to="books/new" className={tabClass}>
          Add book
        </NavLink>
        <NavLink to="orders" className={tabClass}>
          Orders
        </NavLink>
        {isSuperAdmin && (
          <NavLink to="admins" className={tabClass}>
            Admins
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to="customers" className={tabClass}>
            Customers
          </NavLink>
        )}
      </nav>

      <div className="mt-8">
        <Routes>
          <Route index element={<Navigate to={defaultTab} replace />} />
          {isSuperAdmin && <Route path="dashboard" element={<AdminDashboardHome />} />}
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/new" element={<AdminBookForm />} />
          <Route path="books/:id/edit" element={<AdminBookForm />} />
          <Route path="orders" element={<AdminOrders />} />
          {isSuperAdmin && <Route path="admins" element={<AdminUsers />} />}
          {isSuperAdmin && <Route path="customers" element={<AdminCustomers />} />}
        </Routes>
      </div>
    </div>
  );
}