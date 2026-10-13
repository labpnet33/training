var e={id:`pan-os-organised`,h:{en:`How PAN-OS is organised: planes, interfaces and the config tree`,hi:`PAN-OS kaise organised hai: planes, interfaces aur config tree`},body:{en:`
<p><b>Analogy: a restaurant.</b> The manager's office (management plane) takes orders about how the restaurant should run. The kitchen manager (control plane) works out recipes and routes. The kitchen line (data plane) cooks and serves every plate at speed. If the manager is busy on the phone, the line keeps cooking. PAN-OS firewalls are built the same way.</p>

<h3>Three planes</h3>
<table class="cmp"><tr><th>Plane</th><th>Job</th><th>You see it as</th></tr>
<tr><td>Management plane</td><td>Configuration, logging, reporting, GUI, CLI, API, commit</td><td>the management interface and every admin session</td></tr>
<tr><td>Control plane</td><td>Routing protocols, ARP, session setup decisions</td><td>virtual router, routing table</td></tr>
<tr><td>Data plane</td><td>Moves and inspects packets; session lookup, App-ID, Content-ID, NAT</td><td>ethernet1/x interfaces</td></tr></table>
<p>Hardware models give each plane its own processors. Virtual models share resources but keep the same logical split. The consequence for your daily work: a heavy report or commit on the management plane does not stop forwarding, and a <b>management interface</b> is not a data interface.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Management, control and data planes">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Management plane: CLI, GUI, API, Panorama, logs, commit</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Control plane: virtual router, routing table, ARP</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Data plane: ethernet1/1, 1/2, 1/3 ... sessions, App-ID, Content-ID, NAT</text>
</svg><p class="cap">Admins talk to the top; users' traffic runs through the bottom.</p></div>

<h3>Ways to manage the firewall</h3>
<ul>
<li><b>Web interface (GUI)</b>: tabs for Dashboard, ACC, Monitor, Policies, Objects, Network and Device. Reached with HTTPS on the management interface.</li>
<li><b>CLI</b>: over SSH or the console. Two modes: <b>operational</b> (prompt ends with <code>&gt;</code>) and <b>configure</b> (prompt ends with <code>#</code>).</li>
<li><b>XML API and REST API</b>: for automation. The GUI and CLI both call the same configuration engine, so a change made in one is visible in the other after saving the candidate.</li>
<li><b>Panorama</b>: central management of many firewalls (a later module).</li>
</ul>
<p>A new firewall's management interface usually starts at <code>192.168.1.1/24</code> with a default administrator account whose password you must change at first login. The management interface has its own default gateway and services. It is separate from the data-plane interfaces, which is why a plain <code>ping host</code> from the CLI leaves through management, not through ethernet1/1. The simulator shows this on its first lines:</p>
<pre class="out">admin@PA1&gt; show system info
hostname: PA1
<span class="hl">ip-address: 192.168.1.1</span>
netmask: 255.255.255.0
default-gateway: 192.168.1.254
family: vm
model: PA-VM
sw-version: 11.1.4 (NK-OS educational simulator)</pre>

<h3>The configuration is a tree</h3>
<p>PAN-OS stores configuration as a hierarchical tree (XML underneath). The main branches you will meet: <code>deviceconfig</code> (hostname, DNS, NTP, management settings), <code>network</code> (interfaces, virtual routers, profiles), <code>zone</code>, <code>rulebase</code> (security, NAT) and shared objects such as addresses. In configure mode the <code>set</code> command walks that tree:</p>
<pre class="code"><span class="c"># one line, one path through the tree</span>
set deviceconfig system hostname NK-PUNE-PA
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24
set zone trust network layer3 ethernet1/2</pre>
<p>Reading the running configuration shows the same tree, in braces by default or as <code>set</code> lines after <code>set cli config-output-format set</code>:</p>
<pre class="out">admin@PA1&gt; set cli config-output-format set
admin@PA1&gt; show config running
set deviceconfig system hostname PA1
<span class="hl">set network virtual-router default</span></pre>
<p>Even a factory-fresh firewall already has a <code>default</code> virtual router. It has no interfaces and no routes yet.</p>

<div class="eg"><p><b>Worked example.</b> You are asked to "add a DMZ". Mentally split the work by branch: <code>network interface</code> for the IP, <code>network virtual-router</code> for the router membership, <code>zone</code> for the zone, <code>rulebase security</code> for access. Four branches, one change. This habit keeps a build checklist-driven.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing reachability from the CLI with a plain ping and concluding the data plane works (it used the management interface). Leaving the default administrator password. Allowing management services such as SSH or HTTPS on an internet-facing interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The management interface is separate from the data-plane interfaces and uses its own routing. Services such as ping, SSH and HTTPS on a <i>data</i> interface are controlled by an <b>interface management profile</b>, not by security policy.</p></div>

<div class="scn"><h4>Locked out by a successful commit</h4><p>An engineer enabled a management profile with only SSH on the LAN interface and removed the profile that allowed HTTPS. The commit succeeded, but the next admin could no longer open the web interface from the LAN. The out-of-band management interface still worked and the profile was restored.</p><p><b>Lesson:</b> keep an independent path to the management interface. Treat management profiles as security-sensitive changes.</p></div>

<div class="iv"><p class="q">"What are the three planes in a PAN-OS firewall?"</p><p>Management plane (configuration, logging, GUI, CLI, API), control plane (routing and session setup logic) and data plane (packet forwarding and inspection). Explain that they are separated so a busy admin task does not interrupt traffic, and that the management interface is separate from the data interfaces.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management, control and data planes are separate by design.</li>
<li>CLI has operational (&gt;) and configure (#) modes; GUI and API use the same configuration.</li>
<li>The management interface is not a data interface; default is 192.168.1.1.</li>
<li>Configuration is a tree: deviceconfig, network, zone, rulebase.</li>
<li>Services on data interfaces come from interface management profiles.</li>
</ul></div>
`,hi:`
<p><b>Analogy: restaurant.</b> Manager ka office (management plane) restaurant kaise chalna chahiye iske orders leta hai. Kitchen manager (control plane) recipes aur routes tay karta hai. Kitchen line (data plane) har plate speed se pakati aur serve karti hai. Manager phone par busy ho to bhi line pakati rehti hai. PAN-OS firewalls bhi isi tarah bane hain.</p>

<h3>Teen planes</h3>
<table class="cmp"><tr><th>Plane</th><th>Kaam</th><th>Aap ise kaise dekhte ho</th></tr>
<tr><td>Management plane</td><td>Configuration, logging, reporting, GUI, CLI, API, commit</td><td>management interface aur har admin session</td></tr>
<tr><td>Control plane</td><td>Routing protocols, ARP, session setup decisions</td><td>virtual router, routing table</td></tr>
<tr><td>Data plane</td><td>Packets move aur inspect karta hai; session lookup, App-ID, Content-ID, NAT</td><td>ethernet1/x interfaces</td></tr></table>
<p>Hardware models mein har plane ke apne processors hote hain. Virtual models resources share karte hain lekin wahi logical split rakhte hain. Aapke roz ke kaam ka nateeja: management plane par heavy report ya commit forwarding nahi rokta, aur <b>management interface</b> data interface nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Management, control aur data planes">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Management plane: CLI, GUI, API, Panorama, logs, commit</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Control plane: virtual router, routing table, ARP</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Data plane: ethernet1/1, 1/2, 1/3 ... sessions, App-ID, Content-ID, NAT</text>
</svg><p class="cap">Admins upar se baat karte hain; users ka traffic neeche se guzarta hai.</p></div>

<h3>Firewall manage karne ke tareeke</h3>
<ul>
<li><b>Web interface (GUI)</b>: Dashboard, ACC, Monitor, Policies, Objects, Network aur Device ke tabs. Management interface par HTTPS se pahunchte hain.</li>
<li><b>CLI</b>: SSH ya console par. Do modes: <b>operational</b> (prompt <code>&gt;</code> par khatam) aur <b>configure</b> (prompt <code>#</code> par khatam).</li>
<li><b>XML API aur REST API</b>: automation ke liye. GUI aur CLI dono wahi configuration engine call karte hain, isliye ek mein kiya change candidate save hone ke baad doosre mein dikhta hai.</li>
<li><b>Panorama</b>: kai firewalls ka central management (aage ka module).</li>
</ul>
<p>Naye firewall ka management interface aam taur par <code>192.168.1.1/24</code> par shuru hota hai aur default administrator account ka password pehle login par badalna padta hai. Management interface ka apna default gateway aur services hoti hain. Yeh data-plane interfaces se alag hai, isiliye CLI se seedha <code>ping host</code> management se nikalta hai, ethernet1/1 se nahi. Simulator ise apni pehli lines mein dikhata hai:</p>
<pre class="out">admin@PA1&gt; show system info
hostname: PA1
<span class="hl">ip-address: 192.168.1.1</span>
netmask: 255.255.255.0
default-gateway: 192.168.1.254
family: vm
model: PA-VM
sw-version: 11.1.4 (NK-OS educational simulator)</pre>

<h3>Configuration ek tree hai</h3>
<p>PAN-OS configuration ko hierarchical tree (neeche XML) ki tarah store karta hai. Mukhya branches: <code>deviceconfig</code> (hostname, DNS, NTP, management settings), <code>network</code> (interfaces, virtual routers, profiles), <code>zone</code>, <code>rulebase</code> (security, NAT) aur addresses jaise shared objects. Configure mode mein <code>set</code> command us tree par chalta hai:</p>
<pre class="code"><span class="c"># ek line, tree mein ek raasta</span>
set deviceconfig system hostname NK-PUNE-PA
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24
set zone trust network layer3 ethernet1/2</pre>
<p>Running configuration padhne par wahi tree dikhta hai, default mein braces mein ya <code>set cli config-output-format set</code> ke baad <code>set</code> lines mein:</p>
<pre class="out">admin@PA1&gt; set cli config-output-format set
admin@PA1&gt; show config running
set deviceconfig system hostname PA1
<span class="hl">set network virtual-router default</span></pre>
<p>Factory-fresh firewall mein bhi pehle se ek <code>default</code> virtual router hota hai. Usme abhi koi interface aur route nahi.</p>

<div class="eg"><p><b>Worked example.</b> Aapse kaha jaata hai "DMZ jodo". Kaam ko branch ke hisaab se baanto: IP ke liye <code>network interface</code>, router membership ke liye <code>network virtual-router</code>, zone ke liye <code>zone</code>, access ke liye <code>rulebase security</code>. Chaar branches, ek change. Yeh aadat build ko checklist-driven rakhti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> CLI se plain ping se reachability test karke maan lena ki data plane chal raha hai (usne management interface use kiya). Default administrator password chhod dena. Internet-facing interface par SSH ya HTTPS jaisi management services allow karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Management interface data-plane interfaces se alag hai aur apni routing use karta hai. <i>Data</i> interface par ping, SSH aur HTTPS jaisi services <b>interface management profile</b> se control hoti hain, security policy se nahi.</p></div>

<div class="scn"><h4>Successful commit se lockout</h4><p>Ek engineer ne LAN interface par sirf SSH wala management profile lagaya aur HTTPS allow karne wala profile hata diya. Commit succeed hua, lekin agla admin LAN se web interface nahi khol paya. Out-of-band management interface chal raha tha aur profile restore kiya gaya.</p><p><b>Lesson:</b> management interface tak ek independent raasta rakho. Management profiles ko security-sensitive change maano.</p></div>

<div class="iv"><p class="q">"PAN-OS firewall ke teen planes kaunse hain?"</p><p>Management plane (configuration, logging, GUI, CLI, API), control plane (routing aur session setup logic) aur data plane (packet forwarding aur inspection). Samjhao ki inhe isliye alag rakha gaya hai ki busy admin task traffic na roke, aur management interface data interfaces se alag hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management, control aur data planes design se alag hain.</li>
<li>CLI mein operational (&gt;) aur configure (#) modes hain; GUI aur API wahi configuration use karte hain.</li>
<li>Management interface data interface nahi hai; default 192.168.1.1 hai.</li>
<li>Configuration ek tree hai: deviceconfig, network, zone, rulebase.</li>
<li>Data interfaces ki services interface management profiles se aati hain.</li>
</ul></div>
`}};export{e as default};