var e={id:`captive-portal`,h:{en:`Captive portal for visitors and the order of methods`,hi:`Visitors ke liye captive portal aur methods ka order`},body:{en:`
<p>A visitor with a laptop has no 802.1X supplicant configured and no registered MAC, but does have a browser and an account that reception just created. The <b>captive portal</b> on an EX switch handles this: the switch intercepts the visitor's web request, shows a login page, checks the name and password against RADIUS, and then places the visitor in the right VLAN.</p>

<h3>How it works</h3>
<ol>
<li>The visitor plugs in. The port is unauthenticated; 802.1X gets no EAPOL answer.</li>
<li>When the visitor opens a web page, the switch redirects it to its own login page.</li>
<li>The visitor types the user name and password. They are sent to the RADIUS server as an <b>Access-Request with PAP</b> (the switch, not the browser, speaks RADIUS).</li>
<li>On Accept, the port is authorised, in the VLAN RADIUS returns (for visitors, normally an internet-only GUEST VLAN). An optional post-authentication URL shows a welcome page.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Captive portal flow">
<rect x="20" y="60" width="130" height="56" rx="10" fill="#bbf7d0"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">Visitor PC</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">browser only</text>
<rect x="255" y="60" width="130" height="56" rx="10" fill="#bae6fd"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">portal page</text>
<rect x="490" y="60" width="130" height="56" rx="10" fill="#ddd6fe"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="11">checks account</text>
<line x1="150" y1="88" x2="255" y2="88" stroke="#64748b" stroke-width="2"/><text x="202" y="78" text-anchor="middle" class="svg-accent" font-size="11">login form</text>
<line x1="385" y1="88" x2="490" y2="88" stroke="#64748b" stroke-width="2"/><text x="437" y="78" text-anchor="middle" class="svg-accent" font-size="11">PAP in RADIUS</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accept: port opens in GUEST VLAN</text>
</svg><p class="cap">The user types into the switch's page; the switch talks to RADIUS.</p></div>

<h3>Configuration</h3>
<pre class="code">set protocols captive-portal authentication-profile-name NK-AUTH
set protocols captive-portal interface ge-0/0/3
set protocols captive-portal custom-options post-authentication-url "<span class="c">your welcome page address</span>"</pre>
<p>The profile is the same access profile you use for 802.1X: <code>access profile NK-AUTH</code> with <code>authentication-order radius</code>. The portal needs the switch's web service enabled; check the platform documentation for the exact service statement on your release. The interface remains in <code>protocols dot1x authenticator</code> too, so 802.1X is tried first.</p>

<h3>The order of methods on one port</h3>
<table class="cmp"><tr><th>Step</th><th>Method</th><th>Moves on when</th></tr>
<tr><td>1</td><td>802.1X (EAPOL)</td><td>no EAPOL response after maximum-requests x transmit-period</td></tr>
<tr><td>2</td><td>MAC RADIUS (if configured)</td><td>RADIUS rejects the MAC</td></tr>
<tr><td>3</td><td>Captive portal (if configured)</td><td>user logs in or the session ends</td></tr>
<tr><td>4</td><td>Guest VLAN (if configured)</td><td>last resort for hosts that never answer</td></tr></table>
<p>The order can be changed with <code>authentication-order</code> under the interface (for example, <code>mac-radius</code> before <code>dot1x</code>). A visitor who is not registered and does not log in stays in the unauthenticated state and sees only the portal.</p>

<h3>Real output: visitor guest01</h3>
<pre class="out">lab@LABSW&gt; show captive-portal interface
Captive Portal Information:
Interface     Role           State           MAC address          User
ge-0/0/3.0    Authenticator  Authenticated   00:50:f1:30:a6:01    guest01

lab@LABSW&gt; show dot1x interface ge-0/0/3 detail
ge-0/0/3.0
  Authentication methods:               802.1X, captive portal
  Number of connected supplicants:      1
    Supplicant: guest01, 00:50:f1:30:a6:01
      Operational state:                Authenticated
      Authentication method:            Captive Portal
      Authenticated VLAN:               <span class="hl">GUEST (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     <span class="hl">No response / Not run / Authenticated</span></pre>
<p>And on the server:</p>
<pre class="out">NKRAD2&gt; aaa-server show log
Recent events:
  captive portal (PAP) PASS for guest01 (NAS 10.44.50.1, ge-0/0/3)</pre>
<p>In the simulator the visitor logs in with <code>web-login guest01 &lt;password&gt;</code> on the VISITOR host. On a real laptop the same happens in the browser. Also available: <code>show captive-portal authentication-failed-users</code> for bad logins.</p>

<h3>Design notes</h3>
<ul>
<li>Use time-limited visitor accounts and VLANs with internet-only filters.</li>
<li>Portal passwords travel from the browser to the switch; use the secure web service on the switch so they are encrypted on the wire.</li>
<li>The portal needs DHCP and DNS to work in the unauthenticated state; plan the pre-authentication VLAN so the browser can start.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Expecting the portal to appear immediately: 802.1X must time out first. Forgetting the authentication profile under captive-portal. Giving visitors the staff VLAN from RADIUS. Using the same RADIUS account for every visitor.</p></div>
<div class="exam"><p><b>Exam trap.</b> The captive portal does not replace 802.1X; both are enabled on the port and 802.1X is tried first. The portal credentials are verified by RADIUS with PAP, not by the switch.</p></div>

<div class="scn"><h4>Reception creates a visitor in 30 seconds</h4><p>A training centre had a front-desk tool that created a RADIUS account valid for 4 hours with VLAN GUEST. Visitors plugged into any meeting-room jack, opened the browser, logged in and reached the internet only. The IT team no longer handed out Wi-Fi or wired passwords by phone.</p><p><b>Lesson:</b> the portal turns visitor access into a self-service process with an expiry.</p></div>

<div class="iv"><p class="q">"In what order does an EX try 802.1X, MAC RADIUS and captive portal?"</p><p>802.1X first. If the host sends no EAPOL, MAC RADIUS is tried if enabled, and if the MAC is rejected the captive portal is available for a web login. A guest VLAN can catch hosts that answer nothing. The order can be modified with authentication-order on the interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Captive portal = web login on the switch, verified by RADIUS (PAP).</li>
<li>Enabled with <code>protocols captive-portal interface</code> and the same profile.</li>
<li>Methods are tried in order: 802.1X, MAC RADIUS, portal.</li>
<li>The detail line shows which methods ran: "No response / Not run / Authenticated".</li>
<li>Give visitors a restricted GUEST VLAN with expiry.</li>
</ul></div>
`,hi:`
<p>Visitor ke laptop mein na 802.1X supplicant configure hai na registered MAC, par browser aur reception ka abhi banaya account hai. EX switch ka <b>captive portal</b> yahi sambhalta hai: switch visitor ka web request rokta hai, login page dikhata hai, name aur password RADIUS se check karta hai, aur phir visitor ko sahi VLAN mein daalta hai.</p>

<h3>Kaise kaam karta hai</h3>
<ol>
<li>Visitor plug in karta hai. Port unauthenticated hai; 802.1X ko EAPOL jawab nahi milta.</li>
<li>Visitor web page kholta hai to switch use apne login page par redirect karta hai.</li>
<li>Visitor user name aur password type karta hai. Yeh RADIUS server ko <b>PAP ke saath Access-Request</b> ki tarah jaate hain (RADIUS switch bolta hai, browser nahi).</li>
<li>Accept par port authorised hota hai, RADIUS jo VLAN return kare usmein (visitors ke liye aam taur par sirf internet wala GUEST VLAN). Optional post-authentication URL welcome page dikhata hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Captive portal flow">
<rect x="20" y="60" width="130" height="56" rx="10" fill="#bbf7d0"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">Visitor PC</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">sirf browser</text>
<rect x="255" y="60" width="130" height="56" rx="10" fill="#bae6fd"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">portal page</text>
<rect x="490" y="60" width="130" height="56" rx="10" fill="#ddd6fe"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text><text x="555" y="104" text-anchor="middle" class="svg-muted" font-size="11">account check</text>
<line x1="150" y1="88" x2="255" y2="88" stroke="#64748b" stroke-width="2"/><text x="202" y="78" text-anchor="middle" class="svg-accent" font-size="11">login form</text>
<line x1="385" y1="88" x2="490" y2="88" stroke="#64748b" stroke-width="2"/><text x="437" y="78" text-anchor="middle" class="svg-accent" font-size="11">RADIUS mein PAP</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Accept: port GUEST VLAN mein khulta hai</text>
</svg><p class="cap">User switch ke page par type karta hai; switch RADIUS se baat karta hai.</p></div>

<h3>Configuration</h3>
<pre class="code">set protocols captive-portal authentication-profile-name NK-AUTH
set protocols captive-portal interface ge-0/0/3
set protocols captive-portal custom-options post-authentication-url "<span class="c">aapka welcome page address</span>"</pre>
<p>Profile wahi access profile hai jo 802.1X ke liye use hota hai: <code>access profile NK-AUTH</code> aur <code>authentication-order radius</code>. Portal ke liye switch ki web service enabled honi chahiye; apni release ke liye exact service statement platform documentation mein dekho. Interface <code>protocols dot1x authenticator</code> mein bhi rehta hai, isliye 802.1X pehle try hota hai.</p>

<h3>Ek port par methods ka order</h3>
<table class="cmp"><tr><th>Step</th><th>Method</th><th>Aage kab badhta hai</th></tr>
<tr><td>1</td><td>802.1X (EAPOL)</td><td>maximum-requests x transmit-period ke baad EAPOL response nahi</td></tr>
<tr><td>2</td><td>MAC RADIUS (configured ho to)</td><td>RADIUS MAC reject kare</td></tr>
<tr><td>3</td><td>Captive portal (configured ho to)</td><td>user login kare ya session khatam</td></tr>
<tr><td>4</td><td>Guest VLAN (configured ho to)</td><td>jo hosts kuch jawab nahi dete unke liye aakhri raasta</td></tr></table>
<p>Order interface ke neeche <code>authentication-order</code> se badal sakte hain (jaise <code>mac-radius</code> ko <code>dot1x</code> se pehle). Jo visitor registered nahi aur login nahi karta woh unauthenticated rehta hai aur sirf portal dekhta hai.</p>

<h3>Asli output: visitor guest01</h3>
<pre class="out">lab@LABSW&gt; show captive-portal interface
Captive Portal Information:
Interface     Role           State           MAC address          User
ge-0/0/3.0    Authenticator  Authenticated   00:50:f1:30:a6:01    guest01

lab@LABSW&gt; show dot1x interface ge-0/0/3 detail
ge-0/0/3.0
  Authentication methods:               802.1X, captive portal
  Number of connected supplicants:      1
    Supplicant: guest01, 00:50:f1:30:a6:01
      Operational state:                Authenticated
      Authentication method:            Captive Portal
      Authenticated VLAN:               <span class="hl">GUEST (assigned by RADIUS)</span>
      802.1X / MAC RADIUS / portal:     <span class="hl">No response / Not run / Authenticated</span></pre>
<p>Aur server par:</p>
<pre class="out">NKRAD2&gt; aaa-server show log
Recent events:
  captive portal (PAP) PASS for guest01 (NAS 10.44.50.1, ge-0/0/3)</pre>
<p>Simulator mein visitor VISITOR host par <code>web-login guest01 &lt;password&gt;</code> se login karta hai. Asli laptop par yahi browser mein hota hai. Kharab logins ke liye <code>show captive-portal authentication-failed-users</code> bhi hai.</p>

<h3>Design notes</h3>
<ul>
<li>Time-limited visitor accounts aur internet-only filters wale VLANs use karo.</li>
<li>Portal passwords browser se switch tak jaate hain; switch ki secure web service use karo taaki wire par encrypted rahein.</li>
<li>Unauthenticated state mein portal ko DHCP aur DNS chahiye; pre-authentication VLAN aisa plan karo ki browser shuru ho sake.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Portal turant dikhne ki ummeed: pehle 802.1X ko timeout hona padta hai. captive-portal ke neeche authentication profile bhoolna. RADIUS se visitors ko staff VLAN dena. Har visitor ke liye ek hi RADIUS account.</p></div>
<div class="exam"><p><b>Exam trap.</b> Captive portal 802.1X ki jagah nahi leta; dono port par enabled hote hain aur 802.1X pehle try hota hai. Portal credentials RADIUS PAP se verify karta hai, switch nahi.</p></div>

<div class="scn"><h4>Reception 30 second mein visitor banata hai</h4><p>Ek training centre ke front-desk tool ne 4 ghante valid, VLAN GUEST wala RADIUS account banaya. Visitors kisi bhi meeting-room jack mein plug karte, browser kholte, login karte aur sirf internet tak pahunchte. IT team ne wired ya Wi-Fi passwords phone par dena band kar diya.</p><p><b>Lesson:</b> portal visitor access ko expiry wala self-service process bana deta hai.</p></div>

<div class="iv"><p class="q">"EX 802.1X, MAC RADIUS aur captive portal kis order mein try karta hai?"</p><p>Pehle 802.1X. Host EAPOL na bheje to MAC RADIUS (enabled ho to), aur MAC reject ho jaaye to web login ke liye captive portal available hai. Guest VLAN un hosts ko pakad sakta hai jo kuch jawab nahi dete. Order interface par authentication-order se badal sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Captive portal = switch par web login, RADIUS (PAP) se verify.</li>
<li><code>protocols captive-portal interface</code> aur wahi profile se enable.</li>
<li>Methods order mein try hote hain: 802.1X, MAC RADIUS, portal.</li>
<li>Detail line batati hai kaunse methods chale: "No response / Not run / Authenticated".</li>
<li>Visitors ko expiry ke saath restricted GUEST VLAN do.</li>
</ul></div>
`}};export{e as default};