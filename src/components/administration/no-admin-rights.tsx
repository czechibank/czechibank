export default function NoAdminRights() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
      <p className="mb-6 text-lg">You do not have the necessary permissions to access this page.</p>
      <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
    </div>
  );
}
