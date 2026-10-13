var e={id:`apply-verify`,h:{en:`Applying to interfaces and VTY lines, verification and logging`,hi:`Interfaces aur VTY lines par apply, verification aur logging`},body:{en:`
<p>A CCTV camera at the gate is useless if nobody ever watches the footage. An ACL is the same: writing it is half the job; the other half is proving where it is applied, what it matched and what it dropped. This chapter covers the two ways to attach an ACL for filtering, interfaces and VTY lines, and the commands and logs that turn "I think it works" into evidence.</p>

<h3>Attaching an ACL to an interface</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out
<span class="c">! remove it again</span>
R2(config-if)# no ip access-group 10 out</pre>
<p>The ACL can be numbered or named, standard or extended. Remember the one-per rule from chapter 7 and the fact that referencing a list that does not exist yet filters nothing.</p>

<h3>Attaching an ACL to the VTY lines: access-class</h3>
<p>Remote management (SSH, or Telnet if you still allow it) arrives on the virtual terminal lines. To control <b>who may log in</b>, you do not filter every interface; you put one ACL on the lines with <code>access-class</code>. It checks the source address of the incoming session no matter which interface it arrived on.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VTY access-class">
<rect x="20" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">NOC PC</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.25</text>
<rect x="20" y="150" width="150" height="44" rx="8" fill="#fed7aa"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">User PC</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10</text>
<rect x="300" y="70" width="160" height="90" rx="10" fill="#bae6fd"/><text x="380" y="98" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text><rect x="320" y="112" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="380" y="134" text-anchor="middle" class="svg-ink" font-size="12">line vty 0 15</text>
<line x1="170" y1="52" x2="320" y2="122" stroke="#64748b" stroke-width="2"/><line x1="170" y1="172" x2="320" y2="136" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="245" y="70" text-anchor="middle" class="svg-accent" font-size="12">SSH allowed</text><text x="245" y="185" text-anchor="middle" class="svg-accent" font-size="12">refused</text>
<text x="550" y="110" text-anchor="middle" class="svg-ink" font-size="12">access-class</text><text x="550" y="128" text-anchor="middle" class="svg-ink" font-size="12">VTY-MGMT in</text>
</svg><p class="cap">access-class checks who may open a session to the router itself, whichever interface the session arrives on.</p></div>

<pre class="code">EDGE1(config)# ip access-list standard VTY-MGMT
EDGE1(config-std-nacl)# remark NOC subnet only
EDGE1(config-std-nacl)# permit 10.99.0.0 0.0.0.255
EDGE1(config-std-nacl)# deny any log
EDGE1(config-std-nacl)# exit
EDGE1(config)# line vty 0 15
EDGE1(config-line)# access-class VTY-MGMT in</pre>
<ul>
<li>Use a <b>standard</b> ACL: the question is only "who is connecting?".</li>
<li>Apply it to <b>all</b> VTY lines (0 4 and 5 15 on most routers), or an attacker simply gets a different line.</li>
<li><code>access-class ... in</code> filters sessions <b>to</b> the router; <code>access-class ... out</code> limits which destinations a user logged into the router can Telnet or SSH onward to.</li>
<li>Use <code>ip access-group</code> on interfaces and <code>access-class</code> on lines; swapping them is a classic error. SSH configuration, local users and AAA come in the next module (ccna-hardening).</li>
</ul>

<h3>Verification commands</h3>
<table class="cmp">
<tr><th>Command</th><th>What it tells you</th></tr>
<tr><td><code>show access-lists [name|number]</code></td><td>Every entry, sequence numbers and match counters (all protocols)</td></tr>
<tr><td><code>show ip access-lists [name|number]</code></td><td>Same, IPv4 only</td></tr>
<tr><td><code>show ip interface g0/0</code></td><td>Which ACL is applied inbound and outbound on that interface</td></tr>
<tr><td><code>show running-config | include access-group|access-class</code></td><td>Every place a list is referenced</td></tr>
<tr><td><code>clear access-list counters [name]</code></td><td>Reset counters before a test so the numbers mean something</td></tr>
</table>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.2.50.1/24
  Broadcast address is 255.255.255.255
  MTU is 1500 bytes
  Helper address is not set
  <span class="hl">Outgoing access list is 10</span>
  Inbound  access list is not set
  Proxy ARP is enabled</pre>

<h3>Reading the counters properly</h3>
<p>Counters count packets that matched an entry since the last clear. The implicit deny has no counter. A good test routine: clear counters, generate one known test (five pings), and look for exactly the increment you expect on exactly the line you expect.</p>

<h3>Logging</h3>
<p>Adding <code>log</code> to an entry makes the router send a syslog message when it matches. <code>log-input</code> also records the input interface and source MAC. Messages are rate-limited: the first matching packet is logged immediately, then a summary with a packet count about every five minutes per flow. Formats you will see:</p>
<pre class="out">%SEC-6-IPACCESSLOGS: list VTY-MGMT denied 10.1.20.10 1 packet
%SEC-6-IPACCESSLOGP: list 110 denied tcp 192.168.40.10(51522) -&gt; 172.31.1.80(21), 1 packet
<span class="hl">%SEC-6-IPACCESSLOGDP: list 110 denied icmp 192.168.40.10 -&gt; 172.31.1.80 (8/0), 1 packet</span>
%SEC-6-IPACCESSLOGNP: list 120 denied 89 10.0.0.1 -&gt; 224.0.0.5, 1 packet</pre>
<p>S is for standard lists, P for TCP and UDP with ports, DP for ICMP with type and code, NP for other protocols (89 is OSPF). Logged packets are processed by the CPU, so log deny lines and rare events, not a busy permit.</p>

<div class="eg"><p><b>Worked example: what a router ping looks like when an ACL drops it.</b> In the standard lab, ping HR from R1 using the guest interface as source. R1's own packet is not filtered on R1, but at R2 it is transit traffic and hits ACL 10 outbound:</p>
<pre class="out">R1# ping 10.2.50.10 source GigabitEthernet0/2
Sending 5, 100-byte ICMP Echos to 10.2.50.10, timeout is 2 seconds:
Packet sent with a source address of 10.1.20.1
<span class="hl">U.U.U</span>
Success rate is 0 percent (0/5)</pre>
<p>U means an ICMP unreachable came back; the dots appear because IOS rate-limits the unreachables it sends. A router that has no route can also answer with U, so check the routing table first: if every hop has a route and you still see "U.U.U", an ACL is the prime suspect. Dots only usually mean no answer at all, for example a missing return route.</p></div>

<div class="warn"><p><b>Common mistake.</b> Applying access-class only to <code>line vty 0 4</code> on a router with 16 lines. Five sessions work as expected, then the sixth user lands on line 5 with no filter. Always configure <code>line vty 0 15</code> (or every range that exists).</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip access-group</code> goes on interfaces, <code>access-class</code> goes on lines. An answer offering <code>ip access-group 15 in</code> under <code>line vty 0 4</code> is wrong. Also: counters appear in <code>show access-lists</code>, not in <code>show ip interface</code>.</p></div>

<div class="scn"><h4>Who keeps trying to log in?</h4><p>A bank's network team saw repeated login failure messages on a branch router. They applied a standard ACL with <code>access-class</code> on <code>line vty 0 15</code>, permitting only the NOC subnet and ending with <code>deny any log</code>. Within an hour the log showed <code>%SEC-6-IPACCESSLOGS: list VTY-MGMT denied 10.14.3.77 12 packets</code>. The source turned out to be a forgotten monitoring script on a desktop, not an attack. The ACL stopped the noise and the log pointed straight to the culprit.</p><p><b>Lesson:</b> a logged deny at the end of a list turns silent drops into evidence.</p></div>

<div class="iv"><p class="q">"How do you restrict SSH to a router to the management subnet, and how do you verify it?"</p><p>Strong answer: create a standard ACL permitting the management subnet (optionally <code>deny any log</code>), apply it with <code>access-class NAME in</code> under <code>line vty 0 15</code>. Verify with <code>show access-lists</code> counters, a test login from inside and outside the subnet, and the log messages. Mention that interface ACLs use ip access-group and would need to be applied everywhere, while access-class covers all interfaces at once.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces use <code>ip access-group</code>; VTY lines use <code>access-class</code>, normally with a standard ACL, on all lines.</li>
<li><code>show access-lists</code> shows counters; <code>show ip interface</code> shows where lists are applied.</li>
<li>Clear counters before testing so increments mean something; the implicit deny has no counter.</li>
<li><code>log</code> produces %SEC-6-IPACCESSLOG messages, rate-limited; log denies, not busy permits.</li>
<li>"U.U.U" on an IOS ping, with routes present on every hop, points to an ACL dropping the traffic.</li>
</ul></div>
`,hi:`
<p>Gate par laga CCTV camera bekaar hai agar koi footage dekhe hi nahi. ACL bhi aisa hi hai: use likhna aadha kaam hai; baaki aadha hai prove karna ki woh kahan apply hai, usne kya match kiya aur kya drop kiya. Yeh chapter filtering ke liye ACL jodne ke do tareeke cover karta hai, interfaces aur VTY lines, aur woh commands aur logs jo "mujhe lagta hai chal raha hai" ko saboot mein badal dete hain.</p>

<h3>Interface par ACL jodna</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out
<span class="c">! ise wapas hatao</span>
R2(config-if)# no ip access-group 10 out</pre>
<p>ACL numbered ya named, standard ya extended ho sakta hai. Chapter 7 ka one-per rule yaad rakho aur yeh fact ki jo list abhi exist nahi karti use reference karne se kuch filter nahi hota.</p>

<h3>VTY lines par ACL jodna: access-class</h3>
<p>Remote management (SSH, ya Telnet agar abhi bhi allow karte ho) virtual terminal lines par aata hai. <b>Kaun login kar sakta hai</b>, yeh control karne ke liye aap har interface filter nahi karte; aap <code>access-class</code> se lines par ek ACL lagate ho. Yeh aane wale session ka source address check karta hai, chahe woh kisi bhi interface par aaya ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VTY access-class">
<rect x="20" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">NOC PC</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.25</text>
<rect x="20" y="150" width="150" height="44" rx="8" fill="#fed7aa"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">User PC</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.10</text>
<rect x="300" y="70" width="160" height="90" rx="10" fill="#bae6fd"/><text x="380" y="98" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text><rect x="320" y="112" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="380" y="134" text-anchor="middle" class="svg-ink" font-size="12">line vty 0 15</text>
<line x1="170" y1="52" x2="320" y2="122" stroke="#64748b" stroke-width="2"/><line x1="170" y1="172" x2="320" y2="136" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="245" y="70" text-anchor="middle" class="svg-accent" font-size="12">SSH allowed</text><text x="245" y="185" text-anchor="middle" class="svg-accent" font-size="12">refuse</text>
<text x="550" y="110" text-anchor="middle" class="svg-ink" font-size="12">access-class</text><text x="550" y="128" text-anchor="middle" class="svg-ink" font-size="12">VTY-MGMT in</text>
</svg><p class="cap">access-class check karta hai ki router se khud session kaun khol sakta hai, session chahe kisi bhi interface par aaye.</p></div>

<pre class="code">EDGE1(config)# ip access-list standard VTY-MGMT
EDGE1(config-std-nacl)# remark NOC subnet only
EDGE1(config-std-nacl)# permit 10.99.0.0 0.0.0.255
EDGE1(config-std-nacl)# deny any log
EDGE1(config-std-nacl)# exit
EDGE1(config)# line vty 0 15
EDGE1(config-line)# access-class VTY-MGMT in</pre>
<ul>
<li><b>Standard</b> ACL use karo: sawaal sirf yeh hai ki "kaun connect kar raha hai?".</li>
<li>Ise <b>saari</b> VTY lines par apply karo (zyada tar routers par 0 4 aur 5 15), warna attacker bas doosri line le leta hai.</li>
<li><code>access-class ... in</code> router <b>tak</b> aane wale sessions filter karta hai; <code>access-class ... out</code> limit karta hai ki router mein logged-in user aage kin destinations par Telnet ya SSH kar sakta hai.</li>
<li>Interfaces par <code>ip access-group</code> aur lines par <code>access-class</code> use karo; inhe ulta karna classic error hai. SSH configuration, local users aur AAA agle module (ccna-hardening) mein aate hain.</li>
</ul>

<h3>Verification commands</h3>
<table class="cmp">
<tr><th>Command</th><th>Kya batati hai</th></tr>
<tr><td><code>show access-lists [name|number]</code></td><td>Har entry, sequence numbers aur match counters (saare protocols)</td></tr>
<tr><td><code>show ip access-lists [name|number]</code></td><td>Wahi, sirf IPv4</td></tr>
<tr><td><code>show ip interface g0/0</code></td><td>Us interface par inbound aur outbound kaunsa ACL applied hai</td></tr>
<tr><td><code>show running-config | include access-group|access-class</code></td><td>Har jagah jahan list reference hui hai</td></tr>
<tr><td><code>clear access-list counters [name]</code></td><td>Test se pehle counters reset karo taaki numbers ka matlab ho</td></tr>
</table>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.2.50.1/24
  Broadcast address is 255.255.255.255
  MTU is 1500 bytes
  Helper address is not set
  <span class="hl">Outgoing access list is 10</span>
  Inbound  access list is not set
  Proxy ARP is enabled</pre>

<h3>Counters ko sahi se padhna</h3>
<p>Counters pichhle clear ke baad kisi entry se match hue packets ginte hain. Implicit deny ka koi counter nahi. Achha test routine: counters clear karo, ek jaana-pehchana test chalao (paanch pings), aur bilkul wahi increment bilkul usi line par dhoondo jiski aapko umeed hai.</p>

<h3>Logging</h3>
<p>Entry mein <code>log</code> jodne se router match hone par syslog message bhejta hai. <code>log-input</code> input interface aur source MAC bhi record karta hai. Messages rate-limited hote hain: pehla matching packet turant log hota hai, phir har flow ke liye lagbhag har paanch minute mein packet count ke saath summary. Jo formats dikhenge:</p>
<pre class="out">%SEC-6-IPACCESSLOGS: list VTY-MGMT denied 10.1.20.10 1 packet
%SEC-6-IPACCESSLOGP: list 110 denied tcp 192.168.40.10(51522) -&gt; 172.31.1.80(21), 1 packet
<span class="hl">%SEC-6-IPACCESSLOGDP: list 110 denied icmp 192.168.40.10 -&gt; 172.31.1.80 (8/0), 1 packet</span>
%SEC-6-IPACCESSLOGNP: list 120 denied 89 10.0.0.1 -&gt; 224.0.0.5, 1 packet</pre>
<p>S standard lists ke liye, P ports wale TCP aur UDP ke liye, DP type aur code ke saath ICMP ke liye, NP baaki protocols ke liye (89 OSPF hai). Logged packets CPU process karta hai, isliye deny lines aur kabhi-kabhi hone wale events log karo, busy permit nahi.</p>

<div class="eg"><p><b>Worked example: jab ACL drop kare to router ping kaisa dikhta hai.</b> Standard lab mein R1 se HR ko guest interface ko source banakar ping karo. R1 ka apna packet R1 par filter nahi hota, par R2 par woh transit traffic hai aur outbound ACL 10 se takrata hai:</p>
<pre class="out">R1# ping 10.2.50.10 source GigabitEthernet0/2
Sending 5, 100-byte ICMP Echos to 10.2.50.10, timeout is 2 seconds:
Packet sent with a source address of 10.1.20.1
<span class="hl">U.U.U</span>
Success rate is 0 percent (0/5)</pre>
<p>U matlab ICMP unreachable wapas aaya; dots isliye aate hain kyunki IOS apne bheje unreachables ko rate-limit karta hai. Jis router ke paas route nahi hota woh bhi U se jawab de sakta hai, isliye pehle routing table check karo: agar har hop par route hai aur phir bhi "U.U.U" dikhe, to ACL sabse bada suspect hai. Sirf dots ka matlab aam taur par koi jawab hi nahi aaya, jaise missing return route.</p></div>

<div class="warn"><p><b>Common galti.</b> 16 lines wale router par access-class sirf <code>line vty 0 4</code> par lagana. Paanch sessions umeed ke mutabik chalte hain, phir chhatha user line 5 par pahunchta hai jahan koi filter nahi. Hamesha <code>line vty 0 15</code> (ya jo bhi range exist karti hai) configure karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip access-group</code> interfaces par jaata hai, <code>access-class</code> lines par. <code>line vty 0 4</code> ke neeche <code>ip access-group 15 in</code> offer karne wala answer galat hai. Aur: counters <code>show access-lists</code> mein dikhte hain, <code>show ip interface</code> mein nahi.</p></div>

<div class="scn"><h4>Baar baar login kaun try kar raha hai?</h4><p>Ek bank ki network team ko ek branch router par baar baar login failure messages dikhe. Unhone <code>line vty 0 15</code> par <code>access-class</code> ke saath ek standard ACL lagaya, jo sirf NOC subnet permit karta tha aur <code>deny any log</code> par khatam hota tha. Ek ghante ke andar log ne dikhaya <code>%SEC-6-IPACCESSLOGS: list VTY-MGMT denied 10.14.3.77 12 packets</code>. Source ek desktop par bhula hua monitoring script nikla, attack nahi. ACL ne shor rok diya aur log ne seedha culprit tak pahuncha diya.</p><p><b>Seekh:</b> list ke end mein logged deny chupchaap drops ko saboot mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Router par SSH ko management subnet tak kaise restrict karoge, aur verify kaise karoge?"</p><p>Strong answer: management subnet permit karne wala standard ACL banao (optionally <code>deny any log</code>), use <code>line vty 0 15</code> ke neeche <code>access-class NAME in</code> se apply karo. <code>show access-lists</code> counters, subnet ke andar aur bahar se test login, aur log messages se verify karo. Batao ki interface ACLs ip access-group use karte hain aur unhe har jagah lagana padega, jabki access-class ek saath saare interfaces cover kar leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces <code>ip access-group</code> use karte hain; VTY lines <code>access-class</code>, aam taur par standard ACL ke saath, saari lines par.</li>
<li><code>show access-lists</code> counters dikhata hai; <code>show ip interface</code> dikhata hai ki lists kahan applied hain.</li>
<li>Test se pehle counters clear karo taaki increments ka matlab ho; implicit deny ka koi counter nahi.</li>
<li><code>log</code> %SEC-6-IPACCESSLOG messages banata hai, rate-limited; denies log karo, busy permits nahi.</li>
<li>Har hop par route hote hue IOS ping par "U.U.U" ACL ke traffic drop karne ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};