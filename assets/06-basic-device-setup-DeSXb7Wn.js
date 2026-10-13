var e={id:`basic-setup`,h:{en:`Basic device setup: hostname, banner, enable secret and line passwords`,hi:`Basic device setup: hostname, banner, enable secret aur line passwords`},body:{en:`
<p>A new device out of the box is like a new flat with the front door wide open and no name on the bell. Before you move furniture in, you put your name on the door, fit locks on the front door and the balcony, and stick a "private property" sign outside. On a router or switch, that first-day routine is the hostname, the banner, the enable secret, and passwords on the console and VTY lines. Lab 3 walks you through all of it.</p>

<h3>Name it: hostname</h3>
<pre class="code">Router(config)# hostname R1
R1(config)#</pre>
<p>The hostname appears in the prompt, in CDP/LLDP neighbour tables, in log messages and in SSH keys. A clear naming scheme (site, role, number: <code>BLR-CORE-SW1</code>) saves minutes in every outage because you always know which device you are on. Hostnames must start with a letter and contain no spaces.</p>

<h3>Warn them: banner motd</h3>
<pre class="code">R1(config)# banner motd # Authorised access only. Activity is logged. #</pre>
<p>The <b>message of the day</b> banner appears before login on the console and on remote sessions. The first character after <code>motd</code> is the <b>delimiter</b>; the banner ends at the next copy of that character, so choose one that does not appear in the text (<code>#</code>, <code>^</code>, <code>$</code>). In many countries a legal warning banner is what makes unauthorised access prosecutable, so never write "Welcome".</p>

<h3>Lock the staff door: enable secret</h3>
<pre class="code">R1(config)# enable secret Kings@123</pre>
<p>This password is asked for when anyone types <code>enable</code>. There are two variants and you must know both:</p>
<table class="cmp"><tr><th>Command</th><th>How it is stored</th><th>Use it?</th></tr>
<tr><td><code>enable password</code></td><td>Clear text (or weak type 7 with encryption service)</td><td>No, legacy only</td></tr>
<tr><td><code>enable secret</code></td><td>Strong one-way hash: type 5 (MD5) on older IOS, type 9 (scrypt) or 8 on current IOS</td><td>Yes, always</td></tr>
</table>
<p>If both are configured, <b>enable secret wins</b> and the enable password is ignored.</p>

<h3>Lock the front door and the balcony: console and VTY lines</h3>
<p>A <b>line</b> is a way into the CLI. <code>line con 0</code> is the console port. <code>line vty 0 4</code> is five virtual lines for Telnet/SSH sessions (switches usually also have 5 to 15). Each needs a password and the word <code>login</code>, which tells IOS to actually ask for it.</p>
<pre class="code">R1(config)# line con 0
R1(config-line)# password Con@123
R1(config-line)# login
R1(config-line)# exec-timeout 5 0         <span class="c">! log out after 5 min 0 s idle</span>
R1(config-line)# logging synchronous      <span class="c">! log messages do not break your typing</span>
R1(config-line)# exit
R1(config)# line vty 0 4
R1(config-line)# password Vty@123
R1(config-line)# login
R1(config-line)# end</pre>
<ul>
<li><b>password</b> without <b>login</b> does nothing: nobody is asked. <b>login</b> without a password on the console lets you in freely; on VTY lines it refuses every session with "Password required, but none set".</li>
<li><b>exec-timeout minutes seconds</b> closes idle sessions (default 10 minutes; <code>0 0</code> means never, which you should not use in production).</li>
<li><b>logging synchronous</b> reprints your half-typed command after a log message interrupts it.</li>
<li><code>login local</code> uses usernames created with <code>username admin secret ...</code> instead of a shared line password; together with SSH this is the production standard, configured in the device-hardening module.</li>
</ul>

<h3>Hide the rest: service password-encryption</h3>
<pre class="code">R1(config)# service password-encryption</pre>
<p>Line passwords and <code>enable password</code> are stored in clear text by default. This command scrambles them to <b>type 7</b> so someone looking over your shoulder at <code>show running-config</code> cannot read them. Type 7 is a reversible encoding, not real encryption; free tools decode it in a second. It protects against shoulder-surfing only. The strong protection is <code>enable secret</code> and <code>username ... secret</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where each password applies">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">Console user</text>
<rect x="20" y="140" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">Telnet / SSH user</text>
<rect x="220" y="70" width="140" height="50" rx="8" fill="#fed7aa"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="13">line con 0</text><text x="290" y="110" text-anchor="middle" class="svg-muted" font-size="12">password + login</text>
<rect x="220" y="140" width="140" height="50" rx="8" fill="#fed7aa"/><text x="290" y="162" text-anchor="middle" class="svg-ink" font-size="13">line vty 0 4</text><text x="290" y="180" text-anchor="middle" class="svg-muted" font-size="12">password + login</text>
<rect x="420" y="100" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="470" y="130" text-anchor="middle" class="svg-accent" font-size="14">R1&gt;</text>
<rect x="540" y="100" width="90" height="50" rx="8" fill="#bae6fd"/><text x="585" y="130" text-anchor="middle" class="svg-accent" font-size="14">R1#</text>
<line x1="140" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="165" x2="220" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="420" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="165" x2="420" y2="130" stroke="#64748b" stroke-width="2"/><line x1="520" y1="125" x2="540" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">enable secret</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Two locks: the line password gets you in, the enable secret gets you to #</text>
</svg><p class="cap">Line passwords guard the way in; the enable secret guards privileged EXEC.</p></div>

<h3>Verification</h3>
<pre class="out">R1# show running-config | section line|enable|banner
<span class="hl">enable secret 9 $9$ofzcgzrfk201oo$cgzrfk201ooavmmofzcgzrfk201ooavmm</span>
banner motd ^C Authorised access only. Activity is logged. ^C
line con 0
 exec-timeout 5 0
 <span class="hl">password 7 02250B552B575D72</span>
 logging synchronous
 login
line vty 0 4
 password 7 023010422B575D72
 login</pre>
<p>Then test it the way an attacker would, from PC1:</p>
<pre class="out">PC1&gt; telnet 192.168.10.1
Trying 192.168.10.1...
Connected to 192.168.10.1.

Authorised access only. Activity is logged.

User Access Verification

Password:
R1&gt; enable
Password:
R1# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:00:41
<span class="hl">*866 vty 0                idle                 00:00:00   192.168.10.10</span></pre>

<div class="eg"><p><b>Worked example.</b> In lab 3 R1 already has its IP address. You add the enable secret, console and VTY passwords, encryption and the banner, then Telnet from PC1. <code>show users</code> marks your session with <code>*</code> on a vty line from 192.168.10.10. Finally <code>copy running-config startup-config</code> on both R1 and SW1 makes it permanent.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting a line password but forgetting <code>login</code>. Using <code>enable password</code> instead of <code>enable secret</code>. Securing <code>vty 0 4</code> on a switch but leaving <code>vty 5 15</code> open. Setting <code>exec-timeout 0 0</code> on production. Believing type 7 is secure.</p></div>

<div class="exam"><p><b>Exam traps.</b> Enable secret overrides enable password. <code>service password-encryption</code> produces reversible type 7 and does not affect the enable secret, which is already hashed. A VTY line with <code>login</code> but no password refuses Telnet. The banner delimiter is the first character after <code>motd</code>.</p></div>

<div class="scn"><h4>The switch anyone could manage</h4><p>A security audit at a college found that 40 access switches accepted Telnet with the password "cisco" and had no enable secret on some models, so the auditor reached privileged EXEC in seconds from a student lab PC. The network team pushed a standard block to every switch: enable secret, local usernames, <code>login local</code> on all 16 VTY lines, exec-timeout, the legal banner and service password-encryption, then saved and verified each switch. SSH replaced Telnet the following month.</p><p><b>Lesson:</b> the first five minutes of configuration are security configuration. Do them on every device, every time.</p></div>

<div class="iv"><p class="q">"What is the difference between enable password and enable secret, and what does service password-encryption do?"</p><p>Strong answer: enable password is stored in clear text (or type 7); enable secret is a one-way hash (type 5, 8 or 9) and takes precedence if both exist. service password-encryption converts clear-text passwords such as line passwords to type 7, which only hides them from casual viewing because it is reversible. Best practice is enable secret, local users with secret, login local and SSH.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First-day routine: hostname, banner motd, enable secret, console and VTY passwords with login, exec-timeout, save.</li>
<li><code>enable secret</code> is hashed and overrides <code>enable password</code>.</li>
<li>A line password only works with <code>login</code>; <code>login local</code> uses local usernames instead.</li>
<li><code>service password-encryption</code> gives weak, reversible type 7; it only stops shoulder-surfing.</li>
<li>Verify with <code>show running-config | section line</code> and test with a real Telnet/SSH login.</li>
</ul></div>
`,hi:`
<p>Box se nikla naya device ek naye flat jaisa hai jiska main darwaza poora khula hai aur bell par koi naam nahi. Furniture andar le jaane se pehle aap darwaze par apna naam lagate ho, main door aur balcony par taale lagate ho, aur bahar "private property" ka board lagate ho. Router ya switch par pehle din ka yahi routine hai: hostname, banner, enable secret, aur console aur VTY lines par passwords. Lab 3 aapko yeh sab karwata hai.</p>

<h3>Naam do: hostname</h3>
<pre class="code">Router(config)# hostname R1
R1(config)#</pre>
<p>Hostname prompt mein, CDP/LLDP neighbour tables mein, log messages mein aur SSH keys mein dikhta hai. Ek saaf naming scheme (site, role, number: <code>BLR-CORE-SW1</code>) har outage mein minute bachati hai kyunki aapko hamesha pata hota hai ki aap kaunse device par ho. Hostname letter se shuru hona chahiye aur usmein space nahi hona chahiye.</p>

<h3>Warning do: banner motd</h3>
<pre class="code">R1(config)# banner motd # Authorised access only. Activity is logged. #</pre>
<p><b>Message of the day</b> banner console aur remote sessions par login se pehle dikhta hai. <code>motd</code> ke baad ka pehla character <b>delimiter</b> hai; banner us character ki agli copy par khatam hota hai, isliye aisa character chuno jo text mein na ho (<code>#</code>, <code>^</code>, <code>$</code>). Kai deshon mein legal warning banner hi unauthorised access ko prosecutable banata hai, isliye kabhi "Welcome" mat likho.</p>

<h3>Staff door lock karo: enable secret</h3>
<pre class="code">R1(config)# enable secret Kings@123</pre>
<p>Jab bhi koi <code>enable</code> type karta hai to yeh password poocha jaata hai. Iske do variants hain aur aapko dono aane chahiye:</p>
<table class="cmp"><tr><th>Command</th><th>Kaise store hota hai</th><th>Use karein?</th></tr>
<tr><td><code>enable password</code></td><td>Clear text (ya encryption service ke saath weak type 7)</td><td>Nahi, sirf legacy</td></tr>
<tr><td><code>enable secret</code></td><td>Strong one-way hash: purane IOS par type 5 (MD5), current IOS par type 9 (scrypt) ya 8</td><td>Haan, hamesha</td></tr>
</table>
<p>Agar dono configure hon to <b>enable secret jeetta hai</b> aur enable password ignore hota hai.</p>

<h3>Main door aur balcony lock karo: console aur VTY lines</h3>
<p><b>Line</b> CLI mein aane ka ek raasta hai. <code>line con 0</code> console port hai. <code>line vty 0 4</code> Telnet/SSH sessions ke liye paanch virtual lines hain (switches par aksar 5 se 15 bhi hoti hain). Har ek ko password aur <code>login</code> shabd chahiye, jo IOS ko batata hai ki password sach mein poochna hai.</p>
<pre class="code">R1(config)# line con 0
R1(config-line)# password Con@123
R1(config-line)# login
R1(config-line)# exec-timeout 5 0         <span class="c">! 5 min 0 s idle ke baad logout</span>
R1(config-line)# logging synchronous      <span class="c">! log messages aapki typing nahi todte</span>
R1(config-line)# exit
R1(config)# line vty 0 4
R1(config-line)# password Vty@123
R1(config-line)# login
R1(config-line)# end</pre>
<ul>
<li><b>login</b> ke bina <b>password</b> kuch nahi karta: kisi se poocha hi nahi jaata. Console par password ke bina <b>login</b> aapko free mein andar aane deta hai; VTY lines par yeh har session ko "Password required, but none set" ke saath mana kar deta hai.</li>
<li><b>exec-timeout minutes seconds</b> idle sessions band karta hai (default 10 minute; <code>0 0</code> ka matlab kabhi nahi, jo production mein use nahi karna chahiye).</li>
<li><b>logging synchronous</b> log message beech mein aane ke baad aapki aadhi type ki hui command dobara print kar deta hai.</li>
<li><code>login local</code> shared line password ki jagah <code>username admin secret ...</code> se banaye gaye usernames use karta hai; SSH ke saath yahi production standard hai, jo device-hardening module mein configure hota hai.</li>
</ul>

<h3>Baaki chhupao: service password-encryption</h3>
<pre class="code">R1(config)# service password-encryption</pre>
<p>Line passwords aur <code>enable password</code> default mein clear text mein store hote hain. Yeh command unhe <b>type 7</b> mein scramble kar deti hai taaki aapke kandhe ke upar se <code>show running-config</code> dekhne wala unhe padh na sake. Type 7 reversible encoding hai, asli encryption nahi; free tools use ek second mein decode kar dete hain. Yeh sirf shoulder-surfing se bachata hai. Strong protection <code>enable secret</code> aur <code>username ... secret</code> hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Kaunsa password kahan lagta hai">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">Console user</text>
<rect x="20" y="140" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">Telnet / SSH user</text>
<rect x="220" y="70" width="140" height="50" rx="8" fill="#fed7aa"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="13">line con 0</text><text x="290" y="110" text-anchor="middle" class="svg-muted" font-size="12">password + login</text>
<rect x="220" y="140" width="140" height="50" rx="8" fill="#fed7aa"/><text x="290" y="162" text-anchor="middle" class="svg-ink" font-size="13">line vty 0 4</text><text x="290" y="180" text-anchor="middle" class="svg-muted" font-size="12">password + login</text>
<rect x="420" y="100" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="470" y="130" text-anchor="middle" class="svg-accent" font-size="14">R1&gt;</text>
<rect x="540" y="100" width="90" height="50" rx="8" fill="#bae6fd"/><text x="585" y="130" text-anchor="middle" class="svg-accent" font-size="14">R1#</text>
<line x1="140" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="140" y1="165" x2="220" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="420" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="165" x2="420" y2="130" stroke="#64748b" stroke-width="2"/><line x1="520" y1="125" x2="540" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">enable secret</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Do taale: line password andar laata hai, enable secret # tak le jaata hai</text>
</svg><p class="cap">Line passwords andar aane ka raasta guard karte hain; enable secret privileged EXEC guard karta hai.</p></div>

<h3>Verification</h3>
<pre class="out">R1# show running-config | section line|enable|banner
<span class="hl">enable secret 9 $9$ofzcgzrfk201oo$cgzrfk201ooavmmofzcgzrfk201ooavmm</span>
banner motd ^C Authorised access only. Activity is logged. ^C
line con 0
 exec-timeout 5 0
 <span class="hl">password 7 02250B552B575D72</span>
 logging synchronous
 login
line vty 0 4
 password 7 023010422B575D72
 login</pre>
<p>Phir ise waise test karo jaise attacker karega, PC1 se:</p>
<pre class="out">PC1&gt; telnet 192.168.10.1
Trying 192.168.10.1...
Connected to 192.168.10.1.

Authorised access only. Activity is logged.

User Access Verification

Password:
R1&gt; enable
Password:
R1# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:00:41
<span class="hl">*866 vty 0                idle                 00:00:00   192.168.10.10</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab 3 mein R1 par IP address pehle se hai. Aap enable secret, console aur VTY passwords, encryption aur banner add karte ho, phir PC1 se Telnet karte ho. <code>show users</code> aapke session ko 192.168.10.10 se aayi vty line par <code>*</code> se mark karta hai. Aakhir mein R1 aur SW1 dono par <code>copy running-config startup-config</code> ise permanent bana deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Line password set karna lekin <code>login</code> bhool jaana. <code>enable secret</code> ki jagah <code>enable password</code> use karna. Switch par <code>vty 0 4</code> secure karna lekin <code>vty 5 15</code> khula chhod dena. Production par <code>exec-timeout 0 0</code> set karna. Type 7 ko secure samajhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Enable secret enable password ko override karta hai. <code>service password-encryption</code> reversible type 7 banata hai aur enable secret ko affect nahi karta, jo pehle se hashed hai. Jis VTY line par <code>login</code> ho par password na ho woh Telnet mana kar deti hai. Banner delimiter <code>motd</code> ke baad ka pehla character hai.</p></div>

<div class="scn"><h4>Woh switch jise koi bhi manage kar sakta tha</h4><p>Ek college ke security audit mein pata chala ki 40 access switches password "cisco" ke saath Telnet accept karte the aur kuch models par enable secret tha hi nahi, isliye auditor student lab PC se seconds mein privileged EXEC tak pahunch gaya. Network team ne har switch par ek standard block push kiya: enable secret, local usernames, saari 16 VTY lines par <code>login local</code>, exec-timeout, legal banner aur service password-encryption, phir har switch save aur verify kiya. Agle mahine SSH ne Telnet ki jagah le li.</p><p><b>Seekh:</b> configuration ke pehle paanch minute security configuration hote hain. Inhe har device par, har baar karo.</p></div>

<div class="iv"><p class="q">"enable password aur enable secret mein kya farak hai, aur service password-encryption kya karta hai?"</p><p>Strong answer: enable password clear text (ya type 7) mein store hota hai; enable secret one-way hash (type 5, 8 ya 9) hai aur dono hon to wahi jeetta hai. service password-encryption line passwords jaise clear-text passwords ko type 7 mein badalta hai, jo sirf casual viewing se chhupata hai kyunki yeh reversible hai. Best practice hai enable secret, secret ke saath local users, login local aur SSH.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle din ka routine: hostname, banner motd, enable secret, login ke saath console aur VTY passwords, exec-timeout, save.</li>
<li><code>enable secret</code> hashed hai aur <code>enable password</code> ko override karta hai.</li>
<li>Line password sirf <code>login</code> ke saath kaam karta hai; <code>login local</code> uski jagah local usernames use karta hai.</li>
<li><code>service password-encryption</code> weak, reversible type 7 deta hai; yeh sirf shoulder-surfing rokta hai.</li>
<li><code>show running-config | section line</code> se verify karo aur asli Telnet/SSH login se test karo.</li>
</ul></div>
`}};export{e as default};