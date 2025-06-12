
import Header from "@/components/Header";
import ReportButtons from "@/components/ReportButtons";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">View progress reports and analytics</p>
        </div>
        <ReportButtons />
      </main>
    </div>
  );
};

export default AdminDashboard;
