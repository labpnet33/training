var e={id:`default-rpf-blackhole`,h:{en:`Default route from the hub, blackhole routes, RPF and asymmetric routing`,hi:`Hub se default route, blackhole routes, RPF aur asymmetric routing`},body:{en:`
<p>Three topics finish the routing story: who provides the <b>default route</b> to the branches, how <b>blackhole routes</b> protect the design, and how <b>reverse path forwarding (RPF)</b> and <b>asymmetric routing</b> can drop traffic that looks perfectly routed. Each is a classic exam and production topic.</p>
<h3>Where does the default route come from?</h3>
<p>There are two internet designs, and the routing must match the choice.</p>
<table class="cmp"><tr><th>Design</th><th>Internet traffic of the branch</th><th>Default route</th></tr><tr><td>Local breakout</td><td>Leaves directly through the branch ISP links (underlay zone)</td><td>Static default with <code>sdwan-zone</code> underlay on the spoke. The hub does not need to send a default.</td></tr><tr><td>Central breakout</td><td>Goes through the overlay to the hub, which inspects it and sends it to the internet</td><td>The hub <b>originates</b> a default route and sends it to the spokes over BGP (or OSPF)</td></tr></table>
<p>Remember the distances. A static default on the spoke has distance 10 and beats an iBGP default (200), so with both present, local breakout wins. For central breakout, either remove the spoke's underlay default (keeping a more specific route to the hub tunnel endpoints so that IPsec itself keeps working) or give the underlay default a higher distance so that it is only a fallback. Plan the IPsec peer routes first, otherwise the tunnel sends its own packets into itself.</p>
<h3>Originating the default route on the hub</h3>
<p>FortiOS has three common ways. In BGP, a neighbor option <code>capability-default-originate enable</code> advertises a default route to that neighbor even when the hub itself has no default in its RIB; the option <code>default-originate-routemap</code> attaches a route map, for example to add a community. Alternatively, a <code>network 0.0.0.0/0</code> statement advertises the hub's own default but needs one in the table. In OSPF, <code>default-information-originate</code> takes enable or always. A third-party article notes that the default sent by <code>capability-default-originate</code> cannot be changed by an ordinary outbound route map; use the <code>default-originate-routemap</code> option when you need conditions or attributes.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: tell all spokes how to reach the internet via the hub</span>
config router bgp
    config neighbor-group
        edit "SPOKES"
            set capability-default-originate enable
        next
    end
end
<span class="c">! BR1-FGT (central breakout): underlay default becomes only a fallback,</span>
<span class="c">! and the hub tunnel endpoints stay reachable through the underlay</span>
config router static
    edit 1
        set sdwan-zone "underlay"
        set distance 250
    next
    edit 2
        set dst 203.0.113.10 255.255.255.255
        set sdwan-zone "underlay"
    next
    edit 3
        set dst 198.51.100.10 255.255.255.255
        set sdwan-zone "underlay"
    next
end</pre>
<p>Both hubs normally originate a default route. A spoke then has two defaults. With different local preferences from route maps (chapter 5), or with a higher AS path, one hub is primary and the other is backup for internet; or SD-WAN rules for internet applications choose among the overlay members.</p>
<h3>Blackhole routes: three jobs</h3>
<ol><li><b>Leak prevention.</b> When the overlay is down, traffic for private prefixes must not follow the underlay default to the internet. A blackhole route for the corporate range with distance 254 stays in the table and drops it.</li><li><b>Making BGP advertise a summary.</b> A BGP <code>network</code> statement needs a matching route. A blackhole route for 10.1.0.0/16 on the hub gives BGP something to advertise as an aggregate, while specific routes still win by longest prefix.</li><li><b>Pinning.</b> Fortinet support articles show blackhole routes used to stop failover of a flow to another link. Remember that when the overlay's static routes remain while health checks fail, an SD-WAN rule with the <code>default</code> option may still match traffic for the remote prefix and send it to the underlay; Fortinet suggests an address group that excludes the remote subnet, or a stop policy route for it.</li></ol>
<h3>RPF and asymmetric routing</h3>
<p>You met RPF in nse4-routing: the first packet of a session is accepted only if the routing table can reach its <b>source</b> through the interface it arrived on. In an overlay this fails in recognisable ways. A packet from BR2's LAN arrives from the hub on HUB1-VPN1, but the table says 10.1.2.0/24 is reachable only through HUB1-VPN2; the log says <code>reverse path check fail, drop</code>. With ECMP routes through both tunnels (chapter 4) the check passes, because the source is reachable through the arrival interface. Do not use <code>asymroute</code> to hide the problem: it weakens anti-spoofing and stateful inspection.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="85" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="65" y="129" text-anchor="middle" class="svg-muted" font-size="11">SD-WAN rule</text><rect x="260" y="20" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">has the session</text><rect x="260" y="160" width="120" height="50" rx="10" fill="#fde68a"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT</text><text x="320" y="199" text-anchor="middle" class="svg-muted" font-size="11">no session</text><rect x="510" y="85" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">Server in DC</text><text x="570" y="129" text-anchor="middle" class="svg-muted" font-size="11">10.10.5.5</text><line x1="120" y1="100" x2="260" y2="48" stroke="#16a34a" stroke-width="3"/><line x1="380" y1="48" x2="510" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="510" y1="130" x2="380" y2="185" stroke="#dc2626" stroke-width="3"/><line x1="260" y1="185" x2="120" y2="130" stroke="#dc2626" stroke-width="3"/><text x="190" y="62" text-anchor="middle" class="svg-muted" font-size="11">request</text><text x="190" y="190" text-anchor="middle" class="svg-muted" font-size="11">reply: dropped</text></svg><p class="cap">Request through HUB1, reply through HUB2: the second firewall has no session for the reply and drops it.</p></div>
<p><b>Asymmetric routing</b> means the request and the reply use different paths. Through one FortiGate at each end it often still works, because policies use zones. With two hubs, each a separate firewall, the reply reaches a firewall that never saw the request and is dropped. The fixes are design fixes: advertise the same preference from both hubs (same local preference, AS-path prepend on the non-preferred hub), steer the return path with the community and route-tag method of chapter 5, and keep SD-WAN rules for the same application identical at both ends.</p>
<h3>Verification</h3>
<pre class="code"><span class="c">! Reference commands (not run in the simulator)</span>
get router info routing-table details 10.1.2.20
diagnose debug flow filter addr 10.1.2.20
diagnose debug flow trace start 5
diagnose debug enable
diagnose debug disable
diagnose debug reset</pre>
<p>The debug flow wording is the same as in the real nse4-routing lab: look for <code>reverse path check fail, drop</code>, and compare the arrival interface with the interface in the routing table for the source address. Always disable and reset the debug afterwards.</p>
<div class="warn"><p><b>Common mistake.</b> Enabling a central-breakout default from the hub while the spoke keeps its underlay default at distance 10. Internet traffic stays local and the central inspection is bypassed; or the opposite, the spoke loses its underlay default and then cannot reach the IPsec peer address.</p></div>
<div class="exam"><p><b>Exam trap.</b> A static default (10) beats an iBGP default (200). Blackhole routes have a high distance so they only act when the real route disappears. RPF drops show "reverse path check fail" and happen before any policy check.</p></div>
<div class="scn"><h4>Half of the calls from HQ went silent</h4><p>With two hubs in two cities, one-way audio began after a change. Requests from branches went to HUB1 because of higher local preference, but the data-centre network was announced equally by both hubs, so replies sometimes returned via HUB2, which had no session. Adding AS-path prepend for the data-centre prefix on HUB2 and the same local preference on the spokes made the return path symmetric.</p><p><b>Lesson:</b> Make both hubs tell the same story, or only one of them gets the session.</p></div>
<div class="iv"><p class="q">"Traffic reaches the data centre but the reply never comes back. How do you find out why?"</p><p>I check whether the path is asymmetric: which hub or tunnel the request used and which one the reply takes. A debug flow on the device that should see the reply shows either no session or a reverse path check failure. Then I compare routing tables and BGP preferences on both hubs and fix the preference, not enable asymmetric routing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Local breakout uses a static underlay default; central breakout needs the hub to originate a default.</li><li>capability-default-originate and default-originate-routemap (BGP), default-information-originate (OSPF).</li><li>Blackhole routes prevent leaks, enable summaries and can pin traffic; use a high distance.</li><li>Fix asymmetry with consistent preferences and tag-based steering, not with asymroute.</li></ul></div>
`,hi:`
<p>Routing ki kahani teen topics se poori hoti hai: branches ko <b>default route</b> kaun deta hai, <b>blackhole routes</b> design ko kaise bachate hain, aur <b>reverse path forwarding (RPF)</b> aur <b>asymmetric routing</b> aisa traffic kaise drop kar dete hain jo sahi routed lagta hai. Har ek classic exam aur production topic hai.</p>
<h3>Default route kahan se aata hai?</h3>
<p>Internet ke do designs hain, aur routing ko chunav se match karna chahiye.</p>
<table class="cmp"><tr><th>Design</th><th>Branch ka internet traffic</th><th>Default route</th></tr><tr><td>Local breakout</td><td>Seedha branch ISP links (underlay zone) se nikalta hai</td><td>Spoke par <code>sdwan-zone</code> underlay wala static default. Hub ko default bhejne ki zarurat nahi.</td></tr><tr><td>Central breakout</td><td>Overlay se hub tak jaata hai, jo use inspect karke internet bhejta hai</td><td>Hub default route <b>originate</b> karta hai aur BGP (ya OSPF) se spokes ko bhejta hai</td></tr></table>
<p>Distances yaad rakho. Spoke ka static default distance 10 hai aur iBGP default (200) ko haraata hai, isliye dono hon to local breakout jeetta hai. Central breakout ke liye ya to spoke ka underlay default hatao (hub tunnel endpoints ka zyada specific route rakhte hue taaki IPsec khud chalta rahe) ya underlay default ko zyada distance do taaki woh sirf fallback ho. Pehle IPsec peer routes plan karo, warna tunnel apne hi packets ko khud mein bhej deta hai.</p>
<h3>Hub par default route originate karna</h3>
<p>FortiOS mein teen aam tarike hain. BGP mein neighbor option <code>capability-default-originate enable</code> us neighbor ko default route advertise karta hai tab bhi jab hub ke apne RIB mein default nahi hai; option <code>default-originate-routemap</code> route map jodta hai, jaise community add karne ke liye. Alternatively <code>network 0.0.0.0/0</code> statement hub ka apna default advertise karta hai lekin table mein ek hona chahiye. OSPF mein <code>default-information-originate</code> enable ya always leta hai. Ek third-party article batata hai ki <code>capability-default-originate</code> se bheja default aam outbound route map se badla nahi ja sakta; conditions ya attributes chahiye to <code>default-originate-routemap</code> option use karo.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: tell all spokes how to reach the internet via the hub</span>
config router bgp
    config neighbor-group
        edit "SPOKES"
            set capability-default-originate enable
        next
    end
end
<span class="c">! BR1-FGT (central breakout): underlay default becomes only a fallback,</span>
<span class="c">! and the hub tunnel endpoints stay reachable through the underlay</span>
config router static
    edit 1
        set sdwan-zone "underlay"
        set distance 250
    next
    edit 2
        set dst 203.0.113.10 255.255.255.255
        set sdwan-zone "underlay"
    next
    edit 3
        set dst 198.51.100.10 255.255.255.255
        set sdwan-zone "underlay"
    next
end</pre>
<p>Dono hubs aam taur par default route originate karte hain. Spoke ke paas phir do defaults hote hain. Route maps se alag local preferences (chapter 5) ya zyada AS path ke saath ek hub internet ke liye primary aur doosra backup banta hai; ya internet applications ke SD-WAN rules overlay members mein se chunte hain.</p>
<h3>Blackhole routes: teen kaam</h3>
<ol><li><b>Leak prevention.</b> Overlay down ho to private prefixes ka traffic underlay default se internet nahi jaana chahiye. Corporate range ka distance 254 wala blackhole route table mein rehta hai aur use drop kar deta hai.</li><li><b>BGP ko summary advertise karwana.</b> BGP <code>network</code> statement ko matching route chahiye. Hub par 10.1.0.0/16 ka blackhole route BGP ko aggregate advertise karne ke liye kuch deta hai, jabki specific routes longest prefix se jeette hain.</li><li><b>Pinning.</b> Fortinet support articles blackhole routes ko flow ko doosri link par failover hone se rokne ke liye dikhate hain. Yaad rakho ki jab overlay ke static routes rehte hain aur health checks fail hote hain, tab <code>default</code> option wala SD-WAN rule remote prefix ka traffic underlay par bhej sakta hai; Fortinet remote subnet ko exclude karne wala address group, ya uske liye stop policy route suggest karta hai.</li></ol>
<h3>RPF aur asymmetric routing</h3>
<p>RPF aap nse4-routing mein mil chuke ho: session ka pehla packet tabhi accept hota hai jab routing table uske <b>source</b> tak us interface se pahunch sake jis par woh aaya. Overlay mein yeh pehchaane jaane wale tarikon se fail hota hai. BR2 ke LAN ka packet hub se HUB1-VPN1 par aata hai, lekin table kehti hai 10.1.2.0/24 sirf HUB1-VPN2 se reachable hai; log kehta hai <code>reverse path check fail, drop</code>. Dono tunnels se ECMP routes (chapter 4) hon to check pass ho jaata hai, kyunki source arrival interface se reachable hai. Problem chhupane ke liye <code>asymroute</code> use mat karo: yeh anti-spoofing aur stateful inspection kamzor karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="10" y="85" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="65" y="129" text-anchor="middle" class="svg-muted" font-size="11">SD-WAN rule</text><rect x="260" y="20" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">session hai</text><rect x="260" y="160" width="120" height="50" rx="10" fill="#fde68a"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT</text><text x="320" y="199" text-anchor="middle" class="svg-muted" font-size="11">session nahi</text><rect x="510" y="85" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">DC mein server</text><text x="570" y="129" text-anchor="middle" class="svg-muted" font-size="11">10.10.5.5</text><line x1="120" y1="100" x2="260" y2="48" stroke="#16a34a" stroke-width="3"/><line x1="380" y1="48" x2="510" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="510" y1="130" x2="380" y2="185" stroke="#dc2626" stroke-width="3"/><line x1="260" y1="185" x2="120" y2="130" stroke="#dc2626" stroke-width="3"/><text x="190" y="62" text-anchor="middle" class="svg-muted" font-size="11">request</text><text x="190" y="190" text-anchor="middle" class="svg-muted" font-size="11">reply: drop</text></svg><p class="cap">Request HUB1 se, reply HUB2 se: doosre firewall ke paas reply ka session nahi hai aur woh use drop kar deta hai.</p></div>
<p><b>Asymmetric routing</b> ka matlab request aur reply alag paths use karte hain. Dono ends par ek-ek FortiGate ho to aksar tab bhi kaam karta hai, kyunki policies zones use karti hain. Do hubs ke saath, har ek alag firewall, reply aise firewall tak pahunchta hai jisne request dekhi hi nahi aur drop ho jaata hai. Fix design ke fix hain: dono hubs se same preference advertise karo (same local preference, non-preferred hub par AS-path prepend), return path ko chapter 5 ki community aur route-tag method se steer karo, aur same application ke SD-WAN rules dono ends par identical rakho.</p>
<h3>Verification</h3>
<pre class="code"><span class="c">! Reference commands (not run in the simulator)</span>
get router info routing-table details 10.1.2.20
diagnose debug flow filter addr 10.1.2.20
diagnose debug flow trace start 5
diagnose debug enable
diagnose debug disable
diagnose debug reset</pre>
<p>Debug flow ki wording real nse4-routing lab jaisi hi hai: <code>reverse path check fail, drop</code> dhundo, aur arrival interface ko source address ke liye routing table ke interface se compare karo. Baad mein debug hamesha disable aur reset karo.</p>
<div class="warn"><p><b>Common galti.</b> Hub se central-breakout default enable karna jabki spoke apna underlay default distance 10 par rakhta hai. Internet traffic local rehta hai aur central inspection bypass ho jaata hai; ya ulta, spoke underlay default kho deta hai aur phir IPsec peer address tak nahi pahunch paata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static default (10) iBGP default (200) ko haraata hai. Blackhole routes ka distance high hota hai taaki woh sirf tab kaam karein jab asli route gayab ho. RPF drops "reverse path check fail" dikhate hain aur kisi bhi policy check se pehle hote hain.</p></div>
<div class="scn"><h4>HQ se aadhi calls chup ho gayi</h4><p>Do shehron ke do hubs ke saath, ek change ke baad one-way audio shuru hui. Branches ki requests zyada local preference ki wajah se HUB1 gayi, lekin data-centre network dono hubs ne barabar announce kiya tha, isliye replies kabhi HUB2 se laute, jiske paas session nahi tha. HUB2 par data-centre prefix ke liye AS-path prepend aur spokes par same local preference jodne se return path symmetric ho gaya.</p><p><b>Seekh:</b> Dono hubs ek hi kahani sunayein, warna session sirf ek ke paas hota hai.</p></div>
<div class="iv"><p class="q">"Traffic data centre tak pahunchta hai lekin reply wapas nahi aata. Aap kaise pata lagaoge?"</p><p>Main dekhta hoon ki path asymmetric hai ya nahi: request kaun se hub ya tunnel se gayi aur reply kaun sa le raha hai. Jis device ko reply dikhna chahiye us par debug flow ya to no session dikhata hai ya reverse path check failure. Phir dono hubs par routing tables aur BGP preferences compare karta hoon aur preference theek karta hoon, asymmetric routing enable nahi karta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Local breakout static underlay default use karta hai; central breakout mein hub ko default originate karna padta hai.</li><li>capability-default-originate aur default-originate-routemap (BGP), default-information-originate (OSPF).</li><li>Blackhole routes leaks rokte hain, summaries enable karte hain aur traffic pin kar sakte hain; high distance use karo.</li><li>Asymmetry ko consistent preferences aur tag-based steering se theek karo, asymroute se nahi.</li></ul></div>
`}};export{e as default};