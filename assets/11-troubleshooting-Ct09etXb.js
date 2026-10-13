var e={id:`troubleshoot`,h:{en:`Troubleshooting addressing faults: workflow and the INC-2031 ticket`,hi:`Addressing faults troubleshoot karna: workflow aur INC-2031 ticket`},body:{en:`
<p>Most "the network is down" tickets that reach a junior engineer are really one host with one wrong number. This chapter gives you a repeatable workflow, a symptom table you can use on any call, and a full walkthrough of the troubleshooting lab <b>Ticket: two users, two addressing faults</b>.</p>

<h3>An analogy: the doctor's vital signs</h3>
<p>A good doctor does not start with an MRI. They take pulse, temperature and blood pressure first, because those rule out most problems in two minutes. For addressing, the vital signs are the host's <b>address, mask and gateway</b>, compared with the router interface. Read them before you touch cables, switches or DNS.</p>

<h3>The addressing workflow</h3>
<ol>
<li><b>Read the host's own settings</b>: <code>ipconfig /all</code>, <code>ip addr</code> plus <code>ip route</code>, <code>ifconfig</code>, or <code>show ip</code> in the lab.</li>
<li><b>Classify the address</b>: APIPA (169.254)? Loopback? Public by mistake? Network or broadcast address of its subnet?</li>
<li><b>Compute the host's subnet</b> with the block size and compare it with the router's <b>C</b> route for that interface. Masks must match.</li>
<li><b>Check the gateway</b>: it must be inside the host's subnet and equal the router interface address.</li>
<li><b>Test outward in layers</b>: ping 127.0.0.1 (stack), own address, gateway, a remote host; use <code>tracert</code>/<code>traceroute</code> to see where it stops.</li>
<li><b>Look at the ARP cache</b> for surprises (below).</li>
<li><b>Fix one thing, re-test, document.</b></li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Most likely addressing cause</th></tr>
<tr><td>Host shows 169.254.x.x</td><td>DHCP not reached or pool exhausted (APIPA)</td></tr>
<tr><td>Local hosts work, every remote host fails</td><td>Default gateway wrong or missing</td></tr>
<tr><td>Some other subnets unreachable; remote IPs appear in the host's ARP cache</td><td>Mask too <b>big</b> (for example /16 instead of /26)</td></tr>
<tr><td>Some hosts on the same LAN unreachable, rest fine</td><td>Mask too <b>small</b> on one side</td></tr>
<tr><td>Intermittent drops, "address conflict" warnings</td><td>Duplicate IP address</td></tr>
<tr><td>Even 127.0.0.1 fails</td><td>Local TCP/IP stack or driver, not the network</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ping outward in layers">
<rect x="10" y="40" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="12">ping 127.0.0.1</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="11">stack</text>
<rect x="170" y="40" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="12">ping own IP</text><text x="240" y="76" text-anchor="middle" class="svg-muted" font-size="11">address bound</text>
<rect x="330" y="40" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="12">ping gateway</text><text x="400" y="76" text-anchor="middle" class="svg-muted" font-size="11">local subnet</text>
<rect x="490" y="40" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="12">ping remote</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="11">routing</text>
<line x1="150" y1="62" x2="170" y2="62" stroke="#64748b"/><line x1="310" y1="62" x2="330" y2="62" stroke="#64748b"/><line x1="470" y1="62" x2="490" y2="62" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">The first step that fails tells you where to look</text>
</svg><p class="cap">Test from the inside out. Each success rules out a layer.</p></div>

<h3>Lab walkthrough: INC-2031</h3>
<p>The ticket: "Sales cannot reach the HR system, and the IT laptop reaches nothing outside its own subnet." The router is correct (Sales .1/26, HR .65/26, IT .129/26). Start with the hosts.</p>
<p><b>Fault 1: PC-SALES.</b></p>
<pre class="out">PC-SALES&gt; show ip
NAME        : PC-SALES[1]
<span class="hl">IP/MASK     : 192.168.50.62/16</span>
GATEWAY     : 192.168.50.1</pre>
<p>The router's Sales interface is /26; the host has /16. With /16, PC-SALES believes everything in 192.168.x.x is local, including PC-HR at .126, so it ARPs for .126 directly instead of using its gateway. Answer task 1: the <b>mask</b>.</p>
<p>A twist you will meet in the lab and in real life: the ping may still succeed. Look at the ARP cache:</p>
<pre class="out">PC-SALES&gt; show arp
<span class="hl">52:54:0c:04:4b:01  192.168.50.126 expires in 120 seconds</span>
52:54:0c:04:4b:01  192.168.50.1 expires in 120 seconds</pre>
<p>PC-HR's IP is mapped to <b>R1's MAC</b>. R1 has <b>proxy ARP</b> enabled (the Cisco default) and answered on PC-HR's behalf, papering over the bad mask. Many networks disable it with <code>no ip proxy-arp</code> as hardening, and then this exact fault breaks the connection as the ticket describes. A remote IP sitting in a host's ARP cache with the router's MAC is the smoking gun for a mask that is too big. Fix it and verify:</p>
<pre class="code">PC-SALES&gt; ip 192.168.50.62/26 192.168.50.1
PC-SALES&gt; ping 192.168.50.126</pre>
<p><b>Fault 2: PC-IT.</b> Its gateway was set to 192.168.50.1. PC-IT lives in 192.168.50.128/26 (.129 – .190), so .1 is not even on its link. Run <code>show ip</code>: depending on how the bad setting was stored you will see either GATEWAY 192.168.50.1, or no usable address at all, because this lab shell (like Linux) refuses to save a gateway outside the host's own subnet and prints <code>Gateway is not in the same subnet</code>. Either way the answer is the <b>gateway</b>. Fix it with the IT interface address:</p>
<pre class="code">PC-IT&gt; ip 192.168.50.190/26 192.168.50.129</pre>
<pre class="out">PC-IT&gt; trace 192.168.50.62
trace to 192.168.50.62, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   192.168.50.129  0.500 ms  0.450 ms  0.480 ms</span>
 2   *192.168.50.62   0.800 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>The first hop is now R1's IT interface, and the trace completes at PC-SALES. Both faults are fixed from the hosts' own settings; nothing on R1 changed.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing the router because "the ping to another subnet fails", when the host is wrong; trusting a successful ping without checking the mask (proxy ARP can hide it); and fixing the mask but forgetting to re-enter the gateway on hosts where one command sets both.</p></div>

<div class="exam"><p><b>Exam trap.</b> "User can reach the local file server but not the internet" points to the <b>gateway</b>, not DNS; if names failed but IPs worked, it would be DNS. And 169.254.x.x is a DHCP symptom; do not pick "wrong gateway" for it.</p></div>

<div class="scn"><h4>The new VLAN full of APIPA</h4><p>After a new "Projects" VLAN went live, every laptop plugged into it showed 169.254.x.x. The engineer followed the workflow: addresses were APIPA, so DHCP was not answering. The DHCP server lived in another subnet, and the new VLAN's gateway interface had no DHCP relay (<code>ip helper-address</code>) configured, so the clients' broadcasts never left the VLAN. Adding the relay on the gateway interface and running <code>ipconfig /renew</code> gave every laptop a proper lease.</p><p><b>Lesson:</b> classify the address first. APIPA sends you straight to DHCP reachability, saving an hour of cable checks.</p></div>

<div class="iv"><p class="q">"A user can ping the printer on their floor but cannot reach anything else. How do you troubleshoot?"</p><p>Strong answer: local works, so the NIC, cable, switch port and address are basically fine. Check the host's default gateway with ipconfig or ip route: is it set, is it inside the host's subnet, does it match the router interface? Then ping the gateway, then a remote host, then trace. Mention that a wrong mask can cause similar partial failures, and that you would check the ARP cache for remote IPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read address, mask and gateway first; compare with the router's connected route.</li>
<li>Ping outward in layers: loopback, own IP, gateway, remote, then trace.</li>
<li>APIPA = DHCP problem; local-only = gateway; remote IPs in the ARP cache = mask too big.</li>
<li>Proxy ARP can hide a wrong mask; verify settings even when the ping works.</li>
<li>INC-2031: PC-SALES had /16 (fix to /26); PC-IT had gateway .1 (fix to .129).</li>
</ul></div>
`,hi:`
<p>Junior engineer tak pahunchne wale zyada tar "network down hai" tickets asal mein ek host par ek galat number hote hain. Yeh chapter aapko ek repeatable workflow, ek symptom table jo kisi bhi call par kaam aaye, aur troubleshooting lab <b>Ticket: two users, two addressing faults</b> ka poora walkthrough deta hai.</p>

<h3>Ek analogy: doctor ke vital signs</h3>
<p>Achha doctor MRI se shuru nahi karta. Woh pehle pulse, temperature aur blood pressure leta hai, kyunki yeh do minute mein zyada tar problems rule out kar dete hain. Addressing ke liye vital signs host ka <b>address, mask aur gateway</b> hain, router interface se milaaye hue. Cables, switches ya DNS chhoone se pehle inhe padho.</p>

<h3>Addressing workflow</h3>
<ol>
<li><b>Host ki apni settings padho</b>: <code>ipconfig /all</code>, <code>ip addr</code> plus <code>ip route</code>, <code>ifconfig</code>, ya lab mein <code>show ip</code>.</li>
<li><b>Address classify karo</b>: APIPA (169.254)? Loopback? Galti se public? Apne subnet ka network ya broadcast address?</li>
<li><b>Host ka subnet nikaalo</b> block size se aur use us interface ke router ke <b>C</b> route se milao. Masks match hone chahiye.</li>
<li><b>Gateway check karo</b>: woh host ke subnet ke andar hona chahiye aur router interface address ke barabar.</li>
<li><b>Layers mein bahar ki taraf test karo</b>: ping 127.0.0.1 (stack), apna address, gateway, ek remote host; <code>tracert</code>/<code>traceroute</code> se dekho kahan rukta hai.</li>
<li><b>ARP cache dekho</b> surprises ke liye (neeche).</li>
<li><b>Ek cheez theek karo, dobara test karo, document karo.</b></li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Sabse sambhavit addressing wajah</th></tr>
<tr><td>Host 169.254.x.x dikhata hai</td><td>DHCP tak nahi pahuncha ya pool khatam (APIPA)</td></tr>
<tr><td>Local hosts chalte hain, har remote host fail</td><td>Default gateway galat ya missing</td></tr>
<tr><td>Kuch doosre subnets unreachable; remote IPs host ke ARP cache mein dikhte hain</td><td>Mask bahut <b>bada</b> (jaise /26 ki jagah /16)</td></tr>
<tr><td>Same LAN ke kuch hosts unreachable, baaki theek</td><td>Ek taraf mask bahut <b>chhota</b></td></tr>
<tr><td>Beech beech mein drops, "address conflict" warnings</td><td>Duplicate IP address</td></tr>
<tr><td>127.0.0.1 bhi fail</td><td>Local TCP/IP stack ya driver, network nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layers mein bahar ki taraf ping">
<rect x="10" y="40" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="12">ping 127.0.0.1</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="11">stack</text>
<rect x="170" y="40" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="12">apna IP ping</text><text x="240" y="76" text-anchor="middle" class="svg-muted" font-size="11">address bound</text>
<rect x="330" y="40" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="12">gateway ping</text><text x="400" y="76" text-anchor="middle" class="svg-muted" font-size="11">local subnet</text>
<rect x="490" y="40" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="12">remote ping</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="11">routing</text>
<line x1="150" y1="62" x2="170" y2="62" stroke="#64748b"/><line x1="310" y1="62" x2="330" y2="62" stroke="#64748b"/><line x1="470" y1="62" x2="490" y2="62" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">Jo pehla step fail ho, wahi batata hai kahan dekhna hai</text>
</svg><p class="cap">Andar se bahar test karo. Har success ek layer rule out karta hai.</p></div>

<h3>Lab walkthrough: INC-2031</h3>
<p>Ticket: "Sales HR system tak nahi pahunch pa raha, aur IT laptop apne subnet ke bahar kuch nahi pahunch pa raha." Router sahi hai (Sales .1/26, HR .65/26, IT .129/26). Hosts se shuru karo.</p>
<p><b>Fault 1: PC-SALES.</b></p>
<pre class="out">PC-SALES&gt; show ip
NAME        : PC-SALES[1]
<span class="hl">IP/MASK     : 192.168.50.62/16</span>
GATEWAY     : 192.168.50.1</pre>
<p>Router ka Sales interface /26 hai; host /16 par hai. /16 ke saath PC-SALES maanta hai ki 192.168.x.x mein sab local hai, .126 wala PC-HR bhi, isliye woh gateway use karne ki jagah seedha .126 ke liye ARP karta hai. Task 1 ka answer: <b>mask</b>.</p>
<p>Ek twist jo aapko lab mein aur real life mein milega: ping phir bhi succeed ho sakta hai. ARP cache dekho:</p>
<pre class="out">PC-SALES&gt; show arp
<span class="hl">52:54:0c:04:4b:01  192.168.50.126 expires in 120 seconds</span>
52:54:0c:04:4b:01  192.168.50.1 expires in 120 seconds</pre>
<p>PC-HR ka IP <b>R1 ke MAC</b> se map hai. R1 par <b>proxy ARP</b> enabled hai (Cisco default) aur usne PC-HR ki taraf se jawab diya, galat mask ko dhak diya. Bahut saare networks hardening ke liye ise <code>no ip proxy-arp</code> se disable karte hain, aur tab yahi fault connection ko bilkul waise tod deta hai jaisa ticket kehta hai. Host ke ARP cache mein router ke MAC ke saath baitha remote IP bahut bade mask ka pakka saboot hai. Theek karo aur verify karo:</p>
<pre class="code">PC-SALES&gt; ip 192.168.50.62/26 192.168.50.1
PC-SALES&gt; ping 192.168.50.126</pre>
<p><b>Fault 2: PC-IT.</b> Iska gateway 192.168.50.1 set tha. PC-IT 192.168.50.128/26 (.129 – .190) mein rehta hai, to .1 uske link par hai hi nahi. <code>show ip</code> chalao: galat setting kaise store hui is par depend karta hai ki aapko GATEWAY 192.168.50.1 dikhega, ya koi usable address hi nahi, kyunki yeh lab shell (Linux ki tarah) host ke apne subnet ke bahar ka gateway save karne se mana karta hai aur <code>Gateway is not in the same subnet</code> print karta hai. Dono surat mein answer <b>gateway</b> hai. IT interface address se theek karo:</p>
<pre class="code">PC-IT&gt; ip 192.168.50.190/26 192.168.50.129</pre>
<pre class="out">PC-IT&gt; trace 192.168.50.62
trace to 192.168.50.62, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   192.168.50.129  0.500 ms  0.450 ms  0.480 ms</span>
 2   *192.168.50.62   0.800 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Pehla hop ab R1 ka IT interface hai, aur trace PC-SALES par poora hota hai. Dono faults hosts ki apni settings se theek hue; R1 par kuch nahi badla.</p>

<div class="warn"><p><b>Common galtiyan.</b> Router badal dena kyunki "doosre subnet ka ping fail hai", jabki host galat hai; mask check kiye bina successful ping par bharosa karna (proxy ARP use chhupa sakta hai); aur mask theek karke gateway dobara daalna bhool jaana un hosts par jahan ek command dono set karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "User local file server tak pahunchta hai lekin internet tak nahi" <b>gateway</b> ki taraf ishara karta hai, DNS ki taraf nahi; agar names fail hote aur IPs chalte, to DNS hota. Aur 169.254.x.x DHCP ka symptom hai; iske liye "wrong gateway" mat chuno.</p></div>

<div class="scn"><h4>APIPA se bhara naya VLAN</h4><p>Naya "Projects" VLAN live hone ke baad usmein lage har laptop par 169.254.x.x dikh raha tha. Engineer ne workflow follow kiya: addresses APIPA the, to DHCP jawab nahi de raha tha. DHCP server doosre subnet mein tha, aur naye VLAN ke gateway interface par DHCP relay (<code>ip helper-address</code>) configure nahi tha, isliye clients ke broadcasts VLAN se bahar gaye hi nahi. Gateway interface par relay jodne aur <code>ipconfig /renew</code> chalane se har laptop ko sahi lease mil gaya.</p><p><b>Seekh:</b> pehle address classify karo. APIPA aapko seedha DHCP reachability par bhejta hai, cable checks ka ek ghanta bachata hai.</p></div>

<div class="iv"><p class="q">"User apni floor ka printer ping kar sakta hai lekin aur kuch nahi pahunch pata. Kaise troubleshoot karoge?"</p><p>Strong answer: local chal raha hai, to NIC, cable, switch port aur address basically theek hain. ipconfig ya ip route se host ka default gateway check karo: set hai, host ke subnet ke andar hai, router interface se match karta hai? Phir gateway ping karo, phir remote host, phir trace. Batao ki galat mask bhi aise partial failures de sakta hai, aur aap ARP cache mein remote IPs check karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle address, mask aur gateway padho; router ke connected route se milao.</li>
<li>Layers mein bahar ping karo: loopback, apna IP, gateway, remote, phir trace.</li>
<li>APIPA = DHCP problem; sirf local = gateway; ARP cache mein remote IPs = mask bahut bada.</li>
<li>Proxy ARP galat mask chhupa sakta hai; ping chalne par bhi settings verify karo.</li>
<li>INC-2031: PC-SALES par /16 tha (/26 karo); PC-IT par gateway .1 tha (.129 karo).</li>
</ul></div>
`}};export{e as default};