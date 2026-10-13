var e={id:`igmpv3-snooping`,h:{en:`IGMPv3 source filtering and IGMP snooping`,hi:`IGMPv3 source filtering aur IGMP snooping`},body:{en:`
<p>With IGMPv2 a viewer can say "I want channel 5". With IGMPv3 the viewer can say "I want channel 5, but <b>only from the Mumbai studio</b>", or "channel 5 from anyone <b>except</b> the test transmitter". That extra sentence, the source, is what makes Source-Specific Multicast possible. And on the switch below the router, IGMP snooping makes sure the channel reaches only the TVs that asked for it.</p>

<h3>IGMPv3 (RFC 3376)</h3>
<p>IGMPv3 adds <b>source filtering</b>. A host's report can carry a list of sources for each group, in one of two <b>filter modes</b>:</p>
<dl class="terms">
<dt>INCLUDE mode</dt><dd>"Send me group G only from these sources." INCLUDE {10.1.1.10} for 232.1.1.1 means only traffic from 10.1.1.10 is wanted. This is how a receiver asks for an <b>(S,G)</b> channel, and it is mandatory for <b>SSM</b> (chapter 11).</dd>
<dt>EXCLUDE mode</dt><dd>"Send me group G from every source except these." EXCLUDE with an empty list means "any source", which is the same as an IGMPv2 join.</dd>
</dl>
<p>Other changes you should know:</p>
<ul>
<li>v3 reports are sent to <b>224.0.0.22</b> (all IGMPv3-capable routers), not to the group address.</li>
<li><b>No report suppression</b>: every host reports its own state. The router can therefore track membership per host if it wants (explicit tracking), and fast leave becomes safe.</li>
<li>A new <b>group-and-source-specific query</b> lets the router check "does anyone still want G from S?"</li>
<li>One report can carry several group records, which reduces packets.</li>
<li><b>Backward compatibility</b>: a v3 router drops to the older behaviour for a group if it hears a v1 or v2 report for it. A v3 host behind a v2 querier falls back to v2 and loses the ability to name a source.</li>
</ul>
<pre class="code">interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3                <span class="c">! required on the receiver LAN for SSM</span></pre>
<pre class="out">R3# show ip igmp groups 232.1.1.1 detail
Interface:      GigabitEthernet0/0
Group:          232.1.1.1
<span class="hl">Flags:          SSM</span>
Uptime:         00:01:12
<span class="hl">Group mode:     INCLUDE</span>
Last reporter:  10.3.3.10
Source list size: 1
Source Address   Uptime    v3 Exp    CSR Exp   Fwd  Flags
<span class="hl">10.1.1.10        00:01:12  00:02:47  stopped   Yes  R</span></pre>

<table class="cmp">
<tr><th></th><th>IGMPv1</th><th>IGMPv2</th><th>IGMPv3</th></tr>
<tr><td>Report sent to</td><td>Group</td><td>Group</td><td>224.0.0.22</td></tr>
<tr><td>Leave</td><td>No (timeout)</td><td>Yes, to 224.0.0.2</td><td>Yes, a report that changes state</td></tr>
<tr><td>Querier election</td><td>By PIM DR</td><td>Lowest IP</td><td>Lowest IP</td></tr>
<tr><td>Report suppression</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td>Source filtering / SSM</td><td>No</td><td>No</td><td>Yes (INCLUDE / EXCLUDE)</td></tr>
</table>

<h3>The Layer 2 problem</h3>
<p>A classic switch learns unicast MACs from source addresses. A multicast MAC such as 01:00:5e:0a:0a:0a is never a source, so the switch never learns it and treats the frame like an unknown unicast: it <b>floods it to every port in the VLAN</b>. One 8 Mbps IPTV channel on a 48-port access switch reaches all 48 ports. Printers, phones and laptops all receive it, and wireless APs may push it into the air at a low data rate.</p>

<h3>IGMP snooping</h3>
<p><b>IGMP snooping</b> fixes this. The switch listens to (snoops) the IGMP messages passing through it, even though it is a Layer 2 device, and builds a table of which ports want which group:</p>
<ol>
<li>It finds the <b>multicast router ports</b> (mrouter ports) by seeing IGMP general queries or PIM hellos arriving on them.</li>
<li>When a host sends a report, the switch adds that host's port to the group's forwarding entry and forwards the report <b>only to mrouter ports</b>, not to other hosts.</li>
<li>Multicast data for the group is sent only to member ports plus mrouter ports.</li>
<li>On a Leave, the switch forwards it to the router and removes the port after the group-specific queries go unanswered, or at once with <b>immediate-leave</b> (safe only when one host sits behind each port).</li>
</ol>
<p>Snooping is <b>enabled by default</b> on Catalyst switches, globally and per VLAN.</p>
<pre class="code">ip igmp snooping                                  <span class="c">! default on</span>
ip igmp snooping vlan 10 immediate-leave
ip igmp snooping querier                          <span class="c">! for a VLAN with no multicast router</span></pre>
<pre class="out">SW1# show ip igmp snooping groups
Vlan      Group                 Type        Version     Port List
-----------------------------------------------------------------------
<span class="hl">10        239.10.10.10          igmp        v2          Gi1/0/5, Gi1/0/12, Gi1/0/48</span>

SW1# show ip igmp snooping mrouter
Vlan    ports
-------+------
<span class="hl">  10    Gi1/0/48(dynamic)</span></pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IGMP snooping">
<rect x="270" y="15" width="100" height="36" rx="6" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="230" y="95" width="180" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1 (snooping)</text>
<line x1="320" y1="51" x2="320" y2="95" stroke="#64748b" stroke-width="3"/><text x="330" y="78" class="svg-muted" font-size="12">mrouter Gi1/0/48</text>
<rect x="40" y="180" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="90" y="201" text-anchor="middle" class="svg-ink" font-size="12">PC joined</text>
<rect x="190" y="180" width="100" height="32" rx="6" fill="#e2e8f0"/><text x="240" y="201" text-anchor="middle" class="svg-muted" font-size="12">printer</text>
<rect x="340" y="180" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="390" y="201" text-anchor="middle" class="svg-ink" font-size="12">PC joined</text>
<rect x="490" y="180" width="100" height="32" rx="6" fill="#e2e8f0"/><text x="540" y="201" text-anchor="middle" class="svg-muted" font-size="12">phone</text>
<line x1="280" y1="135" x2="90" y2="180" stroke="#64748b" stroke-width="3"/><line x1="340" y1="135" x2="390" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="135" x2="240" y2="180" stroke="#64748b" stroke-dasharray="4 4"/><line x1="360" y1="135" x2="540" y2="180" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">With snooping, the stream goes only to joined ports and the mrouter port; dashed ports receive nothing.</p></div>

<h3>The missing querier</h3>
<p>Snooping entries are kept alive by hosts answering queries. In a VLAN with <b>no multicast router</b> (for example a pure Layer 2 IPTV VLAN), nobody sends queries, entries age out after a few minutes, and the stream stops or starts flooding. The fix is the <b>IGMP snooping querier</b>: the switch sends general queries itself, using its VLAN SVI address or a configured one.</p>

<div class="eg"><p><b>Worked example.</b> Access switch, VLAN 10, 48 ports, one 6 Mbps channel with 3 viewers. Without snooping: 48 x 6 = 288 Mbps of egress across the switch ports. With snooping: 3 member ports + 1 mrouter port. Egress toward hosts is 3 x 6 = 18 Mbps, and 45 ports stay quiet.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>immediate-leave</code> on a port that connects to a hub, an unmanaged switch or a wireless AP. One user leaving cuts the stream for every other viewer on that port until their next report.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSM needs <b>IGMPv3</b> because only v3 can name a source. v3 reports go to <b>224.0.0.22</b> and have no report suppression. IGMP snooping is a <b>switch</b> feature; the router does not need anything special for it.</p></div>

<div class="scn"><h4>The IPTV stream that died every four minutes</h4><p>A hotel ran IPTV in a dedicated Layer 2 VLAN between the headend and the rooms, with no router in that VLAN. Channels froze a few minutes after a guest tuned in, and changing channel "fixed" it briefly. <code>show ip igmp snooping mrouter</code> was empty and the groups table emptied a few minutes after each join. With no querier, hosts never refreshed their membership. Adding <code>ip igmp snooping querier</code> on the distribution switch kept the entries alive.</p><p><b>Lesson:</b> snooping needs a querier somewhere in the VLAN; without a router, turn on the snooping querier.</p></div>

<div class="iv"><p class="q">"What is IGMP snooping and what happens without it?"</p><p>Strong answer: without it a switch floods multicast frames to every port in the VLAN because multicast MACs are never learned as sources. Snooping lets the switch inspect IGMP reports and leaves, find mrouter ports from queries and PIM hellos, and forward each group only to member ports and mrouter ports. Mention the snooping querier for router-less VLANs and that IGMPv3 is needed for SSM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMPv3 adds source filtering: INCLUDE (only these sources) and EXCLUDE (all but these).</li>
<li>v3 reports go to 224.0.0.22, have no report suppression, and are required for SSM.</li>
<li>Switches flood multicast by default; IGMP snooping limits it to member and mrouter ports.</li>
<li>Snooping is on by default on Catalyst; a VLAN without a router needs <code>ip igmp snooping querier</code>.</li>
<li>Use immediate-leave only where one host sits behind each port.</li>
</ul></div>
`,hi:`
<p>IGMPv2 ke saath viewer keh sakta hai "mujhe channel 5 chahiye". IGMPv3 ke saath viewer keh sakta hai "mujhe channel 5 chahiye, par <b>sirf Mumbai studio se</b>", ya "channel 5 kisi se bhi, test transmitter ko <b>chhod kar</b>". Yahi extra line, yaani source, Source-Specific Multicast ko possible banati hai. Aur router ke neeche wale switch par IGMP snooping pakka karta hai ki channel sirf un TVs tak pahunche jinhone maanga.</p>

<h3>IGMPv3 (RFC 3376)</h3>
<p>IGMPv3 <b>source filtering</b> jodta hai. Host ki report har group ke liye sources ki list le ja sakti hai, do <b>filter modes</b> mein se ek mein:</p>
<dl class="terms">
<dt>INCLUDE mode</dt><dd>"Mujhe group G sirf in sources se bhejo." 232.1.1.1 ke liye INCLUDE {10.1.1.10} ka matlab sirf 10.1.1.10 ka traffic chahiye. Isi tarah receiver <b>(S,G)</b> channel maangta hai, aur <b>SSM</b> (chapter 11) ke liye yeh zaroori hai.</dd>
<dt>EXCLUDE mode</dt><dd>"Mujhe group G har source se bhejo, in ko chhod kar." Khaali list wala EXCLUDE matlab "koi bhi source", jo IGMPv2 join jaisa hi hai.</dd>
</dl>
<p>Baaki changes jo aapko pata hone chahiye:</p>
<ul>
<li>v3 reports <b>224.0.0.22</b> (all IGMPv3-capable routers) par bheji jaati hain, group address par nahi.</li>
<li><b>Report suppression nahi</b>: har host apni state khud report karta hai. Isliye router chahe to har host ki membership track kar sakta hai (explicit tracking), aur fast leave safe ho jaata hai.</li>
<li>Naya <b>group-and-source-specific query</b> router ko check karne deta hai "kya ab bhi kisi ko S se G chahiye?"</li>
<li>Ek report kai group records le ja sakti hai, jisse packets kam hote hain.</li>
<li><b>Backward compatibility</b>: v3 router kisi group ke liye v1 ya v2 report sunta hai to us group ke liye purane behaviour par aa jaata hai. v2 querier ke peeche v3 host v2 par gir jaata hai aur source batane ki kshamta kho deta hai.</li>
</ul>
<pre class="code">interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3                <span class="c">! SSM ke liye receiver LAN par zaroori</span></pre>
<pre class="out">R3# show ip igmp groups 232.1.1.1 detail
Interface:      GigabitEthernet0/0
Group:          232.1.1.1
<span class="hl">Flags:          SSM</span>
Uptime:         00:01:12
<span class="hl">Group mode:     INCLUDE</span>
Last reporter:  10.3.3.10
Source list size: 1
Source Address   Uptime    v3 Exp    CSR Exp   Fwd  Flags
<span class="hl">10.1.1.10        00:01:12  00:02:47  stopped   Yes  R</span></pre>

<table class="cmp">
<tr><th></th><th>IGMPv1</th><th>IGMPv2</th><th>IGMPv3</th></tr>
<tr><td>Report kahan jaati hai</td><td>Group</td><td>Group</td><td>224.0.0.22</td></tr>
<tr><td>Leave</td><td>Nahi (timeout)</td><td>Haan, 224.0.0.2 par</td><td>Haan, state badalne wali report</td></tr>
<tr><td>Querier election</td><td>PIM DR se</td><td>Sabse chhota IP</td><td>Sabse chhota IP</td></tr>
<tr><td>Report suppression</td><td>Haan</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Source filtering / SSM</td><td>Nahi</td><td>Nahi</td><td>Haan (INCLUDE / EXCLUDE)</td></tr>
</table>

<h3>Layer 2 ki problem</h3>
<p>Classic switch unicast MACs source addresses se seekhta hai. 01:00:5e:0a:0a:0a jaisa multicast MAC kabhi source nahi hota, isliye switch use kabhi nahi seekhta aur frame ko unknown unicast ki tarah treat karta hai: use <b>VLAN ke har port par flood karta hai</b>. 48-port access switch par ek 8 Mbps IPTV channel saare 48 ports tak pahunchta hai. Printers, phones aur laptops sab ise receive karte hain, aur wireless APs ise low data rate par hawa mein dhakel sakte hain.</p>

<h3>IGMP snooping</h3>
<p><b>IGMP snooping</b> ise theek karta hai. Switch apne through guzarne wale IGMP messages sunta (snoop karta) hai, bhale hi woh Layer 2 device hai, aur ek table banata hai ki kaunse ports ko kaunsa group chahiye:</p>
<ol>
<li>Woh <b>multicast router ports</b> (mrouter ports) dhoondhta hai, un par aane wali IGMP general queries ya PIM hellos dekh kar.</li>
<li>Jab host report bhejta hai, switch us host ka port group ki forwarding entry mein jodta hai aur report <b>sirf mrouter ports</b> ko forward karta hai, doosre hosts ko nahi.</li>
<li>Group ka multicast data sirf member ports plus mrouter ports par jaata hai.</li>
<li>Leave par switch use router ko forward karta hai aur group-specific queries ka jawab na aane par port hata deta hai, ya <b>immediate-leave</b> ke saath turant (sirf tab safe jab har port ke peeche ek host ho).</li>
</ol>
<p>Catalyst switches par snooping <b>default mein enabled</b> hai, globally aur har VLAN mein.</p>
<pre class="code">ip igmp snooping                                  <span class="c">! default on</span>
ip igmp snooping vlan 10 immediate-leave
ip igmp snooping querier                          <span class="c">! us VLAN ke liye jismein multicast router nahi</span></pre>
<pre class="out">SW1# show ip igmp snooping groups
Vlan      Group                 Type        Version     Port List
-----------------------------------------------------------------------
<span class="hl">10        239.10.10.10          igmp        v2          Gi1/0/5, Gi1/0/12, Gi1/0/48</span>

SW1# show ip igmp snooping mrouter
Vlan    ports
-------+------
<span class="hl">  10    Gi1/0/48(dynamic)</span></pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IGMP snooping">
<rect x="270" y="15" width="100" height="36" rx="6" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="230" y="95" width="180" height="40" rx="6" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1 (snooping)</text>
<line x1="320" y1="51" x2="320" y2="95" stroke="#64748b" stroke-width="3"/><text x="330" y="78" class="svg-muted" font-size="12">mrouter Gi1/0/48</text>
<rect x="40" y="180" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="90" y="201" text-anchor="middle" class="svg-ink" font-size="12">PC joined</text>
<rect x="190" y="180" width="100" height="32" rx="6" fill="#e2e8f0"/><text x="240" y="201" text-anchor="middle" class="svg-muted" font-size="12">printer</text>
<rect x="340" y="180" width="100" height="32" rx="6" fill="#bbf7d0"/><text x="390" y="201" text-anchor="middle" class="svg-ink" font-size="12">PC joined</text>
<rect x="490" y="180" width="100" height="32" rx="6" fill="#e2e8f0"/><text x="540" y="201" text-anchor="middle" class="svg-muted" font-size="12">phone</text>
<line x1="280" y1="135" x2="90" y2="180" stroke="#64748b" stroke-width="3"/><line x1="340" y1="135" x2="390" y2="180" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="135" x2="240" y2="180" stroke="#64748b" stroke-dasharray="4 4"/><line x1="360" y1="135" x2="540" y2="180" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">Snooping ke saath stream sirf joined ports aur mrouter port par jaata hai; dashed ports ko kuch nahi milta.</p></div>

<h3>Gayab querier</h3>
<p>Snooping entries hosts ke queries ka jawab dene se zinda rehti hain. Jis VLAN mein <b>koi multicast router nahi</b> (jaise pure Layer 2 IPTV VLAN), wahan koi queries nahi bhejta, entries kuch minute baad age out ho jaati hain, aur stream ruk jaata hai ya flood hone lagta hai. Fix hai <b>IGMP snooping querier</b>: switch khud general queries bhejta hai, apne VLAN SVI address ya configured address se.</p>

<div class="eg"><p><b>Worked example.</b> Access switch, VLAN 10, 48 ports, ek 6 Mbps channel aur 3 viewers. Snooping ke bina: switch ports par 48 x 6 = 288 Mbps egress. Snooping ke saath: 3 member ports + 1 mrouter port. Hosts ki taraf egress 3 x 6 = 18 Mbps, aur 45 ports shaant rehte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Hub, unmanaged switch ya wireless AP se jude port par <code>immediate-leave</code> enable karna. Ek user ke jaate hi us port ke baaki har viewer ka stream kat jaata hai jab tak unki agli report na aaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSM ko <b>IGMPv3</b> chahiye kyunki sirf v3 source ka naam le sakta hai. v3 reports <b>224.0.0.22</b> par jaati hain aur unme report suppression nahi hota. IGMP snooping <b>switch</b> feature hai; router ko iske liye kuch special nahi chahiye.</p></div>

<div class="scn"><h4>IPTV stream jo har chaar minute mein mar jaata tha</h4><p>Ek hotel headend aur rooms ke beech ek dedicated Layer 2 VLAN mein IPTV chalata tha, us VLAN mein koi router nahi tha. Guest ke tune karne ke kuch minute baad channels freeze ho jaate, aur channel badalne se thodi der ke liye "theek" ho jaata. <code>show ip igmp snooping mrouter</code> khaali tha aur har join ke kuch minute baad groups table khaali ho jaati. Querier na hone se hosts ne kabhi apni membership refresh nahi ki. Distribution switch par <code>ip igmp snooping querier</code> jodne se entries zinda rahi.</p><p><b>Seekh:</b> snooping ko VLAN mein kahin na kahin querier chahiye; router nahi hai to snooping querier on karo.</p></div>

<div class="iv"><p class="q">"IGMP snooping kya hai aur iske bina kya hota hai?"</p><p>Strong answer: iske bina switch multicast frames VLAN ke har port par flood karta hai kyunki multicast MACs kabhi source ki tarah seekhe nahi jaate. Snooping switch ko IGMP reports aur leaves inspect karne deta hai, queries aur PIM hellos se mrouter ports dhoondhne deta hai, aur har group ko sirf member ports aur mrouter ports par forward karne deta hai. Router-less VLANs ke liye snooping querier ka zikr karo aur yeh ki SSM ke liye IGMPv3 chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMPv3 source filtering jodta hai: INCLUDE (sirf yeh sources) aur EXCLUDE (inhe chhod kar sab).</li>
<li>v3 reports 224.0.0.22 par jaati hain, report suppression nahi hota, aur SSM ke liye zaroori hain.</li>
<li>Switches default mein multicast flood karte hain; IGMP snooping use member aur mrouter ports tak seemit karta hai.</li>
<li>Catalyst par snooping default on hai; bina router wale VLAN ko <code>ip igmp snooping querier</code> chahiye.</li>
<li>Immediate-leave sirf wahan use karo jahan har port ke peeche ek host ho.</li>
</ul></div>
`}};export{e as default};