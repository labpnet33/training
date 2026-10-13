var e={id:`mab-profiling`,h:{en:`MAB and profiling: identifying devices that cannot log in`,hi:`MAB aur profiling: un devices ko pehchanna jo login nahi kar sakte`},body:{en:`
<p>A courier robot cannot type a password or show a badge. So the security desk looks at the robot's serial number, checks it against a list of approved robots, and also looks at the robot itself: shape, logo, the way it moves. If it looks like a delivery robot from the approved vendor, it goes to the loading dock. That is <b>MAB</b> (the serial number) plus <b>profiling</b> (the look and behaviour).</p>

<h3>MAC Authentication Bypass, step by step</h3>
<p>Printers, IP cameras, badge readers, medical devices and many IoT sensors have no 802.1X supplicant. With <code>mab</code> on the port and <code>authentication order dot1x mab</code>:</p>
<ol>
<li>The switch sends EAP-Request/Identity and hears nothing (15 s in the lab, 90 s with defaults).</li>
<li>The switch learns the endpoint's MAC from the first frame it sends (usually DHCP Discover or ARP). The frame itself is not forwarded.</li>
<li>The switch sends a RADIUS Access-Request with <b>User-Name and password = the MAC</b> (by default lowercase without separators, for example <code>00507a000404</code>), <b>Service-Type = Call-Check</b> and Calling-Station-Id = the MAC.</li>
<li>ISE matches the built-in condition <b>Wired_MAB</b> (Call-Check plus Ethernet), looks the MAC up in its <b>endpoint database</b>, and returns Access-Accept with an authorization, or Access-Reject.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAB and profiling">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">CAM1</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">0050.7a00.0404</text>
<rect x="220" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="285" y="102" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1 Gi0/2</text><text x="285" y="120" text-anchor="middle" class="svg-muted" font-size="12">mab</text>
<line x1="140" y1="105" x2="220" y2="105" stroke="#64748b" stroke-width="2"/><text x="180" y="95" text-anchor="middle" class="svg-muted" font-size="12">DHCP</text>
<rect x="450" y="40" width="170" height="130" rx="8" fill="#ddd6fe"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">endpoint DB lookup</text>
<text x="535" y="105" text-anchor="middle" class="svg-muted" font-size="12">profiler: OUI, DHCP,</text>
<text x="535" y="122" text-anchor="middle" class="svg-muted" font-size="12">CDP/LLDP, HTTP</text>
<text x="535" y="150" text-anchor="middle" class="svg-accent" font-size="12">group: IP cameras</text>
<line x1="350" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="400" y="88" text-anchor="middle" class="svg-accent" font-size="12">Call-Check</text>
<line x1="450" y1="125" x2="350" y2="125" stroke="#64748b" stroke-width="2"/><text x="400" y="145" text-anchor="middle" class="svg-accent" font-size="12">VLAN 40, SGT 40</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">MAB proves nothing alone: profiling decides what the MAC really is</text>
</svg><p class="cap">The camera in the lab: MAB sends its MAC, profiling classifies it, and the authorization rule for cameras returns VLAN 40 and SGT 40.</p></div>

<h3>Unknown MACs: the "If user not found" option</h3>
<p>In the ISE authentication policy, a MAB rule has three options: <b>If Auth fail</b>, <b>If User not found</b> and <b>If Process fail</b>. For MAB the usual setting is <b>If User not found = CONTINUE</b>. That lets an unknown MAC proceed to the authorization policy, where a rule can redirect it to a guest portal (central WebAuth, chapter 9). If you leave it at REJECT, every new device simply fails with <b>22056 Subject not found in the applicable identity store(s)</b>.</p>

<h3>Profiling: what is this device?</h3>
<p>A MAC is easy to spoof. The ISE <b>profiler</b> collects attributes about each endpoint through <b>probes</b> on the PSN and assigns it a <b>profile</b> (for example "Axis-Device" or "Cisco-IP-Phone"):</p>
<table class="cmp"><tr><th>Probe</th><th>What it learns</th><th>How it gets there</th></tr>
<tr><td>RADIUS</td><td>MAC, OUI (vendor), NAS port, sometimes IP</td><td>Free with every authentication and accounting packet</td></tr>
<tr><td>DHCP</td><td>Hostname, vendor class (option 60), parameter request list (option 55)</td><td><code>ip helper-address</code> copy to the PSN, or Device Sensor</td></tr>
<tr><td>Device Sensor</td><td>CDP, LLDP and DHCP data gathered by the switch</td><td>Sent inside RADIUS accounting; best for wired</td></tr>
<tr><td>HTTP</td><td>User-agent (operating system, browser)</td><td>Portal redirection or SPAN</td></tr>
<tr><td>SNMP query/trap</td><td>CDP/LLDP neighbours, ARP tables</td><td>ISE polls the switch</td></tr>
<tr><td>DNS, NMAP, NetFlow, AD</td><td>FQDN, open ports, traffic, domain membership</td><td>Active or passive lookups</td></tr>
</table>
<p>Each profiling policy adds <b>certainty factor</b> points when a condition matches (for example +10 for an Axis OUI, +20 for an Axis DHCP class). The endpoint is assigned the matching profile with the highest certainty above the minimum. The profile can map to an <b>endpoint identity group</b> such as "IP-Cameras", and that group becomes an authorization condition. When a profile changes, ISE can issue a <b>profiler CoA</b> (reauth or port bounce) so the new authorization takes effect.</p>

<h3>The lab's camera rule</h3>
<p>The simulated ISE in the lab stores the policy as <code>aaa-server mab 0050.7a00.0404 vlan 40 sgt 40</code>. In real ISE that is an authorization rule such as <b>IF Wired_MAB AND EndPoints:LogicalProfile EQUALS IP-Cameras THEN CameraProfile</b>, where CameraProfile returns VLAN 40 and Security Group "Cameras" (SGT 40).</p>

<pre class="out">ACC-SW1# show authentication sessions interface g0/2 details
            Interface:  GigabitEthernet0/2
          MAC Address:  0050.7a00.0404
         IPv4 Address:  10.40.40.10
<span class="hl">            User-Name:  00507a000404</span>
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  single-host
Server Policies:
           Vlan Group:  Vlan: 40
<span class="hl">            SGT Value:  40</span>

Method status list:
       Method           State
       dot1x            Failed over
<span class="hl">       mab              Authc Success</span></pre>
<p>Three things to read: the User-Name is the MAC (so this was MAB), dot1x "Failed over" means no supplicant answered and MAB took over, and the SGT Value 40 is the answer to the lab question.</p>

<div class="eg"><p><b>Worked example.</b> A hospital has 900 infusion pumps from one vendor, OUI 00:1B:2C (illustrative). A custom profiling policy gives +10 for the OUI and +30 when DHCP option 60 contains the vendor string; minimum certainty 30. A pump with both scores 40 and lands in group "Infusion-Pumps", which gets a dACL allowing only the pump server 10.40.50.20 on TCP 443. A laptop that spoofs a pump MAC scores only 10 from the OUI, and its Windows DHCP fingerprint pushes it toward a Windows profile instead, so ISE flags the change and issues a CoA.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating MAB as authentication. It is identification by a value anyone can copy. Always pair MAB with profiling and a least-privilege result (a dedicated VLAN plus a dACL or SGT that allows only what that device type needs).</p></div>

<div class="exam"><p><b>Exam trap.</b> MAB uses Service-Type <b>Call-Check</b>; 802.1X uses Framed. The default timeout before MAB on a dot1x-first port is 90 seconds. And profiling is <b>not</b> posture: profiling asks "what is it?", posture asks "is it compliant?".</p></div>

<div class="scn"><h4>Cameras without addresses</h4><p>A new batch of IP cameras never got DHCP leases on 802.1X ports, although ISE showed MAB successes for older cameras. The new firmware stopped retrying DHCP after 60 seconds, but with default timers the switch only tried MAB after 90 seconds, so by the time the port was authorized the camera had given up. The fix was <code>dot1x timeout tx-period 10</code> (30 s total) on camera ports and <code>authentication order mab dot1x</code> on ports dedicated to cameras.</p><p><b>Lesson:</b> MAB timing matters; tune tx-period, or put MAB first where no supplicant will ever exist.</p></div>

<div class="iv"><p class="q">"How do you securely onboard IP cameras that cannot do 802.1X?"</p><p>Strong answer: MAB on the port, with the switch falling back from 802.1X quickly or using MAB first on dedicated ports. ISE profiles the cameras using RADIUS, DHCP and Device Sensor data, places them in an endpoint identity group, and the authorization rule returns a camera VLAN plus a dACL or SGT that allows only the video recorder. Mention MAC spoofing risk and profiler CoA when a profile changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB sends the MAC as username and password with Service-Type Call-Check.</li>
<li>Set "If User not found = Continue" for MAB so unknown devices reach authorization (guest redirect).</li>
<li>Profiling probes (RADIUS, DHCP, Device Sensor, HTTP, SNMP, DNS, NMAP) classify endpoints using certainty factors.</li>
<li>Endpoint identity groups and logical profiles become authorization conditions.</li>
<li>MAB is spoofable: always combine it with profiling and least-privilege enforcement.</li>
</ul></div>
`,hi:`
<p>Courier robot password type nahi kar sakta na badge dikha sakta hai. To security desk robot ka serial number dekhta hai, use approved robots ki list se check karta hai, aur robot ko khud bhi dekhta hai: shape, logo, chalne ka tarika. Agar woh approved vendor ka delivery robot lagta hai, to loading dock jaata hai. Yahi <b>MAB</b> (serial number) plus <b>profiling</b> (look aur behaviour) hai.</p>

<h3>MAC Authentication Bypass, step by step</h3>
<p>Printers, IP cameras, badge readers, medical devices aur kai IoT sensors mein koi 802.1X supplicant nahi hota. Port par <code>mab</code> aur <code>authentication order dot1x mab</code> ke saath:</p>
<ol>
<li>Switch EAP-Request/Identity bhejta hai aur kuch nahi sunta (lab mein 15 s, defaults ke saath 90 s).</li>
<li>Switch endpoint ka MAC uske bheje pehle frame se seekhta hai (aam taur par DHCP Discover ya ARP). Frame khud forward nahi hota.</li>
<li>Switch RADIUS Access-Request bhejta hai jismein <b>User-Name aur password = MAC</b> (default mein lowercase bina separators, jaise <code>00507a000404</code>), <b>Service-Type = Call-Check</b> aur Calling-Station-Id = MAC hota hai.</li>
<li>ISE built-in condition <b>Wired_MAB</b> (Call-Check plus Ethernet) match karta hai, MAC ko apne <b>endpoint database</b> mein dhoondhta hai, aur authorization ke saath Access-Accept, ya Access-Reject lautata hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAB and profiling">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#fde68a"/><text x="80" y="102" text-anchor="middle" class="svg-ink" font-size="13">CAM1</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">0050.7a00.0404</text>
<rect x="220" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="285" y="102" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1 Gi0/2</text><text x="285" y="120" text-anchor="middle" class="svg-muted" font-size="12">mab</text>
<line x1="140" y1="105" x2="220" y2="105" stroke="#64748b" stroke-width="2"/><text x="180" y="95" text-anchor="middle" class="svg-muted" font-size="12">DHCP</text>
<rect x="450" y="40" width="170" height="130" rx="8" fill="#ddd6fe"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<text x="535" y="85" text-anchor="middle" class="svg-muted" font-size="12">endpoint DB lookup</text>
<text x="535" y="105" text-anchor="middle" class="svg-muted" font-size="12">profiler: OUI, DHCP,</text>
<text x="535" y="122" text-anchor="middle" class="svg-muted" font-size="12">CDP/LLDP, HTTP</text>
<text x="535" y="150" text-anchor="middle" class="svg-accent" font-size="12">group: IP cameras</text>
<line x1="350" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="400" y="88" text-anchor="middle" class="svg-accent" font-size="12">Call-Check</text>
<line x1="450" y1="125" x2="350" y2="125" stroke="#64748b" stroke-width="2"/><text x="400" y="145" text-anchor="middle" class="svg-accent" font-size="12">VLAN 40, SGT 40</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">MAB akele kuch prove nahi karta: profiling decide karta hai MAC asal mein kya hai</text>
</svg><p class="cap">Lab ka camera: MAB uska MAC bhejta hai, profiling use classify karta hai, aur cameras ka authorization rule VLAN 40 aur SGT 40 lautata hai.</p></div>

<h3>Anjaan MACs: "If user not found" option</h3>
<p>ISE authentication policy mein MAB rule ke teen options hote hain: <b>If Auth fail</b>, <b>If User not found</b> aur <b>If Process fail</b>. MAB ke liye aam setting <b>If User not found = CONTINUE</b> hai. Isse anjaan MAC authorization policy tak pahunchta hai, jahan ek rule use guest portal par redirect kar sakta hai (central WebAuth, chapter 9). Agar aap ise REJECT par chhod do, to har naya device seedha <b>22056 Subject not found in the applicable identity store(s)</b> ke saath fail hota hai.</p>

<h3>Profiling: yeh device kya hai?</h3>
<p>MAC spoof karna aasaan hai. ISE <b>profiler</b> PSN par <b>probes</b> ke through har endpoint ke attributes collect karta hai aur use ek <b>profile</b> deta hai (jaise "Axis-Device" ya "Cisco-IP-Phone"):</p>
<table class="cmp"><tr><th>Probe</th><th>Kya seekhta hai</th><th>Wahan kaise pahunchta hai</th></tr>
<tr><td>RADIUS</td><td>MAC, OUI (vendor), NAS port, kabhi kabhi IP</td><td>Har authentication aur accounting packet ke saath free</td></tr>
<tr><td>DHCP</td><td>Hostname, vendor class (option 60), parameter request list (option 55)</td><td>PSN ko <code>ip helper-address</code> copy, ya Device Sensor</td></tr>
<tr><td>Device Sensor</td><td>Switch ka collect kiya CDP, LLDP aur DHCP data</td><td>RADIUS accounting ke andar bheja jaata hai; wired ke liye best</td></tr>
<tr><td>HTTP</td><td>User-agent (operating system, browser)</td><td>Portal redirection ya SPAN</td></tr>
<tr><td>SNMP query/trap</td><td>CDP/LLDP neighbours, ARP tables</td><td>ISE switch ko poll karta hai</td></tr>
<tr><td>DNS, NMAP, NetFlow, AD</td><td>FQDN, open ports, traffic, domain membership</td><td>Active ya passive lookups</td></tr>
</table>
<p>Har profiling policy condition match hone par <b>certainty factor</b> points jodti hai (jaise Axis OUI ke liye +10, Axis DHCP class ke liye +20). Endpoint ko minimum se upar sabse zyada certainty wala matching profile milta hai. Profile ek <b>endpoint identity group</b> jaise "IP-Cameras" se map ho sakta hai, aur woh group authorization condition ban jaata hai. Profile badalne par ISE <b>profiler CoA</b> (reauth ya port bounce) bhej sakta hai taaki naya authorization lagu ho.</p>

<h3>Lab ka camera rule</h3>
<p>Lab ka simulated ISE policy ko <code>aaa-server mab 0050.7a00.0404 vlan 40 sgt 40</code> ki tarah store karta hai. Real ISE mein yeh ek authorization rule hai jaise <b>IF Wired_MAB AND EndPoints:LogicalProfile EQUALS IP-Cameras THEN CameraProfile</b>, jahan CameraProfile VLAN 40 aur Security Group "Cameras" (SGT 40) lautata hai.</p>

<pre class="out">ACC-SW1# show authentication sessions interface g0/2 details
            Interface:  GigabitEthernet0/2
          MAC Address:  0050.7a00.0404
         IPv4 Address:  10.40.40.10
<span class="hl">            User-Name:  00507a000404</span>
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  single-host
Server Policies:
           Vlan Group:  Vlan: 40
<span class="hl">            SGT Value:  40</span>

Method status list:
       Method           State
       dot1x            Failed over
<span class="hl">       mab              Authc Success</span></pre>
<p>Teen cheezein padho: User-Name MAC hai (to yeh MAB tha), dot1x "Failed over" ka matlab kisi supplicant ne jawab nahi diya aur MAB ne sambhala, aur SGT Value 40 lab question ka jawab hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital mein ek vendor ke 900 infusion pumps hain, OUI 00:1B:2C (illustrative). Ek custom profiling policy OUI ke liye +10 aur DHCP option 60 mein vendor string hone par +30 deti hai; minimum certainty 30. Dono wala pump 40 score karta hai aur group "Infusion-Pumps" mein jaata hai, jise ek dACL milta hai jo sirf pump server 10.40.50.20 ko TCP 443 par allow karta hai. Pump MAC spoof karne wala laptop OUI se sirf 10 score karta hai, aur uska Windows DHCP fingerprint use Windows profile ki taraf dhakelta hai, isliye ISE change flag karke CoA bhejta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> MAB ko authentication samajhna. Yeh ek aisi value se identification hai jise koi bhi copy kar sakta hai. MAB ko hamesha profiling aur least-privilege result ke saath jodo (dedicated VLAN plus dACL ya SGT jo sirf woh allow kare jo us device type ko chahiye).</p></div>

<div class="exam"><p><b>Exam trap.</b> MAB Service-Type <b>Call-Check</b> use karta hai; 802.1X Framed use karta hai. dot1x-first port par MAB se pehle default timeout 90 seconds hai. Aur profiling posture <b>nahi</b> hai: profiling poochta hai "yeh kya hai?", posture poochta hai "kya yeh compliant hai?".</p></div>

<div class="scn"><h4>Bina address ke cameras</h4><p>IP cameras ke ek naye batch ko 802.1X ports par kabhi DHCP lease nahi mili, jabki ISE purane cameras ke liye MAB successes dikhata tha. Naya firmware 60 seconds baad DHCP retry karna band kar deta tha, par default timers ke saath switch 90 seconds baad hi MAB try karta tha, to port authorize hone tak camera haar maan chuka tha. Fix tha camera ports par <code>dot1x timeout tx-period 10</code> (kul 30 s) aur sirf cameras wale ports par <code>authentication order mab dot1x</code>.</p><p><b>Seekh:</b> MAB timing matter karti hai; tx-period tune karo, ya jahan kabhi supplicant hoga hi nahi wahan MAB pehle rakho.</p></div>

<div class="iv"><p class="q">"Jo IP cameras 802.1X nahi kar sakte unhe securely onboard kaise karoge?"</p><p>Strong answer: port par MAB, switch 802.1X se jaldi fallback kare ya dedicated ports par pehle MAB use kare. ISE RADIUS, DHCP aur Device Sensor data se cameras ko profile karta hai, unhe endpoint identity group mein daalta hai, aur authorization rule camera VLAN plus ek dACL ya SGT lautata hai jo sirf video recorder allow kare. MAC spoofing risk aur profile badalne par profiler CoA ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAB MAC ko username aur password ki tarah Service-Type Call-Check ke saath bhejta hai.</li>
<li>MAB ke liye "If User not found = Continue" set karo taaki anjaan devices authorization tak pahunchein (guest redirect).</li>
<li>Profiling probes (RADIUS, DHCP, Device Sensor, HTTP, SNMP, DNS, NMAP) certainty factors se endpoints classify karte hain.</li>
<li>Endpoint identity groups aur logical profiles authorization conditions bante hain.</li>
<li>MAB spoof ho sakta hai: use hamesha profiling aur least-privilege enforcement ke saath jodo.</li>
</ul></div>
`}};export{e as default};