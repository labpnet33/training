var e={id:`policies-with-zones`,h:{en:`Policies with zones and with VLAN interfaces`,hi:`Zones aur VLAN interfaces ke saath policies`},body:{en:`
<p>In nse4-start you learned that a firewall policy matches on ingress interface, egress interface and more. With zones, the ingress or egress can be a <b>zone</b>. This chapter shows both styles side by side, because the exam and real networks use both: a zone policy for shared rules, and an interface-to-interface policy for fine control.</p>
<h3>Style 1: a zone policy to the internet</h3>
<p>Staff and Servers share one internet rule, so the source is the zone. This is the configuration used in the lab state:</p>
<pre class="code">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 1
NK-PUNE-FGT (1) # set name "LAN-ZONE-to-WAN"
NK-PUNE-FGT (1) # set srcintf LAN-ZONE
NK-PUNE-FGT (1) # set dstintf port1
NK-PUNE-FGT (1) # set srcaddr all
NK-PUNE-FGT (1) # set dstaddr all
NK-PUNE-FGT (1) # set action accept
NK-PUNE-FGT (1) # set schedule always
NK-PUNE-FGT (1) # set service ALL
NK-PUNE-FGT (1) # set nat enable
NK-PUNE-FGT (1) # next
NK-PUNE-FGT (policy) # end
PC1> ping 8.8.8.8
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms

hook=post dir=org act=snat 10.10.10.10:19499-&gt;8.8.8.8:8(<span class="hl">203.0.113.2</span>:40001)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0</pre>
<p>The PC in VLAN 10 reaches the internet, translated to the WAN address by policy 1. A host in VLAN 20 would match the same policy. One rule serves both members.</p>
<h3>Style 2: interface to interface</h3>
<p>If the zone did not exist, or if the two VLANs must be treated differently, you write a policy between the VLAN interfaces. Real output with no zone and no policy first, then with one policy from VLAN10 to VLAN20:</p>
<pre class="out">NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 0</span>

(policy 2 added: srcintf VLAN10, dstintf VLAN20, action accept, service ALL)

NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 2</span>

misc=0 <span class="hl">policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0</pre>
<p>The lookup tool shows the difference clearly: before the policy the packet matches id 0 (implicit deny), after it matches policy 2, and the session records <code>policy_id=2</code>. In practice you would narrow <code>service</code> to what Staff really need, such as the application ports on the servers, instead of ALL.</p>
<h3>A rule that FortiOS enforces: members are used through the zone</h3>
<p>After VLAN10 and VLAN20 join LAN-ZONE you cannot name them in a policy any more. Real error:</p>
<pre class="out">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 3
NK-PUNE-FGT (3) # set srcintf port1
NK-PUNE-FGT (3) # set dstintf VLAN10
<span class="hl">entry not found in datasource</span>
value parse error before 'VLAN10'
Command fail. Return code -3</pre>
<p>The member interface is hidden behind its zone. Use <code>LAN-ZONE</code> as the destination instead, or take the interface out of the zone. Note that port1 was accepted because it is <i>not</i> a zone member.</p>
<h3>Choosing between the two styles</h3>
<table class="cmp"><tr><th>Use a zone policy when</th><th>Use interface policies when</th></tr>
<tr><td>members share identical rules to a destination</td><td>each VLAN needs different rules</td></tr>
<tr><td>you want new VLANs to inherit access</td><td>you want every addition reviewed explicitly</td></tr>
<tr><td>the policy list should stay short</td><td>auditors need per-VLAN rule visibility</td></tr></table>
<p>Both can coexist: a zone for the LAN-side VLANs that go to the internet, and explicit interface policies for the sensitive Servers VLAN.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two policy styles, two trade-offs"><rect x="10" y="15" width="280" height="60" rx="9" fill="#bae6fd"/><text x="150" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone policy</text><text x="150" y="59" text-anchor="middle" class="svg-muted" font-size="11">LAN-ZONE to port1 (NAT)</text><rect x="10" y="95" width="280" height="60" rx="9" fill="#bbf7d0"/><text x="150" y="122" text-anchor="middle" class="svg-ink" font-size="13">Interface policy</text><text x="150" y="139" text-anchor="middle" class="svg-muted" font-size="11">VLAN10 to VLAN20 (selected services)</text><rect x="350" y="15" width="280" height="60" rx="9" fill="#fde68a"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">one rule, many members</text><text x="490" y="59" text-anchor="middle" class="svg-muted" font-size="11">short list, inherits</text><rect x="350" y="95" width="280" height="60" rx="9" fill="#ddd6fe"/><text x="490" y="122" text-anchor="middle" class="svg-ink" font-size="13">one rule, one pair</text><text x="490" y="139" text-anchor="middle" class="svg-muted" font-size="11">precise, longer list</text><line x1="290" y1="45" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="290" y1="125" x2="350" y2="125" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Two policy styles, two trade-offs</p></div>
<div class="eg"><p><b>Worked example.</b> Staff and Servers share LAN-ZONE for internet access (policy 1). But Staff must reach only TCP 5432 on the database server in VLAN20. If both VLANs sit in LAN-ZONE with intrazone allow, Staff could reach every port. Better: keep intrazone deny, put them in separate zones or interfaces, and write one precise policy VLAN10 to VLAN20, service PostgreSQL.</p></div>
<div class="warn"><p><b>Common mistake.</b> Building one big zone and forgetting it also controls which interfaces policies can name. Plan zone membership before writing policies; moving an interface later means re-pointing every policy that used it.</p></div>
<div class="exam"><p><b>Exam trap.</b> If an interface is a zone member you reference the zone, not the interface. Exam answers that put a member interface in a policy are wrong. Also remember policies are still first match; zone policies and interface policies share one ordered list.</p></div>
<div class="scn"><h4>The member interface that disappeared</h4><p>A script tried to add a rule "from port1 to VLAN10" and failed with "entry not found in datasource", although VLAN10 clearly existed. VLAN10 had recently joined LAN-ZONE, so only the zone name was valid in policies. Changing the script to use the zone name fixed it.</p><p><b>Lesson:</b> a zone member is addressed through its zone; update automation when you introduce zones.</p></div>
<div class="iv"><p class="q">"When do you use a zone in a policy instead of an interface?"</p><p>When several interfaces share exactly the same rules to a destination, I reference their zone so the policy list stays short and new members inherit it. When interfaces need different permissions, I keep them separate and write interface-to-interface policies. Once an interface is in a zone, policies must name the zone.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy can use a zone as source or destination.</li>
<li>Zone members cannot be named directly in policies.</li>
<li>iprope lookup shows policy id 0 for no match and the real id when permitted.</li>
<li>Use interface policies for fine control, zone policies for shared rules.</li>
</ul></div>
`,hi:`
<p>nse4-start mein aapne seekha ki firewall policy ingress interface, egress interface aur aur cheezon par match karti hai. Zones ke saath ingress ya egress <b>zone</b> ho sakta hai. Yeh chapter dono styles saath dikhata hai, kyunki exam aur real networks dono use karte hain: shared rules ke liye zone policy, aur fine control ke liye interface-to-interface policy.</p>
<h3>Style 1: internet tak zone policy</h3>
<p>Staff aur Servers ka internet rule ek hai, isliye source zone hai. Lab state mein yahi configuration use hui:</p>
<pre class="code">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 1
NK-PUNE-FGT (1) # set name "LAN-ZONE-to-WAN"
NK-PUNE-FGT (1) # set srcintf LAN-ZONE
NK-PUNE-FGT (1) # set dstintf port1
NK-PUNE-FGT (1) # set srcaddr all
NK-PUNE-FGT (1) # set dstaddr all
NK-PUNE-FGT (1) # set action accept
NK-PUNE-FGT (1) # set schedule always
NK-PUNE-FGT (1) # set service ALL
NK-PUNE-FGT (1) # set nat enable
NK-PUNE-FGT (1) # next
NK-PUNE-FGT (policy) # end
PC1> ping 8.8.8.8
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms

hook=post dir=org act=snat 10.10.10.10:19499-&gt;8.8.8.8:8(<span class="hl">203.0.113.2</span>:40001)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0</pre>
<p>VLAN 10 ka PC internet tak pahunchta hai, policy 1 se WAN address mein translate hokar. VLAN 20 ka host usi policy se match karta. Ek rule dono members ko serve karta hai.</p>
<h3>Style 2: interface se interface</h3>
<p>Zone na ho, ya do VLANs ko alag treat karna ho, to aap VLAN interfaces ke beech policy likhte ho. Asli output, pehle zone aur policy ke bina, phir VLAN10 se VLAN20 ki ek policy ke saath:</p>
<pre class="out">NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 0</span>

(policy 2 added: srcintf VLAN10, dstintf VLAN20, action accept, service ALL)

NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
&lt;src [10.10.10.10-0] dst [10.10.20.10-0] proto icmp dev VLAN10&gt; <span class="hl">matches policy id: 2</span>

misc=0 <span class="hl">policy_id=2</span> pol_uuid_idx=16 auth_info=0 chk_client_info=0 vd=0</pre>
<p>Lookup tool farq saaf dikhata hai: policy se pehle packet id 0 (implicit deny) se match hota hai, baad mein policy 2 se, aur session <code>policy_id=2</code> record karta hai. Practice mein aap <code>service</code> ko ALL ki jagah wahi narrow karoge jo Staff ko sach mein chahiye, jaise servers ke application ports.</p>
<h3>Rule jo FortiOS enforce karta hai: members zone ke zariye use hote hain</h3>
<p>VLAN10 aur VLAN20 LAN-ZONE mein aa jaayein to aap unhe policy mein naam se use nahi kar sakte. Asli error:</p>
<pre class="out">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 3
NK-PUNE-FGT (3) # set srcintf port1
NK-PUNE-FGT (3) # set dstintf VLAN10
<span class="hl">entry not found in datasource</span>
value parse error before 'VLAN10'
Command fail. Return code -3</pre>
<p>Member interface apne zone ke peeche chhup jaata hai. Iske bajay destination ke roop mein <code>LAN-ZONE</code> use karo, ya interface ko zone se nikaalo. Dhyan do ki port1 accept hua kyunki woh zone member <i>nahi</i> hai.</p>
<h3>Do styles mein se chunna</h3>
<table class="cmp"><tr><th>Zone policy tab use karo jab</th><th>Interface policies tab jab</th></tr>
<tr><td>members ke destination tak identical rules hon</td><td>har VLAN ko alag rules chahiye</td></tr>
<tr><td>naye VLANs access inherit karein</td><td>har addition explicitly review ho</td></tr>
<tr><td>policy list chhoti rehni chahiye</td><td>auditors ko per-VLAN rule visibility chahiye</td></tr></table>
<p>Dono saath reh sakte hain: internet jaane wale LAN-side VLANs ke liye zone, aur sensitive Servers VLAN ke liye explicit interface policies.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Do policy styles, do trade-offs"><rect x="10" y="15" width="280" height="60" rx="9" fill="#bae6fd"/><text x="150" y="42" text-anchor="middle" class="svg-ink" font-size="13">Zone policy</text><text x="150" y="59" text-anchor="middle" class="svg-muted" font-size="11">LAN-ZONE to port1 (NAT)</text><rect x="10" y="95" width="280" height="60" rx="9" fill="#bbf7d0"/><text x="150" y="122" text-anchor="middle" class="svg-ink" font-size="13">Interface policy</text><text x="150" y="139" text-anchor="middle" class="svg-muted" font-size="11">VLAN10 to VLAN20 (selected services)</text><rect x="350" y="15" width="280" height="60" rx="9" fill="#fde68a"/><text x="490" y="42" text-anchor="middle" class="svg-ink" font-size="13">ek rule, kai members</text><text x="490" y="59" text-anchor="middle" class="svg-muted" font-size="11">chhoti list, inherit karta hai</text><rect x="350" y="95" width="280" height="60" rx="9" fill="#ddd6fe"/><text x="490" y="122" text-anchor="middle" class="svg-ink" font-size="13">ek rule, ek pair</text><text x="490" y="139" text-anchor="middle" class="svg-muted" font-size="11">precise, lambi list</text><line x1="290" y1="45" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="290" y1="125" x2="350" y2="125" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Do policy styles, do trade-offs</p></div>
<div class="eg"><p><b>Worked example.</b> Staff aur Servers internet access ke liye LAN-ZONE share karte hain (policy 1). Par Staff ko VLAN20 ke database server par sirf TCP 5432 tak jaana hai. Dono VLANs LAN-ZONE mein intrazone allow ke saath hon to Staff har port tak pahunch sakta hai. Behtar: intrazone deny rakho, unhe alag zones ya interfaces mein rakho, aur ek precise policy VLAN10 se VLAN20, service PostgreSQL likho.</p></div>
<div class="warn"><p><b>Common mistake.</b> Ek bada zone banana aur bhool jaana ki yeh bhi tay karta hai ki policies kin interfaces ko naam se le sakti hain. Policies likhne se pehle zone membership plan karo; interface ko baad mein hilana matlab har us policy ko re-point karna jo use use karti thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interface zone member ho to aap zone ko refer karte ho, interface ko nahi. Jin exam answers mein member interface policy mein ho woh galat hain. Yeh bhi yaad rakho ki policies abhi bhi first match hain; zone policies aur interface policies ek hi ordered list share karti hain.</p></div>
<div class="scn"><h4>Member interface jo gayab ho gaya</h4><p>Ek script ne "port1 se VLAN10" rule add karne ki koshish ki aur "entry not found in datasource" ke saath fail hui, jabki VLAN10 clearly exist karta tha. VLAN10 haal hi mein LAN-ZONE mein aaya tha, isliye policies mein sirf zone ka naam valid tha. Script ko zone name use karne ke liye badalne se theek hua.</p><p><b>Lesson:</b> zone member ko zone ke zariye address karte hain; zones lane par automation update karo.</p></div>
<div class="iv"><p class="q">"Policy mein interface ki jagah zone kab use karte ho?"</p><p>Jab kai interfaces ke destination tak bilkul same rules hon, main unka zone refer karta hoon taaki policy list chhoti rahe aur naye members use inherit karein. Jab interfaces ko alag permissions chahiye, unhe alag rakhta hoon aur interface-to-interface policies likhta hoon. Interface zone mein aa jaaye to policies ko zone ka naam lena padta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy zone ko source ya destination ki tarah use kar sakti hai.</li>
<li>Zone members ko policies mein seedha naam nahi de sakte.</li>
<li>iprope lookup no match par policy id 0 aur permit hone par asli id dikhata hai.</li>
<li>Fine control ke liye interface policies, shared rules ke liye zone policies.</li>
</ul></div>
`}};export{e as default};