import { useEffect, useState } from "react";
import { getAllResults } from "../../services/resultService";
import AdminSidebar, { MobileMenuButton } from "../../components/admin/AdminSidebar";

function ResultsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getAllResults();
        setResults(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter((result) =>
    result.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Results Management</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Student Results</h2>
              <p className="text-gray-500 mt-1">View and search all exam results.</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 w-full sm:w-64 focus:w-72 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-gov">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{result.student?.name}</td>
                      <td className="p-4 text-gray-600">{result.student?.email}</td>
                      <td className="p-4 text-gray-600">{result.exam?.title}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-sm font-medium">
                          {result.score}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(result.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;