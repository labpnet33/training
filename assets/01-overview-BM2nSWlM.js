var e=e=>`<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Network ACL and host firewall">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="68" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="65" y="86" text-anchor="middle" class="svg-muted" font-size="11">10.20.0.10</text>
<rect x="160" y="40" width="130" height="60" rx="8" fill="#fed7aa"/><text x="225" y="68" text-anchor="middle" class="svg-ink" font-size="13">Router ACL</text><text x="225" y="86" text-anchor="middle" class="svg-muted" font-size="11">filters the network</text>
<rect x="330" y="20" width="300" height="100" rx="10" fill="#ede9fe"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">Server NMS03</text>
<rect x="345" y="55" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="12">ufw</text><text x="395" y="92" text-anchor="middle" class="svg-muted" font-size="10">host firewall</text>
<rect x="500" y="55" width="115" height="50" rx="8" fill="#bbf7d0"/><text x="557" y="76" text-anchor="middle" class="svg-ink" font-size="12">nginx, sshd</text><text x="557" y="92" text-anchor="middle" class="svg-muted" font-size="10">the services</text>
<line x1="120" y1="70" x2="160" y2="70" stroke="#64748b" stroke-width="2"/><line x1="290" y1="70" x2="345" y2="80" stroke="#64748b" stroke-width="2"/><line x1="445" y1="80" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo ufw status verbose
netadmin@nms03:~$ sudo ufw show added</pre>
<pre class="out"><span class="hl">Status: inactive</span>
Added user rules (see 'ufw status' for running firewall):
<span class="hl">ufw allow 23/tcp</span></pre>`,n=`<pre class="code">netadmin@nms03:~$ ss -tuln</pre>
<pre class="out">Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*
tcp   LISTEN 0      4096     127.0.0.53%lo:53        0.0.0.0:*
tcp   LISTEN 0      4096           0.0.0.0:<span class="hl">22</span>        0.0.0.0:*
udp   UNCONN 0      0             0.0.0.0:<span class="hl">514</span>        0.0.0.0:*
tcp   LISTEN 0      4096           0.0.0.0:<span class="hl">80</span>        0.0.0.0:*</pre>`,r={id:`overview`,h:{en:`Why a server needs its own firewall`,hi:`Server ko apna firewall kyun chahiye`},body:{en:`
<p>You already know the router access list: a list of permit and deny lines that decides which packets may cross the router. A <b>host firewall</b> is the same idea applied to one server, on the server itself. It decides which connections may reach the services running on that machine. Even if a router ACL is wrong, or an attacker is already inside the network, the server still protects itself. Security people call this <b>defence in depth</b>: more than one layer, so one mistake is not a disaster.</p>
`+e(`A router ACL guards the network. The host firewall guards one server.`)+`
<h3>The layers, from the kernel up</h3>
<p>Linux has packet filtering built into the kernel. The kernel part is called <b>netfilter</b>. You never talk to it directly. You use a tool that writes rules into it:</p>
<dl class="terms">
<dt>netfilter</dt><dd>The packet filter inside the Linux kernel. It does the real work.</dd>
<dt>iptables / nftables</dt><dd>Tools that add rules to netfilter. iptables is the classic one; nftables is the newer replacement.</dd>
<dt>ufw</dt><dd>Uncomplicated Firewall. A friendly front end on Ubuntu that turns short commands such as <code>ufw allow 80/tcp</code> into iptables or nftables rules.</dd>
</dl>
<p>This module teaches ufw first, because it is the easiest to read, and then shows what it creates underneath, so you can recognise it on any Linux server.</p>

<h3>Our lab server</h3>
<p>The server is called NMS03, a network monitoring server with address 10.99.0.20. You log in as <code>netadmin</code>. Commands that change the firewall need administrator rights, so they start with <code>sudo</code> ("super user do"). Your first look is read-only:</p>
`+t+`
<p>Two facts. First, <code>Status: inactive</code>: the firewall is switched off, so at the moment <b>everything</b> reaches the server. Second, <code>ufw show added</code> lists rules that are stored but not yet enforced. Someone added <code>allow 23/tcp</code>, which opens port 23, the old Telnet remote login that sends passwords in clear text. The moment the firewall starts, that rule would go live. Finding it before enabling is exactly why we read first.</p>

<h3>What is actually listening?</h3>
<p>A firewall decides about <b>ports</b>, so you must know which ports the server uses. The command <code>ss -tuln</code> lists them: <code>t</code> for TCP, <code>u</code> for UDP, <code>l</code> for listening only, <code>n</code> for numbers instead of names.</p>
`+n+`
<p>Read it row by row. <b>TCP 22</b> is SSH, our remote login. <b>TCP 80</b> is the nginx web dashboard. <b>UDP 514</b> is the syslog receiver from the logging module. Port 53 on 127.0.0.53 is the local name cache, reachable only from the server itself, so it needs no rule. Your firewall plan comes straight from this list: allow what the server must offer, and to whom; deny everything else.</p>

<div class="eg"><p><b>Worked example.</b> Draft the plan for NMS03 on paper. SSH 22/tcp: only the management network 10.99.0.0/24. Syslog 514/udp: only the management network. Web 80/tcp: everyone who needs the dashboard. Telnet 23: nobody, delete the stray rule. Default for everything else: deny. Four lines of plan, and you have not typed a command yet.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Turning the firewall on before reading the existing rules; assuming <code>inactive</code> means the server is protected (it means the opposite); forgetting that a rule for the wrong protocol, such as UDP instead of TCP, does nothing for the service you meant.</p></div>
<div class="exam"><p><b>Exam trap.</b> A host firewall and a router ACL are different layers. Passing the ACL does not mean the host will accept the packet. Always test from the client side.</p></div>
<div class="scn"><h4>The open door nobody saw</h4><p>A monitoring server sat for two years with its firewall inactive, because the network ACL "already protected it". A contractor laptop on the same VLAN, outside the ACL path, reached the telnet service on port 23 that an old installer had left running. A host firewall with a default of deny would have made that service invisible.</p><p><b>Lesson:</b> every layer assumes another layer might fail.</p></div>
<div class="iv"><p class="q">"Why use a host firewall if the network already has ACLs?"</p><p>Defence in depth. ACLs protect the path, not every path; hosts can be reached from the same VLAN or from a compromised neighbour. A host firewall enforces least privilege on the server itself, with rules close to the services, and it travels with the server wherever it is moved.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ufw is a friendly tool; the kernel filter underneath is netfilter, used through iptables or nftables.</li>
<li><code>ufw status</code> says inactive or active; inactive means no filtering.</li>
<li><code>ufw show added</code> reveals stored rules, even when the firewall is off.</li>
<li><code>ss -tuln</code> tells you which ports must be handled.</li>
</ul></div>
`,hi:`
<p>Router access list aap jaante ho: permit aur deny lines ki list jo tay karti hai ki kaunse packets router paar kar sakte hain. <b>Host firewall</b> wahi idea hai, ek server par, server ke andar. Yeh tay karta hai ki us machine par chal rahi services tak kaunse connections pahunch sakte hain. Router ACL galat ho, ya attacker pehle se network ke andar ho, tab bhi server apni raksha karta hai. Security log ise <b>defence in depth</b> kehte hain: ek se zyada layers, taaki ek galti disaster na bane.</p>
`+e(`Router ACL network ko bachata hai. Host firewall ek server ko.`)+`
<h3>Layers, kernel se upar tak</h3>
<p>Linux mein packet filtering kernel ke andar built-in hai. Kernel ke hisse ko <b>netfilter</b> kehte hain. Aap seedha usse baat nahi karte. Aap ek tool use karte ho jo usme rules likhta hai:</p>
<dl class="terms">
<dt>netfilter</dt><dd>Linux kernel ke andar packet filter. Asli kaam yahi karta hai.</dd>
<dt>iptables / nftables</dt><dd>Tools jo netfilter mein rules jodte hain. iptables classic hai; nftables naya replacement hai.</dd>
<dt>ufw</dt><dd>Uncomplicated Firewall. Ubuntu ka friendly front end jo <code>ufw allow 80/tcp</code> jaise chhote commands ko iptables ya nftables rules mein badalta hai.</dd>
</dl>
<p>Yeh module pehle ufw sikhata hai, kyunki yeh padhne mein sabse aasaan hai, phir dikhata hai ki neeche kya banta hai, taaki aap ise kisi bhi Linux server par pehchan sako.</p>

<h3>Hamara lab server</h3>
<p>Server ka naam NMS03 hai, ek network monitoring server, address 10.99.0.20. Aap <code>netadmin</code> ki tarah login karte ho. Firewall badalne wale commands ko administrator rights chahiye, isliye woh <code>sudo</code> ("super user do") se shuru hote hain. Pehli nazar sirf padhne wali hai:</p>
`+t+`
<p>Do baatein. Pehli, <code>Status: inactive</code>: firewall band hai, isliye abhi <b>sab kuch</b> server tak pahunchta hai. Doosri, <code>ufw show added</code> woh rules dikhata hai jo store hain par abhi lagu nahi. Kisi ne <code>allow 23/tcp</code> joda, jo port 23 kholta hai, purana Telnet remote login jo password clear text mein bhejta hai. Firewall start hote hi woh rule live ho jaata. Isiliye enable karne se pehle padhte hain.</p>

<h3>Asal mein kya sun raha hai?</h3>
<p>Firewall <b>ports</b> ke baare mein faisla karta hai, isliye jaanna zaroori hai ki server kaunse ports use karta hai. Command <code>ss -tuln</code> unhe list karta hai: <code>t</code> TCP, <code>u</code> UDP, <code>l</code> sirf listening, <code>n</code> naam ki jagah numbers.</p>
`+n+`
<p>Row by row padho. <b>TCP 22</b> SSH hai, hamara remote login. <b>TCP 80</b> nginx web dashboard hai. <b>UDP 514</b> logging module ka syslog receiver hai. 127.0.0.53 par port 53 local name cache hai, sirf server se hi pahunch mein, isliye rule nahi chahiye. Aapka firewall plan seedha is list se aata hai: jo server ko offer karna hai use, aur kisko, allow karo; baaki sab deny.</p>

<div class="eg"><p><b>Worked example.</b> NMS03 ka plan kagaz par banao. SSH 22/tcp: sirf management network 10.99.0.0/24. Syslog 514/udp: sirf management network. Web 80/tcp: jise dashboard chahiye woh sab. Telnet 23: koi nahi, stray rule delete. Baaki sab ka default: deny. Plan ki chaar lines, aur abhi ek command bhi type nahi kiya.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Maujooda rules padhe bina firewall on karna; yeh maanna ki <code>inactive</code> ka matlab server protected hai (matlab ulta hai); yeh bhoolna ki galat protocol ka rule, jaise UDP ki jagah TCP, jis service ke liye socha uske liye kuch nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Host firewall aur router ACL alag layers hain. ACL paar karne ka matlab nahi ki host packet accept karega. Hamesha client side se test karo.</p></div>
<div class="scn"><h4>Woh khula darwaza jo kisi ne nahi dekha</h4><p>Ek monitoring server do saal tak inactive firewall ke saath chala, kyunki network ACL "pehle se protect karta tha". Usi VLAN par ek contractor laptop, ACL ke raaste ke bahar, port 23 par telnet service tak pahunch gaya jo purana installer chalu chhod gaya tha. Default deny wala host firewall us service ko invisible bana deta.</p><p><b>Lesson:</b> har layer maanti hai ki doosri layer fail ho sakti hai.</p></div>
<div class="iv"><p class="q">"Network par ACLs hain to host firewall kyun?"</p><p>Defence in depth. ACLs raaste ko bachate hain, har raaste ko nahi; hosts usi VLAN se ya kisi compromised padosi se pahunche ja sakte hain. Host firewall server par hi least privilege lagu karta hai, services ke kareeb, aur server jahan bhi jaye saath chalta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ufw friendly tool hai; neeche kernel filter netfilter hai, jo iptables ya nftables se use hota hai.</li>
<li><code>ufw status</code> inactive ya active batata hai; inactive ka matlab filtering nahi.</li>
<li><code>ufw show added</code> store hue rules dikhata hai, firewall off ho tab bhi.</li>
<li><code>ss -tuln</code> batata hai kaunse ports sambhalne hain.</li>
</ul></div>
`}};export{r as default};