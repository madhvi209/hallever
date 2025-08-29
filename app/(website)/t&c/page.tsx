/* eslint-disable react/no-unescaped-entities */
// /app/terms-and-conditions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// ===== Customize these constants =====
const COMPANY_NAME = "Hallever India Pvt. Ltd.";
const LEGAL_ENTITY = "Hallever India Pvt. Ltd.";
const WEBSITE_URL = "info@halleverindia.in";
const CONTACT_EMAIL = "customercare@halleverindia.com";
const CONTACT_PHONE = "+91-9468909306";
const CONTACT_ADDRESS = "Near Petrol Pump, Bansur Road, Kotputli, Rajasthan 303108";
const LAST_UPDATED = "August 26, 2025";

export const metadata: Metadata = {
    title: `Terms & Conditions | ${COMPANY_NAME}`,
    description:
        `The Terms and Conditions for using ${COMPANY_NAME}, an e‑commerce platform for lighting products. Learn about your rights, obligations, and usage rules.`,
    alternates: { canonical: `${WEBSITE_URL}/terms-and-conditions` },
    openGraph: {
        title: `Terms & Conditions | ${COMPANY_NAME}`,
        description:
            `The Terms and Conditions for using ${COMPANY_NAME}, an e‑commerce platform for lighting products. Learn about your rights, obligations, and usage rules.`,
        url: `${WEBSITE_URL}/terms-and-conditions`,
        siteName: COMPANY_NAME,
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function TermsAndConditionsPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                    <li>
                        <Link href="/" className="hover:underline">Home</Link>
                    </li>
                    <li aria-hidden>›</li>
                    <li className="text-gray-700">Terms & Conditions</li>
                </ol>
            </nav>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Terms & Conditions</h1>
                <p className="mt-2 text-gray-600">Last updated: {LAST_UPDATED}</p>
            </header>

            <article className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
                <p>
                    Welcome to <strong>{COMPANY_NAME}</strong>. These Terms and Conditions ("Terms") govern
                    your use of our website, services, and purchases of lighting products from
                    <a href={WEBSITE_URL} className="underline" target="_blank" rel="noopener noreferrer"> {WEBSITE_URL}</a>.
                    By accessing or using our Services, you agree to comply with these Terms.
                </p>

                <h2>1) Eligibility</h2>
                <p>
                    By using our Services, you confirm that you are at least 18 years old or have legal
                    parental/guardian consent. If you are accessing from outside India, you are responsible for
                    compliance with local laws.
                </p>

                <h2>2) Account Registration</h2>
                <ul>
                    <li>You may be required to create an account to access certain features (e.g., order history).</li>
                    <li>You agree to provide accurate, current, and complete information.</li>
                    <li>You are responsible for maintaining confidentiality of your account and password.</li>
                    <li>Notify us immediately of unauthorized use of your account.</li>
                </ul>

                <h2>3) Orders & Payments</h2>
                <ul>
                    <li>All orders are subject to acceptance and availability.</li>
                    <li>Prices are listed in INR and may include or exclude taxes as indicated.</li>
                    <li>We reserve the right to refuse or cancel orders at our discretion (fraud, stock issues, errors).</li>
                    <li>Payments are processed securely via third‑party gateways. We do not store full card details.</li>
                </ul>

                <h2>4) Shipping & Delivery</h2>
                <p>
                    We deliver products across India and may expand internationally. Estimated delivery times
                    are provided at checkout but are not guaranteed. We are not liable for delays beyond our
                    control (logistics strikes, natural disasters, etc.).
                </p>

                <h2>5) Returns & Refunds</h2>
                <p>
                    Please refer to our <Link href="/returns-policy" className="underline">Returns Policy</Link>
                    for details. In general, defective or damaged items may be returned within 2-3 days of
                    delivery. Refunds are processed to the original payment method subject to inspection and
                    approval.
                </p>

                <h2>6) Product Information</h2>
                <p>
                    We strive to display product colors, descriptions, and specifications accurately, but minor
                    variations may occur. We do not warrant that product descriptions or other content are
                    error‑free, complete, or current.
                </p>

                <h2>7) Intellectual Property</h2>
                <p>
                    All content on the website (text, graphics, logos, product images, videos, software) is the
                    property of {LEGAL_ENTITY} or licensors. You may not copy, reproduce, or exploit content
                    without written consent.
                </p>

                <h2>8) User Content</h2>
                <p>
                    By submitting reviews, images, or other content, you grant {COMPANY_NAME} a non‑exclusive,
                    royalty‑free, worldwide license to use, display, and distribute such content in connection
                    with our Services. You are responsible for ensuring your content does not infringe rights or
                    violate laws.
                </p>

                <h2>9) Prohibited Activities</h2>
                <ul>
                    <li>Using the Services for unlawful purposes.</li>
                    <li>Interfering with site security or infrastructure.</li>
                    <li>Uploading malicious code, viruses, or harmful material.</li>
                    <li>Reselling or misrepresenting products without authorization.</li>
                </ul>

                <h2>10) Disclaimer of Warranties</h2>
                <p>
                    Our Services are provided on an "as is" and "as available" basis. To the fullest extent
                    permitted by law, we disclaim all warranties (express or implied), including merchantability,
                    fitness for a particular purpose, and non‑infringement.
                </p>

                <h2>11) Limitation of Liability</h2>
                <p>
                    {COMPANY_NAME} shall not be liable for any indirect, incidental, or consequential damages
                    arising out of your use of the Services or purchase of products. Our total liability for any
                    claim shall not exceed the amount you paid for the product at issue.
                </p>

                <h2>12) Indemnification</h2>
                <p>
                    You agree to indemnify and hold harmless {COMPANY_NAME}, its directors, employees, and
                    partners from claims, liabilities, damages, or expenses arising from your use of the
                    Services or violation of these Terms.
                </p>

                <h2>13) Termination</h2>
                <p>
                    We may suspend or terminate your account and access to Services if you violate these Terms
                    or engage in fraudulent/illegal activity. Termination does not affect accrued obligations or
                    rights.
                </p>

                <h2>14) Governing Law & Jurisdiction</h2>
                <p>
                    These Terms are governed by the laws of India. Any disputes shall be subject to the
                    exclusive jurisdiction of the courts in Kotputli, Rajasthan.
                </p>

                <h2>15) Changes to Terms</h2>
                <p>
                    We may revise these Terms from time to time. Updates will be posted on this page with a new
                    "Last updated" date. Continued use of the Services constitutes acceptance of changes.
                </p>

                <h2>16) Contact Us</h2>
                <address className="not-italic">
                    <p className="m-0 font-medium">{LEGAL_ENTITY}</p>
                    <p className="m-0">{CONTACT_ADDRESS}</p>
                    <p className="m-0">
                        Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                    {CONTACT_PHONE && (
                        <p className="m-0">
                            Phone: <a className="underline" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
                        </p>
                    )}
                </address>

                <hr />
                <p className="text-xs text-gray-500">
                    <strong>Disclaimer:</strong> This page is a general template and does not constitute legal advice.
                    Laws vary by jurisdiction. Please consult legal counsel to adapt terms to your business,
                    especially regarding e‑commerce, consumer rights, and jurisdiction clauses.
                </p>
            </article>
        </main>
    );
}
