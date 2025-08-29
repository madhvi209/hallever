"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createCareer,
    fetchCareers,
    Job,
    deleteCareer,
    selectCareer,
    updateCareer,
} from "@/lib/redux/slice/careerSlice";
import { Input } from "@/components/ui/input";
import { AppDispatch, RootState } from "@/lib/redux/store";
import CareerModal from "./careerModal";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

export default function CareersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [deleteJobItem, setDeleteJobItem] = useState<Job | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null); // store job id if deleting
    const [saving, setSaving] = useState(false); // loader for add/update
    const [updatingJobId, setUpdatingJobId] = useState<string | null>(null); // loader for update job

    const careers = useSelector((state: RootState) => state.careers.careers);
    const loading = useSelector((state: RootState) => state.careers.isLoading);

    useEffect(() => {
        dispatch(fetchCareers());
    }, [dispatch]);

    const filteredCareers = useMemo(
        () =>
            careers.filter((c) =>
                c.title.toLowerCase().includes(search.toLowerCase())
            ),
        [careers, search]
    );

    const handleAdd = () => {
        dispatch(selectCareer(null));
        setSelectedJob(null);
        setIsModalOpen(true);
    };

    const handleEdit = (careerId: string) => {
        const career = careers.find((c) => c.id === careerId);
        if (career) {
            dispatch(selectCareer(career));
            setSelectedJob(career);
            setIsModalOpen(true);
        }
    };

    // Add loader to add/update
    const handleSave = async (data: Job) => {
        setSaving(true);
        try {
            if (selectedJob) {
                setUpdatingJobId(selectedJob.id!);
                await dispatch(updateCareer({ ...data, id: selectedJob.id }));
                setUpdatingJobId(null);
            } else {
                await dispatch(createCareer(data));
            }
            setIsModalOpen(false);
            setSelectedJob(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteJobItem) return;
        setDeleting(deleteJobItem.id);
        await dispatch(deleteCareer(deleteJobItem.id));
        setDeleting(null);
        setDeleteJobItem(null);
    };

    return (
        <div className="mx-auto p-0 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
                <h2
                    className="text-xl font-bold text-[var(--primary-red)]"
                    style={{ fontFamily: "var(--font-main)" }}
                >
                    Careers
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
                    <div className="relative w-full sm:w-72">
                        <Input
                            placeholder="Search Jobs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
                    >
                        <Plus className="w-4 h-4" /> Add Job
                    </Button>
                </div>
            </div>

            {loading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : filteredCareers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No Job found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm text-left bg-white shadow rounded-md">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Department</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCareers.map((job) => (
                                <tr key={job.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{job.title}</td>
                                    <td className="px-4 py-2">{job.department}</td>
                                    <td className="px-4 py-2">{job.location}</td>
                                    <td className="px-4 py-2">{job.type}</td>
                                    <td className="px-4 py-2 capitalize">{job.status}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            onClick={() => handleEdit(job.id!)}
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                            disabled={!!deleting || updatingJobId === job.id}
                                        >
                                            {updatingJobId === job.id && (
                                                <Loader2 className="w-4 h-4 animate-spin inline-block" />
                                            )}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteJobItem(job)}
                                            className="text-red-600 hover:underline flex items-center gap-1"
                                            disabled={!!deleting}
                                        >
                                            {deleting === job.id && (
                                                <Loader2 className="w-4 h-4 animate-spin inline-block" />
                                            )}
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <CareerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    editItem={selectedJob}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteJobItem}
                onOpenChange={(open) => !open && setDeleteJobItem(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Job</DialogTitle>
                    </DialogHeader>
                    <div>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-[var(--primary-red)]">
                            {deleteJobItem?.title}
                        </span>
                        ?
                    </div>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!!deleting}
                            className="gap-2"
                        >
                            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Delete
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={!!deleting}>
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
