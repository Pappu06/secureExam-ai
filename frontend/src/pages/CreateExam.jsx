import { useState } from "react";
import API from "../services/api";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { MobileMenuButton } from "../components/admin/AdminSidebar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function CreateExam() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdExam, setCreatedExam] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    accessType: "private",
    allowReattempt: false,
    maxAttempts: 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        accessType: formData.accessType,
        allowReattempt: formData.allowReattempt,
        maxAttempts: formData.allowReattempt ? Number(formData.maxAttempts) : 1,
      };
      const response = await API.post("/exams/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreatedExam(response.data);
      setShowSuccessDialog(true);
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Create Exam</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create New Exam</h2>
            <p className="text-gray-500 mt-1">Set up a new examination with title, description, and duration.</p>
          </div>

          <Card className="max-w-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="title"
                label="Exam Title"
                placeholder="Enter exam title"
                onChange={handleChange}
                required
              />

              <div className="mb-5">
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the exam content and objectives"
                  onChange={handleChange}
                  rows={4}
                  className="bg-white border border-gray-300 rounded-lg w-full px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <Input
                type="number"
                name="duration"
                label="Duration (minutes)"
                placeholder="e.g. 60"
                onChange={handleChange}
                required
              />

              <div className="mb-6 mt-2 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-800">Exam Access</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose whether students need an exam code before starting.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    {
                      value: "private",
                      title: "Private Exam",
                      description: "Generate an exam code for invited students.",
                    },
                    {
                      value: "public",
                      title: "Public Exam",
                      description: "No exam code is generated or required.",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                        formData.accessType === option.value
                          ? "border-blue-900 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accessType"
                        value={option.value}
                        checked={formData.accessType === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            formData.accessType === option.value
                              ? "border-blue-900"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.accessType === option.value && (
                            <span className="w-2 h-2 rounded-full bg-blue-900" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {option.title}
                        </span>
                      </span>
                      <span className="block text-xs text-gray-500 mt-2 pl-7 leading-relaxed">
                        {option.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Re-attempt Configuration */}
              <div className="mb-6 mt-2 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Allow Re-attempts</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enable students to retake this exam multiple times
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowReattempt"
                      checked={formData.allowReattempt}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900" />
                  </label>
                </div>

                {/* Max Attempts Selector (visible when re-attempt is enabled) */}
                {formData.allowReattempt && (
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <label className="block mb-2.5 text-sm font-semibold text-gray-700">
                      Maximum Attempts
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select how many times a student can attempt this exam (1 to 3)
                    </p>
                    <div className="flex gap-3">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, maxAttempts: num })}
                          className={`w-14 h-14 rounded-xl border-2 text-lg font-bold transition-all duration-200 flex items-center justify-center ${
                            Number(formData.maxAttempts) === num
                              ? "border-blue-900 bg-blue-900 text-white shadow-md"
                              : "border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {Number(formData.maxAttempts) === 1
                        ? "Students get 1 attempt (same as no re-attempt)"
                        : `Students can attempt this exam up to ${formData.maxAttempts} times`}
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={submitting}
                className="mt-2"
              >
                {submitting ? "Creating..." : "Create Exam"}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Success Modal with Exam Code */}
      {showSuccessDialog && createdExam && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setShowSuccessDialog(false);
              navigate("/admin");
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Exam Created Successfully</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {createdExam.accessType === "public"
                    ? "This is a public exam. Students can start it without entering an exam code."
                    : "Share the exam code below with your students so they can access the exam."}
                </p>
              </div>

              {/* Exam Code Display */}
              <div className="px-6 pb-4">
                {createdExam.accessType === "public" ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider mb-2">
                      Public Exam
                    </p>
                    <p className="text-sm text-emerald-800 font-medium">
                      No exam code generated
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Exam Code</p>
                      <p className="text-3xl font-mono font-bold text-blue-900 tracking-[0.3em]">{createdExam.examCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdExam.examCode);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all duration-200"
                    >
                      {codeCopied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                          </svg>
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate("/admin");
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CreateExam;
