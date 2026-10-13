var e={id:`ha-failover-triggers`,h:{en:`Failover triggers and remote link monitoring`,hi:`Failover triggers aur remote link monitoring`},body:{en:`
<p>A watchman at a gate checks that the gate is open. That is useful, but it does not tell him that the road behind the gate is flooded. Link monitoring is the watchman at the gate: it sees only the cable and the switch port next to the FortiGate. <b>Remote link monitoring</b> is a second man who walks down the road and checks that the ISP router really answers. A good cluster needs both. This chapter prepares lab <b>n7-ha-election</b>, tasks 1 to 3, ticket NT-4471.</p>

<h3>What makes a cluster fail over?</h3>
<ul>
<li><b>Monitored interface down.</b> <code>set monitor "port1" "port2"</code>. If the link of a monitored interface goes down, the unit counts one failure and the election chooses the peer. Monitor every interface that carries traffic, never the heartbeat ports.</li>
<li><b>Remote link monitoring fails.</b> A ping server stops answering (below).</li>
<li><b>Heartbeat lost.</b> The secondary sees no hellos from the primary within the timers of chapter 4 and takes over. Cause: crash, power loss, reboot, or an all-heartbeat failure (which may be split brain).</li>
<li><b>Hardware or software failure</b> of the primary, such as a process crash that makes the unit unusable.</li>
<li><b>Memory pressure (theory).</b> FortiOS can fail over when a unit runs critically low on memory; the lab shows a <code>mem_failover</code> field but does not model it.</li>
<li><b>Administrator action.</b> <code>execute ha failover set 1</code> forces a role change, <code>execute reboot</code> power-cycles the unit.</li>
</ul>

<h3>The blind spot of link monitoring</h3>
<p>In lab 2 each FortiGate has its own access switch. FGT-A's cable goes to SW-WAN-A:Gi0/2. The ISP uplink of that switch (SW-WAN-A:Gi0/1 toward SW-ISP) fails. FGT-A's own cable and port1 stay <b>up</b>. The cluster sees 0 failures on both units and the election criteria do not change, so nothing happens, although every packet to 8.8.8.8 is lost. That is the 25-minute outage of the ticket.</p>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Blind spot behind the access switch">
<rect x="20" y="90" width="90" height="44" rx="8" fill="#bae6fd"/><text x="65" y="117" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text>
<rect x="20" y="170" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="197" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text>
<rect x="200" y="90" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="250" y="117" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN-A</text>
<rect x="200" y="170" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="250" y="197" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN-B</text>
<rect x="390" y="130" width="90" height="44" rx="8" fill="#fde68a"/><text x="435" y="157" text-anchor="middle" class="svg-ink" font-size="13">SW-ISP</text>
<rect x="540" y="130" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="157" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="110" y1="112" x2="200" y2="112" stroke="#64748b" stroke-width="3"/><text x="155" y="104" text-anchor="middle" class="svg-muted" font-size="12">up</text>
<line x1="110" y1="192" x2="200" y2="192" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="112" x2="390" y2="145" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/><text x="350" y="108" text-anchor="middle" class="svg-accent" font-size="12">uplink fails here</text>
<line x1="300" y1="192" x2="390" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="480" y1="152" x2="540" y2="152" stroke="#64748b" stroke-width="3"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">port1 of FGT-A stays up: link monitoring sees nothing</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">gwdetect pings 198.51.100.1 through the whole path</text>
</svg><p class="cap">The fault is behind the switch. Only a probe that crosses the path can notice it.</p></div>

<h3>Remote link monitoring</h3>
<p>Also called remote IP monitoring or ping server. Three parts:</p>
<ol>
<li>On the interface: <code>gwdetect enable</code>, <code>detectserver &lt;ip&gt;</code> (what to ping) and <code>ha-priority &lt;1-50&gt;</code>, the <b>weight</b> of that server.</li>
<li>In HA: <code>pingserver-monitor-interface "port1"</code> says which interfaces take part.</li>
<li><code>pingserver-failover-threshold</code>: the unit fails when the sum of the weights of its unreachable servers reaches the threshold. 0 disables the feature.</li>
</ol>
<pre class="code"><span class="c">! Lab 2 task 2 - typed once on FGT-A, synchronised to FGT-B</span>
config system interface
    edit port1
        set gwdetect enable
        set detectserver 198.51.100.1
        set ha-priority 10
    next
end
config system ha
    set pingserver-monitor-interface "port1"
    set pingserver-failover-threshold 5
    set pingserver-flip-timeout 6
end</pre>
<div class="eg"><p><b>Weights and threshold.</b> Lab values: weight 10, threshold 5. One unreachable server (10) reaches 5, so the unit fails over. For a design with two servers, port1 weight 10 and port2 weight 20 and threshold 30, losing only port2's server gives 20, below 30: no failover. Losing both gives 30: failover. Use weights to say "this server alone is enough" or "I need two bad signs".</p></div>
<pre class="out">FGT-A # show system interface port1
    edit "port1"
        set vdom "root"
        set ip 198.51.100.2 255.255.255.248
        set allowaccess ping
        set type physical
        set alias "WAN"
        set role wan
        <span class="hl">set gwdetect enable</span>
        <span class="hl">set detectserver 198.51.100.1</span>
        <span class="hl">set ha-priority 10</span></pre>

<h3>The flip timeout</h3>
<p>Imagine the fault is further upstream and <b>both</b> units lose the ping server. FGT-A fails over to FGT-B, but FGT-B also fails the ping, so the cluster would bounce back and forth. <code>pingserver-flip-timeout</code> (minutes, default <b>60</b>, minimum 6; the lab uses 6) stops this: after a ping-server failover, the new primary ignores its own ping-server failures for that time. The role stays stable while people fix the real fault.</p>

<h3>Task by task</h3>
<ol>
<li><b>Reproduce.</b> On SW-WAN-A shut Gi0/1. Ping 8.8.8.8 from PC-LAN fails. <code>get system ha status</code> on FGT-A still shows FGT-A as primary and no failure.</li>
<li><b>Configure</b> remote link monitoring as above; the settings are synchronised to FGT-B.</li>
<li><b>Watch.</b> Within about a second the probe to 198.51.100.1 fails, FGT-A's score (10) reaches the threshold (5), and its age is reset. FGT-B wins on failures. The reason is in the history:</li>
</ol>
<pre class="out">FGT-B # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">the value of link-failure + pingsvr-failure is less than peer member</span> FGVMEV1NU41WS000.
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable</pre>

<h3>What a failover looks like outside</h3>
<p>FGT-B takes over the virtual MAC (<code>00:09:0f:09:14:00</code> on port1) and sends gratuitous ARPs. SW-WAN-B learns that MAC on Gi0/2 and the ISP side relearns it, so traffic moves to the new path without a change of gateway MAC or IP. PC-LAN keeps its ARP entry for 10.10.1.1 and typically loses one to three pings. With session pickup, established TCP sessions survive (chapter 9).</p>
<div class="note"><p>Honest scope: in the lab the primary sends real pings once a second, and the secondary copies the primary's result for a server behind a router. A real secondary probes with its own interface, and timing is not 1:1 with FortiOS.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting the threshold higher than the weight of every single server, then wondering why one dead server never triggers anything. Also, using a detect server that is the FortiGate itself or a host that drops pings.</p></div>
<div class="exam"><p><b>Exam trap.</b> The flip timeout is in minutes, default 60, and applies after a ping-server failover. Threshold 0 means disabled, not "fail on any failure". The weight is the <code>ha-priority</code> on the interface, not the HA device priority.</p></div>

<div class="scn"><h4>Fault behind the switch</h4><p>A data centre lost its upstream carrier circuit at 02:10. Both FortiGate units showed port1 as up, the cluster showed no failure, and the NOC saw "all green" for 25 minutes. The post-mortem added a ping server pointing at the provider router with weight 10 and a threshold of 5, plus a flip timeout of 30 minutes. At the next carrier outage the standby unit, whose second carrier was healthy, took over in seconds.</p><p><b>Lesson:</b> a link that is up is not a path that works.</p></div>

<div class="iv"><p class="q">"The ISP link failed but the cluster did not fail over. Why, and what do you change?"</p><p>The cable and port stayed up, so no monitored-interface failure existed. Add remote link monitoring: gwdetect with a detect server such as the ISP gateway, a weight, a failover threshold and a flip timeout. Prove it with <code>diagnose sys ha history read</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: monitored interface, ping server, heartbeat loss, unit failure, memory (theory), admin command.</li>
<li>Link monitoring cannot see a fault behind the switch.</li>
<li>Remote link monitoring: gwdetect + detectserver + ha-priority weight; threshold sums the weights.</li>
<li>Flip timeout (minutes, default 60) prevents flip-flop after a ping-server failover.</li>
<li>History text to remember: link-failure + pingsvr-failure is less than peer member.</li>
</ul></div>
`,hi:`
<p>Gate par ek watchman check karta hai ki gate khula hai ya nahi. Yeh kaam ka hai, par isse yeh nahi pata chalta ki gate ke peeche ki road mein paani bhara hai. Link monitoring gate wala watchman hai: woh sirf FortiGate ke bagal ki cable aur switch port dekhta hai. <b>Remote link monitoring</b> doosra aadmi hai jo road par chalkar check karta hai ki ISP router sach mein jawab deta hai. Achhe cluster ko dono chahiye. Yeh chapter lab <b>n7-ha-election</b>, tasks 1 se 3, ticket NT-4471 ki taiyari hai.</p>

<h3>Cluster ko fail over kya karwata hai?</h3>
<ul>
<li><b>Monitored interface down.</b> <code>set monitor "port1" "port2"</code>. Agar monitored interface ka link down ho jaye, unit ek failure gintaa hai aur election peer ko chunti hai. Har us interface ko monitor karo jo traffic carry karta hai, heartbeat ports ko kabhi nahi.</li>
<li><b>Remote link monitoring fail.</b> Ping server jawab dena band kar deta hai (neeche).</li>
<li><b>Heartbeat lost.</b> Secondary ko chapter 4 ke timers ke andar primary ke hellos nahi milte aur woh take over karta hai. Wajah: crash, power loss, reboot, ya saare heartbeat fail (jo split brain ho sakta hai).</li>
<li><b>Hardware ya software failure</b>, jaise primary ka process crash jo unit ko unusable bana de.</li>
<li><b>Memory pressure (theory).</b> Unit ki memory critically kam ho jaye to FortiOS fail over kar sakta hai; lab <code>mem_failover</code> field dikhata hai par model nahi karta.</li>
<li><b>Administrator action.</b> <code>execute ha failover set 1</code> role change force karta hai, <code>execute reboot</code> unit ko power-cycle karta hai.</li>
</ul>

<h3>Link monitoring ka blind spot</h3>
<p>Lab 2 mein har FortiGate ka apna access switch hai. FGT-A ki cable SW-WAN-A:Gi0/2 par jaati hai. Us switch ka ISP uplink (SW-WAN-A:Gi0/1, SW-ISP ki taraf) fail ho jaata hai. FGT-A ki apni cable aur port1 <b>up</b> rehte hain. Cluster dono units par 0 failures dekhta hai aur election criteria nahi badalte, isliye kuch nahi hota, jabki 8.8.8.8 ka har packet lost hai. Yahi ticket ka 25-minute outage hai.</p>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Blind spot behind the access switch">
<rect x="20" y="90" width="90" height="44" rx="8" fill="#bae6fd"/><text x="65" y="117" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text>
<rect x="20" y="170" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="65" y="197" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text>
<rect x="200" y="90" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="250" y="117" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN-A</text>
<rect x="200" y="170" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="250" y="197" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN-B</text>
<rect x="390" y="130" width="90" height="44" rx="8" fill="#fde68a"/><text x="435" y="157" text-anchor="middle" class="svg-ink" font-size="13">SW-ISP</text>
<rect x="540" y="130" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="157" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="110" y1="112" x2="200" y2="112" stroke="#64748b" stroke-width="3"/><text x="155" y="104" text-anchor="middle" class="svg-muted" font-size="12">up</text>
<line x1="110" y1="192" x2="200" y2="192" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="112" x2="390" y2="145" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 4"/><text x="350" y="108" text-anchor="middle" class="svg-accent" font-size="12">uplink yahan fail</text>
<line x1="300" y1="192" x2="390" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="480" y1="152" x2="540" y2="152" stroke="#64748b" stroke-width="3"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">FGT-A ka port1 up rehta hai: link monitoring ko kuch nahi dikhta</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">gwdetect poore path se 198.51.100.1 ko ping karta hai</text>
</svg><p class="cap">Fault switch ke peeche hai. Sirf wahi probe pakad sakta hai jo poora path cross kare.</p></div>

<h3>Remote link monitoring</h3>
<p>Ise remote IP monitoring ya ping server bhi kehte hain. Teen hisse:</p>
<ol>
<li>Interface par: <code>gwdetect enable</code>, <code>detectserver &lt;ip&gt;</code> (kise ping karna hai) aur <code>ha-priority &lt;1-50&gt;</code>, us server ka <b>weight</b>.</li>
<li>HA mein: <code>pingserver-monitor-interface "port1"</code> batata hai kaunse interfaces shamil hain.</li>
<li><code>pingserver-failover-threshold</code>: unit tab fail karta hai jab uske unreachable servers ke weights ka sum threshold tak pahunch jaye. 0 matlab feature disabled.</li>
</ol>
<pre class="code"><span class="c">! Lab 2 task 2 - FGT-A par ek baar type kiya, FGT-B tak synchronised</span>
config system interface
    edit port1
        set gwdetect enable
        set detectserver 198.51.100.1
        set ha-priority 10
    next
end
config system ha
    set pingserver-monitor-interface "port1"
    set pingserver-failover-threshold 5
    set pingserver-flip-timeout 6
end</pre>
<div class="eg"><p><b>Weights aur threshold.</b> Lab values: weight 10, threshold 5. Ek unreachable server (10) 5 tak pahunch jaata hai, isliye unit fail over karta hai. Do servers wale design mein, port1 weight 10 aur port2 weight 20 aur threshold 30, sirf port2 ka server khone par 20, jo 30 se kam hai: failover nahi. Dono khone par 30: failover. Weights se batao "yeh server akela kaafi hai" ya "mujhe do kharab signs chahiye".</p></div>
<pre class="out">FGT-A # show system interface port1
    edit "port1"
        set vdom "root"
        set ip 198.51.100.2 255.255.255.248
        set allowaccess ping
        set type physical
        set alias "WAN"
        set role wan
        <span class="hl">set gwdetect enable</span>
        <span class="hl">set detectserver 198.51.100.1</span>
        <span class="hl">set ha-priority 10</span></pre>

<h3>Flip timeout</h3>
<p>Socho fault aur upstream hai aur <b>dono</b> units ping server kho dete hain. FGT-A, FGT-B par fail over karta hai, par FGT-B ka ping bhi fail hota hai, to cluster idhar-udhar bounce karta rahega. <code>pingserver-flip-timeout</code> (minutes, default <b>60</b>, minimum 6; lab mein 6) ise rokta hai: ping-server failover ke baad naya primary utni der apne ping-server failures ignore karta hai. Role stable rehta hai jab tak log asli fault theek karte hain.</p>

<h3>Task by task</h3>
<ol>
<li><b>Reproduce.</b> SW-WAN-A par Gi0/1 shut karo. PC-LAN se 8.8.8.8 ping fail hota hai. FGT-A par <code>get system ha status</code> abhi bhi FGT-A ko primary aur koi failure nahi dikhata.</li>
<li><b>Configure</b> remote link monitoring upar jaisa; settings FGT-B tak synchronise hoti hain.</li>
<li><b>Dekho.</b> Takriban ek second mein 198.51.100.1 ka probe fail hota hai, FGT-A ka score (10) threshold (5) tak pahunchta hai, aur uski age reset hoti hai. FGT-B failures par jeetta hai. Wajah history mein hai:</li>
</ol>
<pre class="out">FGT-B # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">the value of link-failure + pingsvr-failure is less than peer member</span> FGVMEV1NU41WS000.
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable</pre>

<h3>Bahar se failover kaisa dikhta hai</h3>
<p>FGT-B virtual MAC (port1 par <code>00:09:0f:09:14:00</code>) le leta hai aur gratuitous ARPs bhejta hai. SW-WAN-B woh MAC Gi0/2 par seekhta hai aur ISP side bhi relearn karti hai, isliye traffic naye path par chala jaata hai bina gateway MAC ya IP badle. PC-LAN apni 10.10.1.1 ki ARP entry rakhta hai aur aam taur par ek se teen pings lose karta hai. Session pickup ke saath established TCP sessions bach jaate hain (chapter 9).</p>
<div class="note"><p>Honest scope: lab mein primary har second real pings bhejta hai, aur router ke peeche ke server ke liye secondary primary ka result copy karta hai. Real secondary apne interface se probe karta hai, aur timing FortiOS se 1:1 nahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Threshold ko har single server ke weight se bada rakhna, aur phir sochna ki ek dead server se kuch kyun nahi hota. Aur: aisa detect server jo FortiGate khud ho ya jo pings drop karta ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Flip timeout minutes mein hai, default 60, aur ping-server failover ke baad lagta hai. Threshold 0 ka matlab disabled hai, "kisi bhi failure par fail" nahi. Weight interface ka <code>ha-priority</code> hai, HA device priority nahi.</p></div>

<div class="scn"><h4>Switch ke peeche ka fault</h4><p>Ek data centre ne 02:10 par apna upstream carrier circuit kho diya. Dono FortiGate units ne port1 up dikhaya, cluster ne koi failure nahi dikhaya, aur NOC ko 25 minute tak "all green" dikha. Post-mortem mein provider router ki taraf weight 10 wala ping server, threshold 5 aur 30 minute ka flip timeout jodha gaya. Agle carrier outage par standby unit, jiska doosra carrier healthy tha, seconds mein take over kar gaya.</p><p><b>Lesson:</b> up link ka matlab chalta hua path nahi hota.</p></div>

<div class="iv"><p class="q">"ISP link fail ho gaya par cluster ne fail over nahi kiya. Kyun, aur kya badloge?"</p><p>Cable aur port up rahe, isliye koi monitored-interface failure tha hi nahi. Remote link monitoring jodo: gwdetect, ISP gateway jaisa detect server, weight, failover threshold aur flip timeout. <code>diagnose sys ha history read</code> se prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: monitored interface, ping server, heartbeat loss, unit failure, memory (theory), admin command.</li>
<li>Link monitoring switch ke peeche ka fault nahi dekh sakti.</li>
<li>Remote link monitoring: gwdetect + detectserver + ha-priority weight; threshold weights ka sum leta hai.</li>
<li>Flip timeout (minutes, default 60) ping-server failover ke baad flip-flop rokta hai.</li>
<li>History text yaad rakho: link-failure + pingsvr-failure is less than peer member.</li>
</ul></div>
`}};export{e as default};