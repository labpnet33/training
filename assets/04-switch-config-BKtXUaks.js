var e={id:`switch-config`,h:{en:`Configuring the access switch: AAA, RADIUS, 802.1X and MAB on IOS XE`,hi:`Access switch configure karna: IOS XE par AAA, RADIUS, 802.1X aur MAB`},body:{en:`
<p>A turnstile needs three things before it works: power and a phone line to the security desk (global AAA and RADIUS), a rule book for each gate (interface settings), and a plan for people who have no badge (fallbacks). This chapter configures exactly that on ACC-SW1, the switch from the lab "Staff, cameras and guests on one access switch" (it appears as SW1 in the topology). PC1 is on Gi0/1, CAM1 on Gi0/2, GUEST1 on Gi0/3 and ISE on Gi0/7 in management VLAN 99.</p>

<h3>Step 1: global AAA and RADIUS</h3>
<pre class="code"><span class="c">! turn on the AAA framework (changes how login works: plan console access first)</span>
aaa new-model
<span class="c">! the PSN, its ports and the shared secret</span>
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
<span class="c">! who checks 802.1X and MAB credentials</span>
aaa authentication dot1x default group radius
<span class="c">! REQUIRED to apply VLAN, dACL or SGT sent by ISE</span>
aaa authorization network default group radius
<span class="c">! recommended: tell ISE when sessions start and stop</span>
aaa accounting dot1x default start-stop group radius
<span class="c">! the global on-switch for 802.1X</span>
dot1x system-auth-control</pre>
<p>Each line has a job. <code>aaa authentication dot1x</code> says which server group checks the identity (used by MAB too). <code>aaa authorization network</code> lets the switch <b>apply</b> the RADIUS attributes in the Access-Accept; without it, the user authenticates but stays in the static access VLAN. <code>dot1x system-auth-control</code> is the master switch: without it, ports configured for 802.1X never send EAP. Production configs usually add <code>ip radius source-interface Vlan99</code>, <code>radius-server vsa send authentication</code> and <code>radius-server attribute 8 include-in-access-req</code> so ISE sees Cisco attributes and the endpoint IP.</p>

<h3>Step 2: the access ports</h3>
<pre class="code">interface range g0/1 - 3
<span class="c">! enforce: port stays closed until authorized</span>
 authentication port-control auto
<span class="c">! this port acts as 802.1X authenticator</span>
 dot1x pae authenticator
<span class="c">! allow MAC Authentication Bypass</span>
 mab
<span class="c">! try 802.1X first, then MAB</span>
 authentication order dot1x mab
<span class="c">! faster fallback: 3 x 5 s = 15 s</span>
 dot1x timeout tx-period 5
<span class="c">! nobody answered EAP and nothing else authorized: guest VLAN</span>
 authentication event no-response action authorize vlan 50</pre>

<table class="cmp"><tr><th>port-control value</th><th>Meaning</th></tr>
<tr><td>auto</td><td>Enforce: unauthorized until 802.1X or MAB succeeds</td></tr>
<tr><td>force-authorized</td><td>Default: always open, no authentication (802.1X effectively off)</td></tr>
<tr><td>force-unauthorized</td><td>Always closed, even for valid users</td></tr>
</table>

<h3>Host modes: how many devices per port?</h3>
<ul>
<li><b>single-host</b> (default): one MAC; a second MAC causes a security violation.</li>
<li><b>multi-host</b>: the first device authenticates, everyone behind it rides along. Weak; used behind small hubs only.</li>
<li><b>multi-domain</b>: one device in the DATA domain and one IP phone in the VOICE domain (ISE returns <code>device-traffic-class=voice</code>). The usual choice for desk ports with a phone.</li>
<li><b>multi-auth</b>: every MAC authenticates separately (one voice plus many data). Common for VDI or virtual machines on one port. Note: VLAN assignment must be the same for all data sessions on the port; use dACLs for per-host differences.</li>
</ul>

<h3>Fallbacks and failure actions</h3>
<table class="cmp"><tr><th>Situation</th><th>Command</th><th>Typical result</th></tr>
<tr><td>No supplicant answers</td><td><code>authentication event no-response action authorize vlan 50</code></td><td>Guest VLAN</td></tr>
<tr><td>Credentials rejected</td><td><code>authentication event fail action authorize vlan 60</code> or <code>next-method</code></td><td>Restricted (auth-fail) VLAN</td></tr>
<tr><td>All RADIUS servers dead</td><td><code>authentication event server dead action authorize vlan 10</code></td><td>Critical VLAN so work continues</td></tr>
</table>
<p><b>Order vs priority:</b> <code>authentication order dot1x mab</code> sets the sequence; <code>authentication priority dot1x mab</code> additionally lets a later 802.1X attempt pre-empt an existing MAB session, which you want for laptops that start talking 802.1X after MAB already succeeded.</p>

<h3>Rolling it out safely: three phases</h3>
<ol>
<li><b>Monitor mode</b>: <code>authentication open</code> on the port. Everything authenticates and is logged, but traffic flows even on failure. You learn what would break.</li>
<li><b>Low-impact mode</b>: still open, plus a port ACL (for example <code>ip access-group PRE-AUTH in</code>) that allows only DHCP, DNS and the PXE or ISE portals until ISE downloads a dACL.</li>
<li><b>Closed mode</b>: no <code>authentication open</code>. Nothing but EAPoL until authorized. This is what the lab builds.</li>
</ol>

<h3>Verification</h3>
<pre class="out">ACC-SW1# show authentication sessions
Interface                MAC Address    Method  Domain  Status Fg  Session ID
--------------------------------------------------------------------------------------------
<span class="hl">Gi0/1                    0050.7966.0201 dot1x   DATA    Auth      0A63630100000010000A1B2C</span>
<span class="hl">Gi0/2                    0050.7a00.0404 mab     DATA    Auth      0A63630100000011000A1B3D</span>
Gi0/3                    0050.7966.0d44 mab     DATA    Auth      0A63630100000012000A1B4E

Session count = 3

ACC-SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0201
         IPv4 Address:  10.20.20.10
            User-Name:  priya
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  single-host
<span class="hl">Server Policies:
           Vlan Group:  Vlan: 20</span>

Method status list:
       Method           State
       dot1x            Authc Success</pre>
<p>Read it like this: <b>Method</b> tells you whether 802.1X or MAB won, <b>Status</b> must be Authorized, and <b>Server Policies</b> shows what ISE sent. If the VLAN appears under "Local Policies" with "guest", the switch used its fallback, not ISE.</p>

<div class="eg"><p><b>Worked example.</b> Gi0/3 (GUEST1) shows method mab: the switch waited 15 s for EAP, tried MAB, and the unknown MAC 0050.7966.0d44 was not authorized by the ISE policy, so the port fell to the guest VLAN 50 defined on the switch. GUEST1 then gets a lease from pool GUEST, 10.50.50.10 or higher (the first nine addresses are excluded).</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing <code>aaa new-model</code> remotely without a login method list or local fallback. Your SSH session survives, but the next login may fail. Always define <code>aaa authentication login</code> with <code>local</code> fallback first (see sec-aaa-mgmt) and keep console access.</p></div>

<div class="exam"><p><b>Exam trap.</b> Missing <code>aaa authorization network default group radius</code> = user authenticates but ISE's VLAN is ignored. Missing <code>dot1x system-auth-control</code> = 802.1X never starts. Missing <code>authentication port-control auto</code> = the port stays force-authorized (open).</p></div>

<div class="scn"><h4>Authenticated but stuck in VLAN 10</h4><p>After a switch refresh, staff laptops authenticated (ISE Live Logs showed green and the StaffVLAN profile) but kept getting 10.10.10.x addresses from the default VLAN. On the switch, <code>show authentication sessions interface g0/1 details</code> showed no Server Policies section. The new template had <code>aaa authentication dot1x</code> but not <code>aaa authorization network</code>. Adding it and clearing the sessions moved everyone to VLAN 20.</p><p><b>Lesson:</b> authentication proves identity; network authorization is what lets the switch obey ISE's answer.</p></div>

<div class="iv"><p class="q">"Which global commands does a Cisco switch need for 802.1X with ISE, and what does each do?"</p><p>Strong answer: aaa new-model to enable AAA; a radius server with the PSN address and key; aaa authentication dot1x default group radius for credential checks; aaa authorization network default group radius to apply VLAN, dACL and SGT attributes; aaa accounting dot1x for session tracking; dot1x system-auth-control to enable 802.1X globally. Then per port: port-control auto, pae authenticator, mab, order and fallbacks. Mention monitor, low-impact and closed rollout phases.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Global: aaa new-model, radius server, aaa authentication dot1x, aaa authorization network, dot1x system-auth-control.</li>
<li>Port: authentication port-control auto, dot1x pae authenticator, mab, authentication order dot1x mab.</li>
<li>Host modes: single-host, multi-host, multi-domain (data plus voice), multi-auth.</li>
<li>Guest (no-response), auth-fail and critical (server dead) VLANs are switch-side fallbacks.</li>
<li>Roll out in monitor, then low-impact, then closed mode; verify with show authentication sessions.</li>
</ul></div>
`,hi:`
<p>Turnstile kaam karne se pehle teen cheezein maangta hai: bijli aur security desk tak phone line (global AAA aur RADIUS), har gate ke liye rule book (interface settings), aur bina badge wale logon ke liye plan (fallbacks). Yeh chapter bilkul yahi ACC-SW1 par configure karta hai, lab "Staff, cameras and guests on one access switch" ka switch (topology mein SW1 ki tarah dikhta hai). PC1 Gi0/1 par hai, CAM1 Gi0/2 par, GUEST1 Gi0/3 par aur ISE management VLAN 99 mein Gi0/7 par.</p>

<h3>Step 1: global AAA aur RADIUS</h3>
<pre class="code"><span class="c">! AAA framework on karo (login ka tarika badalta hai: pehle console access plan karo)</span>
aaa new-model
<span class="c">! PSN, uske ports aur shared secret</span>
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
<span class="c">! 802.1X aur MAB credentials kaun check karega</span>
aaa authentication dot1x default group radius
<span class="c">! ISE ke bheje VLAN, dACL ya SGT apply karne ke liye ZAROORI</span>
aaa authorization network default group radius
<span class="c">! recommended: ISE ko batao sessions kab start aur stop hote hain</span>
aaa accounting dot1x default start-stop group radius
<span class="c">! 802.1X ka global on-switch</span>
dot1x system-auth-control</pre>
<p>Har line ka ek kaam hai. <code>aaa authentication dot1x</code> batata hai kaunsa server group identity check karega (MAB bhi yahi use karta hai). <code>aaa authorization network</code> switch ko Access-Accept ke RADIUS attributes <b>apply</b> karne deta hai; iske bina user authenticate ho jaata hai par static access VLAN mein reh jaata hai. <code>dot1x system-auth-control</code> master switch hai: iske bina 802.1X ke liye configure kiye ports kabhi EAP nahi bhejte. Production configs aam taur par <code>ip radius source-interface Vlan99</code>, <code>radius-server vsa send authentication</code> aur <code>radius-server attribute 8 include-in-access-req</code> bhi jodte hain taaki ISE ko Cisco attributes aur endpoint IP dikhe.</p>

<h3>Step 2: access ports</h3>
<pre class="code">interface range g0/1 - 3
<span class="c">! enforce: authorized hone tak port band rehta hai</span>
 authentication port-control auto
<span class="c">! yeh port 802.1X authenticator ki tarah kaam karta hai</span>
 dot1x pae authenticator
<span class="c">! MAC Authentication Bypass allow karo</span>
 mab
<span class="c">! pehle 802.1X try karo, phir MAB</span>
 authentication order dot1x mab
<span class="c">! tez fallback: 3 x 5 s = 15 s</span>
 dot1x timeout tx-period 5
<span class="c">! kisi ne EAP ka jawab nahi diya aur kuch aur authorize nahi hua: guest VLAN</span>
 authentication event no-response action authorize vlan 50</pre>

<table class="cmp"><tr><th>port-control value</th><th>Matlab</th></tr>
<tr><td>auto</td><td>Enforce: 802.1X ya MAB succeed hone tak unauthorized</td></tr>
<tr><td>force-authorized</td><td>Default: hamesha khula, koi authentication nahi (802.1X effectively off)</td></tr>
<tr><td>force-unauthorized</td><td>Hamesha band, valid users ke liye bhi</td></tr>
</table>

<h3>Host modes: ek port par kitne devices?</h3>
<ul>
<li><b>single-host</b> (default): ek MAC; doosra MAC security violation karta hai.</li>
<li><b>multi-host</b>: pehla device authenticate karta hai, uske peeche sab saath chal dete hain. Kamzor; sirf chhote hubs ke peeche use hota hai.</li>
<li><b>multi-domain</b>: DATA domain mein ek device aur VOICE domain mein ek IP phone (ISE <code>device-traffic-class=voice</code> lautata hai). Phone wale desk ports ke liye aam choice.</li>
<li><b>multi-auth</b>: har MAC alag se authenticate karta hai (ek voice plus kai data). Ek port par VDI ya virtual machines ke liye common. Dhyan do: port par saare data sessions ka VLAN assignment same hona chahiye; har host ke fark ke liye dACLs use karo.</li>
</ul>

<h3>Fallbacks aur failure actions</h3>
<table class="cmp"><tr><th>Situation</th><th>Command</th><th>Typical result</th></tr>
<tr><td>Koi supplicant jawab nahi deta</td><td><code>authentication event no-response action authorize vlan 50</code></td><td>Guest VLAN</td></tr>
<tr><td>Credentials reject hue</td><td><code>authentication event fail action authorize vlan 60</code> ya <code>next-method</code></td><td>Restricted (auth-fail) VLAN</td></tr>
<tr><td>Saare RADIUS servers dead</td><td><code>authentication event server dead action authorize vlan 10</code></td><td>Critical VLAN taaki kaam chalta rahe</td></tr>
</table>
<p><b>Order vs priority:</b> <code>authentication order dot1x mab</code> sequence set karta hai; <code>authentication priority dot1x mab</code> iske alawa baad ke 802.1X attempt ko existing MAB session ko pre-empt karne deta hai, jo un laptops ke liye chahiye jo MAB succeed hone ke baad 802.1X bolna shuru karte hain.</p>

<h3>Safely roll out karna: teen phases</h3>
<ol>
<li><b>Monitor mode</b>: port par <code>authentication open</code>. Sab kuch authenticate aur log hota hai, par failure par bhi traffic chalta hai. Aap seekhte ho ki kya tootega.</li>
<li><b>Low-impact mode</b>: abhi bhi open, plus ek port ACL (jaise <code>ip access-group PRE-AUTH in</code>) jo ISE ke dACL download karne tak sirf DHCP, DNS aur PXE ya ISE portals allow karta hai.</li>
<li><b>Closed mode</b>: <code>authentication open</code> nahi. Authorize hone tak EAPoL ke alawa kuch nahi. Lab yahi banata hai.</li>
</ol>

<h3>Verification</h3>
<pre class="out">ACC-SW1# show authentication sessions
Interface                MAC Address    Method  Domain  Status Fg  Session ID
--------------------------------------------------------------------------------------------
<span class="hl">Gi0/1                    0050.7966.0201 dot1x   DATA    Auth      0A63630100000010000A1B2C</span>
<span class="hl">Gi0/2                    0050.7a00.0404 mab     DATA    Auth      0A63630100000011000A1B3D</span>
Gi0/3                    0050.7966.0d44 mab     DATA    Auth      0A63630100000012000A1B4E

Session count = 3

ACC-SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0201
         IPv4 Address:  10.20.20.10
            User-Name:  priya
               Status:  Authorized
               Domain:  DATA
       Oper host mode:  single-host
<span class="hl">Server Policies:
           Vlan Group:  Vlan: 20</span>

Method status list:
       Method           State
       dot1x            Authc Success</pre>
<p>Ise aise padho: <b>Method</b> batata hai 802.1X jeeta ya MAB, <b>Status</b> Authorized hona chahiye, aur <b>Server Policies</b> dikhata hai ISE ne kya bheja. Agar VLAN "Local Policies" ke neeche "guest" ke saath dikhe, to switch ne apna fallback use kiya, ISE ne nahi.</p>

<div class="eg"><p><b>Worked example.</b> Gi0/3 (GUEST1) method mab dikhata hai: switch ne EAP ke liye 15 s wait kiya, MAB try kiya, aur anjaan MAC 0050.7966.0d44 ISE policy se authorize nahi hua, isliye port switch par defined guest VLAN 50 mein gir gaya. Phir GUEST1 ko pool GUEST se lease milti hai, 10.50.50.10 ya usse upar (pehle nau addresses excluded hain).</p></div>

<div class="warn"><p><b>Common galti.</b> Remotely <code>aaa new-model</code> type karna bina login method list ya local fallback ke. Aapka SSH session bach jaata hai, par agla login fail ho sakta hai. Hamesha pehle <code>local</code> fallback ke saath <code>aaa authentication login</code> define karo (sec-aaa-mgmt dekho) aur console access rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>aaa authorization network default group radius</code> missing = user authenticate hota hai par ISE ka VLAN ignore hota hai. <code>dot1x system-auth-control</code> missing = 802.1X kabhi shuru nahi hota. <code>authentication port-control auto</code> missing = port force-authorized (khula) rehta hai.</p></div>

<div class="scn"><h4>Authenticated par VLAN 10 mein atke</h4><p>Switch refresh ke baad staff laptops authenticate hue (ISE Live Logs green aur StaffVLAN profile dikhate the) par default VLAN se 10.10.10.x addresses lete rahe. Switch par <code>show authentication sessions interface g0/1 details</code> mein Server Policies section hi nahi tha. Naye template mein <code>aaa authentication dot1x</code> tha par <code>aaa authorization network</code> nahi. Use add karke sessions clear karte hi sab VLAN 20 mein chale gaye.</p><p><b>Seekh:</b> authentication identity prove karta hai; network authorization hi switch ko ISE ka jawab maanne deta hai.</p></div>

<div class="iv"><p class="q">"ISE ke saath 802.1X ke liye Cisco switch ko kaunse global commands chahiye, aur har ek kya karta hai?"</p><p>Strong answer: AAA enable karne ke liye aaa new-model; PSN address aur key ke saath radius server; credential checks ke liye aaa authentication dot1x default group radius; VLAN, dACL aur SGT attributes apply karne ke liye aaa authorization network default group radius; session tracking ke liye aaa accounting dot1x; 802.1X globally enable karne ke liye dot1x system-auth-control. Phir har port par: port-control auto, pae authenticator, mab, order aur fallbacks. Monitor, low-impact aur closed rollout phases ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Global: aaa new-model, radius server, aaa authentication dot1x, aaa authorization network, dot1x system-auth-control.</li>
<li>Port: authentication port-control auto, dot1x pae authenticator, mab, authentication order dot1x mab.</li>
<li>Host modes: single-host, multi-host, multi-domain (data plus voice), multi-auth.</li>
<li>Guest (no-response), auth-fail aur critical (server dead) VLANs switch-side fallbacks hain.</li>
<li>Pehle monitor, phir low-impact, phir closed mode mein roll out karo; show authentication sessions se verify karo.</li>
</ul></div>
`}};export{e as default};