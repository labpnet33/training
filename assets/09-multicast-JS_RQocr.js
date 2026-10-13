var e={id:`multicast`,h:{en:`Multicast on Wi-Fi: unicast mode, multicast mode, IGMP snooping`,hi:`Wi-Fi par multicast: unicast mode, multicast mode, IGMP snooping`},body:{en:`
<p>A teacher can give a lecture in a hall by speaking once, and everyone who came to listen hears it. That is <b>multicast</b>: one sender, many receivers, one copy of the stream per link. Compare unicast: the teacher visits every student and repeats the lecture 200 times. Multicast saves the teacher's voice, but only if the hall (the network) is built so that one voice can reach everybody, and only if people who did not come are not forced to listen.</p>

<h3>Why Wi-Fi makes multicast hard</h3>
<ul>
<li>A multicast frame has no single receiver, so it is <b>not acknowledged</b> and <b>not retried</b>.</li>
<li>It must be understood by every client, so the AP sends it at a low <b>basic data rate</b>, which uses much airtime.</li>
<li>Clients that sleep need a schedule (the DTIM period) to wake and receive it.</li>
<li>The controller tunnels everything to the AP in CAPWAP, so the controller must decide <b>how</b> to deliver one multicast packet to many APs.</li>
</ul>

<h3>The controller switch: wireless multicast</h3>
<p>By default the controller drops multicast coming from the wired side. You turn the feature on globally:</p>
<pre class="code">wireless multicast
<span class="c">! optional: also forward broadcast to the wireless side</span>
wireless broadcast</pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Multicast &gt; Enable wireless multicast</b>. This one line is the first thing to check when "multicast does not work at all".</p>

<h3>Two delivery modes</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two multicast modes">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">multicast-unicast (default)</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="190" y="30" width="70" height="30" rx="8" fill="#bae6fd"/><text x="225" y="50" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="190" y="70" width="70" height="30" rx="8" fill="#bae6fd"/><text x="225" y="90" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<line x1="100" y1="52" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="100" y1="68" x2="190" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">one unicast copy per AP</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">multicast-multicast</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="450" y="35" width="60" height="50" rx="8" fill="#fde68a"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="12">net</text><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="11">PIM</text>
<rect x="550" y="30" width="70" height="30" rx="8" fill="#bae6fd"/><text x="585" y="50" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="550" y="70" width="70" height="30" rx="8" fill="#bae6fd"/><text x="585" y="90" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<line x1="420" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="50" x2="550" y2="45" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="480" y="125" text-anchor="middle" class="svg-muted" font-size="12">one copy to the CAPWAP group</text>
<rect x="40" y="150" width="560" height="80" rx="10" fill="#e2e8f0"/>
<text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Unicast mode: works on any wired network, uses controller CPU and uplink.</text>
<text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Multicast mode: efficient, but the network between WLC and APs must route multicast.</text>
</svg><p class="cap">The controller either replicates one unicast copy per AP, or sends one copy to a multicast group for the APs to join.</p></div>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>How it works</th><th>Needs</th></tr>
<tr><td>multicast-unicast (default)</td><td>none (or <code>no ap capwap multicast</code>)</td><td>controller sends a unicast CAPWAP copy to each AP that serves a receiver</td><td>nothing special in the wired network</td></tr>
<tr><td>multicast-multicast</td><td><code>ap capwap multicast 239.1.1.1</code></td><td>controller sends one copy to the CAPWAP group; each AP joins that group with IGMP</td><td>multicast routing and PIM between the controller VLAN and the AP VLAN</td></tr></table>
<p>The CAPWAP group must be a multicast address from 224.0.1.0 to 239.255.255.255; the lab refuses 224.0.0.x and non-multicast addresses. Choose an administratively scoped address such as 239.1.1.1 that is not used by any application. Web UI: <b>Configuration &gt; Wireless &gt; Multicast</b>, <b>AP CAPWAP multicast mode</b>: Unicast or Multicast (with the group).</p>
<p>In the lab the underlay is read from R1's running config: the model looks for <code>ip multicast-routing</code> and <code>ip pim</code> on the router interfaces toward VLAN 99 (controller) and VLAN 10 (AP). Without them multicast-multicast fails. Multicast routing from the <b>source</b> to the controller (PIM and RPs in the wider network) is <b>concept only</b>: the lab assumes the stream arrives at the controller.</p>

<h3>IGMP snooping: who really wants it</h3>
<p>A client joins a group by sending an <b>IGMP report</b>. With <b>IGMP snooping</b> on, the controller learns which clients joined and forwards the stream only toward them. With snooping off for a VLAN, the stream is <b>flooded</b> to every client of the VLAN: it works but wastes airtime. Snooping is on by default. In the lab:</p>
<pre class="code">ip igmp snooping
no ip igmp snooping vlan 10    <span class="c">! disable for one VLAN</span>
ip igmp snooping vlan 10       <span class="c">! enable it again</span></pre>
<p>A client with no IGMP report gets nothing when snooping is on for its VLAN, which is the desired result.</p>
<pre class="out">WLC1# show wireless multicast
Multicast                               : Enabled
Wireless Broadcast                      : Disabled
AP CAPWAP multicast mode                : Unicast
AP CAPWAP IPv4 multicast group address  : 0.0.0.0
IGMP snooping (global)                  : Enabled

WLC1# show ip igmp snooping groups
Vlan  Group             Type    Client
20    239.10.10.10      igmp    LAPTOP1 (0050.7966.6801)</pre>
<div class="note"><p>The column layout of <code>show ip igmp snooping groups</code> is approximate; real output differs by platform.</p></div>

<h3>Testing from the client</h3>
<pre class="out">LAPTOP1&gt; wifi mcast join 239.10.10.10
IGMP report sent for 239.10.10.10.
LAPTOP1&gt; wifi mcast test 239.10.10.10
Multicast test for 239.10.10.10 on LAPTOP1
  1. Client LAPTOP1 on WLAN 1 (NK-STAFF), VLAN 20, group 239.10.10.10 joined (IGMP report sent)
  2. Controller WLC1: wireless multicast is enabled
  3. IGMP snooping is on for VLAN 20: the stream is forwarded only toward receivers that joined.
  4. Mode multicast-unicast (default): ...
<span class="hl">Result: the stream reaches the client (unicast mode)</span></pre>

<div class="eg"><p><b>Worked example.</b> A training session streams to 239.10.10.10 for 40 laptops on 6 APs. In multicast-unicast, the controller sends 6 unicast CAPWAP copies (one per AP serving a receiver) and each AP then radiates one multicast frame at the basic rate. In multicast-multicast it sends 1 copy to the CAPWAP group. The difference is the controller uplink load, not the radio load: on air, every AP still transmits the frame once.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Setting a CAPWAP multicast group without a multicast-capable underlay.</li>
<li>Forgetting <code>wireless multicast</code>.</li>
<li>Choosing a CAPWAP group that clashes with an application group.</li>
<li>Turning snooping off "to make it work" and flooding the VLAN.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> multicast-unicast is the <b>default</b> and needs no underlay support; multicast-multicast needs PIM or an equivalent. Both need wireless multicast enabled. The CAPWAP group is for <b>controller to AP</b> delivery, not the group your clients join.</p></div>

<div class="scn"><h4>Silent training stream</h4><p>A live lecture to 239.10.10.10 reaches nobody. The controller was prepared for multicast-multicast with group 239.1.1.1, but wireless multicast was off and R1 has no PIM. The engineer enabled wireless multicast and returned to the default unicast mode with <code>no ap capwap multicast</code>. Both laptops then received the stream.</p><p><b>Lesson:</b> start with the global switch, then choose the simplest mode.</p></div>

<div class="iv"><p class="q">"Explain multicast-unicast and multicast-multicast on a WLC."</p><p>Unicast mode: the controller replicates a unicast CAPWAP copy per AP, no wired network requirements. Multicast mode: one copy to a CAPWAP group, APs join with IGMP, needs multicast routing. Add IGMP snooping and that multicast on air uses a basic rate without acknowledgements.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wireless multicast must be on, or the controller drops wired multicast.</li>
<li>Default is multicast-unicast; ap capwap multicast GROUP selects multicast-multicast.</li>
<li>Multicast-multicast needs multicast routing and PIM on the underlay.</li>
<li>IGMP snooping forwards only to receivers; off means flood.</li>
<li>Multicast routing from the source is concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Teacher hall mein ek baar bol kar lecture de sakta hai, aur jo sunne aaya hai woh sab sunta hai. Yeh <b>multicast</b> hai: ek sender, kai receivers, har link par stream ki ek copy. Unicast se compare karo: teacher har student ke paas jaakar lecture 200 baar dohrata hai. Multicast teacher ki awaaz bachata hai, lekin tabhi jab hall (network) aisa bana ho ki ek awaaz sab tak pahunch sake, aur jo log nahi aaye unhe sunne par majboor na kiya jaye.</p>

<h3>Wi-Fi par multicast mushkil kyun hai</h3>
<ul>
<li>Multicast frame ka koi ek receiver nahi hota, isliye woh <b>acknowledge nahi</b> hota aur <b>retry nahi</b> hota.</li>
<li>Use har client ko samajhna hota hai, isliye AP use low <b>basic data rate</b> par bhejta hai, jisme bahut airtime lagta hai.</li>
<li>Sone wale clients ko jaagne aur receive karne ke liye schedule (DTIM period) chahiye.</li>
<li>Controller sab kuch CAPWAP mein AP ko tunnel karta hai, isliye controller ko tay karna padta hai ki ek multicast packet kai APs tak <b>kaise</b> pahunche.</li>
</ul>

<h3>Controller ka switch: wireless multicast</h3>
<p>Default mein controller wired side se aane wala multicast drop karta hai. Feature ko globally on karte hain:</p>
<pre class="code">wireless multicast
<span class="c">! optional: broadcast ko bhi wireless side par forward karo</span>
wireless broadcast</pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Multicast &gt; Enable wireless multicast</b>. Jab "multicast bilkul kaam nahi karta" ho, to sabse pehle yahi ek line check karo.</p>

<h3>Do delivery modes</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do multicast modes">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">multicast-unicast (default)</text>
<rect x="20" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="190" y="30" width="70" height="30" rx="8" fill="#bae6fd"/><text x="225" y="50" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="190" y="70" width="70" height="30" rx="8" fill="#bae6fd"/><text x="225" y="90" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<line x1="100" y1="52" x2="190" y2="45" stroke="#64748b" stroke-width="2"/><line x1="100" y1="68" x2="190" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="160" y="125" text-anchor="middle" class="svg-muted" font-size="12">har AP ke liye ek unicast copy</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">multicast-multicast</text>
<rect x="340" y="40" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="380" y="65" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="450" y="35" width="60" height="50" rx="8" fill="#fde68a"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="12">net</text><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="11">PIM</text>
<rect x="550" y="30" width="70" height="30" rx="8" fill="#bae6fd"/><text x="585" y="50" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="550" y="70" width="70" height="30" rx="8" fill="#bae6fd"/><text x="585" y="90" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<line x1="420" y1="60" x2="450" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="50" x2="550" y2="45" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="480" y="125" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP group ko ek copy</text>
<rect x="40" y="150" width="560" height="80" rx="10" fill="#e2e8f0"/>
<text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Unicast mode: kisi bhi wired network par chalta hai, controller CPU aur uplink use karta hai.</text>
<text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Multicast mode: efficient, lekin WLC aur APs ke beech network ko multicast route karna padta hai.</text>
</svg><p class="cap">Controller ya to har AP ke liye ek unicast copy banata hai, ya APs ke join karne ke liye ek multicast group ko ek copy bhejta hai.</p></div>
<table class="cmp"><tr><th>Mode</th><th>Command</th><th>Kaise kaam karta hai</th><th>Kya chahiye</th></tr>
<tr><td>multicast-unicast (default)</td><td>koi nahi (ya <code>no ap capwap multicast</code>)</td><td>controller har us AP ko unicast CAPWAP copy bhejta hai jo receiver ko serve karta hai</td><td>wired network mein kuch khaas nahi</td></tr>
<tr><td>multicast-multicast</td><td><code>ap capwap multicast 239.1.1.1</code></td><td>controller CAPWAP group ko ek copy bhejta hai; har AP IGMP se us group ko join karta hai</td><td>controller VLAN aur AP VLAN ke beech multicast routing aur PIM</td></tr></table>
<p>CAPWAP group 224.0.1.0 se 239.255.255.255 ke beech ka multicast address hona chahiye; lab 224.0.0.x aur non-multicast addresses refuse karta hai. 239.1.1.1 jaisa administratively scoped address chuno jo kisi application ne use na kiya ho. Web UI: <b>Configuration &gt; Wireless &gt; Multicast</b>, <b>AP CAPWAP multicast mode</b>: Unicast ya Multicast (group ke saath).</p>
<p>Lab mein underlay R1 ke running config se padha jaata hai: model router interfaces par VLAN 99 (controller) aur VLAN 10 (AP) ki taraf <code>ip multicast-routing</code> aur <code>ip pim</code> dhundta hai. Inke bina multicast-multicast fail hota hai. <b>Source</b> se controller tak multicast routing (bade network mein PIM aur RPs) <b>concept only</b> hai: lab maanta hai stream controller tak pahunchti hai.</p>

<h3>IGMP snooping: asal mein kaun chahta hai</h3>
<p>Client group ko <b>IGMP report</b> bhejkar join karta hai. <b>IGMP snooping</b> on ho to controller seekhta hai ki kin clients ne join kiya aur stream sirf unhi ki taraf forward karta hai. VLAN ke liye snooping off ho to stream us VLAN ke har client ko <b>flood</b> hoti hai: chalti hai lekin airtime barbaad karti hai. Snooping default mein on hai. Lab mein:</p>
<pre class="code">ip igmp snooping
no ip igmp snooping vlan 10    <span class="c">! ek VLAN ke liye disable</span>
ip igmp snooping vlan 10       <span class="c">! phir enable</span></pre>
<p>Jis client ne IGMP report nahi bheji use kuch nahi milta jab uske VLAN par snooping on ho, jo ki chahi hui baat hai.</p>
<pre class="out">WLC1# show wireless multicast
Multicast                               : Enabled
Wireless Broadcast                      : Disabled
AP CAPWAP multicast mode                : Unicast
AP CAPWAP IPv4 multicast group address  : 0.0.0.0
IGMP snooping (global)                  : Enabled

WLC1# show ip igmp snooping groups
Vlan  Group             Type    Client
20    239.10.10.10      igmp    LAPTOP1 (0050.7966.6801)</pre>
<div class="note"><p><code>show ip igmp snooping groups</code> ka column layout approximate hai; real output platform ke hisaab se alag hota hai.</p></div>

<h3>Client se test</h3>
<pre class="out">LAPTOP1&gt; wifi mcast join 239.10.10.10
IGMP report sent for 239.10.10.10.
LAPTOP1&gt; wifi mcast test 239.10.10.10
Multicast test for 239.10.10.10 on LAPTOP1
  1. Client LAPTOP1 on WLAN 1 (NK-STAFF), VLAN 20, group 239.10.10.10 joined (IGMP report sent)
  2. Controller WLC1: wireless multicast is enabled
  3. IGMP snooping is on for VLAN 20: the stream is forwarded only toward receivers that joined.
  4. Mode multicast-unicast (default): ...
<span class="hl">Result: the stream reaches the client (unicast mode)</span></pre>

<div class="eg"><p><b>Worked example.</b> Training session 6 APs par 40 laptops ke liye 239.10.10.10 par stream karta hai. Multicast-unicast mein controller 6 unicast CAPWAP copies bhejta hai (receiver ko serve karne wale har AP ke liye ek) aur har AP phir basic rate par ek multicast frame radiate karta hai. Multicast-multicast mein woh CAPWAP group ko 1 copy bhejta hai. Fark controller uplink load ka hai, radio load ka nahi: air par har AP phir bhi frame ek baar transmit karta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Multicast-capable underlay ke bina CAPWAP multicast group set karna.</li>
<li><code>wireless multicast</code> bhool jaana.</li>
<li>Aisa CAPWAP group chunna jo kisi application group se takraye.</li>
<li>"Chalane ke liye" snooping off karke VLAN ko flood karna.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> multicast-unicast <b>default</b> hai aur underlay support nahi chahiye; multicast-multicast ko PIM ya equivalent chahiye. Dono ko wireless multicast enabled chahiye. CAPWAP group <b>controller se AP</b> delivery ke liye hai, woh group nahi jise aapke clients join karte hain.</p></div>

<div class="scn"><h4>Khamosh training stream</h4><p>239.10.10.10 par live lecture kisi tak nahi pahunchti. Controller multicast-multicast ke liye group 239.1.1.1 ke saath taiyaar tha, lekin wireless multicast off tha aur R1 par PIM nahi hai. Engineer ne wireless multicast enable kiya aur <code>no ap capwap multicast</code> se default unicast mode par wapas aaya. Phir dono laptops ko stream mili.</p><p><b>Lesson:</b> global switch se shuru karo, phir sabse simple mode chuno.</p></div>

<div class="iv"><p class="q">"WLC par multicast-unicast aur multicast-multicast samjhao."</p><p>Unicast mode: controller har AP ke liye unicast CAPWAP copy banata hai, wired network par koi requirement nahi. Multicast mode: CAPWAP group ko ek copy, APs IGMP se join karte hain, multicast routing chahiye. IGMP snooping jodo aur yeh ki air par multicast basic rate par bina acknowledgement ke jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wireless multicast on hona chahiye, warna controller wired multicast drop karta hai.</li>
<li>Default multicast-unicast hai; ap capwap multicast GROUP multicast-multicast chunta hai.</li>
<li>Multicast-multicast ko underlay par multicast routing aur PIM chahiye.</li>
<li>IGMP snooping sirf receivers ko forward karta hai; off ka matlab flood.</li>
<li>Source se multicast routing lab mein concept only hai.</li>
</ul></div>
`}};export{e as default};