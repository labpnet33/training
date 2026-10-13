var e={id:`containers`,h:{en:`Containers vs VMs and container networking`,hi:`Containers vs VMs aur container networking`},body:{en:`
<p>A VM is like giving every guest their own house, complete with foundation, plumbing and electricity. A <b>container</b> is more like a room in a hostel: every guest has a private lockable room and their own belongings, but they all share one building's foundation, water and power. Rooms are cheap and can be ready in seconds; a house takes much longer to build.</p>

<h3>What a container is</h3>
<p>A container packages <b>an application plus everything it needs</b> (libraries, runtime, configuration) into an <b>image</b>. When the image runs, it becomes a container: an isolated process on a Linux host. The key point: <b>containers share the host's operating system kernel</b>. There is no guest OS to boot, so a container starts in about a second and weighs megabytes, not gigabytes.</p>
<p>Isolation comes from two Linux kernel features:</p>
<ul>
<li><b>Namespaces</b> give each container its own view of process IDs, file system, hostname and <b>network stack</b> (its own interfaces, IP addresses, routing table and ports).</li>
<li><b>Control groups (cgroups)</b> limit how much CPU and memory each container may use.</li>
</ul>
<p>A <b>container engine</b> such as Docker or containerd downloads images from a <b>registry</b>, starts and stops containers and wires up their networking. Containers are the natural fit for <b>microservices</b>: an application split into many small services, each in its own container, each updated independently.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="VM stack vs container stack">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Virtual machines</text>
<rect x="40" y="32" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">App A</text>
<rect x="170" y="32" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="55" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="40" y="74" width="110" height="36" rx="6" fill="#fde68a"/><text x="95" y="97" text-anchor="middle" class="svg-ink" font-size="12">Guest OS</text>
<rect x="170" y="74" width="110" height="36" rx="6" fill="#fde68a"/><text x="225" y="97" text-anchor="middle" class="svg-ink" font-size="12">Guest OS</text>
<rect x="40" y="118" width="240" height="36" rx="6" fill="#bae6fd"/><text x="160" y="141" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor</text>
<rect x="40" y="162" width="240" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">Containers</text>
<rect x="360" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="396" y="55" text-anchor="middle" class="svg-ink" font-size="12">App A</text>
<rect x="444" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="528" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="564" y="55" text-anchor="middle" class="svg-ink" font-size="12">App C</text>
<rect x="360" y="74" width="240" height="36" rx="6" fill="#ddd6fe"/><text x="480" y="97" text-anchor="middle" class="svg-ink" font-size="12">Container engine</text>
<rect x="360" y="118" width="240" height="36" rx="6" fill="#fde68a"/><text x="480" y="141" text-anchor="middle" class="svg-ink" font-size="12">One host OS kernel</text>
<rect x="360" y="162" width="240" height="36" rx="6" fill="#e2e8f0"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="12">Hardware or a VM</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">no guest OS per container: smaller and faster</text>
</svg><p class="cap">VMs each carry a full guest OS; containers share one kernel through the container engine.</p></div>

<h3>VM vs container</h3>
<table class="cmp"><tr><th></th><th>Virtual machine</th><th>Container</th></tr>
<tr><td>Isolation unit</td><td>whole OS on virtual hardware</td><td>process with its own namespaces</td></tr>
<tr><td>Kernel</td><td>each VM runs its own</td><td>shared with the host</td></tr>
<tr><td>Size / start time</td><td>gigabytes / minutes</td><td>megabytes / seconds</td></tr>
<tr><td>Runs on</td><td>a hypervisor</td><td>a container engine on an OS (often inside a VM)</td></tr>
<tr><td>Isolation strength</td><td>strong (separate kernels)</td><td>weaker (a kernel bug affects all)</td></tr>
<tr><td>Can mix OS types</td><td>yes, Windows and Linux on one host</td><td>no, Linux containers need a Linux kernel</td></tr></table>
<p>In practice the two are combined: most containers run inside VMs, in the data center and in the cloud.</p>

<h3>Container networking basics</h3>
<p>Each container gets a network namespace. The engine connects it with a <b>veth pair</b>, a virtual cable with one end inside the container (seen as <code>eth0</code>) and the other plugged into a Linux bridge on the host. Docker's network drivers:</p>
<dl class="terms">
<dt>bridge (default)</dt><dd>Containers attach to the <code>docker0</code> bridge, get addresses from <b>172.17.0.0/16</b> with gateway 172.17.0.1, and reach the outside through <b>NAT (masquerade)</b> behind the host's IP. They can talk to each other on the bridge.</dd>
<dt>host</dt><dd>No separate namespace: the container uses the host's interfaces and IP directly.</dd>
<dt>none</dt><dd>Only a loopback interface; no networking.</dd>
<dt>overlay</dt><dd>A virtual network spanning several hosts, built with VXLAN tunnels, used by clusters.</dd>
<dt>macvlan</dt><dd>The container gets its own MAC on the physical network and looks like a separate host to the switch.</dd>
</dl>
<p>Because bridge containers hide behind NAT, outsiders reach them through <b>port publishing</b>: <code>-p 8080:80</code> means "connections to host port 8080 are forwarded to port 80 of the container". The order is always <b>HOST:CONTAINER</b>.</p>

<pre class="code"><span class="c">! on the lab hypervisor or a SERVER host</span>
HV1:~# docker run -d --name web -p 8080:80 nginx
HV1:~# docker ps</pre>
<pre class="out">CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
3f2a9c1e0b77   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     web</pre>
<pre class="out">HV1:~# docker inspect web
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.2"</span>, "IPPrefixLen": 16 } },
      "Ports": { "80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ] }</pre>

<div class="eg"><p><b>Worked example.</b> Host IP 192.0.2.50. A user browses to 192.0.2.50 port 8080. The host's NAT rule translates the destination to 172.17.0.2 port 80, the nginx container answers, and the reply is translated back so the user sees 192.0.2.50:8080. A second nginx container can also listen on port 80 inside its own namespace, but it must be published on a different host port, such as <code>-p 8081:80</code>; two containers cannot both publish host port 8080.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading <code>-p 8080:80</code> backwards. The left number is the host, the right number is the container. Another classic: a company LAN already uses 172.17.0.0/16, so hosts with Docker's default bridge cannot reach that part of the LAN. Change the bridge range in the engine configuration.</p></div>

<div class="exam"><p><b>Exam trap.</b> Containers do not need a hypervisor and do not include a guest OS; they share the host kernel. "Lightweight, fast to start, shares the OS kernel" always means containers. "Runs its own OS, stronger isolation" always means VMs.</p></div>

<div class="scn"><h4>The address clash</h4><p>After developers installed Docker on a build server, the server could no longer reach the monitoring system at 172.17.4.20. Its routing table showed 172.17.0.0/16 directly connected on <code>docker0</code>, so packets for the monitoring subnet went into the local bridge. Moving Docker's default bridge to an unused range fixed the route.</p><p><b>Lesson:</b> container engines create real subnets and routes on the host. Include them in your IP address plan.</p></div>

<div class="iv"><p class="q">"What is the difference between a container and a virtual machine?"</p><p>A VM virtualizes hardware and runs a full guest OS on a hypervisor; a container virtualizes the OS, sharing the host kernel and isolating processes with namespaces and cgroups. So containers are smaller and start in seconds, while VMs give stronger isolation and can run different OS types. Add networking: a Docker container on the default bridge gets a 172.17.0.0/16 address, is NATed behind the host, and is exposed with port publishing HOST:CONTAINER.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A container is an isolated process running from an image; it shares the host kernel and has no guest OS.</li>
<li>Namespaces isolate (including a private network stack); cgroups limit CPU and memory.</li>
<li>Containers are small and fast; VMs are heavier but more strongly isolated. Most containers run inside VMs.</li>
<li>Docker's default bridge network uses 172.17.0.0/16, gateway 172.17.0.1, and NAT behind the host IP.</li>
<li>Port publishing is HOST:CONTAINER: <code>-p 8080:80</code> forwards host port 8080 to container port 80.</li>
</ul></div>
`,hi:`
<p>VM aisi hai jaise har guest ko uska apna ghar dena, foundation, plumbing aur bijli ke saath. <b>Container</b> hostel ke room jaisa hai: har guest ka private lock wala room aur apna saamaan hai, par sab ek building ki foundation, paani aur bijli share karte hain. Rooms saste hain aur seconds mein tayyar ho sakte hain; ghar banane mein kaafi zyada time lagta hai.</p>

<h3>Container kya hai</h3>
<p>Container <b>ek application plus uski har zaroorat</b> (libraries, runtime, configuration) ko ek <b>image</b> mein pack karta hai. Jab image chalti hai, woh container ban jaati hai: Linux host par ek isolated process. Sabse zaroori baat: <b>containers host ke operating system kernel ko share karte hain</b>. Boot karne ke liye koi guest OS nahi hota, isliye container lagbhag ek second mein start hota hai aur gigabytes nahi, megabytes ka hota hai.</p>
<p>Isolation do Linux kernel features se aati hai:</p>
<ul>
<li><b>Namespaces</b> har container ko process IDs, file system, hostname aur <b>network stack</b> (apne interfaces, IP addresses, routing table aur ports) ka apna view dete hain.</li>
<li><b>Control groups (cgroups)</b> limit karte hain ki har container kitna CPU aur memory use kar sakta hai.</li>
</ul>
<p>Docker ya containerd jaisa <b>container engine</b> ek <b>registry</b> se images download karta hai, containers start aur stop karta hai aur unki networking jodta hai. Containers <b>microservices</b> ke liye natural fit hain: application kai chhoti services mein bati hui, har ek apne container mein, har ek alag se update hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="VM stack vs container stack">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Virtual machines</text>
<rect x="40" y="32" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">App A</text>
<rect x="170" y="32" width="110" height="36" rx="6" fill="#bbf7d0"/><text x="225" y="55" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="40" y="74" width="110" height="36" rx="6" fill="#fde68a"/><text x="95" y="97" text-anchor="middle" class="svg-ink" font-size="12">Guest OS</text>
<rect x="170" y="74" width="110" height="36" rx="6" fill="#fde68a"/><text x="225" y="97" text-anchor="middle" class="svg-ink" font-size="12">Guest OS</text>
<rect x="40" y="118" width="240" height="36" rx="6" fill="#bae6fd"/><text x="160" y="141" text-anchor="middle" class="svg-ink" font-size="12">Hypervisor</text>
<rect x="40" y="162" width="240" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="12">Hardware</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">Containers</text>
<rect x="360" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="396" y="55" text-anchor="middle" class="svg-ink" font-size="12">App A</text>
<rect x="444" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">App B</text>
<rect x="528" y="32" width="72" height="36" rx="6" fill="#bbf7d0"/><text x="564" y="55" text-anchor="middle" class="svg-ink" font-size="12">App C</text>
<rect x="360" y="74" width="240" height="36" rx="6" fill="#ddd6fe"/><text x="480" y="97" text-anchor="middle" class="svg-ink" font-size="12">Container engine</text>
<rect x="360" y="118" width="240" height="36" rx="6" fill="#fde68a"/><text x="480" y="141" text-anchor="middle" class="svg-ink" font-size="12">Ek host OS kernel</text>
<rect x="360" y="162" width="240" height="36" rx="6" fill="#e2e8f0"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="12">Hardware ya ek VM</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">har container ka guest OS nahi: chhota aur tez</text>
</svg><p class="cap">Har VM poora guest OS le jaati hai; containers container engine ke through ek kernel share karte hain.</p></div>

<h3>VM vs container</h3>
<table class="cmp"><tr><th></th><th>Virtual machine</th><th>Container</th></tr>
<tr><td>Isolation unit</td><td>virtual hardware par poora OS</td><td>apne namespaces wala process</td></tr>
<tr><td>Kernel</td><td>har VM apna chalati hai</td><td>host ke saath shared</td></tr>
<tr><td>Size / start time</td><td>gigabytes / minutes</td><td>megabytes / seconds</td></tr>
<tr><td>Kis par chalta hai</td><td>hypervisor</td><td>OS par container engine (aksar VM ke andar)</td></tr>
<tr><td>Isolation strength</td><td>strong (alag kernels)</td><td>kamzor (kernel bug sab par asar karta hai)</td></tr>
<tr><td>OS types mix kar sakte hain</td><td>haan, ek host par Windows aur Linux</td><td>nahi, Linux containers ko Linux kernel chahiye</td></tr></table>
<p>Practice mein dono ko milaya jaata hai: zyada tar containers VMs ke andar chalte hain, data center mein bhi aur cloud mein bhi.</p>

<h3>Container networking basics</h3>
<p>Har container ko ek network namespace milta hai. Engine use <b>veth pair</b> se jodta hai, ek virtual cable jiska ek sira container ke andar hota hai (<code>eth0</code> dikhta hai) aur doosra host par ek Linux bridge mein plug hota hai. Docker ke network drivers:</p>
<dl class="terms">
<dt>bridge (default)</dt><dd>Containers <code>docker0</code> bridge se judte hain, <b>172.17.0.0/16</b> se addresses lete hain jiska gateway 172.17.0.1 hai, aur host ke IP ke peeche <b>NAT (masquerade)</b> se bahar pahunchte hain. Woh bridge par aapas mein baat kar sakte hain.</dd>
<dt>host</dt><dd>Koi alag namespace nahi: container seedha host ke interfaces aur IP use karta hai.</dd>
<dt>none</dt><dd>Sirf loopback interface; koi networking nahi.</dd>
<dt>overlay</dt><dd>Kai hosts par faila virtual network, VXLAN tunnels se bana, clusters use karte hain.</dd>
<dt>macvlan</dt><dd>Container ko physical network par apna MAC milta hai aur switch ko woh alag host jaisa dikhta hai.</dd>
</dl>
<p>Kyunki bridge containers NAT ke peeche chhupe hote hain, bahar wale unhe <b>port publishing</b> se pahunchte hain: <code>-p 8080:80</code> ka matlab "host port 8080 ke connections container ke port 80 par forward hote hain". Order hamesha <b>HOST:CONTAINER</b> hota hai.</p>

<pre class="code"><span class="c">! lab hypervisor ya SERVER host par</span>
HV1:~# docker run -d --name web -p 8080:80 nginx
HV1:~# docker ps</pre>
<pre class="out">CONTAINER ID   IMAGE      COMMAND                  STATUS              PORTS                    NAMES
3f2a9c1e0b77   nginx      "nginx -g daemon of…"    Up 5 seconds        <span class="hl">0.0.0.0:8080-&gt;80/tcp</span>     web</pre>
<pre class="out">HV1:~# docker inspect web
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.2"</span>, "IPPrefixLen": 16 } },
      "Ports": { "80/tcp": [ { "HostIp": "0.0.0.0", "HostPort": "8080" } ] }</pre>

<div class="eg"><p><b>Worked example.</b> Host IP 192.0.2.50 hai. User 192.0.2.50 port 8080 par browse karta hai. Host ka NAT rule destination ko 172.17.0.2 port 80 mein translate karta hai, nginx container jawab deta hai, aur reply wapas translate hota hai taaki user ko 192.0.2.50:8080 dikhe. Doosra nginx container bhi apne namespace mein port 80 par sun sakta hai, par use alag host port par publish karna padega, jaise <code>-p 8081:80</code>; do containers dono host port 8080 publish nahi kar sakte.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>-p 8080:80</code> ko ulta padhna. Baayan number host hai, daayan number container. Ek aur classic: company LAN pehle se 172.17.0.0/16 use karta hai, isliye Docker ke default bridge wale hosts LAN ke us hisse tak nahi pahunch paate. Engine configuration mein bridge range badlo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Containers ko hypervisor nahi chahiye aur unmein guest OS nahi hota; woh host kernel share karte hain. "Lightweight, jaldi start, OS kernel share karta hai" ka matlab hamesha containers. "Apna OS chalata hai, strong isolation" ka matlab hamesha VMs.</p></div>

<div class="scn"><h4>Address clash</h4><p>Developers ne ek build server par Docker install kiya, uske baad server 172.17.4.20 wale monitoring system tak nahi pahunch pa raha tha. Uski routing table 172.17.0.0/16 ko <code>docker0</code> par directly connected dikha rahi thi, isliye monitoring subnet ke packets local bridge mein jaa rahe the. Docker ke default bridge ko unused range par move karne se route theek ho gaya.</p><p><b>Seekh:</b> container engines host par asli subnets aur routes banate hain. Unhe apne IP address plan mein shaamil karo.</p></div>

<div class="iv"><p class="q">"Container aur virtual machine mein kya fark hai?"</p><p>VM hardware ko virtualize karti hai aur hypervisor par poora guest OS chalati hai; container OS ko virtualize karta hai, host kernel share karta hai aur namespaces aur cgroups se processes isolate karta hai. Isliye containers chhote hain aur seconds mein start hote hain, jabki VMs strong isolation deti hain aur alag OS types chala sakti hain. Networking jodo: default bridge par Docker container 172.17.0.0/16 address leta hai, host ke peeche NAT hota hai, aur port publishing HOST:CONTAINER se expose hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Container image se chalne wala isolated process hai; yeh host kernel share karta hai aur ismein guest OS nahi hota.</li>
<li>Namespaces isolate karte hain (private network stack samet); cgroups CPU aur memory limit karte hain.</li>
<li>Containers chhote aur tez hain; VMs bhaari par zyada strongly isolated hain. Zyada tar containers VMs ke andar chalte hain.</li>
<li>Docker ka default bridge network 172.17.0.0/16, gateway 172.17.0.1, aur host IP ke peeche NAT use karta hai.</li>
<li>Port publishing HOST:CONTAINER hai: <code>-p 8080:80</code> host port 8080 ko container port 80 par forward karta hai.</li>
</ul></div>
`}};export{e as default};