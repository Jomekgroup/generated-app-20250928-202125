import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Banknote, Gem, Rocket } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Payment } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
export function AdminDashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api<Payment[]>('/api/admin/payments');
      setPayments(data);
    } catch (err) {
      setError("Failed to fetch payment notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  const handlePaymentAction = async (paymentId: string, status: 'approved' | 'declined') => {
    setProcessingId(paymentId);
    try {
      await api(`/api/admin/payments/${paymentId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      toast.success(`Payment has been ${status}.`);
      fetchPayments(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} payment.`);
    } finally {
      setProcessingId(null);
    }
  };
  const renderPaymentList = () => {
    if (loading) {
      return [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />);
    }
    if (error) {
      return <p className="text-red-500 text-center py-8">{error}</p>;
    }
    if (payments.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No pending payments to review.</p>;
    }
    return payments.map(payment => (
      <div key={payment.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-semibold text-lg">{payment.cleanerName}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Banknote className="w-4 h-4" />
            <span>Amount: ���{payment.amount.toLocaleString()}</span>
            {payment.type === 'premium' ? <Badge variant="outline"><Gem className="w-3 h-3 mr-1" />Premium</Badge> : <Badge variant="outline"><Rocket className="w-3 h-3 mr-1" />Featured</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Notified on: {new Date(payment.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePaymentAction(payment.id, 'declined')}
            disabled={processingId === payment.id}
          >
            {processingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => handlePaymentAction(payment.id, 'approved')}
            disabled={processingId === payment.id}
          >
            {processingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Approve
          </Button>
        </div>
      </div>
    ));
  };
  return (
    <div className="bg-gray-50/50 dark:bg-black/50 min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage and verify cleaner payments.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payment Notifications</CardTitle>
            <CardDescription>Review and approve manual bank transfers from cleaners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderPaymentList()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}