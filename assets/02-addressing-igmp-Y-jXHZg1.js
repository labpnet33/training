var e={id:`addressing-igmp`,h:{en:`Group addresses, MAC mapping and IGMP`,hi:`Group addresses, MAC mapping aur IGMP`},body:{en:`
<p>Before any router builds a tree, two basic things must work: the <b>address</b> that names the group, and the <b>protocol hosts use to join it</b>. This chapter covers both.</p>

<h3>IPv4 multicast address ranges</h3>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>224.0.0.0/24</td><td>Link-local control traffic: 224.0.0.2 all routers, 224.0.0.5 OSPF, 224.0.0.13 PIM, 224.0.0.22 IGMPv3. Never routed, TTL 1.</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-specific multicast (SSM). Junos treats it as SSM by default.</td></tr>
<tr><td>233.252.0.0/24</td><td>Documentation range (used for examples and tests).</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped, private. The usual choice for enterprise streams: 239.61.1.1, 239.62.5.5.</td></tr>
<tr><td>other 224.0.0.0/4</td><td>Globally scoped any-source groups.</td></tr></table>
<p>In <b>ASM</b> (any-source multicast) a receiver asks for the group only, written <b>(*,G)</b>, and any source may send. In <b>SSM</b> the receiver names the source too, <b>(S,G)</b>, so the network can build a tree straight to the source.</p>

<h3>Mapping the group to a MAC address</h3>
<p>On Ethernet a multicast IP packet is sent to a multicast MAC address: <code>01:00:5e</code> followed by the <b>low 23 bits</b> of the group address. An IPv4 group has 28 significant bits, so <b>32 groups share the same MAC</b>: 239.61.1.1 and 224.61.1.1, for example, look identical to a switch.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Group to MAC mapping">
<rect x="20" y="20" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="13">239.61.1.1 = 1110 1111 . 0011 1101 . 0000 0001 . 0000 0001</text>
<rect x="20" y="90" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="13">01:00:5e : 3d : 01 : 01</text>
<line x1="155" y1="60" x2="155" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="430" y="50" text-anchor="middle" class="svg-muted" font-size="12">5 variable bits are dropped (low 4 bits of the 1st octet</text>
<text x="430" y="68" text-anchor="middle" class="svg-muted" font-size="12">and the top bit of the 2nd octet)</text>
<text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">only the low 23 bits survive</text>
</svg><p class="cap">The ambiguity of 32 groups per MAC matters when you design group plans on a switch.</p></div>

<h3>IGMP: how hosts join</h3>
<ul>
<li><b>IGMPv1</b> only has join; leaving relies on timeout.</li>
<li><b>IGMPv2</b> adds an explicit <b>Leave</b> message and group-specific queries. Reports name only the group.</li>
<li><b>IGMPv3</b> reports carry a <b>source list</b> in Include or Exclude mode. It is required for SSM. Reports go to 224.0.0.22.</li>
</ul>
<p>One router per LAN is the <b>querier</b> (lowest IP address wins). It sends a general query to 224.0.0.1 every <b>125 seconds</b>; hosts answer with reports after a random delay up to the <b>query response interval</b> (10 s). If no report arrives before the membership timeout (<b>260 s</b> = robustness x interval + response interval), the group is dropped. When a v2 host leaves, the querier sends group-specific queries before removing the group.</p>
<pre class="code"><span class="c"># IGMP runs where PIM runs; set the version per interface</span>
set protocols igmp interface ge-0/0/1.0 version 3
set protocols igmp interface ge-0/0/1.0 static group 239.61.9.9     <span class="c"># router joins for a silent device</span></pre>
<pre class="out">lab@R3&gt; show igmp interface
Interface: ge-0/0/1.0
    Querier: 10.61.40.1
    State:         Up Timeout:    None Version:  <span class="hl">2</span> Groups:      1
    Immediate leave: Off
    Promiscuous mode: Off
    Passive: Off
Configured Parameters:
IGMP Query Interval: 125.0
IGMP Query Response Interval: 10.0
IGMP Last Member Query Interval: 1.0
IGMP Robustness Count: 2
Derived Parameters:
IGMP Membership Timeout: 260.0
IGMP Other Querier Present Timeout: 255.0</pre>
<p>The default version on this platform is 2. In the SSM lab the dealer PCs send IGMPv3 reports that name a source, but the router interface irb.60 is still on version 2, so it records only the group and loses the source:</p>
<pre class="out">lab@R3&gt; show igmp group
Interface: irb.60, Groups: 1
    Group: 232.63.1.1
        <span class="hl">Group mode: Exclude</span>
        <span class="hl">Source: 0.0.0.0</span>
        Last reported by: 10.63.60.21
        Timeout:     230 Type: Dynamic</pre>
<p>After <code>set protocols igmp interface irb.60 version 3</code> the same group shows <code>Group mode: Include</code> and <code>Source: 10.63.10.50</code>. Only now can PIM send an (S,G) join. Also visible in <code>show igmp group</code> are the router's own local entries (224.0.0.2, 224.0.0.13, 224.0.0.22).</p>

<div class="eg"><p><b>Worked example.</b> IGMP timers: robustness count 2, query interval 125 s, response interval 10 s. Membership timeout = 2 x 125 + 10 = 260 s, matching the output. Other-querier-present timeout = 2 x 125 + 10 / 2 = 255 s. A router that has not heard a query for 255 s takes over as querier.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a LAN on IGMPv2 and expecting SSM. The router cannot learn the source from a v2 report, so no (S,G) state is created. Another mistake: choosing group addresses whose low 23 bits collide with 224.0.0.x, because switches flood link-local MACs even with snooping.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IGMP querier is the router with the lowest IP address, but the PIM DR on the same LAN is the router with the highest priority and then the highest IP address. They can be different routers.</p></div>

<div class="scn"><h4>The ticker that only half worked</h4><p>A bank's dealing floor migrated its market-data feed to SSM. Desktops used IGMPv3, but the access routers kept the default IGMPv2. <code>show igmp group</code> showed Exclude with source 0.0.0.0, and no (S,G) join was ever sent. Setting version 3 on the interface changed the mode to Include with the feed address, and the stream arrived.</p><p><b>Lesson:</b> check IGMP versions end to end whenever SSM is involved.</p></div>

<div class="iv"><p class="q">"What are the differences between IGMPv2 and IGMPv3?"</p><p>v2 has explicit Leave and group-only reports. v3 adds source filtering with Include and Exclude lists, which makes SSM possible, and sends reports to 224.0.0.22. Mention that the querier election is by lowest IP, and the default query interval is 125 seconds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use 239.0.0.0/8 for private groups; 232.0.0.0/8 is SSM; 224.0.0.0/24 is link-local.</li>
<li>The multicast MAC keeps only the low 23 bits, so 32 groups share one MAC.</li>
<li>IGMPv3 carries sources and is required for SSM.</li>
<li>The lowest-IP router is the IGMP querier; default interval 125 s, membership timeout 260 s.</li>
<li>show igmp group and show igmp interface prove what the router learned.</li>
</ul></div>
`,hi:`
<p>Router koi tree banaye usse pehle do basic cheezein kaam karni chahiye: group ka naam batane wala <b>address</b>, aur hosts ke <b>join karne ka protocol</b>. Yeh chapter dono cover karta hai.</p>

<h3>IPv4 multicast address ranges</h3>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>224.0.0.0/24</td><td>Link-local control traffic: 224.0.0.2 all routers, 224.0.0.5 OSPF, 224.0.0.13 PIM, 224.0.0.22 IGMPv3. Kabhi routed nahi, TTL 1.</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-specific multicast (SSM). Junos ise default mein SSM maanta hai.</td></tr>
<tr><td>233.252.0.0/24</td><td>Documentation range (examples aur tests ke liye).</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped, private. Enterprise streams ka aam choice: 239.61.1.1, 239.62.5.5.</td></tr>
<tr><td>baaki 224.0.0.0/4</td><td>Globally scoped any-source groups.</td></tr></table>
<p><b>ASM</b> (any-source multicast) mein receiver sirf group maangta hai, <b>(*,G)</b> likha jaata hai, aur koi bhi source bhej sakta hai. <b>SSM</b> mein receiver source ka naam bhi leta hai, <b>(S,G)</b>, isliye network seedha source tak tree bana sakta hai.</p>

<h3>Group ko MAC address se map karna</h3>
<p>Ethernet par multicast IP packet multicast MAC address par jaata hai: <code>01:00:5e</code> ke baad group address ke <b>low 23 bits</b>. IPv4 group mein 28 significant bits hote hain, isliye <b>32 groups ek hi MAC share karte hain</b>: jaise 239.61.1.1 aur 224.61.1.1 switch ko ek jaise dikhte hain.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Group se MAC mapping">
<rect x="20" y="20" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="13">239.61.1.1 = 1110 1111 . 0011 1101 . 0000 0001 . 0000 0001</text>
<rect x="20" y="90" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="13">01:00:5e : 3d : 01 : 01</text>
<line x1="155" y1="60" x2="155" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="430" y="50" text-anchor="middle" class="svg-muted" font-size="12">5 variable bits hat jaate hain (1st octet ke low 4 bits</text>
<text x="430" y="68" text-anchor="middle" class="svg-muted" font-size="12">aur 2nd octet ka top bit)</text>
<text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">sirf low 23 bits bachte hain</text>
</svg><p class="cap">Switch par group plan banate waqt ek MAC par 32 groups wali ambiguity matter karti hai.</p></div>

<h3>IGMP: hosts kaise join karte hain</h3>
<ul>
<li><b>IGMPv1</b> mein sirf join hai; leave timeout par nirbhar hai.</li>
<li><b>IGMPv2</b> explicit <b>Leave</b> message aur group-specific queries jodta hai. Reports sirf group ka naam lete hain.</li>
<li><b>IGMPv3</b> reports mein Include ya Exclude mode mein <b>source list</b> hoti hai. SSM ke liye zaroori hai. Reports 224.0.0.22 par jaate hain.</li>
</ul>
<p>Har LAN par ek router <b>querier</b> hota hai (lowest IP jeetta hai). Woh har <b>125 seconds</b> par 224.0.0.1 ko general query bhejta hai; hosts <b>query response interval</b> (10 s) tak ke random delay ke baad reports se jawab dete hain. Membership timeout (<b>260 s</b> = robustness x interval + response interval) se pehle report na aaye to group hata diya jaata hai. Jab v2 host leave karta hai, querier group hatane se pehle group-specific queries bhejta hai.</p>
<pre class="code"><span class="c"># IGMP wahin chalta hai jahan PIM chalta hai; version per interface set karo</span>
set protocols igmp interface ge-0/0/1.0 version 3
set protocols igmp interface ge-0/0/1.0 static group 239.61.9.9     <span class="c"># router chup device ki taraf se join karta hai</span></pre>
<pre class="out">lab@R3&gt; show igmp interface
Interface: ge-0/0/1.0
    Querier: 10.61.40.1
    State:         Up Timeout:    None Version:  <span class="hl">2</span> Groups:      1
    Immediate leave: Off
    Promiscuous mode: Off
    Passive: Off
Configured Parameters:
IGMP Query Interval: 125.0
IGMP Query Response Interval: 10.0
IGMP Last Member Query Interval: 1.0
IGMP Robustness Count: 2
Derived Parameters:
IGMP Membership Timeout: 260.0
IGMP Other Querier Present Timeout: 255.0</pre>
<p>Is platform par default version 2 hai. SSM lab mein dealer PCs source ka naam wale IGMPv3 reports bhejte hain, lekin router interface irb.60 abhi version 2 par hai, isliye woh sirf group record karta hai aur source kho deta hai:</p>
<pre class="out">lab@R3&gt; show igmp group
Interface: irb.60, Groups: 1
    Group: 232.63.1.1
        <span class="hl">Group mode: Exclude</span>
        <span class="hl">Source: 0.0.0.0</span>
        Last reported by: 10.63.60.21
        Timeout:     230 Type: Dynamic</pre>
<p><code>set protocols igmp interface irb.60 version 3</code> ke baad wahi group <code>Group mode: Include</code> aur <code>Source: 10.63.10.50</code> dikhata hai. Ab hi PIM (S,G) join bhej sakta hai. <code>show igmp group</code> mein router ki apni local entries (224.0.0.2, 224.0.0.13, 224.0.0.22) bhi dikhti hain.</p>

<div class="eg"><p><b>Worked example.</b> IGMP timers: robustness count 2, query interval 125 s, response interval 10 s. Membership timeout = 2 x 125 + 10 = 260 s, jo output se match karta hai. Other-querier-present timeout = 2 x 125 + 10 / 2 = 255 s. Jis router ne 255 s tak query nahi suni woh querier ban jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> LAN ko IGMPv2 par chhodkar SSM ki umeed. Router v2 report se source nahi seekh sakta, isliye koi (S,G) state nahi banti. Ek aur galti: aise group addresses chunna jinke low 23 bits 224.0.0.x se takrate hain, kyunki switches snooping ke saath bhi link-local MACs flood karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGMP querier lowest IP wala router hota hai, lekin usi LAN par PIM DR highest priority aur phir highest IP wala router hota hai. Dono alag routers ho sakte hain.</p></div>

<div class="scn"><h4>Ticker jo aadha hi chala</h4><p>Ek bank ki dealing floor ne market-data feed SSM par migrate ki. Desktops IGMPv3 use karte the, lekin access routers default IGMPv2 par the. <code>show igmp group</code> ne Exclude aur source 0.0.0.0 dikhaya, aur koi (S,G) join kabhi nahi gaya. Interface par version 3 set karne se mode Include ho gaya feed address ke saath, aur stream aa gayi.</p><p><b>Lesson:</b> SSM mein IGMP versions end to end check karo.</p></div>

<div class="iv"><p class="q">"IGMPv2 aur IGMPv3 mein kya differences hain?"</p><p>v2 mein explicit Leave aur sirf group wale reports hain. v3 Include aur Exclude lists ke saath source filtering jodta hai, jisse SSM possible hota hai, aur reports 224.0.0.22 par bhejta hai. Batao ki querier election lowest IP se hota hai, aur default query interval 125 seconds hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private groups ke liye 239.0.0.0/8; 232.0.0.0/8 SSM hai; 224.0.0.0/24 link-local hai.</li>
<li>Multicast MAC sirf low 23 bits rakhta hai, isliye 32 groups ek MAC share karte hain.</li>
<li>IGMPv3 sources carry karta hai aur SSM ke liye zaroori hai.</li>
<li>Lowest-IP router IGMP querier hai; default interval 125 s, membership timeout 260 s.</li>
<li>show igmp group aur show igmp interface saabit karte hain ki router ne kya seekha.</li>
</ul></div>
`}};export{e as default};