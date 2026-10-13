var e={id:`configure-verify`,h:{en:`Configure, verify and test HSRP failover`,hi:`HSRP configure, verify aur failover test karna`},body:{en:`
<p>A fire drill is useless if nobody checks that the doors actually open. Building an HSRP group is the easy half; proving that users survive the loss of the Active router is the half that earns trust. This chapter follows the first lab of the module step by step: build group 10 on R1 and R2, verify it three ways, then break R1 on purpose and watch R2 take over.</p>

<h3>The design</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>LAN</td><td>192.168.10.0/24 on Gi0/0 of both routers, via SW1</td></tr>
<tr><td>R1 / R2 real IP</td><td>192.168.10.2 / 192.168.10.3</td></tr>
<tr><td>HSRP group and VIP</td><td>Group 10, VIP 192.168.10.1 (the PCs' gateway)</td></tr>
<tr><td>Roles</td><td>R1 Active (priority 110, preempt), R2 Standby (priority 100)</td></tr>
<tr><td>Test target</td><td>WEB 203.0.113.10 behind CORE</td></tr></table>

<h3>Step 1: R1, the preferred gateway</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 ip 192.168.10.1
<span class="c">! priority above the default 100 so R1 wins</span>
R1(config-if)# standby 10 priority 110
<span class="c">! take the role back after any outage</span>
R1(config-if)# standby 10 preempt</pre>
<p>The group spends one hold time (about 10 seconds) in Speak, then R1 logs <code>Speak -&gt; Standby</code> and <code>Standby -&gt; Active</code>. Because it is alone, it becomes Active.</p>

<h3>Step 2: R2, the backup</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# standby 10 ip 192.168.10.1
<span class="c">! priority left at 100</span>
R2(config-if)# do show standby brief</pre>
<p>R2 hears R1's hellos with priority 110 and settles as Standby. You could also type just <code>standby 10 ip</code> on R2 without an address; it would <b>learn</b> the VIP from R1's hellos. Configuring it explicitly on both routers is clearer and safer.</p>

<h3>Step 3: verify on the routers</h3>
<pre class="out">R1# show standby
GigabitEthernet0/0 - Group 10
<span class="hl">  State is Active</span>
    2 state changes, last state change 00:03:41
  Virtual IP address is 192.168.10.1
<span class="hl">  Active virtual MAC address is 0000.0c07.ac0a (MAC In Use)</span>
    Local virtual MAC address is 0000.0c07.ac0a (v1 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.216 secs
<span class="hl">  Preemption enabled</span>
  Active router is local
<span class="hl">  Standby router is 192.168.10.3, priority 100 (expires in 9.184 sec)</span>
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-10" (default)</pre>
<p>The five lines to read every time: <b>State</b>, <b>virtual MAC</b>, <b>Preemption</b>, <b>who is Active and Standby</b>, and <b>Priority</b> (current versus configured; they differ when tracking has lowered it). Then compare both routers with the one-line view:</p>
<pre class="out">R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   110 P Active  local           192.168.10.3    192.168.10.1</span>

R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   100   Standby 192.168.10.2    local           192.168.10.1</span></pre>
<p>A healthy pair tells the same story from both sides: each router names the other correctly, the group and VIP match, and there is exactly one Active.</p>

<h3>Step 4: verify from the users' side</h3>
<pre class="out">PC1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=62 time=2.114 ms
84 bytes from 203.0.113.10 icmp_seq=2 ttl=62 time=1.870 ms

PC1&gt; arp
<span class="hl">00:00:0c:07:ac:0a  192.168.10.1 expires in 116 seconds</span></pre>
<p>TTL 62 means two routers were crossed (R1 and CORE). The ARP entry shows the gateway mapped to the <b>virtual</b> MAC, which is the proof that failover will be invisible to the PC.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Failover test timeline">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="40" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 Active</text><text x="110" y="76" text-anchor="middle" class="svg-muted" font-size="12">ping OK via R1</text>
<rect x="240" y="40" width="160" height="44" rx="8" fill="#fed7aa"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0 shutdown</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">R1 sends Resign</text>
<rect x="450" y="40" width="160" height="44" rx="8" fill="#bae6fd"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="13">R2 Active</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">ping OK via R2</text>
<rect x="240" y="140" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">R1 no shutdown</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">preempt: Coup</text>
<rect x="450" y="140" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">R1 Active again</text><text x="530" y="176" text-anchor="middle" class="svg-muted" font-size="12">R2 back to Standby</text>
</svg><p class="cap">The lab's failover test: shut, verify through R2, restore, verify R1 preempts.</p></div>

<h3>Step 5: the failover test</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# shutdown
<span class="c">! from PC1: ping 203.0.113.10 again, it still works</span>
R1(config-if)# no shutdown</pre>
<pre class="out"><span class="hl">R2: %HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Standby -&gt; Active</span>

R1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   110 P Active  local           192.168.10.3    192.168.10.1</span></pre>
<p>When you <b>shut</b> the Active interface, R1 sends a <b>Resign</b> first, so R2 goes Active almost instantly. When R1 returns, its preempt makes it send a <b>Coup</b>; R2 gives up the Active role and returns to Standby (real IOS may show it passing briefly through Speak). A shutdown is a polite test. A <b>pulled cable or a power failure</b> sends no Resign, so R2 waits for the full 10-second hold time. Test both ways before you promise a failover time.</p>

<div class="eg"><p><b>Worked example.</b> With default timers, a continuous ping from PC1 during a cable pull on R1 loses about 3 to 5 replies at one per second, before R2 takes over after the 10-second hold time. With <code>shutdown</code> on R1 it usually loses zero or one. The difference is the Resign message.</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing failover only with <code>shutdown</code> and reporting "sub-second failover" to management. A real power loss or cable cut takes up to the hold time. Also make sure the DHCP pool hands out <code>default-router 192.168.10.1</code>, the VIP, and not a router's real address.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show standby brief</code> is the command to name for "verify which router is Active". The <b>P</b> column means preempt is configured, not "primary". And the Standby router's own <code>show standby</code> shows <code>Active virtual MAC ... (MAC Not In Use)</code> locally; only the Active router uses it.</p></div>

<div class="scn"><h4>The failover test that passed but the users did not</h4><p>An insurance office in Pune shut R1's LAN interface during a drill: HSRP moved to R2 perfectly. Two weeks later a real power cut hit R1 and half the floor lost access for good. The engineer found that the DHCP scope still gave out 192.168.10.2, R1's real address, as the default router; the drill had only been checked on the engineer's own laptop with a static gateway of .1. After fixing the scope to the VIP, the next drill included a check of a DHCP client's gateway.</p><p><b>Lesson:</b> verify from the users' side, including how they learn their gateway.</p></div>

<div class="iv"><p class="q">"How would you prove that an HSRP gateway pair really fails over?"</p><p>Strong answer: check <code>show standby brief</code> on both routers for one Active, one Standby and matching group and VIP; confirm hosts use the VIP and that their ARP entry is the virtual MAC; run a continuous ping from a client, fail the Active router both by shutdown (Resign, near instant) and by a physical failure (hold time), watch the STATECHANGE logs, then restore it and confirm preempt returns the role if designed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum config: <code>standby &lt;group&gt; ip &lt;VIP&gt;</code>; add priority and preempt on the preferred router.</li>
<li><code>show standby brief</code> on both routers must tell the same story.</li>
<li>On the PC, the gateway must map to the virtual MAC.</li>
<li>Shutdown triggers a Resign (fast); a physical failure waits for the hold time.</li>
<li>With preempt, the preferred router takes the role back with a Coup.</li>
</ul></div>
`,hi:`
<p>Fire drill bekaar hai agar koi check hi na kare ki darwaze sach mein khulte hain. HSRP group banana aasaan aadha hissa hai; yeh sabit karna ki Active router jaane par bhi users bache rehte hain, woh aadha hissa hai jo bharosa kamata hai. Yeh chapter module ke pehle lab ko step by step follow karta hai: R1 aur R2 par group 10 banao, use teen tarike se verify karo, phir jaan-boojh kar R1 ko todo aur dekho R2 kaise kaam sambhalta hai.</p>

<h3>Design</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>LAN</td><td>Dono routers ke Gi0/0 par 192.168.10.0/24, SW1 ke through</td></tr>
<tr><td>R1 / R2 asli IP</td><td>192.168.10.2 / 192.168.10.3</td></tr>
<tr><td>HSRP group aur VIP</td><td>Group 10, VIP 192.168.10.1 (PCs ka gateway)</td></tr>
<tr><td>Roles</td><td>R1 Active (priority 110, preempt), R2 Standby (priority 100)</td></tr>
<tr><td>Test target</td><td>CORE ke peeche WEB 203.0.113.10</td></tr></table>

<h3>Step 1: R1, preferred gateway</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 ip 192.168.10.1
<span class="c">! default 100 se upar priority taaki R1 jeete</span>
R1(config-if)# standby 10 priority 110
<span class="c">! kisi bhi outage ke baad role wapas lo</span>
R1(config-if)# standby 10 preempt</pre>
<p>Group ek hold time (lagbhag 10 second) Speak mein rehta hai, phir R1 <code>Speak -&gt; Standby</code> aur <code>Standby -&gt; Active</code> log karta hai. Kyunki woh akela hai, woh Active ban jaata hai.</p>

<h3>Step 2: R2, backup</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/0
R2(config-if)# standby 10 ip 192.168.10.1
<span class="c">! priority 100 par chhodi</span>
R2(config-if)# do show standby brief</pre>
<p>R2 priority 110 wale R1 ke hellos sunta hai aur Standby ban kar baith jaata hai. Aap R2 par bina address ke sirf <code>standby 10 ip</code> bhi likh sakte ho; woh R1 ke hellos se VIP <b>seekh</b> lega. Dono routers par explicitly configure karna zyada clear aur safe hai.</p>

<h3>Step 3: routers par verify</h3>
<pre class="out">R1# show standby
GigabitEthernet0/0 - Group 10
<span class="hl">  State is Active</span>
    2 state changes, last state change 00:03:41
  Virtual IP address is 192.168.10.1
<span class="hl">  Active virtual MAC address is 0000.0c07.ac0a (MAC In Use)</span>
    Local virtual MAC address is 0000.0c07.ac0a (v1 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.216 secs
<span class="hl">  Preemption enabled</span>
  Active router is local
<span class="hl">  Standby router is 192.168.10.3, priority 100 (expires in 9.184 sec)</span>
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-10" (default)</pre>
<p>Har baar yeh paanch lines padho: <b>State</b>, <b>virtual MAC</b>, <b>Preemption</b>, <b>Active aur Standby kaun hain</b>, aur <b>Priority</b> (current banaam configured; jab tracking ne ise kam kiya ho to dono alag hote hain). Phir one-line view se dono routers compare karo:</p>
<pre class="out">R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   110 P Active  local           192.168.10.3    192.168.10.1</span>

R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   100   Standby 192.168.10.2    local           192.168.10.1</span></pre>
<p>Healthy pair dono taraf se ek hi kahaani sunata hai: har router doosre ka sahi naam leta hai, group aur VIP match karte hain, aur bilkul ek Active hai.</p>

<h3>Step 4: users ki taraf se verify</h3>
<pre class="out">PC1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=62 time=2.114 ms
84 bytes from 203.0.113.10 icmp_seq=2 ttl=62 time=1.870 ms

PC1&gt; arp
<span class="hl">00:00:0c:07:ac:0a  192.168.10.1 expires in 116 seconds</span></pre>
<p>TTL 62 ka matlab do routers cross hue (R1 aur CORE). ARP entry gateway ko <b>virtual</b> MAC par map dikhati hai, jo sabut hai ki failover PC ko dikhega hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Failover test timeline">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="40" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 Active</text><text x="110" y="76" text-anchor="middle" class="svg-muted" font-size="12">R1 se ping OK</text>
<rect x="240" y="40" width="160" height="44" rx="8" fill="#fed7aa"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0 shutdown</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">R1 Resign bhejta hai</text>
<rect x="450" y="40" width="160" height="44" rx="8" fill="#bae6fd"/><text x="530" y="60" text-anchor="middle" class="svg-ink" font-size="13">R2 Active</text><text x="530" y="76" text-anchor="middle" class="svg-muted" font-size="12">R2 se ping OK</text>
<rect x="240" y="140" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">R1 no shutdown</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">preempt: Coup</text>
<rect x="450" y="140" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="13">R1 phir Active</text><text x="530" y="176" text-anchor="middle" class="svg-muted" font-size="12">R2 wapas Standby</text>
</svg><p class="cap">Lab ka failover test: shut karo, R2 se verify karo, restore karo, verify karo ki R1 preempt karta hai.</p></div>

<h3>Step 5: failover test</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# shutdown
<span class="c">! PC1 se: ping 203.0.113.10 dobara, ab bhi chalta hai</span>
R1(config-if)# no shutdown</pre>
<pre class="out"><span class="hl">R2: %HSRP-5-STATECHANGE: GigabitEthernet0/0 Grp 10 state Standby -&gt; Active</span>

R1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   110 P Active  local           192.168.10.3    192.168.10.1</span></pre>
<p>Jab aap Active interface <b>shut</b> karte ho, R1 pehle <b>Resign</b> bhejta hai, isliye R2 lagbhag turant Active ho jaata hai. Jab R1 wapas aata hai, uska preempt use <b>Coup</b> bhejne par majboor karta hai; R2 Active role chhod deta hai aur wapas Standby ban jaata hai (asli IOS use thodi der ke liye Speak se guzarte dikha sakta hai). Shutdown ek tameez wala test hai. <b>Nikala hua cable ya power failure</b> koi Resign nahi bhejta, isliye R2 poora 10-second hold time wait karta hai. Failover time ka vaada karne se pehle dono tarike se test karo.</p>

<div class="eg"><p><b>Worked example.</b> Default timers ke saath, R1 ka cable nikalne ke dauraan PC1 se har second chalne wala continuous ping lagbhag 3 se 5 replies khota hai, jab tak R2 10-second hold time ke baad kaam na sambhale. R1 par <code>shutdown</code> se aam taur par zero ya ek reply jaata hai. Fark Resign message ka hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Failover sirf <code>shutdown</code> se test karna aur management ko "sub-second failover" report kar dena. Asli power loss ya cable cut mein hold time tak lag sakta hai. Yeh bhi pakka karo ki DHCP pool <code>default-router 192.168.10.1</code>, yaani VIP, de raha hai, kisi router ka asli address nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa router Active hai verify karo" ke liye <code>show standby brief</code> command ka naam lo. <b>P</b> column ka matlab preempt configured hai, "primary" nahi. Aur Standby router ka apna <code>show standby</code> locally <code>Active virtual MAC ... (MAC Not In Use)</code> dikhata hai; sirf Active router use use karta hai.</p></div>

<div class="scn"><h4>Failover test pass hua par users nahi</h4><p>Pune ke ek insurance office ne drill ke dauraan R1 ka LAN interface shut kiya: HSRP perfectly R2 par chala gaya. Do hafte baad asli power cut R1 par aaya aur aadhe floor ka access poori tarah chala gaya. Engineer ne paaya ki DHCP scope abhi bhi default router ke roop mein 192.168.10.2, R1 ka asli address, de raha tha; drill sirf engineer ke apne laptop par check hui thi jiska static gateway .1 tha. Scope ko VIP par theek karne ke baad, agli drill mein ek DHCP client ke gateway ka check bhi shaamil tha.</p><p><b>Seekh:</b> users ki taraf se verify karo, is baat samet ki woh apna gateway kaise seekhte hain.</p></div>

<div class="iv"><p class="q">"Aap kaise sabit karoge ki HSRP gateway pair sach mein fail over karta hai?"</p><p>Strong answer: dono routers par <code>show standby brief</code> mein ek Active, ek Standby aur matching group aur VIP check karo; confirm karo ki hosts VIP use karte hain aur unki ARP entry virtual MAC hai; client se continuous ping chalao, Active router ko shutdown (Resign, lagbhag turant) aur physical failure (hold time) dono se fail karo, STATECHANGE logs dekho, phir use restore karo aur confirm karo ki design ke hisaab se preempt role wapas deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum config: <code>standby &lt;group&gt; ip &lt;VIP&gt;</code>; preferred router par priority aur preempt jodo.</li>
<li>Dono routers par <code>show standby brief</code> ek hi kahaani sunaye.</li>
<li>PC par gateway virtual MAC par map hona chahiye.</li>
<li>Shutdown Resign trigger karta hai (fast); physical failure hold time ka wait karta hai.</li>
<li>Preempt ke saath preferred router Coup se role wapas le leta hai.</li>
</ul></div>
`}};export{e as default};