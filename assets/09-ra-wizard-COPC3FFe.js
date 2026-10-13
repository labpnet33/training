var e={id:`ra-wizard`,h:{en:`Remote access VPN: the wizard, step by step`,hi:`Remote access VPN: wizard, step by step`},body:{en:`
<p>A remote employee is a visitor who arrives at the HQ reception every morning. Reception must know <b>which entrance</b> to staff (the access interface), show a <b>badge</b> the visitor trusts (the identity certificate), check <b>who the visitor is</b> (authentication), hand out a <b>temporary desk number</b> (an address from a pool), and give a <b>welcome pack</b> with the house rules (the group policy). Cisco Secure Client is the visitor's pass. This chapter builds all of that for the remote access lab.</p>

<h3>How a Secure Client connection comes up</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Secure Client connection flow">
<rect x="10" y="10" width="130" height="34" rx="8" fill="#ddd6fe"/><text x="75" y="32" text-anchor="middle" class="svg-ink" font-size="13">HOME-PC</text>
<rect x="500" y="10" width="130" height="34" rx="8" fill="#fed7aa"/><text x="565" y="32" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD outside</text>
<line x1="75" y1="44" x2="75" y2="220" stroke="#64748b"/><line x1="565" y1="44" x2="565" y2="220" stroke="#64748b"/>
<line x1="75" y1="70" x2="565" y2="70" stroke="#64748b"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">1. TLS to TCP 443, headend shows its certificate</text>
<line x1="75" y1="105" x2="565" y2="105" stroke="#64748b"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">2. group, username, password (AAA)</text>
<line x1="565" y1="140" x2="75" y2="140" stroke="#64748b"/><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">3. pool address + group policy pushed</text>
<line x1="75" y1="175" x2="565" y2="175" stroke="#64748b"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">4. SSL tunnel (CSTP over TLS) up</text>
<line x1="75" y1="208" x2="565" y2="208" stroke="#0284c7" stroke-dasharray="5 4"/><text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">5. DTLS tunnel on UDP 443 carries the data</text>
</svg><p class="cap">TLS carries control and is the fallback; DTLS (UDP) carries data to avoid TCP-over-TCP slowdowns.</p></div>
<p>With the <b>IPsec-IKEv2</b> protocol instead of SSL, the client uses IKEv2 on UDP 500/4500 with EAP-based user authentication, and ESP carries the data. SSL is the default because TCP and UDP 443 pass almost every hotel and home network.</p>

<h3>Before the wizard: the address pool</h3>
<p>The wizard needs an existing pool. Go to <b>Objects → VPN Objects → Address Pools → Add</b> and create <code>VPN-POOL</code>: Start address 10.50.0.10, End address 10.50.0.50, Mask 255.255.255.0. That gives 41 users at once. Pools must not overlap any real subnet, and the inside network must route the pool back to the Threat Defense (here the firewall is the inside default gateway, so it already does).</p>

<h3>The Remote Access VPN Policy Wizard</h3>
<p>In <b>Devices → VPN · Remote Access</b> click <b>Create Remote Access VPN Policy</b>. The <b>Remote Access VPN Policy Wizard</b> has four parts:</p>
<ol><li><b>1 · Policy Assignment</b>: Name (default NK-RAVPN), VPN protocols <b>SSL</b> and/or <b>IPsec-IKEv2</b>, Targeted Device NK-FTD.</li>
<li><b>2 · Connection Profile</b>: Connection Profile Name <code>Employees</code> (also the group alias users pick), Authentication Method <b>AAA Only — Local realm</b> (or AAA Only — RADIUS server with an Authentication Server), IPv4 Address Pool <code>VPN-POOL</code>, Group Policy (DfltGrpPolicy or one you created).</li>
<li><b>3 · Secure Client image</b>: the package the headend offers for web-deploy and upgrades, for example cisco-secure-client-win-5.1.4.74-webdeploy-k9.pkg.</li>
<li><b>4 · Access &amp; Certificate</b>: Interface group/Security Zone <code>outside</code>, Certificate Enrollment <code>NK-VPN-CERT</code> (CN=vpn.nwk.lab), Gateway FQDN (client profile) <code>vpn.nwk.lab</code>, and the optional bypass checkbox (leave it off).</li></ol>
<p>Click <b>Finish</b>. The page now shows cards: Connection Profiles, Access Interface &amp; Certificate, NAT Exemption, Group Policies, Local Realm Users and RADIUS Server Groups.</p>

<h3>After the wizard</h3>
<ul><li><b>Group Policies → Add</b> <code>GP-Employees</code> (split tunnel and DNS are chapter 11), then <b>Connection Profiles → Edit</b> Employees and select GP-Employees, if you did not pick it in the wizard.</li>
<li><b>Local Realm Users → Add</b> username <code>ravi</code>, password <code>NKvpn@2026</code>.</li>
<li><b>NAT Exemption → Edit</b>: tick "Exempt traffic between inside networks and the VPN address pools from NAT", Inside zone INSIDE, Inside networks INSIDE-NET.</li>
<li>Access control rule <code>VPN-Users</code>: OUTSIDE → INSIDE, source VPN-POOL-NET, destination INSIDE-NET, Allow. Then <b>Deploy</b>.</li></ul>
<p>The device receives commands such as:</p>
<pre class="code">ip local pool VPN-POOL 10.50.0.10-10.50.0.50 mask 255.255.255.0
webvpn
 enable outside
 anyconnect image disk0:/csm/cisco-secure-client-win-5.1.4.74-webdeploy-k9.pkg 1 regex "Windows"
 anyconnect enable
 tunnel-group-list enable
tunnel-group Employees type remote-access
tunnel-group Employees general-attributes
 address-pool VPN-POOL
 authentication-server-group LOCAL
 default-group-policy GP-Employees
tunnel-group Employees webvpn-attributes
 group-alias Employees enable</pre>

<h3>Connect and verify</h3>
<pre class="out">HOME-PC&gt; vpn connect vpn.nwk.lab
  &gt;&gt; contacting host (vpn.nwk.lab) for login information...
Group: Employees
Username: ravi
Password:
  &gt;&gt; notice: Establishing VPN session...
  &gt;&gt; notice: Establishing VPN - Activating VPN adapter...
  <span class="hl">&gt;&gt; state: Connected</span></pre>
<pre class="out">&gt; show vpn-sessiondb anyconnect

Session Type: AnyConnect

Username     : ravi                   Index        : 1
<span class="hl">Assigned IP  : 10.50.0.10             Public IP    : 198.51.100.20</span>
Protocol     : AnyConnect-Parent SSL-Tunnel DTLS-Tunnel
Encryption   : AnyConnect-Parent: (1)none  SSL-Tunnel: (1)AES-GCM-256  DTLS-Tunnel: (1)AES-GCM-256
Group Policy : GP-Employees           Tunnel Group : Employees</pre>
<p>In the GUI, <b>Analysis → VPN Monitoring</b> lists the same session under Remote Access VPN — Active Sessions, with a <b>Terminate</b> button. The CLI equivalent is <code>vpn-sessiondb logoff name ravi</code>.</p>

<div class="eg"><p><b>Worked example.</b> 120 employees, about 60% connected at peak. A pool of 41 addresses (10.50.0.10 to 10.50.0.50) runs out at the 42nd user, whose client reports "The secure gateway could not assign an address". Size the pool for peak plus 25%: 72 x 1.25 = 90, so a /25 (10.50.0.0/25, 126 usable) is a sensible choice.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running the wizard before creating the pool; leaving the connection profile on DfltGrpPolicy after creating GP-Employees; forgetting local users (every login fails); no NAT exemption or access rule for the pool; a certificate whose name does not match the FQDN users type, which makes clients warn about an untrusted server.</p></div>

<div class="exam"><p><b>Exam trap.</b> Secure Client SSL uses TCP 443 for TLS and UDP 443 for DTLS; IPsec-IKEv2 remote access uses UDP 500/4500. The connection profile maps to <code>tunnel-group</code>, the group policy to <code>group-policy</code>, and the pool to <code>ip local pool</code>.</p></div>

<div class="scn"><h4>Monday morning, 300 users, one pool</h4><p>After a city-wide transport strike was announced, 300 staff tried to work from home on the same Monday. At 09:20 the help desk received dozens of tickets: "Connection attempt has failed". The syslog showed <code>%FTD-4-722041 ... No IPv4 address available for SVC connection</code>. The pool had been sized years earlier for 100 people. The engineer added a second pool object to the connection profile, deployed in two minutes, and the remaining users connected.</p><p><b>Lesson:</b> pool exhaustion has a precise syslog message; size pools for peak, not average.</p></div>

<div class="iv"><p class="q">"Walk me through configuring remote access VPN on Threat Defense from the Management Center."</p><p>Create the address pool and confirm a trusted identity certificate exists; run the wizard: policy assignment (SSL and/or IKEv2, target device), connection profile (authentication, pool, group policy), Secure Client image, access interface and certificate. Then add local users or a RADIUS group, the group policy settings, NAT exemption for the pool and an access rule with the pool as source, deploy, and verify with <code>show vpn-sessiondb anyconnect</code> and the client's statistics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow: TLS and certificate, authentication, pool address and group policy, SSL tunnel, then DTLS for data.</li>
<li>Create the pool in Objects → VPN Objects → Address Pools before the wizard.</li>
<li>Wizard: Policy Assignment, Connection Profile, Secure Client image, Access &amp; Certificate.</li>
<li>After it: group policy, local users or RADIUS, NAT exemption for the pool, an access rule from the pool, Deploy.</li>
<li>Verify with show vpn-sessiondb anyconnect and Analysis → VPN Monitoring.</li>
</ul></div>
`,hi:`
<p>Remote employee ek visitor hai jo har subah HQ reception par aata hai. Reception ko pata hona chahiye <b>kaunsa entrance</b> staff karna hai (access interface), ek aisa <b>badge</b> dikhana hai jis par visitor trust kare (identity certificate), check karna hai <b>visitor kaun hai</b> (authentication), ek <b>temporary desk number</b> dena hai (pool se address), aur house rules ke saath ek <b>welcome pack</b> dena hai (group policy). Cisco Secure Client visitor ka pass hai. Yeh chapter remote access lab ke liye yeh sab banata hai.</p>

<h3>Secure Client connection kaise up hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Secure Client connection flow">
<rect x="10" y="10" width="130" height="34" rx="8" fill="#ddd6fe"/><text x="75" y="32" text-anchor="middle" class="svg-ink" font-size="13">HOME-PC</text>
<rect x="500" y="10" width="130" height="34" rx="8" fill="#fed7aa"/><text x="565" y="32" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD outside</text>
<line x1="75" y1="44" x2="75" y2="220" stroke="#64748b"/><line x1="565" y1="44" x2="565" y2="220" stroke="#64748b"/>
<line x1="75" y1="70" x2="565" y2="70" stroke="#64748b"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">1. TCP 443 par TLS, headend certificate dikhata hai</text>
<line x1="75" y1="105" x2="565" y2="105" stroke="#64748b"/><text x="320" y="99" text-anchor="middle" class="svg-ink" font-size="12">2. group, username, password (AAA)</text>
<line x1="565" y1="140" x2="75" y2="140" stroke="#64748b"/><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">3. pool address + group policy push</text>
<line x1="75" y1="175" x2="565" y2="175" stroke="#64748b"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">4. SSL tunnel (TLS par CSTP) up</text>
<line x1="75" y1="208" x2="565" y2="208" stroke="#0284c7" stroke-dasharray="5 4"/><text x="320" y="202" text-anchor="middle" class="svg-accent" font-size="12">5. UDP 443 par DTLS tunnel data le jaata hai</text>
</svg><p class="cap">TLS control le jaata hai aur fallback hai; DTLS (UDP) TCP-over-TCP slowdown se bachne ke liye data le jaata hai.</p></div>
<p>SSL ki jagah <b>IPsec-IKEv2</b> protocol ke saath client EAP-based user authentication ke saath UDP 500/4500 par IKEv2 use karta hai, aur ESP data le jaata hai. SSL default hai kyunki TCP aur UDP 443 lagbhag har hotel aur home network paar kar lete hain.</p>

<h3>Wizard se pehle: address pool</h3>
<p>Wizard ko pehle se bana pool chahiye. <b>Objects → VPN Objects → Address Pools → Add</b> par jao aur <code>VPN-POOL</code> banao: Start address 10.50.0.10, End address 10.50.0.50, Mask 255.255.255.0. Isse ek saath 41 users milte hain. Pools kisi real subnet se overlap nahi hone chahiye, aur inside network ko pool wapas Threat Defense ki taraf route karna chahiye (yahan firewall inside default gateway hai, isliye pehle se karta hai).</p>

<h3>Remote Access VPN Policy Wizard</h3>
<p><b>Devices → VPN · Remote Access</b> mein <b>Create Remote Access VPN Policy</b> click karo. <b>Remote Access VPN Policy Wizard</b> ke chaar hisse hain:</p>
<ol><li><b>1 · Policy Assignment</b>: Name (default NK-RAVPN), VPN protocols <b>SSL</b> aur/ya <b>IPsec-IKEv2</b>, Targeted Device NK-FTD.</li>
<li><b>2 · Connection Profile</b>: Connection Profile Name <code>Employees</code> (users jo group alias chunte hain woh bhi), Authentication Method <b>AAA Only — Local realm</b> (ya Authentication Server ke saath AAA Only — RADIUS server), IPv4 Address Pool <code>VPN-POOL</code>, Group Policy (DfltGrpPolicy ya aapki banayi hui).</li>
<li><b>3 · Secure Client image</b>: web-deploy aur upgrades ke liye headend ka package, jaise cisco-secure-client-win-5.1.4.74-webdeploy-k9.pkg.</li>
<li><b>4 · Access &amp; Certificate</b>: Interface group/Security Zone <code>outside</code>, Certificate Enrollment <code>NK-VPN-CERT</code> (CN=vpn.nwk.lab), Gateway FQDN (client profile) <code>vpn.nwk.lab</code>, aur optional bypass checkbox (ise off chhodo).</li></ol>
<p><b>Finish</b> click karo. Page ab cards dikhata hai: Connection Profiles, Access Interface &amp; Certificate, NAT Exemption, Group Policies, Local Realm Users aur RADIUS Server Groups.</p>

<h3>Wizard ke baad</h3>
<ul><li><b>Group Policies → Add</b> <code>GP-Employees</code> (split tunnel aur DNS chapter 11 mein hain), phir <b>Connection Profiles → Edit</b> Employees aur GP-Employees select karo, agar wizard mein nahi chuna tha.</li>
<li><b>Local Realm Users → Add</b> username <code>ravi</code>, password <code>NKvpn@2026</code>.</li>
<li><b>NAT Exemption → Edit</b>: "Exempt traffic between inside networks and the VPN address pools from NAT" tick karo, Inside zone INSIDE, Inside networks INSIDE-NET.</li>
<li>Access control rule <code>VPN-Users</code>: OUTSIDE → INSIDE, source VPN-POOL-NET, destination INSIDE-NET, Allow. Phir <b>Deploy</b>.</li></ul>
<p>Device ko aise commands milte hain:</p>
<pre class="code">ip local pool VPN-POOL 10.50.0.10-10.50.0.50 mask 255.255.255.0
webvpn
 enable outside
 anyconnect image disk0:/csm/cisco-secure-client-win-5.1.4.74-webdeploy-k9.pkg 1 regex "Windows"
 anyconnect enable
 tunnel-group-list enable
tunnel-group Employees type remote-access
tunnel-group Employees general-attributes
 address-pool VPN-POOL
 authentication-server-group LOCAL
 default-group-policy GP-Employees
tunnel-group Employees webvpn-attributes
 group-alias Employees enable</pre>

<h3>Connect aur verify karo</h3>
<pre class="out">HOME-PC&gt; vpn connect vpn.nwk.lab
  &gt;&gt; contacting host (vpn.nwk.lab) for login information...
Group: Employees
Username: ravi
Password:
  &gt;&gt; notice: Establishing VPN session...
  &gt;&gt; notice: Establishing VPN - Activating VPN adapter...
  <span class="hl">&gt;&gt; state: Connected</span></pre>
<pre class="out">&gt; show vpn-sessiondb anyconnect

Session Type: AnyConnect

Username     : ravi                   Index        : 1
<span class="hl">Assigned IP  : 10.50.0.10             Public IP    : 198.51.100.20</span>
Protocol     : AnyConnect-Parent SSL-Tunnel DTLS-Tunnel
Encryption   : AnyConnect-Parent: (1)none  SSL-Tunnel: (1)AES-GCM-256  DTLS-Tunnel: (1)AES-GCM-256
Group Policy : GP-Employees           Tunnel Group : Employees</pre>
<p>GUI mein <b>Analysis → VPN Monitoring</b> wahi session Remote Access VPN — Active Sessions ke neeche <b>Terminate</b> button ke saath list karta hai. CLI equivalent hai <code>vpn-sessiondb logoff name ravi</code>.</p>

<div class="eg"><p><b>Worked example.</b> 120 employees, peak par lagbhag 60% connected. 41 addresses ka pool (10.50.0.10 se 10.50.0.50) 42ve user par khatam ho jaata hai, jiska client report karta hai "The secure gateway could not assign an address". Pool ko peak plus 25% ke liye size karo: 72 x 1.25 = 90, isliye /25 (10.50.0.0/25, 126 usable) ek samajhdaar choice hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pool banane se pehle wizard chalana; GP-Employees banane ke baad bhi connection profile ko DfltGrpPolicy par chhod dena; local users bhoolna (har login fail hota hai); pool ke liye NAT exemption ya access rule nahi; aisa certificate jiska naam users ke type kiye FQDN se match nahi karta, jisse clients untrusted server ki warning dete hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Secure Client SSL TLS ke liye TCP 443 aur DTLS ke liye UDP 443 use karta hai; IPsec-IKEv2 remote access UDP 500/4500 use karta hai. Connection profile <code>tunnel-group</code> se map hota hai, group policy <code>group-policy</code> se, aur pool <code>ip local pool</code> se.</p></div>

<div class="scn"><h4>Somvaar subah, 300 users, ek pool</h4><p>Shehar-bhar mein transport strike announce hone ke baad 300 staff ne usi Somvaar ghar se kaam karne ki koshish ki. 09:20 par help desk ko darjanon tickets mile: "Connection attempt has failed". Syslog ne dikhaya <code>%FTD-4-722041 ... No IPv4 address available for SVC connection</code>. Pool saalon pehle 100 logon ke liye size hua tha. Engineer ne connection profile mein doosra pool object joda, do minute mein deploy kiya, aur baaki users connect ho gaye.</p><p><b>Lesson:</b> pool exhaustion ka ek precise syslog message hai; pools ko average nahi, peak ke liye size karo.</p></div>

<div class="iv"><p class="q">"Management Center se Threat Defense par remote access VPN configure karna samjhao."</p><p>Address pool banao aur confirm karo ki ek trusted identity certificate hai; wizard chalao: policy assignment (SSL aur/ya IKEv2, target device), connection profile (authentication, pool, group policy), Secure Client image, access interface aur certificate. Phir local users ya RADIUS group, group policy settings, pool ke liye NAT exemption aur pool ko source rakhkar access rule jodo, deploy karo, aur <code>show vpn-sessiondb anyconnect</code> aur client ki statistics se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow: TLS aur certificate, authentication, pool address aur group policy, SSL tunnel, phir data ke liye DTLS.</li>
<li>Wizard se pehle Objects → VPN Objects → Address Pools mein pool banao.</li>
<li>Wizard: Policy Assignment, Connection Profile, Secure Client image, Access &amp; Certificate.</li>
<li>Uske baad: group policy, local users ya RADIUS, pool ke liye NAT exemption, pool se access rule, Deploy.</li>
<li>show vpn-sessiondb anyconnect aur Analysis → VPN Monitoring se verify karo.</li>
</ul></div>
`}};export{e as default};