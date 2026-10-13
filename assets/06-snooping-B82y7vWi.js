var e={id:`snooping`,h:{en:`Layer 2: why switches flood multicast, and IGMP snooping`,hi:`Layer 2: switches multicast ko flood kyun karte hain, aur IGMP snooping`},body:{en:`
<p>Everything so far happened at Layer 3, on the router. But between the router and the receivers there is usually a switch, and a switch does not read IP. This chapter explains what a plain switch does with a multicast stream, why that is a problem, and how <b>IGMP snooping</b> fixes it. <b>Note:</b> the lab simulator in this course does not run IGMP snooping, so this chapter and the next use written examples of switch output from a Catalyst-class switch, and no lab task depends on them.</p>

<h3>Why a plain switch floods multicast</h3>
<p>A switch builds its MAC table from <b>source</b> addresses: when frame arrives from MAC A on port 3, it learns "A lives on port 3". A multicast group MAC such as <code>01:00:5e:14:01:01</code> is never a source address, so it never enters the table. For every unknown destination a switch does the same thing: it <b>floods</b> the frame to every port of the VLAN. A multicast stream is therefore treated like an unknown-destination frame.</p>
<div class="eg"><p><b>Worked example.</b> The hostel VLAN has 48 ports. Two students watch a 4 Mbps lecture. Without snooping the switch sends 4 Mbps to all 48 ports: 46 of them are uninterested PCs, printers and access points. A 100 Mbps Wi-Fi access point with 30 phones attached can lose a large part of its capacity to a video nobody asked for. With snooping, 4 Mbps goes to two ports plus the router port.</p></div>

<h3>What IGMP snooping does</h3>
<p>The switch <b>listens</b> to the IGMP messages that pass through it (it does not take part, it only reads). From them it builds a table of (VLAN, group) to a list of ports. Then multicast frames for that group go only to the member ports and to the <b>multicast-router (mrouter) ports</b>.</p>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="IGMP snooping tables">
<rect x="10" y="85" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="11">querier, DR</text>
<rect x="230" y="55" width="170" height="120" rx="10" fill="#bae6fd"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="14">SW1  VLAN 20</text>
<text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="12">239.20.1.1 : Gi1/0/2, Gi1/0/3</text><text x="315" y="130" text-anchor="middle" class="svg-ink" font-size="12">mrouter : Gi1/0/1</text><text x="315" y="152" text-anchor="middle" class="svg-muted" font-size="11">table learned from IGMP</text>
<rect x="510" y="10" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="37" text-anchor="middle" class="svg-ink" font-size="13">PC1 member</text>
<rect x="510" y="85" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC2 member</text>
<rect x="510" y="170" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="570" y="197" text-anchor="middle" class="svg-ink" font-size="13">PC3 not a member</text>
<line x1="120" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><text x="175" y="106" text-anchor="middle" class="svg-accent" font-size="11">query</text>
<line x1="400" y1="85" x2="510" y2="32" stroke="#64748b" stroke-width="2"/><line x1="400" y1="112" x2="510" y2="107" stroke="#64748b" stroke-width="2"/><line x1="400" y1="150" x2="510" y2="192" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="455" y="222" text-anchor="middle" class="svg-muted" font-size="11">no stream</text>
</svg><p class="cap">Reports from PC1 and PC2 create the member ports. Queries from R1 mark the mrouter port. PC3 gets nothing.</p></div>
<ul>
<li><b>Member ports.</b> A port that received an IGMP report for G becomes a member of G, with an age timer. It is refreshed by every new report.</li>
<li><b>Mrouter ports.</b> A port on which the switch hears IGMP queries or PIM hellos. All groups are forwarded there, because the router must see the stream and other hosts' reports. You can also define one by hand.</li>
<li><b>Forwarding.</b> A frame for G goes to G's member ports and to the mrouter ports. Frames for the 224.0.0.0/24 range (control traffic) are still flooded.</li>
<li><b>Leave handling.</b> When a v2 host sends a leave, the switch does not remove the port at once: it sends a group-specific query out of that port, and removes the port if no report comes back (about two seconds). <b>Immediate leave</b> skips the query; it is safe only when exactly one host sits behind the port.</li>
</ul>

<h3>Report suppression at the switch</h3>
<p>With IGMPv1 and v2, the switch forwards only <b>one</b> report per group per query interval toward the router and holds back the others. The router needs to hear one member, and the switch saves control traffic. This is why <code>show ip igmp groups</code> on the router shows a single Last Reporter even when ten hosts joined. For IGMPv3, reports are not suppressed: each carries different source lists, and the switch must pass them all.</p>

<h3>Configuration on a Catalyst-class switch (IOS XE)</h3>
<p>On most switches snooping is enabled globally and on every VLAN by default. The commands exist for tuning:</p>
<pre class="code">ip igmp snooping                                           <span class="c">! global, on by default</span>
ip igmp snooping vlan 20                                   <span class="c">! per VLAN, on by default</span>
ip igmp snooping vlan 20 immediate-leave                   <span class="c">! one host per port only</span>
ip igmp snooping vlan 20 mrouter interface GigabitEthernet1/0/1   <span class="c">! static router port</span>
ip igmp snooping vlan 20 static 239.20.1.50 interface GigabitEthernet1/0/5</pre>

<h3>Verification (illustrative output, not run in the lab simulator)</h3>
<pre class="out">SW1#show ip igmp snooping groups vlan 20
Vlan      Group                  Type        Version     Port List
-----------------------------------------------------------------------
20        239.20.1.1             igmp        v2          <span class="hl">Gi1/0/2, Gi1/0/3</span>

SW1#show ip igmp snooping mrouter
Vlan    ports
----    -----
  20    <span class="hl">Gi1/0/1(dynamic)</span>

SW1#show ip igmp snooping querier vlan 20
Vlan      IP Address               IGMP Version   Port
-------------------------------------------------------------
20        10.20.1.1                v2             Gi1/0/1</pre>
<p>Read it like this. <b>groups</b> lists the member ports per group: the stream goes to Gi1/0/2 and Gi1/0/3 only. <b>mrouter</b> shows where the router sits: Gi1/0/1, learned dynamically from queries. <b>querier</b> shows who sends queries in the VLAN. If PC3 on Gi1/0/4 were not in the port list, it would receive no stream.</p>

<div class="note"><p><b>Junos note.</b> On an EX switch snooping is enabled per VLAN:</p>
<pre class="code">set protocols igmp-snooping vlan HOSTEL
set protocols igmp-snooping vlan HOSTEL interface ge-0/0/0.0 multicast-router-interface
set protocols igmp-snooping vlan HOSTEL interface ge-0/0/2.0 immediate-leave</pre>
<pre class="out">lab@SW1&gt; show igmp snooping membership
Instance: default-switch
Vlan: HOSTEL
Learning-Domain: default
Multicast router interfaces: <span class="hl">ge-0/0/0.0 (dynamic)</span>
Interface: <span class="hl">ge-0/0/2.0</span>, Groups: 1
    Group: 239.20.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.20.1.11
        Group timeout:     260 Type: Dynamic</pre>
<p>Group mode Exclude with source 0.0.0.0 is the IGMPv2-style any-source join. Junos uses 125 s as the default query interval, so its group timeout is 260 s.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting snooping to route multicast (it works inside one VLAN only; routing is PIM). Expecting snooping to reduce the load of 224.0.0.x control groups (they are always flooded). Using immediate leave on a port with a hub or an unmanaged switch behind it (the second host loses the stream when the first one leaves).</p></div>
<div class="exam"><p><b>Exam trap.</b> Snooping learns members from reports and router ports from queries or PIM hellos. IGMP queries are flooded to all ports of the VLAN, while reports are sent only toward the mrouter ports. A snooping table is per VLAN. Link-local groups are never filtered.</p></div>

<div class="scn"><h4>Wi-Fi that died during every lecture</h4><p>A college's hostel Wi-Fi access points slowed to a crawl at 6 pm, exactly when the evening lecture started. The switch carried the 5 Mbps stream to every port of the VLAN, including the access point uplinks. After enabling snooping (it had been disabled globally during an old migration) the group list showed only the two lecture-hall encoders' ports plus the router, and the Wi-Fi recovered the same evening.</p><p><b>Lesson:</b> a stream that nobody asked for can still hurt the weakest port on the VLAN.</p></div>

<div class="iv"><p class="q">"What does IGMP snooping do, and what does it not do?"</p><p>Strong answer: it listens to IGMP reports and queries so the switch forwards a group only to member ports and mrouter ports instead of flooding the VLAN. It builds the table per VLAN and uses report suppression for v1 and v2. It does not route, it is not PIM, it does not filter link-local groups, and without a querier its entries age out. I verify with the snooping groups, mrouter and querier commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch floods multicast because group MACs are never learned as sources.</li>
<li>Snooping builds a (VLAN, group) to ports table from IGMP reports, plus mrouter ports from queries and PIM hellos.</li>
<li>Switch-level report suppression is why the router sees one reporter per group.</li>
<li>Immediate leave is safe only with one host per port.</li>
<li>Snooping is Layer 2, per VLAN; it is not routing and it never filters 224.0.0.0/24.</li>
</ul></div>
`,hi:`
<p>Ab tak sab kuch Layer 3 par, router par hua. Par router aur receivers ke beech aam taur par ek switch hota hai, aur switch IP nahi padhta. Yeh chapter batata hai ki plain switch multicast stream ke saath kya karta hai, yeh problem kyun hai, aur <b>IGMP snooping</b> ise kaise theek karta hai. <b>Note:</b> is course ka lab simulator IGMP snooping nahi chalata, isliye yeh chapter aur agla Catalyst-class switch ke output ke likhe hue examples use karte hain, aur koi lab task inpar depend nahi karta.</p>

<h3>Plain switch multicast ko flood kyun karta hai</h3>
<p>Switch apni MAC table <b>source</b> addresses se banata hai: jab port 3 par MAC A se frame aata hai, woh seekhta hai "A port 3 par rehta hai". Multicast group MAC jaise <code>01:00:5e:14:01:01</code> kabhi source address nahi hota, isliye table mein kabhi nahi aata. Har unknown destination ke saath switch ek hi kaam karta hai: frame ko VLAN ke har port par <b>flood</b> karta hai. Isliye multicast stream ko unknown-destination frame ki tarah treat kiya jaata hai.</p>
<div class="eg"><p><b>Worked example.</b> Hostel VLAN mein 48 ports hain. Do students 4 Mbps ka lecture dekh rahe hain. Snooping ke bina switch 4 Mbps saare 48 ports par bhejta hai: 46 ports aise PCs, printers aur access points ke hain jinhe kuch nahi chahiye. 30 phones wale 100 Mbps Wi-Fi access point ki capacity ka bada hissa aisi video kha sakti hai jo kisi ne maangi hi nahi. Snooping ke saath 4 Mbps do ports aur router port par jaata hai.</p></div>

<h3>IGMP snooping kya karta hai</h3>
<p>Switch jo IGMP messages uske through guzarte hain unhe <b>sunta</b> hai (woh hissa nahi leta, sirf padhta hai). Unse woh (VLAN, group) se ports ki list ka table banata hai. Phir G ke multicast frames sirf member ports aur <b>multicast-router (mrouter) ports</b> par jaate hain.</p>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="IGMP snooping tables">
<rect x="10" y="85" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="65" y="112" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="65" y="130" text-anchor="middle" class="svg-muted" font-size="11">querier, DR</text>
<rect x="230" y="55" width="170" height="120" rx="10" fill="#bae6fd"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="14">SW1  VLAN 20</text>
<text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="12">239.20.1.1 : Gi1/0/2, Gi1/0/3</text><text x="315" y="130" text-anchor="middle" class="svg-ink" font-size="12">mrouter : Gi1/0/1</text><text x="315" y="152" text-anchor="middle" class="svg-muted" font-size="11">table IGMP se seekhi</text>
<rect x="510" y="10" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="37" text-anchor="middle" class="svg-ink" font-size="13">PC1 member</text>
<rect x="510" y="85" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC2 member</text>
<rect x="510" y="170" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="570" y="197" text-anchor="middle" class="svg-ink" font-size="13">PC3 member nahi</text>
<line x1="120" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><text x="175" y="106" text-anchor="middle" class="svg-accent" font-size="11">query</text>
<line x1="400" y1="85" x2="510" y2="32" stroke="#64748b" stroke-width="2"/><line x1="400" y1="112" x2="510" y2="107" stroke="#64748b" stroke-width="2"/><line x1="400" y1="150" x2="510" y2="192" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="455" y="222" text-anchor="middle" class="svg-muted" font-size="11">stream nahi</text>
</svg><p class="cap">PC1 aur PC2 ke reports member ports banate hain. R1 ki queries mrouter port mark karti hain. PC3 ko kuch nahi milta.</p></div>
<ul>
<li><b>Member ports.</b> Jis port par G ka IGMP report aaya woh G ka member ban jaata hai, age timer ke saath. Har naye report se refresh hota hai.</li>
<li><b>Mrouter ports.</b> Jis port par switch IGMP queries ya PIM hellos sunta hai. Saare groups wahan forward hote hain, kyunki router ko stream aur doosre hosts ke reports dikhne chahiye. Aap ise hath se bhi define kar sakte ho.</li>
<li><b>Forwarding.</b> G ka frame G ke member ports aur mrouter ports par jaata hai. 224.0.0.0/24 range (control traffic) ke frames phir bhi flood hote hain.</li>
<li><b>Leave handling.</b> Jab v2 host leave bhejta hai, switch port ko turant nahi hatata: woh us port se group-specific query bhejta hai, aur report na aaye to port hata deta hai (lagbhag do second). <b>Immediate leave</b> query skip karta hai; yeh tabhi safe hai jab port ke peeche theek ek host ho.</li>
</ul>

<h3>Switch par report suppression</h3>
<p>IGMPv1 aur v2 ke saath switch har query interval mein har group ka sirf <b>ek</b> report router ki taraf forward karta hai aur baaki rok leta hai. Router ko ek member sunna kaafi hai, aur switch control traffic bachata hai. Isiliye router par <code>show ip igmp groups</code> mein das hosts joined hone par bhi ek hi Last Reporter dikhta hai. IGMPv3 mein reports suppress nahi hote: har ek ki source list alag hoti hai, aur switch ko sab pass karne padte hain.</p>

<h3>Catalyst-class switch par configuration (IOS XE)</h3>
<p>Zyadatar switches par snooping global aur har VLAN par default mein on hota hai. Tuning ke liye commands hain:</p>
<pre class="code">ip igmp snooping                                           <span class="c">! global, default on</span>
ip igmp snooping vlan 20                                   <span class="c">! per VLAN, default on</span>
ip igmp snooping vlan 20 immediate-leave                   <span class="c">! sirf ek host per port</span>
ip igmp snooping vlan 20 mrouter interface GigabitEthernet1/0/1   <span class="c">! static router port</span>
ip igmp snooping vlan 20 static 239.20.1.50 interface GigabitEthernet1/0/5</pre>

<h3>Verification (illustrative output, lab simulator mein nahi chalta)</h3>
<pre class="out">SW1#show ip igmp snooping groups vlan 20
Vlan      Group                  Type        Version     Port List
-----------------------------------------------------------------------
20        239.20.1.1             igmp        v2          <span class="hl">Gi1/0/2, Gi1/0/3</span>

SW1#show ip igmp snooping mrouter
Vlan    ports
----    -----
  20    <span class="hl">Gi1/0/1(dynamic)</span>

SW1#show ip igmp snooping querier vlan 20
Vlan      IP Address               IGMP Version   Port
-------------------------------------------------------------
20        10.20.1.1                v2             Gi1/0/1</pre>
<p>Aise padho. <b>groups</b> har group ke member ports dikhata hai: stream sirf Gi1/0/2 aur Gi1/0/3 par jaati hai. <b>mrouter</b> dikhata hai ki router kahan hai: Gi1/0/1, queries se dynamically seekha. <b>querier</b> dikhata hai ki VLAN mein queries kaun bhejta hai. Agar Gi1/0/4 par PC3 port list mein nahi hota, to use stream nahi milti.</p>

<div class="note"><p><b>Junos note.</b> EX switch par snooping per VLAN enable hoti hai:</p>
<pre class="code">set protocols igmp-snooping vlan HOSTEL
set protocols igmp-snooping vlan HOSTEL interface ge-0/0/0.0 multicast-router-interface
set protocols igmp-snooping vlan HOSTEL interface ge-0/0/2.0 immediate-leave</pre>
<pre class="out">lab@SW1&gt; show igmp snooping membership
Instance: default-switch
Vlan: HOSTEL
Learning-Domain: default
Multicast router interfaces: <span class="hl">ge-0/0/0.0 (dynamic)</span>
Interface: <span class="hl">ge-0/0/2.0</span>, Groups: 1
    Group: 239.20.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.20.1.11
        Group timeout:     260 Type: Dynamic</pre>
<p>Group mode Exclude aur source 0.0.0.0 IGMPv2-style any-source join hai. Junos ka default query interval 125 s hai, isliye uska group timeout 260 s hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Snooping se multicast routing ki ummeed (yeh sirf ek VLAN ke andar kaam karta hai; routing PIM karta hai). Snooping se 224.0.0.x control groups ka load kam hone ki ummeed (woh hamesha flood hote hain). Immediate leave aise port par lagana jiske peeche hub ya unmanaged switch ho (pehla host leave kare to doosre ki stream chali jaati hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> Snooping members reports se seekhta hai aur router ports queries ya PIM hellos se. IGMP queries VLAN ke saare ports par flood hoti hain, jabki reports sirf mrouter ports ki taraf jaate hain. Snooping table per VLAN hoti hai. Link-local groups kabhi filter nahi hote.</p></div>

<div class="scn"><h4>Lecture ke dauran Wi-Fi ka mar jaana</h4><p>Ek college ke hostel Wi-Fi access points shaam 6 baje dheere ho jaate the, theek jab evening lecture shuru hota tha. Switch 5 Mbps stream VLAN ke har port par bhej raha tha, access point uplinks samet. Snooping enable karne ke baad (purani migration ke dauran global level par disable ho gayi thi) group list mein sirf do lecture-hall encoders ke ports aur router dikhe, aur Wi-Fi usi shaam theek ho gaya.</p><p><b>Lesson:</b> jis stream ko kisi ne maanga nahi woh bhi VLAN ke sabse kamzor port ko nuksaan pahuncha sakti hai.</p></div>

<div class="iv"><p class="q">"IGMP snooping kya karta hai, aur kya nahi karta?"</p><p>Strong answer: yeh IGMP reports aur queries sunta hai taaki switch group ko VLAN flood karne ke bajaye sirf member ports aur mrouter ports par forward kare. Table per VLAN banti hai aur v1/v2 ke liye report suppression use hota hai. Yeh routing nahi karta, PIM nahi hai, link-local groups filter nahi karta, aur querier ke bina entries age out ho jaati hain. Main snooping groups, mrouter aur querier commands se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch multicast flood karta hai kyunki group MACs kabhi source ke roop mein seekhe nahi jaate.</li>
<li>Snooping IGMP reports se (VLAN, group) se ports ki table banata hai, aur queries tatha PIM hellos se mrouter ports.</li>
<li>Switch ka report suppression isliye hai ki router ko har group ka ek reporter dikhta hai.</li>
<li>Immediate leave tabhi safe hai jab port par ek host ho.</li>
<li>Snooping Layer 2 hai, per VLAN; yeh routing nahi hai aur 224.0.0.0/24 ko kabhi filter nahi karta.</li>
</ul></div>
`}};export{e as default};