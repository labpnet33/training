var e={id:`errdisable`,h:{en:`Err-disabled ports: detection and recovery`,hi:`Err-disabled ports: detection aur recovery`},body:{en:`
<p>Your home has a circuit breaker. When something dangerous happens, a short circuit or an overload, the breaker trips and cuts power to that one circuit so the whole house does not burn. The breaker does not fix the faulty appliance. You unplug it, then reset the breaker. <b>Err-disabled</b> is the switch's circuit breaker for a single port.</p>

<h3>What err-disabled means</h3>
<p>When a switch feature detects a dangerous condition on a port, it can put the port into the <b>err-disabled</b> state. The port is shut down in software: the link goes down, the port LED turns amber (or off), and no frames pass in either direction. It is not the same as <code>shutdown</code> typed by an administrator (that shows as "administratively down"). Err-disabled means "the switch disabled this port because of an error".</p>
<p>Many features can trip this breaker. The ones you meet at CCNA level:</p>
<table class="cmp"><tr><th>Cause name</th><th>Feature and trigger</th></tr>
<tr><td><code>psecure-violation</code></td><td>Port security in shutdown mode saw a violating MAC</td></tr>
<tr><td><code>bpduguard</code></td><td>BPDU Guard received a BPDU on a PortFast edge port</td></tr>
<tr><td><code>dhcp-rate-limit</code></td><td>DHCP snooping rate limit exceeded on an untrusted port</td></tr>
<tr><td><code>arp-inspection</code></td><td>DAI rate limit exceeded (default 15 ARP packets per second)</td></tr>
<tr><td><code>storm-control</code></td><td>Storm control with action shutdown hit its threshold</td></tr>
<tr><td><code>link-flap</code>, <code>udld</code>, <code>channel-misconfig</code></td><td>Unstable link, one-way fibre, EtherChannel mismatch</td></tr>
<tr><td><code>security-violation</code></td><td>802.1X saw a violation (for example too many hosts)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Err-disabled lifecycle">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">Port up</text>
<line x1="120" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="60" width="120" height="50" rx="8" fill="#fed7aa"/><text x="230" y="82" text-anchor="middle" class="svg-ink" font-size="12">Violation</text><text x="230" y="100" text-anchor="middle" class="svg-ink" font-size="12">detected</text>
<line x1="290" y1="85" x2="340" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="400" y="90" text-anchor="middle" class="svg-ink" font-size="13">err-disabled</text>
<line x1="460" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="510" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="12">Fix cause,</text><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="12">then recover</text>
<path d="M570 110 Q570 150 320 150 Q65 150 65 110" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">shut / no shut, or errdisable recovery timer</text>
</svg><p class="cap">Recovery only helps if the cause is gone; otherwise the port trips again immediately.</p></div>

<h3>Detecting an err-disabled port</h3>
<p>The first sign is usually a user saying "my network is dead" and a port LED that is amber. The switch tells you exactly what happened in three places:</p>
<pre class="out">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.0bad.0001 on port GigabitEthernet0/1.
<span class="hl">%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state</span>
%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down

SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1     RECEPTION          err-disabled psecure-violation</span>

SW1# show interfaces g0/1
<span class="hl">GigabitEthernet0/1 is down, line protocol is down (err-disabled)</span></pre>
<p><code>show interfaces status err-disabled</code> is the fastest command: one line per disabled port, with the reason. For port security, <code>show port-security interface g0/1</code> adds <code>Port Status : Secure-shutdown</code> and the <b>Last Source Address</b>, which is the MAC that caused the violation.</p>

<div class="eg"><p><b>Worked example.</b> In the Godavari Bank lab, you play attacker: on PC1 you run <code>set mac 0bad.0bad.0001</code> and ping 10.5.5.254. Gi0/1 has sticky 0050.7966.0a01 with maximum 1, so the new MAC is a violation. Within a second the port goes err-disabled, the violation count becomes 1 and Last Source Address shows 0bad.0bad.0001:1. Now you have to recover.</p></div>

<h3>Recovery method 1: manual</h3>
<p>First remove the cause (unplug the unknown device, give PC1 back its real MAC, fix the cabling). Then bounce the interface:</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# shutdown
SW1(config-if)# no shutdown</pre>
<p>This is the right choice for high-security ports: a human must look at every event before the port comes back.</p>

<h3>Recovery method 2: automatic</h3>
<p>For ports where you prefer self-healing, enable <b>errdisable recovery</b> per cause. After the interval (default 300 seconds), the switch re-enables the port by itself.</p>
<pre class="code">SW1(config)# errdisable recovery cause psecure-violation
SW1(config)# errdisable recovery interval 30        <span class="c">! seconds, default 300</span></pre>
<pre class="out">SW1# show errdisable recovery
ErrDisable Reason            Timer Status
-----------------            --------------
arp-inspection               Disabled
bpduguard                    Disabled
dhcp-rate-limit              Disabled
<span class="hl">psecure-violation            Enabled</span>
storm-control                Disabled

<span class="hl">Timer interval: 30 seconds</span>

Interfaces that will be enabled at the next timeout:

Interface       Errdisable reason       Time left(sec)
---------       -----------------       --------------
<span class="hl">Gi0/1           psecure-violation          24</span>

%PM-4-ERR_RECOVER: Attempting to recover from psecure-violation err-disable state on Gi0/1</pre>
<p>Recovery is per cause. Enabling it for <code>psecure-violation</code> does nothing for a port disabled by <code>bpduguard</code>. The interval is global, shared by all causes. <code>show errdisable detect</code> lists which causes are allowed to err-disable ports at all (most are enabled by default).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Recovering the port without removing the cause; it trips again within a second and the user thinks the network is "flapping". (2) Enabling recovery for the wrong cause name. (3) Using <code>no shutdown</code> alone; on an err-disabled port you must do <code>shutdown</code> first, then <code>no shutdown</code>. (4) Turning on automatic recovery for every cause everywhere, which hides repeated attacks behind a port that keeps coming back.</p></div>

<div class="exam"><p><b>Exam trap.</b> Auto-recovery is <b>disabled</b> by default for every cause; the default interval, once enabled, is <b>300 seconds</b>. Port security violation modes restrict and protect never err-disable a port; only shutdown does. And Root Guard does <b>not</b> err-disable a port; it puts it in root-inconsistent state, which recovers by itself when the superior BPDUs stop.</p></div>

<div class="scn"><h4>The conference room that kept dying</h4><p>A company's boardroom port went err-disabled several times a week, always during meetings. The engineer had enabled automatic recovery for bpduguard, so the port came back after five minutes each time, and everyone assumed a bad cable. <code>show interfaces status err-disabled</code> during one outage showed reason <code>bpduguard</code>. The AV team had installed a small unmanaged-looking switch in the video bar that was actually sending BPDUs. The fix was to replace it with a proper access device, and keep BPDU Guard enabled.</p><p><b>Lesson:</b> the reason column is the diagnosis. Automatic recovery treats the symptom; only the cause fixes the ticket.</p></div>

<div class="iv"><p class="q">"A user's port is err-disabled. Walk me through what you do."</p><p>Strong answer: run <code>show interfaces status err-disabled</code> to get the reason, read the syslog for the details (the violating MAC, the BPDU source), fix the cause, then recover with shutdown and no shutdown, or rely on <code>errdisable recovery cause X</code> if it is configured. Check afterwards with <code>show interfaces status</code> and the feature's own show command. Mention that recovery without fixing the cause just retriggers the error.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Err-disabled is a software shutdown by the switch after a detected error; it differs from an admin shutdown.</li>
<li>Common causes: psecure-violation, bpduguard, dhcp-rate-limit, arp-inspection, storm-control.</li>
<li>Find it with show interfaces status err-disabled and the %PM-4-ERR_DISABLE syslog.</li>
<li>Recover manually with shutdown then no shutdown, or automatically with errdisable recovery cause and interval (default 300 s).</li>
<li>Always remove the cause first, or the port trips again.</li>
</ul></div>
`,hi:`
<p>Aapke ghar mein circuit breaker hai. Jab kuch khatarnak hota hai, short circuit ya overload, to breaker trip ho kar us ek circuit ki bijli kaat deta hai taaki poora ghar na jale. Breaker kharaab appliance theek nahi karta. Aap use unplug karte ho, phir breaker reset karte ho. <b>Err-disabled</b> ek single port ke liye switch ka circuit breaker hai.</p>

<h3>Err-disabled ka matlab kya hai</h3>
<p>Jab koi switch feature port par khatarnak condition detect karta hai, to woh port ko <b>err-disabled</b> state mein daal sakta hai. Port software mein shut down ho jaata hai: link down ho jaata hai, port LED amber (ya off) ho jaati hai, aur kisi bhi direction mein koi frame pass nahi hota. Yeh administrator ke type kiye <code>shutdown</code> jaisa nahi hai (woh "administratively down" dikhta hai). Err-disabled matlab "switch ne error ki wajah se yeh port disable kiya".</p>
<p>Bahut saare features yeh breaker trip kar sakte hain. CCNA level par jo milte hain:</p>
<table class="cmp"><tr><th>Cause name</th><th>Feature aur trigger</th></tr>
<tr><td><code>psecure-violation</code></td><td>Shutdown mode wale port security ne violating MAC dekha</td></tr>
<tr><td><code>bpduguard</code></td><td>BPDU Guard ko PortFast edge port par BPDU mila</td></tr>
<tr><td><code>dhcp-rate-limit</code></td><td>Untrusted port par DHCP snooping rate limit exceed hua</td></tr>
<tr><td><code>arp-inspection</code></td><td>DAI rate limit exceed hua (default 15 ARP packets per second)</td></tr>
<tr><td><code>storm-control</code></td><td>Action shutdown wala storm control apne threshold par pahuncha</td></tr>
<tr><td><code>link-flap</code>, <code>udld</code>, <code>channel-misconfig</code></td><td>Unstable link, one-way fibre, EtherChannel mismatch</td></tr>
<tr><td><code>security-violation</code></td><td>802.1X ne violation dekha (jaise bahut zyada hosts)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Err-disabled lifecycle">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">Port up</text>
<line x1="120" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="60" width="120" height="50" rx="8" fill="#fed7aa"/><text x="230" y="82" text-anchor="middle" class="svg-ink" font-size="12">Violation</text><text x="230" y="100" text-anchor="middle" class="svg-ink" font-size="12">detect hua</text>
<line x1="290" y1="85" x2="340" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="400" y="90" text-anchor="middle" class="svg-ink" font-size="13">err-disabled</text>
<line x1="460" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="510" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="12">Cause fix karo,</text><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="12">phir recover</text>
<path d="M570 110 Q570 150 320 150 Q65 150 65 110" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">shut / no shut, ya errdisable recovery timer</text>
</svg><p class="cap">Recovery tabhi kaam aata hai jab cause chala gaya ho; warna port turant phir trip ho jaata hai.</p></div>

<h3>Err-disabled port detect karna</h3>
<p>Pehla sign aam taur par user ka kehna hota hai "mera network dead hai" aur port LED amber hoti hai. Switch teen jagah exactly batata hai kya hua:</p>
<pre class="out">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.0bad.0001 on port GigabitEthernet0/1.
<span class="hl">%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state</span>
%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down

SW1# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
<span class="hl">Gi0/1     RECEPTION          err-disabled psecure-violation</span>

SW1# show interfaces g0/1
<span class="hl">GigabitEthernet0/1 is down, line protocol is down (err-disabled)</span></pre>
<p><code>show interfaces status err-disabled</code> sabse tez command hai: har disabled port ki ek line, reason ke saath. Port security ke liye <code>show port-security interface g0/1</code> <code>Port Status : Secure-shutdown</code> aur <b>Last Source Address</b> jodta hai, jo woh MAC hai jisne violation kiya.</p>

<div class="eg"><p><b>Worked example.</b> Godavari Bank lab mein aap attacker bante ho: PC1 par <code>set mac 0bad.0bad.0001</code> chalate ho aur 10.5.5.254 ping karte ho. Gi0/1 par sticky 0050.7966.0a01 maximum 1 ke saath hai, isliye naya MAC violation hai. Ek second mein port err-disabled ho jaata hai, violation count 1 ho jaata hai aur Last Source Address 0bad.0bad.0001:1 dikhata hai. Ab aapko recover karna hai.</p></div>

<h3>Recovery method 1: manual</h3>
<p>Pehle cause hatao (unknown device unplug karo, PC1 ko uska asli MAC wapas do, cabling theek karo). Phir interface bounce karo:</p>
<pre class="code">SW1(config)# interface g0/1
SW1(config-if)# shutdown
SW1(config-if)# no shutdown</pre>
<p>High-security ports ke liye yahi sahi choice hai: port wapas aane se pehle har event ko ek insaan dekhe.</p>

<h3>Recovery method 2: automatic</h3>
<p>Jin ports par aap self-healing prefer karte ho, wahan har cause ke liye <b>errdisable recovery</b> enable karo. Interval ke baad (default 300 seconds), switch khud port re-enable kar deta hai.</p>
<pre class="code">SW1(config)# errdisable recovery cause psecure-violation
SW1(config)# errdisable recovery interval 30        <span class="c">! seconds, default 300</span></pre>
<pre class="out">SW1# show errdisable recovery
ErrDisable Reason            Timer Status
-----------------            --------------
arp-inspection               Disabled
bpduguard                    Disabled
dhcp-rate-limit              Disabled
<span class="hl">psecure-violation            Enabled</span>
storm-control                Disabled

<span class="hl">Timer interval: 30 seconds</span>

Interfaces that will be enabled at the next timeout:

Interface       Errdisable reason       Time left(sec)
---------       -----------------       --------------
<span class="hl">Gi0/1           psecure-violation          24</span>

%PM-4-ERR_RECOVER: Attempting to recover from psecure-violation err-disable state on Gi0/1</pre>
<p>Recovery har cause ke liye alag hai. <code>psecure-violation</code> ke liye enable karne se <code>bpduguard</code> se disable hue port ke liye kuch nahi hota. Interval global hai, saare causes share karte hain. <code>show errdisable detect</code> list karta hai ki kaunse causes ports ko err-disable kar sakte hain (zyada tar default mein enabled hain).</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Cause hataye bina port recover karna; woh ek second mein phir trip hota hai aur user sochta hai network "flap" kar raha hai. (2) Galat cause name ke liye recovery enable karna. (3) Sirf <code>no shutdown</code> use karna; err-disabled port par pehle <code>shutdown</code>, phir <code>no shutdown</code> karna padta hai. (4) Har jagah har cause ke liye automatic recovery on karna, jo baar baar hote attacks ko ek aise port ke peeche chhupa deta hai jo wapas aata rehta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Auto-recovery har cause ke liye default mein <b>disabled</b> hai; enable karne par default interval <b>300 seconds</b> hai. Port security ke violation modes restrict aur protect kabhi port err-disable nahi karte; sirf shutdown karta hai. Aur Root Guard port ko err-disable <b>nahi</b> karta; use root-inconsistent state mein daalta hai, jo superior BPDUs rukne par khud recover ho jaata hai.</p></div>

<div class="scn"><h4>Conference room jo baar baar mar jaata tha</h4><p>Ek company ka boardroom port hafte mein kai baar err-disabled ho jaata tha, hamesha meetings ke dauraan. Engineer ne bpduguard ke liye automatic recovery enable kar rakha tha, isliye port har baar paanch minute baad wapas aa jaata, aur sab ne kharaab cable maan liya. Ek outage ke dauraan <code>show interfaces status err-disabled</code> ne reason <code>bpduguard</code> dikhaya. AV team ne video bar mein ek chhota unmanaged dikhne wala switch lagaya tha jo asal mein BPDUs bhej raha tha. Fix yeh tha ki use proper access device se replace kiya gaya, aur BPDU Guard enabled rakha gaya.</p><p><b>Seekh:</b> reason column hi diagnosis hai. Automatic recovery symptom ka ilaaj karta hai; ticket sirf cause theek karne se fix hota hai.</p></div>

<div class="iv"><p class="q">"Ek user ka port err-disabled hai. Mujhe batao aap kya karoge."</p><p>Strong answer: reason jaanne ke liye <code>show interfaces status err-disabled</code> chalao, details ke liye syslog padho (violating MAC, BPDU source), cause fix karo, phir shutdown aur no shutdown se recover karo, ya agar configured hai to <code>errdisable recovery cause X</code> par bharosa karo. Baad mein <code>show interfaces status</code> aur feature ki apni show command se check karo. Batao ki cause fix kiye bina recovery bas error ko dobara trigger karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Err-disabled error detect hone ke baad switch ka software shutdown hai; yeh admin shutdown se alag hai.</li>
<li>Common causes: psecure-violation, bpduguard, dhcp-rate-limit, arp-inspection, storm-control.</li>
<li>Ise show interfaces status err-disabled aur %PM-4-ERR_DISABLE syslog se dhundho.</li>
<li>Manually shutdown phir no shutdown se recover karo, ya automatically errdisable recovery cause aur interval (default 300 s) se.</li>
<li>Hamesha pehle cause hatao, warna port phir trip hoga.</li>
</ul></div>
`}};export{e as default};