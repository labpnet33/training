var e={id:`breakout-vs-backhaul`,h:{en:`Local internet breakout versus backhaul: choosing the exit for each kind of traffic`,hi:`Local internet breakout versus backhaul: har tarah ke traffic ke liye exit chunna`},body:{en:`
<p>The first design decision for cloud traffic is the <b>exit point</b>. There are three patterns, and real networks mix them. This chapter gives the trade-offs, a numeric method, and the FortiGate objects that implement each pattern.</p>
<h3>Three patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>How it works</th><th>Strength</th><th>Weakness</th></tr><tr><td><b>Full backhaul</b></td><td>The branch has a default route learned from the hub over the overlay (for example with BGP). All internet traffic crosses the overlay and leaves at the hub.</td><td>One place for inspection, logging and a fixed source address.</td><td>Extra delay, hub link and hub firewall carry every branch's internet traffic.</td></tr><tr><td><b>Full local breakout</b></td><td>The branch has default routes over its own ISP links, which are SD-WAN members. All internet traffic leaves locally.</td><td>Shortest path and no load on the hub.</td><td>Every branch is an internet edge: each needs full security profiles and monitoring.</td></tr><tr><td><b>Hybrid</b></td><td>Trusted SaaS and chosen services break out locally; everything else goes to the hub.</td><td>Best experience for critical SaaS, central control for the rest.</td><td>More rules to design and maintain.</td></tr></table>
<p>Microsoft's own guidance supports the hybrid model. Its network principles say to egress at the user's location where possible, avoid hairpins, resolve DNS close to the egress, and avoid forcing the Optimize and Allow categories through proxies and inspection that terminate TLS. Traffic in the Default category can go to a central perimeter. Microsoft also names SD-WAN at the branch as the simple way to route the Optimize and Allow categories directly.</p>
<h3>A method with numbers</h3>
<ol><li><b>List the traffic classes</b> and mark each one: critical SaaS (Microsoft 365, Salesforce), real-time media (Teams, voice, video), general web, guest, and private applications.</li><li><b>Estimate the busy-hour bandwidth.</b> Example for BR1 with 120 users: 120 users x 0.5 Mbit/s average of general web and SaaS = 60 Mbit/s, of which perhaps one third is critical SaaS (20 Mbit/s). These are planning assumptions; replace them with your own measurements from FortiAnalyzer or the existing firewall.</li><li><b>Compute the backhaul cost.</b> If all 60 Mbit/s of BR1 crossed the overlay, 10 similar branches would add 600 Mbit/s to the hub's internet and overlay capacity, before encryption overhead.</li><li><b>Compute the delay cost.</b> If the hub is 40 ms from the branch, every request pays 80 ms more. For interactive SaaS and for voice that is more than half of the 150 ms one-way budget that Chapter 7 of the shaping module used.</li><li><b>Decide per class</b> and write it in a table, then implement.</li></ol>
<table class="cmp"><tr><th>Class</th><th>Exit</th><th>Why</th></tr><tr><td>Microsoft 365, Teams media</td><td>Local, by SLA over ISP1 and ISP2</td><td>Delay sensitive, trusted by Microsoft's model, large volume</td></tr><tr><td>Salesforce and other business SaaS</td><td>Local, by SLA</td><td>Interactive, moderate volume</td></tr><tr><td>General web</td><td>Hub (backhaul) with central web filtering, or local with web filtering</td><td>Depends on the security model and hub capacity</td></tr><tr><td>Guest Wi-Fi</td><td>Local, shaped, never over the overlay</td><td>Keeps guest traffic out of the WAN</td></tr><tr><td>Private applications</td><td>Overlay to the hub or the cloud gateway</td><td>They live behind the hub</td></tr></table>
<h3>The FortiGate objects</h3>
<p>The ingredients are an SD-WAN zone with the ISP links as members, a firewall policy from the LAN to that zone with source NAT, and SD-WAN rules that match the services you want to break out. The overlay is a different zone, so policies and rules can treat the two paths differently.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: hybrid exit. Underlay members are in zone virtual-wan-link, overlay members in zone overlay</span>
config firewall policy
    edit 20
        set name "LAN-to-INTERNET-LOCAL"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        set nat enable
    next
    edit 30
        set name "LAN-to-HUB"
        set srcintf "lan"
        set dstintf "overlay"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
    next
end</pre>
<p>The security profiles themselves (antivirus, web filter, IPS) are chosen in each policy with options such as <code>av-profile</code> and <code>webfilter-profile</code>. The point for this module is that <b>both policies carry profiles</b>, so local breakout is not an unprotected path. NAT is enabled only on the internet policy: overlay traffic keeps the branch's real source address so that the hub and the cloud can route the replies.</p>
<h3>How the default route and the rules interact</h3>
<ul><li><b>Backhaul default.</b> If the hub advertises <code>0.0.0.0/0</code> over BGP, the branch learns a default route through the overlay. SD-WAN rules for local breakout must match <b>before</b> the routing table decides, and they need a valid route to the ISP member. The routing module explains why a rule needs a route in the routing table for its members.</li><li><b>Local default.</b> If the ISP links have default routes, the implicit SD-WAN rule load-balances or uses the first member, so decide what you want when no rule matches.</li><li><b>Hybrid.</b> Keep the default route to the hub with a better distance than the ISP default routes, and add explicit SD-WAN rules for the services that should leave locally. That way, if a rule does not match, the traffic goes to the hub, where it is inspected centrally.</li></ul>
<h3>DNS and the first packet</h3>
<p>SaaS steering by ISDB matches IP addresses. Cloud services resolve to the nearest front door <b>for the DNS resolver's location</b>. If the branch asks a resolver at the head office, the user is directed to a front door near the head office, and local breakout loses its benefit. Use a local or regional resolver at the branch (the FortiGate itself can serve DNS) for the SaaS you break out.</p>
<div class="warn"><p><b>Common mistake.</b> Enabling local breakout and leaving SSL deep inspection on for Microsoft 365. Microsoft states that TLS termination and deep packet inspection of Microsoft 365 domains are untested and known to cause problems. Use certificate inspection or an exemption for those domains, and keep deep inspection for general web.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local breakout needs a firewall policy with NAT and security profiles on the egress zone. Backhaul to the hub needs the hub to have the capacity, the NAT and the policies for all branches. A rule can only send traffic to a member that has a usable route.</p></div>
<div class="scn"><h4>Local breakout, and now the proxy sees nothing</h4><p>After BR2 started to break out Microsoft 365 locally, the head office web filter reports showed 30 percent less traffic and the security team asked if the branch was uncontrolled. BR2's logs showed the same sessions with the profile applied locally. The solution was to send BR2's forward traffic logs to FortiAnalyzer so the security team has one view of both paths.</p><p><b>Lesson:</b> Move the control point with the traffic, and move the logs with it.</p></div>
<div class="iv"><p class="q">"Local breakout or backhaul for a branch?"</p><p>It depends on the class of traffic. I break out critical, trusted SaaS locally with SLA steering between the ISPs, because the delay and hub load of backhaul are high. I keep private applications on the overlay and decide for general web based on the security model and the hub capacity. Every local policy has security profiles and logging, and DNS is resolved near the egress.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Three patterns: full backhaul, full local breakout, hybrid; hybrid is the common answer.</li><li>Decide per traffic class with bandwidth and delay numbers.</li><li>Local breakout still uses full security policy, NAT and logs.</li><li>Resolve DNS close to the egress or the SaaS front door will be far away.</li><li>Microsoft advises no TLS inspection for Optimize and Allow endpoints.</li></ul></div>
`,hi:`
<p>Cloud traffic ka pehla design faisla <b>exit point</b> hai. Teen patterns hain, aur asli networks unhe milate hain. Yeh chapter trade-offs, ek numeric method, aur har pattern ko implement karne wale FortiGate objects deta hai.</p>
<h3>Teen patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Kaise kaam karta hai</th><th>Taakat</th><th>Kamzori</th></tr><tr><td><b>Full backhaul</b></td><td>Branch ko hub se overlay par default route milta hai (jaise BGP se). Saara internet traffic overlay se guzarta hai aur hub par bahar nikalta hai.</td><td>Inspection, logging aur fixed source address ke liye ek jagah.</td><td>Extra delay, hub link aur hub firewall har branch ka internet traffic dhote hain.</td></tr><tr><td><b>Full local breakout</b></td><td>Branch ke paas apne ISP links par default routes hain, jo SD-WAN members hain. Saara internet traffic local nikalta hai.</td><td>Sabse chhota path aur hub par koi load nahi.</td><td>Har branch ek internet edge hai: har ek ko poore security profiles aur monitoring chahiye.</td></tr><tr><td><b>Hybrid</b></td><td>Trusted SaaS aur chuni hui services local bahar nikalti hain; baaki sab hub jaata hai.</td><td>Critical SaaS ka best experience, baaki ka central control.</td><td>Design aur maintain karne ke liye zyaada rules.</td></tr></table>
<p>Microsoft ki apni guidance hybrid model ka samarthan karti hai. Uske network principles kehte hain ki jahan ho sake user ki location par egress karo, hairpins se bacho, DNS egress ke kareeb resolve karo, aur Optimize aur Allow categories ko aise proxies aur inspection se mat guzaaro jo TLS terminate karte hain. Default category ka traffic central perimeter ja sakta hai. Microsoft branch par SD-WAN ko Optimize aur Allow categories ko seedha route karne ka saral tareeka bhi batata hai.</p>
<h3>Numbers ke saath method</h3>
<ol><li><b>Traffic classes ki list banao</b> aur har ek mark karo: critical SaaS (Microsoft 365, Salesforce), real-time media (Teams, voice, video), general web, guest, aur private applications.</li><li><b>Busy-hour bandwidth estimate karo.</b> 120 users wali BR1 ka example: 120 users x general web aur SaaS ka 0.5 Mbit/s average = 60 Mbit/s, jisme shayad ek tihai critical SaaS (20 Mbit/s). Yeh planning assumptions hain; FortiAnalyzer ya maujooda firewall ki apni measurements se badlo.</li><li><b>Backhaul ki keemat compute karo.</b> Agar BR1 ke saare 60 Mbit/s overlay se guzarte, to 10 aise branches encryption overhead se pehle hub ki internet aur overlay capacity mein 600 Mbit/s jodte.</li><li><b>Delay ki keemat compute karo.</b> Agar hub branch se 40 ms door hai, har request 80 ms zyaada deti hai. Interactive SaaS aur voice ke liye yeh shaping module ke chapter 7 mein use hue 150 ms one-way budget ke aadhe se zyaada hai.</li><li><b>Har class ke liye faisla karo</b> aur table mein likho, phir implement karo.</li></ol>
<table class="cmp"><tr><th>Class</th><th>Exit</th><th>Kyon</th></tr><tr><td>Microsoft 365, Teams media</td><td>Local, ISP1 aur ISP2 par SLA se</td><td>Delay sensitive, Microsoft ke model mein trusted, bada volume</td></tr><tr><td>Salesforce aur doosre business SaaS</td><td>Local, SLA se</td><td>Interactive, moderate volume</td></tr><tr><td>General web</td><td>Hub (backhaul) central web filtering ke saath, ya local web filtering ke saath</td><td>Security model aur hub capacity par nirbhar</td></tr><tr><td>Guest Wi-Fi</td><td>Local, shaped, overlay par kabhi nahi</td><td>Guest traffic ko WAN se bahar rakhta hai</td></tr><tr><td>Private applications</td><td>Overlay se hub ya cloud gateway tak</td><td>Woh hub ke peeche hain</td></tr></table>
<h3>FortiGate objects</h3>
<p>Ingredients: ISP links ko members rakhne wala SD-WAN zone, LAN se us zone tak source NAT wali firewall policy, aur woh SD-WAN rules jo un services ko match karte hain jinhe bahar nikalna hai. Overlay alag zone hai, isliye policies aur rules dono paths ko alag tarah treat kar sakte hain.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: hybrid exit. Underlay members are in zone virtual-wan-link, overlay members in zone overlay</span>
config firewall policy
    edit 20
        set name "LAN-to-INTERNET-LOCAL"
        set srcintf "lan"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
        set nat enable
    next
    edit 30
        set name "LAN-to-HUB"
        set srcintf "lan"
        set dstintf "overlay"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "certificate-inspection"
    next
end</pre>
<p>Security profiles khud (antivirus, web filter, IPS) har policy mein <code>av-profile</code> aur <code>webfilter-profile</code> jaise options se chune jaate hain. Is module ka point yeh hai ki <b>dono policies profiles rakhti hain</b>, isliye local breakout unprotected path nahi hai. NAT sirf internet policy par enable hai: overlay traffic branch ka asli source address rakhta hai taaki hub aur cloud replies route kar sakein.</p>
<h3>Default route aur rules ka milna</h3>
<ul><li><b>Backhaul default.</b> Agar hub BGP se <code>0.0.0.0/0</code> advertise kare, to branch ko overlay se default route milta hai. Local breakout ke SD-WAN rules routing table ke faisle se <b>pehle</b> match hone chahiye, aur unhe ISP member tak valid route chahiye. Routing module samjhata hai ki rule ko apne members ke liye routing table mein route kyon chahiye.</li><li><b>Local default.</b> Agar ISP links par default routes hain, to implicit SD-WAN rule load-balance karta hai ya pehla member use karta hai, isliye tay karo ki koi rule match na ho to kya chahiye.</li><li><b>Hybrid.</b> Hub ka default route ISP default routes se behtar distance ke saath rakho, aur un services ke liye explicit SD-WAN rules jodo jo local nikalni chahiye. Is tarah agar rule match na ho to traffic hub jaata hai, jahan central inspection hota hai.</li></ul>
<h3>DNS aur pehla packet</h3>
<p>ISDB se SaaS steering IP addresses match karti hai. Cloud services <b>DNS resolver ki location</b> ke hisaab se sabse paas ke front door par resolve hoti hain. Agar branch head office ke resolver se poochhe, to user head office ke paas ke front door par bheja jaata hai, aur local breakout ka fayda khatam. Jin SaaS ko bahar nikaalte ho unke liye branch par local ya regional resolver use karo (FortiGate khud DNS serve kar sakta hai).</p>
<div class="warn"><p><b>Common galti.</b> Local breakout enable karna aur Microsoft 365 ke liye SSL deep inspection chalu chhodna. Microsoft kehta hai ki Microsoft 365 domains ka TLS termination aur deep packet inspection untested hai aur problems ke liye jaana jaata hai. Un domains ke liye certificate inspection ya exemption use karo, aur deep inspection general web ke liye rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local breakout ko egress zone par NAT aur security profiles wali firewall policy chahiye. Hub tak backhaul mein hub ko saari branches ke liye capacity, NAT aur policies chahiye. Rule sirf us member ko traffic bhej sakta hai jiske paas usable route ho.</p></div>
<div class="scn"><h4>Local breakout, aur ab proxy ko kuch nahi dikhta</h4><p>BR2 ne Microsoft 365 local nikalna shuru kiya to head office web filter reports mein 30 percent kam traffic dikha aur security team ne poochha ki kya branch uncontrolled hai. BR2 ke logs mein wahi sessions profile ke saath local laagu dikhe. Solution: BR2 ke forward traffic logs FortiAnalyzer ko bhejna taaki security team ko dono paths ka ek view mile.</p><p><b>Seekh:</b> Control point ko traffic ke saath le jao, aur logs ko bhi.</p></div>
<div class="iv"><p class="q">"Branch ke liye local breakout ya backhaul?"</p><p>Yeh traffic ki class par nirbhar hai. Main critical, trusted SaaS ko ISPs ke beech SLA steering ke saath local nikaalta hoon, kyunki backhaul ki delay aur hub load zyaada hain. Private applications overlay par rakhta hoon aur general web ke liye security model aur hub capacity dekhkar faisla karta hoon. Har local policy mein security profiles aur logging hoti hai, aur DNS egress ke paas resolve hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Teen patterns: full backhaul, full local breakout, hybrid; hybrid aam jawab hai.</li><li>Bandwidth aur delay numbers se har traffic class ka faisla karo.</li><li>Local breakout mein bhi poori security policy, NAT aur logs rehte hain.</li><li>DNS egress ke kareeb resolve karo, warna SaaS front door door hoga.</li><li>Microsoft Optimize aur Allow endpoints ke liye TLS inspection na karne ki salah deta hai.</li></ul></div>
`}};export{e as default};