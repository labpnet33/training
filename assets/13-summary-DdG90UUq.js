var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an open wall port and finished with a network that asks every endpoint who it is, what it is, whether it is healthy, and where it may go, and that can change its answer at any moment. Use this chapter as your last review before the labs, the interview and the SCOR exam (domain 6.0, Secure Network Access, Visibility and Enforcement).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary chain">
<rect x="10" y="70" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="13">Identify</text><text x="65" y="112" text-anchor="middle" class="svg-muted" font-size="12">802.1X, MAB</text>
<rect x="135" y="70" width="110" height="56" rx="8" fill="#bae6fd"/><text x="190" y="94" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="190" y="112" text-anchor="middle" class="svg-muted" font-size="12">profiling</text>
<rect x="260" y="70" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="315" y="94" text-anchor="middle" class="svg-ink" font-size="13">Decide</text><text x="315" y="112" text-anchor="middle" class="svg-muted" font-size="12">policy sets</text>
<rect x="385" y="70" width="110" height="56" rx="8" fill="#fde68a"/><text x="440" y="94" text-anchor="middle" class="svg-ink" font-size="13">Enforce</text><text x="440" y="112" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL, SGT</text>
<rect x="510" y="70" width="120" height="56" rx="8" fill="#fed7aa"/><text x="570" y="94" text-anchor="middle" class="svg-ink" font-size="13">Adapt</text><text x="570" y="112" text-anchor="middle" class="svg-muted" font-size="12">posture, CoA</text>
<line x1="120" y1="98" x2="135" y2="98" stroke="#64748b" stroke-width="2"/><line x1="245" y1="98" x2="260" y2="98" stroke="#64748b" stroke-width="2"/><line x1="370" y1="98" x2="385" y2="98" stroke="#64748b" stroke-width="2"/><line x1="495" y1="98" x2="510" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">identify, classify, decide, enforce, adapt</text>
</svg><p class="cap">The whole module as one chain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain supplicant, authenticator and authentication server, and EAPoL vs RADIUS.</li>
<li>Compare EAP-TLS, PEAP, EAP-FAST, TEAP and EAP-TTLS, and explain EAP chaining.</li>
<li>Name the ISE personas (PAN, MnT, PSN, pxGrid) and their limits; add a network device with a shared secret.</li>
<li>Configure IOS XE for 802.1X and MAB: AAA, RADIUS, method lists, system-auth-control, port-control, pae, mab, order, timers, guest, auth-fail and critical VLANs.</li>
<li>Choose a host mode and a rollout phase (monitor, low-impact, closed).</li>
<li>Build policy sets with authentication and authorization rules; set "If User not found = Continue" for MAB.</li>
<li>Create authorization profiles returning a VLAN, dACL, redirect or SGT, and verify them on the switch.</li>
<li>Explain profiling probes, certainty factors and endpoint identity groups.</li>
<li>Describe CWA, hotspot, self-registered and sponsored guest portals, and the BYOD onboarding flow.</li>
<li>Describe posture (agents, conditions, remediation, statuses) and CoA types, ports and configuration.</li>
<li>Explain TrustSec classification, propagation (inline, SXP) and SGACL enforcement.</li>
<li>Set up device administration with TACACS+ in ISE: Device Admin service, shell profiles, command sets.</li>
<li>Troubleshoot with show authentication sessions, show aaa servers, test aaa and Live Logs failure reasons.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAS</dt><dd>Network access server: the switch, WLC or VPN headend that sends RADIUS.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: the MAC is sent as the identity, Service-Type Call-Check.</dd>
<dt>dACL</dt><dd>Downloadable ACL defined in ISE, pulled by the switch per session.</dd>
<dt>SGT / SGACL</dt><dd>Security Group Tag (16-bit role) and the ACL between two tags, enforced at egress.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol, TCP 64999, shares IP-to-SGT bindings.</dd>
<dt>CWA / LWA</dt><dd>Central (portal on ISE) and local (portal on the NAS) web authentication.</dd>
<dt>Posture</dt><dd>Compliance check of an endpoint; statuses Unknown, Compliant, NonCompliant.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176): ISE-initiated reauth, port bounce, disable or disconnect.</dd>
<dt>ANC</dt><dd>Adaptive Network Control: named quarantine or shutdown policies enforced through CoA.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>RADIUS ports</td><td>1812 auth, 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>CoA ports</td><td>UDP 3799 (RFC 5176), UDP 1700 Cisco default</td></tr>
<tr><td>TACACS+</td><td>TCP 49, full payload encrypted, per-command authorization</td></tr>
<tr><td>EAPoL</td><td>Ethertype 0x888E</td></tr>
<tr><td>dot1x timeout before MAB</td><td>tx-period x (max-reauth-req + 1) = 30 x 3 = 90 s by default</td></tr>
<tr><td>VLAN attributes</td><td>64 Tunnel-Type, 65 Tunnel-Medium-Type, 81 Tunnel-Private-Group-ID</td></tr>
<tr><td>Redirect ACL</td><td>permit = redirect, deny = bypass</td></tr>
<tr><td>Guest portal</td><td>ISE PSN, TCP 8443 by default</td></tr>
<tr><td>TrustSec</td><td>inline tag CMD Ethertype 0x8909; SXP TCP 64999; enforce at egress</td></tr>
<tr><td>ISE limits</td><td>2 PAN, 2 MnT; PSNs scale out</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! global</span>
aaa new-model
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
aaa authentication dot1x default group radius
aaa authorization network default group radius
aaa accounting dot1x default start-stop group radius
dot1x system-auth-control
aaa server radius dynamic-author
 client 10.99.99.10 server-key NKcoa
