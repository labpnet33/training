var e={id:`connect-boot`,h:{en:`Connecting to a device: console, terminal settings, boot and the setup dialog`,hi:`Device se connect karna: console, terminal settings, boot aur setup dialog`},body:{en:`
<p>A new switch arrives in a box. It has no IP address, so you cannot SSH to it and there is no web page to open. How do you talk to it? The same way a doctor talks to a patient who cannot answer the phone: you go and sit next to it. On network devices that bedside connection is the <b>console port</b>.</p>

<h3>Out-of-band versus in-band access</h3>
<p><b>Out-of-band</b> access uses a dedicated path that does not depend on the production network: the console cable, or a separate management network. It works even when the device has no configuration or its interfaces are broken. <b>In-band</b> access travels over the normal network, using the device's IP address: <b>SSH</b> (encrypted, port 22) or <b>Telnet</b> (clear text, port 23). In-band is what you use every day; out-of-band is what saves you on the bad day.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Console and remote access paths">
<rect x="20" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="14">Laptop</text>
<rect x="470" y="80" width="150" height="60" rx="8" fill="#fde68a"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">CON port / Gi0/0</text>
<line x1="150" y1="55" x2="470" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="310" y="58" text-anchor="middle" class="svg-accent" font-size="13">Console (rollover or USB): out-of-band</text>
<rect x="20" y="140" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="170" text-anchor="middle" class="svg-ink" font-size="14">Admin PC</text>
<rect x="250" y="140" width="120" height="50" rx="8" fill="#bae6fd"/><text x="310" y="170" text-anchor="middle" class="svg-ink" font-size="14">Network</text>
<line x1="150" y1="165" x2="250" y2="165" stroke="#64748b" stroke-width="2"/><line x1="370" y1="165" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="310" y="205" text-anchor="middle" class="svg-muted" font-size="12">SSH / Telnet to an IP address: in-band (VTY lines)</text>
</svg><p class="cap">The console needs no IP address. SSH and Telnet need a working IP path and configured VTY lines.</p></div>

<h3>The console cable</h3>
<p>Most Cisco devices have an RJ-45 port labelled <b>CONSOLE</b> (usually light blue). The classic cable is a <b>rollover cable</b>: flat and light blue, RJ-45 at one end and a DB-9 serial connector at the other. It is called rollover because pin 1 at one end goes to pin 8 at the other, pin 2 to pin 7, and so on. Laptops have no serial port today, so you add a <b>USB-to-serial adapter</b>. Many newer devices also have a <b>USB console port</b> (mini-B or USB-C); you connect a normal USB cable and install the driver. If both are connected, the USB console usually takes priority.</p>

<h3>Terminal emulator settings</h3>
<p>On the laptop you run a <b>terminal emulator</b> such as PuTTY, Tera Term, SecureCRT or <code>screen</code> on macOS and Linux. You pick the serial port the adapter created (COM3 on Windows, /dev/ttyUSB0 on Linux) and use the Cisco default settings:</p>
<table class="cmp"><tr><th>Setting</th><th>Value</th></tr>
<tr><td>Speed (baud)</td><td>9600</td></tr><tr><td>Data bits</td><td>8</td></tr><tr><td>Parity</td><td>None</td></tr><tr><td>Stop bits</td><td>1</td></tr><tr><td>Flow control</td><td>None</td></tr></table>
<p>Engineers say "9600 8N1, no flow control". If you see garbage characters, the speed is wrong. If you see nothing at all, press Enter a few times, check the COM port number, then the cable.</p>

<h3>What happens when a Cisco device boots</h3>
<p>Watching the console during boot tells you a lot. The sequence is:</p>
<ol>
<li><b>POST</b> (power-on self-test) from ROM checks the CPU, memory and interfaces.</li>
<li>The <b>bootstrap</b> program in ROM starts and reads the <b>configuration register</b> (normally 0x2102) to decide how to boot.</li>
<li>It <b>locates and loads IOS</b>, normally from <b>flash</b>, into RAM. If no valid image is found, the device stops in <b>ROMMON</b>, a tiny recovery monitor.</li>
<li>IOS looks for a saved configuration, the <b>startup-config</b> in <b>NVRAM</b>, and copies it into RAM as the <b>running-config</b>.</li>
<li>If there is no startup-config, IOS offers the <b>setup dialog</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Boot sequence">
<rect x="5" y="30" width="110" height="50" rx="8" fill="#fed7aa"/><text x="60" y="60" text-anchor="middle" class="svg-ink" font-size="13">POST (ROM)</text>
<rect x="135" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">Bootstrap</text><text x="190" y="70" text-anchor="middle" class="svg-muted" font-size="12">reads 0x2102</text>
<rect x="265" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">Load IOS</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">flash to RAM</text>
<rect x="395" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="13">Load config</text><text x="450" y="70" text-anchor="middle" class="svg-muted" font-size="12">NVRAM to RAM</text>
<rect x="525" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="13">No config?</text><text x="580" y="70" text-anchor="middle" class="svg-muted" font-size="12">setup dialog</text>
<line x1="115" y1="55" x2="135" y2="55" stroke="#64748b" stroke-width="2"/><line x1="245" y1="55" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><line x1="375" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="525" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">ROM, flash, NVRAM, RAM: each boot step uses a different memory.</p></div>

<h3>The setup dialog</h3>
<p>A device with an empty NVRAM prints this near the end of the boot:</p>
<pre class="out">         --- System Configuration Dialog ---

<span class="hl">Would you like to enter the initial configuration dialog? [yes/no]: no</span>

Would you like to terminate autoinstall? [yes]:

Press RETURN to get started!

Router&gt;</pre>
<p>The setup dialog asks questions (hostname, passwords, one interface) and builds a basic configuration for you. Engineers almost always answer <b>no</b> and configure by hand, because it is faster and you control every line. It is still an exam topic: know that it appears only when there is <b>no startup-config</b>, and that <code>Ctrl-C</code> aborts it. You can re-run it later from privileged EXEC with the command <code>setup</code>.</p>

<div class="eg"><p><b>Worked example.</b> You plug the rollover cable into R1's console, open PuTTY on COM4 at 9600 8N1, press Enter and see nothing. You check Device Manager: the adapter is actually on COM5. You reconnect on COM5, press Enter and get <code>Router&gt;</code>. Total time wasted: two minutes. Always check the COM port first.</p></div>

<h3>A preview of remote access</h3>
<p>Once the device has an IP address, you stop using the console for daily work. Remote sessions arrive on virtual terminal lines called <b>VTY lines</b> (<code>line vty 0 4</code> gives five simultaneous sessions, most switches have 0 15). In chapter 6 you will put a password on those lines; SSH, which replaces Telnet in real networks, is configured fully in the device-hardening module. In lab 3 you will test Telnet from PC1, because it needs only a password and shows clearly how VTY login works.</p>

<div class="warn"><p><b>Common mistakes.</b> Using a straight-through Ethernet cable in the console port (nothing appears); wrong baud rate (garbage characters); leaving flow control on hardware (keystrokes ignored); and forgetting that the console port is <i>not</i> an Ethernet port, so plugging it into a switch does nothing useful.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default console settings are 9600 baud, 8 data bits, no parity, 1 stop bit, no flow control. The setup dialog runs only when NVRAM has no startup-config. Telnet is clear text on TCP 23; SSH is encrypted on TCP 22. The console is out-of-band; SSH and Telnet are in-band.</p></div>

<div class="scn"><h4>The remote site with no way in</h4><p>A retail chain shipped a pre-configured router to a new store. A typo in the uplink IP address meant nobody at head office could SSH in. The store had no technician and no console cable. Two days were lost couriering a cable and talking a store manager through PuTTY at 9600 8N1. Afterwards the team added a small console server with a 4G modem at every site, giving them out-of-band access to every router console.</p><p><b>Lesson:</b> in-band access fails exactly when you need it most. Plan out-of-band access before the outage, not during it.</p></div>

<div class="iv"><p class="q">"How do you connect to a brand-new switch that has no IP address?"</p><p>Strong answer: through the console port, using a rollover cable with a USB-to-serial adapter or the USB console port, and a terminal emulator set to 9600 baud, 8 data bits, no parity, 1 stop bit, no flow control. Mention that this is out-of-band access, that the device will offer the setup dialog if NVRAM is empty, and that after giving it an IP address and VTY passwords (ideally SSH) you manage it in-band.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The console port gives out-of-band access that works with no IP address and no configuration.</li>
<li>Use a rollover cable (plus USB-serial adapter) or a USB console, at 9600 8N1, no flow control.</li>
<li>Boot: POST, bootstrap reads the config register, IOS loads from flash, startup-config loads from NVRAM.</li>
<li>No startup-config means the setup dialog appears; answer no and configure by hand.</li>
<li>SSH (TCP 22) and Telnet (TCP 23) arrive on VTY lines and need an IP path; SSH is the secure choice.</li>
</ul></div>
`,hi:`
<p>Ek naya switch box mein aata hai. Uska koi IP address nahi hai, isliye aap usmein SSH nahi kar sakte aur kholne ke liye koi web page bhi nahi hai. To aap usse baat kaise karoge? Waise hi jaise doctor us patient se baat karta hai jo phone nahi utha sakta: aap jaa kar uske paas baith jaate ho. Network devices par yeh "bedside" connection <b>console port</b> hai.</p>

<h3>Out-of-band aur in-band access</h3>
<p><b>Out-of-band</b> access ek dedicated raasta use karta hai jo production network par depend nahi karta: console cable, ya alag management network. Yeh tab bhi kaam karta hai jab device ki koi configuration na ho ya uske interfaces kharab hon. <b>In-band</b> access normal network se jaata hai, device ke IP address ka use karke: <b>SSH</b> (encrypted, port 22) ya <b>Telnet</b> (clear text, port 23). In-band aap roz use karte ho; out-of-band bure din aapko bachata hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Console aur remote access ke raaste">
<rect x="20" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="14">Laptop</text>
<rect x="470" y="80" width="150" height="60" rx="8" fill="#fde68a"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="545" y="125" text-anchor="middle" class="svg-muted" font-size="12">CON port / Gi0/0</text>
<line x1="150" y1="55" x2="470" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="310" y="58" text-anchor="middle" class="svg-accent" font-size="13">Console (rollover ya USB): out-of-band</text>
<rect x="20" y="140" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="85" y="170" text-anchor="middle" class="svg-ink" font-size="14">Admin PC</text>
<rect x="250" y="140" width="120" height="50" rx="8" fill="#bae6fd"/><text x="310" y="170" text-anchor="middle" class="svg-ink" font-size="14">Network</text>
<line x1="150" y1="165" x2="250" y2="165" stroke="#64748b" stroke-width="2"/><line x1="370" y1="165" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="310" y="205" text-anchor="middle" class="svg-muted" font-size="12">IP address par SSH / Telnet: in-band (VTY lines)</text>
</svg><p class="cap">Console ko IP address nahi chahiye. SSH aur Telnet ko chalta hua IP path aur configured VTY lines chahiye.</p></div>

<h3>Console cable</h3>
<p>Zyada tar Cisco devices par <b>CONSOLE</b> label wala RJ-45 port hota hai (aksar light blue). Classic cable <b>rollover cable</b> hai: flat aur light blue, ek end par RJ-45 aur dusre par DB-9 serial connector. Ise rollover isliye kehte hain kyunki ek end ka pin 1 dusre end ke pin 8 par jaata hai, pin 2 pin 7 par, aur aise hi. Aaj laptops mein serial port nahi hota, isliye aap <b>USB-to-serial adapter</b> lagate ho. Bahut naye devices mein <b>USB console port</b> (mini-B ya USB-C) bhi hota hai; aap normal USB cable lagate ho aur driver install karte ho. Agar dono lage hon to aam taur par USB console ko priority milti hai.</p>

<h3>Terminal emulator settings</h3>
<p>Laptop par aap ek <b>terminal emulator</b> chalate ho jaise PuTTY, Tera Term, SecureCRT ya macOS aur Linux par <code>screen</code>. Aap woh serial port chunte ho jo adapter ne banaya (Windows par COM3, Linux par /dev/ttyUSB0) aur Cisco ki default settings use karte ho:</p>
<table class="cmp"><tr><th>Setting</th><th>Value</th></tr>
<tr><td>Speed (baud)</td><td>9600</td></tr><tr><td>Data bits</td><td>8</td></tr><tr><td>Parity</td><td>None</td></tr><tr><td>Stop bits</td><td>1</td></tr><tr><td>Flow control</td><td>None</td></tr></table>
<p>Engineers bolte hain "9600 8N1, no flow control". Agar ajeeb characters dikhein to speed galat hai. Agar kuch bhi na dikhe, to kuch baar Enter dabao, COM port number check karo, phir cable.</p>

<h3>Cisco device boot hote waqt kya hota hai</h3>
<p>Boot ke dauraan console dekhna bahut kuch batata hai. Sequence yeh hai:</p>
<ol>
<li>ROM se <b>POST</b> (power-on self-test) CPU, memory aur interfaces check karta hai.</li>
<li>ROM ka <b>bootstrap</b> program start hota hai aur <b>configuration register</b> (normally 0x2102) padhta hai ki boot kaise karna hai.</li>
<li>Yeh <b>IOS dhoondh kar load karta hai</b>, normally <b>flash</b> se, RAM mein. Agar koi valid image nahi milti, device <b>ROMMON</b> mein ruk jaata hai, jo ek chhota recovery monitor hai.</li>
<li>IOS saved configuration dhoondhta hai, yaani <b>NVRAM</b> mein <b>startup-config</b>, aur use RAM mein <b>running-config</b> ke roop mein copy karta hai.</li>
<li>Agar startup-config nahi hai, to IOS <b>setup dialog</b> offer karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Boot sequence">
<rect x="5" y="30" width="110" height="50" rx="8" fill="#fed7aa"/><text x="60" y="60" text-anchor="middle" class="svg-ink" font-size="13">POST (ROM)</text>
<rect x="135" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">Bootstrap</text><text x="190" y="70" text-anchor="middle" class="svg-muted" font-size="12">0x2102 padhta hai</text>
<rect x="265" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">IOS load</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">flash se RAM</text>
<rect x="395" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="13">Config load</text><text x="450" y="70" text-anchor="middle" class="svg-muted" font-size="12">NVRAM se RAM</text>
<rect x="525" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="580" y="52" text-anchor="middle" class="svg-ink" font-size="13">Config nahi?</text><text x="580" y="70" text-anchor="middle" class="svg-muted" font-size="12">setup dialog</text>
<line x1="115" y1="55" x2="135" y2="55" stroke="#64748b" stroke-width="2"/><line x1="245" y1="55" x2="265" y2="55" stroke="#64748b" stroke-width="2"/><line x1="375" y1="55" x2="395" y2="55" stroke="#64748b" stroke-width="2"/><line x1="505" y1="55" x2="525" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">ROM, flash, NVRAM, RAM: har boot step alag memory use karta hai.</p></div>

<h3>Setup dialog</h3>
<p>Khaali NVRAM wala device boot ke end ke paas yeh print karta hai:</p>
<pre class="out">         --- System Configuration Dialog ---

<span class="hl">Would you like to enter the initial configuration dialog? [yes/no]: no</span>

Would you like to terminate autoinstall? [yes]:

Press RETURN to get started!

Router&gt;</pre>
<p>Setup dialog sawaal poochta hai (hostname, passwords, ek interface) aur aapke liye basic configuration bana deta hai. Engineers lagbhag hamesha <b>no</b> bolte hain aur haath se configure karte hain, kyunki yeh tez hai aur har line aapke control mein rehti hai. Phir bhi yeh exam topic hai: yaad rakho ki yeh sirf tab aata hai jab <b>startup-config nahi hoti</b>, aur <code>Ctrl-C</code> ise abort karta hai. Baad mein aap privileged EXEC se <code>setup</code> command se ise dobara chala sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Aap rollover cable R1 ke console mein lagate ho, COM4 par 9600 8N1 par PuTTY kholte ho, Enter dabate ho aur kuch nahi dikhta. Aap Device Manager check karte ho: adapter asal mein COM5 par hai. Aap COM5 par reconnect karte ho, Enter dabate ho aur <code>Router&gt;</code> milta hai. Kul waste hua time: do minute. Hamesha pehle COM port check karo.</p></div>

<h3>Remote access ka preview</h3>
<p>Jab device ko IP address mil jaata hai, aap roz ke kaam ke liye console use karna band kar dete ho. Remote sessions virtual terminal lines par aate hain jinhe <b>VTY lines</b> kehte hain (<code>line vty 0 4</code> paanch sessions ek saath deta hai, zyada tar switches par 0 15 hota hai). Chapter 6 mein aap in lines par password lagaoge; SSH, jo real networks mein Telnet ki jagah leta hai, device-hardening module mein poora configure hota hai. Lab 3 mein aap PC1 se Telnet test karoge, kyunki isse sirf password chahiye aur yeh saaf dikhata hai ki VTY login kaise kaam karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Console port mein straight-through Ethernet cable lagana (kuch nahi dikhta); galat baud rate (ajeeb characters); flow control ko hardware par chhod dena (keystrokes ignore hote hain); aur yeh bhool jaana ki console port Ethernet port <i>nahi</i> hai, isliye use switch mein lagane se kuch kaam ka nahi hota.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default console settings hain 9600 baud, 8 data bits, no parity, 1 stop bit, no flow control. Setup dialog sirf tab chalta hai jab NVRAM mein startup-config nahi hoti. Telnet TCP 23 par clear text hai; SSH TCP 22 par encrypted hai. Console out-of-band hai; SSH aur Telnet in-band hain.</p></div>

<div class="scn"><h4>Remote site jahan andar jaane ka koi raasta nahi</h4><p>Ek retail chain ne naye store ko pre-configured router bheja. Uplink IP address mein ek typo ki wajah se head office se koi SSH nahi kar paaya. Store mein koi technician aur koi console cable nahi tha. Cable courier karne aur store manager ko phone par PuTTY 9600 8N1 samjhane mein do din lag gaye. Uske baad team ne har site par 4G modem wala chhota console server lagaya, jisse unhe har router console ka out-of-band access mil gaya.</p><p><b>Seekh:</b> in-band access thik usi waqt fail hota hai jab uski sabse zyada zaroorat hoti hai. Out-of-band access outage se pehle plan karo, uske dauraan nahi.</p></div>

<div class="iv"><p class="q">"Ek bilkul naye switch se kaise connect karoge jiska koi IP address nahi hai?"</p><p>Strong answer: console port se, rollover cable aur USB-to-serial adapter ya USB console port ke saath, aur terminal emulator 9600 baud, 8 data bits, no parity, 1 stop bit, no flow control par set karke. Yeh bolo ki yeh out-of-band access hai, NVRAM khaali ho to device setup dialog offer karega, aur IP address aur VTY passwords (behtar hai SSH) dene ke baad aap ise in-band manage karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console port out-of-band access deta hai jo bina IP address aur bina configuration ke kaam karta hai.</li>
<li>Rollover cable (plus USB-serial adapter) ya USB console use karo, 9600 8N1, no flow control par.</li>
<li>Boot: POST, bootstrap config register padhta hai, IOS flash se load hota hai, startup-config NVRAM se load hoti hai.</li>
<li>Startup-config nahi hai to setup dialog aata hai; no bolo aur haath se configure karo.</li>
<li>SSH (TCP 22) aur Telnet (TCP 23) VTY lines par aate hain aur unhe IP path chahiye; SSH secure choice hai.</li>
</ul></div>
`}};export{e as default};