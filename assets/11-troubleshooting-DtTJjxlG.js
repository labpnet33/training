var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: "I cannot ping my first router"`,hi:`Troubleshooting workflow: "Main apne pehle router ko ping nahi kar pa raha"`},body:{en:`
<p>When a car will not start, a good mechanic does not replace the engine first. He checks, in order: is there fuel, is the battery charged, does the starter turn, is there a spark. Each check is quick and rules out a whole class of problems. Network troubleshooting works the same way. For the classic first-day ticket, "PC1 cannot ping R1", a fixed order of checks finds the fault in minutes, every time.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="10" width="200" height="46" rx="8" fill="#e2e8f0"/><text x="110" y="30" text-anchor="middle" class="svg-ink" font-size="13">1. Mode and device</text><text x="110" y="47" text-anchor="middle" class="svg-muted" font-size="12">right prompt? right box?</text>
<rect x="220" y="10" width="200" height="46" rx="8" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">2. Interface state</text><text x="320" y="47" text-anchor="middle" class="svg-muted" font-size="12">sh ip int br, both ends</text>
<rect x="430" y="10" width="200" height="46" rx="8" fill="#fde68a"/><text x="530" y="30" text-anchor="middle" class="svg-ink" font-size="13">3. Addressing</text><text x="530" y="47" text-anchor="middle" class="svg-muted" font-size="12">same subnet, right mask</text>
<rect x="10" y="100" width="200" height="46" rx="8" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">4. Host settings</text><text x="110" y="137" text-anchor="middle" class="svg-muted" font-size="12">PC IP, mask, gateway</text>
<rect x="220" y="100" width="200" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">5. Ping hop by hop</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">nearest first, check ARP</text>
<rect x="430" y="100" width="200" height="46" rx="8" fill="#bbf7d0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">6. Management</text><text x="530" y="137" text-anchor="middle" class="svg-muted" font-size="12">SVI, gateway, VTY login</text>
<rect x="220" y="190" width="200" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">7. Save and document</text><text x="320" y="227" text-anchor="middle" class="svg-muted" font-size="12">copy run start, ticket</text>
<line x1="210" y1="33" x2="220" y2="33" stroke="#64748b" stroke-width="2"/><line x1="420" y1="33" x2="430" y2="33" stroke="#64748b" stroke-width="2"/><line x1="530" y1="56" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="210" y1="123" x2="220" y2="123" stroke="#64748b" stroke-width="2"/><line x1="420" y1="123" x2="430" y2="123" stroke="#64748b" stroke-width="2"/><line x1="530" y1="146" x2="320" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Bottom-up and nearest-first: each step is fast and rules out a whole class of faults.</p></div>

<h3>Step 1: the right mode on the right device</h3>
<p>Read the prompt. <code>% Invalid input</code> on <code>show running-config</code> means you are at <code>&gt;</code>, not <code>#</code>. Check the hostname in the prompt matches the device in the ticket; in a rack of identical switches it is easy to be on the wrong console.</p>

<h3>Step 2: interface state on both ends</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual administratively down down</span></pre>
<p>Administratively down: somebody forgot <code>no shutdown</code> (the router default). down/down: look at the cable and the switch port at the other end (<code>show interfaces status</code> on SW1). Fix the lowest broken layer first; nothing above it can work.</p>

<h3>Step 3: addressing and masks</h3>
<p>Both ends must be in the same subnet with the same mask. <code>show running-config interface GigabitEthernet0/0</code> on R1 and <code>show ip interface brief</code> on SW1 give you the numbers. Typical faults: 192.168.10.1 <b>255.255.255.128</b> on R1 while PC1 is .200 (outside the /25), a swapped digit (192.168.1.10), or a <b>duplicate address</b>, which IOS reports in the log:</p>
<pre class="out">%IP-4-DUPADDR: Duplicate address 192.168.10.1 on GigabitEthernet0/0, sourced by 5254.00ab.cd01</pre>

