"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/actions/user.actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  emailVerified: boolean;
  role: "user" | "admin";
  provider: string;
  hasClaimedCanva: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin">("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUser();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 md:p-6">
        {/* Top controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
          {/* Search skeleton */}
          <Skeleton className="h-10 w-full md:w-[300px]" />

          {/* Filter skeletons */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
            <Skeleton className="h-10 flex-1 md:flex-none md:w-[100px]" />
            <Skeleton className="h-10 flex-1 md:flex-none md:w-[100px]" />
            <Skeleton className="h-10 flex-1 md:flex-none md:w-[100px]" />
          </div>
        </div>

        {/* Table skeleton with scrollable container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full rounded-md border overflow-hidden">
            <div className="h-full overflow-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    {[...Array(7)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-[70%]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
        {/* Search */}
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <Button
            className="flex-1 md:flex-none"
            variant={filterRole === "all" ? "default" : "outline"}
            onClick={() => setFilterRole("all")}
          >
            All
          </Button>
          <Button
            className="flex-1 md:flex-none"
            variant={filterRole === "user" ? "default" : "outline"}
            onClick={() => setFilterRole("user")}
          >
            Users
          </Button>
          <Button
            className="flex-1 md:flex-none"
            variant={filterRole === "admin" ? "default" : "outline"}
            onClick={() => setFilterRole("admin")}
          >
            Admins
          </Button>
        </div>
      </div>

      {/* Table Container with Scrollable Area */}
      <div className="flex-1 overflow-hidden rounded-md border">
        <div className="h-full overflow-auto">
          <Table className="min-w-[700px]">
            <TableCaption>A list of all registered users.</TableCaption>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.emailVerified ? "default" : "secondary"}
                      >
                        {user.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "outline"}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.role === "admin"
                              ? "Revoke Admin"
                              : "Make Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}