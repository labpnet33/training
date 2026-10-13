var e={id:`acls-and-port-protection`,h:{en:`Switch ACLs and port protection: filtering on the core and securing the edge`,hi:`Switch ACLs aur port protection: core par filtering aur edge ki suraksha`},body:{en:`
<h3>Why a switch can filter traffic</h3>
<p>A normal switch only moves frames inside one VLAN. The core switch SW-MUM does more: it holds a routed interface for each of the VLANs 10 and 20, called an <b>SVI</b> (switch virtual interface). An SVI is the switch's own address in a VLAN (for example 10.1.10.2, illustrative) and it lets the switch <b>route</b> between VLANs 10 and 20 without sending the traffic to the MX first. Because the traffic is routed on the switch, the switch is also the right place to filter it. The tool for that is an <b>ACL</b> (access control list): an ordered list of permit or deny rules.</p>

<h3>The ACL rule format and the one law</h3>
<p>A switch ACL rule on the <b>Switch ACL and STP</b> page has a <b>policy</b> (Allow or Deny), a <b>protocol</b>, a <b>source</b> and a <b>destination</b>. As in the firewall chapter in mk-mx, the rules are read <b>top to bottom and the first match wins</b>. The order is the policy. Read the last (default) row on the page as well, because unmatched traffic gets that action.</p>
<p>Bharat Retail Co's intent for Mumbai: staff in VLAN 10 may use only the main server 10.1.20.10; the rest of the server VLAN (backup and admin hosts) is not for staff. We write that as two rules.</p>
<pre class="out">Switch ACL and STP  (network: Mumbai HQ, device: SW-MUM)
#  Policy  Protocol  Source         Destination     Hits
1  Allow   any       10.1.10.0/24   10.1.20.10/32   <span class="hl">1,840</span>
2  Deny    any       10.1.10.0/24   10.1.20.0/24    <span class="hl">57</span>
D  Allow   any       any            any             6,310  (default)</pre>
<p>Rule 1 is the narrow permit and must come first. Rule 2 is the wider deny and catches everything else from VLAN 10 to VLAN 20. If you swap them, rule 2 would deny the main server too and rule 1 would show zero hits.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ACL on core SVIs for VLAN 10 and 20">
<rect x="20" y="20" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="85" y="44" text-anchor="middle" class="svg-ink" font-size="13">Staff PC</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10, 10.1.10.x</text>
<rect x="240" y="10" width="160" height="150" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM core</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">SVI VLAN 10</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">SVI VLAN 20</text>
<rect x="260" y="98" width="120" height="50" rx="6" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">ACL: 1 Allow .10</text><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">2 Deny VLAN 20</text>
<rect x="500" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">SRV-MUM</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10 allowed</text>
<rect x="500" y="100" width="120" height="56" rx="8" fill="#fecaca"/><text x="560" y="124" text-anchor="middle" class="svg-ink" font-size="13">Other hosts</text><text x="560" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.x denied</text>
<line x1="150" y1="48" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="500" y2="48" stroke="#16a34a" stroke-width="2"/><line x1="400" y1="130" x2="500" y2="128" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="20" y="180" width="600" height="36" rx="6" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">First match wins: narrow permit above, wide deny below</text>
</svg><p class="cap">The ACL is applied where VLAN 10 and VLAN 20 are routed: on the core SVIs.</p></div>

<h3>Port protection ideas</h3>
<p>An ACL guards what traffic may <i>cross between</i> VLANs. <b>Port protection</b> guards what may <i>connect</i> to the switch. Combine these ideas:</p>
<ul>
<li><b>Disable unused ports</b> (Enabled = no). A closed door cannot be used.</li>
<li><b>Use access, not trunk, on user ports</b>, so a user cannot tag frames into other VLANs.</li>
<li><b>BPDU guard on access ports</b> (chapter 3), so a rogue switch is err-disabled.</li>
<li><b>PoE only where an AP or phone needs it.</b> Powered ports are more valuable to an attacker and use budget.</li>
<li><b>Keep user VLANs off the native VLAN</b> and keep the native VLAN equal to the management VLAN, 99 in our design, on switch-to-switch links.</li>
<li><b>Name and tag ports</b> (ap, uplink, staff, server) so an odd entry stands out in review.</li>
<li><b>Review the event log</b> for who changed ports.</li>
</ul>
<p>Other controls, such as limits on how many MAC addresses a port may learn or per-port authentication, exist in real products; which of them are available and how they are named is in the vendor documentation, and this simulator does not model them.</p>

<div class="eg"><p><b>Worked example.</b> A staff PC (10.1.10.50) opens the main server 10.1.20.10: rule 1 matches, Allow, hits rise. The same PC pings the backup host 10.1.20.20: rule 1 does not match (different destination), rule 2 matches, Deny. A guest-VLAN PC is unaffected because the ACL only matches source 10.1.10.0/24.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Adding a rule changes which routed packets between VLAN 10 and 20 the switch forwards or drops, from the moment you save. It does not change VLANs, ports or STP. Because the MX also has a firewall, traffic crossing both is subject to both; keep the intent consistent so troubleshooting stays simple.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Wide deny above narrow permit; source and destination reversed; testing from the wrong VLAN; forgetting the default row; blocking something management needs.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The permit rule has zero hits." A deny above it matches first, or the traffic never arrives (wrong VLAN or the destination differs). Check the order.</p></div>

<div class="scn"><h4>The finance share nobody should see</h4><p>An audit found staff laptops reading a backup share at 10.1.20.20 in Mumbai. The ACL had only an allow-all rule. The engineer added a permit for 10.1.20.10 first and a deny for the rest of VLAN 20 second. Hits on the deny rule rose and the share was no longer reachable from staff VLAN.</p><p><b>Lesson:</b> least privilege on the core is cheap and visible in hit counters.</p></div>

<div class="iv"><p class="q">"How would you restrict VLAN 10 so it reaches only one server in VLAN 20?"</p><p>Strong answer: apply an ACL where the VLANs are routed, the core SVI. Put a narrow permit for the one server first, then a deny for the rest of the server subnet; first match wins, and I verify with hit counters and a test from a staff PC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The core SW-MUM routes VLAN 10 and 20 through SVIs, so ACLs apply there.</li>
<li>ACL rules are Allow or Deny with protocol, source and destination; first match wins.</li>
<li>Narrow permits go above wide denies; read hit counters and the default row.</li>
<li>Port protection: disable unused ports, access on user ports, BPDU guard, PoE only where needed.</li>
<li>Product-specific extras are in the vendor documentation.</li>
</ul></div>
`,hi:`
<h3>Switch traffic filter kyun kar sakta hai</h3>
<p>Normal switch sirf ek VLAN ke andar frames move karta hai. Core switch SW-MUM zyada karta hai: uske paas VLAN 10 aur 20 ke har ek ke liye routed interface hai, jise <b>SVI</b> (switch virtual interface) kehte hain. SVI VLAN mein switch ka apna address hai (jaise 10.1.10.2, illustrative) aur woh switch ko VLAN 10 aur 20 ke beech <b>route</b> karne deta hai bina traffic pehle MX ko bheje. Kyunki traffic switch par route hota hai, switch hi use filter karne ki sahi jagah hai. Uska tool <b>ACL</b> (access control list) hai: permit ya deny rules ki ordered list.</p>

<h3>ACL rule format aur ek kanoon</h3>
<p><b>Switch ACL and STP</b> page par switch ACL rule ki ek <b>policy</b> (Allow ya Deny), ek <b>protocol</b>, ek <b>source</b> aur ek <b>destination</b> hoti hai. mk-mx ke firewall chapter ki tarah, rules <b>upar se neeche padhe jaate hain aur pehla match jeetta hai</b>. Order hi policy hai. Page ki last (default) row bhi padho, kyunki unmatched traffic ko wahi action milta hai.</p>
<p>Mumbai ke liye Bharat Retail Co ka intent: VLAN 10 ka staff sirf main server 10.1.20.10 use kar sakta hai; server VLAN ka baaki hissa (backup aur admin hosts) staff ke liye nahi hai. Hum yeh do rules mein likhte hain.</p>
<pre class="out">Switch ACL and STP  (network: Mumbai HQ, device: SW-MUM)
#  Policy  Protocol  Source         Destination     Hits
1  Allow   any       10.1.10.0/24   10.1.20.10/32   <span class="hl">1,840</span>
2  Deny    any       10.1.10.0/24   10.1.20.0/24    <span class="hl">57</span>
D  Allow   any       any            any             6,310  (default)</pre>
<p>Rule 1 narrow permit hai aur pehle aana chahiye. Rule 2 wider deny hai aur VLAN 10 se VLAN 20 ka baaki sab pakadta hai. Agar swap karo to rule 2 main server ko bhi deny kar dega aur rule 1 ke hits zero ho jaayenge.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Core SVIs par VLAN 10 aur 20 ke liye ACL">
<rect x="20" y="20" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="85" y="44" text-anchor="middle" class="svg-ink" font-size="13">Staff PC</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10, 10.1.10.x</text>
<rect x="240" y="10" width="160" height="150" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM core</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">SVI VLAN 10</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">SVI VLAN 20</text>
<rect x="260" y="98" width="120" height="50" rx="6" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">ACL: 1 Allow .10</text><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">2 Deny VLAN 20</text>
<rect x="500" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">SRV-MUM</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10 allowed</text>
<rect x="500" y="100" width="120" height="56" rx="8" fill="#fecaca"/><text x="560" y="124" text-anchor="middle" class="svg-ink" font-size="13">Other hosts</text><text x="560" y="142" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.x denied</text>
<line x1="150" y1="48" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="500" y2="48" stroke="#16a34a" stroke-width="2"/><line x1="400" y1="130" x2="500" y2="128" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="20" y="180" width="600" height="36" rx="6" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">Pehla match jeetta hai: upar narrow permit, neeche wide deny</text>
</svg><p class="cap">ACL wahan lagta hai jahan VLAN 10 aur VLAN 20 route hote hain: core SVIs par.</p></div>

<h3>Port protection ke ideas</h3>
<p>ACL guard karta hai ki VLANs ke <i>beech</i> kaunsa traffic guzar sakta hai. <b>Port protection</b> guard karta hai ki switch se kya <i>connect</i> ho sakta hai. Yeh ideas milao:</p>
<ul>
<li><b>Unused ports disable karo</b> (Enabled = no). Band darwaza use nahi ho sakta.</li>
<li><b>User ports par trunk nahi, access use karo</b>, taaki user doosri VLANs mein frames tag na kar sake.</li>
<li><b>Access ports par BPDU guard</b> (chapter 3), taaki rogue switch err-disabled ho.</li>
<li><b>PoE sirf wahan jahan AP ya phone ko chahiye.</b> Powered ports attacker ke liye zyada keemti hain aur budget use karte hain.</li>
<li><b>User VLANs ko native VLAN se door rakho</b> aur switch-to-switch links par native VLAN ko management VLAN ke barabar rakho, humare design mein 99.</li>
<li><b>Ports ko name aur tag karo</b> (ap, uplink, staff, server) taaki review mein ajeeb entry alag dikhe.</li>
<li><b>Event log review karo</b> ki ports kisne badle.</li>
</ul>
<p>Doosre controls, jaise port kitne MAC addresses seekh sakta hai uski limit ya per-port authentication, real products mein hote hain; kaunse available hain aur unke naam kya hain yeh vendor documentation mein hai, aur yeh simulator unhe model nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Staff PC (10.1.10.50) main server 10.1.20.10 kholta hai: rule 1 match, Allow, hits badhte hain. Wahi PC backup host 10.1.20.20 ko ping karta hai: rule 1 match nahi karta (destination alag), rule 2 match karta hai, Deny. Guest-VLAN PC par asar nahi padta kyunki ACL sirf source 10.1.10.0/24 match karta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Rule add karne se save hone ke baad se VLAN 10 aur 20 ke beech routed packets mein se switch kaunse forward ya drop karta hai woh badalta hai. VLANs, ports ya STP nahi badalte. Kyunki MX par bhi firewall hai, dono se guzarne wale traffic par dono lagte hain; intent consistent rakho taaki troubleshooting simple rahe.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Narrow permit ke upar wide deny; source aur destination ulte; galat VLAN se test; default row bhool jaana; management ko chahiye wo cheez block kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Permit rule ke zero hits hain." Uske upar ka deny pehle match ho raha hai, ya traffic pahunch hi nahi raha (galat VLAN ya destination alag). Order check karo.</p></div>

<div class="scn"><h4>Finance share jo koi na dekhe</h4><p>Audit mein dikha ki staff laptops Mumbai mein 10.1.20.20 ka backup share padh rahe the. ACL mein sirf allow-all rule tha. Engineer ne pehle 10.1.20.10 ke liye permit aur doosre number par VLAN 20 ke baaki ke liye deny joda. Deny rule ke hits badhe aur staff VLAN se share reachable nahi raha.</p><p><b>Seekh:</b> core par least privilege sasta hai aur hit counters mein dikhta hai.</p></div>

<div class="iv"><p class="q">"VLAN 10 ko VLAN 20 ke sirf ek server tak kaise restrict karoge?"</p><p>Strong answer: ACL wahan lagao jahan VLANs route hote hain, core SVI par. Pehle us ek server ke liye narrow permit rakho, phir server subnet ke baaki ke liye deny; pehla match jeetta hai, aur main hit counters aur staff PC se test se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core SW-MUM SVIs ke through VLAN 10 aur 20 route karta hai, isliye ACLs wahin lagte hain.</li>
<li>ACL rules protocol, source aur destination ke saath Allow ya Deny hain; pehla match jeetta hai.</li>
<li>Narrow permits wide denies ke upar; hit counters aur default row padho.</li>
<li>Port protection: unused ports disable, user ports par access, BPDU guard, PoE sirf zaroorat par.</li>
<li>Product-specific extras vendor documentation mein hain.</li>
</ul></div>
`}};export{e as default};