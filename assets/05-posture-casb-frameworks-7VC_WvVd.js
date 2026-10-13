var e={id:`posture`,h:{en:`Posture management, CASB and cloud security frameworks`,hi:`Posture management, CASB aur cloud security frameworks`},body:{en:`
<p>A building inspector does not wait for a fire. Every month she walks through the building with a checklist: are the fire exits clear, are the extinguishers charged, is the wiring to code? <b>Cloud Security Posture Management (CSPM)</b> is that inspector, except it walks through every cloud account every few minutes, uses a checklist written by experts (CIS, NIST) and never gets tired.</p>

<h3>The cloud security tool family</h3>
<table class="cmp"><tr><th>Acronym</th><th>Protects</th><th>Typical checks or actions</th></tr>
<tr><td><b>CSPM</b></td><td>Cloud configuration (control plane)</td><td>Public buckets, open security groups, logging off, root without MFA, unencrypted storage; drift and auto-remediation</td></tr>
<tr><td><b>CWPP</b></td><td>Workloads: VMs, containers, serverless</td><td>Vulnerabilities, runtime threats, file integrity, microsegmentation</td></tr>
<tr><td><b>CIEM</b></td><td>Identities and entitlements</td><td>Unused permissions, wildcard policies, toxic combinations</td></tr>
<tr><td><b>CASB</b></td><td>SaaS usage and SaaS data</td><td>Shadow IT discovery, DLP, risky sharing, compromised SaaS accounts</td></tr>
<tr><td><b>CNAPP</b></td><td>The whole cloud-native application</td><td>CSPM + CWPP + CIEM + IaC and image scanning in one platform</td></tr>
</table>

<h3>How CSPM works</h3>
<p>CSPM connects to each account with a <b>read-only role</b>, calls the provider APIs to inventory every resource, and evaluates each one against rules mapped to frameworks. Each finding has a severity, the affected resource, the control it violates and an owner. Good CSPM adds context: a public bucket containing personal data on an account tagged "production" outranks a public bucket of logos. Optional <b>auto-remediation</b> fixes simple issues (turn Block Public Access back on) within minutes, and <b>drift detection</b> compares the live state with the declared IaC.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="CSPM loop">
<rect x="10" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">Inventory (API)</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="13">Evaluate rules</text><text x="235" y="110" text-anchor="middle" class="svg-muted" font-size="12">CIS, NIST</text>
<rect x="330" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="395" y="92" text-anchor="middle" class="svg-ink" font-size="13">Findings</text><text x="395" y="110" text-anchor="middle" class="svg-muted" font-size="12">severity, owner</text>
<rect x="490" y="70" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="13">Remediate</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">fix, accept, IaC</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="330" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<path d="M560 120 Q560 170 320 170 Q75 170 75 120" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">re-scan continuously</text>
</svg><p class="cap">CSPM is a loop, not a one-time audit.</p></div>

<h3>Triage: fix, accept or hand over</h3>
<p>Every finding ends in one of three states. <b>Fix</b> it (and fix the IaC so it stays fixed). <b>Accept</b> the risk formally, with a risk ID, an owner and a review date, when the setting is intentional. Or <b>hand it over</b> when the owner is the provider. In Lab 1 you see all three:</p>
<pre class="out">ID       Sev            Control                 Owner     Decision
CSP-101  Critical       CIS 2.1.4 / NIST AC-3   Customer  <span class="hl">Fix now</span>
CSP-102  High           CIS 5.2 / NIST SC-7     Customer  Fix now
CSP-103  Medium         CIS 2.1.1 / NIST SC-28  Customer  Fix now
CSP-104  Low            CIS 2.1.4               Customer  <span class="hl">Accepted (RISK-104)</span>
CSP-105  Informational  Provider advisory       Provider  <span class="hl">Provider's job</span></pre>

<div class="eg"><p><b>Worked example.</b> The CLOUD console header says "3 open customer findings" at the start of Lab 1, not 4: CSP-104 is excluded because it is accepted, and CSP-105 because it is provider-owned. After you fix the bucket and the SSH rule, the counter drops to 0. Your scorecard is not "zero findings", it is "zero open, unaccepted, customer-owned findings".</p></div>

<h3>CASB: the security guard for SaaS</h3>
<p>A <b>Cloud Access Security Broker</b> covers four pillars: <b>visibility</b> (discover shadow IT from proxy, firewall or DNS logs and rate each app's risk), <b>compliance</b>, <b>data security</b> (DLP on uploads and on files already stored in SaaS) and <b>threat protection</b> (impossible travel, mass downloads, malware in shared files). It works in two modes:</p>
<ul>
<li><b>Inline (proxy)</b>: sits in the traffic path, usually as part of an SSE platform such as Cisco Secure Access, and can block in real time.</li>
<li><b>API (out of band)</b>: connects to sanctioned SaaS tenants through their APIs and scans data at rest and sharing settings, and can remove a public link after the fact. No traffic passes through it.</li>
</ul>

<h3>Frameworks and policy management</h3>
<ul>
<li><b>CSA Cloud Controls Matrix (CCM)</b> and the <b>STAR</b> registry, where providers publish their self-assessments and audits.</li>
<li><b>CIS Benchmarks</b> for each provider (and for operating systems, Kubernetes and containers): concrete, testable settings.</li>
<li><b>NIST CSF 2.0</b> with six functions: Govern, Identify, Protect, Detect, Respond, Recover; <b>NIST SP 800-53</b> controls; <b>NIST SP 800-144</b> guidance on public cloud.</li>
<li><b>ISO/IEC 27001</b>, plus <b>27017</b> (cloud security controls) and <b>27018</b> (protecting PII in public cloud).</li>
<li>Regulations: <b>PCI DSS</b>, <b>GDPR</b>, India's <b>DPDP Act 2023</b>, sector rules from RBI or SEBI.</li>
</ul>
<p><b>Policy management</b> at cloud scale means <b>policy as code</b> (rules written as code, versioned and tested, for example with Open Policy Agent), <b>preventive guardrails</b> at organisation level (service control policies, organisation policies) that stop risky settings from being created at all, and <b>detective</b> controls (CSPM) that catch what slips through.</p>

<div class="warn"><p><b>Common mistakes.</b> Turning on CSPM with every rule and drowning in thousands of low findings. Start with the critical and high rules on production accounts, assign owners, and track time to remediate. Another mistake: accepting risks informally in chat with no expiry date.</p></div>
<div class="exam"><p><b>Exam traps.</b> CASB API mode is out of band and scans data at rest; inline mode is the real-time proxy. CSPM checks configuration, CWPP protects running workloads. CNAPP is the umbrella that combines them.</p></div>

<div class="scn"><h4>Ten thousand findings and no owner</h4><p>A retail company enabled a CSPM tool across 60 accounts and got 11,000 findings on day one. The security team e-mailed a spreadsheet to all developers; nothing changed for two months. A new cloud security lead reset the approach: only critical and high rules on production, every account mapped to an owning team through tags, findings pushed into each team's ticket queue, and organisation guardrails for the top three issues (public buckets, SSH from anywhere, audit logging off). Within six weeks critical findings fell from 240 to 9.</p><p><b>Lesson:</b> posture management is a process with owners and guardrails, not a dashboard.</p></div>

<div class="iv"><p class="q">"What is the difference between CSPM, CWPP and CASB?"</p><p>CSPM checks the configuration of IaaS and PaaS accounts against benchmarks (public buckets, open ports, logging). CWPP protects the workloads themselves at runtime (vulnerabilities, process behaviour, segmentation). CASB governs SaaS usage and data, inline through a proxy or out of band through APIs. Mention that CNAPP bundles CSPM, CWPP, CIEM and pipeline scanning, and that guardrails prevent what CSPM detects.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSPM continuously inventories accounts and evaluates them against CIS and NIST rules.</li>
<li>Every finding is fixed, formally accepted or handed to its real owner.</li>
<li>CASB: visibility, compliance, data security, threat protection; inline or API mode.</li>
<li>Know CSA CCM/STAR, CIS Benchmarks, NIST CSF 2.0, ISO 27017/27018 and DPDP.</li>
<li>Policy as code plus preventive guardrails beat after-the-fact detection.</li>
</ul></div>
`,hi:`
<p>Building inspector aag lagne ka intezaar nahi karti. Har mahine woh checklist le kar building mein ghoomti hai: fire exits saaf hain, extinguishers charged hain, wiring code ke hisaab se hai? <b>Cloud Security Posture Management (CSPM)</b> wahi inspector hai, bas yeh har cloud account mein har kuch minute mein ghoomta hai, experts (CIS, NIST) ki likhi checklist use karta hai aur kabhi thakta nahi.</p>

<h3>Cloud security tools ki family</h3>
<table class="cmp"><tr><th>Acronym</th><th>Kya protect karta hai</th><th>Typical checks ya actions</th></tr>
<tr><td><b>CSPM</b></td><td>Cloud configuration (control plane)</td><td>Public buckets, khule security groups, band logging, bina MFA root, unencrypted storage; drift aur auto-remediation</td></tr>
<tr><td><b>CWPP</b></td><td>Workloads: VMs, containers, serverless</td><td>Vulnerabilities, runtime threats, file integrity, microsegmentation</td></tr>
<tr><td><b>CIEM</b></td><td>Identities aur entitlements</td><td>Unused permissions, wildcard policies, toxic combinations</td></tr>
<tr><td><b>CASB</b></td><td>SaaS usage aur SaaS data</td><td>Shadow IT discovery, DLP, risky sharing, compromised SaaS accounts</td></tr>
<tr><td><b>CNAPP</b></td><td>Poori cloud-native application</td><td>CSPM + CWPP + CIEM + IaC aur image scanning ek platform mein</td></tr>
</table>

<h3>CSPM kaise kaam karta hai</h3>
<p>CSPM har account se ek <b>read-only role</b> ke through judta hai, har resource ki inventory ke liye provider APIs call karta hai, aur har ek ko frameworks se mapped rules ke against evaluate karta hai. Har finding mein severity, affected resource, violate hua control aur ek owner hota hai. Achha CSPM context jodta hai: "production" tag wale account par personal data wala public bucket logos wale public bucket se upar rank karta hai. Optional <b>auto-remediation</b> simple issues minutes mein theek karta hai (Block Public Access wapas on), aur <b>drift detection</b> live state ko declared IaC se compare karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="CSPM loop">
<rect x="10" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">Inventory (API)</text>
<rect x="170" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="235" y="92" text-anchor="middle" class="svg-ink" font-size="13">Rules evaluate</text><text x="235" y="110" text-anchor="middle" class="svg-muted" font-size="12">CIS, NIST</text>
<rect x="330" y="70" width="130" height="50" rx="8" fill="#fde68a"/><text x="395" y="92" text-anchor="middle" class="svg-ink" font-size="13">Findings</text><text x="395" y="110" text-anchor="middle" class="svg-muted" font-size="12">severity, owner</text>
<rect x="490" y="70" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="92" text-anchor="middle" class="svg-ink" font-size="13">Remediate</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">fix, accept, IaC</text>
<line x1="140" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><line x1="300" y1="95" x2="330" y2="95" stroke="#64748b" stroke-width="2"/><line x1="460" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2"/>
<path d="M560 120 Q560 170 320 170 Q75 170 75 120" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">lagatar re-scan</text>
</svg><p class="cap">CSPM ek loop hai, ek baar ka audit nahi.</p></div>

<h3>Triage: fix, accept ya hand over</h3>
<p>Har finding teen states mein se ek mein khatam hoti hai. Use <b>fix</b> karo (aur IaC bhi theek karo taaki fixed rahe). Jab setting intentional ho to risk ko formally <b>accept</b> karo, risk ID, owner aur review date ke saath. Ya jab owner provider ho to use <b>hand over</b> karo. Lab 1 mein aap teeno dekhte ho:</p>
<pre class="out">ID       Sev            Control                 Owner     Decision
CSP-101  Critical       CIS 2.1.4 / NIST AC-3   Customer  <span class="hl">Fix now</span>
CSP-102  High           CIS 5.2 / NIST SC-7     Customer  Fix now
CSP-103  Medium         CIS 2.1.1 / NIST SC-28  Customer  Fix now
CSP-104  Low            CIS 2.1.4               Customer  <span class="hl">Accepted (RISK-104)</span>
CSP-105  Informational  Provider advisory       Provider  <span class="hl">Provider's job</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab 1 ki shuruaat mein CLOUD console ka header "3 open customer findings" kehta hai, 4 nahi: CSP-104 bahar hai kyunki woh accepted hai, aur CSP-105 kyunki woh provider-owned hai. Bucket aur SSH rule theek karne ke baad counter 0 ho jaata hai. Aapka scorecard "zero findings" nahi hai, balki "zero open, unaccepted, customer-owned findings" hai.</p></div>

<h3>CASB: SaaS ka security guard</h3>
<p><b>Cloud Access Security Broker</b> chaar pillars cover karta hai: <b>visibility</b> (proxy, firewall ya DNS logs se shadow IT dhoondhna aur har app ka risk rate karna), <b>compliance</b>, <b>data security</b> (uploads par aur SaaS mein pehle se stored files par DLP) aur <b>threat protection</b> (impossible travel, mass downloads, shared files mein malware). Yeh do modes mein kaam karta hai:</p>
<ul>
<li><b>Inline (proxy)</b>: traffic path mein baithta hai, aam taur par Cisco Secure Access jaise SSE platform ka hissa, aur real time mein block kar sakta hai.</li>
<li><b>API (out of band)</b>: sanctioned SaaS tenants se unki APIs ke through judta hai, data at rest aur sharing settings scan karta hai, aur baad mein public link hata sakta hai. Koi traffic isse hokar nahi jaata.</li>
</ul>

<h3>Frameworks aur policy management</h3>
<ul>
<li><b>CSA Cloud Controls Matrix (CCM)</b> aur <b>STAR</b> registry, jahan providers apne self-assessments aur audits publish karte hain.</li>
<li>Har provider ke liye <b>CIS Benchmarks</b> (aur operating systems, Kubernetes aur containers ke liye bhi): concrete, testable settings.</li>
<li><b>NIST CSF 2.0</b> chhe functions ke saath: Govern, Identify, Protect, Detect, Respond, Recover; <b>NIST SP 800-53</b> controls; public cloud par <b>NIST SP 800-144</b> guidance.</li>
<li><b>ISO/IEC 27001</b>, plus <b>27017</b> (cloud security controls) aur <b>27018</b> (public cloud mein PII protect karna).</li>
<li>Regulations: <b>PCI DSS</b>, <b>GDPR</b>, India ka <b>DPDP Act 2023</b>, RBI ya SEBI ke sector rules.</li>
</ul>
<p>Cloud scale par <b>policy management</b> ka matlab hai <b>policy as code</b> (rules code ke roop mein likhe, versioned aur tested, jaise Open Policy Agent se), organisation level par <b>preventive guardrails</b> (service control policies, organisation policies) jo risky settings ko banne hi nahi dete, aur <b>detective</b> controls (CSPM) jo bach nikle cheezon ko pakadte hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> CSPM ko har rule ke saath on karna aur hazaaron low findings mein doob jaana. Production accounts par critical aur high rules se shuru karo, owners assign karo, aur time to remediate track karo. Ek aur galti: chat mein informally risks accept karna, bina expiry date ke.</p></div>
<div class="exam"><p><b>Exam traps.</b> CASB API mode out of band hai aur data at rest scan karta hai; inline mode real-time proxy hai. CSPM configuration check karta hai, CWPP chalte workloads protect karta hai. CNAPP umbrella hai jo inhe jodta hai.</p></div>

<div class="scn"><h4>Das hazaar findings aur koi owner nahi</h4><p>Ek retail company ne 60 accounts par CSPM tool on kiya aur pehle din 11,000 findings mile. Security team ne sab developers ko spreadsheet mail kar di; do mahine tak kuch nahi badla. Naye cloud security lead ne approach reset ki: production par sirf critical aur high rules, tags ke through har account ko owning team se map kiya, findings har team ki ticket queue mein push ki, aur top teen issues (public buckets, kahin se bhi SSH, band audit logging) ke liye organisation guardrails lagaye. Chhe hafton mein critical findings 240 se 9 par aa gayi.</p><p><b>Seekh:</b> posture management owners aur guardrails wala process hai, dashboard nahi.</p></div>

<div class="iv"><p class="q">"CSPM, CWPP aur CASB mein kya farak hai?"</p><p>CSPM IaaS aur PaaS accounts ki configuration ko benchmarks ke against check karta hai (public buckets, khule ports, logging). CWPP runtime par workloads ko khud protect karta hai (vulnerabilities, process behaviour, segmentation). CASB SaaS usage aur data govern karta hai, inline proxy se ya out of band APIs se. Batao ki CNAPP CSPM, CWPP, CIEM aur pipeline scanning ko bundle karta hai, aur guardrails woh rokte hain jo CSPM detect karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSPM lagatar accounts ki inventory leta hai aur unhe CIS aur NIST rules ke against evaluate karta hai.</li>
<li>Har finding fix hoti hai, formally accept hoti hai ya apne asli owner ko hand over hoti hai.</li>
<li>CASB: visibility, compliance, data security, threat protection; inline ya API mode.</li>
<li>CSA CCM/STAR, CIS Benchmarks, NIST CSF 2.0, ISO 27017/27018 aur DPDP jaano.</li>
<li>Policy as code plus preventive guardrails baad ke detection se behtar hain.</li>
</ul></div>
`}};export{e as default};