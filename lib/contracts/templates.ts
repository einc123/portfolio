/** Default HTML bodies — Scots law / Scottish Courts.
 * Placeholders: {{organisation_name}}, {{client_name}}, {{client_email}}, {{date}},
 * {{provider_name}}, {{provider_email}}, {{provider_trading}}, {{provider_location}},
 * {{scope}}, {{fees}}, {{timeline}}, {{notes}}
 */

export type ContractTemplateSeed = {
  slug: string;
  title: string;
  sortOrder: number;
  bodyHtml: string;
};

function clauses(...paragraphs: string[]) {
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
}

/** Distinctive phrases used to detect whether DB templates need upgrading. */
export const CONTRACT_SCOTS_MARKER =
  "exclusive jurisdiction of the Scottish Courts";

export const CONTRACT_WITHDRAW_MARKER =
  "may withdraw this Agreement at any time prior to the Client signing";

const parties = `
<p><strong>Date:</strong> {{date}}</p>
<p><strong>The Service Provider:</strong> {{provider_name}}, trading as {{provider_trading}}, {{provider_location}} ({{provider_email}}).</p>
<p><strong>The Client:</strong> {{organisation_name}}, represented by {{client_name}} ({{client_email}}).</p>
<p>By signing, the Client confirms they are authorised to bind {{organisation_name}}.</p>
`.trim();

const particulars = `
<h3>Project particulars</h3>
<p><strong>Scope of work &amp; deliverables</strong></p>
{{scope}}
<p><strong>Fees &amp; payment</strong></p>
{{fees}}
<p><strong>Timeline</strong></p>
{{timeline}}
<p><strong>Additional notes</strong></p>
{{notes}}
`.trim();

const latePayment = clauses(
  "Under the Late Payment of Commercial Debts (Interest) Act 1998, interest may be charged on overdue invoices at a rate of 8% above the Bank of England base rate.",
);

const withdrawal = `
<h3>Withdrawal by the Service Provider</h3>
${clauses(
  "{{provider_name}} may withdraw this Agreement at any time prior to the Client signing, by notice to the Client (including by email or via the client portal). After withdrawal, the unsigned Agreement has no further effect.",
  "Where a deposit or fees have already been paid in connection with a withdrawn unsigned Agreement, any refund is at {{provider_name}}’s discretion unless otherwise required by law.",
)}
`.trim();

const scotsLaw = `
${withdrawal}
<h3>Limitation of liability</h3>
${clauses(
  "In accordance with Scots Law, the total liability of {{provider_name}} for any claim shall not exceed the total amount paid by the Client under this Agreement. {{provider_name}} is not liable for any consequential or indirect loss of profits.",
)}
<h3>Governing law</h3>
${clauses(
  "This Agreement is governed by and shall be construed in accordance with the Laws of Scotland, and the parties submit to the exclusive jurisdiction of the Scottish Courts.",
)}
`.trim();

const handoverLiability = `
<h3>4. Completion, handover &amp; termination of liability</h3>
${clauses(
  "This clause defines the point at which the Service Provider’s responsibility ends.",
  "<strong>Project sign-off:</strong> Upon completion of the project, the Client will be asked to sign a Project Completion Certificate (or equivalent completion &amp; release agreement).",
  "<strong>Discharge of liability:</strong> Once the Project Completion Certificate is signed and the final balance is paid in full, {{provider_name}}’s liability for the project ceases entirely.",
  "<strong>Post-handover risks:</strong> {{provider_name}} shall not be held liable for any issues arising after handover, including but not limited to: server/hosting failures or downtime; security breaches, hacks, or malware infections; errors caused by the Client (or third parties) modifying the code, plugins, or CMS settings; and loss of data or revenue.",
  "<strong>No ongoing warranty:</strong> Unless a separate Maintenance Agreement is signed, the Service Provider is not responsible for the ongoing health or updates of the site.",
)}
`.trim();

