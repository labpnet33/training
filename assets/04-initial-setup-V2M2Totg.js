var e={id:`setup`,h:{en:`Initial setup from factory default: identity and management access`,hi:`Factory default se initial setup: identity aur management access`},body:{en:`
<p>A new firewall is like a new flat handed over by the builder. Before you move the furniture in, you change the locks, put your name on the door and decide who gets a key. On an ASA that means: know what configuration you are starting from, set the hostname and passwords, and open management access only to the admin workstation. Everything in this chapter protects the <b>management plane</b>, which you studied in depth in the AAA and secure device management module.</p>

<h3>Three possible starting points</h3>
<table class="cmp"><tr><th>Starting point</th><th>What you get</th></tr>
<tr><td><b>Factory default</b> (many physical models)</td><td>A ready-made small-office config: typically an inside network with a DHCP server for clients, an outside interface that gets its address by DHCP, and PAT. Always read it with <code>show running-config</code> before trusting it.</td></tr>
<tr><td><b>Empty configuration</b> (typical ASAv)</td><td>Almost nothing: interfaces shut down and without names. Some releases offer the interactive <code>setup</code> dialog.</td></tr>
<tr><td><b>A box you erase yourself</b></td><td><code>write erase</code> then <code>reload</code> gives an empty start; <code>configure factory-default</code> rebuilds the default config.</td></tr>
</table>
<p>In the first lab you start from an ASAv that is effectively empty: no names, no addresses, no routes, no NAT. That is the best way to learn, because every line you type has a visible effect.</p>

<h3>Step 1: identity and passwords</h3>
<pre class="code">configure terminal
hostname NK-ASA
domain-name nk.example
<span class="c">! protect privileged mode</span>
enable password &lt;strong-enable-password&gt;
<span class="c">! a named admin account for SSH and ASDM</span>
username admin password &lt;strong-password&gt; privilege 15</pre>
<p>The ASA stores these passwords as hashes; in the running config you will see <code>enable password ***** pbkdf2</code>. The domain name is used, together with the hostname, when the RSA key is generated.</p>

<h3>Step 2: SSH for the admin workstation</h3>
<pre class="code"><span class="c">! RSA key pair for SSH (2048 bits or more)</span>
crypto key generate rsa modulus 2048
<span class="c">! use the local user database for SSH logins</span>
aaa authentication ssh console LOCAL
<span class="c">! who may connect, and on which interface (by name)</span>
ssh 10.0.1.50 255.255.255.255 inside
ssh timeout 10</pre>
<p>The <code>ssh</code> line is an allow-list: only ADMIN (10.0.1.50) arriving on the <b>inside</b> interface may open SSH to the ASA. Note that this line uses the interface <b>name</b>, so it only works after the interface has a <code>nameif</code> (chapter 5). In practice you configure interfaces first and management second. Current releases require <code>aaa authentication ssh console</code> before any SSH login works, and speak SSH version 2.</p>

<h3>Step 3 (optional): ASDM, the graphical manager</h3>
<pre class="code">h&#116;tp server enable
h&#116;tp 10.0.1.50 255.255.255.255 inside</pre>
<p>Despite the keyword, ASDM traffic is encrypted with TLS on port 443. The two lines enable the web server and allow only ADMIN on the inside interface. An ASDM image must also be present in flash.</p>

<h3>Step 4: DNS and NTP for the box itself</h3>
<pre class="code"><span class="c">! let the ASA resolve names, sending queries out of the outside interface</span>
dns domain-lookup outside
dns server-group DefaultDNS
 name-server 198.51.100.53
 domain-name nk.example
<span class="c">! correct time: time zone plus an NTP server reached through outside</span>
clock timezone IST 5 30
ntp server 198.51.100.123 source outside</pre>
<p>This DNS is for the <b>ASA itself</b> (licensing, FQDN objects later, <code>ping</code> by name), not for the users; PCs keep using their own DNS server, and their queries simply pass through the firewall like any other UDP flow. NTP matters because syslog timestamps, certificates and VPNs all depend on correct time. <code>show ntp status</code> should say <code>Clock is synchronized</code>; authenticated NTP was covered in the AAA and management module.</p>

<h3>To-the-box vs through-the-box</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="To the box versus through the box">
<rect x="250" y="60" width="140" height="70" rx="10" fill="#fed7aa"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">ASA</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">control plane</text>
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="140" y1="95" x2="250" y2="95" stroke="#64748b"/>
<text x="195" y="85" text-anchor="middle" class="svg-accent" font-size="12">to the box</text>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="12">ssh / h&#116;tp / icmp lines</text>
<path d="M140 110 C 230 175, 410 175, 500 110" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="440" y="180" text-anchor="middle" class="svg-accent" font-size="12">through the box: levels, ACLs</text>
</svg><p class="cap">Management to the ASA itself is controlled by the ssh, h&#116;tp and icmp lines; transit traffic by security levels and ACLs.</p></div>
<p>Interface ACLs and security levels control traffic <b>through</b> the ASA. Traffic <b>to</b> the ASA itself (SSH, ASDM, ping to an interface) is controlled separately by the <code>ssh</code>, <code>h&#116;tp</code> and <code>icmp</code> commands. By default the ASA answers pings to its interfaces; once you add <code>icmp permit</code> or <code>icmp deny</code> lines for an interface, an implicit deny applies to that interface.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show running-config ssh
ssh stricthostkeycheck
<span class="hl">ssh 10.0.1.50 255.255.255.255 inside</span>
ssh timeout 10
NK-ASA# show ssh sessions
SID Client IP       Version Mode Encryption Hmac      State           Username
<span class="hl">0   10.0.1.50       2.0     IN   aes256-ctr sha2-256  SessionStarted  admin</span>
                            OUT  aes256-ctr sha2-256  SessionStarted  admin</pre>

<div class="eg"><p><b>Worked example.</b> ADMIN (10.0.1.50) connects with <code>ssh admin@10.0.1.1</code>. The ASA checks: arrived on inside? Yes. Source in the ssh allow-list? Yes. Username and password valid in LOCAL? Yes. Session up. PC1 (10.0.1.10) trying the same is refused because it is not in the allow-list, even though it is on the same interface.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the <code>ssh</code> line before the interface has a name (error: the interface name is not valid). Forgetting <code>aaa authentication ssh console LOCAL</code>, so SSH connects and then immediately rejects every login. Allowing <code>ssh 0.0.0.0 0.0.0.0 outside</code> "just for testing" and forgetting it. Using Telnet: it is clear text, and the ASA does not even allow Telnet to its lowest-security interface except inside a VPN tunnel.</p></div>

<div class="exam"><p><b>Exam trap.</b> An outside interface ACL does <b>not</b> control SSH to the ASA. If an exam question asks why an admin cannot SSH to the ASA, look at the <code>ssh</code> allow-list, the RSA key and <code>aaa authentication ssh console</code>, not the interface ACL.</p></div>

<div class="scn"><h4>SSH connects, then drops every login</h4><p>After an upgrade, admins could reach the SSH port of an ASA but every login was rejected, even with the correct password. The engineer checked <code>show running-config aaa</code> and found no <code>aaa authentication ssh console</code> line; the old release had allowed a legacy default login that the new release no longer accepts. Adding <code>aaa authentication ssh console LOCAL</code> with a local admin user fixed it.</p><p><b>Lesson:</b> SSH on the ASA needs three things: an RSA key, an allow-list line with the interface name, and AAA authentication for SSH.</p></div>

<div class="iv"><p class="q">"How do you secure management access on a new ASA?"</p><p>Strong answer: set hostname, domain name and a strong enable password; create a named local admin (or better, TACACS+ with local fallback); generate a 2048-bit RSA key; enable <code>aaa authentication ssh console</code>; allow SSH and ASDM only from a management host or subnet on the inside or a dedicated management interface; never enable Telnet; send logs to a syslog server. Explain that to-the-box traffic is controlled by the ssh, h&#116;tp and icmp commands, not by interface ACLs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know your starting point: factory default, empty config or an erased box.</li>
<li>Identity first: hostname, domain name, enable password and a named admin user.</li>
<li>SSH needs an RSA key, <code>aaa authentication ssh console LOCAL</code> and an <code>ssh &lt;host&gt; &lt;mask&gt; &lt;nameif&gt;</code> allow-list.</li>
<li>ASDM uses <code>h&#116;tp server enable</code> plus an allow-list line, encrypted over TLS.</li>
<li><code>dns domain-lookup &lt;nameif&gt;</code> plus a name-server, and <code>ntp server ... source &lt;nameif&gt;</code>, give the box itself names and correct time.</li>
<li>To-the-box access is controlled by ssh, h&#116;tp and icmp commands, not interface ACLs.</li>
</ul></div>
`,hi:`
<p>Naya firewall builder se mile naye flat jaisa hai. Furniture andar le jaane se pehle aap locks badalte ho, darwaze par apna naam lagate ho aur decide karte ho ki chaabi kisko milegi. ASA par iska matlab hai: pata karo ki aap kis configuration se shuru kar rahe ho, hostname aur passwords set karo, aur management access sirf admin workstation ke liye kholo. Is chapter ki har cheez <b>management plane</b> ko protect karti hai, jise aapne AAA aur secure device management module mein detail mein padha tha.</p>

<h3>Shuru karne ke teen possible points</h3>
<table class="cmp"><tr><th>Starting point</th><th>Aapko kya milta hai</th></tr>
<tr><td><b>Factory default</b> (kai physical models)</td><td>Ready-made small-office config: aam taur par clients ke liye DHCP server wala inside network, DHCP se address lene wala outside interface, aur PAT. Bharosa karne se pehle hamesha <code>show running-config</code> se padho.</td></tr>
<tr><td><b>Khaali configuration</b> (typical ASAv)</td><td>Lagbhag kuch nahi: interfaces shut down aur bina naam ke. Kuch releases interactive <code>setup</code> dialog offer karte hain.</td></tr>
<tr><td><b>Box jise aap khud erase karo</b></td><td><code>write erase</code> phir <code>reload</code> khaali shuruaat deta hai; <code>configure factory-default</code> default config dobara banata hai.</td></tr>
</table>
<p>Pehle lab mein aap ek ASAv se shuru karte ho jo practically khaali hai: koi naam nahi, koi address nahi, koi route nahi, koi NAT nahi. Seekhne ka yahi best tareeka hai, kyunki aapki type ki hui har line ka dikhne wala asar hota hai.</p>

<h3>Step 1: identity aur passwords</h3>
<pre class="code">configure terminal
hostname NK-ASA
domain-name nk.example
<span class="c">! privileged mode ko protect karo</span>
enable password &lt;strong-enable-password&gt;
<span class="c">! SSH aur ASDM ke liye ek named admin account</span>
username admin password &lt;strong-password&gt; privilege 15</pre>
<p>ASA in passwords ko hashes ke roop mein store karta hai; running config mein aapko <code>enable password ***** pbkdf2</code> dikhega. Domain name, hostname ke saath, RSA key generate karte waqt use hota hai.</p>

<h3>Step 2: admin workstation ke liye SSH</h3>
<pre class="code"><span class="c">! SSH ke liye RSA key pair (2048 bits ya zyada)</span>
crypto key generate rsa modulus 2048
<span class="c">! SSH logins ke liye local user database use karo</span>
aaa authentication ssh console LOCAL
<span class="c">! kaun connect kar sakta hai, aur kis interface par (naam se)</span>
ssh 10.0.1.50 255.255.255.255 inside
ssh timeout 10</pre>
<p><code>ssh</code> line ek allow-list hai: sirf ADMIN (10.0.1.50) jo <b>inside</b> interface par aaye, ASA ko SSH khol sakta hai. Dhyan do ki yeh line interface ka <b>naam</b> use karti hai, isliye yeh tabhi kaam karti hai jab interface ka <code>nameif</code> ho (chapter 5). Practice mein aap pehle interfaces configure karte ho aur management baad mein. Current releases mein koi bhi SSH login chalne se pehle <code>aaa authentication ssh console</code> zaroori hai, aur yeh SSH version 2 bolte hain.</p>

<h3>Step 3 (optional): ASDM, graphical manager</h3>
<pre class="code">h&#116;tp server enable
h&#116;tp 10.0.1.50 255.255.255.255 inside</pre>
<p>Keyword chahe jo ho, ASDM traffic port 443 par TLS se encrypted hota hai. Yeh do lines web server enable karti hain aur sirf inside interface par ADMIN ko allow karti hain. Flash mein ASDM image bhi honi chahiye.</p>

<h3>Step 4: box ke liye DNS aur NTP</h3>
<pre class="code"><span class="c">! ASA ko names resolve karne do, queries outside interface se bhejte hue</span>
dns domain-lookup outside
dns server-group DefaultDNS
 name-server 198.51.100.53
 domain-name nk.example
<span class="c">! sahi time: time zone plus outside ke through pahunchne wala NTP server</span>
clock timezone IST 5 30
ntp server 198.51.100.123 source outside</pre>
<p>Yeh DNS <b>ASA khud</b> ke liye hai (licensing, baad mein FQDN objects, naam se <code>ping</code>), users ke liye nahi; PCs apna DNS server hi use karte rehte hain, aur unki queries baaki UDP flows ki tarah firewall se bas pass hoti hain. NTP isliye zaroori hai kyunki syslog timestamps, certificates aur VPNs sab sahi time par depend karte hain. <code>show ntp status</code> mein <code>Clock is synchronized</code> aana chahiye; authenticated NTP AAA aur management module mein cover hua tha.</p>

<h3>To-the-box vs through-the-box</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="To the box banaam through the box">
<rect x="250" y="60" width="140" height="70" rx="10" fill="#fed7aa"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">ASA</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">control plane</text>
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">ADMIN</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="140" y1="95" x2="250" y2="95" stroke="#64748b"/>
<text x="195" y="85" text-anchor="middle" class="svg-accent" font-size="12">to the box</text>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="12">ssh / h&#116;tp / icmp lines</text>
<path d="M140 110 C 230 175, 410 175, 500 110" fill="none" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="440" y="180" text-anchor="middle" class="svg-accent" font-size="12">through the box: levels, ACLs</text>
</svg><p class="cap">ASA ka apna management ssh, h&#116;tp aur icmp lines se control hota hai; transit traffic security levels aur ACLs se.</p></div>
<p>Interface ACLs aur security levels ASA ke <b>through</b> jaane wala traffic control karte hain. ASA <b>ko</b> aane wala traffic (SSH, ASDM, interface ko ping) alag se <code>ssh</code>, <code>h&#116;tp</code> aur <code>icmp</code> commands control karte hain. Default se ASA apne interfaces par pings ka jawab deta hai; jaise hi aap kisi interface ke liye <code>icmp permit</code> ya <code>icmp deny</code> lines jodte ho, us interface par implicit deny lag jaata hai.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show running-config ssh
ssh stricthostkeycheck
<span class="hl">ssh 10.0.1.50 255.255.255.255 inside</span>
ssh timeout 10
NK-ASA# show ssh sessions
SID Client IP       Version Mode Encryption Hmac      State           Username
<span class="hl">0   10.0.1.50       2.0     IN   aes256-ctr sha2-256  SessionStarted  admin</span>
                            OUT  aes256-ctr sha2-256  SessionStarted  admin</pre>

<div class="eg"><p><b>Worked example.</b> ADMIN (10.0.1.50) <code>ssh admin@10.0.1.1</code> se connect karta hai. ASA check karta hai: inside par aaya? Haan. Source ssh allow-list mein hai? Haan. LOCAL mein username aur password valid? Haan. Session up. PC1 (10.0.1.10) yahi try kare to refuse hota hai kyunki woh allow-list mein nahi hai, bhale hi woh same interface par ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Interface ka naam hone se pehle <code>ssh</code> line type karna (error: interface name valid nahi hai). <code>aaa authentication ssh console LOCAL</code> bhool jaana, jisse SSH connect hota hai aur phir turant har login reject kar deta hai. "Bas testing ke liye" <code>ssh 0.0.0.0 0.0.0.0 outside</code> allow karna aur bhool jaana. Telnet use karna: yeh clear text hai, aur ASA apne lowest-security interface par Telnet allow hi nahi karta, sirf VPN tunnel ke andar.</p></div>

<div class="exam"><p><b>Exam trap.</b> Outside interface ACL ASA ko SSH control <b>nahi</b> karta. Agar exam question pooche ki admin ASA par SSH kyun nahi kar pa raha, to <code>ssh</code> allow-list, RSA key aur <code>aaa authentication ssh console</code> dekho, interface ACL nahi.</p></div>

<div class="scn"><h4>SSH connect hota hai, phir har login drop</h4><p>Upgrade ke baad admins ASA ke SSH port tak pahunch rahe the lekin har login reject ho raha tha, sahi password ke saath bhi. Engineer ne <code>show running-config aaa</code> check kiya aur koi <code>aaa authentication ssh console</code> line nahi mili; purana release ek legacy default login allow karta tha jo naya release accept nahi karta. Local admin user ke saath <code>aaa authentication ssh console LOCAL</code> jodne se theek ho gaya.</p><p><b>Seekh:</b> ASA par SSH ko teen cheezein chahiye: RSA key, interface naam wali allow-list line, aur SSH ke liye AAA authentication.</p></div>

<div class="iv"><p class="q">"Naye ASA par management access kaise secure karoge?"</p><p>Strong answer: hostname, domain name aur strong enable password set karo; named local admin banao (ya behtar, local fallback ke saath TACACS+); 2048-bit RSA key generate karo; <code>aaa authentication ssh console</code> enable karo; SSH aur ASDM sirf inside par ya dedicated management interface par management host ya subnet se allow karo; Telnet kabhi enable mat karo; logs syslog server ko bhejo. Samjhao ki to-the-box traffic ssh, h&#116;tp aur icmp commands se control hota hai, interface ACLs se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Apna starting point jaano: factory default, khaali config ya erase kiya hua box.</li>
<li>Pehle identity: hostname, domain name, enable password aur named admin user.</li>
<li>SSH ko RSA key, <code>aaa authentication ssh console LOCAL</code> aur <code>ssh &lt;host&gt; &lt;mask&gt; &lt;nameif&gt;</code> allow-list chahiye.</li>
<li>ASDM <code>h&#116;tp server enable</code> plus ek allow-list line use karta hai, TLS par encrypted.</li>
<li><code>dns domain-lookup &lt;nameif&gt;</code> plus name-server, aur <code>ntp server ... source &lt;nameif&gt;</code>, box ko khud names aur sahi time dete hain.</li>
<li>To-the-box access ssh, h&#116;tp aur icmp commands se control hota hai, interface ACLs se nahi.</li>
</ul></div>
`}};export{e as default};