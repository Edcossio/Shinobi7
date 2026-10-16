import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../organisms/PublicNavbar';
import PublicFooter from '../organisms/PublicFooter';

export default function StoreLayout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <PublicNavbar />
            <main className="flex-grow-1">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
}