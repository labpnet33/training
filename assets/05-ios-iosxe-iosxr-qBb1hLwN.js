var e={id:`ios-iosxe-iosxr`,h:{en:`IOS, IOS XE and IOS XR: three operating systems, three design philosophies`,hi:`IOS, IOS XE aur IOS XR: teen operating systems, teen design philosophies`},body:{en:`
<p>Cisco sells network operating systems that look similar at the command line but are built very differently inside. For the SPCOR exam you must be able to say how <b>IOS</b>, <b>IOS XE</b> and <b>IOS XR</b> differ, which devices run each, and why a provider picks one for a role. This chapter keeps its claims at the level documented publicly by Cisco. Always check the release notes for your exact platform for details.</p>

<h3>Analogy: a food stall, a restaurant kitchen and a factory line</h3>
<p>Classic <b>IOS</b> is a food stall: one cook does everything at one counter, fast and simple, but if the cook faints the stall stops. <b>IOS XE</b> is a restaurant kitchen: the familiar head chef (the IOS code) is still there but works inside a bigger building with separate stations (a Linux base, platform services). <b>IOS XR</b> is a factory line for carriers: every station is separate, can be restarted alone, and the line is designed to keep running while one station is replaced.</p>

<h3>Classic IOS</h3>
<ul>
<li><b>Monolithic</b>: one image, the kernel, drivers, protocols and features all run as one program sharing memory. A fault in one feature can crash the whole system.</li>
<li>Configuration is <b>applied immediately</b> when you type it. The running configuration is saved to startup with an explicit copy.</li>
<li>Found on older routers and switches and in many enterprise and small-branch roles. It is the base of the CLI that most engineers know.</li>
</ul>

<h3>IOS XE</h3>
<ul>
<li>Runs <b>IOS code as a process (often called IOSd) on top of a Linux kernel</b>, together with other processes for platform functions, forwarding management and programmability services. The CLI, show commands and configuration style remain familiar.</li>
<li>Gains from the Linux base: better process separation, support for <b>model-driven programmability</b> (NETCONF, RESTCONF and YANG models), the ability to host containers or guest shells on supported platforms, and software maintenance features such as patching or in-service upgrades on some platforms.</li>
<li>Used across enterprise campus and WAN (for example Catalyst 9000 switches, and Catalyst 8000 or ISR and ASR 1000 family routers) and in some SP edge roles. Virtual routers such as the Catalyst 8000V and CSR 1000V also run IOS XE.</li>
<li>Configuration behaves like classic IOS: lines take effect as you enter them.</li>
</ul>

<h3>IOS XR</h3>
<ul>
<li>Designed for <b>carrier-class routers</b> (for example ASR 9000, NCS and Cisco 8000 series platforms). It is <b>modular and distributed</b>: routing protocols, the forwarding manager, and other services are separate processes that can be restarted without a full reload.</li>
<li><b>Process restartability and non-stop forwarding</b> are design goals, so a failing protocol process can restart while the forwarding plane keeps forwarding, and some changes and fixes can be applied with minimal impact.</li>
<li>Large systems distribute the control plane over route processors and line cards, and run on a 64-bit Linux-based foundation in current releases. Earlier releases used a different microkernel-based operating base. Cisco documents the platform-specific details; do not assume they are the same on every router.</li>
<li><b>Two-stage configuration</b>: commands go into a target configuration and take effect only when you <b>commit</b>. Commits are atomic and each is recorded so you can roll back. The next chapter covers it.</li>
<li><b>Admin plane</b>: on larger platforms there is a separate administrative environment for hardware and system management (often entered with the admin command), distinct from the XR environment where routing is configured.</li>
<li><b>Policy by design</b>: BGP in IOS XR requires a <b>route policy</b> for eBGP sessions to pass routes in or out; with no policy attached, eBGP routes are not accepted or advertised. This is a deliberate safety default.</li>
</ul>

<h3>Side-by-side</h3>
<table class="cmp"><tr><th></th><th>IOS</th><th>IOS XE</th><th>IOS XR</th></tr>
<tr><td>Architecture</td><td>Monolithic</td><td>IOS process on Linux base</td><td>Modular, distributed</td></tr>
<tr><td>Typical role</td><td>Enterprise, older routers</td><td>Enterprise campus, WAN, some edge, virtual routers</td><td>SP core, edge, peering, aggregation</td></tr>
<tr><td>Configuration model</td><td>Immediate</td><td>Immediate</td><td>Commit-based, rollback</td></tr>
<tr><td>Process restart</td><td>No (whole system)</td><td>Some process separation</td><td>Per-process restart designed in</td></tr>
<tr><td>Programmability</td><td>Limited</td><td>NETCONF, RESTCONF, YANG, containers on supported platforms</td><td>NETCONF, gRPC and YANG models, telemetry, strong automation focus</td></tr>
<tr><td>Interface naming example</td><td>GigabitEthernet0/1</td><td>GigabitEthernet0/0/1</td><td>GigabitEthernet0/0/0/1 (rack/slot/instance/port)</td></tr></table>

<h3>Syntax differences you will meet</h3>
<p>The same task is written differently. For example, an IS-IS or BGP instance in IOS XR lives under <code>router isis NAME</code> and <code>router bgp AS</code> with address families nested, and interfaces are enabled inside the protocol block. A Layer 2 pseudowire is configured under <code>l2vpn</code> in XR and with <code>xconnect</code> on the interface in IOS XE. Learn the structure rather than memorising lines.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE: interface-centric</span>
interface GigabitEthernet0/0/1
 ip address 192.0.2.1 255.255.255.252
 ip router isis CORE
router isis CORE
 net 49.0001.0000.0000.0001.00
<span class="c">! IOS XR: protocol-centric, takes effect on commit</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
 interface GigabitEthernet0/0/0/1
  address-family ipv4 unicast
interface GigabitEthernet0/0/0/1
 ipv4 address 192.0.2.1 255.255.255.252
commit</pre>

<div class="eg"><p><b>Worked example.</b> A provider chooses platforms for a new metro design. Cell-site gateways are small IOS XE or purpose-built devices. Aggregation uses compact carrier routers. The core and Internet edge use IOS XR platforms, because the operator wants commit-based changes, per-process restart and strong telemetry. A virtual route reflector runs as an XR or XE virtual router on a server. The OS is chosen to fit the role's availability and scale needs, and the CLI differences are handled through automation templates.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming XR accepts configuration like IOS (it will not apply until you commit); forgetting the BGP route policy requirement; and assuming every platform with "XE" in its name offers the same features.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS is monolithic, IOS XE is an IOS process on Linux, IOS XR is modular with commit-based configuration. If a question mentions process restartability and commit and rollback, the answer is IOS XR.</p></div>

<div class="scn"><h4>The eBGP session that carried nothing</h4><p>An engineer moved a BGP peer from an IOS XE router to an IOS XR router. The session came up but no prefixes were exchanged. The XR configuration had no route policy applied to the neighbour in either direction, so eBGP routes were neither accepted nor advertised. Adding a simple pass policy and committing fixed it.</p><p><b>Lesson:</b> IOS XR requires an explicit route policy for eBGP routes.</p></div>

<div class="iv"><p class="q">"How does IOS XR differ from IOS XE?"</p><p>IOS XE runs the familiar IOS code as a process on a Linux base and keeps IOS-style immediate configuration. IOS XR is a modular, distributed OS for carrier platforms with per-process restart, a two-stage commit and rollback model, and a policy-first approach to BGP. Say which roles each serves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS is monolithic; IOS XE runs IOS as a process on Linux; IOS XR is modular and distributed.</li>
<li>IOS XR is the usual choice for SP core, edge and peering.</li>
<li>IOS XR uses commit and rollback; IOS and IOS XE apply lines immediately.</li>
<li>IOS XR eBGP needs a route policy to pass routes.</li>
<li>Interface naming and config structure differ; learn structure, not just lines.</li>
</ul></div>
`,hi:`
<p>Cisco aise network operating systems bechta hai jo command line par ek jaise dikhte hain lekin andar se bahut alag bane hain. SPCOR exam ke liye aapko batana aana chahiye ki <b>IOS</b>, <b>IOS XE</b> aur <b>IOS XR</b> mein kya farq hai, har ek kaun se devices par chalta hai, aur provider kisi role ke liye ek kyun chunta hai. Yeh chapter apne claims us level par rakhta hai jo Cisco ne publicly document kiya hai. Details ke liye hamesha apne exact platform ke release notes check karo.</p>

<h3>Analogy: khane ka thela, restaurant kitchen aur factory line</h3>
<p>Classic <b>IOS</b> khane ka thela hai: ek cook ek counter par sab karta hai, tez aur simple, lekin cook behosh ho jaye to thela ruk jaata hai. <b>IOS XE</b> restaurant kitchen hai: jaana-pehchana head chef (IOS code) abhi bhi hai lekin bade building mein alag stations (Linux base, platform services) ke saath kaam karta hai. <b>IOS XR</b> carriers ke liye factory line hai: har station alag hai, akele restart ho sakta hai, aur line is tarah design ki gayi hai ki ek station badalte waqt bhi chalti rahe.</p>

<h3>Classic IOS</h3>
<ul>
<li><b>Monolithic</b>: ek image, kernel, drivers, protocols aur features sab ek program ki tarah memory share karke chalte hain. Ek feature ki fault poore system ko crash kar sakti hai.</li>
<li>Configuration type karte hi <b>turant apply</b> hoti hai. Running configuration ko startup mein explicit copy se save karte hain.</li>
<li>Purane routers aur switches par aur kai enterprise tatha chhote-branch roles mein milta hai. Yeh us CLI ka base hai jo zyaadatar engineers jaante hain.</li>
</ul>

<h3>IOS XE</h3>
<ul>
<li><b>IOS code ko Linux kernel ke upar process (aksar IOSd kehte hain) ke roop mein</b> chalata hai, platform functions, forwarding management aur programmability services ke liye doosre processes ke saath. CLI, show commands aur configuration style jaana-pehchana rehta hai.</li>
<li>Linux base se fayde: behtar process separation, <b>model-driven programmability</b> (NETCONF, RESTCONF aur YANG models) ka support, supported platforms par containers ya guest shells host karne ki ability, aur kuch platforms par patching ya in-service upgrades jaise software maintenance features.</li>
<li>Enterprise campus aur WAN mein (jaise Catalyst 9000 switches, aur Catalyst 8000 ya ISR tatha ASR 1000 family routers) aur kuch SP edge roles mein use hota hai. Catalyst 8000V aur CSR 1000V jaise virtual routers bhi IOS XE chalate hain.</li>
<li>Configuration classic IOS jaisa behave karti hai: lines enter karte hi effect leti hain.</li>
</ul>

<h3>IOS XR</h3>
<ul>
<li><b>Carrier-class routers</b> ke liye design kiya gaya (jaise ASR 9000, NCS aur Cisco 8000 series platforms). Yeh <b>modular aur distributed</b> hai: routing protocols, forwarding manager aur doosri services alag processes hain jinhe full reload ke bina restart kiya ja sakta hai.</li>
<li><b>Process restartability aur non-stop forwarding</b> design goals hain, isliye fail hone wala protocol process restart ho sakta hai jabki forwarding plane forward karta rehta hai, aur kuch changes aur fixes minimal impact ke saath apply ho sakte hain.</li>
<li>Bade systems control plane ko route processors aur line cards mein distribute karte hain, aur current releases mein 64-bit Linux-based foundation par chalte hain. Purane releases alag microkernel-based operating base use karte the. Cisco platform-specific details document karta hai; yeh maan mat lo ki har router par same hain.</li>
<li><b>Two-stage configuration</b>: commands target configuration mein jaate hain aur tab hi effect lete hain jab aap <b>commit</b> karte ho. Commits atomic hote hain aur har ek record hota hai taaki aap roll back kar sako. Agla chapter ise cover karta hai.</li>
<li><b>Admin plane</b>: bade platforms par hardware aur system management ke liye alag administrative environment hota hai (aksar admin command se enter karte hain), XR environment se alag jahan routing configure hoti hai.</li>
<li><b>Design se policy</b>: IOS XR mein BGP ko eBGP sessions ke routes andar ya bahar jaane ke liye <b>route policy</b> chahiye; policy attach na ho to eBGP routes na accept hote hain na advertise. Yeh jaan-boojhkar safety default hai.</li>
</ul>

<h3>Side-by-side</h3>
<table class="cmp"><tr><th></th><th>IOS</th><th>IOS XE</th><th>IOS XR</th></tr>
<tr><td>Architecture</td><td>Monolithic</td><td>Linux base par IOS process</td><td>Modular, distributed</td></tr>
<tr><td>Typical role</td><td>Enterprise, purane routers</td><td>Enterprise campus, WAN, kuch edge, virtual routers</td><td>SP core, edge, peering, aggregation</td></tr>
<tr><td>Configuration model</td><td>Immediate</td><td>Immediate</td><td>Commit-based, rollback</td></tr>
<tr><td>Process restart</td><td>Nahi (poora system)</td><td>Kuch process separation</td><td>Per-process restart design mein</td></tr>
<tr><td>Programmability</td><td>Limited</td><td>NETCONF, RESTCONF, YANG, supported platforms par containers</td><td>NETCONF, gRPC aur YANG models, telemetry, strong automation focus</td></tr>
<tr><td>Interface naming example</td><td>GigabitEthernet0/1</td><td>GigabitEthernet0/0/1</td><td>GigabitEthernet0/0/0/1 (rack/slot/instance/port)</td></tr></table>

<h3>Syntax differences jo milenge</h3>
<p>Wahi kaam alag likha jaata hai. Jaise IOS XR mein IS-IS ya BGP instance <code>router isis NAME</code> aur <code>router bgp AS</code> ke neeche address families nested ke saath rehta hai, aur interfaces protocol block ke andar enable hote hain. Layer 2 pseudowire XR mein <code>l2vpn</code> ke neeche aur IOS XE mein interface par <code>xconnect</code> se configure hota hai. Lines yaad karne ke bajaye structure seekho.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE: interface-centric</span>
interface GigabitEthernet0/0/1
 ip address 192.0.2.1 255.255.255.252
 ip router isis CORE
router isis CORE
 net 49.0001.0000.0000.0001.00
<span class="c">! IOS XR: protocol-centric, takes effect on commit</span>
router isis CORE
 net 49.0001.0000.0000.0001.00
 address-family ipv4 unicast
 interface GigabitEthernet0/0/0/1
  address-family ipv4 unicast
interface GigabitEthernet0/0/0/1
 ipv4 address 192.0.2.1 255.255.255.252
commit</pre>

<div class="eg"><p><b>Worked example.</b> Provider naye metro design ke liye platforms chunta hai. Cell-site gateways chhote IOS XE ya purpose-built devices hain. Aggregation compact carrier routers use karta hai. Core aur Internet edge IOS XR platforms use karte hain, kyunki operator commit-based changes, per-process restart aur strong telemetry chahta hai. Virtual route reflector server par XR ya XE virtual router ke roop mein chalta hai. OS role ki availability aur scale needs ke hisaab se chuna jaata hai, aur CLI differences automation templates se handle hote hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maanna ki XR configuration IOS jaisi accept karta hai (jab tak commit nahi karte apply nahi hoti); BGP route policy requirement bhoolna; aur yeh maanna ki jis platform ke naam mein "XE" hai uske sab features same hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS monolithic hai, IOS XE Linux par IOS process hai, IOS XR modular hai commit-based configuration ke saath. Agar question process restartability aur commit tatha rollback batata hai, to jawab IOS XR hai.</p></div>

<div class="scn"><h4>eBGP session jisne kuch carry nahi kiya</h4><p>Engineer ne BGP peer ko IOS XE router se IOS XR router par move kiya. Session up hua lekin koi prefixes exchange nahi hue. XR configuration mein neighbour par kisi bhi direction mein route policy nahi lagi thi, isliye eBGP routes na accept hue na advertise. Simple pass policy jodkar commit karne se fix hua.</p><p><b>Lesson:</b> IOS XR ko eBGP routes ke liye explicit route policy chahiye.</p></div>

<div class="iv"><p class="q">"IOS XR IOS XE se kaise alag hai?"</p><p>IOS XE jaana-pehchana IOS code Linux base par process ke roop mein chalata hai aur IOS-style immediate configuration rakhta hai. IOS XR carrier platforms ke liye modular, distributed OS hai jisme per-process restart, two-stage commit aur rollback model, aur BGP ke liye policy-first approach hai. Batao har ek kaun se roles serve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS monolithic hai; IOS XE Linux par IOS process chalata hai; IOS XR modular aur distributed hai.</li>
<li>IOS XR SP core, edge aur peering ke liye usual choice hai.</li>
<li>IOS XR commit aur rollback use karta hai; IOS aur IOS XE lines turant apply karte hain.</li>
<li>IOS XR eBGP ko routes pass karne ke liye route policy chahiye.</li>
<li>Interface naming aur config structure alag hain; sirf lines nahi, structure seekho.</li>
</ul></div>
`}};export{e as default};