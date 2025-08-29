/* eslint-disable react/no-unescaped-entities */
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
    title: `Return & Refund Policy | ${COMPANY_NAME}`,
    description:
        `Return & Refund Policy for ${COMPANY_NAME} describing the terms and conditions for returns, replacements, and refunds for purchases made through our platform.`,
    alternates: { canonical: `${WEBSITE_URL}/return-refund-policy` },
    openGraph: {
        title: `Return & Refund Policy | ${COMPANY_NAME}`,
        description:
            `Return & Refund Policy for ${COMPANY_NAME} describing the terms and conditions for returns, replacements, and refunds for purchases made through our platform.`,
        url: `${WEBSITE_URL}/return-refund-policy`,
        siteName: COMPANY_NAME,
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function ReturnRefundPolicyPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                    <li>
                        <Link href="/" className="hover:underline">Home</Link>
                    </li>
                    <li aria-hidden>›</li>
                    <li className="text-gray-700">Return & Refund Policy</li>
                </ol>
            </nav>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Return & Refund Policy</h1>
                <p className="mt-2 text-gray-600">Last updated: {LAST_UPDATED}</p>
            </header>

            <article className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
                <p>
                    At <strong>{LEGAL_ENTITY}</strong> ("{COMPANY_NAME}", "we", "us", or "our"), we are committed to delivering high-quality products and ensuring complete customer satisfaction. This Return & Refund Policy outlines the terms and conditions governing returns, replacements, and refunds for purchases made through our platform.
                </p>
                <p>
                    By placing an order with us, you agree to comply with the following policies. Please read them carefully before initiating a return or refund request.
                </p>

                <h2>1. Eligibility for Returns & Replacements</h2>
                <h3>1.1 General Return Policy</h3>
                <ul>
                    <li>Returns or replacements must be requested within <strong>15 days</strong> of product delivery.</li>
                    <li>To qualify for a return/replacement, the product must:
                        <ul>
                            <li>Be unused, undamaged, and in its original packaging (including all accessories, labels, and tags).</li>
                            <li>Be accompanied by a valid proof of purchase (Order ID/Invoice).</li>
                            <li>Fall under one of the following categories:
                                <ul>
                                    <li>Defective or damaged upon arrival.</li>
                                    <li>Incorrect item shipped.</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                <h3>1.2 Products Without Warranty</h3>
                <ul>
                    <li>Eligible for return, refund, or replacement within 15 days of delivery.</li>
                    <li>Refunds are processed only after inspection and approval.</li>
                    <li>Return shipping costs may be covered by {LEGAL_ENTITY} only if the return is due to our error (wrong/damaged item).</li>
                </ul>

                <h3>1.3 Products with Warranty</h3>
                <ul>
                    <li>Not eligible for refunds—only warranty-based replacements.</li>
                    <li>Covered under manufacturer warranty for defects arising during normal use.</li>
                    <li>Warranty claims require verification and product inspection.</li>
                    <li>Void if:
                        <ul>
                            <li>Product is misused, improperly installed, or tampered with.</li>
                            <li>Damage is due to accidents, water exposure, or unauthorized repairs.</li>
                        </ul>
                    </li>
                </ul>

                <h2>2. Non-Returnable Items</h2>
                <p>The following items cannot be returned or refunded:</p>
                <ul>
                    <li>Products marked as “Final Sale” or “Non-Returnable”.</li>
                    <li>Items damaged due to:
                        <ul>
                            <li>Customer misuse, improper installation, or negligence.</li>
                            <li>Unauthorized modifications or repairs.</li>
                        </ul>
                    </li>
                </ul>

                <h2>3. How to Initiate a Return/Replacement</h2>
                <h3>Step 1: Contact Customer Support</h3>
                <ul>
                    <li>
                        <span role="img" aria-label="email">📧</span> Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </li>
                    <li>
                        <span role="img" aria-label="phone">📞</span> Phone: <a className="underline" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
                    </li>
                    <li>Provide:
                        <ul>
                            <li>Order details (Order ID, Invoice)</li>
                            <li>Reason for return/replacement</li>
                            <li>Images/videos (if product is defective/damaged)</li>
                        </ul>
                    </li>
                </ul>

                <h3>Step 2: Return Authorization & Shipping</h3>
                <ul>
                    <li>Our team will verify eligibility and provide:
                        <ul>
                            <li>Return authorization number (RMA) (if applicable).</li>
                            <li>Return shipping instructions (pickup or self-ship).</li>
                        </ul>
                    </li>
                    <li>Customer bears return shipping costs unless the return is due to our error.</li>
                </ul>

                <h3>Step 3: Inspection & Resolution</h3>
                <ul>
                    <li>Upon receipt, we will inspect the product within 3-5 business days.</li>
                    <li>If approved:
                        <ul>
                            <li><strong>Refund:</strong> Processed within 5-7 business days to the original payment method.</li>
                            <li><strong>Replacement:</strong> Shipped within 3-5 business days (subject to stock availability).</li>
                        </ul>
                    </li>
                </ul>

                <h2>4. Refund Policy</h2>
                <ul>
                    <li>Refunds are issued only after return inspection and approval.</li>
                    <li>Original shipping charges are non-refundable (unless the return is due to our error).</li>
                    <li>Refunds may take 5-7 business days to reflect in your account (varies by payment method).</li>
                </ul>

                <h2>5. Warranty Claims</h2>
                <ul>
                    <li>For warranty-covered defects, contact us within the warranty period.</li>
                    <li>Provide:
                        <ul>
                            <li>Proof of purchase.</li>
                            <li>Description of the issue.</li>
                            <li>Supporting images/videos.</li>
                        </ul>
                    </li>
                    <li>We may require the product to be returned for inspection before replacement.</li>
                </ul>

                <h2>6. Contact Us</h2>
                <address className="not-italic">
                    <p className="m-0 font-medium">{LEGAL_ENTITY}</p>
                    {CONTACT_ADDRESS && <p className="m-0">{CONTACT_ADDRESS}</p>}
                    <p className="m-0">
                        <span role="img" aria-label="email">📧</span> Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                    {CONTACT_PHONE && (
                        <p className="m-0">
                            <span role="img" aria-label="phone">📞</span> Phone: <a className="underline" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
                        </p>
                    )}
                    <p className="m-0">Business Hours: [Mon-Sat, 9 AM – 6 PM IST]</p>
                </address>

                <h2>Note</h2>
                <ul>
                    <li>{LEGAL_ENTITY} reserves the right to modify this policy without prior notice.</li>
                    <li>Fraudulent returns will be rejected, and legal action may be taken if necessary.</li>
                </ul>
            </article>
        </main>
    );
}
