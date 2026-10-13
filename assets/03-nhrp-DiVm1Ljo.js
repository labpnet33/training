var e={id:`nhrp`,h:{en:`NHRP: roles, registration and resolution`,hi:`NHRP: roles, registration aur resolution`},body:{en:`
<p>On an Ethernet LAN, ARP answers "which MAC address owns this IP?". On an mGRE cloud there is no broadcast to shout the question, so DMVPN needs a <b>server</b> that everyone already knows. That is the <b>Next Hop Resolution Protocol (NHRP)</b>, defined in RFC 2332: a client-server "ARP for tunnels" that maps <b>tunnel addresses</b> to <b>NBMA addresses</b>.</p>

<h3>The two roles</h3>
<dl class="terms">
<dt>NHS (Next Hop Server)</dt><dd>The hub. It keeps the NHRP database of every registered spoke and answers or forwards resolution requests. Configured implicitly: a router with NHRP and no <code>ip nhrp nhs</code> of its own acts as a server for those who register with it.</dd>
<dt>NHC (Next Hop Client)</dt><dd>Each spoke. It knows the NHS tunnel address (<code>ip nhrp nhs 172.16.100.1</code>) and how to reach it in the underlay (a static mapping to 100.64.10.2). It registers itself and asks the NHS to resolve other addresses.</dd>
</dl>

<h3>The NHRP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Sent by</th><th>Purpose</th></tr>
<tr><td>Registration Request / Reply</td><td>Spoke to hub / hub to spoke</td><td>"My tunnel IP 172.16.100.2 is at NBMA 100.64.20.2." Refreshed periodically.</td></tr>
<tr><td>Resolution Request / Reply</td><td>Spoke / far spoke</td><td>"Who owns 172.16.100.3 (or 10.3.3.10)?" The reply comes back directly from the owner.</td></tr>
<tr><td>Purge Request / Reply</td><td>Any router</td><td>Remove a mapping that is no longer valid, for example after a route change.</td></tr>
<tr><td>Error Indication</td><td>Any router</td><td>Report a problem, such as an authentication failure or a loop.</td></tr>
<tr><td>Traffic Indication</td><td>Hub (phase 3 only)</td><td>The NHRP "redirect": tells a spoke there is a better path.</td></tr></table>
<p>NHRP messages travel <b>inside GRE</b> with GRE protocol type 0x2001, not as a separate IP protocol. So once the underlay permits GRE (and ESP when IPsec is used), NHRP flows too.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="NHRP registration and resolution ladder">
<defs><marker id="nh3e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="100" y="31" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 (NHC)</text>
<rect x="260" y="10" width="120" height="32" rx="6" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">HUB (NHS)</text>
<rect x="480" y="10" width="120" height="32" rx="6" fill="#fde68a"/><text x="540" y="31" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 (NHC)</text>
<line x1="100" y1="42" x2="100" y2="250" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="42" x2="320" y2="250" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="42" x2="540" y2="250" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="70" x2="316" y2="70" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3e)"/><text x="208" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 Registration Request</text>
<line x1="320" y1="100" x2="104" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3e)"/><text x="208" y="94" text-anchor="middle" class="svg-muted" font-size="12">2 Registration Reply</text>
<line x1="100" y1="150" x2="316" y2="150" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3e)"/><text x="208" y="144" text-anchor="middle" class="svg-ink" font-size="12">3 Resolution Request .3?</text>
<line x1="320" y1="180" x2="536" y2="180" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3e)"/><text x="430" y="174" text-anchor="middle" class="svg-ink" font-size="12">4 forwarded by NHS</text>
<line x1="540" y1="225" x2="104" y2="225" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3" marker-end="url(#nh3e)"/><text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">5 Resolution Reply, direct: .3 is 100.64.30.2</text>
</svg><p class="cap">Registration keeps the hub's address book current; resolution lets a spoke learn another spoke's NBMA address. The reply goes spoke to spoke.</p></div>

<h3>Registration in detail</h3>
<p>When the tunnel comes up, the spoke sends a Registration Request to its NHS containing its tunnel address, its NBMA address and a <b>holdtime</b>. The hub creates a <b>dynamic</b> entry and replies. The spoke refreshes the registration every one third of the holdtime (with <code>ip nhrp holdtime 300</code>, every 100 seconds). If the hub hears nothing for the full holdtime, the entry expires and the spoke disappears from <code>show dmvpn</code>.</p>
<p>By default registrations carry the <b>unique</b> flag: the hub refuses a new NBMA address for a tunnel IP that is already registered until the old entry expires. For spokes on DHCP or behind changing NAT, <code>ip nhrp registration no-unique</code> on the spoke lets the hub overwrite the entry immediately.</p>

<h3>The parameters that must agree</h3>
<ul>
<li><code>ip nhrp network-id 100</code> turns NHRP on for the interface. The value is <b>locally significant</b>: it only separates NHRP domains inside one router. Keeping it the same everywhere is simply good practice.</li>
<li><code>ip nhrp authentication NKdmvpn</code> is a clear-text string of up to 8 characters carried in every NHRP packet. It <b>must match</b>; a mismatch makes the receiver ignore the packets. It is not security, only protection against mistakes; IPsec provides the real security.</li>
<li><code>ip nhrp holdtime 300</code> is how long others may keep your mapping. The default is 7200 seconds; Cisco recommends 300 to 600 so stale entries disappear quickly.</li>
<li><code>tunnel key</code>, if used, must match (chapter 2).</li>
</ul>

<h3>Multicast over NBMA</h3>
<p>EIGRP (224.0.0.10) and OSPF (224.0.0.5/6) send their hellos as multicast. An mGRE interface cannot broadcast, so it <b>replicates</b> each multicast packet as unicast to every NBMA address in its multicast list. On the hub, <code>ip nhrp map multicast dynamic</code> adds every spoke that registers. On a spoke, <code>ip nhrp map multicast 100.64.10.2</code> points multicast to the hub only. Result: every spoke is an IGP neighbour of the hub, and spokes are <b>never</b> neighbours of each other. Remember that sentence; it explains the OSPF DR rule in chapter 9.</p>

<pre class="out">HUB# show ip nhrp
172.16.100.2/32 via 172.16.100.2
   Tunnel0 created 00:12:40, expire 00:04:19
<span class="hl">   Type: dynamic, Flags: registered nhop</span>
   NBMA address: 100.64.20.2
172.16.100.3/32 via 172.16.100.3
   Tunnel0 created 00:12:31, expire 00:04:28
   Type: dynamic, Flags: registered nhop
<span class="hl">   NBMA address: 100.64.30.2</span></pre>

<div class="eg"><p><b>Worked example.</b> SPOKE2 registered with holdtime 300 at 10:00:00. It refreshes at about 10:01:40, 10:03:20 and so on. At 10:02:00 its internet link fails. The hub's entry shows "expire 00:03:20" at that moment and keeps counting down; the last successful refresh was 10:01:40, so the entry is removed at 10:06:40. Meanwhile the OSPF dead timer (40 s on broadcast) has long since removed SPOKE2's routes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ip nhrp map multicast dynamic</code> on the hub. NHRP registration works, <code>show dmvpn</code> looks perfect, but OSPF or EIGRP never forms a neighbour, because hellos from the hub never reach the spokes.</p></div>

<div class="exam"><p><b>Exam trap.</b> The NHRP network-id does not have to match between routers; the authentication string and the tunnel key do. And NHRP is not an IP protocol number: it rides in GRE (type 0x2001), so an ACL permitting protocol 47 (and 50 for ESP, UDP 500/4500 for IKE) is enough.</p></div>

<div class="scn"><h4>Spoke vanishes after an ISP change</h4><p>A branch changed ISP and its public address changed. The spoke kept sending registrations, but the hub logged a unique-address conflict and kept the old NBMA address for up to two hours (the default 7200 s holdtime). The engineer lowered the holdtime to 300 on all routers and added <code>ip nhrp registration no-unique</code> on the DHCP spokes. Future address changes recovered in seconds.</p><p><b>Lesson:</b> default NHRP timers are too long for spokes with dynamic addresses; use a short holdtime and no-unique where addresses change.</p></div>

<div class="iv"><p class="q">"Explain NHRP registration and resolution in DMVPN."</p><p>Strong answer: spokes are NHCs configured with the hub as NHS and a static mapping of the hub tunnel IP to its NBMA address. They send Registration Requests with their own tunnel-to-NBMA mapping and refresh at one third of the holdtime; the hub stores dynamic entries. To reach another spoke, a spoke sends a Resolution Request via the hub; the hub forwards it to the owner, which replies directly with its NBMA address. Mention authentication and multicast mapping for IGP hellos.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NHRP maps tunnel (protocol) addresses to NBMA addresses; hub = NHS, spokes = NHC.</li>
<li>Registration builds the hub's database; resolution lets spokes find each other; the reply is direct.</li>
<li>Network-id is local; authentication (8 chars, clear text) and tunnel key must match.</li>
<li>Holdtime default 7200 s, recommended 300 to 600; refresh every holdtime/3.</li>
<li><code>map multicast dynamic</code> on the hub is required for IGP hellos to reach spokes.</li>
</ul></div>
`,hi:`
<p>Ethernet LAN par ARP jawab deta hai "yeh IP kis MAC address ka hai?". mGRE cloud par sawaal chillane ke liye koi broadcast nahi hai, isliye DMVPN ko ek <b>server</b> chahiye jise sab pehle se jaante hon. Yahi <b>Next Hop Resolution Protocol (NHRP)</b> hai, RFC 2332 mein defined: ek client-server "tunnels ke liye ARP" jo <b>tunnel addresses</b> ko <b>NBMA addresses</b> se map karta hai.</p>

<h3>Do roles</h3>
<dl class="terms">
<dt>NHS (Next Hop Server)</dt><dd>Hub. Yeh har registered spoke ka NHRP database rakhta hai aur resolution requests ka jawab deta ya unhe forward karta hai. Implicitly configure hota hai: jis router par NHRP hai aur apna koi <code>ip nhrp nhs</code> nahi hai, woh un sabke liye server ka kaam karta hai jo uske saath register karte hain.</dd>
<dt>NHC (Next Hop Client)</dt><dd>Har spoke. Ise NHS ka tunnel address pata hai (<code>ip nhrp nhs 172.16.100.1</code>) aur underlay mein wahan kaise pahunchna hai (100.64.10.2 ki static mapping). Yeh khud ko register karta hai aur NHS se doosre addresses resolve karne ko kehta hai.</dd>
</dl>

<h3>NHRP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Kaun bhejta hai</th><th>Purpose</th></tr>
<tr><td>Registration Request / Reply</td><td>Spoke se hub / hub se spoke</td><td>"Mera tunnel IP 172.16.100.2 NBMA 100.64.20.2 par hai." Periodically refresh hota hai.</td></tr>
<tr><td>Resolution Request / Reply</td><td>Spoke / door wala spoke</td><td>"172.16.100.3 (ya 10.3.3.10) kiska hai?" Reply seedha owner se wapas aata hai.</td></tr>
<tr><td>Purge Request / Reply</td><td>Koi bhi router</td><td>Jo mapping ab valid nahi hai use hatana, jaise route change ke baad.</td></tr>
<tr><td>Error Indication</td><td>Koi bhi router</td><td>Problem report karna, jaise authentication failure ya loop.</td></tr>
<tr><td>Traffic Indication</td><td>Hub (sirf phase 3)</td><td>NHRP "redirect": spoke ko batata hai ki behtar path hai.</td></tr></table>
<p>NHRP messages alag IP protocol ki tarah nahi, balki <b>GRE ke andar</b> GRE protocol type 0x2001 ke saath chalte hain. Isliye jab underlay GRE (aur IPsec ho to ESP) allow karta hai, NHRP bhi chal jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="NHRP registration aur resolution ladder">
<defs><marker id="nh3h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="40" y="10" width="120" height="32" rx="6" fill="#bbf7d0"/><text x="100" y="31" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 (NHC)</text>
<rect x="260" y="10" width="120" height="32" rx="6" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">HUB (NHS)</text>
<rect x="480" y="10" width="120" height="32" rx="6" fill="#fde68a"/><text x="540" y="31" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 (NHC)</text>
<line x1="100" y1="42" x2="100" y2="250" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="42" x2="320" y2="250" stroke="#64748b" stroke-dasharray="3 3"/><line x1="540" y1="42" x2="540" y2="250" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="100" y1="70" x2="316" y2="70" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3h)"/><text x="208" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 Registration Request</text>
<line x1="320" y1="100" x2="104" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3h)"/><text x="208" y="94" text-anchor="middle" class="svg-muted" font-size="12">2 Registration Reply</text>
<line x1="100" y1="150" x2="316" y2="150" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3h)"/><text x="208" y="144" text-anchor="middle" class="svg-ink" font-size="12">3 Resolution Request .3?</text>
<line x1="320" y1="180" x2="536" y2="180" stroke="#64748b" stroke-width="1.5" marker-end="url(#nh3h)"/><text x="430" y="174" text-anchor="middle" class="svg-ink" font-size="12">4 NHS forward karta hai</text>
<line x1="540" y1="225" x2="104" y2="225" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3" marker-end="url(#nh3h)"/><text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">5 Resolution Reply, seedha: .3 = 100.64.30.2</text>
</svg><p class="cap">Registration hub ki address book current rakhta hai; resolution se spoke doosre spoke ka NBMA address seekhta hai. Reply spoke se spoke jaata hai.</p></div>

<h3>Registration detail mein</h3>
<p>Tunnel up hone par spoke apne NHS ko Registration Request bhejta hai jisme uska tunnel address, NBMA address aur ek <b>holdtime</b> hota hai. Hub ek <b>dynamic</b> entry banata hai aur reply karta hai. Spoke holdtime ke ek tihai par registration refresh karta hai (<code>ip nhrp holdtime 300</code> ke saath, har 100 seconds). Agar hub poore holdtime tak kuch nahi sunta, to entry expire ho jaati hai aur spoke <code>show dmvpn</code> se gayab ho jaata hai.</p>
<p>Default mein registrations <b>unique</b> flag ke saath aati hain: jo tunnel IP pehle se registered hai, uske liye hub naya NBMA address tab tak mana karta hai jab tak purani entry expire na ho. DHCP par ya badalte NAT ke peeche wale spokes ke liye, spoke par <code>ip nhrp registration no-unique</code> hub ko entry turant overwrite karne deta hai.</p>

<h3>Parameters jo match hone chahiye</h3>
<ul>
<li><code>ip nhrp network-id 100</code> interface par NHRP on karta hai. Value <b>locally significant</b> hai: yeh sirf ek router ke andar NHRP domains alag karti hai. Har jagah same rakhna bas good practice hai.</li>
<li><code>ip nhrp authentication NKdmvpn</code> 8 characters tak ki clear-text string hai jo har NHRP packet mein jaati hai. Yeh <b>match honi chahiye</b>; mismatch par receiver packets ignore karta hai. Yeh security nahi, sirf galtiyon se bachaav hai; asli security IPsec deta hai.</li>
<li><code>ip nhrp holdtime 300</code> batata hai ki doosre aapki mapping kitni der rakh sakte hain. Default 7200 seconds hai; Cisco 300 se 600 recommend karta hai taaki stale entries jaldi hatein.</li>
<li><code>tunnel key</code>, agar use ho, match honi chahiye (chapter 2).</li>
</ul>

<h3>NBMA par multicast</h3>
<p>EIGRP (224.0.0.10) aur OSPF (224.0.0.5/6) apne hellos multicast mein bhejte hain. mGRE interface broadcast nahi kar sakta, isliye woh har multicast packet ko apni multicast list ke har NBMA address par unicast ki tarah <b>replicate</b> karta hai. Hub par <code>ip nhrp map multicast dynamic</code> register hone wale har spoke ko jodta hai. Spoke par <code>ip nhrp map multicast 100.64.10.2</code> multicast ko sirf hub ki taraf bhejta hai. Nateeja: har spoke hub ka IGP neighbour hai, aur spokes aapas mein <b>kabhi</b> neighbours nahi hote. Yeh sentence yaad rakho; yahi chapter 9 ka OSPF DR rule samjhata hai.</p>

<pre class="out">HUB# show ip nhrp
172.16.100.2/32 via 172.16.100.2
   Tunnel0 created 00:12:40, expire 00:04:19
<span class="hl">   Type: dynamic, Flags: registered nhop</span>
   NBMA address: 100.64.20.2
172.16.100.3/32 via 172.16.100.3
   Tunnel0 created 00:12:31, expire 00:04:28
   Type: dynamic, Flags: registered nhop
<span class="hl">   NBMA address: 100.64.30.2</span></pre>

<div class="eg"><p><b>Worked example.</b> SPOKE2 ne 10:00:00 par holdtime 300 ke saath register kiya. Woh lagbhag 10:01:40, 10:03:20 waghera par refresh karta hai. 10:02:00 par uska internet link fail hota hai. Us waqt hub ki entry "expire 00:03:20" dikhati hai aur countdown chalta rehta hai; aakhri successful refresh 10:01:40 par tha, isliye entry 10:06:40 par hat jaati hai. Tab tak OSPF dead timer (broadcast par 40 s) kab ka SPOKE2 ke routes hata chuka hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Hub par <code>ip nhrp map multicast dynamic</code> bhool jaana. NHRP registration chalti hai, <code>show dmvpn</code> perfect dikhta hai, lekin OSPF ya EIGRP kabhi neighbour nahi banata, kyunki hub ke hellos spokes tak pahunchte hi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> NHRP network-id routers ke beech match hona zaroori nahi; authentication string aur tunnel key zaroori hain. Aur NHRP koi IP protocol number nahi hai: yeh GRE (type 0x2001) mein chalta hai, isliye protocol 47 (aur ESP ke liye 50, IKE ke liye UDP 500/4500) allow karne wala ACL kaafi hai.</p></div>

<div class="scn"><h4>ISP change ke baad spoke gayab</h4><p>Ek branch ne ISP badla aur uska public address badal gaya. Spoke registrations bhejta raha, lekin hub ne unique-address conflict log kiya aur purana NBMA address do ghante tak rakha (default 7200 s holdtime). Engineer ne saare routers par holdtime 300 kiya aur DHCP spokes par <code>ip nhrp registration no-unique</code> joda. Aage ke address changes seconds mein recover hone lage.</p><p><b>Seekh:</b> dynamic addresses wale spokes ke liye default NHRP timers bahut lambe hain; chhota holdtime aur jahan address badalta hai wahan no-unique use karo.</p></div>

<div class="iv"><p class="q">"DMVPN mein NHRP registration aur resolution explain karo."</p><p>Strong answer: spokes NHCs hain jinhe hub NHS ke roop mein aur hub ke tunnel IP ki uske NBMA address se static mapping ke saath configure kiya jaata hai. Woh apni tunnel-to-NBMA mapping ke saath Registration Requests bhejte hain aur holdtime ke ek tihai par refresh karte hain; hub dynamic entries store karta hai. Doosre spoke tak pahunchne ke liye spoke hub ke through Resolution Request bhejta hai; hub use owner tak forward karta hai, jo apne NBMA address ke saath seedha reply karta hai. Authentication aur IGP hellos ke liye multicast mapping ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NHRP tunnel (protocol) addresses ko NBMA addresses se map karta hai; hub = NHS, spokes = NHC.</li>
<li>Registration hub ka database banata hai; resolution se spokes ek doosre ko dhoondhte hain; reply direct aata hai.</li>
<li>Network-id local hai; authentication (8 chars, clear text) aur tunnel key match honi chahiye.</li>
<li>Holdtime default 7200 s, recommended 300 se 600; refresh har holdtime/3.</li>
<li>IGP hellos spokes tak pahunchane ke liye hub par <code>map multicast dynamic</code> zaroori hai.</li>
</ul></div>
`}};export{e as default};