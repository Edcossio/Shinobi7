import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminTopbar from '../organisms/AdminTopbar';
import AdminSidebar from '../organisms/AdminSidebar';

export default function AdminLayout({ tituloBreadcrumb }) {
    return (
        <div className="admin-main-container">
            <AdminTopbar tituloBreadcrumb={tituloBreadcrumb} />
            <div className="zte-wrapper">
                <AdminSidebar />
                <main className="admin-main">
                    <div className="zte-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}