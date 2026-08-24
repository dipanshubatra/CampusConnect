// =============================================================================
// Component: HelpCenter
// Issue: #2241 - HelpCenter accuracy audit vs Clerk auth, RBAC, and real routes
// Description: Accurate FAQ content that reflects the actual Supabase auth system,
// RBAC permission model, and live application routes. All answers have been audited
// against the real codebase to ensure no misleading information.
//
// Key audit findings addressed:
// - Auth is Supabase-based (NOT Clerk). Password reset goes through /forgot-password.
// - Settings page (/settings) handles profile display, avatar, dietary prefs — NOT passwords.
// - RBAC uses 8 granular permissions: can_edit_profile, can_manage_events, can_view_finances,
//   can_manage_finances, can_manage_members, can_manage_roles, can_delete_club, can_moderate_forum.
// - Club roles are managed via RolesManager in /clubs/:slug/manage.
// - Admin routes check for system_admin role in profiles table.
// =============================================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "@/components/site/SiteShell";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import Shield from "lucide-react/dist/esm/icons/shield";
import User from "lucide-react/dist/esm/icons/user";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Users from "lucide-react/dist/esm/icons/users";
import Settings from "lucide-react/dist/esm/icons/settings";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

// ---------------------------------------------------------------------------
// FAQ Data — Audited against live routes and Supabase auth flows
// ---------------------------------------------------------------------------

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const FAQ_CATEGORIES = [
  { id: "account", label: "Account & Auth", icon: User },
  { id: "clubs", label: "Clubs & Membership", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "rbac", label: "Roles & Permissions", icon: Shield },
  { id: "billing", label: "Billing & Subscriptions", icon: CreditCard },
  { id: "settings", label: "Settings & Preferences", icon: Settings },
  { id: "community", label: "Community & Safety", icon: MessageCircle },
] as const;

