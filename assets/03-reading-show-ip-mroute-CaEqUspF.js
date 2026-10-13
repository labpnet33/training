var e={id:`read-mroute`,h:{en:`Reading show ip mroute completely`,hi:`show ip mroute ko poora padhna`},body:{en:`
<p><code>show ip mroute</code> is the multicast routing table. It is the one command that tells you what a router will actually do with a stream, so you must be able to read every part of it. We use the output of the Sahyadri University lab, first broken and then healthy.</p>

<h3>The anatomy of one entry</h3>
<pre class="out">R3# show ip mroute 239.50.1.1
IP Multicast Routing Table
Flags: D - Dense, S - Sparse, s - SSM Group, C - Connected,
       L - Local, P - Pruned, R - RP-bit set, F - Register flag,
       T - SPT-bit set, J - Join SPT, M - MSDP created entry,
       A - Candidate for MSDP Advertisement, I - Received Source Specific Host Report

(*, 239.50.1.1), 00:00:24/00:02:36, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: <span class="hl">Null</span>, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Parts of an mroute entry">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">(*, G) or (S, G) , uptime/expires , RP address , flags</text>
<rect x="10" y="60" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">Incoming interface (must equal the RPF interface) , RPF neighbour</text>
<rect x="10" y="110" width="620" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">Outgoing interface list (OIL): where copies are sent, state and timers</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Read top to bottom: who am I, where do I accept, where do I send</text>
</svg><p class="cap">Every entry has the same three layers.</p></div>

<h3>Line 1: the key and the flags</h3>
<p>The <b>key</b> is <code>(*, G)</code> for the shared tree (any source) or <code>(S, G)</code> for the source tree. The two times are <b>uptime/expires</b>. The word <b>RP</b> shows which RP this router uses for the group; <code>RP 0.0.0.0</code> means it has none. The flags tell the story:</p>
<table class="cmp"><tr><th>Flag</th><th>Meaning</th><th>When you expect it</th></tr>
<tr><td><b>S</b></td><td>Sparse mode group</td><td>always in PIM-SM</td></tr>
<tr><td><b>C</b></td><td>A receiver is connected on a directly attached LAN (IGMP)</td><td>last-hop router</td></tr>
<tr><td><b>L</b></td><td>The router itself is a member (join-group)</td><td>test setups</td></tr>
<tr><td><b>J</b></td><td>Joined the shortest-path tree</td><td>last-hop router after switchover</td></tr>
<tr><td><b>T</b></td><td>Traffic is flowing on the source tree (SPT bit)</td><td>(S,G) entries carrying data</td></tr>
<tr><td><b>F</b></td><td>Register flag: the router is the first hop for a local source</td><td>first-hop router</td></tr>
<tr><td><b>P</b></td><td>Pruned: the outgoing list is empty</td><td>no one downstream wants it</td></tr>
<tr><td><b>s</b></td><td>SSM group</td><td>232.0.0.0/8 groups</td></tr></table>

<h3>Line 2: incoming interface and RPF neighbour</h3>
<p>The <b>incoming interface</b> is the only interface on which this entry accepts packets. It must be the same interface that <code>show ip rpf</code> prints. The <b>RPF nbr</b> is the upstream PIM neighbour to which joins are sent. Two special cases matter: on the router directly connected to the source the RPF neighbour is <code>0.0.0.0</code> (nothing upstream), and on the RP the incoming interface of (*,G) is <code>Null</code> (the RP is the root). Anywhere else, <code>Incoming interface: Null</code> with <code>RPF nbr 0.0.0.0</code> is a <b>red flag</b>: the router has no usable RPF path.</p>

<h3>Lines 3 onward: the OIL</h3>
<p>The <b>outgoing interface list</b> shows each interface that gets a copy, its state (<code>Forward</code> or <code>Prune</code>), its mode (<code>Sparse</code>) and its own <b>uptime/expires</b>. Empty list plus flag P means no downstream interest. A timer showing <code>stopped</code> means the entry never expires because it is being refreshed continuously or is the RP's entry for local state.</p>

<h3>The same router, healthy</h3>
<pre class="out">R3# show ip mroute 239.50.1.1
(*, 239.50.1.1), 00:01:03/00:02:57, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:03/00:02:57

(10.10.1.10, 239.50.1.1), 00:00:39/00:02:21, flags: <span class="hl">T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:51</pre>
<p>Compare with the broken output above: the (*,G) now has <b>J</b> (the router joined the shortest-path tree), a real incoming interface and a real neighbour; and the new (S,G) entry has <b>T</b>, which proves data is flowing on the source tree.</p>

<div class="eg"><p><b>Worked example: three seconds of diagnosis.</b> You see <code>flags: SC</code>, <code>Incoming interface: Null</code>. <b>C</b> says the receiver is present, so IGMP is fine. <b>No J and no T</b> say the router never reached the tree. <b>Null</b> says the RPF check has no usable neighbour. Conclusion: look at <code>show ip rpf</code> for the RP, without even checking IGMP again.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading only the OIL and concluding "it forwards". The incoming interface must also be right, otherwise packets are dropped before the OIL is used. (2) Expecting the T flag on the router that only has a (*,G): T appears on (S,G). (3) Judging by one snapshot: timers prove whether the entry is fresh or stale, so look twice.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>J</b> means "join SPT" on (*,G) and <b>T</b> means "SPT bit set" on (S,G). They are different flags on different lines. The <b>F</b> flag marks the first-hop router, not the RP.</p></div>

<div class="scn"><h4>"It has the group, so why no video?"</h4><p>A junior engineer saw the group in <code>show ip mroute</code> on the last-hop router with an outgoing interface toward the hall and declared the router healthy. A senior engineer pointed at the first line: flags SC, no J, and <code>Incoming interface: Null</code>. The group existed only because a host had asked for it. Nothing could ever arrive.</p><p><b>Lesson:</b> an entry proves interest, not delivery. Delivery needs a valid incoming interface and, for the source tree, the T flag.</p></div>

<div class="iv"><p class="q">"What do the flags S, C, J and T tell you about a last-hop router?"</p><p>S: sparse mode. C: a receiver is directly connected. J: the router has switched to the shortest-path tree. T: data is arriving on the source tree. A last-hop entry with SC but no J and no T has interested receivers but is not receiving data. Then look at the incoming interface and the RPF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An entry has three layers: key and flags, incoming interface and RPF neighbour, outgoing interface list.</li>
<li>The incoming interface must equal the RPF interface; Null with RPF nbr 0.0.0.0 away from the source is a red flag.</li>
<li>C proves a receiver is present, J proves the router joined the SPT, T proves data flows on the source tree.</li>
<li>An empty OIL with flag P means nobody downstream wants the stream.</li>
<li>Read the timers: they separate fresh state from stale state.</li>
</ul></div>
`,hi:`
<p><code>show ip mroute</code> multicast routing table hai. Yahi ek command batata hai ki router stream ke saath asal mein kya karega, isliye aapko iska har hissa padhna aana chahiye. Hum Sahyadri University lab ka output use karte hain, pehle toota hua, phir theek.</p>

<h3>Ek entry ki anatomy</h3>
<pre class="out">R3# show ip mroute 239.50.1.1
IP Multicast Routing Table
Flags: D - Dense, S - Sparse, s - SSM Group, C - Connected,
       L - Local, P - Pruned, R - RP-bit set, F - Register flag,
       T - SPT-bit set, J - Join SPT, M - MSDP created entry,
       A - Candidate for MSDP Advertisement, I - Received Source Specific Host Report

(*, 239.50.1.1), 00:00:24/00:02:36, RP 2.2.2.2, flags: <span class="hl">SC</span>
  Incoming interface: <span class="hl">Null</span>, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36</pre>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Mroute entry ke hisse">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">(*, G) ya (S, G) , uptime/expires , RP address , flags</text>
<rect x="10" y="60" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">Incoming interface (RPF interface ke barabar) , RPF neighbour</text>
<rect x="10" y="110" width="620" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">Outgoing interface list (OIL): copies kahan jaati hain, state aur timers</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Upar se neeche padho: main kaun, kahan accept, kahan bhejun</text>
</svg><p class="cap">Har entry mein wahi teen layers hoti hain.</p></div>

<h3>Line 1: key aur flags</h3>
<p><b>Key</b> shared tree (koi bhi source) ke liye <code>(*, G)</code> hai ya source tree ke liye <code>(S, G)</code>. Do times hain <b>uptime/expires</b>. Shabd <b>RP</b> dikhata hai ki router is group ke liye kaunsa RP use karta hai; <code>RP 0.0.0.0</code> matlab uske paas koi RP nahi. Flags poori kahani batate hain:</p>
<table class="cmp"><tr><th>Flag</th><th>Matlab</th><th>Kab expect karein</th></tr>
<tr><td><b>S</b></td><td>Sparse mode group</td><td>PIM-SM mein hamesha</td></tr>
<tr><td><b>C</b></td><td>Seedhe jude LAN par receiver hai (IGMP)</td><td>last-hop router</td></tr>
<tr><td><b>L</b></td><td>Router khud member hai (join-group)</td><td>test setups</td></tr>
<tr><td><b>J</b></td><td>Shortest-path tree join kiya</td><td>switchover ke baad last-hop router</td></tr>
<tr><td><b>T</b></td><td>Source tree par traffic chal raha hai (SPT bit)</td><td>data le jaane wali (S,G) entries</td></tr>
<tr><td><b>F</b></td><td>Register flag: router local source ka first hop hai</td><td>first-hop router</td></tr>
<tr><td><b>P</b></td><td>Pruned: outgoing list khaali hai</td><td>neeche kisi ko nahi chahiye</td></tr>
<tr><td><b>s</b></td><td>SSM group</td><td>232.0.0.0/8 groups</td></tr></table>

<h3>Line 2: incoming interface aur RPF neighbour</h3>
<p><b>Incoming interface</b> woh ek hi interface hai jis par yeh entry packets accept karti hai. Yeh wahi hona chahiye jo <code>show ip rpf</code> print karta hai. <b>RPF nbr</b> upstream PIM neighbour hai jise joins bheje jaate hain. Do special cases: source se seedhe jude router par RPF neighbour <code>0.0.0.0</code> hota hai (upar kuch nahi), aur RP par (*,G) ka incoming interface <code>Null</code> hota hai (RP root hai). Kahin aur <code>Incoming interface: Null</code> aur <code>RPF nbr 0.0.0.0</code> <b>red flag</b> hai: router ke paas koi usable RPF path nahi.</p>

<h3>Line 3 se aage: OIL</h3>
<p><b>Outgoing interface list</b> har us interface ko dikhati hai jise copy milti hai, uski state (<code>Forward</code> ya <code>Prune</code>), mode (<code>Sparse</code>) aur uska apna <b>uptime/expires</b>. Khaali list plus flag P matlab neeche kisi ko interest nahi. Timer <code>stopped</code> dikhe to entry kabhi expire nahi hoti kyunki woh lagatar refresh ho rahi hai ya RP ki local state ki entry hai.</p>

<h3>Wahi router, theek haalat mein</h3>
<pre class="out">R3# show ip mroute 239.50.1.1
(*, 239.50.1.1), 00:01:03/00:02:57, RP 2.2.2.2, flags: <span class="hl">SJC</span>
  Incoming interface: <span class="hl">GigabitEthernet0/2</span>, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:03/00:02:57

(10.10.1.10, 239.50.1.1), 00:00:39/00:02:21, flags: <span class="hl">T</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:39/00:02:51</pre>
<p>Upar ke toote output se compare karo: (*,G) mein ab <b>J</b> hai (router ne shortest-path tree join kiya), asli incoming interface aur asli neighbour hai; aur nayi (S,G) entry mein <b>T</b> hai, jo prove karta hai ki source tree par data chal raha hai.</p>

<div class="eg"><p><b>Worked example: teen second ka diagnosis.</b> Aapko <code>flags: SC</code>, <code>Incoming interface: Null</code> dikhta hai. <b>C</b> kehta hai receiver maujood hai, to IGMP theek hai. <b>J aur T nahi</b> kehte hain router tree tak pahuncha hi nahi. <b>Null</b> kehta hai RPF check ko koi usable neighbour nahi mila. Nateeja: IGMP dobara check kiye bina RP ke liye <code>show ip rpf</code> dekho.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Sirf OIL padhkar kehna "yeh forward karta hai". Incoming interface bhi sahi hona chahiye, warna packets OIL use hone se pehle hi drop ho jaate hain. (2) Sirf (*,G) wale router par T flag expect karna: T (S,G) par aata hai. (3) Ek snapshot se faisla karna: timers batate hain entry fresh hai ya stale, isliye do baar dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>J</b> ka matlab (*,G) par "join SPT" hai aur <b>T</b> ka matlab (S,G) par "SPT bit set" hai. Yeh alag lines par alag flags hain. <b>F</b> flag first-hop router ko mark karta hai, RP ko nahi.</p></div>

<div class="scn"><h4>"Group hai, to video kyun nahi?"</h4><p>Ek junior engineer ne last-hop router par <code>show ip mroute</code> mein group dekha, hall ki taraf outgoing interface ke saath, aur kaha router theek hai. Senior engineer ne pehli line dikhayi: flags SC, J nahi, aur <code>Incoming interface: Null</code>. Group sirf isliye tha kyunki ek host ne maanga tha. Kuch bhi kabhi nahi aa sakta tha.</p><p><b>Lesson:</b> entry interest prove karti hai, delivery nahi. Delivery ke liye valid incoming interface aur source tree ke liye T flag chahiye.</p></div>

<div class="iv"><p class="q">"Last-hop router par flags S, C, J aur T kya batate hain?"</p><p>S: sparse mode. C: receiver seedha jude LAN par hai. J: router shortest-path tree par switch ho gaya. T: source tree par data aa raha hai. SC wali last-hop entry jisme J aur T nahi, usme interested receivers hain par data nahi aa raha. Tab incoming interface aur RPF dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Entry mein teen layers: key aur flags, incoming interface aur RPF neighbour, outgoing interface list.</li>
<li>Incoming interface RPF interface ke barabar hona chahiye; source se door Null aur RPF nbr 0.0.0.0 red flag hai.</li>
<li>C receiver ki maujoodgi prove karta hai, J SPT join, T source tree par data flow.</li>
<li>Khaali OIL aur flag P matlab neeche kisi ko stream nahi chahiye.</li>
<li>Timers padho: yeh fresh aur stale state ko alag karte hain.</li>
</ul></div>
`}};export{e as default};