<span class="c">! per access port</span>
 authentication port-control auto
 dot1x pae authenticator
 mab
 authentication order dot1x mab
 dot1x timeout tx-period 5
 authentication event no-response action authorize vlan 50
<span class="c">! verify</span>
show authentication sessions [interface g0/1 details]
show dot1x all
show aaa servers
test aaa group radius priya Pr!ya2026 new-code
show cts role-based sgt-map all
show running-config | section dynamic-author</pre>

<div class="eg"><p><b>Worked example, the lab answers.</b> Access lab: PC1 dot1x in VLAN 20 with 10.20.20.x, CAM1 mab in VLAN 40 with <b>SGT 40</b>, GUEST1 in VLAN 50. CoA lab: quarantine VLAN <b>90</b>, two CoAs total. CoA ticket: the missing piece is the <b>dynamic-author</b> client for 10.99.99.10 with server-key NKcoa.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising ISE menu paths but not the flow. Exam and interview questions describe a symptom (authenticated but wrong VLAN, guest loops on the portal, CoA does nothing) and expect you to place it in the flow: authentication, authorization, enforcement or CoA.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the role names (authenticator = switch), the direction of CoA (ISE to NAS), the difference between profiling and posture, and that MAB uses the MAC as both username and password.</p></div>

<div class="scn"><h4>From open ports to zero trust access</h4><p>A manufacturing company rolled out NAC in four quarters: monitor mode on all access switches with profiling to build an inventory of 6,000 endpoints; low-impact mode with dACLs for printers and cameras; closed mode for offices with CWA guests and posture for laptops; and finally SGTs with a matrix that kept OT devices away from office users. Each quarter Live Logs and the profiling reports told them what would break next before they enforced it.</p><p><b>Lesson:</b> NAC is a journey: visibility first, then enforcement, then segmentation.</p></div>

