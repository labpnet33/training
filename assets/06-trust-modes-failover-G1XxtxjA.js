var e={id:`trust-modes-failover`,h:{en:`Trust, AP modes and failover: what happens after discovery`,hi:`Trust, AP modes aur failover: discovery ke baad kya hota hai`},body:{en:`
<h3>Analogy: the badge check and the job role</h3>
<p>Finding the office is only the start. The security desk checks your <b>badge</b> before you may enter (trust). Once inside, your manager decides your <b>role</b>: front desk, night guard or auditor (AP mode). And a good company knows what to do if its main office is closed: a second office where you report instead (failover). This chapter explains those three ideas. Several details are concept only, and each one is labelled.</p>

<h3>Trust: certificates and DTLS</h3>
<p>A controller must not accept any device that claims to be an AP, and an AP must not hand its radios to a rogue controller. CAPWAP therefore uses <b>mutual authentication with X.509 certificates</b> during the DTLS handshake:</p>
<ul>
<li><b>MIC (manufacturer installed certificate):</b> every Cisco AP leaves the factory with a certificate signed by the manufacturer's certificate authority. The controller trusts that authority by default.</li>
<li><b>LSC (locally significant certificate):</b> the company issues its own certificates to APs from its own certificate authority. This gives control over exactly which APs may join and can be required for stricter designs.</li>
<li><b>Controller certificate:</b> the AP verifies the controller's certificate too. On the 9800 the controller uses a trustpoint for this role.</li>
</ul>
<p>Certificate validity depends on <b>time</b>. If the controller's clock is wrong, certificates may appear "not yet valid" or "expired", and the DTLS handshake fails. That is why NTP on the controller is part of the join design. Certificates, trustpoints and the AP authorization list are concept only in this course: <b>not simulated in the lab</b>, where trust always succeeds. In a real network, an AP that reaches the controller but never joins, with DTLS errors in the log, is a certificate or clock problem.</p>
<div class="note"><p><b>Defensive view.</b> Keep the AP authorization list or LSC requirement enabled on production controllers, so a stray device on an access port cannot join the wireless system. Protect the management VLAN with ACLs that permit only UDP 5246 and 5247 from the AP subnet to the controller.</p></div>

<h3>AP modes: the role of the AP</h3>
<table class="cmp"><tr><th>Mode</th><th>What the AP does</th><th>Typical use</th></tr>
<tr><td>Local</td><td>Serves clients and tunnels all client data to the controller (central switching). Scans other channels briefly for RRM.</td><td>Campus, our labs</td></tr>
<tr><td>FlexConnect</td><td>Serves clients and may switch data locally at the branch. Can keep working if the WAN to the controller is down.</td><td>Small branches (concept here)</td></tr>
<tr><td>Monitor</td><td>Does not serve clients. Listens for rogues, attacks and location data.</td><td>Security scanning</td></tr>
<tr><td>Sniffer</td><td>Captures 802.11 frames and sends them to an analyser.</td><td>Troubleshooting</td></tr>
<tr><td>Bridge / Mesh</td><td>Builds wireless links between buildings or backhaul.</td><td>Outdoor and warehouse</td></tr>
<tr><td>Sensor</td><td>Acts as a test client to measure service quality.</td><td>Assurance</td></tr>
</table>
<p>The labs use the default <b>local</b> mode for AP1 and AP2. A mode change resets the AP. Do not put an AP in monitor mode and expect clients to connect.</p>

<h3>Failover and high availability</h3>
<p>If the controller or the path to it fails, APs lose the CAPWAP tunnel and restart discovery. Plans for failure include:</p>
<ul>
<li><b>Primary, secondary, tertiary controllers</b> set on each AP, so it fails over to a named backup (the selection order from chapter 3).</li>
<li><b>N+1:</b> one spare controller supports N active ones. APs rejoin the spare. Join takes time and clients reconnect.</li>
<li><b>HA SSO:</b> two controllers act as one. The standby shares AP and client state, so a failure is nearly invisible. APs do not rejoin.</li>
<li><b>AP fallback:</b> after the primary returns, APs can move back to it.</li>
</ul>
<p>HA SSO, N+1 and fallback timers are concepts: <b>not simulated in the lab</b>. Coming up: module wl-mobility (Mobility and high availability). The labs have a single controller, WLC1.</p>

<h3>What the controller shows after join</h3>
<p>The detail view of one AP shows its mode, country, tags and controller IP. Layout is similar to the following:</p>
<pre class="out">WLC1# show ap name AP1 config general
Cisco AP Name   : AP1
AP Mode         : Local
Primary Cisco Controller Name : WLC1
Country Code    : IN
<span class="hl">Policy Tag      : default-policy-tag</span>
Site Tag Name   : default-site-tag
RF Tag Name     : default-rf-tag
Administrative State : Enabled
Operation State : Registered</pre>
<p>An AP that has joined but still uses <b>default tags</b> serves no WLAN: this is exactly the "invisible SSID" fault of the first module, and it is the reason join is not the end of the work.</p>

<div class="eg"><p><b>Worked example: AP joins but no SSID.</b> AP1 is Registered, mode Local. Tags are the defaults. Verdict: control plane is healthy, configuration plane is incomplete. You assign the policy tag and the SSID appears. If instead AP1 never reached Registered, no amount of tag editing would help.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Troubleshooting certificates before checking basic reachability. (2) Ignoring the controller clock. (3) Leaving APs in a stray mode (monitor or sniffer) after a test. (4) Thinking N+1 means no outage: APs must rejoin and clients reconnect.</p></div>
<div class="exam"><p><b>Exam trap.</b> MIC is factory-installed, LSC is locally issued. HA SSO keeps AP sessions, N+1 does not. FlexConnect can switch client data locally and keep serving if the WAN fails; local mode cannot.</p></div>

<div class="scn"><h4>Everything correct, yet DTLS fails</h4><p>A replacement controller was installed over the weekend. APs found it by option 43 and reached it by ping, yet stayed at DTLS setup. The log mentioned certificate not yet valid. The new controller's clock was set to its factory date. After NTP was configured and the time synced, APs joined within minutes.</p><p><b>Lesson:</b> certificate trust depends on correct time.</p></div>

<div class="iv"><p class="q">"What is the difference between HA SSO and N+1?"</p><p>With HA SSO a standby controller synchronises AP and client state with the active one and takes over without APs rejoining. With N+1 a spare controller waits empty: APs must discover it and join, clients reconnect. SSO is faster but needs a pair of equal controllers; N+1 is cheaper.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP and controller authenticate each other with certificates (MIC or LSC) during DTLS; time must be correct.</li>
<li>Certificate trust is concept only in the lab.</li>
<li>AP modes include local, FlexConnect, monitor, sniffer, bridge and sensor; labs use local.</li>
<li>HA SSO keeps state; N+1 requires rejoining. Both are concept here.</li>
<li>Joined with default tags still means no SSID: join is not the whole job.</li>
</ul></div>
`,hi:`
<h3>Analogy: badge check aur job role</h3>
<p>Office dhundna sirf shuruaat hai. Security desk entry se pehle aapka <b>badge</b> check karta hai (trust). Andar aane ke baad aapka manager aapka <b>role</b> decide karta hai: front desk, night guard ya auditor (AP mode). Aur achhi company jaanti hai ki main office band ho to kya karna hai: doosra office jahan report karna hai (failover). Yeh chapter in teen ideas ko samjhata hai. Kai details sirf concept hain, aur har ek par label hai.</p>

<h3>Trust: certificates aur DTLS</h3>
<p>Controller ko koi bhi device jo AP hone ka dawa kare, accept nahi karna chahiye, aur AP ko apne radios rogue controller ko nahi dene chahiye. Isliye CAPWAP DTLS handshake ke dauran <b>X.509 certificates se mutual authentication</b> use karta hai:</p>
<ul>
<li><b>MIC (manufacturer installed certificate):</b> har Cisco AP factory se manufacturer ki certificate authority ke signed certificate ke saath nikalta hai. Controller us authority par default roop se trust karta hai.</li>
<li><b>LSC (locally significant certificate):</b> company apni certificate authority se APs ko apne certificates deti hai. Isse control milta hai ki exactly kaun se APs join kar sakte hain aur strict designs mein required ho sakta hai.</li>
<li><b>Controller certificate:</b> AP controller ka certificate bhi verify karta hai. 9800 par controller is role ke liye trustpoint use karta hai.</li>
</ul>
<p>Certificate validity <b>time</b> par depend karti hai. Controller ki clock galat ho to certificates "not yet valid" ya "expired" dikh sakte hain, aur DTLS handshake fail hota hai. Isiliye controller par NTP join design ka hissa hai. Certificates, trustpoints aur AP authorization list is course mein sirf concept hain: <b>lab mein simulate nahi hote</b>, jahan trust hamesha succeed hota hai. Real network mein jo AP controller tak pahunche lekin kabhi join na kare aur log mein DTLS errors hon, woh certificate ya clock problem hai.</p>
<div class="note"><p><b>Defensive view.</b> Production controllers par AP authorization list ya LSC requirement enabled rakho, taaki access port par koi stray device wireless system join na kar sake. Management VLAN ko ACLs se protect karo jo AP subnet se controller tak sirf UDP 5246 aur 5247 permit karein.</p></div>

<h3>AP modes: AP ka role</h3>
<table class="cmp"><tr><th>Mode</th><th>AP kya karta hai</th><th>Typical use</th></tr>
<tr><td>Local</td><td>Clients ko serve karta hai aur saara client data controller ko tunnel karta hai (central switching). RRM ke liye doosre channels thodi der scan karta hai.</td><td>Campus, hamare labs</td></tr>
<tr><td>FlexConnect</td><td>Clients ko serve karta hai aur data branch par locally switch kar sakta hai. Controller tak WAN down ho to bhi kaam kar sakta hai.</td><td>Chhoti branches (yahan concept)</td></tr>
<tr><td>Monitor</td><td>Clients serve nahi karta. Rogues, attacks aur location data ke liye sunta hai.</td><td>Security scanning</td></tr>
<tr><td>Sniffer</td><td>802.11 frames capture karke analyser ko bhejta hai.</td><td>Troubleshooting</td></tr>
<tr><td>Bridge / Mesh</td><td>Buildings ke beech ya backhaul ke liye wireless links banata hai.</td><td>Outdoor aur warehouse</td></tr>
<tr><td>Sensor</td><td>Service quality measure karne ke liye test client ki tarah kaam karta hai.</td><td>Assurance</td></tr>
</table>
<p>Labs AP1 aur AP2 ke liye default <b>local</b> mode use karte hain. Mode badalne par AP reset hota hai. AP ko monitor mode mein daal kar clients ke connect hone ki ummeed mat rakho.</p>

<h3>Failover aur high availability</h3>
<p>Controller ya uska path fail ho to APs CAPWAP tunnel kho dete hain aur discovery dobara shuru karte hain. Failure ke liye plans mein shaamil hain:</p>
<ul>
<li>Har AP par set <b>primary, secondary, tertiary controllers</b>, taaki woh named backup par failover kare (chapter 3 ka selection order).</li>
<li><b>N+1:</b> ek spare controller N active controllers ko support karta hai. APs spare par rejoin karte hain. Join mein time lagta hai aur clients reconnect karte hain.</li>
<li><b>HA SSO:</b> do controllers ek ki tarah kaam karte hain. Standby AP aur client state share karta hai, isliye failure lagbhag invisible hota hai. APs rejoin nahi karte.</li>
<li><b>AP fallback:</b> primary wapas aane ke baad APs usi par laut sakte hain.</li>
</ul>
<p>HA SSO, N+1 aur fallback timers concepts hain: <b>lab mein simulate nahi hote</b>. Aage aane wala module: wl-mobility (Mobility and high availability). Labs mein ek hi controller hai, WLC1.</p>

<h3>Join ke baad controller kya dikhata hai</h3>
<p>Ek AP ka detail view uska mode, country, tags aur controller IP dikhata hai. Layout kuch aisa hota hai:</p>
<pre class="out">WLC1# show ap name AP1 config general
Cisco AP Name   : AP1
AP Mode         : Local
Primary Cisco Controller Name : WLC1
Country Code    : IN
<span class="hl">Policy Tag      : default-policy-tag</span>
Site Tag Name   : default-site-tag
RF Tag Name     : default-rf-tag
Administrative State : Enabled
Operation State : Registered</pre>
<p>Joined AP jo abhi bhi <b>default tags</b> use kare koi WLAN serve nahi karta: yahi pehle module ka "invisible SSID" fault hai, aur isi wajah se join kaam ka ant nahi hai.</p>

<div class="eg"><p><b>Worked example: AP join hua lekin SSID nahi.</b> AP1 Registered hai, mode Local. Tags defaults hain. Verdict: control plane healthy hai, configuration plane adhoori hai. Aap policy tag assign karte ho aur SSID aa jaata hai. Agar AP1 Registered tak pahunchta hi nahi, to tag edit karne se kuch nahi hota.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Basic reachability check kiye bina certificates troubleshoot karna. (2) Controller clock ignore karna. (3) Test ke baad APs ko stray mode (monitor ya sniffer) mein chhod dena. (4) Sochna ki N+1 ka matlab outage nahi: APs ko rejoin aur clients ko reconnect karna padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> MIC factory-installed hai, LSC locally issued. HA SSO AP sessions rakhta hai, N+1 nahi. FlexConnect client data locally switch kar sakta hai aur WAN fail hone par bhi serve kar sakta hai; local mode nahi kar sakta.</p></div>

<div class="scn"><h4>Sab sahi hai phir bhi DTLS fail</h4><p>Weekend par replacement controller install hua. APs ne use option 43 se dhunda aur ping se pahunche, phir bhi DTLS setup par atke rahe. Log mein certificate not yet valid likha tha. Naye controller ki clock factory date par set thi. NTP configure karne aur time sync hone ke baad APs kuch minute mein join ho gaye.</p><p><b>Seekh:</b> certificate trust sahi time par depend karta hai.</p></div>

<div class="iv"><p class="q">"HA SSO aur N+1 mein kya difference hai?"</p><p>HA SSO mein standby controller active ke saath AP aur client state synchronise karta hai aur APs ke rejoin kiye bina takeover karta hai. N+1 mein spare controller khaali intezaar karta hai: APs ko use discover karke join karna padta hai, clients reconnect karte hain. SSO tez hai lekin barabar controllers ki jodi chahiye; N+1 sasta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP aur controller DTLS ke dauran certificates (MIC ya LSC) se ek doosre ko authenticate karte hain; time sahi hona chahiye.</li>
<li>Certificate trust lab mein sirf concept hai.</li>
<li>AP modes: local, FlexConnect, monitor, sniffer, bridge aur sensor; labs local use karte hain.</li>
<li>HA SSO state rakhta hai; N+1 mein rejoin karna padta hai. Dono yahan concept hain.</li>
<li>Default tags ke saath joined ka matlab abhi bhi SSID nahi: join poora kaam nahi hai.</li>
</ul></div>
`}};export{e as default};