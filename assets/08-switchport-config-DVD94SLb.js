var e={id:`switchport-config`,h:{en:`Switchport configuration: order, priority, host modes, fallbacks and rollout`,hi:`Switchport configuration: order, priority, host modes, fallbacks aur rollout`},body:{en:`
<p>A good receptionist has a script: first ask for the ID card; if the person has none, check the vehicle list; if that fails, send them to the visitor desk; and if the phone line to the manager is down, let staff through to a safe waiting area rather than locking everyone out. The switchport configuration is that script. This chapter builds it for the lab and then shows how real companies roll it out without breaking the network.</p>

<h3>The lab port configuration (task 3)</h3>
<pre class="code">SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# authentication port-control auto          <span class="c">! run authentication on this port</span>
SW1(config-if-range)# dot1x pae authenticator                    <span class="c">! act as 802.1X authenticator</span>
SW1(config-if-range)# mab                                         <span class="c">! allow MAC Authentication Bypass</span>
SW1(config-if-range)# authentication order dot1x mab              <span class="c">! try 802.1X first, then MAB</span>
SW1(config-if-range)# dot1x timeout tx-period 5                   <span class="c">! give up on 802.1X after 15 s</span>
SW1(config-if-range)# authentication event no-response action authorize vlan 50</pre>
<p><code>authentication port-control</code> has three values: <b>auto</b> (authenticate), <b>force-authorized</b> (no authentication, always open; the default) and <b>force-unauthorized</b> (always closed). The access VLAN configured on the port (VLAN 10 in the lab) is only the fallback when RADIUS returns no VLAN.</p>

<h3>Order and priority: flexible authentication</h3>
<ul>
<li><b><code>authentication order dot1x mab</code></b>: start with 802.1X; after "no response" (tx-period x 3), fall back to MAB. Clean ISE logs, but supplicant-less devices wait.</li>
<li><b><code>authentication order mab dot1x</code></b> with <b><code>authentication priority dot1x mab</code></b>: MAB first so printers are online in seconds, and if EAPOL arrives later, 802.1X (higher priority) takes over the session. Faster, but every laptop generates a failed MAB request in ISE first.</li>
</ul>
<p><b>Order</b> is the sequence methods are tried. <b>Priority</b> decides which method may interrupt an existing session: a higher-priority method can replace a lower-priority success. By default priority follows the order.</p>

<h3>What happens when things go wrong: events</h3>
<table class="cmp"><tr><th>Event</th><th>Command</th><th>Typical use</th></tr>
<tr><td>No response to 802.1X (and MAB fails or is not configured)</td><td><code>authentication event no-response action authorize vlan 50</code></td><td><b>Guest VLAN</b> for devices without a supplicant</td></tr>
<tr><td>802.1X credentials rejected</td><td><code>authentication event fail action authorize vlan 60</code> or <code>... fail action next-method</code></td><td><b>Auth-fail VLAN</b>, or try MAB/WebAuth next</td></tr>
<tr><td>All RADIUS servers dead</td><td><code>authentication event server dead action authorize vlan 70</code></td><td><b>Critical VLAN</b> so business continues</td></tr>
<tr><td>Server back</td><td><code>authentication event server alive action reinitialize</code></td><td>Re-authenticate critical sessions properly</td></tr>
</table>
<p>In the lab, GUEST1 sends no EAPOL and its MAC is unknown to ISE, so it lands in VLAN 50 by the no-response rule. The switch, not ISE, made that decision, and the details say so:</p>
<pre class="out">SW1# show authentication sessions interface g0/3 details
            Interface:  GigabitEthernet0/3
          MAC Address:  0050.7966.0c33
            User-Name:  005079660c33
               Status:  Authorized
Local Policies:
<span class="hl">           Vlan Group:  Vlan: 50  (guest VLAN (no 802.1X response))</span>
Method status list:
       Method           State
       dot1x            No response
       mab              Authc Failed</pre>

<h3>Host modes: how many devices per port</h3>
<table class="cmp"><tr><th>Host mode</th><th>Behaviour</th><th>Use</th></tr>
<tr><td><b>single-host</b> (default)</td><td>One MAC only; a second MAC is a violation</td><td>Normal desk port</td></tr>
<tr><td><b>multi-host</b></td><td>First MAC authenticates, then every MAC behind it is allowed</td><td>Rarely; weak, a hub bypasses control</td></tr>
<tr><td><b>multi-domain</b></td><td>One device in the data domain and one in the voice domain, each authenticated</td><td>IP phone with a PC behind it</td></tr>
<tr><td><b>multi-auth</b></td><td>Every MAC authenticates separately (one voice device plus many data)</td><td>Phone plus PC, small unmanaged switch, VMs</td></tr>
</table>
<p>Configure with <code>authentication host-mode multi-domain</code> and so on. A second MAC in single-host mode triggers the <code>authentication violation</code> action: <b>restrict</b> (drop and log), <b>protect</b> (drop silently), <b>shutdown</b> (err-disable) or <b>replace</b> (new MAC replaces the old session).</p>

<h3>Rolling it out safely: monitor, low-impact, closed</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="802.1X deployment phases">
<rect x="10" y="30" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">Monitor mode</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">authentication open</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="12">nothing blocked, all logged</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Low-impact mode</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">open + pre-auth ACL</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">DHCP, DNS only; dACL after</text>
<rect x="440" y="30" width="190" height="90" rx="10" fill="#fed7aa"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">Closed mode</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">default behaviour</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="12">only EAPOL before auth</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Visibility first, then gradual enforcement</text>
</svg><p class="cap">The phased deployment every large 802.1X project uses.</p></div>
<ul>
<li><b>Monitor mode</b>: <code>authentication open</code> lets traffic flow whatever the result, while authentications still run and are logged. You discover every device and fix supplicants and MAB lists with zero user impact.</li>
<li><b>Low-impact mode</b>: still open, but a pre-authentication port ACL (<code>ip access-group PRE-AUTH in</code>) allows only DHCP, DNS and perhaps PXE boot. After authentication, a dACL from ISE opens the right access.</li>
<li><b>Closed mode</b>: no <code>authentication open</code>; only EAPOL (and CDP/LLDP) pass before authorization. Strongest, and the goal.</li>
</ul>

<h3>IBNS 2.0: the same logic as a policy</h3>
<p>Newer IOS XE uses <b>Identity-Based Networking Services 2.0</b>, which expresses the script with class maps and a control policy (C3PL). <code>authentication display new-style</code> shows the configuration in the new syntax and <code>authentication convert-to new-style</code> migrates it permanently. The equivalent of the lab port:</p>
<pre class="code">class-map type control subscriber match-all DOT1X_NO_RESP
 match method dot1x
 match result-type method dot1x agent-not-found
!
policy-map type control subscriber DOT1X_MAB
 event session-started match-all
  10 class always do-until-failure
   10 authenticate using dot1x priority 10
 event authentication-failure match-first
  10 class DOT1X_NO_RESP do-until-failure
   10 terminate dot1x
   20 authenticate using mab priority 20
 event agent-found match-all
  10 class always do-until-failure
   10 terminate mab
   20 authenticate using dot1x priority 10
!
interface GigabitEthernet0/1
 access-session host-mode single-host
 access-session closed
 access-session port-control auto
 dot1x pae authenticator
 mab
 service-policy type control subscriber DOT1X_MAB</pre>
<p>IBNS 2.0 adds features the classic syntax cannot express, such as running 802.1X and MAB concurrently, per-event actions and <b>service templates</b> (for example a critical-access template with its own VLAN and ACL).</p>

<div class="eg"><p><b>Worked example.</b> A factory has 1,800 ports: 1,100 PCs, 400 phones with PCs behind them, 250 PLCs and 50 printers. Plan: <code>host-mode multi-domain</code> for phone ports, <code>multi-auth</code> for the 30 ports with small unmanaged switches on the shop floor, <code>order mab dot1x</code> plus <code>priority dot1x mab</code> so PLCs come up within seconds after a power cut, critical VLAN 70 for server-dead, four weeks in monitor mode, two weeks low-impact, then closed mode floor by floor.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring a guest, auth-fail or critical VLAN that does not exist on the switch. The session fails with "VLAN not found" and the port stays closed, so the safety net itself becomes the outage. Create every fallback VLAN and check it with <code>show vlan brief</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Guest VLAN = no 802.1X response. Auth-fail VLAN = 802.1X Access-Reject. Critical VLAN = no RADIUS server answers. Multi-domain allows exactly one voice and one data device; multi-auth allows many data devices. Order is sequence; priority is who may interrupt.</p></div>

<div class="scn"><h4>The RADIUS outage that stopped a hospital floor</h4><p>A firewall change blocked UDP 1812 between a hospital's access layer and ISE. Every re-authenticating device lost access, including nurses' workstations, because no critical VLAN existed. The fix was immediate (restore the rule), but the follow-up was structural: <code>authentication event server dead action authorize vlan 70</code> and <code>server alive action reinitialize</code> on every port, two PSNs in different data centers, and dead-criteria tuning.</p><p><b>Lesson:</b> always design for "the policy server is unreachable". Fail to a safe, limited network, not to a locked door.</p></div>

<div class="iv"><p class="q">"How would you roll out 802.1X across a 5,000-port campus?"</p><p>Strong answer: start with discovery and monitor mode (<code>authentication open</code>) so nothing breaks while ISE logs every device; build MAB lists and profiling policies for printers, phones and IoT; fix supplicant profiles and certificates. Move to low-impact mode with a pre-auth ACL and dACLs, then to closed mode site by site. Choose host modes per port type, set guest and critical VLANs, tune tx-period, use two PSNs, and have a rollback plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port essentials: port-control auto, dot1x pae authenticator, mab, order, timers and events.</li>
<li>Order = sequence; priority = which method can take over. "order mab dot1x + priority dot1x mab" is the fast option.</li>
<li>Guest (no response), auth-fail (reject), critical (server dead); the VLANs must exist.</li>
<li>Host modes: single-host, multi-host, multi-domain (one voice + one data), multi-auth (many).</li>
<li>Roll out monitor, then low-impact, then closed; IBNS 2.0 expresses the same logic as a control policy.</li>
</ul></div>
`,hi:`
<p>Achhi receptionist ke paas ek script hoti hai: pehle ID card maango; agar card nahi hai, vehicle list check karo; woh bhi fail ho to visitor desk bhejo; aur agar manager tak phone line down hai, to sabko band karne ki jagah staff ko ek safe waiting area tak jaane do. Switchport configuration wahi script hai. Yeh chapter use lab ke liye banata hai aur phir dikhata hai ki real companies ise network tode bina kaise roll out karti hain.</p>

<h3>Lab port configuration (task 3)</h3>
<pre class="code">SW1(config)# interface range g0/1 - 3
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# authentication port-control auto          <span class="c">! is port par authentication chalao</span>
SW1(config-if-range)# dot1x pae authenticator                    <span class="c">! 802.1X authenticator bano</span>
SW1(config-if-range)# mab                                         <span class="c">! MAC Authentication Bypass allow karo</span>
SW1(config-if-range)# authentication order dot1x mab              <span class="c">! pehle 802.1X, phir MAB</span>
SW1(config-if-range)# dot1x timeout tx-period 5                   <span class="c">! 15 s baad 802.1X chhod do</span>
SW1(config-if-range)# authentication event no-response action authorize vlan 50</pre>
<p><code>authentication port-control</code> ki teen values hain: <b>auto</b> (authenticate karo), <b>force-authorized</b> (koi authentication nahi, hamesha khula; yahi default hai) aur <b>force-unauthorized</b> (hamesha band). Port par configured access VLAN (lab mein VLAN 10) sirf fallback hai jab RADIUS koi VLAN return na kare.</p>

<h3>Order aur priority: flexible authentication</h3>
<ul>
<li><b><code>authentication order dot1x mab</code></b>: 802.1X se shuru karo; "no response" (tx-period x 3) ke baad MAB par fallback. ISE logs saaf rehte hain, lekin bina supplicant wale devices intezaar karte hain.</li>
<li><b><code>authentication order mab dot1x</code></b> ke saath <b><code>authentication priority dot1x mab</code></b>: pehle MAB taaki printers seconds mein online hon, aur agar EAPOL baad mein aaye, to 802.1X (higher priority) session le leta hai. Tez hai, lekin har laptop pehle ISE mein ek failed MAB request banata hai.</li>
</ul>
<p><b>Order</b> woh sequence hai jismein methods try hote hain. <b>Priority</b> decide karti hai ki kaunsa method existing session ko interrupt kar sakta hai: higher-priority method lower-priority success ko replace kar sakta hai. Default mein priority order ke saath chalti hai.</p>

<h3>Jab kuch galat ho: events</h3>
<table class="cmp"><tr><th>Event</th><th>Command</th><th>Typical use</th></tr>
<tr><td>802.1X ka koi jawab nahi (aur MAB fail ya configured nahi)</td><td><code>authentication event no-response action authorize vlan 50</code></td><td>Bina supplicant wale devices ke liye <b>guest VLAN</b></td></tr>
<tr><td>802.1X credentials reject hue</td><td><code>authentication event fail action authorize vlan 60</code> ya <code>... fail action next-method</code></td><td><b>Auth-fail VLAN</b>, ya aage MAB/WebAuth try karo</td></tr>
<tr><td>Saare RADIUS servers dead</td><td><code>authentication event server dead action authorize vlan 70</code></td><td><b>Critical VLAN</b> taaki business chalta rahe</td></tr>
<tr><td>Server wapas</td><td><code>authentication event server alive action reinitialize</code></td><td>Critical sessions ko theek se re-authenticate karo</td></tr>
</table>
<p>Lab mein GUEST1 koi EAPOL nahi bhejta aur uska MAC ISE ko pata nahi, isliye woh no-response rule se VLAN 50 mein aata hai. Yeh decision switch ne liya, ISE ne nahi, aur details yahi batati hain:</p>
<pre class="out">SW1# show authentication sessions interface g0/3 details
            Interface:  GigabitEthernet0/3
          MAC Address:  0050.7966.0c33
            User-Name:  005079660c33
               Status:  Authorized
Local Policies:
<span class="hl">           Vlan Group:  Vlan: 50  (guest VLAN (no 802.1X response))</span>
Method status list:
       Method           State
       dot1x            No response
       mab              Authc Failed</pre>

<h3>Host modes: ek port par kitne devices</h3>
<table class="cmp"><tr><th>Host mode</th><th>Behaviour</th><th>Use</th></tr>
<tr><td><b>single-host</b> (default)</td><td>Sirf ek MAC; doosra MAC violation hai</td><td>Normal desk port</td></tr>
<tr><td><b>multi-host</b></td><td>Pehla MAC authenticate hota hai, phir uske peeche har MAC allowed</td><td>Kam hi; kamzor, hub control bypass kar deta hai</td></tr>
<tr><td><b>multi-domain</b></td><td>Data domain mein ek device aur voice domain mein ek, dono authenticated</td><td>IP phone jiske peeche PC ho</td></tr>
<tr><td><b>multi-auth</b></td><td>Har MAC alag authenticate hota hai (ek voice device plus kai data)</td><td>Phone plus PC, chhota unmanaged switch, VMs</td></tr>
</table>
<p><code>authentication host-mode multi-domain</code> jaise commands se configure karo. Single-host mode mein doosra MAC <code>authentication violation</code> action trigger karta hai: <b>restrict</b> (drop aur log), <b>protect</b> (chupchaap drop), <b>shutdown</b> (err-disable) ya <b>replace</b> (naya MAC purane session ko replace karta hai).</p>

<h3>Safely roll out karna: monitor, low-impact, closed</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="802.1X deployment phases">
<rect x="10" y="30" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">Monitor mode</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">authentication open</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="12">kuch block nahi, sab log</text>
<rect x="225" y="30" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Low-impact mode</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">open + pre-auth ACL</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">sirf DHCP, DNS; baad mein dACL</text>
<rect x="440" y="30" width="190" height="90" rx="10" fill="#fed7aa"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">Closed mode</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">default behaviour</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="12">auth se pehle sirf EAPOL</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Pehle visibility, phir dheere dheere enforcement</text>
</svg><p class="cap">Phased deployment jo har bada 802.1X project use karta hai.</p></div>
<ul>
<li><b>Monitor mode</b>: <code>authentication open</code> result chahe jo ho traffic chalne deta hai, jabki authentications phir bhi chalti aur log hoti hain. Aap har device discover karte ho aur supplicants aur MAB lists theek karte ho, users par zero impact ke saath.</li>
<li><b>Low-impact mode</b>: abhi bhi open, lekin pre-authentication port ACL (<code>ip access-group PRE-AUTH in</code>) sirf DHCP, DNS aur shayad PXE boot allow karta hai. Authentication ke baad ISE ka dACL sahi access kholta hai.</li>
<li><b>Closed mode</b>: <code>authentication open</code> nahi; authorization se pehle sirf EAPOL (aur CDP/LLDP) pass hote hain. Sabse strong, aur yahi goal hai.</li>
</ul>

<h3>IBNS 2.0: wahi logic policy ki tarah</h3>
<p>Naya IOS XE <b>Identity-Based Networking Services 2.0</b> use karta hai, jo script ko class maps aur control policy (C3PL) se express karta hai. <code>authentication display new-style</code> configuration ko naye syntax mein dikhata hai aur <code>authentication convert-to new-style</code> use permanently migrate karta hai. Lab port ka equivalent:</p>
<pre class="code">class-map type control subscriber match-all DOT1X_NO_RESP
 match method dot1x
 match result-type method dot1x agent-not-found
!
policy-map type control subscriber DOT1X_MAB
 event session-started match-all
  10 class always do-until-failure
   10 authenticate using dot1x priority 10
 event authentication-failure match-first
  10 class DOT1X_NO_RESP do-until-failure
   10 terminate dot1x
   20 authenticate using mab priority 20
 event agent-found match-all
  10 class always do-until-failure
   10 terminate mab
   20 authenticate using dot1x priority 10
!
interface GigabitEthernet0/1
 access-session host-mode single-host
 access-session closed
 access-session port-control auto
 dot1x pae authenticator
 mab
 service-policy type control subscriber DOT1X_MAB</pre>
<p>IBNS 2.0 woh features jodta hai jo classic syntax express nahi kar sakta, jaise 802.1X aur MAB ko concurrently chalana, per-event actions aur <b>service templates</b> (jaise apne VLAN aur ACL wala critical-access template).</p>

<div class="eg"><p><b>Worked example.</b> Ek factory mein 1,800 ports hain: 1,100 PCs, 400 phones jinke peeche PCs hain, 250 PLCs aur 50 printers. Plan: phone ports ke liye <code>host-mode multi-domain</code>, shop floor ke 30 ports jin par chhote unmanaged switches hain unke liye <code>multi-auth</code>, <code>order mab dot1x</code> plus <code>priority dot1x mab</code> taaki power cut ke baad PLCs seconds mein up hon, server-dead ke liye critical VLAN 70, chaar hafte monitor mode, do hafte low-impact, phir floor by floor closed mode.</p></div>

<div class="warn"><p><b>Common galti.</b> Aisa guest, auth-fail ya critical VLAN configure karna jo switch par exist hi nahi karta. Session "VLAN not found" se fail hota hai aur port band rehta hai, to safety net khud outage ban jaata hai. Har fallback VLAN banao aur <code>show vlan brief</code> se check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Guest VLAN = 802.1X ka koi jawab nahi. Auth-fail VLAN = 802.1X Access-Reject. Critical VLAN = koi RADIUS server jawab nahi deta. Multi-domain bilkul ek voice aur ek data device allow karta hai; multi-auth kai data devices. Order sequence hai; priority yeh hai ki kaun interrupt kar sakta hai.</p></div>

<div class="scn"><h4>RADIUS outage jisne hospital floor rok diya</h4><p>Ek firewall change ne hospital ki access layer aur ISE ke beech UDP 1812 block kar diya. Har re-authenticate hone wale device ka access chala gaya, nurses ke workstations bhi, kyunki koi critical VLAN nahi tha. Fix turant tha (rule restore karo), lekin follow-up structural tha: har port par <code>authentication event server dead action authorize vlan 70</code> aur <code>server alive action reinitialize</code>, alag data centers mein do PSNs, aur dead-criteria tuning.</p><p><b>Seekh:</b> hamesha "policy server unreachable hai" ke liye design karo. Band darwaze par nahi, ek safe, limited network par fail karo.</p></div>

<div class="iv"><p class="q">"5,000-port campus par 802.1X kaise roll out karoge?"</p><p>Strong answer: discovery aur monitor mode (<code>authentication open</code>) se shuru karo taaki kuch na toote jabki ISE har device log kare; printers, phones aur IoT ke liye MAB lists aur profiling policies banao; supplicant profiles aur certificates theek karo. Pre-auth ACL aur dACLs ke saath low-impact mode par jao, phir site by site closed mode. Port type ke hisaab se host modes chuno, guest aur critical VLANs set karo, tx-period tune karo, do PSNs use karo, aur rollback plan rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port essentials: port-control auto, dot1x pae authenticator, mab, order, timers aur events.</li>
<li>Order = sequence; priority = kaunsa method le sakta hai. "order mab dot1x + priority dot1x mab" tez option hai.</li>
<li>Guest (no response), auth-fail (reject), critical (server dead); VLANs exist karne chahiye.</li>
<li>Host modes: single-host, multi-host, multi-domain (ek voice + ek data), multi-auth (kai).</li>
<li>Pehle monitor, phir low-impact, phir closed roll out karo; IBNS 2.0 wahi logic control policy ki tarah express karta hai.</li>
</ul></div>
`}};export{e as default};