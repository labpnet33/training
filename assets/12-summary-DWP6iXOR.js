var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module in front of a switch that said <code>Switch&gt;</code> and nothing else. You can now connect to it, climb through its modes, ask it for help, name it, lock it, address it, verify it and save it. This chapter pulls everything together into a checklist, a glossary, the most-tested facts and a one-page command sheet you can keep next to the console.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="First configuration in six steps">
<rect x="5" y="30" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="55" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="52" y="73" text-anchor="middle" class="svg-muted" font-size="12">9600 8N1</text>
<rect x="112" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="159" y="55" text-anchor="middle" class="svg-ink" font-size="13">Enter</text><text x="159" y="73" text-anchor="middle" class="svg-muted" font-size="12">en, conf t</text>
<rect x="219" y="30" width="95" height="56" rx="8" fill="#fde68a"/><text x="266" y="55" text-anchor="middle" class="svg-ink" font-size="13">Identify</text><text x="266" y="73" text-anchor="middle" class="svg-muted" font-size="12">hostname</text>
<rect x="326" y="30" width="95" height="56" rx="8" fill="#fed7aa"/><text x="373" y="55" text-anchor="middle" class="svg-ink" font-size="13">Secure</text><text x="373" y="73" text-anchor="middle" class="svg-muted" font-size="12">secret, lines</text>
<rect x="433" y="30" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="480" y="73" text-anchor="middle" class="svg-muted" font-size="12">ip, no shut</text>
<rect x="540" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">Save</text><text x="587" y="73" text-anchor="middle" class="svg-muted" font-size="12">copy run start</text>
<line x1="100" y1="58" x2="112" y2="58" stroke="#64748b" stroke-width="2"/><line x1="207" y1="58" x2="219" y2="58" stroke="#64748b" stroke-width="2"/><line x1="314" y1="58" x2="326" y2="58" stroke="#64748b" stroke-width="2"/><line x1="421" y1="58" x2="433" y2="58" stroke="#64748b" stroke-width="2"/><line x1="528" y1="58" x2="540" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="13">Verify with a show command after every step</text>
</svg><p class="cap">The whole module in one line: connect, enter, identify, secure, address, save.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can connect to a console with the right cable and 9600 8N1, no flow control, and explain out-of-band versus in-band access.</li>
<li>I can describe the boot sequence (POST, bootstrap, IOS from flash, startup-config from NVRAM, setup dialog).</li>
<li>I can move between user EXEC, privileged EXEC, global config, interface and line modes, and know what <code>exit</code>, <code>end</code> and Ctrl-Z do.</li>
<li>I can use <code>?</code>, Tab, abbreviations and history, and interpret Invalid, Incomplete and Ambiguous errors.</li>
<li>I can configure hostname, banner motd, enable secret, console and VTY passwords with login, exec-timeout, logging synchronous and service password-encryption.</li>
<li>I can address a router interface and a switch SVI, set <code>ip default-gateway</code>, and read every state in <code>show ip interface brief</code>.</li>
<li>I can filter output with include, exclude, begin and section, and run EXEC commands in config mode with <code>do</code>.</li>
<li>I can save and verify the configuration, explain running versus startup, back it up, and describe password recovery with the configuration register.</li>
<li>I can troubleshoot "cannot ping my router" bottom-up and nearest-first.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IOS / IOS XE</dt><dd>Cisco's operating system for routers and switches; IOS XE is the current Linux-based version with the same CLI.</dd>
<dt>Console port</dt><dd>Out-of-band management port; needs no IP address.</dd>
<dt>VTY line</dt><dd>Virtual terminal line used by Telnet and SSH sessions.</dd>
<dt>User / privileged EXEC</dt><dd>The <code>&gt;</code> and <code>#</code> levels: look only, versus see everything and manage files.</dd>
<dt>Running-config / startup-config</dt><dd>Active configuration in RAM / saved configuration in NVRAM.</dd>
<dt>SVI</dt><dd>Switch virtual interface, a Layer 3 interface for a VLAN, used for switch management.</dd>
<dt>Configuration register</dt><dd>Boot setting read by the bootstrap; 0x2102 normal, 0x2142 ignore NVRAM.</dd>
<dt>ROMMON</dt><dd>Minimal ROM monitor used for recovery when IOS cannot or should not load.</dd>
<dt>Type 7 / type 9</dt><dd>Reversible password encoding / strong scrypt hash for secrets.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Console</td><td>9600 baud, 8 data bits, no parity, 1 stop bit, no flow control</td></tr>
<tr><td>Memory</td><td>ROM: bootstrap/POST; flash: IOS; NVRAM: startup-config; RAM: running-config</td></tr>
<tr><td>Modes</td><td><code>&gt;</code> user, <code>#</code> privileged, <code>(config)#</code> global; <code>end</code>/Ctrl-Z back to <code>#</code></td></tr>
<tr><td>Passwords</td><td>enable secret overrides enable password; type 7 is reversible; line passwords need <code>login</code></td></tr>
<tr><td>Interfaces</td><td>Router interfaces default shutdown; admin down = <code>shutdown</code>; down/down = Layer 1; up/down = Layer 2</td></tr>
<tr><td>Switch IP</td><td>On an SVI; needs <code>ip default-gateway</code> to reach other subnets</td></tr>
<tr><td>Saving</td><td><code>copy running-config startup-config</code> = <code>write memory</code>; copying into running-config merges</td></tr>
<tr><td>Boot</td><td>Setup dialog only when there is no startup-config; 0x2142 skips it for password recovery</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! --- modes and help</span>
enable | disable | configure terminal | exit | end | ?  | show history
<span class="c">! --- identity and security (global config)</span>
hostname R1
no ip domain-lookup
banner motd # Authorised access only #
enable secret Kings@123
service password-encryption
line con 0
 password Con@123
 login
 exec-timeout 5 0
 logging synchronous
