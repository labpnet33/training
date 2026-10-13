var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: "I cannot SSH to the switch"`,hi:`Troubleshooting workflow: "Main switch par SSH nahi kar pa raha"`},body:{en:`
<p>A doctor does not start with surgery. They ask what the patient feels, because "sharp pain here" and "fever for three days" point to completely different causes. SSH problems are the same: the <b>exact symptom</b> the client shows tells you which layer to check. "Cannot SSH" is not a symptom; "connection timed out", "connection refused" and "login invalid" are.</p>

<h3>Read the symptom first</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SSH symptom ladder">
<rect x="10" y="10" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="13">Connection timed out</text>
<rect x="250" y="10" width="380" height="44" rx="8" fill="#bae6fd"/><text x="440" y="37" text-anchor="middle" class="svg-ink" font-size="13">Reachability: IP, routing, default gateway, path ACL</text>
<rect x="10" y="66" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">Connection refused</text>
<rect x="250" y="66" width="380" height="44" rx="8" fill="#fde68a"/><text x="440" y="93" text-anchor="middle" class="svg-ink" font-size="13">SSH off, transport input, access-class, quiet mode, lines busy</text>
<rect x="10" y="122" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="149" text-anchor="middle" class="svg-ink" font-size="13">Unable to negotiate</text>
<rect x="250" y="122" width="380" height="44" rx="8" fill="#ddd6fe"/><text x="440" y="149" text-anchor="middle" class="svg-ink" font-size="13">Version, key size, cipher or key exchange mismatch</text>
<rect x="10" y="178" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="205" text-anchor="middle" class="svg-ink" font-size="13">Login invalid / failed</text>
<rect x="250" y="178" width="380" height="44" rx="8" fill="#fed7aa"/><text x="440" y="205" text-anchor="middle" class="svg-ink" font-size="13">Username, secret, login local, AAA server or key</text>
<rect x="10" y="234" width="200" height="32" rx="8" fill="#e2e8f0"/><text x="110" y="255" text-anchor="middle" class="svg-ink" font-size="13">In, but wrong level</text>
<rect x="250" y="234" width="380" height="32" rx="8" fill="#bbf7d0"/><text x="440" y="255" text-anchor="middle" class="svg-ink" font-size="13">Privilege, exec authorization, exec-timeout</text>
</svg><p class="cap">Work from the top: each row can only be reached once the row above works.</p></div>

<h3>Step 1: timed out means the packets do not arrive (or cannot return)</h3>
<p>The client waits and gives up. Nothing on the device answered at all. Check from the client and from the device:</p>
<ul>
<li><code>ping</code> the management IP. Check the client is using the right address.</li>
<li>On a Layer 2 switch: is the management SVI <code>up up</code>, and is <code>ip default-gateway</code> set? Without it, the switch cannot reply to admins on other subnets (ccna-ios).</li>
<li>An interface ACL or firewall on the path dropping TCP 22.</li>
</ul>

<h3>Step 2: refused means the device answered "no"</h3>
<p>A refusal is good news for reachability: the packet arrived and the device rejected it. Five common causes, each with its check:</p>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Disabled - version 1.99</span>
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).

EDGE# show running-config | section line vty
line vty 0 4
 access-class 15 in
 exec-timeout 5 0
 <span class="hl">transport input telnet</span>

EDGE# show access-lists 15
Standard IP access list 15
    <span class="hl">10 permit 10.99.9.0, wildcard bits 0.0.0.255</span></pre>
<ol>
<li><b>SSH is off:</b> no RSA keys (no domain name, or keys zeroized). Fix: <code>ip domain name</code>, <code>crypto key generate rsa modulus 2048</code>.</li>
<li><b>transport input</b> does not include ssh. Fix: <code>transport input ssh</code> on every VTY range.</li>
<li><b>access-class</b> does not permit the client's source. In the output above the ACL says 10.99.9.0 instead of 10.99.99.0: a typo that locks out the whole NOC.</li>
<li><b>Quiet mode</b> after too many failures: <code>show login</code> says <code>Router presently in Quiet-Mode</code>. Wait, or log in from a quiet-mode exempt source.</li>
<li><b>All VTY lines busy:</b> stale sessions occupy every line. Check <code>show users</code>, remove one with <code>clear line vty N</code>, and prevent it with <code>exec-timeout</code> and <code>service tcp-keepalives-in</code>.</li>
</ol>

