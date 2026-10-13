var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a society lobby board that anyone could pin notices on, and a guard who learned to check who pins what and which flat belongs to whom. That guard is now a set of switch features you can configure, verify and troubleshoot. This chapter packs the module into a checklist for revision, interviews and the ENARSI 300-410 exam (objective: describe IPv6 first-hop security features).</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why NDP and DHCPv6 are trusted by hosts, and why hop limit 255 keeps all first-hop threats on the local link.</li>
<li>List the NDP messages with ICMPv6 types (133 to 137) and describe DAD.</li>
<li>Explain SLAAC vs stateful and stateless DHCPv6 using the A, M and O flags, and state that DHCPv6 never provides the default gateway.</li>
<li>Describe rogue RA, rogue DHCPv6, NA spoofing, address theft, DAD DoS, Redirect abuse and remote cache exhaustion, with the matching defence.</li>
<li>Explain SEND (CGA, RSA signatures, timestamp/nonce, router certificates) and why it is rarely deployed.</li>
<li>Configure and verify SISF device-tracking / IPv6 snooping policies with the right security level and device role.</li>
<li>Read the binding table: sources (ND, DH6, PKT, S), preference, states, and how ownership conflicts are resolved.</li>
<li>Configure RA guard host and router policies, including hop-limit, flag, preference, prefix-list and ACL checks.</li>
<li>Configure DHCPv6 guard client and server policies, including server ACL, reply prefix-list and preference limits.</li>
<li>Explain ND inspection, IPv6 source guard, prefix guard and destination guard, and their dependency on the binding table.</li>
<li>Plan a safe rollout and troubleshoot with host view, MAC table, policies, counters and SISF logs.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="220" y="90" width="200" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">SISF binding table</text>
<rect x="20" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="105" y="39" text-anchor="middle" class="svg-ink" font-size="12">RA guard</text>
<rect x="235" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 guard</text>
<rect x="450" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="535" y="39" text-anchor="middle" class="svg-ink" font-size="12">ND inspection</text>
<rect x="20" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="105" y="193" text-anchor="middle" class="svg-ink" font-size="12">Source guard</text>
<rect x="235" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">Prefix guard</text>
<rect x="450" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="535" y="193" text-anchor="middle" class="svg-ink" font-size="12">Destination guard</text>
<line x1="105" y1="52" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="52" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="535" y1="52" x2="380" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="170" x2="260" y2="134" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="134" stroke="#64748b" stroke-width="2"/><line x1="535" y1="170" x2="380" y2="134" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Control-plane guards (top) and data-plane guards (bottom), all anchored on one binding table.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FHS</dt><dd>First-Hop Security: switch features that validate NDP, DHCPv6 and data on access ports.</dd>
<dt>SISF</dt><dd>Switch Integrated Security Features: the Cisco framework that holds the binding table and hosts the FHS features.</dd>
<dt>Binding table</dt><dd>IP, MAC, VLAN, port, source, preference and state for each address, learned from ND, DHCPv6, data or static entries.</dd>
<dt>RA guard</dt><dd>Drops RAs and Redirects on host-role ports; checks RA content on router-role ports (RFC 6105).</dd>
<dt>DHCPv6 guard</dt><dd>Drops ADVERTISE, REPLY and RECONFIGURE on client-role ports.</dd>
<dt>ND inspection</dt><dd>Validates NS/NA against the binding table and for consistency; IOS XE security-level inspect.</dd>
<dt>Source guard</dt><dd>Drops data whose source is not bound to the ingress port and MAC.</dd>
<dt>Prefix guard</dt><dd>Source guard for whole learned or delegated prefixes (validate prefix).</dd>
<dt>Destination guard</dt><dd>Resolves only destinations present in the binding table; protects the router's neighbour cache.</dd>
<dt>SEND / CGA</dt><dd>Cryptographic NDP (RFC 3971) with addresses derived from public keys (RFC 3972).</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>NDP types: RS 133, RA 134, NS 135, NA 136, Redirect 137; NDP hop limit must be 255.</li>
<li>DHCPv6: client UDP 546, server/relay UDP 547, SOLICIT to ff02::1:2; no default gateway option.</li>
<li>RA flags: M = stateful DHCPv6, O = other config via DHCPv6, prefix A flag = SLAAC; router lifetime 0 = not a default router.</li>
<li>RA guard default role = host; DHCPv6 guard default role = client; device-tracking default security level = guard, default device role = node.</li>
<li>Security levels: glean (learn only), guard (enforce ownership, block RA/DHCPv6 server messages from node ports), inspect (plus validation).</li>
<li>Source guard requires snooping/device-tracking on the same target.</li>
<li><code>ipv6 snooping</code> (older) and <code>device-tracking</code> (IOS XE 16.x+) build the same table.</li>
<li>Policies on EtherChannel go on the Port-channel; host/client roles never go on uplinks.</li>
<li>FHS stops new messages; hosts keep old rogue state until they re-solicit or renew.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Binding table (old / new)</span>
ipv6 snooping policy EDGE-SNOOP          | device-tracking policy EDGE-DT
 security-level guard                    |  security-level guard
 tracking enable                         |  tracking enable
