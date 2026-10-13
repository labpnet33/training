var e={id:`troubleshooting`,h:{en:`Troubleshooting HA: the bundle that will not come up`,hi:`HA troubleshooting: woh bundle jo up nahi hota`},body:{en:`
<p>HA faults are sneaky because a redundant network usually keeps working while it is broken. The bundle runs on one cable, the backup router has the wrong priority, and nobody knows until the second failure arrives. A good engineer therefore troubleshoots with a checklist and verifies every layer separately. This chapter gives that checklist and then walks through the troubleshooting lab, where three independent mistakes keep a LAG down.</p>

<h3>The HA checklist</h3>
<table class="cmp"><tr><th>Layer</th><th>Question</th><th>Command</th></tr>
<tr><td>Interface</td><td>Does the ae interface exist and is it up?</td><td><code>show interfaces terse ae0</code></td></tr>
<tr><td>LACP</td><td>Are both sides speaking and are all members collecting/distributing?</td><td><code>show lacp interfaces</code></td></tr>
<tr><td>Members</td><td>Same speed, same duplex, right ports?</td><td><code>show interfaces ge-0/0/5</code>, <code>show configuration interfaces ge-0/0/5</code></td></tr>
<tr><td>VRRP</td><td>Who is master, with what priority, and why?</td><td><code>show vrrp</code>, <code>show vrrp detail</code>, <code>show vrrp track</code></td></tr>
<tr><td>RE state</td><td>Is the backup ready and synchronised?</td><td><code>show system switchover</code>, <code>show task replication</code></td></tr>
<tr><td>End to end</td><td>Do hosts reach the gateway and beyond?</td><td><code>ping</code> from a host</td></tr></table>
<p>Always work from the bottom up: the ae interface must exist before LACP can run, LACP must work before the VLAN trunk carries traffic, and the trunk must work before the gateway is reachable.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three faults in the LAG lab">
<rect x="20" y="40" width="170" height="70" rx="10" fill="#fed7aa"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 1 (SWB)</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">no device-count</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 2 (both)</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">passive + passive</text>
<rect x="450" y="40" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 3 (SWA)</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">speed 100m on a member</text>
<text x="212" y="80" text-anchor="middle" class="svg-ink" font-size="18">&#8594;</text><text x="427" y="80" text-anchor="middle" class="svg-ink" font-size="18">&#8594;</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Each fix reveals the next one. Check again after every commit.</text>
</svg><p class="cap">Three mistakes hide behind each other. Fix them in the order the symptoms appear.</p></div>

<h3>Lab walkthrough: Indore warehouse, SWA and SWB</h3>
<p>SWA (core, with IRB 10.60.0.1) and SWB (access, with the operations PC OPS1 at 10.60.0.40) are cabled with two links, ge-0/0/4 and ge-0/0/5, for ae0. OPS1 cannot reach its gateway.</p>

<h4>Fault 1: the ae interface does not exist on SWB</h4>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
<span class="hl">error: device ae0 not found</span></pre>
<p>Compare <code>show configuration chassis</code> on both: SWA has <code>aggregated-devices ethernet device-count 1</code>, SWB does not. The members reference ae0, the commit succeeded, and nothing exists. Fix:</p>
<pre class="code"><span class="c">! SWB</span>
set chassis aggregated-devices ethernet device-count 1
commit</pre>
<p>Now the interface appears, but it is down:</p>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
Interface               Admin Link Proto    Local                 Remote
ae0                     up    <span class="hl">down</span>
ae0.0                   up    <span class="hl">down</span> eth-switch</pre>

<h4>Fault 2: both sides are passive</h4>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/4     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
      ge-0/0/5       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/5     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                 <span class="hl">Defaulted</span>     <span class="hl">No periodic</span>                 <span class="hl">Detached</span>
      ge-0/0/5                 <span class="hl">Defaulted</span>     <span class="hl">No periodic</span>                 <span class="hl">Detached</span></pre>
<p>Read it as a story: Partner Defaulted = Yes (never heard from the partner), Transmit State No periodic (I am not speaking either), Mux Detached (not in the bundle). Both are passive. Fix by making at least one side active:</p>
<pre class="code"><span class="c">! SWA</span>
set interfaces ae0 aggregated-ether-options lacp active
commit</pre>

<h4>Fault 3: one member runs at a different speed</h4>
<p>Now LACP talks, but look at the second member in the real output:</p>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/4     Partner    No    No   Yes  Yes  Yes   Yes     Slow   Passive
      ge-0/0/5       Actor    No    No    No   No   No   Yes     Slow    Active
      ge-0/0/5     Partner    No    No    No   No  <span class="hl">Yes</span>   Yes     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                   Current   Slow periodic  Collecting distributing
      ge-0/0/5                   Current   Slow periodic                  <span class="hl">Waiting</span></pre>
<p>ge-0/0/4 is fine. ge-0/0/5 is stuck at <b>Waiting</b>: the partner is synchronised (Syn Yes) but SWA's own port is not. Something local is wrong with that port. Look at its configuration and speed:</p>
<pre class="out">lab@SWA&gt; show configuration interfaces ge-0/0/5
ether-options {
    802.3ad ae0;
    <span class="hl">speed {
        100m;
    }</span>
}

lab@SWA&gt; show interfaces ge-0/0/5
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: <span class="hl">100mbps</span>, ...
  Link-mode: Half-duplex, Auto-negotiation: Enabled</pre>
<p>A leftover <code>speed 100m</code> forces this member to 100 Mbps, different from its siblings, so LACP keeps it out. Fix:</p>
<pre class="code"><span class="c">! SWA</span>
delete interfaces ge-0/0/5 ether-options speed
commit</pre>

<h4>The proof</h4>
<pre class="out">lab@SWA&gt; show lacp interfaces
      ge-0/0/4       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/5       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                   Current   Slow periodic  <span class="hl">Collecting distributing</span>
      ge-0/0/5                   Current   Slow periodic  <span class="hl">Collecting distributing</span>

lab@SWA&gt; show interfaces ae0 terse
ae0                     up    up
ae0.0                   up    up   eth-switch

OPS1&gt; ping 10.60.0.1
84 bytes from 10.60.0.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>

<h3>Other HA symptoms you should recognise</h3>
<ul>
<li><b>Gateway does not answer ping, hosts are fine:</b> VRRP master without <code>accept-data</code> (chapter 4).</li>
<li><b>VRRP did not fail over when the uplink died:</b> no tracking, or a cost too small. Read <code>show vrrp detail</code> for current vs configured priority (chapter 5).</li>
<li><b>Two VRRP masters:</b> the routers cannot hear each other (VLAN mismatch, wrong group number, filtered 224.0.0.18).</li>
<li><b>NSR will not commit:</b> GRES or commit synchronize is missing, or graceful restart is also on (chapter 6).</li>
<li><b>VC member shows as unprovisioned:</b> its serial number is not in the preprovisioned list (chapter 7).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You are told "OPS1 cannot ping the gateway". You check ae0 (exists? up?), then LACP (talking? both members Collecting distributing?), then the member ports (speed, duplex), then VLAN trunk membership, and finally the gateway. Each check is a yes/no answer that narrows the fault to one layer.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the first fault and walking away before the next command shows the second; reading "Link Up" on the members as proof the bundle works; changing two things in one commit, so you cannot tell which one fixed it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Memorise the LACP symptoms. Receive Defaulted + No periodic + Detached = nobody active. One member Waiting = a local mismatch such as speed. "device ae0 not found" = missing device-count.</p></div>

<div class="scn"><h4>Half a bundle, three weeks</h4><p>A university bundle between two buildings had been running on one 1 Gbps member for three weeks because the second member was Waiting due to a forced speed. Nobody noticed until the first member's optic failed and a whole building lost the network. After the postmortem, the team added a monitoring check on <code>show lacp interfaces</code> counts and a rule: after any change, compare expected and actual members.</p><p><b>Lesson:</b> redundancy that is not monitored silently disappears.</p></div>

<div class="iv"><p class="q">"A LAG will not come up. Walk me through your troubleshooting."</p><p>I verify that ae0 exists on both ends (device-count), check <code>show lacp interfaces</code> for receive state, mux state and the Defaulted flag, make sure at least one side is active, then compare member speed, duplex and membership. After each fix I re-check, since faults hide each other, and I finish with a host ping across the bundle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom up: ae interface, LACP, members, VLANs, gateway.</li>
<li>"device ae0 not found" means device-count is missing on that switch.</li>
<li>Defaulted, No periodic and Detached mean no side is active.</li>
<li>One member in Waiting points to a local mismatch such as a forced speed.</li>
<li>Re-check after every commit and monitor redundancy so it cannot fail silently.</li>
</ul></div>
`,hi:`
<p>HA faults chhupe-rustam hote hain kyunki redundant network toota hua hone par bhi aam taur par chalta rehta hai. Bundle ek cable par chalta hai, backup router ki priority galat hai, aur kisi ko pata nahi chalta jab tak doosra failure na aa jaaye. Isliye achha engineer checklist se troubleshoot karta hai aur har layer alag verify karta hai. Yeh chapter woh checklist deta hai aur phir troubleshooting lab walk-through karta hai, jahan teen alag galtiyan LAG ko down rakhti hain.</p>

<h3>HA checklist</h3>
<table class="cmp"><tr><th>Layer</th><th>Sawal</th><th>Command</th></tr>
<tr><td>Interface</td><td>ae interface exist karta hai aur up hai?</td><td><code>show interfaces terse ae0</code></td></tr>
<tr><td>LACP</td><td>Dono sides bol rahi hain aur saare members collecting/distributing hain?</td><td><code>show lacp interfaces</code></td></tr>
<tr><td>Members</td><td>Same speed, same duplex, sahi ports?</td><td><code>show interfaces ge-0/0/5</code>, <code>show configuration interfaces ge-0/0/5</code></td></tr>
<tr><td>VRRP</td><td>Master kaun hai, kis priority ke saath, aur kyun?</td><td><code>show vrrp</code>, <code>show vrrp detail</code>, <code>show vrrp track</code></td></tr>
<tr><td>RE state</td><td>Backup ready aur synchronised hai?</td><td><code>show system switchover</code>, <code>show task replication</code></td></tr>
<tr><td>End to end</td><td>Hosts gateway aur uske aage tak pahunchte hain?</td><td>host se <code>ping</code></td></tr></table>
<p>Hamesha neeche se upar kaam karo: LACP chalne se pehle ae interface exist karna chahiye, VLAN trunk traffic le jaane se pehle LACP kaam karna chahiye, aur gateway reachable hone se pehle trunk kaam karna chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="LAG lab ke teen faults">
<rect x="20" y="40" width="170" height="70" rx="10" fill="#fed7aa"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 1 (SWB)</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">device-count nahi</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 2 (dono)</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">passive + passive</text>
<rect x="450" y="40" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">Fault 3 (SWA)</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">member par speed 100m</text>
<text x="212" y="80" text-anchor="middle" class="svg-ink" font-size="18">&#8594;</text><text x="427" y="80" text-anchor="middle" class="svg-ink" font-size="18">&#8594;</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Har fix agla fault dikhata hai. Har commit ke baad dobara check karo.</text>
</svg><p class="cap">Teen galtiyan ek doosre ke peeche chhupi hain. Symptoms ke order mein theek karo.</p></div>

<h3>Lab walkthrough: Indore warehouse, SWA aur SWB</h3>
<p>SWA (core, IRB 10.60.0.1 ke saath) aur SWB (access, operations PC OPS1 10.60.0.40 ke saath) ae0 ke liye do links, ge-0/0/4 aur ge-0/0/5, se cable hain. OPS1 apne gateway tak nahi pahunch pa raha.</p>

<h4>Fault 1: SWB par ae interface exist nahi karta</h4>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
<span class="hl">error: device ae0 not found</span></pre>
<p>Dono par <code>show configuration chassis</code> compare karo: SWA mein <code>aggregated-devices ethernet device-count 1</code> hai, SWB mein nahi. Members ae0 ko refer karte hain, commit ho gaya, aur kuch bana hi nahi. Fix:</p>
<pre class="code"><span class="c">! SWB</span>
set chassis aggregated-devices ethernet device-count 1
commit</pre>
<p>Ab interface dikhta hai, lekin down hai:</p>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
Interface               Admin Link Proto    Local                 Remote
ae0                     up    <span class="hl">down</span>
ae0.0                   up    <span class="hl">down</span> eth-switch</pre>

<h4>Fault 2: dono sides passive hain</h4>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/4     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
      ge-0/0/5       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/5     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                 <span class="hl">Defaulted</span>     <span class="hl">No periodic</span>                 <span class="hl">Detached</span>
      ge-0/0/5                 <span class="hl">Defaulted</span>     <span class="hl">No periodic</span>                 <span class="hl">Detached</span></pre>
<p>Ise kahani ki tarah padho: Partner Defaulted = Yes (partner se kabhi suna nahi), Transmit State No periodic (main bhi nahi bol raha), Mux Detached (bundle mein nahi). Dono passive hain. Kam se kam ek side active karke fix karo:</p>
<pre class="code"><span class="c">! SWA</span>
set interfaces ae0 aggregated-ether-options lacp active
commit</pre>

<h4>Fault 3: ek member alag speed par chal raha hai</h4>
<p>Ab LACP baat karta hai, lekin real output mein doosra member dekho:</p>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/4     Partner    No    No   Yes  Yes  Yes   Yes     Slow   Passive
      ge-0/0/5       Actor    No    No    No   No   No   Yes     Slow    Active
      ge-0/0/5     Partner    No    No    No   No  <span class="hl">Yes</span>   Yes     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                   Current   Slow periodic  Collecting distributing
      ge-0/0/5                   Current   Slow periodic                  <span class="hl">Waiting</span></pre>
<p>ge-0/0/4 theek hai. ge-0/0/5 <b>Waiting</b> par atka hai: partner synchronised hai (Syn Yes) lekin SWA ka apna port nahi. Us port mein kuch local galat hai. Uski configuration aur speed dekho:</p>
<pre class="out">lab@SWA&gt; show configuration interfaces ge-0/0/5
ether-options {
    802.3ad ae0;
    <span class="hl">speed {
        100m;
    }</span>
}

lab@SWA&gt; show interfaces ge-0/0/5
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: <span class="hl">100mbps</span>, ...
  Link-mode: Half-duplex, Auto-negotiation: Enabled</pre>
<p>Bacha hua <code>speed 100m</code> is member ko 100 Mbps par force karta hai, apne saathiyon se alag, isliye LACP use bahar rakhta hai. Fix:</p>
<pre class="code"><span class="c">! SWA</span>
delete interfaces ge-0/0/5 ether-options speed
commit</pre>

<h4>Saboot</h4>
<pre class="out">lab@SWA&gt; show lacp interfaces
      ge-0/0/4       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/5       Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                   Current   Slow periodic  <span class="hl">Collecting distributing</span>
      ge-0/0/5                   Current   Slow periodic  <span class="hl">Collecting distributing</span>

lab@SWA&gt; show interfaces ae0 terse
ae0                     up    up
ae0.0                   up    up   eth-switch

OPS1&gt; ping 10.60.0.1
84 bytes from 10.60.0.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>

<h3>Doosre HA symptoms jo pehchanne chahiye</h3>
<ul>
<li><b>Gateway ping ka jawab nahi deta, hosts theek hain:</b> <code>accept-data</code> ke bina VRRP master (chapter 4).</li>
<li><b>Uplink mara to VRRP failover nahi hua:</b> tracking nahi, ya cost bahut chhoti. Current banaam configured priority ke liye <code>show vrrp detail</code> padho (chapter 5).</li>
<li><b>Do VRRP masters:</b> routers ek doosre ko sun nahi paate (VLAN mismatch, galat group number, 224.0.0.18 filtered).</li>
<li><b>NSR commit nahi hota:</b> GRES ya commit synchronize missing, ya graceful restart bhi on hai (chapter 6).</li>
<li><b>VC member unprovisioned dikhta hai:</b> uska serial number preprovisioned list mein nahi (chapter 7).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aapko bataya jaata hai "OPS1 gateway ko ping nahi kar pa raha". Aap ae0 check karte ho (exist? up?), phir LACP (baat kar raha? dono members Collecting distributing?), phir member ports (speed, duplex), phir VLAN trunk membership, aur aakhir mein gateway. Har check haan/na ka jawab hai jo fault ko ek layer tak le aata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pehla fault theek karke chale jaana jabki agla command doosra dikha deta; members par "Link Up" ko bundle chalne ka saboot maan lena; ek commit mein do cheezein badalna, jisse pata nahi chalta kisne theek kiya.</p></div>
<div class="exam"><p><b>Exam trap.</b> LACP symptoms yaad karo. Receive Defaulted + No periodic + Detached = koi active nahi. Ek member Waiting = local mismatch jaise speed. "device ae0 not found" = device-count missing.</p></div>

<div class="scn"><h4>Aadha bundle, teen hafte</h4><p>Do buildings ke beech ek university bundle teen hafte se ek 1 Gbps member par chal raha tha kyunki doosra member forced speed ki wajah se Waiting tha. Kisi ko pata nahi chala jab tak pehle member ka optic fail nahi hua aur ek poori building network kho baithi. Postmortem ke baad team ne <code>show lacp interfaces</code> counts par monitoring check jodi aur rule banaya: har change ke baad expected aur actual members compare karo.</p><p><b>Lesson:</b> jo redundancy monitor nahi hoti woh chupchap gayab ho jaati hai.</p></div>

<div class="iv"><p class="q">"LAG up nahi aa raha. Apni troubleshooting samjhao."</p><p>Main verify karta hoon ki ae0 dono ends par exist karta hai (device-count), receive state, mux state aur Defaulted flag ke liye <code>show lacp interfaces</code> dekhta hoon, ensure karta hoon ki kam se kam ek side active hai, phir member speed, duplex aur membership compare karta hoon. Har fix ke baad dobara check karta hoon kyunki faults ek doosre ko chhupate hain, aur bundle ke paar host ping se khatam karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar troubleshoot karo: ae interface, LACP, members, VLANs, gateway.</li>
<li>"device ae0 not found" matlab us switch par device-count missing hai.</li>
<li>Defaulted, No periodic aur Detached matlab koi side active nahi.</li>
<li>Ek member Waiting par ho to local mismatch jaise forced speed.</li>
<li>Har commit ke baad dobara check karo aur redundancy monitor karo taaki woh chupchap fail na ho.</li>
</ul></div>
`}};export{e as default};