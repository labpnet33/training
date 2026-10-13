var e={id:`oob-change-operability`,h:{en:`Management network, change management, CI/CD and design for operability`,hi:`Management network, change management, CI/CD aur operability ka design`},body:{en:`
<p>Automation and telemetry are only as reliable as the path that reaches the devices and the process that decides what is pushed. This chapter covers three linked designs: the <b>management network</b>, the <b>change pipeline</b>, and <b>operability</b>, meaning how easily humans can run and troubleshoot the result.</p>

<h3>The customer case: Tidewater Port Authority</h3>
<p>Tidewater operates a container port with a head-office campus, a terminal operations centre and a remote cargo yard, about 480 network devices and 2,800 staff. A crane-control VLAN depends on this network, so downtime costs roughly USD 90,000 per hour. In March a bad routing change at the core cut the yard off, and engineers could not reach the yard switches to fix it because management traffic used the same broken production path. A driver had to take a laptop to the yard. Budget for the fix: USD 180,000. <b>Requirements:</b> manage devices even when production is down; changes tested before they touch the port; rollback in minutes. <b>Constraints:</b> only two sites have a second ISP; the change board meets weekly and wants evidence, not promises.</p>

<h3>Analogy: a hospital's emergency corridor</h3>
<p>Ambulances use a separate corridor that stays open even when the main road is jammed. Out-of-band management is that corridor: if production is blocked, you still reach the patient.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="In-band and out-of-band management">
<rect x="10" y="20" width="130" height="50" rx="10" fill="#ddd6fe"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ops / Git / CI</text>
<rect x="250" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Jump host + AAA</text>
<line x1="140" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="10" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">Production core</text><text x="550" y="60" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<rect x="470" y="170" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="200" text-anchor="middle" class="svg-ink" font-size="13">Yard switches</text><text x="550" y="220" text-anchor="middle" class="svg-muted" font-size="12">remote site</text>
<line x1="390" y1="35" x2="470" y2="35" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="430" y="26" text-anchor="middle" class="svg-muted" font-size="12">in-band</text>
<rect x="250" y="170" width="140" height="50" rx="10" fill="#fed7aa"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">OOB switch + LTE</text>
<line x1="320" y1="70" x2="320" y2="170" stroke="#64748b" stroke-width="3"/><text x="368" y="125" text-anchor="middle" class="svg-muted" font-size="12">OOB path</text>
<line x1="390" y1="195" x2="470" y2="200" stroke="#64748b" stroke-width="3"/>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">Dashed: production path. Solid: separate out-of-band path. Orange: OOB gear.</text>
</svg><p class="cap">The OOB path must not share a switch, link or routing table with production.</p></div>

<h3>Management network design rules</h3>
<ul>
<li><b>Out-of-band (OOB):</b> a dedicated network of management ports (on IOS XE the Gi0 management interface in a Mgmt-vrf), a console server for serial access, and independent uplinks, often a second ISP or an LTE router.</li>
<li><b>In-band</b> management is simpler and cheaper but fails with the network it manages. A good design uses OOB for devices that matter and in-band with strict controls elsewhere.</li>
<li>Separate management into its own VRF and subnet, restrict with ACLs, use SSH only, and AAA with TACACS+ plus a local break-glass account. Time (NTP) and logging go through the same plane.</li>
<li>Protect the automation tooling itself: service accounts with least privilege, secrets in a vault and a jump host with session recording.</li>
</ul>
<pre class="code"><span class="c">! IOS XE: management in its own VRF, SSH only</span>
vrf definition Mgmt-vrf
 address-family ipv4
interface GigabitEthernet0
 vrf forwarding Mgmt-vrf
 ip address 10.250.1.11 255.255.255.0
ip route vrf Mgmt-vrf 0.0.0.0 0.0.0.0 10.250.1.1
ip access-list standard MGMT-ONLY
 permit 10.250.0.0 0.0.255.255
line vty 0 15
 transport input ssh
 access-class MGMT-ONLY in vrf-also</pre>

<h3>Change management and the CI/CD pipeline for the network</h3>
<p>A change pipeline treats configuration like code. The stages: (1) a change is proposed as a <b>pull request</b> in Git; (2) <b>lint and syntax checks</b> validate the templates and variables; (3) <b>pre-checks</b> record the current state; (4) the change is tested in a <b>virtual lab</b> (for example Cisco Modeling Labs) or analysed with a model-based tool; (5) a human <b>approves</b>; (6) the change is applied to a <b>canary</b> site first, then in waves; (7) <b>post-checks</b> compare to the pre-checks and roll back automatically if they fail. On a device, <code>configure replace</code> with a saved golden file gives a fast rollback.</p>
<table class="cmp"><tr><th>Option</th><th>Speed</th><th>Risk control</th><th>Verdict</th></tr>
<tr><td>Manual change in window</td><td>Slow</td><td>Depends on the person</td><td>Not scalable</td></tr>
<tr><td>Script, no tests</td><td>Fast</td><td>Poor</td><td>Dangerous</td></tr>
<tr><td>Pipeline with lab, canary and post-checks</td><td>Moderate</td><td>High, evidence for the board</td><td>Chosen</td></tr>
</table>

<h3>Design for operability</h3>
<p>Operability means a tired engineer at 03:00 can understand and fix the network. Practical rules: consistent naming and addressing from the source of truth; a few well-documented standard designs instead of many snowflakes; every alert linked to a runbook; devices send time-synchronised logs; and every automation job is <b>idempotent</b> (running it twice gives the same result) and writes an audit log.</p>

<div class="eg"><p><b>Worked example.</b> Tidewater's yard needs a new VLAN. The pull request adds VLAN 340 to the source of truth. CI renders configs for 12 switches and lints them. The virtual lab confirms the trunk allows 340. The board approves the evidence. Wave 1: one yard switch. Post-check passes (interface up, VLAN present, no new errors). Wave 2: the other 11. Total hands-on time 25 minutes; rollback was never needed.</p></div>
<pre class="out">Router# configure replace flash:golden-yard.cfg list
This will apply all necessary additions and deletions
to replace the current running configuration with the
contents of the specified configuration file...
Total number of passes: <span class="hl">1</span>
Rollback Done</pre>

<div class="warn"><p><b>Common mistake.</b> Putting the automation server, jump host and AAA on the production network only. If production fails, so does your ability to fix it.</p></div>
<div class="exam"><p><b>Exam trap.</b> OOB must be physically and logically independent from production. A VRF alone does not protect you if the VRF still rides the same failed uplink. Automation jobs must be idempotent and staged.</p></div>

<div class="scn"><h4>Post-mortem: the yard cut-off</h4><p>The March routing change removed the default route towards the yard. All yard switches were managed in-band, so the team lost access to the very devices that needed fixing. Recovery took 3 hours and a drive to site. After the redesign, each site got an OOB switch, an LTE router and a console server. In the next incident a similar mistake was reversed in 11 minutes from the head office.</p><p><b>Lesson:</b> the design question is "how do I fix it when it is broken?", not just "how do I manage it when it works?".</p></div>

<div class="iv"><p class="q">"How would you roll out a network change safely?"</p><p>I would use Git for the change, automated lint and pre-checks, test in a virtual lab, get approval, apply to a canary site and then in waves, run post-checks and roll back automatically on failure. I would mention OOB access and idempotent automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OOB management is independent of production; in-band fails with the network.</li>
<li>Management gets its own VRF, ACLs, SSH, AAA and a break-glass account.</li>
<li>Pipeline: pull request, lint, pre-check, lab test, approval, canary, post-check, rollback.</li>
<li>Operability: standard designs, runbooks, idempotent jobs, audit logs.</li>
<li>Protect the automation tools as critical assets.</li>
</ul></div>
`,hi:`
<p>Automation aur telemetry utne hi reliable hain jitna devices tak pahunchne wala path aur woh process jo tay karta hai ki kya push hoga. Yeh chapter teen jude designs cover karta hai: <b>management network</b>, <b>change pipeline</b>, aur <b>operability</b>, yaani insaan result ko kitni aasani se chala aur troubleshoot kar sakte hain.</p>

<h3>Customer case: Tidewater Port Authority</h3>
<p>Tidewater ek container port chalata hai jisme head-office campus, terminal operations centre aur ek remote cargo yard hai, lagbhag 480 network devices aur 2,800 staff. Crane-control VLAN is network par depend karta hai, isliye downtime lagbhag USD 90,000 per hour ka padta hai. March mein core par galat routing change se yard kat gaya, aur engineers yard switches tak nahi pahunch paaye kyunki management traffic usi tooti production path se jaata tha. Ek driver ko laptop leke yard jaana pada. Fix ka budget: USD 180,000. <b>Requirements:</b> production down hone par bhi devices manage karna; port ko chhune se pehle changes test hon; minutes mein rollback. <b>Constraints:</b> sirf do sites par doosra ISP hai; change board har hafte milta hai aur vaade nahi, evidence chahta hai.</p>

<h3>Analogy: hospital ka emergency corridor</h3>
<p>Ambulances ek alag corridor use karti hain jo main road jam hone par bhi khula rehta hai. Out-of-band management wahi corridor hai: production block ho to bhi aap patient tak pahunch sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="In-band and out-of-band management">
<rect x="10" y="20" width="130" height="50" rx="10" fill="#ddd6fe"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ops / Git / CI</text>
<rect x="250" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Jump host + AAA</text>
<line x1="140" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="10" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">Production core</text><text x="550" y="60" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<rect x="470" y="170" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="550" y="200" text-anchor="middle" class="svg-ink" font-size="13">Yard switches</text><text x="550" y="220" text-anchor="middle" class="svg-muted" font-size="12">remote site</text>
<line x1="390" y1="35" x2="470" y2="35" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="430" y="26" text-anchor="middle" class="svg-muted" font-size="12">in-band</text>
<rect x="250" y="170" width="140" height="50" rx="10" fill="#fed7aa"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">OOB switch + LTE</text>
<line x1="320" y1="70" x2="320" y2="170" stroke="#64748b" stroke-width="3"/><text x="368" y="125" text-anchor="middle" class="svg-muted" font-size="12">OOB path</text>
<line x1="390" y1="195" x2="470" y2="200" stroke="#64748b" stroke-width="3"/>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">Dashed: production path. Solid: alag out-of-band path. Orange: OOB gear.</text>
</svg><p class="cap">OOB path ko production ke saath koi switch, link ya routing table share nahi karna chahiye.</p></div>

<h3>Management network ke design rules</h3>
<ul>
<li><b>Out-of-band (OOB):</b> management ports ka dedicated network (IOS XE par Gi0 management interface Mgmt-vrf mein), serial access ke liye console server, aur independent uplinks, aksar doosra ISP ya LTE router.</li>
<li><b>In-band</b> management simple aur sasta hai lekin usi network ke saath fail hota hai jise woh manage karta hai. Achha design important devices ke liye OOB aur baaki jagah strict controls ke saath in-band use karta hai.</li>
<li>Management ko apna VRF aur subnet do, ACLs se restrict karo, sirf SSH, aur TACACS+ ke saath AAA plus local break-glass account. Time (NTP) aur logging bhi usi plane se jaate hain.</li>
<li>Automation tooling ko khud protect karo: least-privilege service accounts, vault mein secrets aur session recording wala jump host.</li>
</ul>
<pre class="code"><span class="c">! IOS XE: management apne VRF mein, sirf SSH</span>
vrf definition Mgmt-vrf
 address-family ipv4
interface GigabitEthernet0
 vrf forwarding Mgmt-vrf
 ip address 10.250.1.11 255.255.255.0
ip route vrf Mgmt-vrf 0.0.0.0 0.0.0.0 10.250.1.1
ip access-list standard MGMT-ONLY
 permit 10.250.0.0 0.0.255.255
line vty 0 15
 transport input ssh
 access-class MGMT-ONLY in vrf-also</pre>

<h3>Change management aur network ka CI/CD pipeline</h3>
<p>Change pipeline configuration ko code ki tarah treat karta hai. Stages: (1) change Git mein <b>pull request</b> ke roop mein propose hota hai; (2) <b>lint aur syntax checks</b> templates aur variables validate karte hain; (3) <b>pre-checks</b> current state record karte hain; (4) change ko <b>virtual lab</b> (jaise Cisco Modeling Labs) mein test kiya jaata hai ya model-based tool se analyse kiya jaata hai; (5) insaan <b>approve</b> karta hai; (6) change pehle ek <b>canary</b> site par, phir waves mein lagta hai; (7) <b>post-checks</b> pre-checks se compare karte hain aur fail hone par automatic rollback hota hai. Device par saved golden file ke saath <code>configure replace</code> fast rollback deta hai.</p>
<table class="cmp"><tr><th>Option</th><th>Speed</th><th>Risk control</th><th>Verdict</th></tr>
<tr><td>Window mein manual change</td><td>Slow</td><td>Insaan par depend</td><td>Scale nahi hota</td></tr>
<tr><td>Bina tests ka script</td><td>Fast</td><td>Kamzor</td><td>Khatarnak</td></tr>
<tr><td>Lab, canary aur post-checks wala pipeline</td><td>Moderate</td><td>High, board ke liye evidence</td><td>Chosen</td></tr>
</table>

<h3>Operability ka design</h3>
<p>Operability ka matlab hai ki raat 03:00 par thaka hua engineer network samajh aur theek kar sake. Practical rules: source of truth se consistent naming aur addressing; bahut saare snowflakes ki jagah kuch well-documented standard designs; har alert ek runbook se linked; devices time-synchronised logs bhejein; aur har automation job <b>idempotent</b> ho (do baar chalane par same result) aur audit log likhe.</p>

<div class="eg"><p><b>Worked example.</b> Tidewater ke yard ko naya VLAN chahiye. Pull request source of truth mein VLAN 340 jodta hai. CI 12 switches ke configs render karta hai aur lint karta hai. Virtual lab confirm karta hai ki trunk 340 allow karta hai. Board evidence approve karta hai. Wave 1: ek yard switch. Post-check pass (interface up, VLAN present, koi naya error nahi). Wave 2: baaki 11. Total hands-on time 25 minute; rollback ki zaroorat nahi padi.</p></div>
<pre class="out">Router# configure replace flash:golden-yard.cfg list
This will apply all necessary additions and deletions
to replace the current running configuration with the
contents of the specified configuration file...
Total number of passes: <span class="hl">1</span>
Rollback Done</pre>

<div class="warn"><p><b>Common mistake.</b> Automation server, jump host aur AAA ko sirf production network par rakhna. Production fail ho to usse theek karne ki aapki ability bhi fail ho jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> OOB production se physically aur logically independent hona chahiye. Sirf VRF kaafi nahi agar VRF usi tooti uplink par chal raha hai. Automation jobs idempotent aur staged hone chahiye.</p></div>

<div class="scn"><h4>Post-mortem: yard ka kat jaana</h4><p>March ke routing change ne yard ki taraf ka default route hata diya. Saare yard switches in-band manage hote the, isliye team un devices tak hi nahi pahunch saki jinhe theek karna tha. Recovery mein 3 ghante aur site tak drive lagi. Redesign ke baad har site ko OOB switch, LTE router aur console server mila. Agle incident mein aisi hi galti head office se 11 minute mein reverse ho gayi.</p><p><b>Seekh:</b> design sawal yeh hai "toot jaane par theek kaise karun?", sirf "chalte waqt manage kaise karun?" nahi.</p></div>

<div class="iv"><p class="q">"Network change ko safely roll out kaise karoge?"</p><p>Main change ke liye Git use karta, automated lint aur pre-checks, virtual lab mein test, approval, canary site par apply aur phir waves mein, post-checks chalata aur failure par automatic rollback karta. OOB access aur idempotent automation ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OOB management production se independent hai; in-band network ke saath fail hota hai.</li>
<li>Management ko VRF, ACLs, SSH, AAA aur break-glass account milte hain.</li>
<li>Pipeline: pull request, lint, pre-check, lab test, approval, canary, post-check, rollback.</li>
<li>Operability: standard designs, runbooks, idempotent jobs, audit logs.</li>
<li>Automation tools ko critical assets ki tarah protect karo.</li>
</ul></div>
`}};export{e as default};