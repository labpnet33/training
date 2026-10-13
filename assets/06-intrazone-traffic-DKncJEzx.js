var e={id:`intrazone-traffic`,h:{en:`Intrazone traffic: allow or deny between members`,hi:`Intrazone traffic: members ke beech allow ya deny`},body:{en:`
<p><b>Intrazone traffic</b> is traffic between two interfaces that belong to the <i>same</i> zone, for example from VLAN10 to VLAN20 when both are in LAN-ZONE. Because zones exist to group interfaces for policy, FortiOS needs a rule for this case, and it is the <code>intrazone</code> attribute of the zone:</p>
<ul>
<li><code>intrazone deny</code> (the <b>default</b>): traffic between members of the zone is blocked.</li>
<li><code>intrazone allow</code>: traffic between members is permitted without any policy.</li>
</ul>
<p>The default surprises people. They build a zone to simplify policy, and suddenly the Staff VLAN cannot reach the Servers VLAN, even though the VLANs were reachable from each other a minute earlier through a policy. The zone changed the rule for traffic <i>inside</i> it.</p>
<h3>Seeing it fail</h3>
<p>The lab state: VLAN10 and VLAN20 are in LAN-ZONE with the default intrazone deny, and a policy lets the zone go out to the internet. PC1 (VLAN 10) tries to reach SRV1 (VLAN 20). Real output from the simulator:</p>
<pre class="code">PC1> ping 10.10.20.10
NK-PUNE-FGT # diagnose sys session list
NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10</pre>
<pre class="out">10.10.20.10 icmp_seq=1 timeout
10.10.20.10 icmp_seq=2 timeout
10.10.20.10 icmp_seq=3 timeout
10.10.20.10 icmp_seq=4 timeout
10.10.20.10 icmp_seq=5 timeout

<span class="hl">total session 0</span>
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Two clues. The session list is empty, so the firewall never created a session. And <code>diagnose firewall iprope lookup</code>, which asks "which policy would this packet match?", answers <b>policy id 0</b>, the implicit deny. Policy id 0 is the signature of "no policy permits this".</p>
<h3>The fix: allow intrazone</h3>
<p>If the members of the zone trust each other, set intrazone to allow:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
NK-PUNE-FGT (LAN-ZONE) # set intrazone allow
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end
PC1> ping 10.10.20.10
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 10.10.20.10 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.10 icmp_seq=2 ttl=63 time=0.600 ms

hook=pre dir=org act=noop 10.10.10.10:19499-&gt;10.10.20.10:8(0.0.0.0:0)
hook=pre dir=reply act=noop 10.10.20.10:19499-&gt;10.10.10.10:0(0.0.0.0:0)
misc=0 <span class="hl">policy_id=0</span> pol_uuid_idx=14 auth_info=0 chk_client_info=0 vd=0</pre>
<p>The ping works. The session shows <code>act=noop</code> (no NAT between internal VLANs) and <code>policy_id=0</code>, which here means "permitted by the zone's intrazone setting, not by a numbered policy". Same number as the deny case, opposite meaning: that is why you must read it together with whether a session exists. Also note that after <code>set intrazone allow</code>, <code>show system zone</code> now prints <code>set intrazone allow</code> because it is no longer the default.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Between zone members the intrazone value decides"><rect x="10" y="30" width="190" height="55" rx="9" fill="#bbf7d0"/><text x="105" y="62.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10 Staff</text><rect x="10" y="105" width="190" height="55" rx="9" fill="#ddd6fe"/><text x="105" y="137.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20 Servers</text><rect x="250" y="25" width="160" height="135" rx="9" fill="#fde68a"/><text x="330" y="89.5" text-anchor="middle" class="svg-ink" font-size="13">LAN-ZONE</text><text x="330" y="106.5" text-anchor="middle" class="svg-muted" font-size="11">intrazone: deny or allow</text><line x1="200" y1="57" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="200" y1="132" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><rect x="450" y="30" width="180" height="55" rx="9" fill="#fecaca"/><text x="540" y="54.5" text-anchor="middle" class="svg-ink" font-size="13">deny: dropped</text><text x="540" y="71.5" text-anchor="middle" class="svg-muted" font-size="11">session list empty</text><rect x="450" y="105" width="180" height="55" rx="9" fill="#bbf7d0"/><text x="540" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">allow: forwarded</text><text x="540" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">policy_id=0, noop</text><line x1="410" y1="70" x2="450" y2="57" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="450" y2="132" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Between zone members the intrazone value decides</p></div>
<h3>Choosing: allow, deny or a different design</h3>
<table class="cmp"><tr><th>Situation</th><th>Choice</th></tr>
<tr><td>Members are equally trusted (classroom VLANs)</td><td>intrazone allow</td></tr>
<tr><td>Members must not talk (guest rooms)</td><td>intrazone deny (default)</td></tr>
<tr><td>Members need controlled access between them (Staff to Servers)</td><td>keep them in separate interfaces or zones and write explicit policies between them</td></tr></table>
<p>The third row matters. Zones are for <i>shared</i> permissions. When Staff may reach only selected Servers services, a zone with intrazone allow is too permissive, and a zone with intrazone deny blocks everything. Use separate interfaces and a policy VLAN10 to VLAN20 with specific services. Note: on real FortiOS, selective intrazone control by a policy whose source and destination are both the zone is described in the documentation; in the simulator a same-zone policy did not override intrazone deny. For exam design questions the safe answer is: separate interfaces and explicit policies when you need granular control.</p>
<div class="eg"><p><b>Worked example.</b> The school has CLASSROOM1 to CLASSROOM5 in a CLASSROOMS zone with intrazone allow, because rooms may share printers. A GUEST zone keeps the default deny so guest devices cannot reach each other. A third zone, STAFF, reaches CLASSROOMS only through an explicit policy that allows selected services. One attribute does the work of many policies.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting intrazone allow just to make a ticket go away without asking who should talk to whom. You may open a path between guests or between a user VLAN and a sensitive VLAN. Decide the trust relationship first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default intrazone value is <b>deny</b>. With deny, traffic between two members of the same zone is dropped; with allow it is permitted without a policy. Intrazone is about traffic <i>between members</i>, not traffic leaving the zone.</p></div>
<div class="scn"><h4>The zone that cut the print server off</h4><p>An engineer grouped Staff and Printers into a zone to save a policy and the print jobs stopped. The old policy Staff to Printers was gone, and the new zone had the default intrazone deny. The session list was empty and iprope lookup said policy id 0. Setting intrazone allow restored printing, and a note was added to the design: Printers and Staff share one trust level.</p><p><b>Lesson:</b> grouping interfaces changes the rule between them; check intrazone when merging policies.</p></div>
<div class="iv"><p class="q">"Traffic between two VLANs in the same zone is blocked. Why, and how do you fix it?"</p><p>The zone's intrazone attribute defaults to deny, which drops traffic between members. I confirm with an empty session list and a policy id 0 result from the iprope lookup. If the VLANs trust each other, I set intrazone allow. If they need selective access, I keep them in separate interfaces or zones and write an explicit policy between them.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intrazone controls traffic between members of the same zone; default deny.</li>
<li>Blocked intrazone traffic leaves no session and shows policy id 0 in the iprope lookup.</li>
<li>Allow suits equally trusted members; deny suits isolated ones.</li>
<li>For controlled access between VLANs, use separate interfaces and explicit policies.</li>
</ul></div>
`,hi:`
<p><b>Intrazone traffic</b> woh traffic hai jo <i>same</i> zone ke do interfaces ke beech hota hai, jaise VLAN10 se VLAN20 jab dono LAN-ZONE mein hon. Zones policy ke liye interfaces ko group karne ke liye hote hain, isliye FortiOS ko is case ke liye rule chahiye, aur woh zone ka <code>intrazone</code> attribute hai:</p>
<ul>
<li><code>intrazone deny</code> (<b>default</b>): zone ke members ke beech traffic block hota hai.</li>
<li><code>intrazone allow</code>: members ke beech traffic bina kisi policy ke permit hota hai.</li>
</ul>
<p>Default logon ko chaunkata hai. Woh policy simple karne ke liye zone banate hain, aur achanak Staff VLAN Servers VLAN tak nahi pahunchta, jabki ek minute pehle policy se woh ek-doosre tak pahunchte the. Zone ne apne <i>andar</i> ke traffic ka rule badal diya.</p>
<h3>Fail hote dekhna</h3>
<p>Lab state: VLAN10 aur VLAN20 default intrazone deny ke saath LAN-ZONE mein hain, aur ek policy zone ko internet tak jaane deti hai. PC1 (VLAN 10) SRV1 (VLAN 20) tak pahunchne ki koshish karta hai. Simulator ka asli output:</p>
<pre class="code">PC1> ping 10.10.20.10
NK-PUNE-FGT # diagnose sys session list
NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10</pre>
<pre class="out">10.10.20.10 icmp_seq=1 timeout
10.10.20.10 icmp_seq=2 timeout
10.10.20.10 icmp_seq=3 timeout
10.10.20.10 icmp_seq=4 timeout
10.10.20.10 icmp_seq=5 timeout

<span class="hl">total session 0</span>
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Do clues. Session list khali hai, yaani firewall ne kabhi session nahi banaya. Aur <code>diagnose firewall iprope lookup</code>, jo poochta hai "yeh packet kaunsi policy se match karega?", <b>policy id 0</b> batata hai, yaani implicit deny. Policy id 0 "koi policy ise permit nahi karti" ka signature hai.</p>
<h3>Fix: intrazone allow karo</h3>
<p>Zone ke members ek-doosre par bharosa karte hon to intrazone ko allow set karo:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
NK-PUNE-FGT (LAN-ZONE) # set intrazone allow
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end
PC1> ping 10.10.20.10
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 10.10.20.10 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.10 icmp_seq=2 ttl=63 time=0.600 ms

hook=pre dir=org act=noop 10.10.10.10:19499-&gt;10.10.20.10:8(0.0.0.0:0)
hook=pre dir=reply act=noop 10.10.20.10:19499-&gt;10.10.10.10:0(0.0.0.0:0)
misc=0 <span class="hl">policy_id=0</span> pol_uuid_idx=14 auth_info=0 chk_client_info=0 vd=0</pre>
<p>Ping chalti hai. Session <code>act=noop</code> (internal VLANs ke beech NAT nahi) aur <code>policy_id=0</code> dikhata hai, jiska yahan matlab hai "zone ki intrazone setting se permit, numbered policy se nahi". Deny case wala hi number, ulta matlab: isliye ise yeh dekhkar padho ki session maujood hai ya nahi. Yeh bhi dhyan do ki <code>set intrazone allow</code> ke baad <code>show system zone</code> ab <code>set intrazone allow</code> print karta hai kyunki woh default nahi raha.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Zone members ke beech intrazone value tay karti hai"><rect x="10" y="30" width="190" height="55" rx="9" fill="#bbf7d0"/><text x="105" y="62.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10 Staff</text><rect x="10" y="105" width="190" height="55" rx="9" fill="#ddd6fe"/><text x="105" y="137.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20 Servers</text><rect x="250" y="25" width="160" height="135" rx="9" fill="#fde68a"/><text x="330" y="89.5" text-anchor="middle" class="svg-ink" font-size="13">LAN-ZONE</text><text x="330" y="106.5" text-anchor="middle" class="svg-muted" font-size="11">intrazone: deny ya allow</text><line x1="200" y1="57" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="200" y1="132" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><rect x="450" y="30" width="180" height="55" rx="9" fill="#fecaca"/><text x="540" y="54.5" text-anchor="middle" class="svg-ink" font-size="13">deny: dropped</text><text x="540" y="71.5" text-anchor="middle" class="svg-muted" font-size="11">session list empty</text><rect x="450" y="105" width="180" height="55" rx="9" fill="#bbf7d0"/><text x="540" y="129.5" text-anchor="middle" class="svg-ink" font-size="13">allow: forwarded</text><text x="540" y="146.5" text-anchor="middle" class="svg-muted" font-size="11">policy_id=0, noop</text><line x1="410" y1="70" x2="450" y2="57" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="450" y2="132" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Zone members ke beech intrazone value tay karti hai</p></div>
<h3>Chunna: allow, deny ya alag design</h3>
<table class="cmp"><tr><th>Situation</th><th>Choice</th></tr>
<tr><td>Members barabar trusted hain (classroom VLANs)</td><td>intrazone allow</td></tr>
<tr><td>Members ko baat nahi karni chahiye (guest rooms)</td><td>intrazone deny (default)</td></tr>
<tr><td>Members ko apne beech controlled access chahiye (Staff se Servers)</td><td>unhe alag interfaces ya zones mein rakho aur beech mein explicit policies likho</td></tr></table>
<p>Teesri row zaroori hai. Zones <i>shared</i> permissions ke liye hain. Staff ko sirf chune hue Servers services tak jaana ho to intrazone allow wala zone bahut permissive hai, aur intrazone deny wala zone sab block karta hai. Alag interfaces aur specific services ke saath policy VLAN10 se VLAN20 use karo. Note: real FortiOS mein aisi policy se jiska source aur destination dono zone ho, selective intrazone control documentation mein described hai; simulator mein same-zone policy ne intrazone deny ko override nahi kiya. Exam design sawaalon ke liye safe jawab: granular control chahiye to alag interfaces aur explicit policies.</p>
<div class="eg"><p><b>Worked example.</b> School mein CLASSROOM1 se CLASSROOM5 intrazone allow ke saath CLASSROOMS zone mein hain, kyunki rooms printers share kar sakte hain. GUEST zone default deny rakhta hai taaki guest devices ek-doosre tak na pahunchein. Teesra zone, STAFF, CLASSROOMS tak sirf explicit policy se pahunchta hai jo chune hue services allow karti hai. Ek attribute kai policies ka kaam karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Ticket hataane ke liye bina poochhe intrazone allow kar dena ki kisko kisse baat karni chahiye. Aap guests ke beech ya user VLAN aur sensitive VLAN ke beech raasta khol sakte ho. Pehle trust relationship tay karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default intrazone value <b>deny</b> hai. Deny ke saath same zone ke do members ke beech traffic drop hota hai; allow ke saath bina policy ke permit hota hai. Intrazone <i>members ke beech</i> ke traffic ke baare mein hai, zone se bahar jaate traffic ke baare mein nahi.</p></div>
<div class="scn"><h4>Zone jisne print server ko kaat diya</h4><p>Ek engineer ne ek policy bachane ke liye Staff aur Printers ko zone mein group kiya aur print jobs ruk gayi. Purani Staff se Printers policy chali gayi thi, aur naye zone mein default intrazone deny tha. Session list khali thi aur iprope lookup ne policy id 0 bataya. Intrazone allow set karne se printing wapas aayi, aur design mein note jodi gayi: Printers aur Staff ek hi trust level share karte hain.</p><p><b>Lesson:</b> interfaces ko group karne se unke beech ka rule badalta hai; policies merge karte waqt intrazone check karo.</p></div>
<div class="iv"><p class="q">"Same zone ke do VLANs ke beech traffic block hai. Kyun aur fix kaise karoge?"</p><p>Zone ka intrazone attribute default deny hota hai, jo members ke beech traffic drop karta hai. Main khali session list aur iprope lookup ke policy id 0 result se confirm karta hoon. VLANs ek-doosre par bharosa karte hon to intrazone allow set karta hoon. Selective access chahiye to unhe alag interfaces ya zones mein rakhta hoon aur beech mein explicit policy likhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intrazone same zone ke members ke beech ke traffic ko control karta hai; default deny.</li>
<li>Block intrazone traffic koi session nahi chhodta aur iprope lookup mein policy id 0 dikhata hai.</li>
<li>Allow barabar trusted members ke liye; deny isolated ones ke liye.</li>
<li>VLANs ke beech controlled access ke liye alag interfaces aur explicit policies use karo.</li>
</ul></div>
`}};export{e as default};