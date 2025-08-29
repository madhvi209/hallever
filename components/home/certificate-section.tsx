"use client"

import Image from "next/image";

type CertificateItem = {
    label: string;
    image: string; // image URL or path
};

export default function CertificateSection() {
    const items: CertificateItem[] = [
        {
            label: "Justdial Verified",
            image: "/certificates/justdial.png",
        },
        {
            label: "MSME Registered",
            image: "/certificates/msme.png",
        },
        {
            label: "IndiaMART Trusted",
            image: "/certificates/indiamart.png",
        },
        {
            label: "ISO 1900-2015",
            image: "/certificates/iso.webp",
        },
        {
            label: "Import-Export Licensed",
            image: "/certificates/import.webp",
        },
        {
            label: "BIS Certified",
            image: "/certificates/bis.png",
        },
        
        {
            label: "Trust Seal",
            image: "/certificates/trustseal.png",
        },
        
        
    ];

    // Increased image size from 96x96 to 144x144
    const imageSize = 144;

    return (
        <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                Certifications
            </h2>

            {/* Only images, proper size */}
            <div className="flex flex-row flex-wrap justify-center items-center gap-12">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="relative" style={{ width: imageSize, height: imageSize }}>
                            <Image
                                src={item.image}
                                alt={item.label}
                                width={imageSize}
                                height={imageSize}
                                className="object-contain"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}