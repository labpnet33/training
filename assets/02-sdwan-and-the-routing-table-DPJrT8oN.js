var e={id:`table-interaction`,h:{en:`How SD-WAN and the routing table work together`,hi:`SD-WAN aur routing table ek saath kaise kaam karte hain`},body:{en:`
<p>Most SD-WAN faults are really routing faults in disguise, so we start with the exact relationship between the two. Remember the rule from nse4-sdwan: the SD-WAN <b>rules</b> are read top to bottom and the first match decides, like a policy route. What that chapter did not stress is the other half: a rule can only choose a member that has a <b>route to the destination</b>. The routing table is the list of roads; the rule picks among the roads that exist.</p>
<h3>The decision order for a new session</h3>
<ol><li>The first packet arrives. The FortiGate checks the <b>firewall policy</b> and the reverse path (RPF) as usual (see nse4-routing).</li><li>SD-WAN rules are evaluated from the top. A rule matches on source, destination, port, application or Internet Service Database object.</li><li>The matching rule's strategy picks a member from its list. A member is only a <b>candidate</b> if it is alive (health check), has a route to the destination, and, if the strategy needs an SLA, meets that SLA.</li><li>If no rule matches, or the matching rule finds no usable member, the <b>implicit rule</b> applies: ordinary route lookup and the load-balance mode.</li><li>The session is created with the chosen egress interface; later packets follow the session.</li></ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="85" width="100" height="50" rx="10" fill="#bae6fd"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">New session</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.20 to 10.10.5.5</text><rect x="140" y="85" width="140" height="50" rx="10" fill="#fed7aa"/><text x="210" y="108" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN rules</text><text x="210" y="125" text-anchor="middle" class="svg-muted" font-size="11">first match, top-down</text><rect x="310" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="390" y="43" text-anchor="middle" class="svg-ink" font-size="13">Candidate members</text><text x="390" y="60" text-anchor="middle" class="svg-muted" font-size="11">alive + route + SLA</text><rect x="310" y="150" width="160" height="50" rx="10" fill="#e2e8f0"/><text x="390" y="173" text-anchor="middle" class="svg-ink" font-size="13">Implicit rule</text><text x="390" y="190" text-anchor="middle" class="svg-muted" font-size="11">routing table + load balance</text><rect x="500" y="85" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Egress interface</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN1</text><line x1="110" y1="110" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="310" y2="50" stroke="#64748b" stroke-width="2"/><line x1="280" y1="120" x2="310" y2="170" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="175" x2="500" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="11">A rule that finds no usable member falls back to the implicit rule.</text></svg><p class="cap">The rule filters and ranks members; the routing table decides which members exist for the destination.</p></div>
<div class="note"><p><b>Note.</b> The exact fallback when a rule finds no member that meets its SLA depends on the strategy and the firmware release. Test it in a lab on your version and design a last-resort member, as chapter 7 of nse4-sdwan advised.</p></div>
<h3>Routes that point to an SD-WAN zone</h3>
<p>In nse4-sdwan you saw the default route with <code>set sdwan-zone</code>. The same attribute works for other prefixes, so a static route can send a prefix into a whole zone without naming one member. This is the simple, protocol-free way to reach the data centre when you have only a few sites.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router static
    edit 1
        set sdwan-zone "underlay"
        set comment "Internet over the ISP zone"
    next
    edit 2
        set dst 10.10.0.0 255.255.0.0
        set sdwan-zone "overlay"
        set comment "Data centre over the overlay zone"
    next
    edit 3
        set dst 10.10.0.0 255.255.0.0
        set blackhole enable
        set distance 254
        set comment "Safety net when no overlay member is alive"
    next
end</pre>
<p>Route 2 gives every overlay member a route to 10.10.0.0/16. Route 3 is a <b>blackhole</b> with a high distance: while any overlay route exists, the real route wins; when all overlay members are gone, the traffic is dropped instead of leaking into the internet through the underlay default route. The tip from nse4-ipsec applies unchanged. Fortinet's own support articles also describe blackhole routes as a way to <b>pin traffic</b> to one interface so that it does not fail over to another link; use that deliberately and document it.</p>
<h3>Distance, priority and ECMP with members</h3>
<p>Everything from nse4-routing still holds. Longest prefix first, then distance, then priority. Two routes with the same prefix, distance and priority are <b>ECMP</b>: both next hops are installed. This is exactly the situation of a branch with two tunnels to the same hub and the same BGP prefix learned over both. The table then holds two next hops, one per tunnel, and SD-WAN rules choose between them. The members have their own <code>priority</code> attribute, and the SLA sub-table has <code>priority-in-sla</code> and <code>priority-out-sla</code> so that a member's route priority can depend on whether it meets the SLA; check the exact semantics in the release you run. Typical protocol distances are static 10 (default), eBGP 20, OSPF 110 and iBGP 200, which matters in the next chapters because an iBGP route (200) loses to a static route (10) for the same prefix.</p>
<h3>Reading the interaction on a real FortiGate</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
BR1-FGT # get router info routing-table details 10.10.5.5
Routing table for VRF=0
Routing entry for 10.10.0.0/16
  Known via "bgp", distance 200, metric 0, best
  * vrf 0 169.254.16.1, via HUB1-VPN1
  * vrf 0 169.254.17.1, via HUB1-VPN2</pre>
<p>Two next hops for one prefix: the choices exist. To see which one a rule chooses, use the SD-WAN service view and the policy routes that SD-WAN installs:</p>
<pre class="code"><span class="c">! Reference commands (not run in the simulator)</span>
diagnose sys sdwan service4
diagnose firewall proute list
get router info routing-table details 10.10.5.5</pre>
<p>On FortiOS 7.6 the service view is named <code>diagnose sys sdwan service4</code> (and <code>service6</code> for IPv6); the foundation module used the shorter name, which older releases accepted. Each rule block lists the members in the order the rule prefers them and marks the one currently selected.</p>
<div class="warn"><p><b>Common mistake.</b> Leaving a more specific static route on a physical WAN interface that overrides the overlay, for example an old route for 10.10.0.0/16 via port1. Longest prefix and distance still apply, so the old route wins and the overlay is never used. Search the table for the prefix before blaming the rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> A member without a route to the destination cannot be chosen by a rule. If a question shows a rule with the right members and SLA but traffic uses another link, check the routing table for the destination first.</p></div>
<div class="scn"><h4>The old route that won</h4><p>After migrating a branch to SD-WAN, backups to the data centre kept going over the internet-facing port, not over the overlay. The rule and the SLA were correct. A forgotten static route for 10.10.0.0/16 via port1, distance 10, was beating the BGP route (distance 200) that pointed into the tunnels. Deleting the old route made the overlay routes active and the rule started to steer.</p><p><b>Lesson:</b> Compare distances. A static route silently outranks iBGP.</p></div>
<div class="iv"><p class="q">"A rule prefers HUB1-VPN1 but traffic leaves via the underlay. What do you check?"</p><p>I check the routing table for the destination: is there a route through the overlay member, and is something more specific or with a lower distance pointing at the underlay? Then I check the member is alive and in SLA, the rule order, and the service view to see what the rule actually selects.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A rule can only select members that have a route to the destination.</li><li>Static routes can point at an SD-WAN zone; a blackhole route with high distance prevents leaks.</li><li>Equal distance and priority give ECMP; iBGP distance 200 loses to static 10.</li><li>Use get router info routing-table details, diagnose sys sdwan service4 and diagnose firewall proute list.</li></ul></div>
`,hi:`
<p>Zyadatar SD-WAN faults asal mein routing faults hote hain jo bhes badal kar aate hain, isliye hum dono ke exact rishte se shuru karte hain. nse4-sdwan ka rule yaad rakho: SD-WAN <b>rules</b> upar se neeche padhe jaate hain aur pehla match decide karta hai, bilkul policy route ki tarah. Us chapter ne doosra hissa zyada nahi bataya: rule sirf aise member ko chun sakta hai jiske paas <b>destination tak route</b> ho. Routing table roads ki list hai; rule un roads mein se chunta hai jo maujood hain.</p>
<h3>Naye session ka decision order</h3>
<ol><li>Pehla packet aata hai. FortiGate normal tarah <b>firewall policy</b> aur reverse path (RPF) check karta hai (nse4-routing dekho).</li><li>SD-WAN rules upar se evaluate hote hain. Rule source, destination, port, application ya Internet Service Database object par match karta hai.</li><li>Match hue rule ki strategy apni list mein se member chunti hai. Member sirf tab <b>candidate</b> hai jab woh alive ho (health check), destination tak uska route ho, aur strategy ko SLA chahiye to woh SLA meet kare.</li><li>Koi rule match na kare, ya match hue rule ko usable member na mile, to <b>implicit rule</b> lagu hota hai: normal route lookup aur load-balance mode.</li><li>Session chune hue egress interface ke saath banta hai; baad ke packets session follow karte hain.</li></ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="85" width="100" height="50" rx="10" fill="#bae6fd"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">Naya session</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.20 to 10.10.5.5</text><rect x="140" y="85" width="140" height="50" rx="10" fill="#fed7aa"/><text x="210" y="108" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN rules</text><text x="210" y="125" text-anchor="middle" class="svg-muted" font-size="11">pehla match, upar se</text><rect x="310" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="390" y="43" text-anchor="middle" class="svg-ink" font-size="13">Candidate members</text><text x="390" y="60" text-anchor="middle" class="svg-muted" font-size="11">alive + route + SLA</text><rect x="310" y="150" width="160" height="50" rx="10" fill="#e2e8f0"/><text x="390" y="173" text-anchor="middle" class="svg-ink" font-size="13">Implicit rule</text><text x="390" y="190" text-anchor="middle" class="svg-muted" font-size="11">routing table + load balance</text><rect x="500" y="85" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Egress interface</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="11">HUB1-VPN1</text><line x1="110" y1="110" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="310" y2="50" stroke="#64748b" stroke-width="2"/><line x1="280" y1="120" x2="310" y2="170" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="500" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="175" x2="500" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="11">Jis rule ko usable member na mile woh implicit rule par girta hai.</text></svg><p class="cap">Rule members ko filter aur rank karta hai; routing table tay karti hai ki destination ke liye kaun se members maujood hain.</p></div>
<div class="note"><p><b>Note.</b> Jab rule ko SLA meet karne wala member na mile to exact fallback strategy aur firmware release par depend karta hai. Apne version par lab mein test karo aur last-resort member design karo, jaisa nse4-sdwan ke chapter 7 mein bataya tha.</p></div>
<h3>Routes jo SD-WAN zone ko point karte hain</h3>
<p>nse4-sdwan mein aapne <code>set sdwan-zone</code> wala default route dekha tha. Wahi attribute doosre prefixes ke liye bhi chalta hai, isliye static route kisi ek member ka naam liye bina prefix ko poore zone mein bhej sakta hai. Jab sirf kuch sites hon to data centre tak pahunchne ka yeh simple, protocol-free tarika hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config router static
    edit 1
        set sdwan-zone "underlay"
        set comment "Internet over the ISP zone"
    next
    edit 2
        set dst 10.10.0.0 255.255.0.0
        set sdwan-zone "overlay"
        set comment "Data centre over the overlay zone"
    next
    edit 3
        set dst 10.10.0.0 255.255.0.0
        set blackhole enable
        set distance 254
        set comment "Safety net when no overlay member is alive"
    next
end</pre>
<p>Route 2 har overlay member ko 10.10.0.0/16 ka route deta hai. Route 3 high distance wala <b>blackhole</b> hai: jab tak koi overlay route hai asli route jeetta hai; jab saare overlay members chale jaate hain to traffic underlay default route se internet mein leak hone ki jagah drop ho jaata hai. nse4-ipsec ki tip yahan jaise ki taisi lagu hoti hai. Fortinet ke apne support articles blackhole routes ko traffic ko ek interface par <b>pin</b> karne ka tarika bhi batate hain taaki woh doosri link par failover na kare; use jaanbujhkar karo aur document karo.</p>
<h3>Members ke saath distance, priority aur ECMP</h3>
<p>nse4-routing ki har baat ab bhi sahi hai. Pehle longest prefix, phir distance, phir priority. Same prefix, distance aur priority wale do routes <b>ECMP</b> hain: dono next hops install hote hain. Branch ke do tunnels ek hi hub tak jaate hon aur dono par same BGP prefix seekha gaya ho to bilkul yahi situation hoti hai. Table mein do next hops hote hain, har tunnel ka ek, aur SD-WAN rules unke beech chunte hain. Members ka apna <code>priority</code> attribute hota hai, aur SLA sub-table mein <code>priority-in-sla</code> aur <code>priority-out-sla</code> hote hain taaki member ke route ki priority is baat par depend kare ki woh SLA meet karta hai ya nahi; exact semantics apne release mein check karo. Typical protocol distances: static 10 (default), eBGP 20, OSPF 110 aur iBGP 200, jo agle chapters mein zaroori hai kyunki same prefix ke liye iBGP route (200) static route (10) se haar jaata hai.</p>
<h3>Real FortiGate par interaction padhna</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
BR1-FGT # get router info routing-table details 10.10.5.5
Routing table for VRF=0
Routing entry for 10.10.0.0/16
  Known via "bgp", distance 200, metric 0, best
  * vrf 0 169.254.16.1, via HUB1-VPN1
  * vrf 0 169.254.17.1, via HUB1-VPN2</pre>
<p>Ek prefix ke do next hops: choices maujood hain. Rule kaun sa chunta hai yeh dekhne ke liye SD-WAN service view aur woh policy routes use karo jo SD-WAN install karta hai:</p>
<pre class="code"><span class="c">! Reference commands (not run in the simulator)</span>
diagnose sys sdwan service4
diagnose firewall proute list
get router info routing-table details 10.10.5.5</pre>
<p>FortiOS 7.6 par service view ka naam <code>diagnose sys sdwan service4</code> hai (IPv6 ke liye <code>service6</code>); foundation module ne chhota naam use kiya tha jo purane releases accept karte the. Har rule block member ko us order mein dikhata hai jis order mein rule unhe prefer karta hai aur abhi chuna hua member mark karta hai.</p>
<div class="warn"><p><b>Common galti.</b> Physical WAN interface par koi zyada specific static route chhod dena jo overlay ko override kare, jaise port1 se 10.10.0.0/16 ka purana route. Longest prefix aur distance tab bhi lagu hote hain, isliye purana route jeet jaata hai aur overlay kabhi use nahi hota. Rule ko doshi thehrane se pehle table mein prefix search karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Destination tak route na rakhne wala member rule se chuna nahi ja sakta. Agar sawaal mein sahi members aur SLA wala rule dikhe lekin traffic doosri link use kare, to pehle destination ke liye routing table check karo.</p></div>
<div class="scn"><h4>Purana route jo jeet gaya</h4><p>Branch ko SD-WAN par migrate karne ke baad data centre ke backups overlay ki jagah internet-facing port se jaate rahe. Rule aur SLA sahi the. Port1 se 10.10.0.0/16 ka bhoola hua static route, distance 10, BGP route (distance 200) ko haraa raha tha jo tunnels mein point karta tha. Purana route delete karte hi overlay routes active ho gaye aur rule steer karne laga.</p><p><b>Seekh:</b> Distances compare karo. Static route chupchap iBGP se upar hota hai.</p></div>
<div class="iv"><p class="q">"Rule HUB1-VPN1 prefer karta hai lekin traffic underlay se nikalta hai. Aap kya check karoge?"</p><p>Main destination ke liye routing table dekhta hoon: kya overlay member ke through route hai, aur kya koi zyada specific ya kam distance wala route underlay ko point kar raha hai? Phir member alive aur in SLA hone, rule order, aur service view dekhta hoon ki rule asal mein kya chun raha hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Rule sirf un members ko chun sakta hai jinke paas destination tak route ho.</li><li>Static routes SD-WAN zone ko point kar sakte hain; high distance wala blackhole route leak rokta hai.</li><li>Equal distance aur priority ECMP dete hain; iBGP distance 200 static 10 se haar jaata hai.</li><li>get router info routing-table details, diagnose sys sdwan service4 aur diagnose firewall proute list use karo.</li></ul></div>
`}};export{e as default};