var e={id:`switch-trust`,h:{en:`Switch uplink trust: where markings are silently lost`,hi:`Switch uplink trust: jahan markings chupke se kho jaati hain`},body:{en:`
<p>A post office accepts parcels with "express" stickers. A new clerk is told: "Do not believe any sticker from the street. Peel them all off and treat every parcel as normal, unless it comes from a partner company." That clerk is a switch port with <b>QoS enabled and the port untrusted</b>. The sticker is the DSCP value. A perfectly marked voice call arrives at the next hop as ordinary data, and no later device can know it was urgent.</p>

<h3>The rule of the lab switch</h3>
<p>SW1 is an IOS-style switch. In the lab it follows the classic <b>mls qos</b> behaviour:</p>
<ul>
<li>With <code>mls qos</code> <b>off</b>, the switch does not touch DSCP. Every port passes it.</li>
<li>With <code>mls qos</code> <b>on</b>, a port that is <b>not trusted</b> resets DSCP to 0 on ingress.</li>
<li><code>mls qos trust dscp</code> on a port keeps the DSCP. <code>mls qos trust cos</code> keeps CoS only: an untagged frame has CoS 0, so DSCP is lost anyway.</li>
</ul>
<p>So turning on <code>mls qos</code> without trusting the right ports is worse than not touching QoS at all.</p>

<div class="note"><p><b>Honest label.</b> Newer Catalyst 9000 switches use MQC-based QoS and trust DSCP by default on many ports, so this exact fault is less common there. The module teaches the classic <code>mls qos</code> model because it makes the concept (trust at every hop) visible, and the lab follows it. The principle is universal: every switch hop needs a deliberate trust or marking decision.</p></div>

<h3>Which ports matter</h3>
<p>In the campus there are three ports on SW1 that carry the marking you care about:</p>
<table class="cmp"><tr><th>Port</th><th>Connects to</th><th>What it carries</th></tr>
<tr><td>Gi0/1</td><td>WLC1 (controller)</td><td>CAPWAP to APs downstream, decapsulated client packets upstream</td></tr>
<tr><td>Gi0/2</td><td>AP1</td><td>CAPWAP outer header: the outer DSCP</td></tr>
<tr><td>Gi0/3</td><td>AP2</td><td>CAPWAP outer header</td></tr>
<tr><td>router port</td><td>R1</td><td>server traffic into the campus (already trusted in the labs)</td></tr></table>
<p>The AP ports carry the CAPWAP outer DSCP, because the switch cannot see inside the tunnel. A trusted AP port therefore keeps the <b>outer</b> marking that the AP copied from the client.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Trust on SW1 ports">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#fde68a"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">mls qos on</text>
<rect x="20" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">AP1 (Gi0/2)</text>
<rect x="20" y="166" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="193" text-anchor="middle" class="svg-ink" font-size="13">AP2 (Gi0/3)</text>
<rect x="510" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (Gi0/1)</text>
<rect x="510" y="166" width="110" height="44" rx="8" fill="#fed7aa"/><text x="565" y="193" text-anchor="middle" class="svg-ink" font-size="13">R1 router port</text>
<line x1="130" y1="42" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="188" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="510" y1="42" x2="390" y2="100" stroke="#64748b" stroke-width="2"/><line x1="510" y1="188" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">each of the four ports must trust dscp</text>
</svg><p class="cap">One untrusted port among the four is enough to reset the marking in one direction.</p></div>

<h3>Configure</h3>
<pre class="code"><span class="c">! on SW1 (no web UI: use the SW1 console)</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp
 exit
interface GigabitEthernet0/2
 mls qos trust dscp
 exit
interface GigabitEthernet0/3
 mls qos trust dscp
 exit</pre>
<p>The macro form <code>auto qos trust dscp</code> on an interface sets the same trust. Remove trust with <code>no mls qos trust</code>. Disable the feature globally with <code>no mls qos</code>. SW1 is a separate switch, so there is no 9800 web UI for it. On WLC1 the related view is <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b>, which only shows what the controller itself attaches.</p>

<h3>Verify</h3>
<pre class="out">SW1# show mls qos
QoS is enabled
QoS ip packet dscp rewrite is enabled (an untrusted port resets DSCP to 0 while mls qos is on)

SW1# show mls qos interface GigabitEthernet0/1
GigabitEthernet0/1
<span class="hl">trust state: not trusted</span>
trust mode: not trusted
trust enabled flag: dis
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based</pre>
<p>After the fix the first lines read <code>trust state: trust dscp</code> and <code>trust enabled flag: ena</code>. The running config shows <code>mls qos</code> at the top and <code>mls qos trust dscp</code> under each port.</p>

<h3>Upstream and downstream see different ports</h3>
<p>Upstream, a client packet crosses the AP port (outer header) and then the controller port (after the controller has decapsulated it). Downstream, a server packet enters through the router port, then the controller port carries the CAPWAP packet toward the AP. An untrusted <b>controller</b> port therefore damages <b>both</b> directions: the lab trace reports "rewritten at SW1 GigabitEthernet0/1" for upstream and downstream.</p>

<div class="eg"><p><b>Worked example.</b> The voice WLAN is perfect, but SW1 Gi0/1 is untrusted with <code>mls qos</code> on. Upstream: the phone marks 46, the AP keeps it, Gi0/2 is trusted, the controller keeps it, and Gi0/1 resets it to 0. The server receives DSCP 0. Downstream: the server sends 46, the router port is trusted, the controller keeps 46, and Gi0/1 resets the CAPWAP outer DSCP to 0, so the AP maps UP 0 and uses AC_BE. Voice is best effort on air in both directions even though no wireless setting is wrong.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Enabling <code>mls qos</code> and trusting only some ports.</li>
<li>Trusting <b>cos</b> on a port that carries untagged frames.</li>
<li>Forgetting the new port when an AP is moved or a second controller link is added.</li>
<li>Looking for a switch setting in the controller web UI.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> QoS faults between the AP and the controller are almost always a <b>switch</b> trust or marking issue. Also trust is configured <b>per port on ingress</b>: it affects the traffic that enters that port.</p></div>

<div class="scn"><h4>Everything arrives as DSCP 0</h4><p>The network team captures at the data center and sees every voice packet as DSCP 0. The WLC policy is correct. The engineer runs the QoS trace from a phone: the verdict names "SW1 GigabitEthernet0/1" as the rewrite point. <code>show mls qos interface GigabitEthernet0/1</code> says not trusted. One <code>mls qos trust dscp</code> on that port restores both directions.</p><p><b>Lesson:</b> trust the trace, then read exactly that port.</p></div>

<div class="iv"><p class="q">"Voice is marked correctly on the phone but arrives as best effort. Where do you look?"</p><p>Walk the path: AP trust, AP-port trust on the switch, controller policy, controller-port trust, router-port trust. Use a trace to find the rewrite point. Say that an untrusted port with QoS enabled resets DSCP to 0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>With mls qos on, an untrusted port resets DSCP to 0.</li>
<li>Trust dscp on the controller port and on every AP port (Gi0/1, Gi0/2, Gi0/3 in the lab).</li>
<li>The switch sees the CAPWAP outer DSCP on AP and controller ports.</li>
<li>show mls qos interface shows the trust state; the trace names the bad port.</li>
<li>SW1 has no web UI: use its console.</li>
</ul></div>
`,hi:`
<p>Ek post office "express" sticker wale parcels leta hai. Naye clerk ko bataya jaata hai: "Sadak se aaye kisi sticker par bharosa mat karo. Sab utaar do aur har parcel ko normal samjho, jab tak woh partner company se na aaye." Woh clerk ek switch port hai jis par <b>QoS enabled hai aur port untrusted hai</b>. Sticker DSCP value hai. Perfectly marked voice call agle hop par normal data ban kar pahunchti hai, aur aage koi device nahi jaan sakta ki woh urgent thi.</p>

<h3>Lab switch ka rule</h3>
<p>SW1 ek IOS-style switch hai. Lab mein woh classic <b>mls qos</b> behaviour follow karta hai:</p>
<ul>
<li><code>mls qos</code> <b>off</b> ho to switch DSCP ko nahi chhoota. Har port use pass karta hai.</li>
<li><code>mls qos</code> <b>on</b> ho to jo port <b>trusted nahi</b> hai woh ingress par DSCP ko 0 kar deta hai.</li>
<li>Port par <code>mls qos trust dscp</code> DSCP ko rakhta hai. <code>mls qos trust cos</code> sirf CoS rakhta hai: untagged frame ka CoS 0 hota hai, isliye DSCP phir bhi kho jaata hai.</li>
</ul>
<p>Isliye sahi ports ko trust kiye bina <code>mls qos</code> on karna QoS ko na chhoone se bhi bura hai.</p>

<div class="note"><p><b>Imaandaar label.</b> Naye Catalyst 9000 switches MQC-based QoS use karte hain aur kai ports par DSCP default mein trust karte hain, isliye wahan yeh exact fault kam hota hai. Module classic <code>mls qos</code> model sikhata hai kyunki isse concept (har hop par trust) saaf dikhta hai, aur lab usi ko follow karta hai. Principle universal hai: har switch hop ko soch samajh kar trust ya marking ka decision chahiye.</p></div>

<h3>Kaun se ports matter karte hain</h3>
<p>Campus mein SW1 par teen ports hain jo us marking ko carry karte hain jiski aapko fikr hai:</p>
<table class="cmp"><tr><th>Port</th><th>Kis se judta hai</th><th>Kya carry karta hai</th></tr>
<tr><td>Gi0/1</td><td>WLC1 (controller)</td><td>downstream APs ko CAPWAP, upstream decapsulated client packets</td></tr>
<tr><td>Gi0/2</td><td>AP1</td><td>CAPWAP outer header: outer DSCP</td></tr>
<tr><td>Gi0/3</td><td>AP2</td><td>CAPWAP outer header</td></tr>
<tr><td>router port</td><td>R1</td><td>campus mein aane wala server traffic (labs mein pehle se trusted)</td></tr></table>
<p>AP ports CAPWAP outer DSCP carry karte hain, kyunki switch tunnel ke andar nahi dekh sakta. Trusted AP port isliye woh <b>outer</b> marking rakhta hai jo AP ne client se copy ki.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SW1 ports par trust">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#fde68a"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">mls qos on</text>
<rect x="20" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">AP1 (Gi0/2)</text>
<rect x="20" y="166" width="110" height="44" rx="8" fill="#bae6fd"/><text x="75" y="193" text-anchor="middle" class="svg-ink" font-size="13">AP2 (Gi0/3)</text>
<rect x="510" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (Gi0/1)</text>
<rect x="510" y="166" width="110" height="44" rx="8" fill="#fed7aa"/><text x="565" y="193" text-anchor="middle" class="svg-ink" font-size="13">R1 router port</text>
<line x1="130" y1="42" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="188" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="510" y1="42" x2="390" y2="100" stroke="#64748b" stroke-width="2"/><line x1="510" y1="188" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">chaaron ports ko trust dscp chahiye</text>
</svg><p class="cap">Chaar mein se ek untrusted port ek direction mein marking reset karne ke liye kaafi hai.</p></div>

<h3>Configure</h3>
<pre class="code"><span class="c">! SW1 par (web UI nahi: SW1 console use karo)</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp
 exit
interface GigabitEthernet0/2
 mls qos trust dscp
 exit
interface GigabitEthernet0/3
 mls qos trust dscp
 exit</pre>
<p>Interface par macro form <code>auto qos trust dscp</code> wahi trust set karta hai. Trust hatane ke liye <code>no mls qos trust</code>. Feature ko globally band karne ke liye <code>no mls qos</code>. SW1 alag switch hai, isliye uska 9800 web UI nahi hai. WLC1 par related view <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b> hai, jo sirf wahi dikhata hai jo controller khud attach karta hai.</p>

<h3>Verify</h3>
<pre class="out">SW1# show mls qos
QoS is enabled
QoS ip packet dscp rewrite is enabled (an untrusted port resets DSCP to 0 while mls qos is on)

SW1# show mls qos interface GigabitEthernet0/1
GigabitEthernet0/1
<span class="hl">trust state: not trusted</span>
trust mode: not trusted
trust enabled flag: dis
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based</pre>
<p>Fix ke baad pehli lines <code>trust state: trust dscp</code> aur <code>trust enabled flag: ena</code> padhti hain. Running config mein upar <code>mls qos</code> aur har port ke neeche <code>mls qos trust dscp</code> dikhta hai.</p>

<h3>Upstream aur downstream alag ports dekhte hain</h3>
<p>Upstream mein client packet AP port (outer header) se guzarta hai aur phir controller port se (controller ke decapsulate karne ke baad). Downstream mein server packet router port se andar aata hai, phir controller port CAPWAP packet ko AP ki taraf le jaata hai. Untrusted <b>controller</b> port isliye <b>dono</b> directions kharab karta hai: lab trace upstream aur downstream dono ke liye "rewritten at SW1 GigabitEthernet0/1" batata hai.</p>

<div class="eg"><p><b>Worked example.</b> Voice WLAN perfect hai, lekin SW1 Gi0/1 untrusted hai aur <code>mls qos</code> on hai. Upstream: phone 46 mark karta hai, AP rakhta hai, Gi0/2 trusted hai, controller rakhta hai, aur Gi0/1 use 0 kar deta hai. Server ko DSCP 0 milta hai. Downstream: server 46 bhejta hai, router port trusted hai, controller 46 rakhta hai, aur Gi0/1 CAPWAP outer DSCP ko 0 kar deta hai, isliye AP UP 0 map karta hai aur AC_BE use karta hai. Koi wireless setting galat nahi, phir bhi air par voice dono directions mein best effort hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li><code>mls qos</code> on karna aur sirf kuch ports trust karna.</li>
<li>Untagged frames wale port par <b>cos</b> trust karna.</li>
<li>AP move hone ya doosra controller link judne par naya port bhool jaana.</li>
<li>Switch setting ko controller web UI mein dhundna.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> AP aur controller ke beech QoS faults lagbhag hamesha <b>switch</b> trust ya marking issue hote hain. Aur trust <b>per port ingress</b> par configure hota hai: yeh us port mein aane wale traffic ko affect karta hai.</p></div>

<div class="scn"><h4>Sab kuch DSCP 0 ban kar aata hai</h4><p>Network team data center mein capture karti hai aur har voice packet DSCP 0 dekhti hai. WLC policy sahi hai. Engineer phone se QoS trace chalata hai: verdict rewrite point ke taur par "SW1 GigabitEthernet0/1" batata hai. <code>show mls qos interface GigabitEthernet0/1</code> kehta hai not trusted. Us port par ek <code>mls qos trust dscp</code> dono directions theek kar deta hai.</p><p><b>Lesson:</b> trace par bharosa karo, phir bilkul wahi port padho.</p></div>

<div class="iv"><p class="q">"Phone par voice sahi mark hai lekin best effort ban kar pahunchti hai. Kahan dekhoge?"</p><p>Path chalo: AP trust, switch ka AP-port trust, controller policy, controller-port trust, router-port trust. Rewrite point dhundne ke liye trace use karo. Batao ki QoS enabled hone par untrusted port DSCP ko 0 kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>mls qos on ho to untrusted port DSCP ko 0 kar deta hai.</li>
<li>Controller port aur har AP port par trust dscp (lab mein Gi0/1, Gi0/2, Gi0/3).</li>
<li>Switch AP aur controller ports par CAPWAP outer DSCP dekhta hai.</li>
<li>show mls qos interface trust state dikhata hai; trace kharab port ka naam batata hai.</li>
<li>SW1 ka web UI nahi hai: uska console use karo.</li>
</ul></div>
`}};export{e as default};