<h3>Step 4: the host</h3>
<p>On the PC check address, mask and default gateway. A PC with the right address but gateway 192.168.10.254 can still ping R1 (same subnet) but nothing beyond it, a very common half-working symptom. A PC with the wrong mask may think R1 is on another network and send the ping to a gateway that does not exist.</p>

<h3>Step 5: ping hop by hop, nearest first</h3>
<pre class="out">PC1&gt; ping 192.168.10.2
<span class="hl">192.168.10.2 icmp_seq=1 timeout</span>
192.168.10.2 icmp_seq=2 timeout

R1# ping 192.168.10.2
Sending 5, 100-byte ICMP Echos to 192.168.10.2, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)</pre>
<p>Ping the nearest thing first: PC1 to its gateway R1, then to SW1's management address. If the gateway answers but SW1 does not, the fault is on SW1 (next step). Check <code>show arp</code> on R1: an entry with <code>Incomplete</code> means the ARP request got no reply, so the target is down, shut or in another VLAN. The first <code>.</code> in <code>.!!!!</code> is normal ARP delay, not a fault.</p>

<h3>Step 6: switch management and remote login</h3>
<ul>
<li>SW1's <code>Vlan1</code> <code>administratively down</code>: add <code>no shutdown</code> under <code>interface vlan 1</code>.</li>
<li>SW1 answers pings from its own subnet but not from the NOC: <code>ip default-gateway</code> is missing or wrong.</li>
<li>Telnet says <code>Password required, but none set</code>: the VTY lines have <code>login</code> but no password.</li>
<li>Telnet works but <code>enable</code> says <code>% No password set</code>: remote users cannot reach privileged EXEC until an enable secret exists.</li>
<li>Telnet is refused outright: check <code>transport input</code> on the VTY lines, and that SSH-only lines are not being tested with Telnet.</li>
</ul>
<pre class="out">PC1&gt; telnet 192.168.10.1
Trying 192.168.10.1...
Connected to 192.168.10.1.
<span class="hl">Password required, but none set</span>
[Connection to 192.168.10.1 closed by foreign host]</pre>

<h3>Step 7: save, and write it down</h3>
<p>If the ticket says "it worked yesterday", check <code>show version</code> for uptime and reload reason, then compare the running and startup configurations: a reload with unsaved changes looks exactly like a mysterious outage. After fixing, <code>copy running-config startup-config</code> and note the root cause in the ticket.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "PC1 cannot ping R1 or SW1." <code>show ip interface brief</code> on R1: Gi0/0 administratively down. <code>no shutdown</code>: PC1 now pings R1. SW1 still silent. On SW1, Vlan1 is administratively down. <code>no shutdown</code>: PC1 pings SW1. From R1's other subnet, SW1 still does not answer: <code>ip default-gateway 192.168.10.1</code> fixes that. Three faults, three layers, fifteen minutes, then save on both devices.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jumping straight to the configuration before checking interface states. Changing several things at once, so you never learn which one fixed it. Testing from a far subnet before testing locally. Forgetting to save after the fix, so the problem returns at the next reload.</p></div>

<div class="exam"><p><b>Exam traps.</b> A host with a wrong default gateway can still ping hosts in its own subnet. Administratively down always means <code>shutdown</code>. <code>Password required, but none set</code> means VTY login with no password. <code>% No password set</code> on enable over VTY means no enable secret. Unsaved changes are lost at reload.</p></div>

<div class="scn"><h4>The printer that "broke the network"</h4><p>A small office reported that nobody could reach the router after a new network printer was installed. <code>show ip interface brief</code> on the router was up/up with the right address, but the log showed <code>%IP-4-DUPADDR: Duplicate address 192.168.10.1</code>. The printer had been given the gateway's address as its own static IP. Half the PCs had the printer's MAC in their ARP cache for 192.168.10.1. Re-addressing the printer and clearing ARP caches restored everything.</p><p><b>Lesson:</b> when the interface is up/up and the configuration is right, look at the logs and ARP. Addressing problems are often outside the router.</p></div>