line vty 0 4
 password Vty@123
 login
<span class="c">! --- router interface</span>
interface GigabitEthernet0/0
 description LAN-to-SW1
 ip address 192.168.10.1 255.255.255.0
 no shutdown
<span class="c">! --- switch management</span>
interface vlan 1
 ip address 192.168.10.2 255.255.255.0
 no shutdown
ip default-gateway 192.168.10.1
<span class="c">! --- verify and save (privileged EXEC, or with do in config mode)</span>
show version | show running-config | show startup-config
show ip interface brief | show interfaces description | show users
show running-config | section line
copy running-config startup-config</pre>

<div class="warn"><p><b>Last reminders.</b> Read the prompt before typing. Add <code>login</code> after every line password. <code>no shutdown</code> every router interface you use. Verify after every change. Save on every device you touched.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Wrong-mode questions (config commands at <code>#</code>), enable secret versus password precedence, type 7 being weak, admin down versus down/down, <code>ip default-gateway</code> on a Layer 2 switch, the merge behaviour of <code>copy ... running-config</code>, and the 0x2102 / 0x2142 register values.</p></div>

<div class="scn"><h4>The new-hire's first real change</h4><p>A fresher at a managed-services company was given a real ticket in week two: bring up a new store's switch and router. She used the checklist from this module: console at 9600 8N1, no to the setup dialog, hostname from the naming standard, enable secret, console and VTY passwords with login, banner, interface addresses with descriptions, the SVI and default gateway, pings from both devices, a Telnet test from a store PC, and <code>copy run start</code> on both. Her senior reviewed <code>show running-config</code> and found nothing to change. The store opened on time.</p><p><b>Lesson:</b> a short, repeatable routine done carefully beats clever tricks. The first configuration is the foundation for every module that follows.</p></div>

<div class="iv"><p class="q">"You are handed a factory-new router and switch. Talk me through your first 15 minutes."</p><p>Strong answer: console in at 9600 8N1 and decline the setup dialog; set hostname and <code>no ip domain-lookup</code>; enable secret; console and VTY passwords with login (or local users and SSH), exec-timeout, logging synchronous, banner and service password-encryption; address the router interface with a description and no shutdown; give the switch a management SVI and default gateway; verify with <code>show ip interface brief</code> and pings; save with <code>copy run start</code> and confirm with <code>show startup-config</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connect, enter, identify, secure, address, save, and verify after every step.</li>
<li>Know the four memories, the mode prompts and the boot sequence cold.</li>
<li>Secrets are hashed; type 7 is not security; line passwords need login.</li>
<li><code>show ip interface brief</code> and ping, nearest-first, solve most first-day problems.</li>
<li>Next: the network models module, where you will follow data through every layer of the devices you just configured.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek aise switch ke saamne shuru kiya tha jo sirf <code>Switch&gt;</code> bol raha tha. Ab aap usse connect kar sakte ho, uske modes mein chadh sakte ho, usse help maang sakte ho, use naam de sakte ho, lock kar sakte ho, address de sakte ho, verify kar sakte ho aur save kar sakte ho. Yeh chapter sab kuch ek checklist, ek glossary, sabse zyada test hone wale facts aur ek page ki command sheet mein jodta hai jise aap console ke paas rakh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Pehli configuration chhe steps mein">
<rect x="5" y="30" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="55" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="52" y="73" text-anchor="middle" class="svg-muted" font-size="12">9600 8N1</text>
<rect x="112" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="159" y="55" text-anchor="middle" class="svg-ink" font-size="13">Enter</text><text x="159" y="73" text-anchor="middle" class="svg-muted" font-size="12">en, conf t</text>
<rect x="219" y="30" width="95" height="56" rx="8" fill="#fde68a"/><text x="266" y="55" text-anchor="middle" class="svg-ink" font-size="13">Pehchan</text><text x="266" y="73" text-anchor="middle" class="svg-muted" font-size="12">hostname</text>
<rect x="326" y="30" width="95" height="56" rx="8" fill="#fed7aa"/><text x="373" y="55" text-anchor="middle" class="svg-ink" font-size="13">Secure</text><text x="373" y="73" text-anchor="middle" class="svg-muted" font-size="12">secret, lines</text>
<rect x="433" y="30" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="480" y="73" text-anchor="middle" class="svg-muted" font-size="12">ip, no shut</text>
<rect x="540" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">Save</text><text x="587" y="73" text-anchor="middle" class="svg-muted" font-size="12">copy run start</text>
<line x1="100" y1="58" x2="112" y2="58" stroke="#64748b" stroke-width="2"/><line x1="207" y1="58" x2="219" y2="58" stroke="#64748b" stroke-width="2"/><line x1="314" y1="58" x2="326" y2="58" stroke="#64748b" stroke-width="2"/><line x1="421" y1="58" x2="433" y2="58" stroke="#64748b" stroke-width="2"/><line x1="528" y1="58" x2="540" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="13">Har step ke baad show command se verify karo</text>
</svg><p class="cap">Poora module ek line mein: connect, enter, pehchan, secure, address, save.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main sahi cable aur 9600 8N1, no flow control ke saath console se connect kar sakta hoon, aur out-of-band vs in-band access samjha sakta hoon.</li>
<li>Main boot sequence bata sakta hoon (POST, bootstrap, flash se IOS, NVRAM se startup-config, setup dialog).</li>
<li>Main user EXEC, privileged EXEC, global config, interface aur line modes ke beech move kar sakta hoon, aur jaanta hoon ki <code>exit</code>, <code>end</code> aur Ctrl-Z kya karte hain.</li>
<li>Main <code>?</code>, Tab, abbreviations aur history use kar sakta hoon, aur Invalid, Incomplete aur Ambiguous errors samajh sakta hoon.</li>
<li>Main hostname, banner motd, enable secret, login ke saath console aur VTY passwords, exec-timeout, logging synchronous aur service password-encryption configure kar sakta hoon.</li>
<li>Main router interface aur switch SVI ko address de sakta hoon, <code>ip default-gateway</code> set kar sakta hoon, aur <code>show ip interface brief</code> ki har state padh sakta hoon.</li>
<li>Main include, exclude, begin aur section se output filter kar sakta hoon, aur <code>do</code> se config mode mein EXEC commands chala sakta hoon.</li>
<li>Main configuration save aur verify kar sakta hoon, running vs startup samjha sakta hoon, backup le sakta hoon, aur configuration register ke saath password recovery bata sakta hoon.</li>
<li>Main "router ping nahi hota" ko neeche se upar aur pehle nazdeek wale tareeke se troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IOS / IOS XE</dt><dd>Routers aur switches ke liye Cisco ka operating system; IOS XE wahi CLI wala current Linux-based version hai.</dd>
<dt>Console port</dt><dd>Out-of-band management port; IP address nahi chahiye.</dd>
<dt>VTY line</dt><dd>Telnet aur SSH sessions ke liye virtual terminal line.</dd>
<dt>User / privileged EXEC</dt><dd><code>&gt;</code> aur <code>#</code> levels: sirf dekhna, vs sab dekhna aur files manage karna.</dd>
<dt>Running-config / startup-config</dt><dd>RAM mein active configuration / NVRAM mein saved configuration.</dd>
<dt>SVI</dt><dd>Switch virtual interface, VLAN ke liye Layer 3 interface, switch management ke liye use hota hai.</dd>
<dt>Configuration register</dt><dd>Boot setting jise bootstrap padhta hai; 0x2102 normal, 0x2142 NVRAM ignore.</dd>
<dt>ROMMON</dt><dd>Minimal ROM monitor, recovery ke liye jab IOS load nahi ho sakta ya nahi hona chahiye.</dd>
<dt>Type 7 / type 9</dt><dd>Reversible password encoding / secrets ke liye strong scrypt hash.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Console</td><td>9600 baud, 8 data bits, no parity, 1 stop bit, no flow control</td></tr>
<tr><td>Memory</td><td>ROM: bootstrap/POST; flash: IOS; NVRAM: startup-config; RAM: running-config</td></tr>
<tr><td>Modes</td><td><code>&gt;</code> user, <code>#</code> privileged, <code>(config)#</code> global; <code>end</code>/Ctrl-Z wapas <code>#</code> par</td></tr>
<tr><td>Passwords</td><td>enable secret enable password ko override karta hai; type 7 reversible hai; line passwords ko <code>login</code> chahiye</td></tr>
<tr><td>Interfaces</td><td>Router interfaces default shutdown; admin down = <code>shutdown</code>; down/down = Layer 1; up/down = Layer 2</td></tr>
<tr><td>Switch IP</td><td>SVI par; dusre subnets tak pahunchne ke liye <code>ip default-gateway</code> chahiye</td></tr>
<tr><td>Saving</td><td><code>copy running-config startup-config</code> = <code>write memory</code>; running-config mein copy karna merge karta hai</td></tr>
<tr><td>Boot</td><td>Setup dialog sirf tab jab startup-config na ho; password recovery ke liye 0x2142 use skip karta hai</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! --- modes aur help</span>
enable | disable | configure terminal | exit | end | ?  | show history
<span class="c">! --- pehchan aur security (global config)</span>
hostname R1
no ip domain-lookup
banner motd # Authorised access only #
enable secret Kings@123
service password-encryption
line con 0
 password Con@123
 login
 exec-timeout 5 0
 logging synchronous
line vty 0 4
 password Vty@123
 login
<span class="c">! --- router interface</span>
interface GigabitEthernet0/0
 description LAN-to-SW1
 ip address 192.168.10.1 255.255.255.0
 no shutdown
<span class="c">! --- switch management</span>
interface vlan 1
 ip address 192.168.10.2 255.255.255.0
 no shutdown
ip default-gateway 192.168.10.1
<span class="c">! --- verify aur save (privileged EXEC, ya config mode mein do ke saath)</span>
show version | show running-config | show startup-config
show ip interface brief | show interfaces description | show users
show running-config | section line
copy running-config startup-config</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Type karne se pehle prompt padho. Har line password ke baad <code>login</code> lagao. Jo router interface use karo us par <code>no shutdown</code>. Har change ke baad verify karo. Jis device ko chhua, us par save karo.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Galat-mode questions (<code>#</code> par config commands), enable secret vs password ki precedence, type 7 ka weak hona, admin down vs down/down, Layer 2 switch par <code>ip default-gateway</code>, <code>copy ... running-config</code> ka merge behaviour, aur 0x2102 / 0x2142 register values.</p></div>

<div class="scn"><h4>New-hire ka pehla asli change</h4><p>Ek managed-services company mein ek fresher ko dusre hafte mein ek asli ticket mila: naye store ka switch aur router chalu karna. Usne is module ki checklist use ki: 9600 8N1 par console, setup dialog ko no, naming standard se hostname, enable secret, login ke saath console aur VTY passwords, banner, descriptions ke saath interface addresses, SVI aur default gateway, dono devices se pings, store PC se Telnet test, aur dono par <code>copy run start</code>. Uske senior ne <code>show running-config</code> review kiya aur kuch badalne ko nahi mila. Store time par khula.</p><p><b>Seekh:</b> dhyan se kiya gaya chhota, repeatable routine clever tricks se behtar hai. Pehli configuration har aane wale module ki neev hai.</p></div>

<div class="iv"><p class="q">"Aapko factory-new router aur switch diya gaya hai. Mujhe apne pehle 15 minute batao."</p><p>Strong answer: 9600 8N1 par console, setup dialog decline; hostname aur <code>no ip domain-lookup</code> set; enable secret; login ke saath console aur VTY passwords (ya local users aur SSH), exec-timeout, logging synchronous, banner aur service password-encryption; router interface ko description aur no shutdown ke saath address; switch ko management SVI aur default gateway; <code>show ip interface brief</code> aur pings se verify; <code>copy run start</code> se save aur <code>show startup-config</code> se confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connect, enter, pehchan, secure, address, save, aur har step ke baad verify.</li>
<li>Chaar memories, mode prompts aur boot sequence bilkul pakke yaad rakho.</li>
<li>Secrets hashed hote hain; type 7 security nahi hai; line passwords ko login chahiye.</li>
<li><code>show ip interface brief</code> aur ping, pehle nazdeek, pehle din ki zyada tar problems solve karte hain.</li>
<li>Aage: network models module, jahan aap abhi configure kiye devices ki har layer se data ko follow karoge.</li>
</ul></div>
`}};export{e as default};