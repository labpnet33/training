var e={id:`networks`,h:{en:`Container networking: the bridge, private addresses and names`,hi:`Container networking: bridge, private addresses aur names`},body:{en:`
<p>You are a network engineer, so this chapter should feel familiar. A container engine builds a small virtual network inside the host, complete with a virtual switch, a subnet, a gateway and NAT. Once you see it as a network, containers stop being mysterious. Outputs are captured from the simulator's container engine; options it does not support are labelled as reference.</p>

<h3>Analogy: a small office behind one router</h3>
<p>A small office has many computers with private addresses, all behind one router with one public address. Computers talk to each other directly, and the router translates (NAT) when they reach the outside. The container host is that router; the default <b>bridge</b> is the office LAN; containers are the computers.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="docker0 bridge network">
<rect x="20" y="20" width="450" height="165" rx="12" fill="#e2e8f0"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">Host</text>
<rect x="45" y="60" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">web</text><text x="105" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.17.0.2</text>
<rect x="190" y="60" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="250" y="82" text-anchor="middle" class="svg-ink" font-size="12">api</text><text x="250" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.17.0.3</text>
<rect x="45" y="130" width="265" height="38" rx="10" fill="#fde68a"/><text x="177" y="154" text-anchor="middle" class="svg-ink" font-size="13">bridge 172.17.0.0/16 (gateway .1)</text>
<rect x="340" y="95" width="110" height="50" rx="10" fill="#bae6fd"/><text x="395" y="117" text-anchor="middle" class="svg-ink" font-size="12">NAT, host IP</text><text x="395" y="134" text-anchor="middle" class="svg-muted" font-size="11">port publish</text>
<line x1="177" y1="110" x2="177" y2="130" stroke="#64748b" stroke-width="2"/><line x1="310" y1="150" x2="340" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="95" width="100" height="50" rx="10" fill="#ddd6fe"/><text x="570" y="125" text-anchor="middle" class="svg-ink" font-size="12">Outside</text>
<line x1="450" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Containers sit on a private bridge; the host does NAT.</p></div>

<h3>The built-in networks</h3>
<pre class="out">SRV1&gt; docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
a0a394890000   bridge    bridge    local
e9a30cb30000   host      host      local
bc0abd3f0000   none      null      local</pre>
<table class="cmp"><tr><th>Network</th><th>What it does</th></tr>
<tr><td><code>bridge</code></td><td>the default: a private virtual switch with its own subnet (172.17.0.0/16) and NAT to the outside. Containers get an address from it.</td></tr>
<tr><td><code>host</code></td><td>the container shares the host's network directly; no isolation and no port mapping needed.</td></tr>
<tr><td><code>none</code></td><td>no network at all, only a loopback interface. For isolated jobs.</td></tr></table>

<h3>Seeing a container's address</h3>
<pre class="out">SRV1&gt; docker inspect api
[
  {
    "Id": "398577330000",
    "Name": "/api",
    "Image": "python",
    "State": { "Status": "running" },
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.3"</span>, "IPPrefixLen": 16 } },
      "Ports": {  }
    }
  }
]</pre>
<p>The Gateway 172.17.0.1 is the host's address on the bridge. The container address 172.17.0.3 comes from the /16 range (IPPrefixLen 16). The first container started got .2, the next .3, like a small DHCP pool. The empty Ports means nothing is published for this container: it is reachable from other containers on the bridge, but not from outside the host. That is exactly right for a service used only internally.</p>

<h3>Container to container</h3>
<p>Two containers on the same bridge can reach each other by private IP. The weakness: those addresses are assigned in order and change when containers are recreated, so hard-coding 172.17.0.3 in a script is fragile. The real engine solves this with <b>user-defined networks</b>, where containers find each other by <b>name</b> through a built-in DNS:</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): a user-defined network</span>
docker network create automation
docker run -d --name db --network automation postgres
docker run -d --name runner --network automation python
<span class="c"># inside runner, the database is reachable at the name: db</span></pre>
<p>With a name, the runner does not care what address db received. Docker Compose (chapter 7) creates such a network for you automatically, which is why services in a compose file simply use each other's service names.</p>

<h3>Exposure rules in one line</h3>
<ul>
<li>Same network: containers talk freely using names or private IPs; no publish needed.</li>
<li>Outside to container: needs a published port (<code>-p</code>).</li>
<li>Container to outside: allowed by default through NAT.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net's automation host runs a runner container and a database container. Only the web dashboard is published on 8080. The database has no published port, so the only way to reach it is from another container on the same network. A port scan of the host sees 8080 and nothing else.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Connecting from the host to a container using the container's private IP in a script that must keep working. That address can change. Also, using <code>localhost</code> inside a container to reach another container: localhost inside a container means the container itself, not the host or its neighbour.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default bridge: private subnet, NAT out, ports published by -p. Host mode removes the isolation. And "localhost" inside a container is that container's own loopback.</p></div>

<div class="scn"><h4>The script that called localhost</h4><p>A runner container tried to read a database at localhost:5432 and got connection refused. The database was healthy in another container. Inside the runner, localhost was the runner itself. The team put both on a user-defined network and used the database's container name as the host name. It worked and survived container restarts that changed the IP.</p><p><b>Lesson:</b> containers find each other by name on a shared network, not by localhost.</p></div>

<div class="iv"><p class="q">"How do containers communicate with each other and with the outside?"</p><p>By default each container gets a private IP on a bridge network with a gateway on the host; containers on that bridge reach each other directly, outbound traffic is NATed through the host, and inbound traffic needs a published port. On user-defined networks containers resolve each other by name. Host mode shares the host stack and none gives no network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The default bridge is a private virtual LAN (172.17.0.0/16 here) with NAT.</li>
<li>docker network ls lists bridge, host and none; inspect shows a container's IP and gateway.</li>
<li>No Ports entry means not reachable from outside the host.</li>
<li>Use user-defined networks and names instead of hard-coded private IPs.</li>
<li>localhost inside a container is the container itself.</li>
</ul></div>
`,hi:`
<p>Aap network engineer ho, isliye yeh chapter jaana-pehchana lagega. Container engine host ke andar chhota virtual network banata hai, virtual switch, subnet, gateway aur NAT ke saath. Ise network ke roop mein dekh lo to containers rahasyamay nahi rehte. Outputs simulator ke container engine se capture kiye gaye hain; jo options woh support nahi karta unhe reference likha hai.</p>

<h3>Analogy: ek router ke peeche chhota office</h3>
<p>Chhote office mein kai computers private addresses ke saath ek router ke peeche hote hain, jiska ek public address hai. Computers aapas mein seedhe baat karte hain, aur bahar jaate waqt router translate (NAT) karta hai. Container host woh router hai; default <b>bridge</b> office LAN hai; containers computers hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="docker0 bridge network">
<rect x="20" y="20" width="450" height="165" rx="12" fill="#e2e8f0"/><text x="245" y="42" text-anchor="middle" class="svg-ink" font-size="13">Host</text>
<rect x="45" y="60" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">web</text><text x="105" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.17.0.2</text>
<rect x="190" y="60" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="250" y="82" text-anchor="middle" class="svg-ink" font-size="12">api</text><text x="250" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.17.0.3</text>
<rect x="45" y="130" width="265" height="38" rx="10" fill="#fde68a"/><text x="177" y="154" text-anchor="middle" class="svg-ink" font-size="13">bridge 172.17.0.0/16 (gateway .1)</text>
<rect x="340" y="95" width="110" height="50" rx="10" fill="#bae6fd"/><text x="395" y="117" text-anchor="middle" class="svg-ink" font-size="12">NAT, host IP</text><text x="395" y="134" text-anchor="middle" class="svg-muted" font-size="11">port publish</text>
<line x1="177" y1="110" x2="177" y2="130" stroke="#64748b" stroke-width="2"/><line x1="310" y1="150" x2="340" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="95" width="100" height="50" rx="10" fill="#ddd6fe"/><text x="570" y="125" text-anchor="middle" class="svg-ink" font-size="12">Bahar</text>
<line x1="450" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Containers private bridge par hain; host NAT karta hai.</p></div>

<h3>Built-in networks</h3>
<pre class="out">SRV1&gt; docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
a0a394890000   bridge    bridge    local
e9a30cb30000   host      host      local
bc0abd3f0000   none      null      local</pre>
<table class="cmp"><tr><th>Network</th><th>Kya karta hai</th></tr>
<tr><td><code>bridge</code></td><td>default: apne subnet (172.17.0.0/16) aur bahar ke liye NAT wala private virtual switch. Containers ko isse address milta hai.</td></tr>
<tr><td><code>host</code></td><td>container seedha host ka network share karta hai; koi isolation nahi aur port mapping ki zaroorat nahi.</td></tr>
<tr><td><code>none</code></td><td>koi network nahi, sirf loopback interface. Isolated jobs ke liye.</td></tr></table>

<h3>Container ka address dekhna</h3>
<pre class="out">SRV1&gt; docker inspect api
[
  {
    "Id": "398577330000",
    "Name": "/api",
    "Image": "python",
    "State": { "Status": "running" },
    "NetworkSettings": {
      "Networks": { "bridge": { "Gateway": "172.17.0.1", <span class="hl">"IPAddress": "172.17.0.3"</span>, "IPPrefixLen": 16 } },
      "Ports": {  }
    }
  }
]</pre>
<p>Gateway 172.17.0.1 bridge par host ka address hai. Container address 172.17.0.3 /16 range se aaya hai (IPPrefixLen 16). Pehle start hue container ko .2 mila, agle ko .3, chhote DHCP pool jaisa. Khaali Ports ka matlab is container ke liye kuch publish nahi hai: bridge ke doosre containers se reachable hai, par host ke bahar se nahi. Sirf andar use hone wali service ke liye yahi bilkul sahi hai.</p>

<h3>Container se container</h3>
<p>Ek hi bridge ke do containers private IP se ek-doosre tak pahunch sakte hain. Kamzori: yeh addresses order mein diye jaate hain aur containers dobara banane par badal jaate hain, isliye script mein 172.17.0.3 hard-code karna nazuk hai. Asli engine iska hal <b>user-defined networks</b> se deta hai, jahan containers built-in DNS se ek-doosre ko <b>naam</b> se dhoondhte hain:</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): user-defined network</span>
docker network create automation
docker run -d --name db --network automation postgres
docker run -d --name runner --network automation python
<span class="c"># runner ke andar database naam se reachable hai: db</span></pre>
<p>Naam ke saath runner ko parwah nahi ki db ko kaunsa address mila. Docker Compose (chapter 7) aisa network aapke liye apne aap banata hai, isliye compose file ki services seedhe ek-doosre ke service names use karti hain.</p>

<h3>Exposure rules ek line mein</h3>
<ul>
<li>Same network: containers naamon ya private IPs se freely baat karte hain; publish ki zaroorat nahi.</li>
<li>Bahar se container: published port (<code>-p</code>) chahiye.</li>
<li>Container se bahar: default mein NAT se allowed.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Deccan Net ke automation host par runner container aur database container chalte hain. Sirf web dashboard 8080 par published hai. Database ka koi published port nahi, isliye usse pahunchne ka tareeka sirf usi network ka doosra container hai. Host ka port scan 8080 dekhta hai aur kuch nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aisi script mein jo chalti rehni chahiye, host se container ke private IP se connect karna. Woh address badal sakta hai. Aur doosre container tak pahunchne ke liye container ke andar <code>localhost</code> use karna: container ke andar localhost ka matlab container khud hai, host ya padosi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default bridge: private subnet, bahar NAT, ports -p se published. Host mode isolation hata deta hai. Aur container ke andar "localhost" us container ka apna loopback hai.</p></div>

<div class="scn"><h4>Script jisne localhost bulaya</h4><p>Ek runner container ne localhost:5432 par database padhne ki koshish ki aur connection refused mila. Database doosre container mein healthy tha. Runner ke andar localhost runner khud tha. Team ne dono ko user-defined network par rakha aur database ke container naam ko host name banaya. Woh chala aur container restarts jinse IP badla unme bhi chalta raha.</p><p><b>Lesson:</b> shared network par containers ek-doosre ko naam se dhoondhte hain, localhost se nahi.</p></div>

<div class="iv"><p class="q">"Containers aapas mein aur bahar se kaise communicate karte hain?"</p><p>Default mein har container ko host par gateway wale bridge network par private IP milta hai; us bridge ke containers seedhe ek-doosre tak pahunchte hain, outbound traffic host se NAT hota hai, aur inbound ke liye published port chahiye. User-defined networks par containers ek-doosre ko naam se resolve karte hain. Host mode host stack share karta hai aur none koi network nahi deta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default bridge NAT wala private virtual LAN hai (yahan 172.17.0.0/16).</li>
<li>docker network ls bridge, host aur none list karta hai; inspect container ka IP aur gateway dikhata hai.</li>
<li>Ports entry nahi matlab host ke bahar se reachable nahi.</li>
<li>Hard-coded private IPs ki jagah user-defined networks aur names use karo.</li>
<li>Container ke andar localhost container khud hai.</li>
</ul></div>
`}};export{e as default};