<div class="iv"><p class="q">"Design network access for an office with laptops, IP phones, cameras and guests."</p><p>Strong answer: closed-mode 802.1X with EAP-TLS for corporate laptops, multi-domain host mode for desk ports with phones, MAB plus profiling for cameras with a camera VLAN and SGT, CWA with sponsored or self-registered portals for guests, posture for laptops with quarantine and CoA, TrustSec SGACLs for role-based segmentation, two PSNs for redundancy, critical VLAN for ISE outages, and device administration through TACACS+ in ISE. Mention a phased rollout from monitor mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identify (802.1X, MAB), classify (profiling), decide (policy sets), enforce (VLAN, dACL, SGT), adapt (posture, CoA).</li>
<li>The switch enforces only what it is configured to accept: network authorization, dACL support, redirect, dynamic-author.</li>
<li>Policy is first-match at every level; order rules from specific to general.</li>
<li>Know the ports: 1812/1813, 1700/3799, 49, 8443, 64999.</li>
<li>Troubleshoot left to right with the switch session view and ISE Live Logs.</li>
</ul></div>
`,hi:`
<p>Aapne ek khule wall port se shuru kiya aur ek aise network par khatam kiya jo har endpoint se poochta hai ki woh kaun hai, kya hai, healthy hai ya nahi, aur kahan jaa sakta hai, aur jo kabhi bhi apna jawab badal sakta hai. Labs, interview aur SCOR exam (domain 6.0, Secure Network Access, Visibility and Enforcement) se pehle is chapter ko apne last review ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary chain">
<rect x="10" y="70" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="13">Identify</text><text x="65" y="112" text-anchor="middle" class="svg-muted" font-size="12">802.1X, MAB</text>
<rect x="135" y="70" width="110" height="56" rx="8" fill="#bae6fd"/><text x="190" y="94" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="190" y="112" text-anchor="middle" class="svg-muted" font-size="12">profiling</text>
<rect x="260" y="70" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="315" y="94" text-anchor="middle" class="svg-ink" font-size="13">Decide</text><text x="315" y="112" text-anchor="middle" class="svg-muted" font-size="12">policy sets</text>
<rect x="385" y="70" width="110" height="56" rx="8" fill="#fde68a"/><text x="440" y="94" text-anchor="middle" class="svg-ink" font-size="13">Enforce</text><text x="440" y="112" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL, SGT</text>
<rect x="510" y="70" width="120" height="56" rx="8" fill="#fed7aa"/><text x="570" y="94" text-anchor="middle" class="svg-ink" font-size="13">Adapt</text><text x="570" y="112" text-anchor="middle" class="svg-muted" font-size="12">posture, CoA</text>
<line x1="120" y1="98" x2="135" y2="98" stroke="#64748b" stroke-width="2"/><line x1="245" y1="98" x2="260" y2="98" stroke="#64748b" stroke-width="2"/><line x1="370" y1="98" x2="385" y2="98" stroke="#64748b" stroke-width="2"/><line x1="495" y1="98" x2="510" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">identify, classify, decide, enforce, adapt</text>
</svg><p class="cap">Poora module ek chain ki tarah.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Supplicant, authenticator aur authentication server, aur EAPoL vs RADIUS samjhao.</li>
<li>EAP-TLS, PEAP, EAP-FAST, TEAP aur EAP-TTLS compare karo, aur EAP chaining samjhao.</li>
<li>ISE personas (PAN, MnT, PSN, pxGrid) aur unki limits batao; shared secret ke saath network device add karo.</li>
<li>802.1X aur MAB ke liye IOS XE configure karo: AAA, RADIUS, method lists, system-auth-control, port-control, pae, mab, order, timers, guest, auth-fail aur critical VLANs.</li>
<li>Host mode aur rollout phase (monitor, low-impact, closed) chuno.</li>
<li>Authentication aur authorization rules ke saath policy sets banao; MAB ke liye "If User not found = Continue" set karo.</li>
<li>VLAN, dACL, redirect ya SGT lautane wale authorization profiles banao, aur switch par verify karo.</li>
<li>Profiling probes, certainty factors aur endpoint identity groups samjhao.</li>
<li>CWA, hotspot, self-registered aur sponsored guest portals, aur BYOD onboarding flow describe karo.</li>
<li>Posture (agents, conditions, remediation, statuses) aur CoA types, ports aur configuration describe karo.</li>
<li>TrustSec classification, propagation (inline, SXP) aur SGACL enforcement samjhao.</li>
<li>ISE mein TACACS+ ke saath device administration set up karo: Device Admin service, shell profiles, command sets.</li>
<li>show authentication sessions, show aaa servers, test aaa aur Live Logs failure reasons se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAS</dt><dd>Network access server: switch, WLC ya VPN headend jo RADIUS bhejta hai.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: MAC identity ki tarah bheja jaata hai, Service-Type Call-Check.</dd>
<dt>dACL</dt><dd>ISE mein defined downloadable ACL, switch har session ke liye kheenchta hai.</dd>
<dt>SGT / SGACL</dt><dd>Security Group Tag (16-bit role) aur do tags ke beech ka ACL, egress par enforce.</dd>
<dt>SXP</dt><dd>SGT Exchange Protocol, TCP 64999, IP-to-SGT bindings share karta hai.</dd>
<dt>CWA / LWA</dt><dd>Central (ISE par portal) aur local (NAS par portal) web authentication.</dd>
<dt>Posture</dt><dd>Endpoint ka compliance check; statuses Unknown, Compliant, NonCompliant.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176): ISE-initiated reauth, port bounce, disable ya disconnect.</dd>
<dt>ANC</dt><dd>Adaptive Network Control: named quarantine ya shutdown policies jo CoA se enforce hoti hain.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>RADIUS ports</td><td>1812 auth, 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>CoA ports</td><td>UDP 3799 (RFC 5176), UDP 1700 Cisco default</td></tr>
<tr><td>TACACS+</td><td>TCP 49, poora payload encrypted, per-command authorization</td></tr>
<tr><td>EAPoL</td><td>Ethertype 0x888E</td></tr>
<tr><td>MAB se pehle dot1x timeout</td><td>tx-period x (max-reauth-req + 1) = 30 x 3 = default 90 s</td></tr>
<tr><td>VLAN attributes</td><td>64 Tunnel-Type, 65 Tunnel-Medium-Type, 81 Tunnel-Private-Group-ID</td></tr>
<tr><td>Redirect ACL</td><td>permit = redirect, deny = bypass</td></tr>
<tr><td>Guest portal</td><td>ISE PSN, default TCP 8443</td></tr>
<tr><td>TrustSec</td><td>inline tag CMD Ethertype 0x8909; SXP TCP 64999; egress par enforce</td></tr>
<tr><td>ISE limits</td><td>2 PAN, 2 MnT; PSNs scale out hote hain</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! global</span>
aaa new-model
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
aaa authentication dot1x default group radius
aaa authorization network default group radius
aaa accounting dot1x default start-stop group radius
dot1x system-auth-control
aaa server radius dynamic-author
 client 10.99.99.10 server-key NKcoa
