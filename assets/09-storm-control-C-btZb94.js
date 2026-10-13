var e={id:`storm-control`,h:{en:`Broadcast storms and storm-control`,hi:`Broadcast storms aur storm-control`},body:{en:`
<p>A building's water supply has a flow limiter on each flat's pipe. A normal flat uses a trickle. If a pipe bursts in one flat and water starts gushing, the limiter closes that flat's valve so the rest of the building still has pressure. <b>Storm-control</b> is that flow limiter for broadcast, multicast and unicast traffic entering a switch port: when a port suddenly pours out far more flooded traffic than any normal host ever would, the switch throttles or shuts that port before the whole VLAN drowns.</p>

<h3>What a storm is and why it hurts</h3>
<p>A <b>traffic storm</b> is a flood of broadcast, multicast or unknown-unicast frames. These frames must be delivered to every port in the VLAN, and many of them (ARP, DHCP) are also processed by the switch CPU and by every host's network stack. Storms come from:</p>
<ul>
<li>A <b>Layer 2 loop</b> (for example a cable connecting two wall sockets through a small unmanaged switch), where broadcasts circulate forever because Ethernet frames have no TTL.</li>
<li>A faulty network card or driver that transmits continuously.</li>
<li>A misbehaving application or a deliberate flood from a compromised host.</li>
</ul>
<p><b>What the defender sees:</b> links at or near 100 percent, high switch CPU, input counters showing enormous broadcast numbers on one port, users reporting that "everything is slow" across a VLAN.</p>
<pre class="out">ACC3# show interfaces g0/2 | include broadcast|input rate
<span class="hl">  5 minute input rate 812000000 bits/sec, 1208000 packets/sec</span>
     Received 91843320 broadcasts (1204 multicasts)</pre>

<h3>How storm-control works</h3>
<p>Storm-control measures ingress traffic of each type on a port over <b>1-second intervals</b> and compares it with a <b>rising threshold</b>, and optionally a lower <b>falling threshold</b>. Thresholds can be written as:</p>
<ul>
<li>A percentage of interface bandwidth: <code>storm-control broadcast level 1.00</code></li>
<li>Bits per second: <code>storm-control broadcast level bps 10m</code></li>
<li>Packets per second: <code>storm-control multicast level pps 2k 1k</code> (rising 2000, falling 1000)</li>
</ul>
<p>When traffic of that type exceeds the rising threshold, the switch acts:</p>
<table class="cmp"><tr><th>Action</th><th>What happens</th><th>Log</th></tr>
<tr><td>default (filter)</td><td>Excess traffic of that type is dropped until it falls below the falling threshold; the port stays up</td><td>STORM_CONTROL-3-FILTERED</td></tr>
<tr><td><code>storm-control action shutdown</code></td><td>Port is err-disabled (reason storm-control)</td><td>STORM_CONTROL-3-SHUTDOWN</td></tr>
<tr><td><code>storm-control action trap</code></td><td>An SNMP trap is sent (filtering still applies)</td><td>Trap to the NMS</td></tr></table>
<p>Unicast storm-control exists too, but on many platforms it counts all unicast, not only unknown unicast, so use it with care.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Storm-control rising and falling thresholds">
<line x1="60" y1="190" x2="600" y2="190" stroke="#64748b" stroke-width="1.5"/><line x1="60" y1="190" x2="60" y2="20" stroke="#64748b" stroke-width="1.5"/>
<text x="330" y="215" text-anchor="middle" class="svg-muted" font-size="12">time (1-second intervals)</text>
<line x1="60" y1="80" x2="600" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="5 4"/><text x="596" y="74" text-anchor="end" class="svg-accent" font-size="12">rising 1.00%</text>
<line x1="60" y1="120" x2="600" y2="120" stroke="#64748b" stroke-width="1" stroke-dasharray="2 4"/><text x="596" y="138" text-anchor="end" class="svg-muted" font-size="12">falling 0.50%</text>
<polyline points="60,180 140,178 200,175 240,40 300,35 360,45 400,150 460,176 600,178" fill="none" stroke="#0ea5e9" stroke-width="2.5"/>
<rect x="240" y="25" width="160" height="20" rx="4" fill="#fed7aa"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">filter or shutdown</text>
</svg><p class="cap">Above the rising threshold the switch acts; with the default filter action it forwards again once traffic falls below the falling threshold.</p></div>

<h3>Lab 4 walkthrough, part 1</h3>
<p>On ACC3, PC1 is on Gi0/1 and ATK on Gi0/2. Add broadcast storm-control with shutdown on both edge ports:</p>
<pre class="code"><span class="c">! task 1</span>
interface range g0/1 - 2
 storm-control broadcast level 1.00
 storm-control action shutdown
 exit
<span class="c">! optional: come back after the recovery interval</span>
errdisable recovery cause storm-control</pre>
<p>Later in the lab you run <code>attack broadcast-storm</code> on ATK. Within one second the broadcast rate on Gi0/2 crosses 1 percent and the port is shut:</p>
<pre class="out"><span class="hl">%STORM_CONTROL-3-SHUTDOWN: A packet storm was detected on Gi0/2. The interface has been disabled.</span>
%PM-4-ERR_DISABLE: storm-control error detected on Gi0/2, putting Gi0/2 in err-disable state

ACC3# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/2                        err-disabled storm-control</span>

ACC3# show storm-control broadcast
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  ----------
Gi0/1      Forwarding       1.00%        1.00%        0.02%
<span class="hl">Gi0/2      Link Down        1.00%        1.00%        0.00%</span></pre>
<p>The lab asks for the err-disable reason: <b>storm-control</b>. Notice that when no falling threshold is given, the lower value equals the upper value. PC1's port keeps forwarding with a tiny 0.02 percent of normal broadcasts.</p>

<div class="eg"><p><b>Worked example: what does 1 percent mean?</b> On a 1 Gbps port, 1 percent is 10 Mbps. With minimum-size frames (64 bytes plus 20 bytes of preamble and gap, 84 bytes on the wire) that is about 10,000,000 / (84 x 8), roughly 14,880 broadcast frames per second. A healthy PC sends a handful of ARP and DHCP broadcasts per second at most, so 1 percent is generous for a user port but instantly exceeded by a loop or a flood tool. On a 10 Gbps uplink the same 1 percent is 100 Mbps.</p></div>

<h3>Choosing thresholds and actions</h3>
<ul>
<li><b>Edge ports:</b> broadcast (and often multicast) with <b>shutdown</b> or filter plus trap. One host should never produce a storm.</li>
<li><b>Uplinks and trunks:</b> never shutdown. An uplink carries broadcasts for the whole VLAN, and shutting it isolates the entire switch. Use higher thresholds with filter and trap.</li>
<li><b>Multicast:</b> careful on ports carrying video, IPTV or routing protocols (OSPF and EIGRP use multicast); measure a baseline first.</li>
<li>Storm-control limits the damage of a loop; the real fix for loops is a healthy STP with BPDU guard (chapter 8).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Copying the edge template, including <code>storm-control action shutdown</code>, onto the uplink trunk. During a broadcast burst from any host in the VLAN, the uplink err-disables and the whole access switch goes offline.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>default</b> action is to <b>filter</b> (drop the excess) with the port staying up; shutdown and trap must be configured. Thresholds are percent, bps or pps, measured per second, per traffic type, on ingress. The err-disable reason is <code>storm-control</code>.</p></div>

<div class="scn"><h4>The desk hub that looped a floor</h4><p>A team lead connected a small unmanaged switch under a desk to get extra ports, and a cleaner later plugged its spare cable back into a second wall socket. Broadcasts began looping: the unmanaged switch did not run STP, and both wall ports were PortFast edge ports without BPDU guard. On the floor without storm-control, the whole VLAN froze for 20 minutes. On the neighbouring floor, which had <code>storm-control broadcast level 1.00</code> with action shutdown, the same kind of accident err-disabled both desk ports within a second, and the only symptom was one desk losing its network.</p><p><b>Lesson:</b> storm-control contains the blast radius of a loop to one port. Combine it with BPDU guard for defence in depth.</p></div>

<div class="iv"><p class="q">"How does storm-control work, and which action would you choose?"</p><p>Strong answer: storm-control measures broadcast, multicast or unicast ingress traffic per port every second against a rising threshold in percent, bps or pps, with an optional falling threshold. By default it filters the excess; it can instead err-disable the port or send an SNMP trap. I use shutdown on edge ports because a single host should never storm, and filter with trap and higher thresholds on uplinks, because shutting an uplink isolates the switch. I baseline multicast before limiting it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Storms come from loops, faulty NICs or floods and saturate the VLAN, the links and the CPU.</li>
<li>Storm-control checks ingress broadcast, multicast or unicast per second against rising and falling thresholds.</li>
<li>Default action filters the excess; <code>action shutdown</code> err-disables (reason storm-control); <code>action trap</code> sends SNMP.</li>
<li>Shutdown on edge ports; never on uplinks; baseline multicast first.</li>
<li>Verify with <code>show storm-control</code> and <code>show interfaces status err-disabled</code>.</li>
</ul></div>
`,hi:`
<p>Ek building ki water supply mein har flat ke pipe par ek flow limiter hai. Normal flat thoda sa paani use karta hai. Agar kisi flat mein pipe phat jaaye aur paani bahne lage, to limiter us flat ka valve band kar deta hai taaki baaki building mein pressure bana rahe. <b>Storm-control</b> switch port mein aane wale broadcast, multicast aur unicast traffic ke liye wahi flow limiter hai: jab koi port achanak kisi bhi normal host se kahin zyada flooded traffic bahaane lage, to switch us port ko throttle ya shut kar deta hai isse pehle ki poora VLAN doob jaaye.</p>

<h3>Storm kya hai aur kyun nuksaan karta hai</h3>
<p><b>Traffic storm</b> broadcast, multicast ya unknown-unicast frames ki baadh hai. Yeh frames VLAN ke har port tak pahunchaane padte hain, aur inme se kai (ARP, DHCP) switch CPU aur har host ke network stack dwara bhi process hote hain. Storms aate hain:</p>
<ul>
<li><b>Layer 2 loop</b> se (jaise ek cable jo chhote unmanaged switch ke through do wall sockets ko jodta hai), jahan broadcasts hamesha ghoomte rehte hain kyunki Ethernet frames mein TTL nahi hota.</li>
<li>Kharaab network card ya driver se jo lagataar transmit karta hai.</li>
<li>Galat behave karti application se ya compromised host ke jaan boojhkar kiye flood se.</li>
</ul>
<p><b>Defender ko kya dikhta hai:</b> links 100 percent ke paas, switch CPU high, ek port par input counters mein bahut bade broadcast numbers, users report karte hain ki poore VLAN mein "sab kuch slow hai".</p>
<pre class="out">ACC3# show interfaces g0/2 | include broadcast|input rate
<span class="hl">  5 minute input rate 812000000 bits/sec, 1208000 packets/sec</span>
     Received 91843320 broadcasts (1204 multicasts)</pre>

<h3>Storm-control kaise kaam karta hai</h3>
<p>Storm-control har port par har type ka ingress traffic <b>1-second intervals</b> mein naapta hai aur use ek <b>rising threshold</b>, aur optionally ek neeche wale <b>falling threshold</b>, se compare karta hai. Thresholds aise likhe ja sakte hain:</p>
<ul>
<li>Interface bandwidth ka percentage: <code>storm-control broadcast level 1.00</code></li>
<li>Bits per second: <code>storm-control broadcast level bps 10m</code></li>
<li>Packets per second: <code>storm-control multicast level pps 2k 1k</code> (rising 2000, falling 1000)</li>
</ul>
<p>Jab us type ka traffic rising threshold paar karta hai, switch action leta hai:</p>
<table class="cmp"><tr><th>Action</th><th>Kya hota hai</th><th>Log</th></tr>
<tr><td>default (filter)</td><td>Us type ka extra traffic tab tak drop hota hai jab tak falling threshold se neeche na aa jaaye; port up rehta hai</td><td>STORM_CONTROL-3-FILTERED</td></tr>
<tr><td><code>storm-control action shutdown</code></td><td>Port err-disable hota hai (reason storm-control)</td><td>STORM_CONTROL-3-SHUTDOWN</td></tr>
<tr><td><code>storm-control action trap</code></td><td>SNMP trap bheja jaata hai (filtering phir bhi lagti hai)</td><td>NMS ko trap</td></tr></table>
<p>Unicast storm-control bhi hai, par kai platforms par yeh sirf unknown unicast nahi balki saara unicast ginta hai, isliye ise dhyaan se use karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Storm-control rising aur falling thresholds">
<line x1="60" y1="190" x2="600" y2="190" stroke="#64748b" stroke-width="1.5"/><line x1="60" y1="190" x2="60" y2="20" stroke="#64748b" stroke-width="1.5"/>
<text x="330" y="215" text-anchor="middle" class="svg-muted" font-size="12">samay (1-second intervals)</text>
<line x1="60" y1="80" x2="600" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="5 4"/><text x="596" y="74" text-anchor="end" class="svg-accent" font-size="12">rising 1.00%</text>
<line x1="60" y1="120" x2="600" y2="120" stroke="#64748b" stroke-width="1" stroke-dasharray="2 4"/><text x="596" y="138" text-anchor="end" class="svg-muted" font-size="12">falling 0.50%</text>
<polyline points="60,180 140,178 200,175 240,40 300,35 360,45 400,150 460,176 600,178" fill="none" stroke="#0ea5e9" stroke-width="2.5"/>
<rect x="240" y="25" width="160" height="20" rx="4" fill="#fed7aa"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">filter ya shutdown</text>
</svg><p class="cap">Rising threshold ke upar switch action leta hai; default filter action ke saath traffic falling threshold se neeche aane par phir forward karta hai.</p></div>

<h3>Lab 4 walkthrough, part 1</h3>
<p>ACC3 par PC1 Gi0/1 par hai aur ATK Gi0/2 par. Dono edge ports par shutdown ke saath broadcast storm-control jodo:</p>
<pre class="code"><span class="c">! task 1</span>
interface range g0/1 - 2
 storm-control broadcast level 1.00
 storm-control action shutdown
 exit
<span class="c">! optional: recovery interval ke baad wapas aao</span>
errdisable recovery cause storm-control</pre>
<p>Lab mein aage aap ATK par <code>attack broadcast-storm</code> chalate ho. Ek second ke andar Gi0/2 par broadcast rate 1 percent paar karta hai aur port shut ho jaata hai:</p>
<pre class="out"><span class="hl">%STORM_CONTROL-3-SHUTDOWN: A packet storm was detected on Gi0/2. The interface has been disabled.</span>
%PM-4-ERR_DISABLE: storm-control error detected on Gi0/2, putting Gi0/2 in err-disable state

ACC3# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/2                        err-disabled storm-control</span>

ACC3# show storm-control broadcast
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  ----------
Gi0/1      Forwarding       1.00%        1.00%        0.02%
<span class="hl">Gi0/2      Link Down        1.00%        1.00%        0.00%</span></pre>
<p>Lab err-disable reason maangti hai: <b>storm-control</b>. Dhyaan do ki jab falling threshold nahi diya jaata, lower value upper ke barabar hoti hai. PC1 ka port normal broadcasts ke sirf 0.02 percent ke saath forward karta rehta hai.</p>

<div class="eg"><p><b>Worked example: 1 percent ka matlab kya hai?</b> 1 Gbps port par 1 percent 10 Mbps hai. Minimum-size frames ke saath (64 bytes plus 20 bytes preamble aur gap, wire par 84 bytes) yeh lagbhag 10,000,000 / (84 x 8), yaani kareeb 14,880 broadcast frames per second hai. Swasth PC zyada se zyada har second kuch ARP aur DHCP broadcasts bhejta hai, isliye user port ke liye 1 percent kaafi hai par loop ya flood tool ise turant paar kar deta hai. 10 Gbps uplink par wahi 1 percent 100 Mbps hai.</p></div>

<h3>Thresholds aur actions chunna</h3>
<ul>
<li><b>Edge ports:</b> broadcast (aur aksar multicast) <b>shutdown</b> ke saath ya filter plus trap. Ek host ko kabhi storm nahi banana chahiye.</li>
<li><b>Uplinks aur trunks:</b> kabhi shutdown nahi. Uplink poore VLAN ke broadcasts le jaata hai, aur use shut karna poore switch ko alag kar deta hai. Filter aur trap ke saath zyada thresholds use karo.</li>
<li><b>Multicast:</b> video, IPTV ya routing protocols (OSPF aur EIGRP multicast use karte hain) wale ports par dhyaan; pehle baseline naapo.</li>
<li>Storm-control loop ka nuksaan seemit karta hai; loops ka asli fix BPDU guard ke saath healthy STP hai (chapter 8).</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Edge template ko, <code>storm-control action shutdown</code> samet, uplink trunk par copy kar dena. VLAN ke kisi bhi host se broadcast burst ke dauraan uplink err-disable ho jaata hai aur poora access switch offline chala jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Default</b> action <b>filter</b> hai (extra drop karo) aur port up rehta hai; shutdown aur trap configure karne padte hain. Thresholds percent, bps ya pps mein hote hain, har second, har traffic type ke liye, ingress par naape jaate hain. Err-disable reason <code>storm-control</code> hai.</p></div>

<div class="scn"><h4>Desk hub jisne floor ko loop kar diya</h4><p>Ek team lead ne extra ports ke liye desk ke neeche ek chhota unmanaged switch lagaya, aur baad mein ek cleaner ne uska spare cable doosre wall socket mein laga diya. Broadcasts loop hone lage: unmanaged switch STP nahi chalata tha, aur dono wall ports bina BPDU guard ke PortFast edge ports the. Bina storm-control wale floor par poora VLAN 20 minute tak jam raha. Bagal wale floor par, jahan action shutdown ke saath <code>storm-control broadcast level 1.00</code> tha, isi tarah ke accident ne ek second mein dono desk ports err-disable kar diye, aur ekmaatra symptom tha ek desk ka network jaana.</p><p><b>Seekh:</b> storm-control loop ka blast radius ek port tak seemit karta hai. Defence in depth ke liye ise BPDU guard ke saath combine karo.</p></div>

<div class="iv"><p class="q">"Storm-control kaise kaam karta hai, aur aap kaunsa action chunoge?"</p><p>Strong answer: storm-control har port par broadcast, multicast ya unicast ingress traffic ko har second percent, bps ya pps mein rising threshold se compare karta hai, optional falling threshold ke saath. Default mein yeh extra ko filter karta hai; iski jagah port err-disable kar sakta hai ya SNMP trap bhej sakta hai. Main edge ports par shutdown use karta hoon kyunki ek akele host ko kabhi storm nahi karna chahiye, aur uplinks par zyada thresholds ke saath filter aur trap, kyunki uplink shut karna switch ko alag kar deta hai. Multicast limit karne se pehle main uski baseline leta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Storms loops, kharaab NICs ya floods se aate hain aur VLAN, links aur CPU ko saturate karte hain.</li>
<li>Storm-control har second ingress broadcast, multicast ya unicast ko rising aur falling thresholds se check karta hai.</li>
<li>Default action extra ko filter karta hai; <code>action shutdown</code> err-disable karta hai (reason storm-control); <code>action trap</code> SNMP bhejta hai.</li>
<li>Edge ports par shutdown; uplinks par kabhi nahi; multicast ki pehle baseline lo.</li>
<li><code>show storm-control</code> aur <code>show interfaces status err-disabled</code> se verify karo.</li>
</ul></div>
`}};export{e as default};