<h3>Step 3: negotiation failure means client and server share no algorithm</h3>
<p>Modern SSH clients have dropped old, weak algorithms. An old IOS release (or a device with a 1024-bit key and SHA-1 only) can produce messages like <code>Unable to negotiate with 10.0.12.2 port 22: no matching key exchange method found. Their offer: diffie-hellman-group1-sha1</code>. The proper fix is on the device: upgrade IOS, regenerate a 2048-bit key, enable <code>ip ssh version 2</code>. Weakening the client is a temporary workaround, not a fix.</p>

<h3>Step 4: login fails means the credentials check is wrong</h3>
<ul>
<li>With plain <code>login</code> on the line, IOS asks only for the line password; typing a username is wrong. It should be <code>login local</code>.</li>
<li>User missing or case mismatch: <code>show running-config | include username</code>.</li>
<li>With AAA: <code>show aaa servers</code>. DEAD server and no <code>local</code> in the list means nobody can log in. UP server with many rejects may mean a wrong shared key or a device not registered on the server. <code>debug aaa authentication</code> shows which method answered.</li>
</ul>

<h3>Step 5: logged in, but something is wrong</h3>
<p>User lands at <code>&gt;</code> instead of <code>#</code>: the username has no <code>privilege 15</code>, or AAA exec authorization returned a lower level. Session disconnects instantly: an exec authorization failure (<code>% Authorization failed.</code>) or an <code>exec-timeout 0 1</code> typo (one second).</p>

<h3>Walking through the lab ticket: locked out of VTY</h3>
<div class="eg"><p><b>Worked example.</b> After the hardening change, the NOC reports that nobody can SSH to EDGE. From PC-ADMIN:</p>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.0.12.2
<span class="hl">% Connection refused by remote host</span>
PC-ADMIN&gt; ping 10.0.12.2
!!!!!</pre>
<p>Ping works, so it is not reachability; the refusal points to step 2. On the console, <code>show ip ssh</code> says SSH is enabled, version 2.0. <code>show running-config | section line vty</code> shows <code>transport input ssh</code> and <code>access-class 15 in</code>. <code>show access-lists 15</code> reveals <code>permit 10.99.9.0</code>. The fix, from the console:</p>
<pre class="code">EDGE(config)# no access-list 15
EDGE(config)# access-list 15 permit 10.99.99.0 0.0.0.255
EDGE(config)# end
EDGE# copy running-config startup-config</pre>
<p>Then prove the lab's final task: Telnet from PC-ADMIN is refused, SSH from PC-ADMIN as netadmin works and <code>show users</code> lists netadmin from 10.99.99.10, and SSH from PC-USER is refused.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jumping to AAA when the symptom is a timeout. Restarting the SSH client ten times and triggering quiet mode. Editing a numbered ACL line by line instead of re-creating it, leaving a stray entry. Fixing the problem over SSH from a second session and applying a change that cuts that session too. Weakening the client's ciphers permanently instead of upgrading the device.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Connection refused" with working ping points to the VTY configuration (transport, access-class, SSH disabled), not routing. A Layer 2 switch unreachable from other subnets but reachable locally suggests a missing <code>ip default-gateway</code>. <code>show ip ssh</code> shows server state; <code>show ssh</code> shows sessions; <code>show users</code> shows lines in use.</p></div>

<div class="scn"><h4>Friday 6 p.m.: every VTY line in use</h4><p>A campus switch refused all SSH attempts although nothing had changed. The console showed five VTY sessions, all idle for days, from a monitoring script that opened sessions and never closed them. The VTY lines had <code>exec-timeout 0 0</code>. The engineer cleared the lines with <code>clear line vty 0</code> to <code>clear line vty 4</code>, set <code>exec-timeout 10 0</code>, added <code>service tcp-keepalives-in</code>, configured lines 5 to 15 the same way, and asked the tooling team to close sessions properly.</p><p><b>Lesson:</b> "refused" is not always security. Sometimes the door is simply full.</p></div>

