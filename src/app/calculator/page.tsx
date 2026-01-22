"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp } from "lucide-react";

export default function CalculatorPage() {
  // Single job calculator
  const [jobPrice, setJobPrice] = useState(500);

  // Batch calculator
  const [numCustomers, setNumCustomers] = useState(10);
  const [frequency, setFrequency] = useState("QUARTERLY");
  const [avgTicket, setAvgTicket] = useState(500);

  // Calculate single job shares
  const operatorShare = jobPrice * 0.8;
  const adminShare = jobPrice * 0.1;
  const salesShare = jobPrice * 0.1;

  // Calculate batch estimates
  const jobsPerYear = frequency === "QUARTERLY" ? 4 : frequency === "SEMIANNUAL" ? 2 : 4;
  const totalAnnualJobs = numCustomers * jobsPerYear;
  const totalAnnualRevenue = totalAnnualJobs * avgTicket;
  const annualOperator = totalAnnualRevenue * 0.8;
  const annualAdmin = totalAnnualRevenue * 0.1;
  const annualSales = totalAnnualRevenue * 0.1;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Single Job Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[var(--nox-text-muted)]" />
                Single Job Calculator
              </CardTitle>
              <CardDescription>
                Calculate the 80/10/10 revenue split for a single job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobPrice">Job Price ($)</Label>
                <Input
                  id="jobPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={jobPrice}
                  onChange={(e) => setJobPrice(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>

              <div className="p-6 bg-[var(--nox-bg-elevated)] rounded-lg space-y-4">
                <div className="text-center pb-4 border-b border-[var(--nox-border-subtle)]">
                  <div className="text-sm text-[var(--nox-text-muted)]">Total Job Price</div>
                  <div className="text-4xl font-bold text-[var(--nox-accent)]">
                    {formatCurrency(jobPrice)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Operator (Baha)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">80%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(operatorShare)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Admin (Kazim)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">10%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(adminShare)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Sales (Eren)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">10%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(salesShare)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Estimate Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--nox-text-muted)]" />
                Annual Projection Calculator
              </CardTitle>
              <CardDescription>
                Estimate annual revenue based on customer count and frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numCustomers">Number of Customers</Label>
                  <Input
                    id="numCustomers"
                    type="number"
                    min="1"
                    value={numCustomers}
                    onChange={(e) => setNumCustomers(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Service Frequency</Label>
                  <Select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="QUARTERLY">Quarterly (4x/year)</option>
                    <option value="SEMIANNUAL">Semiannual (2x/year)</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgTicket">Average Ticket ($)</Label>
                  <Input
                    id="avgTicket"
                    type="number"
                    min="0"
                    step="0.01"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="p-6 bg-[var(--nox-bg-elevated)] rounded-lg space-y-6">
                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-[var(--nox-bg-hover)] rounded-lg text-center">
                    <div className="text-sm text-[var(--nox-text-muted)]">Total Annual Jobs</div>
                    <div className="text-3xl font-bold">{totalAnnualJobs}</div>
                    <div className="text-xs text-[var(--nox-text-muted)]">
                      {numCustomers} customers × {jobsPerYear} jobs/year
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--nox-bg-hover)] rounded-lg text-center">
                    <div className="text-sm text-[var(--nox-text-muted)]">Total Annual Revenue</div>
                    <div className="text-3xl font-bold text-[var(--nox-accent)]">
                      {formatCurrency(totalAnnualRevenue)}
                    </div>
                    <div className="text-xs text-[var(--nox-text-muted)]">
                      {totalAnnualJobs} jobs × {formatCurrency(avgTicket)}/job
                    </div>
                  </div>
                </div>

                {/* Annual Splits */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[var(--nox-text-secondary)]">Annual Split Breakdown</h4>
                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Operator (Baha)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">80%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(annualOperator)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Admin (Kazim)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">10%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(annualAdmin)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--nox-bg-hover)] rounded-lg">
                    <div>
                      <span className="font-medium">Sales (Eren)</span>
                      <span className="text-xs text-[var(--nox-text-muted)] ml-2">10%</span>
                    </div>
                    <span className="text-xl font-bold">
                      {formatCurrency(annualSales)}
                    </span>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="pt-4 border-t border-[var(--nox-border-subtle)]">
                  <h4 className="font-medium text-[var(--nox-text-secondary)] mb-3">Monthly Averages</h4>
                  <div className="grid gap-2 sm:grid-cols-3 text-center">
                    <div className="p-2 bg-[var(--nox-bg-hover)] rounded">
                      <div className="text-xs text-[var(--nox-text-muted)]">Jobs/Month</div>
                      <div className="font-bold">{(totalAnnualJobs / 12).toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-[var(--nox-bg-hover)] rounded">
                      <div className="text-xs text-[var(--nox-text-muted)]">Revenue/Month</div>
                      <div className="font-bold">{formatCurrency(totalAnnualRevenue / 12)}</div>
                    </div>
                    <div className="p-2 bg-[var(--nox-bg-hover)] rounded">
                      <div className="text-xs text-[var(--nox-text-muted)]">Operator/Month</div>
                      <div className="font-bold">
                        {formatCurrency(annualOperator / 12)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Split Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 border border-[var(--nox-border-default)] bg-[var(--nox-bg-elevated)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[var(--nox-text-primary)]">Operator (80%)</span>
                </div>
                <p className="text-sm text-[var(--nox-text-muted)]">
                  Baha - handles labor, chemicals, and all operational expenses from this share.
                </p>
              </div>
              <div className="p-4 border border-[var(--nox-border-default)] bg-[var(--nox-bg-elevated)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[var(--nox-text-primary)]">Admin (10%)</span>
                </div>
                <p className="text-sm text-[var(--nox-text-muted)]">
                  Kazim - platform management, coordination, and administrative overhead.
                </p>
              </div>
              <div className="p-4 border border-[var(--nox-border-default)] bg-[var(--nox-bg-elevated)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[var(--nox-text-primary)]">Sales (10%)</span>
                </div>
                <p className="text-sm text-[var(--nox-text-muted)]">
                  Eren - customer acquisition, relationship management, and sales efforts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
