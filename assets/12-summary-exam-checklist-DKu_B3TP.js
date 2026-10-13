var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an airport: many checks, and your identity decides where you may go. You now know every checkpoint: Talos intelligence behind the scenes, the NGFW and IPS at the edge, DNS, web and email security, endpoint protection, ISE as the policy engine, 802.1X, MAB and WebAuth at the door, dynamic VLANs, dACLs and SGTs as the badge, CoA to reprogram the badge, TrustSec to enforce by role and MACsec to protect the wire. Use this chapter as your final review before the labs and the exam.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="12">Threat defense</text><text x="110" y="49" text-anchor="middle" class="svg-muted" font-size="12">Talos, NGFW, IPS, malware</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Endpoint and cloud</text><text x="320" y="49" text-anchor="middle" class="svg-muted" font-size="12">EDR, Umbrella, web, email</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="12">ISE policy engine</text><text x="530" y="49" text-anchor="middle" class="svg-muted" font-size="12">PAN, MnT, PSN, pxGrid</text>
<rect x="10" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="102" text-anchor="middle" class="svg-ink" font-size="12">Authenticate</text><text x="110" y="119" text-anchor="middle" class="svg-muted" font-size="12">802.1X, MAB, WebAuth</text>
<rect x="220" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="12">Authorize</text><text x="320" y="119" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL, SGT, CoA</text>
<rect x="430" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="530" y="102" text-anchor="middle" class="svg-ink" font-size="12">Segment and protect</text><text x="530" y="119" text-anchor="middle" class="svg-muted" font-size="12">TrustSec, MACsec</text>
<rect x="10" y="150" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot: session, method state, server UP, server log, result applied</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can describe defense in depth and the before/during/after continuum, and place Talos, NGFW, IPS, Secure Endpoint, Umbrella, Secure Web and Secure Email in a design.</li>
<li>I can explain the difference between a stateful firewall and an NGFW, and between IDS and IPS.</li>
<li>I can name the ISE personas and services and explain authentication versus authorization policy.</li>
<li>I can draw the 802.1X exchange from EAP-Request/Identity to DHCP, and name every role and protocol.</li>
<li>I can compare EAP-TLS, PEAP, EAP-FAST, EAP-TTLS and TEAP.</li>
<li>I can configure AAA, RADIUS and 802.1X with MAB fallback, tx-period and a guest VLAN on a Catalyst switch.</li>
<li>I can choose a host mode, explain order versus priority, and plan monitor, low-impact and closed mode.</li>
<li>I can explain MAB, Local and Central WebAuth, dynamic VLAN attributes, dACLs, SGT assignment and CoA.</li>
<li>I can explain TrustSec classification, propagation (inline and SXP) and SGACL enforcement, and MACsec with MKA.</li>
<li>I can troubleshoot "no response", "not run", "server dead", reject, and "authenticated into the wrong VLAN".</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant / authenticator / authentication server</dt><dd>Endpoint software / switch or WLC / RADIUS server (ISE).</dd>
<dt>EAPOL</dt><dd>EAP over LAN, EtherType 0x888E, destination 01:80:C2:00:00:03.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: MAC as identity, Service-Type Call-Check.</dd>
<dt>CWA / LWA</dt><dd>Central WebAuth (ISE portal, MAB plus redirect plus CoA) / Local WebAuth (switch or WLC portal).</dd>
<dt>dACL</dt><dd>Downloadable ACL pushed per session from ISE.</dd>
<dt>CoA</dt><dd>Change of Authorization, RFC 5176, server-initiated, UDP 1700 on Cisco.</dd>
<dt>SGT / SGACL / SXP</dt><dd>16-bit role tag / role-based ACL between tags / protocol that shares IP-to-SGT bindings over TCP 64999.</dd>
<dt>MACsec / MKA</dt><dd>802.1AE hop-by-hop Ethernet encryption / its key agreement protocol.</dd>
<dt>Talos</dt><dd>Cisco threat intelligence that feeds all Cisco security products.</dd>
<dt>Retrospective security</dt><dd>Re-evaluating files after they were allowed, and alerting when the verdict changes.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>The switch relays EAP and never validates the password; the RADIUS server decides.</li>
<li>Unauthorized port: only EAPOL (plus CDP/LLDP).</li>
<li>No-response time = tx-period x (max-reauth-req + 1): 90 s default.</li>
<li>Guest VLAN = no response; auth-fail VLAN = reject; critical VLAN = server dead.</li>
<li>Multi-domain = one voice plus one data device; multi-auth = many, each authenticated.</li>
<li>Dynamic VLAN: Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID = VLAN; needs <code>aaa authorization network</code>; VLAN must exist.</li>
<li>EAP-TLS needs client certificates; PEAP needs only a server certificate.</li>
<li>Wrong shared secret = silent drop and timeouts; wrong password = Access-Reject.</li>
<li>SGACLs are enforced at egress; SXP is control plane; inline tagging is data plane.</li>
<li>MACsec is hop by hop at layer 2; IPsec is end to end at layer 3.</li>
<li>Wireless: WPA2/WPA3-Enterprise use 802.1X; WPA3-Personal uses SAE; WPA3 requires PMF; OWE encrypts open networks.</li>
<li>IDS only alerts on a copy; IPS is inline and can drop.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Enable AAA and RADIUS</td><td><code>aaa new-model</code>; <code>radius server ISE</code>, <code>address ipv4 10.99.99.10 auth-port 1812 acct-port 1813</code>, <code>key NKsecret</code></td></tr>
<tr><td>Method lists</td><td><code>aaa authentication dot1x default group radius</code>; <code>aaa authorization network default group radius</code>; <code>aaa accounting dot1x default start-stop group radius</code></td></tr>
<tr><td>Global 802.1X</td><td><code>dot1x system-auth-control</code></td></tr>
<tr><td>Port</td><td><code>authentication port-control auto</code>, <code>dot1x pae authenticator</code>, <code>mab</code>, <code>authentication order dot1x mab</code>, <code>authentication priority dot1x mab</code>, <code>authentication host-mode multi-domain</code></td></tr>
<tr><td>Timers and fallbacks</td><td><code>dot1x timeout tx-period 5</code>; <code>authentication event no-response action authorize vlan 50</code>; <code>... fail action next-method</code>; <code>... server dead action authorize vlan 70</code></td></tr>
<tr><td>Monitor mode</td><td><code>authentication open</code></td></tr>
<tr><td>CoA</td><td><code>aaa server radius dynamic-author</code>, <code>client 10.99.99.10 server-key NKsecret</code></td></tr>
<tr><td>TrustSec</td><td><code>cts role-based enforcement</code>; <code>cts role-based sgt-map 10.99.99.10 sgt 99</code>; <code>cts role-based permissions from 50 to 30 NO-PRINT</code></td></tr>
<tr><td>Verify</td><td><code>show authentication sessions [interface g0/1 details]</code>, <code>show dot1x all</code>, <code>show mab all</code>, <code>show aaa servers</code>, <code>show cts role-based sgt-map all</code>, <code>show mka sessions</code></td></tr>
<tr><td>Lab RADIUS server</td><td><code>aaa-server show log</code>, <code>aaa-server show clients</code></td></tr>
</table>

