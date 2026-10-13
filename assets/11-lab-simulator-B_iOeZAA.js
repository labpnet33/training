var e={id:`simulator`,h:{en:`Using the lab simulator, and a first look at the Cisco CLI`,hi:`Lab simulator use karna, aur Cisco CLI par pehli nazar`},body:{en:`
<p>Pilots do not learn to fly on a real plane full of passengers. They spend hours in a flight simulator, where they can make mistakes, crash, press reset and try again. This academy's lab simulator is your flight simulator for networks. Real routers and switches cost lakhs of rupees and a mistake on a live network can stop a business; in the simulator you can configure, break and fix as often as you like, straight from your browser, with nothing to install.</p>

<h3>Where things are: the module page</h3>
<p>Every module page has the same tabs you met in chapter 1: <b>Lesson</b> (these chapters), <b>Labs</b>, <b>Quiz</b>, <b>Scenarios</b> and <b>Interview</b>. Open a lab from the Labs tab. The next module on your track (Cisco IOS from zero for CCNA, or the OSI and protocols module for Network+) is where you start using labs for real, so this chapter prepares you for that first session.</p>

<h3>The lab screen</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Layout of a lab screen">
<rect x="10" y="10" width="620" height="220" rx="10" fill="#e2e8f0"/>
<rect x="24" y="24" width="190" height="192" rx="8" fill="#fde68a"/><text x="119" y="46" text-anchor="middle" class="svg-ink" font-size="13">Tasks</text>
<text x="119" y="72" text-anchor="middle" class="svg-muted" font-size="12">1. Address PC1</text><text x="119" y="92" text-anchor="middle" class="svg-muted" font-size="12">2. Ping the gateway</text><text x="119" y="112" text-anchor="middle" class="svg-muted" font-size="12">each checked live</text>
<rect x="40" y="140" width="70" height="26" rx="6" fill="#fed7aa"/><text x="75" y="158" text-anchor="middle" class="svg-ink" font-size="12">Hint</text>
<rect x="124" y="140" width="76" height="26" rx="6" fill="#fed7aa"/><text x="162" y="158" text-anchor="middle" class="svg-ink" font-size="12">Solution</text>
<rect x="40" y="176" width="160" height="26" rx="6" fill="#fed7aa"/><text x="120" y="194" text-anchor="middle" class="svg-ink" font-size="12">Reset / Capture</text>
<rect x="228" y="24" width="388" height="84" rx="8" fill="#bae6fd"/><text x="422" y="46" text-anchor="middle" class="svg-ink" font-size="13">Topology map</text>
<text x="422" y="70" text-anchor="middle" class="svg-muted" font-size="12">PC1 --- SW1 --- R1</text><text x="422" y="92" text-anchor="middle" class="svg-muted" font-size="12">click a device to open its console</text>
<rect x="228" y="118" width="388" height="98" rx="8" fill="#334155"/><text x="422" y="142" text-anchor="middle" fill="#e2e8f0" font-size="13">Console (terminal)</text>
<text x="244" y="168" fill="#bbf7d0" font-size="12">R1#</text><text x="244" y="190" fill="#bbf7d0" font-size="12">PC1&gt; ping 192.168.10.1</text>
</svg><p class="cap">A simplified view. Tasks on one side, the topology and a console for the selected device on the other.</p></div>
<dl class="terms">
<dt>Topology map</dt><dd>The drawing of the lab: PCs, switches, routers and the cables between them. Links show their state (up, down, or blocked). Click a device to switch the console to it.</dd>
<dt>Console</dt><dd>The terminal of the selected device. You type exactly the commands you would type on real equipment, and the simulator answers with realistic output.</dd>
<dt>Tasks</dt><dd>What the lab asks you to achieve. Each task is <b>checked live</b> against the running devices, so it passes only when the network really works, not when you type a particular word. When all tasks pass, the lab is complete.</dd>
<dt>Hint and Solution</dt><dd>Stuck? Open a hint first; it points you in the right direction. Open the solution only after a genuine attempt, then close it and redo the task from memory.</dd>
<dt>Reset</dt><dd>Puts every device back to the starting state (click twice to confirm). Break things freely; you can always reset.</dd>
<dt>Capture packets</dt><dd>Shows the packets on the links (ARP, ICMP, routing hellos) while you work, like a built-in packet analyser. It turns chapter 7 into something you can watch.</dd>
</dl>
<p>After many labs you will also see a short set of exam-style questions to test yourself. There is also a <b>Build your own lab</b> sandbox where you add devices, cable them (click the first device, then the second) and double-click a device to open its console.</p>

<h3>The simulated PC</h3>
<p>PCs in the simulator use a small, fast command shell modelled on the virtual PCs found in popular network emulators, rather than full Windows. Type <code>?</code> to list its commands.</p>
<pre class="code"><span class="c">! give PC1 a static address, mask (/24) and gateway</span>
ip 192.168.10.10/24 192.168.10.1
<span class="c">! or ask a DHCP server instead</span>
ip dhcp
<span class="c">! check the settings, then test</span>
show ip
ping 192.168.10.1
trace 203.0.113.80
arp</pre>
<pre class="out">PC1&gt; ip 192.168.10.10/24 192.168.10.1
Checking for duplicate address...
PC1 : 192.168.10.10 255.255.255.0 gateway 192.168.10.1

PC1&gt; show ip
NAME        : PC1[1]
<span class="hl">IP/MASK     : 192.168.10.10/24</span>
<span class="hl">GATEWAY     : 192.168.10.1</span>
DNS         :
MAC         : 00:50:79:66:68:00
MTU         : 1500

PC1&gt; ping 192.168.10.1
<span class="hl">84 bytes from 192.168.10.1 icmp_seq=1 ttl=255 time=0.500 ms</span>
84 bytes from 192.168.10.1 icmp_seq=2 ttl=255 time=0.600 ms
84 bytes from 192.168.10.1 icmp_seq=3 ttl=255 time=0.700 ms
84 bytes from 192.168.10.1 icmp_seq=4 ttl=255 time=0.800 ms
84 bytes from 192.168.10.1 icmp_seq=5 ttl=255 time=0.900 ms</pre>
<p>A failed ping shows lines such as <code>192.168.10.1 icmp_seq=1 timeout</code>. With DHCP, success looks like <code>DDORA IP 192.168.10.11/24 GW 192.168.10.1</code>: the letters are the Discover, Offer, Request and Acknowledge steps from chapter 6. In labs that include a DNS server, <code>nslookup</code> and pinging by name also work.</p>

<h3>A first look at the Cisco CLI</h3>
<p>Switches and routers in the CCNA labs use the Cisco IOS command line. It has <b>modes</b>, like rooms in a building, and the prompt tells you which room you are in:</p>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>How to enter</th><th>What you can do</th></tr>
<tr><td>User EXEC</td><td><code>R1&gt;</code></td><td>You start here</td><td>A few basic show commands</td></tr>
<tr><td>Privileged EXEC</td><td><code>R1#</code></td><td><code>enable</code></td><td>All show commands, save, reload</td></tr>
<tr><td>Global configuration</td><td><code>R1(config)#</code></td><td><code>configure terminal</code></td><td>Change settings for the whole device</td></tr>
<tr><td>Interface configuration</td><td><code>R1(config-if)#</code></td><td><code>interface gigabitethernet0/0</code></td><td>Change one port</td></tr>
</table>
<p><code>exit</code> goes back one level; <code>end</code> jumps straight to privileged EXEC. Type <code>?</code> anywhere for help, and press Tab to complete a command. Here is a taste of what you will do in the next CCNA module:</p>
<pre class="out">Router&gt; enable
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# hostname R1
R1(config)# interface gigabitethernet0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down
R1# copy running-config startup-config
Destination filename [startup-config]?
Building configuration...
[OK]</pre>
<p>Do not worry about memorising this yet. Notice only the pattern: move into the right mode, change something, verify with a <code>show</code> command, and save.</p>

<div class="eg"><p><b>Worked example: your first lab routine.</b> 1) Read all the tasks before typing. 2) Click each device on the map and look around with <code>show</code> commands (or <code>show ip</code> on PCs). 3) Do one task at a time and verify it immediately with <code>ping</code> or a <code>show</code> command. 4) If a task does not pass, re-read it and use a hint. 5) When the lab is complete, break something on purpose (shut an interface, change a gateway) and watch what fails. That last step teaches troubleshooting better than anything else.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing configuration commands in the wrong mode. <code>ip address</code> fails at <code>R1#</code> with "Invalid input detected" because it belongs in interface configuration mode. Always read the prompt before you type.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the mode order and prompts: <code>&gt;</code> user EXEC, <code>#</code> privileged EXEC, <code>(config)#</code> global, <code>(config-if)#</code> interface. <code>enable</code> moves from user to privileged; <code>configure terminal</code> from privileged to global. Changes live in the running-config until you copy them to the startup-config.</p></div>

<div class="scn"><h4>"The lab is broken, my task will not pass"</h4><p>A learner wrote to support: every command was accepted, but task 2 ("PC1 can ping R1") would not pass. The support engineer looked at the attempt: PC1 had <code>ip 192.168.10.10/24 192.168.1.1</code>, a gateway from a different network, which the PC rejected, so the learner re-entered it without a gateway. The router's interface was also still administratively down because <code>no shutdown</code> had been skipped. The live check was right: the ping really failed. Fixing both made the task pass instantly.</p><p><b>Lesson:</b> live checks test the network, not your typing. When a task does not pass, verify with ping and show commands, exactly as on the job.</p></div>

<div class="iv"><p class="q">"How do you practise networking without real equipment?"</p><p>Strong answer: use a simulator or emulator to build topologies, configure devices from the CLI and, most importantly, break and fix them. Explain your routine: read the requirement, configure step by step, verify each step with ping and show commands, capture packets to see what really happens, then introduce faults and troubleshoot. Mention that you document what you learn. Interviewers look for hands-on habits, not just certificates.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A lab screen has a topology map, a console per device, and tasks checked live; plus hint, solution, reset and packet capture.</li>
<li>Simulated PCs: <code>ip A.B.C.D/M GW</code>, <code>ip dhcp</code>, <code>show ip</code>, <code>ping</code>, <code>trace</code>, <code>arp</code>, <code>?</code>.</li>
<li>Cisco IOS modes: <code>&gt;</code> user, <code>#</code> privileged, <code>(config)#</code> global, <code>(config-if)#</code> interface.</li>
<li>Pattern for every change: right mode, configure, verify with show/ping, save.</li>
<li>Use hints before solutions, and break the lab on purpose once it works.</li>
</ul></div>
`,hi:`
<p>Pilots passengers se bhare asli plane par udna nahi seekhte. Woh flight simulator mein ghanton bitaate hain, jahan galtiyaan kar sakte hain, crash kar sakte hain, reset daba kar dobara koshish kar sakte hain. Is academy ka lab simulator networks ke liye aapka flight simulator hai. Asli routers aur switches lakhon rupaye ke hote hain aur live network par ek galti business rok sakti hai; simulator mein aap jitni baar chaho configure, break aur fix kar sakte ho, seedhe browser se, bina kuch install kiye.</p>

<h3>Cheezein kahan hain: module page</h3>
<p>Har module page par wahi tabs hain jo aapne chapter 1 mein dekhe: <b>Lesson</b> (yeh chapters), <b>Labs</b>, <b>Quiz</b>, <b>Scenarios</b> aur <b>Interview</b>. Labs tab se lab kholo. Aapke track ka agla module (CCNA ke liye Cisco IOS from zero, ya Network+ ke liye OSI aur protocols module) wahan hai jahan aap sach mein labs use karna shuru karte ho, isliye yeh chapter aapko us pehle session ke liye taiyaar karta hai.</p>

<h3>Lab screen</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Lab screen ka layout">
<rect x="10" y="10" width="620" height="220" rx="10" fill="#e2e8f0"/>
<rect x="24" y="24" width="190" height="192" rx="8" fill="#fde68a"/><text x="119" y="46" text-anchor="middle" class="svg-ink" font-size="13">Tasks</text>
<text x="119" y="72" text-anchor="middle" class="svg-muted" font-size="12">1. PC1 ko address do</text><text x="119" y="92" text-anchor="middle" class="svg-muted" font-size="12">2. Gateway ko ping karo</text><text x="119" y="112" text-anchor="middle" class="svg-muted" font-size="12">har ek live check</text>
<rect x="40" y="140" width="70" height="26" rx="6" fill="#fed7aa"/><text x="75" y="158" text-anchor="middle" class="svg-ink" font-size="12">Hint</text>
<rect x="124" y="140" width="76" height="26" rx="6" fill="#fed7aa"/><text x="162" y="158" text-anchor="middle" class="svg-ink" font-size="12">Solution</text>
<rect x="40" y="176" width="160" height="26" rx="6" fill="#fed7aa"/><text x="120" y="194" text-anchor="middle" class="svg-ink" font-size="12">Reset / Capture</text>
<rect x="228" y="24" width="388" height="84" rx="8" fill="#bae6fd"/><text x="422" y="46" text-anchor="middle" class="svg-ink" font-size="13">Topology map</text>
<text x="422" y="70" text-anchor="middle" class="svg-muted" font-size="12">PC1 --- SW1 --- R1</text><text x="422" y="92" text-anchor="middle" class="svg-muted" font-size="12">device click karo, uska console khulega</text>
<rect x="228" y="118" width="388" height="98" rx="8" fill="#334155"/><text x="422" y="142" text-anchor="middle" fill="#e2e8f0" font-size="13">Console (terminal)</text>
<text x="244" y="168" fill="#bbf7d0" font-size="12">R1#</text><text x="244" y="190" fill="#bbf7d0" font-size="12">PC1&gt; ping 192.168.10.1</text>
</svg><p class="cap">Simplified view. Ek taraf tasks, dusri taraf topology aur chune hue device ka console.</p></div>
<dl class="terms">
<dt>Topology map</dt><dd>Lab ki drawing: PCs, switches, routers aur unke beech ki cables. Links apni state dikhate hain (up, down, ya blocked). Console ko kisi device par switch karne ke liye us device ko click karo.</dd>
<dt>Console</dt><dd>Chune hue device ka terminal. Aap exactly wahi commands type karte ho jo asli equipment par karte, aur simulator realistic output ke saath jawab deta hai.</dd>
<dt>Tasks</dt><dd>Lab aapse kya karwana chahta hai. Har task chal rahe devices ke against <b>live check</b> hota hai, isliye woh tabhi pass hota hai jab network sach mein kaam kare, na ki jab aap koi khaas word type karo. Jab saare tasks pass ho jaate hain, lab complete ho jaata hai.</dd>
<dt>Hint aur Solution</dt><dd>Atak gaye? Pehle hint kholo; woh sahi disha dikhata hai. Solution sirf sachchi koshish ke baad kholo, phir use band karke task yaad se dobara karo.</dd>
<dt>Reset</dt><dd>Har device ko starting state mein wapas le aata hai (confirm karne ke liye do baar click). Befikr hokar cheezein todo; aap hamesha reset kar sakte ho.</dd>
<dt>Capture packets</dt><dd>Aap kaam karte ho tab links par packets dikhata hai (ARP, ICMP, routing hellos), built-in packet analyser ki tarah. Yeh chapter 7 ko aisi cheez bana deta hai jo aap dekh sakte ho.</dd>
</dl>
<p>Bahut saare labs ke baad khud ko test karne ke liye exam-style questions ka ek chhota set bhi milega. Ek <b>Build your own lab</b> sandbox bhi hai jahan aap devices add karte ho, unhe cable karte ho (pehle device ko click karo, phir dusre ko) aur console kholne ke liye device ko double-click karte ho.</p>

<h3>Simulated PC</h3>
<p>Simulator ke PCs poore Windows ki jagah ek chhota, fast command shell use karte hain jo popular network emulators ke virtual PCs par modelled hai. Uske commands ki list ke liye <code>?</code> type karo.</p>
<pre class="code"><span class="c">! PC1 ko static address, mask (/24) aur gateway do</span>
ip 192.168.10.10/24 192.168.10.1
<span class="c">! ya iske bajaye DHCP server se maango</span>
ip dhcp
<span class="c">! settings check karo, phir test karo</span>
show ip
ping 192.168.10.1
trace 203.0.113.80
arp</pre>
<pre class="out">PC1&gt; ip 192.168.10.10/24 192.168.10.1
Checking for duplicate address...
PC1 : 192.168.10.10 255.255.255.0 gateway 192.168.10.1

PC1&gt; show ip
NAME        : PC1[1]
<span class="hl">IP/MASK     : 192.168.10.10/24</span>
<span class="hl">GATEWAY     : 192.168.10.1</span>
DNS         :
MAC         : 00:50:79:66:68:00
MTU         : 1500

PC1&gt; ping 192.168.10.1
<span class="hl">84 bytes from 192.168.10.1 icmp_seq=1 ttl=255 time=0.500 ms</span>
84 bytes from 192.168.10.1 icmp_seq=2 ttl=255 time=0.600 ms
84 bytes from 192.168.10.1 icmp_seq=3 ttl=255 time=0.700 ms
84 bytes from 192.168.10.1 icmp_seq=4 ttl=255 time=0.800 ms
84 bytes from 192.168.10.1 icmp_seq=5 ttl=255 time=0.900 ms</pre>
<p>Fail hua ping <code>192.168.10.1 icmp_seq=1 timeout</code> jaisi lines dikhata hai. DHCP ke saath success aisa dikhta hai: <code>DDORA IP 192.168.10.11/24 GW 192.168.10.1</code>: yeh letters chapter 6 ke Discover, Offer, Request aur Acknowledge steps hain. Jin labs mein DNS server hai, wahan <code>nslookup</code> aur naam se ping bhi chalte hain.</p>

<h3>Cisco CLI par pehli nazar</h3>
<p>CCNA labs ke switches aur routers Cisco IOS command line use karte hain. Isme <b>modes</b> hote hain, building ke kamron ki tarah, aur prompt batata hai ki aap kaunse kamre mein ho:</p>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Kaise enter karein</th><th>Kya kar sakte ho</th></tr>
<tr><td>User EXEC</td><td><code>R1&gt;</code></td><td>Aap yahin se shuru karte ho</td><td>Kuch basic show commands</td></tr>
<tr><td>Privileged EXEC</td><td><code>R1#</code></td><td><code>enable</code></td><td>Saare show commands, save, reload</td></tr>
<tr><td>Global configuration</td><td><code>R1(config)#</code></td><td><code>configure terminal</code></td><td>Poore device ki settings badlo</td></tr>
<tr><td>Interface configuration</td><td><code>R1(config-if)#</code></td><td><code>interface gigabitethernet0/0</code></td><td>Ek port badlo</td></tr>
</table>
<p><code>exit</code> ek level peeche jaata hai; <code>end</code> seedhe privileged EXEC par kood jaata hai. Help ke liye kahin bhi <code>?</code> type karo, aur command complete karne ke liye Tab dabao. Yeh raha agle CCNA module mein aap jo karoge uska ek swaad:</p>
<pre class="out">Router&gt; enable
Router# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
Router(config)# hostname R1
R1(config)# interface gigabitethernet0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down
R1# copy running-config startup-config
Destination filename [startup-config]?
Building configuration...
[OK]</pre>
<p>Abhi ise yaad karne ki chinta mat karo. Sirf pattern dekho: sahi mode mein jao, kuch badlo, <code>show</code> command se verify karo, aur save karo.</p>

<div class="eg"><p><b>Worked example: aapka pehla lab routine.</b> 1) Type karne se pehle saare tasks padho. 2) Map par har device ko click karo aur <code>show</code> commands (ya PCs par <code>show ip</code>) se idhar-udhar dekho. 3) Ek baar mein ek task karo aur use turant <code>ping</code> ya <code>show</code> command se verify karo. 4) Agar task pass na ho, use dobara padho aur hint use karo. 5) Jab lab complete ho jaaye, jaan-boojh kar kuch todo (interface shut karo, gateway badlo) aur dekho kya fail hota hai. Yeh aakhri step troubleshooting kisi bhi aur cheez se behtar sikhata hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Galat mode mein configuration commands type karna. <code>R1#</code> par <code>ip address</code> "Invalid input detected" ke saath fail hota hai kyunki woh interface configuration mode ka command hai. Type karne se pehle hamesha prompt padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Mode order aur prompts jaano: <code>&gt;</code> user EXEC, <code>#</code> privileged EXEC, <code>(config)#</code> global, <code>(config-if)#</code> interface. <code>enable</code> user se privileged mein le jaata hai; <code>configure terminal</code> privileged se global mein. Changes running-config mein rehte hain jab tak aap unhe startup-config mein copy na karo.</p></div>

<div class="scn"><h4>"Lab kharab hai, mera task pass nahi ho raha"</h4><p>Ek learner ne support ko likha: har command accept hua, lekin task 2 ("PC1 R1 ko ping kar sakta hai") pass nahi ho raha tha. Support engineer ne attempt dekha: PC1 par <code>ip 192.168.10.10/24 192.168.1.1</code> tha, dusre network ka gateway, jise PC ne reject kiya, to learner ne use bina gateway ke dobara daala. Router ka interface bhi abhi tak administratively down tha kyunki <code>no shutdown</code> chhoot gaya tha. Live check sahi tha: ping sach mein fail ho raha tha. Dono theek karne par task turant pass ho gaya.</p><p><b>Seekh:</b> live checks network ko test karte hain, aapki typing ko nahi. Jab task pass na ho, ping aur show commands se verify karo, bilkul job ki tarah.</p></div>

<div class="iv"><p class="q">"Bina asli equipment ke aap networking kaise practise karte ho?"</p><p>Strong answer: topologies banane, CLI se devices configure karne aur sabse zaroori, unhe todne aur theek karne ke liye simulator ya emulator use karo. Apna routine samjhao: requirement padho, step by step configure karo, har step ko ping aur show commands se verify karo, asal mein kya hota hai dekhne ke liye packets capture karo, phir faults daal kar troubleshoot karo. Mention karo ki aap jo seekhte ho use document karte ho. Interviewers sirf certificates nahi, hands-on habits dekhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab screen mein topology map, har device ka console, aur live check hone wale tasks hote hain; saath mein hint, solution, reset aur packet capture.</li>
<li>Simulated PCs: <code>ip A.B.C.D/M GW</code>, <code>ip dhcp</code>, <code>show ip</code>, <code>ping</code>, <code>trace</code>, <code>arp</code>, <code>?</code>.</li>
<li>Cisco IOS modes: <code>&gt;</code> user, <code>#</code> privileged, <code>(config)#</code> global, <code>(config-if)#</code> interface.</li>
<li>Har change ka pattern: sahi mode, configure, show/ping se verify, save.</li>
<li>Solutions se pehle hints use karo, aur lab chalne lage to use jaan-boojh kar todo.</li>
</ul></div>
`}};export{e as default};