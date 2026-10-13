var e={id:`igmp-snooping`,h:{en:`IGMP snooping: keeping multicast off ports that did not ask`,hi:`IGMP snooping: multicast ko un ports se door rakhna jinhone maanga nahi`},body:{en:`
<p>A Layer 2 switch has no idea what a multicast group is. It sees a frame to a destination MAC that it never learns as a source, so it does what it does for any unknown destination: it <b>floods</b> it to every port in the VLAN. One 4 Mbit/s class video then lands on every trainee's PC, printer and phone, even if nobody asked. <b>IGMP snooping</b> teaches the switch to listen to the IGMP conversation between hosts and the router, and to forward each group only where it is wanted.</p>

<h3>What a snooping switch learns</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IGMP snooping">
<rect x="250" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">VLAN TRAINING</text>
<rect x="20" y="85" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">R3 (querier)</text>
<rect x="500" y="10" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="13">PC1 joined</text>
<rect x="500" y="90" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC2 joined</text>
<rect x="500" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC3 silent</text>
<line x1="140" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><text x="195" y="97" text-anchor="middle" class="svg-accent" font-size="11">mrouter port</text>
<line x1="390" y1="90" x2="500" y2="30" stroke="#64748b" stroke-width="2"/><line x1="390" y1="108" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="500" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="450" y="160" text-anchor="middle" class="svg-muted" font-size="12">no stream</text>
</svg><p class="cap">The switch builds a (VLAN, group) to port list from the reports it hears.</p></div>
<ul>
<li><b>Member ports.</b> A port where a host sent an IGMP report for a group becomes a member port for that group, with a timer.</li>
<li><b>Multicast-router ports (mrouter).</b> A port where the switch hears IGMP queries or PIM hellos. All groups are also forwarded there, so the router receives the stream and the reports from other hosts. You can also define one statically.</li>
<li><b>Forwarding.</b> A group frame goes to the member ports for that group plus the mrouter ports. Link-local groups in 224.0.0.0/24 are still flooded.</li>
<li><b>Leave.</b> When a v2 host sends Leave, the switch checks for other members (group-specific query) before removing the port. <code>immediate-leave</code> skips that check and is safe only when one host sits on the port.</li>
</ul>

<h3>Configuring and verifying on SW1</h3>
<p>In the lab SW1 sits between router R3 and three PCs, all in VLAN TRAINING. R3 already queries. Enabling snooping on that one VLAN is one line:</p>
<pre class="code">set protocols igmp-snooping vlan TRAINING
<span class="c"># optional</span>
set protocols igmp-snooping vlan TRAINING interface ge-0/0/0.0 multicast-router-interface
set protocols igmp-snooping vlan TRAINING interface ge-0/0/1.0 immediate-leave
set protocols igmp-snooping vlan TRAINING l2-querier source-address 10.61.40.254</pre>
<p>After PC1 and PC2 run <code>join 239.61.1.1</code>:</p>
<pre class="out">lab@SW1&gt; show igmp snooping membership
Instance: default-switch
Vlan: TRAINING
Learning-Domain: default
Multicast router interfaces: <span class="hl">ge-0/0/0.0 (dynamic)</span>
Interface: <span class="hl">ge-0/0/1.0</span>, Groups: 1
    Group: 239.61.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.61.40.21
        Group timeout:     260 Type: Dynamic
Interface: <span class="hl">ge-0/0/2.0</span>, Groups: 1
    Group: 239.61.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.61.40.22
        Group timeout:     260 Type: Dynamic</pre>
<p>Read it as a table. The mrouter interface is ge-0/0/0.0 (toward R3, learned dynamically). Member ports are ge-0/0/1.0 (PC1) and ge-0/0/2.0 (PC2). PC3 on ge-0/0/3.0 is absent, so it will not receive the stream. The router side confirms it heard the join:</p>
<pre class="out">lab@R3&gt; show pim join extensive
Group: 239.61.1.1
    Source: *
    RP: 10.61.255.2
    Flags: sparse,rptree,wildcard
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.61.23.1
    Upstream state: Join to RP
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.61.40.1 State: Join Flags: SRW Timeout: Infinity</pre>
<p>When the source later sends 10 packets, R3 holds a forwarding entry <code>(10.61.10.50, 239.61.1.1)</code> toward ge-0/0/1.0, SW1 delivers to its two member ports, and PC3 sees nothing.</p>

<h3>The querier problem</h3>
<p>Snooping depends on someone sending queries. If the VLAN has no multicast router (a pure Layer 2 VLAN, for example for an isolated video system), nobody queries, hosts stay silent after their first report, and the entries age out. Configure an <b>L2 querier</b> on a switch in that VLAN, or give an IRB interface PIM and IGMP. Where several switches are present, only one querier should be elected (the lowest address wins).</p>

<div class="eg"><p><b>Worked example.</b> A VLAN has 40 ports with one PC subscribed to a 6 Mbit/s stream. Without snooping the switch sends 6 Mbit/s out of all 40 ports: 240 Mbit/s of switching and 39 unused access links carrying traffic. With snooping it sends 6 Mbit/s to the subscriber and to the uplink toward the router only.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling snooping with no querier. Reports stop after the first interval, the switch drops entries and the stream stops after a few minutes. Another mistake is statically marking the wrong port as mrouter, which makes the switch send all groups to a host port.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGMP snooping works inside a VLAN at Layer 2; it does not create multicast routing and it is not PIM. Frames for 224.0.0.0/24 are always flooded, and the mrouter port always receives all groups.</p></div>

<div class="scn"><h4>Printers with a video habit</h4><p>A school ran a live lesson to 60 PCs. The IT room's thin printers began to reboot every lesson: the switch flooded the multicast video to their ports, and the small NICs choked. After enabling IGMP snooping on the class VLAN, <code>show igmp snooping membership</code> listed only the PC ports and the router uplink, and the printers stopped rebooting.</p><p><b>Lesson:</b> snooping protects the weakest device on the VLAN, not just the bandwidth.</p></div>

<div class="iv"><p class="q">"What does IGMP snooping do and what are its limits?"</p><p>It listens to IGMP reports and queries so the switch forwards a group only to member ports and mrouter ports. It needs a querier in the VLAN, it does not route, and link-local groups are still flooded. I verify with show igmp snooping membership.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Without snooping a switch floods multicast to every port in the VLAN.</li>
<li>Snooping builds member ports from IGMP reports and mrouter ports from queries and PIM hellos.</li>
<li>One line, set protocols igmp-snooping vlan NAME, enables it on a VLAN.</li>
<li>A VLAN without a router needs an L2 querier.</li>
<li>Check with show igmp snooping membership, and on the router with show pim join.</li>
</ul></div>
`,hi:`
<p>Layer 2 switch ko multicast group ka kuch pata nahi hota. Use ek aisa destination MAC wala frame dikhta hai jo woh source ke roop mein kabhi seekhta nahi, isliye woh wahi karta hai jo har unknown destination ke saath karta hai: VLAN ke har port par <b>flood</b>. Phir 4 Mbit/s ka ek class video har trainee ke PC, printer aur phone par pahunchta hai, chahe kisi ne maanga na ho. <b>IGMP snooping</b> switch ko sikhata hai ki hosts aur router ke beech IGMP baatcheet suno, aur har group ko sirf wahan bhejo jahan chahiye.</p>

<h3>Snooping switch kya seekhta hai</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IGMP snooping">
<rect x="250" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">VLAN TRAINING</text>
<rect x="20" y="85" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">R3 (querier)</text>
<rect x="500" y="10" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="13">PC1 joined</text>
<rect x="500" y="90" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC2 joined</text>
<rect x="500" y="170" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="560" y="195" text-anchor="middle" class="svg-ink" font-size="13">PC3 chup</text>
<line x1="140" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><text x="195" y="97" text-anchor="middle" class="svg-accent" font-size="11">mrouter port</text>
<line x1="390" y1="90" x2="500" y2="30" stroke="#64748b" stroke-width="2"/><line x1="390" y1="108" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="500" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="450" y="160" text-anchor="middle" class="svg-muted" font-size="12">stream nahi</text>
</svg><p class="cap">Switch sune hue reports se (VLAN, group) se port list ka table banata hai.</p></div>
<ul>
<li><b>Member ports.</b> Jis port par host ne group ka IGMP report bheja woh us group ka member port ban jaata hai, timer ke saath.</li>
<li><b>Multicast-router ports (mrouter).</b> Jis port par switch IGMP queries ya PIM hellos sunta hai. Saare groups wahan bhi forward hote hain, taaki router ko stream aur doosre hosts ke reports milte rahein. Aap ise static bhi define kar sakte ho.</li>
<li><b>Forwarding.</b> Group frame us group ke member ports aur mrouter ports par jaata hai. 224.0.0.0/24 ke link-local groups phir bhi flood hote hain.</li>
<li><b>Leave.</b> Jab v2 host Leave bhejta hai, switch port hatane se pehle doosre members ke liye check karta hai (group-specific query). <code>immediate-leave</code> yeh check chhod deta hai aur tabhi safe hai jab port par ek hi host ho.</li>
</ul>

<h3>SW1 par configure aur verify karna</h3>
<p>Lab mein SW1 router R3 aur teen PCs ke beech hai, sab VLAN TRAINING mein. R3 pehle se query karta hai. Us ek VLAN par snooping on karna ek line hai:</p>
<pre class="code">set protocols igmp-snooping vlan TRAINING
<span class="c"># optional</span>
set protocols igmp-snooping vlan TRAINING interface ge-0/0/0.0 multicast-router-interface
set protocols igmp-snooping vlan TRAINING interface ge-0/0/1.0 immediate-leave
set protocols igmp-snooping vlan TRAINING l2-querier source-address 10.61.40.254</pre>
<p>PC1 aur PC2 ke <code>join 239.61.1.1</code> chalane ke baad:</p>
<pre class="out">lab@SW1&gt; show igmp snooping membership
Instance: default-switch
Vlan: TRAINING
Learning-Domain: default
Multicast router interfaces: <span class="hl">ge-0/0/0.0 (dynamic)</span>
Interface: <span class="hl">ge-0/0/1.0</span>, Groups: 1
    Group: 239.61.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.61.40.21
        Group timeout:     260 Type: Dynamic
Interface: <span class="hl">ge-0/0/2.0</span>, Groups: 1
    Group: 239.61.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.61.40.22
        Group timeout:     260 Type: Dynamic</pre>
<p>Ise table ki tarah padho. Mrouter interface ge-0/0/0.0 hai (R3 ki taraf, dynamically seekha). Member ports ge-0/0/1.0 (PC1) aur ge-0/0/2.0 (PC2) hain. ge-0/0/3.0 par PC3 absent hai, isliye use stream nahi milegi. Router side confirm karta hai ki usne join suna:</p>
<pre class="out">lab@R3&gt; show pim join extensive
Group: 239.61.1.1
    Source: *
    RP: 10.61.255.2
    Flags: sparse,rptree,wildcard
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.61.23.1
    Upstream state: Join to RP
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.61.40.1 State: Join Flags: SRW Timeout: Infinity</pre>
<p>Jab source baad mein 10 packets bhejta hai, R3 ke paas ge-0/0/1.0 ki taraf <code>(10.61.10.50, 239.61.1.1)</code> ka forwarding entry hota hai, SW1 apne do member ports par deliver karta hai, aur PC3 ko kuch nahi dikhta.</p>

<h3>Querier ki problem</h3>
<p>Snooping is par nirbhar hai ki koi queries bheje. Agar VLAN mein multicast router nahi hai (pure Layer 2 VLAN, jaise isolated video system ke liye), to koi query nahi karta, hosts pehle report ke baad chup rehte hain, aur entries age out ho jaati hain. Us VLAN ke kisi switch par <b>L2 querier</b> configure karo, ya IRB interface ko PIM aur IGMP do. Kai switches hon to sirf ek querier elect hona chahiye (lowest address jeetta hai).</p>

<div class="eg"><p><b>Worked example.</b> VLAN mein 40 ports hain aur ek PC 6 Mbit/s stream par subscribed hai. Snooping ke bina switch 6 Mbit/s saare 40 ports se bhejta hai: 240 Mbit/s switching aur 39 unused access links par traffic. Snooping ke saath woh 6 Mbit/s sirf subscriber aur router ki taraf uplink ko bhejta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Querier ke bina snooping on karna. Pehle interval ke baad reports ruk jaate hain, switch entries drop kar deta hai aur kuch minutes baad stream ruk jaati hai. Ek aur galti: galat port ko static mrouter mark karna, jisse switch saare groups host port ko bhejne lagta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGMP snooping VLAN ke andar Layer 2 par kaam karta hai; yeh multicast routing nahi banata aur PIM nahi hai. 224.0.0.0/24 ke frames hamesha flood hote hain, aur mrouter port ko hamesha saare groups milte hain.</p></div>

<div class="scn"><h4>Video ki aadat wale printers</h4><p>Ek school ne 60 PCs ko live lesson chalaya. IT room ke patle printers har lesson mein reboot hone lage: switch multicast video unke ports par flood karta tha aur chhote NICs haar jaate the. Class VLAN par IGMP snooping on karne ke baad <code>show igmp snooping membership</code> ne sirf PC ports aur router uplink list kiye, aur printers reboot hona band ho gaye.</p><p><b>Lesson:</b> snooping VLAN ke sabse kamzor device ko bachata hai, sirf bandwidth ko nahi.</p></div>

<div class="iv"><p class="q">"IGMP snooping kya karta hai aur uski limits kya hain?"</p><p>Yeh IGMP reports aur queries sunta hai taaki switch group ko sirf member ports aur mrouter ports par forward kare. VLAN mein querier chahiye, yeh route nahi karta, aur link-local groups phir bhi flood hote hain. Main show igmp snooping membership se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snooping ke bina switch multicast ko VLAN ke har port par flood karta hai.</li>
<li>Snooping IGMP reports se member ports aur queries aur PIM hellos se mrouter ports banata hai.</li>
<li>Ek line, set protocols igmp-snooping vlan NAME, VLAN par ise on karti hai.</li>
<li>Router ke bina VLAN ko L2 querier chahiye.</li>
<li>show igmp snooping membership se check karo, aur router par show pim join se.</li>
</ul></div>
`}};export{e as default};