var e={id:`nat-overlap-troubleshoot`,h:{en:`Overlapping networks, NAT with redundancy and troubleshooting translations`,hi:`Overlapping networks, redundancy ke saath NAT aur translations troubleshoot karna`},body:{en:`
<p>Two schools merge, and both have a student with roll number 101. If the principal shouts "101, come to the office", two children stand up. The fix is to give each school a prefix for the merged register: school A's 101 becomes A-101 and school B's becomes B-101, while inside their own classrooms the children still answer to 101. That is NAT for <b>overlapping networks</b>: both sides keep their addresses, and the router shows each side a different, unique version of the other.</p>

<h3>Overlapping addresses: translate both directions</h3>
<p>Company A (inside) uses 10.1.1.0/24. It acquires company B (outside), which also uses 10.1.1.0/24. A host 10.1.1.10 in A cannot reach server 10.1.1.20 in B: it thinks the address is on its own LAN and ARPs for it. The solution is to translate <b>inside</b> sources toward B and <b>outside</b> sources toward A:</p>
<pre class="code"><span class="c">! A's hosts appear to B as 172.16.1.x</span>
ip nat inside source static network 10.1.1.0 172.16.1.0 /24
<span class="c">! B's hosts appear to A as 172.17.1.x</span>
ip nat outside source static network 10.1.1.0 172.17.1.0 /24 add-route
!
interface GigabitEthernet0/0
 description to company A
 ip nat inside
interface GigabitEthernet0/1
 description to company B
 ip nat outside</pre>
<p>Now host 10.1.1.10 in A connects to 172.17.1.20. The router translates the destination 172.17.1.20 (outside local) to 10.1.1.20 (outside global) and the source 10.1.1.10 (inside local) to 172.16.1.10 (inside global). All four NAT terms now have different values, which is the one scenario where "outside local" is not equal to "outside global". The <code>add-route</code> keyword installs a route for the outside local range so the router can route the packet before the outside translation happens. Users normally reach B by name, so DNS in A must return 172.17.1.x addresses, either from a separate zone or through DNS rewriting on the router.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Double NAT for overlapping networks">
<rect x="20" y="70" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">Company A</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text><text x="105" y="131" text-anchor="middle" class="svg-muted" font-size="12">sees B as 172.17.1.x</text>
<rect x="245" y="80" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">NAT router</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">inside + outside NAT</text>
<rect x="450" y="70" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">Company B</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.20</text><text x="535" y="131" text-anchor="middle" class="svg-muted" font-size="12">sees A as 172.16.1.x</text>
<line x1="190" y1="105" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><line x1="395" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">10.1.1.10 to 172.17.1.20 becomes 172.16.1.10 to 10.1.1.20</text>
</svg><p class="cap">Double NAT: each side sees a unique, non-overlapping version of the other side.</p></div>

<h3>NAT and gateway redundancy</h3>
<p>If R1 and R2 both run PAT and HSRP moves the gateway from R1 to R2, the existing translations exist only on R1. Long-lived sessions (SSH, VPN clients, voice) break and must reconnect with new translations on R2. For static entries that must follow the gateway, IOS supports tying a static mapping to an HSRP group by name: <code>ip nat inside source static 192.168.20.50 203.0.113.10 redundancy NK-HSRP</code>, with <code>standby 1 name NK-HSRP</code> on the LAN interface. Only the Active router answers ARP for the global address. Full stateful NAT failover, where translation tables are synchronised between routers, depends on platform (box-to-box redundancy on IOS XE routers); for ENCOR it is enough to know that plain PAT is <b>stateless across routers</b>.</p>

<h3>Troubleshooting translations: a method</h3>
<ol>
<li><b>Is the traffic even arriving and matching?</b> Check <code>ip nat inside</code> and <code>ip nat outside</code> on the right interfaces, and that the ACL or route-map matches the real source address (wildcards!).</li>
<li><b>Is a translation created?</b> <code>show ip nat translations</code> while the user generates traffic.</li>
<li><b>Are hits increasing and misses explained?</b> <code>show ip nat statistics</code>: a growing "misses" count with a pool means exhaustion or no match.</li>
<li><b>Does the outside know the way back?</b> The ISP or next router must route the inside global address (or the pool) to you.</li>
<li><b>Order of operations issues:</b> ACLs, crypto and PBR seeing the wrong address.</li>
<li><b>Watch a flow:</b> <code>debug ip nat</code> with an ACL filter on a busy router, then <code>clear ip nat translation *</code> after changes, because old entries keep using the old rule.</li>
</ol>
<pre class="out">R1# show ip nat translations
Pro Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp 203.0.113.2:1024      192.168.20.10:51000   198.51.100.10:443     198.51.100.10:443</span>
--- 203.0.113.10          192.168.20.50         ---                   ---

R1# show ip nat statistics
Total active translations: 2 (1 static, 1 dynamic; 1 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
<span class="hl">Hits: 1520  Misses: 12</span>
Expired translations: 40
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 10 interface GigabitEthernet0/1 refcount 1</pre>

<div class="eg"><p><b>Worked example.</b> A dynamic pool 203.0.113.16 to 203.0.113.30 (15 addresses, no overload) serves 40 users. The first 15 users browse; user 16 gets nothing. <code>show ip nat statistics</code> shows the pool with <code>total addresses 15, allocated 15 (100%), misses 37</code>. Adding <code>overload</code> to the rule, or converting it to PAT, lets all 40 share the pool with unique ports.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the NAT ACL or pool and testing immediately. Existing translations stay until they time out, so the change seems to do nothing. IOS may also refuse to remove a pool that is in use. Clear the translations (in a maintenance window on a busy router) and test again.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>show ip nat translations</code>, the columns are always Inside global, Inside local, Outside local, Outside global in that order. A static entry with no traffic shows dashes for the outside columns. If a question shows outside local different from outside global, outside NAT is configured.</p></div>

<div class="scn"><h4>The pool that nobody routed</h4><p>An enterprise moved its PAT from the interface address to a new public block, pool 203.0.113.64/28, on its edge router. Translations appeared in <code>show ip nat translations</code> and hits went up, yet no web page loaded. The ISP had assigned the block but not routed it toward the customer's link. Replies to 203.0.113.64/28 never arrived. A traceroute from a looking-glass showed the block ending at the ISP core. The ISP added a static route and service returned.</p><p><b>Lesson:</b> a translation in the table only proves the outbound half; the outside world must route the inside global addresses back to you.</p></div>

<div class="iv"><p class="q">"Two companies with the same 10.1.1.0/24 need to talk. How do you do it with NAT?"</p><p>Explain double NAT: translate inside sources with <code>ip nat inside source static network</code> and outside sources with <code>ip nat outside source static network</code>, so each side sees a unique range for the other. Mention <code>add-route</code> or a static route for the outside local range, DNS returning the translated addresses, and that this is the case where outside local differs from outside global. A senior answer adds that renumbering is the long-term fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlapping networks need double NAT: inside source and outside source translations, plus a route and DNS for the outside local range.</li>
<li>Outside local differs from outside global only when outside NAT is used.</li>
<li>Plain PAT is not synchronised between two FHRP routers; static NAT can follow HSRP with the redundancy keyword.</li>
<li>Method: interfaces and ACL, translations, statistics, return route, order of operations, debug and clear.</li>
<li>Pool exhaustion shows as rising misses; overload fixes it.</li>
</ul></div>
`,hi:`
<p>Do schools merge hote hain, aur dono mein roll number 101 wala ek student hai. Agar principal chillaaye "101, office aao", to do bachche khade ho jaate hain. Fix hai merged register ke liye har school ko ek prefix dena: school A ka 101 A-101 ban jaata hai aur school B ka B-101, jabki apni classrooms mein bachche abhi bhi 101 par jawab dete hain. Yahi <b>overlapping networks</b> ke liye NAT hai: dono sides apne addresses rakhti hain, aur router har side ko doosri side ka alag, unique version dikhata hai.</p>

<h3>Overlapping addresses: dono directions translate karo</h3>
<p>Company A (inside) 10.1.1.0/24 use karti hai. Woh company B (outside) ko khareedti hai, jo bhi 10.1.1.0/24 use karti hai. A ka host 10.1.1.10 B ke server 10.1.1.20 tak nahi pahunch sakta: woh sochta hai address uske apne LAN par hai aur uske liye ARP karta hai. Solution hai B ki taraf <b>inside</b> sources aur A ki taraf <b>outside</b> sources translate karna:</p>
<pre class="code"><span class="c">! A ke hosts B ko 172.16.1.x dikhte hain</span>
ip nat inside source static network 10.1.1.0 172.16.1.0 /24
<span class="c">! B ke hosts A ko 172.17.1.x dikhte hain</span>
ip nat outside source static network 10.1.1.0 172.17.1.0 /24 add-route
!
interface GigabitEthernet0/0
 description to company A
 ip nat inside
interface GigabitEthernet0/1
 description to company B
 ip nat outside</pre>
<p>Ab A ka host 10.1.1.10 172.17.1.20 se connect karta hai. Router destination 172.17.1.20 (outside local) ko 10.1.1.20 (outside global) mein aur source 10.1.1.10 (inside local) ko 172.16.1.10 (inside global) mein translate karta hai. Ab chaaron NAT terms ki values alag hain, aur yahi woh ek scenario hai jahan "outside local" "outside global" ke barabar nahi hota. <code>add-route</code> keyword outside local range ke liye route install karta hai taaki router outside translation hone se pehle packet route kar sake. Users aam taur par B tak naam se pahunchte hain, to A ka DNS 172.17.1.x addresses lautaaye, ya alag zone se ya router par DNS rewriting se.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overlapping networks ke liye double NAT">
<rect x="20" y="70" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">Company A</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text><text x="105" y="131" text-anchor="middle" class="svg-muted" font-size="12">B ko 172.17.1.x dekhta</text>
<rect x="245" y="80" width="150" height="50" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">NAT router</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">inside + outside NAT</text>
<rect x="450" y="70" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">Company B</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.20</text><text x="535" y="131" text-anchor="middle" class="svg-muted" font-size="12">A ko 172.16.1.x dekhta</text>
<line x1="190" y1="105" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><line x1="395" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">10.1.1.10 se 172.17.1.20 banta hai 172.16.1.10 se 10.1.1.20</text>
</svg><p class="cap">Double NAT: har side doosri side ka unique, non-overlapping version dekhti hai.</p></div>

<h3>NAT aur gateway redundancy</h3>
<p>Agar R1 aur R2 dono PAT chalaate hain aur HSRP gateway ko R1 se R2 par le jaata hai, to existing translations sirf R1 par hain. Lambe sessions (SSH, VPN clients, voice) toot-te hain aur R2 par nayi translations ke saath reconnect karna padta hai. Jin static entries ko gateway follow karna hai, unke liye IOS static mapping ko naam se HSRP group se jodna support karta hai: <code>ip nat inside source static 192.168.20.50 203.0.113.10 redundancy NK-HSRP</code>, LAN interface par <code>standby 1 name NK-HSRP</code> ke saath. Global address ke liye sirf Active router ARP ka jawab deta hai. Poora stateful NAT failover, jahan translation tables routers ke beech sync hoti hain, platform par depend karta hai (IOS XE routers par box-to-box redundancy); ENCOR ke liye itna jaanna kaafi hai ki plain PAT <b>routers ke beech stateless</b> hai.</p>

<h3>Translations troubleshoot karna: ek method</h3>
<ol>
<li><b>Kya traffic pahunch bhi raha hai aur match ho raha hai?</b> Sahi interfaces par <code>ip nat inside</code> aur <code>ip nat outside</code> check karo, aur ki ACL ya route-map asli source address match karta hai (wildcards!).</li>
<li><b>Kya translation ban rahi hai?</b> Jab user traffic generate kare tab <code>show ip nat translations</code>.</li>
<li><b>Kya hits badh rahe hain aur misses samajh aa rahe hain?</b> <code>show ip nat statistics</code>: pool ke saath badhta "misses" count matlab exhaustion ya koi match nahi.</li>
<li><b>Kya outside ko wapas ka raasta pata hai?</b> ISP ya agla router inside global address (ya pool) ko aapki taraf route kare.</li>
<li><b>Order of operations issues:</b> ACLs, crypto aur PBR galat address dekh rahe hain.</li>
<li><b>Ek flow dekho:</b> busy router par ACL filter ke saath <code>debug ip nat</code>, phir changes ke baad <code>clear ip nat translation *</code>, kyunki purani entries purana rule use karti rehti hain.</li>
</ol>
<pre class="out">R1# show ip nat translations
Pro Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp 203.0.113.2:1024      192.168.20.10:51000   198.51.100.10:443     198.51.100.10:443</span>
--- 203.0.113.10          192.168.20.50         ---                   ---

R1# show ip nat statistics
Total active translations: 2 (1 static, 1 dynamic; 1 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
<span class="hl">Hits: 1520  Misses: 12</span>
Expired translations: 40
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 10 interface GigabitEthernet0/1 refcount 1</pre>

<div class="eg"><p><b>Worked example.</b> Dynamic pool 203.0.113.16 se 203.0.113.30 (15 addresses, bina overload) 40 users ko serve karta hai. Pehle 15 users browse karte hain; 16we user ko kuch nahi milta. <code>show ip nat statistics</code> pool ko <code>total addresses 15, allocated 15 (100%), misses 37</code> ke saath dikhata hai. Rule mein <code>overload</code> jodna, ya use PAT mein badalna, saare 40 ko unique ports ke saath pool share karne deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> NAT ACL ya pool badalkar turant test karna. Existing translations time out hone tak rehti hain, to change kuch karta hua nahi dikhta. IOS use mein chal rahe pool ko hatane se mana bhi kar sakta hai. Translations clear karo (busy router par maintenance window mein) aur phir test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip nat translations</code> mein columns hamesha is order mein hote hain: Inside global, Inside local, Outside local, Outside global. Bina traffic wali static entry outside columns mein dashes dikhati hai. Agar sawaal mein outside local outside global se alag dikhe, to outside NAT configured hai.</p></div>

<div class="scn"><h4>Pool jise kisi ne route nahi kiya</h4><p>Ek enterprise ne apna PAT interface address se ek naye public block, pool 203.0.113.64/28, par move kiya. <code>show ip nat translations</code> mein translations dikhi aur hits badhe, phir bhi koi web page load nahi hua. ISP ne block assign kiya tha lekin customer ke link ki taraf route nahi kiya tha. 203.0.113.64/28 ke replies kabhi nahi aaye. Looking-glass se traceroute ne block ko ISP core par khatam hote dikhaya. ISP ne static route joda aur service wapas aa gayi.</p><p><b>Seekh:</b> table mein translation sirf outbound aadha hissa saabit karti hai; bahari duniya ko inside global addresses wapas aap tak route karne chahiye.</p></div>

<div class="iv"><p class="q">"Same 10.1.1.0/24 wali do companies ko baat karni hai. NAT se kaise karoge?"</p><p>Double NAT samjhao: inside sources ko <code>ip nat inside source static network</code> se aur outside sources ko <code>ip nat outside source static network</code> se translate karo, taaki har side doosri ke liye unique range dekhe. Outside local range ke liye <code>add-route</code> ya static route, translated addresses lautaata DNS, aur yeh ki yahi woh case hai jahan outside local outside global se alag hota hai, batao. Senior answer jodta hai ki long-term fix renumbering hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overlapping networks ko double NAT chahiye: inside source aur outside source translations, plus outside local range ke liye route aur DNS.</li>
<li>Outside local outside global se sirf tab alag hota hai jab outside NAT use ho.</li>
<li>Plain PAT do FHRP routers ke beech sync nahi hota; static NAT redundancy keyword se HSRP follow kar sakta hai.</li>
<li>Method: interfaces aur ACL, translations, statistics, return route, order of operations, debug aur clear.</li>
<li>Pool exhaustion badhte misses ki tarah dikhta hai; overload ise theek karta hai.</li>
</ul></div>
`}};export{e as default};