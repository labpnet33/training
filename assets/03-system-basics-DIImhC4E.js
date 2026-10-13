var e={id:`system-basics`,h:{en:`System basics: name, management access and services`,hi:`System basics: naam, management access aur services`},body:{en:`
<p>A new employee needs a name badge, a desk number and a door key. A new router needs a <b>host name</b>, a <b>management address</b> and the right <b>services</b> switched on. These live under the <code>system</code> hierarchy and the <code>interfaces</code> hierarchy.</p>

<h3>Identity</h3>
<pre class="code">set system host-name NK-HYD-CORE
set system domain-name nk.example
set system name-server 192.0.2.53
set system time-zone Asia/Kolkata
set system login message "NK network - authorised staff only"</pre>
<ul>
<li>The <b>host name</b> appears in the prompt after commit and in syslog messages.</li>
<li><code>name-server</code> lets the router resolve names for ping, traceroute and NTP servers.</li>
<li><code>login message</code> prints a banner before the password prompt. Legal teams like it because it states that access is restricted.</li>
</ul>

<h3>Management reachability</h3>
<p>You reach a device in two ways. <b>Out-of-band</b> uses a dedicated management port (<code>fxp0</code>, <code>em0</code>, <code>me0</code> or <code>vme</code>, depending on the platform) that sits in a separate management network and is not part of the data plane. <b>In-band</b> uses an ordinary data interface or the loopback <code>lo0</code>. Many networks use both: out-of-band as the lifeline, in-band for everyday access.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Out-of-band and in-band management">
<rect x="20" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text>
<rect x="250" y="10" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Mgmt network</text>
<rect x="250" y="120" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Production network</text>
<rect x="500" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">fxp0 / ge-0/0/0</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="75" x2="250" y2="30"/><line x1="390" y1="30" x2="500" y2="75"/><line x1="140" y1="95" x2="250" y2="140"/><line x1="390" y1="140" x2="500" y2="95"/></g>
<text x="200" y="45" text-anchor="middle" class="svg-accent" font-size="11">out-of-band</text><text x="200" y="135" text-anchor="middle" class="svg-accent" font-size="11">in-band</text>
</svg><p class="cap">Out-of-band survives a production outage; in-band is simple and cheap.</p></div>
<pre class="code">set interfaces fxp0 unit 0 family inet address 10.99.0.21/24
set routing-options static route 10.0.0.0/8 next-hop 10.99.0.1   <span class="c">! management routes in a real network</span>
set interfaces lo0 unit 0 family inet address 10.255.40.1/32     <span class="c">! stable in-band address</span></pre>
<p>On a router that runs routing protocols, a <b>loopback address</b> is the best in-band management address: it stays up as long as the router has any working path. On many Junos releases, <code>set system backup-router</code> gives the Routing Engine a route to reach the management network while the router has not yet learned routes.</p>

<h3>Services: what listens on the box</h3>
<table class="cmp"><tr><th>Statement</th><th>Listens on</th><th>Use</th></tr>
<tr><td><code>system services ssh</code></td><td>TCP 22</td><td>secure CLI access</td></tr>
<tr><td><code>system services netconf ssh</code></td><td>TCP 830</td><td>automation</td></tr>
<tr><td><code>system services telnet</code></td><td>TCP 23</td><td>clear text, avoid</td></tr>
<tr><td><code>system services web-management h&#116;tps</code></td><td>TCP 443</td><td>J-Web GUI</td></tr></table>
<pre class="code">set system services ssh root-login deny
set system services ssh protocol-version v2
set system services ssh connection-limit 10
set system services ssh rate-limit 5</pre>
<p><code>root-login deny</code> stops direct SSH logins as root, so attackers must guess a username as well as a password. SSH stays enabled for named users.</p>

<h3>Password storage and strength</h3>
<pre class="code">set system login password minimum-length 12
set system login password change-type character-sets
set system login password format sha512</pre>
<p>Junos never stores clear-text passwords. Hash formats: <code>$1$</code> (MD5, old), <code>$5$</code> (SHA-256), <code>$6$</code> (SHA-512, the default on modern releases). <code>show configuration system login</code> displays hashes in <code>encrypted-password</code> form, so a copy of the configuration does not reveal the password itself, though it should still be guarded.</p>

<h3>Checking your work</h3>
<pre class="code">lab@NK-HYD-CORE&gt; show system information
Model: vSRX
Hostname: NK-HYD-CORE
lab@NK-HYD-CORE&gt; show configuration system | display set
lab@NK-HYD-CORE&gt; show system connections | match LISTEN
tcp4       0      0  *.22            *.*              LISTEN</pre>
<p><code>show system connections</code> lists what is listening. If SSH shows <code>LISTEN</code> on port 22, the service is on.</p>

<div class="eg"><p><b>Worked example.</b> The Hyderabad core R1 gets <code>set system host-name NK-HYD-CORE</code>, <code>set system services ssh root-login deny</code> and address 10.40.0.1/30 on <code>ge-0/0/0</code>. The jump router R2 (NK-HYD-JUMP, 10.40.0.2/30) can then reach it with <code>ssh noc@10.40.0.1</code> once accounts exist (next chapter).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling telnet "just for now" and never removing it; forgetting that SSH needs the service statement <i>and</i> a reachable address; allowing root login over SSH on an internet-facing address.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remote CLI over SSH requires <code>system services ssh</code>; the management interface is not routed by the data plane; J-Web uses <code>web-management</code>.</p></div>

<div class="scn"><h4>Everyone could see the box</h4><p>A scan of an ISP edge router found telnet open on a public address. An engineer had enabled it years earlier to test and left it. The fix was <code>delete system services telnet</code>, <code>set system services ssh root-login deny</code> and a firewall filter on the loopback restricting management to the NOC subnet.</p><p><b>Lesson:</b> every service you enable is an attack surface; enable only what you need and limit who can reach it.</p></div>

<div class="iv"><p class="q">"What is the difference between in-band and out-of-band management?"</p><p>Out-of-band uses a dedicated management port and separate network, so it keeps working when the production network is down. In-band uses ordinary data interfaces or the loopback and is cheaper and simpler. I use the loopback for in-band access and the management port as a fallback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host name, domain name, name server and time zone give the device an identity.</li>
<li>Out-of-band management uses fxp0, em0, me0 or vme; in-band uses data ports or lo0.</li>
<li><code>system services ssh</code> enables SSH; add <code>root-login deny</code>.</li>
<li>Avoid telnet; Junos stores only password hashes.</li>
<li>Verify with <code>show system connections</code> and <code>show system information</code>.</li>
</ul></div>
`,hi:`
<p>Naye employee ko name badge, desk number aur darwaze ki chaabi chahiye. Naye router ko <b>host name</b>, <b>management address</b> aur sahi <b>services</b> on chahiye. Yeh <code>system</code> hierarchy aur <code>interfaces</code> hierarchy mein hote hain.</p>

<h3>Identity</h3>
<pre class="code">set system host-name NK-HYD-CORE
set system domain-name nk.example
set system name-server 192.0.2.53
set system time-zone Asia/Kolkata
set system login message "NK network - authorised staff only"</pre>
<ul>
<li><b>Host name</b> commit ke baad prompt aur syslog messages mein dikhta hai.</li>
<li><code>name-server</code> router ko ping, traceroute aur NTP servers ke naam resolve karne deta hai.</li>
<li><code>login message</code> password prompt se pehle banner print karta hai. Legal teams ise pasand karti hain kyunki yeh batata hai ki access restricted hai.</li>
</ul>

<h3>Management reachability</h3>
<p>Device tak do tareeke se pahunchte hain. <b>Out-of-band</b> dedicated management port (<code>fxp0</code>, <code>em0</code>, <code>me0</code> ya <code>vme</code>, platform ke hisaab se) use karta hai jo alag management network mein hota hai aur data plane ka hissa nahi hota. <b>In-band</b> normal data interface ya loopback <code>lo0</code> use karta hai. Kai networks dono use karte hain: out-of-band lifeline ke roop mein, in-band roz ke access ke liye.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Out-of-band aur in-band management">
<rect x="20" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Engineer</text>
<rect x="250" y="10" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Mgmt network</text>
<rect x="250" y="120" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Production network</text>
<rect x="500" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">fxp0 / ge-0/0/0</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="75" x2="250" y2="30"/><line x1="390" y1="30" x2="500" y2="75"/><line x1="140" y1="95" x2="250" y2="140"/><line x1="390" y1="140" x2="500" y2="95"/></g>
<text x="200" y="45" text-anchor="middle" class="svg-accent" font-size="11">out-of-band</text><text x="200" y="135" text-anchor="middle" class="svg-accent" font-size="11">in-band</text>
</svg><p class="cap">Out-of-band production outage mein bhi chalta hai; in-band simple aur sasta hai.</p></div>
<pre class="code">set interfaces fxp0 unit 0 family inet address 10.99.0.21/24
set routing-options static route 10.0.0.0/8 next-hop 10.99.0.1   <span class="c">! real network mein management routes</span>
set interfaces lo0 unit 0 family inet address 10.255.40.1/32     <span class="c">! stable in-band address</span></pre>
<p>Routing protocols chalane wale router par <b>loopback address</b> sabse achha in-band management address hai: jab tak router ke paas koi bhi working path hai woh up rehta hai. Kai Junos releases par <code>set system backup-router</code> Routing Engine ko management network tak route deta hai jab tak router ne routes seekhe nahi hote.</p>

<h3>Services: box par kya sunta hai</h3>
<table class="cmp"><tr><th>Statement</th><th>Port</th><th>Use</th></tr>
<tr><td><code>system services ssh</code></td><td>TCP 22</td><td>secure CLI access</td></tr>
<tr><td><code>system services netconf ssh</code></td><td>TCP 830</td><td>automation</td></tr>
<tr><td><code>system services telnet</code></td><td>TCP 23</td><td>clear text, avoid karo</td></tr>
<tr><td><code>system services web-management h&#116;tps</code></td><td>TCP 443</td><td>J-Web GUI</td></tr></table>
<pre class="code">set system services ssh root-login deny
set system services ssh protocol-version v2
set system services ssh connection-limit 10
set system services ssh rate-limit 5</pre>
<p><code>root-login deny</code> root se seedha SSH login rokta hai, isliye attackers ko password ke saath username bhi guess karna padta hai. Named users ke liye SSH chalta rehta hai.</p>

<h3>Password storage aur strength</h3>
<pre class="code">set system login password minimum-length 12
set system login password change-type character-sets
set system login password format sha512</pre>
<p>Junos clear-text passwords kabhi store nahi karta. Hash formats: <code>$1$</code> (MD5, purana), <code>$5$</code> (SHA-256), <code>$6$</code> (SHA-512, modern releases ka default). <code>show configuration system login</code> hashes ko <code>encrypted-password</code> form mein dikhata hai, isliye configuration ki copy se password khud nahi khulta, phir bhi use guard karna chahiye.</p>

<h3>Apna kaam check karna</h3>
<pre class="code">lab@NK-HYD-CORE&gt; show system information
Model: vSRX
Hostname: NK-HYD-CORE
lab@NK-HYD-CORE&gt; show configuration system | display set
lab@NK-HYD-CORE&gt; show system connections | match LISTEN
tcp4       0      0  *.22            *.*              LISTEN</pre>
<p><code>show system connections</code> dikhata hai kya sun raha hai. Agar SSH port 22 par <code>LISTEN</code> dikhaye to service on hai.</p>

<div class="eg"><p><b>Worked example.</b> Hyderabad core R1 ko <code>set system host-name NK-HYD-CORE</code>, <code>set system services ssh root-login deny</code> aur <code>ge-0/0/0</code> par address 10.40.0.1/30 milta hai. Jump router R2 (NK-HYD-JUMP, 10.40.0.2/30) accounts banne ke baad (agla chapter) <code>ssh noc@10.40.0.1</code> se pahunch sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Abhi ke liye" telnet enable karke kabhi na hatana; yeh bhool jaana ki SSH ke liye service statement <i>aur</i> reachable address dono chahiye; internet-facing address par SSH se root login allow karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSH par remote CLI ke liye <code>system services ssh</code> chahiye; management interface data plane se route nahi hota; J-Web <code>web-management</code> use karta hai.</p></div>

<div class="scn"><h4>Box sabko dikh raha tha</h4><p>ISP edge router ke scan mein public address par telnet khula mila. Ek engineer ne saalon pehle test ke liye enable kiya tha aur chhod diya. Fix tha <code>delete system services telnet</code>, <code>set system services ssh root-login deny</code> aur loopback par firewall filter jo management ko NOC subnet tak restrict kare.</p><p><b>Lesson:</b> har enable ki gayi service attack surface hai; sirf zaroori enable karo aur kaun pahunch sakta hai limit karo.</p></div>

<div class="iv"><p class="q">"In-band aur out-of-band management mein kya difference hai?"</p><p>Out-of-band dedicated management port aur alag network use karta hai, isliye production network down hone par bhi chalta hai. In-band normal data interfaces ya loopback use karta hai aur sasta aur simple hai. Main in-band access ke liye loopback aur fallback ke roop mein management port use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host name, domain name, name server aur time zone device ko identity dete hain.</li>
<li>Out-of-band management fxp0, em0, me0 ya vme use karta hai; in-band data ports ya lo0.</li>
<li><code>system services ssh</code> SSH enable karta hai; saath mein <code>root-login deny</code> lagao.</li>
<li>Telnet avoid karo; Junos sirf password hashes store karta hai.</li>
<li><code>show system connections</code> aur <code>show system information</code> se verify karo.</li>
</ul></div>
`}};export{e as default};