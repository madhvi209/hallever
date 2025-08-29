/* eslint-disable react/no-unescaped-entities */
// /app/privacy-policy/page.tsx
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
    title: `Privacy Policy | ${COMPANY_NAME}`,
    description:
        `${COMPANY_NAME}'s privacy policy describing how we collect, use, and protect your personal data when you browse, purchase lighting products, or interact with our services.`,
    alternates: { canonical: `${WEBSITE_URL}/privacy-policy` },
    openGraph: {
        title: `Privacy Policy | ${COMPANY_NAME}`,
        description:
            `${COMPANY_NAME}'s privacy policy describing how we collect, use, and protect your personal data when you browse, purchase lighting products, or interact with our services.`,
        url: `${WEBSITE_URL}/privacy-policy`,
        siteName: COMPANY_NAME,
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                    <li>
                        <Link href="/" className="hover:underline">Home</Link>
                    </li>
                    <li aria-hidden>›</li>
                    <li className="text-gray-700">Privacy Policy</li>
                </ol>
            </nav>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
                <p className="mt-2 text-gray-600">Last updated: {LAST_UPDATED}</p>
            </header>

            <article className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
                <p>
                    This Privacy Policy explains how <strong>{LEGAL_ENTITY}</strong> ("{COMPANY_NAME}", "we",
                    "us", or "our") collects, uses, discloses, and safeguards your information when you
                    visit <a href={WEBSITE_URL} className="underline" target="_blank" rel="noopener noreferrer">{WEBSITE_URL}</a>,
                    use our mobile or web services, create an account, or purchase lighting products and
                    accessories (collectively, the "Services").
                </p>

                <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="m-0">
                        <strong>Quick summary:</strong> We collect data to process orders, provide support, personalize
                        your shopping experience, and comply with law. We never sell your personal data. You can
                        access, correct, or delete your data and control marketing preferences at any time.
                    </p>
                </div>

                <h2>1) Scope & Controller</h2>
                <p>
                    This policy applies to personal data processed by {LEGAL_ENTITY} as the data controller for
                    the Services. If you access third-party websites or apps through our Services (for example,
                    payment gateways or logistics tracking pages), their privacy practices apply.
                </p>

                <h2>2) Information We Collect</h2>
                <h3>2.1 Information you provide to us</h3>
                <ul>
                    <li>
                        <strong>Account & Profile:</strong> name, email address, phone number, shipping & billing
                        address, password, and preferences.
                    </li>
                    <li>
                        <strong>Orders & Payments:</strong> items purchased, order value, transaction timestamps,
                        and payment status. <em>We do not store full card details</em>. Card data is handled by our
                        PCI-DSS compliant payment partners.
                    </li>
                    <li>
                        <strong>Support & Communications:</strong> messages, call recordings (if any), chat and
                        email content, feedback, and survey responses.
                    </li>
                    <li>
                        <strong>Content:</strong> product reviews, photos, or other content you submit.
                    </li>
                </ul>

                <h3>2.2 Information collected automatically</h3>
                <ul>
                    <li>
                        <strong>Device & Usage:</strong> IP address, device identifiers, browser type, operating
                        system, referring URLs, pages viewed, clicks, session duration, and approximate location
                        (city/country level) derived from IP.
                    </li>
                    <li>
                        <strong>Cookies & Similar Technologies:</strong> cookies, pixels, and local storage to
                        enable essential site features (cart, login), analytics, and personalization. See the
                        <Link href="#cookies"> Cookies section</Link>.
                    </li>
                </ul>

                <h3>2.3 Information from third parties</h3>
                <ul>
                    <li>
                        <strong>Payments:</strong> confirmation of payment (success/failure), masked card details,
                        and fraud signals from payment processors (e.g., Razorpay/Stripe/etc.).
                    </li>
                    <li>
                        <strong>Logistics:</strong> shipment status and delivery confirmations from couriers.
                    </li>
                    <li>
                        <strong>Marketing & Social:</strong> campaign performance data and audience attributes (in
                        aggregate) from ad platforms and social networks, subject to their policies and your
                        settings.
                    </li>
                </ul>

                <h2>3) How We Use Your Information</h2>
                <ul>
                    <li>Process and fulfill orders; provide invoices, shipping, delivery, and returns.</li>
                    <li>Create and manage your account; remember your cart and preferences.</li>
                    <li>Provide customer support and respond to queries.</li>
                    <li>Personalize product recommendations and on-site experience.</li>
                    <li>Send service messages (order updates, security alerts) and—if you opt in—promotional communications.</li>
                    <li>Conduct analytics, improve our catalog, site performance, and security.</li>
                    <li>Detect, prevent, and investigate fraud, abuse, or illegal activities.</li>
                    <li>Comply with legal obligations and enforce our terms and policies.</li>
                </ul>

                <h2 id="legal-basis">4) Legal Bases (GDPR/UK GDPR, where applicable)</h2>
                <ul>
                    <li><strong>Contract:</strong> to process your orders and provide the Services.</li>
                    <li><strong>Legitimate interests:</strong> to secure our Services, prevent fraud, and improve products.</li>
                    <li><strong>Consent:</strong> for optional cookies/analytics/marketing and where required by law.</li>
                    <li><strong>Legal obligation:</strong> for tax, accounting, and compliance requirements.</li>
                </ul>

                <h2>5) Sharing & Disclosure</h2>
                <p>We share data with trusted service providers under confidentiality and data processing terms:</p>
                <ul>
                    <li><strong>Payment processors</strong> for secure transactions (we do not store full card data).</li>
                    <li><strong>Logistics partners</strong> to deliver your orders and handle returns.</li>
                    <li><strong>Cloud & hosting providers</strong> to run our website and databases.</li>
                    <li><strong>Analytics & marketing platforms</strong> (aggregate or pseudonymous data where possible).</li>
                    <li><strong>Professional advisors</strong> (lawyers, auditors) as needed.</li>
                    <li><strong>Authorities</strong> when required by law or to protect rights, safety, and security.</li>
                    <li>
                        <strong>Business transfers:</strong> in case of a merger, acquisition, or asset sale, data may
                        be transferred under appropriate safeguards.
                    </li>
                </ul>

                <h2 id="cookies">6) Cookies & Tracking Technologies</h2>
                <p>
                    We use <strong>essential cookies</strong> (for login, cart, checkout) and, with consent where
                    required, <strong>analytics</strong> and <strong>advertising cookies</strong> to understand usage
                    and measure campaigns. You can manage preferences via our cookie banner or your browser
                    settings. Blocking essential cookies may impair site functionality.
                </p>

                <h2>7) Advertising & Analytics</h2>
                <p>
                    We may use analytics tools (e.g., Google Analytics) and ad partners (e.g., Meta, Google Ads)
                    to measure performance and show relevant offers. These partners may set cookies or read your
                    device identifiers. Where required, we obtain your consent. You can opt out via our cookie
                    settings or your platform/account settings.
                </p>

                <h2>8) Payments</h2>
                <p>
                    Payments are processed by third-party providers (e.g., Razorpay/Stripe/Paytm). {COMPANY_NAME}
                    does not store full card details. Providers may process your data as independent controllers
                    according to their privacy policies.
                </p>

                <h2>9) Data Retention</h2>
                <p>
                    We retain personal data only as long as necessary for the purposes described in this policy,
                    including meeting legal, accounting, or reporting requirements. Typical retention periods:
                </p>
                <ul>
                    <li>Account data: for the life of the account and a reasonable period after closure.</li>
                    <li>Order & invoice data: kept for statutory tax/accounting periods.</li>
                    <li>Support tickets: typically 24 months unless required longer.</li>
                    <li>Marketing preferences: until you opt out or withdraw consent.</li>
                </ul>

                <h2>10) Security</h2>
                <p>
                    We implement administrative, technical, and physical safeguards to protect personal data,
                    including encryption in transit (HTTPS), access controls, monitoring, and regular reviews. No
                    method of transmission or storage is 100% secure; we work continuously to improve our
                    protections.
                </p>

                <h2>11) International Transfers</h2>
                <p>
                    If we transfer your data outside your country, we use lawful transfer mechanisms (e.g.,
                    standard contractual clauses) and require appropriate safeguards from our providers.
                </p>

                <h2>12) Your Rights & Choices</h2>
                <p>
                    Depending on your location, you may have rights to access, correct, delete, or port your
                    data; object to or restrict processing; and withdraw consent. You can also unsubscribe from
                    marketing at any time using the link in our emails or by contacting us.
                </p>
                <ul>
                    <li>
                        <strong>Access/Rectification/Deletion:</strong> Email us at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                    </li>
                    <li>
                        <strong>Marketing Opt‑out:</strong> Use in‑email unsubscribe links or adjust your account preferences.
                    </li>
                    <li>
                        <strong>Cookie Choices:</strong> Update settings via our cookie banner or your browser.
                    </li>
                </ul>

                <h3>12.1 India (DPDP Act)</h3>
                <p>
                    If you are in India, you may exercise rights under the Digital Personal Data Protection Act,
                    2023 (DPDP), including the right to access, correct, and erase your personal data and to
                    grievance redressal. You can reach our Grievance Officer/DPO at the contact details below.
                </p>

                <h3>12.2 EEA/UK (GDPR/UK GDPR)</h3>
                <p>
                    You may request access, correction, deletion, restriction, or portability of your personal
                    data and object to processing based on legitimate interests or direct marketing at any time.
                </p>

                <h2>13) Children’s Privacy</h2>
                <p>
                    Our Services are not directed to children under the age required by applicable law (typically
                    13 or 16). We do not knowingly collect data from children. If you believe a child has
                    provided us personal data, contact us to request deletion.
                </p>

                <h2>14) User‑Generated Content</h2>
                <p>
                    Reviews and photos you submit may be visible publicly. Do not share sensitive personal
                    information in public content.
                </p>

                <h2>15) Third‑Party Links</h2>
                <p>
                    Our website may link to third‑party sites. We are not responsible for their privacy practices.
                    Please review their policies.
                </p>

                <h2>16) Changes to This Policy</h2>
                <p>
                    We may update this policy to reflect changes in our practices or legal requirements. We will
                    post the updated version with a new "Last updated" date and, where appropriate, notify you via
                    email or an in‑site notice.
                </p>

                <h2>17) Contact Us</h2>
                <address className="not-italic">
                    <p className="m-0 font-medium">{LEGAL_ENTITY}</p>
                    <p className="m-0">Attn: {CONTACT_EMAIL}</p>
                    {CONTACT_ADDRESS && <p className="m-0">{CONTACT_ADDRESS}</p>}
                    <p className="m-0">
                        Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                    {CONTACT_PHONE && (
                        <p className="m-0">
                            Phone: <a className="underline" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
                        </p>
                    )}
                </address>

                <h2>18) Grievance Officer (India)</h2>
                <p>
                    For DPDP-related queries or complaints, contact our Grievance Officer at
                    <a className="underline" href={`mailto:${CONTACT_EMAIL}`}> {CONTACT_EMAIL}</a>.
                </p>

                <h2>19) Additional Disclosures (CCPA/CPRA – California)</h2>
                <p>
                    We do not sell personal information. We may share limited data for cross‑context behavioral
                    advertising or analytics, which you can opt out of where required. California residents may
                    exercise rights to know, delete, correct, and limit use of sensitive personal information by
                    contacting us.
                </p>

                <hr />
                <p className="text-xs text-gray-500">
                    <strong>Disclaimer:</strong> This page is a general template and does not constitute legal advice.
                    Laws vary by jurisdiction. Please consult legal counsel to tailor this policy to your specific
                    operations, especially regarding cookies, cross‑border transfers, and sector‑specific rules.
                </p>
            </article>
        </main>
    );
}
