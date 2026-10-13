var e={id:`igmp-v3`,h:{en:`IGMPv3: source lists, INCLUDE and EXCLUDE, and why SSM needs it`,hi:`IGMPv3: source lists, INCLUDE aur EXCLUDE, aur SSM ko iski zaroorat kyun`},body:{en:`
<p>With IGMPv2 a host can only say "I want group G". It cannot say "I want G, but only from the studio server". Imagine ordering a magazine by name only: you may receive copies from any publisher that uses that title. IGMPv3 adds the missing piece: a <b>source list</b> inside the report. That one change is what makes source-specific multicast (SSM) possible.</p>

<h3>What a v3 report carries</h3>
<p>An IGMPv3 report is sent to <b>224.0.0.22</b> (all IGMPv3-capable routers), not to the group address. It contains one or more <b>group records</b>. Each record names a group, a filter mode and a list of source addresses.</p>
<table class="cmp"><tr><th>Filter</th><th>Meaning</th><th>Used for</th></tr>
<tr><td><b>INCLUDE {S1, S2}</b></td><td>Accept only traffic from these sources</td><td>SSM: (S1,G) and (S2,G)</td></tr>
<tr><td><b>EXCLUDE {}</b></td><td>Accept every source (an empty exclude list)</td><td>What a v2-style "join G" becomes: (*,G)</td></tr>
<tr><td><b>EXCLUDE {S3}</b></td><td>Accept every source except S3</td><td>Rare; ASM with a blocked source</td></tr>
</table>
<p>The report types are: current-state records <code>MODE_IS_INCLUDE</code> and <code>MODE_IS_EXCLUDE</code> (answers to a query), and state-change records <code>CHANGE_TO_INCLUDE</code>, <code>CHANGE_TO_EXCLUDE</code>, <code>ALLOW_NEW_SOURCES</code> and <code>BLOCK_OLD_SOURCES</code> (sent when the application changes its mind). A host that leaves a group simply sends <code>CHANGE_TO_INCLUDE</code> with an empty list: "I accept no sources". So v3 does not need a separate leave message.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IGMPv3 filter modes">
<rect x="10" y="20" width="190" height="170" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">INCLUDE {S1}</text>
<text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accepted</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">S2 : blocked</text><text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">S3 : blocked</text><text x="105" y="165" text-anchor="middle" class="svg-accent" font-size="12">Router builds (S1,G)</text>
<rect x="225" y="20" width="190" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">EXCLUDE {}</text>
<text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accepted</text><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">S2 : accepted</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">S3 : accepted</text><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Router builds (*,G)</text>
<rect x="440" y="20" width="190" height="170" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">EXCLUDE {S3}</text>
<text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accepted</text><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="12">S2 : accepted</text><text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="12">S3 : blocked</text><text x="535" y="165" text-anchor="middle" class="svg-accent" font-size="12">(*,G) minus S3</text>
</svg><p class="cap">The filter mode plus the source list says exactly which senders the receiver accepts.</p></div>

<h3>Other differences from v2</h3>
<ul>
<li><b>No report suppression.</b> Every host reports, each to 224.0.0.22. Routers now learn every member and every source filter. Reports are bigger but the router has exact state.</li>
<li><b>Leave through state change</b> (see above) and source-specific queries, so routers can ask "who still wants (S,G)?".</li>
<li>The querier election stays <b>lowest IP address</b>.</li>
<li>Robustness and timers work as in v2.</li>
</ul>

<h3>Why SSM needs IGMPv3</h3>
<p>SSM (the 232.0.0.0/8 range) skips the rendezvous point entirely. The last-hop router builds a source tree straight toward S, because the receiver named S. To name S, the receiver needs v3. On IOS XE you enable the SSM range with <code>ip pim ssm default</code> and make the receiver LAN speak v3 with <code>ip igmp version 3</code>.</p>
<pre class="code"><span class="c">! R1: SSM range 232.0.0.0/8, receiver LAN speaks IGMPv3</span>
ip multicast-routing
ip pim ssm default
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3</pre>
<p>Now a student PC joins (the PC shell shows the filter it sent):</p>
<pre class="out">PC2&gt; join 232.20.1.1 source 10.20.2.10
Joined 232.20.1.1 (source 10.20.2.10, IGMPv3 include) on eth0
PC2&gt; show mcast
Group            Source filter        Joined     Packets received
232.20.1.1       <span class="hl">include 10.20.2.10</span>   00:00:12   10

R1#show ip mroute 232.20.1.1
(10.20.2.10, 232.20.1.1), 00:00:12/00:02:48, flags: <span class="hl">sI</span>
  Incoming interface: GigabitEthernet0/1, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:12/00:03:18</pre>
<p>Flag <b>s</b> means the group is in the SSM range; flag <b>I</b> means "received a source-specific host report", which is IGMPv3 evidence. There is no (*,G) entry and no RP involved.</p>

<h3>Version compatibility: what happens when versions mix</h3>
<table class="cmp"><tr><th>Router interface</th><th>Host</th><th>Result</th></tr>
<tr><td>v3</td><td>v3</td><td>Full source filtering. SSM works.</td></tr>
<tr><td>v3</td><td>v2 or v1 (older stack)</td><td>Router falls back to v2 behaviour for that group while an older host is present (older-host-present timer). ASM keeps working, but source filters and fast leave are lost for that group.</td></tr>
<tr><td>v2</td><td>v3 host</td><td>The host hears a v2 query and switches to v2 reports. A plain "join G" works. A source-specific join cannot be expressed, so the SSM channel is <b>not delivered</b>.</td></tr>
<tr><td>v2</td><td>v2</td><td>ASM only. SSM groups: no source, so no tree.</td></tr>
</table>
<p>In the simulator, the same rule is visible: on an interface left at version 2, a PC that asks for a source gets its report ignored, because the source list is not usable. Setting <code>ip igmp version 3</code> makes the same PC work with no change on the host.</p>
<p>When a LAN is full of v2-only receivers but you want SSM channels, real platforms offer <b>SSM mapping</b> (a router configuration that maps a group to a source for v2 reports). It is a design option you should know exists; the lab simulator does not model it.</p>

<div class="warn"><p><b>Common mistakes.</b> Enabling <code>ip pim ssm default</code> but leaving the receiver LAN at version 2 (the classic "SSM channel not delivered"). Setting v3 on one router of a shared LAN and leaving the other at v2: the two disagree and the lowest-address router decides what hosts see, so behaviour looks random. Using a 232 group for a normal any-source application: SSM groups never get an RP.</p></div>
<div class="exam"><p><b>Exam trap.</b> v3 reports go to 224.0.0.22, not to the group. v3 has no report suppression. The flag s means SSM range, I means source-specific host report. IGMP version must match on the whole LAN for predictable results; default on IOS XE is 2.</p></div>

<div class="scn"><h4>The match-day channel that only half the stadium saw</h4><p>Deccan Broadcast delivered a source-specific channel (232.77.1.1 from one encoder) to the press box and the VIP lounge. The press box worked; the lounge saw a frozen picture. The lounge LAN interface on its router had been copied from an old template with <code>ip igmp version 2</code>. The lounge TVs were v3-capable, heard a v2 query, fell back to v2 and could no longer name the encoder. With <code>ip igmp version 3</code> on that interface the channel appeared on the next report.</p><p><b>Lesson:</b> when one LAN works and its twin does not, diff the IGMP version first.</p></div>

<div class="iv"><p class="q">"Why does SSM require IGMPv3, and what do you do for receivers that only speak v2?"</p><p>Strong answer: SSM receivers must name the source in their join, and only v3 reports can carry an INCLUDE source list. The last-hop router then builds an (S,G) tree directly, with no RP. For v2-only receivers, a router can map the group to a source (SSM mapping) or you upgrade the receiver software. Add the check: <code>show ip igmp interface</code> for the version and <code>show ip mroute</code> for flags s and I.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMPv3 adds a filter mode (INCLUDE or EXCLUDE) and a source list to each group record.</li>
<li>v3 reports go to 224.0.0.22, there is no suppression, and leave is a state change.</li>
<li>SSM (232/8) needs v3 on the receiver LAN and <code>ip pim ssm default</code> on routers.</li>
<li>A v2 interface cannot carry a source filter: the SSM channel is not delivered.</li>
<li>mroute flags s and I show an SSM group with a source-specific host report.</li>
</ul></div>
`,hi:`
<p>IGMPv2 mein host sirf kah sakta hai "mujhe group G chahiye". Woh yeh nahi kah sakta "mujhe G chahiye, par sirf studio server se". Socho ki aap magazine sirf naam se mangwate ho: us title ke kisi bhi publisher ki copy aa sakti hai. IGMPv3 woh kami poori karta hai: report ke andar ek <b>source list</b>. Isi ek badlaav se source-specific multicast (SSM) possible hota hai.</p>

<h3>v3 report mein kya hota hai</h3>
<p>IGMPv3 report <b>224.0.0.22</b> (all IGMPv3-capable routers) par bheji jaati hai, group address par nahi. Isme ek ya zyada <b>group records</b> hote hain. Har record ek group, ek filter mode aur source addresses ki list batata hai.</p>
<table class="cmp"><tr><th>Filter</th><th>Matlab</th><th>Kis liye</th></tr>
<tr><td><b>INCLUDE {S1, S2}</b></td><td>Sirf in sources ka traffic accept karo</td><td>SSM: (S1,G) aur (S2,G)</td></tr>
<tr><td><b>EXCLUDE {}</b></td><td>Har source accept karo (khali exclude list)</td><td>v2 jaisa "join G" yahi ban jaata hai: (*,G)</td></tr>
<tr><td><b>EXCLUDE {S3}</b></td><td>S3 ko chhodkar har source accept karo</td><td>Kam use hota hai; ASM mein ek source block</td></tr>
</table>
<p>Report types yeh hain: current-state records <code>MODE_IS_INCLUDE</code> aur <code>MODE_IS_EXCLUDE</code> (query ka jawab), aur state-change records <code>CHANGE_TO_INCLUDE</code>, <code>CHANGE_TO_EXCLUDE</code>, <code>ALLOW_NEW_SOURCES</code> aur <code>BLOCK_OLD_SOURCES</code> (jab application apna mind badalti hai). Jo host group chhodta hai woh khali list ke saath <code>CHANGE_TO_INCLUDE</code> bhejta hai: "main koi source accept nahi karta". Isliye v3 ko alag leave message nahi chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IGMPv3 filter modes">
<rect x="10" y="20" width="190" height="170" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">INCLUDE {S1}</text>
<text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accept</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">S2 : block</text><text x="105" y="125" text-anchor="middle" class="svg-muted" font-size="12">S3 : block</text><text x="105" y="165" text-anchor="middle" class="svg-accent" font-size="12">Router (S1,G) banata hai</text>
<rect x="225" y="20" width="190" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">EXCLUDE {}</text>
<text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accept</text><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">S2 : accept</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">S3 : accept</text><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Router (*,G) banata hai</text>
<rect x="440" y="20" width="190" height="170" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">EXCLUDE {S3}</text>
<text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="12">S1 : accept</text><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="12">S2 : accept</text><text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="12">S3 : block</text><text x="535" y="165" text-anchor="middle" class="svg-accent" font-size="12">(*,G) minus S3</text>
</svg><p class="cap">Filter mode aur source list milkar batate hain ki receiver kin senders ko accept karta hai.</p></div>

<h3>v2 se doosre farak</h3>
<ul>
<li><b>Report suppression nahi.</b> Har host report karta hai, har ek 224.0.0.22 par. Routers ko ab har member aur har source filter pata chalta hai. Reports bade hote hain par router ke paas exact state hoti hai.</li>
<li><b>Leave state change se</b> (upar dekho) aur source-specific queries, taaki router poochh sake "(S,G) ab bhi kise chahiye?".</li>
<li>Querier election abhi bhi <b>lowest IP address</b> se.</li>
<li>Robustness aur timers v2 ki tarah kaam karte hain.</li>
</ul>

<h3>SSM ko IGMPv3 kyun chahiye</h3>
<p>SSM (232.0.0.0/8 range) rendezvous point ko bilkul skip kar deta hai. Last-hop router seedha S ki taraf source tree banata hai, kyunki receiver ne S ka naam liya. S ka naam lene ke liye receiver ko v3 chahiye. IOS XE par SSM range <code>ip pim ssm default</code> se on hoti hai aur receiver LAN ko v3 bolne ke liye <code>ip igmp version 3</code> lagate hain.</p>
<pre class="code"><span class="c">! R1: SSM range 232.0.0.0/8, receiver LAN IGMPv3 bolta hai</span>
ip multicast-routing
ip pim ssm default
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3</pre>
<p>Ab ek student PC join karta hai (PC shell woh filter dikhata hai jo usne bheja):</p>
<pre class="out">PC2&gt; join 232.20.1.1 source 10.20.2.10
Joined 232.20.1.1 (source 10.20.2.10, IGMPv3 include) on eth0
PC2&gt; show mcast
Group            Source filter        Joined     Packets received
232.20.1.1       <span class="hl">include 10.20.2.10</span>   00:00:12   10

R1#show ip mroute 232.20.1.1
(10.20.2.10, 232.20.1.1), 00:00:12/00:02:48, flags: <span class="hl">sI</span>
  Incoming interface: GigabitEthernet0/1, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:12/00:03:18</pre>
<p>Flag <b>s</b> ka matlab group SSM range mein hai; flag <b>I</b> ka matlab "source-specific host report mili", jo IGMPv3 ka saboot hai. Koi (*,G) entry nahi hai aur koi RP involved nahi hai.</p>

<h3>Version compatibility: versions mix hon to kya hota hai</h3>
<table class="cmp"><tr><th>Router interface</th><th>Host</th><th>Result</th></tr>
<tr><td>v3</td><td>v3</td><td>Poori source filtering. SSM chalta hai.</td></tr>
<tr><td>v3</td><td>v2 ya v1 (purana stack)</td><td>Jab tak purana host maujood hai (older-host-present timer), router us group ke liye v2 behaviour par aa jaata hai. ASM chalta rehta hai, par us group ke liye source filters aur fast leave chale jaate hain.</td></tr>
<tr><td>v2</td><td>v3 host</td><td>Host v2 query sunta hai aur v2 reports par switch karta hai. Seedha "join G" chalta hai. Source-specific join express nahi ho sakta, isliye SSM channel <b>deliver nahi hota</b>.</td></tr>
<tr><td>v2</td><td>v2</td><td>Sirf ASM. SSM groups: source nahi, isliye tree nahi.</td></tr>
</table>
<p>Simulator mein yahi rule dikhta hai: version 2 par chhode gaye interface par jo PC source maangta hai uski report ignore ho jaati hai, kyunki source list use nahi ho sakti. <code>ip igmp version 3</code> lagane se wahi PC bina host badle chalne lagta hai.</p>
<p>Jab LAN sirf v2 receivers se bhari ho par SSM channels chahiye, real platforms <b>SSM mapping</b> dete hain (router configuration jo v2 reports ke liye group ko source se map karti hai). Yeh ek design option hai jiske baare mein pata hona chahiye; lab simulator ise model nahi karta.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>ip pim ssm default</code> lagana par receiver LAN ko version 2 par chhod dena (classic "SSM channel deliver nahi hua"). Shared LAN ke ek router par v3 lagana aur doosre ko v2 chhod dena: dono ek-doosre se alag bolte hain aur lowest-address router decide karta hai ki hosts ko kya dikhe, isliye behaviour random lagta hai. Normal any-source application ke liye 232 group use karna: SSM groups ko kabhi RP nahi milta.</p></div>
<div class="exam"><p><b>Exam trap.</b> v3 reports 224.0.0.22 par jaati hain, group par nahi. v3 mein report suppression nahi hai. Flag s ka matlab SSM range, I ka matlab source-specific host report. Predictable results ke liye poori LAN par IGMP version same hona chahiye; IOS XE par default 2 hai.</p></div>

<div class="scn"><h4>Match-day channel jo aadhe stadium ne dekhi</h4><p>Deccan Broadcast ne ek source-specific channel (232.77.1.1, ek encoder se) press box aur VIP lounge tak pahunchai. Press box mein chali; lounge mein picture frozen thi. Lounge LAN ke router interface par purane template se <code>ip igmp version 2</code> copy ho gaya tha. Lounge ke TVs v3-capable the, v2 query sunkar v2 par fall back hue aur ab encoder ka naam nahi le sakte the. Us interface par <code>ip igmp version 3</code> lagate hi agli report par channel aa gayi.</p><p><b>Lesson:</b> jab ek LAN chale aur uska twin na chale, pehle IGMP version ka diff dekho.</p></div>

<div class="iv"><p class="q">"SSM ko IGMPv3 kyun chahiye, aur sirf v2 bolne wale receivers ke liye kya karte ho?"</p><p>Strong answer: SSM receivers ko apne join mein source ka naam lena padta hai, aur sirf v3 reports INCLUDE source list carry kar sakti hain. Last-hop router phir seedha (S,G) tree banata hai, bina RP ke. v2-only receivers ke liye router group ko source se map kar sakta hai (SSM mapping) ya aap receiver software upgrade karte ho. Check bhi batao: version ke liye <code>show ip igmp interface</code> aur flags s tatha I ke liye <code>show ip mroute</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMPv3 har group record mein filter mode (INCLUDE ya EXCLUDE) aur source list jodta hai.</li>
<li>v3 reports 224.0.0.22 par jaati hain, suppression nahi hai, aur leave state change hai.</li>
<li>SSM (232/8) ko receiver LAN par v3 aur routers par <code>ip pim ssm default</code> chahiye.</li>
<li>v2 interface source filter carry nahi kar sakta: SSM channel deliver nahi hota.</li>
<li>mroute flags s aur I source-specific host report wala SSM group dikhate hain.</li>
</ul></div>
`}};export{e as default};