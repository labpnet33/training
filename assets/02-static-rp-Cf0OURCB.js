var e={id:`static-rp`,h:{en:`Static RP, group-to-RP ACLs and override`,hi:`Static RP, group-to-RP ACLs aur override`},body:{en:`
<p>The simplest way to tell a router where the RP is: type it. This is a <b>static RP</b>. It has no protocol, no timers and nothing to elect. That is its strength (you can read the whole design in the running-config) and its weakness (every router needs the line, and a typo on one router breaks delivery for its receivers).</p>

<h3>The basic command</h3>
<p>One global command, the same on every router in the domain, including the RP itself:</p>
<pre class="code"><span class="c">! on every router: R1, R2, R3, R4</span>
ip multicast-routing
ip pim rp-address 2.2.2.2
<span class="c">! the RP address is a loopback on R2, advertised in OSPF,</span>
<span class="c">! with ip pim sparse-mode on that loopback</span></pre>
<p>Why a loopback? A loopback never goes down because of a cable, so the RP stays reachable as long as the router has any path. The address must be in your unicast routing (here OSPF), otherwise nobody can reach the RP and the joins have nowhere to go.</p>
<p>Without any ACL the command means <b>all groups</b>, <code>224.0.0.0/4</code>. Two exceptions you already know: the SSM range (232.0.0.0/8, when SSM is on) never uses an RP, and the Auto-RP groups 224.0.1.39 and 224.0.1.40 are special.</p>

<h3>Different RPs for different group ranges</h3>
<p>Sometimes one RP for everything is not what the business wants. Deccan Broadcast sends IPTV on <code>239.10.0.0/16</code>. Sahyadri University sends live classes on <code>239.20.0.0/16</code>. The two companies share one core, but a problem with class traffic should not load the IPTV RP. The answer: add a standard ACL that lists the groups and attach it to the RP line.</p>
<pre class="code"><span class="c">! on R1, R2, R3 and R4 (same on every router)</span>
ip access-list standard IPTV-GROUPS
 permit 239.10.0.0 0.0.255.255
ip access-list standard CLASS-GROUPS
 permit 239.20.0.0 0.0.255.255
ip pim rp-address 2.2.2.2 IPTV-GROUPS
ip pim rp-address 3.3.3.3 CLASS-GROUPS</pre>
<p>A <b>standard ACL</b> here matches the multicast group address. The wildcard <code>0.0.255.255</code> means "the first two octets must match, the last two can be anything", so the line covers the whole /16. Verify:</p>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Acl: IPTV-GROUPS, Static
    RP: 2.2.2.2 (?)
Acl: CLASS-GROUPS, Static
    RP: 3.3.3.3 (?)</span></pre>
<p>And the shared tree for a class group sits on R3, not R2:</p>
<pre class="out">R4#show ip mroute 239.20.1.1

(*, 239.20.1.1), 00:00:36/00:02:24, <span class="hl">RP 3.3.3.3</span>, flags: SJC
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.4.1
  Outgoing interface list:
    GigabitEthernet0/3, Forward/Sparse, 00:00:36/00:02:24</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Two RPs for two group ranges">
<rect x="20" y="85" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1 + STUDIO</text>
<rect x="270" y="15" width="130" height="50" rx="8" fill="#fde68a"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="12">R2 RP 2.2.2.2</text><text x="335" y="54" text-anchor="middle" class="svg-muted" font-size="12">239.10.0.0/16 IPTV</text>
<rect x="270" y="155" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="176" text-anchor="middle" class="svg-ink" font-size="12">R3 RP 3.3.3.3</text><text x="335" y="194" text-anchor="middle" class="svg-muted" font-size="12">239.20.0.0/16 classes</text>
<rect x="520" y="85" width="100" height="50" rx="8" fill="#bae6fd"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4 + VIEWER</text>
<line x1="120" y1="95" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="270" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="45" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="175" x2="520" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One core, two RPs: the ACL on the rp-address line decides which groups go to which RP.</p></div>

<h3>What if two lines match the same group?</h3>
<p>If two <code>rp-address</code> lines both cover a group (for example one without an ACL and one with), the router uses the entry with the <b>longest matching group range</b>; with equal ranges the higher RP address wins. Chapter 5 gives the complete order. For now, avoid overlaps unless you want them.</p>

<h3>The override keyword</h3>
<p>A static RP normally has the <b>lowest</b> priority: if the router also learns an RP by Auto-RP or BSR, the learned one wins and the static line is only a fallback. That is sometimes the opposite of what you want, for example during a migration or a test. The keyword <code>override</code> reverses it for this router:</p>
<pre class="code">ip pim rp-address 9.9.9.9 TEST-GROUPS override</pre>
<p>Now this router uses 9.9.9.9 for the groups in <code>TEST-GROUPS</code> even when Auto-RP or BSR offers another RP. Other routers are not affected, which is exactly why <code>override</code> is dangerous: one forgotten line makes one router disagree with the rest and its receivers silently stop receiving.</p>

<div class="note"><p><b>Junos note.</b> A static RP on Junos is configured under <code>protocols pim rp static</code>, with the group range written on the same line. The range plays the role of our ACL.</p>
<pre class="code">set protocols pim rp static address 2.2.2.2 group-ranges 239.10.0.0/16
set protocols pim rp static address 3.3.3.3 group-ranges 239.20.0.0/16
set protocols pim interface all mode sparse</pre></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using different ACL contents on different routers: R4 thinks 239.20.1.1 belongs to RP 3.3.3.3 while R1 thinks it has no RP. (2) Forgetting <code>ip pim sparse-mode</code> on the RP loopback. (3) Wrong wildcard: <code>0.0.255.255</code> versus the subnet mask <code>255.255.0.0</code>; an ACL uses wildcard bits, the opposite of a mask.</p></div>

<div class="exam"><p><b>Exam trap.</b> A standard ACL used in <code>ip pim rp-address</code> matches the <i>group</i>, not a source. A <code>deny</code> line excludes those groups from the RP. Groups that no line covers have no RP, and a <code>(*,G)</code> for them shows <code>RP 0.0.0.0</code>.</p></div>

<div class="scn"><h4>Lab 1 walk-through: two RPs, one core</h4><p>In <b>mq-rp-acl-ranges</b> you build exactly the design above. First create both ACLs and both rp-address lines on all four routers. Then have VIEWER join 239.10.1.1 and 239.20.1.1 and send from STUDIO. Read the answer from R2 and R3: the (*,239.10.1.1) entry is on R2, the (*,239.20.1.1) entry on R3. The last task adds the exam range 239.30.0.0/16 by adding one <code>permit</code> line to the CLASS-GROUPS ACL on every router, with no new RP line.</p><p><b>Lesson:</b> to move a new group range to an existing RP, you edit the ACL, not the RP statement.</p></div>

<div class="iv"><p class="q">"How do you give two group ranges two different RPs with static configuration?"</p><p>Strong answer: create one standard ACL per range and add one <code>ip pim rp-address &lt;rp&gt; &lt;acl&gt;</code> line per RP, identical on every router. Mention that the longest match wins when ranges overlap, that <code>override</code> beats learned RPs, and that you verify with <code>show ip pim rp mapping</code> and <code>show ip mroute</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static RP: <code>ip pim rp-address &lt;ip&gt; [acl] [override]</code>, the same on every router.</li>
<li>Use a loopback for the RP address, advertised in the IGP, with PIM sparse mode on it.</li>
<li>A standard ACL on the line selects the groups; without it the line covers 224.0.0.0/4.</li>
<li>Static is the fallback unless <code>override</code> is used.</li>
<li>Inconsistent lines on different routers are the number one static RP fault.</li>
</ul></div>
`,hi:`
<p>Router ko batane ka sabse simple tareeka ki RP kahan hai: use type kar do. Yeh <b>static RP</b> hai. Isme koi protocol nahi, koi timer nahi aur elect karne ko kuch nahi. Yahi iski taakat hai (poora design running-config mein padh sakte ho) aur yahi iski kamzori (har router par line chahiye, aur ek router par typo se uske receivers ki delivery tut jaati hai).</p>

<h3>Basic command</h3>
<p>Ek global command, domain ke har router par same, RP khud par bhi:</p>
<pre class="code"><span class="c">! har router par: R1, R2, R3, R4</span>
ip multicast-routing
ip pim rp-address 2.2.2.2
<span class="c">! RP address R2 ka loopback hai, OSPF mein advertise hota hai,</span>
<span class="c">! us loopback par ip pim sparse-mode ke saath</span></pre>
<p>Loopback kyun? Loopback kisi cable ki wajah se down nahi hota, isliye jab tak router ke paas koi bhi path hai RP reachable rehta hai. Address aapki unicast routing (yahan OSPF) mein hona chahiye, warna koi RP tak pahunch nahi sakta aur joins ke paas jaane ki jagah nahi hoti.</p>
<p>Bina ACL ke command ka matlab <b>saare groups</b>, <code>224.0.0.0/4</code>. Do exceptions aap pehle se jaante ho: SSM range (232.0.0.0/8, jab SSM on ho) kabhi RP use nahi karta, aur Auto-RP groups 224.0.1.39 aur 224.0.1.40 special hain.</p>

<h3>Alag group ranges ke liye alag RPs</h3>
<p>Kabhi kabhi sabke liye ek RP business ko pasand nahi aata. Deccan Broadcast IPTV <code>239.10.0.0/16</code> par bhejta hai. Sahyadri University live classes <code>239.20.0.0/16</code> par. Dono companies ek core share karti hain, lekin class traffic ki problem se IPTV RP par load nahi aana chahiye. Jawab: ek standard ACL jo groups list kare aur use RP line se attach karo.</p>
<pre class="code"><span class="c">! R1, R2, R3 aur R4 par (har router par same)</span>
ip access-list standard IPTV-GROUPS
 permit 239.10.0.0 0.0.255.255
ip access-list standard CLASS-GROUPS
 permit 239.20.0.0 0.0.255.255
ip pim rp-address 2.2.2.2 IPTV-GROUPS
ip pim rp-address 3.3.3.3 CLASS-GROUPS</pre>
<p>Yahan <b>standard ACL</b> multicast group address ko match karta hai. Wildcard <code>0.0.255.255</code> ka matlab "pehle do octets match hone chahiye, aakhri do kuch bhi ho sakte hain", isliye line poore /16 ko cover karti hai. Verify karo:</p>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Acl: IPTV-GROUPS, Static
    RP: 2.2.2.2 (?)
Acl: CLASS-GROUPS, Static
    RP: 3.3.3.3 (?)</span></pre>
<p>Aur class group ka shared tree R2 par nahi, R3 par baithta hai:</p>
<pre class="out">R4#show ip mroute 239.20.1.1

(*, 239.20.1.1), 00:00:36/00:02:24, <span class="hl">RP 3.3.3.3</span>, flags: SJC
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.4.1
  Outgoing interface list:
    GigabitEthernet0/3, Forward/Sparse, 00:00:36/00:02:24</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Do group ranges ke liye do RPs">
<rect x="20" y="85" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1 + STUDIO</text>
<rect x="270" y="15" width="130" height="50" rx="8" fill="#fde68a"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="12">R2 RP 2.2.2.2</text><text x="335" y="54" text-anchor="middle" class="svg-muted" font-size="12">239.10.0.0/16 IPTV</text>
<rect x="270" y="155" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="176" text-anchor="middle" class="svg-ink" font-size="12">R3 RP 3.3.3.3</text><text x="335" y="194" text-anchor="middle" class="svg-muted" font-size="12">239.20.0.0/16 classes</text>
<rect x="520" y="85" width="100" height="50" rx="8" fill="#bae6fd"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4 + VIEWER</text>
<line x1="120" y1="95" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="270" y2="175" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="45" x2="520" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="175" x2="520" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek core, do RPs: rp-address line par ACL decide karta hai ki kaunse groups kaunse RP ke paas jaate hain.</p></div>

<h3>Agar do lines ek hi group ko match karein?</h3>
<p>Agar do <code>rp-address</code> lines ek group cover karein (jaise ek bina ACL aur ek ACL ke saath), to router <b>sabse lambi matching group range</b> wali entry use karta hai; range barabar ho to RP address jo zyada ho woh jeetta hai. Chapter 5 poora order deta hai. Abhi ke liye, overlaps tab tak mat rakho jab tak chahiye na ho.</p>

<h3>Override keyword</h3>
<p>Static RP ki priority aam taur par sabse <b>kam</b> hoti hai: agar router Auto-RP ya BSR se bhi RP seekhe, to seekha hua jeetta hai aur static line sirf fallback hai. Kabhi yeh aapki chahat ka ulta hota hai, jaise migration ya test ke dauraan. Keyword <code>override</code> is router ke liye ise ulat deta hai:</p>
<pre class="code">ip pim rp-address 9.9.9.9 TEST-GROUPS override</pre>
<p>Ab yeh router <code>TEST-GROUPS</code> ke groups ke liye 9.9.9.9 use karta hai chahe Auto-RP ya BSR koi aur RP offer kare. Baaki routers par asar nahi padta, isi wajah se <code>override</code> khatarnaak hai: ek bhoola hua line ek router ko baaki sab se disagree karwa deta hai aur uske receivers chupchaap receive karna band kar dete hain.</p>

<div class="note"><p><b>Junos note.</b> Junos par static RP <code>protocols pim rp static</code> ke neeche configure hota hai, group range usi line par likhi jaati hai. Range wahi kaam karti hai jo hamara ACL karta hai.</p>
<pre class="code">set protocols pim rp static address 2.2.2.2 group-ranges 239.10.0.0/16
set protocols pim rp static address 3.3.3.3 group-ranges 239.20.0.0/16
set protocols pim interface all mode sparse</pre></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Alag routers par ACL ka content alag: R4 sochta hai ki 239.20.1.1 RP 3.3.3.3 ka hai jabki R1 sochta hai ki uska koi RP nahi. (2) RP loopback par <code>ip pim sparse-mode</code> bhool jaana. (3) Galat wildcard: <code>0.0.255.255</code> versus subnet mask <code>255.255.0.0</code>; ACL wildcard bits use karta hai, mask ka ulta.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip pim rp-address</code> mein use hua standard ACL <i>group</i> ko match karta hai, source ko nahi. <code>deny</code> line un groups ko RP se bahar kar deti hai. Jo groups kisi line mein nahi aate unka koi RP nahi hota, aur unke <code>(*,G)</code> mein <code>RP 0.0.0.0</code> dikhta hai.</p></div>

<div class="scn"><h4>Lab 1 walk-through: do RPs, ek core</h4><p><b>mq-rp-acl-ranges</b> mein aap upar wala design hi banate ho. Pehle chaaron routers par dono ACLs aur dono rp-address lines banao. Phir VIEWER se 239.10.1.1 aur 239.20.1.1 join karwao aur STUDIO se bhejo. R2 aur R3 se jawab padho: (*,239.10.1.1) entry R2 par hai, (*,239.20.1.1) entry R3 par. Aakhri task exam range 239.30.0.0/16 jodta hai, har router par CLASS-GROUPS ACL mein ek <code>permit</code> line jod kar, naya RP line nahi.</p><p><b>Seekh:</b> naya group range existing RP ke paas le jaane ke liye aap ACL edit karte ho, RP statement nahi.</p></div>

<div class="iv"><p class="q">"Static configuration se do group ranges ko do alag RPs kaise doge?"</p><p>Strong answer: har range ke liye ek standard ACL banao aur har RP ke liye ek <code>ip pim rp-address &lt;rp&gt; &lt;acl&gt;</code> line jodo, har router par identical. Batao ki ranges overlap hon to longest match jeetta hai, <code>override</code> learned RPs ko hara deta hai, aur aap <code>show ip pim rp mapping</code> aur <code>show ip mroute</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static RP: <code>ip pim rp-address &lt;ip&gt; [acl] [override]</code>, har router par same.</li>
<li>RP address ke liye loopback use karo, IGP mein advertise karo, us par PIM sparse mode lagao.</li>
<li>Line par standard ACL groups chunta hai; bina ACL ke line 224.0.0.0/4 cover karti hai.</li>
<li>Static fallback hai jab tak <code>override</code> use na ho.</li>
<li>Alag routers par inconsistent lines static RP ka number one fault hai.</li>
</ul></div>
`}};export{e as default};