<div class="warn"><p><b>Common mistake in the exam.</b> Picking "the switch authenticates the user" or "MAB is as secure as 802.1X". The switch is only the authenticator, and MAB is identification by a spoofable MAC address.</p></div>

<div class="exam"><p><b>Last exam trap.</b> Read which side a feature is on. CoA goes <b>from</b> ISE <b>to</b> the switch. SXP goes from <b>speaker</b> to <b>listener</b>. EAPOL is between supplicant and authenticator only. Umbrella acts at DNS, before any connection.</p></div>

<div class="scn"><h4>From open ports to identity-based access in one quarter</h4><p>A retail head office started with 1,200 open access ports. Month one: ISE deployed with two PSNs, switches configured in monitor mode, and ISE logs used to build MAB groups for 180 printers and 90 cameras. Month two: EAP-TLS certificates pushed to laptops, low-impact mode with a pre-auth ACL, CWA for guests. Month three: closed mode, SGTs for Employees, Printers, Cameras and Guests, and an SGACL that stops cameras from reaching anything but the video recorder. A later malware incident on one laptop was contained with a single ANC quarantine from the firewall.</p><p><b>Lesson:</b> the pieces in this module work as one system: visibility, identity, authorization, segmentation and containment.</p></div>

<div class="iv"><p class="q">"Design network access control for a new campus in two minutes."</p><p>Strong answer: ISE with redundant PAN/MnT and at least two PSNs; switches with AAA, two RADIUS servers, CoA and critical VLAN. Corporate devices use EAP-TLS, printers and IoT use MAB with profiling and least-privilege dACLs, guests use Central WebAuth. Authorization returns VLANs or SGTs; TrustSec SGACLs enforce role policy, firewalls use the same SGTs via pxGrid. Roll out monitor, low-impact, closed. Add MACsec on untrusted links, Umbrella and an NGFW at the edge, and NetFlow analytics for visibility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defense in depth: intelligence, edge, cloud, endpoint, access control, segmentation, encryption, visibility.</li>
<li>ISE decides; switches and WLCs enforce with VLANs, dACLs and SGTs; CoA changes decisions live.</li>
<li>802.1X for managed devices, MAB for devices without supplicants, CWA for guests.</li>
<li>TrustSec replaces IP-based ACLs with role-based policy; MACsec protects links hop by hop.</li>
<li>Troubleshoot in order: session, method state, server UP, server log, result applied.</li>
</ul></div>
`,hi:`
<p>Aapne airport se shuru kiya tha: kai checks, aur aapki identity decide karti hai ki aap kahan ja sakte ho. Ab aap har checkpoint jaante ho: peeche Talos intelligence, edge par NGFW aur IPS, DNS, web aur email security, endpoint protection, policy engine ki tarah ISE, darwaze par 802.1X, MAB aur WebAuth, badge ki tarah dynamic VLANs, dACLs aur SGTs, badge reprogram karne ke liye CoA, role se enforce karne ke liye TrustSec aur wire protect karne ke liye MACsec. Is chapter ko labs aur exam se pehle apna final review samjho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="12">Threat defense</text><text x="110" y="49" text-anchor="middle" class="svg-muted" font-size="12">Talos, NGFW, IPS, malware</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Endpoint aur cloud</text><text x="320" y="49" text-anchor="middle" class="svg-muted" font-size="12">EDR, Umbrella, web, email</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="12">ISE policy engine</text><text x="530" y="49" text-anchor="middle" class="svg-muted" font-size="12">PAN, MnT, PSN, pxGrid</text>
<rect x="10" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="102" text-anchor="middle" class="svg-ink" font-size="12">Authenticate</text><text x="110" y="119" text-anchor="middle" class="svg-muted" font-size="12">802.1X, MAB, WebAuth</text>
<rect x="220" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="12">Authorize</text><text x="320" y="119" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL, SGT, CoA</text>
<rect x="430" y="80" width="200" height="50" rx="8" fill="#bae6fd"/><text x="530" y="102" text-anchor="middle" class="svg-ink" font-size="12">Segment aur protect</text><text x="530" y="119" text-anchor="middle" class="svg-muted" font-size="12">TrustSec, MACsec</text>
<rect x="10" y="150" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot: session, method state, server UP, server log, result apply hua</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main defense in depth aur before/during/after continuum describe kar sakta hoon, aur Talos, NGFW, IPS, Secure Endpoint, Umbrella, Secure Web aur Secure Email ko design mein jagah de sakta hoon.</li>
<li>Main stateful firewall aur NGFW ka, aur IDS aur IPS ka farak samjha sakta hoon.</li>
<li>Main ISE personas aur services ke naam le sakta hoon aur authentication versus authorization policy samjha sakta hoon.</li>
<li>Main EAP-Request/Identity se DHCP tak 802.1X exchange draw kar sakta hoon, aur har role aur protocol ka naam le sakta hoon.</li>
<li>Main EAP-TLS, PEAP, EAP-FAST, EAP-TTLS aur TEAP compare kar sakta hoon.</li>
<li>Main Catalyst switch par MAB fallback, tx-period aur guest VLAN ke saath AAA, RADIUS aur 802.1X configure kar sakta hoon.</li>
<li>Main host mode chun sakta hoon, order versus priority samjha sakta hoon, aur monitor, low-impact aur closed mode plan kar sakta hoon.</li>
<li>Main MAB, Local aur Central WebAuth, dynamic VLAN attributes, dACLs, SGT assignment aur CoA samjha sakta hoon.</li>
<li>Main TrustSec classification, propagation (inline aur SXP) aur SGACL enforcement, aur MKA ke saath MACsec samjha sakta hoon.</li>
<li>Main "no response", "not run", "server dead", reject, aur "galat VLAN mein authenticated" troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Supplicant / authenticator / authentication server</dt><dd>Endpoint software / switch ya WLC / RADIUS server (ISE).</dd>
<dt>EAPOL</dt><dd>EAP over LAN, EtherType 0x888E, destination 01:80:C2:00:00:03.</dd>
<dt>MAB</dt><dd>MAC Authentication Bypass: identity ki tarah MAC, Service-Type Call-Check.</dd>
<dt>CWA / LWA</dt><dd>Central WebAuth (ISE portal, MAB plus redirect plus CoA) / Local WebAuth (switch ya WLC portal).</dd>
<dt>dACL</dt><dd>ISE se per session push hone wala downloadable ACL.</dd>
<dt>CoA</dt><dd>Change of Authorization, RFC 5176, server-initiated, Cisco par UDP 1700.</dd>
<dt>SGT / SGACL / SXP</dt><dd>16-bit role tag / tags ke beech role-based ACL / TCP 64999 par IP-to-SGT bindings share karne wala protocol.</dd>
<dt>MACsec / MKA</dt><dd>802.1AE hop-by-hop Ethernet encryption / uska key agreement protocol.</dd>
<dt>Talos</dt><dd>Cisco threat intelligence jo saare Cisco security products ko feed karti hai.</dd>
<dt>Retrospective security</dt><dd>Allow hone ke baad files ko dobara evaluate karna, aur verdict badalne par alert karna.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Switch EAP relay karta hai aur kabhi password validate nahi karta; RADIUS server decide karta hai.</li>
<li>Unauthorized port: sirf EAPOL (plus CDP/LLDP).</li>
<li>No-response time = tx-period x (max-reauth-req + 1): default 90 s.</li>
<li>Guest VLAN = koi jawab nahi; auth-fail VLAN = reject; critical VLAN = server dead.</li>
<li>Multi-domain = ek voice plus ek data device; multi-auth = kai, har ek authenticated.</li>
<li>Dynamic VLAN: Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-ID = VLAN; <code>aaa authorization network</code> chahiye; VLAN exist karna chahiye.</li>
<li>EAP-TLS ko client certificates chahiye; PEAP ko sirf server certificate.</li>
<li>Galat shared secret = silent drop aur timeouts; galat password = Access-Reject.</li>
<li>SGACLs egress par enforce hote hain; SXP control plane hai; inline tagging data plane hai.</li>
<li>MACsec layer 2 par hop by hop hai; IPsec layer 3 par end to end.</li>
<li>Wireless: WPA2/WPA3-Enterprise 802.1X use karte hain; WPA3-Personal SAE use karta hai; WPA3 ko PMF chahiye; OWE open networks encrypt karta hai.</li>
<li>IDS sirf copy par alert karta hai; IPS inline hai aur drop kar sakta hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr>
<tr><td>AAA aur RADIUS enable</td><td><code>aaa new-model</code>; <code>radius server ISE</code>, <code>address ipv4 10.99.99.10 auth-port 1812 acct-port 1813</code>, <code>key NKsecret</code></td></tr>
<tr><td>Method lists</td><td><code>aaa authentication dot1x default group radius</code>; <code>aaa authorization network default group radius</code>; <code>aaa accounting dot1x default start-stop group radius</code></td></tr>
<tr><td>Global 802.1X</td><td><code>dot1x system-auth-control</code></td></tr>
<tr><td>Port</td><td><code>authentication port-control auto</code>, <code>dot1x pae authenticator</code>, <code>mab</code>, <code>authentication order dot1x mab</code>, <code>authentication priority dot1x mab</code>, <code>authentication host-mode multi-domain</code></td></tr>
<tr><td>Timers aur fallbacks</td><td><code>dot1x timeout tx-period 5</code>; <code>authentication event no-response action authorize vlan 50</code>; <code>... fail action next-method</code>; <code>... server dead action authorize vlan 70</code></td></tr>
<tr><td>Monitor mode</td><td><code>authentication open</code></td></tr>
<tr><td>CoA</td><td><code>aaa server radius dynamic-author</code>, <code>client 10.99.99.10 server-key NKsecret</code></td></tr>
<tr><td>TrustSec</td><td><code>cts role-based enforcement</code>; <code>cts role-based sgt-map 10.99.99.10 sgt 99</code>; <code>cts role-based permissions from 50 to 30 NO-PRINT</code></td></tr>
<tr><td>Verify</td><td><code>show authentication sessions [interface g0/1 details]</code>, <code>show dot1x all</code>, <code>show mab all</code>, <code>show aaa servers</code>, <code>show cts role-based sgt-map all</code>, <code>show mka sessions</code></td></tr>
<tr><td>Lab RADIUS server</td><td><code>aaa-server show log</code>, <code>aaa-server show clients</code></td></tr>
</table>