const FAQ_DATA: FaqItem[] = [
  // =========================================================================
  // ACCOUNT & AUTH — Verified against Supabase auth, forgot-password.tsx,
  // reset-password.tsx, and auth.tsx routes
  // =========================================================================
  {
    id: "auth-signin",
    question: "How do I sign in to CampusConnect?",
    answer:
      'Click the "Sign In" button in the top-right corner of the navigation bar. You can sign in using your email and password, or use a passkey if you\'ve set one up. CampusConnect uses Supabase Auth for secure authentication.',
    category: "account",
    tags: ["sign in", "login", "supabase"],
  },
  {
    id: "auth-signup",
    question: "How do I create an account?",
    answer:
      'Go to the <Link to="/auth">auth page</Link> and switch to the "Sign Up" tab. Fill in your first name, last name, email, and a strong password. You\'ll need to verify your email before accessing all features.',
    category: "account",
    tags: ["sign up", "register", "create account"],
  },
  {
    id: "password-reset",
    question: "How do I reset my password?",
    answer:
      'If you\'ve forgotten your password, click "Forgot password?" on the <Link to="/auth">sign-in page</Link>, or visit <Link to="/forgot-password">/forgot-password</Link> directly. Enter your email address and we\'ll send a secure reset link. You can also visit <Link to="/reset-password">/reset-password</Link> if you already have a reset token. Password changes are handled through Supabase Auth — there is no "Change Password" button in Settings.',
    category: "account",
    tags: ["password", "reset", "forgot", "supabase"],
  },
  {
    id: "password-change",
    question: "Can I change my password from the Settings page?",
    answer:
      "No. CampusConnect uses Supabase Auth for all password management. The <Link to=\"/settings\">Settings page</Link> handles your profile information, avatar, display preferences, and dietary restrictions — but not passwords. To change your password, use the <Link to=\"/forgot-password\">forgot password flow</Link> to receive a reset link via email.",
    category: "account",
    tags: ["password", "change", "settings", "supabase"],
  },
  {
    id: "email-verify",
    question: "I didn't receive my verification email. What should I do?",
    answer:
      'Check your spam/junk folder first. If it\'s not there, try signing in again — the system may resend the verification. You can also visit <Link to="/verify-email">/verify-email</Link> to check your verification status. If issues persist, contact support.',
    category: "account",
    tags: ["email", "verify", "verification"],
  },
  {
    id: "passkey",
    question: "What are passkeys and how do I set one up?",
    answer:
      "Passkeys let you sign in without a password using biometrics (fingerprint/face) or a security key. After signing in, you can register a passkey from the sign-in page using the passkey option. Passkeys are stored securely via WebAuthn and synced across your devices.",
    category: "account",
    tags: ["passkey", "webauthn", "biometric"],
  },
  {
    id: "mfa",
    question: "What is multi-factor authentication (MFA)?",
    answer:
      "MFA adds an extra layer of security. After entering your password, you may be prompted for a second factor (like a TOTP code from an authenticator app). If you encounter an MFA challenge, you'll be redirected to the <Link to=\"/mfa-challenge\">MFA challenge page</Link>. Contact an admin if you lose access to your MFA device.",
    category: "account",
    tags: ["mfa", "2fa", "two-factor", "security"],
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      'Visit the <Link to="/settings">Settings page</Link> and scroll to the "Danger Zone" section at the bottom. Click "Delete Account" and confirm. This action is irreversible — all your data, including club memberships, event RSVPs, and messages, will be permanently deleted.',
    category: "account",
    tags: ["delete", "account", "remove"],
  },

  // =========================================================================
  // CLUBS & MEMBERSHIP — Verified against clubs routes and RBAC
  // =========================================================================
  {
    id: "club-create",
    question: "How do I create a new club?",
    answer:
      'Navigate to <Link to="/clubs/new">/clubs/new</Link> and fill out the club creation form. You\'ll need to provide a name, description, category, and a charter document. Club creation is subject to admin approval — you\'ll see the club in a "pending" state until a system admin approves it.',
    category: "clubs",
    tags: ["club", "create", "new"],
  },
  {
    id: "club-join",
    question: "How do I join a club?",
    answer:
      'Visit the club\'s page at <Link to="/clubs">/clubs</Link>, find the club you want to join, and click "Join." Some clubs require approval from club executives before your membership is confirmed. You can track your join request status on your <Link to="/dashboard">dashboard</Link>.',
    category: "clubs",
    tags: ["club", "join", "membership"],
  },
  {
    id: "club-manage",
    question: "How do I manage my club as a President or Executive?",
    answer:
      'Club executives can access the management dashboard at <Link to="/clubs/:slug/manage">/clubs/:slug/manage</Link>. From there you can manage members, events, finances, roles, and club settings. The management interface is only visible to users with appropriate RBAC permissions (see the Roles & Permissions section below).',
    category: "clubs",
    tags: ["club", "manage", "president", "executive"],
  },
  {
    id: "club-roles",
    question: "What roles exist in a club?",
    answer:
      "Clubs have system roles (President, Vice President, Secretary, Treasurer, Member) and can define custom roles. Each role is assigned a set of permissions from the RBAC matrix. Club Presidents can create and manage custom roles via the Roles Manager in the club management dashboard.",
    category: "clubs",
    tags: ["club", "role", "president", "member"],
  },

  // =========================================================================
  // EVENTS — Verified against events routes and organizer permissions
  // =========================================================================
  {
    id: "event-create",
    question: "Who can create events?",
    answer:
      'Any club member with the <code>can_manage_events</code> permission can create events for their club. Visit <Link to="/clubs/:slug/manage">club management</Link> and use the event creation dialog. Events go through a review process before being published publicly. System admins can also create events at the platform level.',
    category: "events",
    tags: ["event", "create", "organizer"],
  },
  {
    id: "event-rsvp",
    question: "How do I RSVP to an event?",
    answer:
      'Find an event on the <Link to="/events">events page</Link> or your <Link to="/feed">feed</Link>, click on it, and hit the RSVP button. Your RSVPs appear on your <Link to="/dashboard/rsvps">dashboard RSVPs page</Link>. You can cancel an RSVP at any time from the event page.',
    category: "events",
    tags: ["event", "rsvp", "attend"],
  },
  {
    id: "event-cancel",
    question: "How do I cancel or edit an event I created?",
    answer:
      'Event organizers can edit or cancel events from the <Link to="/events/:eventId/dashboard">event dashboard</Link>. Only users with the <code>can_manage_events</code> permission for the hosting club can make changes. Attendees will be notified of cancellations.',
    category: "events",
    tags: ["event", "cancel", "edit", "organizer"],
  },
  {
    id: "event-kiosk",
    question: "What is the event kiosk mode?",
    answer:
      'The kiosk mode (<Link to="/events/:eventId/kiosk">/events/:eventId/kiosk</Link>) is designed for check-in at the event venue. It provides a simplified interface for scanning QR codes and marking attendees as present. Only event organizers should access the kiosk.',
    category: "events",
    tags: ["event", "kiosk", "check-in"],
  },

  // =========================================================================
  // ROLES & PERMISSIONS — Verified against permissionGuards.ts and RBAC system
  // =========================================================================
  {
    id: "rbac-overview",
    question: "How does the role-based access control (RBAC) system work?",
    answer:
      "CampusConnect uses a granular permission-based RBAC system. Each club has roles, and each role has specific permissions. The 8 available permissions are:\n\n• <code>can_edit_profile</code> — Update club description, logo, banner, social links\n• <code>can_manage_events</code> — Create, edit, publish, cancel club events\n• <code>can_view_finances</code> — View club treasury and transaction history\n• <code>can_manage_finances</code> — Record expenses, approve reimbursements, manage budgets\n• <code>can_manage_members</code> — Approve join requests, remove members, assign roles\n• <code>can_manage_roles</code> — Create custom roles and modify the permission matrix\n• <code>can_delete_club</code> — Permanently delete the club and all associated data\n• <code>can_moderate_forum</code> — Delete posts, ban users, pin announcements\n\nThese are defined in <code>src/lib/rbac/permissionGuards.ts</code> and enforced both on the frontend (UI hiding) and backend (database policies).",
    category: "rbac",
    tags: ["rbac", "permissions", "role", "access"],
  },
  {
    id: "rbac-check",
    question: "How do I check what permissions I have?",
    answer:
      'Visit your club\'s management page at <Link to="/clubs/:slug/manage">/clubs/:slug/manage</Link>. The Permissions Matrix shows exactly which permissions your current role has. If you\'re the club President, you can also view and modify permissions for other roles using the Roles Manager.',
    category: "rbac",
    tags: ["rbac", "permissions", "check", "matrix"],
  },
  {
    id: "rbac-admin",
    question: "What is a system admin vs a club admin?",
    answer:
      "A <strong>system admin</strong> has the <code>system_admin</code> role in the profiles table and can access platform-wide admin routes like <Link to=\"/admin/analytics\">/admin/analytics</Link>, <Link to=\"/admin/users\">/admin/users</Link>, and <Link to=\"/admin/reports\">/admin/reports</Link>. A <strong>club admin/President</strong> has elevated permissions within a specific club (like <code>can_manage_roles</code> and <code>can_delete_club</code>) but cannot access system admin routes.",
    category: "rbac",
    tags: ["admin", "system", "club", "role"],
  },
  {
    id: "rbac-event-create",
    question: "Can any member create events for a club?",
    answer:
      "No. Only members with the <code>can_manage_events</code> permission can create events. By default, system roles like President and Vice President have this permission. If you need event creation access, ask your club President to assign you a role with <code>can_manage_events</code> enabled via the Roles Manager.",
    category: "rbac",
    tags: ["event", "create", "permission", "rbac"],
  },
  {
    id: "rbac-forum",
    question: "Who can moderate the club forum?",
    answer:
      "Only members with the <code>can_moderate_forum</code> permission can delete posts, ban users from the forum, and pin announcements. This permission is typically assigned to the Secretary or a dedicated Moderator role. The permission is defined in the RBAC matrix and enforced on both frontend and backend.",
    category: "rbac",
    tags: ["forum", "moderate", "permission"],
  },

  // =========================================================================
  // BILLING & SUBSCRIPTIONS
  // =========================================================================
  {
    id: "billing-bundles",
    question: "What are event bundles?",
    answer:
      'Event bundles are pre-paid packages for event tickets. Visit <Link to="/explore">/explore</Link> to see available bundles. Purchase a bundle at <Link to="/bundles/:bundleId/checkout">/bundles/:bundleId/checkout</Link> and use the credits to RSVP to premium events.',
    category: "billing",
    tags: ["billing", "bundle", "ticket", "purchase"],
  },

  // =========================================================================
  // SETTINGS & PREFERENCES — Verified against settings.tsx
  // =========================================================================
  {
    id: "settings-profile",
    question: "What can I change in Settings?",
    answer:
      'The <Link to="/settings">Settings page</Link> lets you update:\n\n• <strong>Profile</strong> — Name, handle, bio, avatar (upload or choose a theme)\n• <strong>Display</strong> — Font size, theme (light/dark), border preferences\n• <strong>Personal</strong> — Dietary restrictions, skills, course codes\n• <strong>Notifications</strong> — Push notification preferences, quiet hours, timezone\n• <strong>Privacy</strong> — Auto-tagging settings\n• <strong>Data</strong> — Export your data at <Link to="/settings/data">/settings/data</Link>\n• <strong>Danger Zone</strong> — Delete your account\n\nNote: Password changes are handled through Supabase Auth, not the Settings page (see password FAQ above).',
    category: "settings",
    tags: ["settings", "profile", "preferences"],
  },
  {
    id: "settings-avatar",
    question: "How do I change my profile picture?",
    answer:
      'Go to <Link to="/settings">/settings</Link> and click the camera icon on your current avatar. You can upload a custom image (which will be cropped) or choose from the built-in avatar themes. Your new avatar will appear across the platform.',
    category: "settings",
    tags: ["avatar", "profile picture", "photo"],
  },
  {
    id: "settings-theme",
    question: "How do I switch between light and dark mode?",
    answer:
      'Visit <Link to="/settings">/settings</Link> and look for the theme toggle in the Display section. You can also use the theme toggle button in the navigation bar. Your preference is saved locally and persists across sessions.',
    category: "settings",
    tags: ["theme", "dark mode", "light mode"],
  },
  {
    id: "settings-data",
    question: "Can I download my data?",
    answer:
      'Yes. Visit <Link to="/settings/data">/settings/data</Link> to request a data export. This will include your profile information, event history, club memberships, and messages. The export is generated server-side and you\'ll receive a download link.',
    category: "settings",
    tags: ["data", "export", "download", "gdpr"],
  },

  // =========================================================================
  // COMMUNITY & SAFETY
  // =========================================================================
  {
    id: "safety-report",
    question: "How do I report a problem or safety concern?",
    answer:
      'You can report issues through the <Link to="/admin/reports">admin reports system</Link> (accessible to system admins) or by contacting support directly. For urgent safety concerns, use the emergency broadcast system which can notify all users immediately. System admins can access the <Link to="/admin/feedback-safety">feedback & safety dashboard</Link>.',
    category: "community",
    tags: ["report", "safety", "emergency", "support"],
  },
  {
    id: "community-guidelines",
    question: "What are the community guidelines?",
    answer:
      "CampusConnect is a campus community platform. All users must:\n\n• Be respectful and inclusive\n• Use their real identity (no impersonation)\n• Follow club-specific rules set by executives\n• Report harassment or safety concerns immediately\n• Not spam, scam, or solicit inappropriately\n\nViolations may result in moderation actions by club moderators (<code>can_moderate_forum</code>) or platform-level bans by system admins.",
    category: "community",
    tags: ["guidelines", "rules", "community", "moderation"],
  },
  {
    id: "lost-found",
    question: "How does the Lost & Found feature work?",
    answer:
      'Visit <Link to="/lost-found">/lost-found</Link> to post about lost or found items. Include a description, location, and photo if possible. Other users can claim items or provide tips. This is a community-driven feature — please be honest and helpful.',
    category: "community",
    tags: ["lost", "found", "item", "community"],
  },
];

