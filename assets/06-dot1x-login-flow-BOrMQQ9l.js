var e={id:`dot1x-login-flow`,h:{en:`An 802.1X login step by step, and the global configuration`,hi:`802.1X login step by step, aur global configuration`},body:{en:`
<p>When you fly, the sequence is always the same: check-in, security, passport, gate. If you know the sequence, you know exactly where a passenger got stuck just by where they are standing. 802.1X is the same. Once you can walk the exchange message by message, every troubleshooting question becomes "which step did it stop at?"</p>

<h3>The exchange, message by message</h3>
<div class="dia"><svg viewBox="0 0 640 390" role="img" aria-label="802.1X message sequence">
<text x="90" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text><text x="550" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="90" y1="28" x2="90" y2="380" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="28" x2="320" y2="380" stroke="#64748b" stroke-dasharray="3 3"/><line x1="550" y1="28" x2="550" y2="380" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="320" y1="50" x2="90" y2="50" stroke="#64748b" stroke-width="2"/><text x="205" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 EAP-Request/Identity</text>
<line x1="90" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="205" y="79" text-anchor="middle" class="svg-ink" font-size="12">2 EAP-Response/Identity alice</text>
<line x1="320" y1="120" x2="550" y2="120" stroke="#64748b" stroke-width="2"/><text x="435" y="114" text-anchor="middle" class="svg-ink" font-size="12">3 Access-Request</text>
<line x1="550" y1="155" x2="320" y2="155" stroke="#64748b" stroke-width="2"/><text x="435" y="149" text-anchor="middle" class="svg-ink" font-size="12">4 Access-Challenge</text>
<line x1="320" y1="190" x2="90" y2="190" stroke="#64748b" stroke-width="2"/><text x="205" y="184" text-anchor="middle" class="svg-ink" font-size="12">5 EAP-Request (method)</text>
<line x1="90" y1="225" x2="320" y2="225" stroke="#64748b" stroke-width="2"/><text x="205" y="219" text-anchor="middle" class="svg-ink" font-size="12">6 EAP-Response (proof)</text>
<line x1="320" y1="260" x2="550" y2="260" stroke="#64748b" stroke-width="2"/><text x="435" y="254" text-anchor="middle" class="svg-ink" font-size="12">7 Access-Request</text>
<line x1="550" y1="295" x2="320" y2="295" stroke="#16a34a" stroke-width="2"/><text x="435" y="289" text-anchor="middle" class="svg-accent" font-size="12">8 Access-Accept + VLAN 20</text>
<line x1="320" y1="330" x2="90" y2="330" stroke="#16a34a" stroke-width="2"/><text x="205" y="324" text-anchor="middle" class="svg-accent" font-size="12">9 EAP-Success</text>
<rect x="110" y="345" width="420" height="28" rx="6" fill="#bbf7d0"/><text x="320" y="364" text-anchor="middle" class="svg-ink" font-size="12">10 Port authorized in VLAN 20, then DHCP</text>
</svg><p class="cap">Steps 4 to 7 repeat as many times as the EAP method needs (a TLS handshake takes several round trips).</p></div>

<ol>
<li><b>Link up.</b> The port starts <b>unauthorized</b>. The switch sends <b>EAP-Request/Identity</b> and repeats it every <b>tx-period</b>. A supplicant may also speed things up by sending <b>EAPOL-Start</b>.</li>
<li><b>Identity.</b> The supplicant answers <b>EAP-Response/Identity</b> with the user name (or an anonymous outer identity).</li>
<li><b>Access-Request.</b> The switch wraps the EAP message in RADIUS and adds context: User-Name, NAS-IP-Address, NAS-Port-Id (<code>GigabitEthernet0/1</code>), <b>Calling-Station-Id</b> (the PC's MAC), Service-Type Framed, NAS-Port-Type Ethernet and a Cisco <b>audit-session-id</b> that ties every message of this session together.</li>
<li><b>Challenge rounds.</b> ISE picks the EAP method and replies with <b>Access-Challenge</b>; the switch unwraps it and sends an EAP-Request to the PC. The PC answers, the switch forwards. This loop repeats until the method finishes.</li>
<li><b>Decision.</b> ISE sends <b>Access-Accept</b> (with EAP-Success and authorization attributes) or <b>Access-Reject</b> (with EAP-Failure).</li>
<li><b>Enforcement.</b> The switch sends EAP-Success to the PC, moves the port to <b>authorized</b>, applies VLAN, ACL or SGT, and sends a RADIUS <b>Accounting-Start</b>. Only now does the PC's DHCP Discover get through.</li>
</ol>
<p>After a reject the switch waits the <b>quiet-period</b> (60 s by default) before trying again. If periodic reauthentication is on, the whole exchange is repeated silently; an EAPOL-Logoff or link-down ends the session and triggers Accounting-Stop.</p>

<h3>Timers you must know</h3>
<table class="cmp"><tr><th>Timer</th><th>Default</th><th>Meaning</th></tr>
<tr><td>tx-period</td><td>30 s</td><td>Interval between EAP-Request/Identity retries</td></tr>
<tr><td>max-reauth-req</td><td>2</td><td>Retries of the identity request before declaring "no response"</td></tr>
<tr><td>quiet-period</td><td>60 s</td><td>Wait after a failed authentication</td></tr>
<tr><td>supp-timeout / server-timeout</td><td>30 s</td><td>Wait for the supplicant or the server during the method</td></tr>
</table>
<p>The time before the switch gives up on a silent device is <b>tx-period x (max-reauth-req + 1)</b>: 30 x 3 = <b>90 s</b> with defaults. That is why printers wait a long time before MAB unless you shorten tx-period.</p>

<h3>Global configuration (lab tasks 1 and 2)</h3>
<pre class="code">SW1(config)# aaa new-model
SW1(config)# radius server ISE
SW1(config-radius-server)# address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key NKsecret
SW1(config-radius-server)# exit
SW1(config)# aaa authentication dot1x default group radius   <span class="c">! who checks 802.1X and MAB</span>
SW1(config)# aaa authorization network default group radius  <span class="c">! apply VLAN/ACL/SGT from RADIUS</span>
SW1(config)# aaa accounting dot1x default start-stop group radius
SW1(config)# dot1x system-auth-control                       <span class="c">! global 802.1X on/off switch</span></pre>
<p>Each line has a job. <code>aaa new-model</code> enables the AAA framework. The <b>authentication</b> method list tells 802.1X and MAB where to send requests. The <b>authorization network</b> list is what makes the switch <i>apply</i> the returned VLAN, ACL and SGT; without it, users authenticate but land in the port's static VLAN. <code>dot1x system-auth-control</code> is the global enable; without it the switch never sends EAP-Request/Identity, although MAB still runs.</p>
<p>In production you would add a second server, a server group and a few recommended RADIUS options:</p>
<pre class="code">SW1(config)# aaa group server radius ISE-GROUP
SW1(config-sg-radius)# server name ISE
SW1(config-sg-radius)# server name ISE-2
SW1(config-sg-radius)# ip radius source-interface Vlan99
SW1(config)# radius-server dead-criteria time 5 tries 3
SW1(config)# radius-server deadtime 15
SW1(config)# radius-server attribute 8 include-in-access-req    <span class="c">! send the endpoint IP</span>
SW1(config)# radius-server vsa send authentication</pre>

<h3>Verify</h3>
<pre class="out">SW1# show aaa servers
RADIUS: id 1, priority 1, host 10.99.99.10, auth-port 1812, acct-port 1813, hostname ISE
<span class="hl">     State: current UP, duration 312s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Quarantined: No
     Authen: request 6, timeouts 0, failover 0, retransmission 0
             Response: accept 2, reject 0, challenge 0</pre>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0101
         IPv4 Address:  10.20.20.10
            User-Name:  alice
<span class="hl">               Status:  Authorized</span>
               Domain:  DATA
       Oper host mode:  single-host
Server Policies:
           Vlan Group:  Vlan: 20
            SGT Value:  10
Method status list:
       Method           State
<span class="hl">       dot1x            Authc Success</span></pre>

<div class="eg"><p><b>Worked example.</b> With <code>dot1x timeout tx-period 5</code> and the default max-reauth-req of 2, a printer without a supplicant is declared "no response" after 5 x 3 = 15 s, which is exactly the wait the lab hint mentions before MAB starts. With defaults it would be 90 s, long enough for many printers to give up on DHCP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>aaa authorization network default group radius</code>. Authentication succeeds, the log on ISE says PASS, but the user sits in VLAN 10 instead of 20. The switch received the VLAN and simply ignored it. This is the third fault in the troubleshooting lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> The switch sends EAP-Request/Identity; it does not wait for the PC to start (EAPOL-Start is optional). The "no response" time is tx-period x (max-reauth-req + 1), not tx-period x max-reauth-req.</p></div>

<div class="scn"><h4>Authenticated but no address</h4><p>Users on a newly configured switch reported "limited connectivity". ISE showed successful authentications with VLAN 20 returned. On the switch, sessions were Authorized, but in VLAN 10, and VLAN 10 had no DHCP relay on that floor. <code>show running-config | include aaa</code> showed authentication and accounting lists, but no network authorization list. After adding it and clearing the sessions, users moved to VLAN 20 and got addresses.</p><p><b>Lesson:</b> "PASS on the server, wrong VLAN on the switch" means the switch is not applying authorization.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a user plugs into an 802.1X port."</p><p>Strong answer: port starts unauthorized, passes only EAPOL. Switch sends EAP-Request/Identity, supplicant responds, switch builds a RADIUS Access-Request with the EAP message, Calling-Station-Id, NAS-Port-Id and audit session ID. ISE and the supplicant run the EAP method through Access-Challenge rounds. ISE returns Access-Accept with attributes; the switch sends EAP-Success, authorizes the port, applies the VLAN or ACL and sends accounting start; then DHCP runs. Mention timers and what happens on reject (quiet period) or no response (fallback).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequence: Request/Identity, Response/Identity, Access-Request, Challenge rounds, Accept, EAP-Success, authorized, DHCP.</li>
<li>No response after tx-period x (max-reauth-req + 1): 90 s by default, 15 s with tx-period 5.</li>
<li>Needed globally: aaa new-model, RADIUS server, authentication dot1x list, authorization network list, dot1x system-auth-control.</li>
<li>Without the authorization network list, returned VLANs and SGTs are ignored.</li>
<li>Verify with show aaa servers, show dot1x all and show authentication sessions ... details.</li>
</ul></div>
`,hi:`
<p>Jab aap flight lete ho, sequence hamesha same hota hai: check-in, security, passport, gate. Agar aapko sequence pata hai, to passenger kahan khada hai usse hi aap bata sakte ho ki woh kahan atka. 802.1X bhi aisa hi hai. Ek baar aap exchange ko message by message chal sako, to har troubleshooting sawaal ban jaata hai "yeh kis step par ruka?"</p>

<h3>Exchange, message by message</h3>
<div class="dia"><svg viewBox="0 0 640 390" role="img" aria-label="802.1X message sequence">
<text x="90" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1</text><text x="550" y="20" text-anchor="middle" class="svg-ink" font-size="13">ISE</text>
<line x1="90" y1="28" x2="90" y2="380" stroke="#64748b" stroke-dasharray="3 3"/><line x1="320" y1="28" x2="320" y2="380" stroke="#64748b" stroke-dasharray="3 3"/><line x1="550" y1="28" x2="550" y2="380" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="320" y1="50" x2="90" y2="50" stroke="#64748b" stroke-width="2"/><text x="205" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 EAP-Request/Identity</text>
<line x1="90" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="205" y="79" text-anchor="middle" class="svg-ink" font-size="12">2 EAP-Response/Identity alice</text>
<line x1="320" y1="120" x2="550" y2="120" stroke="#64748b" stroke-width="2"/><text x="435" y="114" text-anchor="middle" class="svg-ink" font-size="12">3 Access-Request</text>
<line x1="550" y1="155" x2="320" y2="155" stroke="#64748b" stroke-width="2"/><text x="435" y="149" text-anchor="middle" class="svg-ink" font-size="12">4 Access-Challenge</text>
<line x1="320" y1="190" x2="90" y2="190" stroke="#64748b" stroke-width="2"/><text x="205" y="184" text-anchor="middle" class="svg-ink" font-size="12">5 EAP-Request (method)</text>
<line x1="90" y1="225" x2="320" y2="225" stroke="#64748b" stroke-width="2"/><text x="205" y="219" text-anchor="middle" class="svg-ink" font-size="12">6 EAP-Response (saboot)</text>
<line x1="320" y1="260" x2="550" y2="260" stroke="#64748b" stroke-width="2"/><text x="435" y="254" text-anchor="middle" class="svg-ink" font-size="12">7 Access-Request</text>
<line x1="550" y1="295" x2="320" y2="295" stroke="#16a34a" stroke-width="2"/><text x="435" y="289" text-anchor="middle" class="svg-accent" font-size="12">8 Access-Accept + VLAN 20</text>
<line x1="320" y1="330" x2="90" y2="330" stroke="#16a34a" stroke-width="2"/><text x="205" y="324" text-anchor="middle" class="svg-accent" font-size="12">9 EAP-Success</text>
<rect x="110" y="345" width="420" height="28" rx="6" fill="#bbf7d0"/><text x="320" y="364" text-anchor="middle" class="svg-ink" font-size="12">10 Port VLAN 20 mein authorized, phir DHCP</text>
</svg><p class="cap">Steps 4 se 7 utni baar repeat hote hain jitna EAP method ko chahiye (TLS handshake kai round trips leta hai).</p></div>

<ol>
<li><b>Link up.</b> Port <b>unauthorized</b> shuru hota hai. Switch <b>EAP-Request/Identity</b> bhejta hai aur har <b>tx-period</b> par repeat karta hai. Supplicant <b>EAPOL-Start</b> bhej kar cheezein tez bhi kar sakta hai.</li>
<li><b>Identity.</b> Supplicant user name (ya anonymous outer identity) ke saath <b>EAP-Response/Identity</b> jawab deta hai.</li>
<li><b>Access-Request.</b> Switch EAP message ko RADIUS mein wrap karta hai aur context jodta hai: User-Name, NAS-IP-Address, NAS-Port-Id (<code>GigabitEthernet0/1</code>), <b>Calling-Station-Id</b> (PC ka MAC), Service-Type Framed, NAS-Port-Type Ethernet aur Cisco <b>audit-session-id</b> jo is session ke har message ko jodta hai.</li>
<li><b>Challenge rounds.</b> ISE EAP method chunta hai aur <b>Access-Challenge</b> se reply karta hai; switch use unwrap karke PC ko EAP-Request bhejta hai. PC jawab deta hai, switch forward karta hai. Yeh loop method khatam hone tak chalta hai.</li>
<li><b>Decision.</b> ISE <b>Access-Accept</b> (EAP-Success aur authorization attributes ke saath) ya <b>Access-Reject</b> (EAP-Failure ke saath) bhejta hai.</li>
<li><b>Enforcement.</b> Switch PC ko EAP-Success bhejta hai, port ko <b>authorized</b> karta hai, VLAN, ACL ya SGT apply karta hai, aur RADIUS <b>Accounting-Start</b> bhejta hai. Ab jaake PC ka DHCP Discover aage jaata hai.</li>
</ol>
<p>Reject ke baad switch dobara try karne se pehle <b>quiet-period</b> (default 60 s) wait karta hai. Agar periodic reauthentication on hai, to poora exchange chupchaap repeat hota hai; EAPOL-Logoff ya link-down session khatam karta hai aur Accounting-Stop trigger karta hai.</p>

<h3>Timers jo aapko pata hone chahiye</h3>
<table class="cmp"><tr><th>Timer</th><th>Default</th><th>Matlab</th></tr>
<tr><td>tx-period</td><td>30 s</td><td>EAP-Request/Identity retries ke beech ka interval</td></tr>
<tr><td>max-reauth-req</td><td>2</td><td>"No response" declare karne se pehle identity request ke retries</td></tr>
<tr><td>quiet-period</td><td>60 s</td><td>Failed authentication ke baad intezaar</td></tr>
<tr><td>supp-timeout / server-timeout</td><td>30 s</td><td>Method ke dauraan supplicant ya server ka intezaar</td></tr>
</table>
<p>Khamosh device par switch haar maanne se pehle jitna time leta hai woh hai <b>tx-period x (max-reauth-req + 1)</b>: defaults ke saath 30 x 3 = <b>90 s</b>. Isiliye printers MAB se pehle lamba wait karte hain jab tak aap tx-period chhota na karo.</p>

<h3>Global configuration (lab tasks 1 aur 2)</h3>
<pre class="code">SW1(config)# aaa new-model
SW1(config)# radius server ISE
SW1(config-radius-server)# address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key NKsecret
SW1(config-radius-server)# exit
SW1(config)# aaa authentication dot1x default group radius   <span class="c">! 802.1X aur MAB kaun check karta hai</span>
SW1(config)# aaa authorization network default group radius  <span class="c">! RADIUS se VLAN/ACL/SGT apply karo</span>
SW1(config)# aaa accounting dot1x default start-stop group radius
SW1(config)# dot1x system-auth-control                       <span class="c">! global 802.1X on/off switch</span></pre>
<p>Har line ka ek kaam hai. <code>aaa new-model</code> AAA framework enable karta hai. <b>Authentication</b> method list 802.1X aur MAB ko batati hai ki requests kahan bhejni hain. <b>Authorization network</b> list hi switch se returned VLAN, ACL aur SGT <i>apply</i> karwati hai; iske bina users authenticate to ho jaate hain lekin port ke static VLAN mein pahunchte hain. <code>dot1x system-auth-control</code> global enable hai; iske bina switch kabhi EAP-Request/Identity nahi bhejta, halanki MAB phir bhi chalta hai.</p>
<p>Production mein aap doosra server, server group aur kuch recommended RADIUS options jodoge:</p>
<pre class="code">SW1(config)# aaa group server radius ISE-GROUP
SW1(config-sg-radius)# server name ISE
SW1(config-sg-radius)# server name ISE-2
SW1(config-sg-radius)# ip radius source-interface Vlan99
SW1(config)# radius-server dead-criteria time 5 tries 3
SW1(config)# radius-server deadtime 15
SW1(config)# radius-server attribute 8 include-in-access-req    <span class="c">! endpoint IP bhejo</span>
SW1(config)# radius-server vsa send authentication</pre>

<h3>Verify</h3>
<pre class="out">SW1# show aaa servers
RADIUS: id 1, priority 1, host 10.99.99.10, auth-port 1812, acct-port 1813, hostname ISE
<span class="hl">     State: current UP, duration 312s, previous duration 0s</span>
     Dead: total time 0s, count 0
     Quarantined: No
     Authen: request 6, timeouts 0, failover 0, retransmission 0
             Response: accept 2, reject 0, challenge 0</pre>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0101
         IPv4 Address:  10.20.20.10
            User-Name:  alice
<span class="hl">               Status:  Authorized</span>
               Domain:  DATA
       Oper host mode:  single-host
Server Policies:
           Vlan Group:  Vlan: 20
            SGT Value:  10
Method status list:
       Method           State
<span class="hl">       dot1x            Authc Success</span></pre>

<div class="eg"><p><b>Worked example.</b> <code>dot1x timeout tx-period 5</code> aur default max-reauth-req 2 ke saath, bina supplicant wala printer 5 x 3 = 15 s baad "no response" declare hota hai, bilkul wahi wait jo lab hint MAB shuru hone se pehle batata hai. Defaults ke saath yeh 90 s hota, itna lamba ki kai printers DHCP se haar maan lete.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>aaa authorization network default group radius</code> bhool jaana. Authentication succeed hota hai, ISE par log PASS kehta hai, lekin user VLAN 20 ki jagah VLAN 10 mein baitha hai. Switch ko VLAN mila aur usne bas ignore kar diya. Yeh troubleshooting lab ka teesra fault hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switch EAP-Request/Identity bhejta hai; woh PC ke start karne ka intezaar nahi karta (EAPOL-Start optional hai). "No response" time tx-period x (max-reauth-req + 1) hai, tx-period x max-reauth-req nahi.</p></div>

<div class="scn"><h4>Authenticated lekin address nahi</h4><p>Naye configure hue switch ke users ne "limited connectivity" report ki. ISE ne VLAN 20 return ke saath successful authentications dikhaye. Switch par sessions Authorized the, lekin VLAN 10 mein, aur us floor par VLAN 10 ka koi DHCP relay nahi tha. <code>show running-config | include aaa</code> ne authentication aur accounting lists dikhayi, lekin network authorization list nahi. Use jodne aur sessions clear karne ke baad users VLAN 20 mein gaye aur addresses mile.</p><p><b>Seekh:</b> "server par PASS, switch par galat VLAN" ka matlab hai switch authorization apply nahi kar raha.</p></div>

<div class="iv"><p class="q">"Mujhe batao jab user 802.1X port mein plug karta hai to kya hota hai."</p><p>Strong answer: port unauthorized shuru hota hai, sirf EAPOL pass karta hai. Switch EAP-Request/Identity bhejta hai, supplicant respond karta hai, switch EAP message, Calling-Station-Id, NAS-Port-Id aur audit session ID ke saath RADIUS Access-Request banata hai. ISE aur supplicant Access-Challenge rounds ke through EAP method chalate hain. ISE attributes ke saath Access-Accept return karta hai; switch EAP-Success bhejta hai, port authorize karta hai, VLAN ya ACL apply karta hai aur accounting start bhejta hai; phir DHCP chalta hai. Timers mention karo aur reject (quiet period) ya no response (fallback) par kya hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequence: Request/Identity, Response/Identity, Access-Request, Challenge rounds, Accept, EAP-Success, authorized, DHCP.</li>
<li>No response tx-period x (max-reauth-req + 1) ke baad: default 90 s, tx-period 5 ke saath 15 s.</li>
<li>Globally zaroori: aaa new-model, RADIUS server, authentication dot1x list, authorization network list, dot1x system-auth-control.</li>
<li>Authorization network list ke bina returned VLANs aur SGTs ignore hote hain.</li>
<li>show aaa servers, show dot1x all aur show authentication sessions ... details se verify karo.</li>
</ul></div>
`}};export{e as default};