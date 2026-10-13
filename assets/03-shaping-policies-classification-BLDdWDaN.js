var e={id:`shaping-policies-classification`,h:{en:`Shaping policies: classifying traffic by service, application, ISDB, user and DSCP`,hi:`Shaping policies: service, application, ISDB, user aur DSCP se traffic classify karna`},body:{en:`
<p>A shaper is useless until traffic is attached to it. A <b>shaping policy</b> is the rule that says "this traffic gets that shaper, class or marking". It is separate from the firewall policy: the firewall policy decides whether the traffic is <b>allowed</b>; the shaping policy decides how it is <b>treated</b>. Fortinet recommends shaping policies over a shaper inside the firewall policy, and the exam expects it: when both exist, the shaping policy takes precedence.</p>
<h3>What a shaping policy can match</h3>
<table class="cmp"><tr><th>Match field</th><th>Examples</th></tr><tr><td>Interfaces</td><td><code>srcintf</code>, <code>dstintf</code>: interfaces, zones or an SD-WAN zone such as virtual-wan-link</td></tr><tr><td>Addresses</td><td><code>srcaddr</code>, <code>dstaddr</code>, address groups, IPv6 versions</td></tr><tr><td>Service</td><td>SIP, HTTPS, a custom service</td></tr><tr><td>Internet Service Database</td><td><code>internet-service-name</code>, custom or group ISDB entries; replaces destination address and service</td></tr><tr><td>Application</td><td><code>application</code>, <code>app-category</code>, application groups</td></tr><tr><td>Web category</td><td><code>url-category</code> (FortiGuard web filter category)</td></tr><tr><td>Users</td><td><code>users</code> and <code>groups</code> that authenticated on the FortiGate</td></tr><tr><td>DSCP/ToS</td><td><code>tos</code>, <code>tos-mask</code>, <code>tos-negate</code></td></tr><tr><td>Traffic type</td><td><code>traffic-type</code>: forwarding (default), local-in or local-out</td></tr><tr><td>Others</td><td>schedule, ip-version, VLAN CoS</td></tr></table>
<h3>What it can do</h3>
<ul><li>Attach a shared shaper in each direction: <code>traffic-shaper</code> and <code>traffic-shaper-reverse</code>.</li><li>Attach a per-IP shaper: <code>per-ip-shaper</code>.</li><li>Assign a <b>class ID</b> for a shaping profile on the egress interface (chapter 4).</li><li>Mark DSCP: <code>diffserv-forward</code>, <code>diffservcode-forward</code>, and the reverse versions (chapter 5).</li></ul>
<h3>Class IDs</h3>
<p>A class ID is just a number with a name that links a shaping policy to a queue in a profile. Define the names once, then use the numbers. Class IDs start at 2; about thirty classes are available.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: named traffic classes used by the examples of this module</span>
config firewall traffic-class
    edit 2
        set class-name "VOICE"
    next
    edit 3
        set class-name "BUSINESS"
    next
    edit 4
        set class-name "BULK"
    next
end</pre>
<h3>A shaping policy table</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: voice by DSCP, Office 365 by ISDB, backups from the server group</span>
config firewall shaping-policy
    edit 1
        set name "VOICE-EF"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set service "ALL"
        set tos 0xb8
        set tos-mask 0xfc
        set class-id 2
    next
    edit 2
        set name "M365"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set internet-service enable
        set internet-service-name "Microsoft-Office365"
        set class-id 3
    next
    edit 3
        set name "BACKUP-FROM-SERVERS"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "SERVERS"
        set dstaddr "all"
        set service "ALL"
        set traffic-shaper "BULK-30M"
        set class-id 4
    next
end</pre>
<p>Policy 1 matches DSCP EF: <code>tos 0xb8</code> with mask <code>0xfc</code> compares only the six DSCP bits (EF = 46 = binary 101110 = ToS 0xB8). Policy 2 uses the Internet Service Database; pick the exact entry name from the ISDB list of your FortiOS version. Policy 3 uses a shared shaper with a cap and also a class.</p>
<h3>How the table is read</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 VOICE-EF</text><rect x="20" y="70" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="95" text-anchor="middle" class="svg-ink" font-size="12">2 M365</text><rect x="20" y="120" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="145" text-anchor="middle" class="svg-ink" font-size="12">3 BACKUP</text><text x="230" y="45" class="svg-muted" font-size="12">first match wins, top to bottom</text><text x="230" y="95" class="svg-muted" font-size="12">flow matches no policy: not shaped,</text><text x="230" y="115" class="svg-muted" font-size="12">falls to the default class of the profile</text><line x1="170" y1="40" x2="220" y2="40" stroke="#64748b" stroke-width="2"/><text x="230" y="170" class="svg-muted" font-size="12">shaping policy beats a shaper set in the firewall policy</text></svg><p class="cap">Shaping policies are evaluated in order, like firewall policies. Put the specific ones first.</p></div>
<h3>Verifying which policy a session matched</h3>
<pre class="out"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Illustrative output, abridged: documented fields of the session table</span>
BR1-FGT # diagnose sys session filter src 10.1.1.10
BR1-FGT # diagnose sys session list
session info: proto=6 proto_state=01 duration=35 ...
<span class="hl">shaping_policy_id=3</span>
origin-shaper=BULK-30M prio=3 guarantee 0Bps max 3750000Bps</pre>
<p>The session table shows the shaping policy ID and the shaper in use (see nse4-diag for the session filters). A session that was classified before you changed a policy keeps its old treatment: clear the session, or test with a new connection.</p>
<h3>Traps of classification</h3>
<ul><li><b>Application matching needs identification.</b> The FortiGate must see enough packets to know the application; the first packets of a flow may match a later, broader policy (the first-packet behaviour is covered in fsd-rules chapter 5). Prefer ISDB or DSCP for traffic that must be classified from the first packet.</li><li><b>Users and groups</b> only match if the user authenticated in the firewall policy that accepted the traffic.</li><li><b>Direction.</b> A shaping policy matches the original direction of the session; use the reverse shaper or the reverse DSCP code for replies.</li><li><b>Encrypted traffic.</b> Inside an IPsec tunnel the policy sees the inner packet, but the ISP sees only the outer DSCP: chapter 5.</li></ul>
<div class="warn"><p><b>Common mistake.</b> A broad first policy such as "service ALL, class 4" at the top of the table. It matches everything, and the specific voice and M365 policies below it are never reached. Order from specific to general.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping policies are matched top-down, first match wins, and they take precedence over a shaper in the firewall policy. Unclassified traffic goes to the <b>default class</b> of the interface profile. Use the SD-WAN zone name as the destination interface when traffic can leave over several members.</p></div>
<div class="scn"><h4>The voice policy that never matched</h4><p>An engineer created a shaping policy for SIP with the destination interface wan1. After a failover, voice left over wan2 and was no longer shaped. Changing the destination interface to the SD-WAN zone made the policy match whichever member SD-WAN chose.</p><p><b>Lesson:</b> In an SD-WAN design, match the zone, not a single member.</p></div>
<div class="iv"><p class="q">"How do you classify traffic for shaping on a FortiGate?"</p><p>With shaping policies: they match source and destination, service, ISDB entries, applications and categories, users, and DSCP, in order. The action is a shared or per-IP shaper, a class ID for the egress interface profile, or a DSCP marking. I put specific policies first, use ISDB or DSCP where the first packet must be classified, and verify with the session table, which shows the shaping policy ID and shaper.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A shaping policy classifies and attaches a shaper, a class ID or a DSCP; the firewall policy still allows or denies.</li><li>Matches: interfaces, addresses, service, ISDB, application, URL category, users, ToS.</li><li>Evaluated top-down, first match; shaping policy beats a policy-level shaper.</li><li>Match the SD-WAN zone as destination interface.</li><li>Verify with diagnose sys session list (shaping_policy_id, origin-shaper).</li></ul></div>
`,hi:`
<p>Shaper tab tak bekaar hai jab tak traffic usse attach na ho. <b>Shaping policy</b> woh rule hai jo kehta hai "is traffic ko woh shaper, class ya marking milegi". Yeh firewall policy se alag hai: firewall policy tay karti hai ki traffic <b>allowed</b> hai ya nahi; shaping policy tay karti hai ki use kaise <b>treat</b> karna hai. Fortinet firewall policy ke andar shaper ke bajaye shaping policies recommend karta hai, aur exam yahi ummeed karta hai: dono hon to shaping policy ko precedence milti hai.</p>
<h3>Shaping policy kya match kar sakti hai</h3>
<table class="cmp"><tr><th>Match field</th><th>Examples</th></tr><tr><td>Interfaces</td><td><code>srcintf</code>, <code>dstintf</code>: interfaces, zones ya virtual-wan-link jaisa SD-WAN zone</td></tr><tr><td>Addresses</td><td><code>srcaddr</code>, <code>dstaddr</code>, address groups, IPv6 versions</td></tr><tr><td>Service</td><td>SIP, HTTPS, custom service</td></tr><tr><td>Internet Service Database</td><td><code>internet-service-name</code>, custom ya group ISDB entries; destination address aur service ki jagah lete hain</td></tr><tr><td>Application</td><td><code>application</code>, <code>app-category</code>, application groups</td></tr><tr><td>Web category</td><td><code>url-category</code> (FortiGuard web filter category)</td></tr><tr><td>Users</td><td><code>users</code> aur <code>groups</code> jo FortiGate par authenticate hue</td></tr><tr><td>DSCP/ToS</td><td><code>tos</code>, <code>tos-mask</code>, <code>tos-negate</code></td></tr><tr><td>Traffic type</td><td><code>traffic-type</code>: forwarding (default), local-in ya local-out</td></tr><tr><td>Others</td><td>schedule, ip-version, VLAN CoS</td></tr></table>
<h3>Yeh kya kar sakti hai</h3>
<ul><li>Har direction mein shared shaper attach karna: <code>traffic-shaper</code> aur <code>traffic-shaper-reverse</code>.</li><li>Per-IP shaper attach karna: <code>per-ip-shaper</code>.</li><li>Egress interface ke shaping profile ke liye <b>class ID</b> dena (chapter 4).</li><li>DSCP mark karna: <code>diffserv-forward</code>, <code>diffservcode-forward</code>, aur reverse versions (chapter 5).</li></ul>
<h3>Class IDs</h3>
<p>Class ID sirf ek naam wala number hai jo shaping policy ko profile ki queue se jodta hai. Naam ek baar define karo, phir numbers use karo. Class IDs 2 se shuru hote hain; lagbhag tees classes available hain.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: named traffic classes used by the examples of this module</span>
config firewall traffic-class
    edit 2
        set class-name "VOICE"
    next
    edit 3
        set class-name "BUSINESS"
    next
    edit 4
        set class-name "BULK"
    next
end</pre>
<h3>Shaping policy table</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: voice by DSCP, Office 365 by ISDB, backups from the server group</span>
config firewall shaping-policy
    edit 1
        set name "VOICE-EF"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set service "ALL"
        set tos 0xb8
        set tos-mask 0xfc
        set class-id 2
    next
    edit 2
        set name "M365"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set internet-service enable
        set internet-service-name "Microsoft-Office365"
        set class-id 3
    next
    edit 3
        set name "BACKUP-FROM-SERVERS"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "SERVERS"
        set dstaddr "all"
        set service "ALL"
        set traffic-shaper "BULK-30M"
        set class-id 4
    next
end</pre>
<p>Policy 1 DSCP EF match karti hai: <code>tos 0xb8</code> mask <code>0xfc</code> ke saath sirf chhe DSCP bits compare karta hai (EF = 46 = binary 101110 = ToS 0xB8). Policy 2 Internet Service Database use karti hai; exact entry name apne FortiOS version ki ISDB list se chuno. Policy 3 cap wala shared shaper aur class dono use karti hai.</p>
<h3>Table kaise padhi jaati hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 VOICE-EF</text><rect x="20" y="70" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="95" text-anchor="middle" class="svg-ink" font-size="12">2 M365</text><rect x="20" y="120" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="145" text-anchor="middle" class="svg-ink" font-size="12">3 BACKUP</text><text x="230" y="45" class="svg-muted" font-size="12">first match jeet-ta hai, upar se neeche</text><text x="230" y="95" class="svg-muted" font-size="12">flow kisi policy se match na ho: shape nahi,</text><text x="230" y="115" class="svg-muted" font-size="12">profile ki default class par jaata hai</text><line x1="170" y1="40" x2="220" y2="40" stroke="#64748b" stroke-width="2"/><text x="230" y="170" class="svg-muted" font-size="12">shaping policy firewall policy ke shaper ko haraati hai</text></svg><p class="cap">Shaping policies order mein evaluate hoti hain, firewall policies ki tarah. Specific wali pehle rakho.</p></div>
<h3>Verify karna ki session kaun si policy se match hua</h3>
<pre class="out"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Illustrative output, abridged: documented fields of the session table</span>
BR1-FGT # diagnose sys session filter src 10.1.1.10
BR1-FGT # diagnose sys session list
session info: proto=6 proto_state=01 duration=35 ...
<span class="hl">shaping_policy_id=3</span>
origin-shaper=BULK-30M prio=3 guarantee 0Bps max 3750000Bps</pre>
<p>Session table shaping policy ID aur use hota shaper dikhati hai (session filters ke liye nse4-diag dekho). Jo session policy badalne se pehle classify hua tha woh purana treatment rakhta hai: session clear karo, ya nayi connection se test karo.</p>
<h3>Classification ke jaal</h3>
<ul><li><b>Application matching ko identification chahiye.</b> FortiGate ko application jaanne ke liye kaafi packets dekhne padte hain; flow ke pehle packets baad ki broader policy se match ho sakte hain (first-packet behaviour fsd-rules chapter 5 mein hai). Jis traffic ko pehle packet se classify karna ho uske liye ISDB ya DSCP prefer karo.</li><li><b>Users aur groups</b> tabhi match karte hain jab user ne traffic accept karne wali firewall policy mein authenticate kiya ho.</li><li><b>Direction.</b> Shaping policy session ki original direction match karti hai; replies ke liye reverse shaper ya reverse DSCP code use karo.</li><li><b>Encrypted traffic.</b> IPsec tunnel ke andar policy inner packet dekhti hai, par ISP sirf outer DSCP dekhta hai: chapter 5.</li></ul>
<div class="warn"><p><b>Common galti.</b> Table ke top par "service ALL, class 4" jaisi broad pehli policy. Woh sab kuch match karti hai, aur neeche ki specific voice aur M365 policies kabhi reach nahi hotin. Specific se general order mein rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping policies upar se neeche match hoti hain, first match jeet-ta hai, aur woh firewall policy ke shaper par precedence rakhti hain. Unclassified traffic interface profile ki <b>default class</b> par jaata hai. Jab traffic kai members se nikal sakta ho to destination interface mein SD-WAN zone name use karo.</p></div>
<div class="scn"><h4>Voice policy jo kabhi match nahi hui</h4><p>Ek engineer ne SIP ke liye destination interface wan1 wali shaping policy banayi. Failover ke baad voice wan2 se gayi aur shape nahi hui. Destination interface ko SD-WAN zone karne se policy us member se match hone lagi jo SD-WAN ne chuna.</p><p><b>Seekh:</b> SD-WAN design mein zone match karo, ek member nahi.</p></div>
<div class="iv"><p class="q">"FortiGate par shaping ke liye traffic kaise classify karte ho?"</p><p>Shaping policies se: woh source aur destination, service, ISDB entries, applications aur categories, users, aur DSCP ko order mein match karti hain. Action hai shared ya per-IP shaper, egress interface profile ke liye class ID, ya DSCP marking. Main specific policies pehle rakhta hoon, jahan pehle packet se classify karna ho wahan ISDB ya DSCP use karta hoon, aur session table se verify karta hoon, jo shaping policy ID aur shaper dikhati hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Shaping policy classify karti hai aur shaper, class ID ya DSCP attach karti hai; firewall policy phir bhi allow ya deny karti hai.</li><li>Matches: interfaces, addresses, service, ISDB, application, URL category, users, ToS.</li><li>Upar se neeche evaluate, first match; shaping policy policy-level shaper ko haraati hai.</li><li>Destination interface mein SD-WAN zone match karo.</li><li>diagnose sys session list se verify karo (shaping_policy_id, origin-shaper).</li></ul></div>
`}};export{e as default};