<span class="c">! har access port par</span>
 authentication port-control auto
 dot1x pae authenticator
 mab
 authentication order dot1x mab
 dot1x timeout tx-period 5
 authentication event no-response action authorize vlan 50
<span class="c">! verify</span>
show authentication sessions [interface g0/1 details]
show dot1x all
show aaa servers
test aaa group radius priya Pr!ya2026 new-code
show cts role-based sgt-map all
show running-config | section dynamic-author</pre>

<div class="eg"><p><b>Worked example, lab ke jawab.</b> Access lab: PC1 dot1x se VLAN 20 mein 10.20.20.x ke saath, CAM1 mab se VLAN 40 mein <b>SGT 40</b> ke saath, GUEST1 VLAN 50 mein. CoA lab: quarantine VLAN <b>90</b>, kul do CoAs. CoA ticket: missing piece hai 10.99.99.10 ke liye server-key NKcoa ke saath <b>dynamic-author</b> client.</p></div>

<div class="warn"><p><b>Common galti.</b> ISE menu paths ratna par flow nahi samajhna. Exam aur interview questions ek symptom describe karte hain (authenticated par galat VLAN, guest portal par loop, CoA kuch nahi karta) aur ummeed karte hain ki aap use flow mein rakhoge: authentication, authorization, enforcement ya CoA.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role names (authenticator = switch), CoA ki direction (ISE se NAS), profiling aur posture ka fark, aur yeh ki MAB MAC ko username aur password dono ki tarah use karta hai, in par dhyan do.</p></div>

<div class="scn"><h4>Khule ports se zero trust access tak</h4><p>Ek manufacturing company ne NAC chaar quarters mein roll out kiya: saare access switches par profiling ke saath monitor mode taaki 6,000 endpoints ki inventory bane; printers aur cameras ke liye dACLs ke saath low-impact mode; CWA guests aur laptops ke liye posture ke saath offices mein closed mode; aur aakhir mein ek matrix ke saath SGTs jo OT devices ko office users se door rakhta tha. Har quarter Live Logs aur profiling reports enforce karne se pehle bata dete the ki aage kya tootega.</p><p><b>Seekh:</b> NAC ek safar hai: pehle visibility, phir enforcement, phir segmentation.</p></div>

<div class="iv"><p class="q">"Laptops, IP phones, cameras aur guests wale office ke liye network access design karo."</p><p>Strong answer: corporate laptops ke liye EAP-TLS ke saath closed-mode 802.1X, phones wale desk ports ke liye multi-domain host mode, cameras ke liye camera VLAN aur SGT ke saath MAB plus profiling, guests ke liye sponsored ya self-registered portals ke saath CWA, laptops ke liye quarantine aur CoA ke saath posture, role-based segmentation ke liye TrustSec SGACLs, redundancy ke liye do PSNs, ISE outage ke liye critical VLAN, aur ISE mein TACACS+ se device administration. Monitor mode se phased rollout ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identify (802.1X, MAB), classify (profiling), decide (policy sets), enforce (VLAN, dACL, SGT), adapt (posture, CoA).</li>
<li>Switch sirf wahi enforce karta hai jo accept karne ke liye configured hai: network authorization, dACL support, redirect, dynamic-author.</li>
<li>Har level par policy first-match hai; rules ko specific se general order mein rakho.</li>
<li>Ports yaad rakho: 1812/1813, 1700/3799, 49, 8443, 64999.</li>
<li>Switch session view aur ISE Live Logs ke saath left se right troubleshoot karo.</li>
</ul></div>
`}};export{e as default};