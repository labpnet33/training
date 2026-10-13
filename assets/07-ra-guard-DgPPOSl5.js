var e={id:`ra-guard`,h:{en:`RA guard: host and router roles, policy checks, verification`,hi:`RA guard: host aur router roles, policy checks, verification`},body:{en:`
<p>Back to the society notice board. The simplest rule is "residents may read the board but not pin notices; only the office may pin". A smarter rule adds checks on the office's notices too: "notices must carry the society stamp and must not change the water timing to midnight". <b>RA guard</b> (RFC 6105) does both. On host ports it drops every Router Advertisement; on router ports it lets RAs through but can check their content.</p>

<h3>The roles</h3>
<table class="cmp"><tr><th>device-role</th><th>Use on</th><th>What happens to RAs and Redirects arriving on the port</th></tr>
<tr><td><b>host</b> (default)</td><td>User, printer, server access ports</td><td>Dropped. RS, NS, NA and data still pass.</td></tr>
<tr><td><b>router</b></td><td>Port towards a real router or FHRP pair</td><td>Allowed, subject to the optional checks below.</td></tr>
<tr><td><b>switch</b></td><td>Trunk to another switch running RA guard</td><td>Allowed; the neighbour switch is expected to filter its own host ports.</td></tr>
<tr><td><b>monitor</b></td><td>Port to an analyser</td><td>For monitoring devices; rarely used.</td></tr>
</table>
<p>A host-role port also drops ICMPv6 <b>Redirects</b>, because only routers send them. The option <code>trusted-port</code> skips all checks for that port.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Lab 1, SW1: all user ports are host ports</span>
ipv6 nd raguard policy HOST-EDGE
 device-role host
!
interface range GigabitEthernet0/1 - 3
 ipv6 nd raguard attach-policy HOST-EDGE
!
<span class="c">! Lab 1, SW2: the port towards R1 is a router port</span>
ipv6 nd raguard policy ROUTER-UPLINK
 device-role router
!
interface GigabitEthernet0/0
 ipv6 nd raguard attach-policy ROUTER-UPLINK</pre>
<p>A quick shortcut, <code>ipv6 nd raguard</code> on an interface without a policy name, applies a default policy with <code>device-role host</code>. Policies can also be attached to VLANs (<code>vlan configuration 10</code>, then <code>ipv6 nd raguard attach-policy HOST-EDGE</code>) or limited to certain VLANs on a trunk with <code>... attach-policy NAME vlan add 10</code>.</p>

<h3>Checks on router-role ports</h3>
<p>On a router port you can make sure even a legitimate-looking RA carries sane values:</p>
<pre class="code">ipv6 nd raguard policy ROUTER-STRICT
 device-role router
 hop-limit minimum 64               <span class="c">! drop RAs advertising Cur Hop Limit below 64</span>
 managed-config-flag on             <span class="c">! RA must have M=1 (DHCPv6-managed VLAN)</span>
 other-config-flag on               <span class="c">! RA must have O=1</span>
 router-preference maximum medium   <span class="c">! drop RAs claiming High preference</span>
 match ra prefix-list ALLOWED-PFX   <span class="c">! only these prefixes may be advertised</span>
 match ipv6 access-list ROUTER-LL   <span class="c">! only these router source addresses</span>
!
ipv6 prefix-list ALLOWED-PFX seq 5 permit 2001:db8:a20::/64
ipv6 access-list ROUTER-LL
 permit ipv6 host FE80::1 any</pre>
<dl class="terms">
<dt>hop-limit minimum / maximum</dt><dd>Checks the <b>Cur Hop Limit field inside the RA</b> (the value hosts will use), not the IP header's hop limit. A malicious RA advertising hop limit 1 would make every host's packets die at the first router.</dd>
<dt>managed-config-flag / other-config-flag on|off</dt><dd>The RA's M and O flags must match. Useful when you know the VLAN is DHCPv6-managed.</dd>
<dt>router-preference maximum</dt><dd>RAs with a higher preference than allowed are dropped, so a second device cannot out-rank your router.</dd>
<dt>match ra prefix-list / match ipv6 access-list</dt><dd>Restrict the advertised prefixes and the permitted router source addresses.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RA guard in lab 1">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="250" y="20" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">SW2</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 router role</text>
<line x1="150" y1="40" x2="250" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="110" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1-3 host role</text>
<line x1="320" y1="60" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="330" y="90" class="svg-muted" font-size="12">trunk</text>
<rect x="40" y="200" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC1 Gi0/1</text>
<rect x="260" y="200" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC2 Gi0/2</text>
<rect x="480" y="200" width="130" height="36" rx="8" fill="#fed7aa"/><text x="545" y="223" text-anchor="middle" class="svg-ink" font-size="12">ROGUE Gi0/3</text>
<line x1="290" y1="150" x2="100" y2="200" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="200" stroke="#64748b" stroke-width="2"/><line x1="350" y1="150" x2="545" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="470" y="170" class="svg-accent" font-size="12">RA 2001:db8:dead:10::/64 dropped</text>
</svg><p class="cap">Lab 1: R1's RAs enter at SW2 Gi0/0 (router role) and reach the PCs; the rogue's RAs die at SW1 Gi0/3 (host role).</p></div>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 nd raguard policy HOST-EDGE
RA guard policy HOST-EDGE configuration: 
  device-role host
Policy HOST-EDGE is applied on the following targets: 
Target               Type  Policy               Feature        Target range
Gi0/1                PORT  HOST-EDGE            RA guard       vlan all
Gi0/2                PORT  HOST-EDGE            RA guard       vlan all
Gi0/3                PORT  HOST-EDGE            RA guard       vlan all
<span class="hl">  Messages dropped by this policy: 6 (Gi0/3: 6)</span>

%SISF-4-PAK_DROP: Message dropped A: FE80::5054:FF:FEAB:CD03 P: [NDP::RA] M: 5254.00ab.cd03 V: 10 I: Gi0/3 Reason: Packet not authorized on port</pre>
<p>The drop counter per port is how the lab checks your work; on a real switch use <code>show ipv6 snooping counters interface Gi0/3</code> (or <code>show device-tracking counters interface</code>) and the <code>%SISF-4-PAK_DROP</code> syslog.</p>

<h3>Limits you must know</h3>
<ul>
<li><b>Existing host state.</b> RA guard stops <b>new</b> RAs. Hosts keep the rogue prefix and gateway until their lifetimes expire or they solicit again (in the lab: <code>ip auto</code>; on Windows, disable and enable the adapter).</li>
<li><b>Evasion with extension headers.</b> RFC 7113 describes RAs hidden behind IPv6 extension headers or split across fragments so a simple switch cannot find the ICMPv6 header. Modern implementations drop such RAs; you can add an IPv6 port ACL with <code>deny ipv6 any any undetermined-transport</code> on host ports so packets whose upper layer cannot be identified are dropped.</li>
<li><b>Only on the switch that sees the ingress.</b> RA guard on the distribution switch cannot protect two hosts on the same access switch from each other.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Before the fix, PC1 shows <code>GLOBAL SCOPE : 2001:db8:dead:10:250:79ff:fe66:6801/64</code> and <code>ROUTER LINK-LAYER : 52:54:00:ab:cd:03</code>. That MAC is on SW1 Gi0/3. After attaching HOST-EDGE and running <code>ip auto</code> again, PC1 builds 2001:db8:a10::250:79ff:fe66:6801/64 and its gateway is R1's link-local; the policy shows drops only on Gi0/3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Attaching the host policy with <code>interface range g0/0 - 3</code> on SW1, including the trunk. Now R1's RAs arriving from SW2 are dropped at SW1 Gi0/0 and every PC loses its gateway. Host role goes on host ports only.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>hop-limit</code> options check the hop limit value the RA <b>advertises</b>, not the 255 in the IP header. And the default role, when you use <code>ipv6 nd raguard</code> with no policy, is <b>host</b>.</p></div>

<div class="scn"><h4>The FHRP pair that went silent</h4><p>A team deployed RA guard with a template that put <code>device-role host</code> on every access port. Two VLANs whose gateways were a pair of routers connected directly to access ports (not through the distribution layer) lost IPv6. <code>show ipv6 nd raguard policy</code> showed thousands of drops on the two router ports. The fix was a second policy with <code>device-role router</code> for those ports, plus <code>router-preference maximum</code> and a prefix-list so they could not advertise anything unexpected.</p><p><b>Lesson:</b> find every real router port before rollout; FHRP pairs mean two router ports per VLAN.</p></div>

<div class="iv"><p class="q">"How does RA guard work, and what can you check on router-facing ports?"</p><p>RA guard classifies ports by role. On host-role ports every RA and Redirect is dropped. On router-role ports RAs pass, and the policy can enforce a minimum or maximum advertised hop limit, the M and O flags, a maximum router preference, allowed prefixes via a prefix list and allowed router sources via an ACL. Add the limits: existing host state is not cleaned, and extension-header evasion needs mitigations like dropping undetermined-transport packets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host role (default) drops all RAs and Redirects; router role allows RAs with optional checks.</li>
<li>Policy: <code>ipv6 nd raguard policy NAME</code>, then <code>ipv6 nd raguard attach-policy NAME</code> on ports or VLANs.</li>
<li>Router-port checks: hop-limit, managed/other-config-flag, router-preference maximum, prefix-list, access-list.</li>
<li>Verify with <code>show ipv6 nd raguard policy</code>, counters and %SISF-4-PAK_DROP.</li>
<li>Hosts keep rogue state until they re-solicit; never put host role on the uplink.</li>
</ul></div>
`,hi:`
<p>Wapas society notice board par chalo. Sabse simple rule hai "residents board padh sakte hain par notice nahi laga sakte; sirf office lagata hai". Ek smart rule office ke notices par bhi checks lagata hai: "notice par society ki mohar honi chahiye aur paani ka time aadhi raat nahi kar sakta". <b>RA guard</b> (RFC 6105) dono karta hai. Host ports par har Router Advertisement drop karta hai; router ports par RAs ko jaane deta hai par unka content check kar sakta hai.</p>

<h3>Roles</h3>
<table class="cmp"><tr><th>device-role</th><th>Kahan use karo</th><th>Port par aane wale RAs aur Redirects ka kya hota hai</th></tr>
<tr><td><b>host</b> (default)</td><td>User, printer, server access ports</td><td>Drop. RS, NS, NA aur data phir bhi jaate hain.</td></tr>
<tr><td><b>router</b></td><td>Asli router ya FHRP pair ki taraf wala port</td><td>Allowed, neeche diye optional checks ke saath.</td></tr>
<tr><td><b>switch</b></td><td>RA guard chalane wale doosre switch ka trunk</td><td>Allowed; padosi switch apne host ports khud filter karta hai.</td></tr>
<tr><td><b>monitor</b></td><td>Analyser ka port</td><td>Monitoring devices ke liye; kam use hota hai.</td></tr>
</table>
<p>Host-role port ICMPv6 <b>Redirects</b> bhi drop karta hai, kyunki unhe sirf routers bhejte hain. Option <code>trusted-port</code> us port ke saare checks skip kar deta hai.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Lab 1, SW1: saare user ports host ports hain</span>
ipv6 nd raguard policy HOST-EDGE
 device-role host
!
interface range GigabitEthernet0/1 - 3
 ipv6 nd raguard attach-policy HOST-EDGE
!
<span class="c">! Lab 1, SW2: R1 ki taraf wala port router port hai</span>
ipv6 nd raguard policy ROUTER-UPLINK
 device-role router
!
interface GigabitEthernet0/0
 ipv6 nd raguard attach-policy ROUTER-UPLINK</pre>
<p>Ek quick shortcut, interface par bina policy naam ke <code>ipv6 nd raguard</code>, <code>device-role host</code> wali default policy laga deta hai. Policies VLANs par bhi attach ho sakti hain (<code>vlan configuration 10</code>, phir <code>ipv6 nd raguard attach-policy HOST-EDGE</code>) ya trunk par kuch VLANs tak seemit ki ja sakti hain <code>... attach-policy NAME vlan add 10</code> se.</p>

<h3>Router-role ports par checks</h3>
<p>Router port par aap pakka kar sakte ho ki asli dikhne wale RA mein bhi sahi values hon:</p>
<pre class="code">ipv6 nd raguard policy ROUTER-STRICT
 device-role router
 hop-limit minimum 64               <span class="c">! 64 se kam Cur Hop Limit wale RAs drop</span>
 managed-config-flag on             <span class="c">! RA mein M=1 hona chahiye (DHCPv6-managed VLAN)</span>
 other-config-flag on               <span class="c">! RA mein O=1 hona chahiye</span>
 router-preference maximum medium   <span class="c">! High preference claim karne wale RAs drop</span>
 match ra prefix-list ALLOWED-PFX   <span class="c">! sirf yeh prefixes advertise ho sakte hain</span>
 match ipv6 access-list ROUTER-LL   <span class="c">! sirf yeh router source addresses</span>
!
ipv6 prefix-list ALLOWED-PFX seq 5 permit 2001:db8:a20::/64
ipv6 access-list ROUTER-LL
 permit ipv6 host FE80::1 any</pre>
<dl class="terms">
<dt>hop-limit minimum / maximum</dt><dd><b>RA ke andar ka Cur Hop Limit field</b> check karta hai (jo value hosts use karenge), IP header ka hop limit nahi. Hop limit 1 advertise karne wala malicious RA har host ke packets ko pehle router par hi maar dega.</dd>
<dt>managed-config-flag / other-config-flag on|off</dt><dd>RA ke M aur O flags match hone chahiye. Tab useful jab aap jaante ho ki VLAN DHCPv6-managed hai.</dd>
<dt>router-preference maximum</dt><dd>Allowed se zyada preference wale RAs drop hote hain, taaki koi doosra device aapke router se upar rank na kare.</dd>
<dt>match ra prefix-list / match ipv6 access-list</dt><dd>Advertise hone wale prefixes aur allowed router source addresses ko seemit karte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 1 mein RA guard">
<rect x="30" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="250" y="20" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">SW2</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 router role</text>
<line x1="150" y1="40" x2="250" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="110" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1-3 host role</text>
<line x1="320" y1="60" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="330" y="90" class="svg-muted" font-size="12">trunk</text>
<rect x="40" y="200" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC1 Gi0/1</text>
<rect x="260" y="200" width="120" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">PC2 Gi0/2</text>
<rect x="480" y="200" width="130" height="36" rx="8" fill="#fed7aa"/><text x="545" y="223" text-anchor="middle" class="svg-ink" font-size="12">ROGUE Gi0/3</text>
<line x1="290" y1="150" x2="100" y2="200" stroke="#64748b" stroke-width="2"/><line x1="320" y1="150" x2="320" y2="200" stroke="#64748b" stroke-width="2"/><line x1="350" y1="150" x2="545" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="470" y="170" class="svg-accent" font-size="12">RA 2001:db8:dead:10::/64 drop</text>
</svg><p class="cap">Lab 1: R1 ke RAs SW2 Gi0/0 (router role) par ghuste hain aur PCs tak pahunchte hain; rogue ke RAs SW1 Gi0/3 (host role) par mar jaate hain.</p></div>

<h3>Verification</h3>
<pre class="out">SW1# show ipv6 nd raguard policy HOST-EDGE
RA guard policy HOST-EDGE configuration: 
  device-role host
Policy HOST-EDGE is applied on the following targets: 
Target               Type  Policy               Feature        Target range
Gi0/1                PORT  HOST-EDGE            RA guard       vlan all
Gi0/2                PORT  HOST-EDGE            RA guard       vlan all
Gi0/3                PORT  HOST-EDGE            RA guard       vlan all
<span class="hl">  Messages dropped by this policy: 6 (Gi0/3: 6)</span>

%SISF-4-PAK_DROP: Message dropped A: FE80::5054:FF:FEAB:CD03 P: [NDP::RA] M: 5254.00ab.cd03 V: 10 I: Gi0/3 Reason: Packet not authorized on port</pre>
<p>Per-port drop counter se lab aapka kaam check karti hai; asli switch par <code>show ipv6 snooping counters interface Gi0/3</code> (ya <code>show device-tracking counters interface</code>) aur <code>%SISF-4-PAK_DROP</code> syslog use karo.</p>

<h3>Limits jo aapko pata hone chahiye</h3>
<ul>
<li><b>Host ki purani state.</b> RA guard <b>naye</b> RAs rokta hai. Hosts rogue prefix aur gateway tab tak rakhte hain jab tak lifetimes expire na hon ya woh dobara solicit na karein (lab mein: <code>ip auto</code>; Windows par adapter disable aur enable karo).</li>
<li><b>Extension headers se evasion.</b> RFC 7113 aise RAs describe karta hai jo IPv6 extension headers ke peeche chhupe hon ya fragments mein bante hon, taaki simple switch ICMPv6 header na dhoondh sake. Modern implementations aise RAs drop karte hain; aap host ports par <code>deny ipv6 any any undetermined-transport</code> wala IPv6 port ACL jod sakte ho taaki jin packets ka upper layer pehchana na ja sake woh drop hon.</li>
<li><b>Sirf us switch par jo ingress dekhta hai.</b> Distribution switch par RA guard same access switch ke do hosts ko ek doosre se nahi bacha sakta.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Fix se pehle PC1 <code>GLOBAL SCOPE : 2001:db8:dead:10:250:79ff:fe66:6801/64</code> aur <code>ROUTER LINK-LAYER : 52:54:00:ab:cd:03</code> dikhata hai. Woh MAC SW1 Gi0/3 par hai. HOST-EDGE attach karke dobara <code>ip auto</code> chalane ke baad PC1 2001:db8:a10::250:79ff:fe66:6801/64 banata hai aur uska gateway R1 ka link-local hai; policy sirf Gi0/3 par drops dikhati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> SW1 par <code>interface range g0/0 - 3</code> se host policy attach karna, trunk samet. Ab SW2 se aane wale R1 ke RAs SW1 Gi0/0 par drop hote hain aur har PC ka gateway chala jaata hai. Host role sirf host ports par jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>hop-limit</code> options woh hop limit value check karte hain jo RA <b>advertise</b> karta hai, IP header ka 255 nahi. Aur jab aap bina policy <code>ipv6 nd raguard</code> use karte ho to default role <b>host</b> hai.</p></div>

<div class="scn"><h4>FHRP pair jo chup ho gaya</h4><p>Ek team ne RA guard aise template se deploy kiya jo har access port par <code>device-role host</code> lagata tha. Do VLANs, jinke gateways routers ka ek pair tha jo seedhe access ports se jude the (distribution layer ke through nahi), ka IPv6 chala gaya. <code>show ipv6 nd raguard policy</code> ne do router ports par hazaaron drops dikhaye. Fix tha un ports ke liye <code>device-role router</code> wali doosri policy, plus <code>router-preference maximum</code> aur ek prefix-list taaki woh kuch unexpected advertise na kar sakein.</p><p><b>Seekh:</b> rollout se pehle har asli router port dhoondho; FHRP pair matlab har VLAN mein do router ports.</p></div>

<div class="iv"><p class="q">"RA guard kaise kaam karta hai, aur router-facing ports par aap kya check kar sakte ho?"</p><p>RA guard ports ko role se classify karta hai. Host-role ports par har RA aur Redirect drop hota hai. Router-role ports par RAs jaate hain, aur policy advertised hop limit ka minimum ya maximum, M aur O flags, maximum router preference, prefix list se allowed prefixes aur ACL se allowed router sources enforce kar sakti hai. Limits bhi batao: host ki purani state saaf nahi hoti, aur extension-header evasion ke liye undetermined-transport packets drop karne jaise mitigations chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host role (default) saare RAs aur Redirects drop karta hai; router role optional checks ke saath RAs allow karta hai.</li>
<li>Policy: <code>ipv6 nd raguard policy NAME</code>, phir ports ya VLANs par <code>ipv6 nd raguard attach-policy NAME</code>.</li>
<li>Router-port checks: hop-limit, managed/other-config-flag, router-preference maximum, prefix-list, access-list.</li>
<li><code>show ipv6 nd raguard policy</code>, counters aur %SISF-4-PAK_DROP se verify karo.</li>
<li>Hosts dobara solicit karne tak rogue state rakhte hain; uplink par kabhi host role mat lagao.</li>
</ul></div>
`}};export{e as default};