export const CONTRACT_TEMPLATE_SEEDS: ContractTemplateSeed[] = [
  {
    slug: "web-development",
    title: "Web Development Contract",
    sortOrder: 10,
    bodyHtml: `
<h2>Web Development Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to perform the web development services outlined in the Project Proposal and the project particulars above for {{organisation_name}}.",
  "Any additional features or “scope creep” requested after the signing of this document will be quoted as a separate work order.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars (or Project Proposal). A non-refundable deposit (where stated) is required to secure the project slot.",
  "Final balance is due immediately upon project completion and prior to the website being moved to a live environment or credentials being handed over.",
)}
${latePayment}
<h3>3. Client content &amp; delays</h3>
${clauses(
  "The Client is responsible for providing all text, images, and branding assets. If the project is delayed by more than 30 days due to missing client content, {{provider_name}} reserves the right to invoice for work completed to date and pause the project.",
)}
${handoverLiability}
<h3>5. Intellectual property (IP)</h3>
${clauses(
  "Copyright and ownership of the website and custom code will transfer from {{provider_name}} to the Client only upon receipt of the final balance. Pre-existing tools, libraries, and know-how of the Service Provider remain the Service Provider’s. Third-party licences (fonts, plugins, stock) remain subject to their terms.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "web-design",
    title: "Web Design Contract",
    sortOrder: 20,
    bodyHtml: `
<h2>Web Design Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to perform the web design services outlined in the Project Proposal and the project particulars above for {{organisation_name}} (visual design, layout, design systems, and related design deliverables).",
  "Development, coding, CMS build, copywriting, photography, and print are out of scope unless listed in the particulars or quoted separately. Any additional features or “scope creep” after signing will be quoted as a separate work order.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars. A non-refundable deposit (where stated) is required to secure the project slot. Final balance is due on completion and prior to handover of final design files.",
)}
${latePayment}
<h3>3. Client content, feedback &amp; delays</h3>
${clauses(
  "The Client is responsible for providing branding assets, feedback, and approvals in a timely manner. If the project is delayed by more than 30 days due to missing client content or feedback, {{provider_name}} reserves the right to invoice for work completed to date and pause the project.",
  "The fee includes the revision rounds stated in the quote or particulars (default: two rounds on the agreed direction). Extra revisions are billable.",
)}
${handoverLiability}
<h3>5. Intellectual property (IP)</h3>
${clauses(
  "Ownership of the final approved designs transfers to the Client only upon receipt of the final balance. Unused concepts remain the Service Provider’s and must not be used.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "web-design-development",
    title: "Web Design & Development Contract",
    sortOrder: 30,
    bodyHtml: `
<h2>Web Design &amp; Development Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to perform combined web design and development services outlined in the Project Proposal and the project particulars above for {{organisation_name}}.",
  "Any additional features or “scope creep” requested after the signing of this document will be quoted as a separate work order.",
  "Unless otherwise agreed in the particulars, the site will be built for current major evergreen browsers on common desktop and mobile viewports. Legacy browser support is out of scope.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars. A non-refundable deposit (where stated) is required to secure the project slot.",
  "Final balance is due immediately upon project completion and prior to the website being moved to a live environment or credentials being handed over.",
)}
${latePayment}
<h3>3. Client content &amp; delays</h3>
${clauses(
  "The Client is responsible for providing all text, images, and branding assets, and required access (domain, hosting, analytics, third-party tools). If the project is delayed by more than 30 days due to missing client content or access, {{provider_name}} reserves the right to invoice for work completed to date and pause the project.",
)}
${handoverLiability}
<h3>5. Intellectual property (IP)</h3>
${clauses(
  "Copyright and ownership of the website, custom design, and custom code will transfer from {{provider_name}} to the Client only upon receipt of the final balance.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "logo-brand",
    title: "Logo / Brand Design Contract",
    sortOrder: 40,
    bodyHtml: `
<h2>Logo / Brand Design Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to create logo and/or brand identity work for {{organisation_name}} as outlined in the Project Proposal and the project particulars above.",
  "Unless listed in the particulars, trademark filing, full brand books, packaging, motion, and merchandise production are out of scope. Additional concepts or revision rounds beyond those stated will be quoted separately.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars. A non-refundable deposit (where stated) is required to secure the project slot. Final balance is due on completion and prior to handover of final brand assets.",
)}
${latePayment}
<h3>3. Client content &amp; delays</h3>
${clauses(
  "The Client is responsible for providing briefing materials and timely feedback. If the project is delayed by more than 30 days due to missing client input, {{provider_name}} reserves the right to invoice for work completed to date and pause the project.",
  "The Client warrants they have rights to any materials they supply. The Service Provider is not liable for trademark conflicts the Client fails to clear.",
)}
<h3>4. Completion &amp; discharge of liability</h3>
${clauses(
  "Upon sign-off and payment of the final balance, {{provider_name}}’s liability for the brand project ceases entirely, save for liability that cannot be excluded by law.",
)}
<h3>5. Intellectual property (IP)</h3>
${clauses(
  "Ownership of the final selected logo/brand assets transfers to the Client only upon receipt of the final balance. Rejected concepts remain the Service Provider’s and must not be used.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "completion",
    title: "Project Completion Certificate",
    sortOrder: 50,
    bodyHtml: `
<h2>Project Completion Certificate</h2>
${parties}
${particulars}
<h3>1. Completion</h3>
${clauses(
  "The parties confirm that the project described for {{organisation_name}} (and in the particulars above) has been completed and delivered as of <strong>{{date}}</strong>, subject to any snagging items already agreed in writing.",
)}
<h3>2. Acceptance &amp; final balance</h3>
${clauses(
  "The Client accepts the delivered work. The final balance is due immediately and prior to live handover or release of credentials, if not already paid.",
  "After signing, further changes are new work and require a new agreement or a separate Maintenance Agreement.",
)}
<h3>3. Discharge of liability</h3>
${clauses(
  "Once this Project Completion Certificate is signed and the final balance is paid in full, {{provider_name}}’s liability for the project ceases entirely.",
  "<strong>Post-handover risks:</strong> {{provider_name}} shall not be held liable for any issues arising after handover, including but not limited to: server/hosting failures or downtime; security breaches, hacks, or malware infections; errors caused by the Client (or third parties) modifying the code, plugins, or CMS settings; and loss of data or revenue.",
  "<strong>No ongoing warranty:</strong> Unless a separate Maintenance Agreement is signed, the Service Provider is not responsible for the ongoing health or updates of the site.",
)}
<h3>4. Intellectual property (IP)</h3>
${clauses(
  "Copyright and ownership of the website and custom code transfer to the Client upon receipt of the final balance (if not already transferred).",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "hosting-maintenance",
    title: "Hosting & Maintenance Contract",
    sortOrder: 60,
    bodyHtml: `
<h2>Hosting &amp; Maintenance Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of services</h3>
${clauses(
  "Where agreed, the Service Provider will provide hosting and/or maintenance for the Client’s site(s) as set out in the project particulars (updates, monitoring appropriate to the plan, backups as described, and reasonable support).",
  "Maintenance does not include new features, redesigns, or unlimited emergency work unless stated in the particulars. Fair-use support applies. Third-party outages and Client-caused breakages may be billable to fix.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "Recurring fees are as set out in the particulars (e.g. monthly/yearly via invoice or Stripe). Non-payment may suspend service after notice.",
)}
${latePayment}
<h3>3. Client duties</h3>
${clauses(
  "The Client must keep strong credentials, grant necessary access, and report issues promptly. The Client remains responsible for their own users and for any unmanaged hosting account they control.",
)}
<h3>4. Limits of responsibility</h3>
${clauses(
  "No hosting is risk-free. {{provider_name}} takes reasonable steps consistent with the plan but is not liable for server/hosting failures beyond the Service Provider’s reasonable control, security incidents after Client or third-party changes, or loss of data or revenue, except where liability cannot be excluded by law.",
)}
<h3>5. Termination</h3>
${clauses(
  "Either party may cancel recurring services as agreed (e.g. at period end). On exit, the Client may request an export/handover of materials reasonably available; migration labour may be chargeable.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "maintenance-subscription",
    title: "Maintenance Subscription Contract",
    sortOrder: 65,
    bodyHtml: `
<h2>Maintenance Subscription Agreement</h2>
${parties}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "This Agreement covers the Client’s recurring website maintenance subscription for {{organisation_name}}, billed on the interval and amount agreed when the subscription is created (or as later varied in writing, including via Stripe).",
  "While the subscription is active and fees are paid, the Service Provider will provide fair-use maintenance appropriate to the plan. Any work outside that scope (including “scope creep”) will be quoted as a separate work order and may be charged at the Service Provider’s then-current hourly rate.",
  "Unless separately quoted, the subscription does not include: new features or redesigns; large content rebuilds; marketing campaigns; recovering sites broken by Client or third-party changes; migrating to a new host; or unlimited emergency call-outs outside fair use.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "Fees are collected via the agreed method (typically Stripe invoice or automatic collection). Failed or overdue payment may pause maintenance after notice. Pausing or cancelling the Stripe subscription pauses the corresponding care obligations for that period.",
)}
${latePayment}
<h3>3. Access &amp; Client duties</h3>
${clauses(
  "The Client will keep the Service Provider’s access credentials current where maintenance requires them, and will not remove access without notice.",
)}
<h3>4. Limits of responsibility</h3>
${clauses(
  "No maintenance plan eliminates all risk of downtime, compromise, or data loss. {{provider_name}} shall not be held liable for server/hosting failures outside the Service Provider’s control; security breaches after Client or third-party changes; or loss of data or revenue — except for liability that cannot be excluded by law.",
  "Unless this Maintenance Agreement (or a hosting agreement) is in force, the Service Provider is not responsible for the ongoing health or updates of the site.",
)}
<h3>5. Cancellation</h3>
${clauses(
  "The Client may request cancellation through the client portal or in writing. Cancellation follows the subscription’s billing rules (e.g. at period end). After cancellation ends, ongoing monitoring, updates, and support under this Agreement stop unless a new agreement is signed.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "nda",
    title: "Non-Disclosure Agreement (NDA)",
    sortOrder: 70,
    bodyHtml: `
<h2>Non-Disclosure Agreement</h2>
${parties}
${particulars}
<h3>1. Purpose</h3>
${clauses(
  "The parties may share confidential information to evaluate or perform web design, development, branding, or related services for {{organisation_name}}, as further described in the particulars (if any).",
)}
<h3>2. Confidential information</h3>
${clauses(
  "Includes non-public business, technical, financial, and personal data disclosed by either party, whether marked confidential or not, that a reasonable person would treat as confidential.",
)}
<h3>3. Obligations</h3>
${clauses(
  "The receiving party will use confidential information only for the stated purpose, protect it with reasonable care, and not disclose it to third parties except advisors under equivalent duties or as required by law.",
)}
<h3>4. Exclusions</h3>
${clauses(
  "Obligations do not apply to information that is public (other than by breach), independently developed, rightfully received from another source, or required to be disclosed by law (with notice where legally permitted).",
)}
<h3>5. Term</h3>
${clauses(
  "Obligations continue for 3 years from disclosure, or longer where personal data or trade secrets require.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "change-request",
    title: "Change Request / Variation Contract",
    sortOrder: 80,
    bodyHtml: `
<h2>Change Request / Variation Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "This Agreement records a change to an existing project or retainer for {{organisation_name}}. The change, fee impact, and revised timeline are set out in the project particulars above.",
  "Any further features or “scope creep” beyond those particulars will be quoted as a separate work order.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "Fees for this variation are as set out in the particulars and may be invoiced separately. Final balance for the variation is due as stated in the particulars (and, where relevant, prior to live handover).",
)}
${latePayment}
<h3>3. Effect</h3>
${clauses(
  "Except as varied here, the original project agreement remains in force. Signing authorises the Service Provider to proceed with the variation.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "photography",
    title: "Photography Contract",
    sortOrder: 90,
    bodyHtml: `
<h2>Photography Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to provide photography services for {{organisation_name}} as set out in the project particulars above (coverage, deliverables, and any agreed extras).",
  "Any additional coverage, products, or “scope creep” after signing will be quoted as a separate work order.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars. A non-refundable deposit (where stated) is required to secure the date.",
  "Final balance is due as stated in the particulars and, unless otherwise agreed, prior to delivery of the full edited gallery.",
)}
${latePayment}
<h3>3. Client duties &amp; cancellations</h3>
${clauses(
  "The Client will provide clear briefings, access, and any required permissions for venues or subjects. Delays caused by the Client may reduce coverage time without reducing the fee.",
  "If the Client cancels within 14 days of the shoot date, the deposit is forfeit and {{provider_name}} may invoice for reasonable preparation already undertaken. Rescheduling is subject to availability.",
)}
<h3>4. Delivery, creative control &amp; liability</h3>
${clauses(
  "Edited images will be delivered in the format and timescale stated in the particulars (or otherwise agreed). The Service Provider retains artistic discretion over editing style unless a specific style was agreed in writing.",
  "{{provider_name}} shall not be liable for missed shots due to Client delay, venue restrictions, weather, or circumstances beyond reasonable control. Total liability remains limited as under Scots Law below.",
)}
<h3>5. Intellectual property (IP) &amp; usage</h3>
${clauses(
  "Upon full payment, the Client receives a licence to use the delivered images for personal and/or agreed commercial use as stated in the particulars. {{provider_name}} retains copyright and may use selected images for portfolio and marketing unless the Client objects in writing before delivery.",
  "Raw files are not included unless expressly agreed.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "drone-photography",
    title: "Drone Photography Contract",
    sortOrder: 95,
    bodyHtml: `
<h2>Drone Photography Agreement</h2>
${parties}
${particulars}
<h3>1. Scope of work &amp; deliverables</h3>
${clauses(
  "The Service Provider agrees to provide drone / aerial photography services for {{organisation_name}} as set out in the project particulars above.",
  "Flights are operated in accordance with applicable Civil Aviation Authority (CAA) rules and local restrictions. Any additional flights, products, or “scope creep” after signing will be quoted separately.",
)}
<h3>2. Fees, payment &amp; late interest</h3>
${clauses(
  "<strong>Total fee / deposit / balance:</strong> as set out in the project particulars. A non-refundable deposit (where stated) is required to secure the date.",
  "Final balance is due as stated in the particulars and, unless otherwise agreed, prior to delivery of the full edited set.",
)}
${latePayment}
<h3>3. Weather, airspace &amp; Client duties</h3>
${clauses(
  "Drone flights are weather and airspace dependent. {{provider_name}} may postpone or cancel a flight where conditions, NOTAMs, permissions, or safety make flying unsuitable. A weather postponement does not forfeit the deposit; a mutually agreed new date will be arranged where practical.",
  "The Client will arrange any private-land permissions required and will not ask the Service Provider to fly unlawfully or unsafely.",
)}
<h3>4. Delivery &amp; liability</h3>
${clauses(
  "Edited stills (and any agreed short clips) will be delivered as stated in the particulars. {{provider_name}} is not liable for inability to fly due to weather, airspace, equipment failure beyond reasonable control, or Client-caused delay.",
  "Post-delivery, the Service Provider is not responsible for how images are used or published by the Client.",
)}
<h3>5. Intellectual property (IP) &amp; usage</h3>
${clauses(
  "Upon full payment, the Client receives a licence to use the delivered aerial images for personal and/or agreed commercial use as stated in the particulars. {{provider_name}} retains copyright and may use selected images for portfolio and marketing unless the Client objects in writing before delivery.",
)}
${scotsLaw}
`.trim(),
  },
  {
    slug: "bagpipes",
    title: "Bagpipes Performance Contract",
    sortOrder: 100,
    bodyHtml: `
<h2>Bagpipes Performance Agreement</h2>
${parties}
<h3>Booking particulars</h3>
<p><strong>Type of event</strong></p>
{{scope}}
<p><strong>Price</strong></p>
{{fees}}
<p><strong>Additional notes</strong></p>
{{notes}}
<h3>1. Engagement</h3>
${clauses(
  "The Service Provider agrees to provide bagpipe performance services for {{organisation_name}} for the type of event set out in the booking particulars (for example a wedding, ceilidh, ceremony, reception, or other occasion).",
  "Performance times, tunes, dress, and location details are as agreed in the notes or otherwise in writing (email acceptable).",
)}
<h3>2. Price &amp; payment</h3>
${clauses(
  "The price for the engagement is as set out in the booking particulars. A non-refundable deposit may be required to secure the date where stated in the notes or separately agreed.",
  "Unless otherwise agreed, the balance is due on or before the performance date.",
)}
${latePayment}
<h3>3. Client duties</h3>
${clauses(
  "The Client will confirm the venue address, timing, contact on the day, and any special tune requests with reasonable notice. The Client is responsible for venue permissions and a safe, suitable place to perform.",
)}
<h3>4. Cancellation &amp; postponement</h3>
${clauses(
  "If the Client cancels within 14 days of the performance date, the deposit (if any) is forfeit and {{provider_name}} may charge a reasonable cancellation fee for the reserved date. Postponement is subject to the Service Provider’s availability.",
  "If {{provider_name}} cannot perform due to illness or emergency, every reasonable effort will be made to notify the Client promptly and to arrange a substitute piper or a refund of fees paid for the missed performance.",
)}
<h3>5. Performance conditions &amp; liability</h3>
${clauses(
  "Outdoor performance may be adjusted or shortened for weather or safety. {{provider_name}} is not liable for venue acoustics, sound restrictions imposed by the venue, or consequential loss arising from schedule changes outside the Service Provider’s control.",
)}
${scotsLaw}
`.trim(),
  },
];
