var e={id:`levels`,h:{en:`Security levels and default traffic behaviour`,hi:`Security levels aur default traffic behaviour`},body:{en:`
<p>Picture a building where every floor has a trust number: the top floor, where the directors sit, is 100; the reception is 50; the street is 0. The rule at every staircase is simple: people may walk <b>down</b> freely, but nobody walks <b>up</b> without a pass. And when someone goes down to the street to buy tea, they are allowed back up with the same cup, because the guard remembers them. That is exactly how ASA security levels work.</p>

<h3>The three rules (with no ACL applied)</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security level flow rules">
<rect x="20" y="20" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="14">inside</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">level 100</text>
<rect x="240" y="90" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">dmz</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">level 50</text>
<rect x="460" y="160" width="160" height="50" rx="10" fill="#fde68a"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="14">outside</text><text x="540" y="200" text-anchor="middle" class="svg-muted" font-size="12">level 0</text>
<line x1="180" y1="50" x2="240" y2="105" stroke="#16a34a" stroke-width="2"/><text x="225" y="62" class="svg-accent" font-size="12">allowed</text>
<line x1="400" y1="120" x2="460" y2="175" stroke="#16a34a" stroke-width="2"/><text x="445" y="132" class="svg-accent" font-size="12">allowed</text>
<path d="M180 40 C 400 30, 540 80, 540 160" fill="none" stroke="#16a34a" stroke-width="2"/><text x="420" y="45" class="svg-accent" font-size="12">allowed</text>
<text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="12">Lower to higher: denied</text>
<text x="100" y="170" text-anchor="middle" class="svg-muted" font-size="12">Equal levels: denied</text>
<text x="100" y="190" text-anchor="middle" class="svg-muted" font-size="12">Replies: allowed by state</text>
</svg><p class="cap">New connections may start from a higher level toward a lower one. Replies return through the connection table.</p></div>
<ol>
<li><b>Higher to lower is allowed.</b> A new connection starting on inside (100) toward dmz (50) or outside (0) is permitted.</li>
<li><b>Lower to higher is denied.</b> A new connection from outside (0) to dmz (50) or inside (100), or from dmz to inside, is dropped unless an ACL permits it.</li>
<li><b>Equal to equal is denied</b> by default, both between two interfaces with the same level and back out of the same interface. Two commands change that:</li>
</ol>
<pre class="code"><span class="c">! allow traffic between different interfaces with the same level</span>
same-security-traffic permit inter-interface
<span class="c">! allow traffic to enter and leave the SAME interface (hairpin / u-turn)</span>
same-security-traffic permit intra-interface</pre>
<p>The rules apply to the <b>first packet</b> of a connection. Once allowed, the ASA writes a connection entry, and the replies travel "up" the levels because they match that entry, not because a rule allows them. This is stateful inspection, which you met in the Security foundations module.</p>

<h3>A sensible level plan</h3>
<table class="cmp"><tr><th>Zone</th><th>Level</th><th>Why</th></tr>
<tr><td>inside (employees)</td><td>100</td><td>Most trusted; may start connections to everything.</td></tr>
<tr><td>voice, servers</td><td>70 to 90</td><td>Trusted, but should not start connections to users.</td></tr>
<tr><td>dmz (public servers)</td><td>50</td><td>Reachable from inside, may reach the internet, may not start connections to inside.</td></tr>
<tr><td>guest Wi-Fi</td><td>10</td><td>Internet only; cannot start connections to dmz or inside.</td></tr>
<tr><td>outside (internet)</td><td>0</td><td>Untrusted.</td></tr>
</table>

<h3>When the levels stop mattering</h3>
<p>Security levels are the default behaviour. As soon as you apply an <b>ACL inbound on an interface</b> with <code>access-group</code>, traffic entering that interface is judged by the ACL instead, ending with its implicit deny, even for higher-to-lower flows. You will build interface ACLs in the next module. For this module, no ACLs are applied, so the levels decide.</p>

<div class="eg"><p><b>Worked example.</b> Levels: inside 100, dmz 50, outside 0. PC1 opens WEB (10.0.2.10) on port 80: 100 to 50, allowed. WEB downloads updates from 8.8.8.8: 50 to 0, allowed (NAT still needed, chapter 9). A host on the internet tries WEB on port 80: 0 to 50, denied until you add an ACL and a static NAT. WEB tries to open a file share on PC1: 50 to 100, denied. This is the classic DMZ: the DMZ can be reached, but it cannot reach inward.</p></div>

<h3>Verifying which rule applies</h3>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
<span class="hl">GigabitEthernet0/2       dmz                        0</span>
NK-ASA# show running-config same-security-traffic
NK-ASA#</pre>
<p>Here the dmz has been left at level 0, the same as outside, and no same-security command exists. Result: WEB cannot start any connection to the internet. This is the first fault in the lab ticket "the DMZ server cannot download updates".</p>

<div class="warn"><p><b>Common mistakes.</b> Fixing that ticket with <code>same-security-traffic permit inter-interface</code>. It works, but it also lets the internet start connections into the DMZ (also level 0 to level 0), and every other pair of level-0 interfaces. The correct fix is to give the DMZ a level between inside and outside, such as 50. Another mistake: changing a level and expecting existing connections to change. They keep running until they time out or you run <code>clear conn</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Without ACLs, can outside reach the DMZ?" No: 0 to 50 is lower to higher. "Can the DMZ reach inside?" No: 50 to 100. "Can inside reach the DMZ?" Yes. And replies are always allowed back because of the connection table, not because of the level.</p></div>

<div class="scn"><h4>Guest Wi-Fi that could see the servers</h4><p>A hotel added guest Wi-Fi on a subinterface named <code>guest</code> and gave it level 60 "because it is inside the building". Their server VLAN was level 50. A guest scanning the network found the property-management server answering. The engineer compared levels in <code>show nameif</code>: 60 to 50 is higher to lower, so allowed. Moving guest to level 10 blocked guest-to-server connections instantly for new flows; <code>clear conn address</code> for the guest subnet removed the existing ones.</p><p><b>Lesson:</b> the level describes trust, not physical location. Untrusted users get a low number.</p></div>

<div class="iv"><p class="q">"Explain ASA security levels and what same-security-traffic does."</p><p>Strong answer: each named interface has a level 0 to 100. Without ACLs, new connections from higher to lower are allowed, lower to higher denied, and equal levels denied; replies return via the stateful connection table. <code>same-security-traffic permit inter-interface</code> allows traffic between different interfaces with the same level; <code>intra-interface</code> allows hairpinning out the same interface, used for VPN u-turn. Add that once an inbound ACL is applied, the ACL replaces the level logic for that interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Higher to lower: allowed. Lower to higher: denied. Equal: denied by default.</li>
<li>Replies return because of the connection table, not the level.</li>
<li><code>same-security-traffic permit inter-interface</code> and <code>intra-interface</code> change the equal-level rule.</li>
<li>A DMZ belongs between inside and outside, for example level 50.</li>
<li>An inbound interface ACL overrides the default level behaviour for that interface.</li>
</ul></div>
`,hi:`
<p>Ek building socho jahan har floor ka ek trust number hai: top floor, jahan directors baithte hain, 100 hai; reception 50 hai; sadak 0 hai. Har seedhi par rule simple hai: log <b>neeche</b> aaram se ja sakte hain, lekin koi bina pass ke <b>upar</b> nahi jaata. Aur jab koi chai lene sadak par jaata hai, to use usi cup ke saath wapas upar aane diya jaata hai, kyunki guard use yaad rakhta hai. ASA security levels bilkul aise hi kaam karte hain.</p>

<h3>Teen rules (bina ACL ke)</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security level flow rules">
<rect x="20" y="20" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="14">inside</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">level 100</text>
<rect x="240" y="90" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">dmz</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">level 50</text>
<rect x="460" y="160" width="160" height="50" rx="10" fill="#fde68a"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="14">outside</text><text x="540" y="200" text-anchor="middle" class="svg-muted" font-size="12">level 0</text>
<line x1="180" y1="50" x2="240" y2="105" stroke="#16a34a" stroke-width="2"/><text x="225" y="62" class="svg-accent" font-size="12">allowed</text>
<line x1="400" y1="120" x2="460" y2="175" stroke="#16a34a" stroke-width="2"/><text x="445" y="132" class="svg-accent" font-size="12">allowed</text>
<path d="M180 40 C 400 30, 540 80, 540 160" fill="none" stroke="#16a34a" stroke-width="2"/><text x="420" y="45" class="svg-accent" font-size="12">allowed</text>
<text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="12">Neeche se oopar: denied</text>
<text x="100" y="170" text-anchor="middle" class="svg-muted" font-size="12">Barabar levels: denied</text>
<text x="100" y="190" text-anchor="middle" class="svg-muted" font-size="12">Replies: state se allowed</text>
</svg><p class="cap">Naye connections oonche level se neeche ki taraf shuru ho sakte hain. Replies connection table ke through wapas aate hain.</p></div>
<ol>
<li><b>Ooncha se neecha allowed hai.</b> Inside (100) par shuru hokar dmz (50) ya outside (0) ki taraf jaane wala naya connection permitted hai.</li>
<li><b>Neecha se ooncha denied hai.</b> Outside (0) se dmz (50) ya inside (100), ya dmz se inside ki taraf naya connection drop hota hai jab tak koi ACL permit na kare.</li>
<li><b>Barabar se barabar denied hai</b> default se, dono: same level wale do interfaces ke beech bhi aur usi interface se wapas bahar bhi. Do commands ise badalte hain:</li>
</ol>
<pre class="code"><span class="c">! same level wale alag alag interfaces ke beech traffic allow karo</span>
same-security-traffic permit inter-interface
<span class="c">! traffic ko USI interface se andar aane aur bahar jaane do (hairpin / u-turn)</span>
same-security-traffic permit intra-interface</pre>
<p>Yeh rules connection ke <b>pehle packet</b> par apply hote hain. Ek baar allow hone par ASA connection entry likhta hai, aur replies levels mein "oopar" isliye jaate hain kyunki woh us entry se match karte hain, isliye nahi ki koi rule unhe allow karta hai. Yahi stateful inspection hai, jisse aap Security foundations module mein mil chuke ho.</p>

<h3>Ek samajhdaar level plan</h3>
<table class="cmp"><tr><th>Zone</th><th>Level</th><th>Kyun</th></tr>
<tr><td>inside (employees)</td><td>100</td><td>Sabse trusted; har cheez tak connection shuru kar sakta hai.</td></tr>
<tr><td>voice, servers</td><td>70 se 90</td><td>Trusted, lekin users ki taraf connection shuru nahi karne chahiye.</td></tr>
<tr><td>dmz (public servers)</td><td>50</td><td>Inside se reachable, internet tak ja sakta hai, inside ki taraf connection shuru nahi kar sakta.</td></tr>
<tr><td>guest Wi-Fi</td><td>10</td><td>Sirf internet; dmz ya inside ki taraf connection shuru nahi kar sakta.</td></tr>
<tr><td>outside (internet)</td><td>0</td><td>Untrusted.</td></tr>
</table>

<h3>Jab levels matter karna band kar dete hain</h3>
<p>Security levels default behaviour hain. Jaise hi aap <code>access-group</code> se kisi <b>interface par inbound ACL</b> lagate ho, us interface mein aane wale traffic ko ACL judge karta hai, uske implicit deny ke saath, oonche se neeche wale flows ko bhi. Interface ACLs aap agle module mein banaoge. Is module mein koi ACL apply nahi hai, isliye levels decide karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Levels: inside 100, dmz 50, outside 0. PC1 port 80 par WEB (10.0.2.10) kholta hai: 100 se 50, allowed. WEB 8.8.8.8 se updates download karta hai: 50 se 0, allowed (NAT phir bhi chahiye, chapter 9). Internet ka koi host port 80 par WEB try karta hai: 0 se 50, denied jab tak aap ACL aur static NAT na jodo. WEB PC1 par file share kholne ki koshish karta hai: 50 se 100, denied. Yahi classic DMZ hai: DMZ tak pahuncha ja sakta hai, lekin woh andar ki taraf nahi pahunch sakta.</p></div>

<h3>Verify karna ki kaunsa rule apply hota hai</h3>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
<span class="hl">GigabitEthernet0/2       dmz                        0</span>
NK-ASA# show running-config same-security-traffic
NK-ASA#</pre>
<p>Yahan dmz ko level 0 par chhod diya gaya hai, outside ke barabar, aur koi same-security command nahi hai. Result: WEB internet ki taraf koi connection shuru nahi kar sakta. Yahi lab ticket "DMZ server updates download nahi kar pa raha" ka pehla fault hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Us ticket ko <code>same-security-traffic permit inter-interface</code> se fix karna. Yeh chal jaata hai, lekin yeh internet ko bhi DMZ mein connection shuru karne deta hai (woh bhi level 0 se level 0), aur level-0 interfaces ki har doosri pair ko bhi. Sahi fix DMZ ko inside aur outside ke beech ka level dena hai, jaise 50. Ek aur galti: level badalna aur umeed karna ki existing connections badal jaayenge. Woh timeout hone tak ya <code>clear conn</code> chalane tak chalte rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ACLs ke bina, kya outside DMZ tak pahunch sakta hai?" Nahi: 0 se 50 neeche se ooncha hai. "Kya DMZ inside tak pahunch sakta hai?" Nahi: 50 se 100. "Kya inside DMZ tak pahunch sakta hai?" Haan. Aur replies hamesha connection table ki wajah se wapas allow hote hain, level ki wajah se nahi.</p></div>

<div class="scn"><h4>Guest Wi-Fi jo servers dekh sakta tha</h4><p>Ek hotel ne <code>guest</code> naam ke subinterface par guest Wi-Fi joda aur use level 60 diya "kyunki woh building ke andar hai". Unka server VLAN level 50 tha. Network scan karne wale ek guest ko property-management server jawab deta mila. Engineer ne <code>show nameif</code> mein levels compare kiye: 60 se 50 ooncha se neecha hai, isliye allowed. Guest ko level 10 par le jaane se naye flows ke liye guest-to-server connections turant block ho gaye; guest subnet ke liye <code>clear conn address</code> ne existing ones hata diye.</p><p><b>Seekh:</b> level trust batata hai, physical location nahi. Untrusted users ko low number milta hai.</p></div>

<div class="iv"><p class="q">"ASA security levels explain karo aur batao same-security-traffic kya karta hai."</p><p>Strong answer: har named interface ka level 0 se 100 hota hai. ACLs ke bina, oonche se neeche naye connections allowed hain, neeche se oonche denied, aur barabar levels denied; replies stateful connection table ke through wapas aate hain. <code>same-security-traffic permit inter-interface</code> same level wale alag interfaces ke beech traffic allow karta hai; <code>intra-interface</code> usi interface se hairpinning allow karta hai, jo VPN u-turn ke liye use hota hai. Jodo ki inbound ACL lagte hi us interface ke liye ACL level logic ki jagah le leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ooncha se neecha: allowed. Neecha se ooncha: denied. Barabar: default se denied.</li>
<li>Replies connection table ki wajah se wapas aate hain, level ki wajah se nahi.</li>
<li><code>same-security-traffic permit inter-interface</code> aur <code>intra-interface</code> barabar-level rule badalte hain.</li>
<li>DMZ inside aur outside ke beech hona chahiye, jaise level 50.</li>
<li>Inbound interface ACL us interface ke liye default level behaviour ko override karta hai.</li>
</ul></div>
`}};export{e as default};