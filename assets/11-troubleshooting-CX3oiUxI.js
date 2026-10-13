var e={id:`troubleshooting`,h:{en:`Client troubleshooting workflow`,hi:`Client troubleshooting workflow`},body:{en:`
<p>When a patient says "I feel unwell", a good doctor does not start with surgery. She asks where it hurts and since when, then checks pulse, temperature and blood pressure in a fixed order. Wi-Fi troubleshooting is the same: "the Wi-Fi does not work" is a symptom, not a diagnosis. You scope the problem, then walk the client through the join in order, <b>see the SSID, authenticate, get the right IP, reach the destination</b>, and the first step that fails tells you where the fault lives.</p>

<h3>Step 0: scope the problem</h3>
<ul>
<li><b>One client or many?</b> One client points to the device, its driver or its credentials. Everyone points to the WLAN, the controller or the network behind it.</li>
<li><b>One area or everywhere?</b> One area points to an AP, RF coverage or interference.</li>
<li><b>One band or one device type?</b> A 2.4 GHz-only phone that fails while laptops work suggests band or security capability issues.</li>
<li><b>Since when, and what changed?</b> Most outages follow a change.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow">
<rect x="5" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="75" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 SSID visible?</text><text x="75" y="62" text-anchor="middle" class="svg-muted" font-size="12">wifi scan</text>
<rect x="167" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="237" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Authenticates?</text><text x="237" y="62" text-anchor="middle" class="svg-muted" font-size="12">show msglog</text>
<rect x="329" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="399" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Right IP?</text><text x="399" y="62" text-anchor="middle" class="svg-muted" font-size="12">wifi status</text>
<rect x="491" y="20" width="144" height="56" rx="8" fill="#ddd6fe"/><text x="563" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Reaches server?</text><text x="563" y="62" text-anchor="middle" class="svg-muted" font-size="12">ping</text>
<line x1="145" y1="48" x2="167" y2="48" stroke="#64748b" stroke-width="2"/><line x1="307" y1="48" x2="329" y2="48" stroke="#64748b" stroke-width="2"/><line x1="469" y1="48" x2="491" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="75" y1="76" x2="75" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="237" y1="76" x2="237" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="399" y1="76" x2="399" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="563" y1="76" x2="563" y2="110" stroke="#64748b" stroke-width="1.5"/>
<text x="75" y="126" text-anchor="middle" class="svg-accent" font-size="12">no: AP joined?</text><text x="75" y="144" text-anchor="middle" class="svg-muted" font-size="12">WLAN enabled?</text><text x="75" y="162" text-anchor="middle" class="svg-muted" font-size="12">radio, band,</text><text x="75" y="180" text-anchor="middle" class="svg-muted" font-size="12">RSSI</text>
<text x="237" y="126" text-anchor="middle" class="svg-accent" font-size="12">no: PSK wrong?</text><text x="237" y="144" text-anchor="middle" class="svg-muted" font-size="12">WPA2 vs WPA3?</text><text x="237" y="162" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, user,</text><text x="237" y="180" text-anchor="middle" class="svg-muted" font-size="12">certificate</text>
<text x="399" y="126" text-anchor="middle" class="svg-accent" font-size="12">no: WLAN interface?</text><text x="399" y="144" text-anchor="middle" class="svg-muted" font-size="12">VLAN on trunk?</text><text x="399" y="162" text-anchor="middle" class="svg-muted" font-size="12">DHCP scope,</text><text x="399" y="180" text-anchor="middle" class="svg-muted" font-size="12">169.254 = no DHCP</text>
<text x="563" y="126" text-anchor="middle" class="svg-accent" font-size="12">no: gateway?</text><text x="563" y="144" text-anchor="middle" class="svg-muted" font-size="12">ACL on VLAN?</text><text x="563" y="162" text-anchor="middle" class="svg-muted" font-size="12">DNS, routing</text>
<text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="12">stop at the first step that fails; that layer holds the fault</text>
</svg><p class="cap">Follow the join: visibility, authentication, IP address, traffic.</p></div>

<h3>The four checks in detail</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>What to check</th></tr>
<tr><td>SSID not in the list</td><td>Visibility / RF</td><td><code>show ap summary</code> (AP joined?), <code>show wlan summary</code> (WLAN enabled?), SSID broadcast, radio policy versus the client's band, radio enabled, client in range</td></tr>
<tr><td>Sees SSID, "cannot connect" or asks for password again</td><td>Authentication</td><td><code>show msglog</code>: MIC failure = wrong PSK; security mismatch (WPA3-only for a WPA2 client); for 802.1X: RADIUS reachable, shared secret, user and certificate</td></tr>
<tr><td>Connected, no IP or 169.254.x.x</td><td>IP / DHCP</td><td><code>show wlan N</code> interface, <code>show interface summary</code> VLAN, VLAN allowed on WLC and switch trunks, DHCP scope or relay</td></tr>
<tr><td>IP in the wrong subnet</td><td>WLAN to VLAN mapping</td><td>WLAN mapped to the wrong interface</td></tr>
<tr><td>Right IP, cannot reach a server</td><td>Traffic</td><td>Gateway, ACLs on that VLAN, DNS, routing</td></tr>
<tr><td>Connected but slow or dropping</td><td>RF performance</td><td>RSSI (below −70 dBm?), SNR (below 20 dB?), co-channel and adjacent-channel neighbours, retries, sticky client, legacy rates</td></tr></table>

<h3>Lab walkthrough: "LAPTOP1 cannot see NK-STAFF"</h3>
<p><b>Step 1, visibility.</b> The laptop's scan is empty, so check the controller:</p>
<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 1

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
<span class="hl">1        STAFF / NK-STAFF                  Disabled  guest             WPA2-Personal (PSK)</span></pre>
<p>Two clues in one line: the WLAN is <b>Disabled</b>, and it is mapped to <b>guest</b>. Fix the first fault now and note the second:</p>
<pre class="code">(WLC1) &gt;config wlan enable 1</pre>

<p><b>Step 2, authentication.</b> The SSID now appears, but the laptop still does not connect. The message log (newest first) tells the story:</p>
<pre class="out">(WLC1) &gt;show msglog

<span class="hl">Sep 29 08:02:11.482 %APF-4-AUTH_FAIL: Client 52:54:00:aa:00:01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: MIC failure in 4-way handshake (wrong pre-shared key)</span>
Sep 29 08:02:09.107 %APF-6-CLIENT_ASSOC: Client 52:54:00:aa:00:02 associated to AP AP1 (2.4 GHz ch 1) on WLAN 1 (NK-STAFF), interface guest VLAN 30</pre>
<p>PHONE1 (…:02) joins, so the WLAN works; LAPTOP1 (…:01) fails with a MIC failure, the signature of a wrong passphrase. The laptop confirms it:</p>
<pre class="out">LAPTOP1&gt; wifi status
Not connected. Saved profile: NK-STAFF (auto-connect paused after an authentication failure)
<span class="hl">Last attempt: NK-STAFF failed (psk)</span></pre>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024</pre>

<p><b>Step 3, IP address.</b> The laptop connects, but <code>wifi status</code> shows an address in 10.10.30.0/24, the guest subnet, not the staff subnet 10.10.20.0/24. Map the WLAN's interface name to its VLAN:</p>
<pre class="out">(WLC1) &gt;show wlan 1
...
Interface........................................ guest

(WLC1) &gt;show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
<span class="hl">guest                 1     30        10.10.30.5       Dynamic  No      No</span></pre>
<p>NK-STAFF clients were bridged into <b>VLAN 30</b>. Remap the WLAN. The controller de-authenticates its clients, which rejoin and run DHCP in VLAN 20; on a production controller, schedule such changes because they disconnect users:</p>
<pre class="code">(WLC1) &gt;config wlan interface 1 staff</pre>

<p><b>Step 4, traffic.</b> In VLAN 30 the ping to SRV1 failed because R1's <code>GUEST-IN</code> ACL denies guest traffic to internal 10.10.0.0/16 subnets, exactly as designed for guests. In VLAN 20 there is no such ACL:</p>
<pre class="code">LAPTOP1&gt; ping 10.10.50.10</pre>
<p>The ping now succeeds, and the ticket can be closed with four root causes documented: WLAN disabled, wrong PSK on the laptop, WLAN mapped to the guest interface, and the guest ACL as the consequence.</p>

<div class="eg"><p><b>Worked example.</b> A client shows RSSI −74 dBm and the noise floor is −90 dBm. SNR = −74 − (−90) = 16 dB, below the 20 dB minimum for reliable data. The client is connected but will use low data rates and retry often. The fix is RF (a closer AP, less interference, 5 GHz), not DHCP or security.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once, or rebooting the AP first. You lose the evidence and never learn the cause. Change one thing, verify, then move to the next step. And remember that a PSK or interface change disconnects every client on that WLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> A 169.254.x.x address means DHCP failed (check the VLAN and the DHCP scope), not an authentication problem. An address in the wrong subnet points to the WLAN-to-interface mapping. A 4-way handshake or MIC failure points to the PSK.</p></div>

<div class="scn"><h4>The WPA3 upgrade that locked out old laptops</h4><p>To harden security, an administrator changed the staff WLAN from WPA2 to WPA3-SAE only. New phones reconnected at once, but about thirty older laptops showed the SSID and then failed with "cannot connect to this network". The controller logs showed the laptops offering only WPA2-PSK in their association requests. Their wireless drivers did not support SAE. The engineer switched the WLAN to WPA2/WPA3 transition mode and scheduled driver updates before moving to WPA3-only.</p><p><b>Lesson:</b> security changes must match client capabilities; check what clients support before tightening a WLAN.</p></div>

<div class="iv"><p class="q">"A user says they cannot connect to the Wi-Fi. How do you troubleshoot?"</p><p>Strong answer: first scope it: one user or many, one area, one device type, and what changed. Then follow the join: can the client see the SSID (AP joined, WLAN enabled, band and radio policy, signal); does it authenticate (controller logs, PSK or RADIUS, WPA2 versus WPA3 support); does it get an IP in the right subnet (WLAN-to-VLAN mapping, trunks, DHCP); can it reach the destination (gateway, ACLs, DNS). Mention checking RSSI and SNR for performance complaints and changing one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first: one or many clients, one area, one band, and what changed.</li>
<li>Follow the join: SSID visible, authentication, correct IP, traffic.</li>
<li>MIC or 4-way handshake failure = wrong PSK; wrong subnet = WLAN mapped to the wrong interface; 169.254 = DHCP failure.</li>
<li>Useful commands: show wlan summary, show wlan N, show interface summary, show msglog, show client summary/detail, wifi scan/status.</li>
<li>Slow or dropping clients: check RSSI, SNR, channel overlap and retries.</li>
</ul></div>
`,hi:`
<p>Jab mareez kehta hai "tabiyat theek nahi hai", to achhi doctor surgery se shuru nahi karti. Woh poochti hai kahan dard hai aur kab se, phir ek fixed order mein nabz, temperature aur blood pressure check karti hai. Wi-Fi troubleshooting bhi aisi hi hai: "Wi-Fi nahi chal raha" ek symptom hai, diagnosis nahi. Aap problem ka scope nikalte ho, phir client ko order mein join ke through le jaate ho, <b>SSID dikhna, authenticate hona, sahi IP milna, destination tak pahunchna</b>, aur jo pehla step fail hota hai woh batata hai ki fault kahan hai.</p>

<h3>Step 0: problem ka scope nikalo</h3>
<ul>
<li><b>Ek client ya kai?</b> Ek client device, uske driver ya credentials ki taraf ishara karta hai. Sab log WLAN, controller ya uske peeche ke network ki taraf.</li>
<li><b>Ek area ya har jagah?</b> Ek area AP, RF coverage ya interference ki taraf ishara karta hai.</li>
<li><b>Ek band ya ek device type?</b> Sirf 2.4 GHz wala phone fail ho aur laptops chalein, to band ya security capability issue ka shak.</li>
<li><b>Kab se, aur kya badla?</b> Zyada tar outages kisi change ke baad aate hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow">
<rect x="5" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="75" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 SSID dikhta hai?</text><text x="75" y="62" text-anchor="middle" class="svg-muted" font-size="12">wifi scan</text>
<rect x="167" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="237" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Authenticate?</text><text x="237" y="62" text-anchor="middle" class="svg-muted" font-size="12">show msglog</text>
<rect x="329" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="399" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Sahi IP?</text><text x="399" y="62" text-anchor="middle" class="svg-muted" font-size="12">wifi status</text>
<rect x="491" y="20" width="144" height="56" rx="8" fill="#ddd6fe"/><text x="563" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Server tak?</text><text x="563" y="62" text-anchor="middle" class="svg-muted" font-size="12">ping</text>
<line x1="145" y1="48" x2="167" y2="48" stroke="#64748b" stroke-width="2"/><line x1="307" y1="48" x2="329" y2="48" stroke="#64748b" stroke-width="2"/><line x1="469" y1="48" x2="491" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="75" y1="76" x2="75" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="237" y1="76" x2="237" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="399" y1="76" x2="399" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="563" y1="76" x2="563" y2="110" stroke="#64748b" stroke-width="1.5"/>
<text x="75" y="126" text-anchor="middle" class="svg-accent" font-size="12">nahi: AP joined?</text><text x="75" y="144" text-anchor="middle" class="svg-muted" font-size="12">WLAN enabled?</text><text x="75" y="162" text-anchor="middle" class="svg-muted" font-size="12">radio, band,</text><text x="75" y="180" text-anchor="middle" class="svg-muted" font-size="12">RSSI</text>
<text x="237" y="126" text-anchor="middle" class="svg-accent" font-size="12">nahi: PSK galat?</text><text x="237" y="144" text-anchor="middle" class="svg-muted" font-size="12">WPA2 vs WPA3?</text><text x="237" y="162" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, user,</text><text x="237" y="180" text-anchor="middle" class="svg-muted" font-size="12">certificate</text>
<text x="399" y="126" text-anchor="middle" class="svg-accent" font-size="12">nahi: WLAN interface?</text><text x="399" y="144" text-anchor="middle" class="svg-muted" font-size="12">trunk par VLAN?</text><text x="399" y="162" text-anchor="middle" class="svg-muted" font-size="12">DHCP scope,</text><text x="399" y="180" text-anchor="middle" class="svg-muted" font-size="12">169.254 = DHCP nahi</text>
<text x="563" y="126" text-anchor="middle" class="svg-accent" font-size="12">nahi: gateway?</text><text x="563" y="144" text-anchor="middle" class="svg-muted" font-size="12">VLAN par ACL?</text><text x="563" y="162" text-anchor="middle" class="svg-muted" font-size="12">DNS, routing</text>
<text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="12">pehle fail hone wale step par ruko; wahi layer fault rakhti hai</text>
</svg><p class="cap">Join ko follow karo: visibility, authentication, IP address, traffic.</p></div>

<h3>Chaar checks detail mein</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Kya check karein</th></tr>
<tr><td>SSID list mein nahi</td><td>Visibility / RF</td><td><code>show ap summary</code> (AP joined?), <code>show wlan summary</code> (WLAN enabled?), SSID broadcast, client ke band ke against radio policy, radio enabled, client range mein</td></tr>
<tr><td>SSID dikhta hai, "connect nahi hota" ya dobara password maangta hai</td><td>Authentication</td><td><code>show msglog</code>: MIC failure = galat PSK; security mismatch (WPA2 client ke liye WPA3-only); 802.1X ke liye: RADIUS reachable, shared secret, user aur certificate</td></tr>
<tr><td>Connected, IP nahi ya 169.254.x.x</td><td>IP / DHCP</td><td><code>show wlan N</code> interface, <code>show interface summary</code> VLAN, WLC aur switch trunks par VLAN allowed, DHCP scope ya relay</td></tr>
<tr><td>Galat subnet ka IP</td><td>WLAN se VLAN mapping</td><td>WLAN galat interface se mapped</td></tr>
<tr><td>Sahi IP, server tak nahi pahunchta</td><td>Traffic</td><td>Gateway, us VLAN par ACLs, DNS, routing</td></tr>
<tr><td>Connected par slow ya drop hota hai</td><td>RF performance</td><td>RSSI (−70 dBm se neeche?), SNR (20 dB se neeche?), co-channel aur adjacent-channel padosi, retries, sticky client, legacy rates</td></tr></table>

<h3>Lab walkthrough: "LAPTOP1 ko NK-STAFF nahi dikhta"</h3>
<p><b>Step 1, visibility.</b> Laptop ka scan khaali hai, isliye controller check karo:</p>
<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 1

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
<span class="hl">1        STAFF / NK-STAFF                  Disabled  guest             WPA2-Personal (PSK)</span></pre>
<p>Ek line mein do clues: WLAN <b>Disabled</b> hai, aur <b>guest</b> se mapped hai. Pehla fault abhi theek karo aur doosra note karo:</p>
<pre class="code">(WLC1) &gt;config wlan enable 1</pre>

<p><b>Step 2, authentication.</b> SSID ab dikhta hai, par laptop abhi bhi connect nahi hota. Message log (naya sabse upar) kahani batata hai:</p>
<pre class="out">(WLC1) &gt;show msglog

<span class="hl">Sep 29 08:02:11.482 %APF-4-AUTH_FAIL: Client 52:54:00:aa:00:01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: MIC failure in 4-way handshake (wrong pre-shared key)</span>
Sep 29 08:02:09.107 %APF-6-CLIENT_ASSOC: Client 52:54:00:aa:00:02 associated to AP AP1 (2.4 GHz ch 1) on WLAN 1 (NK-STAFF), interface guest VLAN 30</pre>
<p>PHONE1 (…:02) join karta hai, isliye WLAN chal raha hai; LAPTOP1 (…:01) MIC failure ke saath fail hota hai, jo galat passphrase ki pehchaan hai. Laptop ise confirm karta hai:</p>
<pre class="out">LAPTOP1&gt; wifi status
Not connected. Saved profile: NK-STAFF (auto-connect paused after an authentication failure)
<span class="hl">Last attempt: NK-STAFF failed (psk)</span></pre>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024</pre>

<p><b>Step 3, IP address.</b> Laptop connect hota hai, par <code>wifi status</code> 10.10.30.0/24 ka address dikhata hai, guest subnet, staff subnet 10.10.20.0/24 nahi. WLAN ke interface naam ko uske VLAN se milao:</p>
<pre class="out">(WLC1) &gt;show wlan 1
...
Interface........................................ guest

(WLC1) &gt;show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
<span class="hl">guest                 1     30        10.10.30.5       Dynamic  No      No</span></pre>
<p>NK-STAFF clients <b>VLAN 30</b> mein bridge ho rahe the. WLAN ko remap karo. Controller apne clients ko de-authenticate karta hai, jo dobara join karke VLAN 20 mein DHCP chalate hain; production controller par aise changes schedule karo kyunki yeh users ko disconnect karte hain:</p>
<pre class="code">(WLC1) &gt;config wlan interface 1 staff</pre>

<p><b>Step 4, traffic.</b> VLAN 30 mein SRV1 ka ping fail hua kyunki R1 ka <code>GUEST-IN</code> ACL guest traffic ko internal 10.10.0.0/16 subnets tak deny karta hai, bilkul guests ke design ke mutabik. VLAN 20 mein aisa koi ACL nahi:</p>
<pre class="code">LAPTOP1&gt; ping 10.10.50.10</pre>
<p>Ping ab succeed hota hai, aur ticket chaar root causes document karke close ho sakta hai: WLAN disabled, laptop par galat PSK, WLAN guest interface se mapped, aur uske nateeje mein guest ACL.</p>

<div class="eg"><p><b>Worked example.</b> Ek client RSSI −74 dBm dikhata hai aur noise floor −90 dBm hai. SNR = −74 − (−90) = 16 dB, reliable data ke 20 dB minimum se neeche. Client connected hai par low data rates use karega aur aksar retry karega. Fix RF hai (paas ka AP, kam interference, 5 GHz), DHCP ya security nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek saath kai cheezein badalna, ya pehle AP reboot karna. Aap saboot kho dete ho aur wajah kabhi nahi seekhte. Ek cheez badlo, verify karo, phir agle step par jaao. Aur yaad rakho ki PSK ya interface change us WLAN ke har client ko disconnect karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 169.254.x.x address ka matlab DHCP fail hua (VLAN aur DHCP scope check karo), authentication problem nahi. Galat subnet ka address WLAN-to-interface mapping ki taraf ishara karta hai. 4-way handshake ya MIC failure PSK ki taraf.</p></div>

<div class="scn"><h4>WPA3 upgrade jisne purane laptops bahar kar diye</h4><p>Security mazboot karne ke liye ek administrator ne staff WLAN ko WPA2 se sirf WPA3-SAE par badla. Naye phones turant reconnect ho gaye, par lagbhag tees purane laptops SSID dikhate aur phir "cannot connect to this network" ke saath fail hote. Controller logs ne dikhaya ki laptops apni association requests mein sirf WPA2-PSK offer kar rahe the. Unke wireless drivers SAE support nahi karte the. Engineer ne WLAN ko WPA2/WPA3 transition mode par switch kiya aur sirf WPA3 par jaane se pehle driver updates schedule kiye.</p><p><b>Seekh:</b> security changes client capabilities se match hone chahiye; WLAN tight karne se pehle check karo ki clients kya support karte hain.</p></div>

<div class="iv"><p class="q">"Ek user kehta hai woh Wi-Fi se connect nahi kar pa raha. Aap kaise troubleshoot karoge?"</p><p>Strong answer: pehle scope nikalo: ek user ya kai, ek area, ek device type, aur kya badla. Phir join follow karo: kya client ko SSID dikhta hai (AP joined, WLAN enabled, band aur radio policy, signal); kya woh authenticate hota hai (controller logs, PSK ya RADIUS, WPA2 vs WPA3 support); kya use sahi subnet mein IP milta hai (WLAN-to-VLAN mapping, trunks, DHCP); kya woh destination tak pahunchta hai (gateway, ACLs, DNS). Performance complaints ke liye RSSI aur SNR check karna aur ek time par ek cheez badalna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope: ek ya kai clients, ek area, ek band, aur kya badla.</li>
<li>Join follow karo: SSID dikhna, authentication, sahi IP, traffic.</li>
<li>MIC ya 4-way handshake failure = galat PSK; galat subnet = WLAN galat interface se mapped; 169.254 = DHCP failure.</li>
<li>Useful commands: show wlan summary, show wlan N, show interface summary, show msglog, show client summary/detail, wifi scan/status.</li>
<li>Slow ya drop hote clients: RSSI, SNR, channel overlap aur retries check karo.</li>
</ul></div>
`}};export{e as default};