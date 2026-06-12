import { useState } from "react";
import { deleteExam, updateExam } from "../../services/adminService";
import EditExamModal from "./EditExamModal";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";

const getExamAccessType = (exam) => exam.accessType || "public";

function ExamManagementTable({ exams, refreshExams }) {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const confirmDelete = async () => {
    if (!examToDelete) return;
    try {
      await deleteExam(examToDelete);
      refreshExams();
    } catch (error) {
      console.log(error);
    } finally {
      setExamToDelete(null);
    }
  };

  const handleSave = async (updatedExam) => {
    try {
      await updateExam(selectedExam._id, updatedExam);
      setSelectedExam(null);
      refreshExams();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-gov">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Exam
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Exam Code
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Access
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Re-attempts
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr
                  key={exam._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-gray-900 font-medium">{exam.title}</td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        if (getExamAccessType(exam) === "public" || !exam.examCode) return;
                        navigator.clipboard.writeText(exam.examCode);
                        setCopiedCode(exam._id);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      disabled={getExamAccessType(exam) === "public" || !exam.examCode}
                      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-all duration-200 ${
                        getExamAccessType(exam) === "public" || !exam.examCode
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                          : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 cursor-pointer"
                      }`}
                      title={getExamAccessType(exam) === "public" ? "Public exams do not use codes" : "Click to copy"}
                    >
                      {getExamAccessType(exam) === "public" || !exam.examCode ? "No code" : exam.examCode}
                      {copiedCode === exam._id ? (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        getExamAccessType(exam) === "public"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {getExamAccessType(exam) === "public" ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{exam.duration} mins</td>
                  <td className="p-4">
                    {exam.allowReattempt ? (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                        </svg>
                        {exam.maxAttempts} attempts
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedExam(exam)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger-ghost"
                        size="sm"
                        onClick={() => setExamToDelete(exam._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExam && (
        <EditExamModal
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Exam?"
        message="Are you sure you want to delete this exam? All associated questions and results will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
}

export default ExamManagementTable;