<div class="iv"><p class="q">"A user says they cannot ping the default gateway. How do you troubleshoot?"</p><p>Strong answer: work bottom-up and nearest-first. Check the router interface with <code>show ip interface brief</code> (admin down, down/down, up/down), then the switch port. Verify IP and mask on both sides are in the same subnet and there is no duplicate IP (logs, ARP). Check the PC's IP, mask and gateway. Ping step by step and look at the ARP table. Change one thing at a time, verify after each, and save when fixed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: mode and device, interface state, addressing, host settings, hop-by-hop ping, management, save.</li>
<li>Always check both ends of a link with <code>show ip interface brief</code>.</li>
<li>Same subnet and same mask on both ends; watch for duplicate IPs in the log.</li>
<li>Switch management failures are usually a shut SVI or a missing <code>ip default-gateway</code>.</li>
<li>Change one thing at a time, verify, then save and document the root cause.</li>
</ul></div>
`,hi:`
<p>Jab car start nahi hoti, achha mechanic sabse pehle engine nahi badalta. Woh order mein check karta hai: kya petrol hai, kya battery charged hai, kya starter ghoomta hai, kya spark hai. Har check jaldi hota hai aur problems ki poori ek category ko rule out kar deta hai. Network troubleshooting bhi aise hi kaam karti hai. Pehle din ke classic ticket, "PC1 R1 ko ping nahi kar pa raha", ke liye checks ka ek fixed order har baar minutes mein fault dhoondh leta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="10" width="200" height="46" rx="8" fill="#e2e8f0"/><text x="110" y="30" text-anchor="middle" class="svg-ink" font-size="13">1. Mode aur device</text><text x="110" y="47" text-anchor="middle" class="svg-muted" font-size="12">sahi prompt? sahi box?</text>
<rect x="220" y="10" width="200" height="46" rx="8" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">2. Interface state</text><text x="320" y="47" text-anchor="middle" class="svg-muted" font-size="12">sh ip int br, dono ends</text>
<rect x="430" y="10" width="200" height="46" rx="8" fill="#fde68a"/><text x="530" y="30" text-anchor="middle" class="svg-ink" font-size="13">3. Addressing</text><text x="530" y="47" text-anchor="middle" class="svg-muted" font-size="12">same subnet, sahi mask</text>
<rect x="10" y="100" width="200" height="46" rx="8" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">4. Host settings</text><text x="110" y="137" text-anchor="middle" class="svg-muted" font-size="12">PC IP, mask, gateway</text>
<rect x="220" y="100" width="200" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">5. Hop by hop ping</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">pehle nazdeek, ARP check</text>
<rect x="430" y="100" width="200" height="46" rx="8" fill="#bbf7d0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">6. Management</text><text x="530" y="137" text-anchor="middle" class="svg-muted" font-size="12">SVI, gateway, VTY login</text>
<rect x="220" y="190" width="200" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">7. Save aur document</text><text x="320" y="227" text-anchor="middle" class="svg-muted" font-size="12">copy run start, ticket</text>
<line x1="210" y1="33" x2="220" y2="33" stroke="#64748b" stroke-width="2"/><line x1="420" y1="33" x2="430" y2="33" stroke="#64748b" stroke-width="2"/><line x1="530" y1="56" x2="110" y2="100" stroke="#64748b" stroke-width="2"/><line x1="210" y1="123" x2="220" y2="123" stroke="#64748b" stroke-width="2"/><line x1="420" y1="123" x2="430" y2="123" stroke="#64748b" stroke-width="2"/><line x1="530" y1="146" x2="320" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Neeche se upar aur pehle nazdeek: har step tez hai aur faults ki poori category rule out karta hai.</p></div>

