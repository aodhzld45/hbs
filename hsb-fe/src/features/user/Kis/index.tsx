import React from 'react';
import KisPanel from './components/KisPanel';
import Layout from '../../../components/Layout/Layout';

export default function KisPage() {
  return (
    <Layout>
        <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-3">한국투자증권[KIS] 시세</h1>
        <KisPanel />
        </div>
    </Layout>
  );
}
