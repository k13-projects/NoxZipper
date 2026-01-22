"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Phone, MapPin } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  city: string;
  state: string;
  contactName: string;
  contactPhone: string;
  frequencyType: string;
  assignedOperator: string;
  _count: {
    jobs: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = "") => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/customers?search=${encodeURIComponent(searchQuery)}`
        : "/api/customers";
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const getFrequencyBadge = (frequencyType: string) => {
    switch (frequencyType) {
      case "QUARTERLY":
        return <Badge variant="default">Quarterly</Badge>;
      case "SEMIANNUAL":
        return <Badge variant="secondary">Semiannual</Badge>;
      case "CUSTOM":
        return <Badge variant="outline">Custom</Badge>;
      default:
        return <Badge variant="outline">{frequencyType}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search by name, city, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              {search && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    fetchCustomers();
                  }}
                >
                  Clear
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>No customers found.</p>
                <Link href="/customers/new">
                  <Button className="mt-4">Add Your First Customer</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{customer.contactName}</p>
                          <p className="flex items-center text-zinc-400">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.contactPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-zinc-400">
                          <MapPin className="mr-1 h-3 w-3" />
                          {customer.city}, {customer.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getFrequencyBadge(customer.frequencyType)}
                      </TableCell>
                      <TableCell>{customer.assignedOperator}</TableCell>
                      <TableCell>{customer._count.jobs}</TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
