"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
  selectApplications,
  selectApplicationsLoading,
  JobApplication,
} from "@/lib/redux/slice/jobApplicationsSlice";
import {
  fetchCareers,
  selectCareerList,
  Job,
} from "@/lib/redux/slice/careerSlice";
import { format } from "date-fns";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatDate(value?: string | Date): string {
  if (!value) return "-";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    return isNaN(date.getTime()) ? "-" : format(date, "PPPpp");
  } catch {
    return "-";
  }
}

export default function ApplicationsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const applications = useSelector((state: RootState) =>
    selectApplications(state)
  );
  const loading = useSelector((state: RootState) =>
    selectApplicationsLoading(state)
  );
  const careers = useSelector((state: RootState) => selectCareerList(state));

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [applicationToDelete, setApplicationToDelete] =
    useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<
    Omit<JobApplication, "resumeUrl" | "createdOn" | "updatedOn">
  >({
    id: "",
    name: "",
    email: "",
    phone: "",
    jobId: "",
    status: "Pending",
  });

  useEffect(() => {
    dispatch(fetchJobApplications());
    dispatch(fetchCareers());
  }, [dispatch]);

  const getJobTitle = (jobId: string) => {
    return careers.find((job: Job) => job.id === jobId)?.title || "-";
  };

  const handleEditClick = (app: JobApplication) => {
    setSelectedApp(app);
    setFormData({
      id: app.id || "",
      name: app.name,
      email: app.email,
      phone: app.phone,
      jobId: app.jobId,
      status: app.status,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateJobApplicationStatus(formData.id, formData.status));
    setSelectedApp(null);
    dispatch(fetchJobApplications());
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    await dispatch(deleteJobApplication(applicationToDelete.id!));
    setIsDeleting(false);
    setApplicationToDelete(null);
    dispatch(fetchJobApplications());
  };

  return (
    <div className="mx-auto p-0 flex flex-col gap-8">
      <h2
        className="text-xl font-bold text-[var(--primary-red)]"
        style={{ fontFamily: "var(--font-main)" }}
      >
        Job Applications
      </h2>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No applications found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white shadow rounded-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Job Title</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Resume</th>
                <th className="px-4 py-2 text-left">Applied On</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 transition border-b last:border-none"
                >
                  <td className="px-4 py-2">{getJobTitle(app.jobId)}</td>
                  <td className="px-4 py-2">{app.name}</td>
                  <td className="px-4 py-2">{app.email}</td>
                  <td className="px-4 py-2">{app.phone}</td>
                  <td className="px-4 py-2">
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{formatDate(app.createdOn)}</td>
                  <td className="px-4 py-2 capitalize">{app.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEditClick(app)}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setApplicationToDelete(app)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Application</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Name"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="Email"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                placeholder="Phone"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <select
                name="jobId"
                value={formData.jobId}
                onChange={(e) =>
                  setFormData({ ...formData, jobId: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Select Job</option>
                {careers.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as JobApplication["status"],
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="flex justify-between gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-[var(--primary-red)] text-white px-4 py-2 rounded text-sm"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Dialog
        open={!!applicationToDelete}
        onOpenChange={(open) => !open && setApplicationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--primary-red)]">
              {applicationToDelete?.name}
            </span>
            ? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
              Delete
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
