var e={id:`dhcp-relay`,h:{en:`DHCP relay`,hi:`DHCP relay`},body:{en:`
<p>When a laptop plugs into the Staff VLAN, it has no IP address. It needs one before it can talk to anyone. In this chapter you learn how the laptop finds a DHCP server that sits in a different network, and why a firewall is the right device to help. <b>The simulator does not run DHCP relay.</b> This chapter is concept plus a labelled reference configuration, so that you understand the idea for interviews and for real branches.</p>

<h3>Analogy: asking for a visitor badge</h3>
<p>A new visitor walks into the Pune lobby and shouts "I need a badge!". The shout only reaches people in the lobby. The badge desk is in the head office building. A receptionist in the lobby hears the shout, writes it down, walks to the head office, and brings the badge back. The receptionist is the <b>relay</b>. The visitor never leaves the lobby, and the badge desk never has to be in every lobby.</p>

<h3>How DHCP works in four steps</h3>
<p><b>DHCP</b> (Dynamic Host Configuration Protocol) hands out IP addresses, masks, gateways and DNS servers. The classic exchange is called DORA:</p>
<ol>
<li><b>Discover</b>: the client sends a broadcast "is there a DHCP server?".</li>
<li><b>Offer</b>: a server proposes an address.</li>
<li><b>Request</b>: the client accepts one offer.</li>
<li><b>Acknowledge</b>: the server confirms the lease.</li>
</ol>
<p>The problem: the Discover is a <b>broadcast</b>. Routers and firewalls do not forward broadcasts between networks. So a DHCP server in another network never hears it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP relay between Staff VLAN and a DHCP server">
<rect x="15" y="80" width="140" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">Staff laptop</text><text x="85" y="128" text-anchor="middle" class="svg-muted" font-size="12">no address yet</text>
<rect x="245" y="70" width="150" height="84" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">relay agent</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<rect x="485" y="80" width="140" height="64" rx="10" fill="#fde68a"/><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="555" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.50</text>
<line x1="155" y1="105" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><text x="200" y="96" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast</text>
<line x1="395" y1="105" x2="485" y2="105" stroke="#64748b" stroke-width="2"/><text x="440" y="96" text-anchor="middle" class="svg-accent" font-size="12">2 unicast</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">the relay adds its interface address, so the server picks the right pool</text>
</svg><p class="cap">The relay turns a local broadcast into a unicast to a known server, and carries the answer back.</p></div>

<h3>What the relay does</h3>
<p>A <b>DHCP relay agent</b> listens for the client's broadcast on the interface, then forwards it as a unicast packet to the configured DHCP server. It adds the address of the interface where the request arrived (the <b>giaddr</b> field in the DHCP packet). The server uses that field to choose which address pool to use: a request relayed from the Staff interface gets a Staff address, from the Servers interface a Servers address. The answer travels back through the relay to the client.</p>

<h3>Why a firewall does it</h3>
<ul>
<li>It already has an interface in every VLAN, so it can relay for all of them.</li>
<li>One central DHCP server serves many branches, so there is one place to manage leases.</li>
<li>Access rules decide which client network may talk to the DHCP server, so the relay path is under policy.</li>
</ul>
<p>The relay must be allowed by the policy and by the routes. The DHCP server needs a route back to the relayed networks, and the engine needs a route to the server.</p>

<table class="cmp"><tr><th>Item</th><th>Value in this chapter</th></tr>
<tr><td>Client network</td><td>Staff VLAN, for example 10.1.1.0/24</td></tr>
<tr><td>Relay interface</td><td>The engine interface on the Staff network</td></tr>
<tr><td>DHCP server</td><td>10.0.0.50 (example address)</td></tr>
<tr><td>UDP ports</td><td>67 (server), 68 (client)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A Staff laptop in 10.1.1.0/24 sends a Discover. The engine interface 10.1.1.1 hears it and forwards it, as unicast, to 10.0.0.50 with giaddr 10.1.1.1. The server sees giaddr, picks the pool for 10.1.1.0/24 and offers 10.1.1.101, mask 255.255.255.0, gateway 10.1.1.1. The Offer returns via 10.1.1.1 to the laptop. Total time: less than a second. If the policy forgot to allow UDP 67 from the engine to the server, the laptop would end up with a self-assigned address in 169.254.0.0/16.</p></div>

<p><b>Reference configuration (not run in the simulator).</b> In the Management Client, the idea is to enable DHCP relay on the engine, name the DHCP server and choose the interfaces to relay for. The exact menu names depend on your NGFW version, so read the documentation for your version. The values to plan are shown below.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
<span class="c"># relay for interface 2 (Staff 10.1.1.0/24)</span>
dhcp-server   = 10.0.0.50
relay-from    = interface 2
policy        = allow UDP 67 engine -&gt; 10.0.0.50</pre>

<div class="warn"><p><b>Common mistakes.</b> Building the relay but forgetting the route to the DHCP server. A missing pool for the relayed network on the server, so it answers silently or from the wrong pool. Running a DHCP server and a relay on the same interface by accident. Forgetting that clients get their gateway from the server, so it must be the engine address (the CVI in a cluster).</p></div>
<div class="exam"><p><b>Exam trap.</b> The relay is not a DHCP server. It stores no leases. It only forwards. Also remember that the DHCP broadcast cannot cross a router or firewall without a relay.</p></div>

<div class="scn"><h4>Laptops with 169.254 addresses</h4><p>After the new Staff VLAN went live, laptops showed addresses starting with 169.254. The relay was configured, but the policy only allowed DNS and web traffic from the engine. Logs on the engine showed discarded UDP 67 packets towards the DHCP server. After a rule that allowed the relay traffic, laptops got normal 10.1.1.x leases.</p><p><b>Lesson:</b> traffic that the firewall itself generates still needs policy. Read the Logs page when a service is silent.</p></div>

<div class="iv"><p class="q">"Why does a client in another subnet still get an address from a central DHCP server?"</p><p>Because a relay agent on the gateway converts the client's broadcast into a unicast to the server, adding the giaddr of the client interface. The server selects the pool from giaddr and returns the answer via the relay. A good candidate also mentions DORA, UDP 67 and 68, and the need for routes and rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP discovery is a broadcast and does not cross routers on its own.</li>
<li>A relay agent forwards it as unicast and adds the giaddr.</li>
<li>The server uses giaddr to pick the pool for that network.</li>
<li>Policy and routes must allow the relay path in both directions.</li>
<li>DHCP relay is not run in the simulator; the configuration shown is a reference.</li>
</ul></div>
`,hi:`
<p>Jab laptop Staff VLAN mein plug hota hai, uske paas IP address nahi hota. Kisi se baat karne se pehle use ek chahiye. Is chapter mein aap seekhoge ki laptop doosre network mein baithe DHCP server ko kaise dhundta hai, aur firewall is kaam ke liye sahi device kyun hai. <b>Simulator DHCP relay nahi chalata.</b> Yeh chapter concept plus ek labelled reference configuration hai, taaki aap interviews aur real branches ke liye idea samajh sako.</p>

<h3>Analogy: visitor badge maangna</h3>
<p>Ek naya visitor Pune lobby mein aata hai aur chillata hai "mujhe badge chahiye!". Yeh awaaz sirf lobby ke logon tak pahunchti hai. Badge desk head office building mein hai. Lobby ki receptionist awaaz sunti hai, likh leti hai, head office jaati hai, aur badge wapas le aati hai. Receptionist <b>relay</b> hai. Visitor lobby se kabhi nahi nikalta, aur badge desk har lobby mein hona zaroori nahi.</p>

<h3>DHCP chaar steps mein kaise kaam karta hai</h3>
<p><b>DHCP</b> (Dynamic Host Configuration Protocol) IP addresses, masks, gateways aur DNS servers bantta hai. Classic exchange ko DORA kehte hain:</p>
<ol>
<li><b>Discover</b>: client broadcast bhejta hai "koi DHCP server hai?".</li>
<li><b>Offer</b>: server ek address propose karta hai.</li>
<li><b>Request</b>: client ek offer accept karta hai.</li>
<li><b>Acknowledge</b>: server lease confirm karta hai.</li>
</ol>
<p>Dikkat: Discover ek <b>broadcast</b> hai. Routers aur firewalls broadcasts ko networks ke beech forward nahi karte. Isliye doosre network ka DHCP server use kabhi sunta hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Staff VLAN aur DHCP server ke beech DHCP relay">
<rect x="15" y="80" width="140" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">Staff laptop</text><text x="85" y="128" text-anchor="middle" class="svg-muted" font-size="12">abhi address nahi</text>
<rect x="245" y="70" width="150" height="84" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">relay agent</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.1</text>
<rect x="485" y="80" width="140" height="64" rx="10" fill="#fde68a"/><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="555" y="128" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.50</text>
<line x1="155" y1="105" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><text x="200" y="96" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast</text>
<line x1="395" y1="105" x2="485" y2="105" stroke="#64748b" stroke-width="2"/><text x="440" y="96" text-anchor="middle" class="svg-accent" font-size="12">2 unicast</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">relay apne interface ka address jodta hai, isliye server sahi pool chunta hai</text>
</svg><p class="cap">Relay local broadcast ko known server ko unicast bana deta hai, aur jawab wapas le aata hai.</p></div>

<h3>Relay kya karta hai</h3>
<p><b>DHCP relay agent</b> interface par client ka broadcast sunta hai, phir use configured DHCP server ko unicast packet ki tarah forward karta hai. Woh us interface ka address jodta hai jahan request aayi (DHCP packet ka <b>giaddr</b> field). Server is field se pool chunta hai: Staff interface se relay hui request ko Staff address milta hai, Servers interface se aayi ko Servers address. Jawab relay ke through client tak wapas jata hai.</p>

<h3>Firewall yeh kyun karta hai</h3>
<ul>
<li>Uska har VLAN mein interface hai, isliye woh sabke liye relay kar sakta hai.</li>
<li>Ek central DHCP server kai branches ko serve karta hai, isliye leases ek hi jagah manage hote hain.</li>
<li>Access rules decide karte hain ki kaunsa client network DHCP server se baat kar sakta hai, isliye relay path policy ke under hai.</li>
</ul>
<p>Relay ko policy aur routes dono allow karne chahiye. DHCP server ko relayed networks tak wapas route chahiye, aur engine ko server tak route.</p>

<table class="cmp"><tr><th>Item</th><th>Is chapter ki value</th></tr>
<tr><td>Client network</td><td>Staff VLAN, jaise 10.1.1.0/24</td></tr>
<tr><td>Relay interface</td><td>Staff network par engine ka interface</td></tr>
<tr><td>DHCP server</td><td>10.0.0.50 (example address)</td></tr>
<tr><td>UDP ports</td><td>67 (server), 68 (client)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> 10.1.1.0/24 ka Staff laptop Discover bhejta hai. Engine interface 10.1.1.1 use sunta hai aur giaddr 10.1.1.1 ke saath 10.0.0.50 ko unicast forward karta hai. Server giaddr dekhta hai, 10.1.1.0/24 ka pool chunta hai aur 10.1.1.101, mask 255.255.255.0, gateway 10.1.1.1 offer karta hai. Offer 10.1.1.1 ke through laptop tak wapas aata hai. Total time: ek second se kam. Agar policy engine se server tak UDP 67 allow karna bhool jaye, to laptop ko 169.254.0.0/16 ka self-assigned address milega.</p></div>

<p><b>Reference configuration (not run in the simulator).</b> Management Client mein idea yeh hai ki engine par DHCP relay enable karo, DHCP server ka naam do aur jin interfaces ke liye relay karna hai unhe chuno. Exact menu names aapke NGFW version par depend karte hain, isliye apne version ki documentation padho. Plan karne wali values neeche hain.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
<span class="c"># relay for interface 2 (Staff 10.1.1.0/24)</span>
dhcp-server   = 10.0.0.50
relay-from    = interface 2
policy        = allow UDP 67 engine -&gt; 10.0.0.50</pre>

<div class="warn"><p><b>Common mistakes.</b> Relay bana dena lekin DHCP server tak route bhool jana. Server par relayed network ka pool na hona, jisse woh chupchap jawab deta hai ya galat pool se. Galti se ek hi interface par DHCP server aur relay dono chalana. Yeh bhoolna ki clients ko gateway server se milta hai, isliye woh engine address hona chahiye (cluster mein CVI).</p></div>
<div class="exam"><p><b>Exam trap.</b> Relay DHCP server nahi hai. Woh leases store nahi karta. Sirf forward karta hai. Yeh bhi yaad rakho ki DHCP broadcast relay ke bina router ya firewall paar nahi kar sakta.</p></div>

<div class="scn"><h4>169.254 wale laptops</h4><p>Naya Staff VLAN live hone ke baad laptops ke addresses 169.254 se shuru ho rahe the. Relay configured tha, lekin policy engine se sirf DNS aur web traffic allow karti thi. Engine ke Logs mein DHCP server ki taraf discard hue UDP 67 packets dikhe. Relay traffic allow karne wala rule jodne ke baad laptops ko normal 10.1.1.x leases mile.</p><p><b>Lesson:</b> jo traffic firewall khud generate karta hai usko bhi policy chahiye. Service chup ho to Logs page padho.</p></div>

<div class="iv"><p class="q">"Doosre subnet ka client central DHCP server se address kaise le pata hai?"</p><p>Kyunki gateway par relay agent client ke broadcast ko server ko unicast mein badal deta hai, client interface ka giaddr jodkar. Server giaddr se pool chunta hai aur jawab relay ke through wapas bhejta hai. Achha candidate DORA, UDP 67 aur 68, aur routes aur rules ki zaroorat bhi batata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP discovery broadcast hai aur routers ke paar apne aap nahi jaati.</li>
<li>Relay agent use unicast mein forward karta hai aur giaddr jodta hai.</li>
<li>Server giaddr se us network ka pool chunta hai.</li>
<li>Policy aur routes ko relay path dono directions mein allow karna hoga.</li>
<li>DHCP relay simulator mein nahi chalta; dikhayi gayi configuration reference hai.</li>
</ul></div>
`}};export{e as default};