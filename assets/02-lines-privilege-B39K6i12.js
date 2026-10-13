var e={id:`lines-privilege`,h:{en:`Lines, SSH and privilege levels`,hi:`Lines, SSH aur privilege levels`},body:{en:`
<p>A router has several doors. The <b>console</b> is the door in the back of the building: you must be physically present. The <b>AUX</b> port is an old modem door. The <b>VTY</b> (virtual terminal) lines are the front doors that anyone on the network can knock on. Most attacks come through the front doors, so that is where hardening starts.</p>

<h3>The line types</h3>
<dl class="terms">
<dt>line console 0</dt><dd>The physical console port. Always available, even when every interface is down. Your last resort.</dd>
<dt>line aux 0</dt><dd>An auxiliary serial port, historically for a dial-in modem. Many platforms no longer have it; if present and unused, disable it with <code>no exec</code> and <code>transport input none</code>.</dd>
<dt>line vty 0 4 (and 5 15)</dt><dd>Virtual lines used by remote sessions: SSH, Telnet. IOS XE usually has 16 VTYs (0 to 15), and each concurrent session uses one. Configure all of them the same way, or attackers use the forgotten ones.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Router lines">
<rect x="240" y="70" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">exec shell</text>
<rect x="20" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">console 0</text>
<rect x="20" y="136" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="163" text-anchor="middle" class="svg-ink" font-size="13">aux 0 (legacy)</text>
<rect x="470" y="78" width="150" height="44" rx="8" fill="#fed7aa"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">vty 0 15</text>
<line x1="170" y1="42" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="170" y1="158" x2="240" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="400" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="545" y="145" text-anchor="middle" class="svg-accent" font-size="12">SSH from the network</text>
<text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="12">physical access</text>
</svg><p class="cap">Three kinds of doors into the same exec shell. The VTY lines face the network, so they need the most hardening.</p></div>

<h3>SSH instead of Telnet</h3>
<p>Telnet sends everything, including your password, in clear text over TCP 23. SSH version 2 encrypts the whole session over TCP 22. SSH needs four things on IOS XE: a hostname other than the default, a domain name, an RSA key pair and a way to authenticate users. This is exactly the startup configuration of R1 in the TACACS+ lab:</p>
<pre class="code">hostname R1
ip domain name nk.lab
crypto key generate rsa modulus 2048   <span class="c">! key name is R1.nk.lab</span>
ip ssh version 2
ip ssh time-out 60                     <span class="c">! seconds to finish login</span>
ip ssh authentication-retries 3
username backup privilege 15 secret Backup#26
line vty 0 15
 login local                           <span class="c">! before AAA: use the local database</span>
 transport input ssh                   <span class="c">! refuse telnet</span>
 exec-timeout 10 0                     <span class="c">! idle sessions close after 10 minutes</span>
 access-class VTY-MGMT in              <span class="c">! chapter 8</span></pre>
<p>Verify SSH and the sessions on the lines:</p>
<pre class="out">R1# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 60 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits
R1# show users
    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
<span class="hl"> 866 vty 0     netadmin   idle                 00:00:07 10.10.10.50</span></pre>

<h3>Other line hardening</h3>
<ul>
<li><code>exec-timeout 10 0</code>: closes idle sessions. <code>exec-timeout 0 0</code> means never, which is a bad idea on VTYs.</li>
<li><code>login block-for 120 attempts 3 within 60</code> (global): after 3 failed logins in 60 seconds, all logins are refused for 120 seconds ("quiet mode"). Add <code>login quiet-mode access-class VTY-MGMT</code> so the management subnet can still get in during quiet mode.</li>
<li><code>login on-failure log</code> and <code>login on-success log</code>: send syslog messages for every attempt.</li>
<li><code>transport output ssh</code> or <code>none</code>: controls which protocols a user may use to jump from this router to another.</li>
<li><code>banner login</code> or <code>banner motd</code>: a legal warning. It does not stop anyone, but in many countries it helps prosecution.</li>
</ul>

<h3>Privilege levels</h3>
<p>IOS has 16 privilege levels, 0 to 15. Three are defined out of the box:</p>
<table class="cmp"><tr><th>Level</th><th>Prompt</th><th>What it allows</th></tr>
<tr><td>0</td><td>R1&gt;</td><td>Only <code>disable</code>, <code>enable</code>, <code>exit</code>, <code>help</code>, <code>logout</code></td></tr>
<tr><td>1</td><td>R1&gt;</td><td>User EXEC: basic show commands, ping, traceroute</td></tr>
<tr><td>15</td><td>R1#</td><td>Privileged EXEC: everything, including configure terminal</td></tr></table>
<p>Levels 2 to 14 are empty until you move commands into them. A command moved to a level is available at that level and every higher level. For example, a helpdesk role at level 5 that may clear counters and bounce an interface:</p>
<pre class="code">privilege exec level 5 clear counters
privilege exec level 5 configure terminal
privilege configure level 5 interface
privilege interface level 5 shutdown
privilege interface level 5 no shutdown
enable secret level 5 H3lp-Lvl5
username helpdesk5 privilege 5 algorithm-type scrypt secret Help5#26</pre>
<p>A user reaches a level in two ways: by logging in with a username that carries a privilege (with AAA, only when exec authorization applies it, chapter 7) or by typing <code>enable 5</code> and the level-5 enable secret. <code>show privilege</code> displays the current level.</p>
<pre class="out">R1# show privilege
<span class="hl">Current privilege level is 15</span></pre>

<div class="eg"><p><b>Worked example.</b> In the TACACS+ lab, helpdesk logs in and must land at level 1, netadmin at level 15. On level 1 helpdesk can run <code>show ip interface brief</code> and <code>ping 10.10.10.100</code> but <code>configure terminal</code> returns "% Invalid input detected". If you later need helpdesk at level 5 with the commands above, you would only change the privilege on the TACACS+ server; the router already has the level-5 command set.</p></div>

<div class="note"><p>Custom privilege levels are a local, per-device tool. At scale, <b>TACACS+ command authorization</b> (chapter 7) is cleaner: the server decides command by command, the same way on every device.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>transport input ssh</code> and <code>access-class</code> on <code>line vty 0 4</code> only. Lines 5 to 15 still accept Telnet from anywhere. Always use <code>line vty 0 15</code> (or whatever <code>show line</code> lists).</p></div>

<div class="warn"><p><b>Common mistake.</b> Moving <code>show running-config</code> to a lower level and expecting users to see the whole config. At a low level it only shows the parts of the configuration the user is allowed to change, which is usually almost nothing.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSH on IOS needs a hostname, a domain name and an RSA key. The key size for SSH version 2 must be at least 768 bits, and 2048 is the practical minimum today. If a question shows <code>crypto key generate rsa</code> failing, check for the default hostname "Router" or a missing domain name.</p></div>

<div class="scn"><h4>Telnet on line 5</h4><p>An audit tool reported that a core switch accepted Telnet. The engineer checked <code>line vty 0 4</code> and saw <code>transport input ssh</code>, so the report looked wrong. <code>show running-config | section line vty</code> revealed a second block, <code>line vty 5 15</code>, with <code>transport input telnet ssh</code> and no access-class. When five SSH sessions were open, the sixth connection could use Telnet on line 5. The fix was one command block for <code>line vty 0 15</code>.</p><p><b>Lesson:</b> harden every VTY line; attackers do not care which line number they get.</p></div>

<div class="iv"><p class="q">"How do you harden remote access to a Cisco router?"</p><p>Walk through it in order: SSH version 2 with a 2048-bit RSA key, <code>transport input ssh</code> on all VTY lines, a VTY access-class allowing only the management subnet, exec-timeout, login block-for with a quiet-mode exception, logging of login attempts, personal accounts through AAA instead of a line password, and disabling unused AUX lines. A strong candidate adds that the console should also require authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console is local, AUX is legacy, VTY lines carry SSH and Telnet; harden all 16 VTYs.</li>
<li>SSH needs hostname, domain name, RSA key (2048 bits) and <code>ip ssh version 2</code>; <code>transport input ssh</code> refuses Telnet.</li>
<li>exec-timeout, login block-for, quiet-mode access-class and login logging limit guessing and idle sessions.</li>
<li>Levels 0, 1 and 15 exist by default; 2 to 14 are custom via the <code>privilege</code> command.</li>
<li><code>show ip ssh</code>, <code>show users</code>, <code>show line</code> and <code>show privilege</code> verify line access.</li>
</ul></div>
`,hi:`
<p>Router ke kai darwaze hote hain. <b>Console</b> building ka peeche wala darwaza hai: aapko physically maujood hona padta hai. <b>AUX</b> port ek purana modem darwaza hai. <b>VTY</b> (virtual terminal) lines saamne ke darwaze hain jinhe network par koi bhi khatkhata sakta hai. Zyada tar attacks saamne ke darwazon se aate hain, isliye hardening wahin se shuru hoti hai.</p>

<h3>Line types</h3>
<dl class="terms">
<dt>line console 0</dt><dd>Physical console port. Hamesha available, tab bhi jab saare interfaces down hon. Aapka aakhri sahara.</dd>
<dt>line aux 0</dt><dd>Auxiliary serial port, purane zamane mein dial-in modem ke liye. Kai platforms par ab yeh nahi hota; agar hai aur use nahi hota, to <code>no exec</code> aur <code>transport input none</code> se band karo.</dd>
<dt>line vty 0 4 (aur 5 15)</dt><dd>Remote sessions ki virtual lines: SSH, Telnet. IOS XE mein aam taur par 16 VTYs (0 se 15) hoti hain, aur har concurrent session ek line leta hai. Sabko same tarike se configure karo, warna attackers bhooli hui lines use karte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Router lines">
<rect x="240" y="70" width="160" height="60" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">exec shell</text>
<rect x="20" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">console 0</text>
<rect x="20" y="136" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="163" text-anchor="middle" class="svg-ink" font-size="13">aux 0 (purana)</text>
<rect x="470" y="78" width="150" height="44" rx="8" fill="#fed7aa"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="13">vty 0 15</text>
<line x1="170" y1="42" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="170" y1="158" x2="240" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="400" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="545" y="145" text-anchor="middle" class="svg-accent" font-size="12">network se SSH</text>
<text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="12">physical access</text>
</svg><p class="cap">Ek hi exec shell ke teen tarah ke darwaze. VTY lines network ki taraf hain, isliye unhe sabse zyada hardening chahiye.</p></div>

<h3>Telnet ki jagah SSH</h3>
<p>Telnet sab kuch, aapka password bhi, TCP 23 par clear text mein bhejta hai. SSH version 2 poora session TCP 22 par encrypt karta hai. IOS XE par SSH ko chaar cheezein chahiye: default ke alawa koi hostname, domain name, RSA key pair aur users ko authenticate karne ka tareeka. TACACS+ lab mein R1 ki startup configuration bilkul yahi hai:</p>
<pre class="code">hostname R1
ip domain name nk.lab
crypto key generate rsa modulus 2048   <span class="c">! key ka naam R1.nk.lab</span>
ip ssh version 2
ip ssh time-out 60                     <span class="c">! login poora karne ke seconds</span>
ip ssh authentication-retries 3
username backup privilege 15 secret Backup#26
line vty 0 15
 login local                           <span class="c">! AAA se pehle: local database</span>
 transport input ssh                   <span class="c">! telnet mana</span>
 exec-timeout 10 0                     <span class="c">! idle sessions 10 minute mein band</span>
 access-class VTY-MGMT in              <span class="c">! chapter 8</span></pre>
<p>SSH aur lines par sessions verify karo:</p>
<pre class="out">R1# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 60 secs; Authentication retries: 3
Minimum expected Diffie Hellman key size : 2048 bits
R1# show users
    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
<span class="hl"> 866 vty 0     netadmin   idle                 00:00:07 10.10.10.50</span></pre>

<h3>Line ki baaki hardening</h3>
<ul>
<li><code>exec-timeout 10 0</code>: idle sessions band karta hai. <code>exec-timeout 0 0</code> ka matlab kabhi nahi, jo VTYs par bura idea hai.</li>
<li><code>login block-for 120 attempts 3 within 60</code> (global): 60 second mein 3 failed logins ke baad 120 second tak saare logins mana ("quiet mode"). <code>login quiet-mode access-class VTY-MGMT</code> jodo taaki quiet mode mein bhi management subnet andar aa sake.</li>
<li><code>login on-failure log</code> aur <code>login on-success log</code>: har attempt ke liye syslog message bhejte hain.</li>
<li><code>transport output ssh</code> ya <code>none</code>: control karta hai ki user is router se doosre router par kis protocol se jump kar sakta hai.</li>
<li><code>banner login</code> ya <code>banner motd</code>: ek legal warning. Yeh kisi ko rokti nahi, par kai deshon mein prosecution mein madad karti hai.</li>
</ul>

<h3>Privilege levels</h3>
<p>IOS mein 16 privilege levels hain, 0 se 15. Teen pehle se defined hain:</p>
<table class="cmp"><tr><th>Level</th><th>Prompt</th><th>Kya allow karta hai</th></tr>
<tr><td>0</td><td>R1&gt;</td><td>Sirf <code>disable</code>, <code>enable</code>, <code>exit</code>, <code>help</code>, <code>logout</code></td></tr>
<tr><td>1</td><td>R1&gt;</td><td>User EXEC: basic show commands, ping, traceroute</td></tr>
<tr><td>15</td><td>R1#</td><td>Privileged EXEC: sab kuch, configure terminal bhi</td></tr></table>
<p>Levels 2 se 14 tab tak khaali hain jab tak aap unme commands move na karo. Kisi level par move kiya command us level aur usse upar ke har level par available hota hai. Jaise, level 5 par ek helpdesk role jo counters clear kar sake aur interface bounce kar sake:</p>
<pre class="code">privilege exec level 5 clear counters
privilege exec level 5 configure terminal
privilege configure level 5 interface
privilege interface level 5 shutdown
privilege interface level 5 no shutdown
enable secret level 5 H3lp-Lvl5
username helpdesk5 privilege 5 algorithm-type scrypt secret Help5#26</pre>
<p>User kisi level tak do tarike se pahunchta hai: privilege wale username se login karke (AAA ke saath, sirf tab jab exec authorization use lagu kare, chapter 7) ya <code>enable 5</code> aur level-5 enable secret type karke. <code>show privilege</code> current level dikhata hai.</p>
<pre class="out">R1# show privilege
<span class="hl">Current privilege level is 15</span></pre>

<div class="eg"><p><b>Worked example.</b> TACACS+ lab mein helpdesk login karta hai aur use level 1 par aana chahiye, netadmin ko level 15 par. Level 1 par helpdesk <code>show ip interface brief</code> aur <code>ping 10.10.10.100</code> chala sakta hai lekin <code>configure terminal</code> par "% Invalid input detected" aata hai. Agar baad mein helpdesk ko upar wale commands ke saath level 5 par chahiye, to aap sirf TACACS+ server par privilege badloge; router par level-5 command set pehle se hai.</p></div>

<div class="note"><p>Custom privilege levels ek local, per-device tool hain. Bade scale par <b>TACACS+ command authorization</b> (chapter 7) saaf hai: server command by command tay karta hai, har device par ek jaisa.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>transport input ssh</code> aur <code>access-class</code> sirf <code>line vty 0 4</code> par configure karna. Lines 5 se 15 ab bhi kahin se bhi Telnet accept karti hain. Hamesha <code>line vty 0 15</code> use karo (ya jo bhi <code>show line</code> dikhaye).</p></div>

<div class="warn"><p><b>Common galti.</b> <code>show running-config</code> ko neeche ke level par move karna aur ummeed karna ki users poora config dekhenge. Neeche ke level par yeh sirf configuration ke woh hisse dikhata hai jo user badal sakta hai, jo aam taur par lagbhag kuch nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> IOS par SSH ko hostname, domain name aur RSA key chahiye. SSH version 2 ke liye key size kam se kam 768 bits honi chahiye, aur aaj practical minimum 2048 hai. Agar question mein <code>crypto key generate rsa</code> fail ho raha hai, to default hostname "Router" ya missing domain name check karo.</p></div>

<div class="scn"><h4>Line 5 par Telnet</h4><p>Ek audit tool ne report kiya ki ek core switch Telnet accept karta hai. Engineer ne <code>line vty 0 4</code> check kiya aur <code>transport input ssh</code> dekha, isliye report galat lagi. <code>show running-config | section line vty</code> ne ek doosra block dikhaya, <code>line vty 5 15</code>, jisme <code>transport input telnet ssh</code> tha aur koi access-class nahi. Jab paanch SSH sessions khule the, chhathi connection line 5 par Telnet use kar sakti thi. Fix tha <code>line vty 0 15</code> ke liye ek command block.</p><p><b>Seekh:</b> har VTY line harden karo; attackers ko fark nahi padta ki unhe kaunsa line number milta hai.</p></div>

<div class="iv"><p class="q">"Cisco router ka remote access kaise harden karte ho?"</p><p>Kram se batao: 2048-bit RSA key ke saath SSH version 2, saari VTY lines par <code>transport input ssh</code>, sirf management subnet ko allow karne wala VTY access-class, exec-timeout, quiet-mode exception ke saath login block-for, login attempts ki logging, line password ki jagah AAA se personal accounts, aur unused AUX lines band. Strong candidate jodta hai ki console par bhi authentication honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console local hai, AUX purana hai, VTY lines SSH aur Telnet le jaati hain; saari 16 VTYs harden karo.</li>
<li>SSH ko hostname, domain name, RSA key (2048 bits) aur <code>ip ssh version 2</code> chahiye; <code>transport input ssh</code> Telnet mana karta hai.</li>
<li>exec-timeout, login block-for, quiet-mode access-class aur login logging guessing aur idle sessions ko seemit karte hain.</li>
<li>Levels 0, 1 aur 15 default mein hain; 2 se 14 <code>privilege</code> command se custom hain.</li>
<li><code>show ip ssh</code>, <code>show users</code>, <code>show line</code> aur <code>show privilege</code> line access verify karte hain.</li>
</ul></div>
`}};export{e as default};