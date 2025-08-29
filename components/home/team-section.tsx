"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { AppDispatch } from "@/lib/redux/store";
import { fetchTeam, selectTeam, selectTeamLoading } from "@/lib/redux/slice/teamSlice";

interface TeamMember {
    id: string;
    name: string;
    position: string;
    bio?: string;
    image?: string;
}

// Container animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

// Card animation variants
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as unknown as "easeInOut" },
    },
};

export default function TeamMembers() {
    const dispatch = useDispatch<AppDispatch>();
    const team = useSelector(selectTeam) || [];
    const loading = useSelector(selectTeamLoading);

    useEffect(() => {
        dispatch(fetchTeam());
    }, [dispatch]);

    return (
        <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold text-black mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        Meet{" "}
                        <span className="text-transparent bg-clip-text bg-[var(--primary-red)] pt-3">
                            Our Team
                        </span>
                    </motion.h2>
                    <motion.div
                        className="w-24 h-1 bg-red-500 mx-auto"
                        initial={{ width: 0 }}
                        whileInView={{ width: 96 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                    />
                </div>

                {/* Loader */}
                {loading && <p className="text-center text-gray-500">Loading team members...</p>}

                {/* Empty State */}
                {!loading && team.length === 0 && (
                    <p className="text-center text-gray-400">No team members found.</p>
                )}

                {/* Team Grid */}
                {!loading && team.length > 0 && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {team.map((member: TeamMember) => (
                            <motion.div
                                key={member.id}
                                className="group cursor-pointer"
                                variants={cardVariants}
                                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                            >
                                <div className="bg-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                                    {/* Image Container */}
                                    <div className="aspect-square relative overflow-hidden">
                                        <Image
                                            src={member.image ? member.image : "/placeholder.svg"}
                                            alt={member.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 text-center">
                                        <h3 className="font-bold text-red-700 text-lg mb-1 leading-tight">
                                            {member.name}
                                        </h3>
                                        <p className="text-red-400 text-sm font-medium">{member.position}</p>
                                        {typeof window !== "undefined" && window.location.pathname === "/about" && (
                                            <p className="text-gray-700 text-sm font-medium">
                                                {member.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