<h3>Step 1: sahi device par sahi mode</h3>
<p>Prompt padho. <code>show running-config</code> par <code>% Invalid input</code> ka matlab aap <code>&gt;</code> par ho, <code>#</code> par nahi. Check karo ki prompt ka hostname ticket wale device se match karta hai; ek jaise switches ke rack mein galat console par hona bahut aasaan hai.</p>

<h3>Step 2: dono ends par interface state</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual administratively down down</span></pre>
<p>Administratively down: kisi ne <code>no shutdown</code> bhula diya (router default). down/down: cable aur dusre end ka switch port dekho (SW1 par <code>show interfaces status</code>). Sabse neeche wali tooti layer pehle fix karo; uske upar kuch bhi kaam nahi kar sakta.</p>

<h3>Step 3: addressing aur masks</h3>
<p>Dono ends same subnet mein same mask ke saath hone chahiye. R1 par <code>show running-config interface GigabitEthernet0/0</code> aur SW1 par <code>show ip interface brief</code> aapko numbers dete hain. Typical faults: R1 par 192.168.10.1 <b>255.255.255.128</b> jabki PC1 .200 hai (/25 ke bahar), ulta-pulta digit (192.168.1.10), ya <b>duplicate address</b>, jise IOS log mein report karta hai:</p>
<pre class="out">%IP-4-DUPADDR: Duplicate address 192.168.10.1 on GigabitEthernet0/0, sourced by 5254.00ab.cd01</pre>

<h3>Step 4: host</h3>
<p>PC par address, mask aur default gateway check karo. Jis PC ka address sahi hai lekin gateway 192.168.10.254 hai woh R1 ko ping kar sakta hai (same subnet) lekin uske aage kuch nahi, yeh bahut common aadha-chalta symptom hai. Galat mask wala PC soch sakta hai ki R1 kisi dusre network par hai aur ping aise gateway ko bhej sakta hai jo exist hi nahi karta.</p>

<h3>Step 5: hop by hop ping, pehle nazdeek</h3>
<pre class="out">PC1&gt; ping 192.168.10.2
<span class="hl">192.168.10.2 icmp_seq=1 timeout</span>
192.168.10.2 icmp_seq=2 timeout

R1# ping 192.168.10.2
Sending 5, 100-byte ICMP Echos to 192.168.10.2, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)</pre>
<p>Pehle sabse nazdeek cheez ko ping karo: PC1 se uske gateway R1 ko, phir SW1 ke management address ko. Agar gateway jawab deta hai lekin SW1 nahi, to fault SW1 par hai (agla step). R1 par <code>show arp</code> check karo: <code>Incomplete</code> wali entry ka matlab ARP request ka koi reply nahi aaya, yaani target down hai, shut hai ya dusre VLAN mein hai. <code>.!!!!</code> ka pehla <code>.</code> normal ARP delay hai, fault nahi.</p>

<h3>Step 6: switch management aur remote login</h3>
<ul>
<li>SW1 ka <code>Vlan1</code> <code>administratively down</code>: <code>interface vlan 1</code> ke andar <code>no shutdown</code> lagao.</li>
<li>SW1 apne subnet ke pings ka jawab deta hai lekin NOC se nahi: <code>ip default-gateway</code> missing ya galat hai.</li>
<li>Telnet bolta hai <code>Password required, but none set</code>: VTY lines par <code>login</code> hai lekin password nahi.</li>
<li>Telnet chalta hai lekin <code>enable</code> bolta hai <code>% No password set</code>: jab tak enable secret nahi hota, remote users privileged EXEC tak nahi pahunch sakte.</li>
<li>Telnet seedha refuse hota hai: VTY lines par <code>transport input</code> check karo, aur yeh ki SSH-only lines ko Telnet se test to nahi kar rahe.</li>
</ul>
<pre class="out">PC1&gt; telnet 192.168.10.1
Trying 192.168.10.1...
Connected to 192.168.10.1.
<span class="hl">Password required, but none set</span>
[Connection to 192.168.10.1 closed by foreign host]</pre>