ipv6 snooping attach-policy EDGE-SNOOP   | device-tracking attach-policy EDGE-DT
<span class="c">! RA guard</span>
ipv6 nd raguard policy HOST-EDGE
 device-role host
ipv6 nd raguard attach-policy HOST-EDGE
<span class="c">! DHCPv6 guard</span>
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
ipv6 dhcp guard attach-policy DHCP-CLIENTS
<span class="c">! Source guard (needs snooping first)</span>
ipv6 source-guard policy EDGE-SG
ipv6 source-guard attach-policy EDGE-SG</pre>
<pre class="out">show ipv6 nd raguard policy [NAME]
show ipv6 dhcp guard policy [NAME]
show ipv6 snooping policies           | show device-tracking policies
show ipv6 neighbors binding           | show device-tracking database
show ipv6 snooping counters interface | show device-tracking counters interface
<span class="hl">show logging | include SISF          ! PAK_DROP and IP_THEFT</span></pre>

<div class="eg"><p><b>Worked example.</b> Exam-style: "Hosts receive the correct DHCPv6 lease but have no default route." Reasoning: DHCPv6 never supplies a gateway; hosts need an RA with non-zero router lifetime. Check whether RAs are suppressed on the router, or whether an RA guard host policy sits on the port facing the router. Both are classic answers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Mixing up which feature protects which plane. RA guard, DHCPv6 guard and ND inspection protect control messages; source and prefix guard protect data; destination guard protects the router's cache.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which feature prevents a host from using an IPv6 address assigned to another host in its data traffic?" is IPv6 source guard, not ND inspection and not RA guard.</p></div>

<div class="scn"><h4>The audit checklist</h4><p>An auditor asked a bank's network team to prove IPv6 access-layer controls. The team answered with evidence, not configs: <code>show device-tracking policies</code> showing every user port covered and uplinks trusted; <code>show ipv6 nd raguard policy</code> with historic drops on two ports; syslog exports of %SISF-4-IP_THEFT alerts and the tickets that followed; and a rollout document with phases and rollback steps. The audit passed without findings.</p><p><b>Lesson:</b> FHS is proven by what it drops and logs, so keep the evidence.</p></div>

