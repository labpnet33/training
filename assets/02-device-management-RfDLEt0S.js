var e={id:`device-management`,h:{en:`Device management: console, VTY, SSH, HTTP/HTTPS, SCP and TFTP`,hi:`Device management: console, VTY, SSH, HTTP/HTTPS, SCP aur TFTP`},body:{en:`
<p>Think of a router as an office building with several doors. The <b>console</b> port is the back door with a physical key: you must stand next to the device. The <b>VTY</b> lines are the front doors for remote staff: Telnet is a door with a glass pane (anyone on the path can read the password), SSH is a steel door with a lock. The <b>HTTP/HTTPS</b> server is the reception desk for web tools and APIs, and <b>SCP, TFTP and FTP</b> are the loading bay where files such as IOS images and configs come and go. Blueprint item 4.1 asks you to troubleshoot every one of these doors.</p>

<h3>Console and VTY lines</h3>
<p>The console (<code>line con 0</code>) is out-of-band: it works even when every interface is down. Defaults are 9600 baud, 8 data bits, no parity, 1 stop bit. VTY lines (<code>line vty 0 4</code>, often <code>0 15</code> or more) are virtual terminals for in-band sessions. Each session uses one free line, so five busy lines mean the sixth admin is refused.</p>
<pre class="code">username admin privilege 15 secret Adm1n-Str0ng
line con 0
 exec-timeout 10 0
 logging synchronous
 login local
line vty 0 15
 exec-timeout 10 0
 transport input ssh             <span class="c">! only SSH may use these lines</span>
 access-class 10 in              <span class="c">! which sources may open a session</span>
 login local
access-list 10 permit 10.99.0.0 0.0.0.255</pre>
<dl class="terms">
<dt>login / login local</dt><dd><code>login</code> checks the line password; <code>login local</code> checks the local username database; with <code>aaa new-model</code> the AAA method list decides.</dd>
<dt>transport input</dt><dd>Which protocols may start a session on the line: <code>telnet</code>, <code>ssh</code>, <code>all</code> or <code>none</code>.</dd>
<dt>access-class</dt><dd>A standard or extended ACL applied to the lines, not to an interface. <code>in</code> filters who may connect; <code>out</code> filters where a user on the router may Telnet or SSH to.</dd>
</dl>

<h3>SSH requirements</h3>
<p>SSH needs four things: a hostname other than the default, a domain name, an RSA key pair, and a way to authenticate a username. Use version 2 only.</p>
<pre class="code">hostname EDGE
ip domain name nk.example
crypto key generate rsa modulus 2048
ip ssh version 2
ip ssh source-interface Loopback0</pre>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits</pre>
<p>If the output says <b>SSH Disabled</b>, the key pair is missing (often after someone ran <code>crypto key zeroize rsa</code> or changed the hostname before a reload). <code>show ssh</code> lists the active sessions and <code>show users</code> shows which VTY lines are busy.</p>

<h3>HTTP and HTTPS server</h3>
<p>The IOS web server is used by the web UI, RESTCONF and some management tools. HTTPS needs a certificate; IOS creates a self-signed trustpoint automatically on most platforms when the secure server starts.</p>
<pre class="code">ip h&#116;tp secure-server
no ip h&#116;tp server                         <span class="c">! disable clear-text HTTP</span>
ip h&#116;tp authentication local
ip h&#116;tp access-class ipv4 10               <span class="c">! older releases: ip h&#116;tp access-class 10</span>
show ip h&#116;tp server status</pre>
<p>Typical faults: the user logs in but gets no configuration pages because the user is not privilege 15; the page times out because the access-class does not permit the manager; or HTTPS fails because the certificate or trustpoint is broken.</p>

<h3>File transfer: SCP, TFTP and FTP</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>Authentication</th><th>Key IOS commands</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>None</td><td><code>copy tftp: flash:</code>, <code>ip tftp source-interface</code></td></tr>
<tr><td>FTP</td><td>TCP 21 + data</td><td>Username and password</td><td><code>ip ftp username</code>, <code>ip ftp password</code>, <code>copy ftp: flash:</code></td></tr>
<tr><td>SCP</td><td>TCP 22 (inside SSH)</td><td>SSH user + AAA authorization</td><td><code>ip scp server enable</code>, <code>copy scp: flash:</code></td></tr></table>
<p>The router as an <b>SCP server</b> is the most common exam fault. It needs SSH working, <code>aaa new-model</code>, an authentication method <b>and</b> an exec authorization method, and a privilege 15 user.</p>
<pre class="code">aaa new-model
aaa authentication login default local
aaa authorization exec default local       <span class="c">! without this, SCP is refused</span>
ip scp server enable</pre>

<div class="eg"><p><b>Worked example.</b> An engineer on 10.99.0.20 runs SSH to EDGE and gets <i>connection refused</i>. Check in order: <code>show ip ssh</code> says version 2.0, so keys exist. <code>show run | section line vty</code> shows <code>transport input ssh</code> and <code>access-class 10 in</code>. <code>show access-lists 10</code> shows only <code>permit 10.99.0.0, wildcard bits 0.0.0.255</code>. But the engineer is actually behind NAT and arrives as 203.0.113.7. The implicit deny drops him. Fix the ACL or connect from the management network.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VTY checks">
<rect x="10" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="60" y="87" text-anchor="middle" class="svg-ink" font-size="13">Admin</text>
<rect x="140" y="60" width="100" height="44" rx="8" fill="#fde68a"/><text x="190" y="80" text-anchor="middle" class="svg-ink" font-size="12">transport</text><text x="190" y="96" text-anchor="middle" class="svg-muted" font-size="12">input ssh?</text>
<rect x="270" y="60" width="100" height="44" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">access-class</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">permits src?</text>
<rect x="400" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="450" y="80" text-anchor="middle" class="svg-ink" font-size="12">free line?</text><text x="450" y="96" text-anchor="middle" class="svg-muted" font-size="12">show users</text>
<rect x="530" y="60" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="80" text-anchor="middle" class="svg-ink" font-size="12">login local</text><text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">user + AAA</text>
<line x1="110" y1="82" x2="140" y2="82" stroke="#64748b"/><line x1="240" y1="82" x2="270" y2="82" stroke="#64748b"/><line x1="370" y1="82" x2="400" y2="82" stroke="#64748b"/><line x1="500" y1="82" x2="530" y2="82" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Any failed check = refused or closed session</text>
</svg><p class="cap">The order in which a remote session is checked on the VTY lines.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>login</code> on the VTY lines without a password (Telnet answers "Password required, but none set"); forgetting the key pair after a hostname change; applying the management ACL to an interface with <code>ip access-group</code> and blocking routing protocols; enabling the SCP server without exec authorization.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>access-class</code> goes on lines, <code>ip access-group</code> goes on interfaces. Also, <code>transport input ssh</code> alone does not enable SSH; without RSA keys the router still refuses SSH.</p></div>

<div class="scn"><h4>The upgrade that could not upload</h4><p>A team planned an IOS XE upgrade by pushing the image with SCP from a jump host. Every attempt ended with the session closed immediately after authentication. SSH logins worked fine. <code>show run | include aaa</code> showed <code>aaa authentication login default local</code> but no <code>aaa authorization exec</code>. Adding <code>aaa authorization exec default local</code> fixed the transfer, and the image was verified with <code>verify /md5 flash:</code> before the reload.</p><p><b>Lesson:</b> SCP on IOS needs both authentication and exec authorization; SSH alone working is not proof that SCP will work.</p></div>

<div class="iv"><p class="q">"SSH to a router is refused. How do you troubleshoot it?"</p><p>Work from the network to the line: can I reach the address (ping, ACLs on the path)? Is SSH enabled (<code>show ip ssh</code>, RSA keys, domain name)? Do the VTY lines allow it (<code>transport input</code>, <code>access-class</code>, free lines in <code>show users</code>)? Does authentication succeed (<code>login local</code> or AAA, <code>debug ip ssh</code>)? A strong candidate also mentions checking the source address as the router sees it, because NAT or a different egress interface can break the access-class.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console is out-of-band; VTY lines carry Telnet and SSH and are filtered with <code>transport input</code> and <code>access-class</code>.</li>
<li>SSH needs a hostname, a domain name, an RSA key (2048 bits or more) and version 2.</li>
<li>The HTTPS server needs a certificate, a privilege 15 user for configuration, and an access-class that permits the manager.</li>
<li>SCP server = SSH + <code>aaa new-model</code> + login authentication + exec authorization + <code>ip scp server enable</code>.</li>
<li>TFTP is UDP 69 with no authentication; set <code>ip tftp source-interface</code> so the server sees a known address.</li>
</ul></div>
`,hi:`
<p>Router ko kai darwazon wali office building socho. <b>Console</b> port physical chaabi wala peechhe ka darwaza hai: aapko device ke paas khade hona padta hai. <b>VTY</b> lines remote staff ke liye saamne ke darwaze hain: Telnet kaanch wala darwaza hai (raaste mein koi bhi password padh sakta hai), SSH taale wala steel ka darwaza hai. <b>HTTP/HTTPS</b> server web tools aur APIs ka reception desk hai, aur <b>SCP, TFTP aur FTP</b> loading bay hain jahan se IOS images aur configs jaisi files aati jaati hain. Blueprint item 4.1 in sab darwazon ka troubleshooting maangta hai.</p>

<h3>Console aur VTY lines</h3>
<p>Console (<code>line con 0</code>) out-of-band hai: jab saare interfaces down hon tab bhi kaam karta hai. Defaults hain 9600 baud, 8 data bits, no parity, 1 stop bit. VTY lines (<code>line vty 0 4</code>, aksar <code>0 15</code> ya zyada) in-band sessions ke liye virtual terminals hain. Har session ek free line use karta hai, isliye paanch busy lines ka matlab chhatha admin refuse hoga.</p>
<pre class="code">username admin privilege 15 secret Adm1n-Str0ng
line con 0
 exec-timeout 10 0
 logging synchronous
 login local
line vty 0 15
 exec-timeout 10 0
 transport input ssh             <span class="c">! in lines ko sirf SSH use kar sakta hai</span>
 access-class 10 in              <span class="c">! kaunse sources session khol sakte hain</span>
 login local
access-list 10 permit 10.99.0.0 0.0.0.255</pre>
<dl class="terms">
<dt>login / login local</dt><dd><code>login</code> line password check karta hai; <code>login local</code> local username database check karta hai; <code>aaa new-model</code> ke saath AAA method list faisla karti hai.</dd>
<dt>transport input</dt><dd>Line par kaunse protocols session shuru kar sakte hain: <code>telnet</code>, <code>ssh</code>, <code>all</code> ya <code>none</code>.</dd>
<dt>access-class</dt><dd>Lines par laga standard ya extended ACL, interface par nahi. <code>in</code> filter karta hai ki kaun connect kar sakta hai; <code>out</code> filter karta hai ki router par baitha user kahan Telnet ya SSH kar sakta hai.</dd>
</dl>

<h3>SSH ki zarooratein</h3>
<p>SSH ko chaar cheezein chahiye: default ke alawa koi hostname, domain name, RSA key pair, aur username authenticate karne ka tareeka. Sirf version 2 use karo.</p>
<pre class="code">hostname EDGE
ip domain name nk.example
crypto key generate rsa modulus 2048
ip ssh version 2
ip ssh source-interface Loopback0</pre>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits</pre>
<p>Agar output <b>SSH Disabled</b> kahe, to key pair missing hai (aksar jab kisi ne <code>crypto key zeroize rsa</code> chalaya ya reload se pehle hostname badla). <code>show ssh</code> active sessions dikhata hai aur <code>show users</code> batata hai kaunsi VTY lines busy hain.</p>

<h3>HTTP aur HTTPS server</h3>
<p>IOS web server web UI, RESTCONF aur kuch management tools use karte hain. HTTPS ko certificate chahiye; zyada tar platforms par secure server start hote hi IOS automatically self-signed trustpoint bana deta hai.</p>
<pre class="code">ip h&#116;tp secure-server
no ip h&#116;tp server                         <span class="c">! clear-text HTTP band karo</span>
ip h&#116;tp authentication local
ip h&#116;tp access-class ipv4 10               <span class="c">! purani releases: ip h&#116;tp access-class 10</span>
show ip h&#116;tp server status</pre>
<p>Typical faults: user login karta hai par configuration pages nahi milte kyunki user privilege 15 nahi hai; page timeout hota hai kyunki access-class manager ko permit nahi karta; ya HTTPS fail hota hai kyunki certificate ya trustpoint toota hai.</p>

<h3>File transfer: SCP, TFTP aur FTP</h3>
<table class="cmp"><tr><th>Protocol</th><th>Transport</th><th>Authentication</th><th>Key IOS commands</th></tr>
<tr><td>TFTP</td><td>UDP 69</td><td>Koi nahi</td><td><code>copy tftp: flash:</code>, <code>ip tftp source-interface</code></td></tr>
<tr><td>FTP</td><td>TCP 21 + data</td><td>Username aur password</td><td><code>ip ftp username</code>, <code>ip ftp password</code>, <code>copy ftp: flash:</code></td></tr>
<tr><td>SCP</td><td>TCP 22 (SSH ke andar)</td><td>SSH user + AAA authorization</td><td><code>ip scp server enable</code>, <code>copy scp: flash:</code></td></tr></table>
<p>Router ko <b>SCP server</b> banana sabse common exam fault hai. Ise SSH chalu, <code>aaa new-model</code>, ek authentication method <b>aur</b> ek exec authorization method, aur privilege 15 user chahiye.</p>
<pre class="code">aaa new-model
aaa authentication login default local
aaa authorization exec default local       <span class="c">! iske bina SCP refuse hota hai</span>
ip scp server enable</pre>

<div class="eg"><p><b>Worked example.</b> 10.99.0.20 par baitha engineer EDGE par SSH karta hai aur <i>connection refused</i> milta hai. Kram se check karo: <code>show ip ssh</code> version 2.0 kehta hai, to keys hain. <code>show run | section line vty</code> mein <code>transport input ssh</code> aur <code>access-class 10 in</code> hai. <code>show access-lists 10</code> mein sirf <code>permit 10.99.0.0, wildcard bits 0.0.0.255</code> hai. Par engineer asal mein NAT ke peechhe hai aur 203.0.113.7 ban kar aata hai. Implicit deny use drop kar deta hai. ACL theek karo ya management network se connect karo.</p></div>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VTY checks">
<rect x="10" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="60" y="87" text-anchor="middle" class="svg-ink" font-size="13">Admin</text>
<rect x="140" y="60" width="100" height="44" rx="8" fill="#fde68a"/><text x="190" y="80" text-anchor="middle" class="svg-ink" font-size="12">transport</text><text x="190" y="96" text-anchor="middle" class="svg-muted" font-size="12">input ssh?</text>
<rect x="270" y="60" width="100" height="44" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">access-class</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">src permit?</text>
<rect x="400" y="60" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="450" y="80" text-anchor="middle" class="svg-ink" font-size="12">free line?</text><text x="450" y="96" text-anchor="middle" class="svg-muted" font-size="12">show users</text>
<rect x="530" y="60" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="580" y="80" text-anchor="middle" class="svg-ink" font-size="12">login local</text><text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">user + AAA</text>
<line x1="110" y1="82" x2="140" y2="82" stroke="#64748b"/><line x1="240" y1="82" x2="270" y2="82" stroke="#64748b"/><line x1="370" y1="82" x2="400" y2="82" stroke="#64748b"/><line x1="500" y1="82" x2="530" y2="82" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Koi bhi check fail = session refused ya band</text>
</svg><p class="cap">VTY lines par remote session kis kram mein check hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> VTY lines par bina password ke <code>login</code> configure karna (Telnet "Password required, but none set" jawab deta hai); hostname badalne ke baad key pair bhool jaana; management ACL ko <code>ip access-group</code> se interface par lagana aur routing protocols block kar dena; exec authorization ke bina SCP server enable karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>access-class</code> lines par lagta hai, <code>ip access-group</code> interfaces par. Aur akela <code>transport input ssh</code> SSH enable nahi karta; RSA keys ke bina router phir bhi SSH refuse karta hai.</p></div>

<div class="scn"><h4>Woh upgrade jo upload nahi ho saka</h4><p>Ek team ne jump host se SCP ke through image push karke IOS XE upgrade plan kiya. Har koshish authentication ke turant baad session band hone par khatam hui. SSH logins theek chal rahe the. <code>show run | include aaa</code> mein <code>aaa authentication login default local</code> tha par koi <code>aaa authorization exec</code> nahi. <code>aaa authorization exec default local</code> jodne se transfer theek hua, aur reload se pehle image ko <code>verify /md5 flash:</code> se verify kiya gaya.</p><p><b>Seekh:</b> IOS par SCP ko authentication aur exec authorization dono chahiye; sirf SSH chalna is baat ka saboot nahi ki SCP chalega.</p></div>

<div class="iv"><p class="q">"Router par SSH refuse ho raha hai. Aap troubleshooting kaise karoge?"</p><p>Network se line ki taraf kaam karo: kya main address tak pahunch sakta hoon (ping, path par ACLs)? Kya SSH enable hai (<code>show ip ssh</code>, RSA keys, domain name)? Kya VTY lines ise allow karti hain (<code>transport input</code>, <code>access-class</code>, <code>show users</code> mein free lines)? Kya authentication safal hota hai (<code>login local</code> ya AAA, <code>debug ip ssh</code>)? Strong candidate yeh bhi batata hai ki source address waisa check karo jaisa router dekhta hai, kyunki NAT ya alag egress interface access-class ko tod sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console out-of-band hai; VTY lines Telnet aur SSH le jaati hain aur <code>transport input</code> aur <code>access-class</code> se filter hoti hain.</li>
<li>SSH ko hostname, domain name, RSA key (2048 bits ya zyada) aur version 2 chahiye.</li>
<li>HTTPS server ko certificate, configuration ke liye privilege 15 user, aur manager ko permit karne wala access-class chahiye.</li>
<li>SCP server = SSH + <code>aaa new-model</code> + login authentication + exec authorization + <code>ip scp server enable</code>.</li>
<li>TFTP UDP 69 hai bina authentication ke; <code>ip tftp source-interface</code> set karo taaki server ko jaana pehchana address dikhe.</li>
</ul></div>
`}};export{e as default};