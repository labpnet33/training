var e={id:`mac-learning`,h:{en:`How a switch learns, forwards and floods`,hi:`Switch kaise learn, forward aur flood karta hai`},body:{en:`
<p>Before VLANs, trunks or routing, you must understand the one thing every switch does all day: decide where to send a frame. Think of a post-room clerk in a large office. Every letter that arrives has a sender and a receiver desk. The clerk writes down "desk 14 is in corridor B" the first time a letter from desk 14 passes by. Next time a letter is addressed to desk 14, the clerk walks straight to corridor B. If the clerk has never heard of a desk, the letter is copied to every corridor. That is exactly the learn, forward and flood behaviour of an Ethernet switch.</p>

<h3>The Ethernet frame in one minute</h3>
<p>A <b>frame</b> is the Layer 2 envelope. It carries a destination MAC address (6 bytes), a source MAC address (6 bytes), an optional 802.1Q VLAN tag (4 bytes), a type field and the payload. A <b>MAC address</b> is a hardware-style identifier such as <code>00:50:7f:06:6d:01</code>. A switch only reads the Layer 2 header. It does not care about IP addresses when it switches.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Learn forward flood">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Switch AS1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">MAC table</text>
<rect x="20" y="20" width="100" height="36" rx="8" fill="#bae6fd"/><text x="70" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1 ge-0/0/1</text>
<rect x="20" y="150" width="100" height="36" rx="8" fill="#bae6fd"/><text x="70" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC2 ge-0/0/2</text>
<rect x="520" y="20" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="570" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC3 ge-0/0/3</text>
<rect x="520" y="150" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="570" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC4 ge-0/0/4</text>
<line x1="120" y1="40" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="120" y1="168" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="95" x2="520" y2="40" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="520" y2="168" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">unknown or broadcast: flood to all other ports</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">known unicast: one port only</text>
</svg><p class="cap">One switch, four hosts: the MAC table decides between a single port and all ports.</p></div>

<h3>The four actions</h3>
<ol>
<li><b>Learn.</b> For every incoming frame the switch records the <i>source</i> MAC, the VLAN and the ingress port in the Ethernet switching table.</li>
<li><b>Forward.</b> If the <i>destination</i> MAC is in the table for that VLAN, the frame leaves through that one port only.</li>
<li><b>Flood.</b> Broadcasts (destination ff:ff:ff:ff:ff:ff), multicasts without snooping and <b>unknown unicast</b> frames go out of every port in the same VLAN except the ingress port.</li>
<li><b>Filter.</b> If the destination is behind the same port the frame arrived on, the switch drops it.</li>
</ol>
<p>Entries <b>age out</b> after a period of silence (default 300 seconds on Junos) and are removed when the port goes down. When a host moves to another port, the next frame it sends updates the entry: this is a <b>MAC move</b>.</p>

<div class="eg"><p><b>Worked example.</b> PC1 pings PC2 for the first time on AS1. PC1 first sends an ARP broadcast. AS1 learns PC1 on ge-0/0/1 and floods the broadcast to ge-0/0/2, ge-0/0/3 and ge-0/0/4. PC2 answers with a unicast ARP reply. AS1 learns PC2 on ge-0/0/2 and sends the reply only to ge-0/0/1. Every following frame between them uses one port each way. After a few pings the table holds one entry per active host.</p></div>

<h3>Seeing it on the switch</h3>
<p>In the lab Lab 1 topology (AS1 and four PCs) we ping between the hosts and then read the table. This output was captured from the simulator before any VLAN was created, so every host is in the built-in <code>default</code> VLAN:</p>
<pre class="out">lab@AS1&gt; show ethernet-switching table

Ethernet switching table : 4 entries, 4 learned
Routing instance : default-switch
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   default             00:50:7a:06:65:01   D           -      <span class="hl">ge-0/0/4.0</span>
   default             00:50:7f:06:6d:01   D           -      ge-0/0/1.0
   default             00:50:80:06:6e:01   D           -      ge-0/0/2.0
   default             00:50:81:06:70:01   D           -      ge-0/0/3.0</pre>
<p>Read it left to right: VLAN name, the learned MAC, the flag <code>D</code> (dynamically learned) and the logical interface. The value after the dot is the <b>unit</b>; on EX access ports it is almost always <code>.0</code>.</p>

<pre class="code"><span class="c"># useful table commands</span>
show ethernet-switching table
show ethernet-switching table vlan-name FINANCE
show ethernet-switching table interface ge-0/0/4
clear ethernet-switching table</pre>

<div class="note"><p>Clearing the table is safe. Entries are relearned from the next frame. It is a quick way to prove that a stale entry was the problem.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading the MAC table as proof that the host is reachable. A MAC entry only says a frame from that source arrived on that port. Another mistake: expecting to see the PC's IP address here. The Ethernet switching table has no IP information at all; use <code>show arp</code> on a Layer 3 device for that.</p></div>
<div class="exam"><p><b>Exam trap.</b> Unknown unicast is flooded; unknown <i>broadcast</i> is a wrong phrase because every broadcast is flooded by definition. Also remember that learning uses the <i>source</i> MAC and forwarding uses the <i>destination</i> MAC.</p></div>

<div class="scn"><h4>The printer that "moved" every ten seconds</h4><p>A branch printer lost jobs at random. On the switch the printer's MAC kept flipping between ge-0/0/5 and ge-0/0/9. A cabling check found a second, forgotten patch cable from the same wall box looping back to the switch. Frames from the printer arrived on two ports, so the table was constantly updated. Removing the extra cable stopped the flapping at once.</p><p><b>Lesson:</b> a MAC address that appears on two ports in quick succession points to a loop or a duplicate address. The spanning tree module shows how the network protects itself from this.</p></div>

<div class="iv"><p class="q">"What does a switch do when it receives a frame for an unknown destination MAC?"</p><p>It floods the frame out of every port in the same VLAN except the ingress port. When the real owner replies, the switch learns its address from that reply and from then on forwards unicast to that single port. Mention that learning is based on the source MAC and that entries age out after 300 seconds by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch learns the source MAC, forwards on the destination MAC, floods unknown unicast and broadcasts, and filters same-port frames.</li>
<li>The MAC table is kept per VLAN and shows flag D for dynamic entries.</li>
<li>Entries age out (300 seconds by default) and clear when the port goes down.</li>
<li>Use <code>show ethernet-switching table</code> and <code>clear ethernet-switching table</code> to inspect and reset it.</li>
</ul></div>
`,hi:`
<p>VLANs, trunks ya routing se pehle woh ek kaam samajhna zaroori hai jo har switch din bhar karta hai: frame kahan bhejna hai yeh decide karna. Socho ek bade office ka post-room clerk. Har letter par bhejne wale aur paane wale desk ka naam hota hai. Clerk pehli baar desk 14 ka letter guzarne par likh leta hai "desk 14 corridor B mein hai". Agli baar desk 14 ke naam letter aaye to clerk seedha corridor B jaata hai. Jis desk ke baare mein clerk ne kabhi suna hi nahi, uska letter har corridor mein copy karke bhej deta hai. Ethernet switch ka learn, forward aur flood behaviour bilkul yahi hai.</p>

<h3>Ethernet frame ek minute mein</h3>
<p><b>Frame</b> Layer 2 ka envelope hai. Isme destination MAC address (6 bytes), source MAC address (6 bytes), optional 802.1Q VLAN tag (4 bytes), type field aur payload hota hai. <b>MAC address</b> hardware jaisi pehchaan hai, jaise <code>00:50:7f:06:6d:01</code>. Switch sirf Layer 2 header padhta hai. Switching karte waqt use IP addresses se matlab nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Learn forward flood">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Switch AS1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">MAC table</text>
<rect x="20" y="20" width="100" height="36" rx="8" fill="#bae6fd"/><text x="70" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1 ge-0/0/1</text>
<rect x="20" y="150" width="100" height="36" rx="8" fill="#bae6fd"/><text x="70" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC2 ge-0/0/2</text>
<rect x="520" y="20" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="570" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC3 ge-0/0/3</text>
<rect x="520" y="150" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="570" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC4 ge-0/0/4</text>
<line x1="120" y1="40" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="120" y1="168" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="95" x2="520" y2="40" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="520" y2="168" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">unknown ya broadcast: baaki sab ports par flood</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">known unicast: sirf ek port</text>
</svg><p class="cap">Ek switch, chaar hosts: MAC table decide karta hai ki ek port ya sab ports.</p></div>

<h3>Chaar actions</h3>
<ol>
<li><b>Learn.</b> Har aane wale frame ke liye switch <i>source</i> MAC, VLAN aur ingress port ko Ethernet switching table mein likh leta hai.</li>
<li><b>Forward.</b> Agar <i>destination</i> MAC us VLAN ke table mein hai, frame sirf usi ek port se nikalta hai.</li>
<li><b>Flood.</b> Broadcast (destination ff:ff:ff:ff:ff:ff), snooping ke bina multicast aur <b>unknown unicast</b> frames usi VLAN ke har port se nikalte hain, bas ingress port ko chhod kar.</li>
<li><b>Filter.</b> Agar destination usi port ke peeche hai jahan se frame aaya, switch use drop kar deta hai.</li>
</ol>
<p>Chup rehne par entries <b>age out</b> ho jaati hain (Junos par default 300 seconds) aur port down hote hi hat jaati hain. Host doosre port par chala jaaye to uska agla frame entry update kar deta hai: yeh <b>MAC move</b> hai.</p>

<div class="eg"><p><b>Worked example.</b> AS1 par PC1 pehli baar PC2 ko ping karta hai. PC1 pehle ARP broadcast bhejta hai. AS1 PC1 ko ge-0/0/1 par learn karta hai aur broadcast ko ge-0/0/2, ge-0/0/3 aur ge-0/0/4 par flood karta hai. PC2 unicast ARP reply deta hai. AS1 PC2 ko ge-0/0/2 par learn karta hai aur reply sirf ge-0/0/1 ko bhejta hai. Uske baad un dono ke beech har frame ek-ek port se jaata hai. Kuch pings ke baad table mein har active host ki ek entry hoti hai.</p></div>

<h3>Switch par dekhna</h3>
<p>Lab 1 topology (AS1 aur chaar PCs) mein hum hosts ke beech ping karke table padhte hain. Yeh output simulator se capture kiya gaya hai, VLAN banane se pehle, isliye saare hosts built-in <code>default</code> VLAN mein hain:</p>
<pre class="out">lab@AS1&gt; show ethernet-switching table

Ethernet switching table : 4 entries, 4 learned
Routing instance : default-switch
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   default             00:50:7a:06:65:01   D           -      <span class="hl">ge-0/0/4.0</span>
   default             00:50:7f:06:6d:01   D           -      ge-0/0/1.0
   default             00:50:80:06:6e:01   D           -      ge-0/0/2.0
   default             00:50:81:06:70:01   D           -      ge-0/0/3.0</pre>
<p>Left se right padho: VLAN name, learn hua MAC, flag <code>D</code> (dynamically learn hua) aur logical interface. Dot ke baad ki value <b>unit</b> hai; EX access ports par yeh lagbhag hamesha <code>.0</code> hoti hai.</p>

<pre class="code"><span class="c"># useful table commands</span>
show ethernet-switching table
show ethernet-switching table vlan-name FINANCE
show ethernet-switching table interface ge-0/0/4
clear ethernet-switching table</pre>

<div class="note"><p>Table clear karna safe hai. Entries agle frame se dobara learn ho jaati hain. Yeh saabit karne ka tez tareeka hai ki problem purani entry thi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> MAC table dekh kar maan lena ki host reachable hai. MAC entry sirf yeh batati hai ki us source ka frame us port par aaya. Doosri galti: yahan PC ka IP address dhoondhna. Ethernet switching table mein IP ki koi jaankari nahi hoti; uske liye Layer 3 device par <code>show arp</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Unknown unicast flood hota hai; "unknown broadcast" galat phrase hai kyunki har broadcast definition se flood hota hai. Yaad rakho: learning <i>source</i> MAC se hoti hai aur forwarding <i>destination</i> MAC se.</p></div>

<div class="scn"><h4>Printer jo har das second mein "move" karta tha</h4><p>Ek branch ka printer random jobs kho raha tha. Switch par printer ka MAC ge-0/0/5 aur ge-0/0/9 ke beech baar-baar badal raha tha. Cabling check mein pata chala ki usi wall box se ek bhoola hua doosra patch cable wapas switch mein laga tha. Printer ke frames do ports par aa rahe the, isliye table lagatar update ho raha tha. Extra cable hatane se flapping turant ruk gayi.</p><p><b>Lesson:</b> ek MAC address jo jaldi-jaldi do ports par dikhe, woh loop ya duplicate address ka sanket hai. Spanning tree module dikhata hai ki network khud ko isse kaise bachata hai.</p></div>

<div class="iv"><p class="q">"Switch ko unknown destination MAC ka frame mile to woh kya karta hai?"</p><p>Woh frame ko usi VLAN ke har port se flood karta hai, ingress port ko chhod kar. Asli owner reply deta hai to switch us reply se uska address learn karta hai aur uske baad unicast sirf us ek port par bhejta hai. Batao ki learning source MAC par hoti hai aur entries default mein 300 seconds baad age out hoti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch source MAC learn karta hai, destination MAC par forward karta hai, unknown unicast aur broadcast flood karta hai, aur same-port frames filter karta hai.</li>
<li>MAC table har VLAN ke liye alag rehta hai aur dynamic entries par flag D dikhta hai.</li>
<li>Entries age out hoti hain (default 300 seconds) aur port down hone par clear ho jaati hain.</li>
<li>Inspect aur reset ke liye <code>show ethernet-switching table</code> aur <code>clear ethernet-switching table</code> use karo.</li>
</ul></div>
`}};export{e as default};