<div class="warn"><p><b>Exam ki common galti.</b> "Switch user ko authenticate karta hai" ya "MAB 802.1X jitna secure hai" chun lena. Switch sirf authenticator hai, aur MAB spoof ho sakne wale MAC address se identification hai.</p></div>

<div class="exam"><p><b>Aakhri exam trap.</b> Padho ki feature kis side par hai. CoA ISE <b>se</b> switch <b>ko</b> jaata hai. SXP <b>speaker</b> se <b>listener</b> ko jaata hai. EAPOL sirf supplicant aur authenticator ke beech hai. Umbrella DNS par kaam karta hai, kisi bhi connection se pehle.</p></div>

<div class="scn"><h4>Ek quarter mein open ports se identity-based access tak</h4><p>Ek retail head office 1,200 open access ports ke saath shuru hua. Pehla mahina: do PSNs ke saath ISE deploy hua, switches monitor mode mein configure hue, aur ISE logs se 180 printers aur 90 cameras ke MAB groups bane. Doosra mahina: laptops par EAP-TLS certificates push hue, pre-auth ACL ke saath low-impact mode, guests ke liye CWA. Teesra mahina: closed mode, Employees, Printers, Cameras aur Guests ke SGTs, aur ek SGACL jo cameras ko video recorder ke alawa kahin jaane nahi deta. Baad mein ek laptop par malware incident firewall se ek ANC quarantine se contain ho gaya.</p><p><b>Seekh:</b> is module ke hisse ek system ki tarah kaam karte hain: visibility, identity, authorization, segmentation aur containment.</p></div>

