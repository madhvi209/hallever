"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchOffer, deleteOffer, selectOffer, selectIsLoading, Offer} from "@/lib/redux/slice/offerSlice";
import { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Plus,  Edit,  Trash2,  Search,  Loader2,  Gift,} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import OfferModal from "./offerModal"; 

export default function OfferPage() {
    const dispatch = useDispatch<AppDispatch>();
    const offer = useSelector(selectOffer);
    const isLoading = useSelector(selectIsLoading);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editOffer, setEditOffer] = useState<Offer | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchOffer());
    }, [dispatch]);

    const isMatched = useMemo(() => {
        if (!offer) return false;
        return offer.title.toLowerCase().includes(search.toLowerCase());
    }, [offer, search]);

    const handleDelete = async () => {
        setLoading(true);
        await dispatch(deleteOffer());
        toast.success("Offer deleted!");
        setDeleteConfirm(false);
        setLoading(false);
    };

    return (
        <div className="mx-auto p-0 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-[var(--primary-red)]" style={{ fontFamily: "var(--font-main)" }}>
                    Offer
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
                    <div className="relative w-full sm:w-72">
                        <Input
                            placeholder="Search offer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                        onClick={() => {
                            setEditOffer(offer || null);
                            setModalOpen(true);
                        }}
                        className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
                    >
                        <Plus className="w-4 h-4" /> {offer ? "Edit Offer" : "Add Offer"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center text-gray-400 py-12">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                ) : !offer || !isMatched ? (
                    <div className="col-span-full text-center text-gray-400 py-12">
                        No offer found.
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-center h-48 bg-gray-100 text-yellow-600">
                            <Gift className="h-16 w-16" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-main)" }}>
                                    {offer.title}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{offer.description}</p>
                                <span className="text-xs text-gray-500">Code: <b>{offer.code}</b></span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditOffer(offer);
                                        setModalOpen(true);
                                    }}
                                    className="cursor-pointer text-[var(--primary-red)]"
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteConfirm(true)}
                                    className="text-destructive cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <OfferModal open={modalOpen} setOpen={setModalOpen} editOffer={editOffer} />

            <Dialog open={deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Offer</DialogTitle>
                    </DialogHeader>
                    <div>
                        Are you sure you want to delete the current offer?
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2 cursor-pointer">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={loading}>
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
