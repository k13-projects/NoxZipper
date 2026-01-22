"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

interface CustomerData {
  id?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  hoodLengthFt: number;
  notes?: string;
  frequencyType: string;
  customIntervalDays?: number;
  firstServiceDate?: string;
  assignedOperator: string;
  salesPartner: string;
}

interface CustomerFormProps {
  initialData?: CustomerData;
  isEdit?: boolean;
}

export function CustomerForm({ initialData, isEdit }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CustomerData>({
    name: initialData?.name || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "TX",
    zip: initialData?.zip || "",
    contactName: initialData?.contactName || "",
    contactPhone: initialData?.contactPhone || "",
    contactEmail: initialData?.contactEmail || "",
    hoodLengthFt: initialData?.hoodLengthFt || 10,
    notes: initialData?.notes || "",
    frequencyType: initialData?.frequencyType || "QUARTERLY",
    customIntervalDays: initialData?.customIntervalDays || 90,
    firstServiceDate: initialData?.firstServiceDate
      ? format(new Date(initialData.firstServiceDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    assignedOperator: initialData?.assignedOperator || "Baha",
    salesPartner: initialData?.salesPartner || "Eren",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/customers/${initialData?.id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save customer");
      }

      const customer = await res.json();
      router.push(`/customers/${customer.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-900/50 border border-red-800 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoodLengthFt">Hood Length (ft)</Label>
              <Input
                id="hoodLengthFt"
                name="hoodLengthFt"
                type="number"
                min="1"
                step="0.5"
                value={formData.hoodLengthFt}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone *</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Service Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frequencyType">Service Frequency *</Label>
              <Select
                id="frequencyType"
                name="frequencyType"
                value={formData.frequencyType}
                onChange={handleChange}
              >
                <option value="QUARTERLY">Quarterly (4x/year)</option>
                <option value="SEMIANNUAL">Semiannual (2x/year)</option>
                <option value="CUSTOM">Custom Interval</option>
              </Select>
            </div>
            {formData.frequencyType === "CUSTOM" && (
              <div className="space-y-2">
                <Label htmlFor="customIntervalDays">Interval (days)</Label>
                <Input
                  id="customIntervalDays"
                  name="customIntervalDays"
                  type="number"
                  min="1"
                  value={formData.customIntervalDays}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstServiceDate">First Service Date</Label>
              <Input
                id="firstServiceDate"
                name="firstServiceDate"
                type="date"
                value={formData.firstServiceDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignedOperator">Assigned Operator</Label>
              <Input
                id="assignedOperator"
                name="assignedOperator"
                value={formData.assignedOperator}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesPartner">Sales Partner</Label>
              <Input
                id="salesPartner"
                name="salesPartner"
                value={formData.salesPartner}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional notes about this customer..."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {isEdit ? "Update Customer" : "Create Customer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
