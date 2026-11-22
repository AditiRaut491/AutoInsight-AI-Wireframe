import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import Alerts from './pages/Alerts.jsx';
import Vehicle from './pages/Vehicle.jsx';
import Insights from './pages/Insights.jsx';
import Actions from './pages/Actions.jsx';
import HoldingCost from './pages/HoldingCost.jsx';
import WhatIf from './pages/WhatIf.jsx';
import Reports from './pages/Reports.jsx';
import Assistant from './pages/Assistant.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/vehicle" element={<Vehicle />} />
          <Route path="/vehicle/:id" element={<Vehicle />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:id" element={<Insights />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/holding-cost" element={<HoldingCost />} />
          <Route path="/holding-cost/:id" element={<HoldingCost />} />
          <Route path="/what-if" element={<WhatIf />} />
          <Route path="/what-if/:id" element={<WhatIf />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
