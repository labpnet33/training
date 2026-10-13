var e={id:`ha-modes-requirements`,h:{en:`HA modes, requirements and design choices`,hi:`HA modes, requirements aur design choices`},body:{en:`
<p>Before you type a single HA command, you make three decisions: which <b>mode</b>, whether the two units are really <b>identical enough</b>, and how they are <b>wired</b>. A wrong choice here cannot be fixed by clever configuration later. Think of buying a pair of shoes: you need the same size, the same type, and you must decide whether you walk on one foot at a time or run on both.</p>

<h3>Standalone, active-passive and active-active</h3>
<p>The <code>mode</code> setting in <code>config system ha</code> has three values:</p>
<ul>
<li><b>standalone</b>: HA is off. This is the default.</li>
<li><b>a-p</b> (active-passive): the primary processes all traffic; the secondary is synchronised and ready. The NSE 4 module covered this; our lab cluster uses it.</li>
<li><b>a-a</b> (active-active): the primary still receives every packet from the network, but it may hand work to the secondary over the heartbeat link.</li>
</ul>
<p>In real FortiOS, active-active load-balances only <b>proxy-based security-profile sessions</b> by default (antivirus, web filtering through the proxy, and so on). Plain TCP, UDP and ICMP stay on the primary unless you add <code>set load-balance-all enable</code>. The distribution algorithm is chosen with <code>schedule</code> (for example round-robin, weight-round-robin, least-connection, random, ip). Each unit can receive a weight.</p>
<div class="note"><p>Honest scope: the simulator accepts <code>mode a-a</code>, <code>load-balance-all</code> and <code>schedule</code> and shows both units as <code>work</code>, but it does not distribute sessions. The primary processes everything. Treat active-active as theory in this module.</p></div>

<table class="cmp"><tr><th>Question</th><th>Active-passive</th><th>Active-active</th></tr>
<tr><td>Who forwards?</td><td>Primary only</td><td>Primary, plus sessions offloaded to the secondary</td></tr>
<tr><td>Capacity gain</td><td>None</td><td>Only for the traffic that is distributed</td></tr>
<tr><td>Troubleshooting</td><td>One path, simple</td><td>A session may touch two units</td></tr>
<tr><td>Heartbeat load</td><td>Sync and keepalives</td><td>Sync plus data, needs bandwidth</td></tr>
<tr><td>Typical choice</td><td>Most sites</td><td>Heavy proxy inspection</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Active-passive versus active-active">
<rect x="20" y="30" width="280" height="130" rx="10" fill="#e2e8f0"/><text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-passive</text>
<rect x="40" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="95" y="104" text-anchor="middle" class="svg-muted" font-size="12">100% traffic</text>
<rect x="170" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="225" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">waits, in sync</text>
<rect x="340" y="30" width="280" height="130" rx="10" fill="#e2e8f0"/><text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-active (theory)</text>
<rect x="360" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="415" y="86" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="415" y="104" text-anchor="middle" class="svg-muted" font-size="12">receives all</text>
<rect x="490" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="545" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="545" y="104" text-anchor="middle" class="svg-muted" font-size="12">gets some UTM</text>
<line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">In both modes the primary owns the network side; active-active only moves inspection work behind it.</p></div>

<h3>What must match</h3>
<p>FGCP is strict. Two units form a cluster only if the following agree:</p>
<table class="cmp"><tr><th>Item</th><th>Rule</th></tr>
<tr><td>Hardware model</td><td>Same model and hardware generation (a VM pairs with the same VM type)</td></tr>
<tr><td>Firmware</td><td>Same FortiOS version and build (a mismatch is tolerated only briefly during an upgrade)</td></tr>
<tr><td>Licences</td><td>Each unit has its own licences; capabilities such as VDOM count must match, and FortiGuard entitlement should be valid on both</td></tr>
<tr><td>Cluster identity</td><td><code>mode</code>, <code>group-id</code>, <code>group-name</code>, <code>password</code>, encryption and authentication settings</td></tr>
<tr><td>Heartbeat</td><td>At least one <code>hbdev</code> interface that really reaches the peer</td></tr>
<tr><td>Cabling</td><td>Matching interfaces on the same networks on both units</td></tr></table>
<p>The things that must <b>differ</b> are the host name, the device priority (to give a preferred unit), and the serial number, which is hardware. In our lab, FGT-A uses priority 200 and FGT-B priority 100.</p>
<pre class="code"><span class="c">! FGT-A - the settings every lab cluster shares</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 200
end</pre>
<div class="tip"><p>Keep a design sheet with model, firmware, group-id, group-name, hbdev and priority per unit. Almost every "cluster will not form" ticket is a typo in one of these fields.</p></div>

<h3>FGSP and virtual clusters: theory only</h3>
<p><b>FGSP</b> (FortiGate Session Life Support Protocol) does not cluster configuration. Each FortiGate keeps its own addresses and policy, and only sessions are copied between peers. You use it when external devices steer traffic, for example a router doing equal-cost load balancing, or when traffic is asymmetric. <b>Virtual clusters</b> split the VDOMs into two groups, and each unit is primary for one group, so both units work and a failure moves only that group. Neither is modelled in the simulator; learn the purpose, not exact commands.</p>

<h3>Sizing and wiring</h3>
<ul>
<li><b>N+1</b>: size each unit for the whole load. If one unit must carry 100% after a failure, then in active-passive mode you buy two units of full size.</li>
<li><b>Same switch</b>: both units on one switch is cheap, but the switch is then a single point of failure.</li>
<li><b>Split switches</b>: each unit on its own switch (our lab 2 uses SW-WAN-A and SW-WAN-B) survives a switch failure, but you must watch for failures behind the switch, which is the subject of chapter 6.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Nilgiri Telecom peaks at 3 Gbps of firewall throughput with all inspection on. A unit rated 4 Gbps in that profile is enough for a-p. Two such units give 4 Gbps of service with one failure, not 8. Buying a-a for "8 Gbps" would only help the proxy-inspected part, and after a failure you would again be limited to 4.</p></div>

<div class="warn"><p><b>Common mistake.</b> Joining units with different firmware or a different model "just for testing". The unit may join, then desynchronise, or refuse to join. Upgrade both to the same build first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active-active does not mean "double the throughput for everything". By default only proxy-based UTM sessions are distributed, and the primary is always the single network entry point.</p></div>

<div class="scn"><h4>The "free" capacity that never came</h4><p>A customer chose active-active expecting twice the firewall speed. Their traffic was mostly flow-based with little inspection, so almost everything stayed on the primary, which hit 95% CPU while the secondary idled. The fix was not a bigger cluster mode: they moved to a larger model in a-p and kept the second unit purely for redundancy.</p><p><b>Lesson:</b> check what a mode actually distributes before using it to size a design.</p></div>

<div class="iv"><p class="q">"Active-passive or active-active, and why?"</p><p>Default to active-passive: simpler, easier to troubleshoot, any traffic type. Choose active-active only when proxy-based inspection CPU is the proven bottleneck. Mention that the primary remains the single entry point and that the heartbeat carries real data in a-a.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: standalone, a-p, a-a. Default is standalone.</li>
<li>Active-active distributes proxy-based UTM sessions by default; <code>load-balance-all</code> adds plain sessions. The lab does not model it.</li>
<li>Cluster members need the same model, firmware, mode, group-id, group-name, password and a working heartbeat.</li>
<li>Host name and priority differ per unit by design.</li>
<li>FGSP and virtual clusters are theory: know when you would use them.</li>
</ul></div>
`,hi:`
<p>HA ka ek bhi command type karne se pehle aap teen decisions lete ho: kaun sa <b>mode</b>, kya dono units sach mein <b>kaafi identical</b> hain, aur unhe kaise <b>wire</b> kiya jaayega. Yahan ek galat choice ko baad mein clever configuration se theek nahi kiya ja sakta. Socho jooton ki jodi khareed rahe ho: size same chahiye, type same chahiye, aur decide karna hai ki ek pair par ek waqt mein ek paon par chalna hai ya dono par daudna hai.</p>

<h3>Standalone, active-passive aur active-active</h3>
<p><code>config system ha</code> mein <code>mode</code> setting ki teen values hain:</p>
<ul>
<li><b>standalone</b>: HA off. Yeh default hai.</li>
<li><b>a-p</b> (active-passive): primary saara traffic process karta hai; secondary synchronised aur ready rehta hai. NSE 4 module mein padha tha; hamara lab cluster isi ko use karta hai.</li>
<li><b>a-a</b> (active-active): primary abhi bhi network se har packet receive karta hai, lekin heartbeat link ke through secondary ko kaam de sakta hai.</li>
</ul>
<p>Real FortiOS mein active-active by default sirf <b>proxy-based security-profile sessions</b> load-balance karta hai (antivirus, proxy ke through web filtering, aadi). Plain TCP, UDP aur ICMP primary par hi rehte hain jab tak aap <code>set load-balance-all enable</code> na lagao. Distribution algorithm <code>schedule</code> se chuna jaata hai (jaise round-robin, weight-round-robin, least-connection, random, ip). Har unit ko weight diya ja sakta hai.</p>
<div class="note"><p>Honest scope: simulator <code>mode a-a</code>, <code>load-balance-all</code> aur <code>schedule</code> accept karta hai aur dono units ko <code>work</code> dikhata hai, lekin sessions distribute nahi karta. Primary sab kuch process karta hai. Is module mein active-active ko theory samjho.</p></div>

<table class="cmp"><tr><th>Sawaal</th><th>Active-passive</th><th>Active-active</th></tr>
<tr><td>Forward kaun karta hai?</td><td>Sirf primary</td><td>Primary, aur secondary par offload hue sessions</td></tr>
<tr><td>Capacity gain</td><td>Koi nahi</td><td>Sirf distribute hue traffic ke liye</td></tr>
<tr><td>Troubleshooting</td><td>Ek path, simple</td><td>Ek session do units ko touch kar sakta hai</td></tr>
<tr><td>Heartbeat load</td><td>Sync aur keepalives</td><td>Sync plus data, bandwidth chahiye</td></tr>
<tr><td>Typical choice</td><td>Zyadatar sites</td><td>Heavy proxy inspection</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Active-passive versus active-active">
<rect x="20" y="30" width="280" height="130" rx="10" fill="#e2e8f0"/><text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-passive</text>
<rect x="40" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="95" y="104" text-anchor="middle" class="svg-muted" font-size="12">100% traffic</text>
<rect x="170" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="225" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">wait, in sync</text>
<rect x="340" y="30" width="280" height="130" rx="10" fill="#e2e8f0"/><text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Active-active (theory)</text>
<rect x="360" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="415" y="86" text-anchor="middle" class="svg-ink" font-size="13">Primary</text><text x="415" y="104" text-anchor="middle" class="svg-muted" font-size="12">sab receive</text>
<rect x="490" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="545" y="86" text-anchor="middle" class="svg-ink" font-size="13">Secondary</text><text x="545" y="104" text-anchor="middle" class="svg-muted" font-size="12">kuch UTM</text>
<line x1="470" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Dono modes mein network side primary ke paas rehti hai; active-active sirf inspection ka kaam peeche shift karta hai.</p></div>

<h3>Kya match hona chahiye</h3>
<p>FGCP strict hai. Do units tabhi cluster banate hain jab yeh sab agree karein:</p>
<table class="cmp"><tr><th>Item</th><th>Rule</th></tr>
<tr><td>Hardware model</td><td>Same model aur hardware generation (VM ka jodi usi VM type se banti hai)</td></tr>
<tr><td>Firmware</td><td>Same FortiOS version aur build (mismatch sirf upgrade ke dauran thodi der ke liye tolerate hota hai)</td></tr>
<tr><td>Licences</td><td>Har unit ke apne licences; VDOM count jaisi capabilities match honi chahiye, aur FortiGuard entitlement dono par valid ho</td></tr>
<tr><td>Cluster identity</td><td><code>mode</code>, <code>group-id</code>, <code>group-name</code>, <code>password</code>, encryption aur authentication settings</td></tr>
<tr><td>Heartbeat</td><td>Kam se kam ek <code>hbdev</code> interface jo sach mein peer tak pahunche</td></tr>
<tr><td>Cabling</td><td>Dono units par same networks par matching interfaces</td></tr></table>
<p>Jo cheezein <b>alag</b> honi chahiye: host name, device priority (preferred unit dene ke liye), aur serial number, jo hardware hai. Hamare lab mein FGT-A priority 200 aur FGT-B priority 100 use karta hai.</p>
<pre class="code"><span class="c">! FGT-A - woh settings jo har lab cluster share karta hai</span>
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password Nilgiri-HA-2026
    set hbdev "port3" 100 "port4" 50
    set priority 200
end</pre>
<div class="tip"><p>Ek design sheet rakho jisme har unit ka model, firmware, group-id, group-name, hbdev aur priority ho. Lagbhag har "cluster form nahi ho raha" ticket in fields mein se kisi ek ka typo hota hai.</p></div>

<h3>FGSP aur virtual clusters: sirf theory</h3>
<p><b>FGSP</b> (FortiGate Session Life Support Protocol) configuration cluster nahi karta. Har FortiGate apne addresses aur policy rakhta hai, aur peers ke beech sirf sessions copy hote hain. Isse tab use karte ho jab external devices traffic steer karte hain, jaise equal-cost load balancing karne wala router, ya jab traffic asymmetric ho. <b>Virtual clusters</b> VDOMs ko do groups mein baant dete hain, aur har unit ek group ka primary hota hai, isliye dono units kaam karte hain aur failure sirf us group ko move karti hai. Dono simulator mein model nahi hain; purpose seekho, exact commands nahi.</p>

<h3>Sizing aur wiring</h3>
<ul>
<li><b>N+1</b>: har unit ko poore load ke liye size karo. Agar failure ke baad ek unit ko 100% uthana hai, to active-passive mein do full-size units kharidte ho.</li>
<li><b>Same switch</b>: dono units ek switch par sasta hai, lekin tab switch single point of failure ban jaata hai.</li>
<li><b>Split switches</b>: har unit apne switch par (hamara lab 2 SW-WAN-A aur SW-WAN-B use karta hai) switch failure survive karta hai, lekin switch ke peeche ki failures par nazar rakhni padti hai, jo chapter 6 ka vishay hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Nilgiri Telecom ka peak sab inspection on ke saath 3 Gbps firewall throughput hai. Us profile mein 4 Gbps rated unit a-p ke liye kaafi hai. Aise do units ek failure ke saath 4 Gbps service dete hain, 8 nahi. "8 Gbps" ke liye a-a lena sirf proxy-inspected hisse mein madad karta, aur failure ke baad phir 4 par limit ho jaate.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Sirf testing ke liye" alag firmware ya alag model ke units join karna. Unit join ho sakta hai, phir desynchronise ho sakta hai, ya join se mana kar sakta hai. Pehle dono ko same build par upgrade karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active-active ka matlab "har cheez ke liye double throughput" nahi hai. By default sirf proxy-based UTM sessions distribute hote hain, aur primary hamesha single network entry point hai.</p></div>

<div class="scn"><h4>Woh "free" capacity jo kabhi aayi nahi</h4><p>Ek customer ne active-active is umeed mein chuna ki firewall speed double hogi. Unka traffic zyadatar flow-based tha aur inspection kam, isliye lagbhag sab primary par hi raha, jo 95% CPU par pahunch gaya aur secondary khali baitha raha. Fix bada cluster mode nahi tha: unhone a-p mein bada model liya aur doosre unit ko sirf redundancy ke liye rakha.</p><p><b>Lesson:</b> design size karne se pehle check karo ki koi mode asal mein kya distribute karta hai.</p></div>

<div class="iv"><p class="q">"Active-passive ya active-active, aur kyun?"</p><p>Default active-passive: simple, troubleshoot karna aasaan, har traffic type. Active-active tabhi jab proxy-based inspection CPU proven bottleneck ho. Batao ki primary single entry point rehta hai aur a-a mein heartbeat real data carry karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: standalone, a-p, a-a. Default standalone hai.</li>
<li>Active-active by default proxy-based UTM sessions distribute karta hai; <code>load-balance-all</code> plain sessions bhi jodta hai. Lab ise model nahi karta.</li>
<li>Cluster members ko same model, firmware, mode, group-id, group-name, password aur working heartbeat chahiye.</li>
<li>Host name aur priority design se har unit par alag hote hain.</li>
<li>FGSP aur virtual clusters theory hain: kab use karoge yeh jaano.</li>
</ul></div>
`}};export{e as default};