<div class="iv"><p class="q">"Summarise IPv6 first-hop security in two minutes."</p><p>Hosts trust NDP and DHCPv6 on the link, which enables rogue RAs, rogue DHCPv6 servers, neighbour spoofing and address theft. SEND would fix it cryptographically but is rarely deployed, so Cisco switches use SISF: a binding table learned from NDP, DHCPv6 and static entries, and features that use it: RA guard, DHCPv6 guard, ND inspection, source and prefix guard, destination guard. Close with deployment: roles per port, phased rollout, verification with show commands and SISF logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One binding table, many features: learn it, protect control messages, then protect data.</li>
<li>Remember the defaults: RA guard host, DHCPv6 guard client, device-tracking guard/node.</li>
<li>Roles follow devices: host/client on the edge, router/server/switch/trusted on uplinks.</li>
<li>Verify with policy views, counters, the binding table and SISF syslog.</li>
<li>After any fix, refresh host state and confirm with the host view.</li>
</ul></div>
`,hi:`
<p>Aapne society ke lobby board se shuru kiya tha jis par koi bhi notice laga sakta tha, aur ek guard jisne check karna seekha ki kaun kya lagata hai aur kaunsa flat kiska hai. Woh guard ab switch features ka ek set hai jise aap configure, verify aur troubleshoot kar sakte ho. Yeh chapter module ko revision, interviews aur ENARSI 300-410 exam (objective: IPv6 first-hop security features describe karna) ke liye ek checklist mein pack karta hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki hosts NDP aur DHCPv6 par bharosa kyun karte hain, aur hop limit 255 saare first-hop threats ko local link par kyun rakhta hai.</li>
<li>NDP messages ko ICMPv6 types (133 se 137) ke saath list karo aur DAD describe karo.</li>
<li>A, M aur O flags se SLAAC vs stateful aur stateless DHCPv6 samjhao, aur batao ki DHCPv6 kabhi default gateway nahi deta.</li>
<li>Rogue RA, rogue DHCPv6, NA spoofing, address theft, DAD DoS, Redirect abuse aur remote cache exhaustion ko matching defence ke saath describe karo.</li>
<li>SEND (CGA, RSA signatures, timestamp/nonce, router certificates) samjhao aur yeh kam deploy kyun hota hai.</li>
<li>Sahi security level aur device role ke saath SISF device-tracking / IPv6 snooping policies configure aur verify karo.</li>
<li>Binding table padho: sources (ND, DH6, PKT, S), preference, states, aur ownership conflicts kaise resolve hote hain.</li>
<li>RA guard host aur router policies configure karo, hop-limit, flag, preference, prefix-list aur ACL checks samet.</li>
<li>DHCPv6 guard client aur server policies configure karo, server ACL, reply prefix-list aur preference limits samet.</li>
<li>ND inspection, IPv6 source guard, prefix guard aur destination guard samjhao, aur binding table par unki dependency.</li>
<li>Safe rollout plan karo aur host view, MAC table, policies, counters aur SISF logs se troubleshoot karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="220" y="90" width="200" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">SISF binding table</text>
<rect x="20" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="105" y="39" text-anchor="middle" class="svg-ink" font-size="12">RA guard</text>
<rect x="235" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">DHCPv6 guard</text>
<rect x="450" y="16" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="535" y="39" text-anchor="middle" class="svg-ink" font-size="12">ND inspection</text>
<rect x="20" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="105" y="193" text-anchor="middle" class="svg-ink" font-size="12">Source guard</text>
<rect x="235" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">Prefix guard</text>
<rect x="450" y="170" width="170" height="36" rx="8" fill="#bae6fd"/><text x="535" y="193" text-anchor="middle" class="svg-ink" font-size="12">Destination guard</text>
<line x1="105" y1="52" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="52" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="535" y1="52" x2="380" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="170" x2="260" y2="134" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="134" stroke="#64748b" stroke-width="2"/><line x1="535" y1="170" x2="380" y2="134" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Control-plane guards (upar) aur data-plane guards (neeche), sab ek binding table par tike.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FHS</dt><dd>First-Hop Security: switch features jo access ports par NDP, DHCPv6 aur data validate karte hain.</dd>
<dt>SISF</dt><dd>Switch Integrated Security Features: Cisco framework jo binding table rakhta hai aur FHS features host karta hai.</dd>
<dt>Binding table</dt><dd>Har address ke liye IP, MAC, VLAN, port, source, preference aur state, ND, DHCPv6, data ya static entries se seekha hua.</dd>
<dt>RA guard</dt><dd>Host-role ports par RAs aur Redirects drop karta hai; router-role ports par RA content check karta hai (RFC 6105).</dd>
<dt>DHCPv6 guard</dt><dd>Client-role ports par ADVERTISE, REPLY aur RECONFIGURE drop karta hai.</dd>
<dt>ND inspection</dt><dd>NS/NA ko binding table ke against aur consistency ke liye validate karta hai; IOS XE mein security-level inspect.</dd>
<dt>Source guard</dt><dd>Woh data drop karta hai jiska source ingress port aur MAC se bound nahi.</dd>
<dt>Prefix guard</dt><dd>Seekhe ya delegated poore prefixes ke liye source guard (validate prefix).</dd>
<dt>Destination guard</dt><dd>Sirf binding table mein maujood destinations resolve karta hai; router ki neighbour cache bachata hai.</dd>
<dt>SEND / CGA</dt><dd>Cryptographic NDP (RFC 3971), public keys se bane addresses ke saath (RFC 3972).</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>NDP types: RS 133, RA 134, NS 135, NA 136, Redirect 137; NDP hop limit 255 hona chahiye.</li>
<li>DHCPv6: client UDP 546, server/relay UDP 547, SOLICIT ff02::1:2 ko; koi default gateway option nahi.</li>
<li>RA flags: M = stateful DHCPv6, O = other config DHCPv6 se, prefix A flag = SLAAC; router lifetime 0 = default router nahi.</li>
<li>RA guard default role = host; DHCPv6 guard default role = client; device-tracking default security level = guard, default device role = node.</li>
<li>Security levels: glean (sirf seekho), guard (ownership enforce, node ports se RA/DHCPv6 server messages block), inspect (plus validation).</li>
<li>Source guard ko same target par snooping/device-tracking chahiye.</li>
<li><code>ipv6 snooping</code> (purana) aur <code>device-tracking</code> (IOS XE 16.x+) same table banate hain.</li>
<li>EtherChannel par policies Port-channel par jaati hain; host/client roles kabhi uplinks par nahi.</li>
<li>FHS naye messages rokta hai; hosts dobara solicit ya renew karne tak purani rogue state rakhte hain.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Binding table (purana / naya)</span>
ipv6 snooping policy EDGE-SNOOP          | device-tracking policy EDGE-DT
 security-level guard                    |  security-level guard
 tracking enable                         |  tracking enable
