var e={id:`cdp-show`,h:{en:`Reading CDP output and drawing the map`,hi:`CDP output padhna aur map banana`},body:{en:`
<p>A phone's call log shows two things for each call: who the other person was, and which of <i>your</i> SIM cards took the call. Mix those up and you ring the wrong number back. CDP output is the same. Every row has <b>your</b> port and the <b>neighbour's</b> port, and reading them the wrong way round is the single most common CDP mistake in exams and in real life.</p>

<h3>show cdp neighbors: the summary</h3>
<pre class="out">SW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">R1               Gig 0/0           157          R B S I   CISCO2911 Gig 0/0</span>
SW2              Gig 0/1           143              S I   WS-C3560C Gig 0/1

Total cdp entries displayed : 2</pre>
<dl class="terms">
<dt>Device ID</dt><dd>The neighbour's hostname (for some platforms a hostname plus a domain or serial number).</dd>
<dt>Local Intrfce</dt><dd><b>Your</b> port, on the device where you typed the command. R1 was heard on SW1's Gig 0/0.</dd>
<dt>Holdtme</dt><dd>Seconds left before the entry expires (counts down from 180).</dd>
<dt>Capability</dt><dd>What the neighbour can do, using the legend at the top: R router, S switch, I IGMP snooping, P phone, H host, and so on. A multilayer device shows several letters.</dd>
<dt>Platform</dt><dd>Hardware model, sometimes truncated in the summary.</dd>
<dt>Port ID</dt><dd>The <b>neighbour's</b> port that sent the advertisement: R1's Gig 0/0.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Local interface versus port ID">
<rect x="30" y="50" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="85" text-anchor="middle" class="svg-ink" font-size="14">SW1 (you)</text>
<rect x="450" y="50" width="160" height="60" rx="8" fill="#bae6fd"/><text x="530" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1 (neighbour)</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="3"/>
<text x="215" y="70" class="svg-accent" font-size="12">Gi0/0</text><text x="385" y="70" class="svg-accent" font-size="12">Gi0/0</text>
<text x="200" y="140" class="svg-ink" font-size="13">Local Intrfce</text><text x="400" y="140" class="svg-ink" font-size="13">Port ID</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">your end of the cable / the neighbour's end</text>
</svg><p class="cap">Local Intrfce is always the end of the cable on the device where you ran the command; Port ID is the far end.</p></div>

<h3>show cdp neighbors detail and show cdp entry</h3>
<p>The summary has no IP addresses and no software version. Add <code>detail</code> to get everything for every neighbour, or use <code>show cdp entry NAME</code> for one neighbour (<code>show cdp entry *</code> equals the detail view).</p>
<pre class="out">SW1# show cdp entry SW2
-------------------------
Device ID: SW2
Entry address(es):
  IP address: 10.50.0.12
Platform: cisco WS-C3560CX-12PC-S,  Capabilities: Switch IGMP
<span class="hl">Interface: GigabitEthernet0/1,  Port ID (outgoing port): GigabitEthernet0/1</span>
Holdtime : 131 sec

Version :
Cisco IOS Software, C3560CX Software (C3560CX-UNIVERSALK9-M), Version 15.2(7)E8, RELEASE SOFTWARE (fc1)

advertisement version: 2
Protocol Hello:  OUI=0x00000C, Protocol ID=0x0112; payload len=27, value=...
VTP Management Domain: ''
<span class="hl">Native VLAN: 1</span>
<span class="hl">Duplex: full</span>
Management address(es):
  IP address: 10.50.0.12</pre>
<p>Notice the wording on the Interface line: <b>Interface</b> is your local port and <b>Port ID (outgoing port)</b> is the neighbour's. Two useful filters exist: <code>show cdp entry SW2 protocol</code> prints only the addresses, and <code>show cdp entry SW2 version</code> prints only the software.</p>

<h3>Checking CDP itself</h3>
<pre class="out">SW1# show cdp interface gigabitEthernet 0/1
GigabitEthernet0/1 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds

SW1# show cdp traffic
CDP counters :
        Total packets output: 245, Input: 238
        Hdr syntax: 0, Chksum error: 0, Encaps failed: 0
        No memory: 0, Invalid packet: 0,
        CDP version 1 advertisements output: 0, Input: 0
        CDP version 2 advertisements output: 245, Input: 238</pre>
<p><code>show cdp interface</code> lists only interfaces where CDP is enabled, so a port missing from it has <code>no cdp enable</code>. <code>show cdp traffic</code> tells you whether frames are being sent and received at all.</p>

<h3>Drawing a topology you cannot see</h3>
<p>This is the classic real-world use. You are given SSH access to one device and asked for a diagram.</p>
<ol>
<li>Run <code>show cdp neighbors</code>. Draw your device and one line per row, labelled with Local Intrfce on your end and Port ID on the far end.</li>
<li>Run <code>show cdp neighbors detail</code> to collect each neighbour's management IP, model and version.</li>
<li>SSH to each neighbour using that IP and repeat. Stop when every device you reach only shows neighbours you have already drawn.</li>
<li>Ports that are up but show no neighbour are end hosts or non-CDP devices; confirm with the MAC address table.</li>
</ol>

<div class="eg"><p><b>Worked example (CDP lab).</b> On SW1 the summary gives two lines: SW1 Gi0/0 to R1 Gi0/0, and SW1 Gi0/1 to SW2 Gi0/1. The entry for SW2 gives 10.50.0.12. From there, SW2's table shows SW1 on Gi0/1 and R2 on local port Gi0/5, R2's port Gi0/0. The detail for R1 shows IP 10.50.0.1, which is the router you would use as SW1's default gateway. Ports Gi0/3 and Gi0/4 are up with no neighbour: PC1 and PC2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the neighbour's port number on your own switch. If the row says Local Intrfce Gig 0/5 and Port ID Gig 0/0, the description <code>TO-R2-INTERNET</code> goes on your Gi0/5. Always re-read the column header before touching an interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which command shows the IP address of a neighbouring router?" Not <code>show cdp neighbors</code>: the summary has no addresses. The answer is <code>show cdp neighbors detail</code> or <code>show cdp entry</code>. And <code>show cdp</code> alone shows only global timers and version.</p></div>

<div class="scn"><h4>The port that was upside down</h4><p>A junior engineer was asked to shut the port towards an old router being removed. <code>show cdp neighbors</code> on the access switch showed the router with Local Intrfce Gig 1/0/24 and Port ID Gig 0/1. He shut Gi1/0/1 on the switch, which was a production uplink, and a floor lost connectivity. The senior engineer restored the port and shut Gi1/0/24.</p><p><b>Lesson:</b> Local Intrfce is yours; Port ID belongs to the neighbour. Say it out loud before any change.</p></div>

<div class="iv"><p class="q">"You have SSH to one core switch and no diagram. How do you build the topology?"</p><p>Walk through the loop: <code>show cdp neighbors</code> (or LLDP in a multi-vendor site) for the links, <code>detail</code> for management IPs and models, SSH to each neighbour and repeat, and use the MAC table for ports with no neighbour. Mention recording both port IDs per link and checking that both ends agree.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local Intrfce = your port; Port ID = the neighbour's port.</li>
<li>The summary has no IPs; use <code>detail</code> or <code>show cdp entry</code> for addresses, version, native VLAN and duplex.</li>
<li><code>show cdp interface</code> and <code>show cdp traffic</code> check CDP itself.</li>
<li>Map a network hop by hop: neighbours, detail, SSH to the management IP, repeat.</li>
<li>Up ports with no neighbour are usually end hosts.</li>
</ul></div>
`,hi:`
<p>Phone ka call log har call ke liye do cheezein dikhata hai: doosra insaan kaun tha, aur <i>aapke</i> kaunse SIM ne call li. Inhe mix kar do to aap galat number par call back kar doge. CDP output bhi aisa hi hai. Har row mein <b>aapka</b> port aur <b>neighbour ka</b> port hota hai, aur inhe ulta padhna exams aur real life dono mein CDP ki sabse common galti hai.</p>

<h3>show cdp neighbors: summary</h3>
<pre class="out">SW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,
                  D - Remote, C - CVTA, M - Two-port Mac Relay

Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
<span class="hl">R1               Gig 0/0           157          R B S I   CISCO2911 Gig 0/0</span>
SW2              Gig 0/1           143              S I   WS-C3560C Gig 0/1

Total cdp entries displayed : 2</pre>
<dl class="terms">
<dt>Device ID</dt><dd>Neighbour ka hostname (kuch platforms par hostname ke saath domain ya serial number).</dd>
<dt>Local Intrfce</dt><dd><b>Aapka</b> port, us device par jahan aapne command type kiya. R1 SW1 ke Gig 0/0 par suna gaya.</dd>
<dt>Holdtme</dt><dd>Entry expire hone mein bache seconds (180 se count down).</dd>
<dt>Capability</dt><dd>Neighbour kya kar sakta hai, upar wale legend ke hisaab se: R router, S switch, I IGMP snooping, P phone, H host, waghera. Multilayer device kai letters dikhata hai.</dd>
<dt>Platform</dt><dd>Hardware model, summary mein kabhi-kabhi kata hua.</dd>
<dt>Port ID</dt><dd><b>Neighbour ka</b> port jisne advertisement bheja: R1 ka Gig 0/0.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Local interface aur port ID">
<rect x="30" y="50" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="85" text-anchor="middle" class="svg-ink" font-size="14">SW1 (aap)</text>
<rect x="450" y="50" width="160" height="60" rx="8" fill="#bae6fd"/><text x="530" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1 (neighbour)</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="3"/>
<text x="215" y="70" class="svg-accent" font-size="12">Gi0/0</text><text x="385" y="70" class="svg-accent" font-size="12">Gi0/0</text>
<text x="200" y="140" class="svg-ink" font-size="13">Local Intrfce</text><text x="400" y="140" class="svg-ink" font-size="13">Port ID</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">cable ka aapka end / neighbour ka end</text>
</svg><p class="cap">Local Intrfce hamesha cable ka woh end hai jo us device par hai jahan aapne command chalaya; Port ID door wala end hai.</p></div>

<h3>show cdp neighbors detail aur show cdp entry</h3>
<p>Summary mein na IP addresses hote hain na software version. Har neighbour ki poori jaankari ke liye <code>detail</code> jodo, ya ek neighbour ke liye <code>show cdp entry NAME</code> use karo (<code>show cdp entry *</code> detail view ke barabar hai).</p>
<pre class="out">SW1# show cdp entry SW2
-------------------------
Device ID: SW2
Entry address(es):
  IP address: 10.50.0.12
Platform: cisco WS-C3560CX-12PC-S,  Capabilities: Switch IGMP
<span class="hl">Interface: GigabitEthernet0/1,  Port ID (outgoing port): GigabitEthernet0/1</span>
Holdtime : 131 sec

Version :
Cisco IOS Software, C3560CX Software (C3560CX-UNIVERSALK9-M), Version 15.2(7)E8, RELEASE SOFTWARE (fc1)

advertisement version: 2
Protocol Hello:  OUI=0x00000C, Protocol ID=0x0112; payload len=27, value=...
VTP Management Domain: ''
<span class="hl">Native VLAN: 1</span>
<span class="hl">Duplex: full</span>
Management address(es):
  IP address: 10.50.0.12</pre>
<p>Interface wali line ki wording dhyan se dekho: <b>Interface</b> aapka local port hai aur <b>Port ID (outgoing port)</b> neighbour ka. Do useful filters hain: <code>show cdp entry SW2 protocol</code> sirf addresses print karta hai, aur <code>show cdp entry SW2 version</code> sirf software.</p>

<h3>CDP ko khud check karna</h3>
<pre class="out">SW1# show cdp interface gigabitEthernet 0/1
GigabitEthernet0/1 is up, line protocol is up
  Encapsulation ARPA
  Sending CDP packets every 60 seconds
  Holdtime is 180 seconds

SW1# show cdp traffic
CDP counters :
        Total packets output: 245, Input: 238
        Hdr syntax: 0, Chksum error: 0, Encaps failed: 0
        No memory: 0, Invalid packet: 0,
        CDP version 1 advertisements output: 0, Input: 0
        CDP version 2 advertisements output: 245, Input: 238</pre>
<p><code>show cdp interface</code> sirf woh interfaces list karta hai jahan CDP enabled hai, isliye jo port isme nahi dikhta us par <code>no cdp enable</code> hai. <code>show cdp traffic</code> batata hai ki frames bheje aur receive ho bhi rahe hain ya nahi.</p>

<h3>Jo topology dikh nahi rahi use draw karna</h3>
<p>Yeh classic real-world use hai. Aapko ek device ka SSH access diya gaya hai aur diagram maanga gaya hai.</p>
<ol>
<li><code>show cdp neighbors</code> chalao. Apna device draw karo aur har row ke liye ek line, jis par aapke end par Local Intrfce aur door wale end par Port ID likha ho.</li>
<li>Har neighbour ka management IP, model aur version jama karne ke liye <code>show cdp neighbors detail</code> chalao.</li>
<li>Us IP se har neighbour par SSH karo aur repeat karo. Tab ruko jab har device sirf woh neighbours dikhaye jo aap pehle hi draw kar chuke ho.</li>
<li>Jo ports up hain lekin koi neighbour nahi dikhate, woh end hosts ya non-CDP devices hain; MAC address table se confirm karo.</li>
</ol>

<div class="eg"><p><b>Worked example (CDP lab).</b> SW1 par summary do lines deti hai: SW1 Gi0/0 se R1 Gi0/0, aur SW1 Gi0/1 se SW2 Gi0/1. SW2 ki entry 10.50.0.12 deti hai. Wahan se SW2 ki table Gi0/1 par SW1 aur local port Gi0/5 par R2 dikhati hai, R2 ka port Gi0/0. R1 ki detail IP 10.50.0.1 dikhati hai, yahi router aap SW1 ke default gateway ke liye use karoge. Ports Gi0/3 aur Gi0/4 up hain par koi neighbour nahi: PC1 aur PC2.</p></div>

<div class="warn"><p><b>Common galti.</b> Neighbour ka port number apne switch par configure kar dena. Agar row kehti hai Local Intrfce Gig 0/5 aur Port ID Gig 0/0, to description <code>TO-R2-INTERNET</code> aapke Gi0/5 par jaayega. Kisi bhi interface ko chhoone se pehle column header dobara padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa command neighbouring router ka IP address dikhata hai?" <code>show cdp neighbors</code> nahi: summary mein addresses nahi hote. Jawab hai <code>show cdp neighbors detail</code> ya <code>show cdp entry</code>. Aur akela <code>show cdp</code> sirf global timers aur version dikhata hai.</p></div>

<div class="scn"><h4>Ulta padha gaya port</h4><p>Ek junior engineer ko hataaye jaa rahe purane router ki taraf wala port shut karne ko kaha gaya. Access switch par <code>show cdp neighbors</code> ne router ko Local Intrfce Gig 1/0/24 aur Port ID Gig 0/1 ke saath dikhaya. Usne switch par Gi1/0/1 shut kar diya, jo ek production uplink tha, aur ek poore floor ki connectivity chali gayi. Senior engineer ne port wapas on kiya aur Gi1/0/24 shut kiya.</p><p><b>Seekh:</b> Local Intrfce aapka hai; Port ID neighbour ka. Koi bhi change karne se pehle ise zor se bolo.</p></div>

<div class="iv"><p class="q">"Aapke paas ek core switch ka SSH hai aur koi diagram nahi. Topology kaise banaoge?"</p><p>Loop samjhao: links ke liye <code>show cdp neighbors</code> (ya multi-vendor site mein LLDP), management IPs aur models ke liye <code>detail</code>, har neighbour par SSH karke repeat, aur jin ports par neighbour nahi unke liye MAC table. Yeh bhi batao ki har link ke dono port IDs record karte ho aur check karte ho ki dono ends agree karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local Intrfce = aapka port; Port ID = neighbour ka port.</li>
<li>Summary mein IPs nahi hote; addresses, version, native VLAN aur duplex ke liye <code>detail</code> ya <code>show cdp entry</code> use karo.</li>
<li><code>show cdp interface</code> aur <code>show cdp traffic</code> CDP ko khud check karte hain.</li>
<li>Network ko hop by hop map karo: neighbours, detail, management IP par SSH, repeat.</li>
<li>Jin up ports par neighbour nahi, woh aam taur par end hosts hote hain.</li>
</ul></div>
`}};export{e as default};