<div class="iv"><p class="q">"A user says they cannot SSH to a switch. How do you troubleshoot it?"</p><p>Strong answer: ask for the exact error. Timeout: check reachability, SVI, default gateway and path ACLs. Refused: check <code>show ip ssh</code> (keys), <code>transport input</code>, <code>access-class</code> and the ACL, <code>show login</code> for quiet mode, <code>show users</code> for busy lines. Negotiation failure: version, key size and algorithms. Login failure: <code>login local</code>, username, secret, <code>show aaa servers</code>, method list fallback. Say you would work from the console or OOB so a fix cannot cut you off, and save only after verifying.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start from the exact symptom: timed out, refused, negotiation failure, login failure, wrong level.</li>
<li>Timed out: reachability, SVI, <code>ip default-gateway</code>, path ACL.</li>
<li>Refused: SSH disabled, <code>transport input</code>, <code>access-class</code>, quiet mode, busy VTY lines.</li>
<li>Login failure: <code>login local</code>, user and secret, AAA server state and fallback.</li>
<li>Fix from the console or OOB, verify with a real login, then save.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karta. Woh poochta hai ki patient ko kya mehsoos ho raha hai, kyunki "yahan tez dard" aur "teen din se bukhaar" bilkul alag causes ki taraf ishaara karte hain. SSH problems bhi aisi hi hain: client jo <b>exact symptom</b> dikhata hai woh batata hai ki kaunsi layer check karni hai. "SSH nahi ho raha" symptom nahi hai; "connection timed out", "connection refused" aur "login invalid" symptoms hain.</p>

<h3>Pehle symptom padho</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SSH symptom ki seedhi">
<rect x="10" y="10" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="13">Connection timed out</text>
<rect x="250" y="10" width="380" height="44" rx="8" fill="#bae6fd"/><text x="440" y="37" text-anchor="middle" class="svg-ink" font-size="13">Reachability: IP, routing, default gateway, path ACL</text>
<rect x="10" y="66" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">Connection refused</text>
<rect x="250" y="66" width="380" height="44" rx="8" fill="#fde68a"/><text x="440" y="93" text-anchor="middle" class="svg-ink" font-size="13">SSH off, transport input, access-class, quiet mode, lines busy</text>
<rect x="10" y="122" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="149" text-anchor="middle" class="svg-ink" font-size="13">Unable to negotiate</text>
<rect x="250" y="122" width="380" height="44" rx="8" fill="#ddd6fe"/><text x="440" y="149" text-anchor="middle" class="svg-ink" font-size="13">Version, key size, cipher ya key exchange mismatch</text>
<rect x="10" y="178" width="200" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="205" text-anchor="middle" class="svg-ink" font-size="13">Login invalid / failed</text>
<rect x="250" y="178" width="380" height="44" rx="8" fill="#fed7aa"/><text x="440" y="205" text-anchor="middle" class="svg-ink" font-size="13">Username, secret, login local, AAA server ya key</text>
<rect x="10" y="234" width="200" height="32" rx="8" fill="#e2e8f0"/><text x="110" y="255" text-anchor="middle" class="svg-ink" font-size="13">Andar, lekin galat level</text>
<rect x="250" y="234" width="380" height="32" rx="8" fill="#bbf7d0"/><text x="440" y="255" text-anchor="middle" class="svg-ink" font-size="13">Privilege, exec authorization, exec-timeout</text>
</svg><p class="cap">Upar se kaam karo: har row tak tabhi pahunch sakte ho jab upar wali row chal rahi ho.</p></div>

