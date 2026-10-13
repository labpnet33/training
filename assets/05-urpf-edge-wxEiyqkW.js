var e={id:`urpf-edge`,h:{en:`Stopping spoofed traffic at the edge: uRPF and anti-spoofing filters`,hi:`Edge par spoofed traffic rokna: uRPF aur anti-spoofing filters`},body:{en:`
<p><b>What is spoofing?</b> Every IP packet carries a source address. Nothing in IP itself checks that the sender really owns it. A <b>spoofed</b> packet lies about its source. Why would anyone do that? To hide, to bypass simple filters, and, in reflection attacks, to make a third party receive the replies. The best place to stop it is at the <b>edge</b>, where the provider connects to its customers, because there the provider knows exactly which addresses are allowed to appear on each port. This is the idea of BCP 38 (ingress filtering) and BCP 84.</p>
<h3>Unicast Reverse Path Forwarding (uRPF)</h3>
<p>uRPF lets the router do the check automatically using its own routing table. For each packet arriving on an interface the router asks the reverse question: <i>if I had to send a packet to this source address, would I send it back out this same interface?</i> If not, the packet is suspicious and is dropped. No hand-written ACL is needed, so it scales and stays correct as routes change.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">src 198.51.100.7</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">FIB lookup</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">route to source?</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Same interface?</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">strict check</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Forward or drop</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12"></text></svg><p class="cap">uRPF looks up the source address and compares the return path.</p></div>
<table class="cmp"><tr><th>Mode</th><th>Rule</th><th>Best used at</th></tr><tr><td>Strict</td><td>Best return path to the source must be this ingress interface</td><td>Single-homed customer edge</td></tr><tr><td>Loose</td><td>Source must exist in the FIB on any interface (usually not via the default route)</td><td>Multi-homed customers, peering and transit edges, source-based RTBH</td></tr><tr><td>Feasible-path</td><td>Accepts any interface that has a valid alternative path (platform dependent)</td><td>Asymmetric multi-homing</td></tr></table>
<p><b>Reference configuration (not run in the simulator).</b> Documentation addresses only.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
interface GigabitEthernet0/0/1
 description CUSTOMER-A single-homed
 ip address 203.0.113.1 255.255.255.252
 ip verify unicast source reachable-via rx
interface GigabitEthernet0/0/2
 description TRANSIT loose mode
 ip address 198.51.100.1 255.255.255.252
 ip verify unicast source reachable-via any

<span class="c">! IOS XR</span>
interface GigabitEthernet0/0/0/1
 ipv4 verify unicast source reachable-via rx</pre>
<p>The keyword <code>rx</code> means strict mode (the receive interface), <code>any</code> means loose. On IOS XE you may add an ACL (the packet is dropped only if it fails the check and the ACL does not permit it) and <code>allow-default</code> if the default route should count as a valid return path. Both options weaken the check, so use them with intent.</p>
<h3>The asymmetry trap</h3>
<p>Strict uRPF assumes routing is symmetric: the return path equals the arrival path. A customer connected to two providers may send traffic out of provider A with a source address that only provider B advertises. Provider A sees the source arriving on an interface that is not the best return path and, in strict mode, drops legitimate traffic. For that reason strict mode belongs on single-homed customers and loose mode on anything multi-homed or on peering links.</p>
<h3>uRPF is not the only anti-spoofing tool</h3>
<ul><li><b>Ingress ACLs</b> on customer ports permit only the customer's assigned prefixes as source. Precise but needs maintenance.</li>
<li><b>Infrastructure ACLs (iACL)</b> at the network boundary deny packets from outside that are addressed to your router loopbacks and link addresses.</li>
<li><b>Bogon and martian filters</b> drop sources from private or documentation space arriving from the Internet.</li></ul>
<p>Where possible, run the check where the traffic enters your network, not in the middle.</p>
<div class="eg"><p><b>Worked example.</b> Customer B (203.0.113.0/24) is single-homed on GigabitEthernet0/0/1. A packet arrives with source 192.0.2.99, which is not in B's range and is not routed via that port. Strict uRPF finds the route to 192.0.2.99 points elsewhere and drops it. A packet with source 203.0.113.50 passes because the return path is that port.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using strict mode on a multi-homed customer or with asymmetric routing, then blaming the customer when legitimate packets disappear. Also, remember uRPF needs CEF (or the XR equivalent forwarding table) to be enabled.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three modes and which one fits which edge. Strict: single-homed. Loose: multi-homed, peering, transit, and the building block for source-based RTBH. The default route normally does not satisfy a uRPF check unless you configure allow-default.</p></div>
<div class="scn"><h4>Strict mode on a multi-homed customer</h4><p>After a security push, a customer with two uplinks complained of intermittent loss. Their outbound traffic sometimes used the other provider with a source prefix advertised via the first one. The first provider's strict uRPF dropped those packets. Switching the customer port to loose mode, plus an ingress ACL permitting only the customer's own prefixes, kept anti-spoofing and ended the loss.</p><p><b>Lesson:</b> Pick the uRPF mode by topology, not by habit.</p></div>
<div class="iv"><p class="q">"When would you use strict and when loose uRPF?"</p><p>Strict where routing is symmetric, typically a single-homed customer, because the source must be reachable via the ingress interface. Loose where it can be asymmetric: multi-homed customers and peering or transit links, where it only checks that the source exists in the FIB. Loose is also what source-based RTBH relies on.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Spoofing is stopped best at the edge (BCP 38 and BCP 84).</li>
<li>uRPF uses the routing table to check the return path of the source address.</li>
<li>Strict: single-homed. Loose: multi-homed, peering, transit.</li>
<li>Asymmetric routing breaks strict mode.</li>
<li>uRPF complements ACLs and iACLs; it does not replace them.</li></ul></div>
`,hi:`
<p><b>Spoofing kya hai?</b> Har IP packet mein source address hota hai. IP khud check nahi karta ki sender sach mein uska malik hai. <b>Spoofed</b> packet apne source ke baare mein jhooth bolta hai. Koi aisa kyun karega? Chhupne ke liye, simple filters bypass karne ke liye, aur reflection attacks mein taaki replies kisi teesre ko mile. Ise rokne ki sabse achhi jagah <b>edge</b> hai, jahan provider customers se judta hai, kyunki wahan provider ko pata hota hai ki har port par kaunse addresses aa sakte hain. Yahi BCP 38 (ingress filtering) aur BCP 84 ka idea hai.</p>
<h3>Unicast Reverse Path Forwarding (uRPF)</h3>
<p>uRPF router ko apni routing table se check automatically karne deta hai. Interface par aaye har packet ke liye router ulta sawal poochta hai: <i>agar mujhe is source address par packet bhejna ho, to kya main use isi interface se bahar bhejunga?</i> Nahi, to packet shak ke dayre mein hai aur drop hota hai. Haath se likhe ACL ki zaroorat nahi, isliye yeh scale karta hai aur routes badalne par bhi sahi rehta hai.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">src 198.51.100.7</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">FIB lookup</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">source ka route?</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Same interface?</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">strict check</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Forward ya drop</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12"></text></svg><p class="cap">uRPF source address lookup karke return path compare karta hai.</p></div>
<table class="cmp"><tr><th>Mode</th><th>Rule</th><th>Best use kahan</th></tr><tr><td>Strict</td><td>Source ka best return path yahi ingress interface hona chahiye</td><td>Single-homed customer edge</td></tr><tr><td>Loose</td><td>Source FIB mein kisi bhi interface par hona chahiye (aam taur par default route se nahi)</td><td>Multi-homed customers, peering aur transit edges, source-based RTBH</td></tr><tr><td>Feasible-path</td><td>Koi bhi interface jisme valid alternative path ho (platform dependent)</td><td>Asymmetric multi-homing</td></tr></table>
<p><b>Reference configuration (not run in the simulator).</b> Sirf documentation addresses.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE</span>
interface GigabitEthernet0/0/1
 description CUSTOMER-A single-homed
 ip address 203.0.113.1 255.255.255.252
 ip verify unicast source reachable-via rx
interface GigabitEthernet0/0/2
 description TRANSIT loose mode
 ip address 198.51.100.1 255.255.255.252
 ip verify unicast source reachable-via any

<span class="c">! IOS XR</span>
interface GigabitEthernet0/0/0/1
 ipv4 verify unicast source reachable-via rx</pre>
<p>Keyword <code>rx</code> ka matlab strict mode (receive interface), <code>any</code> ka matlab loose. IOS XE par ACL add kar sakte ho (packet tabhi drop hota hai jab check fail ho aur ACL permit na kare) aur <code>allow-default</code> agar default route ko valid return path maana jaaye. Dono options check ko kamzor karte hain, isliye soch samajh kar use karo.</p>
<h3>Asymmetry ka trap</h3>
<p>Strict uRPF maanta hai ki routing symmetric hai: return path aur arrival path same. Do providers se juda customer provider A ke through aisa source address bhej sakta hai jo sirf provider B advertise karta hai. Provider A ko source aise interface par dikhta hai jo best return path nahi hai aur strict mode mein woh legitimate traffic drop kar deta hai. Isliye strict mode single-homed customers par aur loose mode multi-homed ya peering links par lagta hai.</p>
<h3>uRPF akela anti-spoofing tool nahi hai</h3>
<ul><li>Customer ports par <b>ingress ACLs</b> sirf customer ke assigned prefixes ko source ki tarah permit karte hain. Precise hai par maintenance chahiye.</li>
<li>Network boundary par <b>Infrastructure ACLs (iACL)</b> bahar se aaye un packets ko deny karte hain jo aapke router loopbacks aur link addresses ke liye hain.</li>
<li><b>Bogon aur martian filters</b> Internet se aaye private ya documentation space ke sources drop karte hain.</li></ul>
<p>Jahan ho sake, check wahan chalao jahan traffic aapke network mein enter hota hai, beech mein nahi.</p>
<div class="eg"><p><b>Worked example.</b> Customer B (203.0.113.0/24) GigabitEthernet0/0/1 par single-homed hai. Source 192.0.2.99 wala packet aata hai, jo B ki range mein nahi hai aur us port se routed nahi hai. Strict uRPF dekhta hai ki 192.0.2.99 ka route kahin aur ja raha hai aur use drop kar deta hai. Source 203.0.113.50 wala packet pass ho jaata hai kyunki return path wahi port hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Multi-homed customer ya asymmetric routing par strict mode lagana, phir legitimate packets gayab hone par customer ko doshi thehrana. Yaad rakho ki uRPF ko CEF (ya XR ka equivalent forwarding table) enabled chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen modes aur kaun sa kis edge ke liye hai yaad rakho. Strict: single-homed. Loose: multi-homed, peering, transit, aur source-based RTBH ka building block. Default route aam taur par uRPF check satisfy nahi karta jab tak allow-default configure na ho.</p></div>
<div class="scn"><h4>Multi-homed customer par strict mode</h4><p>Security push ke baad do uplinks wale customer ne intermittent loss ki shikayat ki. Unka outbound traffic kabhi doosre provider se jaata tha aur source prefix pehle provider ke zariye advertise tha. Pehle provider ke strict uRPF ne woh packets drop kiye. Customer port ko loose mode par karne aur sirf customer ke apne prefixes permit karne wale ingress ACL se anti-spoofing bhi raha aur loss bhi band hua.</p><p><b>Lesson:</b> uRPF mode topology se chuno, aadat se nahi.</p></div>
<div class="iv"><p class="q">"Strict aur loose uRPF kab use karoge?"</p><p>Strict wahan jahan routing symmetric hai, aam taur par single-homed customer, kyunki source ingress interface se reachable hona chahiye. Loose wahan jahan asymmetric ho sakta hai: multi-homed customers aur peering ya transit links, jahan sirf check hota hai ki source FIB mein hai. Source-based RTBH bhi loose par depend karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Spoofing edge par sabse achhi tarah rokta hai (BCP 38 aur BCP 84).</li>
<li>uRPF routing table se source address ka return path check karta hai.</li>
<li>Strict: single-homed. Loose: multi-homed, peering, transit.</li>
<li>Asymmetric routing strict mode tod deta hai.</li>
<li>uRPF ACLs aur iACLs ka complement hai; unka replacement nahi.</li></ul></div>
`}};export{e as default};