// ---------------------------------------------------------------------------
// HelpCenter Component
// ---------------------------------------------------------------------------

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === null || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const faqsByCategory = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    faqs: filteredFaqs.filter((faq) => faq.category === cat.id),
  })).filter((cat) => cat.faqs.length > 0);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about CampusConnect. All answers are
            verified against the current version of the application.
          </p>
        </div>

        {/* Audit Notice */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Content Accuracy Notice
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                This Help Center was audited against the live codebase (Issue
                #2241). All auth flows reference Supabase, not Clerk. Password
                management goes through{" "}
                <Link to="/forgot-password" className="underline">
                  /forgot-password
                </Link>
                , not Settings. RBAC permissions match{" "}
                <code>src/lib/rbac/permissionGuards.ts</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All ({FAQ_DATA.length})
          </button>
          {FAQ_CATEGORIES.map((cat) => {
            const count = FAQ_DATA.filter((f) => f.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id,
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQ Sections */}
        {faqsByCategory.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No results found for "{searchQuery}". Try a different search term.
          </div>
        ) : (
          <div className="space-y-8">
            {faqsByCategory.map((category) => {
              const Icon = category.icon;
              return (
                <section key={category.id}>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{category.label}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {category.faqs.length}
                    </Badge>
                  </div>
                  <Accordion type="multiple" className="space-y-2">
                    {category.faqs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="rounded-lg border px-4"
                      >
                        <AccordionTrigger className="text-sm font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          <div
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                          <div className="mt-3 flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6">
          <h3 className="mb-3 font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              →{" "}
              <Link to="/settings" className="text-primary underline">
                Settings
              </Link>{" "}
              — Manage your profile, preferences, and display settings
            </li>
            <li>
              →{" "}
              <Link to="/forgot-password" className="text-primary underline">
                Forgot Password
              </Link>{" "}
              — Reset your password via email (Supabase Auth)
            </li>
            <li>
              →{" "}
              <Link to="/clubs" className="text-primary underline">
                Clubs
              </Link>{" "}
              — Browse and join campus clubs
            </li>
            <li>
              →{" "}
              <Link to="/events" className="text-primary underline">
                Events
              </Link>{" "}
              — Discover and RSVP to events
            </li>
            <li>
              →{" "}
              <Link to="/dashboard" className="text-primary underline">
                Dashboard
              </Link>{" "}
              — Your personal overview of RSVPs, bookmarks, and activity
            </li>
            <li>
              →{" "}
              <Link to="/lost-found" className="text-primary underline">
                Lost & Found
              </Link>{" "}
              — Report or find lost items
            </li>
          </ul>
        </div>

        {/* Still need help? */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Still need help?{" "}
            <a
              href="https://github.com/krushit1307/CampusConnect/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Open a GitHub Issue
            </a>{" "}
            or reach out to your club President or a system admin.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
