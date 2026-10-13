var e={id:`urpf`,h:{en:`Unicast RPF: stopping spoofed source addresses`,hi:`Unicast RPF: spoofed source addresses rokna`},body:{en:`
<p>A firewall filter matches fields you name. But what if an attacker fills the <b>source address</b> field with a lie? Unicast reverse-path forwarding (uRPF) is a built-in check that tests whether the source address makes sense, using the routing table instead of a hand-written list.</p>

<h3>Analogy: the return address on a letter</h3>
<p>A postal worker receives a letter from the Delhi branch's mail bag, but the return address says "Mumbai head office". That seems wrong: letters from Mumbai do not come in the Delhi bag. If I wanted to reply to "Mumbai", I would send the reply by the Mumbai route, not back to Delhi. uRPF does exactly that test with IP packets: "If I were to send a reply to this source, would it go out of the interface the packet arrived on?"</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Strict RPF check">
<rect x="20" y="90" width="120" height="60" rx="8" fill="#fecaca"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC2 (forger)</text><text x="80" y="133" text-anchor="middle" class="svg-muted" font-size="11">claims 10.30.30.77</text>
<rect x="260" y="70" width="140" height="100" rx="10" fill="#bbf7d0"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1: rpf-check</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="11">route to 10.30.30.0/24:</text><text x="330" y="156" text-anchor="middle" class="svg-muted" font-size="11">via ge-0/0/0, not ge-0/0/1</text>
<rect x="520" y="90" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">Real FIN</text><text x="570" y="133" text-anchor="middle" class="svg-muted" font-size="11">10.30.30.0/24</text>
<line x1="140" y1="120" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><text x="200" y="110" text-anchor="middle" class="svg-muted" font-size="11">arrives ge-0/0/1</text>
<line x1="400" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="330" y="205" text-anchor="middle" class="svg-ink" font-size="13">Reverse path does not match arrival interface: DROP</text>
</svg><p class="cap">Strict uRPF drops packets whose source is not reachable back through the interface they arrived on.</p></div>

<h3>The two modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Check</th><th>Use</th></tr>
<tr><td><b>Strict</b> (default)</td><td>The active route to the source must point out of <b>the same interface</b> the packet arrived on</td><td>Single-homed edges: user LANs, customer links</td></tr>
<tr><td><b>Loose</b> (<code>mode loose</code>)</td><td><b>Any</b> route to the source exists (not a discard/reject route)</td><td>Core or multihomed links where paths can be asymmetric</td></tr></table>
<pre class="code"><span class="c">! strict on a user LAN</span>
set interfaces ge-0/0/1 unit 0 family inet rpf-check
<span class="c">! with a fail-filter to count what fails</span>
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL
<span class="c">! loose on an uplink</span>
set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose</pre>

<h3>The fail-filter</h3>
<p>A packet that fails the RPF check is dropped. A <b>fail-filter</b> is a normal firewall filter that runs on the packets that failed, so you can count, log or even permit some of them (for example DHCP discovers from 0.0.0.0).</p>
<pre class="code">set firewall family inet filter RPF-FAIL term SPOOF then count spoofed
set firewall family inet filter RPF-FAIL term SPOOF then discard
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL</pre>
<p>If a fail-filter accepts a packet, it is forwarded despite failing RPF. A fail-filter that ends in discard with a count gives you evidence of spoofing attempts, similar to the counter in the previous lab.</p>

<h3>Why strict mode breaks asymmetric routing</h3>
<p>Asymmetric routing means traffic goes out on one path and comes back on another. It is normal when two uplinks have different costs on each side. With strict uRPF on an uplink, a legitimate reply arrives on uplink B while the router's best route back to that source points out of uplink A. The check fails and the reply is dropped. The sender sees a working one-way path and a dead return: a "mysterious" failure.</p>
<div class="eg"><p><b>Worked example.</b> R1 has two uplinks to R2: ge-0/0/0 (R1 cost 1, R2 cost 50) and ge-0/0/2 (R1 cost 50, R2 cost 1). PC1 sends traffic to the server 172.16.30.10. R1's best route to 172.16.30.0/24 is out ge-0/0/0 (cost 1). R2's best route back to R1's LAN is out ge-0/0/2 (cost 1 on R2). So the reply arrives on ge-0/0/2. R1's route to 172.16.30.10 points out ge-0/0/0, not ge-0/0/2, so strict uRPF on ge-0/0/2 drops the reply. PC1's ping fails even though every link is up.</p></div>

<h3>Seeing it in the output</h3>
<pre class="out">lab@R1-BRANCH&gt; show route 172.16.30.10
172.16.30.0/24     *[OSPF/10] 00:12:44, metric 2
                    &gt; to 10.0.12.2 via ge-0/0/0.0

lab@R1-BRANCH&gt; show interfaces ge-0/0/2.0 extensive
  Logical interface ge-0/0/2.0 ...
    Input packets : 17
    <span class="hl">RPF Failures: 9</span>
    Protocol inet, MTU: 1500
      Flags: uRPF</pre>
<p>The route points out ge-0/0/0; the replies arrive on ge-0/0/2 and the failure counter on that interface rises. That answers the lab question "on which interface are replies counted as RPF failures": ge-0/0/2.</p>

<h3>The two fixes, in the right place</h3>
<ol>
<li><b>Uplinks:</b> use <code>mode loose</code> (or remove rpf-check). Asymmetric paths are legitimate there.</li>
<li><b>User LAN:</b> use strict with a fail-filter. A user subnet is single-homed; any packet whose source does not belong behind that interface is spoofed.</li>
</ol>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose
set interfaces ge-0/0/2 unit 0 family inet rpf-check mode loose
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL</pre>
<p>Note that ge-0/0/1 uses no <code>mode loose</code>: it stays strict, which is what catches PC2 forging 10.30.30.77. R1's route to 10.30.30.0/24 points toward the uplink, not ge-0/0/1, so those packets fail and are counted as <code>spoofed</code>.</p>

<h3>Limits you should know</h3>
<ul>
<li>A default route in the table makes loose mode accept almost any source, because a route "exists" for everything. Loose mode is weaker for that reason.</li>
<li>uRPF protects against spoofed <b>sources</b>, not against floods from real addresses.</li>
<li>It is a defensive control. It stops forged traffic leaving or crossing your network; it is not an attack tool.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Turning on strict uRPF on every interface "for security". On links with asymmetric routing, ECMP or multihoming, it silently kills legitimate traffic. Place strict uRPF only where there is one valid path back.</p></div>
<div class="exam"><p><b>Exam trap.</b> Strict: route back must use the same interface. Loose: any route to the source is enough. Loose mode is the right choice for asymmetric or multihomed designs. A fail-filter processes the packets that failed the check.</p></div>

<div class="scn"><h4>Everything is up, nothing works</h4><p>A contractor "hardened" a branch router by enabling strict uRPF on both WAN uplinks. Users reported that the payroll server was unreachable. Interfaces were up, OSPF was Full, pings to the next hop worked. The engineer noticed that return traffic favoured the second uplink because of different link costs at the hub. <code>show interfaces ge-0/0/2.0 extensive</code> showed a growing RPF failure count. Setting both uplinks to loose mode restored service, and strict uRPF with a counting fail-filter was moved to the user LAN, where it also caught a laptop forging a finance subnet address.</p><p><b>Lesson:</b> security controls need to match the traffic pattern, or they become outages.</p></div>

<div class="iv"><p class="q">"What is uRPF, and when does strict mode cause problems?"</p><p>Strong answer: it checks the source address of arriving packets against the routing table. Strict requires the route back to the source to use the arrival interface; loose only requires some route to exist. Strict breaks asymmetric routing, multihoming and some ECMP, because legitimate packets fail the check. I use strict on single-homed user or customer interfaces, loose on core or multihomed uplinks, and add a fail-filter to count drops.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>uRPF tests the source address of arriving packets against the routing table.</li>
<li>Strict needs the same interface; loose needs any route; strict is the default.</li>
<li>Strict breaks asymmetric paths; use it on single-homed LAN edges only.</li>
<li>A fail-filter lets you count, log or permit packets that fail the check.</li>
<li>Syntax: set interfaces IFACE unit 0 family inet rpf-check [mode loose] [fail-filter NAME].</li>
</ul></div>
`,hi:`
<p>Firewall filter wahi fields match karta hai jinka aap naam lo. Lekin agar attacker <b>source address</b> field mein jhooth bhar de to? Unicast reverse-path forwarding (uRPF) ek built-in check hai jo hath se likhi list ki jagah routing table se test karta hai ki source address ka sense banta hai ya nahi.</p>

<h3>Analogy: letter par return address</h3>
<p>Postal worker ko Delhi branch ke mail bag se ek letter milta hai, lekin return address kehta hai "Mumbai head office". Yeh galat lagta hai: Mumbai ke letters Delhi ke bag mein nahi aate. Agar main "Mumbai" ko reply bhejun to Mumbai ke raaste se bhejunga, wapas Delhi ko nahi. uRPF IP packets par wahi test karta hai: "Agar main is source ko reply bhejun to kya woh usi interface se jaayega jis par packet aaya?"</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Strict RPF check">
<rect x="20" y="90" width="120" height="60" rx="8" fill="#fecaca"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC2 (forger)</text><text x="80" y="133" text-anchor="middle" class="svg-muted" font-size="11">claims 10.30.30.77</text>
<rect x="260" y="70" width="140" height="100" rx="10" fill="#bbf7d0"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1: rpf-check</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="11">10.30.30.0/24 ka route:</text><text x="330" y="156" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0 se, ge-0/0/1 se nahi</text>
<rect x="520" y="90" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">Asli FIN</text><text x="570" y="133" text-anchor="middle" class="svg-muted" font-size="11">10.30.30.0/24</text>
<line x1="140" y1="120" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><text x="200" y="110" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1 par aaya</text>
<line x1="400" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="330" y="205" text-anchor="middle" class="svg-ink" font-size="13">Reverse path arrival interface se nahi milta: DROP</text>
</svg><p class="cap">Strict uRPF un packets ko drop karta hai jinka source us interface se wapas reachable nahi jis par woh aaye.</p></div>

<h3>Do modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Check</th><th>Use</th></tr>
<tr><td><b>Strict</b> (default)</td><td>Source ka active route <b>usi interface</b> se bahar jaana chahiye jis par packet aaya</td><td>Single-homed edges: user LANs, customer links</td></tr>
<tr><td><b>Loose</b> (<code>mode loose</code>)</td><td>Source ka <b>koi bhi</b> route maujood ho (discard/reject route nahi)</td><td>Core ya multihomed links jahan paths asymmetric ho sakte hain</td></tr></table>
<pre class="code"><span class="c">! user LAN par strict</span>
set interfaces ge-0/0/1 unit 0 family inet rpf-check
<span class="c">! fail-filter ke saath, jo fail hua use count karne ke liye</span>
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL
<span class="c">! uplink par loose</span>
set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose</pre>

<h3>Fail-filter</h3>
<p>Jo packet RPF check fail kare woh drop hota hai. <b>Fail-filter</b> normal firewall filter hai jo fail hue packets par chalta hai, taaki aap count, log kar sako ya kuch ko permit bhi (jaise 0.0.0.0 se DHCP discovers).</p>
<pre class="code">set firewall family inet filter RPF-FAIL term SPOOF then count spoofed
set firewall family inet filter RPF-FAIL term SPOOF then discard
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL</pre>
<p>Agar fail-filter packet ko accept kare to woh RPF fail hone ke bawajood forward hota hai. Count ke saath discard par khatam hone wala fail-filter spoofing attempts ka saboot deta hai, pichli lab ke counter ki tarah.</p>

<h3>Strict mode asymmetric routing kyun todta hai</h3>
<p>Asymmetric routing ka matlab traffic ek path se jaata hai aur doosre se wapas aata hai. Jab do uplinks ki cost dono taraf alag ho to yeh normal hai. Uplink par strict uRPF ho to sahi reply uplink B par aata hai jabki router ka us source ki taraf best route uplink A se jaata hai. Check fail hota hai aur reply drop hota hai. Sender ko ek-taraf ka path chalta aur return mara hua dikhta hai: "mysterious" failure.</p>
<div class="eg"><p><b>Worked example.</b> R1 ke R2 tak do uplinks hain: ge-0/0/0 (R1 cost 1, R2 cost 50) aur ge-0/0/2 (R1 cost 50, R2 cost 1). PC1 server 172.16.30.10 ko traffic bhejta hai. R1 ka 172.16.30.0/24 ka best route ge-0/0/0 se hai (cost 1). R2 ka R1 ke LAN ki taraf best route ge-0/0/2 se hai (R2 par cost 1). Isliye reply ge-0/0/2 par aata hai. R1 ka 172.16.30.10 ka route ge-0/0/0 se jaata hai, ge-0/0/2 se nahi, isliye ge-0/0/2 par strict uRPF reply drop karta hai. PC1 ka ping fail hota hai chahe har link up ho.</p></div>

<h3>Output mein dekhna</h3>
<pre class="out">lab@R1-BRANCH&gt; show route 172.16.30.10
172.16.30.0/24     *[OSPF/10] 00:12:44, metric 2
                    &gt; to 10.0.12.2 via ge-0/0/0.0

lab@R1-BRANCH&gt; show interfaces ge-0/0/2.0 extensive
  Logical interface ge-0/0/2.0 ...
    Input packets : 17
    <span class="hl">RPF Failures: 9</span>
    Protocol inet, MTU: 1500
      Flags: uRPF</pre>
<p>Route ge-0/0/0 se jaata hai; replies ge-0/0/2 par aate hain aur us interface ka failure counter badhta hai. Isse lab ke sawal "kis interface par replies RPF failures ke roop mein count hote hain" ka jawab milta hai: ge-0/0/2.</p>

<h3>Do fixes, sahi jagah par</h3>
<ol>
<li><b>Uplinks:</b> <code>mode loose</code> use karo (ya rpf-check hata do). Wahan asymmetric paths legitimate hain.</li>
<li><b>User LAN:</b> fail-filter ke saath strict. User subnet single-homed hai; jis packet ka source us interface ke peeche ka nahi hai woh spoofed hai.</li>
</ol>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet rpf-check mode loose
set interfaces ge-0/0/2 unit 0 family inet rpf-check mode loose
set interfaces ge-0/0/1 unit 0 family inet rpf-check fail-filter RPF-FAIL</pre>
<p>Dhyan do ki ge-0/0/1 par <code>mode loose</code> nahi hai: woh strict rehta hai, jo PC2 ko 10.30.30.77 forge karte hue pakadta hai. R1 ka 10.30.30.0/24 ka route uplink ki taraf jaata hai, ge-0/0/1 ki taraf nahi, isliye woh packets fail hote hain aur <code>spoofed</code> ke roop mein count hote hain.</p>

<h3>Limits jo aapko jaanni chahiye</h3>
<ul>
<li>Table mein default route ho to loose mode lagbhag har source accept kar leta hai, kyunki sabke liye "route maujood" hota hai. Isi wajah se loose mode kamzor hai.</li>
<li>uRPF spoofed <b>sources</b> se bachata hai, asli addresses ke floods se nahi.</li>
<li>Yeh defensive control hai. Yeh forged traffic ko aapke network se nikalne ya guzarne se rokta hai; yeh attack tool nahi hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> "Security ke liye" har interface par strict uRPF on kar dena. Asymmetric routing, ECMP ya multihoming wale links par yeh sahi traffic ko chupchap maar deta hai. Strict uRPF sirf wahan lagao jahan wapas ka sirf ek valid path ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Strict: wapas ka route usi interface se. Loose: source ka koi bhi route kaafi. Asymmetric ya multihomed designs ke liye loose mode sahi choice hai. Fail-filter un packets ko process karta hai jo check fail kar chuke hain.</p></div>

<div class="scn"><h4>Sab up hai, kuch nahi chalta</h4><p>Ek contractor ne branch router ko "harden" karne ke liye dono WAN uplinks par strict uRPF on kiya. Users ne bataya ki payroll server unreachable hai. Interfaces up the, OSPF Full tha, next hop tak ping chalte the. Engineer ne dekha ki hub par alag link costs ki wajah se return traffic doosre uplink ko prefer karta tha. <code>show interfaces ge-0/0/2.0 extensive</code> mein badhta RPF failure count dikha. Dono uplinks ko loose mode par karne se service wapas aayi, aur counting fail-filter ke saath strict uRPF user LAN par le jaaya gaya, jahan usne finance subnet ka address forge karte hue ek laptop bhi pakda.</p><p><b>Lesson:</b> security controls ko traffic pattern se match hona chahiye, warna woh outage ban jaate hain.</p></div>

<div class="iv"><p class="q">"uRPF kya hai, aur strict mode kab problem karta hai?"</p><p>Strong answer: yeh aane wale packets ke source address ko routing table se check karta hai. Strict mein source tak wapas ka route arrival interface se hona chahiye; loose mein bas koi route maujood hona chahiye. Strict asymmetric routing, multihoming aur kuch ECMP ko todta hai, kyunki sahi packets check fail kar dete hain. Main strict single-homed user ya customer interfaces par, loose core ya multihomed uplinks par use karta hoon, aur drops count karne ke liye fail-filter jodta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>uRPF aane wale packets ke source address ko routing table se test karta hai.</li>
<li>Strict ko same interface chahiye; loose ko koi bhi route; strict default hai.</li>
<li>Strict asymmetric paths todta hai; sirf single-homed LAN edges par use karo.</li>
<li>Fail-filter se check fail hue packets ko count, log ya permit kar sakte ho.</li>
<li>Syntax: set interfaces IFACE unit 0 family inet rpf-check [mode loose] [fail-filter NAME].</li>
</ul></div>
`}};export{e as default};