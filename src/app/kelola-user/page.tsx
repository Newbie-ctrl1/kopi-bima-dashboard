import { notFound, redirect } from "next/navigation";
import { getCurrentUser, createUserAction, deleteUserAction } from "@/app/actions";
import * as store from "@/lib/store";
import Breadcrumb from "@/components/Breadcrumb";
import UserListClient from "@/app/kelola-user/UserListClient";

export default async function KelolaUserPage() {
  const currentUser = await getCurrentUser();

  // Protect page server-side: only ADMIN allowed
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all users
  const rawUsers = await store.getAllUsers();
  
  // Format dates for client
  const users = rawUsers.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <>
      <Breadcrumb items={[{ label: "Kelola User" }]} />
      <UserListClient 
        initialUsers={users} 
        currentUserId={currentUser.id}
        onCreateUser={createUserAction}
        onDeleteUser={deleteUserAction}
      />
    </>
  );
}
