var e={id:`management-services`,h:{en:`Management services: SSH, telnet, NETCONF and J-Web`,hi:`Management services: SSH, telnet, NETCONF aur J-Web`},body:{en:`
<p>A building has a front door, a service entrance, a fire exit and a window. Each is a way in, and each needs a lock. On a router, every <b>management service</b> you switch on is another door. Junos starts with most doors closed and lets you open only the ones you need.</p>

<h3>Services under system services</h3>
<table class="cmp"><tr><th>Statement</th><th>Port</th><th>Purpose</th><th>Advice</th></tr>
<tr><td><code>ssh</code></td><td>TCP 22</td><td>encrypted CLI</td><td>use it; deny root login</td></tr>
<tr><td><code>telnet</code></td><td>TCP 23</td><td>clear-text CLI</td><td>avoid</td></tr>
<tr><td><code>netconf ssh</code></td><td>TCP 830</td><td>XML API for automation</td><td>use for tools, not by hand</td></tr>
<tr><td><code>web-management h&#116;tp</code></td><td>TCP 80</td><td>J-Web, clear text</td><td>avoid</td></tr>
<tr><td><code>web-management h&#116;tps</code></td><td>TCP 443</td><td>J-Web, encrypted</td><td>use with a certificate</td></tr>
<tr><td><code>ftp</code></td><td>TCP 21</td><td>file transfer, clear text</td><td>avoid; use SCP</td></tr>
<tr><td><code>rest</code></td><td>TCP 3000 (h&#116;tp) / 3443 (h&#116;tps)</td><td>REST API</td><td>automation</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Doors into the router">
<rect x="260" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">Routing Engine</text>
<rect x="20" y="10" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="31" text-anchor="middle" class="svg-ink" font-size="12">SSH 22 (secure)</text>
<rect x="20" y="58" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="79" text-anchor="middle" class="svg-ink" font-size="12">NETCONF 830</text>
<rect x="20" y="106" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="127" text-anchor="middle" class="svg-ink" font-size="12">J-Web HTTPS 443</text>
<rect x="470" y="10" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="31" text-anchor="middle" class="svg-ink" font-size="12">telnet 23 (avoid)</text>
<rect x="470" y="58" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="79" text-anchor="middle" class="svg-ink" font-size="12">FTP 21 (avoid)</text>
<rect x="470" y="106" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="127" text-anchor="middle" class="svg-ink" font-size="12">J-Web HTTP 80</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="26" x2="260" y2="80"/><line x1="170" y1="74" x2="260" y2="95"/><line x1="170" y1="122" x2="260" y2="110"/><line x1="470" y1="26" x2="380" y2="80"/><line x1="470" y1="74" x2="380" y2="95"/><line x1="470" y1="122" x2="380" y2="110"/></g>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">green = encrypted, red = clear text</text>
</svg><p class="cap">Open only the encrypted doors you need.</p></div>

<h3>SSH hardening</h3>
<pre class="code">set system services ssh root-login deny
set system services ssh protocol-version v2
set system services ssh max-sessions-per-connection 5
set system services ssh connection-limit 10
set system services ssh rate-limit 5
set system services ssh client-alive-interval 30</pre>
<p><code>connection-limit</code> caps simultaneous sessions, <code>rate-limit</code> caps new connections per minute (slowing password guessing). Another layer is a <b>firewall filter on the loopback</b> that allows SSH only from the management subnet. That filter protects the Routing Engine from every interface at once.</p>

<h3>NETCONF</h3>
<p>NETCONF is a standard protocol (RFC 6241) that carries XML over SSH. Scripts and tools such as Ansible or PyEZ use it to read and change Junos. Enable it with <code>set system services netconf ssh</code>. Junos was designed for this: every CLI command has an XML form (<code>show interfaces terse | display xml</code>).</p>

<h3>J-Web</h3>
<p><b>J-Web</b> is the browser-based graphical interface of Junos. It offers a dashboard (interfaces, alarms, traffic), configuration wizards and a point-and-click editor. It builds the <b>same candidate configuration</b> and commits it like the CLI, so changes made in J-Web appear in <code>show system commit</code> with <code>via junoscript</code> or similar, and can be rolled back.</p>
<pre class="code">set system services web-management h&#116;tps system-generated-certificate
set system services web-management h&#116;tps interface ge-0/0/0.0
commit</pre>
<p>Open the router's address with an HTTPS browser connection, log in with a named user, and use the Configure menu. J-Web is convenient for beginners, but the CLI remains the tool of choice for scale and automation.</p>

<h3>What is listening?</h3>
<pre class="code">lab@R1&gt; show system connections | match LISTEN
tcp4       0      0  *.22                  *.*                   LISTEN
tcp4       0      0  *.830                 *.*                   LISTEN
tcp4       0      0  *.443                 *.*                   LISTEN
lab@R1&gt; show system connections | match 161
udp4       0      0  *.161                 *.*
lab@R1&gt; show system users</pre>
<p><code>show system connections</code> is your door inventory. Compare it with your policy: if you see <code>*.23</code>, telnet is open.</p>

<div class="eg"><p><b>Worked example.</b> A security audit asks "which management protocols answer on R1?" You run <code>show system connections | match LISTEN</code> and report SSH 22, NETCONF 830, HTTPS 443, SNMP UDP 161. Telnet and HTTP are absent. You then show the loopback filter permitting only 10.99.0.0/24 to reach those ports.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling telnet or HTTP "for convenience"; allowing root SSH login; enabling services on an interface exposed to the internet without a filter; assuming J-Web is separate from the candidate; closing the SSH session with an unsafe commit and no <code>commit confirmed</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos has no service enabled by default that you did not configure (except console access). J-Web uses <code>web-management</code>; NETCONF uses TCP 830 over SSH; telnet is clear text. J-Web makes the same commits as the CLI.</p></div>

<div class="scn"><h4>Telnet found by the auditor</h4><p>An external audit of an enterprise found telnet answering on 40 branch routers. A legacy script needed it. The team rewrote the script to use NETCONF over SSH, removed <code>system services telnet</code> through a configuration group, and verified every router with <code>show system connections | match 23</code>. The next audit was clean.</p><p><b>Lesson:</b> use encrypted services and verify with show commands, not assumptions.</p></div>

<div class="iv"><p class="q">"What is J-Web and how does it relate to the CLI?"</p><p>J-Web is the browser GUI of Junos, enabled with <code>system services web-management</code>, preferably HTTPS. It edits the same candidate configuration and commits like the CLI, so commit history and rollback work for its changes too. It is useful for dashboards and wizards, while CLI and NETCONF suit automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every service in <code>system services</code> is an entry point: enable only what you need.</li>
<li>Prefer SSH (22), NETCONF over SSH (830) and HTTPS J-Web (443); avoid telnet and plain HTTP.</li>
<li>Harden SSH with <code>root-login deny</code>, <code>connection-limit</code>, <code>rate-limit</code> and a loopback filter.</li>
<li>J-Web edits the same candidate and commits like the CLI.</li>
<li><code>show system connections</code> lists what is listening.</li>
</ul></div>
`,hi:`
<p>Building mein front door, service entrance, fire exit aur ek khidki hoti hai. Har ek andar aane ka raasta hai aur har ek par lock chahiye. Router par har <b>management service</b> jo aap on karte ho ek aur darwaza hai. Junos zyadatar darwaze band rakhkar shuru hota hai aur sirf wahi kholne deta hai jo aapko chahiye.</p>

<h3>system services ke neeche services</h3>
<table class="cmp"><tr><th>Statement</th><th>Port</th><th>Purpose</th><th>Salaah</th></tr>
<tr><td><code>ssh</code></td><td>TCP 22</td><td>encrypted CLI</td><td>use karo; root login deny</td></tr>
<tr><td><code>telnet</code></td><td>TCP 23</td><td>clear-text CLI</td><td>avoid karo</td></tr>
<tr><td><code>netconf ssh</code></td><td>TCP 830</td><td>automation ke liye XML API</td><td>tools ke liye, haath se nahi</td></tr>
<tr><td><code>web-management h&#116;tp</code></td><td>TCP 80</td><td>J-Web, clear text</td><td>avoid karo</td></tr>
<tr><td><code>web-management h&#116;tps</code></td><td>TCP 443</td><td>J-Web, encrypted</td><td>certificate ke saath use karo</td></tr>
<tr><td><code>ftp</code></td><td>TCP 21</td><td>file transfer, clear text</td><td>avoid; SCP use karo</td></tr>
<tr><td><code>rest</code></td><td>TCP 3000 (h&#116;tp) / 3443 (h&#116;tps)</td><td>REST API</td><td>automation</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Router mein darwaze">
<rect x="260" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">Routing Engine</text>
<rect x="20" y="10" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="31" text-anchor="middle" class="svg-ink" font-size="12">SSH 22 (secure)</text>
<rect x="20" y="58" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="79" text-anchor="middle" class="svg-ink" font-size="12">NETCONF 830</text>
<rect x="20" y="106" width="150" height="32" rx="6" fill="#bbf7d0"/><text x="95" y="127" text-anchor="middle" class="svg-ink" font-size="12">J-Web HTTPS 443</text>
<rect x="470" y="10" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="31" text-anchor="middle" class="svg-ink" font-size="12">telnet 23 (avoid)</text>
<rect x="470" y="58" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="79" text-anchor="middle" class="svg-ink" font-size="12">FTP 21 (avoid)</text>
<rect x="470" y="106" width="150" height="32" rx="6" fill="#fecaca"/><text x="545" y="127" text-anchor="middle" class="svg-ink" font-size="12">J-Web HTTP 80</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="170" y1="26" x2="260" y2="80"/><line x1="170" y1="74" x2="260" y2="95"/><line x1="170" y1="122" x2="260" y2="110"/><line x1="470" y1="26" x2="380" y2="80"/><line x1="470" y1="74" x2="380" y2="95"/><line x1="470" y1="122" x2="380" y2="110"/></g>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">green = encrypted, red = clear text</text>
</svg><p class="cap">Sirf zaroori encrypted darwaze kholo.</p></div>

<h3>SSH hardening</h3>
<pre class="code">set system services ssh root-login deny
set system services ssh protocol-version v2
set system services ssh max-sessions-per-connection 5
set system services ssh connection-limit 10
set system services ssh rate-limit 5
set system services ssh client-alive-interval 30</pre>
<p><code>connection-limit</code> ek saath sessions cap karta hai, <code>rate-limit</code> per minute naye connections cap karta hai (password guessing dheemi karta hai). Ek aur layer hai <b>loopback par firewall filter</b> jo SSH sirf management subnet se allow kare. Yeh filter Routing Engine ko ek saath har interface se bachata hai.</p>

<h3>NETCONF</h3>
<p>NETCONF ek standard protocol (RFC 6241) hai jo SSH par XML carry karta hai. Scripts aur Ansible ya PyEZ jaise tools use Junos padhne aur badalne ke liye use karte hain. <code>set system services netconf ssh</code> se enable karo. Junos isi ke liye design hua tha: har CLI command ka XML form hota hai (<code>show interfaces terse | display xml</code>).</p>

<h3>J-Web</h3>
<p><b>J-Web</b> Junos ka browser-based graphical interface hai. Isme dashboard (interfaces, alarms, traffic), configuration wizards aur point-and-click editor milta hai. Yeh <b>wahi candidate configuration</b> banata hai aur CLI ki tarah commit karta hai, isliye J-Web ke changes <code>show system commit</code> mein <code>via junoscript</code> jaise dikhte hain aur rollback ho sakte hain.</p>
<pre class="code">set system services web-management h&#116;tps system-generated-certificate
set system services web-management h&#116;tps interface ge-0/0/0.0
commit</pre>
<p>Router ke address ko HTTPS browser connection se kholo, named user se login karo, aur Configure menu use karo. J-Web beginners ke liye convenient hai, lekin scale aur automation ke liye CLI hi pasandida tool hai.</p>

<h3>Kya sun raha hai?</h3>
<pre class="code">lab@R1&gt; show system connections | match LISTEN
tcp4       0      0  *.22                  *.*                   LISTEN
tcp4       0      0  *.830                 *.*                   LISTEN
tcp4       0      0  *.443                 *.*                   LISTEN
lab@R1&gt; show system connections | match 161
udp4       0      0  *.161                 *.*
lab@R1&gt; show system users</pre>
<p><code>show system connections</code> aapka door inventory hai. Ise apni policy se compare karo: <code>*.23</code> dikhe to telnet khula hai.</p>

<div class="eg"><p><b>Worked example.</b> Security audit poochta hai "R1 par kaunse management protocols jawab dete hain?" Aap <code>show system connections | match LISTEN</code> chalakar SSH 22, NETCONF 830, HTTPS 443, SNMP UDP 161 report karte ho. Telnet aur HTTP nahi hain. Phir aap loopback filter dikhate ho jo un ports tak sirf 10.99.0.0/24 ko pahunchne deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Convenience ke liye" telnet ya HTTP enable karna; root SSH login allow karna; internet-facing interface par bina filter ke services enable karna; yeh maan lena ki J-Web candidate se alag hai; bina <code>commit confirmed</code> ke unsafe commit se SSH session band kar lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos mein koi service default se enabled nahi hoti jo aapne configure nahi ki (console access ko chhodkar). J-Web <code>web-management</code> use karta hai; NETCONF SSH par TCP 830 use karta hai; telnet clear text hai. J-Web CLI jaise hi commits karta hai.</p></div>

<div class="scn"><h4>Auditor ko telnet mila</h4><p>Ek enterprise ke external audit mein 40 branch routers par telnet jawab deta mila. Ek legacy script ko iski zaroorat thi. Team ne script ko NETCONF over SSH use karne ke liye rewrite kiya, configuration group se <code>system services telnet</code> hataya, aur har router ko <code>show system connections | match 23</code> se verify kiya. Agla audit clean tha.</p><p><b>Lesson:</b> encrypted services use karo aur assumptions nahi, show commands se verify karo.</p></div>

<div class="iv"><p class="q">"J-Web kya hai aur CLI se uska kya sambandh hai?"</p><p>J-Web Junos ka browser GUI hai, jo <code>system services web-management</code> se enable hota hai, behtar HTTPS. Yeh wahi candidate configuration edit karta hai aur CLI ki tarah commit karta hai, isliye commit history aur rollback uske changes par bhi chalte hain. Dashboards aur wizards ke liye useful hai, jabki automation ke liye CLI aur NETCONF suit karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>system services</code> ki har service ek entry point hai: sirf zaroori enable karo.</li>
<li>SSH (22), SSH par NETCONF (830) aur HTTPS J-Web (443) prefer karo; telnet aur plain HTTP avoid karo.</li>
<li>SSH ko <code>root-login deny</code>, <code>connection-limit</code>, <code>rate-limit</code> aur loopback filter se harden karo.</li>
<li>J-Web wahi candidate edit karta hai aur CLI jaise commit karta hai.</li>
<li><code>show system connections</code> batata hai kya sun raha hai.</li>
</ul></div>
`}};export{e as default};