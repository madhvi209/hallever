'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { addJobApplication } from '@/lib/redux/slice/jobApplicationsSlice';

interface ApplyModalProps {
    open: boolean;
    onClose: () => void;
    jobTitle: string;
    jobId: string;
}

export default function ApplyModal({ open, onClose, jobTitle, jobId }: ApplyModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector((state: RootState) => state.jobApplication.loading);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        resume: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.phone || !form.resume) {
            alert('Please fill all fields and upload your resume.');
            return;
        }

        const formData = new FormData();
        formData.append('jobId', jobId);
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('resume', form.resume);

        await dispatch(addJobApplication(formData));
        onClose(); // Close modal after submission
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Apply for <span className="text-red-600">{jobTitle}</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Full Name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                        placeholder="Email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <Input
                        placeholder="Phone Number"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <Input
                        type="file"
                        accept=".pdf"
                        required
                        onChange={(e) => setForm({ ...form, resume: e.target.files?.[0] ?? null })}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