<h3>Step 1: timed out matlab packets pahunchte nahi (ya wapas nahi aa paate)</h3>
<p>Client intezaar karta hai aur haar maan leta hai. Device par kisi ne jawab hi nahi diya. Client se aur device se check karo:</p>
<ul>
<li>Management IP ko <code>ping</code> karo. Check karo ki client sahi address use kar raha hai.</li>
<li>Layer 2 switch par: kya management SVI <code>up up</code> hai, aur kya <code>ip default-gateway</code> set hai? Iske bina switch doosre subnets ke admins ko reply nahi kar sakta (ccna-ios).</li>
<li>Path par koi interface ACL ya firewall jo TCP 22 drop kar raha ho.</li>
</ul>

<h3>Step 2: refused matlab device ne "na" kaha</h3>
<p>Refusal reachability ke liye achhi khabar hai: packet pahuncha aur device ne use reject kiya. Paanch common causes, har ek ke check ke saath:</p>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Disabled - version 1.99</span>
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).

EDGE# show running-config | section line vty
line vty 0 4
 access-class 15 in
 exec-timeout 5 0
 <span class="hl">transport input telnet</span>

EDGE# show access-lists 15
Standard IP access list 15
    <span class="hl">10 permit 10.99.9.0, wildcard bits 0.0.0.255</span></pre>
<ol>
<li><b>SSH off hai:</b> RSA keys nahi (domain name nahi, ya keys zeroize ho gayi). Fix: <code>ip domain name</code>, <code>crypto key generate rsa modulus 2048</code>.</li>
<li><b>transport input</b> mein ssh nahi hai. Fix: har VTY range par <code>transport input ssh</code>.</li>
<li><b>access-class</b> client ke source ko permit nahi karta. Upar ke output mein ACL 10.99.99.0 ki jagah 10.99.9.0 kehta hai: ek typo jo poore NOC ko lock out kar deta hai.</li>
<li>Bahut zyada failures ke baad <b>quiet mode</b>: <code>show login</code> kehta hai <code>Router presently in Quiet-Mode</code>. Intezaar karo, ya quiet-mode exempt source se login karo.</li>
<li><b>Saari VTY lines busy:</b> purane sessions har line gher lete hain. <code>show users</code> check karo, <code>clear line vty N</code> se ek hatao, aur <code>exec-timeout</code> aur <code>service tcp-keepalives-in</code> se ise roko.</li>
</ol>

<h3>Step 3: negotiation failure matlab client aur server ka koi common algorithm nahi</h3>
<p>Modern SSH clients ne purane, kamzor algorithms chhod diye hain. Purana IOS release (ya 1024-bit key aur sirf SHA-1 wala device) aise messages de sakta hai: <code>Unable to negotiate with 10.0.12.2 port 22: no matching key exchange method found. Their offer: diffie-hellman-group1-sha1</code>. Sahi fix device par hai: IOS upgrade karo, 2048-bit key regenerate karo, <code>ip ssh version 2</code> enable karo. Client ko kamzor karna temporary workaround hai, fix nahi.</p>

<h3>Step 4: login fail matlab credentials check galat hai</h3>
<ul>
<li>Line par sirf <code>login</code> ho to IOS sirf line password maangta hai; username type karna galat hai. Yeh <code>login local</code> hona chahiye.</li>
<li>User missing ya case mismatch: <code>show running-config | include username</code>.</li>
<li>AAA ke saath: <code>show aaa servers</code>. DEAD server aur list mein <code>local</code> nahi, matlab koi login nahi kar sakta. UP server par bahut rejects ka matlab galat shared key ya server par registered na hua device ho sakta hai. <code>debug aaa authentication</code> dikhata hai ki kis method ne jawab diya.</li>
</ul>

<h3>Step 5: login ho gaya, lekin kuch galat hai</h3>
<p>User <code>#</code> ki jagah <code>&gt;</code> par pahunchta hai: username mein <code>privilege 15</code> nahi hai, ya AAA exec authorization ne neecha level lautaya. Session turant disconnect hota hai: exec authorization failure (<code>% Authorization failed.</code>) ya <code>exec-timeout 0 1</code> typo (ek second).</p>

