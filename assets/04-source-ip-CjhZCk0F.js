var e={id:`source-ip`,h:{en:`Source IP: which address does the switch use?`,hi:`Source IP: switch kaunsa address use karta hai?`},body:{en:`
<p>A letter has two addresses: the one on the envelope you wrote, and the postmark of the post office that actually handled it. The receiving clerk checks the <b>return address that the post office stamped</b>, not the name you signed at the bottom. In networking the "return address" of a RADIUS request is the <b>source IP address of the IP packet</b>, and ClearPass checks that against the network device list. Many "registered but still unknown" tickets come from one misunderstanding: engineers register the address they know, and the switch uses a different one.</p>

<h3>Why a switch has many addresses</h3>
<p>A router or Layer 3 switch owns one address per interface: a management port, VLAN interfaces, loopbacks, routed links. When it creates a new packet (RADIUS, SNMP, syslog, NTP), the operating system must choose one as the source. The usual rule is: <b>the address of the egress interface that the routing table uses to reach the destination</b>, unless you have configured a fixed source interface. Our lab switch ACCESS has addresses in several VLANs, and it reaches ClearPass (10.20.60.10) through router R1. The path leaves via the Vlan99 interface, whose address is <b>10.20.99.2</b>. So the RADIUS requests carry source 10.20.99.2, and ClearPass must have a network device with that address.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RADIUS source address path">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="14">ACCESS</text>
<text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">Vlan10 10.20.10.2</text>
<text x="105" y="108" text-anchor="middle" class="svg-ink" font-size="12">Vlan30 10.20.30.2</text>
<rect x="30" y="118" width="150" height="34" rx="6" fill="#fde68a"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="12">Vlan99 10.20.99.2</text>
<rect x="260" y="70" width="110" height="70" rx="10" fill="#e2e8f0"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="315" y="120" text-anchor="middle" class="svg-muted" font-size="12">routes</text>
<rect x="450" y="70" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="98" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="535" y="118" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<line x1="190" y1="135" x2="260" y2="105" stroke="#64748b" stroke-width="3"/><line x1="370" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="3"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Packet source seen by CPPM: 10.20.99.2</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">The NAD entry must carry this exact address</text>
</svg><p class="cap">The switch has several addresses. The one on the egress interface toward the server becomes the source.</p></div>

<h3>How to find the real source address</h3>
<p>You need evidence from both sides, then you compare them.</p>
<p><b>On ClearPass</b> the Event Viewer shows the address it saw (real wording differs between releases):</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time       Source   Level  Description
09:14:02   RADIUS   WARN   <span class="hl">Request from unknown network device 10.20.99.2 dropped</span></pre>
<p><b>On the switch</b> list the interface addresses and decide which interface faces the server:</p>
<pre class="out">ACCESS# show ip interface brief
Interface     IP Address        Status
vlan10        10.20.10.2/24     up
vlan30        10.20.30.2/24     up
<span class="hl">vlan99        10.20.99.2/24     up</span></pre>
<p>The address in the log (10.20.99.2) is the same as the Vlan99 address. In the ticket <code>cp-nad-ip</code> the network device ACCESS exists with the right secret but a different IP. The repair is on ClearPass:</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Network &gt; Devices &gt; ACCESS &gt; IP or Subnet Address</span>
<span class="c">! Lab shell on CPPM:</span>
configuration network device ACCESS ip 10.20.99.2
<span class="c">! Prove it after LAPTOP1 retries:</span>
monitoring access-tracker</pre>
<p>In the Access Tracker, the record for LAPTOP1 now shows the network device ACCESS. That proves ClearPass matched the packet to your entry.</p>

<h3>Making the source predictable</h3>
<p>Relying on routing to choose the source is fragile. If someone adds a second path to ClearPass, or the preferred path moves to another interface after a failure, the source address changes and the NAD stops matching. The professional fix is to <b>pin the source</b> to a stable interface, normally a loopback or a dedicated management VLAN interface, and register that address. Real AOS-CX offers a source-interface setting for RADIUS; check the command for your release before using it. The lab model does not teach this setting; there the source is the Vlan99 address, as given.</p>
<p>Other things that change the source address seen by ClearPass:</p>
<ul>
<li><b>NAT between the NAD and ClearPass.</b> ClearPass sees the translated address. Register that address, and remember that many switches behind one NAT would then all share an address (and a secret).</li>
<li><b>Different VRF.</b> A management VRF can have its own address and routing table. The RADIUS host command may need the VRF name (the lab model accepts a vrf option).</li>
<li><b>Wireless.</b> A controller or an Instant AP cluster has its own rules for which address is used (chapter 9).</li>
<li><b>Stacks and redundant pairs.</b> After a failover the active unit may use a different address unless a shared one is configured. (Not simulated in the lab.)</li>
</ul>

<div class="eg"><p><b>Worked example.</b> ClearPass 10.20.60.10 receives a request with source 10.20.99.2 and network devices: ACCESS 10.20.10.2 and OLD-SW 10.20.99.9. No entry matches 10.20.99.2, so the request is dropped as unknown device, even though the name ACCESS exists. Changing ACCESS to 10.20.99.2 makes the next request match. Nothing changed on the switch, and the secret was never the problem.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Registering the management port address that you use for SSH. (2) Registering the address of the client VLAN gateway. (3) Forgetting that the source changes when the egress path changes. (4) Editing the switch to match the NAD when the switch is correct. First decide what the packet really carries, then change the entry that disagrees.</p></div>

<div class="exam"><p><b>Exam trap.</b> The NAS-IP-Address attribute inside the RADIUS packet is an attribute set by the NAD and may differ from the IP header source. ClearPass identifies the device from the packet source address, not from a hostname and not from what the packet claims.</p></div>

<div class="scn"><h4>Failover moved the source</h4><p>A site had two uplinks from the access layer to the data center. The NAD entries had been created using the primary path address. During a fibre cut the traffic moved to the second path and the source address changed. All switches suddenly appeared as unknown devices although the network was healthy again after rerouting. The team pinned the RADIUS source to a loopback on every switch and registered the loopbacks.</p><p><b>Lesson:</b> pin the source to a stable address so a routing change cannot break trust.</p></div>

<div class="iv"><p class="q">"The device is in ClearPass with the right secret, but the log says unknown device. Explain."</p><p>Strong answer: ClearPass matches the source IP of the packet, not the name. The switch is sourcing from an interface address different from the one I registered. I find the address in the Event Viewer, confirm it with the switch interface list and the route to the server, correct the entry (or pin the source interface on the switch), and verify the Access Tracker shows the device name on the next request.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass identifies a NAD by the source IP of the RADIUS packet, not by hostname.</li>
<li>The source is normally the address of the egress interface toward the server; in the lab it is the Vlan99 address 10.20.99.2.</li>
<li>Find it with the Event Viewer on ClearPass and show ip interface brief on the switch.</li>
<li>Pin the source to a stable interface in real designs; NAT and VRFs change what ClearPass sees.</li>
<li>Success proof: the Access Tracker record names the device ACCESS.</li>
</ul></div>
`,hi:`
<p>Ek letter ke do addresses hote hain: woh jo aapne envelope par likha, aur us post office ka postmark jisne use asal mein handle kiya. Receiving clerk <b>post office ka lagaya hua return address</b> check karta hai, na ki neeche aapka signed naam. Networking mein RADIUS request ka "return address" <b>IP packet ka source IP address</b> hai, aur ClearPass use network device list se match karta hai. Bahut saare "registered hai phir bhi unknown" tickets ek galatfehmi se aate hain: engineers woh address register karte hain jo unhe pata hai, aur switch koi aur address use karta hai.</p>

<h3>Switch ke paas bahut saare addresses kyun hote hain</h3>
<p>Router ya Layer 3 switch ke har interface ka ek address hota hai: management port, VLAN interfaces, loopbacks, routed links. Jab woh naya packet banata hai (RADIUS, SNMP, syslog, NTP), operating system ko ek address source ke roop mein chunna padta hai. Aam rule: <b>destination tak pahunchne ke liye routing table jis egress interface ko use karti hai uska address</b>, jab tak aapne fixed source interface configure na kiya ho. Hamare lab switch ACCESS ke kai VLANs mein addresses hain, aur woh ClearPass (10.20.60.10) tak router R1 ke through pahunchta hai. Path Vlan99 interface se nikalta hai, jiska address <b>10.20.99.2</b> hai. Isliye RADIUS requests source 10.20.99.2 ke saath jaati hain, aur ClearPass ke paas us address wala network device hona chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RADIUS source address ka path">
<rect x="20" y="40" width="170" height="130" rx="10" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="14">ACCESS</text>
<text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">Vlan10 10.20.10.2</text>
<text x="105" y="108" text-anchor="middle" class="svg-ink" font-size="12">Vlan30 10.20.30.2</text>
<rect x="30" y="118" width="150" height="34" rx="6" fill="#fde68a"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="12">Vlan99 10.20.99.2</text>
<rect x="260" y="70" width="110" height="70" rx="10" fill="#e2e8f0"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="315" y="120" text-anchor="middle" class="svg-muted" font-size="12">route karta hai</text>
<rect x="450" y="70" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="98" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="535" y="118" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<line x1="190" y1="135" x2="260" y2="105" stroke="#64748b" stroke-width="3"/><line x1="370" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="3"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">CPPM ko dikhne wala packet source: 10.20.99.2</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">NAD entry mein yahi exact address hona chahiye</text>
</svg><p class="cap">Switch ke paas kai addresses hain. Server ki taraf wale egress interface ka address source ban jaata hai.</p></div>

<h3>Real source address kaise dhoondein</h3>
<p>Aapko dono sides se evidence chahiye, phir unhe compare karo.</p>
<p><b>ClearPass par</b> Event Viewer woh address dikhata hai jo usne dekha (real wording releases mein alag hoti hai):</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time       Source   Level  Description
09:14:02   RADIUS   WARN   <span class="hl">Request from unknown network device 10.20.99.2 dropped</span></pre>
<p><b>Switch par</b> interface addresses list karo aur decide karo ki kaunsa interface server ki taraf hai:</p>
<pre class="out">ACCESS# show ip interface brief
Interface     IP Address        Status
vlan10        10.20.10.2/24     up
vlan30        10.20.30.2/24     up
<span class="hl">vlan99        10.20.99.2/24     up</span></pre>
<p>Log ka address (10.20.99.2) Vlan99 ke address jaisa hi hai. Ticket <code>cp-nad-ip</code> mein network device ACCESS sahi secret ke saath exist karta hai par IP alag hai. Repair ClearPass par hai:</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Network &gt; Devices &gt; ACCESS &gt; IP or Subnet Address</span>
<span class="c">! Lab shell on CPPM:</span>
configuration network device ACCESS ip 10.20.99.2
<span class="c">! LAPTOP1 ke retry ke baad prove karo:</span>
monitoring access-tracker</pre>
<p>Access Tracker mein ab LAPTOP1 ka record network device ACCESS dikhata hai. Yeh prove karta hai ki ClearPass ne packet ko aapki entry se match kiya.</p>

<h3>Source ko predictable banana</h3>
<p>Source chunne ka kaam routing par chhodna fragile hai. Agar koi ClearPass tak doosra path add kar de, ya failure ke baad preferred path kisi aur interface par chala jaye, to source address badal jaata hai aur NAD match karna band kar deta hai. Professional fix hai source ko kisi stable interface par <b>pin</b> karna, aam taur par loopback ya dedicated management VLAN interface, aur wahi address register karna. Real AOS-CX RADIUS ke liye source-interface setting deta hai; use karne se pehle apni release ka command check karo. Lab model yeh setting nahi sikhata; wahan source Vlan99 ka address hai, jaisa diya gaya hai.</p>
<p>Aur cheezein jo ClearPass ko dikhne wala source address badalti hain:</p>
<ul>
<li><b>NAD aur ClearPass ke beech NAT.</b> ClearPass translated address dekhta hai. Wahi address register karo, aur yaad rakho ki ek NAT ke peeche bahut switches ek address (aur ek secret) share karenge.</li>
<li><b>Alag VRF.</b> Management VRF ka apna address aur routing table ho sakta hai. RADIUS host command ko VRF ka naam chahiye ho sakta hai (lab model vrf option accept karta hai).</li>
<li><b>Wireless.</b> Controller ya Instant AP cluster ke apne rules hote hain ki kaunsa address use ho (chapter 9).</li>
<li><b>Stacks aur redundant pairs.</b> Failover ke baad active unit alag address use kar sakta hai jab tak shared address configure na ho. (Lab mein simulate nahi hota.)</li>
</ul>

<div class="eg"><p><b>Worked example.</b> ClearPass 10.20.60.10 ko source 10.20.99.2 wali request milti hai aur network devices hain: ACCESS 10.20.10.2 aur OLD-SW 10.20.99.9. Koi entry 10.20.99.2 se match nahi karti, isliye request unknown device ke roop mein drop hoti hai, bhale hi naam ACCESS exist karta ho. ACCESS ko 10.20.99.2 karne se agli request match ho jaati hai. Switch par kuch nahi badla, aur secret kabhi problem tha hi nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Woh management port address register karna jis par SSH karte ho. (2) Client VLAN ke gateway ka address register karna. (3) Bhool jaana ki egress path badalne par source badalta hai. (4) Jab switch sahi ho to switch ko NAD se match karne ke liye edit karna. Pehle decide karo ki packet asal mein kya carry karta hai, phir jo entry disagree karti hai use badlo.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS packet ke andar NAS-IP-Address attribute NAD ka set kiya hua attribute hai aur IP header source se alag ho sakta hai. ClearPass device ko packet source address se pehchanta hai, hostname se nahi aur packet ke daawe se bhi nahi.</p></div>

<div class="scn"><h4>Failover ne source badal diya</h4><p>Ek site mein access layer se data center ke do uplinks the. NAD entries primary path ke address se bani thi. Fibre cut ke dauran traffic doosre path par chala gaya aur source address badal gaya. Saare switches achanak unknown devices dikhne lage jabki rerouting ke baad network healthy tha. Team ne har switch par RADIUS source ko loopback par pin kiya aur loopbacks register kiye.</p><p><b>Seekh:</b> source ko stable address par pin karo taaki routing change trust na tod sake.</p></div>

<div class="iv"><p class="q">"Device ClearPass mein sahi secret ke saath hai, par log unknown device kehta hai. Samjhao."</p><p>Strong answer: ClearPass packet ka source IP match karta hai, naam nahi. Switch us interface address se source kar raha hai jo maine register kiya address se alag hai. Main address Event Viewer mein dhoondta hoon, switch ki interface list aur server ke route se confirm karta hoon, entry sahi karta hoon (ya switch par source interface pin karta hoon), aur verify karta hoon ki agli request par Access Tracker device ka naam dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass NAD ko RADIUS packet ke source IP se pehchanta hai, hostname se nahi.</li>
<li>Source aam taur par server ki taraf wale egress interface ka address hota hai; lab mein yeh Vlan99 ka address 10.20.99.2 hai.</li>
<li>Ise ClearPass ke Event Viewer aur switch ke show ip interface brief se dhoondo.</li>
<li>Real designs mein source ko stable interface par pin karo; NAT aur VRF ClearPass ko dikhne wala address badalte hain.</li>
<li>Success proof: Access Tracker record device ACCESS ka naam dikhata hai.</li>
</ul></div>
`}};export{e as default};