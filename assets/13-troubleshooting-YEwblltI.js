var e={id:`troubleshooting`,h:{en:`Troubleshooting WLANs and wireless clients from the controller GUI`,hi:`Controller GUI se WLANs aur wireless clients troubleshoot karna`},body:{en:`
<p>ENCOR 3.4 says "troubleshoot WLAN configuration and wireless client connectivity issues using GUI only". In real life you will use the CLI too, but the exam shows GUI screens, and in many companies the wireless team works mainly in the GUI. This chapter gives you a workflow that follows the client's journey, the GUI screens that answer each question, and then walks through the ticket lab.</p>

<h3>An analogy: tracking a parcel</h3>
<p>A parcel that does not arrive is traced stage by stage: was it collected, did it pass the sorting centre, did it clear customs, was it loaded on the right van, did the van reach the street? You never start by calling the recipient's neighbour. A wireless client has the same stages: <b>AP</b> up, <b>SSID</b> visible, <b>association</b>, <b>authentication</b>, <b>IP address</b>, <b>traffic</b>. The stage where it stops tells you where to look.</p>

<h3>The client's journey and where it stops</h3>
<table class="cmp"><tr><th>Stage</th><th>Symptom</th><th>GUI place to look</th><th>Typical cause</th></tr>
<tr><td>1. AP joined and serving</td><td>No SSID in an area</td><td>Monitoring &gt; Wireless &gt; Access Points (state, tags, radios) and Configuration &gt; Wireless &gt; Access Points &gt; General (AP mode, country)</td><td>AP not joined, wrong mode (monitor/sniffer), radio disabled, wrong tag on 9800</td></tr>
<tr><td>2. WLAN on air</td><td>SSID missing everywhere or on one band</td><td>Configuration &gt; Tags &amp; Profiles &gt; WLANs (status, broadcast, radio policy) and Tags &gt; Policy (is the WLAN mapped to an enabled policy profile, and does the AP carry that tag?)</td><td>WLAN disabled, SSID hidden, radio policy 5 GHz only (a real setting, concept only in the lab), a shut RF profile, WLAN not in the AP's policy tag</td></tr>
<tr><td>3. Association</td><td>Client rejected at once</td><td>Client details, message logs</td><td>Client limit reached, unsupported data rates, PMF or 11r required but not supported</td></tr>
<tr><td>4. Authentication</td><td>"Wrong password", stuck on "Authenticating"</td><td>Client details (state L2 Auth), message logs, RADIUS statistics, ISE live logs</td><td>Wrong PSK (MIC failure), RADIUS unreachable or secret mismatch, user rejected, certificate not trusted</td></tr>
<tr><td>5. IP address</td><td>Connected, no address or 169.254.x.x</td><td>Monitoring &gt; Wireless &gt; Clients (state, VLAN) and Configuration &gt; Tags &amp; Profiles &gt; Policy (VLAN of the policy profile)</td><td>Policy profile in the wrong VLAN, VLAN missing on the controller or the trunk, no DHCP scope</td></tr>
<tr><td>6. Traffic</td><td>Has IP, cannot reach resources</td><td>Client details: ACL, QoS, WebAuth state; Configuration &gt; Security &gt; ACL</td><td>ACL blocking, WebAuth pending, gateway or DNS wrong</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Client states on the controller">
<rect x="5" y="40" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">Associated</text>
<rect x="110" y="40" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="157" y="66" text-anchor="middle" class="svg-ink" font-size="12">L2 auth</text>
<rect x="215" y="40" width="95" height="44" rx="8" fill="#bae6fd"/><text x="262" y="66" text-anchor="middle" class="svg-ink" font-size="12">Mobility</text>
<rect x="320" y="40" width="95" height="44" rx="8" fill="#fde68a"/><text x="367" y="66" text-anchor="middle" class="svg-ink" font-size="12">IP learn</text>
<rect x="425" y="40" width="110" height="44" rx="8" fill="#fed7aa"/><text x="480" y="66" text-anchor="middle" class="svg-ink" font-size="12">WebAuth pending</text>
<rect x="545" y="40" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="590" y="66" text-anchor="middle" class="svg-ink" font-size="12">Run</text>
<line x1="100" y1="62" x2="110" y2="62" stroke="#64748b"/><line x1="205" y1="62" x2="215" y2="62" stroke="#64748b"/><line x1="310" y1="62" x2="320" y2="62" stroke="#64748b"/><line x1="415" y1="62" x2="425" y2="62" stroke="#64748b"/><line x1="535" y1="62" x2="545" y2="62" stroke="#64748b"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">the state a client is stuck in points to the failing stage (names vary slightly by release)</text>
</svg><p class="cap">Client policy states shown in the controller's client details.</p></div>

<h3>The GUI tools worth knowing</h3>
<ul><li><b>Client details / Client 360</b> (search by MAC or user): AP, band, channel, RSSI, SNR, protocol, spatial streams, WLAN, VLAN, IP, state, security (AKM, EAP method), mobility role (local, anchor, foreign), roam history.</li>
<li><b>AP details</b>: mode, join time, radios (channel, width, power), clients per radio, channel utilisation, interference and noise.</li>
<li><b>Logs</b>: Troubleshooting &gt; Logs on the 9800 web UI (the same lines as <code>show logging</code>). Older AireOS controllers had Management &gt; Logs.</li>
<li><b>Radioactive trace</b> (9800 Troubleshooting): debug for one client MAC across all processes; the first thing Cisco TAC asks for. Concept only in this lab; practised in module <b>wl-diag</b> (Wireless troubleshooting like a CCIE).</li>
<li><b>Embedded packet capture</b> and AP packet capture (9800 Troubleshooting) to see EAPOL, DHCP and CAPWAP: concept only here, also in wl-diag.</li>
<li><b>AP join statistics</b> for APs that will not join (reason for the last failure).</li>
<li><b>Catalyst Center Assurance</b> (formerly DNA Center Assurance) adds client health scores and onboarding timelines: concept only here, see module <b>wl-auto</b> (Wireless automation and Spaces).</li></ul>

<h3>Walking through the ticket lab</h3>
<p>Ticket 1: "Phones on the east side (near AP2) see no Wi-Fi at all." Stage 1: open Monitoring &gt; Wireless &gt; Access Points. AP2 is Registered, so it joined; <code>show ap summary</code> on the 9800 has no Mode column, so read the mode on the AP itself.</p>
<pre class="out">WLC1# show ap summary
AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
--------------------------------------------------------------------------------------------------
AP1                 2      C9120AXI-D    0050.42a6.9801  0050.42a6.9800  IN  10.10.10.11     <span class="hl">Registered</span>
AP2                 2      C9120AXI-D    0050.43a6.9a01  0050.43a6.9a00  IN  10.10.10.12     <span class="hl">Registered</span>

WLC1# show ap name AP2 config general
CISCO AP Name   : AP2
AP Mode         : <span class="hl">Monitor</span>
CAPWAP state    : Joined
Policy Tag Name : PT-CAMPUS</pre>
<pre class="code"><span class="c">! GUI: Configuration &gt; Wireless &gt; Access Points &gt; AP2 &gt; General &gt; AP Mode: Local &gt; Update &amp; Apply to Device</span>
WLC1# ap name AP2 mode local</pre>
<p>PHONE1, which is out of range of AP1, now finds NK-STAFF on AP2 and joins from its saved profile (<code>wifi status</code> shows AP2, 5 GHz channel 40, 10.10.20.11/24).</p>
<p>Ticket 2: "Employees cannot log in to NK-CORP; the one engineer who got in was given a staff address." That is two symptoms at two stages. Stage 4, authentication: the controller only reports a timeout (Troubleshooting &gt; Logs, and the timeouts counter in Configuration &gt; Security &gt; AAA &gt; Servers). The log is empty after boot; one retry on LAPTOP1 writes the line.</p>
<pre class="out">WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 0050.2fe9.9a01 on WLAN 2 (NK-CORP): <span class="hl">RADIUS server not responding (check address, port and shared secret)</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, <span class="hl">timeouts 2</span></pre>
<p>A timeout, not a reject, means the server never answered. Check the server side: RAD1's own log explains why.</p>
<pre class="out">RAD1&gt; aaa-server show log
Recent events:
  RADIUS request from 10.10.99.10 ignored: <span class="hl">shared key mismatch</span></pre>
<pre class="code"><span class="c">! GUI: Configuration &gt; Security &gt; AAA &gt; Servers &gt; RAD1: type the shared secret again &gt; Update &amp; Apply to Device</span>
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1</pre>
<p>Stage 5, IP address: <code>show wireless profile policy detailed PP-CORP</code> (GUI: Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-CORP) shows <b>VLAN : 20</b>, so 802.1X users land in the staff VLAN instead of VLAN 40. The policy profile must be disabled before its VLAN changes.</p>
<pre class="code">WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
<span class="hl">% Cannot modify the policy profile while it is enabled. Use 'shutdown' on the policy profile first.</span>
WLC1(config-wireless-policy)# shutdown
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024</pre>
<pre class="out">RADIUS Access-Accept from 10.10.60.20 - PMK installed, 4-way handshake ... completed
Connected to "NK-CORP" (WPA2-Enterprise) - 130 Mbps
DDORA IP <span class="hl">10.10.40.11/24</span> GW 10.10.40.1</pre>
<p>LAPTOP1 stopped retrying after repeated failures (a real supplicant also backs off), so it must reconnect by hand after the fixes.</p>
<div class="tip"><p><b>Doing it in the web UI</b></p><p>Lab 2 is GUI only on the controller. Ticket 1: Monitoring &gt; Wireless &gt; Access Points (AP2 Registered), then Configuration &gt; Wireless &gt; Access Points &gt; AP2 &gt; General &gt; AP Mode: Local &gt; Update &amp; Apply to Device. Ticket 2: Troubleshooting &gt; Logs and Configuration &gt; Security &gt; AAA &gt; Servers for the timeout evidence; fix the secret on RAD1 there; then Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-CORP: switch Status off, set VLAN 40, Apply to Device, switch Status on. Only the reconnect of LAPTOP1 is typed on the client. Check the end result in Monitoring &gt; Wireless &gt; Clients.</p></div>

<div class="eg"><p><b>Worked example: reading a client-details screen.</b> Client state IP Learn for 40 seconds, WLAN NK-GUEST, VLAN 31, RSSI −58 dBm, SNR 35 dB, authentication "Open + WebAuth". RF is fine (stage 1–3 pass), authentication at Layer 2 is open, and the client is stuck at IP learning: it never received DHCP. VLAN 31 does not exist on the switch trunk. Fix the WLAN's interface/VLAN mapping, not the RF.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rebooting the controller or APs before reading client details. (2) Treating a RADIUS timeout like a reject: timeouts point to reachability or the shared secret; rejects point to the user or policy. (3) Fixing one fault in a ticket with two symptoms and closing it; always re-test the full journey.</p></div>

<div class="exam"><p><b>Exam traps.</b> A screenshot with good RSSI/SNR and state "IP Learn" means DHCP/VLAN, not RF. "Authenticating" or L2 Auth pending points to PSK/802.1X/RADIUS. "WebAuth pending" means the user has not logged in on the portal (or the CoA did not arrive). An AP with Mode = Monitor serves no clients.</p></div>

<div class="scn"><h4>Everyone on the fourth floor, but only on 2.4 GHz</h4><p>Users on the fourth floor were connected but slow, and all appeared on 2.4 GHz. RF looked fine from the desk. The engineer opened Monitoring &gt; Wireless &gt; Radios: both 5 GHz radios were Disabled. A new RF profile had been shut down during a test and bound to the floor's RF tag, and nobody had enabled it again. (A per-WLAN radio policy limited to 2.4 GHz gives the same symptom on a real controller, but the lab does not model it.) Enabling the RF profile brought 5 GHz back, dual-band clients moved over and speeds tripled.</p><p><b>Lesson:</b> check the radio state and the WLAN's own settings (status, broadcast, radio policy, policy VLAN) before touching RF.</p></div>

<div class="iv"><p class="q">"A user says 'Wi-Fi does not work'. What is your first step on the controller?"</p><p>Strong answer: get the MAC address or username, open the client details, and see how far the client got: associated, authenticating, IP learning, WebAuth pending or Run. Then check the stage that failed: AP and radio state, WLAN settings, RADIUS logs, VLAN/DHCP, ACLs. Mention RSSI/SNR in the client details, radioactive traces on a 9800, and re-testing the full journey after a fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the journey: AP, SSID, association, authentication, IP, traffic.</li>
<li>Client details show the stuck state, RSSI/SNR, WLAN, VLAN, security and mobility role.</li>
<li>RADIUS timeout = reachability or shared secret; reject = user or policy.</li>
<li>Check WLAN settings (status, broadcast, radio policy, interface) and AP mode early.</li>
<li>Tools: message logs, radioactive trace, packet capture, AP join statistics.</li>
</ul></div>
`,hi:`
<p>ENCOR 3.4 kehta hai "troubleshoot WLAN configuration and wireless client connectivity issues using GUI only". Real life mein aap CLI bhi use karoge, lekin exam GUI screens dikhata hai, aur bahut companies mein wireless team mainly GUI mein kaam karti hai. Yeh chapter aapko ek workflow deta hai jo client ki yatra follow karta hai, woh GUI screens jo har sawaal ka jawab deti hain, aur phir ticket lab step by step chalata hai.</p>

<h3>Ek analogy: parcel track karna</h3>
<p>Jo parcel nahi pahuncha use stage by stage trace karte hain: kya collect hua, kya sorting centre se guzra, kya customs clear hua, kya sahi van mein load hua, kya van gali tak pahunchi? Aap kabhi receiver ke padosi ko phone karke shuru nahi karte. Wireless client ke bhi yahi stages hain: <b>AP</b> up, <b>SSID</b> dikhna, <b>association</b>, <b>authentication</b>, <b>IP address</b>, <b>traffic</b>. Jis stage par ruke, wahi batata hai kahan dekhna hai.</p>

<h3>Client ki yatra aur woh kahan rukti hai</h3>
<table class="cmp"><tr><th>Stage</th><th>Symptom</th><th>GUI mein kahan dekho</th><th>Typical wajah</th></tr>
<tr><td>1. AP joined aur serving</td><td>Ek area mein SSID nahi</td><td>Monitoring &gt; Wireless &gt; Access Points (state, tags, radios) aur Configuration &gt; Wireless &gt; Access Points &gt; General (AP mode, country)</td><td>AP joined nahi, galat mode (monitor/sniffer), radio disabled, 9800 par galat tag</td></tr>
<tr><td>2. WLAN hawa mein</td><td>SSID har jagah ya ek band par gayab</td><td>Configuration &gt; Tags &amp; Profiles &gt; WLANs (status, broadcast, radio policy) aur Tags &gt; Policy (WLAN enabled policy profile se mapped hai, aur AP ke paas wahi tag hai?)</td><td>WLAN disabled, SSID hidden, radio policy sirf 5 GHz (asli setting, lab mein concept only), shut RF profile, WLAN AP ke policy tag mein nahi</td></tr>
<tr><td>3. Association</td><td>Client turant reject</td><td>Client details, message logs</td><td>Client limit poori, unsupported data rates, PMF ya 11r required par supported nahi</td></tr>
<tr><td>4. Authentication</td><td>"Galat password", "Authenticating" par atka</td><td>Client details (state L2 Auth), message logs, RADIUS statistics, ISE live logs</td><td>Galat PSK (MIC failure), RADIUS unreachable ya secret mismatch, user rejected, certificate trusted nahi</td></tr>
<tr><td>5. IP address</td><td>Connected, address nahi ya 169.254.x.x</td><td>Monitoring &gt; Wireless &gt; Clients (state, VLAN) aur Configuration &gt; Tags &amp; Profiles &gt; Policy (policy profile ka VLAN)</td><td>Policy profile galat VLAN mein, controller ya trunk par VLAN missing, DHCP scope nahi</td></tr>
<tr><td>6. Traffic</td><td>IP hai, resources tak nahi pahunchta</td><td>Client details: ACL, QoS, WebAuth state; Configuration &gt; Security &gt; ACL</td><td>ACL block, WebAuth pending, gateway ya DNS galat</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Controller par client states">
<rect x="5" y="40" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">Associated</text>
<rect x="110" y="40" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="157" y="66" text-anchor="middle" class="svg-ink" font-size="12">L2 auth</text>
<rect x="215" y="40" width="95" height="44" rx="8" fill="#bae6fd"/><text x="262" y="66" text-anchor="middle" class="svg-ink" font-size="12">Mobility</text>
<rect x="320" y="40" width="95" height="44" rx="8" fill="#fde68a"/><text x="367" y="66" text-anchor="middle" class="svg-ink" font-size="12">IP learn</text>
<rect x="425" y="40" width="110" height="44" rx="8" fill="#fed7aa"/><text x="480" y="66" text-anchor="middle" class="svg-ink" font-size="12">WebAuth pending</text>
<rect x="545" y="40" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="590" y="66" text-anchor="middle" class="svg-ink" font-size="12">Run</text>
<line x1="100" y1="62" x2="110" y2="62" stroke="#64748b"/><line x1="205" y1="62" x2="215" y2="62" stroke="#64748b"/><line x1="310" y1="62" x2="320" y2="62" stroke="#64748b"/><line x1="415" y1="62" x2="425" y2="62" stroke="#64748b"/><line x1="535" y1="62" x2="545" y2="62" stroke="#64748b"/>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">client jis state mein atka hai wahi failing stage batata hai (naam release ke hisaab se thode badalte hain)</text>
</svg><p class="cap">Controller ki client details mein dikhne wale client policy states.</p></div>

<h3>Jaanne layak GUI tools</h3>
<ul><li><b>Client details / Client 360</b> (MAC ya username se search): AP, band, channel, RSSI, SNR, protocol, spatial streams, WLAN, VLAN, IP, state, security (AKM, EAP method), mobility role (local, anchor, foreign), roam history.</li>
<li><b>AP details</b>: mode, join time, radios (channel, width, power), har radio par clients, channel utilisation, interference aur noise.</li>
<li><b>Logs</b>: 9800 web UI mein Troubleshooting &gt; Logs (wahi lines jo <code>show logging</code> deta hai). Purane AireOS controllers mein Management &gt; Logs tha.</li>
<li><b>Radioactive trace</b> (9800 Troubleshooting): ek client MAC ke liye saare processes mein debug; Cisco TAC sabse pehle yahi maangta hai. Is lab mein concept only; module <b>wl-diag</b> (Wireless troubleshooting like a CCIE) mein practise hota hai.</li>
<li><b>Embedded packet capture</b> aur AP packet capture (9800 Troubleshooting) EAPOL, DHCP aur CAPWAP dekhne ke liye: yahan concept only, wl-diag mein bhi.</li>
<li><b>AP join statistics</b> un APs ke liye jo join nahi karte (aakhri failure ki wajah).</li>
<li><b>Catalyst Center Assurance</b> (pehle DNA Center Assurance) client health scores aur onboarding timelines jodta hai: yahan concept only, module <b>wl-auto</b> (Wireless automation and Spaces) dekho.</li></ul>

<h3>Ticket lab step by step</h3>
<p>Ticket 1: "East side (AP2 ke paas) ke phones ko koi Wi-Fi nahi dikhta." Stage 1: Monitoring &gt; Wireless &gt; Access Points kholo. AP2 Registered hai, matlab join hua; 9800 par <code>show ap summary</code> mein Mode column nahi hota, isliye mode AP ke apne page par padho.</p>
<pre class="out">WLC1# show ap summary
AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
--------------------------------------------------------------------------------------------------
AP1                 2      C9120AXI-D    0050.42a6.9801  0050.42a6.9800  IN  10.10.10.11     <span class="hl">Registered</span>
AP2                 2      C9120AXI-D    0050.43a6.9a01  0050.43a6.9a00  IN  10.10.10.12     <span class="hl">Registered</span>

WLC1# show ap name AP2 config general
CISCO AP Name   : AP2
AP Mode         : <span class="hl">Monitor</span>
CAPWAP state    : Joined
Policy Tag Name : PT-CAMPUS</pre>
<pre class="code"><span class="c">! GUI: Configuration &gt; Wireless &gt; Access Points &gt; AP2 &gt; General &gt; AP Mode: Local &gt; Update &amp; Apply to Device</span>
WLC1# ap name AP2 mode local</pre>
<p>PHONE1, jo AP1 ki range se bahar hai, ab AP2 par NK-STAFF dhoondh leta hai aur apne saved profile se join karta hai (<code>wifi status</code> AP2, 5 GHz channel 40, 10.10.20.11/24 dikhata hai).</p>
<p>Ticket 2: "Employees NK-CORP par login nahi kar paate; jo ek engineer andar gaya use staff address mila." Yeh do stages par do symptoms hain. Stage 4, authentication: controller sirf timeout report karta hai (Troubleshooting &gt; Logs, aur Configuration &gt; Security &gt; AAA &gt; Servers mein timeouts counter). Boot ke baad log khali hota hai; LAPTOP1 par ek retry line likh deta hai.</p>
<pre class="out">WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 0050.2fe9.9a01 on WLAN 2 (NK-CORP): <span class="hl">RADIUS server not responding (check address, port and shared secret)</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, <span class="hl">timeouts 2</span></pre>
<p>Timeout, reject nahi, matlab server ne kabhi jawab nahi diya. Server side check karo: RAD1 ka apna log wajah batata hai.</p>
<pre class="out">RAD1&gt; aaa-server show log
Recent events:
  RADIUS request from 10.10.99.10 ignored: <span class="hl">shared key mismatch</span></pre>
<pre class="code"><span class="c">! GUI: Configuration &gt; Security &gt; AAA &gt; Servers &gt; RAD1: shared secret dobara type karo &gt; Update &amp; Apply to Device</span>
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1</pre>
<p>Stage 5, IP address: <code>show wireless profile policy detailed PP-CORP</code> (GUI: Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-CORP) <b>VLAN : 20</b> dikhata hai, isliye 802.1X users VLAN 40 ki jagah staff VLAN mein aate hain. VLAN badalne se pehle policy profile disabled hona chahiye.</p>
<pre class="code">WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
<span class="hl">% Cannot modify the policy profile while it is enabled. Use 'shutdown' on the policy profile first.</span>
WLC1(config-wireless-policy)# shutdown
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024</pre>
<pre class="out">RADIUS Access-Accept from 10.10.60.20 - PMK installed, 4-way handshake ... completed
Connected to "NK-CORP" (WPA2-Enterprise) - 130 Mbps
DDORA IP <span class="hl">10.10.40.11/24</span> GW 10.10.40.1</pre>
<p>Baar baar failure ke baad LAPTOP1 ne retry band kar diya (asli supplicant bhi back off karta hai), isliye fixes ke baad use haath se reconnect karna padta hai.</p>
<div class="tip"><p><b>Web UI mein karna</b></p><p>Lab 2 controller par sirf GUI hai. Ticket 1: Monitoring &gt; Wireless &gt; Access Points (AP2 Registered), phir Configuration &gt; Wireless &gt; Access Points &gt; AP2 &gt; General &gt; AP Mode: Local &gt; Update &amp; Apply to Device. Ticket 2: timeout ke saboot ke liye Troubleshooting &gt; Logs aur Configuration &gt; Security &gt; AAA &gt; Servers; secret wahin RAD1 par theek karo; phir Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-CORP: Status off, VLAN 40 set karo, Apply to Device, Status on. Sirf LAPTOP1 ka reconnect client par type hota hai. Antim result Monitoring &gt; Wireless &gt; Clients mein dekho.</p></div>

<div class="eg"><p><b>Worked example: client-details screen padhna.</b> Client state 40 seconds se IP Learn, WLAN NK-GUEST, VLAN 31, RSSI −58 dBm, SNR 35 dB, authentication "Open + WebAuth". RF theek hai (stage 1–3 pass), Layer 2 par authentication open hai, aur client IP learning par atka hai: use kabhi DHCP nahi mila. Switch trunk par VLAN 31 exist nahi karta. WLAN ki interface/VLAN mapping theek karo, RF nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Client details padhne se pehle controller ya APs reboot karna. (2) RADIUS timeout ko reject jaisa samajhna: timeouts reachability ya shared secret ki taraf ishara karte hain; rejects user ya policy ki taraf. (3) Do symptoms wale ticket mein ek fault theek karke band kar dena; hamesha poori yatra dobara test karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Achhe RSSI/SNR aur state "IP Learn" wala screenshot matlab DHCP/VLAN, RF nahi. "Authenticating" ya L2 Auth pending PSK/802.1X/RADIUS ki taraf ishara hai. "WebAuth pending" matlab user ne portal par login nahi kiya (ya CoA nahi pahuncha). Mode = Monitor wala AP koi client serve nahi karta.</p></div>

<div class="scn"><h4>Chauthi manzil par sab, par sirf 2.4 GHz par</h4><p>Chauthi manzil ke users connected the par slow, aur sab 2.4 GHz par dikh rahe the. Desk se RF theek lag raha tha. Engineer ne Monitoring &gt; Wireless &gt; Radios kholi: dono 5 GHz radios Disabled the. Test ke dauraan ek naya RF profile shut kiya gaya tha aur floor ke RF tag se bandh gaya, aur kisi ne use dobara enable nahi kiya. (Per-WLAN radio policy sirf 2.4 GHz par rakhne se asli controller par yahi symptom aata hai, par lab use model nahi karti.) RF profile enable karne se 5 GHz wapas aaya, dual-band clients wahan gaye aur speeds teen guna ho gayi.</p><p><b>Lesson:</b> RF chhoone se pehle radio state aur WLAN ki apni settings (status, broadcast, radio policy, policy VLAN) check karo.</p></div>

<div class="iv"><p class="q">"User kehta hai 'Wi-Fi nahi chal raha'. Controller par aapka pehla step kya hai?"</p><p>Strong answer: MAC address ya username lo, client details kholo, aur dekho client kitna aage gaya: associated, authenticating, IP learning, WebAuth pending ya Run. Phir jo stage fail hua use check karo: AP aur radio state, WLAN settings, RADIUS logs, VLAN/DHCP, ACLs. Client details mein RSSI/SNR, 9800 par radioactive traces, aur fix ke baad poori yatra dobara test karna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yatra follow karo: AP, SSID, association, authentication, IP, traffic.</li>
<li>Client details atki hui state, RSSI/SNR, WLAN, VLAN, security aur mobility role dikhati hain.</li>
<li>RADIUS timeout = reachability ya shared secret; reject = user ya policy.</li>
<li>WLAN settings (status, broadcast, radio policy, interface) aur AP mode jaldi check karo.</li>
<li>Tools: message logs, radioactive trace, packet capture, AP join statistics.</li>
</ul></div>
`}};export{e as default};