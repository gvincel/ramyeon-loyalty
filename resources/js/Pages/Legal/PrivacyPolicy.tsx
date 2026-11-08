import { Head, Link } from '@inertiajs/react';

const sections = [
    {
        title: '1. Information We Collect',
        content: (
            <>
                <p>
                    Ramyeon Corner's Loyalty Management System processes the
                    following information:
                </p>
                <ul>
                    <li>
                        <strong>Customer account information:</strong> first
                        name, last name, phone number, optional email address,
                        customer code, and password.
                    </li>
                    <li>
                        <strong>QR code information:</strong> a unique QR token
                        associated with a customer account, including its active
                        or revoked status.
                    </li>
                    <li>
                        <strong>Purchase and loyalty records:</strong> receipt
                        number, purchase amount, points earned, points used,
                        point balance, reward redemption details, and related
                        dates.
                    </li>
                    <li>
                        <strong>Feedback:</strong> optional rating and submitted
                        message, associated with the customer's account.
                    </li>
                    <li>
                        <strong>Staff account information:</strong> staff name,
                        username or email address, account role, and account
                        status.
                    </li>
                </ul>
                <p>
                    Passwords are stored as secure password hashes rather than
                    readable plain-text passwords.
                </p>
            </>
        ),
    },
    {
        title: '2. How We Use Information',
        content: (
            <>
                <p>
                    Information is used for legitimate operation and management
                    of the loyalty program, including to:
                </p>
                <ul>
                    <li>Create and manage customer and staff accounts.</li>
                    <li>
                        Verify customer accounts and identify loyalty records
                        through QR codes.
                    </li>
                    <li>Record purchases and calculate loyalty points.</li>
                    <li>Process reward redemptions and point adjustments.</li>
                    <li>Receive and review customer feedback.</li>
                    <li>
                        Maintain system security, prevent unauthorized activity,
                        and investigate operational issues.
                    </li>
                    <li>
                        Maintain transaction records and administrative audit
                        records.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: '3. Access to Information',
        content: (
            <>
                <p>
                    Access is limited according to staff responsibilities and
                    account permissions.
                </p>
                <ul>
                    <li>
                        Authorized administrators manage system records and
                        administrative functions.
                    </li>
                    <li>
                        Authorized cashiers access customer and transaction
                        information needed to operate the loyalty program.
                    </li>
                    <li>
                        Customers can access their own account and loyalty
                        information through their customer account.
                    </li>
                </ul>
                <p>
                    We do not make customer account information publicly
                    available.
                </p>
            </>
        ),
    },
    {
        title: '4. Sharing and Disclosure',
        content: (
            <>
                <p>
                    Personal information may be accessed by authorized personnel
                    and service providers when necessary to operate, maintain,
                    or secure the system.
                </p>
                <p>
                    Information may also be disclosed when required by
                    applicable law or a valid legal request. We do not intend to
                    sell customer personal information.
                </p>
            </>
        ),
    },
    {
        title: '5. Storage and Retention',
        content: (
            <>
                <p>
                    Information is maintained in the system's database and
                    related operational records. It is retained only for as long
                    as reasonably necessary for the purposes described in this
                    policy, legitimate business requirements, and applicable
                    legal obligations.
                </p>
                <p>
                    When information is no longer required, it should be
                    securely deleted or anonymized where appropriate, subject to
                    applicable recordkeeping obligations and technical
                    limitations.
                </p>
            </>
        ),
    },
    {
        title: '6. Security',
        content: (
            <>
                <p>
                    We use safeguards intended to protect information against
                    unauthorized access, alteration, disclosure, or destruction.
                    These include account authentication, role-based access
                    controls, password hashing, and restricted access to system
                    backup files.
                </p>
                <p>
                    No online system or storage method can be guaranteed to be
                    completely secure.
                </p>
            </>
        ),
    },
    {
        title: '7. Cookies and Session Information',
        content: (
            <p>
                The system may use essential session and security cookies to
                maintain authenticated sessions, support form submissions, and
                protect against unauthorized requests. These are necessary for
                the operation and security of the application.
            </p>
        ),
    },
    {
        title: '8. Google Drive Backups',
        content: (
            <>
                <p>
                    The system uses a Google Drive integration for off-site
                    storage of encrypted database backups. This integration is
                    currently active for system administrators.
                </p>
                <p>
                    If enabled, the application is intended to request limited
                    Google Drive access to create and upload backup files
                    generated by the system. The intended permission is limited
                    to files created or opened by the application. Backup files
                    are intended to be encrypted before upload.
                </p>
                <p>
                    The integration is not intended to read or use unrelated
                    personal files in a Google Drive account. This policy will
                    be updated if the integration's actual operation or data
                    practices change.
                </p>
            </>
        ),
    },
    {
        title: '9. Your Privacy Rights',
        content: (
            <>
                <p>Subject to applicable law, individuals may ask to:</p>
                <ul>
                    <li>
                        Know whether their personal information is being
                        processed.
                    </li>
                    <li>
                        Request access to or correction of their personal
                        information.
                    </li>
                    <li>
                        Request deletion or blocking where legally appropriate.
                    </li>
                    <li>
                        Raise concerns or lodge a complaint about the handling
                        of their information.
                    </li>
                </ul>
                <p>
                    Requests may be subject to identity verification and
                    applicable recordkeeping requirements.
                </p>
            </>
        ),
    },
    {
        title: '10. Contact Us',
        content: (
            <>
                <p>
                    For questions, concerns, or requests relating to personal
                    information and this Privacy Policy, contact Ramyeon Corner:
                </p>
                <p>
                    Email:{' '}
                    <a
                        href="mailto:kingramyeoncornerbislig@gmail.com"
                        className="font-bold text-[#8f3037] underline underline-offset-4 hover:text-[#b34d45]"
                    >
                        kingramyeoncornerbislig@gmail.com
                    </a>
                </p>
            </>
        ),
    },
];

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy" />

            <div className="min-h-screen bg-[#f7f3ed] text-[#493b35]">
                {/* HEADER */}
                <header className="sticky top-0 z-40 border-b border-white/10 bg-[#721f26]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/ramyeon-logo-clear.png"
                                alt="Ramyeon Corner"
                                className="h-11 w-11 rounded-full bg-[#f7f3ed] object-contain p-1"
                            />
                            <div>
                                <p className="font-extrabold tracking-tight text-white">
                                    Ramyeon Corner
                                </p>
                                <p className="text-xs text-[#e4b86d]">
                                    Good Food. Great Rewards.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#e4b86d] hover:bg-white/10 hover:text-[#e4b86d]"
                        >
                            <span aria-hidden="true">←</span>
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </header>

                {/* PAGE INTRODUCTION */}
                <section className="relative overflow-hidden bg-[#f2e8d9] px-5 py-16 text-center sm:py-20">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#721f26]/10" />
                    <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-[#721f26]/10" />

                    <div className="relative mx-auto max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a64b39]">
                            Your Privacy Matters
                        </p>

                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#42191c] sm:text-5xl">
                            Privacy Policy
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#75635a] sm:text-base">
                            Learn how Ramyeon Corner collects, uses, stores, and
                            protects your personal information when you use our
                            Loyalty Management System.
                        </p>

                        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#721f26]/15 bg-white/70 px-4 py-2 text-xs font-semibold text-[#8f3037]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#a64b39]" />
                            Effective date: November 3, 2026
                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT */}
                <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
                    {/* INTRODUCTION */}
                    <div className="mb-9 rounded-2xl border border-[#eadfd2] bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7eee7] text-lg text-[#8f3037]">
                                <span aria-hidden="true">✦</span>
                            </div>
                            <h2 className="text-lg font-extrabold text-[#42191c]">
                                About This Policy
                            </h2>
                        </div>

                        <div className="space-y-3 text-sm leading-7 text-[#75635a]">
                            <p>
                                This Privacy Policy explains how Ramyeon
                                Corner's Loyalty Management System collects,
                                uses, stores, and protects information when
                                customers and authorized staff use the
                                application.
                            </p>
                            <p>
                                We handle personal information in accordance
                                with applicable Philippine data protection laws,
                                including the Data Privacy Act of 2012 (Republic
                                Act No. 10173).
                            </p>
                        </div>
                    </div>

                    {/* POLICY SECTIONS */}
                    <div className="space-y-5">
                        {sections.map((section, index) => (
                            <section
                                key={section.title}
                                className="scroll-mt-28 rounded-2xl border border-[#eadfd2] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7eee7] text-sm font-extrabold text-[#8f3037]">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h2 className="border-b border-[#f0e8df] pb-4 text-lg font-extrabold text-[#42191c] sm:text-xl">
                                            {section.title.replace(
                                                /^\d+\.\s*/,
                                                '',
                                            )}
                                        </h2>

                                        <div className="mt-4 space-y-4 text-sm leading-7 text-[#75635a] [&_li]:pl-1 [&_strong]:font-bold [&_strong]:text-[#493b35] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                                            {section.content}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* BOTTOM NOTE */}
                    <div className="mt-9 rounded-2xl border border-[#e8d7bd] bg-[#f2e8d9] p-6 text-center sm:p-8">
                        <h2 className="text-lg font-extrabold text-[#42191c]">
                            Questions About Your Privacy?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#75635a]">
                            If you have concerns about how your information is
                            handled, you may contact us through our email
                            address listed in this policy.
                        </p>
                        <a
                            href="mailto:kingramyeoncornerbislig@gmail.com"
                            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#721f26] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#42191c]"
                        >
                            Contact Ramyeon Corner
                        </a>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-[#721f26] text-[#f7f3ed]">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row sm:px-8 lg:px-12">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/ramyeon-logo-clear.png"
                                alt="Ramyeon Corner"
                                className="h-10 w-10 rounded-full bg-[#f7f3ed] object-contain p-1"
                            />
                            <div>
                                <p className="font-extrabold">Ramyeon Corner</p>
                                <p className="mt-1 text-xs text-[#e4b86d]">
                                    Good Food. Great Rewards.
                                </p>
                            </div>
                        </Link>

                        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-white/75">
                            <Link
                                href="/"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Home
                            </Link>
                            <a
                                href="/#program"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Our Program
                            </a>
                            <Link
                                href="/privacy-policy"
                                className="text-[#e4b86d]"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/login"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Staff Login
                            </Link>
                        </nav>
                    </div>
                </footer>
            </div>
        </>
    );
}
