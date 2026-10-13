var e={id:`ssh`,h:{en:`SSH step by step: hostname, domain, RSA keys, version 2`,hi:`SSH step by step: hostname, domain, RSA keys, version 2`},body:{en:`
<p>Telnet is a postcard: the postman, the sorting office and anyone who picks it up can read every word, including your password. SSH is a sealed, tamper-proof envelope that only the addressee can open, and the envelope also proves which office sent the reply. Replacing Telnet with SSH is the single most important hardening step on any network device.</p>

<h3>Telnet versus SSH</h3>
<table class="cmp"><tr><th></th><th>Telnet</th><th>SSH</th></tr>
<tr><td>Port</td><td>TCP 23</td><td>TCP 22</td></tr>
<tr><td>Encryption</td><td>None, everything in clear text</td><td>Whole session encrypted (for example AES)</td></tr>
<tr><td>Server authentication</td><td>None</td><td>Server proves its identity with its RSA host key</td></tr>
<tr><td>Integrity</td><td>None</td><td>HMAC detects modified packets</td></tr>
<tr><td>Use today</td><td>Isolated labs only</td><td>Always</td></tr>
</table>
<p>SSH has two versions. <b>SSHv1</b> has known design flaws and must not be used. <b>SSHv2</b> is the standard. When <code>show ip ssh</code> says <b>version 1.99</b>, the router accepts both versions, which is not what you want; <code>ip ssh version 2</code> fixes that.</p>

<h3>The steps, and why each exists</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Steps to enable SSH">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 hostname</text><text x="65" y="64" text-anchor="middle" class="svg-muted" font-size="12">not "Router"</text>
<rect x="135" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="190" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 domain</text><text x="190" y="64" text-anchor="middle" class="svg-muted" font-size="12">ip domain name</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 RSA keys</text><text x="315" y="64" text-anchor="middle" class="svg-muted" font-size="12">2048 bits</text>
<rect x="385" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="440" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 version 2</text><text x="440" y="64" text-anchor="middle" class="svg-muted" font-size="12">ip ssh version 2</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="46" text-anchor="middle" class="svg-ink" font-size="13">5 user + vty</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="12">login local, ssh</text>
<line x1="120" y1="50" x2="135" y2="50" stroke="#64748b" stroke-width="2"/><line x1="245" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="385" y2="50" stroke="#64748b" stroke-width="2"/><line x1="495" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="315" y="120" text-anchor="middle" class="svg-accent" font-size="13">Key name = hostname.domain  (EDGE.nwk.lab)</text>
<text x="315" y="150" text-anchor="middle" class="svg-muted" font-size="12">SSH turns on automatically the moment RSA keys exist</text>
</svg><p class="cap">Steps 1 and 2 exist because the key pair is named after the hostname and domain. Step 3 is what actually enables the SSH server.</p></div>

<pre class="code">Router(config)# hostname EDGE                          <span class="c">! step 1</span>
EDGE(config)# ip domain name nwk.lab                   <span class="c">! step 2</span>
EDGE(config)# crypto key generate rsa modulus 2048    <span class="c">! step 3: SSH server starts</span>
EDGE(config)# ip ssh version 2                         <span class="c">! step 4</span>
EDGE(config)# ip ssh time-out 60                       <span class="c">! optional: 60 s to finish login</span>
EDGE(config)# ip ssh authentication-retries 3          <span class="c">! optional: 3 tries per connection</span>
EDGE(config)# username netadmin privilege 15 secret N0c!Admin26   <span class="c">! step 5</span>
EDGE(config)# line vty 0 4
EDGE(config-line)# login local
EDGE(config-line)# transport input ssh                 <span class="c">! refuse Telnet</span>
EDGE(config-line)# end</pre>

<p>What the router says during step 3:</p>
<pre class="out">EDGE(config)# crypto key generate rsa modulus 2048
<span class="hl">The name for the keys will be: EDGE.nwk.lab</span>

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 1 seconds)

*Sep 29 10:14:02.112: <span class="hl">%SSH-5-ENABLED: SSH 1.99 has been enabled</span></pre>
<p>The log says 1.99 because version 2 is not yet forced; step 4 fixes it. If you skip steps 1 or 2, IOS refuses: <code>% Please define a hostname other than Router.</code> or <code>% Please define a domain-name first.</code></p>

<h3>The key size rules</h3>
<ul>
<li>SSHv2 needs a modulus of at least <b>768 bits</b>. Below that the router can only offer SSHv1.</li>
<li><b>2048</b> is the normal choice today; 4096 is allowed on most platforms but slower to generate.</li>
<li>Without the <code>modulus</code> keyword IOS asks interactively: <code>How many bits in the modulus [1024]:</code>.</li>
<li><code>crypto key zeroize rsa</code> deletes the keys and therefore disables SSH.</li>
</ul>

<h3>transport input: which protocols may come in</h3>
<table class="cmp"><tr><th>Command</th><th>Effect on the VTY lines</th></tr>
<tr><td><code>transport input ssh</code></td><td>SSH only (hardened)</td></tr>
<tr><td><code>transport input telnet ssh</code></td><td>Both, useful only during a migration</td></tr>
<tr><td><code>transport input all</code></td><td>Every supported protocol</td></tr>
<tr><td><code>transport input none</code></td><td>No remote access at all on those lines</td></tr>
</table>
<p>Defaults vary by platform and release (older IOS allowed all, newer IOS XE often allows SSH only), so always configure it explicitly.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 60 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits
IOS Keys in SECSH format(ssh-rsa, base64 encoded): EDGE.nwk.lab
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDB3i...

EDGE# show ssh
Connection Version Mode Encryption  Hmac           State              Username
0          2.0     IN   aes256-ctr  hmac-sha2-256  Session started    netadmin
0          2.0     OUT  aes256-ctr  hmac-sha2-256  Session started    netadmin
%No SSHv1 server connections running.</pre>
<p><code>show ip ssh</code> is about the <b>server</b>: enabled or not, which version, timeouts. <code>show ssh</code> lists the <b>active sessions</b>, with cipher and username. <code>show users</code> shows who is on which line and from which IP. If keys are missing you see <code>SSH Disabled - version 1.99</code> followed by <code>%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).</code></p>

<h3>Connecting</h3>
<p>From the lab PC or another Cisco device the syntax is <code>ssh -l netadmin 10.0.12.2</code>. From a Linux or Windows terminal it is usually <code>ssh netadmin@10.0.12.2</code>. The first time, the client shows the router's key fingerprint and asks you to accept it; later, a changed fingerprint is a warning that you may be talking to a different device.</p>

<div class="eg"><p><b>Worked example.</b> Lab tasks 1 and 3 on EDGE: <code>hostname EDGE</code>, <code>ip domain name nwk.lab</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code>, then under <code>line vty 0 4</code>: <code>login local</code>, <code>transport input ssh</code>, <code>exec-timeout 5 0</code>. From PC-ADMIN, <code>telnet 10.0.12.2</code> now returns <code>% Connection refused by remote host</code>, while <code>ssh -l netadmin 10.0.12.2</code> asks for the password and lands at <code>EDGE#</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Generating keys before setting hostname and domain. Choosing a 512-bit key and wondering why only SSHv1 works. Forgetting <code>login local</code>, so the VTY lines still ask for a line password. Setting <code>transport input ssh</code> on vty 0 4 but leaving vty 5 15 on Telnet. Losing the keys after <code>crypto key zeroize rsa</code> and thinking SSH "broke".</p></div>

<div class="exam"><p><b>Exam traps.</b> The order is hostname, domain, keys. The minimum modulus for SSHv2 is 768. SSH is enabled by generating RSA keys, not by a separate "ssh enable" command. Version 1.99 means v1 and v2 are both accepted. <code>transport input ssh</code> blocks Telnet; it does not by itself require a username (that is <code>login local</code>).</p></div>

<div class="scn"><h4>SSH that was never really on</h4><p>A new engineer configured <code>ip ssh version 2</code> and <code>transport input ssh</code> on a branch switch, saved, and left. The next day nobody could reach the switch remotely: SSH connections were refused and Telnet was now blocked too. <code>show ip ssh</code> on the console said <code>SSH Disabled</code>: the switch had no domain name and no RSA keys. Adding <code>ip domain name</code> and <code>crypto key generate rsa modulus 2048</code> enabled the server immediately.</p><p><b>Lesson:</b> SSH is not on until keys exist. Always verify with <code>show ip ssh</code> and a real login before you disconnect.</p></div>

<div class="iv"><p class="q">"Walk me through enabling SSH on a Cisco switch."</p><p>Strong answer: set a hostname and <code>ip domain name</code>, because the RSA key is named hostname.domain; <code>crypto key generate rsa modulus 2048</code> (at least 768 for v2); <code>ip ssh version 2</code>; create a local user with a secret; on all VTY lines <code>login local</code> and <code>transport input ssh</code>; add exec-timeout and an access-class. Verify with <code>show ip ssh</code>, <code>show ssh</code>, <code>show users</code> and a real login, keeping the console session open until it works.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH (TCP 22) encrypts and authenticates; Telnet (TCP 23) sends everything in clear text.</li>
<li>Order: hostname, ip domain name, crypto key generate rsa modulus 2048, ip ssh version 2.</li>
<li>Keys are named hostname.domain; SSHv2 needs at least 768 bits.</li>
<li>VTY lines: <code>login local</code> plus <code>transport input ssh</code> on every range.</li>
<li>Verify with show ip ssh (server), show ssh (sessions), show users (who is where).</li>
</ul></div>
`,hi:`
<p>Telnet ek postcard hai: postman, sorting office aur jo bhi use uthaye, har shabd padh sakta hai, aapka password bhi. SSH ek sealed, tamper-proof lifaafa hai jise sirf paane wala khol sakta hai, aur lifaafa yeh bhi prove karta hai ki reply kis office ne bheja. Telnet ko SSH se badalna kisi bhi network device par sabse zaroori hardening step hai.</p>

<h3>Telnet versus SSH</h3>
<table class="cmp"><tr><th></th><th>Telnet</th><th>SSH</th></tr>
<tr><td>Port</td><td>TCP 23</td><td>TCP 22</td></tr>
<tr><td>Encryption</td><td>Kuch nahi, sab clear text mein</td><td>Poora session encrypted (jaise AES)</td></tr>
<tr><td>Server authentication</td><td>Kuch nahi</td><td>Server apni RSA host key se identity prove karta hai</td></tr>
<tr><td>Integrity</td><td>Kuch nahi</td><td>HMAC badle hue packets pakadta hai</td></tr>
<tr><td>Aaj use</td><td>Sirf isolated labs</td><td>Hamesha</td></tr>
</table>
<p>SSH ke do versions hain. <b>SSHv1</b> mein known design flaws hain aur use nahi karna chahiye. <b>SSHv2</b> standard hai. Jab <code>show ip ssh</code> <b>version 1.99</b> bolta hai, to router dono versions accept karta hai, jo aap nahi chahte; <code>ip ssh version 2</code> ise theek karta hai.</p>

<h3>Steps, aur har step kyun hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SSH enable karne ke steps">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 hostname</text><text x="65" y="64" text-anchor="middle" class="svg-muted" font-size="12">"Router" nahi</text>
<rect x="135" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="190" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 domain</text><text x="190" y="64" text-anchor="middle" class="svg-muted" font-size="12">ip domain name</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 RSA keys</text><text x="315" y="64" text-anchor="middle" class="svg-muted" font-size="12">2048 bits</text>
<rect x="385" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="440" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 version 2</text><text x="440" y="64" text-anchor="middle" class="svg-muted" font-size="12">ip ssh version 2</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="46" text-anchor="middle" class="svg-ink" font-size="13">5 user + vty</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="12">login local, ssh</text>
<line x1="120" y1="50" x2="135" y2="50" stroke="#64748b" stroke-width="2"/><line x1="245" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="385" y2="50" stroke="#64748b" stroke-width="2"/><line x1="495" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="315" y="120" text-anchor="middle" class="svg-accent" font-size="13">Key ka naam = hostname.domain  (EDGE.nwk.lab)</text>
<text x="315" y="150" text-anchor="middle" class="svg-muted" font-size="12">RSA keys bante hi SSH apne aap on ho jaata hai</text>
</svg><p class="cap">Steps 1 aur 2 isliye hain kyunki key pair ka naam hostname aur domain par hota hai. Step 3 hi asal mein SSH server enable karta hai.</p></div>

<pre class="code">Router(config)# hostname EDGE                          <span class="c">! step 1</span>
EDGE(config)# ip domain name nwk.lab                   <span class="c">! step 2</span>
EDGE(config)# crypto key generate rsa modulus 2048    <span class="c">! step 3: SSH server start</span>
EDGE(config)# ip ssh version 2                         <span class="c">! step 4</span>
EDGE(config)# ip ssh time-out 60                       <span class="c">! optional: login poora karne ke 60 s</span>
EDGE(config)# ip ssh authentication-retries 3          <span class="c">! optional: har connection par 3 koshishein</span>
EDGE(config)# username netadmin privilege 15 secret N0c!Admin26   <span class="c">! step 5</span>
EDGE(config)# line vty 0 4
EDGE(config-line)# login local
EDGE(config-line)# transport input ssh                 <span class="c">! Telnet mana</span>
EDGE(config-line)# end</pre>

<p>Step 3 ke dauraan router kya bolta hai:</p>
<pre class="out">EDGE(config)# crypto key generate rsa modulus 2048
<span class="hl">The name for the keys will be: EDGE.nwk.lab</span>

% The key modulus size is 2048 bits
% Generating 2048 bit RSA keys, keys will be non-exportable...
[OK] (elapsed time was 1 seconds)

*Sep 29 10:14:02.112: <span class="hl">%SSH-5-ENABLED: SSH 1.99 has been enabled</span></pre>
<p>Log 1.99 bolta hai kyunki version 2 abhi force nahi hua; step 4 ise theek karta hai. Agar aap step 1 ya 2 chhod do, IOS mana kar deta hai: <code>% Please define a hostname other than Router.</code> ya <code>% Please define a domain-name first.</code></p>

<h3>Key size ke rules</h3>
<ul>
<li>SSHv2 ko kam se kam <b>768 bits</b> ka modulus chahiye. Usse kam par router sirf SSHv1 offer kar sakta hai.</li>
<li>Aaj normal choice <b>2048</b> hai; 4096 zyada tar platforms par allowed hai lekin generate hone mein dheema.</li>
<li><code>modulus</code> keyword ke bina IOS interactively poochta hai: <code>How many bits in the modulus [1024]:</code>.</li>
<li><code>crypto key zeroize rsa</code> keys delete karta hai aur isliye SSH disable ho jaata hai.</li>
</ul>

<h3>transport input: kaunse protocols andar aa sakte hain</h3>
<table class="cmp"><tr><th>Command</th><th>VTY lines par asar</th></tr>
<tr><td><code>transport input ssh</code></td><td>Sirf SSH (hardened)</td></tr>
<tr><td><code>transport input telnet ssh</code></td><td>Dono, sirf migration ke dauraan kaam ka</td></tr>
<tr><td><code>transport input all</code></td><td>Har supported protocol</td></tr>
<tr><td><code>transport input none</code></td><td>Un lines par koi remote access nahi</td></tr>
</table>
<p>Defaults platform aur release ke hisaab se badalte hain (purana IOS sab allow karta tha, naya IOS XE aksar sirf SSH), isliye hamesha explicitly configure karo.</p>

<h3>Verification</h3>
<pre class="out">EDGE# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 60 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits
IOS Keys in SECSH format(ssh-rsa, base64 encoded): EDGE.nwk.lab
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDB3i...

EDGE# show ssh
Connection Version Mode Encryption  Hmac           State              Username
0          2.0     IN   aes256-ctr  hmac-sha2-256  Session started    netadmin
0          2.0     OUT  aes256-ctr  hmac-sha2-256  Session started    netadmin
%No SSHv1 server connections running.</pre>
<p><code>show ip ssh</code> <b>server</b> ke baare mein hai: enabled hai ya nahi, kaunsa version, timeouts. <code>show ssh</code> <b>active sessions</b> list karta hai, cipher aur username ke saath. <code>show users</code> dikhata hai kaun kis line par hai aur kis IP se. Agar keys missing hain to aapko <code>SSH Disabled - version 1.99</code> aur uske baad <code>%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).</code> dikhta hai.</p>

<h3>Connect karna</h3>
<p>Lab PC ya doosre Cisco device se syntax hai <code>ssh -l netadmin 10.0.12.2</code>. Linux ya Windows terminal se aam taur par <code>ssh netadmin@10.0.12.2</code>. Pehli baar client router ka key fingerprint dikhata hai aur accept karne ko kehta hai; baad mein badla hua fingerprint warning hai ki aap shayad kisi doosre device se baat kar rahe ho.</p>

<div class="eg"><p><b>Worked example.</b> EDGE par lab tasks 1 aur 3: <code>hostname EDGE</code>, <code>ip domain name nwk.lab</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code>, phir <code>line vty 0 4</code> ke neeche: <code>login local</code>, <code>transport input ssh</code>, <code>exec-timeout 5 0</code>. PC-ADMIN se <code>telnet 10.0.12.2</code> ab <code>% Connection refused by remote host</code> deta hai, jabki <code>ssh -l netadmin 10.0.12.2</code> password maangta hai aur <code>EDGE#</code> par pahunchta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Hostname aur domain set karne se pehle keys generate karna. 512-bit key choose karna aur sochna ki sirf SSHv1 kyun chal raha hai. <code>login local</code> bhool jaana, jisse VTY lines abhi bhi line password maangti hain. vty 0 4 par <code>transport input ssh</code> lagana lekin vty 5 15 ko Telnet par chhodna. <code>crypto key zeroize rsa</code> ke baad keys kho dena aur sochna ki SSH "toot gaya".</p></div>

<div class="exam"><p><b>Exam traps.</b> Order hai hostname, domain, keys. SSHv2 ke liye minimum modulus 768 hai. SSH RSA keys generate karne se enable hota hai, kisi alag "ssh enable" command se nahi. Version 1.99 ka matlab v1 aur v2 dono accept hote hain. <code>transport input ssh</code> Telnet block karta hai; akele yeh username nahi maangta (woh <code>login local</code> ka kaam hai).</p></div>

<div class="scn"><h4>SSH jo kabhi sach mein on hi nahi tha</h4><p>Ek naye engineer ne branch switch par <code>ip ssh version 2</code> aur <code>transport input ssh</code> configure kiya, save kiya aur chala gaya. Agle din koi bhi switch ko remotely reach nahi kar paya: SSH connections refuse ho rahe the aur ab Telnet bhi block tha. Console par <code>show ip ssh</code> ne <code>SSH Disabled</code> kaha: switch ka na domain name tha na RSA keys. <code>ip domain name</code> aur <code>crypto key generate rsa modulus 2048</code> add karte hi server turant enable ho gaya.</p><p><b>Seekh:</b> jab tak keys nahi hain, SSH on nahi hai. Disconnect karne se pehle hamesha <code>show ip ssh</code> aur asli login se verify karo.</p></div>

<div class="iv"><p class="q">"Cisco switch par SSH enable karna step by step batao."</p><p>Strong answer: hostname aur <code>ip domain name</code> set karo, kyunki RSA key ka naam hostname.domain hota hai; <code>crypto key generate rsa modulus 2048</code> (v2 ke liye kam se kam 768); <code>ip ssh version 2</code>; secret ke saath local user banao; saari VTY lines par <code>login local</code> aur <code>transport input ssh</code>; exec-timeout aur access-class add karo. <code>show ip ssh</code>, <code>show ssh</code>, <code>show users</code> aur asli login se verify karo, aur jab tak kaam na kare console session khula rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH (TCP 22) encrypt aur authenticate karta hai; Telnet (TCP 23) sab clear text mein bhejta hai.</li>
<li>Order: hostname, ip domain name, crypto key generate rsa modulus 2048, ip ssh version 2.</li>
<li>Keys ka naam hostname.domain hota hai; SSHv2 ko kam se kam 768 bits chahiye.</li>
<li>VTY lines: har range par <code>login local</code> plus <code>transport input ssh</code>.</li>
<li>show ip ssh (server), show ssh (sessions), show users (kaun kahan) se verify karo.</li>
</ul></div>
`}};export{e as default};