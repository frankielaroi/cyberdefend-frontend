import { useState } from 'react';
import AdminBillingList from './AdminBillingList';
import AdminBillingForm from './AdminBillingForm';
import { SubscriptionPlanDto } from '../../../services/adminBillingService';

export default function AdminBillingPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEdit = (plan: SubscriptionPlanDto) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const afterSaved = () => {
    // bump key so AdminBillingList refetches
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <AdminBillingList key={refreshKey} onCreate={handleCreate} onEdit={handleEdit} />
      {showForm && (
        <AdminBillingForm
          plan={editingPlan}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            afterSaved();
          }}
        />
      )}
    </div>
  );
}
