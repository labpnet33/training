var e={id:`dc-security`,h:{en:`Data center security design: segmentation, firewalls, AAA, CoPP and MACsec`,hi:`Data center security design: segmentation, firewalls, AAA, CoPP aur MACsec`},body:{en:`
<p><b>Analogy.</b> A hospital does not give every visitor a key to every room. The pharmacy, the records office and the operating theatres each have their own doors, badge readers and rules, and a guard checks who walks between them. Data center security design works the same way: you divide the estate into zones, control what crosses each boundary, check who is allowed to manage the equipment, and protect the equipment's own brain and its cables.</p>

<h3>The customer case: Sahyadri Health</h3>
<p>Sahyadri Health is a hospital group in Kolhapur with a private data center hosting a patient-records system, a medical-imaging archive, a billing application and a public appointment website. It runs 600 virtual machines on a VXLAN EVPN fabric with Nexus 9000 switches, and a pair of existing firewalls (an active/standby cluster) at the edge. After a phishing incident on a workstation, auditors found that the appointment web servers could reach the records database directly, and that every network engineer shared one administrator password. Constraints: a 6-month deadline, no new firewall hardware budget beyond a software refresh, 40 percent of workloads are older bare-metal servers that cannot run extra agents, and the imaging links between two buildings cross a public duct.</p>

<h3>Requirements</h3>
<ul>
<li>The public website must never talk directly to the records database.</li>
<li>Traffic between application tiers must be filtered, including east-west traffic between VMs on the same host.</li>
<li>Individual accountability for every administrator action.</li>
<li>Encryption of the inter-building imaging links, and protection of switch control-plane CPU from floods.</li>
</ul>

<h3>The security design toolbox</h3>
<dl class="terms">
<dt>Macrosegmentation</dt><dd>Splitting the fabric into large zones with separate routing tables, using VRFs (in VXLAN EVPN) or tenants and VRFs (in ACI).</dd>
<dt>Microsegmentation</dt><dd>Filtering between workloads inside a zone. In ACI this can be done with endpoint security groups (ESGs) and contracts. Cisco Secure Workload uses software agents on servers (or sensors in the network) to learn application dependencies and generate policy.</dd>
<dt>Firewall insertion</dt><dd>Forcing traffic through a firewall. In ACI use a service graph with policy-based redirect. In a VXLAN EVPN fabric use a firewall on a border or service leaf and route between VRFs through it.</dd>
<dt>AAA</dt><dd>Authentication, authorisation and accounting for device management, normally through TACACS+ (command-level control, accounting) or RADIUS.</dd>
<dt>CoPP</dt><dd>Control Plane Policing limits traffic punted to a switch's supervisor CPU, so a flood cannot starve routing protocols.</dd>
<dt>MACsec</dt><dd>IEEE 802.1AE hop-by-hop Layer 2 encryption with keys managed by MKA. It protects a link, not the end-to-end path, and needs hardware support on both ends.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Segmented Sahyadri design">
<rect x="10" y="10" width="620" height="270" rx="12" fill="#f1f5f9" stroke="#94a3b8"/>
<rect x="30" y="30" width="170" height="70" rx="10" fill="#fde68a"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF Web (DMZ)</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">appointment site</text>
<rect x="235" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF App</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">billing, middleware</text>
<rect x="440" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF Records</text><text x="525" y="78" text-anchor="middle" class="svg-muted" font-size="12">patient DB, imaging</text>
<rect x="190" y="140" width="260" height="56" rx="10" fill="#fed7aa"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">Firewall cluster</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">only path between VRFs</text>
<rect x="30" y="220" width="170" height="44" rx="10" fill="#ddd6fe"/><text x="115" y="247" text-anchor="middle" class="svg-ink" font-size="13">TACACS+ AAA server</text>
<rect x="440" y="220" width="170" height="44" rx="10" fill="#ddd6fe"/><text x="525" y="247" text-anchor="middle" class="svg-ink" font-size="13">Secure Workload</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="115" y1="100" x2="250" y2="140"/><line x1="320" y1="100" x2="320" y2="140"/><line x1="525" y1="100" x2="390" y2="140"/><line x1="115" y1="220" x2="250" y2="196" stroke-dasharray="4 3"/><line x1="525" y1="220" x2="390" y2="196" stroke-dasharray="4 3"/></g>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">purple = control and policy services</text>
</svg><p class="cap">Zones are separate VRFs. Every cross-zone flow goes through the firewall. Purple services manage access and generate policy.</p></div>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Need</th><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>Zone separation</td><td>VRFs with firewall as the only route between them</td><td>Strong, simple to audit</td><td>Hairpin through firewall adds latency and uses firewall throughput</td></tr>
<tr><td>Intra-zone filtering</td><td>Agent-based Secure Workload</td><td>Application-aware, follows the workload</td><td>Needs agents, so not for bare-metal appliances that cannot run them</td></tr>
<tr><td>Intra-zone filtering</td><td>Fabric contracts or ESGs</td><td>No agent, enforced in hardware</td><td>Coarser than process-level policy</td></tr>
<tr><td>Link encryption</td><td>MACsec</td><td>Line-rate, no extra device</td><td>Hop by hop; both ends must support it</td></tr>
<tr><td>Admin control</td><td>TACACS+ with local fallback</td><td>Per-user, per-command accounting</td><td>Server becomes a dependency; keep a local break-glass account</td></tr>
</table>

<h3>Chosen design and justification</h3>
<p>Sahyadri gets three VRFs, with the existing firewall cluster as the only inter-VRF path, which closes the web-to-database finding in the first month. For the 60 percent of workloads that are virtual, Secure Workload agents discover real dependencies for four weeks in monitor mode, then enforce a generated allow-list. For bare-metal servers, fabric contracts handle filtering at the leaf. The imaging links between buildings use MACsec. All switches use TACACS+ for login and accounting with one local emergency account stored in a sealed envelope, and CoPP is enabled with the strict profile.</p>

<pre class="code"><span class="c">! TACACS+ login and accounting for switch management</span>
feature tacacs+
tacacs-server host 192.0.2.10 key &lt;shared-secret&gt;
aaa group server tacacs+ DC-TAC
  server 192.0.2.10
  use-vrf management
aaa authentication login default group DC-TAC local
aaa accounting default group DC-TAC

<span class="c">! Control plane policing with the strict profile</span>
copp profile strict

<span class="c">! MACsec on an inter-building link</span>
feature macsec
macsec policy P1
interface Ethernet1/49
  macsec keychain KC1 policy P1
</pre>

<pre class="out">switch# show copp status
<span class="hl">Last Config Operation: None</span>
Policy-map attached to the control-plane: copp-system-p-policy-strict
</pre>

<div class="eg"><p><b>Worked example.</b> Secure Workload observes that the billing app talks to the records database on only one port (TCP 1521) from three servers. The generated policy allows exactly those three sources on that port and denies the rest. A phishing-infected workstation in the App zone then cannot scan the database, and the denied attempts appear in the flow log as evidence.</p></div>

<h3>What went wrong at a similar site</h3>
<div class="scn"><h4>Enforcing too early</h4><p>A logistics firm turned on a microsegmentation policy after only two days of observation. The month-end batch job, which runs on the 28th, used a port nobody had seen. At 01:00 the job was blocked and invoices were not produced. Rollback took 40 minutes. The corrected process: observe for at least one full business cycle including month-end, run policy in simulate or alert-only mode first, then enforce in waves with an owner for each application.</p><p><b>Lesson:</b> segmentation is a process of discovery and staged enforcement, not a switch to flip.</p></div>

<div class="exam"><p><b>Exam trap.</b> MACsec encrypts hop by hop between directly connected devices. It is not site-to-site end-to-end encryption through a routed network; that is IPsec or similar. CoPP protects the control plane, not data-plane traffic.</p></div>

<div class="warn"><p><b>Common mistake.</b> Relying on TACACS+ alone with no local fallback. If the AAA server is unreachable during an outage, nobody can log in.</p></div>

<div class="iv"><p class="q">"How would you design segmentation for a data center with both virtual and bare-metal workloads?"</p><p>Strong answer: VRF or tenant separation for macro zones, a firewall as the controlled inter-zone path, fabric contracts or groups for agentless workloads, and agent-based tools for deep application-aware policy on workloads that can run them. Mention monitor-first, wave enforcement and audit logging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Macrosegmentation uses VRFs and tenants; microsegmentation filters inside a zone.</li>
<li>Secure Workload learns dependencies and generates policy; observe before enforcing.</li>
<li>Firewall insertion uses service graph with PBR in ACI, or inter-VRF routing through a firewall in EVPN.</li>
<li>TACACS+ gives per-user accounting; always keep a local break-glass account.</li>
<li>CoPP protects the supervisor CPU; MACsec encrypts a single hop.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Hospital har visitor ko har room ki chaabi nahi deta. Pharmacy, records office aur operating theatres ke apne darwaze, badge readers aur rules hote hain, aur guard check karta hai ki beech mein kaun chal raha hai. Data center security design bhi aise hi kaam karta hai: estate ko zones mein baanto, har boundary par kya cross karega control karo, check karo ki equipment manage karne ki ijazat kisko hai, aur equipment ke dimaag aur cables ko protect karo.</p>

<h3>Customer case: Sahyadri Health</h3>
<p>Sahyadri Health Kolhapur ka ek hospital group hai jiska private data center patient-records system, medical-imaging archive, billing application aur public appointment website host karta hai. VXLAN EVPN fabric par Nexus 9000 switches ke saath 600 virtual machines chalti hain, aur edge par ek existing firewall pair (active/standby cluster) hai. Ek workstation par phishing incident ke baad auditors ne paaya ki appointment web servers records database tak seedha pahunch sakte hain, aur har network engineer ek hi shared administrator password use karta hai. Constraints: 6 mahine ki deadline, software refresh se zyada naye firewall hardware ka budget nahi, 40 percent workloads purane bare-metal servers hain jo extra agents nahi chala sakte, aur do buildings ke beech imaging links ek public duct se guzarte hain.</p>

<h3>Requirements</h3>
<ul>
<li>Public website kabhi records database se seedha baat na kare.</li>
<li>Application tiers ke beech traffic filter ho, same host ke VMs ke beech east-west traffic samet.</li>
<li>Har administrator action ki individual accountability.</li>
<li>Inter-building imaging links ki encryption, aur switch control-plane CPU ko floods se protection.</li>
</ul>

<h3>Security design toolbox</h3>
<dl class="terms">
<dt>Macrosegmentation</dt><dd>Fabric ko bade zones mein baantna, alag routing tables ke saath, VRFs (VXLAN EVPN mein) ya tenants aur VRFs (ACI mein) se.</dd>
<dt>Microsegmentation</dt><dd>Ek zone ke andar workloads ke beech filtering. ACI mein yeh endpoint security groups (ESGs) aur contracts se ho sakta hai. Cisco Secure Workload servers par software agents (ya network sensors) use karta hai jo application dependencies seekhte hain aur policy generate karte hain.</dd>
<dt>Firewall insertion</dt><dd>Traffic ko firewall se guzaarna. ACI mein policy-based redirect ke saath service graph. VXLAN EVPN fabric mein border ya service leaf par firewall aur VRFs ke beech routing us firewall se.</dd>
<dt>AAA</dt><dd>Device management ke liye authentication, authorisation aur accounting, normally TACACS+ (command-level control, accounting) ya RADIUS se.</dd>
<dt>CoPP</dt><dd>Control Plane Policing switch ke supervisor CPU tak jaane wale traffic ko limit karta hai, taaki flood routing protocols ko bhookha na rakhe.</dd>
<dt>MACsec</dt><dd>IEEE 802.1AE hop-by-hop Layer 2 encryption, keys MKA se manage hoti hain. Yeh ek link ko protect karta hai, end-to-end path ko nahi, aur dono ends par hardware support chahiye.</dd>
</dl>

<svg viewBox="0 0 640 290" role="img" aria-label="Segmented Sahyadri design">
<rect x="10" y="10" width="620" height="270" rx="12" fill="#f1f5f9" stroke="#94a3b8"/>
<rect x="30" y="30" width="170" height="70" rx="10" fill="#fde68a"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF Web (DMZ)</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">appointment site</text>
<rect x="235" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF App</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">billing, middleware</text>
<rect x="440" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="13">VRF Records</text><text x="525" y="78" text-anchor="middle" class="svg-muted" font-size="12">patient DB, imaging</text>
<rect x="190" y="140" width="260" height="56" rx="10" fill="#fed7aa"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="14">Firewall cluster</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">only path between VRFs</text>
<rect x="30" y="220" width="170" height="44" rx="10" fill="#ddd6fe"/><text x="115" y="247" text-anchor="middle" class="svg-ink" font-size="13">TACACS+ AAA server</text>
<rect x="440" y="220" width="170" height="44" rx="10" fill="#ddd6fe"/><text x="525" y="247" text-anchor="middle" class="svg-ink" font-size="13">Secure Workload</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="115" y1="100" x2="250" y2="140"/><line x1="320" y1="100" x2="320" y2="140"/><line x1="525" y1="100" x2="390" y2="140"/><line x1="115" y1="220" x2="250" y2="196" stroke-dasharray="4 3"/><line x1="525" y1="220" x2="390" y2="196" stroke-dasharray="4 3"/></g>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="12">purple = control and policy services</text>
</svg>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Need</th><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>Zone separation</td><td>VRFs, firewall unke beech ka akela route</td><td>Strong, audit karna aasan</td><td>Firewall se hairpin latency badhata hai aur firewall throughput khata hai</td></tr>
<tr><td>Intra-zone filtering</td><td>Agent-based Secure Workload</td><td>Application-aware, workload ke saath chalta hai</td><td>Agents chahiye, isliye wo bare-metal appliances jo agent nahi chala sakte unke liye nahi</td></tr>
<tr><td>Intra-zone filtering</td><td>Fabric contracts ya ESGs</td><td>Agent nahi, hardware mein enforce</td><td>Process-level policy se coarse</td></tr>
<tr><td>Link encryption</td><td>MACsec</td><td>Line-rate, extra device nahi</td><td>Hop by hop; dono ends support karein</td></tr>
<tr><td>Admin control</td><td>Local fallback ke saath TACACS+</td><td>Per-user, per-command accounting</td><td>Server dependency ban jata hai; local break-glass account rakho</td></tr>
</table>

<h3>Chosen design aur justification</h3>
<p>Sahyadri ko teen VRFs milte hain, existing firewall cluster inter-VRF ka akela path hai, jisse web-to-database finding pehle mahine mein band ho jati hai. 60 percent virtual workloads ke liye Secure Workload agents chaar hafte monitor mode mein asli dependencies discover karte hain, phir generated allow-list enforce hoti hai. Bare-metal servers ke liye leaf par fabric contracts filtering karte hain. Buildings ke beech imaging links MACsec use karte hain. Sab switches login aur accounting ke liye TACACS+ use karte hain, aur ek local emergency account sealed envelope mein rehta hai, aur CoPP strict profile ke saath enable hai.</p>

<pre class="code"><span class="c">! Switch management ke liye TACACS+ login aur accounting</span>
feature tacacs+
tacacs-server host 192.0.2.10 key &lt;shared-secret&gt;
aaa group server tacacs+ DC-TAC
  server 192.0.2.10
  use-vrf management
aaa authentication login default group DC-TAC local
aaa accounting default group DC-TAC

<span class="c">! Strict profile ke saath control plane policing</span>
copp profile strict

<span class="c">! Inter-building link par MACsec</span>
feature macsec
macsec policy P1
interface Ethernet1/49
  macsec keychain KC1 policy P1
</pre>

<pre class="out">switch# show copp status
<span class="hl">Last Config Operation: None</span>
Policy-map attached to the control-plane: copp-system-p-policy-strict
</pre>

<div class="eg"><p><b>Worked example.</b> Secure Workload dekhta hai ki billing app records database se sirf ek port (TCP 1521) par teen servers se baat karti hai. Generated policy wahi teen sources us port par allow karti hai aur baaki deny. Phishing se infected workstation App zone mein database ko scan nahi kar sakta, aur denied attempts flow log mein evidence ban jate hain.</p></div>

<h3>Similar site par kya galat hua</h3>
<div class="scn"><h4>Bahut jaldi enforce kar diya</h4><p>Ek logistics firm ne sirf do din ke observation ke baad microsegmentation policy on kar di. Month-end batch job, jo 28 tareekh ko chalta hai, ek aisa port use karta tha jo kisi ne nahi dekha tha. Raat 01:00 baje job block ho gaya aur invoices nahi bane. Rollback mein 40 minute lage. Sudhra hua process: kam se kam ek poora business cycle (month-end samet) observe karo, pehle simulate ya alert-only mode mein policy chalao, phir har application ke owner ke saath waves mein enforce karo.</p><p><b>Lesson:</b> segmentation discovery aur staged enforcement ka process hai, flip karne wala switch nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> MACsec directly connected devices ke beech hop by hop encrypt karta hai. Yeh routed network ke through site-to-site end-to-end encryption nahi hai; wo IPsec ya similar hai. CoPP control plane protect karta hai, data-plane traffic nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Local fallback ke bina sirf TACACS+ par depend karna. Outage mein AAA server unreachable ho to koi login nahi kar sakta.</p></div>

<div class="iv"><p class="q">"Virtual aur bare-metal dono workloads wale data center ke liye segmentation kaise design karoge?"</p><p>Strong answer: macro zones ke liye VRF ya tenant separation, inter-zone controlled path ke roop mein firewall, agentless workloads ke liye fabric contracts ya groups, aur jo workloads agent chala sakte hain unke liye deep application-aware policy ke liye agent-based tools. Monitor-first, wave enforcement aur audit logging zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Macrosegmentation VRFs aur tenants use karti hai; microsegmentation zone ke andar filter karti hai.</li>
<li>Secure Workload dependencies seekhta hai aur policy generate karta hai; enforce se pehle observe karo.</li>
<li>Firewall insertion ACI mein PBR ke saath service graph se, EVPN mein firewall ke through inter-VRF routing se.</li>
<li>TACACS+ per-user accounting deta hai; local break-glass account hamesha rakho.</li>
<li>CoPP supervisor CPU protect karta hai; MACsec ek hop encrypt karta hai.</li>
</ul></div>
`}};export{e as default};