<h3>Step 7: save karo, aur likh lo</h3>
<p>Agar ticket kehta hai "kal to chal raha tha", to uptime aur reload reason ke liye <code>show version</code> check karo, phir running aur startup configurations compare karo: unsaved changes ke saath reload bilkul ek rahasyamay outage jaisa dikhta hai. Fix karne ke baad <code>copy running-config startup-config</code> karo aur ticket mein root cause note karo.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "PC1 R1 ya SW1 ko ping nahi kar pa raha." R1 par <code>show ip interface brief</code>: Gi0/0 administratively down. <code>no shutdown</code>: ab PC1 R1 ko ping karta hai. SW1 abhi bhi chup. SW1 par Vlan1 administratively down hai. <code>no shutdown</code>: PC1 SW1 ko ping karta hai. R1 ke dusre subnet se SW1 abhi bhi jawab nahi deta: <code>ip default-gateway 192.168.10.1</code> ise theek karta hai. Teen faults, teen layers, pandrah minute, phir dono devices par save.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Interface states check kiye bina seedha configuration par kood jaana. Ek saath kai cheezein badalna, jisse kabhi pata hi nahi chalta ki kisne theek kiya. Local test karne se pehle door ke subnet se test karna. Fix ke baad save bhool jaana, jisse agle reload par problem wapas aa jaati hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Galat default gateway wala host apne subnet ke hosts ko abhi bhi ping kar sakta hai. Administratively down ka matlab hamesha <code>shutdown</code>. <code>Password required, but none set</code> ka matlab VTY login bina password. VTY par enable ke waqt <code>% No password set</code> ka matlab enable secret nahi hai. Unsaved changes reload par kho jaate hain.</p></div>

<div class="scn"><h4>Woh printer jisne "network tod diya"</h4><p>Ek chhote office ne report kiya ki naya network printer lagne ke baad koi router tak nahi pahunch pa raha. Router par <code>show ip interface brief</code> sahi address ke saath up/up tha, lekin log mein <code>%IP-4-DUPADDR: Duplicate address 192.168.10.1</code> tha. Printer ko gateway ka address hi uske static IP ke roop mein de diya gaya tha. Aadhe PCs ke ARP cache mein 192.168.10.1 ke liye printer ka MAC tha. Printer ko naya address dene aur ARP caches clear karne se sab wapas theek ho gaya.</p><p><b>Seekh:</b> jab interface up/up ho aur configuration sahi ho, to logs aur ARP dekho. Addressing problems aksar router ke bahar hoti hain.</p></div>

<div class="iv"><p class="q">"User kehta hai ki woh default gateway ko ping nahi kar pa raha. Aap kaise troubleshoot karoge?"</p><p>Strong answer: neeche se upar aur pehle nazdeek kaam karunga. <code>show ip interface brief</code> se router interface check (admin down, down/down, up/down), phir switch port. Verify karunga ki dono taraf IP aur mask same subnet mein hain aur koi duplicate IP nahi hai (logs, ARP). PC ka IP, mask aur gateway check. Step by step ping aur ARP table dekhna. Ek baar mein ek cheez badalna, har baar verify, aur fix hone par save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: mode aur device, interface state, addressing, host settings, hop-by-hop ping, management, save.</li>
<li>Link ke dono ends hamesha <code>show ip interface brief</code> se check karo.</li>
<li>Dono ends par same subnet aur same mask; log mein duplicate IPs par nazar rakho.</li>
<li>Switch management failures aksar shut SVI ya missing <code>ip default-gateway</code> hote hain.</li>
<li>Ek baar mein ek cheez badlo, verify karo, phir save karke root cause document karo.</li>
</ul></div>
`}};export{e as default};