"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
    fetchServices,
    selectServices,
    selectIsLoading,
    deleteService,
} from "@/lib/redux/slice/serviceSlice";
import ServiceModal from "./serviceModal";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Plus, Search, Trash } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ServiceItem } from "@/lib/redux/slice/serviceSlice"; 

const ServicesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const services = useSelector(selectServices);
    const loading = useSelector(selectIsLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<ServiceItem | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    const openAddModal = () => {
        setEditItem(null);
        setModalOpen(true);
    };

    const openEditModal = (service: ServiceItem) => {
        setEditItem(service);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure?")) dispatch(deleteService(id));
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="mx-auto p-0 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
                <h2
                    className="text-xl font-bold text-[var(--primary-red)]"
                    style={{ fontFamily: "var(--font-main)" }}
                >
                    Services
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
                    <div className="relative w-full sm:w-72">
                        <Input
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                        onClick={openAddModal}
                        className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
                    >
                        <Plus className="w-4 h-4" /> Add Service
                    </Button>
                </div>
            </div>

            {loading ? (
                <Loader2 className="animate-spin" />
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white p-4 rounded shadow"
                        >
                            {service.images?.[0] && (
                                <Image
                                    src={service.images[0]}
                                    alt="service"
                                    width={300}
                                    height={200}
                                    className="rounded mb-2 object-cover"
                                />
                            )}
                            <h2 className="font-semibold text-lg">
                                {service.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {service.description}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    size="sm"
                                    onClick={() => openEditModal(service)}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(service.id!)}
                                >
                                    <Trash size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <ServiceModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    editItem={editItem}
                />
            )}
        </div>
    );
};

export default ServicesPage;
