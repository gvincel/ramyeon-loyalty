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
                    The system uses a Google Drive integration for off-site storage of encrypted database backups. This integration is currently active for system administrators.
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
                        className="font-semibold text-red-700 underline underline-offset-2"
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

            <div className="min-h-screen bg-slate-50 text-slate-700">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5 sm:px-8">
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt=""
                            className="h-11 w-11 rounded-full object-contain"
                        />
                        <div>
                            <p className="font-bold tracking-tight text-slate-900">
                                Ramyeon Corner
                            </p>
                            <p className="text-xs text-slate-500">
                                Loyalty Management System
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                            <span aria-hidden="true">←</span>
                            Back to Home
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
                    <div className="mb-8 border-l-4 border-red-700 pl-5">
                        <p className="text-sm font-semibold uppercase tracking-wider text-red-700">
                            Legal Information
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Privacy Policy
                        </h1>
                        <p className="mt-3 text-sm text-slate-500">
                            Effective date: November 3, 2026
                        </p>
                    </div>

                    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 leading-7 shadow-sm sm:p-7">
                        <p>
                            This Privacy Policy explains how Ramyeon Corner's
                            Loyalty Management System collects, uses, stores,
                            and protects information when customers and
                            authorized staff use the application.
                        </p>
                        <p className="mt-3">
                            We handle personal information in accordance with
                            applicable Philippine data protection laws,
                            including the Data Privacy Act of 2012 (Republic Act
                            No. 10173).
                        </p>
                    </div>

                    <div className="space-y-5">
                        {sections.map((section) => (
                            <section
                                key={section.title}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                            >
                                <h2 className="text-lg font-bold text-slate-900">
                                    {section.title}
                                </h2>
                                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
                        <p>Ramyeon Corner Loyalty Management System</p>
                        <p className="mt-1">
                            For privacy inquiries, contact the email address
                            listed above.
                        </p>
                    </footer>
                </main>
            </div>
        </>
    );
}
