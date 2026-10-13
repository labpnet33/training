var e={id:`toolkit`,h:{en:`The simulator toolkit: host shell, show commands and how a task is checked`,hi:`Simulator toolkit: host shell, show commands aur task kaise check hota hai`},body:{en:`
<p>Before the labs, let us meet the tools. A good engineer always asks two questions: "what do I type?" and "how do I know it worked?". This chapter answers both for the simulator, so the labs in chapters 7 and 8 do not surprise you.</p>

<h3>Two kinds of devices, two kinds of prompt</h3>
<p><b>Routers and switches</b> use an IOS XE style command line. You start in <i>user mode</i> (prompt <code>R1&gt;</code>), type <code>enable</code> to reach <i>privileged mode</i> (<code>R1#</code>), and type <code>configure terminal</code> to reach <i>global configuration</i> (<code>R1(config)#</code>). Inside it you open sub-modes such as an interface (<code>R1(config-if)#</code>). <code>end</code> brings you back to <code>R1#</code>. Show commands run from <code>R1#</code>.</p>
<p><b>PCs and servers</b> are hosts. They have a simpler shell with a few special commands that act as the "applications" in our network: a lecture player, a phone, a download.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Command modes of a router">
<rect x="10" y="60" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1&gt;</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="11">user mode</text>
<rect x="175" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1#</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="11">privileged, show</text>
<rect x="340" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1(config)#</text><text x="405" y="106" text-anchor="middle" class="svg-muted" font-size="11">global config</text>
<rect x="505" y="60" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="88" text-anchor="middle" class="svg-ink" font-size="13">(config-if)#</text><text x="567" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface</text>
<line x1="140" y1="90" x2="175" y2="90" stroke="#64748b" stroke-width="2"/><line x1="305" y1="90" x2="340" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="505" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="157" y="80" text-anchor="middle" class="svg-muted" font-size="11">enable</text><text x="322" y="80" text-anchor="middle" class="svg-muted" font-size="11">conf t</text><text x="487" y="80" text-anchor="middle" class="svg-muted" font-size="11">interface</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">exit goes one level back; end goes straight to R1#</text>
</svg><p class="cap">Know your prompt: it tells you which commands are available.</p></div>

<h3>The host shell: join, mcast, traffic</h3>
<table class="cmp"><tr><th>Command (on a PC)</th><th>What it does</th></tr>
<tr><td><code>join 239.20.1.1</code></td><td>The PC asks to receive the group (sends an IGMP report). Use <code>leave 239.20.1.1</code> to stop.</td></tr>
<tr><td><code>mcast 239.20.1.1 10</code></td><td>The PC acts as a source and sends 10 packets to the group.</td></tr>
<tr><td><code>show mcast</code></td><td>Lists groups this PC joined and how many packets it received.</td></tr>
<tr><td><code>traffic 10.20.0.100 udp/20000 400 10</code></td><td>Generates a flow: destination, protocol/port, rate in kbps, duration in seconds. Optional: <code>dscp X</code>, <code>size N</code>.</td></tr>
<tr><td><code>traffic show</code></td><td>Shows each flow: packets sent, delivered and the loss percentage.</td></tr></table>
<pre class="out">PHONE# traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      10/10 2500      2500       0.0%
(* = still running)</pre>
<p>Notice the DSCP column: the PC itself sends DSCP 0. Any other value you see later was written by a router on the way. That is exactly what lab 2 proves.</p>

<h3>The show commands you will use</h3>
<table class="cmp"><tr><th>Question</th><th>Command (on a router)</th></tr>
<tr><td>Do I see PIM neighbours?</td><td><code>show ip pim neighbor</code></td></tr>
<tr><td>Which RP does this router use?</td><td><code>show ip pim rp mapping</code></td></tr>
<tr><td>Did the receiver's join arrive?</td><td><code>show ip igmp groups</code></td></tr>
<tr><td>What is the multicast state?</td><td><code>show ip mroute &lt;group&gt;</code></td></tr>
<tr><td>Is my class-map right?</td><td><code>show class-map</code></td></tr>
<tr><td>Is my policy right?</td><td><code>show policy-map</code></td></tr>
<tr><td>Did traffic hit my classes?</td><td><code>show policy-map interface &lt;int&gt; input|output</code></td></tr></table>
<p>Here is the QoS counter view after lab 2. It shows which class received how many packets and how many were marked:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 input
 GigabitEthernet0/0
  Service-policy input: MARK-IN
    Class-map: VOICE (match-any)
      <span class="hl">2500 packets, 500000 bytes</span>
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 2500</span>
    Class-map: class-default (match-any)
      12500 packets, 2500000 bytes
      Match: any</pre>

<h3>How a task is checked</h3>
<p>Each lab has a short list of <b>tasks</b>. The checker does not read your commands as text. It looks at the <b>result</b> inside the simulated network: is multicast routing on, how many PIM neighbours does R2 have, which RP does R3 use, did the PC receive packets, did packets with DSCP 46 leave the interface, how many packets did class VOICE count. If the state is right, the task turns green, no matter how you reached it. A few tasks ask you to read an output and type an answer in a small box; for those the checker also notes that you actually ran the show command.</p>
<p>Two useful habits follow from this. First, <b>verify after every change</b> with the show command, because that is also what the checker sees. Second, if a task stays red, read the hint: it first gives the idea, then the commands.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing configuration commands at the <code>R1#</code> prompt instead of after <code>configure terminal</code>. (2) Forgetting <code>end</code> and then running show commands inside config mode (use <code>do show ...</code> or <code>end</code> first). (3) Starting the stream before anybody has joined, then checking too early; wait a few seconds and look again.</p></div>

<div class="exam"><p><b>Exam trap.</b> On real IOS XE, <code>show running-config</code> shows configuration, but it does not prove the feature works. Always verify behaviour with operational commands such as <code>show ip mroute</code> and <code>show policy-map interface</code>.</p></div>

<div class="scn"><h4>The green tick that was not</h4><p>A trainee configured PIM on all routers, saw a clean running-config, and called the job done. The stream did not arrive. A single <code>show ip pim neighbor</code> on the middle router showed one neighbour instead of two: one interface lacked <code>ip pim sparse-mode</code>. The configuration looked complete because the missing line was simply absent, and nothing complained.</p><p><b>Lesson:</b> configuration shows what you typed; operational show commands show what is happening. Check both.</p></div>

<div class="iv"><p class="q">"How do you verify that a QoS policy is working?"</p><p>Strong answer: generate test traffic, then read <code>show policy-map interface</code> in the right direction and confirm that the expected class counts packets, that marks are applied, and that drops appear only in the classes you expect. Mention checking DSCP on the wire, for example with a capture, and re-testing under load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers use user, privileged, global-config and interface modes; PCs use a simple host shell.</li>
<li>Host commands: join, leave, mcast, show mcast, traffic, traffic show.</li>
<li>Core show commands: show ip pim neighbor, show ip igmp groups, show ip mroute, show policy-map interface.</li>
<li>The task checker looks at the resulting state, not at your typed commands.</li>
<li>Verify every change with an operational show command.</li>
</ul></div>
`,hi:`
<p>Labs se pehle, tools se milte hain. Ek achha engineer hamesha do sawaal poochta hai: "main kya type karun?" aur "mujhe kaise pata chalega ki kaam kiya?". Yeh chapter simulator ke liye dono ka jawab deta hai, taaki chapters 7 aur 8 ke labs aapko surprise na karein.</p>

<h3>Do tarah ke devices, do tarah ke prompt</h3>
<p><b>Routers aur switches</b> IOS XE style command line use karte hain. Aap <i>user mode</i> (prompt <code>R1&gt;</code>) mein shuru karte ho, <i>privileged mode</i> (<code>R1#</code>) ke liye <code>enable</code> type karte ho, aur <i>global configuration</i> (<code>R1(config)#</code>) ke liye <code>configure terminal</code>. Uske andar aap interface jaise sub-modes kholte ho (<code>R1(config-if)#</code>). <code>end</code> aapko wapas <code>R1#</code> par le aata hai. Show commands <code>R1#</code> se chalte hain.</p>
<p><b>PCs aur servers</b> hosts hain. Unka simple shell hai jisme kuch special commands hain jo hamare network mein "applications" ka kaam karte hain: lecture player, phone, download.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Router ke command modes">
<rect x="10" y="60" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1&gt;</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="11">user mode</text>
<rect x="175" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1#</text><text x="240" y="106" text-anchor="middle" class="svg-muted" font-size="11">privileged, show</text>
<rect x="340" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="405" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1(config)#</text><text x="405" y="106" text-anchor="middle" class="svg-muted" font-size="11">global config</text>
<rect x="505" y="60" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="88" text-anchor="middle" class="svg-ink" font-size="13">(config-if)#</text><text x="567" y="106" text-anchor="middle" class="svg-muted" font-size="11">interface</text>
<line x1="140" y1="90" x2="175" y2="90" stroke="#64748b" stroke-width="2"/><line x1="305" y1="90" x2="340" y2="90" stroke="#64748b" stroke-width="2"/><line x1="470" y1="90" x2="505" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="157" y="80" text-anchor="middle" class="svg-muted" font-size="11">enable</text><text x="322" y="80" text-anchor="middle" class="svg-muted" font-size="11">conf t</text><text x="487" y="80" text-anchor="middle" class="svg-muted" font-size="11">interface</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">exit ek level peeche; end seedha R1# par</text>
</svg><p class="cap">Apna prompt pehchano: woh batata hai kaunse commands available hain.</p></div>

<h3>Host shell: join, mcast, traffic</h3>
<table class="cmp"><tr><th>Command (PC par)</th><th>Kya karta hai</th></tr>
<tr><td><code>join 239.20.1.1</code></td><td>PC group receive karne ko kehta hai (IGMP report bhejta hai). Rokne ke liye <code>leave 239.20.1.1</code>.</td></tr>
<tr><td><code>mcast 239.20.1.1 10</code></td><td>PC source ban kar group ko 10 packets bhejta hai.</td></tr>
<tr><td><code>show mcast</code></td><td>Is PC ne kaunse groups join kiye aur kitne packets mile, yeh dikhata hai.</td></tr>
<tr><td><code>traffic 10.20.0.100 udp/20000 400 10</code></td><td>Ek flow banata hai: destination, protocol/port, rate kbps mein, duration seconds mein. Optional: <code>dscp X</code>, <code>size N</code>.</td></tr>
<tr><td><code>traffic show</code></td><td>Har flow dikhata hai: sent, delivered packets aur loss percentage.</td></tr></table>
<pre class="out">PHONE# traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      10/10 2500      2500       0.0%
(* = still running)</pre>
<p>DSCP column dekho: PC khud DSCP 0 bhejta hai. Baad mein jo bhi dusri value dikhe woh raaste ke router ne likhi hai. Lab 2 yahi prove karta hai.</p>

<h3>Show commands jo aap use karoge</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command (router par)</th></tr>
<tr><td>PIM neighbours dikh rahe hain?</td><td><code>show ip pim neighbor</code></td></tr>
<tr><td>Yeh router kaunsa RP use karta hai?</td><td><code>show ip pim rp mapping</code></td></tr>
<tr><td>Receiver ka join pahuncha?</td><td><code>show ip igmp groups</code></td></tr>
<tr><td>Multicast state kya hai?</td><td><code>show ip mroute &lt;group&gt;</code></td></tr>
<tr><td>Mera class-map sahi hai?</td><td><code>show class-map</code></td></tr>
<tr><td>Meri policy sahi hai?</td><td><code>show policy-map</code></td></tr>
<tr><td>Traffic ne meri classes hit ki?</td><td><code>show policy-map interface &lt;int&gt; input|output</code></td></tr></table>
<p>Lab 2 ke baad QoS counter view yeh hai. Yeh dikhata hai ki kis class ko kitne packets mile aur kitne mark hue:</p>
<pre class="out">R1# show policy-map interface GigabitEthernet0/0 input
 GigabitEthernet0/0
  Service-policy input: MARK-IN
    Class-map: VOICE (match-any)
      <span class="hl">2500 packets, 500000 bytes</span>
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 2500</span>
    Class-map: class-default (match-any)
      12500 packets, 2500000 bytes
      Match: any</pre>

<h3>Task kaise check hota hai</h3>
<p>Har lab mein <b>tasks</b> ki chhoti list hoti hai. Checker aapke commands ko text ki tarah nahi padhta. Woh simulated network ke andar <b>result</b> dekhta hai: multicast routing on hai, R2 ke kitne PIM neighbours hain, R3 kaunsa RP use karta hai, PC ko packets mile, DSCP 46 wale packets interface se nikle, class VOICE ne kitne packets gine. Agar state sahi hai, task green ho jaata hai, chahe aap kisi bhi tareeke se wahan pahunche. Kuch tasks aapse output padhne aur chhote box mein jawab type karne ko kehte hain; unke liye checker yeh bhi dekhta hai ki aapne sach mein show command chalaya.</p>
<p>Isse do achhi aadatein nikalti hain. Pehli, <b>har change ke baad show command se verify karo</b>, kyunki checker bhi wahi dekhta hai. Doosri, agar task red rahe to hint padho: woh pehle idea deta hai, phir commands.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Configuration commands <code>R1#</code> prompt par type karna, <code>configure terminal</code> ke baad nahi. (2) <code>end</code> bhool kar config mode ke andar show commands chalana (<code>do show ...</code> ya pehle <code>end</code> use karo). (3) Kisi ke join karne se pehle stream shuru kar dena, phir bahut jaldi check karna; kuch second ruko aur phir dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Real IOS XE par <code>show running-config</code> configuration dikhata hai, lekin yeh prove nahi karta ki feature kaam karta hai. Behaviour hamesha operational commands se verify karo jaise <code>show ip mroute</code> aur <code>show policy-map interface</code>.</p></div>

<div class="scn"><h4>Woh green tick jo asli nahi tha</h4><p>Ek trainee ne saare routers par PIM configure kiya, saaf running-config dekhi, aur kaam khatam maan liya. Stream nahi pahunchi. Beech ke router par ek <code>show ip pim neighbor</code> ne do ke bajay ek neighbour dikhaya: ek interface par <code>ip pim sparse-mode</code> nahi tha. Configuration poori lag rahi thi kyunki missing line bas gayab thi, aur kisi ne shikayat nahi ki.</p><p><b>Seekh:</b> configuration dikhati hai aapne kya type kiya; operational show commands dikhate hain kya ho raha hai. Dono check karo.</p></div>

<div class="iv"><p class="q">"Aap kaise verify karte ho ki QoS policy kaam kar rahi hai?"</p><p>Strong answer: test traffic generate karo, phir sahi direction mein <code>show policy-map interface</code> padho aur confirm karo ki expected class packets count kar rahi hai, marks lag rahe hain, aur drops sirf expected classes mein aa rahe hain. Wire par DSCP check karne ka zikr karo, jaise capture se, aur load mein dobara test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers user, privileged, global-config aur interface modes use karte hain; PCs simple host shell.</li>
<li>Host commands: join, leave, mcast, show mcast, traffic, traffic show.</li>
<li>Core show commands: show ip pim neighbor, show ip igmp groups, show ip mroute, show policy-map interface.</li>
<li>Task checker resulting state dekhta hai, aapke typed commands nahi.</li>
<li>Har change ko operational show command se verify karo.</li>
</ul></div>
`}};export{e as default};