ipv6 snooping attach-policy EDGE-SNOOP   | device-tracking attach-policy EDGE-DT
<span class="c">! RA guard</span>
ipv6 nd raguard policy HOST-EDGE
 device-role host
ipv6 nd raguard attach-policy HOST-EDGE
<span class="c">! DHCPv6 guard</span>
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
ipv6 dhcp guard attach-policy DHCP-CLIENTS
<span class="c">! Source guard (pehle snooping chahiye)</span>
ipv6 source-guard policy EDGE-SG
ipv6 source-guard attach-policy EDGE-SG</pre>
<pre class="out">show ipv6 nd raguard policy [NAME]
show ipv6 dhcp guard policy [NAME]
show ipv6 snooping policies           | show device-tracking policies
show ipv6 neighbors binding           | show device-tracking database
show ipv6 snooping counters interface | show device-tracking counters interface
<span class="hl">show logging | include SISF          ! PAK_DROP aur IP_THEFT</span></pre>

<div class="eg"><p><b>Worked example.</b> Exam-style: "Hosts ko sahi DHCPv6 lease milti hai par default route nahi hai." Reasoning: DHCPv6 kabhi gateway nahi deta; hosts ko non-zero router lifetime wala RA chahiye. Check karo ki router par RAs suppressed to nahi, ya router ki taraf wale port par RA guard host policy to nahi baithi. Dono classic answers hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Kaunsa feature kaunsa plane bachata hai, isme gadbad karna. RA guard, DHCPv6 guard aur ND inspection control messages bachate hain; source aur prefix guard data bachate hain; destination guard router ki cache bachata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa feature host ko apne data traffic mein kisi doosre host ko assigned IPv6 address use karne se rokta hai?" Jawab IPv6 source guard hai, ND inspection nahi aur RA guard nahi.</p></div>

<div class="scn"><h4>Audit checklist</h4><p>Ek auditor ne bank ki network team se IPv6 access-layer controls prove karne ko kaha. Team ne configs nahi, saboot se jawab diya: <code>show device-tracking policies</code> jisme har user port covered aur uplinks trusted the; <code>show ipv6 nd raguard policy</code> jisme do ports par purane drops the; %SISF-4-IP_THEFT alerts ke syslog exports aur unke baad ke tickets; aur phases aur rollback steps wala rollout document. Audit bina kisi finding ke pass hua.</p><p><b>Seekh:</b> FHS isse prove hota hai ki woh kya drop aur log karta hai, isliye saboot sambhal kar rakho.</p></div>

<div class="iv"><p class="q">"Do minute mein IPv6 first-hop security summarise karo."</p><p>Hosts link par NDP aur DHCPv6 par bharosa karte hain, jisse rogue RAs, rogue DHCPv6 servers, neighbour spoofing aur address theft possible hote hain. SEND ise cryptographically theek kar sakta hai par kam deploy hota hai, isliye Cisco switches SISF use karte hain: NDP, DHCPv6 aur static entries se seekhi binding table, aur use karne wale features: RA guard, DHCPv6 guard, ND inspection, source aur prefix guard, destination guard. Deployment se khatam karo: har port ke roles, phased rollout, show commands aur SISF logs se verification.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek binding table, kai features: use seekho, control messages bachao, phir data bachao.</li>
<li>Defaults yaad rakho: RA guard host, DHCPv6 guard client, device-tracking guard/node.</li>
<li>Roles devices ke hisaab se: edge par host/client, uplinks par router/server/switch/trusted.</li>
<li>Policy views, counters, binding table aur SISF syslog se verify karo.</li>
<li>Kisi bhi fix ke baad host state refresh karo aur host view se confirm karo.</li>
</ul></div>
`}};export{e as default};