<h3>Lab ticket walk-through: VTY se lock out</h3>
<div class="eg"><p><b>Worked example.</b> Hardening change ke baad NOC report karta hai ki koi EDGE par SSH nahi kar pa raha. PC-ADMIN se:</p>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.0.12.2
<span class="hl">% Connection refused by remote host</span>
PC-ADMIN&gt; ping 10.0.12.2
!!!!!</pre>
<p>Ping chal raha hai, isliye reachability nahi hai; refusal step 2 ki taraf ishaara karta hai. Console par <code>show ip ssh</code> kehta hai SSH enabled hai, version 2.0. <code>show running-config | section line vty</code> <code>transport input ssh</code> aur <code>access-class 15 in</code> dikhata hai. <code>show access-lists 15</code> <code>permit 10.99.9.0</code> dikhata hai. Fix, console se:</p>
<pre class="code">EDGE(config)# no access-list 15
EDGE(config)# access-list 15 permit 10.99.99.0 0.0.0.255
EDGE(config)# end
EDGE# copy running-config startup-config</pre>
<p>Phir lab ka final task prove karo: PC-ADMIN se Telnet refuse ho, PC-ADMIN se netadmin ka SSH chale aur <code>show users</code> 10.99.99.10 se netadmin dikhaye, aur PC-USER se SSH refuse ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Symptom timeout ho tab bhi seedha AAA par kood jaana. SSH client das baar restart karke quiet mode trigger kar dena. Numbered ACL ko dobara banane ki jagah line by line edit karna, aur ek bhatki hui entry chhod dena. Doosre SSH session se problem theek karna aur aisa change lagana jo woh session bhi kaat de. Device upgrade karne ki jagah client ke ciphers permanently kamzor kar dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ping chalte hue "Connection refused" VTY configuration (transport, access-class, SSH disabled) ki taraf ishaara karta hai, routing ki taraf nahi. Layer 2 switch jo locally reachable hai lekin doosre subnets se nahi, missing <code>ip default-gateway</code> suggest karta hai. <code>show ip ssh</code> server state dikhata hai; <code>show ssh</code> sessions; <code>show users</code> use mein lines.</p></div>

<div class="scn"><h4>Friday shaam 6 baje: har VTY line use mein</h4><p>Ek campus switch saare SSH attempts refuse kar raha tha jabki kuch badla nahi tha. Console ne paanch VTY sessions dikhaye, sab dino se idle, ek monitoring script se jo sessions kholti thi aur kabhi band nahi karti thi. VTY lines par <code>exec-timeout 0 0</code> tha. Engineer ne <code>clear line vty 0</code> se <code>clear line vty 4</code> tak lines clear ki, <code>exec-timeout 10 0</code> set kiya, <code>service tcp-keepalives-in</code> add kiya, lines 5 se 15 ko bhi waise hi configure kiya, aur tooling team ko sessions theek se band karne ko kaha.</p><p><b>Seekh:</b> "refused" hamesha security nahi hota. Kabhi kabhi darwaza bas bhara hua hota hai.</p></div>

<div class="iv"><p class="q">"User kehta hai woh switch par SSH nahi kar pa raha. Aap kaise troubleshoot karoge?"</p><p>Strong answer: exact error poocho. Timeout: reachability, SVI, default gateway aur path ACLs check karo. Refused: <code>show ip ssh</code> (keys), <code>transport input</code>, <code>access-class</code> aur ACL, quiet mode ke liye <code>show login</code>, busy lines ke liye <code>show users</code>. Negotiation failure: version, key size aur algorithms. Login failure: <code>login local</code>, username, secret, <code>show aaa servers</code>, method list fallback. Batao ki aap console ya OOB se kaam karoge taaki fix aapko kaat na sake, aur verify karne ke baad hi save karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exact symptom se shuru karo: timed out, refused, negotiation failure, login failure, galat level.</li>
<li>Timed out: reachability, SVI, <code>ip default-gateway</code>, path ACL.</li>
<li>Refused: SSH disabled, <code>transport input</code>, <code>access-class</code>, quiet mode, busy VTY lines.</li>
<li>Login failure: <code>login local</code>, user aur secret, AAA server state aur fallback.</li>
<li>Console ya OOB se fix karo, asli login se verify karo, phir save karo.</li>
</ul></div>
`}};export{e as default};