<div class="iv"><p class="q">"Do minute mein naye campus ke liye network access control design karo."</p><p>Strong answer: redundant PAN/MnT aur kam se kam do PSNs ke saath ISE; AAA, do RADIUS servers, CoA aur critical VLAN wale switches. Corporate devices EAP-TLS use karte hain, printers aur IoT profiling aur least-privilege dACLs ke saath MAB, guests Central WebAuth. Authorization VLANs ya SGTs return karta hai; TrustSec SGACLs role policy enforce karte hain, firewalls pxGrid se wahi SGTs use karte hain. Monitor, low-impact, closed roll out karo. Untrusted links par MACsec, edge par Umbrella aur NGFW, aur visibility ke liye NetFlow analytics jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defense in depth: intelligence, edge, cloud, endpoint, access control, segmentation, encryption, visibility.</li>
<li>ISE decide karta hai; switches aur WLCs VLANs, dACLs aur SGTs se enforce karte hain; CoA decisions live badalta hai.</li>
<li>Managed devices ke liye 802.1X, bina supplicant wale devices ke liye MAB, guests ke liye CWA.</li>
<li>TrustSec IP-based ACLs ko role-based policy se replace karta hai; MACsec links ko hop by hop protect karta hai.</li>
<li>Order mein troubleshoot karo: session, method state, server UP, server log, result apply hua.</li>
</ul></div>
`}};export{e as default};