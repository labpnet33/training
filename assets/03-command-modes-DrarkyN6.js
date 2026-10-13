var e={id:`modes`,h:{en:`Command modes: user EXEC, privileged EXEC, global and sub-configuration`,hi:`Command modes: user EXEC, privileged EXEC, global aur sub-configuration`},body:{en:`
<p>Think of IOS modes as the floors of a building connected by one staircase. You always enter on the ground floor, you climb one floor at a time, and some doors on each floor lead to small side rooms. To do any job you must first walk to the right floor. Every IOS command belongs to one or more modes, and the prompt tells you which floor you are on.</p>

<h3>The modes you must know</h3>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>How you get there</th><th>What you can do</th></tr>
<tr><td><b>User EXEC</b></td><td><code>R1&gt;</code></td><td>Log in on console or VTY</td><td>Basic <code>show</code> commands, <code>ping</code>, <code>traceroute</code>. No configuration, no running-config.</td></tr>
<tr><td><b>Privileged EXEC</b></td><td><code>R1#</code></td><td><code>enable</code></td><td>Every <code>show</code> command, <code>debug</code>, <code>copy</code>, <code>reload</code>, <code>clear</code>. Still no configuration.</td></tr>
<tr><td><b>Global configuration</b></td><td><code>R1(config)#</code></td><td><code>configure terminal</code></td><td>Commands that affect the whole device: <code>hostname</code>, <code>enable secret</code>, <code>ip route</code>, <code>banner</code>.</td></tr>
<tr><td><b>Interface config</b></td><td><code>R1(config-if)#</code></td><td><code>interface GigabitEthernet0/0</code></td><td>Settings for one interface: IP address, description, shutdown.</td></tr>
<tr><td><b>Line config</b></td><td><code>R1(config-line)#</code></td><td><code>line con 0</code> or <code>line vty 0 4</code></td><td>Settings for the console or remote lines: password, login, exec-timeout.</td></tr>
<tr><td><b>Other sub-modes</b></td><td><code>(config-router)#</code>, <code>(config-vlan)#</code></td><td><code>router ospf 1</code>, <code>vlan 10</code></td><td>Routing protocols and VLANs, covered in later modules.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IOS mode map">
<rect x="20" y="20" width="160" height="46" rx="8" fill="#e2e8f0"/><text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">User EXEC</text><text x="100" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1&gt;</text>
<rect x="240" y="20" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Privileged EXEC</text><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1#</text>
<rect x="460" y="20" width="160" height="46" rx="8" fill="#fde68a"/><text x="540" y="40" text-anchor="middle" class="svg-ink" font-size="13">Global config</text><text x="540" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1(config)#</text>
<line x1="180" y1="36" x2="240" y2="36" stroke="#64748b" stroke-width="2"/><text x="210" y="30" text-anchor="middle" class="svg-muted" font-size="12">enable</text>
<line x1="180" y1="52" x2="240" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="210" y="80" text-anchor="middle" class="svg-muted" font-size="12">disable</text>
<line x1="400" y1="36" x2="460" y2="36" stroke="#64748b" stroke-width="2"/><text x="430" y="30" text-anchor="middle" class="svg-muted" font-size="12">conf t</text>
<line x1="400" y1="52" x2="460" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="430" y="80" text-anchor="middle" class="svg-muted" font-size="12">exit / end</text>
<rect x="300" y="140" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="13">Interface</text><text x="375" y="178" text-anchor="middle" class="svg-accent" font-size="12">(config-if)#</text>
<rect x="470" y="140" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="13">Line</text><text x="545" y="178" text-anchor="middle" class="svg-accent" font-size="12">(config-line)#</text>
<line x1="520" y1="66" x2="385" y2="140" stroke="#64748b" stroke-width="2"/><line x1="550" y1="66" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">interface</text><text x="585" y="110" text-anchor="middle" class="svg-muted" font-size="12">line</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">exit = up one level   ·   end or Ctrl-Z = straight back to R1#</text>
</svg><p class="cap">Climb with enable and configure terminal; step down with exit, jump down with end.</p></div>

<h3>Moving between modes</h3>
<pre class="code">Router&gt; enable
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# hostname R1
R1(config)# interface GigabitEthernet0/0
R1(config-if)# description LAN-to-SW1
R1(config-if)# exit
<span class="c">! exit goes up ONE level: back to global config</span>
R1(config)# line con 0
R1(config-line)# end
<span class="c">! end (or Ctrl-Z) jumps straight back to privileged EXEC</span>
R1# disable
R1&gt;</pre>
<ul>
<li><code>enable</code> moves from user to privileged EXEC (asking for the enable secret if one is set).</li>
<li><code>configure terminal</code> (usually typed <code>conf t</code>) enters global configuration.</li>
<li><code>exit</code> goes up one level. In user or privileged EXEC, <code>exit</code> ends the session completely.</li>
<li><code>end</code> or <b>Ctrl-Z</b> leaves any configuration mode and returns to privileged EXEC.</li>
<li><code>disable</code> drops from privileged back to user EXEC.</li>
</ul>

<h3>Two helpful IOS behaviours</h3>
<p><b>Changes take effect immediately.</b> The moment you press Enter on a configuration command, it is active in the <b>running-config</b>. There is no "apply" button. That is powerful and dangerous: shutting the interface you are connected through cuts you off at once.</p>
<p><b>Global commands work from sub-modes.</b> If you are in <code>(config-if)#</code> and type a global command such as <code>line vty 0 4</code> or <code>interface GigabitEthernet0/1</code>, IOS accepts it and moves you to the new mode. You do not need to <code>exit</code> first. This is why pasted configurations work even without <code>exit</code> lines.</p>

<div class="eg"><p><b>Worked example from lab 1.</b> On the new switch you start at <code>Switch&gt;</code>. <code>show version</code> works here. <code>show running-config</code> does not, so you type <code>enable</code> and the prompt becomes <code>Switch#</code>. Now <code>show running-config</code> and <code>show ip interface brief</code> work. <code>configure terminal</code> gives <code>Switch(config)#</code>, <code>hostname LAB-SW1</code> changes the prompt to <code>LAB-SW1(config)#</code>, and <code>end</code> returns you to <code>LAB-SW1#</code>.</p></div>

<p>What it looks like when you try a command in the wrong mode:</p>
<pre class="out">Switch&gt; show running-config
             ^
<span class="hl">% Invalid input detected at '^' marker.</span>

Switch&gt; enable
Switch# show running-config
Building configuration...</pre>
<p>The caret points to the first word IOS did not accept. Here it is under <code>running-config</code>: the <code>show</code> command exists in user EXEC, but that option does not.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>exit</code> at <code>R1#</code> and wondering why the session closed. Trying <code>ping</code> or <code>show</code> in config mode without <code>do</code> (chapter 9). Forgetting you are still inside an interface and applying a command to the wrong interface. Always glance at the prompt.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>end</code> and Ctrl-Z both return to privileged EXEC from any config mode; <code>exit</code> goes up only one level. <code>enable</code> is the only way from <code>&gt;</code> to <code>#</code>. Configuration commands cannot be typed at <code>#</code> without <code>configure terminal</code>. <code>configure terminal</code> itself is a privileged EXEC command.</p></div>

<div class="scn"><h4>The interface that got the wrong description</h4><p>An engineer labelled ports on a core switch. He entered <code>interface GigabitEthernet1/0/10</code>, set a description, then typed <code>ip address</code> for the next job without noticing he was still in the Gi1/0/10 sub-mode. The address landed on the wrong port and a server VLAN went down. <code>show running-config interface GigabitEthernet1/0/10</code> revealed the mistake, <code>no ip address</code> removed it, and the change was repeated on the right interface.</p><p><b>Lesson:</b> the prompt tells you the mode but not which interface. Re-enter the interface explicitly before each block of changes, and verify with <code>show running-config interface</code>.</p></div>

<div class="iv"><p class="q">"Walk me through the IOS command modes."</p><p>Strong answer: user EXEC (<code>&gt;</code>) for basic monitoring; <code>enable</code> to privileged EXEC (<code>#</code>) for all show, debug, copy and reload; <code>configure terminal</code> to global config for device-wide settings; from there sub-modes such as interface, line, router and VLAN. <code>exit</code> goes up one level, <code>end</code> or Ctrl-Z returns to privileged EXEC. Add that configuration changes apply immediately to the running-config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User EXEC <code>&gt;</code> → <code>enable</code> → privileged EXEC <code>#</code> → <code>configure terminal</code> → <code>(config)#</code>.</li>
<li>Sub-modes such as <code>(config-if)#</code> and <code>(config-line)#</code> configure one interface or one line.</li>
<li><code>exit</code> goes up one level; <code>end</code> or Ctrl-Z returns straight to <code>#</code>.</li>
<li>Configuration changes take effect instantly in the running-config.</li>
<li>"% Invalid input" very often means the right command in the wrong mode.</li>
</ul></div>
`,hi:`
<p>IOS modes ko ek building ke floors samjho jo ek hi seedhi se jude hain. Aap hamesha ground floor par enter karte ho, ek baar mein ek floor chadhte ho, aur har floor par kuch darwaze chhote side rooms mein khulte hain. Koi bhi kaam karne ke liye pehle aapko sahi floor par jaana padta hai. Har IOS command ek ya zyada modes ki hoti hai, aur prompt batata hai ki aap kaunse floor par ho.</p>

<h3>Modes jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Wahan kaise pahunchte ho</th><th>Aap kya kar sakte ho</th></tr>
<tr><td><b>User EXEC</b></td><td><code>R1&gt;</code></td><td>Console ya VTY par login</td><td>Basic <code>show</code> commands, <code>ping</code>, <code>traceroute</code>. Koi configuration nahi, running-config nahi.</td></tr>
<tr><td><b>Privileged EXEC</b></td><td><code>R1#</code></td><td><code>enable</code></td><td>Har <code>show</code> command, <code>debug</code>, <code>copy</code>, <code>reload</code>, <code>clear</code>. Abhi bhi configuration nahi.</td></tr>
<tr><td><b>Global configuration</b></td><td><code>R1(config)#</code></td><td><code>configure terminal</code></td><td>Woh commands jo poore device ko affect karti hain: <code>hostname</code>, <code>enable secret</code>, <code>ip route</code>, <code>banner</code>.</td></tr>
<tr><td><b>Interface config</b></td><td><code>R1(config-if)#</code></td><td><code>interface GigabitEthernet0/0</code></td><td>Ek interface ki settings: IP address, description, shutdown.</td></tr>
<tr><td><b>Line config</b></td><td><code>R1(config-line)#</code></td><td><code>line con 0</code> ya <code>line vty 0 4</code></td><td>Console ya remote lines ki settings: password, login, exec-timeout.</td></tr>
<tr><td><b>Dusre sub-modes</b></td><td><code>(config-router)#</code>, <code>(config-vlan)#</code></td><td><code>router ospf 1</code>, <code>vlan 10</code></td><td>Routing protocols aur VLANs, aage ke modules mein.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="IOS mode map">
<rect x="20" y="20" width="160" height="46" rx="8" fill="#e2e8f0"/><text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">User EXEC</text><text x="100" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1&gt;</text>
<rect x="240" y="20" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Privileged EXEC</text><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1#</text>
<rect x="460" y="20" width="160" height="46" rx="8" fill="#fde68a"/><text x="540" y="40" text-anchor="middle" class="svg-ink" font-size="13">Global config</text><text x="540" y="58" text-anchor="middle" class="svg-accent" font-size="13">R1(config)#</text>
<line x1="180" y1="36" x2="240" y2="36" stroke="#64748b" stroke-width="2"/><text x="210" y="30" text-anchor="middle" class="svg-muted" font-size="12">enable</text>
<line x1="180" y1="52" x2="240" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="210" y="80" text-anchor="middle" class="svg-muted" font-size="12">disable</text>
<line x1="400" y1="36" x2="460" y2="36" stroke="#64748b" stroke-width="2"/><text x="430" y="30" text-anchor="middle" class="svg-muted" font-size="12">conf t</text>
<line x1="400" y1="52" x2="460" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="430" y="80" text-anchor="middle" class="svg-muted" font-size="12">exit / end</text>
<rect x="300" y="140" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="13">Interface</text><text x="375" y="178" text-anchor="middle" class="svg-accent" font-size="12">(config-if)#</text>
<rect x="470" y="140" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="13">Line</text><text x="545" y="178" text-anchor="middle" class="svg-accent" font-size="12">(config-line)#</text>
<line x1="520" y1="66" x2="385" y2="140" stroke="#64748b" stroke-width="2"/><line x1="550" y1="66" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">interface</text><text x="585" y="110" text-anchor="middle" class="svg-muted" font-size="12">line</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">exit = ek level upar   ·   end ya Ctrl-Z = seedha R1# par</text>
</svg><p class="cap">enable aur configure terminal se chadho; exit se ek step neeche, end se seedha neeche.</p></div>

<h3>Modes ke beech move karna</h3>
<pre class="code">Router&gt; enable
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# hostname R1
R1(config)# interface GigabitEthernet0/0
R1(config-if)# description LAN-to-SW1
R1(config-if)# exit
<span class="c">! exit EK level upar jaata hai: wapas global config</span>
R1(config)# line con 0
R1(config-line)# end
<span class="c">! end (ya Ctrl-Z) seedha privileged EXEC par le jaata hai</span>
R1# disable
R1&gt;</pre>
<ul>
<li><code>enable</code> user se privileged EXEC mein le jaata hai (agar enable secret set hai to woh poochta hai).</li>
<li><code>configure terminal</code> (aksar <code>conf t</code> type karte hain) global configuration mein le jaata hai.</li>
<li><code>exit</code> ek level upar jaata hai. User ya privileged EXEC mein <code>exit</code> session hi band kar deta hai.</li>
<li><code>end</code> ya <b>Ctrl-Z</b> kisi bhi configuration mode se nikal kar privileged EXEC par le aata hai.</li>
<li><code>disable</code> privileged se wapas user EXEC par le aata hai.</li>
</ul>

<h3>IOS ke do helpful behaviours</h3>
<p><b>Changes turant lagu hote hain.</b> Jaise hi aap configuration command par Enter dabate ho, woh <b>running-config</b> mein active ho jaati hai. Koi "apply" button nahi hai. Yeh powerful bhi hai aur khatarnaak bhi: jis interface se aap connected ho use shut karoge to aap turant kat jaoge.</p>
<p><b>Global commands sub-modes se bhi chalti hain.</b> Agar aap <code>(config-if)#</code> mein ho aur koi global command jaise <code>line vty 0 4</code> ya <code>interface GigabitEthernet0/1</code> type karte ho, to IOS use accept karke aapko naye mode mein le jaata hai. Pehle <code>exit</code> karne ki zaroorat nahi. Isi wajah se paste ki gayi configurations bina <code>exit</code> lines ke bhi chal jaati hain.</p>

<div class="eg"><p><b>Lab 1 ka worked example.</b> Naye switch par aap <code>Switch&gt;</code> se shuru karte ho. Yahan <code>show version</code> chalta hai. <code>show running-config</code> nahi chalta, isliye aap <code>enable</code> type karte ho aur prompt <code>Switch#</code> ban jaata hai. Ab <code>show running-config</code> aur <code>show ip interface brief</code> chalte hain. <code>configure terminal</code> se <code>Switch(config)#</code> milta hai, <code>hostname LAB-SW1</code> prompt ko <code>LAB-SW1(config)#</code> bana deta hai, aur <code>end</code> aapko <code>LAB-SW1#</code> par wapas le aata hai.</p></div>

<p>Jab aap galat mode mein command try karte ho to aisa dikhta hai:</p>
<pre class="out">Switch&gt; show running-config
             ^
<span class="hl">% Invalid input detected at '^' marker.</span>

Switch&gt; enable
Switch# show running-config
Building configuration...</pre>
<p>Caret us pehle word ki taraf point karta hai jise IOS ne accept nahi kiya. Yahan woh <code>running-config</code> ke neeche hai: <code>show</code> command user EXEC mein hai, lekin woh option nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>R1#</code> par <code>exit</code> type karna aur sochna ki session kyun band ho gaya. Config mode mein bina <code>do</code> ke <code>ping</code> ya <code>show</code> try karna (chapter 9). Yeh bhool jaana ki aap abhi bhi kisi interface ke andar ho aur command galat interface par laga dena. Hamesha prompt par nazar daalo.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>end</code> aur Ctrl-Z dono kisi bhi config mode se privileged EXEC par le aate hain; <code>exit</code> sirf ek level upar jaata hai. <code>&gt;</code> se <code>#</code> jaane ka ek hi tareeka hai <code>enable</code>. Configuration commands <code>#</code> par bina <code>configure terminal</code> ke type nahi ho sakti. <code>configure terminal</code> khud ek privileged EXEC command hai.</p></div>

<div class="scn"><h4>Woh interface jise galat description mila</h4><p>Ek engineer core switch par ports label kar raha tha. Usne <code>interface GigabitEthernet1/0/10</code> mein enter kiya, description set kiya, phir agle kaam ke liye <code>ip address</code> type kar diya bina dhyan diye ki woh abhi bhi Gi1/0/10 sub-mode mein hai. Address galat port par lag gaya aur ek server VLAN down ho gaya. <code>show running-config interface GigabitEthernet1/0/10</code> ne galti dikhayi, <code>no ip address</code> ne use hataya, aur change sahi interface par dobara kiya gaya.</p><p><b>Seekh:</b> prompt mode batata hai lekin interface nahi. Har block of changes se pehle interface mein explicitly dobara enter karo, aur <code>show running-config interface</code> se verify karo.</p></div>

<div class="iv"><p class="q">"Mujhe IOS command modes samjhao."</p><p>Strong answer: basic monitoring ke liye user EXEC (<code>&gt;</code>); <code>enable</code> se privileged EXEC (<code>#</code>) jahan saare show, debug, copy aur reload hain; <code>configure terminal</code> se global config jahan device-wide settings hain; wahan se interface, line, router aur VLAN jaise sub-modes. <code>exit</code> ek level upar jaata hai, <code>end</code> ya Ctrl-Z privileged EXEC par le aata hai. Yeh bhi bolo ki configuration changes running-config mein turant lagu hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User EXEC <code>&gt;</code> → <code>enable</code> → privileged EXEC <code>#</code> → <code>configure terminal</code> → <code>(config)#</code>.</li>
<li><code>(config-if)#</code> aur <code>(config-line)#</code> jaise sub-modes ek interface ya ek line configure karte hain.</li>
<li><code>exit</code> ek level upar jaata hai; <code>end</code> ya Ctrl-Z seedha <code>#</code> par le aata hai.</li>
<li>Configuration changes running-config mein turant lagu hote hain.</li>
<li>"% Invalid input" ka matlab bahut baar hota hai sahi command galat mode mein.</li>
</ul></div>
`}};export{e as default};